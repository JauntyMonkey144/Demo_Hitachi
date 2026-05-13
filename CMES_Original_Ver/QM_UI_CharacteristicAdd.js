/*
Name:        	QM_UI_CharacteristicAdd.js
Description: 	QM_UI_CharacteristicAdd js file containing global logic pertaining to the QM_UI_CharacteristicAdd Form.

Ver 	Release			By						Date					Change Description
001		00.70				Kishna M		  2024-11-08		#3845 First version.
002		01.00				Bas van B			2025-03-04		#4253 Translate UOM descriptions.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.QM = window.QM || {};
	QM.CharacteristicAdd = QM.CharacteristicAdd || {};
	QM.CharacteristicAdd = CharacteristicAdd();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function CharacteristicAdd() {
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
		let errorMessage;
		// ----------------------------------------------------------------------------------
		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			// Initialize variables
			FORM.Control = Control;

			_controls.txCharName = FORM.Control.findByXmlNode("TXNM");
			_controls.ddType = FORM.Control.findByXmlNode("DDTYP");
			_controls.txCharDescName = FORM.Control.findByXmlNode("TXDES");
			_controls.ddSevirity = FORM.Control.findByXmlNode("DDSVR");
			_controls.ddCatelog = FORM.Control.findByXmlNode("DDCTID");
			_controls.ddDefaultChart = FORM.Control.findByXmlNode("DDCHT");
			_controls.ddUOM = FORM.Control.findByXmlNode("DDUM");
			_controls.nmDecimal = FORM.Control.findByXmlNode("NBDEC");
			_controls.nmSampleSize = FORM.Control.findByXmlNode("NBSPL");
			_controls.hfCatalogText = FORM.Control.findByXmlNode("HFCTT");
			_controls.hfType = FORM.Control.findByXmlNode("HFT");

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
			try {
				ddLoadCharType();
				ddLoadCatalog();
				ddLoadSeverity();
				ddLoadUOM();
				getCharts(null);
			} catch (exception) {
				handleScriptError(exception);
			}
		}

		/**
		 * @param {*} error
		 */
		function handleScriptError(error) {
			if (error instanceof TypeError) {
				errorMessage = skelta.localize.getString("@@QM_UnexpectedType@@");
			} else if (error instanceof ReferenceError) {
				errorMessage = skelta.localize.getString("@@QM_ReferenceError@@");
			} else {
				errorMessage = skelta.localize.getString("@@QM_DuringScriptExecution@@");
			}
			SFU.showError(skelta.localize.getString("FormNGFErrorRunningScript_title"), errorMessage, null, error.message);
		}

		/**
		 * Get char types to display
		 * @param null
		 * @returns {JSON} data
		 */
		function ddLoadCharType() {
			try {
				const parameterCollection = {};
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_QM_Char_Type", parameterCollection, false).then(
					(data) => {
						FT.WorkTasks.controlOptionsSetFromDataset("DDTYP", 0, data, "type_desc", "type_id");
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
		 * Get Catalog details for displaying
		 * @param null
		 * @returns {JSON} data
		 */
		function ddLoadCatalog() {
			try {
				const parameterCollection = {};
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_QM_Catalog", parameterCollection, false).then(
					(data) => {
						FT.WorkTasks.controlOptionsSetFromDataset("DDCTID", 0, data, "name", "catalog_id");
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
		 *get QM severity details
		 */
		function ddLoadSeverity() {
			const parameterCollection = {};
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_QM_Char_Severity", parameterCollection, false).then(
				(data) => {
					FT.WorkTasks.controlOptionsSetFromDataset("DDSVR", 0, data, "name", "severity_cd");
				},
				(error) => {
					// Handle error
					throw error("Error:", error);
				},
			);
		}

		/**
		 *get QM chart data
		 * @param {*} char_Type_Id
		 */
		function getCharts(charType) {
			const parameterCollection = { char_type: charType };
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_QM_Charts", parameterCollection, false).then(
				(data) => {
					FT.WorkTasks.controlOptionsSetFromDataset("DDCHT", 0, data, "name", "chart_id");
				},
				(error) => {
					// Handle error
					throw error("Error:", error);
				},
			);
		}

		/**
		 *get UOM data
		 */
		function ddLoadUOM() {
			const parameterCollection = {};
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_UOM", parameterCollection, false).then(
				(data) => {
					// Translate teh UOM description
					const fields = [
						FT.Ui.translationColumnField(
							"description",
							FT.Ui.TRANSLATION_GROUPS.grpUomDescription,
							FT.Ui.TRANSLATION_KEYS.keyUom,
						),
					];
					const translatedData = FT.Ui.translateArray(data, fields);
					FT.WorkTasks.controlOptionsSetFromDataset("DDUM", 0, translatedData, "description", "uom_id");
				},
				(error) => {
					// Handle error
					throw error("Error:", error);
				},
			);
		}
		/**
		 *set contol visibility/disable based on char type
		 * @param {*} selectedCharValue
		 */
		function ddChatTypeOnDataChange(selectedCharValue) {
			_controls.ddCatelog.visible = false;
			_controls.nmDecimal.visible = false;
			_controls.nmSampleSize.value = 1;
			_controls.hfType.value = _controls.ddType.value;
			const charType = parseInt(selectedCharValue, 10);
			if (charType === FT.Common.MES_CHARACTERISTIC_TYPE.catalog) {
				_controls.ddCatelog.visible = true; // Dropdown Catalog
				_controls.nmSampleSize.enable = false;
				_controls.hfCatalogText.value = "CATALOG";
				_controls.hfType.value = 0;
			} else if (charType === FT.Common.MES_CHARACTERISTIC_TYPE.variable) {
				_controls.nmDecimal.visible = true;
				_controls.nmSampleSize.enable = true;
			} else if (charType === FT.Common.MES_CHARACTERISTIC_TYPE.date) {
				_controls.nmSampleSize.enable = false;
			} else if (charType === FT.Common.MES_CHARACTERISTIC_TYPE.text) {
				_controls.nmSampleSize.enable = false;
			} else if (charType === FT.Common.MES_CHARACTERISTIC_TYPE.binary) {
				_controls.nmSampleSize.enable = true;
			} else if (charType === FT.Common.MES_CHARACTERISTIC_TYPE.counted) {
				_controls.nmSampleSize.enable = true;
			}
			getCharts(charType);
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwAddCharacteristicOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"qm",
					"qm.characteristic.add",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"QM_UI_CharacteristicAdd",
					"qm.characteristic.add",
				);
			}
		}
		return {
			initializeForm: initializeForm,
			ddLoadCatalog: ddLoadCatalog,
			ddLoadSeverity: ddLoadSeverity,
			ddLoadUOM: ddLoadUOM,
			ddChatTypeOnDataChange: ddChatTypeOnDataChange,
			iwAddCharacteristicOnPostWorkflow: iwAddCharacteristicOnPostWorkflow,
		};
	}
})(window);
