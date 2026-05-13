/*
Name:        	OM_UI_Clone.js
Description: 	OM_UI_Clone js file containing global logic pertaining to the OM_UI_Clone Form.

Ver		By						Date				Change Description
001		Shamanth S	 	2024-07-09	#3005 First version.
002		Bas van B			2025-02-20	#4253 Translated item description and uom fields.
003		Bas van B			2025-02-21	#4253	Use correct constants for translation GROUPS and KEYS.
004		Bas van B			2025-02-21	#4253 Use public TRANSLATION_GROUP and TRANSLATION_KEYS Ui objects to avoid errors when loaded as widget.
005		Fayaz A 			2025-05-06	#4875 Empty string check is included for blockingOutput, to check existing work order id message.
*/
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.OM = window.OM || {};
	OM.Clone = OM.Clone || {};
	OM.Clone = Clone();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function Clone() {
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
			_controls.txItem = FORM.Control.findByXmlNode("TXITM");
			_controls.txItemId = FORM.Control.findByXmlNode("TXITMID");
			_controls.txWoId = FORM.Control.findByXmlNode("TXWOID");
			_controls.txtBatchNo = FORM.Control.findByXmlNode("TXBN");
			_controls.dtStartDate = FORM.Control.findByXmlNode("DTSD");
			_controls.dtEndDate = FORM.Control.findByXmlNode("DTED");
			_controls.nrReqQty = FORM.Control.findByXmlNode("NRQR");
			_controls.txUom = FORM.Control.findByXmlNode("TXUOM");
			_controls.hfExistWO = FORM.Control.findByXmlNode("HFEWID");

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
			// get context value of wo & or set Value to fields
			const woContext = FT.WorkTasks.contextGet(FORM.Control, "wo");
			let woDetails;
			let parameterColl;
			if (woContext && woContext.length > 0) {
				// fetch wo details from API
				parameterColl = { woId: woContext[0].woId };
				FT.WebApi.mesGetAsync("api/v3/WO/key", "", parameterColl, false).then(
					(data) => {
						// Handle successful response data
						if (data) {
							woDetails = data;
							// Set values to respective controls
							_controls.txItem.value = FT.Ui.translateValue(
								FT.Ui.TRANSLATION_GROUPS.grpItemItemDesc,
								woDetails.item_desc,
								woDetails.item_desc,
							);
							_controls.txItemId.value = woDetails.item_id;
							_controls.nrReqQty.value = woDetails.req_qty;
							_controls.dtStartDate.value = FT.WorkTasks.dateTimeInStringFormat(
								_controls.dtStartDate,
								woDetails.release_time_utc,
							);
							_controls.dtEndDate.value = FT.WorkTasks.dateTimeInStringFormat(_controls.dtEndDate, woDetails.req_finish_time_utc);
							_controls.txUom.value = FT.Ui.translateValue(
								FT.Ui.TRANSLATION_GROUPS.grpUomDescription,
								woDetails.uom_desc,
								woDetails.uom_desc,
							);
							_controls.hfExistWO.value = woDetails.wo_id;
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
		function iwOMClonePostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (blockingOutput === "" && workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch("om", "om.wo.clone", FT.Common.EVENT_SOURCE_TYPE.form, "OM_UI_Clone", "om.wo.clone");
			}
		}
		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			iwOMClonePostWorkflow: iwOMClonePostWorkflow,
		};
	}
})(window);
