"use strict";

//express
const express = require("express");
const app = express();

//socket.io
const io = require("socket.io")(3000, {
	cors: {
		origin: ["http://localhost:8000"],
	},
});

//router
const router = express.Router();

//models
const User = require("../models/user");
const AdminRequest = require("../models/admin-request");
const Timeline = require("../models/user-timeline");
const ChatRoom = require("../models/chat-room.js");
const ChatUser = require("../models/chat-user.js");

//fs and jsdom
const path = require("path");
const fs = require("fs");
const { JSDOM } = require("jsdom");
const { setInterval } = require("timers/promises");
const chatUser = require("../models/chat-user.js");

/**
 * GET route for sending the chat html page
 */
router.get("/", async function (req, res) {
	// if user logged in, go to their profile page
	res.header(
		"Cache-Control",
		"no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
	);
	if (req.session.loggedIn) {
		const chatUser1 = await ChatUser.updateOne(
			{ name: req.session.name },
			{ name: req.session.name },
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

	let html =
		"<div id='top-profile' class=''>" +
		"<div id='pfp-container' class='mb-3'>" +
		"<img src=" +
		user.img +
		" alt='' id='pfp' />" +
		"</div>" +
		"<div id='info-container'>" +
		"	<h2 id='username'>" +
		user.name +
		"</h2>" +
		"<p id='bio-text'>" +
		user.about +
		"</p>" +
		"</div></div>" +
		"<div id='bottom-profile' class='rounded-3 py-2 mb-3'>" +
		"<section id='games'>" +
		"<h3>Games</h3>" +
		"<div id='games-container'>" +
		"<p id='game' class='d-inline-block btn-primary px-2 py-1 rounded-3'>Coming Soon</p>" +
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
	socket.on("accept-match", function (room) {
		socket.join(room);
	});

	socket.on("reject-match", async function (name, room) {
		socket.to(room).emit("rejected");
		socket.leave(room);

		await ChatUser.updateOne(
			{ name: name },
			{
				$set: {
					matched: false,
				},
			}
		);

		socket.emit("find-another");
	});

	/**
	 * Function for finding match
	 */
	socket.on("find-match", async function (data, cb) {
		let d = JSON.parse(data);
		let filters = d.gameFilters;
		let currentUser = d.currentUser;

		await ChatUser.updateOne(
			{
				name: currentUser,
			},
			{
				$set: {
					matched: false,
					filters: filters,
					last_matched: null,
				},
			}
		);

		let chatUser1 = await ChatUser.findOne({ name: currentUser });

		let chatUser2 = null;
		let i = 0;
		while (chatUser2 == null && i < 50) {
			chatUser2 = await ChatUser.findOne({
				name: { $not: { $in: [chatUser1.name, chatUser1.last_matched] } },
				matched: false,
				filters: { $elemMatch: { $in: chatUser1.filters } },
			});
			await sleep(200);
			i++;
		}
		//if u havent find a match, find anyone cuz u desperate
		if (chatUser2 == null) {
			i = 0;
			while (chatUser2 == null && i < 50) {
				chatUser2 = await ChatUser.findOne({
					name: { $not: { $in: [chatUser1.name, chatUser1.last_matched] } },
					matched: false,
				});
				await sleep(200);
				i++;
			}
		}

		//After finding send the results back to client
		if (chatUser2 != null) {
			await ChatUser.updateMany(
				{
					$or: [{ name: chatUser1.name }, { name: chatUser2.name }],
					room: { $exists: false },
				},
				{
					$set: {
						room: chatUser1._id,
						last_matched: chatUser2.name,
					},
				}
			);

			chatUser1 = await ChatUser.findOne({ name: chatUser1.name });

			socket.join(chatUser1.room);
			let chatUser2Profile = await displayMatchedUserProfile(chatUser2);
			cb({
				roomID: chatUser1.room,
				profile: chatUser2Profile,
			});
		} else {
			cb("No users found :C");
		}
	});

	socket.on("update-status", async (name, match) => {
		await ChatUser.updateOne(
			{ name: name },
			{
				$set: {
					matched: match,
				},
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
