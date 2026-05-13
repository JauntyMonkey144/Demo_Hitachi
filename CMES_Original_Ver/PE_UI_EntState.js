/*
Name:        	PE_UI_EntState.js
Description: 	PE_UI_EntState.js js file containing global logic pertaining to the PE_UI_EntState Form.

Ver		Release	  By			Date		Change Description
001		02.00.00  Fayaz A		2024-05-24	#5269 First version. 
*/

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.PE = window.PE || {};
	PE.EntState = PE.EntState || {};
	PE.EntState = EntState();
	// ------------------------------------------------------------------------------------
	/**
	 * EntState
	 *
	 * @returns {null} EntState template object.
	 */
	function EntState() {
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const LIST_JS = ["js/MES/FT_Common.js", "js/MES/FT_UI_EventsFromMqttTopics.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css", "css/MES/PE_UI_EntState.css"];
		const FORM = {};
		FORM.Control = null;
		const PE_EVENTS = "pe.utilHistory.assign";
		const PE_MODULE = "pe";
		const NO_CONFIG_ENT_STATE_DATA =
			'[{"ent_id":"xxent_id","entity_name":"","raw_reason_code":"Not Configured","reason_code":"Not Configured",' +
			'"state_desc":"Not Configured","rcur":"0","rswitch":"NoConfig","equip_ent_id":"xxequip_ent_id"}]';
		const ENTITY_STATE = "Downtime";
		// ----------------------------------------------------------------------------------

		// ----------------------------- Private Variables ----------------------------------
		const _controls = {};
		let entName = "";
		let entId = "";
		// ----------------------------------------------------------------------------------
		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			// Initialize variables
			FORM.Control = Control;
			_controls.wwEntityState = FORM.Control.findByXmlNode("WWES");
			_controls.hfEntityId = FORM.Control.findByXmlNode("HFEI");
			_controls.hfEntityState = FORM.Control.findByXmlNode("HFES");
			_controls.iwSetRawReason = FORM.Control.findByXmlNode("IWSRR");

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
		 * Form load function
		 */
		function onFormLoad() {
			try { 
				const entContext = FT.WorkTasks.contextGet(FORM.Control, "ent");
				if(entContext !== null)
				{
					entName = entContext[0].entName;
					entId = entContext[0].entId;
					wwEntityStateSetData();
					FT.Common.windowEventListenerAdd(PE_MODULE, peEventListener);

					// Add the listener for the events coming from MQTT //

					FT.Common.windowEventListenerAdd("td_ui_dashboard", eventListenerMqttTdDashboard); // 011  -02- //

					// Start Acquisition Events for current Form and Entity in context - mapping Topics Events //

					const keyEventsFromMqttTopics = { formName: "TD_UI_Dashboard", entName: entName }; // 011  -03- //

					FT.EventsFromMqttTopics.startAcquisitionEvents(keyEventsFromMqttTopics);
				}

			} catch (exception) {
				handleScriptError(exception);
			}
		}
		/**
		 * listens to events that have to be reacted upon by Navbar to refresh
		 */
		function peEventListener(event) {
			// Split the module_event string into an array
			const eventList = PE_EVENTS.split("|");

			// Check if event.detail.subType matches any value in the array
			if (eventList.includes(event.detail.subType)) { 
				wwEntityStateSetData();
			}
		}
/**
		 * eventListenerMqttTdDashboard
		 * eventListenerTdDashboard
		 * Event detected is not associated in configuration with a direct Handler
		 * thus a Windows Event has been raised
		 * Event Raised implies the refresh of the TD UI Dashboard page
		 * Processing of Event consists of refreshing the EntityState widget
		 * which consists of refreshing the EntityState widget
		 * */
		function eventListenerMqttTdDashboard(eventData) {
			if (eventData.detail.subType.includes("refresh")) {
				// Refresh the Downtime Status 6 Reason for the Entity
				// Set job progress of the running work order on the entity
				 wwEntityStateSetData();
			}
		}

		/**
		 * eventHandlerMqttTdDashboard
		 * Event detected is associated in configuration directly with this Handler.
		 * There is no need to raise a Windows Event.
		 * Processing of Event consists of refreshing the EntityState widget.
		 * IMPORTANT NOTE: THIS HANDLER NEEDS TO BE DECLARED IN THE LIST OF FUNCTIONS EXPOSED BY THE OBJECT.
		 */
		function eventHandlerMqttTdDashboard(eventData) {
			// Check if eventData.eventSubType matches refresh
			if (eventData.eventSubType.includes("refresh")) {
				// Refresh the Downtime Status 6 Reason for the Entity
				 wwEntityStateSetData();
			}
		}
		/**
		 * @param {*} error
		 */
		function handleScriptError(error) {
			let errorMessage;
			if (error instanceof TypeError) {
				errorMessage = skelta.localize.getString("@@PE_UnexpectedType@@");
			} else if (error instanceof ReferenceError) {
				errorMessage = skelta.localize.getString("@@PE_ReferenceError@@");
			} else {
				errorMessage = skelta.localize.getString("@@PE_DuringScriptExecution@@");
			}
			SFU.showError(skelta.localize.getString("FormNGFErrorRunningScript_title"), errorMessage, null, error.message);
			throw errorMessage;
		}
		/**
		 * Set Entity State Data to Entity State widget - For Entity in context
		 */
		function wwEntityStateSetData() {
			try {
				let noConfigEntStateData = "";
				  
				const parameterCollection = { ent_name: entName };
				// Set state of the entity
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_S_PE_Ent_State", parameterCollection, false).then(
					(data) => {
						_controls.wwEntityState.value = "";
						if (data.length > 0) {
							_controls.wwEntityState.widgetProperties.data = JSON.stringify(data);
						} else {
							// No Config Ent data
							noConfigEntStateData = NO_CONFIG_ENT_STATE_DATA.replace("xxent_id", entId).replace("xxequip_ent_id", entId);
							_controls.wwEntityState.widgetProperties.data = noConfigEntStateData;
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
		 * Widget entity state change functionality
		 * Widget value is CurrentStateOfEntity/EntityId - Splitted by '/' and used
		 * Inwoke Set Raw Reason work flow to create utilization record
		 */
		function wwEntityStateOnDataChange() {
			if (_controls.wwEntityState.value !== "") {
				const entityStateValue = _controls.wwEntityState.value.split("/");
				const toStateOfEntity = entityStateValue[1] === "NoConfig" ? ENTITY_STATE : entityStateValue[1];
				const entityId = entityStateValue[2];
				_controls.hfEntityState.value = toStateOfEntity;
				_controls.hfEntityId.value = entityId;
				SFU.invokeWorkflow(_controls.iwSetRawReason);
			}
		}
		/**
		 * Post inwoke workflow setRawReason - set entity state
		 */
		function iwSetRawReasonOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			wwEntityStateSetData();
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"pe",
					"pe.utilHistory.assign",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"PE_UI_EntState",
					"pe.utilHistory.assign",
				);
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
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm, 
			wwEntityStateOnDataChange: wwEntityStateOnDataChange,
			iwSetRawReasonOnPostWorkflow: iwSetRawReasonOnPostWorkflow,
			eventHandlerMqttTdDashboard: eventHandlerMqttTdDashboard,
		};
	}
})(window);
