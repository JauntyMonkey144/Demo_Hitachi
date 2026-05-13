/*
Name:        	OM_UI_JobDetails.js
Description: 	OM_UI_JobDetails js file containing logic pertaining to the Jobs associated with the workorder.

Ver		By						Date				Change Description
001		Fayaz					2024-10-31	#2895 First version.
002		Bas						2025-02-21	#4253 Translate the job table.
003		Bas						2025-02-21	#4253 Removed typos in translation group definitions.
*/

// const { last } = require("prelude-ls");

((window) => {
	//  ------------------------------ Global Variables ------------------------------------
	window.OM = window.OM || {};
	OM.JobDetails = OM.JobDetails || {};
	OM.JobDetails = JobDetails();
	//  ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */

	function JobDetails() {
		//  ---------------------------- Constant Variables ----------------------------------
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;

		//  ----------------------------------------------------------------------------------

		//  ----------------------------- Private Variables ----------------------------------
		const _controls = {};
		let woId = "";

		//  ----------------------------------------------------------------------------------

		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			//  Initialize variables
			FORM.Control = Control;

			_controls.wwJobQueue = FORM.Control.findByXmlNode("WWJQ");

			//  Include js files
			includeJsFiles();

			//  Include js files via ajax
			includeJsFilesAjax();

			//  Include CSS files
			includeCssFiles();

			//  Add code here
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
		 * Form load function for the controls
		 */
		function onFormLoad() {
			isPageLoad = true;
			if (
				FORM.Control.formParameters.woId !== undefined &&
				FORM.Control.formParameters.woId.value != null &&
				FORM.Control.formParameters.woId.value !== ""
			) {
				woId = FORM.Control.formParameters.woId.value;
			} else {
				const woContext = FT.WorkTasks.contextGet(FORM.Control, "wo");
				woId = woContext[0].woId;
			}

			loadJobQueue(woId);
		}

		/**
		 * Function to load Job Queue for an wo and assign data to grid widget
		 */
		function loadJobQueue() {
			const parameterColl = {
				woId: woId,
			};
			FT.WebApi.mesGetAsync("api/v3/JobQueue", "", parameterColl, false).then(
				(data) => {
					// Handle successful response data
					if (data) {
						// Translate the data
						const fields = [
							FT.Ui.translationColumnField("Run_Ent_name", FT.Ui.TRANSLATION_GROUPS.grpEntDescription, ["Run_Ent_name"]),
							FT.Ui.translationColumnField("ent_name", FT.Ui.TRANSLATION_GROUPS.grpEntDescription, FT.Ui.TRANSLATION_KEYS.keyEnt),
							FT.Ui.translationColumnField(
								"item_class_desc",
								FT.Ui.TRANSLATION_GROUPS.grpItemClassItemClassDesc,
								FT.Ui.TRANSLATION_KEYS.keyItemClass,
							),
							FT.Ui.translationColumnField("item_desc", FT.Ui.TRANSLATION_GROUPS.grpItemItemDesc, FT.Ui.TRANSLATION_KEYS.keyItem),
							FT.Ui.translationColumnField("oper_desc", FT.Ui.TRANSLATION_GROUPS.grpOperOperDesc, FT.Ui.TRANSLATION_KEYS.keyOper),
							FT.Ui.translationColumnField(
								"oper_display",
								FT.Ui.TRANSLATION_GROUPS.grpOperOperDesc,
								FT.Ui.TRANSLATION_KEYS.keyOper,
							),
							FT.Ui.translationColumnField("state_desc_h", FT.Ui.TRANSLATION_GROUPS.grpJobStateStateDesc, ["state_desc_h"]),
							FT.Ui.translationColumnField("uom_description", FT.Ui.TRANSLATION_GROUPS.grpUomDescription, ["uom_description"]),
							FT.Ui.translationColumnField("wo_desc", FT.Ui.TRANSLATION_GROUPS.grpWoWoDesc, FT.Ui.TRANSLATION_KEYS.keyWo),
						];
						const translatedData = FT.Ui.translateArray(data, fields);
						_controls.wwJobQueue.widgetProperties.data = JSON.stringify(translatedData);
					}
				},
				(error) => {
					// Handle error
					throw new Error("Error:", error);
				},
			);
		}

		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
		};
	}
})(window);
