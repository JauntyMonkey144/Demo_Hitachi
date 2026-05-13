/*
Name:					TD_UI_Tasks.js
Description:	The TD_UI_Tasks.js js file containing logic pertaining to the TD_UI_Tasks Form.

Ver		Release			By				Date				Change Description
001		00.50  		Fayaz A	  2024-06-05	#2806 First version of the file.
002		00.50			Fayaz A   2024-08-27	#3693 Removed replace function and changed getuserLookupExtendedInformation to getuserInfo.
003		00.70			Praveen	  2024-10-16	#3763 Remove all lookups and update with Web api calls.
004		00.70			SS        2024-11-15	Corrected ESLint Errors in the file.
005		00.70  		Fayaz A	  2025-01-05	#4059 Removed all references of parent form controls and related functions.
006		01.00			Usha M	  2025-02-27	#4355 Removed console.log
007		01.00			Fayaz A	  2025-03-20	#4528 Defined entId and entName global to the form and updated wwTasksOnDataChange function
																					to consider entity from the ent context.
008		01.00			Fayaz A		2025-03-28	#4527 Included functionality to load form based on the data "DontChangeUrl" passed into Event
009		01.01.00	Chitta		2025-05-14	#4884 removed unnessary variable "commandSelected" which not used
010		01.01.00 	Fayaz A	  2025-05-14	#4955 A global variable, commandSelected, is defined to fetch and hold the selected command's action
																					details from filterData context on form load.
011		01.01.00 	Fayaz A		2025-05-28	#5008 Localization key update to refer from FT runtime locale file.
012		01.02.00	Somya S		2025-06-30	#5073	EntityState - Not Compatible with presence of UCO's.
*/

// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.TD = window.TD || {};
	TD.Tasks = TD.Tasks || {};
	TD.Tasks = Tasks();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function Tasks() {
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const LIST_JS = ["js/MES/FT_Common.js", "js/MES/FT_UI_EventsFromMqttTopics.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		const REFRESH_MSG = "REFRESH";
		const REFRESH_DURATION_IN_MILLISECONDS = 500000;
		const NO_CONFIG_CARDS_DATA =
			'[{"display_order":0,"type":"default","sub_type":"default","row_id":"0","filter":true,' +
			'"form_redirect":"","action":"Task","json_data":"{\\"row_id\\":0,\\"type\\":\\"default\\",\\"sub_type\\":\\"default\\",' +
			'\\"CardColumn21\\":\\"\\",\\"CardColumn31\\":\\"\\",\\"CardColumn12\\":\\"\\",\\"CardColumn22\\":\\"\\",\\"CardColumn32\\":\\"\\",' +
			'\\"status\\":\\"\\",\\"icon\\":\\"radio-selected.png\\",\\"CardColumn11\\":\\"No Data Present.\\"}"}]';
		const TD_TASK_LIST_GRP_ID = "TD_Tasks";
		const TD_TASK_LIST_UI_GRP_ID = "TD_TasksUi";
		const DONT_CHANGE_URL = "DontChangeUrl";
		// ----------------------------------------------------------------------------------

		// ----------------------------- Private Variables ----------------------------------
		const _controls = {};
		FORM.Control = null;
		let userInfo = "";
		let mesUserId = "";
		let moduleEvent = "";
		let entId = "";
		let entName = "";
		let isChangeUrl = true;
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

			_controls.wwCards = FORM.Control.findByXmlNode("WWC");
			_controls.epCardDetails = FORM.Control.findByXmlNode("EPCD");

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
		 * Form load function to bind cards with respect to entity from form parameters or if session variable EntID
		 */
		function onFormLoad() {
			
			const entContext = FT.WorkTasks.contextGet(FORM.Control, "ent");

			entName = entContext[0].entName;
			entId = entContext[0].entId;

			const filterData = FT.WorkTasks.contextGet(FORM.Control, "filterData");
			commandSelected = filterData.find((item) => item.type === "commandSelected");
			if (commandSelected) {
				commandSelected = JSON.parse(commandSelected.jsonValue);
				// Sample code to access context properties
				codeValue = commandSelected.code;
			}

			// Following code is added to support pdf files to load inside an iframe
			$("#E1frameEmbedPage").removeAttr("sandbox");
			try {
				setCardsData(entName);

				setInterval(() => {
					_controls.wwCards.widgetProperties.value2 = "AutoRefresh";
					setCardsData(entName);
				}, REFRESH_DURATION_IN_MILLISECONDS);
				// Add the listener for the events coming from MQTT //

				// 012 - Added Listener for raised event from Mqtt Topic //
				FT.Common.windowEventListenerAdd("td_ui_tasks", eventListenerMqttTdTasks);
				// 012 - Load Configuration for Events from Mqtt + Start Monitoring Incoming Events //
				const keyEventsFromMqttTopics = { formName: "TD_UI_Tasks", entName: entName };
				FT.EventsFromMqttTopics.startAcquisitionEvents(keyEventsFromMqttTopics);
			} catch (exception) {
				handleScriptError(exception);
			} finally {
				logExecutionTime();
			}
		}
		// 012 - Event Listener added for serving Windows Event raised after detection from MqttTopic  //
		/**
		 * eventListenerMqttTdTasks
		 *	Event detected is not associated in configuration with a direct Handler
		 *		thus a Windows Event has been raised
		 *	Processing of Event consists of refreshing the Tasks List widget
		 */
		function eventListenerMqttTdTasks(eventData) {
			// Check if event.detail.subType matches refresh
			if (eventData.detail.subType.includes("refresh")) {
				setCardsData(entName);
			}
		}

		// 012 - Event Handler added for serving Handler Event after detection from MqttTopic //
		/**
		 * eventHandlerMqttTdTasks
		 *	Event detected is associated in configuration directly with this Handler
		 *		there is no need then to raise a Windows Event
		 *	Processing of Event consists of refreshing the Task List widget
		 *	IMPORTANT NOTE: THIS HANDLER NEEDS TO BE DECLARED IN THE LIST OF FUNCTIONS EXPOSED BY THE OBJECT
		 */
		function eventHandlerMqttTdTasks(eventData) {
			// Check if eventData.detail.subType matches refresh
			if (eventData.eventSubType.includes("refresh")) {
				// Refresh the Task List //
				setCardsData(entName);
			}
		}

		function wwTasksOnDataChange() {
			const selectedCardValue = JSON.parse(_controls.wwCards.value);

			if (selectedCardValue[0].MESSAGE !== undefined && selectedCardValue[0].MESSAGE.toUpperCase() === REFRESH_MSG) {
				setCardsData(entName);
			} else {
				FT.WorkTasks.contextSet("", selectedCardValue[0].type.toLowerCase(), JSON.stringify(selectedCardValue));
				const eventDataObj = [
					{
						type: selectedCardValue[0].type,
						jsonValue: JSON.stringify(selectedCardValue),
					},
				];
				FT.WorkTasks.contextSet("", "eventData", JSON.stringify(eventDataObj));
				const filterJsonValue = selectedCardValue[0];
				if (selectedCardValue[0].code === "**PC**") {
					filterJsonValue.code = codeValue;
					const filterDataObj = [{ type: "commandSelected", jsonValue: JSON.stringify(filterJsonValue) }];
					FT.WorkTasks.contextSet("", "filterData", JSON.stringify(filterDataObj));
				} else {
					const filterDataObj = [{ type: "commandSelected", jsonValue: JSON.stringify(filterJsonValue) }];
					FT.WorkTasks.contextSet("", "filterData", JSON.stringify(filterDataObj));
				}

				if (isChangeUrl) {
					_controls.epCardDetails.url = "";
					_controls.epCardDetails.url = SFU.getFormUrl(selectedCardValue[0].form_redirect);
				}
				isChangeUrl = true;
			}
			// event for header form
			FT.Common.windowEventDispatch("td", "task.select", FT.Common.EVENT_SOURCE_TYPE.form, "TD_UI_Tasks", selectedCardValue);

			// if the selected card is subscribing to a module
			if (selectedCardValue[0].module) {
				moduleEvent = selectedCardValue[0].module_event;

				const eventModules = selectedCardValue[0].module.split("|");

				// Loop through each module and attach a listener
				eventModules.forEach((module) => {
					FT.Common.windowEventListenerAdd(module, eventListener);
				});
			}
		}

		/**
		 * listens to events that have to be reacted upon by card widget to refresh
		 */
		function eventListener(event) {
			// Split the module_event string into an array
			const eventList = moduleEvent.split("|");

			// Check if event.detail.subType matches any value in the array
			if (eventList.includes(event.detail.subType)) {
				_controls.wwCards.widgetProperties.value2 = "EventRefresh";
				isChangeUrl = event.detail.data === DONT_CHANGE_URL ? false : isChangeUrl;

				setCardsData(entName);
			}
		}

		/**
		 * Load Tasks by entity
		 * @param {string} strEntName
		 */
		function setCardsData(entityName) {
			try {
				userInfo = FT.WorkTasks.userInfo();
				mesUserId = userInfo.MESUserId !== undefined ? userInfo.MESUserId : null;
				const parameterCollection = {
					ent_name: entityName,
					td_task_list_grp_id: TD_TASK_LIST_GRP_ID,
					td_task_list_ui_grp_id: TD_TASK_LIST_UI_GRP_ID,
					user_id: mesUserId,
				};
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_TD_Config_Tasks", parameterCollection, false).then(
					(tasksData) => {
						if (tasksData.length > 0) {
							_controls.wwCards.widgetProperties.data = JSON.stringify(tasksData);
						} else {
							_controls.wwCards.widgetProperties.data = NO_CONFIG_CARDS_DATA;
						}
					},
					(error) => {
						// Handle error
						throw error("Error:", error);
					},
				);
			} catch (exception) {
				handleScriptError(exception);
			} finally {
				logExecutionTime();
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
			wwTasksOnDataChange: wwTasksOnDataChange,
			eventHandlerMqttTdTasks: eventHandlerMqttTdTasks,
		};
	}
})(window);
