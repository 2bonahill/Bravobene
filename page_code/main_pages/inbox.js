import wixWindow from 'wix-window';
import wixUsers from 'wix-users';
import wixData from 'wix-data';
import wixLocation from 'wix-location';
import {
	bravobeneUsers
}
from 'public/bravobene-users.js';

$w.onReady(function () {

	// wixWindow.openLightbox("Loading", "");

	/*
	 * Let us populate the repater. we get the data from the extract conversations function
	 */
	var repeaterData = [];
	$w("#repeater1").onItemReady(async ($w, itemData, index) => {
		var profilePicture = await bravobeneUsers.getProfilePictureForUser(itemData.conversationPartnerId);
		// var firstName = await bravobeneUsers.getFirstNameForUser(itemData.conversationPartnerId);
		
		if (profilePicture !== undefined){
			$w("#image11").src = profilePicture;
		}
		// cd.senderEmail.substr(0,cd.senderEmail.indexOf("@"))
		$w("#contact").text = itemData.conversationPartnerEmail.substr(0,itemData.conversationPartnerEmail.indexOf("@")); // firstName;
		$w("#dateLastMessage").text = itemData.dateLastMessage;
		if (itemData.message.length > 450) {
			$w("#lastMessage").text = itemData.message.replace(/(\r\n\t|\n|\r\t)/gm,"").substring(0, 450) + "...";
		} else {
			$w("#lastMessage").text = itemData.message;
		}
		
		$w("#button34").onClick((event, $w) => {
			var urlToDirectTo = wixLocation.baseUrl + "conversation/?cp=" + itemData.conversationPartnerId;
			console.log(urlToDirectTo);
			wixLocation.to(urlToDirectTo);
		});
		
		//if ($w("#loadingBox").isVisible) {
		//	console.log("hide");
		//	$w("#loadingBox").hide();
		//}
		if (!$w("#repeater1").isVisible) {
			$w("#repeater1").show();
		}
		
	});

	var currentUserId = wixUsers.currentUser.id
		// console.log(wixUsers.currentUser.id);
	wixData.query("Messages")
		.eq("senderId", currentUserId)
		.or(wixData.query("Messages")
			.eq("recipientId", currentUserId))
		.descending("_createdDate", )
		.find()
		.then((results) => {
			var conversations = extractConversations(results.items, currentUserId);
			conversations.forEach((item) => {
				// get the profile picture
				repeaterData.push({
					"_id": item._id,
					"message": item.message,
					"conversationPartnerId": item.conversationPartnerId,
					"conversationPartnerEmail": item.conversationPartnerEmail,
					"dateLastMessage": "Letzte Nachricht am: " + new Date(item._createdDate).getDate() + "." + (new Date(item._createdDate).getMonth()+1) + "." + new Date(item._createdDate).getFullYear()
				});
			});
			$w("#repeater1").data = repeaterData;
		});

});

/**
 * This function is to retrieve converstations out of all messages in the db
 * related to the logged in user
 * 
 * What we know:
 * - every item in messages has either recipient or sender set to the logged in user
 * - the list is ordered by time desc (latest messages on top)
 * 
 * So, how does the algorithm work?
 * - we loop through the list
 * ---- for every new line, we extract the name involved in the converstation (where id != current user id)
 * ---- is this name already in the converstations return array? if yes, do nothing, if no, add name + message + date ...
 */
function extractConversations(messages, currentUserId) {
	var conversations = [];
	var conversationsPartnerIdLoopkup = {};
	
	messages.forEach(function (message) {
		// find the 'other' partner
		var conversationPartnerId = "";
		var conversationPartnerEmail = "";
		if (message.recipientId !== currentUserId) {
			conversationPartnerId = message.recipientId;
			conversationPartnerEmail = message.recipientEmail;
		} else {
			conversationPartnerId = message.senderId;
			conversationPartnerEmail = message.senderEmail;
		}

		// let us check whether this conversationPartnerId is already in our conversations return array
		if (conversationsPartnerIdLoopkup[conversationPartnerId] !== true) {
			// this is a new conversation partner. add this one to the conversations return array 
			// TODO: do not push the whole message, we need to clean it up a bit (e.g. just one partner)
			message.conversationPartnerId = conversationPartnerId;
			message.conversationPartnerEmail = conversationPartnerEmail;

			conversations.push(message);

			// mark this partner as covered (we just want one entry in the inbox per partner)
			conversationsPartnerIdLoopkup[conversationPartnerId] = true;
		}

	});
	return conversations;
}
