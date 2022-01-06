// Filename: public/TranslationModule.js 
//
// Code written in public files is shared by your site's
// Backend, page code, and site code environments.
//
// Use public files to hold utility functions that can 
// be called from multiple locations in your site's code.

import wixLocation from 'wix-location';
import {
	homeTranslations
}
from 'public/translations/home.js';
import {
	caregiverTranslations
}
from 'public/translations/caregivers.js';
import {
	topMenuTranslations
}
from 'public/translations/topMenu.js';

export let bravobeneTranslator = {

	/**
	 * Function to translate what we get :-)
	 */
	translate: function (viewElement, key, sourcePage, targetLanguage) {
		/*
		 * get the right dictionary
		 */
		var dictionary = {};
		if (sourcePage === undefined) {
			// this is the home page
			dictionary = homeTranslations;
		} else if (sourcePage === "c") {
			dictionary = caregiverTranslations;
		} else if (sourcePage === "topMenu") {
			dictionary = topMenuTranslations;
		}

		var translation = dictionary[key][targetLanguage];

		if (translation !== "") {
			/*
			 * okay, we have a proper translation. 
			 * Now let us find out what type of UI element we have ($w.Button or $w.Text or ...)
			 * and set the property respectively
			 */
			if (viewElement.type === "$w.Text") {
				viewElement.text = translation;
			} else if (viewElement.type === "$w.Button") {
				viewElement.label = translation;
			} else if (viewElement.type === "$w.TextInput") {
				viewElement.placeholder = translation;
			} else if (viewElement.type === "$w.Dropdown") {
				viewElement.placeholder = translation;
			}
		}
	},

	/**
	 * This function is to get the current language
	 * @returns <String> Locale
	 */
	getCurrentLanguage: function () {
		// is there a language change request via url? e.g. /c/?locale=EN
		var locale = wixLocation.query.locale;
		if (locale === undefined || (locale !== "DE" && locale !== "EN" && locale !== "FR" && locale !== "IT")) {
			// let us check the langauge set in the URL. we need to be very sure that no one can inject something
			locale = "DE"; // reset to default: german

		}
		return locale;
	}
};


/*
 * ************************************************************
 * ************************************************************
 * OLD VERSIONS - DO NOT USE ANYMORE
 * ************************************************************
 * ************************************************************
 */
export function translate(viewElement, key, sourcePage, targetLanguage) {
	/*
	 * get the right dictionary
	 */
	var dictionary = {};
	if (sourcePage === undefined) {
		// this is the home page
		dictionary = homeTranslations;
	} else if (sourcePage === "c") {
		dictionary = caregiverTranslations;
	} else if (sourcePage === "topMenu") {
		dictionary = topMenuTranslations;
	}

	var translation = dictionary[key][targetLanguage];

	if (translation !== "") {
		/*
		 * okay, we have a proper translation. 
		 * Now let us find out what type of UI element we have ($w.Button or $w.Text or ...)
		 * and set the property respectively
		 */
		if (viewElement.type === "$w.Text") {
			viewElement.text = translation;
		} else if (viewElement.type === "$w.Button") {
			viewElement.label = translation;
		} else if (viewElement.type === "$w.TextInput") {
			viewElement.placeholder = translation;
		} else if (viewElement.type === "$w.Dropdown") {
			viewElement.placeholder = translation;
		}
	}
}

export function getCurrentLanguage() {
	// is there a language change request via url? e.g. /c/?locale=EN
	var locale = wixLocation.query.locale;
	if (locale === undefined || (locale !== "DE" && locale !== "EN" && locale !== "FR" && locale !== "IT")) {
		// let us check the langauge set in the URL. we need to be very sure that no one can inject something
		locale = "DE"; // reset to default: german

	}
	return locale;
}
