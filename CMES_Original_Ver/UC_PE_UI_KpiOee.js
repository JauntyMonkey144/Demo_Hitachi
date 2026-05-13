/*
Name:        	UC_PE_UI_KpiOee.js
Description: 	UC_PE_UI_KpiOee js file containing global logic pertaining to the UC_PE_UI_KpiOee Form.

Ver		Release 		By				Date				Change Description
001		00.05.00		PR			 	2024-10-03	#3444 First version.
002		00.05.00		PR 	  		2024-10-16	#3763 Remove all lookups and update with Web api calls.
003		01.01.00 		Fayaz A		2025-05-28	#5008 Localization key update to refer from FT runtime locale file.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.PE = window.PE || {};
	PE.KpiOee = PE.KpiOee || {};
	PE.KpiOee = KpiOee();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function KpiOee() {
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
			_controls.wwAvailability = FORM.Control.findByXmlNode("WWAV");
			_controls.wwPerformance = FORM.Control.findByXmlNode("WWPR");
			_controls.wwQuality = FORM.Control.findByXmlNode("WWQA");
			_controls.wwOEE = FORM.Control.findByXmlNode("WWOEE");

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
		 * Form load function to bind selected Time Filter and entContext values to the OEE KPI form.
		 */
		function onFormLoad() {
			try {
				// Retrieve time filter context and entity context
				const timeFilterContext = FT.WorkTasks.contextGet(FORM.Control, "filter");
				const entContext = FT.WorkTasks.contextGet(FORM.Control, "ent");
				// Construct parameter collection for data loading
				const parameterCollection = {
					entid: entContext[0].entId,
					starttime: timeFilterContext[0].startTime,
					endtime: timeFilterContext[0].endTime,
				};
				// Load data for different widgets based on parameter collection
				wwAvailabilityLoad(parameterCollection);
				wwPerformaceLoad(parameterCollection);
				wwQualityLoad(parameterCollection);
				wwOEELoad(parameterCollection);
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
		 * Get OEE Availability details for displaying it on widget with parameter collection
		 * @param {Object[]} parameterCollection - Array of parameter objects ("entid", "starttime", "endtime").
		 * @returns {JSON} data
		 */
		function wwAvailabilityLoad(parameterCollection) {
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_S_PE_Ent_Kpi", parameterCollection, false).then(
				(data) => {
					_controls.wwAvailability.widgetProperties.data = JSON.stringify(data);
				},
				(error) => {
					// Handle error
					throw error("Error:", error);
				},
			);
		}

		/**
		 * Get OEE Performance details for displaying it on widget with parameter collection
		 * @param {Object[]} parameterCollection - Array of parameter objects ("entid", "starttime", "endtime")
		 * @returns {JSON} data
		 */
		function wwPerformaceLoad(parameterCollection) {
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_S_PE_Ent_Kpi", parameterCollection, false).then(
				(data) => {
					_controls.wwPerformance.widgetProperties.data = JSON.stringify(data);
				},
				(error) => {
					// Handle error
					throw error("Error:", error);
				},
			);
		}

		/**
		 * Get OEE Quality details for displaying it on widget with parameter collection
		 * @param {Object[]} parameterCollection - Array of parameter objects ("entid", "starttime", "endtime")
		 * @returns {JSON} data
		 */
		function wwQualityLoad(parameterCollection) {
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_S_PE_Ent_Kpi", parameterCollection, false).then(
				(data) => {
					_controls.wwQuality.widgetProperties.data = JSON.stringify(data);
				},
				(error) => {
					// Handle error
					throw error("Error:", error);
				},
			);
		}

		/**
		 * Get OEE details for displaying it on widget with parameter collection
		 * @param {Object[]} parameterCollection - Array of parameter objects ("entid", "starttime", "endtime")
		 * @returns {JSON} data
		 */
		function wwOEELoad(parameterCollection) {
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_S_PE_Ent_Kpi", parameterCollection, false).then(
				(data) => {
					_controls.wwOEE.widgetProperties.data = JSON.stringify(data);
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
