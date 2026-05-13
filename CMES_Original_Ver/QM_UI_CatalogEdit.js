/*
Name:        	QM_UI_CatalogEdit.js
Description: 	QM_UI_CatalogEdit js file containing global logic pertaining to the QM_UI_CatalogEdit Form.

Ver		Release			By						Date				Change Description
001		00.70				Shamanth S	  2024-10-28	#3845 First version.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.QM = window.QM || {};
	QM.CatalogEdit = QM.CatalogEdit || {};
	QM.CatalogEdit = CatalogEdit();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function CatalogEdit() {
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
			_controls.ddCatalog = FORM.Control.findByXmlNode("DDCTL");
			_controls.txName = FORM.Control.findByXmlNode("TXNM");
			_controls.nbValue = FORM.Control.findByXmlNode("NBVL");
			_controls.wwCatalogOption = FORM.Control.findByXmlNode("WWCOP");

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
				ddLoadCatalog();
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
		 * Get Catalog details for displaying it on the dropdown control
		 * @param null
		 * @returns {JSON} data
		 */
		function ddLoadCatalog() {
			try {
				const parameterCollection = {};
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_QM_Catalog", parameterCollection, false).then(
					(data) => {
						FT.WorkTasks.controlOptionsSetFromDataset("DDCTL", 0, data, "description", "catalog_id");
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
		 * dropdown catalog on data change event
		 * @returns
		 */
		function ddCatalogOnDataChange() {
			wwLoadCatalogOption();
		}
		/**
		 * Get andon Type details for displaying it on the widget
		 * @param null
		 * @returns {JSON} data
		 */
		function wwLoadCatalogOption() {
			try {
				const parameterCollection = { catalog_id: _controls.ddCatalog.value };
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_QM_Catalog_Option", parameterCollection, false).then(
					(data) => {
						_controls.wwCatalogOption.widgetProperties.data = JSON.stringify(data);
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
		 * dropdown catalog on data change event
		 * @returns
		 */
		function reLoadData() {
			_controls.txName.value = "";
			_controls.nbValue.value = "";
			wwLoadCatalogOption();
		}
		/**
		 * update Catalog_Option data
		 * @param {string} modifiedData
		 * @param {string} selectedRow
		 */
		function wwUpdateCatalog(modifiedData, selectedRow) {
			const parameterCollection = {
				catalog_id: selectedRow.catalog_id,
				name: selectedRow.name,
				value: selectedRow.value,
				option_id: selectedRow.option_id,
			};
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_U_QM_Catalog_Option", parameterCollection, false).then(
				() => {
					wwLoadCatalogOption();
				},
				(error) => {
					// Handle error
					throw error("Error:", error);
				},
			);
		}
		/**
		 * deleting Catalog_Option data based on the catalog_id and option_id
		 * @param {string} modifiedData
		 * @param {string} selectedRow
		 */
		function wwDeleteCatalog(modifiedData, selectedRow) {
			const parameterCollection = {
				catalog_id: selectedRow.catalog_id,
				option_id: selectedRow.option_id,
			};
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_D_QM_Catalog_Option", parameterCollection, false).then(
				() => {
					wwLoadCatalogOption();
				},
				(error) => {
					// Handle error
					throw error("Error:", error);
				},
			);
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwCatalogEditOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			reLoadData();
		}
		return {
			initializeForm: initializeForm,
			wwLoadCatalogOption: wwLoadCatalogOption,
			ddLoadCatalog: ddLoadCatalog,
			ddCatalogOnDataChange: ddCatalogOnDataChange,
			wwDeleteCatalog: wwDeleteCatalog,
			wwUpdateCatalog: wwUpdateCatalog,
			reLoadData: reLoadData,
			iwCatalogEditOnPostWorkflow: iwCatalogEditOnPostWorkflow,
		};
	}
})(window);
