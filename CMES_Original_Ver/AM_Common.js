/*
Name:					AM_Common.js
Description:	The AM_Common.js file containing global logic pertaining to the Andon Form.

Ver		Release 	By					Date				Change Description
001		00.70			Praveen		  2024-12-06 	#First Version

*/

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.AM = window.AM || {};
	AM.Common = AM.Common || {};
	AM.Common = Common();
	// Start Up Module
	AM.Common.initialize();
	// ------------------------------------------------------------------------------------

	/**
	 * AM.CommonTemplate
	 * @returns {object} AM.CommonTemplate template object.
	 */
	function Common() {
		// #region Constant variables
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const LIST_JS = [];
		const LIST_JS_AJAX = [];
		const LIST_CSS = [];

		/** Constant:MES Andon state string @type {String} */
		const MES_ANDON_STATE_DESC = {
			acknowledged: "ACKNOWLEDGED",
			resolved: "RESOLVED",
			notResolved: "NOT RESOLVED",
			new: "NEW",
		};
		/** Constant: MES Andon state int @type {int} */
		const MES_ANDON_STATE_ID = {
			new: 1,
			acknowledged: 2,
			resolved: 3,
			notResolved: 4,
		};

		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 */
		function initialize() {
			// Include js files
			includeJsFiles();

			// Include JS files via AJAX
			includeJsFilesAjax();

			// Include CSS files
			includeCssFiles();
		}
		// #endregion initialize
		// #region include functions
		/**
		 * Includes js files specified in LIST_JS
		 */
		function includeJsFiles() {
			SFU.includeCustomJsFiles(LIST_JS);
		}

		/**
		 * Includes js files specified in ListJsAjax, to be loaded using ajax call.
		 */
		function includeJsFilesAjax() {
			if (LIST_JS_AJAX.length > 0) {
				$.ajax({
					type: "GET",
					url: LIST_JS_AJAX,
					dataType: "script",
					cache: true,
					async: false,
				});
			}
		}

		/**
		 * Includes CSS files specified in ListCss
		 */
		function includeCssFiles() {
			SFU.includeCustomCssFiles(LIST_CSS);
		}
		// #endregion include functions

		return {
			MES_ANDON_STATE_ID: MES_ANDON_STATE_ID,
			MES_ANDON_STATE_DESC: MES_ANDON_STATE_DESC,
			initialize: initialize,
		};
		// #endregion return
	}
})(window);
