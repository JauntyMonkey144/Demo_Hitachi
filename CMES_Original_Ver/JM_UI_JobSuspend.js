/*
Name:        	JM_UI_JobSuspend.js
Description: 	JM_UI_JobSuspend js file containing global logic pertaining to the JM_UI_JobSuspend Form.

Ver		Release		By				Date		Change Description
001		00.50		Ramesh V		2024-05-16	#2622 First version.
002		00.70		João Caldeira   2024-11-19	#3942 Updated form and file name from JM_UI_Suspend to JM_UI_JobSuspend.
																					Added code to dispatch event on job suspend.
003		00.70		Fayaz A			2025-03-25	#4293 Updated to set the hfRunningEntId value from entity context.
004     02.00.00    Praveen         2025-09-12	#5257	Remove the hard-coded values from the workflows.
*/
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.JM = window.JM || {};
	JM.JobSuspend = JM.JobSuspend || {};
	JM.JobSuspend = JobSuspend();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function JobSuspend() {
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/FT_Common.css"];
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
			_controls.hfTargetScheduledEntId = FORM.Control.findByXmlNode("HFSTEID");
			_controls.hfJobStateCd = FORM.Control.findByXmlNode("HFSTC");

			// Include js files
			includeJsFiles();

			// Include js files via ajax
			includeJsFilesAjax();

			// Include CSS files
			includeCssFiles();

			// Add code here
			onFormLoad();
			window.onbeforeunload = confirmExit;
		}

		/**
		 * Closes the form.
		 */
		function confirmExit() {
			SFU.closeForm();
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
		 * Define which functions/properties are to be made public.
		 */
		function onFormLoad() {
			
			// get context value of job & or setValue to hidden fields
			const jobContext = FT.WorkTasks.contextGet(FORM.Control, "job");
			// get context value of ent
			const entContext = FT.WorkTasks.contextGet(FORM.Control, "ent");
			let parameterColl;
			if (jobContext && jobContext.length > 0) {
				// fetch job details from API
				parameterColl = { woId: jobContext[0].woId, operId: jobContext[0].operId, seqNo: jobContext[0].seqNo };
				FT.WebApi.mesGetAsync("api/v3/Jobs/key", "", parameterColl, false).then(
					(data) => {
						// Handle successful response data
						if (data) {
							// Set values to respective controls
							_controls.hfWoId.value = data.wo_id;
							_controls.hfOperId.value = data.oper_id;
							_controls.hfSeqNo.value = data.seq_no;
							_controls.hfTargetScheduledEntId.value = data.target_sched_ent_id;

							// set the running ent id from entity context
							_controls.hfRunningEntId.value = entContext[0].entId;
							_controls.hfJobStateCd.value =  FT.Common.MES_JOB_STATE_CD.suspended;
						}
					},
					(error) => {
						// Handle error
						throw new Error("Error:", error);
					},
				);
			}
		} /**
		 * Performs actions after the execution of a workflow.
		 */
		function iwJobSuspendOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"jm",
					"jm.job.suspend",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"JM_UI_JobSuspend",
					"jm.job.suspend",
				);
			}
		}
		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			iwJobSuspendOnPostWorkflow: iwJobSuspendOnPostWorkflow,
		};
	}
})(window);
