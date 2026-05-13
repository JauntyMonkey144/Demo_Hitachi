/*
Name:        	QM_UI_SamplePull.js
Description: 	Sample Pull js file containing global logic pertaining to the QM_UI_SamplePull Form.

Ver		Release		By				  Date			  Change Description
001		00.70			Praveen			2024-08-29	#3615 First version.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.QM = window.QM || {};
	QM.SamplePull = QM.SamplePull || {};
	QM.SamplePull = SamplePull();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function SamplePull() {
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
			_controls.lablePullState1 = FORM.Control.findByXmlNode("LBPL1");
			_controls.lablePullState2 = FORM.Control.findByXmlNode("LBPL2");
			_controls.datetimePull = FORM.Control.findByXmlNode("DTPL");
			_controls.hfSampleId = FORM.Control.findByXmlNode("HFSI");
			_controls.hfCanPull = FORM.Control.findByXmlNode("HFPL");
			_controls.invokeworkflowButton = FORM.Control.findByXmlNode("IWPL");

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
		 * Clears the values of the pull state controls
		 */
		function clearControls() {
			_controls.lablePullState1.value = "";
			_controls.lablePullState2.value = "";
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
				errorMessage = skelta.localize.getString("@QM_DuringScriptExecution@@");
			}
			SFU.showError(skelta.localize.getString("FormNGFErrorRunningScript_title"), errorMessage, null, error.message);
		}
		/**
		 * Prepares data and sets control values before executing the workflow.
		 */
		function iwPullOnPreWorkflow() {
			if (FORM.Control.validateForm() === true) {
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
					// If true, can pull; if false, undo pull.
					_controls.hfCanPull.value = !SFU.isUndefined(data.pulled_by) && data.pulled_by !== "" ? "false" : "true";
					displayPullState();
				},
				(error) => {
					// Handle error
					throw Error("Error:", error);
				},
			);
		}
		/**
		 * Updates the pull state labels based on the value of hfPull control.
		 * This function checks the value of the hfPull control. If it is "false" strings indicating a pulled state.
		 * it sets the lablePullState1 and lablePullState2 controls to localized
		 */
		function displayPullState() {
			if (_controls.hfCanPull.value === "true") {
				_controls.invokeworkflowButton.buttonText = skelta.localize.getString("@@QM_Pull@@");
				_controls.lablePullState1.value =
					skelta.localize.getString("@@QM_Pull@@") + " " + skelta.localize.getString("@@QM_formtitle@@");
				_controls.lablePullState2.value =
					skelta.localize.getString("@@QM_Pull1@@") + ". " + skelta.localize.getString("@@QM_Pull2@@");
			} else if (_controls.hfCanPull.value === "false") {
				_controls.invokeworkflowButton.buttonText = skelta.localize.getString("@@QM_Unpull@@");
				_controls.lablePullState1.value =
					skelta.localize.getString("@@QM_Unpull@@") + " " + skelta.localize.getString("@@QM_formtitle@@");
				_controls.lablePullState2.value =
					skelta.localize.getString("@@QM_Unpull1@@") + ". " + skelta.localize.getString("@@QM_Unpull2@@");
			}
			// Datetime should be enable based on the pull state
			_controls.datetimePull.enable = _controls.hfCanPull.value === "true";
			_controls.datetimePull.value = FT.WorkTasks.dateTimeInStringFormat(_controls.datetimePull, new Date());
		}

		/**
		 * To allow only current or a past time can be entered
		 *  * @param {DateTime} selectedDateTime
		 */
		function validatePullDateTime(selectedDateTime) {
			const currentDtUtc = SFU.getDateTimeInServerUTCFormat(new Date()); // Get current UTC time
			const strCurrentDt = SFU.getDateTimeInStringFormat(
				currentDtUtc,
				skelta.forms.constants.dateFormats.dateTimeFormatForCoreValue,
			);

			if (selectedDateTime > strCurrentDt) {
				return new ValidationOptions(false, skelta.localize.getString("@@QM_DateTimeValidationMsg@@"));
			}

			return new ValidationOptions(true, "");
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwPullOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"qm",
					"qm.sample.samplepull",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"QM_UI_SamplePull",
					"qm.sample.samplepull",
				);
			}
		}
		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			iwPullOnPreWorkflow: iwPullOnPreWorkflow,
			iwPullOnPostWorkflow: iwPullOnPostWorkflow,
			validatePullDateTime: validatePullDateTime,
		};
	}
})(window);
