import wixUsers from 'wix-users';
import {
	bravobeneKitaHandler
}
from 'public/bravobene-kitaHandling.js';
import wixLocation from 'wix-location';
import wixWindow from 'wix-window';
import {
	bravobeneUsers
}
from 'public/bravobene-users.js';

/*
 * bravobeneKitaHandler.createKitaReview($w("#dynamicDataset").getCurrentItem()._id).then(res => {
			wixLocation.to("/kitaReview?" + $w("#dynamicDataset").getCurrentItem()._id);
		});	  
 */

var currentKitaReview = {};
var currentKita = {};

$w.onReady(async function () {
	/*
	 * get all the infos regarding the current Kita
	 */
	currentKita = await bravobeneKitaHandler.getKitaById(wixLocation.query.kita);
	if (currentKita.name !== undefined) {
		$w("#text66").text = currentKita.name;
	}
	if (currentKita.picture !== undefined) {
		$w("#image11").src = currentKita.picture;
	}
	if (currentKita.street !== undefined) {
		$w("#text89").text = currentKita.street;
	}
	if (currentKita.zip !== undefined) {
		$w("#text70").text = currentKita.zip;
	}
	if (currentKita.city !== undefined) {
		$w("#text70").text = $w("#text70").text + " " + currentKita.city;
	}
	if (currentKita.phone !== undefined) {
		$w("#text87").text = currentKita.phone;
	}
	if (currentKita.homepage !== undefined) {
		$w("#text85").text = currentKita.homepage;
	}
	if (currentKita.ageRagen !== undefined) {
		$w("#text83").text = currentKita.ageRange;
	}

	/*
	 * add handlers to the form input fields
	 */
	$w("#reviewer").onChange((event, $w) => {
		currentKitaReview.reviewer = event.target.value;
	});
	$w("#reviewTitle").onChange((event, $w) => {
		currentKitaReview.reviewTitle = event.target.value;
	});
	$w("#reviewComment").onChange((event, $w) => {
		currentKitaReview.comment = event.target.value;
	});
	
	/**
	$w("#uploadProfilePictureButton").onChange((event, $w) => {
		// start the picture upload
		$w("#uploadProfilePictureButton").startUpload()
			.then((uploadedFile) => {
				let url = uploadedFile.url;
				currentKitaReview.photo_1 = url;
				$w("#profilePicture").src = url;
			})
			.catch((uploadError) => {
				let errCode = uploadError.errorCode; // 7751
				let errDesc = uploadError.errorDescription; // "Error description"
			});
	});
	*/

	/*
	 * let us check whether we have already a review of this user for this kita
	 */
	bravobeneKitaHandler.getKitaReviewsByReviewerandKita(currentKita._id, wixUsers.currentUser.id).then(r => {
		if (r !== undefined) {
			// there is already a review from the current user for this kita
			currentKitaReview = r[0];
			// set proper rating
			handleRatingClick(currentKitaReview.rating);

			// refill the form
			$w("#reviewer").value = currentKitaReview.reviewer;
			$w("#reviewTitle").value = currentKitaReview.reviewTitle;
			$w("#reviewComment").value = currentKitaReview.comment;
			currentKitaReview.photo_1 = currentKitaReview.photo_1;
			// $w("#profilePicture").src = currentKitaReview.photo_1;

		} else {
			// this is going to be a new user kita review
			currentKitaReview.kita = currentKita._id;
			currentKitaReview.reviewerId = wixUsers.currentUser.id;

			// maybe there is a name to be prefilled?
			bravobeneUsers.getFirstNameById(wixUsers.currentUser.id).then(firstName => {
				if (firstName !== undefined) {
					$w("#reviewer").value = firstName;
					currentKitaReview.reviewer = firstName;
				}
			});

		}
	});
});

/**
 * This function is to submit the form
 */
export function submitButton_click(event, $w) {
	bravobeneKitaHandler.insertOrUpdateKitaReview(currentKitaReview).
	then(r => {
		currentKitaReview = r;
		// say thank you
		wixWindow.openLightbox("Danke die Bewertung")
			.then((res) => {
				// console.log("res from lightbox");
				wixLocation.to("/k/"+currentKita.title);
			});
	});
}

/** 
 * this function handles the rating clicks
 */
function handleRatingClick(rating) {
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

	// store the rating in the db
	currentKitaReview.rating = rating;
	// console.log(currentKitaReview);
	currentKitaReview.rating = rating;
}
export function rating1_click(event, $w) {
	handleRatingClick(1);
}

export function rating2_click(event, $w) {
	handleRatingClick(2);
}

export function rating3_click(event, $w) {
	handleRatingClick(3);
}

export function rating4_click(event, $w) {
	handleRatingClick(4);
}

export function rating5_click(event, $w) {
	handleRatingClick(5);
}

export function ratingBlack1_click(event, $w) {
	handleRatingClick(1);
}

export function ratingBlack2_click(event, $w) {
	handleRatingClick(2);
}

export function ratingBlack3_click(event, $w) {
	handleRatingClick(3);
}

export function ratingBlack4_click(event, $w) {
	handleRatingClick(4);
}

export function ratingBlack5_click(event, $w) {
	handleRatingClick(5);
}
