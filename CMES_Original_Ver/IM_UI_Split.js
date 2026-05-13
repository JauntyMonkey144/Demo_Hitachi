/*
Name:        	IM_UI_Split.js
Description: 	IM_UI_Split js file containing global logic pertaining to the IM_UI_Split Form.

Ver		Release		By						Date			Change Description
001		00.70  		Chittaranjan			2024-11-05		#3857 First version.
002		00.70		Chittaranjan			2025-01-29		#4228 validations provided when UOM of destination item varies with source
																					and no chang entered in destinations location/lot/sublot to move.
003		00.70		Chitta					2025-02-10		#4271 Lot No validation needs to perform before workflow triggers.
004		01.00		Bas van B				2025-02-25		#4253 Translated MD in split UI. Moved DDIData array from global decalaration to Split
																					 object.
005 	01.00       Usha M 					2025-03-03      #4392 Code Review -  iwSplitInventoryOnPreWorkflow always returns false,
																					so else part is removed.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.IM = window.IM || {};
	IM.Split = IM.Split || {};
	IM.Split = Split();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function Split() {
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
		let DDIData = [];

		// ----------------------------------------------------------------------------------
		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			// Initialize variables
			FORM.Control = Control;

			_controls.ddLocation = FORM.Control.findByXmlNode("DDL");
			_controls.ddItem = FORM.Control.findByXmlNode("DDI");
			_controls.nrQty = FORM.Control.findByXmlNode("NRQ");
			_controls.lbQty = FORM.Control.findByXmlNode("LBQ");
			_controls.nrSQty = FORM.Control.findByXmlNode("NRSQ");
			_controls.lbSQty = FORM.Control.findByXmlNode("LBSQ");
			_controls.txBatch = FORM.Control.findByXmlNode("TXB"); // here batch and lot both are same
			_controls.txSlot = FORM.Control.findByXmlNode("TXSL");
			_controls.ddItemGrade = FORM.Control.findByXmlNode("DDIG");
			_controls.ddItemState = FORM.Control.findByXmlNode("DDIS");
			_controls.dtExpire = FORM.Control.findByXmlNode("DTE");
			_controls.txComments = FORM.Control.findByXmlNode("TXC");
			_controls.hfEntID = FORM.Control.findByXmlNode("HFEID");
			_controls.hfItemID = FORM.Control.findByXmlNode("HFIID");
			_controls.hfUOMID = FORM.Control.findByXmlNode("HFUID");
			_controls.hfFromInvEntId = FORM.Control.findByXmlNode("HFFID");
			_controls.hfFromInvLot = FORM.Control.findByXmlNode("HFFL");
			_controls.hfFromInvSublot = FORM.Control.findByXmlNode("HFFS");
			_controls.hfFromRowId = FORM.Control.findByXmlNode("HFRID");
			_controls.rbLotOrLocation = FORM.Control.findByXmlNode("RBIN");

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
		 * Form load function to bind cards with respect to entity from form parameters or if session variable EntID
		 */
		function onFormLoad() {
			try {
				ddLocationLoad();
				ddItemLoad();
				ddItemGradeLoad();
				ddItemStateLoad();
				getInventorySplit();
				setValidation();
				rbLotOnDataChange();
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
				errorMessage = skelta.localize.getString("@@IM_UnexpectedType@@");
			} else if (error instanceof ReferenceError) {
				errorMessage = skelta.localize.getString("@@IM_ReferenceError@@");
			} else {
				errorMessage = skelta.localize.getString("@@IM_DuringScriptExecution@@");
			}
			SFU.showError(skelta.localize.getString("FormNGFErrorRunningScript_title"), errorMessage, null, error.message);
			throw errorMessage;
		}

		/**
		 * function to  assign values to the controls of inventory Split to the data of the selected inventory record
		 * @param {*} control , data
		 */
		function assignInventorySplit(data) {
			_controls.ddLocation.value = data.ent_id;
			_controls.ddItem.value = data.item_id;
			_controls.nrQty.value = data.qty_left;
			FT.Common.setDecimalPlaces(_controls.nrQty, parseInt(data.num_decimals_h, 10));
			_controls.lbQty.value = data.item_inv_uom_description;
			_controls.nrSQty.value = "0"; // always zero on load
			FT.Common.setDecimalPlaces(_controls.nrSQty, parseInt(data.num_decimals_h, 10));
			_controls.lbSQty.value = data.item_inv_uom_description;
			// _controls.txBatch.value = data.lot_no; // here batch and lot both are same
			_controls.txSlot.value = data.sublot_no;
			_controls.ddItemGrade.value = data.item_grade_cd;
			_controls.ddItemState.value = data.item_status_cd;
			_controls.dtExpire.value = FT.WorkTasks.dateTimeInStringFormat(_controls.dtExpire, data.expiry_date);
			_controls.txComments.value = "";
			_controls.hfEntID.value = data.ent_id;
			_controls.hfItemID.value = data.item_id;
			_controls.hfUOMID.value = data.item_inv_uom_id;
			_controls.hfFromInvEntId.value = data.ent_id;
			_controls.hfFromInvLot.value = data.lot_no;
			_controls.hfFromInvSublot.value = data.sublot_no;
			_controls.hfFromRowId.value = data.row_id_h;
		}

		/**
		 * function to get the inventory Split to the data of the selected inventory record
		 */
		function getInventorySplit() {
			const objRecID = FT.WorkTasks.contextGet("", "itemInv");
			if (objRecID) {
				if (objRecID.length > 0) {
					assignInventorySplit(objRecID[0].jsonValue);
				}
			}
		}

		/**
		 * Loads the list of storage locations and populates the dropdown control.
		 */
		function ddLocationLoad() {
			const strOptions = [];
			const data = FT.WebApi.mesGetSync("api/v3/Entity", "", "", false);
			if (data && data.length > 0) {
				for (let i = 0; i < data.length; i++) {
					// Translate the entity descriptions.
					const entDesc = FT.Ui.translateValue(FT.Ui.TRANSLATION_GROUPS.grpEntDescription, data[i].ent_name, data[i].description);
					strOptions.push({ ent_id: getString(data[i].ent_id), ent_name: getString(entDesc) });
				}
			}
			FT.WorkTasks.controlOptionsSetFromDataset("DDL", 0, strOptions, "ent_name", "ent_id");
		}

		/**
		 * Loads the list of item  and populates the dropdown control
		 *  with the retrieved data.
		 * @returns {Object|null} The retrieved item  data, or null if the request fails.
		 */
		function ddItemLoad() {
			const data = FT.WebApi.mesGetSync("api/V3/Item", "", "", false);
			DDIData = [];
			const strOptions = [];
			if (data != null && data.length > 0) {
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
				// Add the data to the dropdown
				for (let i = 0; i < data.length; i++) {
					strOptions.push({ item_id: getString(DDIData[i].item_id), item_desc: getString(DDIData[i].item_desc) });
				}
			}
			FT.WorkTasks.controlOptionsSetFromDataset("DDI", 0, strOptions, "item_desc", "item_id");
		}
		//* * for to update UOM of selected Item  */
		function onChangeDDItem() {
			const data = DDIData;
			const selDDItem = data.find((itm) => itm.item_id === _controls.ddItem.value);
			if (selDDItem !== undefined || selDDItem !== null) {
				_controls.hfItemID.value = selDDItem.item_id;
				_controls.lbSQty.value = selDDItem.uom_description;
				_controls.hfUOMID.value = selDDItem.uom_id;
				FT.Common.setDecimalPlaces(_controls.nrSQty, parseInt(selDDItem.num_decimals, 10));
			}
		}

		/**
		 * Loads the list of item reason and populates the dropdown control
		 *  with the retrieved data.
		 * @returns {Object|null} The retrieved item reason data, or null if the request fails.
		 */
		function ddItemStateLoad() {
			const data = FT.WebApi.mesGetSync("api/ItemState", "", "", false);
			const strOptions = [];

			if (data && data.length > 0) {
				for (let i = 0; i < data.length; i++) {
					// Translate the status description
					const statusDesc = FT.Ui.translateValue(
						FT.Ui.TRANSLATION_GROUPS.grpItemStateItemStatusDesc,
						data[i].item_status_desc,
						data[i].item_status_desc,
					);
					strOptions.push({
						item_status_cd: getString(data[i].item_status_cd),
						item_status_desc: getString(statusDesc),
					});
				}
			}
			FT.WorkTasks.controlOptionsSetFromDataset("DDIS", 0, strOptions, "item_status_desc", "item_status_cd");
		}
		/**
		 * Loads the list of item reason and populates the dropdown control
		 *  with the retrieved data.
		 * @returns {Object|null} The retrieved item reason data, or null if the request fails.
		 */
		function ddItemGradeLoad() {
			const data = FT.WebApi.mesGetSync("api/ItemGrade", "", "", false);
			const strOptions = [];
			if (data && data.length > 0) {
				for (let i = 0; i < data.length; i++) {
					// Translate the grade description
					const gradeDesc = FT.Ui.translateValue(
						FT.Ui.TRANSLATION_GROUPS.grpItemGradeItemGradeDesc,
						data[i].item_grade_desc,
						data[i].item_grade_desc,
					);
					strOptions.push({
						item_grade_cd: getString(data[i].item_grade_cd),
						item_grade_desc: getString(gradeDesc),
					});
				}
			}
			FT.WorkTasks.controlOptionsSetFromDataset("DDIG", 0, strOptions, "item_grade_desc", "item_grade_cd");
		}
		/**
		 * Prepares data and sets control values before executing the workflow.
		 */
		function iwSplitInventoryOnPreWorkflow() {
			_controls.hfEntID.value = _controls.ddLocation.value;
			if (FORM.Control.validateForm() === true) {
				if (!_controls.nrSQty.value || parseFloat(_controls.nrSQty.value) <= 0) {
					const title = skelta.localize.getString("@@IM_SplitQuantityErr@@");
					const errorDetails = skelta.localize.getString("@@IM_SplitQuantityErrDetails@@");
					SFU.showError(title, errorDetails, null, null);
					return false;
				}
				if (parseFloat(_controls.nrSQty.value) > parseFloat(_controls.nrQty.value)) {
					const title = skelta.localize.getString("@@IM_SplitQuantityErr@@");
					const errorDetails = skelta.localize.getString("@@IM_SplitQuantityErrDetailsByQuantity@@");
					SFU.showError(title, errorDetails, null, null);
					return false;
				}
				if (
					_controls.txBatch.value !== "" &&
					_controls.txBatch.value === _controls.hfFromInvLot.value &&
					_controls.txSlot.value === _controls.hfFromInvSublot.value &&
					_controls.hfFromInvEntId.value === _controls.hfEntID.value
				) {
					const title = skelta.localize.getString("@@IM_SplitLotErr@@");
					const errorDetails = skelta.localize.getString("@@IM_SplitLotErrDetails@@");
					SFU.showError(title, errorDetails, null, null);
					return false;
				}
			}
			return true;
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwSplitInventoryOnPostWorkflow(blockingOutput, workflowStatus) {
			const wfResult = skelta.localize.getString(blockingOutput);
			if (blockingOutput !== "" || workflowStatus !== FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				const titleString = skelta.localize.getString("@@IM_SplitLotErr@@");
				SFU.showError(titleString, wfResult);
			} else if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"im",
					"im.itemInv.split",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"IM_UI_Split",
					"im.itemInv.split",
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
		 * Loads the list of item reason and populates the dropdown control
		 *  with the retrieved data.
		 * @returns {Object|null} The retrieved item reason data, or null if the request fails.
		 */
		function rbLotOnDataChange() {
			const objRecID = FT.WorkTasks.contextGet("", "itemInv");
			if (_controls.rbLotOrLocation.value === "2") {
				_controls.txBatch.value = "";
				_controls.txSlot.value = "";
				_controls.txBatch.readOnly = false;

				if (objRecID[0].jsonValue.sublot_no !== null) {
					_controls.txSlot.isMandatory = true;
				} else {
					_controls.txSlot.isMandatory = false;
				}
			} else {
				_controls.txBatch.value = objRecID[0].jsonValue.lot_no;
				_controls.txSlot.value = "";
				_controls.txBatch.readOnly = true;
				_controls.txSlot.isMandatory = true;
			}
		}
		/**
		 * function to get the inventory Split to the data of the selected inventory record
		 */
		function setValidation() {
			const objRecID = FT.WorkTasks.contextGet("", "itemInv");
			if (objRecID) {
				if (objRecID[0].jsonValue.sublot_no !== null) {
					_controls.rbLotOrLocation.defaultValue = "3";
					_controls.txBatch.value = objRecID[0].jsonValue.lot_no;
					_controls.txSlot.value = "";
				} else if (objRecID[0].jsonValue.sublot_no === null) {
					_controls.rbLotOrLocation.defaultValue = "3";
					_controls.txBatch.value = objRecID[0].jsonValue.lot_no;
					_controls.txSlot.value = "";
					_controls.txBatch.readOnly = true;
					_controls.txSlot.isMandatory = true;
				}
			}
		}
		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			onChangeDDItem: onChangeDDItem,
			rbLotOnDataChange: rbLotOnDataChange,
			iwSplitInventoryOnPreWorkflow: iwSplitInventoryOnPreWorkflow,
			iwSplitInventoryOnPostWorkflow: iwSplitInventoryOnPostWorkflow,
		};
	}
})(window);
