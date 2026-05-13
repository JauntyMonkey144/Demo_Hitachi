/*
Name:					JM_UI_JobStepHeader.js
Description:	The JM_UI_JobStepHeader.js js file containing logic pertaining to the JM_UI_JobStepHeader Form.

Ver 	Release		By				Date				Change Description
001 	00.70.00	Wilwin L  2024-11-08	First version of the file.
002 	01.00.00	Fayaz A   2025-02-20  #4116 Moved from use case to module level, UC_JM_UI_JobStepHeader to JM_UI_JobStepHeader.
																			Updated function setOEEData to use sp_S_JM_Ent_Kpi procedure.
003		01.00.00	Bas van B	2025-02-24	#4253 Translates MD in job step header.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.JM = window.JM || {};
	JM.JobStepHeader = JM.JobStepHeader || {};
	JM.JobStepHeader = JobStepHeader();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function JobStepHeader() {
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};

		// ----------------------------------------------------------------------------------

		// ----------------------------- Private Variables ----------------------------------
		const _controls = {};
		FORM.Control = null;
		let userInfo = "";

		let entId = 1;

		// ----------------------------------------------------------------------------------
		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			// Initialize variables
			FORM.Control = Control;

			_controls.wwOEE = FORM.Control.findByXmlNode("WWOEE");
			_controls.wwJobStepInfo = FORM.Control.findByXmlNode("WWJS");

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
		 * Form load function to bind cards with respect to entity from form parameters or if session variable EntID
		 */
		function onFormLoad() {
			// Following code is added to support pdf files to load inside an iframe
			userInfo = FT.WorkTasks.userInfo();
			mesUserId = userInfo.MESUserId !== undefined ? userInfo.MESUserId.replace(/\\/g, "\\\\") : null;

			if (
				FORM.Control.formParameters.entId !== undefined &&
				FORM.Control.formParameters.entId.value != null &&
				FORM.Control.formParameters.entId.value !== ""
			) {
				entId = FORM.Control.formParameters.entId.value;
				if (
					FORM.Control.formParameters.entName !== undefined &&
					FORM.Control.formParameters.entName.value != null &&
					FORM.Control.formParameters.entName.value !== ""
				) {
					entName = FORM.Control.formParameters.entName.value;
				}
			} else {
				const entContext = FT.WorkTasks.contextGet(FORM.Control, "ent");
				entId = entContext[0].entId;
				entName = entContext[0].entName;
			}

			wwJobStepInfoDataLoad();
			// Set OEE data
			setOEEData(entId);
		}

		/**
		 * Set current Shift OEE
		 * @param {int} entId
		 * @returns
		 */
		function setOEEData() {
			const parameterCollection = {
				ent_id: entId,
			};
			let OEEData = "";
			OEEData = FT.WebApi.mesGetSync("api/V3/DirectAccess", "sp_S_JM_Ent_Kpi", parameterCollection, false);
			if (OEEData.length === 0) {
				throw new Error("@@Lookup_Not_Found@@");
			}
			_controls.wwOEE.widgetProperties.data = JSON.stringify(OEEData);
		}

		/**
		 * Set job steps data to wwJobStepInfo widget
		 */
		function wwJobStepInfoDataLoad() {
			try {
				const parameterCollection = {
					ent_id: entId,
				};
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "SP_SA_JM_Job_Step", parameterCollection, false).then(
					(data) => {
						let jobStateInfoData = data;
						// Check if data is received
						if (jobStateInfoData != null && jobStateInfoData.length > 0) {
							// Translate the job state data
							const fields = [
								FT.Ui.translationColumnField(
									"step_desc",
									FT.Ui.TRANSLATION_GROUPS.grpOperStepStepDesc,
									FT.Ui.TRANSLATION_KEYS.keyOperStep,
								),
								FT.Ui.translationColumnField("step_state_desc", FT.Ui.TRANSLATION_GROUPS.grpJobStateStateDesc, [
									"step_state_desc",
								]),
							];
							jobStateInfoData = FT.Ui.translateArray(jobStateInfoData, fields);
						}
						_controls.wwJobStepInfo.widgetProperties.data = JSON.stringify(jobStateInfoData);
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
		 * @param {*} error
		 */
		function handleScriptError(error) {
			let errorMessage;

			if (error instanceof TypeError) {
				errorMessage = skelta.localize.getString("@@TD_UnexpectedType@@");
			} else if (error instanceof ReferenceError) {
				errorMessage = skelta.localize.getString("@@TD_ReferenceError@@");
			} else {
				errorMessage = skelta.localize.getString("@@TD_DuringScriptExecution@@");
			}
			SFU.showError(skelta.localize.getString("FormNGFErrorRunningScript_title"), errorMessage, null, error.message);

			throw errorMessage;
		}

		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
		};
	}
})(window);
