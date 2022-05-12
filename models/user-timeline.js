'use strict';

const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema({

    author: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    post: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('BBY-09-users-timeline', timelineSchema);