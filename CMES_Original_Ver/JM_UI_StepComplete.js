/*
Name:        	JM_UI_StepComplete.js
Description: 	JM_UI_StepComplete js file containing global logic pertaining to the JM_UI_StepComplete Form.

Ver		Release	 	By					Date							Change Description
001		00.70	    Krishna	M			2024-09-05					#3675 functinality to fetch job step by row_id.
*/
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.JM = window.JM || {};
	JM.StepComplete = JM.StepComplete || {};
	JM.StepComplete = StepComplete();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function StepComplete() {
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;
		const CHECK_CERT = 1;
		const LABOR_OPTION = 0;
		const TIME_ZONE_BIAS_VALUE = 0;
		const STEP_COMPLETE_SATE_CD = 4;
		// ----------------------------------------------------------------------------------

		// ----------------------------- Private Variables ----------------------------------

		let data = "";
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
			_controls.hfSessionId = FORM.Control.findByXmlNode("HFSI");
			_controls.hfUserId = FORM.Control.findByXmlNode("HFUI");
			_controls.hfEntId = FORM.Control.findByXmlNode("HFEI");
			_controls.hfJobPos = FORM.Control.findByXmlNode("HFJP");
			_controls.hfStepNo = FORM.Control.findByXmlNode("HFSN");
			_controls.hfLotNo = FORM.Control.findByXmlNode("HFLN");
			_controls.hfSublotNo = FORM.Control.findByXmlNode("HFSLN");
			_controls.hfStateCd = FORM.Control.findByXmlNode("HFSC");
			_controls.hfCheckCert = FORM.Control.findByXmlNode("HFCC");
			_controls.hfLaborOption = FORM.Control.findByXmlNode("HFLO");
			_controls.hfTimeZoneBiasVal = FORM.Control.findByXmlNode("HFTZ");

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
			data = JSON.parse(selectedCard[0].jsonValue);
			if (data && data.length > 0) {
				// fetch job details from API
				const parameterCollection = {
					row_id: data[0].row_id,
				};

				const _userInfo = FT.WorkTasks.userInfo();
				mesUserId = _userInfo.MESUserId !== undefined ? _userInfo.MESUserId.replace(/\\/g, "\\\\") : null;
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_S_JM_Job_Step", parameterCollection, false).then(
					(spdata) => {
						// Handle successful response data
						if (spdata.length > 0) {
							// Set values to respective controls
							_controls.hfSessionId.value = null;
							_controls.hfUserId.value = mesUserId;
							_controls.hfEntId.value = data[0].ent_id;
							_controls.hfJobPos.value = data[0].job_pos;
							_controls.hfStepNo.value = spdata[0].step_no;
							_controls.hfLotNo.value = "-";
							_controls.hfSublotNo.value = null;
							_controls.hfStateCd.value = STEP_COMPLETE_SATE_CD;
							_controls.hfCheckCert.value = CHECK_CERT;
							_controls.hfLaborOption.value = LABOR_OPTION;
							_controls.hfTimeZoneBiasVal.value = TIME_ZONE_BIAS_VALUE;
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
		function iwStepCompleteOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"jm",
					"jm.jobStep.complete",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"JM_UI_StepComplete",
					"jm.jobStep.complete",
				);
			}
		}
		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			iwStepCompleteOnPostWorkflow: iwStepCompleteOnPostWorkflow,
		};
	}
})(window);
