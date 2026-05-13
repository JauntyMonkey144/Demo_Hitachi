/*
Name:        	WI_UI_View.js
Description: 	WI_UI_View js file containing global logic pertaining to the WI_UI_View Form.
							Logic to initialize and set the controls with instruction details.

Ver	  Release		By					Date				Change Description
001		00.70			Fayaz A 		2024-09-05	#3463 First version.
002		00.70			Somya		  	2024-12-02	#3726 Review Comment Changes.
003		01.00			Bas van B		2025-03-05	#4253 Translate MD in detals view.
*/
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.WI = window.WI || {};
	WI.View = WI.View || {};
	WI.View = View();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function View() {
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

		// ----------------------------------------------------------------------------------
		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			// Initialize variables
			FORM.Control = Control;
			_controls.txtType = FORM.Control.findByXmlNode("TXTY");
			_controls.txtEntity = FORM.Control.findByXmlNode("TXEN");
			_controls.txtItem = FORM.Control.findByXmlNode("TXIT");
			_controls.txtBomVerId = FORM.Control.findByXmlNode("TXBV");
			_controls.txtFileName = FORM.Control.findByXmlNode("TXFN");
			_controls.txtFileDesc = FORM.Control.findByXmlNode("TXFD");
			_controls.txtFileType = FORM.Control.findByXmlNode("TXFT");
			_controls.txtActive = FORM.Control.findByXmlNode("TXAC");

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
			// get context value of job & or setValue to hidden fields
			const instructionContext = FT.WorkTasks.contextGet(FORM.Control, "eventData");
			if (instructionContext && instructionContext.length > 0) {
				const instructionDetails = JSON.parse(instructionContext[0].jsonValue);
				const parameterCollection = {
					row_id: instructionDetails.row_id,
				};
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_S_WI_instruction", parameterCollection, false).then(
					(data) => {
						if (data != null && data.length > 0) {
							// Translate the data.
							const fields = [
								FT.Ui.translationColumnField(
									"ent_desc",
									FT.Ui.TRANSLATION_GROUPS.grpEntDescription,
									FT.Ui.TRANSLATION_KEYS.keyEnt,
									"ent_name",
								),
								FT.Ui.translationColumnField(
									"item_desc",
									FT.Ui.TRANSLATION_GROUPS.grpItemItemDesc,
									FT.Ui.TRANSLATION_KEYS.keyItem,
								),
							];
							const [instructionData] = FT.Ui.translateArray(data, fields);
							// Assign the data to the fields
							_controls.txtType.value = instructionData.type_desc;
							_controls.txtEntity.value = instructionData.ent_desc;
							_controls.txtItem.value = instructionData.item_desc;
							_controls.txtBomVerId.value = instructionData.bom_ver_id;
							_controls.txtFileName.value = instructionData.file_name;
							_controls.txtFileDesc.value = instructionData.file_desc;
							_controls.txtFileType.value = instructionData.file_type;
							_controls.txtActive.value = instructionData.active;
						}
					},
					(error) => {
						// Handle error
						throw error("Error:", error);
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
