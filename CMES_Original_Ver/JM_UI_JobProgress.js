/*
Name:        	JM_UI_JobProgress.js
Description: 	JM_UI_JobProgress js file containing logic pertaining to the JM_UI_JobProgress Form.

Ver		Release		By							Date				Change Description
001		00.50			Fayaz						2024-05-27	#2778 First version.
002 	00.70			Shamanth S			2024-10-14 	#3759 Removed getLookupSchemaAndData and accessing data using Web Api.
003		00.70			João Caldeira 	2024-11-19	#3942 Updated form and file name from JM_UI_Progress to JM_UI_JobProgress.
004		01.00			Bas van Buuren	2025-02-24	#4253 Translated MD in job progress data.
005	 	01.01.00 	Fayaz A					2025-05-28	#5008 Localization key update to refer from FT runtime locale file.
006		01.03.01 	Fayaz A					2025-12-02	#5242 Modification done for setJobProgressData to handle the
																						job progress of selected card type "JOB" when multiple job is
																						running for selected entity.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.JM = window.JM || {};
	JM.JobProgress = JM.JobProgress || {};
	JM.JobProgress = JobProgress();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function JobProgress() {
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;
		const REFRESH_DURATION_IN_MILLISECONDS = 10000;
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
			_controls.wwJobProgress = FORM.Control.findByXmlNode("WWJP");

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
			try {
				let entName = "";
				if (
					FORM.Control.formParameters.entId !== undefined &&
					FORM.Control.formParameters.entId.value != null &&
					FORM.Control.formParameters.entId.value !== ""
				) {
					if (
						FORM.Control.formParameters.entName !== undefined &&
						FORM.Control.formParameters.entName.value != null &&
						FORM.Control.formParameters.entName.value !== ""
					) {
						entName = FORM.Control.formParameters.entName.value;
					}
				} else {
					const entContext = FT.WorkTasks.contextGet(FORM.Control, "ent");
					entName = entContext[0].entName;
				}

				// Set job progress of the running work order on the entity
				setJobProgressData(entName, FT.Common.MES_JOB_STATE_CD.running);
				setInterval(() => {
					setJobProgressData(entName, FT.Common.MES_JOB_STATE_CD.running);
				}, REFRESH_DURATION_IN_MILLISECONDS);
			} catch (exception) {
				handleScriptError(exception);
			} finally {
				logExecutionTime();
			}
		}
		/**
		 * Set work order detail for displaying it on the progress bar
		 * @param {string} entity
		 * @param {string} status
		 * @returns {string} Job progress data
		 */
		function setJobProgressData(entity, status) {
			const parameterColl = {
				ent_name: entity,
				status: status,
			};
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "SP_S_JM_Job_Progress", parameterColl, false).then(
				(data) => {
					let jobProgressData = data;
					if (jobProgressData && jobProgressData.length > 1) {
						// Get the context of the current job that was set on Card selection //
						const jobContext = FT.WorkTasks.contextGet(FORM.Control, "job");

						// scan the returned dataset: if only 1 record that is it --
						//  if multiple records pick the one corresponding to job card selected //
						let jobContextData = null;
						jobProgressData.forEach((job) => {
							if (job.wo_id === jobContext[0].woId && job.oper_id === jobContext[0].operId && job.seq === jobContext[0].seqNo) {
								jobContextData = job;
							}
						});
						// re-init the dataset with the only job //
						if (jobContextData) {
							jobProgressData.splice(1, Infinity);
							jobProgressData[0] = jobContextData;
						}
					}
					// Check if data is received
					if (jobProgressData != null && jobProgressData.length > 0) {
						// Translate the data
						const fields = [
							FT.Ui.translationColumnField("entity", FT.Ui.TRANSLATION_GROUPS.grpEntDescription, ["entity"]),
							FT.Ui.translationColumnField("item_desc", FT.Ui.TRANSLATION_GROUPS.grpItemItemDesc, ["item"]),
							FT.Ui.translationColumnField("job_desc", FT.Ui.TRANSLATION_GROUPS.grpOperOperDesc, FT.Ui.TRANSLATION_KEYS.keyOper),
							FT.Ui.translationColumnField("status", FT.Ui.TRANSLATION_GROUPS.grpJobStateStateDesc, ["status"]),
						];
						jobProgressData = FT.Ui.translateArray(jobProgressData, fields);
					}
					// Handle successful response data
					_controls.wwJobProgress.widgetProperties.data = JSON.stringify(jobProgressData);
				},
				(error) => {
					// Handle error
					throw Error("Error:", error);
				},
			);
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
		 * log execution time in skelta
		 */
		function logExecutionTime() {
			const skFnExecutionStartTime = new Date();
			FT.WorkTasks.logMessage("Execution time: " + (new Date() - skFnExecutionStartTime) + "ms");
		}

		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
		};
	}
})(window);
