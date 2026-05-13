/*
Name:        	JM_UI_JobStartOnEntity.js
Description: 	JM_UI_JobStartOnEntity js file containing global logic pertaining to the JM_UI_JobStartOnEntity Form.

Ver		Release		By						Date				Change Description
001		00.50			Ramesh V			2024-05-16	#2768 First version.
002		00.70			João Caldeira 2024-11-19	#3942 Updated form and file name from JM_UI_Start to JM_UI_JobStartOnEntity.
																					Added code to dispatch event on job start.
003		00.70			Chitta				2024-12-11  #4060 FT.Common.windowEventDispatch function must call on succefully Job Start only.
003		01.00			Fayaz a				2025-02-27  #3213 Clone of JM_UI_JobStart with extended feature of Jobs can run on entity
																					and its children with canRunJobs enabled.
*/
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.JM = window.JM || {};
	JM.JobStartOnEntity = JM.JobStartOnEntity || {};
	JM.JobStartOnEntity = JobStartOnEntity();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function JobStartOnEntity() {
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
			_controls.ddRunEntities = FORM.Control.findByXmlNode("DDRE");

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
							_controls.hfRunningEntId.value = data.run_ent_id;
							_controls.hfTargetScheduledEntId.value = data.target_sched_ent_id;

							_controls.hfRunningEntId.value = data.run_ent_id;
							_controls.hfTargetScheduledEntId.value = data.target_sched_ent_id;

							// If there is no Run_ent_id in context, pass just the Sched.Ent.id, else pass Run.Ent.Id for the dropdown //
							if (!data.run_ent_id || (data.run_ent_id && data.run_ent_id <= 0)) {
								getEntitiesCanRunJobs(data.target_sched_ent_name, "", 0);
							} else getEntitiesCanRunJobs(data.target_sched_ent_name, data.run_ent_name, data.run_ent_id);
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
		function iwJobStartOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully && blockingOutput === "") {
				FT.Common.windowEventDispatch(
					"jm",
					"jm.job.start",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"JM_UI_JobStartOnEntity",
					"jm.job.start",
				);
			}
		}
		/**
		 * Fill in the DropDown with the Entities having CanRunJobs capability: select where to run the job
		 * If the Job has already a Run_Ent_Id defined, then just propose the same again
		 * If instead the Job does not have a Run_Ent_Id (first start) then fill in the dropdown with the Ents
		 * in the chain of the Target Sched Entity that have Can Run JObs
		 */
		function getEntitiesCanRunJobs(_schedEntName, _runEntName, _runEntId) {
			// if a valid Run_Ent_Id is passed, that is taken as the one and only Entity in the dropdown, default selected //
			if (_runEntId > 0) {
				const objRunEnt = { run_ent: [] };
				objRunEnt.run_ent.push({ ent_id: _runEntId, ent_name: _runEntName });
				FT.WorkTasks.controlOptionsSetFromDataset("DDRE", 0, objRunEnt.run_ent, "ent_name", "ent_id", _runEntId, 0);
				_controls.hfTargetScheduledEntId.value = _runEntId;
			} else {
				// Else find the Entities with CanRunJobs under the Target.Sched.Ent of the job (schedule on Cell, Run on Unit) //
				const paramEntGetByFilter = { parentEntList: _schedEntName, canRunJobs: 1 };
				FT.WebApi.mesGetAsync("api/v3/Entity/filter", "", paramEntGetByFilter, false).then(
					(data) => {
						// Handle successful response data: get only Ent having CanRunJobs //
						if (data) {
							const dataEntCanRunJobs = $(data).filter((i, item) => item.can_run_jobs === true);
							// Set values to DDRE dropdown list, default value is the first in list //
							FT.WorkTasks.controlOptionsSetFromDataset(
								"DDRE",
								0,
								dataEntCanRunJobs,
								"ent_name",
								"ent_id",
								dataEntCanRunJobs[0].ent_id,
								0,
							);
							_controls.hfTargetScheduledEntId.value = dataEntCanRunJobs[0].ent_id;
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
		 * On change of selection of the Entity on which to run the Job
		 * Just assign the value to the hidden field used for starting JOb - The mapping reads from the hidden field to pass to WF
		 */
		function ddRunEntOnDataChange(selectedEntId, selectedEntName) {
			_controls.hfTargetScheduledEntId.value = selectedEntId;
		}
		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			iwJobStartOnPostWorkflow: iwJobStartOnPostWorkflow,
			ddRunEntOnDataChange: ddRunEntOnDataChange,
		};
	}
})(window);
