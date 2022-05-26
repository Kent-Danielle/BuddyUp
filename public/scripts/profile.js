"use strict";


// load the user's games onto their profile
async function loadGames() {
	let data = await fetch("/user/info")
		.then(function (response) {
			return response.text();
		})
		.then(function (data) {
			return JSON.parse(data);
		});

	const gamesContainer = document.getElementById("games-container");

	if (data != null && data.games != null) {
		if (data.games.length > 0) {
			gamesContainer.innerHTML = "";
			data.games.forEach((game) => {
				let gamesP = document.createElement("p");
				gamesP.classList.add(
					"game",
					"d-inline-block",
					"px-2",
					"py-1",
					"rounded-3",
					"mb-2",
					"me-2"
				);
				gamesP.innerHTML = game;
				gamesContainer.appendChild(gamesP);
			});
		} else {
			gamesContainer.innerHTML = "";
			let gamesP = document.createElement("a");
			gamesP.classList.add(
				"game",
				"d-inline-block",
				"px-2",
				"py-1",
				"rounded-3"
			);
			gamesP.classList.add("text-decoration-none");
			gamesP.href = "/user/edit";
			gamesP.innerText = "Add your games here!";
			gamesContainer.appendChild(gamesP);
		}
	} else {
		let gamesP = document.createElement("a");
		gamesP.classList.add("game", "d-inline-block", "px-2", "py-1", "rounded-3");
		gamesP.classList.add("text-decoration-none");
		gamesP.href = "/user/edit";
		gamesP.innerText = "Add your games here!";
		gamesContainer.appendChild(gamesP);
	}
}
loadGames();

function createListener() {
	const deleteBtn = document.querySelectorAll(".delete-post-button");
	const editBtn = document.querySelectorAll(".edit-post-button");
	const cancelBtn = document.getElementById("noBtn");
	const confirmBtn = document.getElementById("yesBtn");
	var confirmModal = document.getElementById("confirmDeleteModal");
	confirmModal.style.setProperty("display", "none", "important");

	for (let i = 0; i < deleteBtn.length; i++) {
		deleteBtn[i].addEventListener("click", (event) => {
			event.preventDefault();
			confirmBtn.style.setProperty("display", "inline-block", "important");
			confirmModal.style.setProperty("display", "flex", "important");

			confirmBtn.addEventListener("click", async (event2) => {
				event2.preventDefault();
				let data = {
					id: deleteBtn[i].value,
				};
				await fetch("/user/deletePost/", {
					method: "POST",
					headers: {
						Accept: "application/json",
						"Content-Type": "application/json",
					},
					body: JSON.stringify(data),
				}).then(function () {
					window.location.reload();
				});
			});
		});
	}

	cancelBtn.addEventListener("click", (event) => {
		confirmModal.style.setProperty("display", "none", "important");
	});
}
createListener();

if (document.getElementById("bio-text").innerHTML == "jeb_") {
	let sound = new Audio("https://www.sndup.net/smzs/d");
	sound.play();
	document.body.style.background =
		"linear-gradient(50deg, rgba(100, 100, 255) 0%, rgb(255, 100, 100) 50%, rgba(100, 255, 100) 100%)";
	document.body.style.animation = "gradient 0.5s ease infinite";
	document.body.style.backgroundSize = "300% 300%";
}
let keys = "";
document.addEventListener("keydown", (e) => {
	keys += e.key;
	if (keys.substring(keys.length - 9, keys.length) == "herobrine") {
		document.getElementById("pfp").src =
			"https://res.cloudinary.com/buddyup-images/image/upload/v1652833585/latest-2212249643_wqmxgc.jpg";
	}
});
//herobrine

/**
 * Store name in local storage
 */
localStorage.setItem(
	"loggedInName",
	document.getElementById("username").innerText
);
