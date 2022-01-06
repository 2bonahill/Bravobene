//sendGrid.js

import {
	fetch
}
from 'wix-fetch';

export function sendWithService(senderName, senderEmail, recipientName, recipientEmail, message) {
	return new Promise((resolve, reject) => {
		const url = "https://api.sendgrid.com/v3/mail/send";
		const key = "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";

		const headers = {
			"Authorization": "Bearer " + key,
			"Content-Type": "application/json"
		};

		const data = {
			"personalizations": [{
				"to": [{
					"email": recipientEmail
				}],
				"substitutions": {
					"%recipientName%": recipientName,
					"%senderName%": senderName,
					"%message%": message,
					"%senderEmail%": senderEmail
				}
			}],
			"from": {
				"email": senderEmail,
				"name": senderName
			},
			"subject": "Neue Nachricht auf bravobene!",
			"content": [{
				"type": "text/html",
				"value": "Heya!"
			}],
			"template_id": "05e7506b-4920-4f96-ae55-55a2d18d3e9e"
		};

		const request = {
			"method": "post",
			"headers": headers,
			"body": JSON.stringify(data)
		};

		fetch(url, request)
			.then((response) => {
				// console.log(response);
				console.log("just back from the fetch: gonna resolve now");
				resolve("Response from SendGrid: Success -> ".concat(response.ok));
			});
	});

}
