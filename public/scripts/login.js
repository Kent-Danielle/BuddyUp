"use strict";

document.getElementById("submit").addEventListener("click", (e) => {
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
				document.getElementById("errorMsg").innerHTML = result.message;
			}
		});
});
