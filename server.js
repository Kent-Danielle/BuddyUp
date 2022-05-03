if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const app = express()
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const cookieParser = require("cookie-parser");

app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(bodyParser.urlencoded({limit:'10mb', extended: false}));
app.use(bodyParser.json())

const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
    secret: "hvlhjlakdjnclkasjnvjkadfaksdfcnvlchwjjdndsjsjjsj",
    name: "wazaSessionID",
    resave: false,
    cookie: { maxAge: oneDay },
    saveUninitialized: true
}));


const indexRouter = require('./routes/index');
const userRouter = require('./routes/users');

// // RUN SERVER
let port = 8000;
app.listen(process.env.PORT || port, function () {
    console.log('Listening on port ' + port + '!');
});
//


mongoose.connect(process.env.DATABASE_URL,
    { useNewUrlParser: true, useUnifiedTopology: true }, err => {
        console.log('connected')
    });
const db = mongoose.connection;

db.on('error', error => {
    console.error(error);
});
db.once('open', () => {
    console.log("connected to database!");
})

app.use('/', indexRouter);
app.use('/user', userRouter);