/*
Name:        	AM_UI_Details.js
Description: 	AM_UI_Details js file containing logic pertaining to load andon history and also this is the area where logged in user
							can update the andon status.

Ver     	Release			By						Date				Change Description
001     	00.70		    Ramesh				2024-08-26	#3130 First version.
002				01.00				Bas van B			2025-02-26	#4253 Translate MD in form.
*/
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.AM = window.AM || {};
	AM.Details = AM.Details || {};
	AM.Details = Details();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function Details() {
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const LIST_JS = ["js/MES/FT_Common.js", "js/MES/AM_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;

		// ----------------------------- Private Variables ----------------------------------
		const _controls = {};
		// ----------------------------------------------------------------------------------
		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			// Initialize variables
			FORM.Control = Control;
			_controls.txAndonId = FORM.Control.findByXmlNode("TXAD");
			_controls.txAndonType = FORM.Control.findByXmlNode("TXAT");
			_controls.txStatus = FORM.Control.findByXmlNode("TXS");
			_controls.txLocation = FORM.Control.findByXmlNode("TXL");
			_controls.txIssue = FORM.Control.findByXmlNode("TXI");
			_controls.ddUser = FORM.Control.findByXmlNode("DDU");
			_controls.hfLogId = FORM.Control.findByXmlNode("HFLID");
			_controls.hfStateCode = FORM.Control.findByXmlNode("HFSC");
			_controls.iwAndonLog = FORM.Control.findByXmlNode("IWAL");
			_controls.fbAcknowledged = FORM.Control.findByXmlNode("FBACK");
			_controls.fbResolved = FORM.Control.findByXmlNode("FBRES");
			_controls.fbNotResolved = FORM.Control.findByXmlNode("FBNRES");
			_controls.wwAndonLogHistory = FORM.Control.findByXmlNode("WWAD");
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
		 * Display andon details from the session object
		 */
		function onFormLoad() {
			const eventDataContext = FT.WorkTasks.contextGet(FORM.Control, "eventData");
			if (eventDataContext && eventDataContext.length > 0) {
				const jsonValueObj = JSON.parse(eventDataContext[0].jsonValue);
				if (jsonValueObj !== null) {
					_controls.txAndonId.value = jsonValueObj[0].andon_id;
					_controls.txAndonType.value = jsonValueObj[0].type_desc;
					_controls.txLocation.value = jsonValueObj[0].ent_name;
					_controls.txIssue.value = jsonValueObj[0].issue_desc;
					_controls.txStatus.value = jsonValueObj[0].state_desc;
					if (jsonValueObj[0].flag.toLowerCase() === "y") {
						if (jsonValueObj[0].state_desc.toLowerCase() === AM.Common.MES_ANDON_STATE_DESC.acknowledged.toLowerCase()) {
							_controls.fbAcknowledged.visible = false;
							_controls.fbResolved.visible = true;
							_controls.fbNotResolved.visible = true;
						}
						if (
							jsonValueObj[0].state_desc.toLowerCase() === AM.Common.MES_ANDON_STATE_DESC.notResolved.toLowerCase() ||
							jsonValueObj[0].state_desc.toLowerCase() === AM.Common.MES_ANDON_STATE_DESC.new.toLowerCase()
						) {
							_controls.fbAcknowledged.visible = true;
							_controls.fbResolved.visible = false;
							_controls.fbNotResolved.visible = false;
						}
					} else {
						_controls.fbAcknowledged.visible = false;
						_controls.fbResolved.visible = false;
						_controls.fbNotResolved.visible = false;
					}
					wwAndonLogHistoryLoad(jsonValueObj[0].andon_id);
				}
			}
		}
		/**
		 * Function to load andon log history details and assign data to grid widget
		 */
		function wwAndonLogHistoryLoad(andonid) {
			parameterColl = { andon_id: andonid };
			const spName = "SP_SA_AM_Andon_Log_History";
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", spName, parameterColl, false).then(
				(data) => {
					// Handle successful response data
					// Translate the status
					const fields = [FT.Ui.translationColumnField("State", FT.Ui.TRANSLATION_GROUPS.grpAmAndonStateStateDesc, ["State"])];
					const translatedData = FT.Ui.translateArray(data, fields);
					_controls.wwAndonLogHistory.widgetProperties.data = JSON.stringify(translatedData);
				},
				(error) => {
					// Handle error
					throw Error("Error:", error);
				},
			);
		}
		/**
		 * This function handles the action when an acknowledgment button is clicked in the Andon system.
		 * It updates the state code and invokes a related workflow.
		 */
		function fbAcknowledgeClick() {
			// Set the state code to "2" indicating an acknowledgment
			_controls.hfStateCode.value = AM.Common.MES_ANDON_STATE_ID.acknowledged;

			// Invoke the workflow associated with the Andon log
			SFU.invokeWorkflow(_controls.iwAndonLog);
		}
		/**
		 * This function handles the action when an resolved button is clicked in the Andon system.
		 * It updates the state code and invokes a related workflow.
		 */
		function fbResolveClick() {
			// Set the state code to "3" indicating the issue has been resolved
			_controls.hfStateCode.value = AM.Common.MES_ANDON_STATE_ID.resolved;

			// Invoke the workflow associated with the Andon log
			SFU.invokeWorkflow(_controls.iwAndonLog);
		}
		/**
		 * This function handles the action when an notResolved button is clicked in the Andon system.
		 * It updates the state code and invokes a related workflow.
		 */
		function fbNotResolveClick() {
			// Set the state code to "4" indicating the issue could not be resolved
			_controls.hfStateCode.value = AM.Common.MES_ANDON_STATE_ID.notResolved;

			// Invoke the workflow associated with the Andon log
			SFU.invokeWorkflow(_controls.iwAndonLog);
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
		 * Prepares data and sets control values before executing the workflow.
		 */
		function iwAndonUpdateOnPreWorkflow() {
			const userInfo = FT.WorkTasks.userInfo();
			mesUserId = userInfo.MESUserId !== undefined ? userInfo.MESUserId.replace(/\\/g, "\\\\") : null;
			_controls.hfMesUser.value = mesUserId;
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwAndonUpdateOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"am",
					"am.andon.update",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"AM_UI_Details",
					"am.andon.update",
				);
			}
		}
		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			fbAcknowledgeClick: fbAcknowledgeClick,
			fbResolveClick: fbResolveClick,
			fbNotResolveClick: fbNotResolveClick,
			iwAndonUpdateOnPreWorkflow: iwAndonUpdateOnPreWorkflow,
			iwAndonUpdateOnPostWorkflow: iwAndonUpdateOnPostWorkflow,
		};
	}
})(window);
