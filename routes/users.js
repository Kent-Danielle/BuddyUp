'use strict';
var cloudinary = require('cloudinary');
cloudinary.config({
	cloud_name: 'buddyup-images',
	api_key: '673686844465421',
	api_secret: 'cxk0wwxInP62OzGTo26z2TZSnDU'
});
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const path = require("path");
const fs = require("fs");
const {
	JSDOM
} = require("jsdom");

//get all users
router.get("/", function (req, res) {
	if (req.session.loggedIn) {
		res.redirect("/user/profile");
	} else {
		res.redirect("/user/login");
	}
});

router.get("/profile/", async function (req, res) {
	res.redirect("/user/profile/self");
});

router.get("/profile/:name", async function (req, res) {
	var profileName = req.params["name"];
	if (!req.session.loggedIn) {
		res.redirect("/user/login");
	} else {
		let currentUser = await User.findOne({
			email: req.session.email,
		});

		let isAdmin = await User.findOne({
			email: req.session.email,
			admin: true,
		});
		if (profileName == "self") {
			if (isAdmin) {
				res.redirect("/user/admin");
				return;
			}
		} else {
			if (isAdmin) {
				currentUser = await User.findOne({
					name: profileName,
				});
			} else {
				res.redirect("/user/profile/self");
				return;
			}
		}

		if (currentUser.about == null) {
			currentUser.about = "";
		}

		let profile = fs.readFileSync("./public/html/profile.html", "utf-8");
		let profileDOM = new JSDOM(profile);
		profileDOM.window.document.getElementById("username").innerHTML =
			currentUser.name;
		profileDOM.window.document.getElementById("bio-text").innerHTML =
			currentUser.about;
		profileDOM.window.document.getElementById("pfp").src = currentUser.img;
		// profileDOM.window.document.getElementById('pfp').src = 'data:image/'+result.img.contentType+';base64,'+result.img.data.toString('base64');
		res.header(
			"Cache-Control",
			"no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
		);
		res.send(profileDOM.serialize());
	}
});


//get all users
router.get("/login", function (req, res) {
	// if user logged in, go to their profile page
	res.header(
		"Cache-Control",
		"no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
	);
	if (req.session.loggedIn) {
		res.redirect("/user/profile");
	} else {
		// if user is not logged in, go to the login page
		let login = fs.readFileSync("./public/html/login.html", "utf-8");
		res.send(login);
	}
});

router.get("/admin", function (req, res) {
	if (req.session.loggedIn) {
		User.findOne({
			email: req.session.email,
			admin: true,
		}).then((isAdmin) => {
			let adminPage = fs.readFileSync("./public/html/admin.html", "utf-8");
			let adminPageDOM = new JSDOM(adminPage);
			if (isAdmin == null) {
				res.redirect("/user/login");
			} else {
				User.find({}, function (err, result) {
					if (err) {
						adminPageDOM.window.document.getElementById("error").innerHTML =
							"Error finding all users";
					} else {
						adminPageDOM.window.document.getElementById("name").innerHTML =
							req.session.name;
						const tableDiv =
							adminPageDOM.window.document.getElementById("tableBody");
						//const userTable = createTable(result, tableToInsert);
						for (let i = 0; i < result.length; i++) {
							tableDiv.innerHTML +=
								"<tr><th class='number-column text-center' scope=\"row\">" +
								'<button id="more-info"><i class="fa-solid fa-circle-plus"></i></button>' +
								(i + 1) +
								"</th><td class='name-column'>" +
								result[i].name +
								"</td><td class='email-column'>" +
								result[i].email +
								'</td><td class=\'edit-column text-center\'><a class="text-dark" href="/user/profile/' +
								result[i].name +
								'"><i class="fa-solid fa-pen-to-square  "></i></a></td></tr>' +
								'<tr class="info" id="info-' +
								(i + 1) +
								'"><td colspan=2><table id="nested-table-' +
								(i + 1) +
								'"class="nested mx-2"><tr><th id="mini-email" class="p-2" scope="col">Email</th><td class=\'mini-email-column px-1\'>' +
								result[i].email +
								'</td></tr><tr><th id="mini-edit" class="p-2" scope="col">Edit</th><td class=\'mini-edit-column\'><a class="text-dark" href="/user/profile/' +
								result[i].name +
								'"><i class="fa-solid fa-pen-to-square"></i></a></td></tr></table></td></tr>';
						}
						res.header(
							"Cache-Control",
							"no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
						);
						res.send(adminPageDOM.serialize());
					}
				});
			}
		});

	} else {
		res.redirect("/user/login");
	}
});

router.post("/adminSearch", function (req, res) {
	res.setHeader("Content-Type", "application/json");
	let searchOptions = {};
	if (req.body.input != null || req.body.input != "") {
		searchOptions.name = new RegExp(req.body.input, "i");
	}
	User.find(searchOptions, function (err, result) {
		if (err) {
			res.send("Error finding users!");
		} else {
			let tableDiv = "";
			for (let i = 0; i < result.length; i++) {
				tableDiv +=
					"<tr><th class='number-column text-center' scope=\"row\">" +
					'<button id="more-info"><i class="fa-solid fa-circle-plus"></i></button>' +
					(i + 1) +
					"</th><td class='name-column'>" +
					result[i].name +
					"</td><td class='email-column'>" +
					result[i].email +
					'</td><td class=\'edit-column text-center\'><a class="text-dark" href="/user/profile/' +
					result[i].name +
					'"><i class="fa-solid fa-pen-to-square  "></i></a></td></tr>' +
					'<tr class="info" id="info-' +
					(i + 1) +
					'"><td colspan=2><table id="nested-table-' +
					(i + 1) +
					'"class="nested mx-2"><tr><th id="mini-email" class="p-2" scope="col">Email</th><td class=\'mini-email-column px-1\'>' +
					result[i].email +
					'</td></tr><tr><th id="mini-edit" class="p-2" scope="col">Edit</th><td class=\'mini-edit-column\'><a class="text-dark" href="/user/profile/' +
					result[i].name +
					'"><i class="fa-solid fa-pen-to-square"></i></a></td></tr></table></td></tr>';
			}
			if (tableDiv == "") {
				res.send("no results");
			} else {
				res.send(tableDiv);
			}
		}
	});
});


router.post("/banUser", function (req, res) {
	res.setHeader("Content-Type", "application/json");
});

router.post("/login", function (req, res) {
	let login = fs.readFileSync("./public/html/login.html", "utf-8");
	let loginDOM = new JSDOM(login);
	let currentUser = User.findOne({
		email: req.body.email,
	});
	currentUser.then((result) => {
		if (result == null) {
			res.send({
				success: "false",
				message: "account not found"
			})
		} else {
			if (result.password == req.body.password) {
				req.session.loggedIn = true;
				req.session.email = result.email;
				req.session.name = result.name;
				res.send({
					success: "true",
					message: "logged in."
				})
				// res.redirect("/user/profile");
			} else {
				res.send({
					success: "false",
					message: "incorrect password"
				})
			}
		}
	});
});

//get all users
router.get("/login", function (req, res) {
	if (req.session.loggedIn == true) {
		res.redirect("/user/profile");
	} else {
		let login = fs.readFileSync("./public/html/login.html", "utf-8");
		res.send(login);
	}
});


//new user route
router.get("/register", function (req, res) {
	if (req.session.loggedIn == true) {
		res.redirect("/user/profile");
	} else {
		let login = fs.readFileSync("./public/html/register.html", "utf-8");
		res.send(login);
	}
});

var multer = require("multer");
const {
	table
} = require("console");
const user = require("../models/user");

var storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "./public/data/pfp");
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + path.extname(file.originalname));
	},
});

var upload = multer({
	storage: storage,
});

router.post(
	"/createAccount",
	upload.single("pfp"),
	async function (req, res) {
		try {
			let hasSameEmail = await User.findOne({
				email: req.body.email,
			});
			let hasSameUsername = await User.findOne({
				name: req.body.name
			});
			if (hasSameEmail == null && hasSameUsername == null) {
				let url = "/images/profile.png";
				if(req.file != undefined){
					let upload = await cloudinary.v2.uploader.upload("./public/data/pfp/" + req.file.filename,
					function (error) {
						if (error) {
							res.send({
								success: "false",
								message: "failed to upload profile picture"
							});
							return;
						}
					})
					await fs.unlink("./public/data/pfp/" + req.file.filename, function (err) {
						if (err) {
							console.log("Failed to remove old image")
						};
					});
					url = upload.url;
				}
				const user = new User({
					name: req.body.name,
					email: req.body.email,
					password: req.body.password,
					about: req.body.about,
					admin: false,
					banned: false,
					img: url
				});
				const newUser = await user.save();
				res.send({
					success: "true",
					message: "created account"
				});
			} else {
				let msg = "";
				if (hasSameEmail != null) {
					msg = "Email already exists!";
				} else {
					msg = "Username already exists!";
				}
				res.send({
					success: "false",
					message: msg
				});
			}
		} catch (err) {
			console.log(err);
			res.send({
				success: "false",
				message: "failed to create account"
			});
		}
	}
);

router.get("/logout", function (req, res) {
	if (req.session) {
		req.session.destroy(function (error) {
			if (error) {
				res.status(400).send("Unable to log out");
			} else {
				// session deleted, redirect to home

				res.redirect("/");
			}
		});
	}
});

module.exports = router;