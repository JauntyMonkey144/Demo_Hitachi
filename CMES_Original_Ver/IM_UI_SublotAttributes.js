/*
Name:        	IM_UI_SublotAttributes.js
Description: 	IM_UI_SublotAttributes js file containing logic pertaining to the Sublot attributes form.

Ver		Release	  By		    Date			    Change Description
001		01.02.00  Praveen   2025-06-07		#5107 First version.
*/

((window) => {
	//  ------------------------------ Global Variables ------------------------------------
	window.IM = window.IM || {};
	IM.SublotAttributes = IM.SublotAttributes || {};
	IM.SublotAttributes = SublotAttributes();
	//  ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */

	function SublotAttributes() {
		//  ---------------------------- Constant Variables ----------------------------------
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;
		const _controls = {};
		const IM_EVENTS = "im.sublotAttrAdd.add|im.sublotAttrEdit.edit";
		const IM_MODULE = "im";
		const IM_SUBLOT_ACTIONS_DATA =
			'[{"command":"details","param20":"","icon":"view--detail.svg","title":"Details","form_name":"IM_UI_SublotAttributeView"}' +
			',{"command":"add","param20":"","icon":"action--create.svg","title":"Add","form_name":"IM_UI_SublotAttributeAdd"}' +
			',{"command":"edit","param20":"","icon":"action--edit.svg","title":"Edit","form_name":"IM_UI_SublotAttributeEdit"}' +
			',{"command":"delete","param20":"","icon":"action--delete.svg","title":"Delete","form_name":""}' +
			',{"command":"refresh","param20":"","icon":"action--refresh.svg","title":"Delete","form_name":""}]';

		//  ----------------------------- Private Variables ----------------------------------
		const entId = "";
		let lastFilterValue = "";
		let selectedGrade = "";
		let selectedState = "";
		let selectedItemClass = "";
		//  ----------------------------------------------------------------------------------

		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			//  Initialize variables
			FORM.Control = Control;
			_controls.wwSublotAttr = FORM.Control.findByXmlNode("WWSLA");
			_controls.wwCommandButton = FORM.Control.findByXmlNode("WWCB");
			_controls.wwCheckboxFilter = FORM.Control.findByXmlNode("WWFS");
			_controls.epContainer = FORM.Control.findByXmlNode("EPC");
			_controls.lbTitle = FORM.Control.findByXmlNode("LBHDR");
			_controls.iwDeleteSubLotAttr = FORM.Control.findByXmlNode("IWSLD");
			_controls.hfItemId = FORM.Control.findByXmlNode("HDITD");
			_controls.hfLotno = FORM.Control.findByXmlNode("HDLTN");
			_controls.hfSublotno = FORM.Control.findByXmlNode("HFSTN");
			_controls.hfAttrId = FORM.Control.findByXmlNode("HFATD");

			//  Include js files
			includeJsFiles();

			//  Include js files via ajax
			includeJsFilesAjax();

			//  Include CSS files
			includeCssFiles();

			//  Add code here
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
				const lotObj = [
					{
						rowId: null,
						jsonValue: null,
					},
				];
				FT.WorkTasks.contextSet("", "itemInv", JSON.stringify(lotObj));
				lastFilterValue = "";
				_controls.wwCommandButton.widgetProperties.selectedValue = "details";
				_controls.wwCommandButton.widgetProperties.float = "right";
				_controls.wwCommandButton.widgetProperties.command = "edit,delete";
				_controls.wwCommandButton.widgetProperties.data = IM_SUBLOT_ACTIONS_DATA;
				wwCheckboxFilterDataLoad();
				wwSublotAttrLoad();
			} catch (exception) {
				handleScriptError(exception);
			}
			FT.Common.windowEventListenerAdd(IM_MODULE, imEventListener);
		}
		/**
		 * Function to loads lot data using 'sp_sa_IM_Lot_Attr' with selected filters and updates the wwLotAttr control
		 * @param {string} item_id
		 * @param {string} lot_no
		 * @returns {JSON} data
		 */
		function wwSublotAttrLoad() {
			const parameterColl = { item_id: "", lot_no: "" };
			const spName = "sp_sa_IM_SubLot_Attr";
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", spName, parameterColl, false).then(
				(data) => {
					// Handle successful response data
					_controls.wwSublotAttr.widgetProperties.data = JSON.stringify(data);
					// _controls.epContainer.url = "";
				},
				(error) => {
					// Handle error
					throw Error("Error:", error);
				},
			);
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
			throw errorMessage;
		}
		/**
		 * Function to set Panel Z - index
		 */
		function wwPanelVisibleScripts(formControl, panelId, indexValue) {
			$(formControl.findById(panelId).domElement).css("z-index", indexValue);
			return true;
		}
		/**
		 * Sets the localized title for the lbTitle control
		 */
		function setLocalizedTitle() {
			const titleString = skelta.localize.getString("@@IM_HDRDetails@@");
			_controls.lbTitle.value = titleString;
		}
		/**
		 * Updates filter values on checkbox change and reloads lot data if changed
		 */
		function wwCheckboxFilterOnDataChange() {
			const selectedValues = _controls.wwCheckboxFilter.value;
			if (selectedValues !== lastFilterValue) {
				lastFilterValue = selectedValues;
				selectedGrade = selectedValues.Grade !== undefined ? selectedValues.Grade.toString() : "";
				selectedState = selectedValues.State !== undefined ? selectedValues.State.toString() : "";
				selectedItemClass = selectedValues.ItemClass !== undefined ? selectedValues.ItemClass.toString() : "";
				wwSublotAttrLoad();
			}
		}
		/**
		 * Adjusts overflow and z-index to ensure dropdown visibility.
		 */
		function wwIMStatesVisibleScripts(Control) {
			$(Control.findById("W1").domElement).parent().css("overflow", "visible");
			$(Control.findById("W1").domElement).parent().parent().css("overflow", "visible");
			$(Control.findById("W1").domElement).parent().closest("div[controlid='W1']").css("z-index", "9999999999");
			return true;
		}

		/**
		 * Handles lot row click: sets item context and triggers a UI update.
		 */
		function wwSublotonClick() {
			const selectedRowValue = _controls.wwSublotAttr.widgetProperties.selectedRow;
			if (selectedRowValue) {
				_controls.epContainer.url = "";
				const lotQueueRow = JSON.parse(_controls.wwSublotAttr.widgetProperties.selectedRow);
				const lotObj = [
					{
						rowId: lotQueueRow.row_id,
						jsonValue: lotQueueRow,
					},
				];
				FT.WorkTasks.contextSet("", "itemInv", JSON.stringify(lotObj));
				_controls.wwCommandButton.widgetProperties.command = "{}";
				_controls.wwCommandButton.widgetProperties.data = IM_SUBLOT_ACTIONS_DATA;
				wwCommandButtonOnDataChange();
			} else {
				_controls.epContainer.url = "";
			}
		}
		/**
		 * Listens for IM events and triggers lot data reloa
		 */
		function imEventListener(event) {
			// Split the module_event string into an array
			const eventList = IM_EVENTS.split("|");

			// Check if event.detail.subType matches any value in the array
			if (eventList.includes(event.detail.subType)) {
				wwSublotAttrLoad();
				wwCommandButtonOnDataChange();
			}
		}
		/**
		 * Loads checkbox filter data using stored procedure 'sp_SA_IM_Filters'
		 * @param {int} ent_id
		 */
		function wwCheckboxFilterDataLoad() {
			let parameterColl = { ent_id: entId };

			if (FT.Ui.Translation !== undefined) {
				if (FT.Ui.Translation.LangId !== undefined) {
					parameterColl = { ent_id: entId, lang_id: FT.Ui.Translation.LangId };
				}
			}
			const spName = "sp_SA_IM_Filters";
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", spName, parameterColl, false).then(
				(data) => {
					// Handle successful response data
					const filteredData = data.filter(
						(item) => item.group === "State" || item.group === "ItemClass" || item.group === "Grade",
					);
					_controls.wwCheckboxFilter.widgetProperties.data = JSON.stringify(filteredData);
				},
				(error) => {
					// Handle error
					throw Error("Error:", error);
				},
			);
		}
		/**
		 * Processes command button changes:
		 * - Clears or sets the epContainer URL based on command and selection.
		 * - For 'add', opens the specified form.
		 * - For 'delete', prompts confirmation before invoking delete workflow.
		 * - For 'refresh', reloads lot data.
		 * - Does nothing if no valid action or selection.
		 */
		function wwCommandButtonOnDataChange() {
			const selectedActionValue = JSON.parse(_controls.wwCommandButton.value);
			const selectedRowValue = _controls.wwSublotAttr.widgetProperties.selectedRow;
			const command = selectedActionValue.command.toLowerCase();
			if (command === "add") {
				_controls.epContainer.url = "";
				_controls.epContainer.url = SFU.getFormUrl(selectedActionValue.form_name);
				return;
			}
			if (selectedActionValue) {
				if (command === "refresh") {
					_controls.wwCommandButton.widgetProperties.selectedValue = "details";
					_controls.wwCommandButton.widgetProperties.float = "right";
					_controls.wwCommandButton.widgetProperties.command = "edit,delete";
					_controls.wwCommandButton.widgetProperties.data = IM_SUBLOT_ACTIONS_DATA;
					wwSublotAttrLoad();
				} else if (command.toLowerCase() === "delete") {
					_controls.epContainer.url = "";
					SFU.showConfirmation(
						skelta.localize.getString("@@IM_DelAttr@@"),
						skelta.localize.getString("@@IM_DelAttrConfMsg@@"),
						(val) => {
							if (val) {
								SFU.invokeWorkflow(_controls.iwDeleteSubLotAttr);
							}
						},
					);
				} else if (selectedRowValue) {
					_controls.epContainer.url = "";
					_controls.epContainer.url = SFU.getFormUrl(selectedActionValue.form_name);
				} else {
					_controls.epContainer.url = "";
				}
			}
		}

		/**
		 * Prepares data and sets control values before executing the workflow.
		 */
		function iwDeleteSublotAttrOnPreWorkflow() {
			if (FORM.Control.validateForm() === true) {
				const lotAttr = FT.WorkTasks.contextGet(FORM.Control, "itemInv")[0].jsonValue;
				_controls.hfItemId.value = lotAttr.item_id;
				_controls.hfAttrId.value = lotAttr.attr_id;
				_controls.hfLotno.value = lotAttr.lot_no;
				_controls.hfSublotno.value = lotAttr.sublot_no;
				return true;
			}
			return false;
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwDeletesublotAttrOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			wwSublotAttrLoad();
			_controls.wwCommandButton.widgetProperties.float = "right";
			_controls.wwCommandButton.widgetProperties.command = "edit,delete";
			_controls.wwCommandButton.widgetProperties.data = IM_SUBLOT_ACTIONS_DATA;
		}

		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			wwCheckboxFilterOnDataChange: wwCheckboxFilterOnDataChange,
			wwCommandButtonOnDataChange: wwCommandButtonOnDataChange,
			wwIMStatesVisibleScripts: wwIMStatesVisibleScripts,
			wwSublotonClick: wwSublotonClick,
			wwCheckboxFilterDataLoad: wwCheckboxFilterDataLoad,
			setLocalizedTitle: setLocalizedTitle,
			wwPanelVisibleScripts: wwPanelVisibleScripts,
			iwDeleteSublotAttrOnPreWorkflow: iwDeleteSublotAttrOnPreWorkflow,
			iwDeleteSublotAttrOnPostWorkflow: iwDeletesublotAttrOnPostWorkflow,
		};
	}
})(window);
