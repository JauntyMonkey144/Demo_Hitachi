/*
Name:        	UC_JM_UI_Checklist.js
Description: 	UC_JM_UI_Checklist js file containing logic pertaining to the UC_JM_UI_Checklist Form.
				This form is intended for the showcase of a Pre/Post Checklist to the operator based on conditions
				like Start Job, Stop Job, Set Job Spare

Ver		By						Date							Change Description
001		Lewis W					2024-08-21			#2768 First version.
002		Lewis W					2024-08-21			Changes made to config group names for checklist and remove BASEGRID_CONF
003		Usha M 					2025-02-26			#4358 UpdateSpare() and Console.log() are removed.
*/
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.UCJM = window.UCJM || {};
	UCJM.Checklist = UCJM.Checklist || {};
	UCJM.Checklist = Checklist();

	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function Checklist() {
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;
		const _controls = {};
		const grpId = "UC_JM_Checklist";
		const qsetgrpid = "UC_JM_ChecklistQuestions";
		// ----------------------------------------------------------------------------------

		// ----------------------------- Private Variables ----------------------------------

		let userInfo = "";
		let mesUserId = "";
		let selectedCard = "";
		let data = "";

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
			_controls.wwConfig = FORM.Control.findByXmlNode("WWC");
			_controls.hfJobSpare = FORM.Control.findByXmlNode("HFJS");
			_controls.hfEnableButton = FORM.Control.findByXmlNode("HFBE");

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
			userInfo = FT.WorkTasks.userInfo();
			mesUserId = userInfo.MESUserId !== undefined ? userInfo.MESUserId.replace(/\\/g, "\\\\") : null;
			selectedCard = FT.WorkTasks.contextGet(FORM.Control, "eventData");
			data = JSON.parse(selectedCard[0].jsonValue);

			wwConfigLoad(data);

			// get context value of job & or setValue to hidden fields
			const jobContext = data;

			let jobDetails;
			let parameterColl;
			if (jobContext && jobContext.length > 0) {
				// fetch job details from API
				parameterColl = { woId: jobContext[0].woId, operId: jobContext[0].operId, seqNo: jobContext[0].seqNo };
				FT.WebApi.mesGetAsync("api/v3/Jobs/key", "", parameterColl, false).then(
					(jobs) => {
						// Handle successful response data
						if (jobs) {
							jobDetails = jobs;
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
		 * bind widget as per groupId selected
		 */
		function wwConfigLoad(evendata) {
			userInfo = FT.WorkTasks.userInfo();
			mesUserId = userInfo.MESUserId !== undefined ? userInfo.MESUserId.replace(/\\/g, "\\\\") : null;
			try {
				const parameterCollection = {
					grp_id: grpId,
					qset_grp_id: qsetgrpid,
					ent_name: evendata[0].ent_name,
					wo_id: evendata[0].woId,
					oper_id: evendata[0].operId,
					seq_no: evendata[0].seqNo,
					user_id: mesUserId,
				};
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_S_UC_JM_Cklist_Qset", parameterCollection, false).then(
					(jobchklst) => {
						_controls.wwConfig.widgetProperties.data = JSON.stringify(jobchklst);
						// Set the action
						_controls.hfEnableButton.value = jobchklst[0].action;
						_controls.hfJobSpare.value = jobchklst[0].action_val;
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
		 * post workflow execution job start.
		 * @param blockingOutput
		 * @returns {boolean} Description of the return value.
		 */
		function postWfJobStart(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"jm",
					"jm.job.start",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"UC_JM_UI_Checklist",
					"jm.job.start",
				);
			}
		}

		/**
		 * post workflow execution job start.
		 * @param blockingOutput
		 * @returns {boolean} Description of the return value.
		 */
		function postWfJobEnd(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch("jm", "jm.job.stop", FT.Common.EVENT_SOURCE_TYPE.form, "UC_JM_UI_Checklist", "jm.job.stop");
			}
		}

		/**
		 * enable job start button
		 * @returns
		 */
		function enableJobStart() {
			const wwBaseGrid = _controls.wwConfig;
			return wwBaseGrid.value;
		}

		/**
		 * enable job end button
		 * @returns
		 */
		function enableJobEnd() {
			const wwBaseGrid = _controls.wwConfig;
			return wwBaseGrid.value;
		}

		/**
		 * visible job start button
		 * @returns
		 */
		function visibleJobStart() {
			return _controls.hfEnableButton.value === "StartJob";
		}
		/**
		 * visible job end button
		 * @returns
		 */
		function visibleJobEnd() {
			return _controls.hfEnableButton.value === "CompleteJob";
		}
		/**
		 * enable job spare button
		 * @returns
		 */
		function enableJobSpare() {
			const wwBaseGrid = _controls.wwConfig;
			return wwBaseGrid.value;
		}
		/**
		 * visible job spare button
		 * @returns
		 */
		function visibleJobSpare() {
			return _controls.hfEnableButton.value === "JobSpare";
		}
		/**
		 * enable job spare button
		 * @returns
		 */
		function enableJobSpareButton() {
			const wwBaseGrid = _controls.wwConfig;
			return wwBaseGrid.value;
		}

		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			postWfJobStart: postWfJobStart,
			postWfJobEnd: postWfJobEnd,
			enableJobStart: enableJobStart,
			enableJobEnd: enableJobEnd,
			visibleJobStart: visibleJobStart,
			visibleJobEnd: visibleJobEnd,
			enableJobSpare: enableJobSpare,
			visibleJobSpare: visibleJobSpare,
			enableJobSpareButton: enableJobSpareButton,
		};
	}
})(window);
