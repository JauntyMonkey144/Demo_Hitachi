/*
Name:        	IM_UI_Transfer.js
Description: 	IM_UI_Transfer js file containing global logic pertaining to the transfer inventory form.

Ver	Release		By		    Date					Change Description
001	00.70.00	Praveen		2024-07-11		#3854 First version.
002 00.70.01	Usha M		2025-02-20 		#4297 In enableLotOrLocation function, txtTransferQty is made empty.
003	01.00.00	Bas van B	2025-02-25		#4253 Translate MD.
004	01.01.00	Fayaz A		2025-05-28		#5008 Localization key update to refer from FT runtime locale file.
005	01.02.00	Praveen  	2025-02-26		#5081 Change the quantity control from a textbox to a numeric input.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.IM = window.IM || {};
	IM.Transfer = IM.Transfer || {};
	IM.Transfer = Transfer();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function Transfer() {
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
			_controls.nrQty = FORM.Control.findByXmlNode("NRQT");
			_controls.nrTransferQty = FORM.Control.findByXmlNode("NRTQY");
			_controls.txLot = FORM.Control.findByXmlNode("TXLT");
			_controls.txSublot = FORM.Control.findByXmlNode("TXSLT");
			_controls.ddDestination = FORM.Control.findByXmlNode("DDDT");
			_controls.txComments = FORM.Control.findByXmlNode("TXCMT");
			_controls.numToEntId = FORM.Control.findByXmlNode("nrDED");
			_controls.numFromEntId = FORM.Control.findByXmlNode("NREID");
			_controls.numLotOrLocation = FORM.Control.findByXmlNode("NRSL");
			_controls.numRowId = FORM.Control.findByXmlNode("NRRID");
			_controls.hfItemId = FORM.Control.findByXmlNode("HFIT");
			_controls.lblUOM = FORM.Control.findByXmlNode("LBUOM");
			_controls.lblTransferUOM = FORM.Control.findByXmlNode("LBTUM");

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
				ddDestinationLocationLoad();
			} catch (exception) {
				handleScriptError(exception);
			}
		}
		/**
		 * Loads the list of item reason and populates the dropdown control
		 *  with the retrieved data.
		 * @returns {Object|null} The retrieved item reason data, or null if the request fails.
		 */
		function ddDestinationLocationLoad() {
			parameterColl = {};
			FT.WebApi.mesGetAsync("api/Entity", "", parameterColl, false).then(
				(data) => {
					// Handle successful response data
					let destinationLocations = [];
					if (data && data.length > 0) {
						destinationLocations = data.filter((dd) => dd.canStore === true);
						// Translate the data
						const fields = [
							FT.Ui.translationColumnField("entDescription", FT.Ui.TRANSLATION_GROUPS.grpEntDescription, ["entName"]),
						];
						destinationLocations = FT.Ui.translateArray(destinationLocations, fields);
					}
					FT.WorkTasks.controlOptionsSetFromDataset("DDDT", 0, destinationLocations, "entDescription", "entID");
				},
				(error) => {
					// Handle error
					throw new Error("Error:", error);
				},
			);
		}
		/**
		 *  Function to load inventory data based on the itemInv context for transfer processing
		 */
		function loadInventoryData() {
			const inventoryContext = FT.WorkTasks.contextGet(FORM.Control, "itemInv");
			if (inventoryContext && inventoryContext.length > 0) {
				_controls.txLocation.value = inventoryContext[0].jsonValue.description;
				_controls.txItemId.value = inventoryContext[0].jsonValue.item_desc;
				_controls.nrQty.value = inventoryContext[0].jsonValue.qty_left;
				_controls.nrTransferQty.value = 0;
				_controls.txLot.value = inventoryContext[0].jsonValue.lot_no;
				_controls.txSublot.value = inventoryContext[0].jsonValue.sublot_no;
				_controls.lblUOM.value = inventoryContext[0].jsonValue.item_inv_uom_description;
				_controls.lblTransferUOM.value = inventoryContext[0].jsonValue.item_inv_uom_description;
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
		 *Function to check if Lot or Location is mandatory based on the given value
		 * Returns true if the value is "1", otherwise false.
		 */
		function MandatoryLotOrLocation(rbLotOrLocation) {
			return rbLotOrLocation === "1";
		}
		/**
		 * Function to enable or disable controls related to Lot or Location selection
		 * If rbLotOrLocation is "1", enables transfer quantity control and loads inventory data.
		 * Otherwise, clears specific fields and disables the transfer quantity control.
		 */
		function enableLotOrLocation(rbLotOrLocation) {
			if (rbLotOrLocation === "1") {
				_controls.nrTransferQty.enable = true;
				loadInventoryData();
			} else {
				_controls.txItemId.value = "";
				_controls.nrQty.value = "";
				_controls.txSublot.value = "";
				_controls.txLot.value = "";
				_controls.nrTransferQty.value = "";
				_controls.nrTransferQty.enable = false;
			}
		}
		/**
		 * Prepares data and sets control values before executing the workflow.
		 */
		function iwTransferInventoryOnPreWorkflow() {
			if (FORM.Control.validateForm() === true) {
				const inventoryContext = FT.WorkTasks.contextGet(FORM.Control, "itemInv");
				if (_controls.rbLotOrLocation.value === "1") {
					if (!(_controls.nrTransferQty.value > 0)) {
						SFU.showError(
							skelta.localize.getString("@@IM_RecvSplitQuantityErr@@"),
							skelta.localize.getString("@@IM_RecvSplitQuantityErrDetails@@"),
							null,
							null,
						);
						return false;
					}

					if (inventoryContext && inventoryContext.length > 0) {
						_controls.numFromEntId.value = inventoryContext[0].jsonValue.ent_id;
						_controls.numToEntId.value = _controls.ddDestination.value;
						_controls.numLotOrLocation.value = _controls.rbLotOrLocation.value;
						_controls.numRowId.value = inventoryContext[0].jsonValue.row_id_h;
						_controls.hfItemId.value = inventoryContext[0].jsonValue.item_id;
					}
					return true; // Explicit return if condition is met
				}
				if (inventoryContext && inventoryContext.length > 0) {
					_controls.numFromEntId.value = inventoryContext[0].jsonValue.ent_id;
					_controls.numToEntId.value = _controls.ddDestination.value;
					_controls.numLotOrLocation.value = _controls.rbLotOrLocation.value;
					_controls.numRowId.value = inventoryContext[0].jsonValue.row_id_h;
					_controls.hfItemId.value = inventoryContext[0].jsonValue.item_id;
				}
				return true; // Return false if condition is not met
			}
			return false;
		}

		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwTransferInventoryOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"im",
					"im.itemInv.transfer",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"IM_UI_Transfer",
					"im.itemInv.transfer",
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
			iwTransferInventoryOnPreWorkflow: iwTransferInventoryOnPreWorkflow,
			iwTransferInventoryOnPostWorkflow: iwTransferInventoryOnPostWorkflow,
		};
	}
})(window);
