/*
Name:        	OM_UI_Delete.js
Description: 	OM_UI_Delete js file containing global logic pertaining to the OM_UI_Delete Form.

Ver		By						Date				Change Description
001		Shamanth S		2024-07-09	#3030 First version.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.OM = window.OM || {};
	OM.Delete = OM.Delete || {};
	OM.Delete = Delete();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function Delete() {
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
			_controls.hfWoId = FORM.Control.findByXmlNode("HFWOID");

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
			// get context value of wo & or setValue to hidden fields
			const woContext = FT.WorkTasks.contextGet(FORM.Control, "wo");
			let parameterColl;
			if (woContext && woContext.length > 0) {
				_controls.hfWoId.value = woContext[0].woId;
			}
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwOMDeletePostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch("om", "om.wo.delete", FT.Common.EVENT_SOURCE_TYPE.form, "OM_UI_Delete", "om.wo.delete");
			}
		}
		/**
		 * Define which functions/properties are to be made public.
		 */

		return {
			initializeForm: initializeForm,
			iwOMDeletePostWorkflow: iwOMDeletePostWorkflow,
		};
	}
})(window);
