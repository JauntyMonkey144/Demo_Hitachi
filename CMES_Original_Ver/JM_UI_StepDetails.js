/*
Name:        	JM_UI_StepDetails.js
Description: 	JM_UI_StepDetails js file containing global logic pertaining to the JM_UI_StepDetails Form.

Ver		Release		By					Date				Change Description
001		00.70  		Krishna	M		2024-09-05	#3673 functinality to fetch job step by row_id.
002		01.00			Bas van B		2025-02-24	#4253 Translated MD in details screen.

*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.JM = window.JM || {};
	JM.StepDetails = JM.StepDetails || {};
	JM.StepDetails = StepDetails();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function StepDetails() {
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
		let data = "";
		// ----------------------------------------------------------------------------------

		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			// Initialize variables
			FORM.Control = Control;
			_controls.txStepName = FORM.Control.findByXmlNode("TXSN");
			_controls.txStepDescription = FORM.Control.findByXmlNode("TXSD");
			_controls.txtStepStatus = FORM.Control.findByXmlNode("TXSS");
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

		/**
		 * Form load function
		 */
		function onFormLoad() {
			let selectedCard = "";
			selectedCard = FT.WorkTasks.contextGet(FORM.Control, "eventData");
			data = JSON.parse(selectedCard[0].jsonValue);
			// pass the selected job step card's row_id
			loadStepDetails(data != null ? data[0].row_id : 132);
		}
		/**
		 * Set step details
		 * @param {int} rowId
		 * @returns
		 */
		function loadStepDetails(rowId) {
			try {
				_controls.txStepDescription.value = "";
				_controls.txStepName.value = "";
				_controls.txtStepStatus.value = "";
				const parameterCollection = {
					row_id: rowId,
				};
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_S_JM_Job_Step", parameterCollection, false).then(
					(spdata) => {
						if (spdata != null && spdata.length > 0) {
							// Translate the data
							const fields = [
								FT.Ui.translationColumnField(
									"step_desc",
									FT.Ui.TRANSLATION_GROUPS.grpOperStepStepDesc,
									FT.Ui.TRANSLATION_KEYS.keyOperStep,
								),
								FT.Ui.translationColumnField(
									"state_desc",
									FT.Ui.TRANSLATION_GROUPS.grpJobStateStateDesc,
									FT.Ui.TRANSLATION_KEYS.keyJobState,
								),
							];
							const [stepData] = FT.Ui.translateArray(spdata, fields);

							// Update UI
							_controls.txStepName.value = stepData.step_name;
							_controls.txStepDescription.value = stepData.step_desc;
							_controls.txtStepStatus.value = stepData.state_desc;
						}
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
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			loadStepDetails: loadStepDetails,
		};
	}
})(window);
