import wixLocation from 'wix-location';
import wixData from 'wix-data';
import wixUsers from 'wix-users';

$w.onReady(function () {
	// Do we have a caregiver? if yes, we redirect to the user update page
	wixData.query("Caregivers")
		.eq("_id", wixUsers.currentUser.id)
		.find()
		.then((results) => {
			if (results.items.length > 0) {
				// yes, we have a caregiver
				console.log("yes, we have a caregiver");
				wixLocation.to("/c/update/" + results.items[0].title);
			}
		});
});
