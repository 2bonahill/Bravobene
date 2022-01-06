import wixLocation from 'wix-location';
import wixData from 'wix-data';
import wixUsers from 'wix-users';

export let bravobeneLogger = {
	/**
	 * This is the logging function
	 * @param [String] String array containing the path
	 */
	log: function (source, toLog) {
		// check if logging mode is enabled
		if (wixLocation.query.debug) {
			// let us check the langauge set in the URL. we need to be very sure that no one can inject something
			if (source instanceof Array){
				console.log(">> " + source.join(" > "));
			} else {
				console.log(">> " + source);
			}
			console.log(toLog);
		}
	},

	/**
	 * This function throws errors. Example invocation:
	 * >bravobeneLogger.throwError("Page:Sendgrid > onReady", new Error("new Error ha"), 1)
	 * @param: <String> source
	 * @param: <String/Error> error
	 * @param: <Integer> severity
	 */
	throwError: async function (source, error, severity, context) {
		var errorEntry = {}; // user, caller, severity, name, message
		errorEntry.caller = source;
		errorEntry.severity = severity;
		errorEntry.context = context;
		
		if (wixUsers.currentUser.loggedIn){
			errorEntry.user = wixUsers.currentUser.id;
		}
		
		if (error instanceof Error) {
			errorEntry.message = error.toString();
		} else {
			errorEntry.message = error;
		}

		wixData.insert("Errors", errorEntry).then((results) => {
				return results;
			})
			.catch((err) => {
				console.log(err);
			});
	}

};
