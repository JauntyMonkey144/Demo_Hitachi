/*
Name:        	IM_UI_HandlingUnitManagement.js
Description: 	Handling Unit Management js file containing global logic pertaining to the IM_UI_HandlingUnitManagement Form.

Ver     Release			By						Date				Change Description
001     01.00.00    Praveen			  2025-02-04	#4332 First version.
002     01.01.00    Praveen			  2025-05-05	#4878 Reset the Handling Unit contents after delete the HU.
003		 	01.01.00 		Fayaz A				2025-05-28	#5008 Localization key update to refer from FT runtime locale file.
004		 	01.02.00 		Praveen			  2025-07-04	#5053 The parent information should be stored in the spare field of the item_inv table.
005			01.03.00		Somya S				2025-09-19	#5156 Transfer Button validation message and button visibility.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.IM = window.IM || {};
	IM.HandlingUnitManagement = IM.HandlingUnitManagement || {};
	IM.HandlingUnitManagement = HandlingUnitManagement();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function HandlingUnitManagement() {
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;
		const IM_ACTIONS_DATA =
			'[{"command":"create","param20":"","icon":"action--create.svg","title":"Create","form_name":""}' +
			',{"command":"transfer","param20":"","icon":"file--file-transfer.svg","title":"Transfer","form_name":""}' +
			',{"command":"restore","param20":"","icon":"action--restore.svg","title":"Restore","form_name":""}' +
			',{"command":"delete","param20":"","icon":"action--delete.svg","title":"Delete","form_name":""}' +
			',{"command":"refresh","param20":"","icon":"action--refresh.svg","title":"Reload","form_name":""}]';
		const IM_TAB_DATA =
			'[{"type":"Tab","form_name":"IM_UI_HandlingUnitContent","icon":"hide","value":"content","title":"Content","attr_desc":null}' +
			',{"type":"Tab","form_name":"IM_UI_HandlingUnitAvailable","icon":"hide","value":"available","title":"Available Inventory",' +
			'"attr_desc":null}]';
		// ----------------------------------------------------------------------------------

		// ----------------------------- Private Variables ----------------------------------
		const _controls = {};
		const ITEMCLASSID = "IM_HandlingUnits";

		// ----------------------------------------------------------------------------------
		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			// Initialize variables
			FORM.Control = Control;
			_controls.wwIMQueue = FORM.Control.findByXmlNode("WWIM");
			_controls.wwHandlingUnitContent = FORM.Control.findByXmlNode("WWPL");
			_controls.ddLocations = FORM.Control.findByXmlNode("DDLA");
			_controls.txSublot_no = FORM.Control.findByXmlNode("TXSL");
			_controls.ddItem_desc = FORM.Control.findByXmlNode("DDITD");
			_controls.wwNavigation = FORM.Control.findByXmlNode("WWNA");
			_controls.dtExpire = FORM.Control.findByXmlNode("DTED");
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
			_controls.iwCreateSublot = FORM.Control.findByXmlNode("IWCT");
			_controls.iwRemoveContent = FORM.Control.findByXmlNode("IWRM");
			_controls.iwAddContent = FORM.Control.findByXmlNode("IWAC");
			_controls.iwDeleteContent = FORM.Control.findByXmlNode("IWDT");
			_controls.iwRestoreContent = FORM.Control.findByXmlNode("IWST");
			_controls.iwTransferContent = FORM.Control.findByXmlNode("IWTR");
			_controls.hfParent = FORM.Control.findByXmlNode("HFPID");
			_controls.hfRow_Id = FORM.Control.findByXmlNode("HFRID");
			_controls.wwTab = FORM.Control.findByXmlNode("WWTB");
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
		 * Form load function for the controls
		 */
		function onFormLoad() {
			try {
				ddLocationLoad();
				ddItemLoad();
				ddDestinationLoad();
				_controls.wwNavigation.widgetProperties.command = "create,delete,restore,transfer";
				_controls.wwNavigation.widgetProperties.data = IM_ACTIONS_DATA;
				_controls.wwTab.widgetProperties.data = IM_TAB_DATA;
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
		 * This function loads storage location data and populates a dropdown control
		 * @param {} null
		 * @returns {JSON} data
		 */
		function ddLocationLoad() {
			parameterColl = {};
			FT.WebApi.mesGetAsync("api/Entity", "", parameterColl, false).then(
				(data) => {
					// Handle successful response data
					var destinationLocation = [];
					var i;
					if (data && data.length > 0) {
						for (i = 0; i < data.length; i++) {
							if (data[i].canStore === true) {
								destinationLocation.push(data[i]);
							}
						}
					}
					FT.WorkTasks.controlOptionsSetFromDataset("DDLA", 0, destinationLocation, "entName", "entID");
				},
				(error) => {
					// Handle error
					throw new Error("Error:", error);
				},
			);
		}
		/**
		 * This function items data and populates a dropdown control
		 * @param {} null
		 * @returns {JSON} data
		 */
		function ddItemLoad() {
			parameterColl = { itemClassId: ITEMCLASSID };
			FT.WebApi.mesGetAsync("api/V3/Item", "", parameterColl, false).then(
				(data) => {
					// Handle successful response data
					FT.WorkTasks.controlOptionsSetFromDataset("DDITD", 0, data, "item_desc", "item_id");
				},
				(error) => {
					// Handle error
					throw new Error("Error:", error);
				},
			);
		}
		/**
		 * This function loads destination location data and populates a dropdown control
		 * @param {} null
		 * @returns {JSON} data
		 */
		function ddDestinationLoad() {
			parameterColl = {};
			FT.WebApi.mesGetAsync("api/Entity", "", parameterColl, false).then(
				(data) => {
					// Handle successful response data
					var destinationLocation = [];
					var i;
					if (data && data.length > 0) {
						for (i = 0; i < data.length; i++) {
							if (data[i].canStore === true) {
								destinationLocation.push(data[i]);
							}
						}
					}
					FT.WorkTasks.controlOptionsSetFromDataset("DDDL", 0, destinationLocation, "entName", "entID");
				},
				(error) => {
					// Handle error
					throw new Error("Error:", error);
				},
			);
		}

		/**
		 * Triggers wwTabOnDataChange when a non-empty location is selected
		 */
		function ddLocationOnDataChange() {
			if (_controls.ddLocations.value !== "") {
				wwTabOnDataChange();
			}
		}

		/**
		 * This function should be connected to a change event on the `txSublot_no` input field.
		 * When the sublot number is changed, the pallet details will be automatically reloaded.
		 */
		function txSublotOnDataChange() {
			if (_controls.txSublot_no.value.trim() !== "") {
				const parameterCollection = {};
				const inventoryData = FT.WebApi.mesGetSync("api/V3/itemInventory", "", parameterCollection, false);
				const filterItemInv = inventoryData.filter(
					(item) =>
						typeof item.sublot_no === "string" &&
						item.sublot_no.toLowerCase() === _controls.txSublot_no.value.trim().toLowerCase(),
				);
				if (filterItemInv.length > 0) {
					_controls.ddLocations.value = filterItemInv.length > 0 ? filterItemInv[0].ent_id : "";
					_controls.ddLocations.enable = false;
					_controls.ddItem_desc.enable = false;
					_controls.ddItem_desc.value = filterItemInv.length > 0 ? filterItemInv[0].item_id : "";
					_controls.hfRow_Id.value = filterItemInv.length > 0 ? filterItemInv[0].row_id_h : "";
					_controls.wwNavigation.widgetProperties.command = "create";
					_controls.wwNavigation.widgetProperties.data = IM_ACTIONS_DATA;
					wwTabOnDataChange();
				} else {
					ddLocationLoad();
					ddItemLoad();
					_controls.ddLocations.enable = true;
					_controls.ddItem_desc.enable = true;
					_controls.wwNavigation.widgetProperties.command = "{}";
					_controls.wwNavigation.widgetProperties.data = IM_ACTIONS_DATA;
					_controls.epContainer.url = "";
				}
			} else {
				ddLocationLoad();
				ddItemLoad();
				_controls.ddLocations.enable = true;
				_controls.ddItem_desc.enable = true;
				_controls.wwNavigation.widgetProperties.command = "create,delete,restore,transfer";
				_controls.wwNavigation.widgetProperties.data = IM_ACTIONS_DATA;
				_controls.epContainer.url = "";
			}
		}
		/**
		 * Prepares data and sets control values before executing the workflow.
		 */
		function iwCreateInventoryOnPreWorkflow() {
			if (_controls.txSublot_no.value !== "") {
				_controls.nrEnt_Id.value = _controls.ddLocations.value;
				_controls.hfItem_Id.value = _controls.ddItem_desc.value;
				return true;
			}
			SFU.showError("", skelta.localize.getString("@@IM_PalletErr@@"), null, null);
			return false;
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwCreateInventoryOnPostWorkflow(blockingOutput, workflowStatus) {
			const wfResult = skelta.localize.getString(blockingOutput);
			if (blockingOutput !== "" || workflowStatus !== FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				const titleString = skelta.localize.getString("@@IM_ReceiveError@@");
				SFU.showError(titleString, wfResult);
			} else {
				const titleString = skelta.localize.getString("@@IM_PalletConfirm@@");
				SFU.showConfirmation(titleString, "");
				txSublotOnDataChange();
			}
			_controls.wwNavigation.value = "";
			_controls.wwNavigation.widgetProperties.command = "create";
			_controls.wwNavigation.widgetProperties.data = IM_ACTIONS_DATA;
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
				// loadHandlingUnitContentDetail();
			}
			_controls.wwNavigation.value = "";
			_controls.wwNavigation.widgetProperties.command = "{}";
			_controls.wwNavigation.widgetProperties.data = IM_ACTIONS_DATA;
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwDeleteContentOnPreWorkflow() {
			_controls.hfSublot_no.value = _controls.txSublot_no.value;
			_controls.numRowId.value = _controls.hfRow_Id.value;
			return true;
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwDeleteContentOnPostWorkflow(blockingOutput, workflowStatus) {
			const wfResult = skelta.localize.getString(blockingOutput);
			if (blockingOutput !== "" || workflowStatus !== FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				const titleString = skelta.localize.getString("@@IM_ReceiveError@@");
				SFU.showError(titleString, wfResult);
			} else {
				const titleString = skelta.localize.getString("@@IM_DeleteConfirm@@");
				SFU.showConfirmation(titleString, "");
				_controls.txSublot_no.value = "";
				ddItemLoad();
				ddLocationOnDataChange();
			}
			_controls.wwNavigation.value = "";
			_controls.wwNavigation.widgetProperties.command = "{}";
			_controls.wwNavigation.widgetProperties.data = IM_ACTIONS_DATA;
		}
		/**
		 * Prepares data and sets control values before executing the workflow.
		 */
		function iwRestoreInventoryOnPreWorkflow() {
			if (_controls.txSublot_no.value !== "") {
				_controls.nrEnt_Id.value = _controls.ddLocations.value;
				return true;
			}
			SFU.showError("", skelta.localize.getString("@@IM_PalletErr@@"), null, null);
			return false;
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwRestoreContentOnPostWorkflow(blockingOutput, workflowStatus) {
			const wfResult = skelta.localize.getString(blockingOutput);
			if (blockingOutput !== "" || workflowStatus !== FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				const titleString = skelta.localize.getString("@@IM_ReceiveError@@");
				SFU.showError(titleString, wfResult);
			} else {
				const titleString = skelta.localize.getString("@@IM_RestoreConfirm@@");
				SFU.showConfirmation(titleString, "");
				_controls.txSublot_no.value = "";
				ddItemLoad();
				ddLocationOnDataChange();
			}
			_controls.wwNavigation.value = "";
			_controls.wwNavigation.widgetProperties.command = "{}";
			_controls.wwNavigation.widgetProperties.data = IM_ACTIONS_DATA;
		}

		/**
		 * DeleteContent - Invokes the Delete Content Workflow
		 * @param {null}
		 */
		function DeleteContent() {
			SFU.invokeWorkflow(_controls.iwDeleteContent);
		}
		/**
		 * The function ddDestinationLocationOnDataChange() appears to handle the case when the destination location for a pallet is selected,
		   and it performs an action if the selected destination location is the same as the original location.
		*/
		function ddDestinationLocationOnDataChange() {
			if (_controls.ddDestinationLocations.value === _controls.ddLocations.value) {
				ddDestinationLoad();
				SFU.showWarning(null, skelta.localize.getString("@@IM_PalletWarningMsg@@"), null, null);
			}
		}
		/**
		 * Prepares data and sets control values before executing the workflow.
		 */
		function iwTransferContentOnPreWorkflow() {
			if (_controls.txSublot_no.value !== "" && _controls.ddDestinationLocations.value !== "") {
				_controls.nrDestinationEnt_Id.value = _controls.ddDestinationLocations.value;
				return true;
			}
			const title = skelta.localize.getString("@@IM_ValidationError@@");
			const errorMsg = skelta.localize.getString("@@IM_DestinationError@@");
			SFU.showError(title, errorMsg, null, null);
			_controls.wwNavigation.value = "";
			_controls.wwNavigation.widgetProperties.command = "{}";
			_controls.wwNavigation.widgetProperties.data = IM_ACTIONS_DATA;

			return false;
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwTransferContentOnPostWorkflow(blockingOutput, workflowStatus) {
			const wfResult = skelta.localize.getString(blockingOutput);
			if (blockingOutput !== "" || workflowStatus !== FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				const titleString = skelta.localize.getString("@@IM_ReceiveError@@");
				SFU.showError(titleString, wfResult);
			} else {
				const titleString = skelta.localize.getString("@@IM_TransferConfirm@@");
				SFU.showConfirmation(titleString, "");
				txSublotOnDataChange();
				ddDestinationLoad();
			}

			_controls.wwNavigation.value = "";
			_controls.wwNavigation.widgetProperties.command = "create";
			_controls.wwNavigation.widgetProperties.data = IM_ACTIONS_DATA;
		}
		/**
		 *function processes changes in the data for handling navigation-related tasks like adding, editing, or deleting lot or sublot attributes.
		 * Based on the selected action (add, edit, delete),
		 */
		function wwActionOnDataChange() {
			if (_controls.wwNavigation.value !== "") {
				const selectedAction = JSON.parse(_controls.wwNavigation.value);
				if (selectedAction.command.toLowerCase() === "create") {
					SFU.invokeWorkflow(_controls.iwCreateSublot);
				} else if (selectedAction.command.toLowerCase() === "transfer") {
					SFU.invokeWorkflow(_controls.iwTransferContent);
				} else if (selectedAction.command.toLowerCase() === "delete") {
					SFU.invokeWorkflow(_controls.iwDeleteContent);
				} else if (selectedAction.command.toLowerCase() === "restore") {
					SFU.invokeWorkflow(_controls.iwRestoreContent);
				} else {
					_controls.txSublot_no.value = "";
				}
			}
		}

		/**
		 * function appears to handle UI changes based on the selection of a tab and adjusts the visibility and actions accordingly
		 */
		function wwTabOnDataChange() {
			if (_controls.txSublot_no.value !== "" || _controls.ddLocations.value !== "") {
				const selectedAction = JSON.parse(_controls.wwTab.value);
				if (selectedAction) {
					_controls.epContainer.url = "";
					_controls.epContainer.url = SFU.getFormUrl(selectedAction.form_name);
				}
			} else {
				_controls.epContainer.url = "";
			}
		}
		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			ddLocationLoad: ddLocationLoad,
			ddLocationOnDataChange: ddLocationOnDataChange,
			txSublotOnDataChange: txSublotOnDataChange,
			iwCreateInventoryOnPreWorkflow: iwCreateInventoryOnPreWorkflow,
			iwCreateInventoryOnPostWorkflow: iwCreateInventoryOnPostWorkflow,
			iwTransferContentOnPreWorkflow: iwTransferContentOnPreWorkflow,
			iwTransferContentOnPostWorkflow: iwTransferContentOnPostWorkflow,
			iwAddContentOnPostWorkflow: iwAddContentOnPostWorkflow,
			DeleteContent: DeleteContent,
			ddDestinationLocationOnDataChange: ddDestinationLocationOnDataChange,
			wwActionOnDataChange: wwActionOnDataChange,
			iwDeleteContentOnPreWorkflow: iwDeleteContentOnPreWorkflow,
			iwDeleteContentOnPostWorkflow: iwDeleteContentOnPostWorkflow,
			iwRestoreInventoryOnPreWorkflow: iwRestoreInventoryOnPreWorkflow,
			iwRestoreContentOnPostWorkflow: iwRestoreContentOnPostWorkflow,
			wwTabOnDataChange: wwTabOnDataChange,
		};
	}
})(window);
