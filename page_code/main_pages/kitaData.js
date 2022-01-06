import wixData from 'wix-data';
import wixWindow from 'wix-window';

// some config
var itemsPerPage;
var dqr; // <WixDataQueryResult>

$w.onReady(function () {

	itemsPerPage = wixWindow.formFactor === "Mobile" ? 8 : 50;

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
		$w("#button20").link = itemData["link-kitas-title"];

		$w("#editButton").link = "/k/update/" + itemData["title"];

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
	 */
	wixData.query("Kitas_CH")
		.eq("hidden", true)
		.limit(itemsPerPage)
		.descending("q", "_updatedDate")
		.find()
		.then((r) => {
			dqr = r;
			$w("#repeater1").data = r.items;

			$w("#nextPage").onClick((event, $w) => {
				if (dqr.hasNext()) {
					dqr.next()
						.then(r => {
							dqr = r;
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
							$w("#repeater1").data = r.items;
							handlePaging();
						});
				}
			})
			handlePaging();
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

export function search(event, $w) {
	var query = wixData.query("Kitas_CH")
		.contains("name", $w("#searchField").value)
		.eq("hidden", true);

	if (!($w("#cantonDropdown").value === "all" || $w("#cantonDropdown").value === "")) {
		// okay, canton has been set: dropdown is neither "all" nor empty
		console.log("kanton yes");
		query = query.eq("canton", $w("#cantonDropdown").value);
		console.log(query);
	}

	/*
	if ($w("#searchField").value !== "" && $w("#searchField").value !== undefined) {
		query.or(wixData.query("Kitas_CH").contains("address", $w("#searchField").value))
			.or(wixData.query("Kitas_CH").contains("overview", $w("#searchField").value))
			.or(wixData.query("Kitas_CH").startsWith("zip", $w("#searchField").value))
			.or(wixData.query("Kitas_CH").contains("street", $w("#searchField").value))
			.or(wixData.query("Kitas_CH").contains("city", $w("#searchField").value));
	}

	if (!($w("#typeDropdown").value === "all" || $w("#typeDropdown").value === "")) {
		// okay, canton has been set: dropdown is neither "all" nor empty
		query = query.eq($w("#typeDropdown").value, true);
	}*/

	console.log(query);

	// find and set data to repeater
	query.limit(itemsPerPage)
		.descending("q", "_updatedDate")
		.find()
		.then((r) => {
			$w("#repeater1").data = r.items;
			dqr = r;
			// handlePaging(r);
		});
}

export function searchButton_click(event, $w) {
	search(event, $w);
}

export function searchField_keyPress(event, $w) {
	if (event.code === 13) {
		// 'Enter' has been pressed
		search(event, $w);
	}
}
