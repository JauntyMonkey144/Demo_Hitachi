/*
Name:        	JM_UI_JobEdit.js
Description: 	JM_UI_JobEdit js file containing global logic pertaining to the JM_UI_JobEdit Form.

Ver		Release		By						Date				Change Description
001		00.50			Ramesh V		 	2024-05-17	#2771 First version.
002		00.50			Ramesh V		 	2024-08-07	#3310 Replaced textBox inplace of dateTime control to show the LastStartTime.
003		00.70			João Caldeira 2024-11-19	#3942 Updated form and file name from JM_UI_Edit to JM_UI_JobEdit.
																					Added code to dispatch event on job edit.
004		01.00			Bas van B			2025-02-24	#4253 Translate the job details' MD.
*/
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.JM = window.JM || {};
	JM.JobEdit = JM.JobEdit || {};
	JM.JobEdit = JobEdit();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function JobEdit() {
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
			_controls.txDesc = FORM.Control.findByXmlNode("TXDESC");
			_controls.nrBatchSize = FORM.Control.findByXmlNode("NRBSZ");
			_controls.nrPriority = FORM.Control.findByXmlNode("NRPRT");
			_controls.nrStartQty = FORM.Control.findByXmlNode("NRSQTY");
			_controls.nrReqQty = FORM.Control.findByXmlNode("NRRQTY");
			_controls.txLastStartTime = FORM.Control.findByXmlNode("TXLST");
			_controls.dtDueDate = FORM.Control.findByXmlNode("DTDD");
			_controls.txEstFinishTime = FORM.Control.findByXmlNode("TXEFT");
			_controls.txNotes = FORM.Control.findByXmlNode("TXNTS");
			_controls.hfWoId = FORM.Control.findByXmlNode("HFWID");
			_controls.hfOperId = FORM.Control.findByXmlNode("HFOID");
			_controls.hfEntId = FORM.Control.findByXmlNode("HFEID");
			_controls.hfSeqNo = FORM.Control.findByXmlNode("HFSNO");

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

		/**
		 * Form load function for the controls
		 */
		function onFormLoad() {
			// get context value of job & or setValue to hidden fields
			const jobContext = FT.WorkTasks.contextGet(FORM.Control, "job");
			let jobDetails;
			let parameterColl;
			if (jobContext && jobContext.length > 0) {
				// fetch job details from API

				parameterColl = { woId: jobContext[0].woId, operId: jobContext[0].operId, seqNo: jobContext[0].seqNo };
				FT.WebApi.mesGetAsync("api/v3/Jobs/key", "", parameterColl, false).then(
					(data) => {
						// Handle successful response data
						if (data) {
							// Translate the data, first get the keys from the wo context
							const [woContext] = FT.WorkTasks.contextGet(FORM.Control, "wo");
							// Create the fields
							const fields = [
								FT.Ui.translationValueField("job_desc", FT.Ui.TRANSLATION_GROUPS.grpOperOperDesc, [
									woContext.processId,
									jobContext[0].operId,
								]),
							];

							// translate the data
							[jobDetails] = FT.Ui.translateArray(data, fields);

							// Set values to respective controls
							_controls.txDesc.value = jobDetails.job_desc;
							_controls.nrBatchSize.value = jobDetails.batch_size;
							_controls.nrPriority.value = jobDetails.job_priority;
							_controls.nrStartQty.value = jobDetails.qty_at_start;
							_controls.nrReqQty.value = jobDetails.qty_reqd;
							_controls.txLastStartTime.value = FT.WorkTasks.dateTimeInStringFormat(
								_controls.txLastStartTime,
								jobDetails.latest_start_time_utc,
							);
							_controls.dtDueDate.value = FT.WorkTasks.dateTimeInStringFormat(
								_controls.dtDueDate,
								jobDetails.req_finish_time_utc,
							);
							_controls.txEstFinishTime.value = getEstimatedFinishTime(jobDetails);
							_controls.txNotes.value = jobDetails.notes;
							_controls.hfWoId.value = jobDetails.wo_id;
							_controls.hfOperId.value = jobDetails.oper_id;
							_controls.hfSeqNo.value = jobDetails.seq_no;
							_controls.hfEntId.value = jobDetails.run_ent_id != null ? jobDetails.run_ent_id : jobDetails.target_sched_ent_id;
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
		 * Performs a pre-execution validation check to ensure the starting quantity.
		 * is not less than the required quantity. Displays an error and halts the.
		 * workflow if validation fails.
		 *
		 * @returns {boolean} True if validation passes, false otherwise.
		 */
		function iwJobEditOnPreWorkflow() {
			if (_controls.nrReqQty.value && _controls.nrStartQty.value) {
				if (_controls.nrStartQty.value < _controls.nrReqQty.value) {
					const title = skelta.localize.getString("@@JM_ValidationError@@");
					const errorMsg = skelta.localize.getString("@@JM_InvalidStartReqdQty@@");
					const errorDetails = skelta.localize.getString("@@JM_ReqdQtyErrorDetails@@");
					SFU.showError(title, errorMsg, null, errorDetails);
					return false;
				}
			}

			return true;
		}
		/**
		 * Calculates and returns the estimated finish time for a job based on its current state.
		 * production rate, and other relevant data. If the job is already complete, it returns.
		 * the actual finish time.
		 *
		 * @param {Object} data The data object containing job details and production information.
		 * @returns {string} The estimated or actual finish time as a formatted string.
		 */
		function getEstimatedFinishTime(data) {
			let estimatedFinishTime;

			if (data.state_cd !== FT.Common.MES_JOB_STATE_CD.complete) {
				const prodUom = data.prod_uom;
				let batchSize;
				const currentDate = new Date();

				if (data.batch_size <= 0) {
					batchSize = 0;
				} else {
					batchSize = Math.ceil((data.qty_reqd - data.qty_prod) / data.batch_size);
				}

				let prodRateToHrsPerBatch;

				if (data.act_start_time_utc && data.qty_prod !== 0) {
					const extActStartUtcValue = data.act_start_time_utc;
					const actStartUtcDateValue = skelta.forms.utilities.isUndefined(extActStartUtcValue)
						? null
						: new Date(extActStartUtcValue);

					const timeDiff = currentDate.getTime() - actStartUtcDateValue.getTime();
					const durationHours = timeDiff / (3600 * 1000);
					prodRateToHrsPerBatch = (durationHours / data.qty_prod) * data.batch_size;
				} else {
					const prodRate = data.est_prod_rate;
					prodRateToHrsPerBatch = getProdRateToHrsPerBatch(prodRate, prodUom);
				}

				if (prodRateToHrsPerBatch === null) {
					prodRateToHrsPerBatch = 0;
				}

				const totalHours = batchSize * prodRateToHrsPerBatch;

				const setNewDate = new Date(currentDate);
				setNewDate.setHours(currentDate.getHours() + Math.floor(totalHours));
				const newMinutes = totalHours * 60.0 - Math.floor(totalHours) * 60.0;
				const newSeconds = totalHours * 3600 - Math.floor(totalHours) * 3600 - Math.floor(newMinutes) * 60;
				setNewDate.setMinutes(currentDate.getMinutes() + newMinutes);
				setNewDate.setSeconds(currentDate.getSeconds() + newSeconds);
				estimatedFinishTime = setNewDate.toLocaleString();
				return estimatedFinishTime;
			}

			estimatedFinishTime = FT.WorkTasks.dateTimeInStringFormat(_controls.txEstFinishTime, data.act_finish_time_utc);
			return estimatedFinishTime;
		}

		/**
		 * Calculates the production rate per hours per batch based on given parameters.
		 * @param {number} prodRate Production rate.
		 * @param {number} prodUom Production unit of measure.
		 * @returns {number} Production rate converted to hours per batch.
		 */
		function getProdRateToHrsPerBatch(prodRate, prodUom) {
			let prodRateToHrsPerBatch;
			const adjustedProdUom = prodUom === null ? 0 : prodUom;
			const adjustedProdRate = prodRate === null ? 0 : prodRate;

			switch (adjustedProdUom) {
				case 1:
					prodRateToHrsPerBatch = (1.0 / 60.0) * adjustedProdRate;
					break;
				case 2:
					prodRateToHrsPerBatch = (1.0 / 3600.0) * adjustedProdRate;
					break;
				case 3:
					prodRateToHrsPerBatch = 1.0 / adjustedProdRate;
					break;
				case 4:
					prodRateToHrsPerBatch = 1.0 / (adjustedProdRate * 60);
					break;
				case 5:
					prodRateToHrsPerBatch = 1.0 / (adjustedProdRate * 3600);
					break;
				default:
					prodRateToHrsPerBatch = adjustedProdRate;
			}
			return prodRateToHrsPerBatch;
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwJobEditOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch("jm", "jm.job.update", FT.Common.EVENT_SOURCE_TYPE.form, "JM_UI_JobEdit", "jm.job.update");
			}
		}
		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			iwJobEditOnPreWorkflow: iwJobEditOnPreWorkflow,
			iwJobEditOnPostWorkflow: iwJobEditOnPostWorkflow,
		};
	}
})(window);
