"use strict";

const mongoose = require("mongoose");

const chatuserSchema = new mongoose.Schema({
	//name of the user
	name: {
		type: String,
		required: true,
	},
	//filters for the matching
	filters: {
		type: Array,
		required: false,
	},
	//state if they are already matched
	matched: {
		type: Boolean,
		required: false,
	},
	//the name of the other user they matched with
	current_match: {
		type: String,
		required: false,
	},
	//the name of the last user they matched with
	last_match: {
		type: String,
		required: false,
	},
	//their roomID
	room: {
		type: String,
		required: false,
	},
	//state if they are still finding for users or they're chilling
	finding: {
		type: Boolean,
		required: false,
	},
	//state if they accepted, rejected, or is still waiting for response
	response: {
		type: String,
		required: false,
	},
	cancelled: {
		type: Boolean,
		required: false,
	}
});

module.exports = mongoose.model("bby09-chat-user", chatuserSchema);
