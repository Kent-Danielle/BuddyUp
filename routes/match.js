"use strict";

const express = require("express");
const router = express.Router();
const User = require("../models/user");
const AdminRequest = require("../models/admin-request");
const Timeline = require("../models/user-timeline");
const ChatRoom = require("../models/chat-room.js");
const ChatUser = require("../models/chat-user.js");
const path = require("path");
const fs = require("fs");
const { JSDOM } = require("jsdom");

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

router.post("/findmatch", async function (req, res) {
	console.log(req.body);
	await ChatUser.updateOne(
		{
			name: req.session.name,
		},
		{
			$set: {
				matched: false,
				filters: req.body.gameFilters,
			},
		}
	);

	const chatUser1 = await ChatUser.findOne({ name: req.session.name });

	let chatUser2 = null;
	//DONT FORGET TO MAKE THIS AS A TIME BASED NT NULL OK?
	while (chatUser2 == null) {
		chatUser2 = await ChatUser.findOne({
			name: { $ne: chatUser1.name },
			matched: false,
			filters: { $elemMatch: { $in: chatUser1.filters } },
		});
	}

	await res.send(chatUser2);

	setTimeout(async function() {
		await ChatUser.updateMany(
			{ $or: [{ name: chatUser1.name }, { name: chatUser2.name }] },
			{ $set: { matched: true } }
		);
	}, 500)
});

module.exports = router;
