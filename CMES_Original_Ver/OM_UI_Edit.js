/*
Name:        	OM_UI_Edit.js
Description: 	OM_UI_Edit js file containing global logic pertaining to the OM_UI_Edit Form.

Ver		Release 	By				Date						Change Description
001		00.70.00	Ramesh V		2024-07-03		#3003 First version.
002		00.70.00	Shamanth S	2024-10-11		#3667 Added hidden fields to process_id, bom_ver_id & spec_ver_id and passing it to the workflow.
003		00.70.01	Usha M			2025-01-24		#3317 Removed setDecimalPlaces function and used FT.Common.setDecimalPlaces
004		01.00.00	Bas van B		2025-02-21		#4253 Removed commented code and made WO description translatable.
005		01.00.00	Bas van B		2025-02-21		#4253 Use public TRANSLATION_GROUP and TRANSLATION_KEYS Ui objects to avoid errors
																					when loaded as widget.
*/
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.OM = window.OM || {};
	OM.Edit = OM.Edit || {};
	OM.Edit = Edit();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function Edit() {
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
			_controls.txWoId = FORM.Control.findByXmlNode("TXWID");
			_controls.txWoDesc = FORM.Control.findByXmlNode("TXWODS");
			_controls.txManfOrder = FORM.Control.findByXmlNode("TXMO");
			_controls.nrStartQty = FORM.Control.findByXmlNode("NRSQTY");
			_controls.nrReqQty = FORM.Control.findByXmlNode("NRRQTY");
			_controls.nrPriority = FORM.Control.findByXmlNode("NRPR");
			_controls.dtReleaseDate = FORM.Control.findByXmlNode("DTRD");
			_controls.dtDueDate = FORM.Control.findByXmlNode("DTDD");
			_controls.txCustomer = FORM.Control.findByXmlNode("TXCUST");
			_controls.txNotes = FORM.Control.findByXmlNode("TXNTS");
			_controls.hfNumDecimals = FORM.Control.findByXmlNode("HFNDEC");
			_controls.hfItemId = FORM.Control.findByXmlNode("HFIMID");
			_controls.hfProcessId = FORM.Control.findByXmlNode("HFPID");
			_controls.hfBomVerId = FORM.Control.findByXmlNode("HFBVI");
			_controls.hfSpecVerId = FORM.Control.findByXmlNode("HFSVI");
			_controls.lbStartUom = FORM.Control.findByXmlNode("LBSUM");
			_controls.lbReqUom = FORM.Control.findByXmlNode("LBRUM");

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
			let woDetails;
			let parameterColl;
			// get context value of WO & or setValue to hidden fields
			const woContext = FT.WorkTasks.contextGet(FORM.Control, "wo");
			if (woContext && woContext.length > 0) {
				// fetch WO details from API
				parameterColl = { woId: woContext[0].woId };
				FT.WebApi.mesGetAsync("api/v3/WO/key", "", parameterColl, false).then(
					(data) => {
						// Handle successful response data
						if (data) {
							woDetails = data;
							// Set values to respective controls
							_controls.txWoId.value = woDetails.wo_id;
							_controls.txWoDesc.value = FT.Ui.translateValue(
								FT.Ui.TRANSLATION_GROUPS.grpWoWoDesc,
								FT.Ui.TRANSLATION_KEYS.wo,
								woDetails.wo_desc,
							);
							_controls.txManfOrder.value = woDetails.mo_id;
							_controls.nrStartQty.value = woDetails.qty_at_start;
							_controls.nrReqQty.value = woDetails.req_qty;
							_controls.nrPriority.value = woDetails.wo_priority;
							_controls.dtReleaseDate.value = FT.WorkTasks.dateTimeInStringFormat(
								_controls.dtReleaseDate,
								woDetails.release_time_utc,
							);
							_controls.dtDueDate.value = FT.WorkTasks.dateTimeInStringFormat(_controls.dtDueDate, woDetails.req_finish_time_utc);
							_controls.txCustomer.value = woDetails.cust_info;
							_controls.txNotes.value = woDetails.notes;
							_controls.hfNumDecimals.value = woDetails.num_decimals;
							_controls.hfItemId.value = woDetails.item_id;

							FT.Common.setDecimalPlaces(_controls.nrStartQty, parseInt(_controls.hfNumDecimals.value, 10));
							FT.Common.setDecimalPlaces(_controls.nrReqQty, parseInt(_controls.hfNumDecimals.value, 10));
							_controls.lbStartUom.value = FT.Ui.translateValue(
								FT.Ui.TRANSLATION_GROUPS.grpUomDescription,
								woDetails.uom_desc,
								woDetails.uom_desc,
							);
							_controls.lbReqUom.value = FT.Ui.translateValue(
								FT.Ui.TRANSLATION_GROUPS.grpUomDescription,
								woDetails.uom_desc,
								woDetails.uom_desc,
							);
							_controls.hfProcessId.value = woDetails.process_id;
							_controls.hfBomVerId.value = woDetails.bom_ver_id;
							_controls.hfSpecVerId.value = woDetails.spec_ver_id;
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
		 * Validate the due date is not before the release date.  If it is, give error and do not execute workflow.
		 * @returns {boolean} True if validation passes, false otherwise.
		 */
		function iwEditWoOnPreWorkflow() {
			// Check if both Required Quantity and Start Quantity are provided
			if (_controls.nrReqQty.value && _controls.nrStartQty.value) {
				// Ensure the Start Quantity is not less than the Required Quantity
				if (parseFloat(_controls.nrStartQty.value) < parseFloat(_controls.nrReqQty.value)) {
					const title = skelta.localize.getString("@@OM_ValidationError@@");
					const errorMsg = skelta.localize.getString("@@OM_InvalidStartReqdQty@@");
					const errorDetails = skelta.localize.getString("@@OM_ReqdQtyErrorDetails@@");
					SFU.showError(title, errorMsg, null, errorDetails);
					return false;
				}
			}

			// Check if both Due Date and Release Date are provided
			if (_controls.dtDueDate.value && _controls.dtReleaseDate.value) {
				// Ensure the Due Date is not earlier than the Release Date
				const releaseDate = new Date(_controls.dtReleaseDate.value).getTime();
				const dueDate = new Date(_controls.dtDueDate.value).getTime();
				if (dueDate < releaseDate) {
					const title = skelta.localize.getString("@@OM_ValidationError@@");
					const errorMsg = skelta.localize.getString("@@OM_InvalidDueDate@@");
					const errorDetails = skelta.localize.getString("@@OM_DueDateErrorDetails@@");
					SFU.showError(title, errorMsg, null, errorDetails);
					return false;
				}
			}

			return true;
		}

		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwEditWoOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch("om", "om.wo.update", FT.Common.EVENT_SOURCE_TYPE.form, "OM_UI_Edit", "om.wo.update");
			}
		}

		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			iwEditWoOnPreWorkflow: iwEditWoOnPreWorkflow,
			iwEditWoOnPostWorkflow: iwEditWoOnPostWorkflow,
		};
	}
})(window);
