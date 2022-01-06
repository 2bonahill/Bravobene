import wixData from 'wix-data';
import wixWindow from 'wix-window';
import {
	session
}
from 'wix-storage';

// some config
var itemsPerPage;
var dqr; // <WixDataQueryResult>

$w.onReady(function () {

	itemsPerPage = wixWindow.formFactor === "Mobile" ? 8 : 12;

	// let us handle pagination
	if (session.getItem("skipItemsInSearch") === undefined || session.getItem("skipItemsInSearch") === null) {
		session.setItem("skipItemsInSearch", 0);
	}

	if (session.getItem("searchTerm") === null || session.getItem("searchTerm") === undefined){
		session.setItem("searchTerm", "");
	} else {
		$w("#searchField").value = session.getItem("searchTerm");
	}

	console.log("okay, brand new:");
	console.log(session.getItem("skipItemsInSearch"));
	console.log(session.getItem("searchTerm"));
	
	/*
	 * let's do some cleanup
	 */
	$w("#repeater1").onItemReady(($w, itemData, index) => {

		// name has just space for 40 characters
		if (itemData.name.length > 35) {
			$w("#text8").text = itemData.name.substr(0, 30) + " ...";
		} else {
			$w("#text8").text = itemData.name;
		}

		// work on the image. just show it when something is set
		if (itemData.picture !== null && typeof itemData.picture !== 'undefined') {
			// okay, we got an image
			//$w("#image11").src = itemData.picture;
			setKitaImage($w("#image11"), itemData.picture).
			then(r => {
				//console.log("image set");
			});
		}

		// the link
		$w("#button20").link = itemData["link-kitas-title"]; // + "?p="+skipItemsInSearch;

		// work on the street
		$w("#text9").text = itemData.street;

		// work on the zip & town
		$w("#text27").text = itemData.zip + " " + itemData.city;

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
	 * Handle the pagination with "next" and "previous" button
	 */
	$w("#nextPage").onClick((event, $w) => {
		if (dqr.hasNext()) {
			dqr.next()
				.then(r => {
					dqr = r;
					session.setItem("skipItemsInSearch", Number(session.getItem("skipItemsInSearch")) + itemsPerPage);
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
					session.setItem("skipItemsInSearch", Number(session.getItem("skipItemsInSearch")) - itemsPerPage);
					$w("#repeater1").data = r.items;
					handlePaging();
				});
		}
	});

	/*
	 * get the initial kita data
	 * 
	 
	wixData.query("Kitas_CH")
		.limit(itemsPerPage)
		.skip(Number(session.getItem("skipItemsInSearch")))
		.descending("q", "_updatedDate")
		.find()
		.then((r) => {
			dqr = r;
			$w("#repeater1").data = r.items;
			handlePaging();
		});*/
	search();

});

export async function setKitaImage(imageElement, src) {
	imageElement.src = src;
}

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

export function search() {
	// let us first reset the pagination
	var searchTerm = session.getItem("searchTerm");
	var query = wixData.query("Kitas_CH")
		.contains("name", searchTerm)
		.or(wixData.query("Kitas_CH").contains("address", searchTerm))
		.or(wixData.query("Kitas_CH").contains("overview", searchTerm))
		//.or(wixData.query("Kitas_CH").contains("description", searchTerm))
		.or(wixData.query("Kitas_CH").startsWith("zip", searchTerm))
		.or(wixData.query("Kitas_CH").contains("street", searchTerm))
		.or(wixData.query("Kitas_CH").contains("city", searchTerm));

	/*
	if (!($w("#typeDropdown").value === "all" || $w("#typeDropdown").value === "")) {
		// okay, canton has been set: dropdown is neither "all" nor empty
		query = query.eq($w("#typeDropdown").value, true);
	}

	if (!($w("#cantonDropdown").value === "all" || $w("#cantonDropdown").value === "")) {
		// okay, canton has been set: dropdown is neither "all" nor empty
		query = query.eq("canton", $w("#cantonDropdown").value)
	}
	*/

	// find and set data to repeater
	query.limit(itemsPerPage)
		.skip(Number(session.getItem("skipItemsInSearch")))
		.descending("q", "_updatedDate")
		.find()
		.then((r) => {
			$w("#repeater1").data = r.items;
			dqr = r;
			handlePaging(r);
		});
}

export function searchButton_click(event, $w) {
	session.setItem("skipItemsInSearch", 0);
	session.setItem("searchTerm", $w("#searchField").value);
	console.log(session.getItem("searchTerm") === "");
	search();
}

export function searchField_keyPress(event, $w) {
	if (event.code === 13) {
		// 'Enter' has been pressed
		session.setItem("skipItemsInSearch", 0);
		session.setItem("searchTerm", $w("#searchField").value);
		search();
	}
}
