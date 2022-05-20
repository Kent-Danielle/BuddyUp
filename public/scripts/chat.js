"use strict";

const socket = io.connect("/");

/**
 * Socket function for receiving message
 */
socket.on("receive-message", (message) => {
	displayMessage(false, message);
});

/**
 * Script for listening to message send
 */
const messageForm = document.getElementById("message-area");
messageForm.addEventListener("submit", (e) => {
	e.preventDefault();
	let room = localStorage.getItem("roomID");
	const messageInput = document.getElementById("message-field");
	const message = messageInput.value;

	if (message === "") return;
	displayMessage(true, message);
	//socket function for sending
	socket.emit("send-message", message, room);
	messageInput.value = "";
});

/**
 * Function for displaying message
 */
function displayMessage(you, message) {
	let messageBubble = document.createElement("div");
	messageBubble.classList.add(
		"message-bubble",
		you ? "float-end" : "float-start",
		you ? "your-message" : "not-your-message",
		"px-2",
		"d-inline",
		"rounded-3"
	);
	messageBubble.innerText = message;
	let messageLine = document.createElement("div");
	messageLine.classList.add(
		"message-line",
		"w-100",
		"d-inline-block",
		"my-1",
		"px-2"
	);
	messageLine.appendChild(messageBubble);
	document.getElementById("message-container").appendChild(messageLine);
}

/**
 * Function for getting out of the chatroom
 */
let exitChatroomBtn = document.getElementById("exit-chatroom");
exitChatroomBtn.addEventListener("click", (e) => {
	e.preventDefault();
	let room = localStorage.getItem("roomID");
	socket.emit("exit-match", currentUser, room);
	document
		.getElementById("match-filters-container")
		.style.setProperty("display", "block", "important");
	exitChatroomBtn.style.setProperty("display", "none", "important");
	displayStatusMessage("You left the room.");
});

/**
 * Function for getting out of the chatpage
 */
let exitChatpageBtn = document.getElementById("exit-chatpage");
exitChatpageBtn.addEventListener("click", (e) => {
	e.preventDefault();
	let room = localStorage.getItem("roomID");
	socket.emit("exit-match", currentUser, room);
	window.location.replace("/user/profile");
});

/**
 * Socket function for listening if the other user has left
 */
socket.on("ghosted", (message) => {
	socket.emit("ghosted-status", currentUser);
	document
		.getElementById("match-filters-container")
		.style.setProperty("display", "block", "important");
	exitChatroomBtn.style.setProperty("display", "none", "important");
	displayStatusMessage(message);
});

async function displayStatusMessage(message) {
	let messageBubble = document.createElement("div");
	messageBubble.id = "exit-status";
	messageBubble.classList.add(
		"message-bubble",
		"status-msg",
		"d-inline-block",
		"w-100",
		"rounded-3",
		"text-center"
	);
	messageBubble.innerText = message;
	let messageLine = document.createElement("div");
	messageLine.classList.add(
		"message-line",
		"w-100",
		"d-inline-block",
		"my-1",
		"px-2"
	);
	messageLine.appendChild(messageBubble);
	document.getElementById("message-container").prepend(messageLine);
	document.getElementById("message-container").scrollTop = 0;
}
