/*
Name:        	IM_UI_LotManagement.js
Description: 	IM_UI_LotManagement js file containing logic pertaining to the Lot management form.

Ver		Release	  By					Date					Change Description
001		01.02.00  Praveen  		2025-06-18		#5051 First version.
*/

((window) => {
	//  ------------------------------ Global Variables ------------------------------------
	window.IM = window.IM || {};
	IM.LotManagement = IM.LotManagement || {};
	IM.LotManagement = LotManagement();
	//  ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */

	function LotManagement() {
		//  ---------------------------- Constant Variables ----------------------------------
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;
		const _controls = {};
		const IM_EVENTS = "im.lotAdd.add|im.lotEdit.edit";
		const IM_MODULE = "im";
		const IM_LOT_ACTIONS_DATA =
			'[{"command":"details","param20":"","icon":"view--detail.svg","title":"Details","form_name":"IM_UI_LotView"}' +
			',{"command":"add","param20":"","icon":"action--create.svg","title":"Add","form_name":"IM_UI_LotAdd"}' +
			',{"command":"edit","param20":"","icon":"action--edit.svg","title":"Edit","form_name":"IM_UI_LotEdit"}' +
			',{"command":"refresh","param20":"","icon":"action--refresh.svg","title":"Refresh","form_name":""}]';

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
			_controls.wwLot = FORM.Control.findByXmlNode("WWLT");
			_controls.wwCommandButton = FORM.Control.findByXmlNode("WWCB");
			_controls.wwCheckboxFilter = FORM.Control.findByXmlNode("WWFS");
			_controls.epContainer = FORM.Control.findByXmlNode("EPC");
			_controls.lbTitle = FORM.Control.findByXmlNode("LBHDR");
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
				_controls.wwCommandButton.widgetProperties.command = "edit";
				_controls.wwCommandButton.widgetProperties.data = IM_LOT_ACTIONS_DATA;
				wwCheckboxFilterDataLoad();
				wwLotLoad();
			} catch (exception) {
				handleScriptError(exception);
			}
			FT.Common.windowEventListenerAdd(IM_MODULE, imEventListener);
		}
		/**
		 * Function to loads lot data using 'sp_SA_IM_Lot' with selected filters and updates the wwLot control
		 * @param {string} item_class_list
		 * @param {string} grade_list
		 * @param {string} state_list
		 * @returns {JSON} data
		 */
		function wwLotLoad() {
			const parameterColl = { item_class_list: selectedItemClass, grade_list: selectedGrade, state_list: selectedState };
			const spName = "sp_SA_IM_Lot";
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", spName, parameterColl, false).then(
				(data) => {
					// Handle successful response data
					_controls.wwLot.widgetProperties.data = JSON.stringify(data);
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
				wwLotLoad();
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
		function wwLotonClick() {
			const selectedRowValue = _controls.wwLot.widgetProperties.selectedRow;
			if (selectedRowValue) {
				_controls.epContainer.url = "";
				const lotQueueRow = JSON.parse(_controls.wwLot.widgetProperties.selectedRow);
				const lotObj = [
					{
						rowId: lotQueueRow.row_id,
						jsonValue: lotQueueRow,
					},
				];
				FT.WorkTasks.contextSet("", "itemInv", JSON.stringify(lotObj));
				_controls.wwCommandButton.widgetProperties.command = "{}";
				_controls.wwCommandButton.widgetProperties.data = IM_LOT_ACTIONS_DATA;
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
				wwLotLoad();
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
			const selectedRowValue = _controls.wwLot.widgetProperties.selectedRow;
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
					_controls.wwCommandButton.widgetProperties.command = "edit";
					_controls.wwCommandButton.widgetProperties.data = IM_LOT_ACTIONS_DATA;
					wwLotLoad();
				} else if (selectedRowValue) {
					_controls.epContainer.url = "";
					_controls.epContainer.url = SFU.getFormUrl(selectedActionValue.form_name);
				} else {
					_controls.epContainer.url = "";
				}
			}
		}

		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			wwCheckboxFilterOnDataChange: wwCheckboxFilterOnDataChange,
			wwCommandButtonOnDataChange: wwCommandButtonOnDataChange,
			wwIMStatesVisibleScripts: wwIMStatesVisibleScripts,
			wwLotonClick: wwLotonClick,
			wwCheckboxFilterDataLoad: wwCheckboxFilterDataLoad,
			setLocalizedTitle: setLocalizedTitle,
			wwPanelVisibleScripts: wwPanelVisibleScripts,
		};
	}
})(window);
