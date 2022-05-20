"use strict";

// used for the id of each filter
let count = 0;

// display the error message noting that you cannot add any more games for a few seconds
let errorMessageTimer = null;

const maxGames = 10;
const enterKey = 13;
const gameInput = document.getElementById("game-text");

// list of games entered
let gameFilters = [];

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

// helper function to display a message saying that the max amount of game filters has been reached
function displayMaxGameFiltersMessage() {
	document.getElementById("error-msg").innerText =
		"You can only have a max of 10 games";
	errorMessageTimer = setTimeout(() => {
		document.getElementById("error-msg").innerText = "";
	}, 2000);
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

// adds a game
gameInput.addEventListener("keypress", function (e) {
	var key = e.which || e.keyCode;

	// if we press enter and don't have an empty string for our filter then try and add it
	if (key == enterKey && gameInput.value !== "") {
		// if we don't already have this game filter, then proceed
		if (gameFilters.indexOf(gameInput.value.toLowerCase()) != -1) {
			return;
		}

		// only allow a max of 10 game filters
		if (count >= maxGames) {
			displayMaxGameFiltersMessage();
			return;
		}

		let gameFilter = gameInput.value;
		gameFilters.push(gameFilter.toLowerCase());
		gameInput.value = "";

		// add the game filter to be displayed
		let gameSpan = createGameSpan(gameFilter);

		// add a delete button to the game filter
		let deleteButton = createGameFilterDeleteButton(gameSpan, gameFilter);
		gameSpan.appendChild(deleteButton);

		// add the game filter to the DOM
		document.getElementById("gameFiltersContainer").appendChild(gameSpan);
	}
});

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
	data.games.forEach((game) => {
		addGame(game);
	});
}
autoFillFilters();

let currentUser = localStorage.getItem("loggedInName");

// submit the data to the server and find a match
const submitFilter = document.getElementById("submit");
submitFilter.addEventListener("click", function (e) {
	e.preventDefault;

	removeMessage();
	document.getElementById("profile-container").innerHTML = "Finding...";

	let data = {};
	if (gameFilters.length == 0) {
		data.hasGameFilters = false;
	} else {
		data.hasGameFilters = true;
		data.gameFilters = gameFilters;
		data.currentUser = currentUser;

		document
			.getElementById("profile-modal")
			.style.setProperty("display", "flex", "important");
		document
			.getElementById("match-filters-container")
			.style.setProperty("display", "none", "important");
		document
			.getElementById("accept-match")
			.style.setProperty("display", "none", "important");
		document
			.getElementById("reject-match")
			.style.setProperty("display", "none", "important");

		let filters = JSON.stringify(data);

		socket.emit("find-match", filters, async function (result) {
			if (result.status == "Success") {
				document
					.getElementById("match-filters-container")
					.style.setProperty("display", "none", "important");
				document
					.getElementById("accept-match")
					.style.setProperty("display", "inline-block", "important");
				document
					.getElementById("reject-match")
					.style.setProperty("display", "inline-block", "important");
				document.getElementById("profile-container").innerHTML = result.profile;
				localStorage.setItem("roomID", result.roomID);
				//update their status to match
				socket.emit("update-status", currentUser, true);
			} else {
				document
					.getElementById("match-filters-container")
					.style.setProperty("display", "block", "important");
				document
					.getElementById("profile-modal")
					.style.setProperty("display", "none", "important");
				document.getElementById("send-button").disabled = true;
				document.getElementById("message-field").disabled = true;
				displayStatusMessage(result.status);
				socket.emit("update-status", currentUser, false);
				// socket.emit("no-match-status", currentUser);
			}
		});
	}
});

/**
 * Accept the match
 */
document
	.getElementById("accept-match")
	.addEventListener("click", async function (e) {
		let roomID = localStorage.getItem("roomID");
		let otherUser = document.getElementById("username").innerText;
		document.getElementById("profile-container").innerHTML =
			"Waiting for response...";
		document.getElementById("accept-match").style.display = "none";
		document.getElementById("reject-match").style.display = "none";
		socket.emit(
			"accept-match",
			currentUser,
			otherUser,
			roomID,
			async function (result) {
				if (result.success) {
					document
						.getElementById("profile-modal")
						.style.setProperty("display", "none", "important");
					document.getElementById("send-button").disabled = false;
					document.getElementById("message-field").disabled = false;
					document
						.getElementById("exit-chatroom")
						.style.setProperty("display", "block", "important");
				} else {
					await socket.emit("reject-status", currentUser, roomID);

					document
						.getElementById("match-filters-container")
						.style.setProperty("display", "block", "important");
					document
						.getElementById("profile-modal")
						.style.setProperty("display", "none", "important");
					document.getElementById("send-button").disabled = true;
					document.getElementById("message-field").disabled = true;
					document.getElementById("profile-container").innerHTML = "Finding...";
				}
				document.getElementById("accept-match").style.display = "inline-block";
				document.getElementById("reject-match").style.display = "inline-block";
			}
		);
	});

/**
 * Reject the match
 */
document
	.getElementById("reject-match")
	.addEventListener("click", async function (e) {
		e.preventDefault();
		let room = localStorage.getItem("roomID");
		let otherUser = document.getElementById("username").innerText;
		document.getElementById("profile-container").innerHTML = "Finding...";

		await socket.emit("reject-match", currentUser, otherUser, room);

		await sleep(300);
		submitFilter.click();
	});

/**
 * Listen for rejection
 */
socket.on("rejected", async function () {
	let roomID = localStorage.getItem("roomID");
	await socket.emit("reject-status", currentUser, roomID);

	document
		.getElementById("match-filters-container")
		.style.setProperty("display", "block", "important");
	document
		.getElementById("profile-modal")
		.style.setProperty("display", "none", "important");
	document.getElementById("send-button").disabled = true;
	document.getElementById("message-field").disabled = true;
	displayStatusMessage("You got rejected, nothin' personal Kid");
	document.getElementById("profile-container").innerHTML = "Finding...";
});

/**
 * Click on the exit-matching modal
 */
const exitMatchingBtn = document.getElementById("stop-matching-button");
exitMatchingBtn.addEventListener("click", async (e) => {
	let room = localStorage.getItem("roomID");
	let otherUser;
	try {
		if (document.getElementById("username").innerText != null) {
			otherUser = document.getElementById("username").innerText;
			await socket.emit("reject-match", currentUser, otherUser, room);
		}
	} catch {}

	await socket.emit("update-status", currentUser, false);
	document
		.getElementById("match-filters-container")
		.style.setProperty("display", "block", "important");
	document
		.getElementById("profile-modal")
		.style.setProperty("display", "none", "important");
	document.getElementById("send-button").disabled = true;
	document.getElementById("message-field").disabled = true;
});

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function removeMessage() {
	let container = document.querySelectorAll(".message-line");
	container.forEach((element) => {
		element.remove();
	});
}
