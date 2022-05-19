'use strict';

const mongoose = require('mongoose');

const chatuserSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    filters: {
        type: Array,
        required: false
    },
    matched: {
        type: Boolean,
        required: false
    },
    last_match: {
        type: String,
        required: false
    },
    room: {
        type: String,
        required: false
    }
    
})

module.exports = mongoose.model('kent-chat-user', chatuserSchema);