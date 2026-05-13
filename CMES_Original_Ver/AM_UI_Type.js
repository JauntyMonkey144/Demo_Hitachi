/*
Name:        	AM_UI_Type.js
Description: 	Andon Type js file containing global logic pertaining to the AM_UI_Type Form.

Ver   Release		By						Date				Change Description
001   00.70.00 	Praveen			  2024-08-29	#3384 First version.
002		01.00.00 	Bas van B			2025-02-26	#4253 Translate Andon Type Names. Removed duplicate unused function.
003	 	01.01.00 	Fayaz A				2025-05-28	#5008 Localization key update to refer from FT runtime locale file.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.AM = window.AM || {};
	AM.Type = AM.Type || {};
	AM.Type = Type();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function Type() {
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
			_controls.wwAndonType = FORM.Control.findByXmlNode("WWTY");

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
				wwAndonTypeLoad();
			} catch (exception) {
				handleScriptError(exception);
			}
		}

		/**
		 * @param {*} error
		 */
		function handleScriptError(error) {
			if (error instanceof TypeError) {
				errorMessage = skelta.localize.getString("@@FT_UnexpectedType@@");
			} else if (error instanceof ReferenceError) {
				errorMessage = skelta.localize.getString("@@FT_ReferenceError@@");
			} else {
				errorMessage = skelta.localize.getString("@@FT_DuringScriptExecution@@");
			}
			SFU.showError(skelta.localize.getString("FormNGFErrorRunningScript_title"), errorMessage, null, error.message);
		}

		/**
		 * Get andon Type details for displaying it on the widget
		 */
		function wwAndonTypeLoad() {
			try {
				const parameterCollection = {};
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_AM_Andon_Type", parameterCollection, false).then(
					(data) => {
						// Translate the andon types
						const fields = [
							FT.Ui.translationColumnField("char_desc", FT.Ui.TRANSLATION_GROUPS.grpAmAndonTypeTypeDesc, ["char_desc"]),
						];
						const translatedData = FT.Ui.translateArray(data, fields);
						_controls.wwAndonType.widgetProperties.data = JSON.stringify(translatedData);
						_controls.wwAndonType.value = JSON.stringify(translatedData);
					},
					(error) => {
						// Handle error
						throw error("Error:", error);
					},
				);
			} catch (exception) {
				handleScriptError(exception);
			}
		}

		/**
		 * update or add Andon Type configuration
		 * @param {string} modifiedData
		 * @param {string} selectedRow
		 */
		function wwAndonTypeConfigUpdate(modifiedData, selectedRow) {
			const parameterCollection = {
				type_id: selectedRow.type_id,
				type_desc: selectedRow.char_desc.trim(),
				image: selectedRow.img_name,
				operation_type: selectedRow.flag,
			};
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_U_AM_andon_type", parameterCollection, false).then(
				() => {
					wwAndonTypeLoad();
				},
				(error) => {
					// Handle error
					throw error("Error:", error);
				},
			);
		}
		// #endregion

		// #region deleteRw
		/**
		 * deleting andon type record
		 * @param {string} modifiedData
		 * @param {string} selectedRow
		 */
		function wwAndonTypeConfigDelete(modifiedData, selectedRow) {
			const parameterCollection = {
				type_id: selectedRow.type_id,
			};
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_D_AM_andon_type", parameterCollection, false).then(
				() => {
					wwAndonTypeLoad();
				},
				(error) => {
					// Handle error
					throw error("Error:", error);
				},
			);
		}

		return {
			initializeForm: initializeForm,
			wwAndonTypeConfigDelete: wwAndonTypeConfigDelete,
			wwAndonTypeConfigUpdate: wwAndonTypeConfigUpdate,
		};
	}
})(window);
