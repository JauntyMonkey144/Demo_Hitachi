/*
Name:        	IM_UI_Shipping.js
Description: 	IM_UI_Shipping js file containing global logic pertaining to the shipping inventory form.

Ver	Release	 		By		    Date				Change Description
001	01.00.00 	  Praveen		2025-03-24	#4573 First version.
002	01.01.00	  Praveen		2025-05-15	#4995 Set the max and min value to the Quantity control nrQty.
003	01.01.00 		Fayaz A		2025-05-28	#5008 Localization key update to refer from FT runtime locale file.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.IM = window.IM || {};
	IM.Shipping = IM.Shipping || {};
	IM.Shipping = Shipping();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function Shipping() {
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;

		// ----------------------------- Private Variables ----------------------------------
		const _controls = {};
		const itemReas = "Shipped";
		const goodsShipped = 1;
		const minValue = 1;
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
			_controls.txLot = FORM.Control.findByXmlNode("TXLT");
			_controls.txSublot = FORM.Control.findByXmlNode("TXSLT");
			_controls.txComments = FORM.Control.findByXmlNode("TXCMT");
			_controls.numEntId = FORM.Control.findByXmlNode("NREID");
			_controls.lblUOM = FORM.Control.findByXmlNode("LBUOM");
			_controls.hfItemId = FORM.Control.findByXmlNode("HFITD");
			_controls.hfReasCd = FORM.Control.findByXmlNode("HFRC");
			_controls.nrShipping = FORM.Control.findByXmlNode("NRGS");
			_controls.nrGrade = FORM.Control.findByXmlNode("NRGR");
			_controls.nrState = FORM.Control.findByXmlNode("NRST");
			_controls.iwShipping = FORM.Control.findByXmlNode("IWSH");

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
				getItemReas();
			} catch (exception) {
				handleScriptError(exception);
			}
		}
		/**
		 * Loads the item reason
		 */
		function getItemReas() {
			const parameterColl = {};
			FT.WebApi.mesGetAsync("api/itemReason", "", parameterColl, false).then(
				(data) => {
					if (data && data.length > 0) {
						_controls.hfReasCd.value = data.filter((dd) => dd.reas_desc === itemReas)[0].reas_cd;
					}
				},
				(error) => {
					// Handle error
					throw new Error("Error:", error);
				},
			);
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
		 * Loads the inventory details from the itemInv context and updates UI.
		 * Retrieves data stored in the FT.WorkTasks context under the key "itemInv" and maps
		 * it to specific form controls. Assumes the context contains a JSON structure with
		 * inventory item details.
		 */
		function loadInventoryData() {
			const inventoryContext = FT.WorkTasks.contextGet(FORM.Control, "itemInv");
			if (inventoryContext && inventoryContext.length > 0) {
				_controls.txLocation.value = inventoryContext[0].jsonValue.description;
				_controls.txItemId.value = inventoryContext[0].jsonValue.item_desc;
				_controls.hfItemId.value = inventoryContext[0].jsonValue.item_id;
				_controls.txLot.value = inventoryContext[0].jsonValue.lot_no;
				_controls.txSublot.value = inventoryContext[0].jsonValue.sublot_no;
				_controls.lblUOM.value = inventoryContext[0].jsonValue.item_inv_uom_description;
				_controls.nrQty.value = inventoryContext[0].jsonValue.qty_left;
				_controls.nrQty.max = inventoryContext[0].jsonValue.qty_left;
				_controls.nrQty.min = minValue;
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
		 * Prepares data and sets control values before executing the workflow.
		 */
		function iwShippingInventoryOnPreWorkflow() {
			if (FORM.Control.validateForm() === true) {
				const inventoryContext = FT.WorkTasks.contextGet(FORM.Control, "itemInv");
				if (inventoryContext && inventoryContext.length > 0) {
					_controls.numEntId.value = inventoryContext[0].jsonValue.ent_id;
					_controls.nrShipping.value = goodsShipped;
					_controls.nrGrade.value = inventoryContext[0].jsonValue.item_grade_cd;
					_controls.nrState.value = inventoryContext[0].jsonValue.item_status_cd;
					return true;
				}
				return false; // Return false if condition is not met
			}
			return false;
		}

		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwShippingInventoryOnPostWorkflow(blockingOutput, workflowStatus) {
			if (blockingOutput !== "" || workflowStatus !== FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			} else if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"im",
					"im.itemInv.shipping",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"IM_UI_Shipping",
					"im.itemInv.shipping",
				);
			}
		}
		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			loadInventoryData: loadInventoryData,
			iwShippingInventoryOnPreWorkflow: iwShippingInventoryOnPreWorkflow,
			iwShippingInventoryOnPostWorkflow: iwShippingInventoryOnPostWorkflow,
		};
	}
})(window);
