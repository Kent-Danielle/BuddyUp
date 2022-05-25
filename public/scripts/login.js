'use strict';

document.getElementById("submit").addEventListener("click", (e) => {
	// Check if the email input is valid
	let email = document.getElementById("email").value;
	if ((email.indexOf("@") > -1) && (email.charAt(0) != "@") && (email.charAt(email.length - 1) != "@")) {

		// If email input is valid then POST
		e.preventDefault();
		let form = document.getElementById("userForm");
		let data = {
			email: form.email.value,
			password: form.password.value,
		};
		fetch("/user/login", {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
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
		document.getElementById("errorMsg").innerText = "Incomplete Email";
	}
});