/*
Name:        	JM_UI_StepStart.js
Description: 	JM_UI_StepStart js file containing global logic pertaining to the JM_UI_StepStart Form.

Ver		Release	  	By					Date				Change Description
001		00.70	    Krishna M			2024-09-05			#3674 functinality to fetch job step by row_id for step_no and ent_id.
002     02.00.00    Praveen             2025-09-12	        #5257	Remove the hard-coded values from the workflows.
*/
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.JM = window.JS || {};
	JM.StepStart = JM.StepStart || {};
	JM.StepStart = StepStart();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function StepStart() {
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;

		// ----------------------------- Private Variables ----------------------------------
		let data = "";
		const _controls = {};
		const jobPos = 0;
		const stepStartStateCD = 3;
		const checkCert = 1;
		const laborOption = 1;
		const timeZoneBiasValue = 0;
		// ----------------------------------------------------------------------------------
		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			// Initialize variables
			FORM.Control = Control;
			_controls.hfEntId = FORM.Control.findByXmlNode("HFEI");
			_controls.hfStepNumber = FORM.Control.findByXmlNode("HFSN");
			_controls.hfUserId = FORM.Control.findByXmlNode("HFUI");
			_controls.hfJob_Pos = FORM.Control.findByXmlNode("HFJBP");
			_controls.hfState_CD= FORM.Control.findByXmlNode("HFSTC");
			_controls.hfCheck_Cert= FORM.Control.findByXmlNode("HFCHC");
			_controls.hfLabor_Option = FORM.Control.findByXmlNode("HFLBOP");
			_controls.hfTime_Zone_Bias_Value = FORM.Control.findByXmlNode("HFTZBV");


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
			let selectedCard = "";
			// get context value of job & or setValue to hidden fields
			selectedCard = FT.WorkTasks.contextGet(FORM.Control, "eventData");
			_userInfo = FT.WorkTasks.userInfo();
			mesUserId = _userInfo.MESUserId !== undefined ? _userInfo.MESUserId.replace(/\\/g, "\\\\") : null;
			data = JSON.parse(selectedCard[0].jsonValue);
			if (data && data.length > 0) {
				// fetch job details from API
				const parameterCollection = {
					row_id: data[0].row_id,
				};
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_S_JM_Job_Step", parameterCollection, false).then(
					(spdata) => {
						// Handle successful response data
						if (spdata.length > 0) {
							// Set values to respective controls
							_controls.hfStepNumber.value = spdata[0].step_no;
							_controls.hfEntId.value = data[0].ent_id;
							_controls.hfUserId.value = mesUserId;
							_controls.hfJob_Pos.value = jobPos;
							_controls.hfState_CD.value = stepStartStateCD;
							_controls.hfCheck_Cert.value = checkCert;
							_controls.hfLabor_Option.value = laborOption;
							_controls.hfTime_Zone_Bias_Value.value = timeZoneBiasValue;
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
		function iwStepStartOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"jm",
					"jm.jobStep.start",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"JM_UI_StepStart",
					"jm.jobStep.start",
				);
			}
		}
		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			iwStepStartOnPostWorkflow: iwStepStartOnPostWorkflow,
		};
	}
})(window);
