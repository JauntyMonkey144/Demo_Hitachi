/*
Name:        	IM_UI_HandlingUnitHierarchy.js
Description: 	IM_UI_HandlingUnitHierarchy js file containing logic pertaining to the Sublot levels form.

Ver		Release			By					Date					Change Description
001		01.00.00  	Praveen  		2025-02-27		#4415 First version.
002	 	01.01.00		Fayaz A			2025-05-28		#5008 Localization key update to refer from FT runtime locale file.
*/

((window) => {
	//  ------------------------------ Global Variables ------------------------------------
	window.IM = window.IM || {};
	IM.HandlingUnitHierarchy = IM.HandlingUnitHierarchy || {};
	IM.HandlingUnitHierarchy = HandlingUnitHierarchy();
	//  ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */

	function HandlingUnitHierarchy() {
		//  ---------------------------- Constant Variables ----------------------------------
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;
		const _controls = {};
		//  ----------------------------------------------------------------------------------

		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			//  Initialize variables
			FORM.Control = Control;
			_controls.wwPalletHierarchy = FORM.Control.findByXmlNode("WWPH");

			//  Include js files
			includeJsFiles();

			//  Include js files via ajax
			includeJsFilesAjax();

			//  Include CSS files
			includeCssFiles();

			//  Add code here
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

		/**
		 * Form load function for the controls
		 */
		function onFormLoad() {
			try {
				wwPalletHierarchyLoad();
			} catch (exception) {
				handleScriptError(exception);
			}
		}
		/**
		 * @param {*} error
		 */
		function handleScriptError(error) {
			let errorMessage;
			if (error instanceof TypeError) {
				errorMessage = skelta.localize.getString("@@FT_UnexpectedType@@");
			} else if (error instanceof ReferenceError) {
				errorMessage = skelta.localize.getString("@@FT_ReferenceError@@");
			} else {
				errorMessage = skelta.localize.getString("@@FT_DuringScriptExecution@@");
			}
			SFU.showError(skelta.localize.getString("FormNGFErrorRunningScript_title"), errorMessage, null, error.message);
			throw errorMessage;
		}
		/**
		 * This function loads attributes and populates a dropdown control.
		 */
		function wwPalletHierarchyLoad() {
			const inventoryContext = FT.WorkTasks.contextGet(FORM.Control, "itemInv");
			if (inventoryContext && inventoryContext.length > 0) {
				const selectedRow = inventoryContext[0].jsonValue;
				const parameterColl = {
					item_id: selectedRow.item_id,
					sublot_no: selectedRow.sublot_no,
					lot_no: selectedRow.lot_no,
					parents: null,
					children: 1,
				};
				const spName = "sp_SA_IM_Sublot_HandlingUnitHierarchy";
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", spName, parameterColl, false).then(
					(data) => {
						_controls.wwPalletHierarchy.widgetProperties.data = JSON.stringify(data);
					},
					(error) => {
						// Handle error
						throw Error("Error:", error);
					},
				);
			}
		}

		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
		};
	}
})(window);
