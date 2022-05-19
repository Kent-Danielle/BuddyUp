"use strict";

const socket = io.connect("http://localhost:3000");

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
	messageLine.classList.add("w-100", "d-inline-block", "my-1", "px-2");
	messageLine.appendChild(messageBubble);
	document.getElementById("message-container").appendChild(messageLine);
}

