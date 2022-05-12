"use strict";

const usernameButton = document.getElementById("username");
const aboutMeField = document.getElementById("about");

/**
 * Function for textarea character counter
 */

const textarea = document.querySelector("textarea");

textarea.addEventListener("input", ({ currentTarget: target }) => {
	const maxLength = target.getAttribute("maxlength");
	const currentLength = target.value.length;

	if (currentLength >= maxLength) {
		return (document.getElementById("textarea_remaining_char").innerText =
			"You have reached the maximum number of characters.");
	}

	document.getElementById("textarea_remaining_char").innerText =
		maxLength - currentLength + " characters left";
});

// adds a new game field with the value being the gameString parameter
// function addGameData(gameString) {
// 	let inputDiv = document.createElement("div");

// 	let newGameField = document.createElement("input");
// 	newGameField.placeholder = "game name";
// 	newGameField.value = gameString;
// 	newGameField.classList.add("game-field");

// 	let newGameFieldRemove = document.createElement("button");
// 	newGameFieldRemove.addEventListener("click", function (e) {
// 		inputDiv.removeChild(newGameField);
// 		inputDiv.removeChild(this);
// 	});
// 	newGameFieldRemove.textContent = "remove";

// 	inputDiv.appendChild(newGameField);
// 	inputDiv.appendChild(newGameFieldRemove);

// 	document.getElementById("games-div").appendChild(inputDiv);
// }

// gets the user's information from mongodb on the server
function getUserData() {
	let data = fetch("/user/info")
		.then(function (response) {
			return response.text();
		})
		.then(function (data) {
			return JSON.parse(data);
		});
	return data;
}

// loads the user's data into the text fields by default
async function loadUserData() {
	let userInfo = await getUserData();

	document.getElementById("name").setAttribute("value", userInfo.name);
	document.getElementById("about").innerText = userInfo.about;

	// for (let i = 0; i < userInfo.games.length; i++) {
	// 	addGameData(userInfo.games[i]);
	// }
}
// loadUserData();

// adds a new game field after clicking the add game button
// document.getElementById("add-game").addEventListener("click", function (e) {
// 	addGameData("");
// });

// use the fetch api to update the user's profile
// document.getElementById("update").addEventListener("click", function (e) {
// 	// let gameNames = [];
// 	// const gameElements = document.getElementsByClassName("game-field");
// 	// for (let i = 0; i < gameElements.length; i++) {
// 	// 	gameNames[i] = gameElements[i].value;
// 	// }

// 	let data = {
// 		username: usernameButton.value,
// 		about: aboutMeField.value,
// 		// games: gameNames,
// 	};
// 	let result = fetch("/user/edit/submit", {
// 		method: "POST",
// 		headers: {
// 			Accept: "application/json",
// 			"Content-Type": "application/json",
// 		},
// 		body: JSON.stringify(data),
// 	})
// 		.then(function (response) {
// 			return response.text();
// 		})
// 		.then(function (result) {
// 			let resultObj = JSON.parse(result);
// 			if (resultObj.error) {
// 				document.getElementById("errorMsg").innerHTML = resultObj.error;
// 			} else {
// 				console.log("success! Data: " + resultObj.data);
// 				// add a small pop up to indicate to the update was successful
// 			}
// 		});
// });

// let tempGamesDiv = [];
// let tempGameNames = [];
// let cancelled = false;

// // deletes all games from the list
// document
// 	.getElementById("delete-all-games")
// 	.addEventListener("click", function (e) {
// 		let gamesDiv = document.getElementById("games-div");
// 		tempGamesDiv = gamesDiv.innerHTML;
// 		let tempGameFields = document.getElementsByClassName("game-field");
// 		tempGameNames = [];
// 		for (let i = 0; i < tempGameNames.length; i++) {
// 			tempGameNames[i] = tempGameFields[i].value;
// 		}
// 		gamesDiv.innerHTML = "";
// 	});
