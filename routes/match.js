"use strict";


const express = require("express");
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const router = express.Router();
const User = require("../models/user");
const AdminRequest = require("../models/admin-request");
const Timeline = require("../models/user-timeline");
const ChatRoom = require("../models/chat-room.js");
const ChatUser = require("../models/chat-user.js");
const path = require("path");
const fs = require("fs");
const { JSDOM } = require("jsdom");
const { setInterval } = require("timers/promises");

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
		const chatUser1 = new ChatUser({
			name: req.session.name,
		});
		await chatUser1.save();
		// if user is not logged in, go to the login page
		let login = fs.readFileSync("./public/html/chat.html", "utf-8");
		res.send(login);
	} else {
		res.redirect("/user/profile");
	}
});

/**
 * Function for finding match after filter
 */
router.post("/findMatch", async function (req, res) {
	await ChatUser.updateOne(
		{
			name: req.session.name,
		},
		{
			$set: {
				matched: false,
				filters: req.body.gameFilters,
				last_matched: null,
			},
		}
	);

	const chatUser1 = await ChatUser.findOne({ name: req.session.name });

	let chatUser2 = null;

	let i = 0;
	while (chatUser2 == null && i < 20) {
		chatUser2 = await ChatUser.findOne({
			name: { $not: { $in: [chatUser1.name, chatUser1.last_matched] } },
			matched: false,
			filters: { $elemMatch: { $in: chatUser1.filters } },
		});
		await sleep(500);
		i++
	}
	//if u havent find a match, find anyone cuz u desperate
	if (chatUser2 == null) {
		i = 0;
		while (chatUser2 == null && i < 20) {
			chatUser2 = await ChatUser.findOne({
				name: { $not: { $in: [chatUser1.name, chatUser1.last_matched] } },
				matched: false,
			});
			await sleep(500);
			i++
		}
	}

	if (chatUser2 != null) {
		let chatUser2Profile = await displayMatchedUserProfile(chatUser2);
		await res.send(chatUser2Profile);
	} else {
		res.send("stfu");
	}

	setTimeout(async function () {
		await ChatUser.updateMany(
			{ $or: [{ name: chatUser1.name }, { name: chatUser2.name }] },
			{ $set: { matched: true, last_matched: chatUser2.name } }
		);
	}, 1000);
});



/**
 * Function for finding another match after rejecting
 */
router.post("/findAnotherMatch", async function (req, res) {
	let chatUser1 = await ChatUser.findOne({ name: req.session.name });

	await ChatUser.updateMany(
		{ $or: [{ name: chatUser1.name }, { name: chatUser1.last_matched }] },
		{ $set: { matched: false } }
	);

	let chatUser2 = null;

	let i = 0;
	while (chatUser2 == null && i < 20) {
		chatUser2 = await ChatUser.findOne({
			name: { $not: { $in: [chatUser1.name, chatUser1.last_matched] } },
			matched: false,
			filters: { $elemMatch: { $in: chatUser1.filters } },
		});
		await sleep(500);
		i++
	}
	//if u havent find a match, find anyone cuz u desperate
	if (chatUser2 == null) {
		i = 0;
		while (chatUser2 == null && i < 20) {
			chatUser2 = await ChatUser.findOne({
				name: { $not: { $in: [chatUser1.name, chatUser1.last_matched] } },
				matched: false,
			});
			await sleep(500);
			i++
		}
	}

	if (chatUser2 != null) {
		let chatUser2Profile = await displayMatchedUserProfile(chatUser2);
		await res.send(chatUser2Profile);
	} else {
		res.send("stfu");
	}

	setTimeout(async function () {
		await ChatUser.updateMany(
			{ $or: [{ name: chatUser1.name }, { name: chatUser2.name }] },
			{ $set: { matched: true, last_matched: chatUser2.name } }
		);
	}, 1000);
});

module.exports = router;

async function displayMatchedUserProfile(user2) {
	let user = await User.findOne({ name: user2.name });

	let allPosts = await Timeline.find({
		author: user.name,
	});
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
		if (allPosts[i].img != null && allPosts[i].img != undefined) {
			stories +=
				'<div id="story-img-container" class="mb-3"><div class="row"><div class="col-12"><div class="card"><div class="card-img"><div id="imageGroup' +
				i +
				'" class="carousel slide" data-bs-ride="carousel" data-bs-interval="false"><div class="carousel-inner">' +
				'<div class="carousel-item active' +
				'"><img src=' +
				allPosts[i].img +
				' alt="" class="card-img d-block w-100"/></div>' +
				"</div>" +
				"</div></div></div></div></div></div>";
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

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}