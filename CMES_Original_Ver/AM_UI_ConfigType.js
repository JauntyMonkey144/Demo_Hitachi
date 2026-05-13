/*
Name:        	AM_UI_ConfigType.js
Description: 	AM_UI_ConfigType js file containing the logic for changing the andon type.

Ver			Release	  By						Date				Change Description
001   	00.70.00  Praveen			  2024-08-29	#3133 First version.
002			01.00.00	Bas van B			2025-02-26	#4253 Translate MD in form.
003	 		01.01.00 	Fayaz A				2025-05-28	#5008 Localization key update to refer from FT runtime locale file.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.AM = window.AM || {};
	AM.ConfigType = AM.ConfigType || {};
	AM.ConfigType = ConfigType();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function ConfigType() {
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const LIST_JS = ["js/MES/FT_Common.js", "js/MES/AM_Common.js"];
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
			_controls.wwAndonLogList = FORM.Control.findByXmlNode("WWAL");
			_controls.ddAndonType = FORM.Control.findByXmlNode("DDTY");
			_controls.ddAndonIssue = FORM.Control.findByXmlNode("DDIS");
			_controls.txAndonType = FORM.Control.findByXmlNode("TXTY");
			_controls.txAndonIssue = FORM.Control.findByXmlNode("TXIS");
			_controls.fbChangeType = FORM.Control.findByXmlNode("FBCT");
			_controls.panelMain = FORM.Control.findByXmlNode("PFMN");
			_controls.panelSub = FORM.Control.findByXmlNode("PFSB");
			_controls.txAndonID = FORM.Control.findByXmlNode("TXLD");
			_controls.txComments = FORM.Control.findByXmlNode("TXCM");

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
				const eventDataContext = FT.WorkTasks.contextGet(FORM.Control, "eventData");
				if (eventDataContext && eventDataContext.length > 0) {
					const jsonValueObj = JSON.parse(eventDataContext[0].jsonValue);
					if (jsonValueObj !== null) {
						_controls.txAndonType.value = jsonValueObj.type_desc;
						_controls.txAndonIssue.value = jsonValueObj.issue_desc;
						_controls.txAndonID.value = jsonValueObj.andon_id;
						_controls.txComments.value = jsonValueObj.comments;
						wwAndonLogLoad(jsonValueObj.andon_id);
						_controls.fbChangeType.visible = true;
						_controls.panelMain.visible = true;
						_controls.panelSub.visible = false;
					}
				}
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
		 * Get type data for displaying it on the dropdown control
		 * @param {} null
		 * @returns {JSON} data
		 */
		function ddTypeLoad() {
			try {
				const parameterCollection = {};
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_AM_Andon_Type", parameterCollection, false).then(
					(data) => {
						FT.WorkTasks.controlOptionsSetFromDataset("DDTY", 0, data, "char_desc", "type_id");
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
		 * Get state details for displaying it on the dropdown control
		 * @param {integer} type_id
		 * @returns {JSON} data
		 */
		function ddStateLoad() {
			try {
				const parameterCollection = { type_id: _controls.ddAndonType.value };
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_S_AM_Andon_Issue", parameterCollection, false).then(
					(data) => {
						FT.WorkTasks.controlOptionsSetFromDataset("DDIS", 0, data, "issue_desc", "issue_id");
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
		 * Get andon log details for displaying it on the widget
		 * @param {string}  andonid
		 * @returns {JSON} data
		 */
		function wwAndonLogLoad(andonid) {
			const parameterColl = { andon_id: andonid };
			const spName = "SP_SA_AM_Andon_Log_History";
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", spName, parameterColl, false).then(
				(data) => {
					// Handle successful response data
					// Translate the status
					const fields = [FT.Ui.translationColumnField("State", FT.Ui.TRANSLATION_GROUPS.grpAmAndonStateStateDesc, ["State"])];
					const translatedData = FT.Ui.translateArray(data, fields);
					_controls.wwAndonLogList.widgetProperties.data = JSON.stringify(translatedData);
				},
				(error) => {
					// Handle error
					throw Error("Error:", error);
				},
			);
		}
		/**
		 * dropdown type on selection change for displaying it on the state widget
		 * @returns
		 */
		function ddTypeOnDataChange() {
			ddStateLoad();
		}
		/**
		 * button should be visible based on the state of the event data.
		 */
		function visibleFButton() {
			const eventDataContext = FT.WorkTasks.contextGet(FORM.Control, "eventData");
			if (eventDataContext && eventDataContext.length > 0) {
				const jsonValueObj = JSON.parse(eventDataContext[0].jsonValue);
				if (jsonValueObj !== null && jsonValueObj.state_desc.toLowerCase() === AM.Common.MES_ANDON_STATE_DESC.new.toLowerCase()) {
					return true;
				}
			}
			return false;
		}
		/**
		 * Handles changes in data to update the UI and trigger further actions.
		 * 1. Hides the main panel by setting its `visible` property to `false`.
		 * 2. Shows the sub panel by setting its `visible` property to `true`.
		 * 3. Calls the `ddTypeLoad` function to presumably load or update type-related data or UI elements.
		 */
		function fbChangeTypeOnDataChange() {
			_controls.panelMain.visible = false;
			_controls.panelSub.visible = true;
			ddTypeLoad();
		}
		/**
		 * This function is triggered when there is a change in form data. It first validates the form
		 * to ensure that all fields are correct. If the form is valid, it collects data from various
		 * form controls and submits it to an API to update the Andon log issue. After the submission,
		 * it dispatches an event to update the system and shows a success alert. If the API request fails,
		 * it catches and handles the error.
		 *
		 * @function
		 * @returns {boolean} Returns `true` if the form is valid and the data is successfully submitted,
		 *                    otherwise returns `false`.
		 */
		function fbChangeOnDataChange() {
			if (FORM.Control.validateForm() === true) {
				const userInfo = FT.WorkTasks.userInfo();
				mesUserId = userInfo.MESUserId !== undefined ? userInfo.MESUserId.replace(/\\/g, "\\\\") : null;
				const parameterCollection = {
					issue_id: _controls.ddAndonIssue.value,
					andon_id: _controls.txAndonID.value,
					comments: _controls.txComments.value,
					last_edit_by: mesUserId,
				};
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "SP_U_AM_Andon_Log_Issue", parameterCollection, false).then(
					() => {
						FT.Common.windowEventDispatch(
							"am",
							"am.andon.update",
							FT.Common.EVENT_SOURCE_TYPE.form,
							"AM_UI_ConfigType",
							"am.andon.update",
						);
					},

					(error) => {
						// Handle error
						throw error("Error:", error);
					},
				);
				return true;
			}
			return false;
		}
		/**
		 * Handles changes in data to update the UI and trigger further actions.
		 * 1. Hides the main panel by setting its `visible` property to `true`.
		 * 2. Shows the sub panel by setting its `visible` property to `false`.
		 */
		function fbCancelOnDataChange() {
			_controls.panelMain.visible = true;
			_controls.panelSub.visible = false;
		}
		return {
			initializeForm: initializeForm,
			wwAndonLogLoad: wwAndonLogLoad,
			ddTypeLoad: ddTypeLoad,
			ddTypeOnDataChange: ddTypeOnDataChange,
			visibleFButton: visibleFButton,
			fbChangeTypeOnDataChange: fbChangeTypeOnDataChange,
			ddStateLoad: ddStateLoad,
			fbChangeOnDataChange: fbChangeOnDataChange,
			fbCancelOnDataChange: fbCancelOnDataChange,
		};
	}
})(window);
