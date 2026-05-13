/*
Name:        	IM_UI_MaterialReception.js
Description: 	IM_UI_MaterialReception js file containing global logic pertaining to the IM_UI_MaterialReception Form.
Ver	 Release	By							Date						Change Description
001	 01.00  	Chittaranjan		2024-11-10			#3859 First version
002	 01.01.00	Praveen     		2025-04-28			#4880 In the function gdPOLineData() add the custom stored procedure
003	 01.01.00	Fayaz A					2025-05-28			#5008 Localization key update to refer from FT runtime locale file.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.IM = window.IM || {};
	IM.MaterialReception = IM.MaterialReception || {};
	IM.MaterialReception = MaterialReception();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function MaterialReception() {
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

		// ----------------------------------------------------------------------------------
		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			// Initialize variables
			FORM.Control = Control;
			_controls.txPOFilter = FORM.Control.findByXmlNode("TXPOF");
			_controls.txInventoryItemFilter = FORM.Control.findByXmlNode("TXIF");
			_controls.txPO = FORM.Control.findByXmlNode("TXPO");
			_controls.nrRemainingPOQty = FORM.Control.findByXmlNode("NRRQ");
			_controls.txVendorLot = FORM.Control.findByXmlNode("TXVL");
			_controls.dtExpire = FORM.Control.findByXmlNode("DTE");
			_controls.ddLocation = FORM.Control.findByXmlNode("DDL");
			_controls.txItem = FORM.Control.findByXmlNode("TXI");
			_controls.nrQty = FORM.Control.findByXmlNode("NRQ");
			_controls.lbQty = FORM.Control.findByXmlNode("LBQ");
			_controls.txBatch = FORM.Control.findByXmlNode("TXB"); // here batch and lot both are same
			_controls.ddItemGrade = FORM.Control.findByXmlNode("DDIG");
			_controls.ddItemState = FORM.Control.findByXmlNode("DDIS");
			_controls.dtProduction = FORM.Control.findByXmlNode("DTP");
			_controls.txVendorSublot = FORM.Control.findByXmlNode("TXVSL");
			_controls.txSublot = FORM.Control.findByXmlNode("TXSL");
			_controls.txSpare1 = FORM.Control.findByXmlNode("TXIS1");
			_controls.txSpare2 = FORM.Control.findByXmlNode("TXIS2");
			_controls.txSpare3 = FORM.Control.findByXmlNode("TXIS3");
			_controls.txSpare4 = FORM.Control.findByXmlNode("TXIS4");
			_controls.wwPurchaseOrderList = FORM.Control.findByXmlNode("WWPO");
			_controls.txComments = FORM.Control.findByXmlNode("TXC");
			_controls.nrPOLine = FORM.Control.findByXmlNode("NRPOL");
			_controls.hfEntID = FORM.Control.findByXmlNode("HFEID");
			_controls.nrUOMID = FORM.Control.findByXmlNode("NRUID");
			_controls.hfRemainingQty = FORM.Control.findByXmlNode("HFRQ");
			_controls.hfVID = FORM.Control.findByXmlNode("HFVID");
			_controls.nrMinNQty = FORM.Control.findByXmlNode("NRMNQ");
			_controls.nrMaxQty = FORM.Control.findByXmlNode("NRMXQ");
			_controls.nrLP = FORM.Control.findByXmlNode("NRLP");
			_controls.dtRequiredByUTC = FORM.Control.findByXmlNode("DTR");
			_controls.hfPOLineSpare1 = FORM.Control.findByXmlNode("HFPS1");
			_controls.hfPOLineSpare2 = FORM.Control.findByXmlNode("HFPS2");
			_controls.hfPOLineSpare3 = FORM.Control.findByXmlNode("HFPS3");
			_controls.hfPOLineSpare4 = FORM.Control.findByXmlNode("HFPS4");
			_controls.dtPOLineLastEditAT = FORM.Control.findByXmlNode("DTPLL");
			_controls.nrLocationSelected = FORM.Control.findByXmlNode("NRL");

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
				gdPOLineData(_controls.txPOFilter.value, _controls.txInventoryItemFilter.value);
				ddLocationLoad();
				ddItemGradeLoad();
				ddItemStateLoad();
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
			throw errorMessage;
		}

		/**
		 * function to  assign values to the controls of inventory MaterialReception to the data of the selected inventory record
		 * @param {*} control , data
		 */
		function assignInventoryMaterialReception(data) {
			_controls.txPO.value = data.po_id;
			_controls.txItem.value = data.item_id;
			_controls.nrRemainingPOQty.value = data.quantity;
			_controls.lbQty.value = data.item_uom_description;
			_controls.nrQty.value = data.num_decimals;
			_controls.nrPOLine.value = data.po_line_no;
			_controls.nrUOMID.value = data.item_uom_id;
			_controls.hfVID.value = data.vendor_item_id;
			_controls.nrMinNQty.value = data.min_qty;
			_controls.nrMaxQty.value = data.max_qty;
			_controls.nrLP.value = data.line_price;
			_controls.dtRequiredByUTC.value = data.reqd_by_utc;
			_controls.hfPOLineSpare1.value = data.spare1;
			_controls.hfPOLineSpare2.value = data.spare2;
			_controls.hfPOLineSpare3.value = data.spare3;
			_controls.hfPOLineSpare4.value = data.spare4;
			_controls.dtPOLineLastEditAT.value = data.last_edit_at;
		}

		/**
		 * Loads the list of location  and populates the dropdown control
		 *  with the retrieved data.
		 * @returns {Object|null} The retrieved item  data, or null if the request fails.
		 */
		function ddLocationLoad() {
			var i;
			parameterColl = { canStore: true };
			const data = FT.WebApi.mesGetSync("api/v3/Entity", "", parameterColl, false);
			const strOptions = [];
			parameterColl = {};
			if (data && data.length > 0) {
				for (i = 0; i < data.length; i++) {
					strOptions.push({ ent_id: getString(data[i].ent_id), ent_name: getString(data[i].ent_name) });
				}
			}
			FT.WorkTasks.controlOptionsSetFromDataset("DDL", 0, strOptions, "ent_name", "ent_id");
		}

		/**
		 * Loads the list of item reason and populates the dropdown control
		 *  with the retrieved data.
		 * @returns {Object|null} The retrieved item reason data, or null if the request fails.
		 */
		function ddItemStateLoad() {
			var data = FT.WebApi.mesGetSync("api/ItemState", "", "", false);
			var strOptions = [];
			var i;
			if (data && data.length > 0) {
				for (i = 0; i < data.length; i++) {
					strOptions.push({
						item_status_cd: getString(data[i].item_status_cd),
						item_status_desc: getString(data[i].item_status_desc),
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
			var data = FT.WebApi.mesGetSync("api/ItemGrade", "", "", false);
			var strOptions = [];
			var i;
			if (data && data.length > 0) {
				for (i = 0; i < data.length; i++) {
					strOptions.push({
						item_grade_cd: getString(data[i].item_grade_cd),
						item_grade_desc: getString(data[i].item_grade_desc),
					});
				}
			}
			FT.WorkTasks.controlOptionsSetFromDataset("DDIG", 0, strOptions, "item_grade_desc", "item_grade_cd");
		}
		/**
		 * Prepares data and sets control values before executing the workflow.
		 */
		function iwReceiveOnPreWorkflow() {
			var ret = true;
			var title = "";
			var errorDetails = "";
			if (FORM.Control.validateForm() === true) {
				if (_controls.txPO.value === "") {
					title = skelta.localize.getString("@@IM_MRecepPOErr");
					errorDetails = skelta.localize.getString("@@IM_MRecepPOErrDetails@@");
					SFU.showError(title, errorDetails, null, null);
					ret = false;
				}
				if (_controls.nrQty.value) {
					if (!(parseFloat(_controls.nrQty.value) > 0)) {
						title = skelta.localize.getString("@@IM_RecvQuantityErr@@");
						errorDetails = skelta.localize.getString("@@IM_RecvQuantityErrDetails@@");
						SFU.showError(title, errorDetails, null, null);
						ret = false;
					}
				}

				if (_controls.dtExpire.value) {
					const expiryDate = new Date(_controls.dtExpire.value);
					const currentDate = new Date(new Date().toDateString());
					if (expiryDate < currentDate) {
						title = skelta.localize.getString("@@IM_RecvExpiryDateErr@@");
						errorDetails = skelta.localize.getString("@@IM_RecvExpiryDateErrDetails@@");
						SFU.showError(title, errorDetails, null, null);
						ret = false;
					}
				}
			} else {
				ret = false;
			}

			return ret;
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwReceiveOnPostWorkflow(blockingOutput, workflowStatus) {
			var wfResult = skelta.localize.getString(blockingOutput);

			if (blockingOutput !== "" || workflowStatus !== FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				const titleString = skelta.localize.getString("@@IM_ReceiveError@@");
				SFU.showError(titleString, wfResult);
			} else if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				const titleString = skelta.localize.getString("@@IM_MRepConfirm@@");
				SFU.showConfirmation(titleString, "");
				FT.Common.windowEventDispatch(
					"im",
					"im.itemInv.receive",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"IM_UI_MaterialReception",
					"im.itemInv.receive",
				);
			}
		}
		/**
		 * Performs hide or show button click toggle image change action.
		 */
		function showHideToggle(panel, event) {
			panel.visible = !panel.visible;

			if (panel.visible) {
				$(event.currentTarget.children[0].children[0]).removeClass("icon_expand").addClass("icon_collapse");
			} else {
				$(event.currentTarget.children[0].children[0]).removeClass("icon_collapse").addClass("icon_expand");
			}
		}
		/**
		 * Loads the list of item for to bind purchase Order Line List Grid
		 * @param {purchase order ID : string,item id:string} input string or value which needs to convert as string.
		 * @returns {Object|null} The retrieved item purchase Order Line List data, or null if the request fails.
		 */
		function gdPOLineData(purchaseOrderID, invItemID) {
			const parameterColl = { po_id: purchaseOrderID, item_id: invItemID };
			const spName = "sp_SA_IM_Po_Line";
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", spName, parameterColl, false).then(
				(data) => {
					if (data) {
						_controls.wwPurchaseOrderList.widgetProperties.data = JSON.stringify(data);
					}
				},
				(error) => {
					// Handle error
					throw new Error("Error:", error);
				},
			);
		}
		/** dropdown on change event for Location		 */
		function ddLocationChange() {
			_controls.nrLocationSelected.value = _controls.ddLocation.value;
		}
		/** text on change event for Purchase Order Filter text box		 */
		function txPOChange() {
			gdPOLineData(_controls.txPOFilter.value, _controls.txInventoryItemFilter.value);
		}
		/** text on change event for Item Filter text box		 */
		function txIFChange() {
			gdPOLineData(_controls.txPOFilter.value, _controls.txInventoryItemFilter.value);
		}
		/** selected record on change event for PurchaseOrder Web Widget		 */
		function wwPOOnRowSelection() {
			const selectedrow = JSON.parse(_controls.wwPurchaseOrderList.widgetProperties.selectedRow);
			if (selectedrow != null) {
				assignInventoryMaterialReception(selectedrow);
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
			showHideToggle: showHideToggle,
			txPOChange: txPOChange,
			txIFChange: txIFChange,
			wwPOOnRowSelection: wwPOOnRowSelection,
			iwReceiveOnPreWorkflow: iwReceiveOnPreWorkflow,
			iwReceiveOnPostWorkflow: iwReceiveOnPostWorkflow,
			ddLocationChange: ddLocationChange,
		};
	}
})(window);
