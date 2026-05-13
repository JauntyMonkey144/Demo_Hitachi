/*
Name:        	IM_UI_SublotAttributeEdit.js
Description: 	IM_UI_SublotAttributeEdit js file containing logic pertaining to the Edit Sublot Atttibutes form.

Ver		Release	    By			    Date			    Change Description
001		01.02.00  	Praveen  		2025-06-07		#5113 First version.
*/

((window) => {
	//  ------------------------------ Global Variables ------------------------------------
	window.IM = window.IM || {};
	IM.SublotAttributeEdit = IM.SublotAttributeEdit || {};
	IM.SublotAttributeEdit = SublotAttributeEdit();
	//  ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */

	function SublotAttributeEdit() {
		//  ---------------------------- Constant Variables ----------------------------------
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;
		const _controls = {};

		//  ----------------------------- Private Variables ----------------------------------
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
			_controls.ddItem = FORM.Control.findByXmlNode("DDID");
			_controls.ddLot_no = FORM.Control.findByXmlNode("DDLT");
			_controls.ddSublot_no = FORM.Control.findByXmlNode("DDSL");
			_controls.txAttributeValue = FORM.Control.findByXmlNode("TXAV");
			_controls.txNote = FORM.Control.findByXmlNode("TXNT");
			_controls.txComment = FORM.Control.findByXmlNode("TXCMT");
			_controls.iwAdd = FORM.Control.findByXmlNode("IWADD");
			_controls.iwEdit = FORM.Control.findByXmlNode("IWEDT");
			_controls.hfItem_id = FORM.Control.findByXmlNode("HFIM");
			_controls.hfLot_no = FORM.Control.findByXmlNode("HFLT");
			_controls.hfAction = FORM.Control.findByXmlNode("HFACT");
			_controls.hfAttr_id = FORM.Control.findByXmlNode("HDAT");
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
			const titleString = skelta.localize.getString("@@IM_Edit@@");
			_controls.lbTitle.value = titleString;
			const selectedLotAttr = FT.WorkTasks.contextGet(FORM.Control, "itemInv");
			if (selectedLotAttr.length > 0) {
				ddAttributeLoad();
				ddItemLoad();
				ddLotLoad();
				ddSublotLoad();
				bindSublotAttrDetails();
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
		 * This function with a header context, where you control the display of attribute details or reset
		 *  the form fields based on user actions
		 */
		function bindSublotAttrDetails() {
			const lotAttr = FT.WorkTasks.contextGet(FORM.Control, "itemInv")[0].jsonValue;
			_controls.ddAttribute.value = lotAttr.attr_id;
			_controls.txAttributeValue.value = lotAttr.attr_value;
			_controls.txNote.value = lotAttr.notes;
			_controls.ddLot_no.value = lotAttr.lot_no;
			_controls.ddSublot_no.value = lotAttr.sublot_no;
			_controls.ddItem.value = lotAttr.item_id;
			_controls.txComment.value = lotAttr.last_edit_comment;
		}

		/**
		 * Prepares data and sets control values before executing the workflow.
		 */
		function iwEditSublotAttrOnPreWorkflow() {
			if (FORM.Control.validateForm() === true) {
				_controls.hfAction.value = ACTION_EDIT;
				return true;
			}
			return false;
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwEditSublotAttrOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"im",
					"im.sublotAttrEdit.edit",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"IM_UI_SublotAttributeEdit",
					"im.sublotAttrEdit.edit",
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
			iwEditSublotAttrOnPreWorkflow: iwEditSublotAttrOnPreWorkflow,
			iwEditSublotAttrOnPostWorkflow: iwEditSublotAttrOnPostWorkflow,
			onChangeDDItem: onChangeDDItem,
		};
	}
})(window);
