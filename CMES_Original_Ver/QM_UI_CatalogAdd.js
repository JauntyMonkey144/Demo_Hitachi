/*
Name:        	QM_UI_CatalogAdd.js
Description: 	QM_UI_CatalogAdd js file containing global logic pertaining to the QM_UI_CatalogAdd Form.

Ver		Release			By						Date				Change Description
001		00.70				Shamanth S	  2024-10-28	#3845 First version.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.QM = window.QM || {};
	QM.CatalogAdd = QM.CatalogAdd || {};
	QM.CatalogAdd = CatalogAdd();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function CatalogAdd() {
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
			_controls.txName = FORM.Control.findByXmlNode("TXNM");
			_controls.txDescription = FORM.Control.findByXmlNode("TXDES");
			_controls.wwCatalog = FORM.Control.findByXmlNode("WWCTL");

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
				wwLoadCatalog();
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
		 * Get andon Type details for displaying it on the widget
		 * @param null
		 * @returns {JSON} data
		 */
		function wwLoadCatalog() {
			try {
				const parameterCollection = {};
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_QM_Catalog", parameterCollection, false).then(
					(data) => {
						_controls.wwCatalog.widgetProperties.data = JSON.stringify(data);
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
		 * update catalog data
		 * @param {string} modifiedData
		 * @param {string} selectedRow
		 */
		function wwUpdateCatalog(modifiedData, selectedRow) {
			const parameterCollection = {
				catalog_id: selectedRow.catalog_id,
				name: selectedRow.name,
				description: selectedRow.description,
			};
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_U_QM_Catalog", parameterCollection, false).then(
				() => {
					wwLoadCatalog();
				},
				(error) => {
					// Handle error
					throw error("Error:", error);
				},
			);
		}
		/**
		 * deleting andon type record
		 * @param {string} modifiedData
		 * @param {string} selectedRow
		 */
		function wwDeleteCatalog(modifiedData, selectedRow) {
			const parameterCollection = {
				catalog_id: selectedRow.catalog_id,
			};
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_D_QM_Catalog", parameterCollection, false).then(
				() => {
					wwLoadCatalog();
				},
				(error) => {
					// Handle error
					SFU.showError(skelta.localize.getString("FormNGFErrorRunningScript_title"), null, null, error.responseText);
					wwLoadCatalog();
				},
			);
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwAddCatalogOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			wwLoadCatalog();
		}
		return {
			initializeForm: initializeForm,
			wwLoadCatalog: wwLoadCatalog,
			wwUpdateCatalog: wwUpdateCatalog,
			wwDeleteCatalog: wwDeleteCatalog,
			iwAddCatalogOnPostWorkflow: iwAddCatalogOnPostWorkflow,
		};
	}
})(window);
