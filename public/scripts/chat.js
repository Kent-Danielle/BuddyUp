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

// auto fill game filters that the user has for their account

// helper function to create a game filter span field to be displayed on the DOM
function createGameSpan(gameFilter) {
	let gameSpan = document.createElement("span");
	gameSpan.classList.add(
		"filter",
		"px-2",
		"m-1",
		"d-inline-block",
		"rounded-pill"
	);
	count++;
	gameSpan.id = "gamefilter" + count;
	gameSpan.innerText = gameFilter;
	return gameSpan;
}

// helper function to create a delete button for a game filter
function createGameFilterDeleteButton(gameSpan, gameFilter) {
	let deleteButton = document.createElement("button");
	deleteButton.value = gameFilter;
	deleteButton.innerHTML = '<i class="fa-solid fa-x"></i>';
	deleteButton.addEventListener("click", function (e) {
		let name = this.value;
		let index = gameFilters.indexOf(name.toLowerCase());
		if (index != -1) {
			gameFilters.splice(index, 1);
		}
		gameSpan.remove();
		count--;
		document.getElementById("error-msg").innerText = "";
	});
	return deleteButton;
}

// adds the game filter to be displayed
function addGame(name) {
	let gameFilter = name;
	gameFilters.push(gameFilter.toLowerCase());

	// add the game filter to be displayed
	let gameSpan = createGameSpan(gameFilter);

	// add a delete button to the game filter
	let deleteButton = createGameFilterDeleteButton(gameSpan, gameFilter);
	gameSpan.appendChild(deleteButton);

	// add the game filter to the DOM
	const gameFiltersDiv = document.getElementById("gameFiltersContainer");
	gameFiltersDiv.appendChild(gameSpan);
}

// get the user's data from the server
async function getUserData() {
	let data = fetch("/user/info")
		.then(function (response) {
			return response.text();
		})
		.then(function (data) {
			return JSON.parse(data);
		});
	return data;
}

// auto fill each game from the user as a filter
async function autoFillFilters() {
	let data = await getUserData();
	data.games.forEach(game => {
		addGame(game);
	});
}
autoFillFilters();