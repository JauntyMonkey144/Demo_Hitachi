/*
Name:        	OM_UI_Cancel.js
Description: 	OM_UI_Cancel js file containing global logic pertaining to the OM_UI_Cancel Form.

Ver	    Release	  By			Date		Change Description
001		00.50.00  Shamanth S	2024-07-08	#3004	First version.
002     02.00.00  Praveen		2025-09-12	#5257	Remove the hard-coded values from the workflows.
*/

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.OM = window.OM || {};
	OM.Cancel = OM.Cancel || {};
	OM.Cancel = Cancel();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function Cancel() {
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;
		const _controls = {};
		// ----------------------------------------------------------------------------------

		// ----------------------------- Private Variables ----------------------------------

		// ----------------------------------------------------------------------------------
		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			// Initialize variables
			FORM.Control = Control;
			_controls.hfWoId = FORM.Control.findByXmlNode("HFWOID");
			_controls.hfStateCD = FORM.Control.findByXmlNode("HFSTCD");
			

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
			const woContext = FT.WorkTasks.contextGet(FORM.Control, "wo");
			if (woContext && woContext.length > 0) {
				_controls.hfWoId.value = woContext[0].woId;
				_controls.hfStateCD.value = FT.Common.MES_JOB_STATE_CD.canceled;
			}
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwOMCancelPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch("om", "om.wo.cancel", FT.Common.EVENT_SOURCE_TYPE.form, "OM_UI_Cancel", "om.wo.cancel");
			}
		}
		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			iwOMCancelPostWorkflow: iwOMCancelPostWorkflow,
		};
	}
})(window);
