/*
Name:        	JM_UI_JobStepExecution.js
Description: 	JM_UI_JobStepExecution js file containing global logic pertaining to the JM_UI_JobStepExecution Form.

Ver  Release	By				Date				Change Description
001	 00.50.00	Krishna		2024-09-05  #3400 First version.
002  00.70.00	Fayaz A   2025-02-20  #4116 Moved from use case to module level, UC_JM_UI_StepManagement to JM_UI_JobStepExecution.

*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.JM = window.JM || {};
	JM.JobStepExecution = JM.JobStepExecution || {};
	JM.JobStepExecution = JobStepExecution();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function JobStepExecution() {
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
		let userInfo = "";
		let mesUserId = "";
		let selectedCard = "";
		let data = "";
		let navigationGrpId = "";
		let navigationSubGrpId = "";
		// ----------------------------------------------------------------------------------

		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control, grpId, navigationFor) {
			// Initialize variables
			FORM.Control = Control;

			navigationGrpId = grpId;
			navigationSubGrpId = navigationFor;
			_controls.wwJobStepActions = FORM.Control.findByXmlNode("WWJA");
			_controls.epContainer = FORM.Control.findByXmlNode("EPC");
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
		 * Form load function
		 */
		function onFormLoad() {
			userInfo = FT.WorkTasks.userInfo();
			mesUserId = userInfo.MESUserId !== undefined ? userInfo.MESUserId : null;
			selectedCard = FT.WorkTasks.contextGet(FORM.Control, "eventData");
			data = JSON.parse(selectedCard[0].jsonValue);
			_controls.wwJobStepActions.value = "";

			wwJobStepActionsSetData(
				navigationGrpId,
				navigationSubGrpId,
				data[0].ent_name,
				mesUserId,
				data[0].itemId !== undefined ? data[0].itemId : null,
				data[0].woId !== undefined ? data[0].woId : null,
				data[0].operId !== undefined ? data[0].operId : null,
				data[0].seqNo !== undefined ? data[0].seqNo : null,
				data[0].row_id !== undefined ? data[0].row_id : null,
			);
		}
		/**
		 * Set navigation data from the config table
		 * @param {string} entity [optional]
		 * @param {string} grpId Group Id
		 * @param {string} category Navigation filter
		 * @param {string} entityName filter
		 * @param {string} userId filter
		 * @param {string} itemId filter
		 * @param {string} woId filter
		 * @param {string} operId filter
		 * @param {string} seqNo filter
		 * @returns
		 */
		function wwJobStepActionsSetData(grpId, category, entityName, userId, itemId, woId, operId, seqNo, stepRowId) {
			try {
				const parameterCollection = {
					grp_id: grpId,
					category: category,
					ent_name: entityName,
					user_id: userId,
					item_id: itemId,
					wo_id: woId,
					oper_id: operId,
					seq_no: seqNo,
					row_id: stepRowId,
				};
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_JM_Config_JobStepExecButtons", parameterCollection, false).then(
					(spdata) => {
						_controls.wwJobStepActions.widgetProperties.data = JSON.stringify(spdata);
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
		 * @param {*} error
		 */
		function handleScriptError(error) {
			let errorMessage;

			if (error instanceof TypeError) {
				errorMessage = skelta.localize.getString("@@JM_UnexpectedType@@");
			} else if (error instanceof ReferenceError) {
				errorMessage = skelta.localize.getString("@@JM_ReferenceError@@");
			} else {
				errorMessage = skelta.localize.getString("@@JM_DuringScriptExecution@@");
			}
			SFU.showError(skelta.localize.getString("FormNGFErrorRunningScript_title"), errorMessage, null, error.message);

			throw errorMessage;
		}
		/**
		 * This function loads corresponding form of the selected card
		 */
		function wwJobStepActionOnDataChange() {
			if (_controls.wwJobStepActions.value !== null) {
				const selectdValue = JSON.parse(_controls.wwJobStepActions.value);
				const action = selectdValue[0].value;
				const formName = selectdValue[0].form_name;

				if (action === "Refresh") {
					wwJobStepActionsSetData(
						navigationGrpId,
						navigationSubGrpId,
						data[0].ent_name,
						mesUserId,
						data[0].itemId !== undefined ? data[0].itemId : null,
						data[0].woId !== undefined ? data[0].woId : null,
						data[0].operId !== undefined ? data[0].operId : null,
						data[0].seqNo !== undefined ? data[0].seqNo : null,
						data[0].row_id !== undefined ? data[0].row_id : null,
					);
				} else {
					_controls.epContainer.url = "";
					_controls.epContainer.url = SFU.getFormUrl(formName);
				}
			}
		}

		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			wwJobStepActionOnDataChange: wwJobStepActionOnDataChange,
			wwJobStepActionsSetData: wwJobStepActionsSetData,
		};
	}
})(window);
