/*
Name:        	IM_UI_LotAttributeAdd.js
Description: 	IM_UI_LotAttributeAdd js file containing logic pertaining to the Add Lot Atttibutes form.

Ver		Release	    By				Date			    Change Description
001		01.02.00  	Praveen  	2025-06-07		#5109 First version.
*/

((window) => {
	//  ------------------------------ Global Variables ------------------------------------
	window.IM = window.IM || {};
	IM.LotAttributeAdd = IM.LotAttributeAdd || {};
	IM.LotAttributeAdd = LotAttributeAdd();
	//  ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */

	function LotAttributeAdd() {
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
		const ATTR_GRP = 3;
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
			const titleString = skelta.localize.getString("@@IM_Add@@");
			_controls.lbTitle.value = titleString;
			ddItemLoad();
			ddAttributeLoad();
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
		 * Prepares data and sets control values before executing the workflow.
		 */
		function iwCreateLotAttrOnPreWorkflow() {
			if (FORM.Control.validateForm() === true) {
				_controls.hfAction.value = ACTION_ADD;
				return true;
			}
			return false;
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwCreateLotAttrOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"im",
					"im.lotAttrAdd.add",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"IM_UI_LotAttributeAdd",
					"im.lotAttrAdd.add",
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
			iwCreateLotAttrOnPreWorkflow: iwCreateLotAttrOnPreWorkflow,
			iwCreateLotAttrOnPostWorkflow: iwCreateLotAttrOnPostWorkflow,
			onChangeDDItem: onChangeDDItem,
		};
	}
})(window);
