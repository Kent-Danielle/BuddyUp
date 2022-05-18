"use strict";

const mongoose = require("mongoose");

const chatroomSchema = new mongoose.Schema({
	user1: {
		type: String,
		required: true,
	},
	user2: {
		type: String,
		required: false,
	},
});

module.exports = mongoose.model("chat-room", chatroomSchema);
