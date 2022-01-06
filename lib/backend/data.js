import wixData from 'wix-data';
import wixCRM from 'wix-crm-backend';

export function Caregivers_beforeInsert(item, context) {
	item.q = checkCaregiverQuality(item);
}

export function Caregivers_beforeUpdate(item, context) {
	item.q = checkCaregiverQuality(item);
}

function checkCaregiverQuality(item) {
	var q = 0;
	if (item.profilePicture !== undefined) {
		q += 2;
	}

	if (item.about !== undefined) {
		q += 1;
		if (item.about.length > 300) {
			q += 1;
		}
	}
	return q;
}

export function Caregivers_afterUpdate(item, context) {
	/*
	 * We would like to make the user DB the lead DB for centralized user information.
	 * So in this case, when a caregiver is updated, we update the caregiver name in the user
	 * db as well
	 */
	wixData.query("User").eq("_id", item._id).find()
		.then(res => {
			if (res.items.length > 0) {
				var user = res.items[0];
				user.firstName = item.firstName;
				user.lastName = item.lastName;
				user.profilePicture = item.profilePicture;
				return user;
			}
		}).then(user => {
			wixData.update("User", user)
				.then(updatedUser => {
					return updatedUser;
				})
				.catch((err) => {
					console.log(err);
					throw Error(err);
				});
		});
	
	/* 
	 * Also let us update the CRM
	 */
	wixCRM.createContact({
			"firstName": item.firstName,
			"lastName": item.lastName,
			"emails": [item.email]
		})
		.then((contactId) => {
			// contact created
			console.log("yes o mat");
		}).catch(e => {
			console.log("dough");
			console.log(e);
		});
}
