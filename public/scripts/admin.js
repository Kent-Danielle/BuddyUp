"use strict";

let nestedTable = document.getElementById("nested");

const searchButton = document.getElementById("search-button");
const search = document.getElementById("search");
const adminFilterButton = document.getElementById("adminFilter");
const requestFilterButton = document.getElementById("requestFilter");

/**
 * Search function
 */
searchButton.addEventListener("click", (event) => {
	let data = {
		input: search.value,
	};
	let result = fetch("/user/adminSearch", {
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
			let table = document.getElementById("tableBody");
			table.innerHTML = result;
			createDeleteListener();
			createListener();
		});
});

/**
 * Filter function for admin
 */
adminFilterButton.addEventListener("change", (event) => {
	if (adminFilterButton.checked) {
		requestFilterButton.checked = false;
	}
	let data = {
		input: adminFilterButton.checked,
	};
	let result = fetch("/user/adminFilter", {
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
			let table = document.getElementById("tableBody");
			table.innerHTML = result;
			createDeleteListener();
			createListener();
		});
});

/**
 * Filter function for admin
 */
requestFilterButton.addEventListener("change", (event) => {
	if (requestFilterButton.checked) {
		adminFilterButton.checked = false;
		let data = {
			input: requestFilterButton.checked,
		};
		let result = fetch("/user/promotionFilter", {
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
				let table = document.getElementById("tableBody");
				table.innerHTML = result;
				createListener();
				createDeleteListener();
			});
	} else {
		let data = {
			input: "",
		};
		let result = fetch("/user/adminSearch", {
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
				let table = document.getElementById("tableBody");
				table.innerHTML = result;
				createListener();
				createDeleteListener();
			});
	}
});

/**
 * Function for collapsible table
 */
createListener();
function createListener() {
	const expandBtn = document.querySelectorAll("#more-info");
	for (let i = 0; i < expandBtn.length; i++) {
		expandBtn[i].addEventListener("click", (event) => {
			if (
				document.getElementById("nested-table-" + (i + 1)).style.display !=
				"block"
			) {
				document.getElementById("info-" + (i + 1)).style.display = "table-row";
				document.getElementById("nested-table-" + (i + 1)).style.display =
					"block";
				expandBtn[i].innerHTML = '<i class="fa-solid fa-circle-minus"></i>';
			} else {
				document.getElementById("info-" + (i + 1)).style.display = "none";
				document.getElementById("nested-table-" + (i + 1)).style.display =
					"none";
				expandBtn[i].innerHTML = '<i class="fa-solid fa-circle-plus"></i>';
			}
		});
	}
}

/**
 * Function for delete button
 */
createDeleteListener();
function createDeleteListener() {
	const modalText = document.getElementById("modalText");
	const loggedInName = document.getElementById("name").innerText;
	const deleteBtn = document.querySelectorAll("#confirmModal");
	const cancelBtn = document.getElementById("noBtn");
	const confirmBtn = document.getElementById("yesBtn");
	var confirmModal = document.getElementById("confirmDeleteModal");
	for (let i = 0; i < deleteBtn.length; i++) {
		deleteBtn[i].addEventListener("click", (event) => {
			if (loggedInName == deleteBtn[i].value) {
				modalText.innerText = "You can't delete yourself";
				confirmModal.style.setProperty("display", "flex", "important");
				confirmBtn.style.setProperty("display", "none", "important");
			} else {
				modalText.innerHTML =
					"Do you want to delete " + deleteBtn[i].value + "'s account?";
				confirmBtn.href = "/user/delete/" + deleteBtn[i].value;
				confirmBtn.style.setProperty("display", "inline-block", "important");
				confirmModal.style.setProperty("display", "flex", "important");
			}
		});
	}

	cancelBtn.addEventListener("click", (event) => {
		confirmModal.style.setProperty("display", "none", "important");
	});
}

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

/**
 * Scripts for the modal popup for add user function
 */
// Get the modal
var modal = document.getElementById("addUserModal");

// Get the button that opens the modal
var btn = document.getElementById("addUserButton");

// Get the <span> element that closes the modal
var closeModal = document.getElementById("closeModalButton");

// When the user clicks on the button, open the modal
btn.onclick = function () {
	modal.style.setProperty("display", "flex", "important");
};

// When the user clicks on <span> (x), close the modal
closeModal.onclick = function () {
	modal.style.setProperty("display", "none", "important");
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
	if (event.target == modal) {
		modal.style.display = "none";
	}
};
