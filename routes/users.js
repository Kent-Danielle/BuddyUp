"use strict";

//connect to our cloudinary image host
var cloudinary = require("cloudinary");
cloudinary.config({
	cloud_name: "buddyup-images",
	api_key: "673686844465421",
	api_secret: process.env.IMAGE_KEY,
});

//import everything we need
const express = require("express");
const router = express.Router();
//these are the mongodb schemas for all our collections
const User = require("../models/user");
const AdminRequest = require("../models/admin-request");
const Timeline = require("../models/user-timeline");
const ChatUser = require("../models/chat-user.js");
const path = require("path");
const fs = require("fs");
const {
	JSDOM
} = require("jsdom");

//the default path for /users: if your logged in to to profile otherwise login
router.get("/", function (req, res) {
	if (req.session.loggedIn) {
		res.redirect("/user/profile");
	} else {
		res.redirect("/user/login");
	}
});

//get the profile of the current logged in user
router.get("/profile/", async function (req, res) {
	if (!req.session.loggedIn) {
		res.redirect("/user/login");
	} else {
		let currentUser = null;
		let isAdmin;
		try {
			currentUser = await User.findOne({
				email: req.session.email,
			});
			//check if the user is an admin
			isAdmin = await User.findOne({
				email: req.session.email,
				admin: true,
			});
		} catch (error) {
			return;
		}
		//redirect to admin panel if admin
		if (isAdmin) {
			res.redirect("/user/admin");
			return;
		}
		//update the users chatroom information, so they don't get matched with anyone
		await ChatUser.updateOne({
			name: req.session.name
		}, {
			$set: {
				finding: false,
				matched: false
			}
		});

		if (currentUser.about == null) {
			currentUser.about = "";
		}

		//set the profile information before sending to client
		let profile = fs.readFileSync("./public/html/profile.html", "utf-8");
		let profileDOM = new JSDOM(profile);
		profileDOM.window.document.getElementById("username").innerHTML =
			currentUser.name;
		profileDOM.window.document.getElementById("bio-text").innerHTML =
			currentUser.about;
		profileDOM.window.document.getElementById("pfp").src = currentUser.img;

		let allPosts;
		try {
			allPosts = await Timeline.find({
				author: currentUser.name,
			});
		} catch (error) {
			return;
		}
		//formatting options for the date on the post
		let dateOptions = {
			weekday: "long",
			timeZone: "PST",
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "numeric",
			minute: "numeric",
		};
		let stories = "";
		//build the HTML for each post the user has
		for (let i = allPosts.length - 1; i >= 0; i--) {
			stories +=
				'<div class="story rounded-3 py-1 px-3 my-3">' +
				'<h4 id="story-title" class="mt-2 mb-0">' +
				allPosts[i].title +
				"</h4>" +
				'<a class="rounded-3 p-0 edit-post-button" href="/user/editPost/' +
				allPosts[i]._id.valueOf() +
				'"><i class="fa-solid fa-pen-to-square"></i></a>' +
				'<button class="delete-post-button" value="' +
				allPosts[i]._id.valueOf() +
				'"><i class="fa-solid fa-trash"></i></button>' +
				'<p id="story-date" class="mb-0">' +
				allPosts[i]._id.getTimestamp().toLocaleString("en-us", dateOptions) +
				'</p><p id="story-body" class="mb-3">' +
				allPosts[i].post +
				"</p>";
			if (allPosts[i].img[0] != null && allPosts[i].img[0] != undefined) {
				stories +=
					'<div id="story-img-container" class="mb-3"><div class="row"><div class="col-12"><div class="card"><div class="card-img"><div id="imageGroup' +
					i +
					'" class="carousel slide" data-bs-ride="carousel" data-bs-interval="false"><div class="carousel-inner">';
				for (let j = 0; j < allPosts[i].img.length; j++) {
					stories += '<div class="carousel-item';
					if (j == 0) {
						stories += " active";
					}
					stories +=
						'"><img src=' +
						allPosts[i].img[j] +
						' alt="" class="card-img d-block w-100"/></div>';
				}
				if (allPosts[i].img.length > 1) {
					stories +=
						'</div><button class="carousel-control-prev" type="button" data-bs-target="#imageGroup' +
						i +
						'" data-bs-slide="prev"><span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="visually-hidden">Previous</span> </button><button class="carousel-control-next" type="button" data-bs-target="#imageGroup' +
						i +
						'" data-bs-slide="next"><span class="carousel-control-next-icon" aria-hidden="true"></span><span class="visually-hidden">Next</span></button></div>';
				} else {
					stories += "</div>";
				}
				stories += "</div></div></div></div></div></div>";
			}
			stories += "</div>";
		}
		profileDOM.window.document.getElementById(
			"lg-stories-container"
		).innerHTML += stories;
		//dont allow the user to click back to get here
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

//function to build the list of users for the admin panel.
function tableHTMLBuilder(result, i) {
	var table =
		"<tr>" +
		//HEADER
		"<th class='number-column text-center' scope=\"row\">" +
		"<button id='more-info'>" +
		"<i class='fa-solid fa-circle-plus'>" +
		"</i></button>" +
		(i + 1) +
		"</th>" +
		//NAME COL
		"<td class='name-column'>" +
		result.name +
		//EMAIL COL
		"</td><td class='email-column'>" +
		result.email +
		//ADMIN COL
		"</td><td class='admin-column text-center'>" +
		(result.admin ?
			"<i class='fa-solid fa-check'></i>" :
			"<i class='fa-solid fa-xmark'></i>") +
		//PROMOTON COL
		"</td><td class='promotion-column text-center'>" +
		(result.promotion ?
			"<i class='fa-solid fa-check'></i>" :
			"<i class='fa-solid fa-xmark'></i>") +
		//EDIT BTNS COL
		"</td><td class='edit-column text-center'>" +
		"<button id='editModalButton' value='" +
		result.name +
		"'>" +
		"<i class='fa-solid fa-pen-to-square'></i></button>" +
		//DELETE BTNS COL
		"</td><td class='delete-column text-center'>" +
		"<button id='confirmModal' value='" +
		result.name +
		"'>" +
		"<i class='fa-solid fa-trash'></i></button>" +
		"</tr>" +
		//ROW CONTAINING THE COMPACT TABLE
		"<tr class='info' id='info-" +
		(i + 1) +
		"'><td colspan=4>" +
		//THE COMPACT TABLE
		"<table id='nested-table-" +
		(i + 1) +
		"'class='nested mx-2'>" +
		//EMAIL ROW
		"<tr><th id='mini-email' class='p-2' scope='col'>Email</th>" +
		"<td class='mini-email-column px-1'>" +
		result.email +
		"</td>" +
		//EDIT ROW
		"</tr><tr><th id='mini-edit' class='p-2' scope='col'>Edit</th>" +
		"<td class='mini-edit-column'><button id='editModalButton' value='" +
		result.name +
		"'><i class='fa-solid fa-pen-to-square'></i></button></td>" +
		//DELETE ROW
		"</tr><tr><th id='mini-delete' class='p-2' scope='col'>Delete</th>" +
		"<td class='mini-delete-column'><button id='confirmModal' value='" +
		result.name +
		"'>" +
		"<i class='fa-solid fa-trash'></i></button></td>" +
		"</table></td></tr>";

	return table;
}

/**
 * Code for loading the admin panel
 */
router.get("/admin", function (req, res) {
	if (req.session.loggedIn) {
		try {
			User.findOne({
				email: req.session.email,
				admin: true,
			}).then((isAdmin) => {
				//if an admin with the session email exists, then send the page
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
							//set data for admin page
							adminPageDOM.window.document.getElementById("name").innerHTML =
								req.session.name;
							const tableDiv =
								adminPageDOM.window.document.getElementById("tableBody");
							for (let i = 0; i < result.length; i++) {
								tableDiv.innerHTML += tableHTMLBuilder(result[i], i);
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
		} catch (error) {
			return;
		}
	} else {
		res.redirect("/user/login");
	}
});

/**
 * Function for searching in the dashboard and using the filters
 */
router.post("/adminSearch", async function (req, res) {
	//first check if they are admin
	if (
		(await User.findOne({
			email: req.session.email,
			admin: true,
		})) == null
	) {
		return;
	}
	res.setHeader("Content-Type", "application/json");
	let searchOptions = {};
	if (req.body.input != null) {
		//check if its a search or a filter
		if (req.body.type == "search") {
			//RegExp is so we can get parts of the names
			searchOptions.name = new RegExp(req.body.input, "i");
		} else if (req.body.type == "admin") {
			searchOptions.admin = req.body.input;
		} else if (req.body.type == "request") {
			searchOptions.promotion = req.body.input;
		}
	}
	try {
		//get all the users and put them in a table
		await User.find(searchOptions, function (err, result) {
			if (err) {
				res.send("Error finding users!");
			} else {
				let tableDiv = "";
				for (let i = 0; i < result.length; i++) {
					tableDiv += tableHTMLBuilder(result[i], i);
				}
				if (tableDiv == "") {
					res.send("No results!");
				} else {
					res.send(tableDiv);
				}
			}
		});
	} catch (error) {
		return;
	}
});

/**
 * Function for logging in
 */
router.post("/login", function (req, res) {
	let currentUser;
	let userEmail = req.body.email.toLowerCase();
	try {
		//first find an account with the users email
		currentUser = User.findOne({
			email: userEmail,
		});
		currentUser.then((result) => {
			if (result == null) {
				res.send({
					success: "false",
					type: "email",
					message: "Account not found",
				});
			} else {
				//next, check if thier passwords match
				if (result.password == req.body.password) {
					//update the session information
					req.session.loggedIn = true;
					req.session.email = result.email;
					req.session.name = result.name;
					res.send({
						success: "true",
						message: "Logged in",
					});
				} else {
					res.send({
						success: "false",
						type: "password",
						message: "Incorrect password",
					});
				}
			}
		});
	} catch (error) {
		res.send({
			success: "false",
			type: "name",
			message: "Login error!",
		});
	}
});

/**
 * get the login page, but redirect if already logged in
 */
router.get("/login", function (req, res) {
	if (req.session.loggedIn == true) {
		res.redirect("/user/profile");
	} else {
		let login = fs.readFileSync("./public/html/login.html", "utf-8");
		res.send(login);
	}
});

/**
 * get the register page, but redirect to profile if already logged in
 */
router.get("/register", function (req, res) {
	if (req.session.loggedIn == true) {
		res.redirect("/user/profile");
	} else {
		let register = fs.readFileSync("./public/html/register.html", "utf-8");
		res.send(register);
	}
});

var multer = require("multer");
const user = require("../models/user");

/**
 * set up the multer for the profile picture upload system
 */
var storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "./public/images/");
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + path.extname(file.originalname));
	},
});

var upload = multer({
	storage: storage,
});

/**
 * Creates an account. Takes in a single image as well for the profile picture.
 */
router.post("/createAccount", upload.single("pfp"), async function (req, res) {
	//email is lowercased and trimed to prevent errors
	let userEmail = req.body.email.toLowerCase().trim();
	try {
		//check the database for the email and name to see if they are already taken
		let hasSameEmail = await User.findOne({
			email: userEmail,
		});
		let hasSameUsername = await User.findOne({
			name: req.body.name.trim(),
		});
		if (hasSameEmail == null && hasSameUsername == null) {
			//set the default image to our default pfp in case the user doesn't set their own.
			let url =
				"https://res.cloudinary.com/buddyup-images/image/upload/v1652458876/profile_ek8iwp.png";
			//upload the image if a new one was set
			if (req.file != undefined) {
				url = await uploadImage("./public/images/" + req.file.filename, res, url);
			}
			//make sure all the fields are not to long.
			if (req.body.name.length > 100) {
				res.send({
					success: "false",
					message: "Name must be less then 100 characters",
					type: "name",
				});
				return;
			}
			if (req.body.email.length > 100) {
				res.send({
					success: "false",
					message: "Email must be less then 100 characters",
					type: "email",
				});
				return;
			}
			if (req.body.about.length > 280) {
				res.send({
					success: "false",
					message: "Bio is too long",
					type: "about",
				});
				return;
			}
			const user = new User({
				name: req.body.name.trim(),
				email: userEmail,
				password: req.body.password,
				about: req.body.about,
				admin: false,
				banned: false,
				promotion: false,
				img: url,
			});
			//upload the new user to mongoDB
			const newUser = await user.save();
			res.send({
				success: "true",
				message: "Created account",
			});
		} else {
			if (hasSameEmail != null) {
				res.send({
					success: "false",
					message: "Email already taken",
					type: "email",
				});
			} else {
				res.send({
					success: "false",
					message: "Username already taken",
					type: "name",
				});
			}
		}
	} catch (err) {
		res.send({
			success: "false",
			type: "name",
			message: "Failed to create account",
		});
	}
});

/**
 * Route for loggin out the user
 */
router.get("/logout", async function (req, res) {
	if (req.session) {

		let user = await ChatUser.findOne({
			name: req.session.name
		});
		//if the user is active in the chatroom, then delete them from the online users collection
		if (user != null) {
			if (!user.finding && !user.matched) {
				await ChatUser.deleteMany({
					name: req.session.name
				});
			}
		}
		//destroy the current session when logged out
		req.session.destroy(function (error) {
			if (error) {
				res.send("Unable to log out");
			} else {
				// session deleted, redirect to home
				res.redirect("/");
			}
		});
	}
});

/**
 * redirects the user to the edit profile page
 */
router.get("/edit", function (req, res) {
	if (req.session.loggedIn == true) {
		let profileEdit = fs.readFileSync("./public/html/profile_edit.html");
		let profileEditDOM = new JSDOM(profileEdit);

		res.send(profileEditDOM.serialize());
	} else {
		res.redirect("/user/login");
	}
});
/**
 * sends the logged in user's information over to the client side
 */
router.get("/info", async function (req, res) {
	if (req.session.loggedIn) {
		try {
			let currentUser = await User.findOne({
				email: req.session.email,
			});
			res.send(currentUser);
		} catch (error) {
			return;
		}
	}
});


/**
 * updates the users information after editing and then redirects them back to their profile page
 * takes a single image in case they changed thier pfp
 */
router.post("/edit/submit", upload.single("image"), async function (req, res) {
	try {
		let userEmail = req.body.email.toLowerCase().trim();
		let filters = req.body.filters;
		if (filters != " " && filters != "") {
			filters = req.body.filters.split(",");
			filters = shortingGame(filters);
		} else {
			filters = null;
		}

		//checks if they changed thier email or username
		let noEmailChange = userEmail === req.session.email;

		let hasSameEmail = await User.findOne({
			email: userEmail,
		});

		let noNameChange = req.body.name === req.session.name;

		let hasSameUsername = await User.findOne({
			name: req.body.name,
		});

		if (
			(hasSameEmail == null || noEmailChange) &&
			(hasSameUsername == null || noNameChange)
		) {
			//check if their name email and bio are not to long
			if (req.body.name.length > 100) {
				res.send({
					success: false,
					message: "Name must be less then 100 characters",
					type: "name",
				});
				return;
			}
			if (req.body.email.length > 100) {
				res.send({
					success: false,
					message: "Email must be less then 100 characters",
					type: "email",
				});
				return;
			}
			if (req.body.about.length > 280) {
				res.send({
					success: false,
					message: "Bio is too long",
					type: "about",
				});
				return;
			}
			let url = hasSameEmail.img;
			if (req.file != undefined) {
				url = await uploadImage("./public/images/" + req.file.filename, res, url);
			}

			//update the posts the user made to thier new name
			try {
				await Timeline.updateMany({
					author: req.session.name,
				}, {
					$set: {
						author: req.body.name,
					},
				});
			} catch (error) {}

			//if there is a new pfp, update it, otherwise update everything else
			await User.updateOne({
				email: req.session.email,
			}, {
				$set: {
					img: url,
					name: req.body.name.trim(),
					about: req.body.about,
					email: userEmail,
					password: req.body.password,
					games: filters,
				},
			});

			//update the session to match the new name and email
			req.session.email = userEmail;
			req.session.name = req.body.name;
			res.send({
				success: true,
			});
		} else {
			//checks if email and username is already taken
			if (hasSameEmail != null && !noEmailChange) {
				res.send({
					success: false,
					error: "Email already taken",
					type: "email",
				});
			} else if (hasSameUsername && !noNameChange) {
				res.send({
					success: false,
					error: "Username already taken",
					type: "name",
				});
			}
		}
	} catch (e) {
		res.send({
			success: "false",
			message: "Failed to update account",
		});
	}
});

/**
 * function to trim the games and get rid of empty filters
 */
function shortingGame(games) {
	let newGames = [];
	if (games != null && Array.isArray(games)) {
		games.forEach((game) => {
			game = game.substring(0, 50).trim();
			if (game != null && game != '') {
				newGames.push(game);
			}
		});
	}
	return newGames;
}

/**
 * Route for submitting an admin request
 */
router.post("/adminPromotion", async function (req, res) {
	const adminReq = new AdminRequest({
		name: req.body.username,
		email: req.body.email,
		reason: req.body.reason,
	});
	if (req.body.reason == null || req.body.reason.trim() == "") {
		res.send({
			success: "false",
			type: "reason",
			reason: "Reason can't be blank"
		});
		return;
	} else if (req.body.reason.length > 5000) {
		res.send({
			success: "false",
			type: "reason",
			reason: "Reason is too long"
		});
		return;
	}
	try {
		//check to see if the email and username match before request is submitted
		let hasSameEmail = await User.findOne({
			email: req.body.email,
		});
		let hasSameUsername = await User.findOne({
			name: req.body.username,
		});
		if (hasSameEmail == null) {
			res.send({
				success: "false",
				type: "email",
				reason: "Email doesn't exist"
			});
		} else if (hasSameUsername == null) {
			res.send({
				success: "false",
				type: "username",
				reason: "Username doesn't exist"
			});
		} else if (hasSameEmail.name != hasSameUsername.name) {
			res.send({
				success: "false",
				type: "username",
				reason: "Username and email don't match"
			});
		} else {
			const newAdminReq = await adminReq.save();
			await User.updateOne({
				email: req.body.email,
			}, {
				$set: {
					promotion: true,
				},
			});
			res.send({
				success: "true",
				reason: "success"
			});
		}
	} catch (err) {
		res.send({
			success: "false",
			reason: "Failed to make request"
		});
	}
});

/**
 * Function for accessing the admin_promotion page
 */
router.get("/promotion", function (req, res) {
	if (req.session.loggedIn == true) {
		res.redirect("/user/profile");
	} else {
		let promotion = fs.readFileSync(
			"./public/html/admin_promotion.html",
			"utf-8"
		);
		res.send(promotion);
	}
});

/**
 * Function for creating a new user from the admin dashboard
 */
router.post(
	"/createAccountAdmin",
	upload.single("pfp"),
	async function (req, res) {
		let userEmail = req.body.email.toLowerCase().trim();
		if (
			(await User.findOne({
				email: req.session.email,
				admin: true,
			})) == null
		) {
			return;
		}
		let url =
			"https://res.cloudinary.com/buddyup-images/image/upload/v1652458876/profile_ek8iwp.png";
		if (req.file != undefined) {
			url = await uploadImage("./public/images/" + req.file.filename, res, url);
		}
		let adminValue;
		if (req.body.admin == "on") {
			adminValue = true;
		} else {
			adminValue = false;
		}
		if (req.body.name.length > 100) {
			res.send({
				success: false,
				error: "Name must be less then 100 characters",
				type: "name",
			});
			return;
		}
		if (req.body.email.length > 100) {
			res.send({
				success: false,
				error: "Email must be less then 100 characters",
				type: "email",
			});
			return;
		}
		if (req.body.about.length > 280) {
			res.send({
				success: false,
				error: "Bio is too long",
				type: "about",
			});
			return;
		}
		const user = new User({
			name: req.body.name.trim(),
			email: userEmail,
			password: req.body.password,
			about: req.body.about,
			admin: adminValue,
			banned: false,
			promotion: false,
			img: url,
		});

		try {
			let hasSameEmail = await User.findOne({
				email: userEmail,
			});
			let hasSameUsername = await User.findOne({
				name: req.body.name,
			});
			if (hasSameEmail == null && hasSameUsername == null) {
				const newUser = await user.save();
				res.send({
					success: true,
				});
			} else {
				if (hasSameEmail != null) {
					res.send({
						success: false,
						error: "Email already taken",
						type: "email",
					});
				} else {
					res.send({
						success: false,
						error: "Username already taken",
						type: "name",
					});
				}
			}
		} catch (err) {
			res.send({
				success: false,
				error: "Failed to update account",
			});
		}
	}
);

/**
 * Function for deleting a new user from the admin dashboard
 */
router.get("/delete/:name", async function (req, res) {
	if (!req.session.loggedIn || req.session.name == req.params["name"]) {
		res.redirect("/user/login");
		return;
	}
	if (
		User.findOne({
			email: req.session.email,
			admin: true,
		}) == null
	) {
		return;
	}
	try {
		await User.deleteOne({
			name: req.params["name"],
		});
		await Timeline.deleteMany({
			author: req.params["name"],
		});
	} catch (error) {
		return;
	}
	res.header(
		"Cache-Control",
		"no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
	);
	res.redirect("/user/admin");
});

/**
 * Function for editing users from the admin dashboard
 */
router.post(
	"/editAccountAdmin",
	upload.single("pfp"),
	async function (req, res) {
		let userEmail = req.body.email.toLowerCase().trim();
		if (
			(await User.findOne({
				email: req.session.email,
				admin: true,
			})) == null
		) {
			return;
		}
		try {
			//get information of the user before they are changed
			let oldUser = await User.findOne({
				name: req.body.oldName,
			});

			let noEmailChange = userEmail === oldUser.email;

			let hasSameEmail = await User.findOne({
				email: userEmail,
			});

			let noNameChange = req.body.name === oldUser.name;

			let hasSameUsername = await User.findOne({
				name: req.body.name,
			});
			//check to make sure email and name aren't already taken
			if (
				(hasSameEmail == null || noEmailChange) &&
				(hasSameUsername == null || noNameChange)
			) {
				//first check if everything is not too long
				if (req.body.name.length > 100) {
					res.send({
						success: false,
						error: "Name must be less then 100 characters",
						type: "name",
					});
					return;
				}
				if (req.body.email.length > 100) {
					res.send({
						success: false,
						error: "Email must be less then 100 characters",
						type: "email",
					});
					return;
				}
				if (req.body.about.length > 280) {
					res.send({
						success: false,
						error: "Bio is too long",
						type: "about",
					});
					return;
				}

				//if there is a new pfp, then upload it
				let url = oldUser.img;

				if (req.file != undefined) {
					url = await uploadImage("./public/images/" + req.file.filename, res, url);
				}

				let adminValue;
				if (req.body.admin == "on") {
					adminValue = true;
					await AdminRequest.deleteOne({
						email: oldUser.email,
					});
				} else {
					//double check to make sure they aren't demoting themselves
					if (oldUser.email != req.session.email) {
						adminValue = false;
					}
				}
				//update their name for the timeline posts
				try {
					await Timeline.updateMany({
						author: oldUser.name,
					}, {
						$set: {
							author: req.body.name.trim(),
						},
					});
				} catch (error) {}
				//check if the user has an admin request
				let userRequest = await AdminRequest.findOne({
					email: oldUser.email,
				});

				await User.updateOne({
					email: oldUser.email,
				}, {
					$set: {
						img: url,
						name: req.body.name.trim(),
						about: req.body.about,
						email: userEmail,
						admin: adminValue,
						promotion: userRequest != null ? true : false,
						password: req.body.password,
					},
				});
				res.send({
					success: true,
				});
			} else {
				if (hasSameEmail != null) {
					res.send({
						success: false,
						error: "Email already taken",
						type: "email",
					});
				} else {
					res.send({
						success: false,
						error: "Name already taken",
						type: "name",
					});
				}
			}
		} catch (e) {
			res.send({
				success: false,
				type: "name",
				error: "Failed to update account",
			});
		}
	}
);

/**
 * Function for uploading images to cloudinary
 * @param {*} path path for the file
 * @param {*} res the response to send if it didn't work
 * @param {*} url the url for the old image
 * @returns url for the new image
 */
async function uploadImage(path, res, url) {
	let upload = await cloudinary.v2.uploader.upload(
		path,
		function (error) {
			if (error) {
				res.send({
					success: false,
					type: "name",
					message: "Failed to upload profile picture",
				});
				//if it didn't work, just return the old one
				return url;
			}
		}
	);
	//delete the image locally when done being uploaded to the cloud
	await fs.unlink(
		path,
		function (err) {}
	);
	return upload.secure_url;
}
 
/**
 * Function for loading the user information for the edit profile modal
 */
router.post(
	"/loadEditModal",
	async function (req, res) {
		if (
			(await User.findOne({
				email: req.session.email,
				admin: true,
			})) == null
		) {
			return;
		}
		try {
			let oldUser = await User.findOne({
				name: req.body.oldName,
			});
			let reasonObj = null;
			try {
				reasonObj = await AdminRequest.findOne({
					name: req.body.oldName,
				});
			} catch (error) {}
			let obj;
			if (oldUser != null) {
				obj = oldUser.toObject();
				if (reasonObj != null) {
					obj.reason = reasonObj.reason;
				} else {
					obj.reason = "";
				}
				res.send(obj);
			} else {
				res.send({
					success: false,
					error: "Error Occured!",
				});
			}
		} catch (e) {
			res.send({
				success: false,
				error: "Failed to update account.",
			});
		}
	}
);

/**
 * redirect the user to the write a post page
 */
router.get("/write", async function (req, res) {
	if (!req.session.loggedIn) {
		res.redirect("/user/login");
	} else {
		let login = fs.readFileSync("./public/html/write-a-post.html", "utf-8");
		res.send(login);
	}
});

/**
 * set up multer for the create a post page, allowing multiple images
 */
var storagePost = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "./public/images/");
	},
	filename: (req, file, cb) => {
		cb(
			null,
			Date.now() +
			Math.floor(Math.random() * 999) +
			path.extname(file.originalname)
		);
	},
});

var uploadPost = multer({
	storage: storagePost,
});

/**
 * Path for creating a post. Allow multiple images to be uploaded. If you upload more then 4, it just won't do anything with them.
 */
router.post(
	"/write",
	uploadPost.array("post-image"),
	async function (req, res) {
		let upload = [];
		//check if the post is too long
		if (req.body.title.length > 200) {
			res.send({
				success: "false",
				message: "Title is too long",
				type: "title",
			});
			return;
		}
		if (req.body.content.length > 10000) {
			res.send({
				success: "false",
				message: "Post is too long",
				type: "post",
			});
			return;
		}
		try {
			try {
				for (let i = 0; i < req.files.length; i++) {
					if (i < 4) {
						//if there are 4 or less images, upload each image
						let image = await cloudinary.v2.uploader.upload(
							"./public/images/" + req.files[i].filename,
							function (error) {}
						);
						upload[i] = image.secure_url;
					}
					//delete local images when done uploading
					fs.unlink(
						"./public/images/" + req.files[i].filename,
						function (err) {}
					);
				}
			} catch (error) {
				res.send({
					success: "false",
					type: "pfp",
					message: "Failed to upload images",
				});
				return;
			}

			const storytimeline = await new Timeline({
				author: req.session.name,
				title: req.body.title,
				post: req.body.content,
				img: upload,
			});

			await storytimeline.save();
			res.send({
				success: "true",
				message: "success",
			});
		} catch (err) {
			res.send({
				success: "false",
				message: "Failed to create a post",
			});
		}
	}
);

/**
 * Route for deleting a post.
 */
router.post("/deletePost", async function (req, res) {
	if (!req.session.loggedIn) {
		res.redirect("/user/login");
	} else {
		let post = await Timeline.findOne({
			_id: req.body.id,
		});
		if (post.author == req.session.name) {
			await Timeline.deleteOne({
				_id: req.body.id,
			});
			res.send("Success");
		}
	}
});

/**
 * Route for editing a post. takes the id and saves it in the html so it can be accessed whenever
 */
router.get("/editPost/:id", async function (req, res) {
	var postID = req.params["id"];
	if (!req.session.loggedIn) {
		res.redirect("/user/login");
	} else {
		let post = await Timeline.findOne({
			_id: postID,
		});
		if (post.author == req.session.name) {
			let edit = fs.readFileSync("./public/html/edit-a-post.html", "utf-8");
			let editDOM = new JSDOM(edit);
			editDOM.window.document.getElementById("postID").innerHTML =
				post._id.valueOf();
			editDOM.window.document.getElementById("postID").style.display = "none";
			res.send(editDOM.serialize());
		}
	}
});

/**
 * get a post to load it to the edit page
 */
router.post("/getPost", async function (req, res) {
	if (!req.session.loggedIn) {
		res.redirect("/user/login");
	} else {
		let post = await Timeline.findOne({
			_id: req.body.id,
		});
		if (post.author == req.session.name) {
			res.send(post);
		}
	}
});

/**
 * route for submitting a post that was edited
 */
router.post(
	"/editPost",
	uploadPost.array("post-image"),
	async function (req, res) {
		let post = await Timeline.findOne({
			_id: req.body.id,
		});
		//make sure its not too long
		if (req.body.title.length > 200) {
			res.send({
				success: "false",
				message: "Title is too long",
				type: "title",
			});
			return;
		}
		if (req.body.content.length > 10000) {
			res.send({
				success: "false",
				message: "Post is too long",
				type: "post",
			});
			return;
		}
		let upload = post.img;
		if (post.author == req.session.name) {
			try {
				try {
					for (let i = 0; i < req.files.length; i++) {
						if (i < 4) {
							//upload new images if there are any
							let image = await cloudinary.v2.uploader.upload(
								"./public/images/" + req.files[i].filename,
								function (error) {}
							);
							upload[i] = image.secure_url;
						}
						fs.unlink(
							"./public/images/" + req.files[i].filename,
							function (err) {}
						);
					}
				} catch (error) {
					res.send({
						success: "false",
						type: "image",
						message: "Failed to upload images",
					});
					return;
				}

				await Timeline.updateMany({
					_id: req.body.id,
				}, {
					$set: {
						title: req.body.title,
						post: req.body.content,
						img: upload,
					},
				});

				res.send({
					success: "true",
					message: "success",
				});
			} catch (err) {
				res.send({
					success: "false",
					message: "Failed to create a post",
				});
			}
		} else {
			res.send({
				success: "false",
				message: "Failed to create a post (bad id)",
			});
		}
	}
);

module.exports = router;