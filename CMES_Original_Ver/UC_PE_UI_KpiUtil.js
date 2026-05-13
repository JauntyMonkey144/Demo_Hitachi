/*
Name:        	UC_PE_UI_KpiUtil.js
Description: 	UC_PE_UI_KpiUtil js file containing global logic pertaining to the UC_PE_UI_KpiUtil Form.

Ver		Release 		By				Date				Change Description
001		01.01.00 		PR			 	2024-10-03	#3443 First version.
002		01.01.00 		PR 	  		2024-10-16	#3763 Remove all lookups and update with Web api calls.
003		01.01.00 		BB				2025-02-27	#4253 Translated util reason descriptions in graphs.
004		01.01.00 		Fayaz A		2025-05-28	#5008 Localization key update to refer from FT runtime locale file.
005		01.03.00 		Praveen		2025-05-07	#5131 create new variable (probably a boolean) that indicates whether to
                                              include the "running" state in the result.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.PE = window.PE || {};
	PE.KpiUtil = PE.KpiUtil || {};
	PE.KpiUtil = KpiUtil();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function KpiUtil() {
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
		const runningState = false;

		// ----------------------------------------------------------------------------------
		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			// Initialize variables
			FORM.Control = Control;
			_controls.wwReasonDuration = FORM.Control.findByXmlNode("WWRD");
			_controls.wwReasonCount = FORM.Control.findByXmlNode("WWRC");

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
		 * Form load function to bind selected Time Filter and entContext values to the form
		 */
		function onFormLoad() {
			try {
				const timeFilterContext = JSON.parse(JSON.stringify(FT.WorkTasks.contextGet(FORM.Control, "filter")));
				const entContext = JSON.parse(JSON.stringify(FT.WorkTasks.contextGet(FORM.Control, "ent")));
				const parameterCollection = {
					ent_id: entContext[0].entId,
					StartTime: timeFilterContext[0].startTime,
					EndTime: timeFilterContext[0].endTime,
					includeRunningState: runningState,
				};
				wwReasonDurationLoad(parameterCollection);
				wwReasonCountLoad(parameterCollection);
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
		function wwReasonDurationLoad(parameterCollection) {
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_S_PE_Util_Log_GetTop5UtilDuration", parameterCollection, false).then(
				(data) => {
					// Translate the reason descriptions
					const fields = [
						FT.Ui.translationColumnField(
							"reas_desc",
							FT.Ui.TRANSLATION_GROUPS.grpUtilReasReasDesc,
							FT.Ui.TRANSLATION_KEYS.keyUtilReas,
						),
					];
					const translatedData = FT.Ui.translateArray(data, fields);
					_controls.wwReasonDuration.widgetProperties.data = JSON.stringify(translatedData);
				},
				(error) => {
					// Handle error
					throw error("Error:", error);
				},
			);
		}

		/**
		 * Load Performace widget
		 * @param {Object[]} parameterCollection - Array of parameter objects ("EntName", "starttime", "endtime")
		 * @returns {JSON} data
		 */
		function wwReasonCountLoad(parameterCollection) {
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_S_PE_Util_Log_GetTop5UtilCount", parameterCollection, false).then(
				(data) => {
					// Translate the reason descriptions
					const fields = [
						FT.Ui.translationColumnField(
							"reas_desc",
							FT.Ui.TRANSLATION_GROUPS.grpUtilReasReasDesc,
							FT.Ui.TRANSLATION_KEYS.keyUtilReas,
						),
					];
					const translatedData = FT.Ui.translateArray(data, fields);
					_controls.wwReasonCount.widgetProperties.data = JSON.stringify(translatedData);
				},
				(error) => {
					// Handle error
					throw error("Error:", error);
				},
			);
		}

		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
		};
	}
})(window);
