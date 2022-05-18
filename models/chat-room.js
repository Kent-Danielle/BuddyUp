"use strict";

const mongoose = require("mongoose");

const chatroomSchema = new mongoose.Schema({
	users: {
		type: [String],
		required: false,
	}
});

module.exports = mongoose.model("chat-room", chatroomSchema);
