/*
Name:        	IM_UI_HandlingUnitContent.js
Description: 	Handling Unit Management js file containing global logic pertaining to the IM_UI_HandlingUnitContent Form.

Ver     Release			By						Date				Change Description
001     01.02.00    Praveen			  2025-02-07	#5065 First version.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.IM = window.IM || {};
	IM.HandlingUnitContent = IM.HandlingUnitContent || {};
	IM.HandlingUnitContent = HandlingUnitContent();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function HandlingUnitContent() {
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
			_controls.wwPalletHierarchy = FORM.Control.findByXmlNode("WWPH");
			_controls.wwHandlingUnitContent = FORM.Control.findByXmlNode("WWHU");

			_controls.nrQty = FORM.Control.findByXmlNode("NRQ");
			_controls.hfUOM = FORM.Control.findByXmlNode("HFUOM");
			_controls.hfLot_no = FORM.Control.findByXmlNode("HFLTN");
			_controls.hfSublot_no = FORM.Control.findByXmlNode("HFSLT");
			_controls.hfState_cd = FORM.Control.findByXmlNode("HFST");
			_controls.hfGrade_cd = FORM.Control.findByXmlNode("HFGR");
			_controls.hfItem_Id = FORM.Control.findByXmlNode("HFIT");
			_controls.hfEnt_Id = FORM.Control.findByXmlNode("HFEID");
			_controls.ddDestinationLocations = FORM.Control.findByXmlNode("DDDL");
			_controls.nrEnt_Id = FORM.Control.findByXmlNode("NREID");
			_controls.nrDestinationEnt_Id = FORM.Control.findByXmlNode("NRDED");
			_controls.numLotOrLocation = FORM.Control.findByXmlNode("NRSL");
			_controls.numRowId = FORM.Control.findByXmlNode("NRRID");
			_controls.iwAddContent = FORM.Control.findByXmlNode("IWAC");

			_controls.hfParent = FORM.Control.findByXmlNode("HFPID");
			_controls.hfParentItemId = FORM.Control.findByXmlNode("HFPIM");

			_controls.hfRow_Id = FORM.Control.findByXmlNode("HFRID");

			_controls.wwTab = FORM.Control.findByXmlNode("WWTB");
			_controls.epContainer = FORM.Control.findByXmlNode("EPC");
			_controls.iwRemoveContent = FORM.Control.findByXmlNode("IWRM");

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
			try {
				const applicationName = skelta.userContext.getUserContextFor("appN");
				const parentFormId = window.parent.skelta.userContext.getUserContextFor("itemId");
				const parentFormVersion = window.parent.skelta.userContext.getUserContextFor("vStamp");
				const parentFormUniqueKey = skelta.forms.utilities.getFormUniqueKey(applicationName, parentFormId, parentFormVersion);
				const parentViewModelObject = window.parent["viewModelObject_" + parentFormUniqueKey];
				_controls.hfParent.value = parentViewModelObject.findByXmlNode("TXSL").value;
				_controls.hfParentItemId.value = parentViewModelObject.findByXmlNode("DDITD").value;
				loadHandlingUnitContentDetail();
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
				errorMessage = skelta.localize.getString("@@FT_UnexpectedType@@");
			} else if (error instanceof ReferenceError) {
				errorMessage = skelta.localize.getString("@@FT_ReferenceError@@");
			} else {
				errorMessage = skelta.localize.getString("@@FT_DuringScriptExecution@@");
			}
			SFU.showError(skelta.localize.getString("FormNGFErrorRunningScript_title"), errorMessage, null, error.message);
		}

		/**
		 * Retrieves child pallet hierarchy data for the specified sublot and item.
		 * Calls the stored procedure 'sp_SA_IM_Sublot_HandlingUnitHierarchy' via async API.
		 * Sets the result as JSON to the wwPalletHierarchy widget for rendering.
		 */
		function wwPalletHierarchyLoad() {
			const parameterColl = {
				item_id: _controls.hfParentItemId.value,
				sublot_no: _controls.hfParent.value,
				lot_no: _controls.hfParentItemId.value,
				parents: null,
				children: 1,
			};
			const spName = "sp_SA_IM_Sublot_HandlingUnitHierarchy";
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", spName, parameterColl, false).then(
				(data) => {
					_controls.wwPalletHierarchy.widgetProperties.data = JSON.stringify(data);
				},
				(error) => {
					// Handle error
					throw Error("Error:", error);
				},
			);
		}

		/**
		 * This function loads the details of a pallet based on the sublot number provided in the input field (`txSublot_no`).
		 * It sends a request to the `api/V3/DirectAccess` endpoint using the stored procedure `sp_SA_IM_Sublot_HandlingUnitContent`,
		 * @param {string} sublot_no
		 * @returns {JSON}  data
		 */
		function loadHandlingUnitContentDetail() {
			
			const parameterColl = {
				sublot_no: _controls.hfParent.value,
			};
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_IM_Sublot_HandlingUnitContent", parameterColl, false).then(
				(data) => {
					// Handle successful response data
					_controls.wwHandlingUnitContent.widgetProperties.data = JSON.stringify(data);
				},
				(error) => {
					// Handle error
					throw Error("Error:", error);
				},
			);
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwAddContentOnPostWorkflow(blockingOutput, workflowStatus) {
			const wfResult = skelta.localize.getString(blockingOutput);
			if (blockingOutput !== "" || workflowStatus !== FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				const titleString = skelta.localize.getString("@@IM_ReceiveError@@");
				SFU.showError(titleString, wfResult);
			} else {
				loadHandlingUnitContentDetail();
			}
		}

		/**
		 * The function is to handle the update of a sublot number when it changes and to ensure the system
		 reflects this change by triggering a re-assignment process and refreshing associated pallet details
		 * @param {string} selectedRow
		 */
		function AddContent(selectedRow) {
			debugger
			if (_controls.txSublot_no.value !== "") {
				if (_controls.txSublot_no.value !== selectedRow.sublot_no) {
					_controls.hfSublot_no.value = selectedRow.sublot_no;
					_controls.hfItem_Id.value = selectedRow.item_id;
					_controls.hfLot_no.value = selectedRow.lot_no;
					_controls.hfParent.value = _controls.txSublot_no.value;
					_controls.hfRow_Id.value = selectedRow.row_id;
					const contentData = JSON.parse(_controls.wwHandlingUnitContent.widgetProperties.data);
					if (contentData.length > 0) {
						const bool = contentData.some(
							(item) => item.sublot_no === _controls.hfSublot_no.value && item.lot_no === _controls.hfLot_no.value,
						);
						if (bool === false) {
							SFU.invokeWorkflow(_controls.iwAddContent);
						} else {
							const titleString = skelta.localize.getString("@@IM_Exists@@");
							SFU.showWarning(_controls.hfSublot_no.value + " - " + titleString, "");
						}
					} else {
						SFU.invokeWorkflow(_controls.iwAddContent);
					}
				}
			}
		}

		/**
		 * function appears to handle UI changes based on the selection of a tab and adjusts the visibility and actions accordingly
		 */
		function wwTabOnDataChange() {
			const selectedAction = JSON.parse(_controls.wwTab.value);
			if (selectedAction) {
				_controls.epContainer.url = "";
				_controls.epContainer.url = SFU.getFormUrl(selectedAction.form_name);
			}
		}
		/**
		 * extracts relevant information from the selected value in the  widget and stores it in the eventData contextSet.
		 */
		function wwGridOnClick() {
			
			if (_controls.wwHandlingUnitContent.widgetProperties.selectedRow != null) {
				const selectedRow = JSON.parse(_controls.wwHandlingUnitContent.widgetProperties.selectedRow);
				wwPalletHierarchyLoad(selectedRow);
			}
		}
		/**
		 * This function should be called when the pallet removal from a sublot is required, and it will attempt to process
		    the removal and update the UI accordingly.
		 * @param {string} selectedRow
		 */
		function removeContent(selectedRow) {
			debugger
			_controls.hfSublot_no.value = selectedRow.sublot_no;
			_controls.hfLot_no.value = selectedRow.lot_no;
			_controls.hfItem_Id.value = selectedRow.item_id;
			_controls.hfParent.value = selectedRow.parent_no;
			_controls.hfRow_Id.value = selectedRow.row_id;
			SFU.invokeWorkflow(_controls.iwRemoveContent);
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwRemoveContentOnPostWorkflow(blockingOutput, workflowStatus) {
			const wfResult = skelta.localize.getString(blockingOutput);
			if (blockingOutput !== "" || workflowStatus !== FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				const titleString = skelta.localize.getString("@@IM_ReceiveError@@");
				SFU.showError(titleString, wfResult);
			} else {
				loadHandlingUnitContentDetail();
				wwPalletHierarchyLoad();
			}
		}
		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			iwAddContentOnPostWorkflow: iwAddContentOnPostWorkflow,
			AddContent: AddContent,
			wwTabOnDataChange: wwTabOnDataChange,
			wwGridOnClick: wwGridOnClick,
			removeContent: removeContent,
			iwRemoveContentOnPostWorkflow: iwRemoveContentOnPostWorkflow,
		};
	}
})(window);
