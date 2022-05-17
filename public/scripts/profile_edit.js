'use strict';

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

	document.getElementById("name").value = userInfo.name;
	document.getElementById("email").setAttribute("value", userInfo.email);
	document.getElementById("about").innerText = userInfo.about;
	document.getElementById("password").value = userInfo.password;

}
loadUserData();


//use the fetch api to update the user's profile
document.getElementById("submit").addEventListener("click", function (e) {
	document.getElementById("loading").innerHTML = "loading...";
	e.preventDefault();
	let form = document.getElementById("edit-form");
	let formData = new FormData(form);

	fetch("/user/edit/submit", {
		method: "POST",
		body: formData
	})
		.then(function (response) {
			return response.json();
		})
		.then(function (result) {
			document.getElementById("loading").innerHTML = "";
			if (result.success) {
				window.location.replace("/user/profile/self");
			} else {
				let inputs = document.querySelectorAll(".inputFields");
				inputs.forEach((input) => input.style.backgroundColor = "rgba(255, 255, 255, 0)");
				document.getElementById("errorMsg").innerText = result.message;
				document.getElementById(result.type).style.backgroundColor = 'var(--accent-light)';
			}
		});
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