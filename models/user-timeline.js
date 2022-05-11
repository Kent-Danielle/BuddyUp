'use strict';

const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema({

    title: {
        type: String,
        required: false
    },
    post: {
        type: String,
        required: false
    }
})

module.exports = mongoose.model('BBY-09-users-timeline', timelineSchema);