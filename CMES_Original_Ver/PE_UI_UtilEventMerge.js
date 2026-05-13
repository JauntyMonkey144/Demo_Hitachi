/*
Name:        	PE_UI_UtilEventMerge.js
Description: 	PE_UI_UtilEventMerge js file containing global logic pertaining to the PE_UI_UtilEventMerge form.

Ver		Release	 By				  Date				Change Description
001		00.50	   Praveen		2024-06-05	#2883 First version.
002		00.50    Praveen 	  2024-10-16	#3763 Remove all lookups and update with Web api calls.
003		01.00		 Bas van B	2025-02-27	#4253 Translate the state descriptions in the merge widget.
004		01.01.00 Praveen	  2025-05-26	#4882 Console Error.
005		01.01.00 Fayaz A		2025-05-28	#5008 Localization key update to refer from FT runtime locale file.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.PE = window.PE || {};
	PE.UtilEventMerge = PE.UtilEventMerge || {};
	PE.UtilEventMerge = UtilEventMerge();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function UtilEventMerge() {
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
			_controls.wwMergeWidget = FORM.Control.findByXmlNode("WWMR");
			_controls.wwNavbarWidget = FORM.Control.findByXmlNode("WWBNA");
			_controls.txEventTime = FORM.Control.findByXmlNode("TXMET");
			_controls.hfReasonPending = FORM.Control.findByXmlNode("HFRP");
			_controls.hfEntId = FORM.Control.findByXmlNode("HFEID");
			_controls.hfNewReasonCode = FORM.Control.findByXmlNode("HFNRC");
			_controls.dtEventTime = FORM.Control.findByXmlNode("DTET");
			_controls.txComment = FORM.Control.findByXmlNode("TXCMT");

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
		 * Form load function to bind cards with respect to entity from form parameters or if session variable EntID
		 */
		function onFormLoad() {
			try {
				_controls.wwNavbarWidget.widgetProperties.data =
					'[{"id": "1","description":"Merge Left"},{"id": "2","description":"Merge Right"}]';
				utilDetails();
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
		 * Get utilization event details for displaying it on the merge widget
		 * @param {integer} logid
		 * @returns {JSON} utilization data
		 */
		function utilDetails() {
			const eventDataContext = FT.WorkTasks.contextGet(FORM.Control, "eventData");
			const jsonValueObj = JSON.parse(eventDataContext[0].jsonValue);
			if (jsonValueObj !== null) {
				const parameterCollection = { logid: jsonValueObj[0].log_id };
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_S_PE_Util_Log_DetailsMerge", parameterCollection, false).then(
					(data) => {
						// Translate the state description
						const fields = [FT.Ui.translationColumnField("state", FT.Ui.TRANSLATION_GROUPS.grpUtilStateStateDesc, ["state"])];
						const translatedData = FT.Ui.translateArray(data, fields);
						_controls.wwMergeWidget.widgetProperties.data = JSON.stringify(translatedData);
						_controls.txEventTime.value = new Date(jsonValueObj[0].event_time_utc).toString("yyyy-MM-dd hh:mm:ss");
					},
					(error) => {
						// Handle error
						throw Error("Error:", error);
					},
				);
			}
		}

		/**
		 * Prepares data and sets control values before executing the workflow.
		 */
		function iwMergeUtilEventOnPreWorkflow() {
			if (FORM.Control.validateForm() === true) {
				const splitleft = _controls.wwNavbarWidget.value;
				const eventDataContext = FT.WorkTasks.contextGet(FORM.Control, "eventData");
				const jsonValueObj = JSON.parse(eventDataContext[0].jsonValue);
				_controls.hfEntId.value = jsonValueObj[0].ent_id;
				const [newReeasonCode, comment] = _controls.wwMergeWidget.widgetProperties.value5.split("|").map((item) => item.trim());
				_controls.txComment.value = comment === "null" ? null : comment || "";
				_controls.hfReasonPending.value = 0;
				_controls.dtEventTime.value = jsonValueObj[0].event_time_utc;
				if (splitleft === 1) {
					_controls.hfNewReasonCode.value = newReeasonCode || "";
				} else {
					_controls.hfNewReasonCode.value = newReeasonCode || "";
				}
				return true;
			}
			return false;
		}
		/**
		 * Performs actions after the execution of a workflow, involving split utility events.
		 */
		function iwMergeUtilEventOnPostWorkflow(blockingOutput, workflowStatus) {
			_controls.dtEventTime.value = "";
			_controls.txComment.value = "";
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"pe",
					"pe.utilHistory.merge",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"PE_UI_UtilReasMerge",
					"pe.utilHistory.merge",
				);
			}
		}
		/**
		 * Updates the value of the Merge Widget property with the value from the Navbar Widget.
		 */
		function wwNavbarWidgetOnClick() {
			_controls.wwMergeWidget.widgetProperties.value2 = _controls.wwNavbarWidget.value;
		}
		/**
		 * Checks the value of EventTime and determines whether to enable a button.
		 */
		function enableIWButton() {
			if (_controls.txEventTime.value === "") {
				return false;
			}
			return true;
		}
		return {
			initializeForm: initializeForm,
			utilDetails: utilDetails,
			iwMergeUtilEventOnPreWorkflow: iwMergeUtilEventOnPreWorkflow,
			iwMergeUtilEventOnPostWorkflow: iwMergeUtilEventOnPostWorkflow,
			wwNavbarWidgetOnClick: wwNavbarWidgetOnClick,
			enableIWButton: enableIWButton,
		};
	}
})(window);
