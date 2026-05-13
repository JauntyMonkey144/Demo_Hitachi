/*
Name:        	PE_UI_UtilReasAssign.js
Description: 	PE_UI_UtilReasAssign.js js file containing global logic pertaining to the PE_UI_UtilReasAssign Form.

Ver		Release	By				Date				Change Description
001		00.50	  Praveen		2024-05-24	#2825 First version.
002		00.50   Praveen 	2024-10-16	#3763 Remove all lookups and update with Web api calls.
003		01.00		Bas van B	2025-02-27	#4253 Translate MD in tilescreen.
*/

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.PE = window.PE || {};
	PE.UtilReasAssign = PE.UtilReasAssign || {};
	PE.UtilReasAssign = UtilReasAssign();
	// ------------------------------------------------------------------------------------
	/**
	 * tdAssignReasonsTemplate
	 *
	 * @returns {null} tdAssignReasonsTemplate template object.
	 */
	function UtilReasAssign() {
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
			_controls.wwAssignWidget = FORM.Control.findByXmlNode("WWUR");
			_controls.hfEntID = FORM.Control.findByXmlNode("HFEID");
			_controls.hfEventDate = FORM.Control.findByXmlNode("HFEDT");
			_controls.hfReasonPending = FORM.Control.findByXmlNode("HFRSP");
			_controls.hfReasonCode = FORM.Control.findByXmlNode("HFRC");
			_controls.hfRawReasonCode = FORM.Control.findByXmlNode("HFRRC");
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
		 * Form load function
		 */
		function onFormLoad() {
			try {
				utilReasonLoad();
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
				errorMessage = skelta.localize.getString("@@PE_UnexpectedType@@");
			} else if (error instanceof ReferenceError) {
				errorMessage = skelta.localize.getString("@@PE_ReferenceError@@");
			} else {
				errorMessage = skelta.localize.getString("@@PE_DuringScriptExecution@@");
			}
			SFU.showError(skelta.localize.getString("FormNGFErrorRunningScript_title"), errorMessage, null, error.message);
			throw errorMessage;
		}
		/**
		 * Get Util reason details for displaying it on the  widget
		 * @param {string} ent_name
		 * @param {integer} log_id
		 * @returns {JSON} data
		 */
		function utilReasonLoad() {
			const eventDataContext = FT.WorkTasks.contextGet(FORM.Control, "eventData");
			const jsonValueObj = JSON.parse(eventDataContext[0].jsonValue);
			const entContext = FT.WorkTasks.contextGet(FORM.Control, "ent");
			if (jsonValueObj !== null) {
				const parameterCollection = {
					ent_name: entContext[0].entName,
					log_id: jsonValueObj[0].log_id,
				};
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_PE_Util_Reas_Grp_AssignReason", parameterCollection, false).then(
					(data) => {
						// Translate teh data
						const fields = [
							FT.Ui.translationColumnField("display", FT.Ui.TRANSLATION_GROUPS.grpUtilReasReasDesc, ["reas_grp_desc", "display"]),
							FT.Ui.translationColumnField("display", FT.Ui.TRANSLATION_GROUPS.grpUtilReasGrpReasGrpDesc, ["display"]),
							FT.Ui.translationColumnField(
								"reas_desc",
								FT.Ui.TRANSLATION_GROUPS.grpUtilReasReasDesc,
								FT.Ui.TRANSLATION_KEYS.keyUtilReas,
							),
							FT.Ui.translationColumnField(
								"reas_grp_desc",
								FT.Ui.TRANSLATION_GROUPS.grpUtilReasGrpReasGrpDesc,
								FT.Ui.TRANSLATION_KEYS.keyUtilReasGrp,
							),
						];
						const translatedData = FT.Ui.translateArray(data, fields);
						_controls.wwAssignWidget.widgetProperties.data = JSON.stringify(translatedData);
					},
					(error) => {
						// Handle error
						throw error("Error:", error);
					},
				);
			}
		}
		/**
		 * Prepares data and sets control values before executing the workflow.
		 */
		function iwUtilReasAssignOnPreWorkflow() {
			const entContext = FT.WorkTasks.contextGet(FORM.Control, "ent");
			const eventDataContext = FT.WorkTasks.contextGet(FORM.Control, "eventData");
			const jsonValueObj = JSON.parse(eventDataContext[0].jsonValue);
			_controls.hfReasonPending.value = jsonValueObj[0].reas_pending;
			_controls.hfReasonCode.value = _controls.wwAssignWidget.value;
			_controls.hfRawReasonCode.value = jsonValueObj[0].reas_cd;
			_controls.hfEventDate.value = jsonValueObj[0].event_time_utc;
			_controls.hfEntID.value = entContext[0].entId;
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
		 * Performs actions after the execution of a workflow.
		 */
		function iwUtilReasAssignOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"pe",
					"pe.utilHistory.assign",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"PE_UI_UtilReasAssign",
					"pe.utilHistory.assign",
				);
			}
		}
		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			iwUtilReasAssignOnPreWorkflow: iwUtilReasAssignOnPreWorkflow,
			iwUtilReasAssignOnPostWorkflow: iwUtilReasAssignOnPostWorkflow,
		};
	}
})(window);
