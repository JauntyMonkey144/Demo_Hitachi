/*
Name:        	WI_UI_ConfigType.js
Description: 	WI_UI_ConfigType js file containing global logic pertaining to the WI_UI_ConfigType Form.

Ver	 Release	By					Date				Change Description
001  00.70    Fayaz A			2024-09-04	#3461 First version.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.WI = window.WI || {};
	WI.ConfigType = WI.ConfigType || {};
	WI.ConfigType = ConfigType();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function ConfigType() {
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
			_controls.wwWiInstructionTypeWidget = FORM.Control.findByXmlNode("WWIT");
			_controls.nuTypeId = FORM.Control.findByXmlNode("NUTI");
			_controls.hfTypeDesc = FORM.Control.findByXmlNode("HFTD");
			_controls.hfLastEditComment = FORM.Control.findByXmlNode("HFLE");
			_controls.iwTypeAdd = FORM.Control.findByXmlNode("IWTA");
			_controls.iwTypeEdit = FORM.Control.findByXmlNode("IWTE");
			_controls.iwTypeRemove = FORM.Control.findByXmlNode("IWTR");

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
		 * Form load function to bind cards with respect to entity from form parameters or if session variable EntID
		 */
		function onFormLoad() {
			try {
				wwWorkInstructionTypesLoad();
			} catch (exception) {
				handleScriptError(exception);
			}
		}

		/**
		 * @param {*} error
		 */
		function handleScriptError(error) {
			let errorMessage;
			if (error instanceof TypeError) {
				errorMessage = skelta.localize.getString("@@WI_UnexpectedType@@");
			} else if (error instanceof ReferenceError) {
				errorMessage = skelta.localize.getString("@@WI_ReferenceError@@");
			} else {
				errorMessage = skelta.localize.getString("@@WI_DuringScriptExecution@@");
			}
			SFU.showError(skelta.localize.getString("FormNGFErrorRunningScript_title"), errorMessage, null, error.message);
			throw errorMessage;
		}

		/**
		 * Get andon Issue details for displaying it on the widget
		 * @param null
		 * @returns {JSON} data
		 */
		function wwWorkInstructionTypesLoad() {
			try {
				const parameterCollection = {};
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "SP_SA_WI_Instruction_Type", parameterCollection, false).then(
					(data) => {
						_controls.wwWiInstructionTypeWidget.widgetProperties.data = JSON.stringify(data);
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
		 * update or add andon issue configuration
		 * @param {string} modifiedData
		 * @param {string} selectedRow
		 */
		function wwWorkInstructionTypesConfigUpdate() {
			const { selectedRow } = _controls.wwWiInstructionTypeWidget.widgetProperties;

			_controls.nuTypeId.value = selectedRow.type_id;
			_controls.hfTypeDesc.value = selectedRow.type_desc;
			_controls.hfLastEditComment.value = selectedRow.last_edit_comment;
			if (selectedRow.flag === "C") {
				SFU.invokeWorkflow(_controls.iwTypeAdd);
			} else if (selectedRow.flag === "U") {
				SFU.invokeWorkflow(_controls.iwTypeEdit);
			}
		}
		// #endregion

		// #region deleteRw
		/**
		 * deleting andon issue record
		 * @param {string} modifiedData
		 * @param {string} selectedRow
		 */
		function wwWorkInstructionTypesConfigDelete() {
			const { selectedRow } = _controls.wwWiInstructionTypeWidget.widgetProperties;

			_controls.nuTypeId.value = selectedRow.type_id;
			SFU.invokeWorkflow(_controls.iwTypeRemove);
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwTypeAddPostExec(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			wwWorkInstructionTypesLoad();
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwTypeEditPostExec(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			wwWorkInstructionTypesLoad();
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwTypeRemovePostExec(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			wwWorkInstructionTypesLoad();
		}
		return {
			initializeForm: initializeForm,
			wwWorkInstructionTypesLoad: wwWorkInstructionTypesLoad,
			wwWorkInstructionTypesConfigUpdate: wwWorkInstructionTypesConfigUpdate,
			wwWorkInstructionTypesConfigDelete: wwWorkInstructionTypesConfigDelete,
			iwTypeAddPostExec: iwTypeAddPostExec,
			iwTypeEditPostExec: iwTypeEditPostExec,
			iwTypeRemovePostExec: iwTypeRemovePostExec,
		};
	}
})(window);
