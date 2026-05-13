/*
Name:        	JM_UI_JobStart.js
Description: 	JM_UI_JobStart js file containing global logic pertaining to the JM_UI_JobStart Form.

Ver		Release		By						Date				Change Description
001		00.50			Ramesh V			2024-05-16	#2768 First version.
002		00.70			João Caldeira 2024-11-19	#3942 Updated form and file name from JM_UI_Start to JM_UI_JobStart.
																					Added code to dispatch event on job start.
003		00.70			Chitta				2024-12-11  #4060 FT.Common.windowEventDispatch function must call on succefully Job Start only.
004		00.70			Fayaz A				2025-03-25	#4293 Updated to set the hfRunningEntId value from entity context.
005  	01.02.00	Somya S 			2025-07-07	#5085 Added can_runjob check to enable the commands.
006		01.03.00	Somya S				2025-09-11	#5151 Not able to start the job in WO Api is updated.
*/
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.JM = window.JM || {};
	JM.JobStart = JM.JobStart || {};
	JM.JobStart = JobStart();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function JobStart() {
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;

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
			const jobContext = FT.WorkTasks.contextGet(FORM.Control, "job");
			const entContext = FT.WorkTasks.contextGet(FORM.Control, "ent");

			if (jobContext && jobContext.length > 0) {
				const parameterColl = {
					woId: jobContext[0].woId,
					operId: jobContext[0].operId,
					seqNo: jobContext[0].seqNo,
				};

				FT.WebApi.mesGetAsync("api/v3/Jobs/key", "", parameterColl, false).then(
					(data) => {
						if (data) {
							_controls.hfWoId.value = data.wo_id;
							_controls.hfOperId.value = data.oper_id;
							_controls.hfSeqNo.value = data.seq_no;
							_controls.hfTargetScheduledEntId.value = data.target_sched_ent_id;

							let isRunJobEnabled = false;

							if (entContext && entContext.length > 0) {
								const selectedEntId = entContext[0].entId;
								const parameterCol2 = { entId: selectedEntId };

								const entity = FT.WebApi.mesGetSync("api/v3/Entity/key", "", parameterCol2, false);

								if (entity && entity.can_run_jobs === true) {
									isRunJobEnabled = true;
									_controls.hfRunningEntId.value = selectedEntId;
								} else {
									_controls.hfRunningEntId.value = data.run_ent_id || "";
								}
							} else {
								_controls.hfRunningEntId.value = data.run_ent_id || "";
							}

							JM.JobStart.isRunJobEnabled = isRunJobEnabled;
						}
					},
					(error) => {
						throw new Error("Error fetching job details: " + error.message);
					},
				);
			}
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwJobStartOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully && blockingOutput === "") {
				FT.Common.windowEventDispatch("jm", "jm.job.start", FT.Common.EVENT_SOURCE_TYPE.form, "JM_UI_JobStart", "jm.job.start");
			}
		}
		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			iwJobStartOnPostWorkflow: iwJobStartOnPostWorkflow,
		};
	}
})(window);
