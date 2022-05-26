"use strict";

document.getElementById("edit-form").onkeypress = function (e) {
	var key = e.charCode || e.keyCode || 0;
	if (key == 13) {
		e.preventDefault();
	}
};

// display the error message noting that you cannot add any more games for a few seconds
let errorMessageTimer2 = null;

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
	gameSpan.innerText = gameFilter;
	return gameSpan;
}

// helper function to display a message saying that the max amount of game filters has been reached
function displayMaxGameFiltersMessage() {
	document.getElementById("error-msg").innerText =
		"You can only have a max of 10 games";
	errorMessageTimer2 = setTimeout(() => {
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
		document.getElementById("error-msg").innerText = "";
	});
	return deleteButton;
}

// adds the game filter to be displayed
function addGame(name) {
	let gameFilter = name.substring(0, 50);
	gameFilters.push(gameFilter);

	// add the game filter to be displayed
	let gameSpan = createGameSpan(gameFilter);

	// add a delete button to the game filter
	let deleteButton = createGameFilterDeleteButton(gameSpan, gameFilter);
	gameSpan.appendChild(deleteButton);

	// add the game filter to the DOM
	const gameFiltersDiv = document.getElementById("gameFiltersContainer");
	gameFiltersDiv.appendChild(gameSpan);
}

// adds a game filter with the text entered
gameInput.addEventListener("keypress", function (e) {
	var key = e.which || e.keyCode;

	// if we press enter and don't have an empty string for our filter then try and add it
	if (key == enterKey && gameInput.value.trim() != "") {
		e.preventDefault();
		// if we don't already have this game filter, then proceed
		if (gameFilters.indexOf(gameInput.value.toLowerCase().trim()) != -1) {
			return;
		}

		// only allow a max of 10 game filters
		if (gameFilters.length >= maxGames) {
			displayMaxGameFiltersMessage();
			return;
		}

		addGame(gameInput.value.toLowerCase().trim());
		gameInput.value = "";
	}
});

/**
 * deletes all game filters once the delete-all-games button is clicked
 */
document.getElementById("delete-all-games").addEventListener("click", function (e) {
	e.preventDefault();
	gameFilters.length = 0;
	let gameFiltersContainer = document.getElementById("gameFiltersContainer");
	gameFiltersContainer.innerHTML = "";
});

/**
 * Adds the current game as a filter once clicked on the add filter button
 */
document.getElementById("add-filter-button").addEventListener("click", function (e) {
	e.preventDefault();

	// only allow a max of 10 game filters
	if (gameFilters.length >= maxGames) {
		displayMaxGameFiltersMessage();
		return;
	}

	if (gameInput.value.toLowerCase().trim() === "") {
		return;
	}

	// if we don't already have this game filter, then proceed
	if (gameFilters.indexOf(gameInput.value.toLowerCase().trim()) != -1) {
		return;
	}

	addGame(gameInput.value.toLowerCase().trim());
	gameInput.value = "";
});

/**
 * Function for textarea character counter
 */
const textarea = document.querySelector("textarea");

textarea.addEventListener("input", ({
	currentTarget: target
}) => {
	const maxLength = target.getAttribute("maxlength");
	const currentLength = target.value.length;

	if (currentLength >= maxLength) {
		return (document.getElementById("textarea_remaining_char").innerText =
			"You have reached the maximum number of characters.");
	}

	document.getElementById("textarea_remaining_char").innerText =
		maxLength - currentLength + " characters left";
});

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

// loads the user's data into the edit fields by default
async function loadUserData() {
	let userInfo = await getUserData();

	// add personal information
	document.getElementById("name").value = userInfo.name;
	document.getElementById("email").setAttribute("value", userInfo.email);
	document.getElementById("about").innerText = userInfo.about;
	document.getElementById("password").value = userInfo.password;
	document.getElementById("confirm-password").value = userInfo.password;

	// add game filters
	if (userInfo.games != null) {
		userInfo.games.forEach((game) => {
			addGame(game);
		});
	}
}
loadUserData();

function ValidateEmail(mail) 
{
 if (/^\w+([.-]?\w+)@\w+([.-]?\w+)(.\w{2,3})+$/.test(mail))
  {
    return (true)
  }
    return (false)
}

//use the fetch api to update the user's profile
document.getElementById("submit").addEventListener("click", function (e) {
	// Check if the email input is valid
	let email = document.getElementById("email").value;
	if (ValidateEmail(email) == true) {
		e.preventDefault();
		// If email input is valid then POST
		let password = document.getElementById("password").value;
		let confirm = document.getElementById("confirm-password").value;
		if (password == confirm) {
			document.getElementById("loading").innerHTML = "loading...";
			let form = document.getElementById("edit-form");
			let formData = new FormData(form);
			formData.append("filters", gameFilters);

			fetch("/user/edit/submit", {
					method: "POST",
					body: formData,
				})
				.then(function (response) {
					return response.json();
				})
				.then(function (result) {
					document.getElementById("loading").innerHTML = "";
					if (result.success) {
						window.location.replace("/user/profile");
					} else {
						console.log("did not successfully update profile");
						let inputs = document.querySelectorAll(".inputFields");
						inputs.forEach(
							(input) => (input.style.backgroundColor = "rgba(255, 255, 255, 0)")
						);
						document.getElementById("errorMsg").innerText = result.message;
						document.getElementById(result.type).style.backgroundColor =
							"var(--accent-light)";
					}
				});
		} else {
			document.getElementById("errorMsg").innerText = "Password does not match.";
			let inputs = document.querySelectorAll(".inputFields");
			inputs.forEach((input) => input.style.backgroundColor = "rgba(255, 255, 255, 0)");
			document.getElementById("password").style.backgroundColor = 'var(--accent-light)';
		}
	} else {
		document.getElementById("errorMsg").innerText = "Incomplete Email";
		let inputs = document.querySelectorAll(".inputFields");
		inputs.forEach((input) => input.style.backgroundColor = "rgba(255, 255, 255, 0)");
		document.getElementById("email").style.backgroundColor = 'var(--accent-light)';
	}
});

document
	.getElementById("file-container")
	.addEventListener("click", function () {
		document.getElementById("pfp").click();
	});

document.getElementById("pfp").addEventListener("change", function () {
	document.getElementById("file-label").innerHTML =
		document.getElementById("pfp").files[0].name;
});