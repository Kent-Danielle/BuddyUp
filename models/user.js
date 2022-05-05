const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        required: false
    },
    banned: {
        type: Boolean,
        required: false
    },
    about: {
        type: String,
        required: false
    },
    games: {
        type: Array,
        required: false,
    },
    // img: {
    //     data: Buffer,
    //     contentType: String
    // }
})

module.exports = mongoose.model('User', userSchema);