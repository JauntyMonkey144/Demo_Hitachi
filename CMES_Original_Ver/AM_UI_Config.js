/*
Name:        	AM_UI_Config.js
Description: 	AM_UI_Config js file containing global logic pertaining to the AM_UI_Config Form.

Ver	 Release		By				Date				Change Description
001	 00.70      Praveen		2024-08-29	#3384 First version.
002	 01.01.00 	Fayaz A		2025-05-28	#5008 Localization key update to refer from FT runtime locale file.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.AM = window.AM || {};
	AM.Config = AM.Config || {};
	AM.Config = Config();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function Config() {
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;
		// ----------------------------------------------------------------------------------

		// ----------------------------- Private Variables ----------------------------------
		const _controls = {};
		let _errorMessage;
		// ----------------------------------------------------------------------------------
		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			// Initialize variables
			FORM.Control = Control;
			_controls.ddGroupName = FORM.Control.findByXmlNode("DDGR");
			_controls.embedPageAndon = FORM.Control.findByXmlNode("EAN");

			// Include js files
			includeJsFiles();

			// Include js files via ajax
			includeJsFilesAjax();

			// Include CSS files
			includeCssFiles();

			// Add code here
			onFormLoad();
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

		// INCLUDE NEW FUNCTIONS HERE

		/**
		 * Form load function for the controls
		 */
		function onFormLoad() {
			try {
				ddGroupOnDataChange();
			} catch (exception) {
				handleScriptError(exception);
			}
		}

		/**
		 * @param {*} error
		 */
		function handleScriptError(error) {
			if (error instanceof TypeError) {
				_errorMessage = skelta.localize.getString("@@FT_UnexpectedType@@");
			} else if (error instanceof ReferenceError) {
				_errorMessage = skelta.localize.getString("@@FT_ReferenceError@@");
			} else {
				_errorMessage = skelta.localize.getString("@@FT_DuringScriptExecution@@");
			}
			SFU.showError(skelta.localize.getString("FormNGFErrorRunningScript_title"), _errorMessage, null, error.message);
		}
		/**
		 * Function to load corresponding form for the selected action
		 */
		function ddGroupOnDataChange() {
			try {
				updateIframeSandbox();
				if (_controls.ddGroupName.value === "Type") {
					_controls.embedPageAndon.visible = true;
					_controls.embedPageAndon.url = "";
					_controls.embedPageAndon.url = SFU.getFormUrl("AM_UI_Type");
				} else if (_controls.ddGroupName.value === "UserLink") {
					_controls.embedPageAndon.visible = true;
					_controls.embedPageAndon.url = "";
					_controls.embedPageAndon.url = SFU.getFormUrl("AM_UI_UserLink");
				} else {
					_controls.embedPageAndon.visible = true;
					_controls.embedPageAndon.url = "";
					_controls.embedPageAndon.url = SFU.getFormUrl("AM_UI_Issue");
				}
			} catch (exception) {
				handleScriptError(exception);
			}
		}

		/**
		 * This function iterates over all <iframe> elements on the page and ensures that the 'allow-modals'
		 * permission is added to their sandbox attributes, but only if the browser supports it.
		 *
		 * - It checks if the browser supports the 'allow-modals' permission for the iframe sandbox.
		 * - If the iframe already has the 'allow-modals' permission, it skips that iframe.
		 * - If the 'allow-modals' permission is not already present, it adds it to the sandbox.
		 * */
		function updateIframeSandbox() {
			const iframes = Array.from(document.getElementsByTagName("iframe"));
			iframes.forEach((iframe) => {
				if (!iframe.sandbox.supports("allow-modals")) {
					return; // Exit if the browser doesn't support
				}
				if (iframe.sandbox.contains("allow-modals")) return;
				iframe.sandbox.add("allow-modals");
			});
		}
		return {
			initializeForm: initializeForm,
			ddGroupOnDataChange: ddGroupOnDataChange,
		};
	}
})(window);
