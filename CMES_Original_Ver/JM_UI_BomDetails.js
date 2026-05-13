/*
Name:        	JM_UI_BomDetails.js
Description: 	JM_UI_BomDetails js file containing global logic pertaining to the JM_UI_BomDetails Form.

Ver	 	Release	By						Date					Change Description
001		00.50  	Shamanth S	 	2024-08-19		#3328 First version.
002		01.00		Bas van B			2025-02-21		#4253 Translate the BOM details data.
*/
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.JM = window.JM || {};
	JM.BomDetails = JM.BomDetails || {};
	JM.BomDetails = BomDetails();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function BomDetails() {
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
			_controls.wwBomDetails = FORM.Control.findByXmlNode("WWBD");

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
			let parameterColl;
			// get context value of BOM & setValue to grid
			const bomContext = FT.WorkTasks.contextGet(FORM.Control, "jobBom");
			if (bomContext && bomContext.length > 0) {
				// fetch BOM details from API
				parameterColl = {
					wo_id: bomContext[0].woId,
					oper_id: bomContext[0].operId !== undefined ? bomContext[0].operId : null,
					seq_no: bomContext[0].seqNo !== undefined ? bomContext[0].seqNo : null,
				};
				FT.WebApi.mesGetAsync("api/v3/DirectAccess", "sp_SA_Job_Bom_GetJobBomData", parameterColl, false).then(
					(data) => {
						if (data) {
							// Translate the data
							const fields = [
								FT.Ui.translationColumnField(
									"description",
									FT.Ui.TRANSLATION_GROUPS.grpUomDescription,
									FT.Ui.TRANSLATION_KEYS.keyUom,
								),
								FT.Ui.translationColumnField(
									"ent_name",
									FT.Ui.TRANSLATION_GROUPS.grpEntDescription,
									FT.Ui.TRANSLATION_KEYS.keyEnt,
								),
								FT.Ui.translationColumnField(
									"item_desc",
									FT.Ui.TRANSLATION_GROUPS.grpItemItemDesc,
									FT.Ui.TRANSLATION_KEYS.keyItem,
								),
								FT.Ui.translationColumnField(
									"item_grade_desc",
									FT.Ui.TRANSLATION_GROUPS.grpItemGradeItemGradeDesc,
									FT.Ui.TRANSLATION_KEYS.keyItemGrade,
								),
								FT.Ui.translationColumnField(
									"reas_desc",
									FT.Ui.TRANSLATION_GROUPS.grpItemReasReasDesc,
									FT.Ui.TRANSLATION_KEYS.keyItemReas,
								),
								FT.Ui.translationField("instruction", FT.Ui.TRANSLATION_GROUPS.grpBomItemInstruction, [
									{ type: "value", value: bomContext.parentItemId },
									{ type: "value", value: bomContext.bomVerId },
									{ type: "column", value: "item_id" },
								]),
							];
							const translatedData = FT.Ui.translateArray(data, fields);

							// Pass the translated data to the table
							_controls.wwBomDetails.widgetProperties.data = JSON.stringify(translatedData);
						}
					},
					(error) => {
						// Handle error
						throw new Error("Error:", error);
					},
				);
			}
		}

		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
		};
	}
})(window);
