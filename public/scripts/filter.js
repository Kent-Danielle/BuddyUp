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

// submit the data to the server and find a match
document.getElementById("submit").addEventListener("click", function (e) {
	e.preventDefault;

	let data = {};
	if (gameFilters.length == 0) {
		data.hasGameFilters = false;
	} else {
		data.hasGameFilters = true;
		data.gameFilters = gameFilters;

		let result = fetch("/match/findMatch", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		})
			.then(function (response) {
				return response.text();
			})
			.then(function (result) {
				document.getElementById("message-filter-container").style.setProperty("display", "none");
				document
					.getElementById("profile-modal")
					.style.setProperty("display", "flex", "important");
				document.getElementById("profile-container").innerHTML = result;
			});
	}
});

document.getElementById("reject-match").addEventListener("click", function (e) {

	let result = fetch("/match/findAnotherMatch", {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
	})
		.then(function (response) {
			return response.text();
		})
		.then(function (result) {
			document
				.getElementById("profile-modal")
				.style.setProperty("display", "flex", "important");
			document.getElementById("profile-container").innerHTML = result;
		});
});
