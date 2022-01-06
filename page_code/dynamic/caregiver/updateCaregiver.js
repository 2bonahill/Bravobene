import wixData from 'wix-data';

$w.onReady(function () {
	
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
	
	// profile picture
	$w("#uploadProfilePictureButton").onChange((event, $w) => {
		// start the picture upload
		$w("#uploadProfilePictureButton").startUpload()
			.then((uploadedFile) => {
				let url = uploadedFile.url;
				$w("#profilePicture").src = url;
			})
			.catch((uploadError) => {
				let errCode = uploadError.errorCode; // 7751
				let errDesc = uploadError.errorDescription; // "Error description"
			});
	});

	/*
	 * we need to validate the username input
	 * - needs to be unique because it serves as the id ("title" in the db)
	 */
	$w("#usernameInput").onCustomValidation((value, reject) => {
		// let us query the db
		wixData.query("Caregivers")
			.eq("title", value)
			.find()
			.then((results) => {
				if (results.items.length > 0) {
					// this title is already taken
					reject("Username is already taken");
				}
			});
	});

});

export function uploadProfilePicture_change(event, $w) {
	console.log("okay, on change");
}
