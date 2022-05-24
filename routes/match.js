"use strict";

//express
const express = require("express");

//socket.io
var Server = require("../server");
const io = Server.io;
// require("socket.io")(3000, {
// 	cors: {
// 		origin: ["https://buddy-up-comp2800.herokuapp.com/"],
// 	},
// });

//router
const router = express.Router();

//models
const User = require("../models/user");
const AdminRequest = require("../models/admin-request");
const Timeline = require("../models/user-timeline");
const ChatUser = require("../models/chat-user.js");

//fs and jsdom
const path = require("path");
const fs = require("fs");
const { JSDOM } = require("jsdom");
const { setInterval } = require("timers/promises");
const chatUser = require("../models/chat-user.js");

let name = null;

/**
 * GET route for sending the chat html page
 */
router.get("/", async function (req, res) {
	// if user logged in, go to their profile page
	res.header(
		"Cache-Control",
		"no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
	);
	let user = await ChatUser.findOne({ name: req.session.name });
	if (
		req.session.loggedIn &&
		(user == null || (user.matched == false && user.finding == false))
	) {
		name = req.session.name;
		const chatUser1 = await ChatUser.updateOne(
			{ name: req.session.name },
			{ name: req.session.name, finding: false, response: "wait" },
			{ upsert: true }
		);
		// if user is not logged in, go to the login page
		let login = fs.readFileSync("./public/html/chat.html", "utf-8");
		res.send(login);
	} else {
		res.redirect("/user/profile");
	}
});

/**
 * Function for building the profile html
 */
async function displayMatchedUserProfile(user2) {
	let user = await User.findOne({ name: user2.name });

	let allPosts;
	try {
		allPosts = await Timeline.find({
			author: user.name,
		});
	} catch (error) {
		return;
	}
	let dateOptions = {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
	};
	let stories = "";
	for (let i = allPosts.length - 1; i >= 0; i--) {
		stories +=
			'<div class="story rounded-3 py-1 px-3 my-3">' +
			'<h4 id="story-title" class="mt-2 mb-0">' +
			allPosts[i].title +
			"</h4>" +
			'<p id="story-date" class="mb-0">' +
			allPosts[i]._id.getTimestamp().toLocaleString("en-us", dateOptions) +
			'</p><p id="story-body" class="mb-3">' +
			allPosts[i].post +
			"</p>";
		if (allPosts[i].img[0] != null && allPosts[i].img[0] != undefined) {
			stories +=
				'<div id="story-img-container" class="mb-3"><div class="row"><div class="col-12"><div class="card"><div class="card-img"><div id="imageGroup' +
				i +
				'" class="carousel slide" data-bs-ride="carousel" data-bs-interval="false"><div class="carousel-inner">';
			for (let j = 0; j < allPosts[i].img.length; j++) {
				stories += '<div class="carousel-item';
				if (j == 0) {
					stories += " active";
				}
				stories +=
					'"><img src=' +
					allPosts[i].img[j] +
					' alt="" class="card-img d-block w-100"/></div>';
			}
			if (allPosts[i].img.length > 1) {
				stories +=
					'</div><button class="carousel-control-prev" type="button" data-bs-target="#imageGroup' +
					i +
					'" data-bs-slide="prev"><span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="visually-hidden">Previous</span> </button><button class="carousel-control-next" type="button" data-bs-target="#imageGroup' +
					i +
					'" data-bs-slide="next"><span class="carousel-control-next-icon" aria-hidden="true"></span><span class="visually-hidden">Next</span></button></div>';
			} else {
				stories += "</div>";
			}
			stories += "</div></div></div></div></div></div>";
		}
		stories += "</div>";
	}

	let chatuser = await ChatUser.findOne({ name: user2.name });

	let html =
		"<div id='top-profile' class=''>" +
		"<div id='pfp-container' class='mb-3'>" +
		"<img src=" +
		user.img +
		" alt='' id='pfp' />" +
		"</div>" +
		"<div id='info-container'>" +
		"<h2 id='username'>" +
		user.name +
		"</h2>" +
		"<p id='bio-text'>" +
		user.about +
		"</p>" +
		"</div></div>" +
		"<div id='bottom-profile' class='rounded-3 py-2 mb-3'>" +
		"<section id='games'>" +
		"<h3>Games</h3>" +
		"<div id='games-container'>";

	let arr = chatuser.filters;

	arr.forEach((element) => {
		html +=
			"<p  class='d-inline-block game px-2 py-1 rounded-3 mb-2 me-2'>" +
			element +
			"</p>";
	});

	html +=
		"</div>" +
		"</section>" +
		"<section id='stories'>" +
		"<h3>Stories</h3>" +
		"<div id='stories-container'>" +
		stories +
		"</div>" +
		"</section>" +
		"</div>";

	return html;
}

/**
 * Function for socket.io
 */
io.on("connection", (socket) => {
	socket.user = name;

	/**
	 * Function for handling disconnection for unknown reasons
	 */
	socket.on("disconnect", async function () {
		let chatUser1 = await ChatUser.findOne({ name: socket.user });
		if (chatUser1.response == "wait") {
			socket.to(socket.room_ID).volatile.emit("rejected");
		} else if (chatUser1.response == "accept") {
			socket
				.to(socket.room_ID)
				.volatile.emit("ghosted", socket.user + " disconnected.");
		}

		socket.leave(socket.room_ID);

		await ChatUser.deleteOne({ name: socket.user });
	});

	/**
	 * Function for accepting match
	 */
	socket.on("accept-match", async function (name, other, room, cb) {
		await ChatUser.updateOne(
			{ name: name },
			{
				$set: {
					current_match: other,
					last_match: other,
					matched: true,
					finding: false,
					response: "accept",
				},
			}
		);

		let chatUser2 = await ChatUser.findOne({ name: other });
		while (chatUser2.response == "wait") {
			chatUser2 = await ChatUser.findOne({ name: other });
		}
		if (chatUser2.response == "accept") {
			socket.join(room);
			cb({ success: true });
		} else {
			socket.leave(room);
			cb({ success: false });
		}
	});

	/**
	 * Function for rejecting match
	 */
	socket.on("reject-match", async function (user, other, room) {
		socket.to(room).volatile.emit("rejected");
		socket.leave(room);

		await ChatUser.updateOne(
			{ name: user },
			{
				$set: {
					current_match: null,
					last_match: other,
					matched: false,
					finding: false,
					response: "reject",
				},
				$unset: { room: "" },
			}
		);
	});

	/**
	 * Function for quitting match
	 */
	socket.on("exit-match", async function (user, room) {
		socket.to(room).volatile.emit("ghosted", user + " disconnected.");
		socket.leave(room);

		await ChatUser.updateOne(
			{ name: user },
			{
				$set: {
					current_match: null,
					matched: false,
					finding: false,
				},
				$unset: { room: "" },
			}
		);
	});

	/**
	 * Prototype function for finding a match
	 */
	socket.on("find-match", async function (data, cb) {
		let d = JSON.parse(data);
		let filters = d.gameFilters; //the game filters that the users added
		let currentUserName = d.currentUser; //name of the logged in user

		/*get and update the current user's document in MongoDB to signify that the user is:
		1) Finding someone
		2) Is not matched with anyone
		3) Still waiting for response
		4) No rooms yet
		*/
		let chatUser1 = await ChatUser.findOneAndUpdate(
			{
				name: currentUserName,
			},
			{
				$set: {
					matched: false,
					filters: filters,
					finding: true,
					response: "wait",
				},
				$unset: { room: "" },
			},
			{
				new: true,
			}
		);

		//declare a variable for chat user 2
		let chatUser2 = { current_match: null };
		let i = 0;
		//double check to make sure that you matched with the right person
		while (i < 8 && currentUserName != chatUser2.current_match) {
			chatUser2 = null;
			/*find another user that is:
			1) not you, and not the last person you matched with
			2) has at least one similar game filter as you
			3) still finding and not yet matched
			Do this for 5 seconds or until someone found you or u found someone
			*/
			let j = 0;
			while (chatUser2 == null && j < 4 && !chatUser1.matched) {
				/*try to find someone,
				if u did = update them too
				if u didn't = just find another after 5 seconds
				*/
				chatUser2 = await ChatUser.findOneAndUpdate(
					{
						name: { $not: { $in: [currentUserName, chatUser1.last_match] } },
						matched: false,
						finding: true,
						filters: { $elemMatch: { $in: chatUser1.filters } },
					},
					{ $set: { current_match: currentUserName, matched: true } },
					{
						new: true,
					}
				);
				console.log(currentUserName + " found " + chatUser2 + j);

				//update existing chatuser1 to see if someone found you
				chatUser1 = await ChatUser.findOne({ name: currentUserName });

				await sleep(250);

				j++;
			}

			//check if someone found you
			if (chatUser2 == null && chatUser1.matched) {
				console.log("Someone found " + currentUserName + " first");
				chatUser2 = await ChatUser.findOne({
					current_match: currentUserName,
				});
			}

			//if u didn't find chatuser2, then just find anyone lol
			if (chatUser2 == null) {
				j = 0;
				while (chatUser2 == null && j < 4 && !chatUser1.matched && i > 5) {
					/*try to find someone,
					if u did = update them too
					if u didn't = just find another after 5 seconds
					*/
					chatUser2 = await ChatUser.findOneAndUpdate(
						{
							name: { $not: { $in: [currentUserName] } },
							matched: false,
							finding: true,
						},
						{ $set: { current_match: currentUserName, matched: true } },
						{
							new: true,
						}
					);

					console.log(currentUserName + " found " + chatUser2 + j);

					//update existing chatuser1 to see if someone found you
					chatUser1 = await ChatUser.findOne({ name: currentUserName });

					await sleep(250);

					j++;
				}
			}

			//check if someone found you
			if (chatUser2 == null && chatUser1.matched) {
				console.log("Someone found " + currentUserName + " first");
				chatUser2 = await ChatUser.findOne({
					current_match: currentUserName,
				});
			}

			//if u found chatuser2, then do something to check if chatuser2 found you too
			if (chatUser2 != null) {
				console.log("Updating " + currentUserName);
				//add chatuser2 to chatuser1's data
				chatUser1 = await ChatUser.findOneAndUpdate(
					{ name: currentUserName },
					{ $set: { current_match: chatUser2.name, matched: true } },
					{
						new: true,
					}
				);

				console.log(currentUserName + " is now... " + chatUser1);
				//if chatuser2 doesnt have any name for current match, then just wait for 5 seconds
				let k = 0;
				while (chatUser2.current_match == null && k < 20) {
					chatUser2 = await ChatUser.findOne({ name: chatUser2.name });
					await sleep(250);
					k++;
				}
			} else {
				chatUser2 = { current_match: null };
			}

			i++;
		}

		//Send it depending if u found someone or not
		if (
			(chatUser2 != null || chatUser2.current_match == null) &&
			chatUser1.finding
		) {
			console.log(chatUser2);
			await ChatUser.updateMany(
				{
					$or: [{ name: currentUserName }, { name: chatUser2.name }],
					room: { $exists: false },
				},
				{
					$set: {
						room: chatUser1._id,
					},
				}
			);

			chatUser1 = await ChatUser.findOne({ name: currentUserName });

			socket.join(chatUser1.room);
			socket.room_ID = chatUser1.room;

			let chatUser2Profile = await displayMatchedUserProfile(chatUser2);
			cb({
				status: "Success",
				roomID: chatUser1.room,
				profile: chatUser2Profile,
			});
		} else {
			cb({ status: "No Users Found at the Moment :C" });
		}
	});

	/**
	 * Function for updating status
	 *
	 */
	socket.on("update-status", async (name, match) => {
		await ChatUser.updateOne(
			{ name: name },
			{
				$set: {
					matched: match,
					finding: false,
					response: "wait",
				},
			}
		);
	});

	/**
	 * Function for being rejected
	 *
	 */
	socket.on("reject-status", async (name, room) => {
		await ChatUser.updateOne(
			{ name: name },
			{
				$set: {
					current_match: null,
					// last_match: null,
					matched: false,
					finding: false,
					response: "wait",
				},
				$unset: { room: "" },
			}
		);
		socket.leave(room);
	});

	/**
	 * Function for being rejected
	 *
	 */
	socket.on("ghosted-status", async (name, roomID) => {
		await socket.leave(roomID);
		await ChatUser.updateOne(
			{ name: name },
			{
				$set: {
					current_match: null,
					matched: false,
					finding: false,
				},
				$unset: { room: "" },
			}
		);
	});

	socket.on("send-message", (message, room) => {
		socket.to(room).emit("receive-message", message);
	});
});

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = router;
