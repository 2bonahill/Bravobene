import wixUsers from 'wix-users';
import wixCRM from 'wix-crm';
import wixData from 'wix-data';
import wixLocation from 'wix-location';
import wixWindow from 'wix-window';
import {
	bravobeneMessenger
}
from 'public/bravobene-messaging.js';
import {
	bravobeneUsers
}
from 'public/bravobene-users.js';

// store the conversation details
var conversationPartnerId; // id of the conversation partner extracted from the URL parameter
var cd = {
	senderId: "",
	senderEmail: "",
	recipientId: "",
	recipientEmail: ""
};

$w.onReady(async function () {

	// get the two relevat ids
	conversationPartnerId = wixLocation.query.cp;

	// let us set the conversation title
	bravobeneUsers.getFirstNameForUser(conversationPartnerId).then(name => {
		if (name !== undefined && wixWindow.formFactor !== "Mobile") {
			$w("#text26").text = "Nachrichten mit " + name;
		}
	});

	$w("#repeater1").onItemReady(async ($w, itemData, index) => {

		if (itemData.senderId === wixUsers.currentUser.id) {
			/*
			 * This message was sent from the logged in user
			 * show it on the RIGHT side
			 */

			// let us prep the 
			$w("#currentUserMessage").show();

			$w("#cpMessage").hide();
			if (wixWindow.formFactor !== "Mobile") {
				$w("#currentUserImage").show();
				$w("#cpImage").hide();
				$w("#currentUserMessageDate").show();
				$w("#cpMessageDate").hide();
				$w("#cpBubbleBox").hide();
				$w("#currentUserBubbleBox").show();
				$w("#currentUserMessageDate").text = new Date(itemData._createdDate).getDate() + "." + (new Date(itemData._createdDate).getMonth() + 1) + "." + new Date(itemData._createdDate).getFullYear();
			}

			$w("#currentUserMessage").text = itemData.message;

			// following function is async
			bravobeneUsers.getProfilePictureForUser(itemData.currentUserId)
				.then(pp => {
					if (pp !== undefined) {
						// $w("#currentUserImage").src = pp;
					}
				});

		} else {
			/*
			 * This message was sent from the cppartner in user.
			 * Current user is the recipient
			 * Show it on the LEFT side (yes, like in WhatsApp: the conversation partner is always left)
			 */

			$w("#cpMessage").show();
			$w("#currentUserMessage").hide();
			if (wixWindow.formFactor !== "Mobile") {
				$w("#cpImage").show();
				$w("#currentUserImage").hide();
				$w("#currentUserMessageDate").hide();
				$w("#cpMessageDate").show();
				$w("#currentUserBubbleBox").hide();
				$w("#cpBubbleBox").show();
				$w("#cpMessageDate").text = new Date(itemData._createdDate).getDate() + "." + (new Date(itemData._createdDate).getMonth() + 1) + "." + new Date(itemData._createdDate).getFullYear();
			}

			$w("#cpMessage").text = itemData.message;

			// following function is async
			bravobeneUsers.getProfilePictureForUser(itemData.conversationPartnerId)
				.then(pp => {
					if (pp !== undefined) {
						//$w("#cpImage").src = pp;
					}
				});

		}

		//if ($w("#loadingBox").isVisible) {
		//	$w("#loadingBox").hide();
		//}

	});

	wixData.query("Messages")
		.eq("senderId", wixUsers.currentUser.id)
		.eq("recipientId", conversationPartnerId)
		.or(wixData.query("Messages")
			.eq("recipientId", wixUsers.currentUser.id)
			.eq("senderId", conversationPartnerId))
		.descending("_createdDate", )
		.find()
		.then((results) => {
			// extract the corret coversation details from the very first message sent between the two parties
			extractConversationDetails(results.items[results.items.length - 1]);
			$w("#repeater1").data = results.items;
		});

});

export function extractConversationDetails(veryFirstMessage) {
	if (veryFirstMessage.senderId === wixUsers.currentUser.id) {
		// the very first message has been sent by the currently logged in user
		cd.senderId = wixUsers.currentUser.id;
		cd.senderEmail = veryFirstMessage.senderEmail;
		cd.recipientId = conversationPartnerId;
		cd.recipientEmail = veryFirstMessage.recipientEmail;
	} else {
		// the very first message has been sent by the conversation partner
		cd.senderId = wixUsers.currentUser.id;
		cd.senderEmail = veryFirstMessage.recipientEmail;
		cd.recipientId = conversationPartnerId;
		cd.recipientEmail = veryFirstMessage.senderEmail;
	}
}

export async function sendNewMessageButton_click(event, $w) {
	bravobeneMessenger.sendMessage(
			wixUsers.currentUser.id, // id of the sender
			cd.senderEmail.substr(0, cd.senderEmail.indexOf("@")), // name of the sender (we take the string before the @)
			cd.senderEmail, // email address of the sender
			cd.recipientId, // id of the recipient
			"", // name of the recipient
			cd.recipientEmail, // email of the recipient
			$w("#newMessage").value) // message
		.then((r) => {
			wixLocation.to(wixLocation.url);
		});
}
