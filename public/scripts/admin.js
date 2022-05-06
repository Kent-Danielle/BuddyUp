'use strict';

let nestedTable = document.getElementById("nested");

const searchButton = document.getElementById("search-button");
const search = document.getElementById("search");

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
			createListener();
		});
});

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
