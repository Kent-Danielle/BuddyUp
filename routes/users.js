"use strict";

var cloudinary = require("cloudinary");
cloudinary.config({
	cloud_name: "buddyup-images",
	api_key: "673686844465421",
	api_secret: "cxk0wwxInP62OzGTo26z2TZSnDU",
});

const express = require("express");
const router = express.Router();
const User = require("../models/user");
const AdminRequest = require("../models/admin-request");
const Timeline = require("../models/user-timeline");
const ChatUser = require("../models/chat-user.js");
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
		let currentUser;
		let isAdmin;
		try {
			currentUser = await User.findOne({
				email: req.session.email,
			});
			isAdmin = await User.findOne({
				email: req.session.email,
				admin: true,
			});
		} catch (error) {
			return;
		}
		if (profileName == "self") {
			if (isAdmin) {
				res.redirect("/user/admin");
				return;
			}
		} else {
			try {
				if (isAdmin) {
					currentUser = await User.findOne({
						name: profileName,
					});
				} else {
					res.redirect("/user/profile/self");
					return;
				}
			} catch (error) {
				return;
			}
		}

		await ChatUser.updateOne({
			name: req.session.name
		}, {
			$set: {
				last_match: null,
				finding: false,
				matched: false
			}
		});

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

		let allPosts;
		try {
			allPosts = await Timeline.find({
				author: currentUser.name,
			});
		} catch (error) {
			return;
		}
		let dateOptions = {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "numeric",
			minute: "numeric",
		};
		let stories = "";
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
		//profileDOM.window.document.getElementById("stories-container").innerHTML += stories;
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

router.get("/admin", function (req, res) {
	if (req.session.loggedIn) {
		try {
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
 * Function for searching in the dashboard
 */
router.post("/adminSearch", async function (req, res) {
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
	if (req.body.input != null || req.body.input != "") {
		searchOptions.name = new RegExp(req.body.input, "i");
	}
	try {
		await User.find(searchOptions, function (err, result) {
			if (err) {
				res.send("Error finding users!");
			} else {
				let tableDiv = "";
				for (let i = 0; i < result.length; i++) {
					tableDiv += tableHTMLBuilder(result[i], i);
				}
				if (tableDiv == "") {
					res.send("no results");
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
 * Function for filtering admins in the dashboard
 */
router.post("/adminFilter", async function (req, res) {
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
		searchOptions.admin = req.body.input;
	}
	try {
		await User.find(searchOptions, function (err, result) {
			if (err) {
				res.send("Error finding users!");
			} else {
				let tableDiv = "";
				for (let i = 0; i < result.length; i++) {
					tableDiv += tableHTMLBuilder(result[i], i);
				}
				if (tableDiv == "") {
					res.send("no results");
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
 * Function for filtering admin candidates in the dashboard
 */
router.post("/promotionFilter", async function (req, res) {
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
		searchOptions.promotion = req.body.input;
	}
	try {
		await User.find(searchOptions, function (err, result) {
			if (err) {
				res.send("Error finding users!");
			} else {
				let tableDiv = "";
				for (let i = 0; i < result.length; i++) {
					tableDiv += tableHTMLBuilder(result[i], i);
				}
				if (tableDiv == "") {
					res.send("no results");
				} else {
					res.send(tableDiv);
				}
			}
		});
	} catch (error) {
		return;
	}
});


router.post("/login", function (req, res) {
	let currentUser;
	let userEmail = req.body.email.toLowerCase();
	try {
		currentUser = User.findOne({
			email: userEmail,
		});
		currentUser.then((result) => {
			if (result == null) {
				res.send({
					success: "false",
					type: "email",
					message: "account not found",
				});
			} else {
				if (result.password == req.body.password) {
					req.session.loggedIn = true;
					req.session.email = result.email;
					req.session.name = result.name;
					res.send({
						success: "true",
						message: "logged in.",
					});
				} else {
					res.send({
						success: "false",
						type: "password",
						message: "incorrect password",
					});
				}
			}
		});
	} catch (error) {
		res.send({
			success: "false",
			message: "login error",
		});
	}
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
		let register = fs.readFileSync("./public/html/register.html", "utf-8");
		res.send(register);
	}
});

var multer = require("multer");
const {
	findOne
} = require("../models/user");
const user = require("../models/user");

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

router.post("/createAccount", upload.single("pfp"), async function (req, res) {
	let userEmail = req.body.email.toLowerCase();
	try {
		let hasSameEmail = await User.findOne({
			email: userEmail,
		});
		let hasSameUsername = await User.findOne({
			name: req.body.name,
		});
		if (hasSameEmail == null && hasSameUsername == null) {
			let url =
				"https://res.cloudinary.com/buddyup-images/image/upload/v1652458876/profile_ek8iwp.png";
			if (req.file != undefined) {
				let upload = await cloudinary.v2.uploader.upload(
					"./public/images/" + req.file.filename,
					function (error) {
						if (error) {
							res.send({
								success: "false",
								message: "failed to upload profile picture",
							});
							return;
						}
					}
				);
				await fs.unlink(
					"./public/images/" + req.file.filename,
					function (err) {}
				);
				url = upload.secure_url;
			}
			if (req.body.name.length > 100) {
				res.send({
					success: "false",
					message: "name must be less then 100 characters",
					type: "name",
				});
				return;
			}
			if (req.body.email.length > 100) {
				res.send({
					success: "false",
					message: "email must be less then 100 characters",
					type: "email",
				});
				return;
			}
			if (req.body.about.length > 280) {
				res.send({
					success: "false",
					message: "bio is too long",
					type: "about",
				});
				return;
			}
			const user = new User({
				name: req.body.name,
				email: userEmail,
				password: req.body.password,
				about: req.body.about,
				admin: false,
				banned: false,
				promotion: false,
				img: url,
			});
			const newUser = await user.save();
			res.send({
				success: "true",
				message: "created account",
			});
		} else {
			if (hasSameEmail != null) {
				res.send({
					success: "false",
					message: "email already taken",
					type: "email",
				});
			} else {
				res.send({
					success: "false",
					message: "username already taken",
					type: "name",
				});
			}
		}
	} catch (err) {
		res.send({
			success: "false",
			message: "failed to create account",
		});
	}
});

router.get("/logout", async function (req, res) {
	if (req.session) {
		let user = await ChatUser.findOne({
			name: req.session.name
		});

		if (user != null) {
			if (!user.finding && !user.matched) {
				await ChatUser.deleteMany({
					name: req.session.name
				});
			}
		}

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

// redirects the user to the edit profile page
router.get("/edit", function (req, res) {
	if (req.session.loggedIn == true) {
		let profileEdit = fs.readFileSync("./public/html/profile_edit.html");
		let profileEditDOM = new JSDOM(profileEdit);

		res.send(profileEditDOM.serialize());
	} else {
		res.redirect("/user/login");
	}
});

// sends the logged in user's information over to the client side
router.get("/info", async function (req, res) {
	try {
		let currentUser = await User.findOne({
			email: req.session.email,
		});
		res.send(currentUser);
	} catch (error) {
		return;
	}
});

// returns if the user is logged in or not
router.get("/logged-in", function(req, res) {
	const loggedIn = req.body.loggedIn;
	console.log(loggedIn);
	console.log("test");
});

// updates the users information after editing and then redirects them back to their profile page
router.post("/edit/submit", upload.single("image"), async function (req, res) {
	try {
		let userEmail = req.body.email.toLowerCase();
		let filters = req.body.filters;
		if (filters != " " && filters != "") {
			filters = req.body.filters.split(",");
		} else {
			filters = null;
		}

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
			if (req.body.name.length > 100) {
				res.send({
					success: false,
					message: "name must be less then 100 characters",
					type: "name",
				});
				return;
			}
			if (req.body.email.length > 100) {
				res.send({
					success: false,
					message: "email must be less then 100 characters",
					type: "email",
				});
				return;
			}
			if (req.body.about.length > 280) {
				res.send({
					success: false,
					message: "bio is too long",
					type: "about",
				});
				return;
			}
			let url;
			if (req.file != undefined) {
				let upload = await cloudinary.v2.uploader.upload(
					"./public/images/" + req.file.filename,
					function (error) {
						if (error) {
							res.send({
								success: false,
								message: "failed to upload profile picture",
							});
							return;
						}
					}
				);
				await fs.unlink(
					"./public/images/" + req.file.filename,
					function (err) {}
				);
				url = upload.secure_url;
			}

			try {
				await Timeline.updateMany({
					author: req.session.name,
				}, {
					$set: {
						author: req.body.name,
					},
				});
			} catch (error) {
				//add log here
			}

			if (url != null) {
				await User.updateOne({
					email: req.session.email,
				}, {
					$set: {
						img: url,
						name: req.body.name,
						about: req.body.about,
						email: userEmail,
						password: req.body.password,
						games: filters,
					},
				});
			} else {
				await User.updateOne({
					email: req.session.email,
				}, {
					$set: {
						name: req.body.name,
						about: req.body.about,
						email: userEmail,
						password: req.body.password,
						games: filters,
					},
				});
			}
			req.session.email = userEmail;
			req.session.name = req.body.name;
			res.send({
				success: true,
			});
		} else {
			if (hasSameEmail != null && !noEmailChange) {
				res.send({
					success: false,
					error: "email already taken",
					type: "email",
				});
			} else if (hasSameUsername && !noNameChange) {
				res.send({
					success: false,
					error: "username already taken",
					type: "name",
				});
			}
		}
	} catch (e) {
		res.send({
			success: "false",
			message: "failed to update account. Error: " + e,
		});
	}
});

module.exports = router;

router.post("/adminPromotion", async function (req, res) {
	const adminReq = new AdminRequest({
		name: req.body.username,
		email: req.body.email,
		reason: req.body.reason,
	});
	if(req.body.reason == null || req.body.reason.trim() == ""){
		res.send({
			success: "false",
			type: "reason",
			reason: "reason can't be blank"
		});
		return;
	} else if (req.body.reason.length > 5000){
		res.send({
			success: "false",
			type: "reason",
			reason: "reason is too long"
		});
		return;
	}
	try {
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
				reason: "email doesn't exist"
			});
		} else if (hasSameUsername == null) {
			res.send({
				success: "false",
				type: "username",
				reason: "username doesn't exist"
			});
		} else if (hasSameEmail.name != hasSameUsername.name) {
			res.send({
				success: "false",
				type: "username",
				reason: "username and email don't match"
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
			reason: "failed to make request"
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
		let userEmail = req.body.email.toLowerCase();
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
			let upload = await cloudinary.v2.uploader.upload(
				"./public/images/" + req.file.filename,
				function (error) {
					if (error) {
						res.send({
							success: "false",
							message: "failed to upload profile picture",
						});
						return;
					}
				}
			);
			await fs.unlink(
				"./public/images/" + req.file.filename,
				function (err) {}
			);
			url = upload.secure_url;
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
				error: "name must be less then 100 characters",
				type: "name",
			});
			return;
		}
		if (req.body.email.length > 100) {
			res.send({
				success: false,
				error: "email must be less then 100 characters",
				type: "email",
			});
			return;
		}
		if (req.body.about.length > 280) {
			res.send({
				success: false,
				error: "bio is too long",
				type: "about",
			});
			return;
		}
		const user = new User({
			name: req.body.name,
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
						error: "email already taken",
						type: "email",
					});
				} else {
					res.send({
						success: false,
						error: "username already taken",
						type: "name",
					});
				}
			}
		} catch (err) {
			res.send({
				success: false,
				error: "failed to update account. Error: " + e,
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
 * Function for creating a new user from the admin dashboard
 */
router.post(
	"/editAccountAdmin",
	upload.single("pfp"),
	async function (req, res) {
		let userEmail = req.body.email.toLowerCase();
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

			let noEmailChange = userEmail === oldUser.email;

			let hasSameEmail = await User.findOne({
				email: userEmail,
			});

			let noNameChange = req.body.name === oldUser.name;

			let hasSameUsername = await User.findOne({
				name: req.body.name,
			});

			if (
				(hasSameEmail == null || noEmailChange) &&
				(hasSameUsername == null || noNameChange)
			) {
				let url;
				if (req.file != undefined) {
					let upload = await cloudinary.v2.uploader.upload(
						"./public/images/" + req.file.filename,
						function (error) {
							if (error) {
								res.send({
									success: false,
									message: "failed to upload profile picture",
								});
								return;
							}
						}
					);
					await fs.unlink(
						"./public/images/" + req.file.filename,
						function (err) {}
					);
					url = upload.secure_url;
				}

				let adminValue;
				if (req.body.admin == "on") {
					adminValue = true;
					await AdminRequest.deleteOne({
						email: oldUser.email,
					});
				} else {
					if (oldUser.email != req.session.email) {
						adminValue = false;
					}
				}
				try {
					await Timeline.updateMany({
						author: oldUser.name,
					}, {
						$set: {
							author: req.body.name,
						},
					});
				} catch (error) {
					//add log here
				}
				//check if the user has an admin request
				let userRequest = await AdminRequest.findOne({
					email: oldUser.email,
				});

				if (req.body.name.length > 100) {
					res.send({
						success: false,
						error: "name must be less then 100 characters",
						type: "name",
					});
					return;
				}
				if (req.body.email.length > 100) {
					res.send({
						success: false,
						error: "email must be less then 100 characters",
						type: "email",
					});
					return;
				}
				if (req.body.about.length > 280) {
					res.send({
						success: false,
						error: "bio is too long",
						type: "about",
					});
					return;
				}
				if (url != null) {
					await User.updateOne({
						email: oldUser.email,
					}, {
						$set: {
							img: url,
							name: req.body.name,
							about: req.body.about,
							email: userEmail,
							admin: adminValue,
							promotion: userRequest != null ? true : false,
							password: req.body.password,
						},
					});
				} else {
					await User.updateOne({
						email: oldUser.email,
					}, {
						$set: {
							name: req.body.name,
							about: req.body.about,
							email: userEmail,
							admin: adminValue,
							promotion: userRequest != null ? true : false,
							password: req.body.password,
						},
					});
				}
				res.send({
					success: true,
				});
			} else {
				if (hasSameEmail != null) {
					res.send({
						success: false,
						error: "email already taken",
						type: "email",
					});
				} else {
					res.send({
						success: false,
						error: "name already taken",
						type: "name",
					});
				}
			}
		} catch (e) {
			res.send({
				success: false,
				error: "failed to update account. Error: " + e,
			});
		}
	}
);

router.post(
	"/loadEditModal",
	upload.single("image"),
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
				error: "failed to update account. Error: " + e,
			});
		}
	}
);
router.get("/write", async function (req, res) {
	if (!req.session.loggedIn) {
		res.redirect("/user/login");
	} else {
		let login = fs.readFileSync("./public/html/write-a-post.html", "utf-8");
		res.send(login);
	}
});

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

router.post(
	"/write",
	uploadPost.array("post-image"),
	async function (req, res) {
		let upload = [];
		if (req.body.title.length > 200) {
			res.send({
				success: "false",
				message: "title is too long",
				type: "title",
			});
			return;
		}
		if (req.body.content.length > 10000) {
			res.send({
				success: "false",
				message: "post is too long",
				type: "post",
			});
			return;
		}
		try {
			try {
				for (let i = 0; i < req.files.length; i++) {
					if (i < 4) {
						let image = await cloudinary.v2.uploader.upload(
							"./public/images/" + req.files[i].filename,
							function (error) {}
						);
						upload[i] = image.secure_url;
					}
					await fs.unlink(
						"./public/images/" + req.files[i].filename,
						function (err) {}
					);
				}
			} catch (error) {
				res.send({
					success: "false",
					type: "pfp",
					message: "failed to upload profile picture",
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
				message: "failed to upload profile picture",
			});
		} catch (err) {
			res.send({
				success: "false",
				message: "failed to create a post",
			});
		}
	}
);

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

router.post(
	"/editPost",
	uploadPost.array("post-image"),
	async function (req, res) {
		let post = await Timeline.findOne({
			_id: req.body.id,
		});
		if (req.body.title.length > 200) {
			res.send({
				success: "false",
				message: "title is too long",
				type: "title",
			});
			return;
		}
		if (req.body.content.length > 10000) {
			res.send({
				success: "false",
				message: "post is too long",
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
							let image = await cloudinary.v2.uploader.upload(
								"./public/images/" + req.files[i].filename,
								function (error) {}
							);
							upload[i] = image.secure_url;
						}
						await fs.unlink(
							"./public/images/" + req.files[i].filename,
							function (err) {}
						);
					}
				} catch (error) {
					res.send({
						success: "false",
						type: "pfp",
						message: "failed to upload profile picture; error: " + error,
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
					message: "failed to upload profile picture",
				});
			} catch (err) {
				res.send({
					success: "false",
					message: "failed to create a post",
				});
			}
		} else {
			res.send({
				success: "false",
				message: "failed to create a post (bad id)",
			});
		}
	}
);

module.exports = router;