/*
Name:        	IM_UI_SublotAttr.js
Description: 	IM_UI_SublotAttr js file containing logic pertaining to the Add SubLot Atttibutes form.

Ver		Release	By					Date					Change Description
001		01.00	  Praveen  		2025-02-07		#4313 First version.
002		01.00		Bas van B		2025-02-26		#4253 Translated attribute descriptions.
*/

((window) => {
	//  ------------------------------ Global Variables ------------------------------------
	window.IM = window.IM || {};
	IM.SublotAttr = IM.SublotAttr || {};
	IM.SublotAttr = SublotAttr();
	//  ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */

	function SublotAttr() {
		//  ---------------------------- Constant Variables ----------------------------------
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;
		const _controls = {};
		//  ----------------------------------------------------------------------------------

		//  ----------------------------- Private Variables ----------------------------------
		const ACTION_ADD = 1;
		const ACTION_EDIT = 0;
		const ATTR_GRP = 9;
		//  ----------------------------------------------------------------------------------

		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			//  Initialize variables
			FORM.Control = Control;
			_controls.ddAttribute = FORM.Control.findByXmlNode("DDAT");
			_controls.txAttributeValue = FORM.Control.findByXmlNode("TXAV");
			_controls.txNote = FORM.Control.findByXmlNode("TXNT");
			_controls.txComment = FORM.Control.findByXmlNode("TXCMT");
			_controls.iwAdd = FORM.Control.findByXmlNode("IWADD");
			_controls.iwEdit = FORM.Control.findByXmlNode("IWEDT");
			_controls.hfItem_id = FORM.Control.findByXmlNode("HFIM");
			_controls.hfLot_no = FORM.Control.findByXmlNode("HFLT");
			_controls.hfSubLot_no = FORM.Control.findByXmlNode("HDSLT");
			_controls.hfAction = FORM.Control.findByXmlNode("HFACT");
			_controls.hfAttr_id = FORM.Control.findByXmlNode("HDAT");
			_controls.lbTitle = FORM.Control.findByXmlNode("LBHDR");
			_controls.ddItem = FORM.Control.findByXmlNode("DDID");
			_controls.ddLot_no = FORM.Control.findByXmlNode("DDLT");
			_controls.ddSublot_no = FORM.Control.findByXmlNode("DDSL");

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
			const applicationName = skelta.userContext.getUserContextFor("appN");
			const parentFormId = window.parent.skelta.userContext.getUserContextFor("itemId");
			const parentFormVersion = window.parent.skelta.userContext.getUserContextFor("vStamp");
			const parentFormUniqueKey = skelta.forms.utilities.getFormUniqueKey(applicationName, parentFormId, parentFormVersion);
			const parentViewModelObject = window.parent["viewModelObject_" + parentFormUniqueKey];
			const itemId = parentViewModelObject.findByXmlNode("HFIM").value;
			const lotno = parentViewModelObject.findByXmlNode("HFLT").value;
			const sublotno = parentViewModelObject.findByXmlNode("HFSLT").value;
			const attrid = parentViewModelObject.findByXmlNode("HFAT").value;
			const attrvalue = parentViewModelObject.findByXmlNode("HFATV").value;
			const note = parentViewModelObject.findByXmlNode("HFNT").value;
			const buttonAction = parentViewModelObject.findByXmlNode("HFBTA").value;
			ddItemLoad();
			_controls.ddItem.value = itemId;
			_controls.ddLot_no.value = lotno;
			_controls.ddSublot_no.value = sublotno;
			_controls.hfAttr_id.value = attrid;
			_controls.txAttributeValue.value = attrvalue;
			_controls.txNote.value = note;
			_controls.ddAttribute.enable = true;
			ddAttributeLoad();
			bindSubLotAttrDetails(attrid, attrvalue, note, JSON.parse(buttonAction).command);
			iwButtonActionVisible(JSON.parse(buttonAction).command);
		}
		/**
		 * Loads the list of item  and populates the dropdown control
		 *  with the retrieved data.
		 */
		function ddItemLoad() {
			const data = FT.WebApi.mesGetSync("api/V3/Item", "", "", false);
			DDIData = [];
			const strOptions = [];
			if (data && data.length > 0) {
				// Translate the data
				const fields = [
					FT.Ui.translationColumnField(
						"item_class_desc",
						FT.Ui.TRANSLATION_GROUPS.grpItemClassItemClassDesc,
						FT.Ui.TRANSLATION_KEYS.keyItemClass,
					),
					FT.Ui.translationColumnField("item_desc", FT.Ui.TRANSLATION_GROUPS.grpItemItemDesc, FT.Ui.TRANSLATION_KEYS.keyItem),
					FT.Ui.translationColumnField("uom_description", FT.Ui.TRANSLATION_GROUPS.grpUomDescription, ["uom_description"]),
				];
				DDIData = FT.Ui.translateArray(data, fields);
				for (let i = 0; i < DDIData.length; i++) {
					// translate the item description
					strOptions.push({ item_id: getString(DDIData[i].item_id), item_desc: DDIData[i].item_desc });
				}
			}
			FT.WorkTasks.controlOptionsSetFromDataset("DDID", 0, strOptions, "item_desc", "item_id");
		}
		/**
		 * Event when the selected item changes
		 */
		function onChangeDDItem() {
			ddLotLoad();
		}
		/**
		 * Event when the selected Lot changes
		 */
		function onChangeDDLot() {
			ddSublotLoad();
		}

		/**
		 * Loads the list of Lot no and populates the dropdown control with the retrieved data.
		 */
		function ddLotLoad() {
			parameterColl = { itemId: _controls.ddItem.value };
			const invLotData = FT.WebApi.mesGetSync("api/V3/Lot", "", parameterColl, false);
			if (invLotData.length > 0) {
				FT.WorkTasks.controlOptionsSetFromDataset("DDLT", 0, invLotData, "lot_no", "lot_no");
			}
		}
		/**
		 * Loads the list of Lot no and populates the dropdown control with the retrieved data.
		 */
		function ddSublotLoad() {
			parameterColl = { item_id: _controls.ddItem.value, lot_no: _controls.ddLot_no.value, is_serial_no: null };
			const spName = "sp_SA_Sublot";
			const invLotData = FT.WebApi.mesGetSync("api/V3/DirectAccess", spName, parameterColl, false);
			if (invLotData.length > 0) {
				FT.WorkTasks.controlOptionsSetFromDataset("DDSL", 0, invLotData, "sublot_no", "sublot_no");
			}
		}
		/**
		 * This function loads attributes and populates a dropdown control.
		 */
		function ddAttributeLoad() {
			const params = { attr_grp: ATTR_GRP };
			const argsGetAttr = {
				obj: "attr",
				cmd: "getall",
				parms: params,
			};
			let attrData = FT.WebApi.mesGetSync("api/V3/MiddlewareAccess", "", argsGetAttr, false);
			if (attrData.length > 0) {
				// Translate the attribute descriptions
				const fields = [
					FT.Ui.translationColumnField("attr_desc", FT.Ui.TRANSLATION_GROUPS.grpAttrAttrDesc, FT.Ui.TRANSLATION_KEYS.keyAttr),
				];
				attrData = FT.Ui.translateArray(attrData, fields);
				FT.WorkTasks.controlOptionsSetFromDataset("DDAT", 0, attrData, "attr_desc", "attr_id");
			}
		}
		/**
		 * This function that controls the visibility of some UI elements, specifically buttons or controls for "details," "add," and "edit" actions.
		 */
		function iwButtonActionVisible(command) {
			if (command === "details") {
				_controls.iwEdit.visible = false;
				_controls.iwAdd.visible = false;
				_controls.ddAttribute.enable = false;
				_controls.txAttributeValue.enable = false;
				_controls.txNote.enable = false;
				_controls.ddAttribute.enable = false;
				_controls.ddItem.enable = false;
				_controls.ddLot_no.enable = false;
				_controls.ddSublot_no.enable = false;
				const titleString = skelta.localize.getString("@@IM_HDRDetails@@");
				_controls.lbTitle.value = titleString;
				ddLotLoad();
				ddSublotLoad();
			} else if (command === "add") {
				_controls.iwAdd.visible = true;
				_controls.iwEdit.visible = false;
				_controls.ddAttribute.enable = true;
				_controls.ddItem.enable = true;
				const titleString = skelta.localize.getString("@@IM_Add@@");
				_controls.lbTitle.value = titleString;
				_controls.txAttributeValue.enable = true;
				_controls.txNote.enable = true;
				_controls.ddLot_no.enable = true;
				_controls.ddSublot_no.enable = true;
				ddLotLoad();
				ddSublotLoad();
			} else if (command === "edit") {
				_controls.iwAdd.visible = false;
				_controls.iwEdit.visible = true;
				_controls.ddAttribute.enable = false;
				_controls.ddItem.enable = false;
				const titleString = skelta.localize.getString("@@IM_Edit@@");
				_controls.lbTitle.value = titleString;
				_controls.txAttributeValue.enable = true;
				_controls.txNote.enable = true;
				_controls.ddLot_no.enable = false;
				_controls.ddSublot_no.enable = false;
				ddLotLoad();
				ddSublotLoad();
			} else {
				_controls.iwEdit.visible = false;
				_controls.iwAdd.visible = false;
				_controls.lbTitle.value = "";
			}
		}
		/**
		 * This function with a header context, where you control the display of attribute details or reset
		 *  the form fields based on user actions
		 */
		function bindSubLotAttrDetails(attrid, attrvalue, note, command) {
			if (command === "edit" || command === "details") {
				_controls.ddAttribute.value = attrid;
				_controls.txAttributeValue.value = attrvalue;
				_controls.txNote.value = note;
			} else {
				_controls.txAttributeValue.value = "";
				_controls.txNote.value = "";
			}
		}
		/**
		 * Prepares data and sets control values before executing the workflow.
		 */
		function iwCreateSubLotAttrOnPreWorkflow() {
			if (FORM.Control.validateForm() === true) {
				_controls.hfAction.value = ACTION_ADD;
				return true;
			}
			return false;
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwCreateSubLotAttrOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"im",
					"im.sublotAttr.add",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"IM_UI_AddSubLotAttr",
					"im.sublotAttr.add",
				);
			}
		}
		/**
		 * Prepares data and sets control values before executing the workflow.
		 */
		function iwEditSubLotAttrOnPreWorkflow() {
			if (FORM.Control.validateForm() === true) {
				_controls.hfAction.value = ACTION_EDIT;
				return true;
			}
			return false;
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwEditSubLotAttrOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"im",
					"im.sublotAttr.add",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"IM_UI_AddSubLotAttr",
					"im.sublotAttr.add",
				);
			}
		}
		// #region utility functions
		/**
		 *return empty string if input is null or undefined
		 * @param {string} input string or value which needs to convert as string.
		 */
		function getString(str) {
			if (str == null || typeof str === "undefined") {
				return "";
			}
			return str.toString();
		}
		// #endregion utility functions
		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			iwCreateSubLotAttrOnPreWorkflow: iwCreateSubLotAttrOnPreWorkflow,
			iwCreateSubLotAttrOnPostWorkflow: iwCreateSubLotAttrOnPostWorkflow,
			iwEditSubLotAttrOnPreWorkflow: iwEditSubLotAttrOnPreWorkflow,
			iwEditSubLotAttrOnPostWorkflow: iwEditSubLotAttrOnPostWorkflow,
			onChangeDDItem: onChangeDDItem,
			onChangeDDLot: onChangeDDLot,
		};
	}
})(window);
