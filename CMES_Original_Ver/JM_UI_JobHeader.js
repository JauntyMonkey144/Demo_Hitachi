/*
Name:					JM_UI_JobHeader.js
Description:	The JM_UI_JobHeader.js js file containing logic pertaining to the JM_UI_JobHeader Form.

Ver 	Release	By					Date				Change Description
001 	00.70.00	Wilwin L  2024-11-08	First version of the file.
002 	01.00.00	Fayaz A   2025-02-20  #4116 Moved from use case to module level, UC_JM_UI_JobHeader to JM_UI_JobHeader.
																			Updated function getJobProgressData to use SP_S_JM_Job_Progress procedure
																			and updated function setOEEData to use sp_S_JM_Ent_Kpi procedure.
003		01.00.00	Bas van B	2025-02-25	#4253 Added translate the job probgress data.
004		01.00.00	Usha M		2025-02-27	#4355 Removed console.log
005		01.01.00 	Fayaz A		2025-05-28	#5008 Localization key update to refer from FT runtime locale file.
006		01.03.01 	Fayaz A		2025-12-02	#5242 Modification done for getJobProgressData and eventListener to handle the
																			job progress of selected card type "JOB" when multiple job is
																			running for selected entity.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.JM = window.JM || {};
	JM.JobHeader = JM.JobHeader || {};
	JM.JobHeader = JobHeader();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function JobHeader() {
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css", "css/MES/JM_UI_JobHeader.css"];
		const FORM = {};
		// ----------------------------------------------------------------------------------

		// ----------------------------- Private Variables ----------------------------------
		const _controls = {};
		FORM.Control = null;
		let userInfo = "";
		let entName = "";
		/** Change default entity id{entId} as per requirement. First priority is for form parameter entId,
		 * else this entId is considered as default; */
		let entId = 1;
		let moduleEvent = "";
		// ----------------------------------------------------------------------------------
		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			// Initialize variables

			FORM.Control = Control;
			_controls.wwJobProgress = FORM.Control.findByXmlNode("WWJP");
			_controls.wwOEE = FORM.Control.findByXmlNode("WWOEE");

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
		 * Form load function to bind cards with respect to entity from form parameters or if session variable EntID
		 */
		function onFormLoad() {
			// Following code is added to support pdf files to load inside an iframe
			$("#E1frameEmbedPage").removeAttr("sandbox");

			userInfo = FT.WorkTasks.userInfo();
			mesUserId = userInfo.MESUserId !== undefined ? userInfo.MESUserId.replace(/\\/g, "\\\\") : null;

			if (
				FORM.Control.formParameters.entId !== undefined &&
				FORM.Control.formParameters.entId.value != null &&
				FORM.Control.formParameters.entId.value !== ""
			) {
				entId = FORM.Control.formParameters.entId.value;
				if (
					FORM.Control.formParameters.entName !== undefined &&
					FORM.Control.formParameters.entName.value != null &&
					FORM.Control.formParameters.entName.value !== ""
				) {
					entName = FORM.Control.formParameters.entName.value;
				}
			} else {
				const entContext = FT.WorkTasks.contextGet(FORM.Control, "ent");
				entId = entContext[0].entId;
				entName = entContext[0].entName;
			}

			FT.Common.windowEventListenerAdd("td", eventListener);

			// Get job progress of the running work order on the entity
			const jobProgressData = getJobProgressData(entName, FT.Common.MES_JOB_STATE_CD.running);

			// Check if job progress data is defined
			if (jobProgressData != null && jobProgressData.length > 0) {
				// Update the widget with the job progress data
				_controls.wwJobProgress.widgetProperties.data = JSON.stringify(jobProgressData);
			}

			// Set OEE data
			setOEEData(entId);
		}

		function eventListener(event) {
			if (event.detail.data[0].module_event) {
				moduleEvent = event.detail.data[0].module_event;
				const eventModules = event.detail.data[0].module.split("|");

				// Loop through each module and attach a listener
				eventModules.forEach((module) => {
					FT.Common.windowEventListenerAdd(module, formEventListener);
				});

				if (
					event.detail.subType === "task.select" &&
					event.detail.sourceType === FT.Common.EVENT_SOURCE_TYPE.form &&
					event.detail.data[0].type.toUpperCase() === "JOB" &&
					event.detail.data[0].state_desc.toUpperCase() === "RUNNING"
				) {
					// Set job progress of the running work order on the entity
					const jobProgressData = JSON.stringify(getJobProgressData(entName, FT.Common.MES_JOB_STATE_CD.running));
					if (jobProgressData.length > 0) {
						_controls.wwJobProgress.widgetProperties.data = jobProgressData;
					}
					// Set OEE data
					setOEEData(entId);
				}
				// FT.Common.windowEventListenerAdd(event.detail.data[0].module, formEventListener);
			}
		}

		function formEventListener(event) {
			// Split the module_event string into an array
			const eventList = moduleEvent.split("|");

			// Check if event.detail.subType matches any value in the array
			if (eventList.includes(event.detail.subType)) {
				// Set job progress of the running work order on the entity
				const jobProgressData = JSON.stringify(getJobProgressData(entName, FT.Common.MES_JOB_STATE_CD.running));
				if (jobProgressData.length > 0) {
					_controls.wwJobProgress.widgetProperties.data = jobProgressData;
				}
				// Set OEE data
				setOEEData(entId);
			}
		}

		/**
		 * Get work order detail for displaying it on the progress bar
		 * @param {string} entity
		 * @param {string} status
		 * @returns {Arrray} Job progress data
		 */
		function getJobProgressData(entity, status) {
			let jobProgressData = "";
			try {
				const parameterCollection = { ent_name: entity, status: status };
				jobProgressData = FT.WebApi.mesGetSync("api/V3/DirectAccess", "SP_S_JM_Job_Progress", parameterCollection, false);
				if (jobProgressData === "" && jobProgressData === "" && jobProgressData.length === 0) {
					throw new Error("@@Lookup_Not_Found@@");
				}
			} catch (exception) {
				handleScriptError(exception);
			} finally {
				logExecutionTime();
			}

			if (jobProgressData && jobProgressData.length > 1) {
				// Get the context of the current job that was set on Card selection //
				const jobContext = FT.WorkTasks.contextGet(FORM.Control, "job");

				// scan the returned dataset: if only 1 record that is it -- if multiple records pick the one corresponding to job card selected //
				let jobContextData = null;
				jobProgressData.forEach((job) => {
					if (job.wo_id === jobContext[0].woId && job.oper_id === jobContext[0].operId && job.seq === jobContext[0].seqNo) {
						jobContextData = job;
					}
				});
				// re-init the dataset with the only job //
				if (jobContextData) {
					jobProgressData.splice(1, Infinity);
					jobProgressData[0] = jobContextData;
				}
			}
			if (jobProgressData != null && jobProgressData.length > 0) {
				// Translate the job progress data
				const fields = [
					FT.Ui.translationColumnField("entity", FT.Ui.TRANSLATION_GROUPS.grpEntDescription, ["entity"]),
					FT.Ui.translationColumnField("item_desc", FT.Ui.TRANSLATION_GROUPS.grpItemItemDesc, ["item"]),
					FT.Ui.translationColumnField("job_desc", FT.Ui.TRANSLATION_GROUPS.grpOperOperDesc, FT.Ui.TRANSLATION_KEYS.keyOper),
					FT.Ui.translationColumnField("status", FT.Ui.TRANSLATION_GROUPS.grpJobStateStateDesc, ["status"]),
				];
				jobProgressData = FT.Ui.translateArray(jobProgressData, fields);
			}
			return jobProgressData;
		}

		/**
		 * Set current Shift OEE
		 * @param {int} entId
		 * @returns
		 */
		function setOEEData() {
			const parameterCollection = {
				ent_id: entId,
			};
			let OEEData = "";
			OEEData = FT.WebApi.mesGetSync("api/V3/DirectAccess", "sp_S_JM_Ent_Kpi", parameterCollection, false);
			if (OEEData.length === 0) {
				throw new Error("@@Lookup_Not_Found@@");
			}
			_controls.wwOEE.widgetProperties.data = JSON.stringify(OEEData);
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
		 * log execution time in skelta
		 */
		function logExecutionTime() {
			const skFnExecutionStartTime = new Date();
			FT.WorkTasks.logMessage("TD - execution time: " + (new Date() - skFnExecutionStartTime) + "ms");
		}

		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
		};
	}
})(window);
