/*
Name:        	IM_UI_Reclassify.js
Description: 	IM_UI_Reclassify js file containing global logic pertaining to the IM_UI_Reclassify Form.

Ver		Release	By		    Date				Change Description
001		00.70  	Praveen		2024-06-11	#3856 First version.
002		01.00		Bas van B	2025-02-25	#4253 Translate MD.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.IM = window.IM || {};
	IM.Reclassify = IM.Reclassify || {};
	IM.Reclassify = Reclassify();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function Reclassify() {
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
			_controls.txLot = FORM.Control.findByXmlNode("TXLT");
			_controls.dtExpiryDate = FORM.Control.findByXmlNode("DTED");
			_controls.txSublot = FORM.Control.findByXmlNode("TXSLT");
			_controls.ddItemGrade = FORM.Control.findByXmlNode("DDIG");
			_controls.ddItemState = FORM.Control.findByXmlNode("DDIS");
			_controls.numEntId = FORM.Control.findByXmlNode("NREID");
			_controls.numLotOrLocation = FORM.Control.findByXmlNode("NRSL");
			_controls.hfItemId = FORM.Control.findByXmlNode("HFIT");
			_controls.numRowId = FORM.Control.findByXmlNode("NRRID");
			_controls.lblUOM = FORM.Control.findByXmlNode("LBUOM");

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
				ddItemGradeLoad();
				ddItemStateLoad();
			} catch (exception) {
				handleScriptError(exception);
			}
		}
		/**
		 * Loads the list of item grades and populates the dropdown control.
		 */
		function ddItemGradeLoad() {
			const parameterColl = {};
			FT.WebApi.mesGetAsync("api/ItemGrade", "", parameterColl, false).then(
				(data) => {
					// Handle successful response data
					let strOptions = [];
					if (data && data.length > 0) {
						// Translate the grade descriptions
						const fields = [
							FT.Ui.translationColumnField(
								"item_grade_desc",
								FT.Ui.TRANSLATION_GROUPS.grpItemGradeItemGradeDesc,
								FT.Ui.TRANSLATION_KEYS.keyItemGrade,
							),
						];
						strOptions = FT.Ui.translateArray(data, fields);
					}
					FT.WorkTasks.controlOptionsSetFromDataset("DDIG", 0, strOptions, "item_grade_desc", "item_grade_cd");
				},
				(error) => {
					// Handle error
					throw new Error("Error:", error);
				},
			);
		}
		/**
		 * Loads the list of item reason and populates the dropdown control
		 *  with the retrieved data.
		 * @returns {Object|null} The retrieved item reason data, or null if the request fails.
		 */
		function ddItemStateLoad() {
			const parameterColl = {};
			FT.WebApi.mesGetAsync("api/ItemState", "", parameterColl, false).then(
				(data) => {
					// Handle successful response data
					let strOptions = [];
					if (data && data.length > 0) {
						// Translate teh status descriptions
						const fields = [
							FT.Ui.translationColumnField(
								"item_status_desc",
								FT.Ui.TRANSLATION_GROUPS.grpItemStateItemStatusDesc,
								FT.Ui.TRANSLATION_KEYS.keyItemState,
							),
						];
						strOptions = FT.Ui.translateArray(data, fields);
					}
					FT.WorkTasks.controlOptionsSetFromDataset("DDIS", 0, strOptions, "item_status_desc", "item_status_cd");
				},
				(error) => {
					// Handle error
					throw new Error("Error:", error);
				},
			);
		}
		/**
		 * Loads the inventory data of the selected record fom the user context.
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
				_controls.dtExpiryDate.value = FT.WorkTasks.dateTimeInStringFormat(
					_controls.dtExpiryDate,
					inventoryContext[0].jsonValue.expiry_date_utc,
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
		function enableLotOrLocation(rbLotOrLocation) {
			if (rbLotOrLocation === "1") {
				_controls.nrQty.enable = true;
				loadInventoryData();
			} else {
				_controls.txItemId.value = "";
				_controls.nrQty.value = "";
				_controls.txLot.value = "";
				_controls.txSublot.value = "";
				_controls.nrQty.value = "";
				_controls.nrQty.enable = false;
			}
		}
		/**
		 * Prepares data and sets control values before executing the workflow.
		 */
		function iwReclassifyInventoryOnPreWorkflow() {
			if (FORM.Control.validateForm() === true) {
				const inventoryContext = FT.WorkTasks.contextGet(FORM.Control, "itemInv");
				if (inventoryContext && inventoryContext.length > 0) {
					_controls.numEntId.value = inventoryContext[0].jsonValue.ent_id;
					_controls.numLotOrLocation.value = _controls.rbLotOrLocation.value;
					_controls.hfItemId.value = inventoryContext[0].jsonValue.item_id;
					_controls.numRowId.value = inventoryContext[0].jsonValue.row_id_h;
				}
				return true;
			}
			return false;
		}

		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwReclassifyInventoryOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"im",
					"im.itemInv.reclassify",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"IM_UI_Reclassify",
					"im.itemInv.reclassify",
				);
			}
		}
		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			loadInventoryData: loadInventoryData,
			iwReclassifyInventoryOnPreWorkflow: iwReclassifyInventoryOnPreWorkflow,
			iwReclassifyInventoryOnPostWorkflow: iwReclassifyInventoryOnPostWorkflow,
			ddItemGradeLoad: ddItemGradeLoad,
			ddItemStateLoad: ddItemStateLoad,
			enableLotOrLocation: enableLotOrLocation,
		};
	}
})(window);
