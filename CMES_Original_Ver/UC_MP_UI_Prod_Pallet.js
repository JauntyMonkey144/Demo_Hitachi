/*
Name:					UC_MP_UI_ProdPallet.js
Description:	UC_MP_UI_ProdPallet js file containing global logic pertaining the functionality for AddProduction and Reject.

Ver		Release		By						Date				Change Description
001		00.70.00	WL						2024-08-21	First version of the file.
002		00.70.00	FA						2025-03-12	#4452 Included event dispatch in iwRejectAddOnPostWorkflow function.
003   00.70.00	Somya S				2025-03-03	#4515 Remove CSS Reference UC_Additional.css
004		01.02.00 	Fayaz A				2025-07-04	#5093 Updated to set and retrieve data using FT functions instead of accessing storage directly.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.UCMP = window.UCMP || {};
	UCMP.ProdPallet = UCMP.ProdPallet || {};
	UCMP.ProdPallet = ProdPallet();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function ProdPallet() {
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		const _controls = {};
		FORM.Control = null;
		const BASEGRID_CONF = "UC_MP_ProdPallet";

		const STORAGEKEY = "sessionData_UC_MP_UI_ProdPallet"; // Key to store in sessionStorage
		// ----------------------------------------------------------------------------------

		// ----------------------------- Private Variables ----------------------------------
		let rowVal = 0;
		let typeVal = 0;
		let entVal = 0;
		let qtyRemaining = 0;
		let entId = 0;
		let dataJson = [];
		const goodProductionReason = 2;
		const badProductionReason = 7;
		// let chkLblGood = "@@UC_ProdPallet_Good@@";
		// let chkLblReject = "@@UC_ProdPallet_Reject@@";
		// ----------------------------------------------------------------------------------
		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 */
		function initializeForm(Control) {
			// Initialize variables

			FORM.Control = Control;
			_controls.txItem = FORM.Control.findByXmlNode("TXITEM");
			_controls.hfProdType = FORM.Control.findByXmlNode("HFPT");
			_controls.txtQtyRemaining = FORM.Control.findByXmlNode("TXQR");
			_controls.txtQtytoProduceDisplay = FORM.Control.findByXmlNode("TXQPD");
			_controls.txtQtytoRejectDisplay = FORM.Control.findByXmlNode("TXQRD");
			_controls.hfQtyToProduce = FORM.Control.findByXmlNode("HFQP");
			_controls.hfItemId = FORM.Control.findByXmlNode("HFII");
			_controls.hfEntId = FORM.Control.findByXmlNode("HFEI");
			_controls.hfWoId = FORM.Control.findByXmlNode("HFWI");
			_controls.hfOperId = FORM.Control.findByXmlNode("HFOI");
			_controls.hfSqn = FORM.Control.findByXmlNode("HFSQN");
			_controls.hfJobPos = FORM.Control.findByXmlNode("HFJP");
			_controls.hfJobStep = FORM.Control.findByXmlNode("HFJS");
			_controls.hfAltLoc = FORM.Control.findByXmlNode("HFAL");
			_controls.hfUpdateInv = FORM.Control.findByXmlNode("HFUI");
			_controls.hfMcNewLots = FORM.Control.findByXmlNode("HFNL");
			_controls.hfQtyToReduceBy = FORM.Control.findByXmlNode("HFQR");
			_controls.hfNumDecimalSelJob = FORM.Control.findByXmlNode("HFND");
			_controls.hfUomQtyRem = FORM.Control.findByXmlNode("HFUQR");
			_controls.hfUomQtyProd = FORM.Control.findByXmlNode("HFUQP");
			_controls.hfStorageLocation = FORM.Control.findByXmlNode("HFSL");
			_controls.hfEntName = FORM.Control.findByXmlNode("HFEN");
			_controls.wwGoodProdReas = FORM.Control.findByXmlNode("WWREAS");
			_controls.wwRejectProdReas = FORM.Control.findByXmlNode("WWRR");
			_controls.wwItemProd = FORM.Control.findByXmlNode("WWGD");
			_controls.txtSublot = FORM.Control.findByXmlNode("TXTSL");
			_controls.chkGoodReject = FORM.Control.findByXmlNode("CKGR");
			_controls.hfProdReason = FORM.Control.findByXmlNode("HFPR");
			_controls.ddStorageLocation = FORM.Control.findByXmlNode("DDSL");
			_controls.ddScrapLocation = FORM.Control.findByXmlNode("DDSRL");
			_controls.ddItemtoProduce = FORM.Control.findByXmlNode("DDMT");

			_controls.txtLot = FORM.Control.findByXmlNode("TXBTC");
			_controls.hfLot = FORM.Control.findByXmlNode("HFLT");
			_controls.hfSubLot = FORM.Control.findByXmlNode("HFSLT");

			// Include js files
			includeJsFiles();

			// Include js files via ajax
			includeJsFilesAjax();

			// Include CSS files
			includeCssFiles();

			// Add code here
			onFormLoad(FORM.Control);
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
		 * Form load function to bind selected card values eventData to the Production form.
		 */
		function onFormLoad(control) {
			_controls.txtQtyRemaining = FORM.Control.findByXmlNode("TXQR");
			{
				const selectedCard = FT.WorkTasks.contextGet(FORM.Control, "eventData");
				dataJson = JSON.parse(selectedCard[0].jsonValue);
				const data = dataJson[0];
				if (data) {
					const productionType = "1";

					_controls.txItem.value = data.item_desc;
					_controls.hfProdType.value = productionType;
					_controls.txtQtyRemaining.value = qtyRemaining;
					_controls.txtQtytoProduceDisplay.value = qtyRemaining;
					_controls.txtQtytoRejectDisplay.value = 0;
					_controls.hfQtyToProduce.value = qtyRemaining;
					_controls.hfItemId.value = data.itemId;
					_controls.hfEntId.value = data.ent_id;
					_controls.hfEntName.value = data.ent_name;
					_controls.hfWoId.value = data.woId;
					_controls.hfOperId.value = data.operId;
					_controls.hfSqn.value = data.seqNo;
					_controls.hfJobPos.value = "0";
					_controls.hfJobStep.value = 1;
					_controls.hfAltLoc.value = 1;
					_controls.hfUpdateInv.value = 0;
					_controls.hfMcNewLots.value = 1;
					_controls.hfNumDecimalSelJob.value = 0;
					_controls.hfUomQtyRem.value = data.uom_desc;
					_controls.hfUomQtyProd.value = data.uom_desc;
					rowVal = data.row_id;
					typeVal = data.type;
					entVal = data.ent_name;
					entId = data.ent_id;
					const datalotsublot = retrieveLotAndSubLot(data.woId, data.operId, data.seqNo);
					if (datalotsublot) {
						_controls.txtLot.value = datalotsublot.lot;
						_controls.txtSublot.value = datalotsublot.sublot;
					} else {
						/* "sessionData_MP_UI_JobProduce " */
						const sessionData = JSON.parse(FT.WorkTasks.sessionStorageJsonGet("sessionData_MP_UI_JobProduce")) || [];

						// Find the entry that matches wo, oper, and seq
						const result = sessionData.find((item) => item.wo === data.woId); // && item.oper === oper &&*/ item.seq === seq);

						// Return lot and sublot if found, otherwise return null
						if (result) {
							_controls.txtLot.value = result.lot;
							_controls.txtSublot.value = result.sublot;
						}
						/**/
					}
					_controls.hfProdReason.value = goodProductionReason;
				}

				let actFinishTimeUTC = null;
				if (actFinishTimeUTC === null) {
					actFinishTimeUTC = Date.now();
				}

				wwGridLoad(dataJson);

				ddItemListLoad(dataJson);
				ddStorageLocationLoad(dataJson);
				ddScrapLocationLoad(dataJson);
			}
			control.findByXmlNode("BTNP").setFocus();
		}

		/**
		 * Loads the list of item and populates the dropdown control
		 *  with the retrieved data.
		 * @returns {Object|null} The retrieved Items data, or null if the request fails.
		 */
		function ddItemListLoad(evendata) {
			const parameterColl = {
				wo_id: evendata[0].woId,
				oper_id: evendata[0].operId,
				seq_no: evendata[0].seqNo,
			};
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_S_MP_Job_FG", parameterColl, false).then(
				(data) => {
					// Handle successful response data
					FT.WorkTasks.controlOptionsSetFromDataset("DDMT", 0, data, "item_display", "item_id");

					_controls.ddItemtoProduce.value = data[0].item_id;
				},
				(error) => {
					// Handle error
					throw new Error("Error:", error);
				},
			);
		}

		/**
		 * Loads the list of storage locations and populates the dropdown control
		 *  with the retrieved data.
		 * @returns {Object|null} The retrieved Items data, or null if the request fails.
		 */
		function ddStorageLocationLoad(evendata) {
			const parameterColl = {
				line: evendata[0].ent_id,
				wo_id: evendata[0].woId,
				oper_id: evendata[0].operId,
				seq_no: evendata[0].seqNo,
			};
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_S_MP_StorageLocation", parameterColl, false).then(
				(data) => {
					// Handle successful response data
					FT.WorkTasks.controlOptionsSetFromDataset("DDSL", 0, data, "display", "display");
					_controls.ddStorageLocation.value = data[0].display;
				},
				(error) => {
					// Handle error
					throw new Error("Error:", error);
				},
			);
		}

		/**
		 * Loads the list of storage locations and populates the dropdown control
		 *  with the retrieved data.
		 * @returns {Object|null} The retrieved Items data, or null if the request fails.
		 */
		function ddScrapLocationLoad(evendata) {
			const parameterColl = {
				line: evendata[0].ent_id,
				wo_id: evendata[0].woId,
				oper_id: evendata[0].operId,
				seq_no: evendata[0].seqNo,
			};
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_S_MP_SLScrap", parameterColl, false).then(
				(data) => {
					// Handle successful response data
					FT.WorkTasks.controlOptionsSetFromDataset("DDSRL", 0, data, "display", "display");
					_controls.ddScrapLocation.value = data[0].display;
				},
				(error) => {
					// Handle error
					throw new Error("Error:", error);
				},
			);
		}

		/**
		 * bind grid widget to Item Prod Lot data
		 */
		function wwGridLoad(evendata) {
			try {
				const parameterCollection = {
					wo_id: evendata[0].woId,
					oper_id: evendata[0].operId,
					seq_no: evendata[0].seqNo,
					sublot: _controls.txtSublot.value,
				};
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_S_MP_ItemProd_SubLot", parameterCollection, false).then(
					(data) => {
						_controls.wwItemProd.confName = BASEGRID_CONF;
						_controls.wwItemProd.widgetProperties.data = JSON.stringify(data);
					},
					(error) => {
						// Handle error
						throw error("Error:", error);
					},
				);
			} catch (exception) {
				handleScriptError(exception);
			}
		}

		/**
		 * bind grid widget to Item Prod Lot data
		 */
		function txtNewPalletClick(control) {
			try {
				_controls.txtSublot.value = generateSSCC(control);
			} catch (exception) {
				handleScriptError(exception);
			}
		}

		/**
		 * Define project Logic for Autogenerated SSCC
		 */
		function generateSSCC(control) {
			return Date.now();
		}

		/**
		 * bind grid widget to Item Prod Lot data
		 */
		function txtNewPalletRefresh(control) {
			try {
				wwGridLoad(dataJson);
			} catch (exception) {
				handleScriptError(exception);
			}
		}

		/**
		 * checkbox for good or reject production data change
		 */
		function chkGoodRejectDataChange(ctrl) {
			try {
				if (_controls.chkGoodReject.value === "good") {
					_controls.hfProdReason.value = goodProductionReason;
				} else {
					_controls.hfProdReason.value = badProductionReason;
				}
			} catch (exception) {
				handleScriptError(exception);
			}
		}

		// INCLUDE NEW FUNCTIONS HERE
		/**
		 * Prepares data and sets control values before post workflow execution of add goods Production
		 * @returns
		 */
		function iwGoodAddOnPreWorkflow() {
			_controls.hfQtyToProduce.value = _controls.txtQtytoProduceDisplay.value;
			_controls.hfProdReason.value = goodProductionReason;
			_controls.hfEntName.value = entVal;
			_controls.hfEntId.value = entId;
			_controls.hfStorageLocation.value = _controls.ddStorageLocation.value;
			_controls.hfProdType.value = "";

			_controls.hfLot.value = _controls.txtLot.value;
			_controls.hfSubLot.value = _controls.txtSublot.value;

			if (_controls.hfUpdateInv.value) {
				if (_controls.hfStorageLocation.value === "") {
					const title = skelta.localize.getString("@@MP_ValidationError@@");
					const errorMsg = skelta.localize.getString("@@MP_InvalidDefStorageLoc@@");
					const errorDetails = skelta.localize.getString("@@MP_DefStorageLocErrorDetails@@");
					SFU.showError(title, errorMsg, null, errorDetails);
					return false;
				}
			}
			if (_controls.hfQtyToReduceBy.value) {
				if (parseFloat(_controls.hfQtyToProduce.value) * -1 > parseFloat(_controls.hfQtyToReduceBy.value)) {
					const title = skelta.localize.getString("@@MP_ValidationError@@");
					const errorMsg = skelta.localize.getString("@@MP_QtyToReduceByError@@") + " " + _controls.hfQtyToReduceBy.value;
					const errorDetails = skelta.localize.getString("@@MP_QtyToReduceByErrorDetails@@");
					SFU.showError(title, errorDetails, null, errorMsg);
					return false;
				}
				return true;
			}
			if (_controls.hfQtyToProduce.value === "") {
				SFU.showError(
					skelta.localize.getString("@@MP_QtyToProdMand@@"),
					null,
					skelta.localize.getString("@@MP_InvalidProduceQty@@"),
				);
				return false;
			}
			if (parseFloat(_controls.hfQtyToProduce.value) === 0) {
				const title = skelta.localize.getString("@@MP_ValidationError@@");
				const errorMsg = skelta.localize.getString("@@MP_InvalidProduceQty@@");
				const errorDetails = skelta.localize.getString("@@MP_ProduceZeroQtyErrDetails@@");
				SFU.showError(title, errorDetails, null, errorMsg);
				return false;
			}
			if (parseFloat(_controls.hfQtyToProduce.value) < 0) {
				SFU.showError(
					skelta.localize.getString("@@MP_NegQtyNotAllowedTitle@@"),
					skelta.localize.getString("@@MP_NegQtyNotAllowedTitle@@"),
					null,
					skelta.localize.getString("@@MP_InvalidProduceQty@@"),
				);
				return false;
			}
			return true;
		}
		/**
		 * Performs actions after the execution of a workflow after workflow execution of add goods Production
		 * @returns
		 */
		function iwGoodAddOnPostWorkflow() {
			try {
				// add lot and sublot

				storeToSessionStorage(
					dataJson[0].woId,
					dataJson[0].operId,
					dataJson[0].seqNo,
					_controls.txtLot.value,
					_controls.txtSublot.value,
				);

				const parameterColl = {
					ent_name: entVal,
					row_id: rowVal,
				};

				const spName = "sp_S_MP_GetProdData";
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", spName, parameterColl, false).then(
					(data) => {
						const getProdData = data;
						if (getProdData.length === 0) {
							throw new Error("@@MP_LookupNotFound@@");
						}
						const recordData = JSON.stringify(getProdData);
						qtyRemaining = parseFloat(JSON.parse(recordData)[0].qty) - parseFloat(JSON.parse(recordData)[0].qty_prod);
						if (qtyRemaining < 0) {
							qtyRemaining = 0;
						}
						_controls.txtQtyRemaining.value = qtyRemaining;
					},
					(error) => {
						// Handle error
						throw Error("Error:", error);
					},
				);

				FT.Common.windowEventDispatch(
					"mp",
					"mp.itemProd.produce",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"UC_MP_UI_Prod_Pallet",
					"mp.itemProd.produce",
				);
				wwGridLoad(dataJson);
			} catch (error) {
				SFU.showError(skelta.localize.getString("@@MP_LookupFailedError@@"), skelta.localize.getString("@@MP_LookupFailed@@"));
			}
		}

		/**
		 * post workflow execution job start.
		 * @param blockingOutput
		 * @returns {boolean} Description of the return value.
		 */
		function iwWOEndPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch("jm", "jm.job.end", FT.Common.EVENT_SOURCE_TYPE.form, "UC_MP_UI_Prod_Pallet", "jm.job.end");
			}
		}

		/**
		 * Prepares data and sets control values before post workflow execution of add Reject.
		 * @returns
		 */
		function iwRejectAddOnPreWorkflow() {
			_controls.hfProdReason.value = badProductionReason;
			_controls.hfQtyToProduce.value = _controls.txtQtytoRejectDisplay.value;
			_controls.hfEntName.value = entVal;
			_controls.hfEntId.value = entId;
			_controls.hfEntName.value = entVal;
			_controls.hfProdType.value = "";
			_controls.hfStorageLocation.value = _controls.ddScrapLocation.value;

			_controls.hfLot.value = "b" + _controls.txtLot.value;
			_controls.hfSubLot.value = "b" + _controls.txtSublot.value;

			if (_controls.hfUpdateInv.value) {
				if (_controls.hfStorageLocation.value === "") {
					const title = skelta.localize.getString("@@MP_ValidationError@@");
					const errorMsg = skelta.localize.getString("@@MP_InvalidDefStorageLoc@@");
					const errorDetails = skelta.localize.getString("@@MP_DefStorageLocErrorDetails@@");
					SFU.showError(title, errorMsg, null, errorDetails);
					return false;
				}
			}
			if (_controls.hfQtyToReduceBy.value) {
				if (parseFloat(_controls.hfQtyToProduce.value) * -1 > parseFloat(_controls.hfQtyToReduceBy.value)) {
					const title = skelta.localize.getString("@@MP_ValidationError@@");
					const errorMsg = skelta.localize.getString("@@MP_QtyToReduceByError@@") + " " + _controls.hfQtyToReduceBy.value;
					const errorDetails = skelta.localize.getString("@@MP_QtyToReduceByErrorDetails@@");
					SFU.showError(title, errorDetails, null, errorMsg);
					return false;
				}
				return true;
			}
			if (_controls.hfQtyToProduce.value === "") {
				SFU.showError(
					skelta.localize.getString("@@MP_QtyToRejMandError@@"),
					skelta.localize.getString("@@MP_QtyToRejMand@@"),
					null,
					skelta.localize.getString("@@MP_InvalidProduceQty@@"),
				);
				return false;
			}
			if (parseFloat(_controls.hfQtyToProduce.value) < 0) {
				const title = skelta.localize.getString("@@MP_ValidationError@@");
				const errorMsg = skelta.localize.getString("@@MP_InvalidProduceQty@@");

				SFU.showError(title, "@@MP_NegQtyNotAllowed@@", null, errorMsg);
				return false;
			}
			if (parseFloat(_controls.hfQtyToProduce.value) === 0) {
				const title = skelta.localize.getString("@@MP_ValidationError@@");
				const errorMsg = skelta.localize.getString("@@MP_InvalidProduceQty@@");
				const errorDetails = skelta.localize.getString("@@MP_ProduceZeroQtyErrDetails@@");
				SFU.showError(title, errorDetails, null, errorMsg);
				return false;
			}
			return true;
		}

		/**
		 * Performs actions after the execution of workflow of add Reject.
		 * @returns
		 */
		function iwRejectAddOnPostWorkflow() {
			try {
				const parameterColl = {
					ent_name: entVal,
					row_id: rowVal,
				};
				const spName = "sp_S_MP_GetProdData";
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", spName, parameterColl, false).then(
					(data) => {
						const getProdData = data;
						const recordData = JSON.stringify(getProdData);
						let qtyR = parseFloat(JSON.parse(recordData)[0].qty) - parseFloat(JSON.parse(recordData)[0].qty_prod);

						if (!(qtyR > 0)) {
							qtyR = "0";
						}

						_controls.txtQtyRemaining.value = qtyR;
						_controls.txtQtytoRejectDisplay.value = 0;
						_controls.txtQtytoProduceDisplay.value = qtyR;

						FT.Common.windowEventDispatch(
							"mp",
							"mp.itemProd.produce",
							FT.Common.EVENT_SOURCE_TYPE.form,
							"UC_MP_UI_Prod_Pallet",
							"mp.itemProd.produce",
						);

						wwGridLoad(dataJson);
					},
					(error) => {
						// Handle error
						throw Error("Error:", error);
					},
				);
			} catch (error) {
				SFU.showError(
					skelta.localize.getString("@@MP_LookupNotFoundError@@"),
					skelta.localize.getString("@@MP_LookupNotFound@@"),
				);
			}
		}
		/**
		 * function to reduce numeric value for prduction count
		 */
		function fbGoodReduceOnClick() {
			var qtyProduce = parseFloat(_controls.txtQtytoProduceDisplay.value);
			if (qtyProduce > 1) {
				_controls.txtQtytoProduceDisplay.value = qtyProduce - 1;
			}
		}

		/**
		 * function to increase numeric value for production count
		 */
		function fbGoodAddOnClick() {
			var qtyProduce = parseFloat(_controls.txtQtytoProduceDisplay.value);
			if (qtyProduce > 0) {
				_controls.txtQtytoProduceDisplay.value = qtyProduce + 1;
			}
		}

		/**
		 * function to reduce numeric value on reduce button
		 */
		function fbRejectReduceOnClick() {
			var qtyReject = parseFloat(_controls.txtQtytoRejectDisplay.value);
			if (qtyReject > 1) {
				_controls.txtQtytoRejectDisplay.value = qtyReject - 1;
			}
		}

		/**
		 * button to add reject
		 */
		function fbRejectAddOnClick() {
			var qtyReject = parseFloat(_controls.txtQtytoRejectDisplay.value);
			if (qtyReject > 0) {
				_controls.txtQtytoRejectDisplay.value = qtyReject + 1;
			}
		}

		// Function to store/update data in session storage
		function storeToSessionStorage(wo, oper, seq, lot, sublot) {
			// Retrieve the current data from session storage or initialize an empty array
			let sessionData = JSON.parse(FT.WorkTasks.sessionStorageJsonGet(STORAGEKEY)) || [];

			// Check if the entry with matching wo, oper, and seq exists
			const existingIndex = sessionData.findIndex((item) => item.wo === wo && item.oper === oper && item.seq === seq);

			if (existingIndex !== -1) {
				// Update lot and sublot if the entry exists
				sessionData[existingIndex].lot = lot;
				sessionData[existingIndex].sublot = sublot;
			} else {
				// Add a new entry if it doesn't exist
				sessionData.push({
					wo,
					oper,
					seq,
					lot,
					sublot,
				});
			}

			// Save the updated data back to session storage
			FT.WorkTasks.sessionStorageJsonSet(STORAGEKEY, JSON.stringify(sessionData));
		}

		// Function to retrieve lot and sublot for the given wo, oper, and seq
		function retrieveLotAndSubLot(wo, oper, seq) {
			// Retrieve the data from session storage
			const sessionData = JSON.parse(FT.WorkTasks.sessionStorageJsonGet(STORAGEKEY)) || [];

			// Find the entry that matches wo, oper, and seq
			const result = sessionData.find((item) => item.wo === wo && item.oper === oper && item.seq === seq);

			// Return lot and sublot if found, otherwise return null
			if (result) {
				return { lot: result.lot, sublot: result.sublot };
			}
			return null; // Entry not found
		}

		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			iwGoodAddOnPreWorkflow: iwGoodAddOnPreWorkflow,
			iwWOEndPostWorkflow: iwWOEndPostWorkflow,
			iwGoodAddOnPostWorkflow: iwGoodAddOnPostWorkflow,
			iwRejectAddOnPreWorkflow: iwRejectAddOnPreWorkflow,
			iwRejectAddOnPostWorkflow: iwRejectAddOnPostWorkflow,
			fbGoodReduceOnClick: fbGoodReduceOnClick,
			fbGoodAddOnClick: fbGoodAddOnClick,
			fbRejectReduceOnClick: fbRejectReduceOnClick,
			fbRejectAddOnClick: fbRejectAddOnClick,
			txtNewPalletClick: txtNewPalletClick,
			txtNewPalletRefresh: txtNewPalletRefresh,
			chkGoodRejectDataChange: chkGoodRejectDataChange,
		};
	}
})(window);
