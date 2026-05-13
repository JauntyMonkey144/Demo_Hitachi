/*
Name:        	UC_PE_UI_KpiDashboard.js
Description: 	UC_PE_UI_KpiDashboard js file containing global logic pertaining to the UC_PE_UI_KpiDashboard Form.

Ver	 Release	By				Date				Change Description
001	 05.00	  Praveen		2024-10-05	#3737 First version.
002	 05.00	  Praveen		2024-10-16	#3763 Remove all lookups and update with Web api calls.
003	 01.00	  Fayaz			2025-02-25	#3982 Updated wwTimeFilterLoad to load widget data from PE_TIME_FILTER_DATA
																		Updated to load entId and entName when the form is loaded, instead of inside
																		functions.;
004	 01.01	  Praveen		2025-05-12	#4896 Change the parameterCollection(endTimeValue) values from cur_time to currentTime
                                    in the wwTimeFilterLoad() function.
005	 01.01.00	Fayaz A	  2025-05-14	#4955 A global variable, commandSelected, is defined to fetch and hold the selected
																		command's action details from filterData context on form load.
006	 01.01.00 Fayaz A		2025-05-22	#4955 Parent code value logic is added in wwNavbarWidgetOnClick function to set "CODE" value.
007  01.01.00 Fayaz A		2025-05-28	#5008 Localization key update to refer from FT runtime locale file.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.PE = window.PE || {};
	PE.KpiDashboard = PE.KpiDashboard || {};
	PE.KpiDashboard = KpiDashboard();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function KpiDashboard() {
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;
		const NAVIGATON_GRPID = "PE_DashboardTab";
		const NAVIGATON_FOR = "UtilKPISubMenu";
		const PE_TIME_FILTER_DATA =
			'[{"orderby":2,"text":"1H","value":"1","start_time":"","end_time":"","start_time_readonly":0,"end_time_readonly":0}' +
			',{"orderby":3,"text":"12H","value":"12","start_time":"","end_time":"","start_time_readonly":0,"end_time_readonly":0}' +
			',{"orderby":4,"text":"24H","value":"24","start_time":"","end_time":"","start_time_readonly":0,"end_time_readonly":0,' +
			'"to_refresh":"xxCurDate"}' +
			"]";
		// ----------------------------------------------------------------------------------

		// ----------------------------- Private Variables ----------------------------------
		const _controls = {};
		let entName = "";
		let mesUserId = "";
		let timeFilterCurShift =
			'{"orderby":5,"text":"Current shift","value":"shift","start_time":"xxStartTime","end_time":"xxEndTime",' +
			'"start_time_readonly":0,"end_time_readonly":0}';
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
			_controls.wwTimeFilter = FORM.Control.findByXmlNode("WWTF");
			_controls.wwNavbar = FORM.Control.findByXmlNode("WWNAV");
			_controls.embedPageKpiDashboard = FORM.Control.findByXmlNode("EPU");

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
		function setNavigationData(grpId, category, entityName, userId, itemId, woId, operId, seqNo) {
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
				const kpiActionsData = FT.WebApi.mesGetSync("api/V3/DirectAccess", "sp_SA_FT_Config_Actions", parameterCollection, false);

				if (kpiActionsData.length > 0) {
					kpiActionsData[0].cfg_desc = Date().toString();

					_controls.wwNavbar.widgetProperties.data = JSON.stringify(kpiActionsData);
				}
			} catch (exception) {
				handleScriptError(exception);
			}
		}

		/**
		 * Form load function to bind cards with respect to entity from form parameters or if session variable EntID
		 */
		function onFormLoad() {
			try {
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
				setNavigationData(NAVIGATON_GRPID, NAVIGATON_FOR, entName, mesUserId);
				wwTimeFilterLoad();
			} catch (exception) {
				handleScriptError(exception);
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
		 * Get shift schedule time details for displaying it on the  widget
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
					endTimeValue = currentTime.toString("yyyy-MM-dd HH:mm:ss").replace("T", " ").replace("Z", "");
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
		 */
		function wwTimeWidgetOnClick() {
			const tfObj = [
				{
					startTime: _controls.wwTimeFilter.widgetProperties.start,
					endTime: _controls.wwTimeFilter.widgetProperties.end,
				},
			];
			FT.WorkTasks.contextSet(FORM.Control, "filter", JSON.stringify(tfObj));
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
			_controls.embedPageKpiDashboard.url = "";
			_controls.embedPageKpiDashboard.url = SFU.getFormUrl(selectedAction.form_name);
		}

		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			wwNavbarWidgetOnClick: wwNavbarWidgetOnClick,
			setNavigationData: setNavigationData,
			wwTimeWidgetOnClick: wwTimeWidgetOnClick,
		};
	}
})(window);
