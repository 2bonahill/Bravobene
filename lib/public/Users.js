import wixData from 'wix-data';
import wixUsers from 'wix-users';
import {
	bravobeneLogger
}
from 'public/bravobene-logging.js';

export let bravobeneUsers = {

	/**
	 * This function inserts a user into the user db
	 * @param userId
	 * @param userEmail
	 */
	insertUserIfNotExists: function (userId) {
		return new Promise((resolve, reject) => {
			wixData.query("User")
				.eq("_id", userId)
				.find()
				.then((results) => {
					if (results.items.length === 0) {
						/*
						 * This is a new user
						 */
						wixUsers.currentUser.getEmail()
							.then((userEmail) => {
								const newUser2Insert = {
									"_id": userId,
									"eMail": userEmail,
									"lastSeen": new Date(),
									"title": userEmail.substring(0, userEmail.indexOf("@")) + Math.floor(Math.random() * 10000)
								};

								// add new user to the collection
								wixData.insert("User", newUser2Insert)
									.then((results) => {
										resolve(results);
									})
									.catch((e) => {
										bravobeneLogger.throwError("public/bravobene-users.js > insertUserIfNotExists()", e, 1, "Failed to insert new user");
										reject(e);
									});
							});
					} else {
						/*
						 * This is a recurring user. Let us set a timestamp :-)
						 */
						var currentUser = results.items[0];
						currentUser.lastSeen = new Date();
						wixData.update("User", currentUser)
							.catch(e => {
								bravobeneLogger.throwError("public/bravobene-users.js > insertUserIfNotExists()", e, 1, "Failed to update -last seen- for recurring user");
							});
						resolve(currentUser);
					}
				});
		});
	},

	/**
	 * This function flags a user as a caregiver in the User DB
	 * @param userId This is the id of the user to be flagged as a caregiver in the db
	 */
	markUserAsCaregiver: function (userId) {
		return new Promise((resolve, reject) => {
			wixData.query("User")
				.eq("_id", userId)
				.find()
				.then((result) => {
					var user = result.items[0];
					if (!user.isCaregiver) {
						user.isCaregiver = true;
						// add new caregiver to the collection
						wixData.update("User", user)
							.then((results) => {
								console.log("done - a new caregiver is born");
								resolve(results);
							})
							.catch((err) => {
								console.log(err);
								reject(err);
							});
					}
				});
		});
	},

	/**
	 * This function is to reactivate an old bravobene 2.0 caregiver
	 */
	migrateOldCaregiver: function (newUserId, userEmail) {
		return new Promise((resolve, reject) => {
			var oldCaregiverEntry = {};
			// get the old entry from the caregiver db
			wixData.query("Caregivers")
				.eq("email", userEmail)
				.find()
				.then((result) => {
					if (result.items.length > 0) {
						oldCaregiverEntry = result.items[0];
						let newCaregiverEntry = oldCaregiverEntry; // this newCaregiverEntry has still the old ID from the CSV update
						let oldID = oldCaregiverEntry._id; // store this id before we reset it
						console.log("hi from the very beginning of migrateoldcaregiver. this is what we get from oldCaregiverEntry");
						console.log(oldCaregiverEntry);
						// set the correct id and title
						newCaregiverEntry._id = newUserId; // this is the corrent user id (wix site member id)
						var newUserTitle = userEmail.substring(0, userEmail.indexOf("@")) + Math.floor(Math.random() * 10000); // as a start value, we take the email as title
						newCaregiverEntry.title = newUserTitle;
						newCaregiverEntry.bbVersion = 3; // this is the version code for the new 3.0 wix 2018 bravobene

						// add new caregiver to the collection
						wixData.insert("Caregivers", newCaregiverEntry)
							.then((results) => {
								// to be sure, make user a caregiver in the USER DB
								this.markUserAsCaregiver(newUserId)
									.then((r) => {
										// we are almost set. the new caregiver is in the db and we have flagged the user as a caregiver in the USER DB.
										// now let us now deactivate the old entry
										let oldCaregiverEntry = newCaregiverEntry;
										oldCaregiverEntry._id = oldID;
										oldCaregiverEntry.disabled = true;
										oldCaregiverEntry.bbVersion = 2;
										oldCaregiverEntry.title = "";
										oldCaregiverEntry.email = "";
										wixData.update("Caregivers", oldCaregiverEntry)
											.then((results) => {
												var resolveObject = {
													"role": "caregiver",
													"title": newUserTitle,
													"email": userEmail,
													"loginScenario": 3,
													"info": "LOGIN: This is a returning bravobene caregiver - we are all set. ID: " + newUserId + ". EMail: " + newCaregiverEntry.email
												};

												resolve(resolveObject);

											}).catch((err) => {
												console.log("Error from bravobeneUsers.migrateOldCaregiver:");
												console.log(err);
												reject(err);
											});
									});

							})
							.catch((err) => {
								console.log("Konnte den alten Caregiver nicht migrieren");
								console.log(err);
							});
					}
				});

		});
	},

	/**
	 * DEPRECATED! DO NOT USE -> USE getFirstNameById instead
	 * 
	 * This funtion gets the first name for a given user id. 
	 * @return name
	 * @return undefined if nothing found
	 */
	getFirstNameForUser: function (userId) {
		return new Promise(async (resolve, reject) => {
			// let us first check the caregiver db
			var q = await wixData.query("Caregivers").eq("_id", userId).find();
			if (q.items.length === 0) {
				// nothing found in caregiver db. let us check the user db
				q = await wixData.query("User").eq("_id", userId).find();
			}
			if (q.items.length > 0) {
				resolve(q.items[0].firstName);
			} else {
				resolve();
			};
		});
	},

	/**
	 * This funtion gets the first name for a given user id. 
	 * @return name
	 * @return undefined if nothing found
	 */
	getFirstNameById: async function (userId) {
		// let us first check the caregiver db
		var q = await wixData.query("Caregivers").eq("_id", userId).find();
		if (q.items.length === 0) {
			// nothing found in caregiver db. let us check the user db
			q = await wixData.query("User").eq("_id", userId).find();
		}
		if (q.items.length > 0) {
			return q.items[0].firstName;
		}
	},

	/**
	 * This funtion gets the last name for a given user id. 
	 * @return name
	 * @return undefined if nothing found
	 */
	getLastNameById: function (userId) {
		return new Promise(async (resolve, reject) => {
			// let us first check the caregiver db
			var q = await wixData.query("Caregivers").eq("_id", userId).find();
			if (q.items.length === 0) {
				// nothing found in caregiver db. let us check the user db
				q = await wixData.query("User").eq("_id", userId).find();
			}
			if (q.items.length > 0) {
				resolve(q.items[0].lastName);
			} else {
				resolve();
			};
		});
	},

	/**
	 * This funtion gets the email address for a given user id. 
	 * @return name
	 * @return undefined if nothing found
	 */
	getEmailForUser: async function (userId) {
		var q = await wixData.query("Caregivers").eq("_id", userId).find();
		console.log("from caregivers db for user Id: " + userId);
		console.log(q);
		if (q.items.length === 0) {
			// nothing found in caregiver db. let us check the user db
			q = await wixData.query("User").eq("_id", userId).find();
			console.log("from User db");
			console.log(q);
		}
		if (q.items.length > 0) {
			console.log("gonna return something");
			return q.items[0].eMail;
		}
	},

	/**
	 * DEPRECATED! DO NOT USE. USE getLastNameById instead
	 * 
	 * This funtion gets the last name for a given user id. 
	 * @return name
	 * @return undefined if nothing found
	 */
	getLastNameForUser: function (userId) {
		return new Promise(async (resolve, reject) => {
			// let us first check the caregiver db
			var q = await wixData.query("Caregivers").eq("_id", userId).find();
			if (q.items.length === 0) {
				// nothing found in caregiver db. let us check the user db
				q = await wixData.query("User").eq("_id", userId).find();
			}
			if (q.items.length > 0) {
				resolve(q.items[0].lastName);
			} else {
				resolve();
			};
		});
	},

	/**
	 * This funtion gets the profile picture for given user id. 
	 * @returns src of profile picture if exists
	 * @returns undefined if no picgture exists
	 */
	getProfilePictureForUser: function (userId) {
		return new Promise(async (resolve, reject) => {
			// let us first check the caregiver db
			var q = await wixData.query("Caregivers").eq("_id", userId).find();
			if (q.items.length === 0) {
				// nothing found in caregiver db. let us check the user db
				q = await wixData.query("User").eq("_id", userId).find();
			}
			if (q.items.length > 0) {
				resolve(q.items[0].profilePicture);
			} else {
				resolve();
			};
		});
	},

	/**
	 * Get the current user (anchors around wixUsers.currentUser.id and provides additional information)
	 */
	currentUser: {
		/**
		 * This funtion gets the name of the user
		 */
		getFirstName: async function () {
			// let us first check the caregiver db
			try {
				var q = await wixData.query("Caregivers").eq("_id", wixUsers.currentUser.id).find();
				if (q.items.length === 0) {
					// nothing found in caregiver db. let us check the user db
					q = await wixData.query("User").eq("_id", wixUsers.currentUser.id).find();
				}
				if (q.items.length > 0) {
					return q.items[0].firstName;
				}
			} catch (error) {
				console.log(error);
				throw new Error(error);
			}
		},
		getLastName: async function () {
			// let us first check the caregiver db
			try {
				var q = await wixData.query("Caregivers").eq("_id", wixUsers.currentUser.id).find();
				if (q.items.length === 0) {
					// nothing found in caregiver db. let us check the user db
					q = await wixData.query("User").eq("_id", wixUsers.currentUser.id).find();
				}
				if (q.items.length > 0) {
					return q.items[0].lastName;
				}
			} catch (error) {
				console.log(error);
				throw new Error(error);
			}
		},

		/**
		 * Set firstName and lastName of user
		 * @param <String> firstName
		 * @param <String> lastName
		 * @returns <User> updated User 
		 */
		setName: async function (firstName, lastName) {
			wixData.query("User")
				.eq("_id", wixUsers.currentUser.id)
				.find()
				.then((res) => {
					var user = res.items[0];
					user.firstName = firstName;
					user.lastName = lastName;
					wixData.update("User", user)
						.then(updatedUser => {
							return updatedUser;
						});
				})
				.catch((err) => {
					throw Error(err);
				});
		},

		/**
		 * This funtion returns the title of the current user
		 */
		getTitle: function () {
			return new Promise((resolve, reject) => {
				wixData.query("Caregivers")
					.eq("_id", wixUsers.currentUser.id)
					.find()
					.then((res) => {
						// just for safety reasons:
						bravobeneUsers.markUserAsCaregiver(wixUsers.currentUser.id);
						resolve(res.items[0].title);
					})
					.catch((err) => {
						reject(err);
					});
			});
		},

		/**
		 * Get the role of the current user
		 * @returns <Promise> containing role of the current user. "caregiver" or "user"
		 */
		getRole: async function () {
			try {
				var q = await wixData.query("Caregivers").eq("_id", wixUsers.currentUser.id).find();
				if (q.items.length > 0) {
					return "caregiver";
				}
				return "user";
			} catch (error) {
				console.log(error);
				throw new Error(error);
			}
		},
		getRoleAndCheckIfReturningCaregiver: function () {
			return new Promise((resolve, reject) => {
				wixData.query("Caregivers")
					.eq("_id", wixUsers.currentUser.id)
					.find()
					.then((res) => {
						if (res.items.length > 0) {
							// to be sure, mark current user as caregiver
							bravobeneUsers.markUserAsCaregiver(wixUsers.currentUser.id);
							resolve("caregiver");
						} else {
							// let us check whether we have the user email in the old db?
							wixUsers.currentUser.getEmail()
								.then((email) => {
									wixData.query("Caregivers")
										.eq("email", email)
										.find()
										.then((r) => {
											if (r.items.length > 0) {
												// this is an old returning caregiver from the bravobene 2.0 world (daniel & nuno)
												resolve("old_caregiver");
											} else {
												resolve("user");
											}
										})
										.catch((e) => {
											console.log("mr burns says hello");
											console.log(e);
										});
								});
						}
					})
					.catch((err) => {
						reject(err);
					});
			});
		},

		/**
		 * Make the current user a caregiver
		 */
		makeCaregiver: function () {
			return new Promise((resolve, reject) => {
				var currentUserId = wixUsers.currentUser.id;
				var newCaregiver2Insert = {};
				var currentUserEmail;
				var currentUserTitle;
				wixUsers.currentUser.getEmail()
					.then((email) => {
						currentUserEmail = email;
						currentUserTitle = currentUserEmail.substring(0, currentUserEmail.indexOf("@")) + Math.floor(Math.random() * 10000);
						newCaregiver2Insert = {
							"_id": currentUserId,
							"email": currentUserEmail,
							"title": currentUserTitle,
							"bbVersion": 3
						};
						// add new caregiver to the collection
						return wixData.insert("Caregivers", newCaregiver2Insert);
					})
					.then(() => {
						return bravobeneUsers.markUserAsCaregiver(currentUserId);
					})
					.then(() => {
						resolve(newCaregiver2Insert);
					})
					.catch((err) => {
						console.log(err);
						reject(err);
					});

			});
		},
	},

};
