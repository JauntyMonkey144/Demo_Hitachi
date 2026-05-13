/*
Name:        	UC_PE_UI_KpiMachineState.js
Description: 	UC_PE_UI_KpiMachineState js file containing global logic pertaining to the UC_PE_UI_KpiMachineState Form.
Ver		Release		By				Date				Change Description
001		05.00	  	Praveen				2024-10-03	#3442 First version.
002		01.01.00 	Fayaz A			 	2025-05-20	#4932 Stored procedure sp_SA_PE_Util_Log_MachineState added to load machine state data.
003		01.01.00 	Fayaz A				2025-05-28	#5008 Localization key update to refer from FT runtime locale file.
*/ // ----------------------Immediate Functions -------- //
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.PE = window.PE || {};
	PE.KpiMachineState = PE.KpiMachineState || {};
	PE.KpiMachineState = KpiMachineState();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function KpiMachineState() {
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
			_controls.wwMachineState = FORM.Control.findByXmlNode("WWMS");

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
				const timeFilterContext = FT.WorkTasks.contextGet(FORM.Control, "filter");
				const entContext = FT.WorkTasks.contextGet(FORM.Control, "ent");

				if (entContext.length > 0) {
					const parameterCollection = {
						ent_name: entContext[0].entName,
						ent_id_line: entContext[0].entId,
						ent_id_list: entContext[0].entId,
						start_time: timeFilterContext[0].startTime,
						end_time: timeFilterContext[0].endTime,
					};
					wwMachineStateLoad(parameterCollection);
				}
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
		 * Get utilization state details for displaying it on the widget
		 * @param {Object[]} parameterCollection - Array of parameter objects ("entName", "starttime", "endtime")
		 * @returns {JSON} data
		 */
		function wwMachineStateLoad(parameterCollection) {
			try {
				const dataList = FT.WebApi.mesGetSync(
					"api/V3/DirectAccess",
					"sp_SA_PE_Util_Log_MachineState",
					parameterCollection,
					false,
				);

				if (dataList.length > 0) {
					const data = { directaccess: dataList };
					_controls.wwMachineState.widgetProperties.data = JSON.stringify(data);
				}
			} catch (exception) {
				handleScriptError(exception);
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
