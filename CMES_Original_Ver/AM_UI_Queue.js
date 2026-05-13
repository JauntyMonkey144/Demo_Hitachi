/*
Name:        	AM_UI_Queue.js
Description: 	Andon Queue js file containing global logic pertaining to the AM_UI_Queue Form.

Ver  Release 		By						Date				  Change Description
001  00.70.00 	Praveen			  2024-08-29		#3133 First version.
002	 01.00.00 	Bas van B			2025-02-26		#4253 Translate MD in form.
003	 01.00.00 	Usha M				2025-02-27		#4355 Removed console.log
004	 01.00.00 	Praveen				2025-02-28		#4741 Add the condition for the gridonclick() function
005	 01.01.00 	Fayaz A				2025-05-28		#5008 Localization key update to refer from FT runtime locale file.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.AM = window.AM || {};
	AM.Queue = AM.Queue || {};
	AM.Queue = Queue();
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
		const TIMEFILTER_DATA =
			'[{"orderby":1,"text":"Custom","value":"CUSTOM","start_time":"","end_time":""}' +
			',{"orderby":2,"text":"1H","value":"1","start_time":"","end_time":""}' +
			',{"orderby":2,"text":"12H","value":"12","start_time":"","end_time":""}' +
			',{"orderby":3,"text":"24H","value":"24","start_time":"","end_time":""}]';
		const AM_EVENTS = "am.andon.update";
		const AM_MODULE = "am";

		// ----------------------------------------------------------------------------------

		// ----------------------------- Private Variables ----------------------------------
		const _controls = {};
		let _lastFilterValue;
		let _selectedEntities;
		let _selectedAndonTypes;
		let _selectedStates;
		const entID = "2";
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
			_controls.wwAndonLogList = FORM.Control.findByXmlNode("WWAL");
			_controls.wwNavigation = FORM.Control.findByXmlNode("WWNV");
			_controls.wwAndonlogDetails = FORM.Control.findByXmlNode("WWAD");
			_controls.hfSelectedRow = FORM.Control.findByXmlNode("HFSR");
			_controls.wwCheckboxFilter = FORM.Control.findByXmlNode("WWCF");
			_controls.epAndonDetails = FORM.Control.findByXmlNode("EPAD");

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
		 * Function to set WidgetDropNav visible script
		 */
		function wwDropNavigationSetVisibleScripts(Control) {
			$(Control.findById("W4").domElement).parent().css("overflow", "visible");
			$(Control.findById("W4").domElement).parent().parent().css("overflow", "visible");
			$(Control.findById("W4").domElement).parent().closest("div[controlid='W4']").css("z-index", "9999999999");
			return true;
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
		 *  The following actions are performed:
		 * - Loads time filter data.
		 * - Loads navigation data.
		 * - Loads type data for dropdowns.
		 * - Loads Andon state information.
		 * - Loads Andon logs.
		 */
		function onFormLoad() {
			try {
				const entContext = FT.WorkTasks.contextGet(FORM.Control, "eventData");
				if (entContext !== null && entContext[0].entId !== null) {
					entId = entContext[0].entId;
					entName = entContext[0].entName;
				} else {
					//  initialize context
					FT.WorkTasks.contextInit();
				}
				_lastFilterValue = "";
				wwCheckboxFilterDataLoad();
				wwTimeFilterLoad();
				wwNavigationDataLoad();
				wwAndonLogLoad();
			} catch (exception) {
				handleScriptError(exception);
			}
			FT.Common.windowEventListenerAdd(AM_MODULE, amEventListener);
		}

		/**
		 * listens to events that have to be reacted upon by navigation to refresh
		 */
		function amEventListener(event) {
			// Split the module_event string into an array
			const eventList = AM_EVENTS.split("|");

			// Check if event.detail.subType matches any value in the array
			if (eventList.includes(event.detail.subType)) {
				wwNavigationDataLoad();
				_controls.epAndonDetails.url = "";
				wwAndonLogLoad();
			}
		}
		/**
		 * This function loads or updates the data property of the wwTimeFilter widget
		 * with the predefined TIMEFILTER_DATA. It is typically called to initialize or
		 * refresh the time filter widget with new data when the page or component is
		 * loaded or when certain actions occur.
		 *
		 * @function
		 * @returns {void} This function does not return any value.
		 */
		function wwTimeFilterLoad() {
			_controls.wwTimeFilter.widgetProperties.data = TIMEFILTER_DATA;
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
		}

		/**
		 * This function loads the Andon log data based on the selected filters such as Andon types,
		 *  states, entities, and time range (start and end time)
		 * @param {int} type_id
		 * @param {int} state_id
		 * @param {datetime} start_time
		 * @param {datetime} end_time
		 * @returns {JSON} data
		 */
		function wwAndonLogLoad() {
			try {
				const parameterCollection = {
					type_id: _selectedAndonTypes,
					state_id: _selectedStates,
					ent_id: _selectedEntities,
					start_time: _controls.wwTimeFilter.widgetProperties.start,
					end_time: _controls.wwTimeFilter.widgetProperties.end,
				};
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "SP_SA_AM_Andon_Log", parameterCollection, false).then(
					(data) => {
						// Translate the data
						const fields = [
							FT.Ui.translationColumnField(
								"type_desc",
								FT.Ui.TRANSLATION_GROUPS.grpAmAndonTypeTypeDesc,
								FT.Ui.TRANSLATION_KEYS.keyAmAndonType,
							),
							FT.Ui.translationColumnField(
								"state_desc",
								FT.Ui.TRANSLATION_GROUPS.grpAmAndonStateStateDesc,
								FT.Ui.TRANSLATION_KEYS.keyAmAndonState,
							),
							FT.Ui.translationColumnField("ent_name", FT.Ui.TRANSLATION_GROUPS.grpEntDescription, FT.Ui.TRANSLATION_KEYS.keyEnt),
							FT.Ui.translationColumnField(
								"issue_desc",
								FT.Ui.TRANSLATION_GROUPS.grpAmAndonIssueIssueDesc,
								FT.Ui.TRANSLATION_KEYS.keyAmAndonIssue,
							),
						];
						const translatedData = FT.Ui.translateArray(data, fields);
						_controls.wwAndonLogList.widgetProperties.data = JSON.stringify(translatedData);
					},
					(error) => {
						// Handle error
						throw error("Error:", error);
					},
				);
			} catch (exception) {
				handleScriptError(exception);
			}
		}

		/**
		 * This function is responsible for loading the navigation data into the wwNavigation widget.
		 * It constructs a JSON-like string representing navigation actions (e.g., "view" and "refresh")
		 * and assigns this data to the widget's data property. It also sets additional properties such as
		 * the selected value ("view") and the position of the widget ("right").
		 *
		 * @function
		 * @returns {void} This function does not return any value.
		 */
		function wwNavigationDataLoad() {
			var andonActionData = '[{"command": "view","param20": "","icon": "view--show.svg", "title":"View"},';
			andonActionData +=
				'{"command": "refresh","param20": "","icon": "action--refresh.svg", "title":"Refresh", "ToRefresh":"' + Date.now() + '"}]';
			_controls.wwNavigation.widgetProperties.selectedValue = "view";
			_controls.wwNavigation.widgetProperties.float = "right";
			_controls.wwNavigation.widgetProperties.data = andonActionData;
		}
		/**
		 *  This function is triggered when the values of the checkbox filter change. It checks if
		 * the selected values are different from the last filter value. If so, it updates the filter
		 * values for entities, Andon types, and states, and then loads the Andon log data using
		 * the updated filter criteria.
		 * @returns {void} This function does not return any value.
		 */

		function wwCheckboxFilterOnDataChange() {
			const selectedValues = _controls.wwCheckboxFilter.value;
			if (selectedValues !== _lastFilterValue) {
				_lastFilterValue = selectedValues;
				_selectedEntities = selectedValues.Entity !== undefined ? selectedValues.Entity.toString() : "";
				_selectedAndonTypes = selectedValues.AndonType !== undefined ? selectedValues.AndonType.toString() : "";
				_selectedStates = selectedValues.State !== undefined ? selectedValues.State.toString() : "";
				wwAndonLogLoad();
			}
		}
		/**
		 * extracts relevant information from the selected value in the  widget and stores it in the eventData contextSet.
		 */
		function wwGridOnClick() {
			if (_controls.wwAndonLogList.widgetProperties.selectedRow !== null) {
				const eventDataObj = [
					{
						type: "Andon",
						jsonValue: _controls.wwAndonLogList.widgetProperties.selectedRow,
					},
				];
				FT.WorkTasks.contextSet("", "eventData", JSON.stringify(eventDataObj));
				_controls.epAndonDetails.url = "";
				_controls.epAndonDetails.url = SFU.getFormUrl("AM_UI_ConfigType");
			} else {
				_controls.epAndonDetails.url = "";
			}
		}
		/**
		 * This function handles the click event for a navbar widget. It checks if the selected action is "refresh" and,
		 * if so, it reloads the navigation data, clears the Andon details URL, and loads the Andon log.
		 */
		function wwNavbarWidgetOnClick() {
			const selectedAction = JSON.parse(_controls.wwNavigation.value);
			if (selectedAction.title.toLowerCase() === "refresh") {
				wwNavigationDataLoad();
				_controls.epAndonDetails.url = "";
				wwAndonLogLoad();
			}
		}
		/**
		 * Timefilter widget on selection change for reload the widget
		 */
		function wwFilterStatesOnDataChange() {
			wwAndonLogLoad();
		}
		/**
		 * Timefilter widget on selection change for reload the widget
		 */
		function wwTimeFilterOnDataChange() {
			wwAndonLogLoad();
		}
		/**
		 * Function to set Panel Z - index
		 */
		function wwPanelVisibleScripts(formControl, panelId, indexValue) {
			$(formControl.findById(panelId).domElement).css("z-index", indexValue);
			return true;
		}
		/**
		 * Function to load Filter for Instruction and assign data to grid widget
		 */
		function wwCheckboxFilterDataLoad() {
			parameterColl = { ent_id: entID };
			const spName = "sp_SA_AM_Filters";
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", spName, parameterColl, false).then(
				(data) => {
					// Translate the filters
					const fields = [
						FT.Ui.translationColumnField("display", FT.Ui.TRANSLATION_GROUPS.grpEntDescription, ["display"]),
						FT.Ui.translationColumnField("display", FT.Ui.TRANSLATION_GROUPS.grpAmAndonTypeTypeDesc, ["display"]),
						FT.Ui.translationColumnField("display", FT.Ui.TRANSLATION_GROUPS.grpAmAndonStateStateDesc, ["display"]),
					];
					const translatedData = FT.Ui.translateArray(data, fields);
					// Handle successful response data
					_controls.wwCheckboxFilter.widgetProperties.data = JSON.stringify(translatedData);
				},
				(error) => {
					// Handle error
					throw Error("Error:", error);
				},
			);
		}
		return {
			initializeForm: initializeForm,
			wwAndonLogLoad: wwAndonLogLoad,
			wwNavigationDataLoad: wwNavigationDataLoad,
			wwGridOnClick: wwGridOnClick,
			wwNavbarWidgetOnClick: wwNavbarWidgetOnClick,
			wwFilterStatesOnDataChange: wwFilterStatesOnDataChange,
			wwDropNavigationSetVisibleScripts: wwDropNavigationSetVisibleScripts,
			wwTimeFilterOnDataChange: wwTimeFilterOnDataChange,
			wwPanelVisibleScripts: wwPanelVisibleScripts,
			wwCheckboxFilterDataLoad: wwCheckboxFilterDataLoad,
			wwCheckboxFilterOnDataChange: wwCheckboxFilterOnDataChange,
		};
	}
})(window);
