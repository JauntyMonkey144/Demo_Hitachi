/*
Name:        	QM_UI_CharacteristicEdit.js
Description: 	QM_UI_CharacteristicEdit js file containing global logic pertaining to the QM_UI_CharacteristicEdit Form.

Ver		Release			By						Date						Change Description
001		00.70				Kishna M		  2024-11-08			#3845 First version.
002		01.00				Bas van B			2025-03-04			#4253 Translated MD in UOM dropdown and char_desc.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.QM = window.QM || {};
	QM.CharacteristicEdit = QM.CharacteristicEdit || {};
	QM.CharacteristicEdit = CharacteristicEdit();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function CharacteristicEdit() {
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
			_controls.ddCatalog = FORM.Control.findByXmlNode("DDCTID");
			_controls.ddDefaultChart = FORM.Control.findByXmlNode("DDCHT");
			_controls.ddUOM = FORM.Control.findByXmlNode("DDUM");
			_controls.ddSampleSize = FORM.Control.findByXmlNode("NBSPL");
			_controls.nmDecimal = FORM.Control.findByXmlNode("NBDEC");
			_controls.nmSampleSize = FORM.Control.findByXmlNode("NBSPL");
			_controls.hfCatalogText = FORM.Control.findByXmlNode("HFCAT");
			_controls.hfType = FORM.Control.findByXmlNode("HFT");
			_controls.hfCharId = FORM.Control.findByXmlNode("HFCD");

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
				const applicationName = skelta.userContext.getUserContextFor("appN");
				const parentFormId = window.parent.skelta.userContext.getUserContextFor("itemId");
				const parentFormVersion = window.parent.skelta.userContext.getUserContextFor("vStamp");
				const parentFormUniqueKey = skelta.forms.utilities.getFormUniqueKey(applicationName, parentFormId, parentFormVersion);
				const parentViewModelObject = window.parent["viewModelObject_" + parentFormUniqueKey];
				const CHAR_ID = parentViewModelObject.findByXmlNode("HFRID").value;

				parameterColl = { char_id: CHAR_ID, char_name: null };
				const spName = "sp_S_QM_Characteristic";
				let characteristicDetails;
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", spName, parameterColl, false).then(
					(data) => {
						// Handle successful response data
						characteristicDetails = data;
						_controls.txCharName.value = characteristicDetails[0].char_name;
						_controls.ddType.value = characteristicDetails[0].type_desc;
						_controls.txCharDescName.value = FT.Ui.translateValue(
							FT.Ui.TRANSLATION_GROUPS.grpCharacteristicCharDesc,
							characteristicDetails[0][FT.Ui.TRANSLATION_KEYS.keyCharacteristic],
							characteristicDetails[0].char_desc,
						);
						_controls.ddSevirity.value = characteristicDetails[0].severity_cd;
						_controls.ddCatalog.value = characteristicDetails[0].catalog;
						_controls.ddDefaultChart.value = characteristicDetails[0].default_chart;
						_controls.ddUOM.value = characteristicDetails[0].uom_id;
						_controls.ddSampleSize.value = characteristicDetails[0].normal_sample_size;
						_controls.nmDecimal.value = characteristicDetails[0].num_decimals;
						_controls.nmSampleSize.value = characteristicDetails[0].normal_sample_size;
						_controls.hfType.value = characteristicDetails[0].catalog;
						_controls.hfCharId.value = characteristicDetails[0].char_id;
						if (characteristicDetails[0].type_desc === FT.Common.MES_CHARACTERISTIC_TYPE.catalog) {
							_controls.ddType.enable = false;
							_controls.ddUOM.enable = false;
							_controls.nmSampleSize.enable = false;
							_controls.nmDecimal.visible = false;
						}
						if (characteristicDetails[0].type_desc === FT.Common.MES_CHARACTERISTIC_TYPE.binary) {
							_controls.ddCatalog.visible = false;
							_controls.nmDecimal.visible = false;
							_controls.ddType.enable = false;
							_controls.ddUOM.enable = false;
						}
						if (characteristicDetails[0].type_desc === FT.Common.MES_CHARACTERISTIC_TYPE.variable) {
							_controls.ddCatalog.visible = false;
							_controls.ddType.enable = false;
							_controls.ddUOM.enable = false;
							_controls.nmDecimal.visible = true;
							_controls.nmSampleSize.enable = true;
						}
					},
					(error) => {
						// Handle error
						throw new Error("Error:", error);
					},
				);
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
		 * Get char types details for displaying it on dropdown control
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
		 * Get Catalog details for displaying it on dropdown control
		 * @param null
		 * @returns {JSON} data
		 */
		function ddLoadCatalog() {
			try {
				const parameterCollection = {};
				const spName = "sp_SA_QM_Catalog";
				const catalogItems = FT.WebApi.mesGetSync("api/V3/DirectAccess", spName, parameterCollection, false);
				FT.WorkTasks.controlOptionsSetFromDataset("DDCTID", 0, catalogItems, "name", "catalog_id");
			} catch (exception) {
				handleScriptError(exception);
			}
		}

		/**
		 *get QM severity
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
		 *get QM charts
		 * @param {*} char_Type_Id
		 */
		function getCharts(charType) {
			const parameterCollection = { char_type: charType };
			const utilLogData = FT.WebApi.mesGetSync("api/V3/DirectAccess", "sp_SA_QM_Charts", parameterCollection, false);
			if (utilLogData.length > 0) {
				FT.WorkTasks.controlOptionsSetFromDataset("DDCHT", 0, utilLogData, "name", "chart_id");
			}
		}

		/**
		 *Load UOM data
		 */
		function ddLoadUOM() {
			const parameterCollection = {};
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_UOM", parameterCollection, false).then(
				(data) => {
					// Translate the uoms
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
			_controls.ddCatalog.visible = false;
			_controls.nmDecimal.visible = false;
			_controls.hfType.value = _controls.ddType.value;
			if (selectedCharValue === FT.Common.MES_CHARACTERISTIC_TYPE.catalog) {
				_controls.ddCatalog.visible = true; // Dropdown Catalog
				_controls.nmSampleSize.enable = false;
				_controls.hfCatalogText.value = "CATALOG";
				_controls.hfType.value = 0;
			} else if (selectedCharValue === FT.Common.MES_CHARACTERISTIC_TYPE.variable) {
				_controls.nmDecimal.visible = true;
				_controls.nmSampleSize.enable = true;
			} else if (selectedCharValue === FT.Common.MES_CHARACTERISTIC_TYPE.date) {
				_controls.nmSampleSize.enable = false;
			} else if (selectedCharValue === FT.Common.MES_CHARACTERISTIC_TYPE.text) {
				_controls.nmSampleSize.enable = false;
			} else if (selectedCharValue === FT.Common.MES_CHARACTERISTIC_TYPE.binary) {
				_controls.nmSampleSize.enable = true;
			} else if (selectedCharValue === FT.Common.MES_CHARACTERISTIC_TYPE.counted) {
				_controls.nmSampleSize.enable = true;
			}
			getCharts(selectedCharValue);
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwEditCharacteristicOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"qm",
					"qm.characteristic.edit",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"QM_UI_CharacteristicEdit",
					"qm.characteristic.edit",
				);
			}
		}
		return {
			initializeForm: initializeForm,
			ddLoadCatalog: ddLoadCatalog,
			ddLoadSeverity: ddLoadSeverity,
			ddLoadUOM: ddLoadUOM,
			ddChatTypeOnDataChange: ddChatTypeOnDataChange,
			iwEditCharacteristicOnPostWorkflow: iwEditCharacteristicOnPostWorkflow,
		};
	}
})(window);
