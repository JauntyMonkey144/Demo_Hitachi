/*
Name:        	IM_UI_HandlingUnitAvailable.js
Description: 	Handling Unit Management js file containing global logic pertaining to the IM_UI_HandlingUnitAvailable Form.

Ver     Release			By						Date				Change Description
001     01.02.00    Praveen			  2025-02-07	#5064 First version.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.IM = window.IM || {};
	IM.HandlingUnitAvailable = IM.HandlingUnitAvailable || {};
	IM.HandlingUnitAvailable = HandlingUnitAvailable();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function HandlingUnitAvailable() {
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
			_controls.wwIMQueue = FORM.Control.findByXmlNode("WWIM");

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
			_controls.iwAddContent = FORM.Control.findByXmlNode("IWAC");

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
				_controls.hfEnt_Id.value = parentViewModelObject.findByXmlNode("DDLA").value;
				_controls.hfParent.value = parentViewModelObject.findByXmlNode("TXSL").value;
				availableInventoryLoad();
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
		 * Loads inventory data from the backend based on entity ID and sublot number.
		 * Filters out entries where sublot_no is null.
		 * Updates the wwIMQueue widget with the filtered inventory data.
		 * @returns {JSON}  data
		 */
		function availableInventoryLoad() {
			const parameterColl = { ent_id: _controls.hfEnt_Id.value, sublot_no: _controls.hfParent.value };
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_s_IM_item_inv", parameterColl, false).then(
				(data) => {
					const filteredData = data.filter((item) => item.sublot_no !== null);
					// Handle successful response data
					_controls.wwIMQueue.widgetProperties.data = JSON.stringify(filteredData);
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
				availableInventoryLoad();
			}
			// _controls.wwNavigation.value = "";
			// _controls.wwNavigation.widgetProperties.command = "{}";
			// _controls.wwNavigation.widgetProperties.data = IM_ACTIONS_DATA;
		}

		/**
		 * The function is to handle the update of a sublot number when it changes and to ensure the system
		 reflects this change by triggering a re-assignment process and refreshing associated pallet details
		 * @param {string} selectedRow
		 */
		function AddContent(selectedRow) {
			if (_controls.hfParent.value !== "") {
				if (_controls.hfParent.value !== selectedRow.sublot_no) {
					_controls.hfSublot_no.value = selectedRow.sublot_no;
					_controls.hfItem_Id.value = selectedRow.item_id;
					_controls.hfLot_no.value = selectedRow.lot_no;
					//	_controls.hfParent.value = sublotno;
					_controls.hfRow_Id.value = selectedRow.row_id;
					const parameterColl = {
						sublot_no: _controls.hfParent.value,
					};
					const contentData = FT.WebApi.mesGetSync(
						"api/V3/DirectAccess",
						"sp_SA_IM_Sublot_HandlingUnitContent",
						parameterColl,
						false,
					);
					//	const contentData = JSON.parse(_controls.wwHandlingUnitContent.widgetProperties.data);
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
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			iwAddContentOnPostWorkflow: iwAddContentOnPostWorkflow,
			AddContent: AddContent,
			wwTabOnDataChange: wwTabOnDataChange,
		};
	}
})(window);
