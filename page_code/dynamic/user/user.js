import {
	bravobeneLogin
}
from 'public/bravobene-login.js';

$w.onReady(function () {
	//TODO: write your page related code here...
	// profile picture
	$w("#uploadProfilePictureButton").onChange((event, $w) => {
		console.log(event.target.value);

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

});

export function becomeCaregiverButton_click(event, $w) {
	// call the public function
	bravobeneLogin.becomeCaregiver();
}
