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
				author: currentUser.name
			});
		} catch (error) {
			return;
		}

		let stories = '';
		for (let i = 0; i < allPosts.length; i++) {
			stories += '<div id="story" class="rounded-3 py-1 px-3 my-3">' +
				'<h4 id="story-title" class="mt-2 mb-0">' +
				allPosts[i].title +
				'</h4><p id="story-body" class="mb-3">' +
				allPosts[i].post +
				'</p><div id="story-img-container" class="mb-3"><div class="row"><div class="col-12">';
			if (allPosts[i].img != null) {
				stories += '<div class="card"><div class="card-img"><img src=' + allPosts[i].img + ' alt="" id="story-img" class="card-img"/></div></div>';
			}
			stories += '</div></div></div></div>';
		}
		profileDOM.window.document.getElementById("lg-stories-container").innerHTML += stories;
		profileDOM.window.document.getElementById("stories-container").innerHTML += stories;
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
							//const userTable = createTable(result, tableToInsert);
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
router.post("/adminSearch", function (req, res) {
	res.setHeader("Content-Type", "application/json");
	let searchOptions = {};
	if (req.body.input != null || req.body.input != "") {
		searchOptions.name = new RegExp(req.body.input, "i");
	}
	try {
		User.find(searchOptions, function (err, result) {
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
router.post("/adminFilter", function (req, res) {
	res.setHeader("Content-Type", "application/json");
	let searchOptions = {};
	if (req.body.input != null) {
		searchOptions.admin = req.body.input;
	}
	try {
		User.find(searchOptions, function (err, result) {
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
router.post("/promotionFilter", function (req, res) {
	res.setHeader("Content-Type", "application/json");
	let searchOptions = {};
	if (req.body.input != null) {
		searchOptions.promotion = req.body.input;
	}
	try {
		User.find(searchOptions, function (err, result) {
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

router.post("/banUser", function (req, res) {
	res.setHeader("Content-Type", "application/json");
});

router.post("/login", function (req, res) {
	let currentUser;
	try {
		currentUser = User.findOne({
			email: req.body.email,
		});
	} catch (error) {
		return;
	}
	currentUser.then((result) => {
		if (result == null) {
			res.send({
				success: "false",
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
				// res.redirect("/user/profile");
			} else {
				res.send({
					success: "false",
					message: "incorrect password",
				});
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
		let register = fs.readFileSync("./public/html/register.html", "utf-8");
		res.send(register);
	}
});

var multer = require("multer");

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
	try {
		let hasSameEmail = await User.findOne({
			email: req.body.email,
		});
		let hasSameUsername = await User.findOne({
			name: req.body.name,
		});
		if (hasSameEmail == null && hasSameUsername == null) {
			let url = "/images/profile.png";
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
				await fs.unlink("./public/images/" + req.file.filename, function (err) {
					if (err) {
						console.log("Failed to remove old image");
					}
				});
				url = upload.secure_url;
			}
			const user = new User({
				name: req.body.name,
				email: req.body.email,
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
			let msg = "";
			if (hasSameEmail != null) {
				msg = "Email already exists!";
			} else {
				msg = "Username already exists!";
			}
			res.send({
				success: "false",
				message: msg,
			});
		}
	} catch (err) {
		console.log(err);
		res.send({
			success: "false",
			message: "failed to create account",
		});
	}
});

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

// updates the users information after editing and then redirects them back to their profile page
router.post("/edit/submit", upload.single("image"), async function (req, res) {
	try {
		let noEmailChange = req.body.email === req.session.email;

		let hasSameEmail = await User.findOne({
			email: req.body.email,
		});

		let noNameChange = req.body.name === req.session.name;

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
				await fs.unlink("./public/images/" + req.file.filename, function (err) {
					if (err) {
						console.log("Failed to remove old image");
					}
				});
				url = upload.secure_url;
			}
			if (url != null) {
				await User.updateOne({
					email: req.session.email
				}, {
					$set: {
						img: url,
						name: req.body.name,
						about: req.body.about,
						email: req.body.email,
						password: req.body.password,
					},
				});
			} else {
				await User.updateOne({
					email: req.session.email
				}, {
					$set: {
						name: req.body.name,
						about: req.body.about,
						email: req.body.email,
						password: req.body.password,
					},
				});
			}
			res.send({
				success: true,
			});
		} else {
			let msg = "";
			if (hasSameEmail != null) {
				msg = "Email already exists!";
			} else {
				msg = "Username already exists!";
			}
			res.send({
				success: false,
				error: msg,
			});
		}
	} catch (e) {
		res.send({
			success: false,
			error: "failed to update account. Error: " + e,
		});
	}
});

module.exports = router;

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

router.post(
	"/adminPromotion",
	upload.single("image"),
	async function (req, res) {
		const adminReq = new AdminRequest({
			name: req.body.name,
			email: req.body.email,
			reason: req.body.reason,
		});

		let login = fs.readFileSync("./public/html/admin_promotion.html", "utf-8");
		let adminPromotionDOM = new JSDOM(login);

		try {
			let hasSameEmail = await User.findOne({
				email: req.body.email,
			});
			let hasSameUsername = await User.findOne({
				name: req.body.name
			});
			if (hasSameEmail == null && hasSameUsername == null) {
				let msg = "";
				if (hasSameEmail == null) {
					msg = "Email does not exists!";
				} else {
					msg = "Username does not exists!";
				}
				adminPromotionDOM.window.document.getElementById("errorMsg").innerHTML =
					msg;
				res.send(adminPromotionDOM.serialize());
			} else {
				const newAdminReq = await adminReq.save();
				await User.updateOne({
					email: req.body.email,
				}, {
					$set: {
						promotion: true
					},
				});
				res.redirect("/user/login");
			}
		} catch (err) {
			adminPromotionDOM.window.document.getElementById("errorMsg").innerHTML =
				"Failed to make a request";
			res.send(adminPromotionDOM.serialize());
		}
	}
);

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
		let url = "/images/profile.png";
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
			await fs.unlink("./public/images/" + req.file.filename, function (err) {
				if (err) {
					console.log("Failed to remove old image");
				}
			});
			url = upload.secure_url;
		}
		const user = new User({
			name: req.body.name,
			email: req.body.email,
			password: req.body.password,
			about: req.body.about,
			admin: false,
			banned: false,
			promotion: false,
			img: url,
		});

		let login = fs.readFileSync("./public/html/admin.html", "utf-8");
		let loginDOM = new JSDOM(login);

		try {
			let hasSameEmail = await User.findOne({
				email: req.body.email,
			});
			let hasSameUsername = await User.findOne({
				name: req.body.name
			});
			if (hasSameEmail == null && hasSameUsername == null) {
				const newUser = await user.save();
				res.send({
					success: true,
				});
			} else {
				let msg = "";
				if (hasSameEmail != null) {
					msg = "Email already exists!";
				} else {
					msg = "Username already exists!";
				}
				res.send({
					success: false,
					error: msg,
				});
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
	}
	try {
		await User.deleteOne({
			name: req.params["name"]
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
		try {
			let oldUser = await User.findOne({
				name: req.body.oldName,
			});

			let noEmailChange = req.body.email === oldUser.email;

			let hasSameEmail = await User.findOne({
				email: req.body.email,
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
						function (err) {
							if (err) {
								console.log("Failed to remove old image");
							}
						}
					);
					url = upload.secure_url;
				}
				if (url != null) {
					await User.updateOne({
						email: oldUser.email
					}, {
						$set: {
							img: url,
							name: req.body.name,
							about: req.body.about,
							email: req.body.email,
							password: req.body.password,
						},
					});
				} else {
					await User.updateOne({
						email: oldUser.email
					}, {
						$set: {
							name: req.body.name,
							about: req.body.about,
							email: req.body.email,
							password: req.body.password,
						},
					});
				}
				res.send({
					success: true,
				});
			} else {
				let msg = "";
				if (hasSameEmail != null) {
					msg = "Email already exists!";
				} else {
					msg = "Username already exists!";
				}
				res.send({
					success: false,
					error: msg,
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

router.post(
	"/loadEditModal",
	upload.single("image"),
	async function (req, res) {
		try {
			let oldUser = await User.findOne({
				name: req.body.oldName,
			});

			if (oldUser != null) {
				res.send(oldUser);
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
		cb(null, Date.now() + path.extname(file.originalname));
	},
});

var uploadPost = multer({
	storage: storagePost,
});

router.post("/write", uploadPost.single("post-image"), async function (req, res) {
	let upload = null;
	try {
		try {
			upload = await cloudinary.v2.uploader.upload("./public/images/" + req.file.filename,
				function (error) {

				})
			await fs.unlink("./public/images/" + req.file.filename, function (err) {

			});
		} catch (error) {
			console.log(error)
		}

		const storytimeline = await new Timeline({
			author: req.session.name,
			title: req.body.title,
			post: req.body.content,
			img: upload.url
		});

		await storytimeline.save();
		res.send({
			success: "true",
			message: "failed to upload profile picture"
		});
	} catch (err) {
		res.send({
			success: "false",
			message: "failed to create a post"
		});
		console.log(err);
	}
});

module.exports = router;