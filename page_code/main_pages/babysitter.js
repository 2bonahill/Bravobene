// For full API documentation, including code examples, visit http://wix.to/94BuAAs
import wixData from 'wix-data';
import {
	bravobeneLogin
}
from 'public/bravobene-login.js';
import wixWindow from 'wix-window';
import {
	getCurrentLanguage
}
from 'public/TranslationModule.js';
import {
	session
}
from 'wix-storage';

// some config
var itemsPerPage;
var dqr; // <WixDataQueryResult>

$w.onReady(function () {
	// let us handle translations
	handleTranslations();

	itemsPerPage = wixWindow.formFactor === "Mobile" ? 8 : 12;

	// let us handle pagination
	if (session.getItem("sessionSearchStart") === undefined || session.getItem("sessionSearchStart") === null) {
		session.setItem("sessionSearchStart", 0);
	}
	if (session.getItem("sessionSearchCanton") === undefined || session.getItem("sessionSearchCanton") === null || session.getItem("sessionSearchCanton") === "all") {
		session.setItem("sessionSearchCanton", "");
	} else {
		$w("#cantonDropdown").value = session.getItem("sessionSearchCanton");
	}
	if (session.getItem("sessionSearchLanguage") === undefined || session.getItem("sessionSearchLanguage") === null) {
		session.setItem("sessionSearchLanguage", "");
	}
	if (session.getItem("sessionSearchQuery") === null || session.getItem("sessionSearchQuery") === undefined) {
		session.setItem("sessionSearchQuery", "");
	} else {
		$w("#searchField").value = session.getItem("sessionSearchQuery");
	}

	/*
	 * This is the repeater showin all the caregivers
	 */
	$w("#repeater1").onItemReady(($w, itemData, index) => {
		// shorten the about text
		let newAbout = " ";
		if (itemData.about !== null && typeof itemData.about !== 'undefined') {
			newAbout = itemData.about;
		}

		// $w("#text10").text = newAbout.substr(0, 60) + " ...";

		// name text 8
		$w("#text8").text = itemData.firstName;

		// work on the image
		if (itemData.prfilePicture !== null && typeof itemData.profilePicture !== 'undefined') {
			// okay, we got an image
			$w("#image2").src = itemData.profilePicture;
		}

		// the link
		$w("#button16").link = itemData["link-c-_id"];

		// birthdate
		var ageDifMs = Date.now() - new Date(itemData.birthdate).getTime();
		var ageDate = new Date(ageDifMs); // miliseconds from epoch
		var age = Math.abs(ageDate.getUTCFullYear() - 1970);
		$w("#text9").text = age + " Jahre";

		// zip and town
		$w("#text12").text = itemData.zip + " " + itemData.city;

		// hide the loading box
		//if ($w("#loadingBox").isVisible) {
		//	$w("#loadingBox").hide();
		// }
		if (!$w("#prevPage").isVisible) {
			$w("#prevPage").show();
		}
		if (!$w("#nextPage").isVisible) {
			$w("#nextPage").show();
		}
		if (!$w("#repeater1").isVisible) {
			$w("#repeater1").show();
		}

	});

	/*
	 * get the initial kita data
	 * 
	 
	wixData.query("Caregivers")
		.ne("disabled", true)
		.limit(itemsPerPage)
		.descending("q", "_updatedDate")
		.find()
		.then((r) => {
			dqr = r;
			$w("#repeater1").data = r.items;
			handlePaging();
		});*/
	searchNow();

	/*
	 * handle the "next" and "prev" button
	 */
	$w("#nextPage").onClick((event, $w) => {
		if (dqr.hasNext()) {
			dqr.next()
				.then(r => {
					dqr = r;
					session.setItem("sessionSearchStart", Number(session.getItem("sessionSearchStart")) + itemsPerPage);
					$w("#repeater1").data = r.items;
					handlePaging();
				});
		}
	});

	$w("#prevPage").onClick((event, $w) => {
		if (dqr.hasPrev()) {
			dqr.prev()
				.then(r => {
					dqr = r;
					session.setItem("sessionSearchStart", Number(session.getItem("sessionSearchStart")) - itemsPerPage);
					$w("#repeater1").data = r.items;
					handlePaging();
				});
		}
	});

	// let us populate the canton dropdown
	let cantonDropdownOptions = [{
		"label": "(alle)",
		"value": "all"
	}];
	wixData.query("SwissCantons")
		.ascending("name")
		.find()
		.then((results) => {
			results.items.forEach((item) => {
				cantonDropdownOptions.push({
					"label": item.name,
					"value": item.key
				});
			});
			$w("#cantonDropdown").options = cantonDropdownOptions;

		})
		.catch((err) => {
			let errorMsg = err;
		});

	// populate the language dropdown
	let languageDropdownOptions = [{
		"label": "alle",
		"value": "all"
	}];
	wixData.query("Languages")
		.ascending("Name_DE")
		.find()
		.then((results) => {
			results.items.forEach((item) => {
				languageDropdownOptions.push({
					"label": item.name_de,
					"value": item.key
				});
			});
			$w("#languageDropdown").options = languageDropdownOptions;

		})
		.catch((err) => {
			let errorMsg = err;
		});

});

/*
 * this function handles the next / prev page buttons
 */
function handlePaging() {
	// next
	if (dqr.hasNext()) {
		$w("#nextPage").enable();

	} else {
		$w("#nextPage").disable();
	}

	// prev
	if (dqr.hasPrev()) {
		$w("#prevPage").enable();
	} else {
		$w("#prevPage").disable();
	}
	wixWindow.scrollTo(0, 0);
}

/*
 * ******************************************************************
 * ******************************************************************
 * 
 * SEARCHING
 * 
 * ******************************************************************
 * ****************************************************************** 
 */
export function searchNow() {
	var searchTerm = session.getItem("sessionSearchQuery");
	var query = wixData.query("Caregivers")
		.contains("about", searchTerm)
		.or(wixData.query("Caregivers").contains("firstName", searchTerm))
		.or(wixData.query("Caregivers").contains("lastName", searchTerm))
		.or(wixData.query("Caregivers").contains("education", searchTerm))
		.or(wixData.query("Caregivers").startsWith("zip", searchTerm))
		.or(wixData.query("Caregivers").contains("town", searchTerm))
		.or(wixData.query("Caregivers").contains("state", searchTerm));

	if (session.getItem("sessionSearchCanton") !== "" && session.getItem("sessionSearchCanton") !== "all") {
		// okay, canton has been set: dropdown is neither "all" nor empty
		query = query.eq("state", session.getItem("sessionSearchCanton"));
	}

	// do we have a lagnuage selected?
	if ($w("#languageDropdown").value === "DE") {
		// okay, language has been set: dropdown is neither "all" nor empty
		// TODO filter = filter.eq("lanDe", true);
	}
	if ($w("#languageDropdown").value === "EN") {
		// okay, language has been set: dropdown is neither "all" nor empty
		query = query.eq("lanEn", true);
	}
	if ($w("#languageDropdown").value === "FR") {
		// okay, language has been set: dropdown is neither "all" nor empty
		query = query.eq("lanFr", true);
	}
	if ($w("#languageDropdown").value === "IT") {
		// okay, language has been set: dropdown is neither "all" nor empty
		query = query.eq("lanIt", true);
	}

	// we filter out the babies and the "hidden" ones :-)
	var ageFilterDate = new Date(new Date().setFullYear(new Date().getFullYear() - 16));
	query = query.ne("disabled", true)
		.le("birthdate", ageFilterDate); 

	// find and set data to repeater
	query.limit(itemsPerPage)
		.skip(Number(session.getItem("sessionSearchStart")))
		.descending("q", "_updatedDate")
		.find()
		.then((r) => {
			$w("#repeater1").data = r.items;
			dqr = r;
			handlePaging();
		});

}

function handleTranslations() {
	// okay, let's handle translations
	if (getCurrentLanguage() === "DE") {
		// console.log("nix zu tun für translation");
		return false;
	}

	/*
	var currentLanguage = getCurrentLanguage();
	var currentPage = wixLocation.prefix;
	translate($w("#text26"), "CAREGIVERS_ALL_TITLE", currentPage, currentLanguage);
	translate($w("#searchField"), "CAREGIVERS_ALL_SEARCH_OPEN", currentPage, currentLanguage);
	translate($w("#cantonDropdown"), "CAREGIVERS_ALL_SEARCH_CANTON", currentPage, currentLanguage);
	translate($w("#languageDropdown"), "CAREGIVERS_ALL_SEARCH_LANGUAGE", currentPage, currentLanguage);
	translate($w("#searchButton"), "CAREGIVERS_ALL_SEARCH_BUTTON", currentPage, currentLanguage);
	*/
}

/*
 * ******************************************************************
 * ******************************************************************
 * 
 * LOAD MORE RESULTS
 * 
 * ******************************************************************
 * ****************************************************************** 
 */

export function searchField_keyPress(event, $w) {
	if (event.code === 13) {
		session.setItem("sessionSearchStart", 0);
		session.setItem("sessionSearchQuery", $w("#searchField").value);
		// 'Enter' has been pressed
		searchNow();
	}
}

export function searchButton_click(event, $w) {
	session.setItem("sessionSearchStart", 0);
	session.setItem("sessionSearchQuery", $w("#searchField").value);
	searchNow();
}

export function becomeCaregiverButton_click(event, $w) {
	// call the public function
	bravobeneLogin.becomeCaregiver();
}

export function cantonDropdown_change(event, $w) {
	//Add your code for this event here: 
	session.setItem("sessionSearchCanton", $w("#cantonDropdown").value);

}
