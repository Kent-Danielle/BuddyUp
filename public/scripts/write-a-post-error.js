'use strict';

document.getElementById("submit").addEventListener("click", async (e) => {
	e.preventDefault();
	document.getElementById("loadingMsg").innerHTML = "loading...";
	let form = document.getElementById("input-container");
	let formData = new FormData(form);
	formData.set(
		"content",
		tinymce.get("tinytext").getContent({ format: "raw" })
	);
	fetch("/user/write", {
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
				document.getElementById("errorMsg").innerHTML = result.message;
				document.getElementById("loadingMsg").innerHTML = "";
			}
		});
});

document.getElementById("cancelBtn").addEventListener("click", (e) => {
	e.preventDefault();
	window.location.replace("/user/profile/self");
});

document
	.getElementById("file-container")
	.addEventListener("click", function () {
		document.getElementById("image").click();
	});

document.getElementById("image").addEventListener("change", function () {
	let count = document.getElementById("image").files.length;
	count = (count <= 4) ? count : 4;
	document.getElementById("file-label").innerHTML =
		count + " files";
});
