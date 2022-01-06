// Filename: public/UserManagementModule.js 
//
// Code written in public files is shared by your site's
// Backend, page code, and site code environments.
//
// Use public files to hold utility functions that can 
// be called from multiple locations in your site's code.

import wixUsers from 'wix-users';
import wixWindow from 'wix-window';
import wixLocation from 'wix-location';
import {
	bravobeneUsers
}
from 'public/bravobene-users.js';
import {
	bravobeneLogger
}
from 'public/bravobene-logging.js';

export let bravobeneLogin = {
	/**
	 * Start the login process
	 */
	loginUser: function () {
		return new Promise((resolve, reject) => {
			let userId;
			let userEmail;
			wixUsers.promptLogin({
					"mode": "login",
					"lang": "de"
				})
				.then((user) => {
					userId = user.id;
					// insert this user in thd User DB (just if no duplicates are found)
					return bravobeneUsers.insertUserIfNotExists(userId);
				})
				.then(() => {
					return bravobeneUsers.currentUser.getRoleAndCheckIfReturningCaregiver();
				}).then((role) => {
					console.log("getRoleAndCheckIfReturningCaregiver():");
					console.log(role);
					if (role === "user") {
						/*
						 * We have a simple user
						 */
						resolve({
							"role": role
						});

					} else if (role === "caregiver") {
						/*
						 * We have a caregiver
						 */
						resolve({
							"role": role
						});
					} else if (role === "old_caregiver") {
						/*
						 * THIS IS A RETURNING CAREGIVER FROM THE OLD BRAVOBENE 2.0 (Nuno & Daniel) PLATFORM.
						 * 
						 * 1) Create a copy of the existing entry
						 * 2) Insert this guy (with new and correct visitor ID!! into the DB)
						 * 3) delete the old entry
						 */
						wixUsers.currentUser.getEmail().then(userEmail => {
							bravobeneUsers.migrateOldCaregiver(userId, userEmail)
								.then((res) => {
									// console.log("back from migrateOldCaregiver(userId, userEmail)");
									resolve({
										"role": role
									});
								});
						});

					}

				})
				.catch((e) => {
					bravobeneLogger.throwError("public/bravobene-login.js > loginUser()", e, 1, "Failed to log in user");
					reject(e);
				});
		});
	},

	/**
	 * Start process for becoming a caregiver
	 */
	becomeCaregiver: async function () {
		// Let us check whether the user is logged in
		if (!wixUsers.currentUser.loggedIn) {
			var loginResult = await bravobeneLogin.loginUser();
		}

		// get the role of the currently logged in user
		// it is either "user" or "caregiver"
		var role = await bravobeneUsers.currentUser.getRole();
		if (role === "user") {
			// we have a user who wants to become a caregiver
			var lightBoxContext = {
				// "email": currentUserEmail
			}
			wixWindow.openLightbox("Become a caregiver", lightBoxContext)
				.then((result) => {
					/*
					 * User has agreed to become a caregiver
					 * > Create the entry in the caregiver DB
					 * > Redirect the new born caregiver to his profile page
					 */
					console.log("okay, user ist einverstanden");

					// make currrent user a caregiver
					return bravobeneUsers.currentUser.makeCaregiver();
				})
				.then((newCaregiver) => {
					wixLocation.to("/c/update/" + newCaregiver.title);
				});
		}
	}
}
