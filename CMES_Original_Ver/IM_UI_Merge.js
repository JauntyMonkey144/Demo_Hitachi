/**
Name:        	IM_UI_Merge.js
Description: 	IM_UI_Merge js file containing global logic pertaining to the IM_UI_Merge Form.

Ver		Release 		 	By							Date						Change Description
001		00.70				  Chittaranjan		2024-11-29			#3858 version 1.0.
002		01.00					Bas van B				2025-02-25			#4253 Translated MD.
*/

// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.IM = window.IM || {};
	IM.Merge = IM.Merge || {};
	IM.Merge = Merge();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function Merge() {
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;
		const ID_DDITEMGRADE = "DDG";
		const ID_DDITEMSTATE = "DDS";
		const ID_DDITEMLOCATION = "DDL";
		const ID_TXTBFITEMGRADE = "TXBIG";
		const ID_TXTBFITEMSTATE = "TXBIS";
		const ID_NUMBFQTYLEFT = "NRBQ";
		const ID_NUMBFCOMBINEQTY = "NRCQ";

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

			_controls.bfLOTs = FORM.Control.findByXmlNode("bfLots");

			_controls.rbLots = FORM.Control.findByXmlNode("RBL");
			_controls.lbItemDisplay = FORM.Control.findByXmlNode("LBI");
			_controls.lbUOM = FORM.Control.findByXmlNode("LBU");

			_controls.ddLocation = FORM.Control.findByXmlNode(ID_DDITEMLOCATION);
			_controls.ddItemGrade = FORM.Control.findByXmlNode(ID_DDITEMGRADE);
			_controls.ddItemState = FORM.Control.findByXmlNode(ID_DDITEMSTATE);
			_controls.rbTransferOpt = FORM.Control.findByXmlNode("RBT");
			_controls.txLot = FORM.Control.findByXmlNode("TXLN"); // here batch and lot both are same
			_controls.txSlot = FORM.Control.findByXmlNode("TXSL");
			_controls.dtExpire = FORM.Control.findByXmlNode("DTE");
			_controls.txComments = FORM.Control.findByXmlNode("TXC");

			_controls.hfEntID = FORM.Control.findByXmlNode("HFEID");
			_controls.hfItemID = FORM.Control.findByXmlNode("HFIID");
			_controls.hfUOMID = FORM.Control.findByXmlNode("HFUID");
			_controls.nrTransferOption = FORM.Control.findByXmlNode("NRTO");
			_controls.nrSelENTID = FORM.Control.findByXmlNode("NREID");

			_controls.hfSelEnt = FORM.Control.findByXmlNode("HFSE");
			_controls.hfSelEntName = FORM.Control.findByXmlNode("HFSEN");
			_controls.hfStorageLocation = FORM.Control.findByXmlNode("HFSL");
			_controls.hfNumDecimal = FORM.Control.findByXmlNode("HFND");
			_controls.hfItemState = FORM.Control.findByXmlNode("HFIS");
			_controls.hfItemGrade = FORM.Control.findByXmlNode("HFIG");

			_controls.iwCombine = FORM.Control.findByXmlNode("IWC");

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
				ddItemGradeLoad();
				ddItemStateLoad();
				getInventoryMerge();
				updateCombineLotConfirmationMessage();
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
		 * function to  assign values to the controls of inventory Merge to the data of the selected inventory record
		 * @param {*} control , data
		 */
		function assignInventoryMerge(data) {
			_controls.rbLots.value = "0";
			_controls.hfSelEnt.value = data.ent_id;
			_controls.nrSelENTID.value = data.ent_id;
			_controls.hfSelEntName.value = data.ent_name;
			_controls.ddLocation.value = data.ent_id;
			_controls.hfItemID.value = data.item_id;
			_controls.lbItemDisplay.value = data.item_desc;
			_controls.lbUOM.value = data.item_inv_uom_description;
			_controls.hfUOMID.value = data.item_inv_uom_id;
			_controls.hfNumDecimal.value = String(data.num_decimals_h);
			_controls.hfStorageLocation.value = data.ent_id;
			_controls.txLot.value = "";
			_controls.txSlot.value = "";
			_controls.ddItemGrade.value = String(data.item_grade_cd);
			_controls.ddItemState.value = String(data.item_status_cd);
			_controls.dtExpire.value = FT.WorkTasks.dateTimeInStringFormat(_controls.dtExpire, data.expiry_date);
			_controls.txComments.value = "";
			_controls.rbTransferOpt.value = "2";
			_controls.hfItemGrade.value = String(data.item_grade_cd);
			_controls.hfItemState.value = String(data.item_status_cd);
			loadIMQueue();
		}

		/**
		 * function to get the inventory Merge to the data of the selected inventory record
		 */
		function getInventoryMerge() {
			const objRecID = FT.WorkTasks.contextGet("", "itemInv");
			if (objRecID) {
				if (objRecID.length > 0) {
					if (objRecID[0].jsonValue !== null) {
						assignInventoryMerge(objRecID[0].jsonValue);
					}
				}
			}
		}

		/**
		 * function to retrieve all of the lots for combining
		 */
		function getLotsToCombine(data) {
			_controls.iwCombine.enable = false;
			if (data && data.length > 0) {
				_controls.bfLOTs.removeAll();
				const uomId = Number(_controls.hfUOMID.value);
				for (let i = 0; i < data.length; i++) {
					if (data[i].item_inv_uom_id === uomId && data[i].qty_left > 0) {
						const dataObj = {
							TXBL: data[i].description,
							HFEI: data[i].ent_id,
							TXBLN: data[i].lot_no,
							TXBSN: data[i].sublot_no,
							TXBIG: data[i].item_grade_desc,
							HFGC: String(data[i].item_grade_cd),
							TXBIS: data[i].item_status_desc,
							HFSC: String(data[i].item_status_cd),
							DABED: getStrDate(data[i].expiry_date),
							NRBQ: String(data[i].qty_left),
							NRCQ: "0",
							HFWI: data[i].wo_id,
							HFRI: data[i].row_id_h,
							HFOPI: data[i].oper_id,
							HFSN: data[i].seq_no == null ? data[i].seq_no : String(data[i].seq_no),
						};
						const newRecord = _controls.bfLOTs.addRecord(dataObj);

						// set item grade background color
						// eslint-disable-next-line prefer-destructuring
						let domElement = newRecord.findByXmlNode(ID_TXTBFITEMGRADE).domElement;
						let rgbColor = data[i].gradecolor_h;
						if (rgbColor !== null) {
							$(domElement).css("background-color", rgbColor);
							rgbColor = $(domElement).css("background-color");
							const color = getTextColor(rgbColor);
							// it is necessary to use attr to change color since it is set in css file to override greyed out text
							const style = "background-color:" + rgbColor + " !important;color:" + color + "!important;";
							$(domElement).attr("style", style);
						} else {
							// setting the default background-color of the text control if its not available
							$(domElement).css("background-color", "#f1f1f1");
						}

						// set item state background color
						domElement = newRecord.findByXmlNode(ID_TXTBFITEMSTATE).domElement;
						rgbColor = data[i].statuscolor_h;
						if (rgbColor !== null) {
							$(domElement).css("background-color", rgbColor);
							rgbColor = $(domElement).css("background-color");
							const color = getTextColor(rgbColor);
							// it is necessary to use attr to change color since it is set in css file to override greyed out text
							const style = "background-color:" + rgbColor + " !important;color:" + color + " !important;";
							$(domElement).attr("style", style);
						} else {
							// setting the default background-color of the text control if its not available
							$(domElement).css("background-color", "#f1f1f1");
						}
						if (_controls.bfLOTs.records().length === 20) {
							break;
						}
					}
				}
				// set focus to first record
				const records = _controls.bfLOTs.records();
				if (records.length > 0) {
					const combineQty = records[0].findByXmlNode(ID_NUMBFCOMBINEQTY).domElement;
					$(combineQty).focus();
				}
				if (records.length > 1) {
					_controls.iwCombine.enable = true;
				}
			}
		}

		/**
		 * Function to load WO Queue for an entity and assign data to grid widget
		 *
		 */
		function loadIMQueue() {
			const loc = _controls.rbLots.value === "0" ? _controls.hfStorageLocation.value : "";
			const parameterColl = {
				entId: loc,
				itemId: _controls.hfItemID.value,
			};
			FT.WebApi.mesGetAsync("api/V3/itemInventory", "", parameterColl, false).then(
				(data) => {
					// Translate the data
					let translatedData = data;
					if (data != null && data.length > 0) {
						const fields = [
							FT.Ui.translationColumnField(
								"description",
								FT.Ui.TRANSLATION_GROUPS.grpEntDescription,
								FT.Ui.TRANSLATION_KEYS.keyEnt,
							),
							FT.Ui.translationColumnField(
								"item_class_desc",
								FT.Ui.TRANSLATION_GROUPS.grpItemClassItemClassDesc,
								FT.Ui.TRANSLATION_KEYS.keyItemClass,
							),
							FT.Ui.translationColumnField("item_desc", FT.Ui.TRANSLATION_GROUPS.grpItemItemDesc, FT.Ui.TRANSLATION_KEYS.keyItem),
							FT.Ui.translationColumnField(
								"item_grade_desc",
								FT.Ui.TRANSLATION_GROUPS.grpItemGradeItemGradeDesc,
								FT.Ui.TRANSLATION_KEYS.keyItemGrade,
							),
							FT.Ui.translationColumnField("item_inv_uom_description", FT.Ui.TRANSLATION_GROUPS.grpUomDescription, [
								"item_inv_uom_description",
							]),
							FT.Ui.translationColumnField(
								"item_status_desc",
								FT.Ui.TRANSLATION_GROUPS.grpItemStateItemStatusDesc,
								FT.Ui.TRANSLATION_KEYS.keyItemState,
							),
							FT.Ui.translationColumnField("units", FT.Ui.TRANSLATION_GROUPS.grpUomDescription, ["units"]),
						];
						translatedData = FT.Ui.translateArray(data, fields);
					}
					// Handle successful response data
					getLotsToCombine(translatedData);
				},
				(error) => {
					// Handle error
					throw Error("Error:", error);
				},
			);
		}
		/**
		 * Loads the list of storage locations location and populates the dropdown control.
		 */
		function ddLocationLoad() {
			const strOptions = [];
			const data = FT.WebApi.mesGetSync("api/v3/Entity", "", "", false);
			if (data && data.length > 0) {
				for (let i = 0; i < data.length; i++) {
					// Translate the entity description
					const entDesc = FT.Ui.translateValue(FT.Ui.TRANSLATION_GROUPS.grpEntDescription, data[i].ent_name, data[i].description);
					strOptions.push({ ent_id: getString(data[i].ent_id), ent_name: getString(entDesc) });
				}
			}
			FT.WorkTasks.controlOptionsSetFromDataset(ID_DDITEMLOCATION, 0, strOptions, "ent_name", "ent_id");
		}

		/**
		 * Loads the list of item statuses and populates the dropdown control.
		 */
		function ddItemStateLoad() {
			const data = FT.WebApi.mesGetSync("api/ItemState", "", "", false);
			const strOptions = [];
			if (data && data.length > 0) {
				for (let i = 0; i < data.length; i++) {
					// Translate the status description
					const itemStatusDesc = FT.Ui.translateValue(
						FT.Ui.TRANSLATION_GROUPS.grpItemStateItemStatusDesc,
						data[i].item_status_desc,
						data[i].item_status_desc,
					);
					strOptions.push({
						item_status_cd: getString(data[i].item_status_cd),
						item_status_desc: getString(itemStatusDesc),
					});
				}
			}
			FT.WorkTasks.controlOptionsSetFromDataset(ID_DDITEMSTATE, 0, strOptions, "item_status_desc", "item_status_cd");
		}
		/**
		 * Loads the list of item grades and populates the dropdown control.
		 */
		function ddItemGradeLoad() {
			const data = FT.WebApi.mesGetSync("api/ItemGrade", "", "", false);
			const strOptions = [];
			if (data && data.length > 0) {
				for (let i = 0; i < data.length; i++) {
					// Translate the grade description
					const itemGradeDesc = FT.Ui.translateValue(
						FT.Ui.TRANSLATION_GROUPS.grpItemGradeItemGradeDesc,
						data[i].item_grade_desc,
						data[i].item_grade_desc,
					);
					strOptions.push({
						item_grade_cd: getString(data[i].item_grade_cd),
						item_grade_desc: getString(itemGradeDesc),
					});
				}
			}
			FT.WorkTasks.controlOptionsSetFromDataset(ID_DDITEMGRADE, 0, strOptions, "item_grade_desc", "item_grade_cd");
		}

		/**
		 * Event when the lots change
		 */
		function rbLotsOnChange() {
			loadIMQueue();
		}

		/**
		 *  Location ddl on change event
		 */
		function ddlOnChange() {
			_controls.hfSelEntName.value = _controls.ddLocation.displayValue;
			_controls.hfSelEnt.value = _controls.ddLocation.value;
			_controls.nrSelENTID.value = parseInt(_controls.ddLocation.value, 10);
		}

		/**
		 * Base Form of Lots Qty Visible event
		 */
		function nrBFQTYVisible(control) {
			var decimalPlaces = _controls.hfNumDecimal.value;
			if (decimalPlaces !== "") {
				FT.Common.setDecimalPlaces(control, parseInt(decimalPlaces, 10));
			}

			return true;
		}

		/**
		 *  Base Form of Lots Combine Qty Visible event
		 */
		function nrBFCQTYVisible(control) {
			var decimalPlaces = _controls.hfNumDecimal.value;
			if (decimalPlaces !== "") {
				FT.Common.setDecimalPlaces(control, parseInt(decimalPlaces, 10));
			}

			return true;
		}

		/**
		 * Base Form of Lots Combine Qty Visible event
		 */
		function nrBFCQTYOnChange(control, currentValue) {
			let ret = currentValue;
			if (!currentValue) {
				ret = 0;
			}
			if (currentValue > parseFloat(control.findByXmlNode(ID_NUMBFQTYLEFT).value)) {
				const title = skelta.localize.getString("@@IM_MergeQuantityErr@@");
				const errorDetails = skelta.localize.getString("@@IM_MergeQuantityErrDetails@@");
				SFU.showError(title, errorDetails, null, null);
				ret = parseFloat(control.findByXmlNode(ID_NUMBFQTYLEFT).value);
			}
			return ret;
		}

		/**
		 *  function to update the confirmation message for combining lots
		 */
		function updateCombineLotConfirmationMessage() {
			const confirmMsg = skelta.localize.getString("@@IM_MergeConfirmLotsMsg@@");
			let newLot = _controls.txLot.value;
			if (!newLot) {
				newLot = "";
			}
			const newConfirmMsg = confirmMsg + " " + newLot + "?";
			_controls.iwCombine.confirmationMessage = newConfirmMsg;
		}

		/**
		 * Prepares data and sets control values before executing the workflow.
		 */
		function iwMergeInventoryOnPreWorkflow() {
			_controls.nrTransferOption.value = parseInt(_controls.rbTransferOpt.value, 10);
			if (FORM.Control.validateForm() !== true) {
				return false;
			}
			if (FORM.Control.validateForm() === true) {
				if (!_controls.txLot.value) {
					const title = skelta.localize.getString("@@IM_MergeLotErr@");
					const errorDetails = skelta.localize.getString("@@IM_MergeLotErrDetails@@");
					SFU.showError(title, errorDetails, null, null);
					return false;
				}
				if (_controls.dtExpire.value) {
					const expiryDate = new Date(_controls.dtExpire.value);
					const currentDate = new Date(new Date().toDateString());
					if (expiryDate < currentDate) {
						const title = skelta.localize.getString("@@IM_MergeExpiryDateErr@@");
						const errorDetails = skelta.localize.getString("@@IM_MergeExpiryDateErrDetails@@");
						SFU.showError(title, errorDetails, null, null);
						return false;
					}
				}

				const gridControl = _controls.bfLOTs;
				let lotsToCombine = 0;
				for (let i = 0; i < gridControl.records().length; i++) {
					if (parseFloat(gridControl.records()[i].findChildRecordControlByXmlNode(ID_NUMBFCOMBINEQTY).value) > 0) {
						lotsToCombine += 1;
					}
					if (lotsToCombine > 2) {
						break;
					}
				}
				if (lotsToCombine < 2) {
					const title = skelta.localize.getString("@@IM_MergeQuantityErr@@");
					const errorDetails = skelta.localize.getString("@@IM_MergeCombineQtyMinLotErrDetails@@");
					SFU.showError(title, errorDetails, null, null);
					return false;
				}
				if (_controls.rbLots.value === "3") {
					_controls.ddItemGrade.value = _controls.hfItemGrade.value;
					_controls.ddItemState.value = _controls.hfItemState.value;
				}
				return true;
			}
			return true;
		}

		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwMergeInventoryOnPostWorkflow(blockingOutput, workflowStatus) {
			const wfResult = skelta.localize.getString(blockingOutput);
			if (blockingOutput !== "" || workflowStatus !== FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				const titleString = skelta.localize.getString("@@IM_MergeLotErr@@");
				SFU.showError(titleString, wfResult);
			} else if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"im",
					"im.itemInv.merge",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"IM_UI_Merge",
					"im.itemInv.merge",
				);
			}
		}

		/**
		 * for close merge popup
		 */
		function cancelMerge() {
			FT.Common.windowEventDispatch(
				"im",
				"im.itemInv.merge",
				FT.Common.EVENT_SOURCE_TYPE.form,
				"IM_UI_Merge",
				"im.itemInv.merge",
			);
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
		/**
		 * function to determine the color for text based on background color
		 */
		function getTextColor(rgbColor) {
			var openIndex = rgbColor.indexOf("(");
			var endIndex = rgbColor.indexOf(")");
			var color;
			var rgbColorStr = rgbColor.substr(openIndex + 1, endIndex - 1 - openIndex);
			if (rgbColorStr) {
				// split the string into the different values
				const hexcolor = rgbColorStr.split(",");
				const rC = parseInt(hexcolor[0], 10);
				const gC = parseInt(hexcolor[1], 10);
				const bC = parseInt(hexcolor[2], 10);
				const yiq = (rC * 299 + gC * 587 + bC * 114) / 1000;
				color = yiq >= 128 ? "black" : "white";
			}
			return color;
		}

		/**
		 * function to get the a expiry date in the correct format for displaying in the date control
		 */
		function getStrDate(expiryDate) {
			var strDate = null;
			if (expiryDate !== null && expiryDate !== "") {
				let dateTimeUTC;
				if (typeof expiryDate === "string" || expiryDate instanceof String) {
					dateTimeUTC = new Date(expiryDate);
				} else {
					const dateTimeValue = new Date(expiryDate.valueOf());
					dateTimeUTC = SFU.getDateTimeInServerUTCFormat(dateTimeValue);
				}
				strDate = SFU.getDateTimeInStringFormat(
					dateTimeUTC,
					skelta.forms.constants.dateFormats.dateFormatForCoreValue + " 00:00:00",
				);
			}
			return strDate;
		}
		// #endregion utility functions
		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			nrBFQTYVisible: nrBFQTYVisible,
			nrBFCQTYVisible: nrBFCQTYVisible,
			nrBFCQTYOnChange: nrBFCQTYOnChange,
			rbLotsOnChange: rbLotsOnChange,
			ddlOnChange: ddlOnChange,
			updateCombineLotConfirmationMessage: updateCombineLotConfirmationMessage,
			iwMergeInventoryOnPreWorkflow: iwMergeInventoryOnPreWorkflow,
			iwMergeInventoryOnPostWorkflow: iwMergeInventoryOnPostWorkflow,
			cancelMerge: cancelMerge,
		};
	}
})(window);
