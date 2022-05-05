let nestedTable = document.getElementById("nested");

//this is the plus/minus button
const expandBtn = document.querySelectorAll("#more-info");
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
		})
});

createListener();
function createListener() {
	console.log("hi");
	for (let i = 0; i < expandBtn.length; i++) {
		expandBtn[i].addEventListener("click", (event) => {
			if (
				document.getElementById("nested-table-" + (i + 1)).style.display !=
				"block"
			) {
				document.getElementById("info").style.display = "table-row";
				document.getElementById("nested-table-" + (i + 1)).style.display =
					"block";
				expandBtn[i].innerHTML = '<i class="fa-solid fa-circle-minus"></i>';
			} else {
				document.getElementById("info").style.display = "none";
				document.getElementById("nested-table-" + (i + 1)).style.display =
					"none";
				expandBtn[i].innerHTML = '<i class="fa-solid fa-circle-plus"></i>';
			}
		});
	}
}

// function checkMedia(x) {
// 	if (x.matches) {
// 		// If media query matches
// 		nestedTable.style.display = "none";

// 		if (minus.style.display != "none") {
// 			minus.style.display = "none";
// 			plus.style.display = "block";
// 		}
// 	}
// }

// var x = window.matchMedia("(min-width: 855px)");
// checkMedia(x); // Call listener function at run time
// x.addListener(checkMedia); // Attach listener function on state changes
