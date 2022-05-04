const express = require('express');
const router = express.Router();
const User = require('../models/user');
const path = require('path');
const fs = require('fs');
const { JSDOM } = require('jsdom');

//get all users
router.get('/', function (req, res) {
    if (req.session.loggedIn) {
        res.redirect('/user/profile')
    } else {
        res.redirect('/user/login');
    }
});

router.get('/profile', async function (req, res) {
    if (!req.session.loggedIn) {
        res.redirect("/user/login");
    } else {
        
        let currentUser = await User.findOne({
            email: req.session.email
        });

        let isAdmin = await User.findOne({
            email: req.session.email,
            admin: true
        });
        console.log("admin stuff: " + isAdmin);
        if (isAdmin) {
            res.redirect("/user/admin");
        } else {
            //currentUser.then((result) => {
                let profile = fs.readFileSync("./public/html/profile.html", "utf-8");
                let profileDOM = new JSDOM(profile);
                profileDOM.window.document.getElementById('email').innerHTML = currentUser.email;
                profileDOM.window.document.getElementById('name').innerHTML = currentUser.name;
               // profileDOM.window.document.getElementById('pfp').src = 'data:image/'+result.img.contentType+';base64,'+result.img.data.toString('base64');
                res.send(profileDOM.serialize());
            //});
        }
    }

});

//get all users
router.get('/login', function (req, res) {
    // if user logged in, go to their profile page
    if (req.session.loggedIn) {
        res.redirect('/user/profile');
    } else { // if user is not logged in, go to the login page 
        let login = fs.readFileSync("./public/html/index.html", "utf-8");
        res.send(login);
    }
});

router.get('/admin', function (req, res) {

    if (req.session.loggedIn) {
        let isAdmin = User.findOne({
            email: req.session.email,
            admin: true
        });
        let adminPage = fs.readFileSync("./public/html/admin.html", "utf-8");
        if (isAdmin == null) {
            console.log("/admin: User! line 76");
            res.redirect("/user/login");
        } else {
            res.send(adminPage);
        }
    } else {
        console.log("/admin: not logged in!");
    }
    
});

router.post('/login', function (req, res) {
    let login = fs.readFileSync("./public/html/index.html", "utf-8");
    let loginDOM = new JSDOM(login);

    let currentUser = User.findOne({
        email: req.body.email
    });
    currentUser.then((result) => {
        if (result == null) {
            loginDOM.window.document.getElementById('errorMsg').innerHTML = "Account not found";
            res.send(loginDOM.serialize());
        } else {
            if (result.password == req.body.password) {
                req.session.loggedIn = true;
                req.session.email = result.email;
                res.redirect('/user/profile');
            } else {
                loginDOM.window.document.getElementById('errorMsg').innerHTML = "Incorrect Password";
                res.send(loginDOM.serialize());
            }
        }
    });
});

//new user route
router.get('/register', function (req, res) {
    if (req.session.loggedIn == true) {
        res.redirect('/user/profile')
    } else {
        let login = fs.readFileSync("./public/html/new.html", "utf-8");
        res.send(login);
    }
});


var multer = require('multer');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '');
    },
    filename: (req, file, cb) => {
        cb(null, "temp.png");
    }
});

var upload = multer({
    storage: storage
});

router.post('/createAccount', upload.single('image'), async function (req, res) {

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        admin: false
        // img: {
        //     data: fs.readFileSync('uploads/temp.png'),
        //     contentType: 'image/png'
        // }
    });

    let login = fs.readFileSync("./public/html/new.html", "utf-8");
    let loginDOM = new JSDOM(login);

    try {
        let hasSameEmail = await User.findOne({
            email: req.body.email
        });
        if (hasSameEmail == null) {
            const newUser = await user.save();
            console.log(newUser);
            res.redirect('/user/login');
        } else {
            console.log(hasSameEmail);
            loginDOM.window.document.getElementById('errorMsg').innerHTML = "Email already exists!";
            res.send(loginDOM.serialize());
        }
    } catch {
        loginDOM.window.document.getElementById('errorMsg').innerHTML = "Failed to create account";
        res.send(loginDOM.serialize());
    }

});

router.get("/logout", function (req, res) {

    if (req.session) {
        req.session.destroy(function (error) {
            if (error) {
                res.status(400).send("Unable to log out")
            } else {
                // session deleted, redirect to home
                res.redirect("/");
            }
        });
    }
});


module.exports = router;

