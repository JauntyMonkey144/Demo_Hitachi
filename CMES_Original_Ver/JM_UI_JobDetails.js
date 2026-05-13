/*
Name:        	JM_UI_JobDetails.js
Description: 	JM_UI_JobDetails js file containing global logic pertaining to the JM_UI_JobDetails Form.

Ver		Release		By						Date				Change Description
001		00.50			Ramesh V		 	2024-07-02	#2773 First version.
002		00.70			João Caldeira 2024-11-19	#3942 Updated form and file name from JM_UI_Details to JM_UI_JobDetails.
003		01.00			Bas van B			2025-02-21	#4253 Translate the job description.
004		01.01.00	Fayaz A	  		2025-05-14	#4955 A global variable, commandSelected, is defined to fetch and hold the selected command's
																					action details from filterData context on form load.
*/
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.JM = window.JM || {};
	JM.JobDetails = JM.JobDetails || {};
	JM.JobDetails = JobDetails();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function JobDetails() {
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
		let commandSelected = ""; // Variable to hold the selected command's action details, including configured properties and their values
		let codeValue = ""; // Variable to hold the value of 'code' column from use case composability.
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
			_controls.txBatchSize = FORM.Control.findByXmlNode("TXBSZ");
			_controls.txPriority = FORM.Control.findByXmlNode("TXPRT");
			_controls.txStartQty = FORM.Control.findByXmlNode("TXSQTY");
			_controls.txReqQty = FORM.Control.findByXmlNode("TXRQTY");
			_controls.txLastStartTime = FORM.Control.findByXmlNode("TXLST");
			_controls.txDueDate = FORM.Control.findByXmlNode("TXDD");
			_controls.txEstFinishTime = FORM.Control.findByXmlNode("TXEFT");
			_controls.txNotes = FORM.Control.findByXmlNode("TXNTS");

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
			// get context value of job & or setValue to hidden fields
			const jobContext = FT.WorkTasks.contextGet(FORM.Control, "job");
			let parameterColl;
			const filterData = FT.WorkTasks.contextGet(FORM.Control, "filterData");
			commandSelected = filterData.find((item) => item.type === "commandSelected");
			if (commandSelected) {
				commandSelected = JSON.parse(commandSelected.jsonValue);
				// Sample code to access context properties
				codeValue = commandSelected.code;
			}
			if (jobContext && jobContext.length > 0) {
				// fetch job details from API
				parameterColl = { woId: jobContext[0].woId, operId: jobContext[0].operId, seqNo: jobContext[0].seqNo };
				FT.WebApi.mesGetAsync("api/v3/Jobs/key", "", parameterColl, false).then(
					(data) => {
						// Handle successful response data
						if (data) {
							// Get wocontext for process ID
							const [woContext] = FT.WorkTasks.contextGet(FORM.Control, "wo");
							// Set values to respective controls
							_controls.txDesc.value = FT.Ui.translateValue(
								FT.Ui.TRANSLATION_GROUPS.grpOperOperDesc,
								woContext.processId + "|" + jobContext[0].operId,
								data.job_desc,
							);
							_controls.txBatchSize.value = data.batch_size;
							_controls.txPriority.value = data.job_priority;
							_controls.txStartQty.value = data.qty_at_start;
							_controls.txReqQty.value = data.qty_reqd;
							_controls.txLastStartTime.value = FT.WorkTasks.dateTimeInStringFormat(
								_controls.txLastStartTime,
								data.latest_start_time_utc,
							);
							_controls.txDueDate.value = FT.WorkTasks.dateTimeInStringFormat(_controls.txDueDate, data.req_finish_time_utc);
							_controls.txEstFinishTime.value = FT.WorkTasks.dateTimeInStringFormat(
								_controls.txEstFinishTime,
								data.act_finish_time_utc,
							);
							_controls.txEstFinishTime.value = getEstimatedFinishTime(data);
							_controls.txNotes.value = data.notes;
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
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
		};
	}
})(window);
