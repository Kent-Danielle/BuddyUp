'use strict';

/**
 * This function makes sure that the email has valid characters and has a proper format.
 * 
 * @param {checks for valid email characters} mail 
 * @returns true if valid, false otherwise
 */
function ValidateEmail(mail) 
{
 if (/^\w+([.-]?\w+)@\w+([.-]?\w+)(.\w{2,3})+$/.test(mail))
  {
    return (true)
  }
    return (false)
}

/**
 * Submit the 
 */
document.getElementById("submit").addEventListener("click", (e) => {
	e.preventDefault();
	// Check if the email input is valid
	let email = document.getElementById("email").value;
	if (ValidateEmail(email) == true) {
		// If email input is valid then POST
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