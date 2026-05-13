/*
Name:        	UC_JM_UI_JobQueueWithChilds.js
Description: 	UC_JM_UI_JobQueueWithChilds.js file containing logic pertaining to the UC_JM_UI_JobQueueWithChilds form.

Ver	 	Release		By				Date						Change Description
001	 	00.70    	Usha M		2025-01-24			Copy of UC_JM_UI_JobManagement.js file
002		00.70			Usha M		2025-01-24			Updated sp_S_Job_GetJobWithChilds in LoadJobQueue Function
003	  01.00	  	Fayaz A		2025-02-25	    #3982 Updated function wwTimeFilterLoad to load widget data from JM_TIME_FILTER_DATA,
																							Updated function getEntShiftsData to ceil the value
																							of start and current time diff instead of floor.
004		01.00			Usha M		2025-02-27			#4355 Removed console.log
005		01.00			Usha M		2025-03-07			#4455 Updated NAVIGATON_GRPID and NAVIGATON_FOR with correct values.
006		01.00			Fayaz A		2025-03-12			#4181 Rename sp_S_Job_GetJobWithChilds to sp_SA_UC_JM_Job_WithChildEnt,
																						Using ft.fn_SA_Ent_Hierarchy for ent childs.
007		01.00			Fayaz A		2025-03-28			#4743 Updated all the changes from JM_UI_JobQueue.
008		01.01.00	Fayaz A		2025-05-14			#4955 The function hfJobActionOnDataChange was updated to set the selected command value
																							in the filterData context.
009		01.01.00  Fayaz A		2025-05-22			#4955 Parent code value logic is added in hfJobActionOnDataChange function to set "CODE" value.
010		01.02.00	Somya S		2025-06-30			#5069	Added the showloader and hideloader function
011		01.02.00 	Fayaz A		2025-06-30			#5091 Function wwJobStatesOnDataChange is updated to check if there is change in selected states.
012   01.02.00	Somya S 	2025-07-07			#5085 Added can_runjob check to enable the commands.
013		02.00.00	Praveen			2025-12-15	#5270 Added job split functionality 
*/

((window) => {
	//  ------------------------------ Global Variables ------------------------------------
	window.JM = window.JM || {};
	JM.UcJmJobQueueWithChilds = JM.UcJmJobQueueWithChilds || {};
	JM.UcJmJobQueueWithChilds = UcJmJobQueueWithChilds();
	//  ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */

	function UcJmJobQueueWithChilds() {
		//  ---------------------------- Constant Variables ----------------------------------
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;
		const NAVIGATON_GRPID = "JM_JobButtonBar";
		const NAVIGATON_FOR = "JmJobQueue";
		const JM_EVENTS =
			"jm.job.bomdetails|jm.job.cancel|jm.job.delete|jm.job.details|jm.job.update|jm.job.end|jm.job.hold" +
			"|jm.job.lotset|jm.job.ready|jm.job.start|jm.step.complete|jm.step.start|jm.job.suspend|jm.job.split";
		const JM_MODULE = "jm";
		const JM_TIME_FILTER_DATA =
			'[{"orderby":1,"text":"Custom","value":"CUSTOM","start_time":"","end_time":"","start_time_readonly":0,"end_time_readonly":1}' +
			',{"orderby":2,"text":"1H","value":"1","start_time":"","end_time":"","start_time_readonly":0,"end_time_readonly":0}' +
			',{"orderby":3,"text":"12H","value":"12","start_time":"","end_time":"","start_time_readonly":0,"end_time_readonly":0}' +
			',{"orderby":5,"text":"Current shift","value":"shift","start_time":"","end_time":"",' +
			'"start_time_readonly":0,"end_time_readonly":0,"to_refresh":"xxCurDate"}' +
			"]";
		//  ----------------------------------------------------------------------------------

		//  ----------------------------- Private Variables ----------------------------------
		const _controls = {};
		let entId = "";
		let userInfo = "";
		let jobStatesSelected = "";
		let jobActionData = "";
		let commandSelected = ""; // Variable to hold the selected command's action details, including configured properties and their values
		let codeValue = ""; // Variable to hold the value of 'code' column from use case composability.
		//  ----------------------------------------------------------------------------------

		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			//  Initialize variables
			FORM.Control = Control;
			_controls.wwJobNavigation = FORM.Control.findByXmlNode("WWJN");
			_controls.wwJobQueue = FORM.Control.findByXmlNode("WWJQ");
			_controls.wwJobStates = FORM.Control.findByXmlNode("WWS");
			_controls.wwTimeFilter = FORM.Control.findByXmlNode("WWTF");
			_controls.hfJobAction = FORM.Control.findByXmlNode("HFJA");
			_controls.hfJobRow = FORM.Control.findByXmlNode("HFJR");
			_controls.epJobDetail = FORM.Control.findByXmlNode("EPJD");
			_controls.formParameters = FORM.Control.formParameters;
			//  Include js files
			includeJsFiles();

			//  Include js files via ajax
			includeJsFilesAjax();

			//  Include CSS files
			includeCssFiles();

			//  Add code here
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
			isPageLoad = true;
			userInfo = FT.WorkTasks.userInfo();
			mesUserId = userInfo.MESUserId !== undefined ? userInfo.MESUserId : null;

			entId = FT.WorkTasks.contextGet(_controls, "entId");

			if (entId != null && entId !== "") {
				entName = FT.WorkTasks.contextGet(_controls, "entName");
			} else {
				const entContext = FT.WorkTasks.contextGet(FORM.Control, "ent");
				entId = entContext[0].entId;
				entName = entContext[0].entName;
			}
			getRunnableEntityNames();
			const eventData = FT.WorkTasks.contextGet(FORM.Control, "eventData");
			commandSelected = eventData.find((item) => item.type === "commandSelected");
			if (commandSelected) {
				commandSelected = JSON.parse(commandSelected.jsonValue);
				// Sample code to access context properties
				codeValue = commandSelected.code;
			}
			setJobStates();
			// _controls.wwJobNavigation.widgetProperties.selectedValue = "view";
			_controls.wwJobNavigation.widgetProperties.float = "right";
			_controls.wwJobNavigation.widgetProperties.command = "start,ready,suspend,hold,cancel,complete,delete,edit,bom,split";
			wwJobNavigationSetData(NAVIGATON_GRPID, NAVIGATON_FOR, entName, mesUserId);
			wwTimeFilterLoad();
			_controls.wwTimeFilter.visible = false;
			// subscribe to the JM events to update grid
			FT.Common.windowEventListenerAdd(JM_MODULE, jmEventListener);
		}

		/**
		 * listens to events that have to be reacted upon by job navigation to refresh
		 */
		function jmEventListener(event) {
			// Split the module_event string into an array
			const eventList = JM_EVENTS.split("|");

			// Check if event.detail.subType matches any value in the array
			if (eventList.includes(event.detail.subType)) {
				loadJobQueue(entId, jobStatesSelected);
			}
		}
		/**
		 * Set Job States to wwWidgetState from FT Common
		 * @returns
		 */
		function setJobStates() {
			const filterKeys = ["bypassed", "superseded"];
			const ftCommonJobStates = Object.entries(FT.Common.MES_JOB_STATE_CD)
				.filter(([key]) => !filterKeys.includes(key))
				.map(([key, value]) => ({
					display: key.toLocaleUpperCase(),
					value: String(value),
				}));
			// Define group and title for the MultiSelectionFilter
			const group = "State";
			const title = "State";

			// Transforming to the desired format, focusing only on "State"
			let formattedJobStates = ftCommonJobStates.map((item) => ({
				group: group,
				Title: title,
				value: parseInt(item.value, 10), // Convert string to number
				display: item.display,
			}));
			// Translate the job states
			const fields = [FT.Ui.translationColumnField("display", FT.Ui.TRANSLATION_GROUPS.grpJobStateStateDesc, ["display"])];
			formattedJobStates = FT.Ui.translateArray(formattedJobStates, fields);

			// Assign the job states to the filter
			_controls.wwJobStates.widgetProperties.data = JSON.stringify(formattedJobStates);
		}
		/**
		 * On JobState selection change
		 * @returns
		 */
		function wwJobStatesOnDataChange() {
			if (jobStatesSelected !== _controls.wwJobStates.value) {
				jobStatesSelected = _controls.wwJobStates.value;
				if (
					jobStatesSelected !== "" &&
					jobStatesSelected.State.every(
						(woState) =>
							woState === FT.Common.MES_JOB_STATE_CD.complete.toString() ||
							woState === FT.Common.MES_JOB_STATE_CD.canceled.toString(),
					)
				) {
					_controls.wwTimeFilter.visible = true;
				} else {
					_controls.wwTimeFilter.visible = false;
				}
				loadJobQueue(entId, jobStatesSelected);
			}
		}
		/**
		 * Get shift schedule time details for displaying it on the  widget
		 * @param {integer} shift_configured
		 * @returns {JSON}  data
		 */
		function wwTimeFilterLoad() {
			const currentTime = new Date();
			_controls.wwTimeFilter.widgetProperties.data = JM_TIME_FILTER_DATA.replace("xxCurDate", currentTime);
		}
		/**
		 * On TimeFilter selection change
		 * @returns
		 */
		function wwTimeFilterOnDataChange() {
			loadJobQueue(entId, jobStatesSelected);
		}
		/**
		 * Set navigation data from the config table
		 * @param {string} entity [optional]
		 * @param {string} grpId Group Id
		 * @param {string} category Navigation filter
		 * @param {string} entityName filter
		 * @param {string} userId filter
		 * @param {string} itemId filter
		 * @param {string} woId filter
		 * @param {string} operId filter
		 * @param {string} seqNo filter
		 * @returns
		 */
		function wwJobNavigationSetData(grpId, category, entityName, userId, itemId, woId, operId, seqNo) {
			try {
				const parameterCollection = {
					grp_id: grpId,
					category: category,
					ent_name: entityName,
					user_id: userId,
					item_id: itemId !== undefined ? itemId : null,
					wo_id: woId !== undefined ? woId : null,
					oper_id: operId !== undefined ? operId : null,
					seq_no: seqNo !== undefined ? seqNo : null,
				};
				const jobActionsData = FT.WebApi.mesGetSync("api/V3/DirectAccess", "sp_SA_FT_Config_Actions", parameterCollection, false);

				if (jobActionsData.length > 0) {
					jobActionsData[0].cfg_desc = Date().toString();
					jobActionData = JSON.stringify(jobActionsData[0]);
					_controls.wwJobNavigation.widgetProperties.selectedValue = jobActionData;
					_controls.wwJobNavigation.widgetProperties.float = "right";
					_controls.wwJobNavigation.widgetProperties.data = JSON.stringify(jobActionsData);
				}
			} catch (exception) {
				handleScriptError(exception);
			}
		}

		/**
		 * Displays the page-level loader animation.
		 *
		 * Handles both WorkTasks device and non-WorkTasks scenarios.
		 * Uses form_name from hfJobAction to set the data-skpage.
		 *
		 * @returns {void}
		 */
		function showPageLoader() {
			try {
				if (skelta.DeviceOS === "WorkTasks") {
					window.top.showLoader();
				} else {
					const $loader = $("#skloader");

					if ($loader.length > 0) {
						// Append loader object if needed
						if ($loader[0].childNodes.length === 0 && typeof n !== "undefined") {
							const loaderObj = n.getLoaderObject();
							$loader[0].appendChild(loaderObj);
						}

						// Try getting form_name from _controls.hfJobAction
						try {
							const actionVal = _controls.hfJobAction.value;
							if (actionVal) {
								const form = JSON.parse(actionVal);
								if (form.form_name) {
									const formUrl = SFU.getFormUrl(form.form_name);
									$loader.attr("data-skpage", formUrl);
								}
							}
						} catch (error) {
							throw new Error("Failed to parse form_name from hfJobAction: " + error.message);
						}

						$loader.attr("data-skloader", "1");
					}
				}
			} catch (exception) {
				handleScriptError(exception);
			}
		}

		/**
		 * Hides the page-level loader animation.
		 *
		 * If the device is "WorkTasks", it delegates the call to the parent window's loader.
		 * Otherwise, it simply marks the loader as hidden using a DOM attribute.
		 *
		 * @returns {void}
		 */
		function hidePageLoader() {
			try {
				if (skelta.DeviceOS === "WorkTasks") {
					window.top.hideLoader();
				} else {
					$("#skloader").attr("data-skloader", "0");
				}
			} catch (exception) {
				handleScriptError(exception);
			}
		}

		/**
		 * Function to load Job Queue for an entity and assign data to grid widget
		 * @param {string} ent Entity Id
		 * @param {string} jobState job states to be filtered out seperated with comma
		 */
		function loadJobQueue(ent, jobStates) {
			showPageLoader();
			const parameterColl = {
				ent_id: ent,

				newState:
					Array.isArray(jobStates.State) === true
						? jobStates !== "" && jobStates.State.includes(FT.Common.MES_JOB_STATE_CD.new.toString())
						: false,
				readyState:
					Array.isArray(jobStates.State) === true
						? jobStates !== "" && jobStates.State.includes(FT.Common.MES_JOB_STATE_CD.ready.toString())
						: false,
				runningState:
					Array.isArray(jobStates.State) === true
						? jobStates !== "" && jobStates.State.includes(FT.Common.MES_JOB_STATE_CD.running.toString())
						: false,
				completeState:
					Array.isArray(jobStates.State) === true
						? jobStates !== "" && jobStates.State.includes(FT.Common.MES_JOB_STATE_CD.complete.toString())
						: false,
				suspendedState:
					Array.isArray(jobStates.State) === true
						? jobStates !== "" && jobStates.State.includes(FT.Common.MES_JOB_STATE_CD.suspended.toString())
						: false,
				onholdState:
					Array.isArray(jobStates.State) === true
						? jobStates !== "" && jobStates.State.includes(FT.Common.MES_JOB_STATE_CD.onHold.toString())
						: false,
				cancelledState:
					Array.isArray(jobStates.State) === true
						? jobStates !== "" && jobStates.State.includes(FT.Common.MES_JOB_STATE_CD.canceled.toString())
						: false,

				lastNHrs: getLastNhrs(jobStates, ent),
			};

			// FT.WebApi.mesGetAsync("api/v3/JobQueue", "", parameterColl, false).then(
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_UC_JM_Job_WithChildEnt", parameterColl, false).then(
				(data) => {
					// Handle successful response data
					hidePageLoader();
					if (data.length > 0) {
						let jobData = data;
						const fields = [FT.Ui.translationColumnField("job_desc", FT.Ui.TRANSLATION_GROUPS.grpJobDesc, ["job_desc"])];
						jobData = FT.Ui.translateArray(jobData, fields);

						_controls.wwJobQueue.widgetProperties.data = JSON.stringify(jobData);
					} else {
						_controls.wwJobQueue.widgetProperties.data = JSON.stringify([]);
						_controls.hfJobAction.value = JSON.stringify([]);
						_controls.wwJobNavigation.widgetProperties.float = "right";
						_controls.wwJobNavigation.widgetProperties.command = "view,start,ready,suspend,hold,cancel,complete,delete,edit,bom";
						_controls.epJobDetail.url = "";
					}
				},
				(error) => {
					hidePageLoader();
					// Handle error
					throw new Error("Error:", error);
				},
			);
		}
		/**
		 * Determines the number of hours for the given entity based on job states and time filter.
		 *
		 * If all job states are either "complete" or "canceled", it checks the value of the time filter:
		 * - If the filter is "shift", it retrieves shift data for the entity.
		 * - Otherwise, it parses the value of the time filter as an integer.
		 * If the job states do not meet the criteria, it returns a default value of `0`.
		 *
		 * @param {Object} jobStates - The job states to evaluate.
		 * @param {Object} ent - The entity whose shift data may be retrieved.
		 *
		 * @returns {number} The calculated number of hours based on the job state and filter.
		 */
		function getLastNhrs(jobStates, ent) {
			let lastNhrs;
			let jobStateFilter;
			if (
				jobStates !== "" &&
				jobStates.State.every(
					(jobState) =>
						jobState === FT.Common.MES_JOB_STATE_CD.complete.toString() ||
						jobState === FT.Common.MES_JOB_STATE_CD.canceled.toString(),
				)
			) {
				jobStateFilter = 1;
			} else {
				jobStateFilter = 0;
			}

			if (jobStateFilter === 1) {
				if (_controls.wwTimeFilter.value === "shift") {
					lastNhrs = getEntShiftsData(ent);
				} else {
					lastNhrs = parseInt(_controls.wwTimeFilter.value, 10);
				}
			} else {
				lastNhrs = jobStateFilter;
			}

			return lastNhrs;
		}
		/**
		 * Get shift schedule details
		 * @param {integer} entId
		 * @returns {integer} data
		 */
		function getEntShiftsData(entIdvalue) {
			let shiftStart;
			let lastNHours = 8;
			const currentTime = new Date();
			const parameterColl = {};
			const entShiftData = FT.WebApi.mesGetSync("api/entity/" + entIdvalue + "/shiftHistory", "", parameterColl, false);
			if (entShiftData && entShiftData.length > 0) {
				const dateTimeValue = entShiftData[1].shift_start_utc;
				if (typeof dateTimeValue === "string" || dateTimeValue instanceof String) {
					shiftStart = new Date(dateTimeValue);
				} else {
					shiftStart = SFU.getDateTimeInServerUTCFormat(new Date(dateTimeValue));
				}
				const timezoneOffset = currentTime.getTimezoneOffset();
				shiftStart.setMinutes(shiftStart.getMinutes() - timezoneOffset);
				const diff = (currentTime.getTime() - shiftStart.getTime()) / 3600000;
				lastNHours = Math.abs(Math.ceil(diff));
			}
			return lastNHours;
		}
		/**
		 * Function to assign JobNavigation widget value to JobAction Hidden Field value
		 */
		function wwJobActionOnDataChange() {
			_controls.hfJobAction.value = _controls.wwJobNavigation.value != null ? _controls.wwJobNavigation.value : "";
		}

		/**
		 * Function to load corrosponding form for the selected job action
		 */
		function hfJobActionOnDataChange() {
			const selectedAction = JSON.parse(_controls.hfJobAction.value);
			if (selectedAction.code === "**PC**") {
				selectedAction.code = codeValue;
				const filterDataObj = [{ type: "commandSelected", jsonValue: JSON.stringify(selectedAction) }];
				FT.WorkTasks.contextSet("", "filterData", JSON.stringify(filterDataObj));
			} else {
				const filterDataObj = [{ type: "commandSelected", jsonValue: JSON.stringify(selectedAction) }];
				FT.WorkTasks.contextSet("", "filterData", JSON.stringify(filterDataObj));
			}
			let jobQueueRow = _controls.hfJobRow.value;
			if (jobQueueRow !== "" && _controls.hfJobRow.value !== "") {
				jobQueueRow = JSON.parse(_controls.hfJobRow.value);

				// update selected job details to context
				const woObj = [
					{
						woId: jobQueueRow.wo_id,
						processId: jobQueueRow.process_id,
						bomVerId: null,
						specVerId: null,
						itemId: jobQueueRow.item_id,
						reqQty: jobQueueRow.req_qty,
					},
				];
				FT.WorkTasks.contextSet("", "wo", JSON.stringify(woObj));

				const jobObj = [
					{
						woId: jobQueueRow.wo_id,
						seqNo: jobQueueRow.seq_no,
						operId: jobQueueRow.oper_id,
					},
				];
				FT.WorkTasks.contextSet("", "job", JSON.stringify(jobObj));

				const bomObj = [
					{
						woId: jobQueueRow.wo_id,
						seqNo: jobQueueRow.seq_no,
						operId: jobQueueRow.oper_id,
					},
				];
				FT.WorkTasks.contextSet("", "jobBom", JSON.stringify(bomObj));

				if (selectedAction.command === "refresh") {
					_controls.epJobDetail.url = "";

					loadJobQueue(entId, jobStatesSelected);
					// _controls.wwJobNavigation.widgetProperties.selectedValue = "view";
					_controls.wwJobNavigation.widgetProperties.float = "right";
				} else {
					_controls.epJobDetail.url = "";
					_controls.epJobDetail.url = selectedAction.form_name !== undefined ? SFU.getFormUrl(selectedAction.form_name) : "";
				}
				if (jobQueueRow && selectedAction.command !== "refresh") {
					const stateCd = jobQueueRow.state_cd;
					enableButton(stateCd);
				}
			}
		}

		/**
		 * Function to assign JobQueue widget value to JobRow Hidden Field value
		 */
		function wwJobQueueOnDataChange() {
			const jobQueueRow = JSON.parse(_controls.wwJobQueue.widgetProperties.selectedRow);
			_controls.hfJobRow.value =
				_controls.wwJobQueue.widgetProperties.selectedRow != null ? _controls.wwJobQueue.widgetProperties.selectedRow : "";

			wwJobNavigationSetData(
				NAVIGATON_GRPID,
				NAVIGATON_FOR,
				entName,
				mesUserId,
				jobQueueRow && jobQueueRow.item_id !== undefined ? jobQueueRow.item_id : null,
				jobQueueRow && jobQueueRow.wo_id !== undefined ? jobQueueRow.wo_id : null,
				jobQueueRow && jobQueueRow.oper_id !== undefined ? jobQueueRow.oper_id : null,
				jobQueueRow && jobQueueRow.seq_no !== undefined ? jobQueueRow.seq_no : null,
			);
			if (_controls.wwJobQueue.widgetProperties.selectedRow) {
				enableButton(JSON.parse(_controls.wwJobQueue.widgetProperties.selectedRow).state_cd);
			}

			wwJobActionOnDataChange();
			hfJobActionOnDataChange();
		}
		let isRunJobEnabled = false;

		function getRunnableEntityNames() {
			return FT.WebApi.mesGetAsync("api/V3/Entity", "", {}, false)
				.then((data) => {
					if (!data || !data.length) {
						throwerror("No entities returned.");
						isRunJobEnabled = false;
						return;
					}

					const entContext = FT.WorkTasks.contextGet(FORM.Control, "ent");

					if (!entContext || !entContext[0]) {
						throwerror("Entity context is missing.");
						isRunJobEnabled = false;
						return;
					}

					entId = entContext[0].entId;

					const matched = data.find((ent) => ent.ent_id === entId);

					isRunJobEnabled = matched && matched.can_run_jobs === true;
				})
				.catch((error) => {
					isRunJobEnabled = false;
				});
		}

		/**
		 * Function to set job navigation commands (to enable and disable) based on job state
		 * @param {string} strStatus
		 */
		function enableButton(strStatus) {
			let originalCommand;
			const intJobState = parseInt(strStatus, 10);
			// _controls.wwJobNavigation.widgetProperties.command = "{}";
			if (intJobState === FT.Common.MES_JOB_STATE_CD.complete) {
				originalCommand = "ready,start,edit,suspend,hold,cancel,complete";
			} else if (intJobState === FT.Common.MES_JOB_STATE_CD.canceled) {
				originalCommand = "start,ready,suspend,hold,cancel,complete,edit";
			} else if (intJobState === FT.Common.MES_JOB_STATE_CD.suspended) {
				originalCommand = "suspend";
			} else if (intJobState === FT.Common.MES_JOB_STATE_CD.running) {
				originalCommand = "start,ready,cancel,delete,edit";
			} else if (intJobState === FT.Common.MES_JOB_STATE_CD.ready) {
				originalCommand = "ready,suspend,hold,complete";
			} else if (intJobState === FT.Common.MES_JOB_STATE_CD.new) {
				originalCommand = "start,suspend,hold,complete";
			} else if (intJobState === FT.Common.MES_JOB_STATE_CD.onHold) {
				originalCommand = "suspend,hold,complete";
			}
			let command = originalCommand;
			if (!isRunJobEnabled) {
				const commandList = originalCommand.split(",").map((cmd) => cmd.trim().toLowerCase());
				if (!commandList.includes("start")) {
					commandList.push("start");
				}
				command = commandList.join(",");
			}
			const jobQueueRow = JSON.parse(_controls.wwJobQueue.widgetProperties.selectedRow);
            if (!(Number(jobQueueRow.qty_reqd) > Number(jobQueueRow.qty_prod))) {
				command+=",split";
			}
			_controls.wwJobNavigation.widgetProperties.command = command;
		}
		/**
		 * Function to set Widget CheckboxList visible script
		 */
		function wwJobStatesVisibleScripts(Control) {
			$(Control.findById("W3").domElement).parent().css("overflow", "visible");
			$(Control.findById("W3").domElement).parent().parent().css("overflow", "visible");
			$(Control.findById("W3").domElement).parent().closest("div[controlid='W3']").css("z-index", "9999999999");
			return true;
		}
		/**
		 * Function to set Panel Z - index
		 */
		function wwPanelVisibleScripts(formControl, panelId, indexValue) {
			$(formControl.findById(panelId).domElement).css("z-index", indexValue);
			return true;
		}
		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			wwJobActionOnDataChange: wwJobActionOnDataChange,
			hfJobActionOnDataChange: hfJobActionOnDataChange,
			wwJobQueueOnDataChange: wwJobQueueOnDataChange,
			getRunnableEntityNames: getRunnableEntityNames,
			wwJobStatesOnDataChange: wwJobStatesOnDataChange,
			wwTimeFilterOnDataChange: wwTimeFilterOnDataChange,
			wwJobStatesVisibleScripts: wwJobStatesVisibleScripts,
			wwPanelVisibleScripts: wwPanelVisibleScripts,
			wwJobNavigationSetData: wwJobNavigationSetData,
			showPageLoader: showPageLoader,
			hidePageLoader: hidePageLoader,
		};
	}
})(window);
