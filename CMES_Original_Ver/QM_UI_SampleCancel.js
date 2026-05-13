/*
Name:        	QM_UI_SampleCancel.js
Description: 	QM_UI_SampleCancel js file containing global logic pertaining to the QM_UI_SampleCancel Form.

Ver		Release		By						Date					Change Description
001		00.70			Ramesh V	 		2024-09-18		#3614 First version.
*/
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.QM = window.QM || {};
	QM.SampleCancel = QM.SampleCancel || {};
	QM.SampleCancel = SampleCancel();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function SampleCancel() {
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;
		const SAMPLE_CANCEL_CD = "8";

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
			_controls.hfEntID = FORM.Control.findByXmlNode("HFEID");
			_controls.hfSeqNo = FORM.Control.findByXmlNode("HFSQN");
			_controls.hfContextEntId = FORM.Control.findByXmlNode("HFCEID");
			_controls.hfItemCategoryID = FORM.Control.findByXmlNode("HFICID");
			_controls.hfFreqId = FORM.Control.findByXmlNode("HFFQID");
			_controls.hfFinal = FORM.Control.findByXmlNode("HFFNL");
			_controls.hfSampleId = FORM.Control.findByXmlNode("HFSID");
			_controls.hfSampleStatus = FORM.Control.findByXmlNode("HFSS");
			_controls.hfSampleResult = FORM.Control.findByXmlNode("HFSR");
			_controls.hfSampleName = FORM.Control.findByXmlNode("HFSN");
			_controls.hfContextItemId = FORM.Control.findByXmlNode("HFCIID");
			_controls.hfProcessId = FORM.Control.findByXmlNode("HFPID");
			_controls.hfContextOperId = FORM.Control.findByXmlNode("HFCOID");
			_controls.dtRequestedTimeUtc = FORM.Control.findByXmlNode("DTRTU");
			_controls.dtWarningTimeUtc = FORM.Control.findByXmlNode("DTWTU");
			_controls.hfPulledBy = FORM.Control.findByXmlNode("HFPB");
			_controls.hfFinalizedBy = FORM.Control.findByXmlNode("HFFB");
			_controls.hfVerifiedBy = FORM.Control.findByXmlNode("HFVB");
			_controls.hfSegReqId = FORM.Control.findByXmlNode("HFSRQID");
			_controls.hfSegRespId = FORM.Control.findByXmlNode("HFSRSID");
			_controls.hfSpare3 = FORM.Control.findByXmlNode("HFSP3");
			_controls.hfSpare4 = FORM.Control.findByXmlNode("HFSP4");
			_controls.dtLastEditAt = FORM.Control.findByXmlNode("DTLEA");
			_controls.hfItem = FORM.Control.findByXmlNode("HFITM");
			_controls.hfFreqName = FORM.Control.findByXmlNode("HFFN");
			_controls.hfWoId = FORM.Control.findByXmlNode("HFWOID");
			_controls.hfOperId = FORM.Control.findByXmlNode("HFOID");
			_controls.hfPriority = FORM.Control.findByXmlNode("HFPR");
			_controls.hfLotNo = FORM.Control.findByXmlNode("HFLOT");
			_controls.hfSubLot = FORM.Control.findByXmlNode("HFSLOT");
			_controls.hfSpare1 = FORM.Control.findByXmlNode("HFSP1");
			_controls.hfSpare2 = FORM.Control.findByXmlNode("HFSP2");
			_controls.dtPulledTime = FORM.Control.findByXmlNode("DTPT");
			_controls.dtExpiryTime = FORM.Control.findByXmlNode("DTET");
			_controls.dtFinalizedAt = FORM.Control.findByXmlNode("DTFAT");
			_controls.lbFormTitle = FORM.Control.findByXmlNode("LBFTTL");

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
			_controls.lbFormTitle.value =
				skelta.localize.getString("@@QM_Cancel@@") + " " + skelta.localize.getString("@@QM_formtitle@@");
			loadSampelData();
		}
		/**
		 * Loads the list of qm specifications and populates the dropdown control with the retrieved data.
		 * @returns {Object|null} The retrieved process data, or null if the request fails.
		 */
		function loadSampelData() {
			const sampleContext = FT.WorkTasks.contextGet(FORM.Control, "sample");
			let parameterColl;
			if (sampleContext && sampleContext.length > 0) {
				parameterColl = { sampleId: sampleContext[0].sampleId };
				FT.WebApi.mesGetAsync("api/v3/Sample", "", parameterColl, false).then(
					(data) => {
						// Handle successful response data
						sampleData = data;
						_controls.hfEntID.value = sampleData[0].ent_id;
						_controls.hfSeqNo.value = sampleData[0].seq_no;
						_controls.hfContextEntId.value = sampleData[0].context_ent_id;
						_controls.hfItemCategoryID.value = sampleData[0].item_category_id;
						_controls.hfFreqId.value = sampleData[0].freq_id;
						_controls.hfFinal.value = sampleData[0].final;
						_controls.hfSampleId.value = sampleData[0].sample_id;
						_controls.hfSampleStatus.value = SAMPLE_CANCEL_CD;
						_controls.hfSampleResult.value = sampleData[0].sample_result;
						_controls.hfSampleName.value = sampleData[0].sample_name;
						_controls.hfContextItemId.value = sampleData[0].context_item_id;
						_controls.hfProcessId.value = sampleData[0].process_id;
						_controls.hfContextOperId.value = sampleData[0].context_oper_id;
						_controls.dtRequestedTimeUtc.value = FT.WorkTasks.dateTimeInStringFormat(
							_controls.dtRequestedTimeUtc,
							sampleData[0].requested_time_utc,
						);
						_controls.dtWarningTimeUtc.value = FT.WorkTasks.dateTimeInStringFormat(
							_controls.dtWarningTimeUtc,
							sampleData[0].warning_time_utc,
						);
						_controls.hfPulledBy.value = sampleData[0].pulled_by;
						_controls.hfFinalizedBy.value = sampleData[0].finalized_by;
						_controls.hfVerifiedBy.value = sampleData[0].verified_by;
						_controls.hfSegReqId.value = sampleData[0].segment_requirement_id;
						_controls.hfSegRespId.value = sampleData[0].segment_response_id;
						_controls.hfSpare3.value = sampleData[0].spare3;
						_controls.hfSpare4.value = sampleData[0].spare4;
						_controls.dtLastEditAt.value = FT.WorkTasks.dateTimeInStringFormat(
							_controls.dtLastEditAt,
							sampleData[0].last_edit_at,
						);
						_controls.hfItem.value = sampleData[0].item_id;
						_controls.hfFreqName.value = sampleData[0].freq_id;
						_controls.hfWoId.value = sampleData[0].wo_id;
						_controls.hfOperId.value = sampleData[0].oper_id;
						_controls.hfPriority.value = sampleData[0].priority;
						_controls.hfLotNo.value = sampleData[0].lot_no;
						_controls.hfSubLot.value = sampleData[0].sublot_no;
						_controls.hfSpare1.value = sampleData[0].spare1;
						_controls.hfSpare2.value = sampleData[0].spare2;
						_controls.dtPulledTime.value = FT.WorkTasks.dateTimeInStringFormat(
							_controls.dtPulledTime,
							sampleData[0].pulled_time_utc,
						);
						_controls.dtExpiryTime.value = FT.WorkTasks.dateTimeInStringFormat(
							_controls.dtExpiryTime,
							sampleData[0].expiry_time_utc,
						);
						_controls.dtFinalizedAt.value = FT.WorkTasks.dateTimeInStringFormat(
							_controls.dtFinalizedAt,
							sampleData[0].finalized_at_utc,
						);
					},
					(error) => {
						// Handle error
						throw new Error("Error:", error);
					},
				);
			} else {
				throw new Error("The sample context object is currently null.");
			}
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwCancelQualityOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"qm",
					"qm.sample.samplecancel",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"QM_UI_SampleCancel",
					"qm.sample.samplecancel",
				);
			}
		}
		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			iwCancelQualityOnPostWorkflow: iwCancelQualityOnPostWorkflow,
		};
	}
})(window);
