/*
Name:        	IM_UI_Adjust.js
Description: 	IM_UI_Adjust js file containing global logic pertaining to the adjust inventory form.

Ver		Release			By		    Date				Change Description
001		00.70.00  	Praveen		2025-01-21	#4209 First version.
002		01.00.00		Bas van B	2025-02-25	#4253 Translate MD.
003	 	01.01.00 		Fayaz A		2025-05-28	#5008 Localization key update to refer from FT runtime locale file.
004		01.01.00		Praveen  	2025-05-31	#5022 Item reasons filter where reas_grp_type is either 3 or 0.
005	  01.02.00	  Praveen  	2025-02-26	#5081 Change the quantity control from a textbox to a numeric input.
006	  01.02.00	  Fayaz A  	2025-02-26	#5082 New quantity number field added as hidden and updated mapping in workflow.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.IM = window.IM || {};
	IM.Adjust = IM.Adjust || {};
	IM.Adjust = Adjust();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function Adjust() {
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
			_controls.txLocation = FORM.Control.findByXmlNode("TXLA");
			_controls.txItemId = FORM.Control.findByXmlNode("TXIT");
			_controls.nrQty = FORM.Control.findByXmlNode("NRQT");
			_controls.nrDifferenceQty = FORM.Control.findByXmlNode("NRDQY");
			_controls.nrNewQty = FORM.Control.findByXmlNode("NRNQT");
			_controls.txLot = FORM.Control.findByXmlNode("TXLT");
			_controls.txSublot = FORM.Control.findByXmlNode("TXSLT");
			_controls.ddReason = FORM.Control.findByXmlNode("DDRA");
			_controls.txComments = FORM.Control.findByXmlNode("TXCMT");
			_controls.numEntId = FORM.Control.findByXmlNode("NREID");
			_controls.numLotOrLocation = FORM.Control.findByXmlNode("NRSL");
			_controls.lblUOM = FORM.Control.findByXmlNode("LBUOM");
			_controls.lblReduceUOM = FORM.Control.findByXmlNode("LBSUM");
			_controls.nrNewQtyHidden = FORM.Control.findByXmlNode("NRNQH");
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
		 * Loads the list of item reason and populates the dropdown control.
		 */
		function ddItemReasListLoad() {
			const parameterColl = {};
			FT.WebApi.mesGetAsync("api/itemReason", "", parameterColl, false).then(
				(data) => {
					// Handle successful response data
					let reduceReasons = [];
					if (data && data.length > 0) {
						reduceReasons = data.filter((dd) => dd.reas_grp_type === 3 || dd.reas_grp_type === 0);
						// Translate the reduce reasons
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
						reduceReasons = FT.Ui.translateArray(
							reduceReasons.filter((item) => item.reas_desc !== "Shipped"),
							fields,
						);
					}
					FT.WorkTasks.controlOptionsSetFromDataset("DDRA", 0, reduceReasons, "reas_desc", "reas_cd");
				},
				(error) => {
					// Handle error
					throw new Error("Error:", error);
				},
			);
		}
		/**
		 * Loads the list of qm specifications and populates the dropdown control with the retrieved data.
		 * @returns {Object|null} The retrieved process data, or null if the request fails.
		 */
		function loadInventoryData() {
			const inventoryContext = FT.WorkTasks.contextGet(FORM.Control, "itemInv");
			if (inventoryContext && inventoryContext.length > 0) {
				_controls.txLocation.value = inventoryContext[0].jsonValue.description;
				_controls.txItemId.value = inventoryContext[0].jsonValue.item_desc;
				_controls.nrQty.value = inventoryContext[0].jsonValue.qty_left;
				_controls.txLot.value = inventoryContext[0].jsonValue.lot_no;
				_controls.txSublot.value = inventoryContext[0].jsonValue.sublot_no;
				_controls.lblUOM.value = inventoryContext[0].jsonValue.item_inv_uom_description;
				_controls.lblReduceUOM.value = inventoryContext[0].jsonValue.item_inv_uom_description;
				_controls.hfItemId.value = inventoryContext[0].jsonValue.item_id;
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
		 * Function to set Panel Z - index
		 */
		function MandatoryLotOrLocation(rbLotOrLocation) {
			return rbLotOrLocation === "1";
		}
		/**
		 * Prepares data and sets control values before executing the workflow.
		 */
		function iwAdjustInventoryOnPreWorkflow() {
			if (FORM.Control.validateForm() === true) {
				const inventoryContext = FT.WorkTasks.contextGet(FORM.Control, "itemInv");
				if (inventoryContext && inventoryContext.length > 0) {
					_controls.numEntId.value = inventoryContext[0].jsonValue.ent_id;
				}
				return true; // Explicit return if condition is met
			}
			return false;
		}

		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwAdjustInventoryOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"im",
					"im.itemInv.adjust",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"IM_UI_Adjust",
					"im.itemInv.adjust",
				);
			}
		}
		/**
		 * Calculates the difference between two quantities and updates control values.
		 */
		function quantityDifference(totalquantity, newquantity) {
			_controls.nrDifferenceQty.value = newquantity - totalquantity;
			_controls.nrNewQtyHidden.value = -_controls.nrDifferenceQty.value;
			return _controls.nrDifferenceQty.value;
		}

		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			loadInventoryData: loadInventoryData,
			MandatoryLotOrLocation: MandatoryLotOrLocation,
			iwAdjustInventoryOnPreWorkflow: iwAdjustInventoryOnPreWorkflow,
			iwAdjustInventoryOnPostWorkflow: iwAdjustInventoryOnPostWorkflow,
			quantityDifference: quantityDifference,
		};
	}
})(window);
