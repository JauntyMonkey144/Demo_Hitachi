/*
Name:        	QM_UI_CatalogConfig.js
Description: 	QM_UI_CatalogConfig js file containing global logic pertaining to the QM_UI_CatalogConfig Form.

Ver		Release			By						Date				Change Description
001		00.70				Shamanth S	  2024-10-25	#3808 First version.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.QM = window.QM || {};
	QM.Config = QM.Config || {};
	QM.Config = Config();
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
		let errorMessage;
		// ----------------------------------------------------------------------------------
		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			// Initialize variables
			FORM.Control = Control;
			_controls.ddCatalogForm = FORM.Control.findByXmlNode("DDCTL");
			_controls.embedPageCatalog = FORM.Control.findByXmlNode("EPCTL");

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
				ddCatalogFormOnDataChange();
			} catch (exception) {
				handleScriptError(exception);
			}
		}

		/**
		 * @param {*} error
		 */
		function handleScriptError(error) {
			if (error instanceof TypeError) {
				errorMessage = skelta.localize.getString("@@AM_UnexpectedType@@");
			} else if (error instanceof ReferenceError) {
				errorMessage = skelta.localize.getString("@@AM_ReferenceError@@");
			} else {
				errorMessage = skelta.localize.getString("@@AM_DuringScriptExecution@@");
			}
			SFU.showError(skelta.localize.getString("FormNGFErrorRunningScript_title"), errorMessage, null, error.message);
		}
		/**
		 * Function to load corresponding form for the selected action
		 */
		function ddCatalogFormOnDataChange() {
			try {
				updateIframeSandbox();
				if (_controls.ddCatalogForm.value === "Catalog") {
					_controls.embedPageCatalog.url = "";
					_controls.embedPageCatalog.url = SFU.getFormUrl("QM_UI_CatalogAdd");
				} else if (_controls.ddCatalogForm.value === "Catalog Options") {
					_controls.embedPageCatalog.url = "";
					_controls.embedPageCatalog.url = SFU.getFormUrl("QM_UI_CatalogEdit");
				}
			} catch (exception) {
				handleScriptError(exception);
			}
		}

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
			ddCatalogFormOnDataChange: ddCatalogFormOnDataChange,
		};
	}
})(window);
