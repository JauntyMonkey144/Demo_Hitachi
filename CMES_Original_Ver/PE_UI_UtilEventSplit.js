/*
Name:        	PE_UI_UtilEventSplit.js
Description: 	PE_UI_UtilEventSplit js file containing global logic pertaining to the PE_UI_UtilEventSplit Form.

Ver		Release	  By				Date				Change Description
001		00.50	    Praveen		2024-06-05	#2868 First version.
002		00.50	    Praveen 	2024-10-16	#3763 Remove all lookups and update with Web api calls.
003		00.70	    Praveen 	2024-12-05  #3988 Event split must only be allowed if the event duration is greater than 1 second.
004		01.00		  Bas van B	2025-02-27	#4253 Translate MD in splitter widget.
005		01.01.00  Praveen	  2025-05-26	#4882 Console Error.
006		01.01.00  Fayaz A		2025-05-28	#5008 Localization key update to refer from FT runtime locale file.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.PE = window.PE || {};
	PE.UtilEventSplit = PE.UtilEventSplit || {};
	PE.UtilEventSplit = UtilEventSplit();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function UtilEventSplit() {
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
		let getEventTimeUTC = null;
		// ----------------------------------------------------------------------------------
		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			// Initialize variables
			FORM.Control = Control;
			_controls.wwSplitWidget = FORM.Control.findByXmlNode("WWST");
			_controls.wwNavbarWidget = FORM.Control.findByXmlNode("WWBNA");
			_controls.txEventTime = FORM.Control.findByXmlNode("TXET");
			_controls.txFirstPart = FORM.Control.findByXmlNode("TXFP");
			_controls.txSecondPart = FORM.Control.findByXmlNode("TXSP");
			_controls.txComment = FORM.Control.findByXmlNode("TXCMT");
			_controls.hfRawReasCode = FORM.Control.findByXmlNode("HFRRC");
			_controls.hfEntId = FORM.Control.findByXmlNode("HFEID");
			_controls.hfNewReasCode = FORM.Control.findByXmlNode("HFNRC");
			_controls.hflogid = FORM.Control.findByXmlNode("HFLID");
			_controls.dtTargetStartTime = FORM.Control.findByXmlNode("DTST");
			_controls.dtTargetEndtTime = FORM.Control.findByXmlNode("DTET");
			_controls.blReasPending = FORM.Control.findByXmlNode("BLRP");
			_controls.iwButton = FORM.Control.findByXmlNode("IWST");
			_controls.fbLeft = FORM.Control.findByXmlNode("FBL");
			_controls.fbright = FORM.Control.findByXmlNode("FBR");

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
					'[{"id": "1","description":"Split Left"},{"id": "2","description":"Split Right"}]';
				_controls.wwNavbarWidget.widgetProperties.selectedValue = 2;
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
			throw errorMessage;
		}

		/**
		 * Get utilization event details for displaying it on the split widget
		 * @param {integer} logid
		 * @returns {JSON} utilization data
		 */
		function utilDetails() {
			const eventDataContext = FT.WorkTasks.contextGet(FORM.Control, "eventData");
			const jsonValueObj = JSON.parse(eventDataContext[0].jsonValue);
			if (jsonValueObj !== null) {
				const parameterCollection = {
					log_id: jsonValueObj[0].log_id,
				};
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_S_PE_Util_LogDetails", parameterCollection, false).then(
					(data) => {
						const fields = [
							FT.Ui.translationColumnField("headerText", FT.Ui.TRANSLATION_GROUPS.grpUtilStateStateDesc, ["headerText"]),
						];
						const translatedData = FT.Ui.translateArray(data, fields);
						_controls.wwSplitWidget.widgetProperties.data = JSON.stringify(translatedData);
					},
					(error) => {
						// Handle error
						throw Error("Error:", error);
					},
				);
			}
		}
		/**
		 *Retrieves values from a Split Widget and assigns them to corresponding controls
		 */
		function getUtilSplit() {
			const [firstPart, secondPart, eventTime, eventTimeUTC] = _controls.wwSplitWidget.value
				.split("|")
				.map((item) => item.trim());
			_controls.txFirstPart.value = firstPart || "";
			_controls.txSecondPart.value = secondPart || "";
			_controls.txEventTime.value = eventTime || "";
			getEventTimeUTC = eventTimeUTC || "";
		}
		/**
		 * Updates the value of the Split Widget property with the value from the Navbar Widget.
		 */
		function wwNavbarWidgetOnClick() {
			_controls.wwSplitWidget.widgetProperties.select = _controls.wwNavbarWidget.value;
		}
		/**
		 *On data change event for the Increase Button and sets a property in the Split Widget to indicate an increase action.
		 */
		function fbButtonIncreaseOnClick() {
			_controls.wwSplitWidget.widgetProperties.inc = 1;
		}
		/**
		 *On data change event for the Decrease Button and sets a property in the Split Widget to indicate an decrease action.
		 */
		function fbButtonDecreaseOnClick() {
			_controls.wwSplitWidget.widgetProperties.dec = 1;
		}

		/**
		 * Prepares data and sets control values before executing the workflow.
		 */
		function iwSplitUtilEventOnPreWorkflow() {
			if (FORM.Control.validateForm() === true) {
				const splitleft = _controls.wwNavbarWidget.value;
				const eventDataContext = FT.WorkTasks.contextGet(FORM.Control, "eventData");
				const jsonValueObj = JSON.parse(eventDataContext[0].jsonValue);
				_controls.hfEntId.value = jsonValueObj[0].ent_id;
				_controls.hfRawReasCode.value = jsonValueObj[0].raw_reas_cd === "null" ? null : jsonValueObj[0].raw_reas_cd;
				_controls.hfNewReasCode.value = jsonValueObj[0].reas_cd;
				_controls.hflogid.value = jsonValueObj[0].log_id;
				_controls.blReasPending.value = 0;
				if (splitleft === 1) {
					_controls.dtTargetStartTime.value = JSON.parse(_controls.wwSplitWidget.widgetProperties.data)[0].starttime;
					_controls.dtTargetEndtTime.value = getEventTimeUTC;
				} else {
					_controls.dtTargetStartTime.value = getEventTimeUTC;
					_controls.dtTargetEndtTime.value = "";
				}
				return true;
			}
			return false;
		}
		/**
		 * Performs actions after the execution of a workflow, involving split utility events.
		 */
		function iwSplitUtilEventOnPostWorkflow(blockingOutput, workflowStatus) {
			_controls.txFirstPart.value = "";
			_controls.txSecondPart.value = "";
			_controls.txEventTime.value = "";
			_controls.txComment.value = "";
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"pe",
					"pe.utilHistory.split",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"PE_UI_UtilReasSplit",
					"pe.utilHistory.split",
				);
			}
		}
		/**
		 * Checks the value of EventTime and determines whether to enable a button.
		 */
		function enableIWButton() {
			const eventDataContext = FT.WorkTasks.contextGet(FORM.Control, "eventData");
			const jsonValueObj = JSON.parse(eventDataContext[0].jsonValue);
			const durationInSeconds = jsonValueObj[0].duration_in_seconds;
			if (durationInSeconds > 1) {
				_controls.fbLeft.enable = true;
				_controls.fbright.enable = true;
				return true;
			}
			_controls.fbLeft.enable = false;
			_controls.fbright.enable = false;
			return false;
		}
		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			getUtilSplit: getUtilSplit,
			iwSplitUtilEventOnPreWorkflow: iwSplitUtilEventOnPreWorkflow,
			iwSplitUtilEventOnPostWorkflow: iwSplitUtilEventOnPostWorkflow,
			wwNavbarWidgetOnClick: wwNavbarWidgetOnClick,
			fbButtonIncreaseOnClick: fbButtonIncreaseOnClick,
			fbButtonDecreaseOnClick: fbButtonDecreaseOnClick,
			enableIWButton: enableIWButton,
		};
	}
})(window);
