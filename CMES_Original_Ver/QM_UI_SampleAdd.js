/*
Name:        	QM_UI_SampleAdd.js
Description: 	QM_UI_SampleAdd js file containing global logic pertaining to the QM_UI_SampleAdd Form.


Ver		Release			By						Date					Change Description
001		00.70.00		Shamanth S	 	2024-09-18		#3611 First version.
002		01.00.00		Bas van B			2025-03-03		#4253 Translate MD.
003		01.00.00		Praveen   		2025-03-26		#4640 function loadEntity changes ent_name.
004   01.01.00		Somya S				2025-05-02		#4888 Wo Autopopulated when present in Context.

*/
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.QM = window.QM || {};
	QM.SampleAdd = QM.SampleAdd || {};
	QM.SampleAdd = SampleAdd();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function SampleAdd() {
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
			_controls.dtDateTime = FORM.Control.findByXmlNode("DTT");
			_controls.ddEntity = FORM.Control.findByXmlNode("DDENT");
			_controls.ddQmSpec = FORM.Control.findByXmlNode("DDQS");
			_controls.hfEntName = FORM.Control.findByXmlNode("HFEN");
			_controls.hfQmSpec = FORM.Control.findByXmlNode("HFQMS");
			_controls.txWo = FORM.Control.findByXmlNode("TXWO");
			_controls.lbFormTitle = FORM.Control.findByXmlNode("LBFTTL");

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
			_controls.lbFormTitle.value =
				skelta.localize.getString("@@QM_Create@@") + " " + skelta.localize.getString("@@QM_formtitle@@");
			_controls.dtDateTime.value = FT.WorkTasks.dateTimeInStringFormat(_controls.dtDateTime, Date.now());
			loadQmSpec();
			loadEntity();
			loadItems();
		}
		/**
		 * Loads the list of qm specifications and populates the dropdown control with the retrieved data.
		 * @returns {Object|null} The retrieved process data, or null if the request fails.
		 */
		function loadQmSpec() {
			parameterColl = {};
			FT.WebApi.mesGetAsync("api/v3/QMSpec", "", parameterColl, false).then(
				(data) => {
					// Handle successful response data
					// Translate the data
					const fields = [
						FT.Ui.translationColumnField(
							"ent_desc",
							FT.Ui.TRANSLATION_GROUPS.grpEntDescription,
							FT.Ui.TRANSLATION_KEYS.keyEnt,
							"ent_name",
						),
						FT.Ui.translationColumnField(
							"item_category_desc",
							FT.Ui.TRANSLATION_GROUPS.grpCategoryCategoryDesc,
							FT.Ui.TRANSLATION_KEYS.keyCategory,
							"item_category_name",
						),
						FT.Ui.translationColumnField("item_desc", FT.Ui.TRANSLATION_GROUPS.grpItemItemDesc, FT.Ui.TRANSLATION_KEYS.keyItem),
						FT.Ui.translationColumnField(
							"oper_desc",
							FT.Ui.TRANSLATION_GROUPS.grpOperOperDesc,
							FT.Ui.TRANSLATION_KEYS.keyOper,
							"oper_id",
						),
						FT.Ui.translationColumnField(
							"qm_spec_desc",
							FT.Ui.TRANSLATION_GROUPS.grpQmSpecQmSpecDesc,
							FT.Ui.TRANSLATION_KEYS.keyQmSpec,
						),
					];
					const translatedData = FT.Ui.translateArray(data, fields);
					FT.WorkTasks.controlOptionsSetFromDataset("DDQS", 0, translatedData, "qm_spec_name", "qm_spec_id");
				},
				(error) => {
					// Handle error
					throw new Error("Error:", error);
				},
			);
		}
		/**
		 * Loads the list of Lines and populates the dropdown control with the retrieved data.
		 * @returns {Object|null} The retrieved lines data, or null if the request fails.
		 */
		function loadEntity() {
			parameterColl = { canCaptureQmData: true };
			FT.WebApi.mesGetAsync("api/V3/Entity/filter", "", parameterColl, false).then(
				(data) => {
					// Handle successful response data
					// Translate the data
					const fields = [
						FT.Ui.translationColumnField(
							"description",
							FT.Ui.TRANSLATION_GROUPS.grpEntDescription,
							FT.Ui.TRANSLATION_KEYS.keyEnt,
						),
					];
					const translatedData = FT.Ui.translateArray(data, fields);
					FT.WorkTasks.controlOptionsSetFromDataset("DDENT", 0, translatedData, "ent_name", "ent_id");
				},
				(error) => {
					// Handle error
					throw new Error("Error:", error);
				},
			);
		}
		/**
		 * Loads the list of item and populates the dropdown control
		 *  with the retrieved data.
		 * @returns {Object|null} The retrieved Items data, or null if the request fails.
		 */
		function loadItems() {
			if (_controls.txWo.value != null) {
				const [selectedCard] = FT.WorkTasks.contextGet(FORM.Control, "eventData") || [];
				[dataJson] = selectedCard.jsonValue !== null ? JSON.parse(selectedCard.jsonValue) : [];
				const dataN = dataJson;
				if (typeof dataN !== "undefined") {
					_controls.txWo.value = dataN.woId;
				}
			}
			FT.WebApi.mesGetAsync("api/V3/Item", "", parameterColl, false).then(
				(data) => {
					// Handle successful response data
					// Translate the data
					const fields = [
						FT.Ui.translationColumnField("item_desc", FT.Ui.TRANSLATION_GROUPS.grpItemItemDesc, FT.Ui.TRANSLATION_KEYS.keyItem),
					];
					const translatedData = FT.Ui.translateArray(data, fields);
					FT.WorkTasks.controlOptionsSetFromDataset("DDITM", 0, translatedData, "item_desc", "item_id");
				},
				(error) => {
					// Handle error
					throw new Error("Error:", error);
				},
			);
		}
		/**
		 * Enable datetime control based on the radio button click.
		 * @param selectedType {string} The type selected from the radio button.
		 */
		function rbCreateTimeChange(selectedType) {
			if (selectedType === "1") {
				_controls.dtDateTime.enable = true;
			} else {
				_controls.dtDateTime.enable = false;
			}
		}
		/**
		 * Loads the entity name to hidden field from the dropdown.
		 */
		function onEntitySelectionChange() {
			_controls.hfEntName.value = _controls.ddEntity.displayValue;
		}
		/**
		 * Loads the qm spec name to hidden field from the dropdown.
		 */
		function onQmSpecSelectionChange() {
			_controls.hfQmSpec.value = _controls.ddQmSpec.displayValue;
		}
		/**
		 * To allow only current or a past date time to be entered
		 *  * @param {DateTime} selectedDateTime
		 */
		function validateCreateDateTime(selectedDateTime) {
			const currentDtUtc = SFU.getDateTimeInServerUTCFormat(new Date()); // Get current UTC time
			const strCurrentDt = SFU.getDateTimeInStringFormat(
				currentDtUtc,
				skelta.forms.constants.dateFormats.dateTimeFormatForCoreValue,
			);

			if (selectedDateTime > strCurrentDt) {
				return new ValidationOptions(false, skelta.localize.getString("@@QM_DateTimeValidationMsg@@"));
			}

			return new ValidationOptions(true, "");
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwCreateQualityOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"qm",
					"qm.sample.sampleadd",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"QM_UI_SampleAdd",
					"qm.sample.sampleadd",
				);
			}
		}
		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			onEntitySelectionChange: onEntitySelectionChange,
			rbCreateTimeChange: rbCreateTimeChange,
			onQmSpecSelectionChange: onQmSpecSelectionChange,
			validateCreateDateTime: validateCreateDateTime,
			iwCreateQualityOnPostWorkflow: iwCreateQualityOnPostWorkflow,
		};
	}
})(window);
