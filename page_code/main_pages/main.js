// For full API documentation, including code examples, visit http://wix.to/94BuAAs
import wixLocation from 'wix-location';
import {
	bravobeneLogin
}
from 'public/bravobene-login.js';
import {
	translate, getCurrentLanguage
}
from 'public/TranslationModule.js';


$w.onReady(function () {
	handleTranslations();

});

export function becomeCaregiverButton_click(event, $w) {
	// call the public function
	bravobeneLogin.becomeCaregiver();
}

function handleTranslations() {
	// okay, let's handle translations
	if (getCurrentLanguage() === "DE") {
		console.log("nix zu tun für translation");
		return false;
	}

	var currentLanguage = getCurrentLanguage();
	var currentPage = wixLocation.prefix;
	translate($w("#text8"), "HOME_TITLE", currentPage, currentLanguage);
	translate($w("#text9"), "HOME_SUBTITLE", currentPage, currentLanguage);
	translate($w("#button31"), "HOME_FIND_CAREGIVERS", currentPage, currentLanguage);
	translate($w("#text11"), "HOME_BECOME_CAREGIVER_TEASER", currentPage, currentLanguage);
	translate($w("#becomeCaregiverButton"), "HOME_BECOME_CAREGIVER_BUTTON", currentPage, currentLanguage);
	
	// translate($w("#text12"), "HOME_FIND_KITAS_TEASER", currentPage, currentLanguage);
	translate($w("#button32"), "HOME_FIND_KITAS_BUTTON", currentPage, currentLanguage);
	
	translate($w("#text10"), "HOME_SRK_TESTIMONIAL", currentPage, currentLanguage);
}
