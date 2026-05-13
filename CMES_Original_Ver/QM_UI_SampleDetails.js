/*
Name:        	QM_UI_SampleDetails.js
Description: 	QM_UI_SampleDetails js file containing global logic pertaining to the QM_UI_SampleDetails Form.

Ver		Release		By						Date					Change Description
001		00.70			Shamanth S	 	2024-09-19		#3612 First version.
002		01.00			Bas van B			2025-03-03		34253 Translate MD.
003		01.00			Bas van B			2025-03-04		#4253 Moved translation default string templates to QM.Common.js.
*/
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.QM = window.QM || {};
	QM.SampleDetails = QM.SampleDetails || {};
	QM.SampleDetails = SampleDetails();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function SampleDetails() {
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const LIST_JS = ["js/MES/FT_Common.js", "js/MES/QM_Common.js"];
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
			_controls.txItemId = FORM.Control.findByXmlNode("TXITM");
			_controls.txSampleFreq = FORM.Control.findByXmlNode("TXSF");
			_controls.txOper = FORM.Control.findByXmlNode("TXOP");
			_controls.txLotNo = FORM.Control.findByXmlNode("TXLT");
			_controls.txtSubLot = FORM.Control.findByXmlNode("TXSL");
			_controls.dtPullTime = FORM.Control.findByXmlNode("DTPT");
			_controls.dtExpireTime = FORM.Control.findByXmlNode("DTET");
			_controls.dtFinalizeTime = FORM.Control.findByXmlNode("DTFT");
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
				skelta.localize.getString("@@QM_Details@@") + " " + skelta.localize.getString("@@QM_formtitle@@");
			// get context value of Sample & or setValue to fields
			const sampleContext = FT.WorkTasks.contextGet(FORM.Control, "sample");
			if (sampleContext && sampleContext.length > 0) {
				// fetch Sample details from API
				const parameterColl = { sampleName: sampleContext[0].sampleName };
				FT.WebApi.mesGetAsync("api/v3/Sample/filter", "", parameterColl, false).then(
					(data) => {
						// Handle successful response data
						if (data != null && data.length > 0) {
							let sampleDetails;
							// Check if we have to filter on sample id
							if (data.length > 1) {
								// Get the correct sample with matching Id (id filter not supported by sample filter)
								[sampleDetails] = data.filter((i, item) => item.sampleId === sampleContext[0].sample_id);
							} else {
								[sampleDetails] = data;
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
									QM.Common.translationSampleResultDefaultTemplate,
								),
								FT.Ui.translationColumnField(
									"sample_status_desc",
									FT.Ui.TRANSLATION_GROUPS.grpSampleSampleStatus,
									FT.Ui.TRANSLATION_KEYS.keySampleStatus,
									"sample_status",
									QM.Common.translationSampleStatusDefaultTemplate,
								),
							];
							[sampleDetails] = FT.Ui.translateArray(sampleDetails, fields);

							// Set values to respective controls
							_controls.txItemId.value = sampleDetails.item_desc;
							_controls.txSampleFreq.value = sampleDetails.freq_desc;
							_controls.txOper.value = sampleDetails.oper_des;
							_controls.txLotNo.value = sampleDetails.lot_no;
							_controls.txtSubLot.value = sampleDetails.sublot_no;
							_controls.dtPullTime.value = FT.WorkTasks.dateTimeInStringFormat(
								_controls.dtPullTime,
								sampleDetails.pulled_time_utc,
							);
							_controls.dtExpireTime.value = FT.WorkTasks.dateTimeInStringFormat(
								_controls.dtExpireTime,
								sampleDetails.expiry_time_utc,
							);
							_controls.dtFinalizeTime.value = FT.WorkTasks.dateTimeInStringFormat(
								_controls.dtFinalizeTime,
								sampleDetails.finalized_at_utc,
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
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
		};
	}
})(window);
