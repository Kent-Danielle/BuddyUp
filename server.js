'use strict';

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

/**
 * Libraries.
 */
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const server = require('http').Server(app);
const io = require("socket.io")(server);

const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const cookieParser = require("cookie-parser");
const User = require("./models/user");
const fs = require("fs");


exports.server = server;
exports.io = io;

app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(express.static(path.join(__dirname, './public')));
app.use(bodyParser.urlencoded({
    limit: '10mb',
    extended: false
}));
app.use(bodyParser.json())

const oneDay = 1000 * 60 * 60 * 24;

/**
 * Session setup.
 */
app.use(session({
    secret: "hvlhjlakdjnclkasjnvjkadfaksdfcnvlchwjjdndsjsjjsj",
    name: "BuddyUpSession",
    resave: false,
    cookie: {
        maxAge: oneDay
    },
    saveUninitialized: true
}));


const indexRouter = require('./routes/index');
const userRouter = require('./routes/users');
const matchRouter = require('./routes/match');

// RUN SERVER
let port = 8000;
server.listen(process.env.PORT || port, function () {
    console.log('Listening on port ' + port + '!');
});

/**
 * Database connection.
 */
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, async err => {
    console.log('connected to database');
});

const db = mongoose.connection;

db.on('error', error => {
    console.error(error);
});


/**
 * Server routes.
 */
app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/match', matchRouter);


/**
 * Redirects to the 404 not found page upon trying to access invalid routes.
 */
app.get('/*', function(req, res) {
    let notFoundDoc = fs.readFileSync("./public/html/not_found.html", "utf-8");
    res.send(notFoundDoc);
});