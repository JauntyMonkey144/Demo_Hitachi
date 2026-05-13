/*
Name:        	UC_PE_UI_KpiProd.js
Description: 	UC_PE_UI_KpiProd js file containing global logic pertaining to the UC_PE_UI_KpiProd Form.

Ver		Release 		By				Date				Change Description
001		00.07.00 		Praveen		2024-10-03	#3445 First version.
002		00.07.00 		Praveen 	2024-10-16	#3763 Remove all lookups and update with Web api calls.
003		01.01.00 		Fayaz A		2025-05-28	#5008 Localization key update to refer from FT runtime locale file.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.PE = window.PE || {};
	PE.KpiProd = PE.KpiProd || {};
	PE.KpiProd = KpiProd();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function KpiProd() {
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
			_controls.wwProd = FORM.Control.findByXmlNode("WWHR");
			_controls.wwProdReason = FORM.Control.findByXmlNode("WWGP");
			_controls.wwRejReason = FORM.Control.findByXmlNode("WWPR");
			_controls.lblNotApplicable = FORM.Control.findByXmlNode("LBNA");

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
		 * Form load function to bind selected Time Filter and entContext values to the Chart Production Top Five form.
		 */
		function onFormLoad() {
			try {
				const timeFilterContext = FT.WorkTasks.contextGet(FORM.Control, "filter");
				const entContext = FT.WorkTasks.contextGet(FORM.Control, "ent");
				const parameterCollection = {
					Ent_Name: entContext[0].entName,
					Start_Time_utc: timeFilterContext[0].startTime,
					End_Time_utc: timeFilterContext[0].endTime,
				};

				wwGoodProdReasonLoad(parameterCollection);
				wwRejectReasonLoad(parameterCollection);
				wwProdLoad(parameterCollection);
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
		 * Get production details for displaying it on the production widget
		 * @param {Object[]} parameterCollection - Array of parameter objects ("EntName", "starttime", "endtime")
		 * @returns {JSON} data
		 */
		function wwProdLoad(parameterCollection) {
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_PE_Item_Prod_ProductionHourly", parameterCollection, false).then(
				(data) => {
					const showReport =
						data != null &&
						data.length > 0 &&
						data[0].msg !== undefined &&
						data[0].msg != null &&
						data[0].msg !== "Not supported";
					if (showReport) {
						_controls.wwProd.visible = true;
						_controls.lblNotApplicable.visible = false;
						_controls.wwProd.widgetProperties.data = JSON.stringify(data);
					} else {
						_controls.wwProd.visible = false;
						_controls.lblNotApplicable.visible = true;
					}
				},
				(error) => {
					// Handle error
					throw error("Error:", error);
				},
			);
		}

		/**
		 * Get top five good production details for displaying it on the production widget
		 * @param {Object[]} parameterCollection - Array of parameter objects ("EntName", "starttime", "endtime")
		 * @returns {JSON} data
		 */
		function wwGoodProdReasonLoad(parameterCollection) {
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_S_PE_Item_Prod_GetTop5RejectDuration", parameterCollection, false).then(
				(data) => {
					// Translate the data
					const fields = [
						FT.Ui.translationColumnField(
							"reas_desc",
							FT.Ui.TRANSLATION_GROUPS.grpItemReasReasDesc,
							FT.Ui.TRANSLATION_KEYS.keyItemReas,
						),
					];
					const translatedData = FT.Ui.translateArray(data, fields);
					_controls.wwProdReason.widgetProperties.data = JSON.stringify(translatedData);
				},
				(error) => {
					// Handle error
					throw error("Error:", error);
				},
			);
		}

		/**
		 * Get top five reject details for displaying it on the reject widget
		 * @param {Object[]} parameterCollection - Array of parameter objects ("EntName", "starttime", "endtime")
		 * @returns {JSON} data
		 */
		function wwRejectReasonLoad(parameterCollection) {
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_S_PE_Item_Prod_GetTop5RejectCount", parameterCollection, false).then(
				(data) => {
					// Translate the data
					const fields = [
						FT.Ui.translationColumnField(
							"reas_desc",
							FT.Ui.TRANSLATION_GROUPS.grpItemReasReasDesc,
							FT.Ui.TRANSLATION_KEYS.keyItemReas,
						),
					];
					const translatedData = FT.Ui.translateArray(data, fields);
					_controls.wwRejReason.widgetProperties.data = JSON.stringify(translatedData);
				},
				(error) => {
					// Handle error
					throw error("Error:", error);
				},
			);
		}
		return {
			initializeForm: initializeForm,
		};
	}
})(window);
