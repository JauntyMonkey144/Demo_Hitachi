/*
Name:        	PE_UI_ProdRateAdd.js
Description: 	PE_UI_ProdRateAdd js file containing global logic pertaining to the PE_UI_ProdRateAdd Form.

Ver		By					Date					Change Description
001		Ramesh V		2024-06-20	  #2917 First version.
002		Bas van B		2025-02-27		#4253 Translate MD.
*/
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.PE = window.PE || {};
	PE.ProdRateAdd = PE.ProdRateAdd || {};
	PE.ProdRateAdd = ProdRateAdd();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function ProdRateAdd() {
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;
		const _controls = {};
		// ----------------------------------------------------------------------------------

		// ----------------------------- Private Variables ----------------------------------

		// ----------------------------------------------------------------------------------
		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			// Initialize variables
			FORM.Control = Control;
			_controls.ddEntity = FORM.Control.findByXmlNode("DDENT");
			_controls.ddItem = FORM.Control.findByXmlNode("DDITEM");
			_controls.nrProdRate = FORM.Control.findByXmlNode("NRPR");
			_controls.ddUOM = FORM.Control.findByXmlNode("DDUOM");
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
			ddEntityListLoad();
			ddItemListLoad();
			ddUomListLoad();
		}
		/**
		 * Loads the list of entities that can run jobs and populates the dropdown control
		 *  with the retrieved data.
		 * @returns {Object|null} The retrieved entity data, or null if the request fails.
		 */
		function ddEntityListLoad() {
			const parameterColl = { canRunJobs: true };
			let entityData = null;
			FT.WebApi.mesGetAsync("api/V3/Entity", "", parameterColl, false).then(
				(data) => {
					// Handle successful response data
					// Translate the entity descriptions
					const fields = [
						FT.Ui.translationColumnField(
							"description",
							FT.Ui.TRANSLATION_GROUPS.grpEntDescription,
							FT.Ui.TRANSLATION_KEYS.keyEnt,
						),
					];
					entityData = FT.Ui.translateArray(data, fields);
					FT.WorkTasks.controlOptionsSetFromDataset("DDENT", 0, entityData, "description", "ent_id");
				},
				(error) => {
					// Handle error
					throw new Error("Error:", error);
				},
			);
		}
		/**
		 * Loads the list of items and populates the
		 * dropdown control with the retrieved data. T
		 */
		function ddItemListLoad() {
			const parameterColl = {};
			FT.WebApi.mesGetAsync("api/V3/Item", "", parameterColl, false).then(
				(data) => {
					// Handle successful response data
					// Tranalste the item descriptions
					const fields = [
						FT.Ui.translationColumnField("item_desc", FT.Ui.TRANSLATION_GROUPS.grpItemItemDesc, FT.Ui.TRANSLATION_KEYS.keyItem),
					];
					const translatedData = FT.Ui.translateArray(data, fields);
					FT.WorkTasks.controlOptionsSetFromDataset("DDITEM", 0, translatedData, "item_desc", "item_id");
				},
				(error) => {
					// Handle error
					throw new Error("Error:", error);
				},
			);
		}
		/**
		 * Loads the list of Units of Measure (UOM)  and populates the
		 * dropdown control with the retrieved data.
		 */
		function ddUomListLoad() {
			// Get language Id from translation object
			const parameterColl = { lang_id: null };
			const spName = "sp_S_PE_Prod_Rate_UOMList";
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", spName, parameterColl, false).then(
				(data) => {
					// Handle successful response data
					// Translate the uom description
					const fields = [
						FT.Ui.translationColumnField("prod_uom_desc", FT.Ui.TRANSLATION_GROUPS.grpUomDescription, ["prod_uom_desc"]),
					];
					const translatedData = FT.Ui.translateArray(data, fields);
					FT.WorkTasks.controlOptionsSetFromDataset("DDUOM", 0, translatedData, "prod_uom_desc", "prod_uom");
				},
				(error) => {
					// Handle error
					throw new Error("Error:", error);
				},
			);
		}
		/**
		 * Prepares data and sets control values before executing the workflow.
		 */
		function iwAddProductRateOnPreWorkflow() {
			if (FORM.Control.validateForm() !== true) {
				return false;
			}
			return true;
		}

		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwAddProductRateOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"pe",
					"pe.prodRate.add",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"PE_UI_ProdRateAdd",
					"pe.prodRate.add",
				);
			}
		}

		return {
			initializeForm: initializeForm,
			iwAddProductRateOnPostWorkflow: iwAddProductRateOnPostWorkflow,
			iwAddProductRateOnPreWorkflow: iwAddProductRateOnPreWorkflow,
		};
	}
})(window);
