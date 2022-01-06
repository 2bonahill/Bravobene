import wixData from 'wix-data';

export let bravobeneKitaHandler = {

	/**
	 * This function is to receive a kita from the Kita_CH DB by ID
	 * @param <String> ID of Kita
	 * @returns <Object> Kita from the DB
	 */
	getKitaById: async function (kitaId) {
		var q = await wixData.query("Kitas_CH").eq("_id", kitaId).find();
		if (q.items.length > 0) {
			return q.items[0];
		}
	},

	/**
	 * This function is to receive a kita from the Kita_CH DB by title
	 * @param <String> Title of Kita
	 * @returns <Object> Kita from the DB
	 */
	getKitaByTitle: async function (kitaTitle) {
		var q = await wixData.query("Kitas_CH").eq("title", kitaTitle).find();
		if (q.items.length > 0) {
			return q.items[0];
		}
	},

	/**
	 * Rate Kita
	 * @param <ID> Kita
	 * @param <Int> Rating between 1-5
	 */
	rateKita: async function (kitaId, rating) {
		var q = await wixData.query("Kitas_CH_reviews").eq("kita", kitaId).find();
		if (q.items.length > 0) {
			var kita2bRated = q.items[0];
			kita2bRated.rating = rating;
			return wixData.update("Kitas_CH_reviews", kita2bRated);
		}
	},

	/**
	 * Get kita rating
	 * @param <Int> KitaId
	 */
	getReviewRatingById: async function (reviewId) {
		var q = await wixData.query("Kitas_CH_reviews").eq("_id", reviewId).find();
		if (q.items.length > 0) {
			return q.items[0].rating;
		}
	},

	/**
	 * Get all ratings for a kita
	 * @param <Int> KitaId
	 */
	getKitaReviewsById: async function (kitaId) {
		var q = await wixData.query("Kitas_CH_reviews").eq("kita", kitaId).find();
		if (q.items.length > 0) {
			return q.items;
		}
	},

	/**
	 * Get all ratings for a kita
	 * @param <Int> KitaId
	 */
	getKitaReviewsByReviewerandKita: async function (kitaId, reviewerId) {
		var q = await wixData.query("Kitas_CH_reviews").eq("kita", kitaId).eq("reviewerId", reviewerId).find();
		if (q.items.length > 0) {
			return q.items;
		}
	},

	/**
	 * Create new review
	 * @param <String> ID of the Kita
	 * @param <String> Name of the reviewer
	 * @param <String> ID of the reviewer
	 * @return <Object> review
	 */
	insertOrUpdateKitaReview: async function (kitaReview) {
	// let us first check whether a review for this kita by this user already exists
		var r;
		if (kitaReview._id !== undefined){
			// this entry already has an ID, which means that it is an update
			r = await wixData.update("Kitas_CH_reviews", kitaReview);
		} else {
			r = await wixData.insert("Kitas_CH_reviews", kitaReview);
		}
		return r;
	}
};
