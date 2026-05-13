/*
Name:        	QM_UI_SampleFinalize.js
Description: 	QM_UI_SampleFinalize js file containing global logic pertaining to the QM_UI_SampleFinalize Form.

Ver		Release		By				  Date			  Change Description
001		00.70			Praveen			2024-08-29	#3616 First version.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.QM = window.QM || {};
	QM.SampleFinalize = QM.SampleFinalize || {};
	QM.SampleFinalize = SampleFinalize();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function SampleFinalize() {
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
			_controls.lableFinalizeState1 = FORM.Control.findByXmlNode("LBFL1");
			_controls.lableFinalizeState2 = FORM.Control.findByXmlNode("LBFL2");
			_controls.datetimeFinalize = FORM.Control.findByXmlNode("DTFL");
			_controls.hfSampleId = FORM.Control.findByXmlNode("HFSI");
			_controls.hfFinalize = FORM.Control.findByXmlNode("HFFL");
			_controls.invokeworkflowButton = FORM.Control.findByXmlNode("IWFL");

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
				const sampleContext = FT.WorkTasks.contextGet(FORM.Control, "sample");
				_controls.hfSampleId.value = sampleContext[0].sampleId;
				clearControls();
				loadSampleData();
			} catch (exception) {
				handleScriptError(exception);
			}
		}
		/**
		 * Clears the values of the finalize state controls
		 */
		function clearControls() {
			_controls.lableFinalizeState1.value = "";
			_controls.lableFinalizeState2.value = "";
		}
		/**
		 * @param {*} error
		 */
		function handleScriptError(error) {
			let errorMessage;
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
		 * Prepares data and sets control values before executing the workflow.
		 */
		function iwFinalizeOnPreWorkflow() {
			if (FORM.Control.validateForm() === true) {
				_controls.hfFinalize.value = _controls.hfFinalize.value === "false" ? "true" : "false";
				return true;
			}
			return false;
		}

		/**
		 * Loads sample data based on the sample ID from the controls
		 * @param {int} sampleId
		 * @returns {JSON} sample data
		 */
		function loadSampleData() {
			const parameterColl = {
				sampleId: _controls.hfSampleId.value,
			};
			FT.WebApi.mesGetAsync("api/V3/Sample/key", "", parameterColl, false).then(
				(data) => {
					// Handle successful response data
					_controls.hfFinalize.value = data.final === false ? "false" : "true";
					displayFinalizeState();
				},
				(error) => {
					// Handle error
					throw Error("Error:", error);
				},
			);
		}
		/**
		 * Updates the finalize state labels based on the value of hffinalize control.
		 * This function checks the value of the hffinalize control. If it is "false" strings indicating a finalized state.
		 * it sets the lablefinalizeState1 and lablefinalizeState2 controls to localized
		 */
		function displayFinalizeState() {
			if (_controls.hfFinalize.value === "false") {
				_controls.invokeworkflowButton.buttonText = skelta.localize.getString("@@QM_Finalize@@");
				_controls.lableFinalizeState1.value =
					skelta.localize.getString("@@QM_Finalize@@") + " " + skelta.localize.getString("@@QM_formtitle@@");
				_controls.lableFinalizeState2.value =
					skelta.localize.getString("@@QM_Final1@@") + ". " + skelta.localize.getString("@@QM_Final2@@");
			} else if (_controls.hfFinalize.value === "true") {
				_controls.invokeworkflowButton.buttonText = skelta.localize.getString("@@QM_Unfinalize@@");
				_controls.lableFinalizeState1.value =
					skelta.localize.getString("@@QM_Unfinalize@@") + " " + skelta.localize.getString("@@QM_formtitle@@");
				_controls.lableFinalizeState2.value =
					skelta.localize.getString("@@QM_Unfinal1@@") + ". " + skelta.localize.getString("@@QM_Unfinal2@@");
			}
			// Enable the datetime control based on final state
			_controls.datetimeFinalize.enable = _controls.hfFinalize.value === "false";
			_controls.datetimeFinalize.value = FT.WorkTasks.dateTimeInStringFormat(_controls.datetimeFinalize, new Date());
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwFinalizeOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"qm",
					"qm.sample.samplefinalize",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"QM_UI_SampleFinalize",
					"qm.sample.samplefinalize",
				);
			}
		}
		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			iwFinalizeOnPreWorkflow: iwFinalizeOnPreWorkflow,
			iwFinalizeOnPostWorkflow: iwFinalizeOnPostWorkflow,
		};
	}
})(window);
