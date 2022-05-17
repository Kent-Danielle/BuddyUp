'use strict';

document.getElementById("submit").addEventListener("click", async (e) => {
	e.preventDefault();
	document.getElementById("loadingMsg").innerHTML = "loading...";
	let form = document.getElementById("input-container");
	let formData = new FormData(form);
	formData.set(
		"content",
		tinymce.get("tinytext").getContent({
			format: "raw"
		})
	);
	formData.set("id", document.getElementById("postID").innerHTML);
	fetch("/user/editPost", {
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
				if(result.type != null && result.type != undefined){
					document.getElementById("title").style.backgroundColor = 'var(--accent-light)';
				}
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

window.onload = function (){
	let data = {
		id: document.getElementById("postID").innerHTML
	}
	fetch("/user/getPost", {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	}).then((result) => {
		return result.json();
	}).then((result) => {
		document.getElementById("title").setAttribute("value", result.title);
		tinymce.get("tinytext").setContent(result.post);
	});
}