/*
Name:        	UC_MP_UI_MixProduce.js
Description: 	UC_MP_UI_MixProduce js file containing global logic pertaining to the UC_MP_UI_MixProduce Form.

Ver	 Release	By		Date		Change Description
001	 01.00		Wilwin	2024-12-09	#3937 First Version Use Case for Mix Production
002	 01.00		Chitta	2025-01-07	#4146 ,#4145 Consume Qty control should be numeric
003  01.00		Usha M	2025-02-26	#4355 Removed Debugger and Console.Log()
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.UCJMMPC = window.UCJMMPC || {};
	UCJMMPC.ProduceConsumeBatch = UCJMMPC.ProduceConsumeBatch || {};
	UCJMMPC.ProduceConsumeBatch = ProduceConsumeBatch();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function ProduceConsumeBatch() {
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;
		const _controls = {};
		const ReasGrpCDConsumed = 1;
		const PRODUCE_GRADE = "2";
		const PRODUCE_STATE = "2";
		const PRODUCE_REAS = "2";
		const LOTSUBLOT_PREFIX = "CMES";
		// ----------------------------------------------------------------------------------

		// ----------------------------- Private Variables ----------------------------------
		let isNewMix = true;
		// ----------------------------------------------------------------------------------
		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			// Initialize variables
			FORM.Control = Control;
			_controls.wwBomItems = FORM.Control.findByXmlNode("WWBI");
			_controls.wwConsReas = FORM.Control.findByXmlNode("WWCRS");
			_controls.itemDesc = FORM.Control.findByXmlNode("TXITM");
			_controls.qtyCons = FORM.Control.findByXmlNode("NRQTY");
			_controls.qtyRemain = FORM.Control.findByXmlNode("TXQRM");
			_controls.hfWoId = FORM.Control.findByXmlNode("HFWID");
			_controls.hfOperId = FORM.Control.findByXmlNode("HFOPID");
			_controls.hfSeqNo = FORM.Control.findByXmlNode("HFSQN");
			_controls.hfBomPos = FORM.Control.findByXmlNode("HFBP");
			_controls.hfItemId = FORM.Control.findByXmlNode("HFII");
			_controls.hfEntId = FORM.Control.findByXmlNode("HFEI");
			_controls.hfEntName = FORM.Control.findByXmlNode("HFEN");
			_controls.hfFromEntName = FORM.Control.findByXmlNode("HFFEN");
			_controls.hfReas = FORM.Control.findByXmlNode("HFRES");
			_controls.hfJobPos = FORM.Control.findByXmlNode("HFJP");

			_controls.pnlBOMItems = FORM.Control.findByXmlNode("PNBI");

			_controls.txConsLOT = FORM.Control.findByXmlNode("TXLN");
			_controls.txConsSubLOT = FORM.Control.findByXmlNode("TXSL");

			_controls.txNewMix = FORM.Control.findByXmlNode("TXMN");
			_controls.txProdLOT = FORM.Control.findByXmlNode("TXPL");
			_controls.txProdSubLOT = FORM.Control.findByXmlNode("TXPSL");
			_controls.txMixQuantity = FORM.Control.findByXmlNode("TXPMQ");
			_controls.btnSearchProdLOT = FORM.Control.findByXmlNode("FBSL");
			_controls.wgtAvailableMaterial = FORM.Control.findByXmlNode("WGMAT");
			_controls.wgtCurrentMixStatus = FORM.Control.findByXmlNode("WMIX");
			_controls.wgtProdData = FORM.Control.findByXmlNode("WGPRD");

			_controls.hfProdItem = FORM.Control.findByXmlNode("HFFG");
			_controls.hfProdQty = FORM.Control.findByXmlNode("HFPQTY");
			_controls.hfProdQtyZero = FORM.Control.findByXmlNode("HFZERO");
			_controls.hfProdLOT = FORM.Control.findByXmlNode("HFFLT");
			_controls.hfProdSubLOT = FORM.Control.findByXmlNode("HFFSL");
			_controls.hfProdItemGrade = FORM.Control.findByXmlNode("HFFIG");
			_controls.hfProdItemState = FORM.Control.findByXmlNode("HFFIS");
			_controls.hfProdReasCD = FORM.Control.findByXmlNode("HFPRES");
			_controls.hfProdItemExpiryDate = FORM.Control.findByXmlNode("HFFED");
			_controls.hfProdItemUOM = FORM.Control.findByXmlNode("HFFUOM");

			_controls.hfJobState = FORM.Control.findByXmlNode("HFJS");
			_controls.hfToEntName = FORM.Control.findByXmlNode("HF2EN");
			_controls.hfToEntId = FORM.Control.findByXmlNode("HF2EI");
			_controls.hfByProductBOMPOS = FORM.Control.findByXmlNode("HFBBP");
			_controls.btnIWCompleteMix = FORM.Control.findByXmlNode("IWCM");

			_controls.hfConsumeQty = FORM.Control.findByXmlNode("HFCQ");
			_controls.hfConsumeQty.value = 0;
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

		// INCLUDE NEW FUNCTIONS HERE

		/**
		 * Form load function for the controls
		 */
		function onFormLoad() {
			try {
				const selectedCard = FT.WorkTasks.contextGet(FORM.Control, "eventData");
				dataJson = JSON.parse(selectedCard[0].jsonValue);
				const data = dataJson[0];
				if (data) {
					_controls.hfWoId.value = data.woId;
					_controls.hfOperId.value = data.operId;
					_controls.hfSeqNo.value = data.seqNo;
					_controls.hfEntId.value = data.ent_id;
					_controls.hfEntName.value = data.ent_name;
					_controls.hfJobPos.value = "0";

					_controls.hfProdItem.value = data.itemId;
					_controls.txMixQuantity.value = data.qty_remaining;
					_controls.hfJobState.value = data.state_cd;

					[_controls.hfToEntName.value, _controls.hfToEntId.value] = getProducelocation(data.ent_id); // need to configure

					// qty_prod, qty_remaining

					loadBomItems();
				}
				loadReasons();
				loadProdStatus();

				_controls.hfProdItemGrade.value = PRODUCE_GRADE;
				_controls.hfProdItemState.value = PRODUCE_STATE;
				_controls.hfProdReasCD.value = PRODUCE_REAS;
			} catch (error) {
				SFU.showError(skelta.localize.getString("@@MC_LookupFailedError@@"), skelta.localize.getString("@@MC_LookupFailed@@"));
			}
			setCtrlsNoOfDecimals(""); // set consume QTY control decimal points
		}

		/**
		 * get the widget items and assign it to control
		 */
		function getProducelocation(entId) {
			try {
				const parameterColl = {
					wo_id: _controls.hfWoId.value,
					oper_id: _controls.hfOperId.value,
					seq: _controls.hfSeqNo.value,
					ent_id: entId,
				};

				const Data = FT.WebApi.mesGetSync("api/V3/DirectAccess", "sp_SA_UCJMMPC_Ent_GetProdLocation", parameterColl, false);
				if (Data !== undefined && Data != null) {
					return [Data[0].ent_name, Data[0].ent_id];
				}
			} catch (error) {
				SFU.showError(skelta.localize.getString("@@MC_LookupFailedError@@"), skelta.localize.getString("@@MC_LookupFailed@@"));
			}
			return null;
		}

		/**
		 * Function to assign selected Material for consumption
		 */
		function wwAvailableMaterialSelectionChange() {
			const selectedRow =
				_controls.wgtAvailableMaterial.widgetProperties.selectedRow != null
					? JSON.parse(_controls.wgtAvailableMaterial.widgetProperties.selectedRow)
					: [];
			if (selectedRow) {
				_controls.txConsLOT.value = selectedRow.lot_no;
				_controls.txConsSubLOT.value = selectedRow.sublot_no;
				_controls.hfFromEntName.value = selectedRow.ent_name;
			}
		}

		/**
		 * get the widget items and assign it to control
		 */
		function loadBomItems() {
			try {
				const parameterCollectionBom = {
					wo_id: _controls.hfWoId.value,
					oper_id: _controls.hfOperId.value,
					seq: _controls.hfSeqNo.value,
					fg_lot: _controls.hfProdLOT.value,
					fg_sublot: _controls.hfProdSubLOT.value,
					prep_qty: _controls.txMixQuantity.value,
				};
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_UCJMMPC_Job_Bom_PrepQty", parameterCollectionBom, false).then(
					(getBomItemsData) => {
						if (getBomItemsData.DisplayColumn === "" && getBomItemsData.ValueColumn === "" && getBomItemsData.Data.length === 0) {
							throw new Error("@@MC_LookupNotFound@@");
						}
						_controls.wwBomItems.widgetProperties.data = JSON.stringify(getBomItemsData);
						_controls.btnIWCompleteMix.enable = areAllQuantitiesZero(getBomItemsData);
					},
					(error) => {
						// Handle error
						throw new Error("Error:", error);
					},
				);
			} catch (error) {
				SFU.showError(skelta.localize.getString("@@MC_LookupFailedError@@"), skelta.localize.getString("@@MC_LookupFailed@@"));
			}
		}

		function areAllQuantitiesZero(items) {
			// Use the every method to check if all items have qty === 0
			return items.every((item) => item.qty <= 0);
		}

		/**
		 * enable consumption
		 */
		function enableCons() {
			if (
				_controls.txProdLOT.value &&
				_controls.txProdSubLOT.value &&
				_controls.txConsLOT.value &&
				_controls.txConsSubLOT.value &&
				_controls.qtyCons.value > 0
			) {
				return true;
			}

			return false;
		}
		/**
		 * get the widget items and assign it to control
		 */
		function loadMixStatus() {
			try {
				const parameterCollectionBom = {
					wo_id: _controls.hfWoId.value,
					oper_id: _controls.hfOperId.value,
					seq: _controls.hfSeqNo.value,
					fg_lot: _controls.hfProdLOT.value,
					fg_sublot: _controls.hfProdSubLOT.value,
				};
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_UCJMMPC_ItemCons_GetForLOT", parameterCollectionBom, false).then(
					(MixData) => {
						_controls.wgtCurrentMixStatus.widgetProperties.data = JSON.stringify(MixData);
					},
					(error) => {
						// Handle error
						throw new Error("Error:", error);
					},
				);
			} catch (error) {
				SFU.showError(skelta.localize.getString("@@MC_LookupFailedError@@"), skelta.localize.getString("@@MC_LookupFailed@@"));
			}
		}

		/**
		 * get the widget items and assign it to control
		 */
		function loadProdStatus() {
			try {
				const parameterCollectionBom = {
					wo_id: _controls.hfWoId.value,
					oper_id: _controls.hfOperId.value,
					seq: _controls.hfSeqNo.value,
				};
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_UCJMMPC_ItemProd_GetProd", parameterCollectionBom, false).then(
					(GetProd) => {
						_controls.wgtProdData.widgetProperties.data = JSON.stringify(GetProd);
					},
					(error) => {
						// Handle error
						throw new Error("Error:", error);
					},
				);
			} catch (error) {
				SFU.showError(skelta.localize.getString("@@MC_LookupFailedError@@"), skelta.localize.getString("@@MC_LookupFailed@@"));
			}
		}

		function loadReasons() {
			const parameterCollection = {
				reas_grp_id: ReasGrpCDConsumed,
			};
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_MC_Item_Reas", parameterCollection, false).then(
				(getProductionReason) => {
					if (
						getProductionReason.DisplayColumn === "" &&
						getProductionReason.ValueColumn === "" &&
						getProductionReason.Data.length === 0
					) {
						throw new Error("@@MC_LookupNotFound@@");
					}
					_controls.wwConsReas.widgetProperties.data = JSON.stringify(getProductionReason);
				},
				(error) => {
					// Handle error
					throw error("@@MC_LookupNotFound@@");
				},
			);
		}

		/**
		 * Function to load WO Queue for an entity and assign data to grid widget
		 *
		 */
		function loadAvailableMaterials() {
			const parameterColl = {
				ent_id: _controls.hfEntId.value,
				item_id: _controls.hfItemId.value,
			};
			FT.WebApi.mesGetAsync(
				"api/V3/DirectAccess",
				"sp_SA_UCJMMPC_Item_Inv_GetInventoryWithChildLocations",
				parameterColl,
				false,
			).then(
				(data) => {
					// Handle successful response data
					_controls.wgtAvailableMaterial.widgetProperties.data = JSON.stringify(data);
				},
				(error) => {
					// Handle error
					throw Error("Error:", error);
				},
			);
		}

		/**
		 * get the widget items and assign it to control
		 */
		function bomItemsOnDataChange() {
			const wdBomItems = JSON.parse(_controls.wwBomItems.value);
			if (_controls.hfItemId.value !== wdBomItems[0].title) {
				_controls.txConsLOT.value = "";
				_controls.txConsSubLOT.value = "";
			}
			_controls.qtyCons.value = wdBomItems[0].qty;
			_controls.itemDesc.value = wdBomItems[0].title_desc;
			_controls.qtyRemain.value = wdBomItems[0].qty;
			_controls.hfBomPos.value = wdBomItems[0].bom_pos;
			_controls.hfItemId.value = wdBomItems[0].title;
			setCtrlsNoOfDecimals(_controls.hfItemId.value);
			loadAvailableMaterials();
		}
		/*
		 * set decimal limit to number controls by Item table
		 */
		function setCtrlsNoOfDecimals(itemID) {
			if (itemID !== "" && itemID !== null && itemID !== undefined) {
				parameterColl = { item_id: itemID };
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_S_Item", parameterColl, false).then((data) => {
					// Handle successful response data
					if (data != null && data.length > 0) {
						const numDecimals = data[0].num_decimals;
						// _controls.hfNumDecimalSelJob.value = numDecimals;
						FT.Common.setDecimalPlaces(_controls.qtyCons, numDecimals);
					}
				});
			} else {
				FT.Common.setDecimalPlaces(_controls.qtyCons, 0);
			}
		}

		/**
		 * Display Consumption reason on data change event.
		 */
		function consReasonOnDataChange() {
			try {
				if (_controls.wwConsReas.value !== null) {
					wdConsumeReas = JSON.parse(_controls.wwConsReas.value);
					_controls.hfReas.value = wdConsumeReas;
				}
			} catch (error) {
				// Empty block
			}
		}

		/**
		 * Pre workflow execution
		 * @returns {boolean} Description of the return value.
		 */
		function preWfExeCons() {
			_controls.hfConsumeQty.value = _controls.qtyCons.value;
			if (_controls.qtyCons.value === "") {
				SFU.showError(skelta.localize.getString("@@MC_EmptyQty@@"), skelta.localize.getString("@@MC_EmptyQty@@"));
				return false;
			}
			if (parseFloat(_controls.qtyCons.value) === 0) {
				SFU.showError(skelta.localize.getString("@@MC_ZeroQty@@"), skelta.localize.getString("@@MC_ZeroQty@@"));
				return false;
			}
			if (parseFloat(_controls.qtyCons.value) < 0) {
				SFU.showError(skelta.localize.getString("@@MC_NegQty@@"), skelta.localize.getString("@@MC_NegQty@@"));
				return false;
			}

			_controls.hfProdLOT.value = _controls.txProdLOT.value;
			_controls.hfProdSubLOT.value = _controls.txProdSubLOT.value;
			_controls.txProdLOT.enable = false;
			_controls.txProdSubLOT.enable = false;

			return true;
		}

		/**
		 * post workflow execution consumption.
		 * @param blockingOutput
		 * @returns {boolean} Description of the return value.
		 */
		function postWfExecCons(blockingOutput) {
			_controls.wwBomItems.widgetProperties.data = "";
			const wfResult = skelta.localize.getString(blockingOutput);
			if (blockingOutput !== "" && blockingOutput !== undefined) {
				SFU.showError(skelta.localize.getString("@@MC_AddConsFailed@@"), wfResult);
				return false;
			}
			loadBomItems();
			loadMixStatus();
			return true;
		}

		/**
		 * Pre workflow execution
		 * @returns {boolean} Description of the return value.
		 */
		function preWfExecProd() {
			return true;
		}

		/**
		 * post workflow execution consumption.
		 * @param blockingOutput
		 * @returns {boolean} Description of the return value.
		 */
		function postWfExecProd(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"mp",
					"mp.itemProd.produce",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"UC_JM_UI_ProducConsumeBatch",
					"mp.itemProd.produce",
				);
				loadProdStatus();
				loadBomItems();
				loadMixStatus();
				resetLOT();
				return true;
			}
			return false;
		}

		/**
		 * Pre workflow execution
		 * @returns {boolean} Description of the return value.
		 */
		function preWfJobEnd() {
			return true;
		}

		/**
		 * post workflow execution consumption.
		 * @param blockingOutput
		 * @returns {boolean} Description of the return value.
		 */
		function postWfExecJobEnd(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"jm",
					"jm.job.end",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"UC_JM_UI_ProducConsumeBatch",
					"jm.job.end",
				);

				return true;
			}
			return false;
		}

		/**
		 * Rest the Prod Lot Sublot Data to initiate New Mix
		 */
		function resetLOT() {
			_controls.hfProdQty.value = 0;
			_controls.hfProdQtyZero.value = 0;
			const lotserialnumber = "";
			_controls.hfProdLOT.value = lotserialnumber;
			_controls.hfProdSubLOT.value = lotserialnumber;
			_controls.txProdLOT.value = lotserialnumber;
			_controls.txProdSubLOT.value = lotserialnumber;
		}

		/**
		 * creation of New Mix
		 * @returns {boolean} Description of the return value.
		 */
		function loadNewMix() {
			// get a lot and sublot to produce

			const [lotserialnumber, sublotserialnumber] = GetProdLotSublot();
			_controls.hfProdQty.value = 0;
			_controls.hfProdQtyZero.value = 0;
			_controls.hfProdLOT.value = lotserialnumber;
			_controls.hfProdSubLOT.value = sublotserialnumber;
			_controls.txProdLOT.value = lotserialnumber;
			_controls.txProdSubLOT.value = sublotserialnumber;

			_controls.pnlBOMItems.visible = true;
			loadBomItems();
			loadReasons();

			_controls.txProdLOT.enable = true;
			_controls.txProdSubLOT.enable = true;

			return true;
		}

		/**
		 * get the widget items and assign it to control
		 */
		function GetProdLotSublot() {
			try {
				const parameterColl = {
					wo_id: _controls.hfWoId.value,
					oper_id: _controls.hfOperId.value,
					seq: _controls.hfSeqNo.value,
					prefix: LOTSUBLOT_PREFIX,
				};

				const Data = FT.WebApi.mesGetSync("api/V3/DirectAccess", "sp_SA_UCJMMPC_ItemProd_GetProdLotSublot", parameterColl, false);
				if (Data !== undefined && Data != null) {
					return [Data[0].lot_no, Data[0].sublot_no];
				}
			} catch (error) {
				SFU.showError(skelta.localize.getString("@@MC_LookupFailedError@@"), skelta.localize.getString("@@MC_LookupFailed@@"));
			}
		}

		/**
		 * Pre workflow execution for creation of New Mix
		 * @returns {boolean} Description of the return value.
		 */
		function preWfExeNewMix() {
			// get a lot and sublot to produce
			const lotserialnumber = Date.now();

			_controls.hfProdQty.value = 0;
			_controls.hfProdQtyZero.value = 0;
			_controls.hfProdLOT.value = lotserialnumber;
			_controls.hfProdSubLOT.value = lotserialnumber;
			_controls.txProdLOT.value = lotserialnumber;
			_controls.txProdSubLOT.value = lotserialnumber;

			return true;
		}

		/**
		 * post workflow execution New Mix.
		 * @param blockingOutput
		 * @returns {boolean} Description of the return value.
		 */
		function postWfExecNewMix(blockingOutput) {
			_controls.wwBomItems.widgetProperties.data = "";
			const wfResult = skelta.localize.getString(blockingOutput);
			if (blockingOutput !== "" && blockingOutput !== undefined) {
				SFU.showError(skelta.localize.getString("@@MC_AddConsFailed@@"), wfResult);
				return false;
			}
			_controls.pnlBOMItems.visible = true;
			loadBomItems();
			loadReasons();
			return true;
		}

		/**
		 * get the open Prod Lot for supplied WO if any
		 * @param blockingOutput
		 * @returns {boolean} Description of the return value.
		 */
		function getOpenProdLotButtonClick() {
			try {
				const parameterCollectionBom = {
					wo_id: _controls.hfWoId.value,
					oper_id: _controls.hfOperId.value,
					seq: _controls.hfSeqNo.value,
				};
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_UCJMMPC_ItemProd_GetOpenProdLot", parameterCollectionBom, false).then(
					(GetOpenProdLot) => {
						if (GetOpenProdLot.length > 0) {
							_controls.hfProdQty.value = 0;
							_controls.hfProdQtyZero.value = 0;
							_controls.hfProdLOT.value = GetOpenProdLot[0].fg_lot_no;
							_controls.hfProdSubLOT.value = GetOpenProdLot[0].fg_sublot_no;
							_controls.txProdLOT.value = GetOpenProdLot[0].fg_lot_no;
							_controls.txProdSubLOT.value = GetOpenProdLot[0].fg_sublot_no;
							isNewMix = false;
							loadBomItems();
							loadMixStatus();
						} else {
							isNewMix = true;
						}
					},
					(error) => {
						// Handle error
						throw new Error("Error:", error);
					},
				);
			} catch (error) {
				SFU.showError(skelta.localize.getString("@@MC_LookupFailedError@@"), skelta.localize.getString("@@MC_LookupFailed@@"));
			}
		}

		/**
		 * Define which functions/properties are to be made public.
		 */

		return {
			initializeForm: initializeForm,
			consReasonOnDataChange: consReasonOnDataChange,
			bomItemsOnDataChange: bomItemsOnDataChange,
			preWfExeCons: preWfExeCons,
			postWfExecCons: postWfExecCons,
			preWfExeNewMix: preWfExeNewMix,
			postWfExecNewMix: postWfExecNewMix,
			wwAvailableMaterialSelectionChange: wwAvailableMaterialSelectionChange,
			getOpenProdLotButtonClick: getOpenProdLotButtonClick,
			preWfExecProd: preWfExecProd,
			postWfExecProd: postWfExecProd,
			preWfJobEnd: preWfJobEnd,
			postWfExecJobEnd: postWfExecJobEnd,
			loadNewMix: loadNewMix,
			enableCons: enableCons,
		};
	}
})(window);
