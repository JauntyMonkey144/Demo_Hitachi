/*
Name:        	OM_UI_Queue.js
Description: 	OM_UI_Queue js file containing global logic pertaining to the OM_UI_Queue Form.

Ver	Release		By					Date				Change Description
001	00.50.00	Shamanth S	2024-07-11	#3002 First version.
002	00.50.00	Chitta			2024-11-28	TIMEFILTER_DATA has to come from DB SP named "sp_SA_OM_TimeFilter" instead hard coded.
003 00.70.00	Fayaz A			2024-12-02	#3648 Time filter is visible only for completed work orders.
004	01.00.00	Bas van B		2025-02-20	#4253 Translate the status filter and WO table data.
005	01.00.00	Bas van B		2025-02-21	#4253	Use correct constants for translation GROUPS and KEYS.
006	01.00.00	Bas van B		2025-02-21	#4253 Use public TRANSLATION_GROUP and TRANSLATION_KEYS Ui objects
																	to avoid errors when loaded as widget.
007	01.00.00  Praveen			2025-02-21	#4339 Add logic in lastNoHrs parameter.
008	01.00.00	Fayaz A			2025-02-25	#3982 Updated function wwTimeFilterLoad to load widget data from OM_TIME_FILTER_DATA.
009 01.00.00  Usha M			2025-02-28	#4265 Removed getLookupSchemaAndData. Updated to access data using Web Api.
010	01.00.00	Fayaz A			2025-03-10	#4631 When there are no wo data returned all the wo actions(except refresh and details)
																			are made inactive, For grid, selected row, null check is included in
																			the function wwOmQueueOnDataChange.
011	01.01.00 	Fayaz A			2025-05-28	#5008 Localization key update to refer from FT runtime locale file.
012	01.02.00 	Fayaz A			2025-06-30	#5091 Function wwWoStatesOnDataChange is updated to check if there is change in selected states.
013	01.02.00 	Fayaz A			2025-06-30	#5087 Function to set commands (to enable and disable) is updated to consider wo state "onHold".
014	01.02.00	Somya S			2025-06-30	#5069	Added the showloader and hideloader function

*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.OM = window.OM || {};
	OM.Queue = OM.Queue || {};
	OM.Queue = Queue();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function Queue() {
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;

		const WO_ACTIONS_DATA =
			'[{"command":"details","param20":"","icon":"info.png","title":"Details","form_name":"OM_UI_Details"}' +
			',{"command":"add","param20":"","icon":"add.svg","title":"Add","form_name":"OM_UI_Create"}' +
			',{"command":"edit","param20":"","icon":"edit.png","title":"Edit","form_name":"OM_UI_Edit"}' +
			',{"command":"delete","param20":"","icon":"delete.svg","title":"Delete","form_name":"OM_UI_Delete"}' +
			',{"command":"release","param20":"","icon":"Release.png","title":"Release","form_name":"OM_UI_Release"}' +
			',{"command":"cancel","param20":"","icon":"cancel.svg","title":"Cancel","form_name":"OM_UI_Cancel"}' +
			',{"command":"clone","param20":"","icon":"CloneWO.png","title":"Clone","form_name":"OM_UI_Clone"}' +
			',{"command":"bom","param20":"","icon":"bom.png","title":"Bom","form_name":"JM_UI_BomDetails"}' +
			',{"command":"job","param20":"","icon":"jobs.png","title":"Job","form_name":"OM_UI_JobDetails"}' +
			',{"command":"refresh","param20":"","icon":"refresh.svg","title":"Refresh","form_name":""}]';
		const OM_EVENTS = "om.wo.release|om.wo.cancel|om.wo.clone|om.wo.add|om.wo.delete|om.wo.update";
		const OM_MODULE = "om";
		const OM_TIME_FILTER_DATA =
			'[{"orderby":1,"text":"Custom","value":"CUSTOM","start_time":"","end_time":"","start_time_readonly":0,"end_time_readonly":1}' +
			',{"orderby":2,"text":"1H","value":"1","start_time":"","end_time":"","start_time_readonly":0,"end_time_readonly":0}' +
			',{"orderby":3,"text":"12H","value":"12","start_time":"","end_time":"","start_time_readonly":0,"end_time_readonly":0}' +
			',{"orderby":4,"text":"8H","value":"8","start_time":"","end_time":"","start_time_readonly":0,"end_time_readonly":0,' +
			'"to_refresh":"xxCurDate"}' +
			"]";
		// ----------------------------------------------------------------------------------

		// ----------------------------- Private Variables ----------------------------------
		const _controls = {};
		let userInfo = "";
		let woStatesSelected = "";
		let entId = "";
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
			_controls.wwOmNavbar = FORM.Control.findByXmlNode("WWNB");
			_controls.wwOmQueue = FORM.Control.findByXmlNode("WWOQ");
			_controls.wwOmStates = FORM.Control.findByXmlNode("WWFS");
			_controls.hfWoRow = FORM.Control.findByXmlNode("HFWOR");
			_controls.hfWoAction = FORM.Control.findByXmlNode("HFWOA");
			_controls.epDetails = FORM.Control.findByXmlNode("EPOM");
			_controls.wwTimeFilter = FORM.Control.findByXmlNode("WWTF");
			_controls.lbTimeFilterMsg = FORM.Control.findByXmlNode("LBMS");

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
				userInfo = FT.WorkTasks.userInfo();
				mesUserId = userInfo.MESUserId !== undefined ? userInfo.MESUserId.replace(/\\/g, "\\\\") : null;

				const entContext = FT.WorkTasks.contextGet(FORM.Control, "ent");
				if (entContext !== null) {
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
				loadOmStates();

				_controls.wwOmNavbar.widgetProperties.selectedValue = "details";
				_controls.wwOmNavbar.widgetProperties.float = "right";
				_controls.wwOmNavbar.widgetProperties.command = "edit,delete,release,cancel,clone,bom,job";
				_controls.wwOmNavbar.widgetProperties.data = WO_ACTIONS_DATA;
				wwTimeFilterLoad();

				// subscribe to the OM events to update grid
				FT.Common.windowEventListenerAdd(OM_MODULE, omEventListener);
			} catch (exception) {
				handleScriptError(exception);
			}
		}

		/**
		 * listens to events that have to be reacted upon by card widget to refresh
		 */
		function omEventListener(event) {
			// Split the module_event string into an array
			const eventList = OM_EVENTS.split("|");

			// Check if event.detail.subType matches any value in the array
			if (eventList.includes(event.detail.subType)) {
				loadWoQueue(woStatesSelected);
			}
		}

		/**
		 * Set WO States to wwWidgetState from FT Common
		 * @returns
		 */
		function loadOmStates() {
			const filterKeys = ["bypassed", "superseded", "canceled"];
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

			// Assign the job states to the widget
			_controls.wwOmStates.widgetProperties.data = JSON.stringify(formattedJobStates);
		}

		/**
		 * Data chnage of wwWidgetState
		 * @returns
		 */
		function wwWoStatesOnDataChange() {
			if (woStatesSelected !== _controls.wwOmStates.value) {
				woStatesSelected = _controls.wwOmStates.value;
				if (
					woStatesSelected !== "" &&
					woStatesSelected.State.every((woState) => woState === FT.Common.MES_JOB_STATE_CD.complete.toString())
				) {
					_controls.wwTimeFilter.visible = true;
					_controls.lbTimeFilterMsg.visible = false;
				} else {
					_controls.wwTimeFilter.visible = false;
					_controls.lbTimeFilterMsg.visible = true;
				}
				loadWoQueue(woStatesSelected);
			}
		}

		/**
		 * Get shift schedule time details for displaying it on the  widget
		 * @param {integer} shift_configured
		 * @returns {JSON}  data
		 */
		function wwTimeFilterLoad() {
			const currentTime = new Date();
			_controls.wwTimeFilter.widgetProperties.data = OM_TIME_FILTER_DATA.replace("xxCurDate", currentTime);
		}

		/**
		 * On TimeFilter selection change
		 * @returns
		 */
		function wwTimeFilterOnDataChange() {
			loadWoQueue(woStatesSelected);
		}

		/**
		 * Displays the page-level loader animation.
		 *
		 * Handles both WorkTasks device and non-WorkTasks scenarios.
		 * Uses form_name from hfWoAction to set the data-skpage.
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

						// Try getting form_name from _controls.hfWoAction
						try {
							const actionVal = _controls.hfWoAction.value;
							if (actionVal) {
								const form = JSON.parse(actionVal);
								if (form.form_name) {
									const formUrl = SFU.getFormUrl(form.form_name);
									$loader.attr("data-skpage", formUrl);
								}
							}
						} catch (error) {
							throw new Error("Failed to parse form_name from hfWoAction: " + error.message);
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
		 * Function to load WO Queue for an entity and assign data to grid widget
		 *
		 */
		function loadWoQueue(jobStates) {
			showPageLoader();

			const lastNhrs = _controls.wwTimeFilter.value === "shift" ? getEntShiftsData(entId) : _controls.wwTimeFilter.value;
			let jobStateFilter = 0;
			if (jobStates !== "" && jobStates.State.every((jobState) => jobState === FT.Common.MES_JOB_STATE_CD.complete.toString())) {
				jobStateFilter = 1;
			}
			const parameterColl = {
				newState: jobStates !== "" && jobStates.State.includes(FT.Common.MES_JOB_STATE_CD.new.toString()),
				readyState: jobStates !== "" && jobStates.State.includes(FT.Common.MES_JOB_STATE_CD.ready.toString()),
				runningState: jobStates !== "" && jobStates.State.includes(FT.Common.MES_JOB_STATE_CD.running.toString()),
				completeState: jobStates !== "" && jobStates.State.includes(FT.Common.MES_JOB_STATE_CD.complete.toString()),
				suspendedState: jobStates !== "" && jobStates.State.includes(FT.Common.MES_JOB_STATE_CD.suspended.toString()),
				onHoldState: jobStates !== "" && jobStates.State.includes(FT.Common.MES_JOB_STATE_CD.onHold.toString()),
				includeWorkOrdersFromProcess: true,
				targetSchedLineId: "-1",
				lastEditHr: jobStateFilter === 1 ? parseInt(lastNhrs, 10) : "",
			};
			FT.WebApi.mesGetAsync("api/V3/WO/filter", "", parameterColl, false).then(
				(data) => {
					hidePageLoader();
					// Handle successful response data
					if (data.length > 0) {
						// Translate the data
						const fields = [
							FT.Ui.translationColumnField("wo_desc", FT.Ui.TRANSLATION_GROUPS.grpWoWoDesc, FT.Ui.TRANSLATION_KEYS.keyWo),
							FT.Ui.translationColumnField(
								"process_desc",
								FT.Ui.TRANSLATION_GROUPS.grpProcessProcessDesc,
								FT.Ui.TRANSLATION_KEYS.keyProcess,
							),
							FT.Ui.translationColumnField("item_desc", FT.Ui.TRANSLATION_GROUPS.grpItemItemDesc, FT.Ui.TRANSLATION_KEYS.keyItem),
							FT.Ui.translationColumnField("target_sched_line_name", FT.Ui.TRANSLATION_GROUPS.grpEntEntDescription, [
								"target_sched_line_name",
							]),
							FT.Ui.translationColumnField("uom_desc", FT.Ui.TRANSLATION_GROUPS.grpUomDescription, ["uom_desc"]),
							FT.Ui.translationColumnField("wo_status_desc", FT.Ui.TRANSLATION_GROUPS.grpJobStateStateDesc, ["wo_status_desc"]),
						];
						const translatedData = FT.Ui.translateArray(data, fields);
						// Send translated data to the table
						_controls.wwOmQueue.widgetProperties.data = JSON.stringify(translatedData);
					} else {
						_controls.wwOmQueue.widgetProperties.data = JSON.stringify([]);
						_controls.hfWoAction.value = JSON.stringify([]);
						_controls.wwOmNavbar.widgetProperties.float = "right";
						_controls.wwOmNavbar.widgetProperties.selectedValue = "details";
						_controls.wwOmNavbar.widgetProperties.command = "edit,delete,release,cancel,clone,bom,job";

						_controls.epDetails.url = "";
					}
				},
				(error) => {
					hidePageLoader();
					// Handle error
					throw Error("Error:", error);
				},
			);
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
		 * Function to assign WO Queue widget value to Hidden Field value
		 */
		function wwOmQueueOnDataChange() {
			_controls.hfWoRow.value =
				_controls.wwOmQueue.widgetProperties.selectedRow != null ? _controls.wwOmQueue.widgetProperties.selectedRow : "";
			_controls.epDetails.url = "";
			if (_controls.wwOmQueue.widgetProperties.selectedRow) {
				enableButton(JSON.parse(_controls.wwOmQueue.widgetProperties.selectedRow).wo_status);
			}

			hfWoActionOnDataChange();
		}

		/**
		 * Function to set navigation commands (to enable and disable) based on wo state
		 * @param {string} strStatus
		 */
		function enableButton(strStatus) {
			const intJobState = parseInt(strStatus, 10);
			// _controls.wwOmNavbar.widgetProperties.command = "{}";
			if (intJobState === FT.Common.MES_JOB_STATE_CD.complete) {
				_controls.wwOmNavbar.widgetProperties.command = "release,cancel";
			} else if (intJobState === FT.Common.MES_JOB_STATE_CD.canceled) {
				_controls.wwOmNavbar.widgetProperties.command = "release,cancel";
			} else if (intJobState === FT.Common.MES_JOB_STATE_CD.suspended) {
				_controls.wwOmNavbar.widgetProperties.command = "release";
			} else if (intJobState === FT.Common.MES_JOB_STATE_CD.onHold) {
				_controls.wwOmNavbar.widgetProperties.command = "release";
			} else if (intJobState === FT.Common.MES_JOB_STATE_CD.running) {
				_controls.wwOmNavbar.widgetProperties.command = "edit,delete,release";
			} else if (intJobState === FT.Common.MES_JOB_STATE_CD.ready) {
				_controls.wwOmNavbar.widgetProperties.command = "release";
			} else if (intJobState === FT.Common.MES_JOB_STATE_CD.new) {
				_controls.wwOmNavbar.widgetProperties.command = "{}";
			}
			const getCommand = _controls.wwOmNavbar.widgetProperties.command;
			if (
				_controls.wwOmNavbar.widgetProperties.command
					.split(",")
					.includes(JSON.parse(_controls.wwOmNavbar.value).command.toLowerCase()) === true
			) {
				_controls.wwOmNavbar.widgetProperties.selectedValue = "details";
				_controls.wwOmNavbar.widgetProperties.command = getCommand;
			}
		}

		/**
		 * Function to assign Navigation widget value to Action Hidden Field value
		 */
		function wwOmActionOnDataChange() {
			_controls.hfWoAction.value = _controls.wwOmNavbar.value != null ? _controls.wwOmNavbar.value : "";
		}

		/**
		 * Function to load corrosponding form for the selected action
		 */
		function hfWoActionOnDataChange() {
			var selectedAction = JSON.parse(_controls.hfWoAction.value);
			var woQueueRow = _controls.hfWoRow.value;
			if (selectedAction) {
				const filterDataObj = [{ type: "commandSelected", jsonValue: JSON.stringify(selectedAction) }];
				FT.WorkTasks.contextSet("", "filterData", JSON.stringify(filterDataObj));
			}
			if (selectedAction.command === "refresh") {
				_controls.epDetails.url = "";

				loadWoQueue(woStatesSelected);

				_controls.wwOmNavbar.widgetProperties.selectedValue = "details";
				_controls.wwOmNavbar.widgetProperties.float = "right";
				_controls.wwOmNavbar.widgetProperties.data = WO_ACTIONS_DATA;
			} else if (selectedAction.command === "add") {
				_controls.epDetails.url = selectedAction.form_name !== undefined ? SFU.getFormUrl(selectedAction.form_name) : "";
			} else if (woQueueRow !== "" && _controls.hfWoRow.value !== "") {
				woQueueRow = JSON.parse(_controls.hfWoRow.value);
				// update selected wo details to context
				const woObj = [
					{
						woId: woQueueRow.wo_id,
						processId: woQueueRow.process_id,
						bomVerId: woQueueRow.bom_ver_id,
						specVerId: woQueueRow.spec_ver_id,
						itemId: woQueueRow.item_id,
						reqQty: woQueueRow.req_qty,
					},
				];
				FT.WorkTasks.contextSet("", "wo", JSON.stringify(woObj));
				const bomObj = [
					{
						woId: woQueueRow.wo_id,
						bomVerId: woQueueRow.bom_ver_id,
						parentItemId: woQueueRow.item_id,
					},
				];
				FT.WorkTasks.contextSet("", "jobBom", JSON.stringify(bomObj));
				_controls.epDetails.url = selectedAction.form_name !== undefined ? SFU.getFormUrl(selectedAction.form_name) : "";
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
		 * Function to set Widget CheckboxList visible script
		 */
		function wwWOStatesVisibleScripts(Control) {
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
			wwOmQueueOnDataChange: wwOmQueueOnDataChange,
			wwOmActionOnDataChange: wwOmActionOnDataChange,
			hfWoActionOnDataChange: hfWoActionOnDataChange,
			wwWoStatesOnDataChange: wwWoStatesOnDataChange,
			wwWOStatesVisibleScripts: wwWOStatesVisibleScripts,
			wwPanelVisibleScripts: wwPanelVisibleScripts,
			wwTimeFilterOnDataChange: wwTimeFilterOnDataChange,
			showPageLoader: showPageLoader,
			hidePageLoader: hidePageLoader,
		};
	}
})(window);
