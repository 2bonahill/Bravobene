// Filename: public/MessagingModule.js 
//
// Code written in public files is shared by your site's
// Backend, page code, and site code environments.
import wixData from 'wix-data';
import wixWindow from 'wix-window';
import {
	sendMessageReceivedEmail
}
from 'backend/email';
import {
	bravobeneUsers
}
from 'public/bravobene-users.js';

export let bravobeneMessenger = {

	/**
	 * This function is to send a message
	 * @param senderId
	 * @param senderName
	 * @param senderEmail
	 * @param recipientId
	 * @param recipientName
	 * @param recipientEmail
	 * @param message
	 * 
	 */
	sendMessage: async function (senderId, senderName, senderEmail, recipientId, recipientName, recipientEmail, message) {
		return new Promise((resolve, reject) => {

			/*
			 * Insert the new messasge in the message DB		
			 */
			let toInsert = {
				"senderId": senderId,
				"senderEmail": senderEmail,
				"recipientId": recipientId,
				"recipientEmail": recipientEmail,
				"message": message,
				"read": false
			};

			console.log("about to insert:");
			console.log(toInsert);

			wixData.insert("Messages", toInsert)
				.then((results) => {
					console.log(results);
					/*
					 * now we send out the confirmation mail using sendgrid
					 */
					console.log("jetzt wäre cool, eine mail zu senden");
					console.log(senderEmail + ", " + senderName + ", " + recipientName + ", " + recipientEmail + ", " + message);
					sendConfirmationMail(senderName, senderEmail, recipientName, recipientEmail, message)
								.then((r) => {
									console.log("back from sendConfirmation mail");
									resolve(r);
								});

				})
				.catch((err) => {
					let errorMsg = err;
				});

		});

	},

}; // end of bravobeneMessenger

/**
 * This function is to send out a confirmation mail using sendgrid
 */
function sendConfirmationMail(senderName, senderEmail, recipientName, recipientEmail, message) {
	console.log("okay, let us send the confirmation mail now:");
	console.log(senderEmail + ", " + senderName + ", " + recipientName + ", " + recipientEmail + ", " + message);
	return new Promise((resolve, reject) => {
		sendMessageReceivedEmail(senderName, senderEmail, recipientName, recipientEmail, message)
			.then((response) => {
				wixWindow.openLightbox("Message sent", "")
					.then((r) => {
						console.log(r);
						resolve(r);
					});
			});
	});
}
