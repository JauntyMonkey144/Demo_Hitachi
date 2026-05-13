/*
Name:        	JM_UI_JobQueue.js
Description: 	Job Management js file containing logic pertaining to the JM_UI_JobQueue form.

Ver		Release	 	By						Date				Change Description
001		00.50		 	Fayaz				2024-05-03	#2895 First version.
002		00.50		 	Praveen			2024-06-18	#2895 Added function "enableButton" to handle button logic.
003 	00.50		 	Praveen     2024-07-29  #3212 Added Paramater grpID to getNavigationData function.
004 	00.50		 	Praveen     2024-07-31  #3242 Added Date format filtering properly.
005 	00.50		 	Ramesh V    2024-08-07  #3265 Changed the file name JM_UI_Queue to UC_JM_UI_JobManagement.
006 	00.50		 	Shamanth S  2024-08-22  # Added logic to load bom details form.
007 	00.50		 	Somya S  		2024-10-14  # Added logic to send the states as Array
008 	00.70		 	Shamanth S  2024-10-15  #3759 Removed getLookupSchemaAndData and accessing data using Web Api.
009 	00.70		 	Praveen     2024-11-21  #3944 Error when switching the state filter selection.
010 	00.70		 	Fayaz A     2024-12-02  #3943 Updated loadJobQueue function to remove lastNoHrs parameter.
011 	00.70		 	Fayaz A			2025-01-27	#4192 Updated wwJobNavigationSetData function to user enity name from context
							 														logged in user id. Updated hfJobActionOnDataChange function to use
							 														column alias command and form_name.
012 	00.70		 	Chitta			2025-02-06	#4242 fot time filter , api api/v3/JobQueue will take no of hrs in int type
013 	01.00		 	Fayaz A   	2025-02-20  #4116 Moved from use case to module level, UC_JM_UI_JobManagement to JM_UI_JobQueue.
014		01.00		 	Praveen			2025-02-21	#4268 Added logic visibilitity Time filter control.
015		01.00		 	Praveen			2025-02-21	#4339 Add logic in lastNoHrs parameter.
016		01.00		 	Bas					2025-02-21	#4253 Translate the MD in the job queue table and job state filter.
017		01.00		 	Bas					2025-02-21	#4253 Removed typos in translation group definitions.
018	  01.00	 	 	Fayaz A			2025-02-25	#3982 Updated function wwTimeFilterLoad to load widget data from JM_TIME_FILTER_DATA,
							 																Updated function getEntShiftsData to ceil the value
							 																of start and current time diff instead of floor.
020		01.00		 	Usha M			2025-02-27	#4355 Removed console.log
021		01.00		 	Fayaz A			2025-03-10	#4170 When the are no jobs data returned all the job actions(except refresh and details)
							 																are made inactive
022		01.00		 	Fayaz A			2025-03-27	#4632 For grid, selected row, null check is included in function the wwJobQueueOnDataChange.
023		01.01.00 	Fayaz A			2025-05-14	#4955 The function hfJobActionOnDataChange was updated to set the selected command value
							 																in the filterData context.
024		01.01.00 	Fayaz A			2025-05-22	#4955 Parent code value logic is added in hfJobActionOnDataChange function to set "CODE" value.
025		01.02.00 	Fayaz A			2025-06-30	#5091 Function wwJobStatesOnDataChange is updated to check if there is change in selected states.
026		01.02.00	Somya S		2025-06-30			#5069	Added the showloader and hideloader function
027		02.00.00	Praveen			2025-12-15	#5270 Added job split functionality
*/

// const { last } = require("prelude-ls");

((window) => {
	//  ------------------------------ Global Variables ------------------------------------
	window.JM = window.JM || {};
	JM.JobQueue = JM.JobQueue || {};
	JM.JobQueue = JobQueue();
	//  ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */

	function JobQueue() {
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
		let entName = "";
		let mesUserId = "";
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
			const filterData = FT.WorkTasks.contextGet(FORM.Control, "filterData");
			commandSelected = filterData.find((item) => item.type === "commandSelected");
			if (commandSelected) {
				commandSelected = JSON.parse(commandSelected.jsonValue);
				// Sample code to access context properties
				codeValue = commandSelected.code;
			}
			setJobStates();
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

			// Translate the job states.
			const fields = [FT.Ui.translationColumnField("display", FT.Ui.TRANSLATION_GROUPS.grpJobStateStateDesc, ["display"])];
			formattedJobStates = FT.Ui.translateArray(formattedJobStates, fields);

			// Pass the translated and formatted job states to the filter dropdown.
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
				entId: ent,
				woId: "",
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
				//	lastNhrs: _controls.wwTimeFilter.value === "shift" ? getEntShiftsData(ent) : parseInt(_controls.wwTimeFilter.value, 10),
				lastNhrs: getLastNhrs(jobStates, ent),
			};
			FT.WebApi.mesGetAsync("api/v3/JobQueue", "", parameterColl, false).then(
				(data) => {
					hidePageLoader();
					// Handle successful response data
					if (data.length > 0) {
						// Translate the data
						const fields = [
							FT.Ui.translationColumnField("Run_Ent_name", FT.Ui.TRANSLATION_GROUPS.grpEntDescription, ["Run_Ent_name"]),
							FT.Ui.translationColumnField("ent_name", FT.Ui.TRANSLATION_GROUPS.grpEntDescription, FT.Ui.TRANSLATION_KEYS.keyEnt),
							FT.Ui.translationColumnField(
								"item_class_desc",
								FT.Ui.TRANSLATION_GROUPS.grpItemClassItemClassDesc,
								FT.Ui.TRANSLATION_KEYS.keyItemClass,
							),
							FT.Ui.translationColumnField("item_desc", FT.Ui.TRANSLATION_GROUPS.grpItemItemDesc, FT.Ui.TRANSLATION_KEYS.keyItem),
							FT.Ui.translationColumnField("oper_desc", FT.Ui.TRANSLATION_GROUPS.grpOperOperDesc, FT.Ui.TRANSLATION_KEYS.keyOper),
							FT.Ui.translationColumnField(
								"oper_display",
								FT.Ui.TRANSLATION_GROUPS.grpOperOperDesc,
								FT.Ui.TRANSLATION_KEYS.keyOper,
							),
							FT.Ui.translationColumnField("state_desc_h", FT.Ui.TRANSLATION_GROUPS.grpJobStateStateDesc, ["state_desc_h"]),
							FT.Ui.translationColumnField("uom_description", FT.Ui.TRANSLATION_GROUPS.grpUomDescription, ["uom_description"]),
							FT.Ui.translationColumnField("wo_desc", FT.Ui.TRANSLATION_GROUPS.grpWoWoDesc, FT.Ui.TRANSLATION_KEYS.keyWo),
						];
						const translatedData = FT.Ui.translateArray(data, fields);

						// Assign translated data to the grid.
						_controls.wwJobQueue.widgetProperties.data = JSON.stringify(translatedData);
					} else {
						_controls.wwJobQueue.widgetProperties.data = JSON.stringify([]);
						_controls.hfJobAction.value = JSON.stringify([]);
						_controls.wwJobNavigation.widgetProperties.float = "right";
						_controls.wwJobNavigation.widgetProperties.command =
							"view,start,ready,suspend,hold,cancel,complete,delete,edit,bom,split";
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
					_controls.wwJobNavigation.widgetProperties.selectedValue = jobActionData;
					_controls.wwJobNavigation.widgetProperties.float = "right";
				} else {
					_controls.epJobDetail.url = "";
					_controls.epJobDetail.url = selectedAction.form_name !== undefined ? SFU.getFormUrl(selectedAction.form_name) : "";
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

		/**
		 * Function to set job navigation commands (to enable and disable) based on job state
		 * @param {string} strStatus
		 */
		function enableButton(strStatus) {
			const intJobState = parseInt(strStatus, 10);
			// _controls.wwJobNavigation.widgetProperties.command = "{}";
			if (intJobState === FT.Common.MES_JOB_STATE_CD.complete) {
				_controls.wwJobNavigation.widgetProperties.command = "ready,start,edit,suspend,hold,cancel,complete";
			} else if (intJobState === FT.Common.MES_JOB_STATE_CD.canceled) {
				_controls.wwJobNavigation.widgetProperties.command = "start,ready,suspend,hold,cancel,complete,edit";
			} else if (intJobState === FT.Common.MES_JOB_STATE_CD.suspended) {
				_controls.wwJobNavigation.widgetProperties.command = "suspend";
			} else if (intJobState === FT.Common.MES_JOB_STATE_CD.running) {
				_controls.wwJobNavigation.widgetProperties.command = "start,ready,cancel,delete,edit";
			} else if (intJobState === FT.Common.MES_JOB_STATE_CD.ready) {
				_controls.wwJobNavigation.widgetProperties.command = "ready,suspend,hold,complete";
			} else if (intJobState === FT.Common.MES_JOB_STATE_CD.new) {
				_controls.wwJobNavigation.widgetProperties.command = "start,suspend,hold,complete";
			} else if (intJobState === FT.Common.MES_JOB_STATE_CD.onHold) {
				_controls.wwJobNavigation.widgetProperties.command = "suspend,hold,complete";
			}
			let getCommand = _controls.wwJobNavigation.widgetProperties.command;

			const jobQueueRow = JSON.parse(_controls.wwJobQueue.widgetProperties.selectedRow);
			if (!(Number(jobQueueRow.qty_reqd) > Number(jobQueueRow.qty_prod))) {
				getCommand += ",split";
				_controls.wwJobNavigation.widgetProperties.command = getCommand;
			}
			if (
				_controls.wwJobNavigation.widgetProperties.command
					.split(",")
					.includes(JSON.parse(_controls.wwJobNavigation.value).command.toLowerCase()) === true
			) {
				// _controls.wwJobNavigation.widgetProperties.selectedValue = "view";
				_controls.wwJobNavigation.widgetProperties.command = getCommand;
			}
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
