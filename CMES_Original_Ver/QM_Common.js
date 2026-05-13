/*
Name:        	QM_Common.js
Description: 	Common js file for QM. Contains definitions for sample result and sample status.

Ver		Release		By						Date				Change Description
001		00.00			Bas van B			2025-06-04	#4253 First version. Created for common default string template.
*/

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.QM = window.QM || {};
	QM.Common = QM.Common || {};
	QM.Common = Common();
	// ------------------------------------------------------------------------------------
	/**
	 * Template
	 *
	 * @returns {null} Template template object.
	 */
	function Common() {
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const LIST_JS = [];
		const LIST_JS_AJAX = [];
		const LIST_CSS = [];
		const SAMPLE_RESULTS = {
			1: "PENDING",
			2: "GOOD",
			3: "OOC",
			4: "OOS",
			5: "OOC KEY",
			6: "OOS KEY",
			7: "OOC CRITICAL",
			8: "OOS CRITICAL",
		};
		const SAMPLE_STATES = {
			1: "READY",
			2: "READY WARNING",
			3: "MISSED",
			4: "IN PROGRESS",
			5: "LATE",
			6: "COMPLETE",
			7: "COMPLETE LATE",
			8: "CANCELED",
		};
		// ----------------------------------------------------------------------------------

		// ----------------------------- Private Variables ----------------------------------

		// ----------------------------------------------------------------------------------

		// Start up module
		initialize();
		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initialize() {
			// Include js files
			includeJsFiles();

			// Include js files via ajax
			includeJsFilesAjax();

			// Include CSS files
			includeCssFiles();
		}

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

		// INCLUDE NEW FUNCTIONS BELOW HERE
		/**
		 * Returns the default string of the sample result identifier. Used by translation in case no translation is defined.
		 *
		 * @param {number} sampleResult Sample result identifier.
		 * @returns {string} Sample result desctiption.
		 */
		function translationSampleResultDefaultTemplate(sampleResult) {
			// Get the matching result, return empty string if not defined.
			return SAMPLE_RESULTS[sampleResult] || "";
		}

		/**
		 * Returns the default string of the sample result identifier. Used by translation in case no translation is defined.
		 *
		 * @param {number} sampleStatus Sample status identifier.
		 * @returns {string} Sample status description.
		 */
		function translationSampleStatusDefaultTemplate(sampleStatus) {
			// Get the matching status, return empty string if not defined.
			return SAMPLE_STATES[sampleStatus];
		}

		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			SAMPLE_RESULTS: Object.freeze(SAMPLE_RESULTS), // Freeze, so constant is read-only.
			SAMPLE_STATES: Object.freeze(SAMPLE_STATES), // Freeze, so constant is read-only.
			translationSampleResultDefaultTemplate: translationSampleResultDefaultTemplate,
			translationSampleStatusDefaultTemplate: translationSampleStatusDefaultTemplate,
		};
	}
})(window);
