/*
Name:        	PE_UI_ProdRateEdit.js
Description: 	PE_UI_ProdRateEdit js file containing global logic pertaining to the PE_UI_ProdRateEdit Form.

Ver	 Release	By					Date					Change Description
001		        Ramesh V		2024-06-20	  #2919 First version.
002		        Bas van B		2025-02-27		#4253 Translate MD.
003	 01.01.00 Praveen   	2025-05-29		#4997 Rename the procedure name sp_SA_PE_Prod_Rate in the onFormLoad().
*/
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.PE = window.PE || {};
	PE.ProdRateEdit = PE.ProdRateEdit || {};
	PE.ProdRateEdit = ProdRateEdit();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function ProdRateEdit() {
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
			_controls.txEntity = FORM.Control.findByXmlNode("TXENT");
			_controls.txItem = FORM.Control.findByXmlNode("TXITEM");
			_controls.nrProdRate = FORM.Control.findByXmlNode("NRPR");
			_controls.ddUOM = FORM.Control.findByXmlNode("DDUOM");
			_controls.hfRowId = FORM.Control.findByXmlNode("HFRID");
			_controls.hfUOM = FORM.Control.findByXmlNode("HFUOM");
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
			ddUomListLoad();
			const applicationName = skelta.userContext.getUserContextFor("appN");
			const parentFormId = window.parent.skelta.userContext.getUserContextFor("itemId");
			const parentFormVersion = window.parent.skelta.userContext.getUserContextFor("vStamp");
			const parentFormUniqueKey = skelta.forms.utilities.getFormUniqueKey(applicationName, parentFormId, parentFormVersion);
			const parentViewModelObject = window.parent["viewModelObject_" + parentFormUniqueKey];
			const rowId = parentViewModelObject.findByXmlNode("HFRID").value;
			parameterColl = { row_id: rowId };
			const spName = "sp_SA_PE_Prod_Rate";

			FT.WebApi.mesGetAsync("api/V3/DirectAccess", spName, parameterColl, false).then(
				(data) => {
					// Handle successful response data
					if (data != null && data.length > 0) {
						// Translate the data
						const fields = [
							FT.Ui.translationColumnField("uom", FT.Ui.TRANSLATION_GROUPS.grpUomDescription, ["uom"]),
							FT.Ui.translationColumnField("ent_name", FT.Ui.TRANSLATION_GROUPS.grpEntDescription, FT.Ui.TRANSLATION_KEYS.keyEnt),
							FT.Ui.translationColumnField("item_id", FT.Ui.TRANSLATION_GROUPS.grpItemItemDesc, FT.Ui.TRANSLATION_KEYS.keyItem),
						];
						const prodRateDetails = FT.Ui.translateArray(data, fields);
						_controls.txEntity.value = prodRateDetails[0].ent_name;
						_controls.nrProdRate.value = prodRateDetails[0].est_prod_rate;
						_controls.txItem.value = prodRateDetails[0].item_id;
						_controls.ddUOM.value = prodRateDetails[0].prod_uom;
						_controls.hfRowId.value = prodRateDetails[0].row_id;
						_controls.hfUOM.value = prodRateDetails[0].prod_uom;
					}
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
			const parameterColl = {};
			const spName = "sp_S_PE_Prod_Rate_UOMList";
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", spName, parameterColl, false).then(
				(data) => {
					// Handle successful response data
					// Translate the data
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
		 * Updates the value of the unit of measure (UOM) text input control
		 * based on the selected UOM from a dropdown.
		 *
		 * @param {string} The UOM selected from the dropdown.
		 */
		function onUomSelectionChange(selectedUom) {
			_controls.hfUOM.value = selectedUom;
		}

		/**
		 * Prepares data and sets control values before executing the workflow.
		 */
		function iwEditProductRateOnPreWorkflow() {
			if (FORM.Control.validateForm() !== true) {
				return false;
			}
			return true;
		}

		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwEditProductRateOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"pe",
					"pe.prodRate.update",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"PE_UI_ProdRateAdd",
					"pe.prodRate.update",
				);
			}
		}

		return {
			initializeForm: initializeForm,
			onUomSelectionChange: onUomSelectionChange,
			iwEditProductRateOnPreWorkflow: iwEditProductRateOnPreWorkflow,
			iwEditProductRateOnPostWorkflow: iwEditProductRateOnPostWorkflow,
		};
	}
})(window);
