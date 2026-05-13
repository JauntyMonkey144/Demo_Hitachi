/*
Name:        	UC_PE_UI_UtilDashboard.js
Description: 	UC_PE_UI_UtilDashboard js file containing global logic pertaining to the UC_PE_UI_UtilDashboard Form.

Ver		Release		By				Date				Change Description
001		05.00	  	PR				2024-10-03	#3728 First version.
002		05.00	  	PR 	  		2024-10-16	#3763 Remove all lookups and update with Web api calls.
003		01.00	  	BB				2025-02-17	#4203 Use new selectById property to select the first row.
004		01.00	  	FA				2025-02-25	#3982 Updated wwTimeFilterLoad to load widget data from PE_TIME_FILTER_DATA
																			Updated to load entId and entName when the form is loaded,
																			instead of inside functions.
005		01.00	  	Usha M		2025-02-27	#4355 Removed console.log.
006		01.00			Bas van B	2025-02-27	#4203 Solved issues on row selection and applying filters.
007		01.00			Bas van B	2025-02-27	#4253 Translated machine chart and tabel MD.
008		01.01.00	Fayaz A	  2025-05-14	#4955 A global variable, commandSelected, is defined to fetch and hold the selected command's action
																					details from filterData context on form load.
009		01.01.00  Fayaz A		2025-05-22	#4955 Parent code value logic is added in wwNavbarWidgetOnClick function to set "CODE" value.
010		01.01.00	Fayaz A		2025-05-28	#5008 Localization key update to refer from FT runtime locale file.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.PE = window.PE || {};
	PE.UtilDashboard = PE.UtilDashboard || {};
	PE.UtilDashboard = UtilDashboard();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function UtilDashboard() {
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;
		const PE_EVENTS = "pe.utilHistory.assign|pe.utilHistory.split|pe.utilHistory.merge";
		const PE_MODULE = "pe";
		const PE_TIME_FILTER_DATA =
			'[{"orderby":2,"text":"1H","value":"1","start_time":"","end_time":"","start_time_readonly":0,"end_time_readonly":0}' +
			',{"orderby":3,"text":"12H","value":"12","start_time":"","end_time":"","start_time_readonly":0,"end_time_readonly":0}' +
			',{"orderby":4,"text":"24H","value":"24","start_time":"","end_time":"","start_time_readonly":0,"end_time_readonly":0,' +
			'"to_refresh":"xxCurDate"}' +
			"]";
		// ----------------------------------------------------------------------------------

		// ----------------------------- Private Variables ----------------------------------
		const _controls = {};
		let timeFilterCurShift =
			'{"orderby":5,"text":"Current shift","value":"shift","start_time":"xxStartTime","end_time":"xxEndTime",' +
			'"start_time_readonly":0,"end_time_readonly":0}';
		const NAVIGATON_GRPID = "PE_UtilButtonBar";
		const NAVIGATON_FOR = "PerformanceButton";
		let userInfo = "";
		let entName = "";
		let entId = "";
		let mesUserId = "";
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
			_controls.wwTimeFilter = FORM.Control.findByXmlNode("WWTF");
			_controls.wwPerformace = FORM.Control.findByXmlNode("WWPE");
			_controls.wwNavbar = FORM.Control.findByXmlNode("WWNAV");
			_controls.hfSelectedRow = FORM.Control.findByXmlNode("HFSR");
			_controls.embedPagePerformance = FORM.Control.findByXmlNode("EPP");
			_controls.wwGantt = FORM.Control.findByXmlNode("WWGT");

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
			try {
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

				wwNavbarLoad();
				wwTimeFilterLoad();
				_controls.wwGantt.widgetProperties.value1 = 1;
			} catch (exception) {
				handleScriptError(exception);
			}
			FT.Common.windowEventListenerAdd(PE_MODULE, peEventListener);
		}

		/**
		 * listens to events that have to be reacted upon by Navbar to refresh
		 */
		function peEventListener(event) {
			// Split the module_event string into an array
			const eventList = PE_EVENTS.split("|");

			// Check if event.detail.subType matches any value in the array
			if (eventList.includes(event.detail.subType)) {
				_controls.wwPerformace.widgetProperties.selectById = "";
				wwNavbarLoad();
				wwPerformanceListLoad();
				wwGanttLoad();
				_controls.wwGantt.value = "";
				_controls.embedPagePerformance.url = "";
			}
		}

		/**
		 * extracts relevant information from the selected value in the Time Filter widget and stores it in the filter contextSet.
		 * Get utilization details for displaying it on the widget
		 */
		function wwGanttLoad() {
		debugger
			const currentTime = new Date();
			const parameterCollection = {
				Ent_Name: entName,
				Start_Time_utc:
					_controls.wwTimeFilter.value === "shift"
						? new Date(currentTime).addHours(-getEntShiftsData(entId)).toString("yyyy-MM-dd HH:mm:ss")
						: _controls.wwTimeFilter.widgetProperties.start,
				End_Time_utc: currentTime.toString("yyyy-MM-dd HH:mm:ss"),
			};
			let utilLogData = FT.WebApi.mesGetSync("api/V3/DirectAccess", "sp_S_PE_Util_Log_Gantt", parameterCollection, false);
			if (utilLogData.length > 0) {
				_controls.wwGantt.widgetProperties.type =
					_controls.wwTimeFilter.widgetProperties.start + "|" + _controls.wwTimeFilter.widgetProperties.end;

				// Translate the reason descriptions
				const fields = [
					FT.Ui.translationColumnField("reason", FT.Ui.TRANSLATION_GROUPS.grpUtilReasReasDesc, ["reas_grp_desc", "reason"]),
				];
				utilLogData = FT.Ui.translateArray(utilLogData, fields);
				_controls.wwGantt.widgetProperties.data = JSON.stringify(utilLogData);
			}
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
		 * Get Navigation details for displaying it on the Navbar widget
		 */
		function wwNavbarLoad() {
			userInfo = FT.WorkTasks.userInfo();
			mesUserId = userInfo.MESUserId !== undefined ? userInfo.MESUserId : null;
			wwNavigationSetData(NAVIGATON_GRPID, NAVIGATON_FOR, entName, mesUserId);
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
		function wwNavigationSetData(grpId, category, entityName, userId, itemId, woId, operId, seqNo) {
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
				const utilActionsData = FT.WebApi.mesGetSync(
					"api/V3/DirectAccess",
					"sp_SA_FT_Config_Actions",
					parameterCollection,
					false,
				);
				if (utilActionsData.length > 0) {
					utilActionsData[0].cfg_desc = Date().toString();
					_controls.wwNavbar.widgetProperties.selectedValue = "Assign Reason";
					_controls.wwNavbar.widgetProperties.float = "right";
					_controls.wwNavbar.widgetProperties.data = JSON.stringify(utilActionsData);
				}
			} catch (exception) {
				handleScriptError(exception);
			}
		}
		/**
		 * Get shift schedule time details for displaying it on the  widget
		 * @param {integer} shift_configured
		 * @returns {JSON}  data
		 */
		function wwTimeFilterLoad() {
			const currentTime = new Date();
			let startTimeValue = "";
			let endTimeValue = "";
			let peTimeFilterDataObj = "";
			const parameterCollection = {
				ent_id: entId,
			};

			const filterData = FT.WebApi.mesGetSync("api/V3/DirectAccess", "SP_S_FT_Ent_CurShiftTime", parameterCollection, false);
			if (filterData.length > 0) {
				_controls.wwTimeFilter.value = "";
				if (filterData[0].is_shift_schedule !== undefined && filterData[0].is_shift_schedule === 1) {
					startTimeValue = filterData[0].start_time.toString().replace("T", " ").replace("Z", "");
					endTimeValue = filterData[0].cur_time.toString().replace("T", " ").replace("Z", "");
					timeFilterCurShift = timeFilterCurShift.replace("xxStartTime", startTimeValue).replace("xxEndTime", endTimeValue);
					peTimeFilterDataObj = JSON.parse(PE_TIME_FILTER_DATA);
					peTimeFilterDataObj.push(JSON.parse(timeFilterCurShift));
					_controls.wwTimeFilter.widgetProperties.data = JSON.stringify(peTimeFilterDataObj);
				} else {
					_controls.wwTimeFilter.widgetProperties.data = PE_TIME_FILTER_DATA.replace("xxCurDate", currentTime);
				}
			} else {
				_controls.wwTimeFilter.value = "";
				_controls.wwTimeFilter.widgetProperties.data = PE_TIME_FILTER_DATA.replace("xxCurDate", currentTime);
			}
		}

		/**
		 * extracts relevant information from the selected value in the Time Filter widget and stores it in the filter contextSet.
		 * Get utilization details for displaying it on the grid widget
		 * @param {integer} entId
		 * @param {integer} nHrs
		 * @returns {JSON} data
		 */
		function wwPerformanceListLoad() {
			const tfObj = [
				{
					startTime: _controls.wwTimeFilter.widgetProperties.start,
					endTime: _controls.wwTimeFilter.widgetProperties.end,
				},
			];
			FT.WorkTasks.contextSet(FORM.Control, "filter", JSON.stringify(tfObj));
			const eventDataObj = [
				{
					type: "eventData",
					jsonValue: null,
				},
			];
			FT.WorkTasks.contextSet("", "eventData", JSON.stringify(eventDataObj));
			const parameterCollection = {};
			const nHrs = _controls.wwTimeFilter.value === "shift" ? getEntShiftsData(entId) : _controls.wwTimeFilter.value;
			let utilHistData = FT.WebApi.mesGetSync(
				"api/entity/" + entId + "/utilLog?hourFilter=" + nHrs + "&amp;_=1700556521843",
				"",
				parameterCollection,
				false,
			);
			if (utilHistData.length > 0) {
				// translate the history data
				const fields = [
					FT.Ui.translationColumnField(
						"reas_desc",
						FT.Ui.TRANSLATION_GROUPS.grpUtilReasReasDesc,
						FT.Ui.TRANSLATION_KEYS.keyUtilReas,
					),
					FT.Ui.translationColumnField(
						"reas_grp_desc",
						FT.Ui.TRANSLATION_GROUPS.grpUtilReasGrpReasGrpDesc,
						FT.Ui.TRANSLATION_KEYS.keyUtilReasGrp,
					),
					FT.Ui.translationColumnField(
						"state_desc",
						FT.Ui.TRANSLATION_GROUPS.grpUtilStateStateDesc,
						FT.Ui.TRANSLATION_KEYS.keyUtilState,
					),
					FT.Ui.translationColumnField("shift_desc", FT.Ui.TRANSLATION_GROUPS.grpShiftShiftDesc, FT.Ui.TRANSLATION_KEYS.keyShift),
				];
				utilHistData = FT.Ui.translateArray(utilHistData, fields);
				_controls.wwPerformace.value = "";
				_controls.wwPerformace.widgetProperties.data = JSON.stringify(utilHistData);
			}
		}

		/**
		 * Updates the form URL of an embedded page based on the selected value from the Navbar widget.
		 */
		function wwNavbarWidgetOnClick() {
			const selectedAction = JSON.parse(_controls.wwNavbar.value);
			if (selectedAction.code === "**PC**") {
				selectedAction.code = codeValue;
				const filterDataObj = [{ type: "commandSelected", jsonValue: JSON.stringify(selectedAction) }];
				FT.WorkTasks.contextSet("", "filterData", JSON.stringify(filterDataObj));
			} else {
				const filterDataObj = [{ type: "commandSelected", jsonValue: JSON.stringify(selectedAction) }];
				FT.WorkTasks.contextSet("", "filterData", JSON.stringify(filterDataObj));
			}
			if (selectedAction.command.toLowerCase() === "refresh") {
				_controls.wwNavbar.widgetProperties.selectedValue = "Assign Reason";
				_controls.wwNavbar.widgetProperties.float = "right";
				_controls.wwPerformace.widgetProperties.selectById = "";
				wwNavbarLoad();
				wwPerformanceListLoad();
				wwGanttLoad();
				_controls.wwGantt.value = "";
				_controls.embedPagePerformance.url = "";
			} else if (
				_controls.wwPerformace.widgetProperties.selectedRow !== "" &&
				_controls.wwPerformace.widgetProperties.selectedRow !== null
			) {
				_controls.embedPagePerformance.url = "";
				_controls.embedPagePerformance.url = SFU.getFormUrl(selectedAction.form_name);
			} else {
				_controls.embedPagePerformance.url = "";
			}
		}

		/**
		 * Get shift schedule details
		 * @param {integer} entityId
		 * @returns {integer} data
		 */
		function getEntShiftsData(entityId) {
			let shiftStart;
			let lastNHours = 8;
			const currentTime = new Date();
			const parameterCollection = {};
			const entShiftData = FT.WebApi.mesGetSync("api/entity/" + entityId + "/shiftHistory", "", parameterCollection, false);
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
				lastNHours = Math.abs(Math.floor(diff));
			}
			return lastNHours;
		}
		/**
		 * extracts relevant information from the selected value in the Gantt widget
		 */
		function wwGanttWidgetOnClick() {
			if (_controls.wwGantt.widgetProperties.value1 !== _controls.hfSelectedRow.value.log_id) {
				const [selectedIndex] = _controls.wwGantt.value.split("|");
				_controls.wwPerformace.widgetProperties.selectById = selectedIndex;
				wwPerformanceListLoad();
			}
		}
		/**
		 * extracts relevant information from the selected value in the Gantt widget and stores it in the utilHistory contextSet.
		 */
		function wwGridOnClick() {
			if (_controls.wwPerformace.widgetProperties.selectedRow !== null) {
				_controls.hfSelectedRow.value =
					_controls.wwPerformace.widgetProperties.selectedRow !== "null"
						? [JSON.parse(_controls.wwPerformace.widgetProperties.selectedRow)]
						: [];

				const eventDataObj = [
					{
						type: "eventData",
						jsonValue: JSON.stringify(_controls.hfSelectedRow.value),
					},
				];
				FT.WorkTasks.contextSet("", "eventData", JSON.stringify(eventDataObj));
				if (_controls.wwGantt.widgetProperties.value1 !== _controls.hfSelectedRow.value[0].log_id) {
					_controls.wwGantt.widgetProperties.value1 = _controls.hfSelectedRow.value[0].log_id;
					wwGanttLoad();
					_controls.wwGantt.widgetProperties.value1 = "";
				}
				wwNavbarWidgetOnClick();
			} else {
				_controls.embedPagePerformance.url = "";
			}
		}

		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			wwTimeFilterLoad: wwTimeFilterLoad,
			wwPerformanceListLoad: wwPerformanceListLoad,
			wwNavbarWidgetOnClick: wwNavbarWidgetOnClick,
			wwGridOnClick: wwGridOnClick,
			getEntShiftsData: getEntShiftsData,
			wwNavbarLoad: wwNavbarLoad,
			wwGanttLoad: wwGanttLoad,
			wwGanttWidgetOnClick: wwGanttWidgetOnClick,
		};
	}
})(window);
