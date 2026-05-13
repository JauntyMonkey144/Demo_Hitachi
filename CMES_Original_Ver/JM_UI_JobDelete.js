/*
Name:        	JM_UI_JobDelete.js
Description: 	JM_UI_JobDelete js file containing global logic pertaining to the JM_UI_JobDelete Form.

Ver		Release		By						Date				Change Description
001		00.50		Ramesh V		 	2024-04-29	#2769 First version.
002		00.70		João Caldeira 		2024-11-19	#3942 Updated form and file name from JM_UI_Delete to JM_UI_JobDelete.
																					Added code to dispatch event on job delete.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.JM = window.JM || {};
	JM.JobDelete = JM.JobDelete || {};
	JM.JobDelete = JobDelete();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function JobDelete() {
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
			_controls.hfWoId = FORM.Control.findByXmlNode("HFWID");
			_controls.hfOperId = FORM.Control.findByXmlNode("HFOID");
			_controls.hfSeqNo = FORM.Control.findByXmlNode("HFSNO");
			_controls.hfRunningEntId = FORM.Control.findByXmlNode("HFREID");
			_controls.hfTargetScheduledEntId = FORM.Control.findByXmlNode("HFTSEID");

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
			const jobContext = FT.WorkTasks.contextGet(FORM.Control, "job");
			let jobDetails;
			let parameterColl;
			if (jobContext && jobContext.length > 0) {
				// fetch job details from API
				parameterColl = { woId: jobContext[0].woId, operId: jobContext[0].operId, seqNo: jobContext[0].seqNo };
				FT.WebApi.mesGetAsync("api/v3/Jobs/key", "", parameterColl, false).then(
					(data) => {
						// Handle successful response data
						if (data) {
							jobDetails = data;
							// Set values to respective controls
							_controls.hfWoId.value = jobDetails.wo_id;
							_controls.hfOperId.value = jobDetails.oper_id;
							_controls.hfSeqNo.value = jobDetails.seq_no;
							_controls.hfRunningEntId.value = jobDetails.run_ent_id;
							_controls.hfTargetScheduledEntId.value = jobDetails.target_sched_ent_id;
						}
					},
					(error) => {
						// Handle error
						throw new Error("Error:", error);
					},
				);
			}
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwJobDeletOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"jm",
					"jm.job.delete",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"JM_UI_JobDelete",
					"jm.job.delete",
				);
			}
		}
		/**
		 * Define which functions/properties are to be made public.
		 */

		return {
			initializeForm: initializeForm,
			iwJobDeletOnPostWorkflow: iwJobDeletOnPostWorkflow,
		};
	}
})(window);
