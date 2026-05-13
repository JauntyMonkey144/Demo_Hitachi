/*
Name:        	JM_UI_JobSplit.js
Description: 	JM_UI_JobSplit js file containing global logic pertaining to the JM_UI_JobSplit Form.

Ver		Release		By				Date		Change Description
001		02.00.00	Praveen			2025-12-15	#5270 Added job split functionality
*/
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.JM = window.JM || {};
	JM.JobSplit = JM.JobSplit || {};
	JM.JobSplit = JobSplit();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function JobSplit() {
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
		const minValue = 1;
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
			_controls.txJobDesc = FORM.Control.findByXmlNode("TXDESC");
			_controls.txStartQty = FORM.Control.findByXmlNode("TXSQTY");
			_controls.nrReqQty = FORM.Control.findByXmlNode("NRRQTY");

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
			// get context value of ent
			const entContext = FT.WorkTasks.contextGet(FORM.Control, "ent");
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
							_controls.txJobDesc.value = jobDetails.oper_id;
							_controls.hfWoId.value = jobDetails.wo_id;
							_controls.hfOperId.value = jobDetails.oper_id;
							_controls.hfSeqNo.value = jobDetails.seq_no;
							_controls.hfTargetScheduledEntId.value = jobDetails.target_sched_ent_id;
							_controls.txStartQty.value = jobDetails.qty_at_start;
							_controls.nrReqQty.value = (jobDetails.qty_reqd - jobDetails.qty_prod) / 2;
							_controls.nrReqQty.min = minValue;
							// set the running ent id from entity context
							_controls.hfRunningEntId.value = entContext[0].entId;
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
		function iwJobSplitOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch("jm", "jm.job.split", FT.Common.EVENT_SOURCE_TYPE.form, "JM_UI_JobSplit", "jm.job.split");
			}
		}
		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			iwJobSplitOnPostWorkflow: iwJobSplitOnPostWorkflow,
		};
	}
})(window);
