function displayMessage(you, message) {
	let messageBubble = document.createElement("div");
	messageBubble.classList.add(
		"message-bubble",
		you ? "float-end" : "float-start",
		you ? "your-message" : "not-your-message",
		"px-2",
		"d-inline",
		"rounded-3"
	);
	messageBubble.innerText = message;
	let messageLine = document.createElement("div");
	messageLine.classList.add("w-100", "d-inline-block", "my-1", "px-2");
	messageLine.appendChild(messageBubble);
	document.getElementById("message-container").appendChild(messageLine);
}
