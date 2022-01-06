import {
	getLatLong
}
from 'backend/geoCode';
import {
	bravobeneKitaHandler
}
from 'public/bravobene-kitaHandling.js';
import wixLocation from 'wix-location';
import wixUsers from 'wix-users';
import {
	bravobeneLogin
}
from 'public/bravobene-login.js';

$w.onReady(function () {
	//TODO: write your page related code here...
	//$w("#googleMaps1").location = "Davos Dorf";

	// zip and city
	$w("#text70").text = $w("#dynamicDataset").getCurrentItem().zip + " " + $w("#dynamicDataset").getCurrentItem().city;

	// image
	// work on the image
	if ($w("#dynamicDataset").getCurrentItem().picture !== null && typeof $w("#dynamicDataset").getCurrentItem().picture !== 'undefined') {
		$w("#image11").src = $w("#dynamicDataset").getCurrentItem().picture;
	}

	/*
	 * The categories and their icons
	 */
	if ($w("#dynamicDataset").getCurrentItem().tageskindergarten) {
		$w("#kindergarten").show();
	}
	if ($w("#dynamicDataset").getCurrentItem().krippe) {
		$w("#krippe").show();
	}
	if ($w("#dynamicDataset").getCurrentItem().hort) {
		$w("#hort").show();
	}
	if ($w("#dynamicDataset").getCurrentItem().mittagstisch) {
		$w("#mittagstisch").show();
	}
	if ($w("#dynamicDataset").getCurrentItem().saeuglingsplatz) {
		$w("#saeuglingsplatz").show();
	}
	if ($w("#dynamicDataset").getCurrentItem().zweisprachig) {
		$w("#zweisprachig").show();
	}
	if ($w("#dynamicDataset").getCurrentItem().geschwisterrabatt) {
		$w("#geschwisterrabatt").show();
	}
	if ($w("#dynamicDataset").getCurrentItem().subventioniert) {
		$w("#subventioniert").show();
	}

	// var 
	var address = "";
	if ($w("#dynamicDataset").getCurrentItem().street !== undefined) {
		address = $w("#dynamicDataset").getCurrentItem().street + " " + $w("#dynamicDataset").getCurrentItem().zip + ", Schweiz";
	} else {
		address = $w("#dynamicDataset").getCurrentItem().zip + ", Schweiz";
	}

	address = address.replace('ö', 'oe').replace('ä', 'ae').replace('ü', 'ue');

	getLatLong(address).then(latlong => {
			// console.log(latlong);
			$w("#googleMaps1").location = {
				"latitude": latlong.lat,
				"longitude": latlong.long,
				"description": $w("#dynamicDataset").getCurrentItem().name
			};

		})
		.catch(error => {
			console.log(error);
		});

	/**
	 * let us handle the reviews
	 */
	$w("#reviewRepeater").onItemReady(($w, itemData, index) => {
		$w("#title").text = itemData.reviewTitle;
		$w("#comment").text = itemData.comment;
		var fromAndWhen = "";
		if (itemData.reviewer !== undefined) {
			fromAndWhen = itemData.reviewer + ", ";
		}
		$w("#reviewDate").text = fromAndWhen + new Date(itemData._createdDate).getDate() + "." + (new Date(itemData._createdDate).getMonth() + 1) + "." + new Date(itemData._createdDate).getFullYear();
		// $w("#image44").src = itemData.photo_1;

		showReviewRating($w, itemData.rating);

		console.log(itemData);
		if (wixLocation.query.review) {
			console.log("yep, review");
			//$w("#ratingStrip").expand();
			
		}
	});
	bravobeneKitaHandler.getKitaReviewsById($w("#dynamicDataset").getCurrentItem()._id).then(r => {
		// console.log("yeahf uga");
		console.log(r);
		if (r !== undefined){
			// yes, we have reviews
			$w("#reviewRepeater").data = r;
			$w("#noReviewsYet").collapse();
			$w("#ratingStrip").expand();
		} else {
			
		}
	});

	// get the right link for the button
	$w("#writeReviewButton").link = "/kitareview?kita=" + $w("#dynamicDataset").getCurrentItem()._id;
	//$w("#writeReviewButton").onClick(async (event, $w) => {
		// wixLocation.to("/kitareview?kita=" + $w("#dynamicDataset").getCurrentItem()._id);
	//});
	
	// the facebook share button
	// if (wixLocation.query.fb === "true"){
		//$w("#fbShareButton").postMessage("https://www.bravobene.com/k/Kinderstube-Oerlikon");
		//$w("#fbShareButton").show();
	// }

});

/** 
 * this function handles the rating clicks
 */
function showReviewRating($w, rating) {
	var ratingHands = [$w("#rating1"), $w("#rating2"), $w("#rating3"), $w("#rating4"), $w("#rating5")];
	var ratingBlackHands = [$w("#ratingBlack1"), $w("#ratingBlack2"), $w("#ratingBlack3"), $w("#ratingBlack4"), $w("#ratingBlack5")];
	// cleanup
	for (var i = 0; i < ratingHands.length; i++) {
		ratingHands[i].hide();
	}

	// set correct one
	for (var j = 0; j < rating; j++) {
		ratingHands[j].show();
	}
};
