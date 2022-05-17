'use strict';

const express = require("express");
const router = express.Router();
const User = require("../models/user");
const AdminRequest = require("../models/admin-request");
const Timeline = require("../models/user-timeline");
const path = require("path");
const fs = require("fs");
const {
	JSDOM
} = require("jsdom");

/**
 * GET route for sending the chat html page
 */
router.get("/", function (req, res) {
	// if user logged in, go to their profile page
	res.header(
		"Cache-Control",
		"no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
	);
	if (req.session.loggedIn) {
		// if user is not logged in, go to the login page
		let login = fs.readFileSync("./public/html/chat.html", "utf-8");
		res.send(login);
	} else {
		res.redirect("/user/profile");
	}
});


module.exports = router;