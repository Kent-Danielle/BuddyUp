"use strict";

const socket = io.connect("/");

/**
 * Socket function for receiving message
 */
socket.on("receive-message", (message, name) => {
	displayMessage(false, message, name);
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
	displayMessage(true, message, "");
	//socket function for sending
	socket.emit("send-message", message, room);
	messageInput.value = "";
});

/**
 * Function for displaying message
 */
function displayMessage(you, message, otherUserName) {
	let usernameSpan = document.createElement("span");
	usernameSpan.classList.add(
		"usernameContainer",
		you ? "your-username" : "not-your-username"
	);
	usernameSpan.innerText = you ? "You: " : otherUserName + ": ";
	let messageBubble = document.createElement("div");
	messageBubble.classList.add(
		"message-bubble",
		you ? "your-message" : "not-your-message",
		"d-inline",
		"rounded-3"
	);
	messageBubble.innerText = message;
	messageBubble.prepend(usernameSpan);
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
	document
		.getElementById("message-container")
		.scrollTo(0, document.getElementById("message-container").scrollHeight);
}

/**
 * deletes all game filters once the delete-all-games button is clicked
 */
document
	.getElementById("delete-all-games")
	.addEventListener("click", function (e) {
		e.preventDefault();
		gameFilters.length = 0;
		let gameFiltersContainer = document.getElementById("gameFiltersContainer");
		gameFiltersContainer.innerHTML = "";
	});

/**
 * Adds the current game as a filter once clicked on the add filter button
 */
document
	.getElementById("add-filter-button")
	.addEventListener("click", function (e) {
		e.preventDefault();

		// only allow a max of 10 game filters
		if (gameFilters.length >= maxGames) {
			displayMaxGameFiltersMessage();
			return;
		}

		if (gameInput.value === "") {
			return;
		}

		// if we don't already have this game filter, then proceed
		if (gameFilters.indexOf(gameInput.value.toLowerCase().trim()) != -1) {
			return;
		}

		addGame(gameInput.value.toLowerCase());
		gameInput.value = "";
	});

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
	document.getElementById("send-button").disabled = true;
	document.getElementById("message-field").disabled = true;
	displayStatusMessage("You left the room.");
});

/**
 * Function for getting out of the chatpage
 */
let exitChatpageBtn = document.getElementById("exit-chatpage");
exitChatpageBtn.addEventListener("click", (e) => {
	e.preventDefault();
	let room = localStorage.getItem("roomID");
	socket.disconnect();
	window.location.replace("/user/profile");
});

/**
 * Socket function for listening if the other user has left
 */
socket.on("ghosted", (message) => {
	let room = localStorage.getItem("roomID");
	socket.emit("ghosted-status", currentUser, room);
	document
		.getElementById("match-filters-container")
		.style.setProperty("display", "block", "important");
	exitChatroomBtn.style.setProperty("display", "none", "important");
	document.getElementById("send-button").disabled = true;
	document.getElementById("message-field").disabled = true;
	displayStatusMessage(message);
});

/**
 * Function to display the status message.
 */
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