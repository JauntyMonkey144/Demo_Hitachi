/*
Name:        	QM_UI_SampleEdit.js
Description: 	QM_UI_SampleEdit js file containing global logic pertaining to the QM_UI_SampleEdit Form.

Ver		Release		By					Date					Change Description
001		00.70			Ramesh V	 	2024-09-18		#3613 First version.
002		01.00			Bas van B		2025-03-04		#4253 Translate MD in editor form.
*/
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.QM = window.QM || {};
	QM.SampleEdit = QM.SampleEdit || {};
	QM.SampleEdit = SampleEdit();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function SampleEdit() {
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
			_controls.txItem = FORM.Control.findByXmlNode("TXITM");
			_controls.txFreqName = FORM.Control.findByXmlNode("TXFN");
			_controls.txWoId = FORM.Control.findByXmlNode("TXWOID");
			_controls.txOperId = FORM.Control.findByXmlNode("TXOID");
			_controls.nrPriority = FORM.Control.findByXmlNode("NRPR");
			_controls.txLotNo = FORM.Control.findByXmlNode("TXLOT");
			_controls.txSubLot = FORM.Control.findByXmlNode("TXSLOT");
			_controls.txSpare1 = FORM.Control.findByXmlNode("TXSP1");
			_controls.txSpare2 = FORM.Control.findByXmlNode("TXSP2");
			_controls.dtPulledTime = FORM.Control.findByXmlNode("DTPT");
			_controls.dtExpiryTime = FORM.Control.findByXmlNode("DTET");
			_controls.dtFinalizedAt = FORM.Control.findByXmlNode("DTFAT");
			_controls.lbFormTite = FORM.Control.findByXmlNode("LBFTTL");

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
			_controls.lbFormTite.value = skelta.localize.getString("@@QM_Edit@@") + " " + skelta.localize.getString("@@QM_formtitle@@");
			loadSampelData();
		}
		/**
		 * Loads the list of qm specifications and populates the dropdown control with the retrieved data.
		 * @returns {Object|null} The retrieved process data, or null if the request fails.
		 */
		function loadSampelData() {
			const sampleContext = FT.WorkTasks.contextGet(FORM.Control, "sample");
			if (sampleContext && sampleContext.length > 0) {
				const parameterColl = { sampleName: sampleContext[0].sampleName };
				FT.WebApi.mesGetAsync("api/v3/Sample/filter", "", parameterColl, false).then(
					(data) => {
						// Handle successful response data
						if (data != null && data.length > 0) {
							let sampleData;
							// Check if we have to filter on sample id
							if (data.length > 1) {
								// Get the correct sample with matching Id (id filter not supported by sample filter)
								[sampleData] = data.filter((i, item) => item.sampleId === sampleContext[0].sample_id);
							} else {
								[sampleData] = data;
							}
							// Translate the data
							const fields = [
								FT.Ui.translationColumnField("category_desc", FT.Ui.TRANSLATION_GROUPS.grpCategoryCategoryDesc, [
									"item_category_id",
								]),
								FT.Ui.translationColumnField(
									"context_ent_desc",
									FT.Ui.TRANSLATION_GROUPS.grpEntDescription,
									["context_ent_name"],
									"context_ent_name",
								),
								FT.Ui.translationColumnField(
									"context_item_desc",
									FT.Ui.TRANSLATION_GROUPS.grpItemItemDesc,
									["context_item_id"],
									"context_item_id",
								),
								FT.Ui.translationColumnField(
									"context_oper_desc",
									FT.Ui.TRANSLATION_GROUPS.grpOperOperDesc,
									["process_id", "context_oper_id"],
									"context_oper_id",
								),
								FT.Ui.translationColumnField(
									"ent_desc",
									FT.Ui.TRANSLATION_GROUPS.grpEntDescription,
									FT.Ui.TRANSLATION_KEYS.keyEnt,
									"ent_name",
								),
								FT.Ui.translationColumnField(
									"freq_desc",
									FT.Ui.TRANSLATION_GROUPS.grpSampleFreqFreqDesc,
									FT.Ui.TRANSLATION_KEYS.keySampleFreq,
								),
								FT.Ui.translationColumnField(
									"item_desc",
									FT.Ui.TRANSLATION_GROUPS.grpItemItemDesc,
									FT.Ui.TRANSLATION_KEYS.keyItem,
									"item_id",
								),
								FT.Ui.translationColumnField(
									"oper_desc",
									FT.Ui.TRANSLATION_GROUPS.grpOperOperDesc,
									FT.Ui.TRANSLATION_KEYS.keyOper,
									"oper_id",
								),
								FT.Ui.translationColumnField(
									"wo_desc",
									FT.Ui.TRANSLATION_GROUPS.grpWoWoDesc,
									FT.Ui.TRANSLATION_KEYS.keyWo,
									"wo_id",
								),
								FT.Ui.translationColumnField(
									"sample_result_desc",
									FT.Ui.TRANSLATION_GROUPS.grpSampleSampleResult,
									FT.Ui.TRANSLATION_KEYS.keySampleResult,
									"sample_result",
									(result) => {
										switch (result) {
											case 1:
												return "PENDING";
											case 2:
												return "GOOD";
											case 3:
												return "OOC";
											case 4:
												return "OOS";
											case 5:
												return "OOC KEY";
											case 6:
												return "OOS KEY";
											case 7:
												return "OOC CRITICAL";
											case 8:
												return "OOS CRITICAL";
											default:
												return "";
										}
									},
								),
								FT.Ui.translationColumnField(
									"sample_status_desc",
									FT.Ui.TRANSLATION_GROUPS.grpSampleSampleStatus,
									FT.Ui.TRANSLATION_KEYS.keySampleStatus,
									"sample_status",
									(status) => {
										let defaultString = "";
										if (status != null) {
											Object.keys(FT.Common.MES_SAMPLE_STATUS).forEach((key) => {
												if (FT.Common.MES_SAMPLE_STATUS[key] === status) {
													defaultString = key.toLocaleUpperCase();
												}
											});
										}
										return defaultString;
									},
								),
							];
							[sampleData] = FT.Ui.translateArray(sampleData, fields);
							_controls.hfEntID.value = sampleData.ent_id;
							_controls.hfSeqNo.value = sampleData.seq_no;
							_controls.hfContextEntId.value = sampleData.context_ent_id;
							_controls.hfItemCategoryID.value = sampleData.item_category_id;
							_controls.hfFreqId.value = sampleData.freq_id;
							_controls.hfFinal.value = sampleData.final;
							_controls.hfSampleId.value = sampleData.sample_id;
							_controls.hfSampleStatus.value = sampleData.sample_status;
							_controls.hfSampleResult.value = sampleData.sample_result;
							_controls.hfSampleName.value = sampleData.sample_name;
							_controls.hfContextItemId.value = sampleData.context_item_id;
							_controls.hfProcessId.value = sampleData.process_id;
							_controls.hfContextOperId.value = sampleData.context_oper_id;
							_controls.dtRequestedTimeUtc.value = FT.WorkTasks.dateTimeInStringFormat(
								_controls.dtRequestedTimeUtc,
								sampleData.requested_time_utc,
							);
							_controls.dtWarningTimeUtc.value = FT.WorkTasks.dateTimeInStringFormat(
								_controls.dtWarningTimeUtc,
								sampleData.warning_time_utc,
							);
							_controls.hfPulledBy.value = sampleData.pulled_by;
							_controls.hfFinalizedBy.value = sampleData.finalized_by;
							_controls.hfVerifiedBy.value = sampleData.verified_by;
							_controls.hfSegReqId.value = sampleData.segment_requirement_id;
							_controls.hfSegRespId.value = sampleData.segment_response_id;
							_controls.hfSpare3.value = sampleData.spare3;
							_controls.hfSpare4.value = sampleData.spare4;
							_controls.dtLastEditAt.value = sampleData.last_edit_at;
							_controls.txItem.value = sampleData.item_desc;
							_controls.txFreqName.value = sampleData.freq_desc;
							_controls.txWoId.value = sampleData.wo_desc;
							_controls.txOperId.value = sampleData.oper_id;
							_controls.nrPriority.value = sampleData.priority;
							_controls.txLotNo.value = sampleData.lot_no;
							_controls.txSubLot.value = sampleData.sublot_no;
							_controls.txSpare1.value = sampleData.spare1;
							_controls.txSpare2.value = sampleData.spare2;
							_controls.dtPulledTime.value = FT.WorkTasks.dateTimeInStringFormat(
								_controls.dtPulledTime,
								sampleData.pulled_time_utc,
							);
							_controls.dtExpiryTime.value = FT.WorkTasks.dateTimeInStringFormat(
								_controls.dtExpiryTime,
								sampleData.expiry_time_utc,
							);
							_controls.dtFinalizedAt.value = FT.WorkTasks.dateTimeInStringFormat(
								_controls.dtFinalizedAt,
								sampleData.finalized_at_utc,
							);
						}
					},
					(error) => {
						// Handle error
						throw new Error("Error:", error);
					},
				);
			}
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwEditQualityOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"qm",
					"qm.sample.sampleedit",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"QM_UI_SampleEdit",
					"qm.sample.sampleedit",
				);
			}
		}
		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			iwEditQualityOnPostWorkflow: iwEditQualityOnPostWorkflow,
		};
	}
})(window);
