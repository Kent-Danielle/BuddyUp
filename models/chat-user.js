"use strict";

const mongoose = require("mongoose");

const chatuserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	filters: {
		type: Array,
		required: false,
	},
	matched: {},
	last_match: {
		type: String,
		required: false,
	},
	room: {
		type: String,
		required: false,
	},
	finding: {
		type: Boolean,
		required: false,
	},
});

module.exports = mongoose.model("kent-chat-user", chatuserSchema);
