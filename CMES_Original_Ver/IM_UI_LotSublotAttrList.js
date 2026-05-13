/*
Name:        	IM_UI_LotSublotAttrList.js
Description: 	IM_UI_LotSublotAttrList js file containing logic pertaining to the Lot/Sublot Atttibutes List form.

Ver	  Release		By					Date					Change Description
001	 	01.00	  	Praveen  		2025-02-05		#4310 First version.
002		01.00		  Bas van B		2025-02-26		#4253 Translated item and attribute descriptions.
003		01.00		  Bas van B		2025-02-26		#4253 Properly declare parameterColl objects in MES call functions.
004		01.00		  Usha M			2025-02-27		#4355 Removed console.log
005 	01.01			Fayaz A			2025-05-13		#4986 The function "wwTabOnDataChange" and "wwActionOnDataChange" is updated to
																								take the form_name from JSON data.
*/

((window) => {
	//  ------------------------------ Global Variables ------------------------------------
	window.IM = window.IM || {};
	IM.LotSublotAttrList = IM.LotSublotAttrList || {};
	IM.LotSublotAttrList = LotSublotAttrList();
	//  ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */

	function LotSublotAttrList() {
		//  ---------------------------- Constant Variables ----------------------------------
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;
		const _controls = {};
		const IM_EVENTS = "im.lotAttr.add|im.lotAttr.update|im.sublotAttr.add|im.sublotAttr.update";
		const IM_MODULE = "im";
		const IM_LOT_ACTIONS_DATA =
			'[{"command":"details","param20":"","icon":"info.png","title":"Details","form_name":"IM_UI_LotAttr"}' +
			',{"command":"add","param20":"","icon":"add.svg","title":"Add","form_name":"IM_UI_LotAttr"}' +
			',{"command":"edit","param20":"","icon":"edit.png","title":"Edit","form_name":"IM_UI_LotAttr"}' +
			',{"command":"delete","param20":"","icon":"delete.svg","title":"Delete","form_name":""}' +
			',{"command":"refresh","param20":"","icon":"refresh.svg","title":"Delete","form_name":""}]';
		const IM_SUB_LOT_ACTIONS_DATA =
			'[{"command":"details","param20":"","icon":"info.png","title":"Details","form_name":"IM_UI_SublotAttr"}' +
			',{"command":"add","param20":"","icon":"add.svg","title":"Add","form_name":"IM_UI_SublotAttr"}' +
			',{"command":"edit","param20":"","icon":"edit.png","title":"Edit","form_name":"IM_UI_SublotAttr"}' +
			',{"command":"delete","param20":"","icon":"delete.svg","title":"Delete","form_name":""}' +
			',{"command":"refresh","param20":"","icon":"refresh.svg","title":"Delete","form_name":""}]';
		const IM_TAB_DATA =
			'[{"type":"Tab","form_name":"IM_UI_LotAttr","icon":"hide","value":"LOT","title":"Lot Attribute","attr_desc":null}' +
			',{"type":"Tab","form_name":"IM_UI_SublotAttr","icon":"hide","value":"SubLot","title":"SubLot Attribute","attr_desc":null}]';
		//  ----------------------------------------------------------------------------------

		//  ----------------------------- Private Variables ----------------------------------

		let selectedRow = "";
		//  ----------------------------------------------------------------------------------

		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			//  Initialize variables
			FORM.Control = Control;
			_controls.wwNavigation = FORM.Control.findByXmlNode("WWNA");
			_controls.wwTab = FORM.Control.findByXmlNode("WWTB");
			_controls.wwLotAttribute = FORM.Control.findByXmlNode("WWLT");
			_controls.wwSubLotAttribute = FORM.Control.findByXmlNode("WWSLT");
			_controls.epContainer = FORM.Control.findByXmlNode("EPC");
			_controls.hfNavbar = FORM.Control.findByXmlNode("HFNAV");
			_controls.hfItem_id = FORM.Control.findByXmlNode("HFIM");
			_controls.hfLot_no = FORM.Control.findByXmlNode("HFLT");
			_controls.hfSubLot_no = FORM.Control.findByXmlNode("HFSLT");
			_controls.hfAttr_id = FORM.Control.findByXmlNode("HFAT");
			_controls.hfAttr_value = FORM.Control.findByXmlNode("HFATV");
			_controls.hfNote = FORM.Control.findByXmlNode("HFNT");
			_controls.hfButtonAction = FORM.Control.findByXmlNode("HFBTA");
			_controls.iwDeleteLotAttr = FORM.Control.findByXmlNode("IWLAD");
			_controls.iwDeleteSubLotAttr = FORM.Control.findByXmlNode("IWSLD");

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
		 * listens to events that have to be reacted upon by card widget to refresh
		 */
		function peEventListener(event) {
			// Split the module_event string into an array
			const eventList = IM_EVENTS.split("|");
			// Check if event.detail.subType matches any value in the array
			if (eventList.includes(event.detail.subType)) {
				if (event.detail.sourceId === "IM_UI_AddLotAttr") {
					wwLotAttributeLoad();
					_controls.wwNavigation.widgetProperties.data = IM_LOT_ACTIONS_DATA;
				} else if (event.detail.sourceId === "IM_UI_AddSubLotAttr") {
					wwSubLotAttributeLoad();
					_controls.wwNavigation.widgetProperties.data = IM_SUB_LOT_ACTIONS_DATA;
				}
				_controls.wwNavigation.widgetProperties.float = "right";
				_controls.wwNavigation.widgetProperties.command = "edit,delete";
			}
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
			_controls.wwLotAttribute.visible = false;
			_controls.wwSubLotAttribute.visible = false;

			_controls.wwTab.widgetProperties.data = IM_TAB_DATA;

			FT.Common.windowEventListenerAdd(IM_MODULE, peEventListener);
		}

		/**
		 * Function to load lot attribute details and assign data to kendo widget
		 * @param {string} item_id
		 * @param {string} lot_no
		 * @returns {JSON} data
		 */
		function wwLotAttributeLoad() {
			const parameterColl = { item_id: "", lot_no: "" };
			const spName = "sp_sa_IM_Lot_Attr";
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", spName, parameterColl, false).then(
				(data) => {
					// Translate the attributes and item descriptions
					const fields = [
						FT.Ui.translationColumnField("attr_desc", FT.Ui.TRANSLATION_GROUPS.grpAttrAttrDesc, FT.Ui.TRANSLATION_KEYS.keyAttr),
						FT.Ui.translationColumnField("item_desc", FT.Ui.TRANSLATION_GROUPS.grpItemItemDesc, FT.Ui.TRANSLATION_KEYS.keyItem),
					];
					const translatedData = FT.Ui.translateArray(data, fields);

					// Handle successful response data
					_controls.wwLotAttribute.widgetProperties.data = JSON.stringify(translatedData);
					_controls.epContainer.url = "";
				},
				(error) => {
					// Handle error
					throw Error("Error:", error);
				},
			);
		}
		/**
		 * Function to load sublot attribute details and assign data to kendo widget
		 * @param {string} item_id
		 * @param {string} lot_no
		 * @param {string} sublot_no
		 * @returns {JSON} data
		 */
		function wwSubLotAttributeLoad() {
			const parameterColl = { item_id: "", lot_no: "", sublot_no: "" };
			const spName = "sp_sa_IM_SubLot_Attr";
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", spName, parameterColl, false).then(
				(data) => {
					// Translate the attributes and item descriptions
					const fields = [
						FT.Ui.translationColumnField("attr_desc", FT.Ui.TRANSLATION_GROUPS.grpAttrAttrDesc, FT.Ui.TRANSLATION_KEYS.keyAttr),
						FT.Ui.translationColumnField("item_desc", FT.Ui.TRANSLATION_GROUPS.grpItemItemDesc, FT.Ui.TRANSLATION_KEYS.keyItem),
					];
					const translatedData = FT.Ui.translateArray(data, fields);

					// Handle successful response data
					_controls.wwSubLotAttribute.widgetProperties.data = JSON.stringify(translatedData);
					_controls.epContainer.url = "";
				},
				(error) => {
					// Handle error
					throw Error("Error:", error);
				},
			);
		}

		/**
		 * function appears to handle UI changes based on the selection of a tab and adjusts the visibility and actions accordingly
		 */
		function wwTabOnDataChange() {
			_controls.hfItem_id.value = "";
			_controls.hfLot_no.value = "";
			_controls.hfSubLot_no.value = "";
			_controls.hfAttr_id.value = "";
			_controls.hfAttr_value.value = "";
			_controls.hfNote.value = "";
			selectedRow = "";
			const selectedAction = JSON.parse(_controls.wwTab.value);
			if (selectedAction) {
				const selectedValue = selectedAction.value;
				_controls.epContainer.url = "";

				if (selectedValue === "LOT") {
					_controls.wwLotAttribute.visible = true;
					_controls.wwSubLotAttribute.visible = false;
					wwLotAttributeLoad();
					_controls.wwNavigation.widgetProperties.data = IM_LOT_ACTIONS_DATA;
					_controls.wwNavigation.widgetProperties.float = "right";
					_controls.wwNavigation.widgetProperties.command = "edit,delete";
				} else if (selectedValue === "SubLot") {
					_controls.wwSubLotAttribute.visible = true;
					_controls.wwLotAttribute.visible = false;
					wwSubLotAttributeLoad();
					_controls.wwNavigation.widgetProperties.data = IM_SUB_LOT_ACTIONS_DATA;
					_controls.wwNavigation.widgetProperties.float = "right";
					_controls.wwNavigation.widgetProperties.command = "edit,delete";
				}
			}
		}

		/**
		 * function is designed to handle changes in the data related to a navigation element,
		  specifically responding to changes in the _controls.hfNavbar value
		 */
		function hfNavbarOnDataChange() {
			const selectedAction = JSON.parse(_controls.hfNavbar.value);
			_controls.epContainer.url = "";
			_controls.epContainer.url = SFU.getFormUrl(selectedAction.form_name);
		}
		/**
		 * This function executes when the user clicks on a row in the wwLotAttribute widget.
		 * It extracts information from the selected row and updates various form fields
		 */
		function wwLotOnClick() {
			if (
				_controls.wwLotAttribute.widgetProperties.selectedRow !== null &&
				_controls.wwLotAttribute.widgetProperties.selectedRow !== ""
			) {
				const selectedRowLot =
					_controls.wwLotAttribute.widgetProperties.selectedRow != null
						? JSON.parse(_controls.wwLotAttribute.widgetProperties.selectedRow)
						: "";
				selectedRow = selectedRowLot;
				if (selectedRowLot !== null) {
					_controls.hfItem_id.value = selectedRowLot.item_id;
					_controls.hfLot_no.value = selectedRowLot.lot_no;
					_controls.hfAttr_id.value = selectedRowLot.attr_id;
					_controls.hfAttr_value.value = selectedRowLot.attr_value;
					_controls.hfNote.value = selectedRowLot.notes;
					if (selectedRowLot.attr_id !== null) {
						_controls.wwNavigation.widgetProperties.selectedValue = "details";
						_controls.wwNavigation.widgetProperties.float = "right";
						_controls.wwNavigation.widgetProperties.command = "{}";
					} else {
						_controls.wwNavigation.widgetProperties.command = "edit,delete,details";
					}
					hfNavbarOnDataChange();
				}
			} else {
				selectedRow = "";
				_controls.epContainer.url = "";
			}
		}
		/**
		 * This function executes when the user clicks on a row in the wwSubLotAttribute widget.
		 * It extracts information from the selected row and updates various form fields
		 */
		function wwSubLotOnClick() {
			if (
				_controls.wwSubLotAttribute.widgetProperties.selectedRow !== null &&
				_controls.wwSubLotAttribute.widgetProperties.selectedRow !== ""
			) {
				const selectedRowSubLot =
					_controls.wwSubLotAttribute.widgetProperties.selectedRow != null
						? JSON.parse(_controls.wwSubLotAttribute.widgetProperties.selectedRow)
						: "";
				selectedRow = selectedRowSubLot;
				if (selectedRow !== null) {
					_controls.hfItem_id.value = selectedRowSubLot.item_id;
					_controls.hfLot_no.value = selectedRowSubLot.lot_no;
					_controls.hfSubLot_no.value = selectedRowSubLot.sublot_no;
					_controls.hfAttr_id.value = selectedRowSubLot.attr_id;
					_controls.hfAttr_value.value = selectedRowSubLot.attr_value;
					_controls.hfNote.value = selectedRowSubLot.notes;
					if (selectedRowSubLot.attr_id !== null) {
						_controls.wwNavigation.widgetProperties.selectedValue = "details";
						_controls.wwNavigation.widgetProperties.float = "right";
						_controls.wwNavigation.widgetProperties.command = "{}";
					} else {
						_controls.wwNavigation.widgetProperties.command = "edit,delete,details";
					}
					hfNavbarOnDataChange();
				}
			} else {
				selectedRow = "";
				_controls.epContainer.url = "";
			}
		}
		/**
		 *function processes changes in the data for handling navigation-related tasks like adding, editing, or deleting lot or sublot attributes.
		 * Based on the selected action (add, edit, delete),
		 */
		function wwActionOnDataChange() {
			_controls.hfNavbar.value = _controls.wwNavigation.value;
			_controls.hfButtonAction.value = _controls.wwNavigation.value;
			const selectedAction = JSON.parse(_controls.wwNavigation.value);
			const selectedTabJSON = JSON.parse(_controls.wwTab.value);
			const selectedTabValue = selectedTabJSON.value;
			if (selectedRow !== "") {
				if (selectedTabValue === "LOT") {
					if (selectedAction.command.toLowerCase() === "delete") {
						_controls.epContainer.url = "";
						SFU.showConfirmation(
							skelta.localize.getString("@@IM_DelAttr@@"),
							skelta.localize.getString("@@IM_DelAttrConfMsg@@"),
							(val) => {
								if (val) {
									SFU.invokeWorkflow(_controls.iwDeleteLotAttr);
								}
							},
						);
					} else if (selectedAction.command.toLowerCase() === "refresh") {
						_controls.wwNavigation.widgetProperties.float = "right";
						_controls.wwNavigation.widgetProperties.command = "edit,delete";
						wwLotAttributeLoad();
					} else {
						_controls.epContainer.url = "";
						_controls.epContainer.url = SFU.getFormUrl(selectedAction.form_name);
					}
				} else if (selectedTabValue === "SubLot") {
					if (selectedAction.command.toLowerCase() === "delete") {
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
					} else if (selectedAction.command.toLowerCase() === "refresh") {
						_controls.wwNavigation.widgetProperties.float = "right";
						_controls.wwNavigation.widgetProperties.command = "edit,delete";
						wwSubLotAttributeLoad();
					} else {
						_controls.epContainer.url = "";
						_controls.epContainer.url = SFU.getFormUrl(selectedAction.form_name);
					}
				}
			} else {
				_controls.epContainer.url = "";
			}
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwDeleteLotAttrOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			wwLotAttributeLoad();
			_controls.wwNavigation.widgetProperties.float = "right";
			_controls.wwNavigation.widgetProperties.command = "edit,delete";
			_controls.wwNavigation.widgetProperties.data = IM_LOT_ACTIONS_DATA;
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwDeleteSubLotAttrOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			wwSubLotAttributeLoad();
			_controls.wwNavigation.widgetProperties.float = "right";
			_controls.wwNavigation.widgetProperties.command = "edit,delete";
			_controls.wwNavigation.widgetProperties.data = IM_SUB_LOT_ACTIONS_DATA;
		}
		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			wwTabOnDataChange: wwTabOnDataChange,
			wwLotOnClick: wwLotOnClick,
			wwSubLotOnClick: wwSubLotOnClick,
			hfNavbarOnDataChange: hfNavbarOnDataChange,
			wwActionOnDataChange: wwActionOnDataChange,
			iwDeleteLotAttrOnPostWorkflow: iwDeleteLotAttrOnPostWorkflow,
			iwDeleteSubLotAttrOnPostWorkflow: iwDeleteSubLotAttrOnPostWorkflow,
		};
	}
})(window);
