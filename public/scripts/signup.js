'use strict';

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
	e.preventDefault();
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
});