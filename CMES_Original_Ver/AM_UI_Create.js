/*
Name:        	AM_UI_Create.js
Description: 	Andon Create js file containing global logic pertaining to the AM_UI_Create Form.

Ver	 Release			By						Date				Change Description
001	 00.70		    Praveen			  2024-08-29	#3129 First version.
002	 01.01.00 		Fayaz A				2025-05-28	#5008 Localization key update to refer from FT runtime locale file.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.AM = window.AM || {};
	AM.Create = AM.Create || {};
	AM.Create = Create();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function Create() {
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
			_controls.wwAndonTypeWidget = FORM.Control.findByXmlNode("WWAT");
			_controls.ddLocations = FORM.Control.findByXmlNode("DDLT");
			_controls.txComment = FORM.Control.findByXmlNode("TXCMT");
			_controls.ddIssues = FORM.Control.findByXmlNode("DDIS");
			_controls.hfEntId = FORM.Control.findByXmlNode("HFEID");
			_controls.hfIssue = FORM.Control.findByXmlNode("HFIS");
			_controls.hfMesUser = FORM.Control.findByXmlNode("HFUS");

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
				wwAndonTypeLoad();
				ddLocationLoad();
			} catch (exception) {
				handleScriptError(exception);
			}
		}

		/**
		 * @param {*} error
		 */
		function handleScriptError(error) {
			let errorMessage;
			if (error instanceof TypeError) {
				errorMessage = skelta.localize.getString("@@FT_UnexpectedType@@");
			} else if (error instanceof ReferenceError) {
				errorMessage = skelta.localize.getString("@@FT_ReferenceError@@");
			} else {
				errorMessage = skelta.localize.getString("@@FT_DuringScriptExecution@@");
			}
			SFU.showError(skelta.localize.getString("FormNGFErrorRunningScript_title"), errorMessage, null, error.message);
		}

		/**
		 * Get Andon Type for displaying it on the widget
		 * @param null
		 * @returns {JSON} data
		 */
		function wwAndonTypeLoad() {
			try {
				const parameterCollection = {};
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_AM_Andon_Type", parameterCollection, false).then(
					(data) => {
						_controls.wwAndonTypeWidget.value = "";
						_controls.wwAndonTypeWidget.widgetProperties.data = JSON.stringify(data);
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
		 * Handles the click event for the WW Andon Type Widget.
		 * Loads location data using the `ddLocationLoad()` function.
		 * Loads issue data based on the current value of the WW Andon Type Widget using the `ddIssueLoad()` function.
		 */
		function wwAndonWidgetOnClick() {
			ddLocationLoad();
			ddIssueLoad(_controls.wwAndonTypeWidget.value);
		}
		/**
		 * Prepares data and sets control values before executing the workflow.
		 */
		function iwCreateAndonOnPreWorkflow() {
			if (FORM.Control.validateForm() === true) {
				const userInfo = FT.WorkTasks.userInfo();
				mesUserId = userInfo.MESUserId !== undefined ? userInfo.MESUserId.replace(/\\/g, "\\\\") : null;
				_controls.hfEntId.value = _controls.ddLocations.value;
				_controls.hfIssue.value = _controls.ddIssues.value;
				_controls.hfMesUser.value = mesUserId;
				return true;
			}
			return false;
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwCreateAndonOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);

			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully && blockingOutput === "") {
				FT.Common.windowEventDispatch("am", "am.andon.add", FT.Common.EVENT_SOURCE_TYPE.form, "AM_UI_Create", "am.andon.add");
			}
		}
		/**
		 * This function loads location data based on the entity ID and populates a dropdown control
		 * with the entity names and IDs retrieved from the backend API.
		 * @param {integer} ent_id
		 * @returns {JSON} data
		 */
		function ddLocationLoad() {
			try {
				const entContext = FT.WorkTasks.contextGet(FORM.Control, "ent");
				const parameterCollection = { ent_id: entContext[0].entId };
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "SP_SA_AM_Ent", parameterCollection, false).then(
					(data) => {
						FT.WorkTasks.controlOptionsSetFromDataset("DDLT", 0, data, "ent_name", "ent_id");
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
		 * This function loads Andon issue data based on the selected type_id and updates a dropdown control
		 * with the fetched dataset. It makes an asynchronous API call to retrieve the data and handles success or failure.
		 * @param {integer} type_id
		 * @returns {JSON} data
		 */
		function ddIssueLoad() {
			try {
				const parameterCollection = { type_id: _controls.wwAndonTypeWidget.value };
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "SP_SA_AM_Andon_Issue", parameterCollection, false).then(
					(data) => {
						FT.WorkTasks.controlOptionsSetFromDataset("DDIS", 0, data, "display", "id");
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
		return {
			initializeForm: initializeForm,
			wwAndonTypeLoad: wwAndonTypeLoad,
			iwCreateAndonOnPreWorkflow: iwCreateAndonOnPreWorkflow,
			iwCreateAndonOnPostWorkflow: iwCreateAndonOnPostWorkflow,
			ddLocationLoad: ddLocationLoad,
			ddIssueLoad: ddIssueLoad,
			wwAndonWidgetOnClick: wwAndonWidgetOnClick,
		};
	}
})(window);
