import wixWindow from 'wix-window';
import wixUsers from 'wix-users';
import wixLocation from 'wix-location';
import {
	bravobeneLogin
}
from 'public/bravobene-login.js';

$w.onReady(function () {
	// clean up the birthdate (converge to age)
	let birthdate = $w("#dynamicDataset").getCurrentItem().birthdate;
	var ageDifMs = Date.now() - new Date(birthdate).getTime();
	var ageDate = new Date(ageDifMs); // miliseconds from epoch
	var age = Math.abs(ageDate.getUTCFullYear() - 1970);
	$w("#text68").text = age + " Jahre";
	
	// properly set the languages string
	var languages = [];
	if ($w("#dynamicDataset").getCurrentItem().lanDe) {
		languages.push("Deutsch");
	}
	if ($w("#dynamicDataset").getCurrentItem().lanEn) {
		languages.push("English");
	}
	if ($w("#dynamicDataset").getCurrentItem().lanFr) {
		languages.push("Französisch");
	}
	if ($w("#dynamicDataset").getCurrentItem().lanIt) {
		languages.push("Italienisch");
	}
	if ($w("#dynamicDataset").getCurrentItem().lanOther != undefined) {
		languages.push($w("#dynamicDataset").getCurrentItem().lanOther);
	}

	var languagesString = "";
	for (var i = 0; i < languages.length; i++) {
		languagesString = languagesString + languages[i];
		if (i < languages.length - 1) {
			languagesString = languagesString + ", ";
		}

	}
	
	// zip city
	var zipCity = "";
	if ($w("#dynamicDataset").getCurrentItem().zip !== null) {
		zipCity = $w("#dynamicDataset").getCurrentItem().zip + " ";
	}
	if ($w("#dynamicDataset").getCurrentItem().city !== null) {
		zipCity = zipCity + $w("#dynamicDataset").getCurrentItem().city;
	}
	$w("#text70").text = zipCity;
	
	// stundensatz & tagessatz
	if ($w("#dynamicDataset").getCurrentItem().hourlyRate !== undefined){
		$w("#text76").text = "CHF " + $w("#dynamicDataset").getCurrentItem().hourlyRate + ".-";
	} else {
		$w("#text76").text = "-";
	}
	if ($w("#dynamicDataset").getCurrentItem().dailyRate !== undefined){
		$w("#text79").text = "CHF " + $w("#dynamicDataset").getCurrentItem().dailyRate + ".-";
	} else {
		$w("#text79").text = "-";
	}

	/*
	 * The skills
	 */
	if ($w("#dynamicDataset").getCurrentItem().skillsHasKids) {
		$w("#imageSkillsKids").show();
	}
	if ($w("#dynamicDataset").getCurrentItem().skillsHelpsWithHomework) {
		$w("#imageSkillsHomework").show();
	}
	if ($w("#dynamicDataset").getCurrentItem().skillsHelpsWithHousehold) {
		$w("#imageSkillsHousehold").show();
	}
	if ($w("#dynamicDataset").getCurrentItem().skillsLovesPets) {
		$w("#imageSkillsPets").show();
	}
	if ($w("#dynamicDataset").getCurrentItem().skillsHasDriversLicense) {
		$w("#imageSkillsLicense").show();
	}
	if ($w("#dynamicDataset").getCurrentItem().skillsHasCar) {
		$w("#imageSkillsCar").show();
	}

	// some default rescue - can be later deleted
	if (languagesString === "") {
		languagesString = "Deutsch"
	}
	$w("#languages").text = languagesString;

});

export function contactButton_click(event, $w) {
	if (!wixUsers.currentUser.loggedIn) {
		// there is no user logged in -> prompt login
		bravobeneLogin.loginUser()
			.then((results) => {
				wixLocation.to(wixLocation.url);
			});
	} else {
		// get the sender email
		wixUsers.currentUser.getEmail()
			.then((email) => {
				let recipient = $w("#dynamicDataset").getCurrentItem();
				const context = {
					"senderEmail": email,
					"senderId": wixUsers.currentUser.id,
					"recipientEmail": recipient.email,
					"recipientName": recipient.firstName,
					"recipientId": recipient._id
				};

				wixWindow.openLightbox("Send a message", context);
				//	.then((res) => {
				//		console.log("res from lightbox");
				//	});
			})
	}

}

export function becomeCaregiverButton_click(event, $w) {
	// call the public function
	bravobeneLogin.becomeCaregiver();
}
