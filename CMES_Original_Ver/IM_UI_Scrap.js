/*
Name:        	IM_UI_Scrap.js
Description: 	IM_UI_Scrap js file containing global logic pertaining to the scrap inventory form.

Ver	Release	By		    Date				Change Description
001	00.70  	Praveen		2024-06-11	#3855 First version.
002	00.70  	Usha M		2025-02-19	#4298 For unsucessful transaction should not refresh IM_List, enableLotOrLocation txLot is made empty.
003	01.00		Bas van B	2025-02-25	#4253 Cleaned up script. Use correct MD fields in UI and translate item reasons in dropdown.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.IM = window.IM || {};
	IM.Scrap = IM.Scrap || {};
	IM.Scrap = Scrap();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function Scrap() {
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
			_controls.rbLotOrLocation = FORM.Control.findByXmlNode("RBIN");
			_controls.txLocation = FORM.Control.findByXmlNode("TXLA");
			_controls.txItemId = FORM.Control.findByXmlNode("TXIT");
			_controls.txQty = FORM.Control.findByXmlNode("TXQT");
			_controls.nrScrapQty = FORM.Control.findByXmlNode("NRSQY");
			_controls.ddLot = FORM.Control.findByXmlNode("DDLT");
			_controls.ddSublot = FORM.Control.findByXmlNode("DDSLT");
			_controls.ddReason = FORM.Control.findByXmlNode("DDRA");
			_controls.txComments = FORM.Control.findByXmlNode("TXCMT");
			_controls.numEntId = FORM.Control.findByXmlNode("NREID");
			_controls.numLotOrLocation = FORM.Control.findByXmlNode("NRSL");
			_controls.lblUOM = FORM.Control.findByXmlNode("LBUOM");
			_controls.lblScrapUOM = FORM.Control.findByXmlNode("LBSUM");
			_controls.panelUOM = FORM.Control.findByXmlNode("PLUOM");
			_controls.panelScrapUOM = FORM.Control.findByXmlNode("PLSUM");
			_controls.hfItemId = FORM.Control.findByXmlNode("HFITD");

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
				loadInventoryData();
				ddItemReasListLoad();
			} catch (exception) {
				handleScriptError(exception);
			}
		}
		/**
		 * Loads the list of item reason and populates the dropdown control with the retrieved data.
		 */
		function ddItemReasListLoad() {
			parameterColl = {};
			FT.WebApi.mesGetAsync("api/itemReason", "", parameterColl, false).then(
				(data) => {
					// Handle successful response data
					let scrapReasons = [];
					if (data && data.length > 0) {
						scrapReasons = data.filter((dd) => dd.reas_grp_type === 3);
						// Translate the scrap reasons
						const fields = [
							FT.Ui.translationColumnField(
								"reas_desc",
								FT.Ui.TRANSLATION_GROUPS.grpItemReasReasDesc,
								FT.Ui.TRANSLATION_KEYS.keyItemReas,
							),
							FT.Ui.translationColumnField(
								"reas_grp_desc",
								FT.Ui.TRANSLATION_GROUPS.grpItemReasGrpReasGrpDesc,
								FT.Ui.TRANSLATION_KEYS.keyItemReasGrp,
							),
						];
						scrapReasons = FT.Ui.translateArray(scrapReasons, fields);
					}
					FT.WorkTasks.controlOptionsSetFromDataset("DDRA", 0, scrapReasons, "reas_desc", "reas_cd");
				},
				(error) => {
					// Handle error
					throw new Error("Error:", error);
				},
			);
		}
		/**
		 * Loads the list of Lot no and populates the dropdown control with the retrieved data.
		 */
		function ddLotLoad(itemId, entId) {
			parameterColl = { item_id: itemId, ent_id: entId };
			const invLotData = FT.WebApi.mesGetSync(
				"api/V3/DirectAccess",
				"sp_sa_IM_Item_Inv_LotListByItemEntId",
				parameterColl,
				false,
			);
			if (invLotData.length > 0) {
				FT.WorkTasks.controlOptionsSetFromDataset("DDLT", 0, invLotData, "lot_no", "lot_no");
			}
		}
		/**
		 * Loads the list of Sublot no and populates the dropdown control with the retrieved data.
		 */
		function ddSublotLoad(lotno) {
			const inventoryContext = FT.WorkTasks.contextGet(FORM.Control, "itemInv");
			if (lotno === "ALL") {
				_controls.ddSublot.visible = false;
				FT.WorkTasks.controlOptionsSetFromDataset("DDSLT", 0, "", "sublot_no", "sublot_no");
			} else {
				if (inventoryContext && inventoryContext.length > 0) {
					parameterColl = {
						item_id: inventoryContext[0].jsonValue.item_id,
						ent_id: inventoryContext[0].jsonValue.ent_id,
						lot_no: lotno,
					};
					const invSublotData = FT.WebApi.mesGetSync(
						"api/V3/DirectAccess",
						"sp_sa_IM_Item_Inv_SubLotListByLotItemEntId",
						parameterColl,
						false,
					);
					if (invSublotData.length > 0) {
						FT.WorkTasks.controlOptionsSetFromDataset("DDSLT", 0, invSublotData, "sublot_no", "sublot_no");
					}
				}
				_controls.ddSublot.visible = true;
			}
			getScrapQuantity(
				inventoryContext[0].jsonValue.item_id,
				inventoryContext[0].jsonValue.ent_id,
				lotno === "ALL" ? null : lotno,
				null,
			);
		}
		/**
		 * Loads the list of Sublot no and populates the dropdown control with the retrieved data.
		 */
		function getScrapQuantity(itemId, entId, lotno, sublotno) {
			parameterColl = {
				item_id: itemId,
				ent_id: entId,
				lot_no: lotno === "" ? null : lotno,
				sublot_no: sublotno === "" ? null : sublotno,
			};
			const invScrapQuantity = FT.WebApi.mesGetSync(
				"api/V3/DirectAccess",
				"sp_S_IM_Item_Inv_GetQtyLeftByEntItemLotSublot",
				parameterColl,
				false,
			);
			if (invScrapQuantity.length > 0) {
				_controls.txQty.value = invScrapQuantity[0].qty_left;
			} else {
				_controls.txQty.value = "";
			}
		}

		/**
		 * Loads the inventory details from the itemInv context and updates UI.
		 */
		function ddSublotnoOnDataChange() {
			const inventoryContext = FT.WorkTasks.contextGet(FORM.Control, "itemInv");
			getScrapQuantity(
				inventoryContext[0].jsonValue.item_id,
				inventoryContext[0].jsonValue.ent_id,
				_controls.ddLot.value,
				_controls.ddSublot.value,
			);
		}
		/**
		 * Loads the inventory details from the itemInv context and updates UI.
		 */
		function loadInventoryData() {
			const inventoryContext = FT.WorkTasks.contextGet(FORM.Control, "itemInv");
			if (inventoryContext && inventoryContext.length > 0) {
				_controls.txLocation.value = inventoryContext[0].jsonValue.description;
				_controls.txItemId.value = inventoryContext[0].jsonValue.item_desc;
				_controls.hfItemId.value = inventoryContext[0].jsonValue.item_id;
				ddLotLoad(inventoryContext[0].jsonValue.item_id, inventoryContext[0].jsonValue.ent_id);
				ddSublotLoad(inventoryContext[0].jsonValue.lot_no);
				_controls.ddLot.value = inventoryContext[0].jsonValue.lot_no;
				_controls.ddSublot.value = inventoryContext[0].jsonValue.sublot_no;
				_controls.lblUOM.value = inventoryContext[0].jsonValue.item_inv_uom_description;
				_controls.lblScrapUOM.value = inventoryContext[0].jsonValue.item_inv_uom_description;
				getScrapQuantity(
					inventoryContext[0].jsonValue.item_id,
					inventoryContext[0].jsonValue.ent_id,
					inventoryContext[0].jsonValue.lot_no,
					inventoryContext[0].jsonValue.sublot_no,
				);
			}
		}
		/**
		 * @param {*} error
		 */
		function handleScriptError(error) {
			let errorMessage;
			if (error instanceof TypeError) {
				errorMessage = skelta.localize.getString("@@OM_UnexpectedType@@");
			} else if (error instanceof ReferenceError) {
				errorMessage = skelta.localize.getString("@@OM_ReferenceError@@");
			} else {
				errorMessage = skelta.localize.getString("@@OM_DuringScriptExecution@@");
			}
			SFU.showError(skelta.localize.getString("FormNGFErrorRunningScript_title"), errorMessage, null, error.message);
			throw errorMessage;
		}
		/**
		 * Function to set Panel Z - index
		 */
		function MandatoryLotOrLocation(rbLotOrLocation) {
			return rbLotOrLocation === "1";
		}
		/**
		 * Function to set Panel Z - index
		 */
		function enableLotOrLocation(rbLotOrLocation) {
			if (rbLotOrLocation === "1") {
				_controls.nrScrapQty.enable = true;
				_controls.txItemId.visible = true;
				_controls.txQty.visible = true;
				_controls.ddLot.visible = true;
				_controls.ddSublot.visible = true;
				_controls.nrScrapQty.visible = true;
				_controls.lblUOM.visible = true;
				_controls.lblScrapUOM.visible = true;
				_controls.panelUOM.visible = true;
				_controls.panelScrapUOM.visible = true;
				loadInventoryData();
			} else {
				_controls.txItemId.value = "";
				_controls.txQty.value = "";
				_controls.nrScrapQty.value = "";
				_controls.nrScrapQty.enable = false;

				_controls.txItemId.visible = false;
				_controls.txQty.visible = false;
				_controls.ddLot.visible = false;
				_controls.ddSublot.visible = false;
				_controls.nrScrapQty.visible = false;
				_controls.lblUOM.visible = false;
				_controls.lblScrapUOM.visible = false;
				_controls.panelUOM.visible = false;
				_controls.panelScrapUOM.visible = false;
			}
		}
		/**
		 * Prepares data and sets control values before executing the workflow.
		 */
		function iwScrapInventoryOnPreWorkflow() {
			if (FORM.Control.validateForm() === true) {
				const inventoryContext = FT.WorkTasks.contextGet(FORM.Control, "itemInv");
				if (inventoryContext && inventoryContext.length > 0) {
					_controls.numEntId.value = inventoryContext[0].jsonValue.ent_id;
					_controls.numLotOrLocation.value = _controls.rbLotOrLocation.value;
					_controls.ddLot.value = _controls.ddLot.value === "ALL" ? "" : _controls.ddLot.value;
					return true;
				}
				return false; // Return false if condition is not met
			}
			return false;
		}

		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwScrapInventoryOnPostWorkflow(blockingOutput, workflowStatus) {
			if (blockingOutput !== "" || workflowStatus !== FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			} else if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"im",
					"im.itemInv.scrap",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"IM_UI_Scrap",
					"im.itemInv.scrap",
				);
			}
		}
		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			loadInventoryData: loadInventoryData,
			MandatoryLotOrLocation: MandatoryLotOrLocation,
			enableLotOrLocation: enableLotOrLocation,
			iwScrapInventoryOnPreWorkflow: iwScrapInventoryOnPreWorkflow,
			iwScrapInventoryOnPostWorkflow: iwScrapInventoryOnPostWorkflow,
			ddSublotLoad: ddSublotLoad,
			getScrapQuantity: getScrapQuantity,
			ddSublotnoOnDataChange: ddSublotnoOnDataChange,
		};
	}
})(window);
