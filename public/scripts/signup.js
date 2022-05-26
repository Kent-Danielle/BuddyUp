'use strict';

const textarea = document.querySelector("textarea");

textarea.addEventListener("input", ({
	currentTarget: target
}) => {
	const maxLength = target.getAttribute("maxlength");
	const currentLength = target.value.length;

	if (currentLength >= maxLength) {
		return document.getElementById("textarea_remaining_char").innerText = "You have reached the maximum number of characters.";
	}

	document.getElementById("textarea_remaining_char").innerText = (maxLength - currentLength) + " characters left";
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

document.getElementById("submit").addEventListener("click", async (e) => {
	// Check if the email input is valid
	e.preventDefault();
	let email = document.getElementById("email").value;
	if ((email.indexOf("@") > -1) && (email.charAt(0) != "@") && (email.charAt(email.length - 1) != "@")) {

		// If email input is valid then POST
		let password = document.getElementById("password").value;
		let confirm = document.getElementById("confirm-password").value;
		if (password == confirm) {
			let form = document.getElementById("form-data");
			let formData = new FormData(form);
			fetch("/user/createAccount", {
					method: "POST",
					body: formData,
				})
				.then(function (result) {
					return result.json();
				})
				.then(function (result) {
					if (result.success == "true") {
						window.location.replace("/user/profile");
					} else {
						let inputs = document.querySelectorAll(".inputFields");
						inputs.forEach((input) => input.style.backgroundColor = "rgba(255, 255, 255, 0)");
						document.getElementById("errorMsg").innerText = result.message;
						document.getElementById(result.type).style.backgroundColor = 'var(--accent-light)';
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