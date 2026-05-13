/*
Name:			FT_UI_EventsFromMqttTopics.js
Description:	Carries the functionality related to establishing a connection to MQTT + subscribe to Topics
					defined in a configuration table where they are also mapped to Windows Events so that
					when there is a change in the Mqtt Topic the corrsponding event is raised
					Serves e.g. to trigger the refresh of Dashboard / Tasks / Header based on events from outside MES UI
					like from System Platform

Ver 	Release			By				Date				Change Description
001		01.02.00		Somya S		2025-04-10	First Version
002		01.02.00		Somya S		2025-07-02	Extended to be more generic: config has Handler in addition to Events
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.FT = window.FT || {};
	FT.EventsFromMqttTopics = FT.EventsFromMqttTopics || {};
	FT.EventsFromMqttTopics = EventsFromMqttTopics();

	// Start up module
	FT.EventsFromMqttTopics.initialize();
	// ------------------------------------------------------------------------------------

	/**
	 * FT.EventsFromMqttTopics
	 * @returns {object} FT.EventsFromMqttTopics template object.
	 */
	function EventsFromMqttTopics() {
		// #region Constant variables
		// ---------------------------- Constant Variables ----------------------------------
		const LIST_JS = ["js/MES/FT_WebApi.js", "js/MES/FT_Mqtt.js", "./MQTT/mqttws31-min.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = [];
		// ----------------------------------------------------------------------------------
		// #endregion Constant variables
		// #region Private variables
		// ----------------------------- Private Variables ----------------------------------
		let mqttClientID = ""; // unique identifier of MQTT client //

		let arrTopics = []; // array of Topics to subscribe to //

		// array key+value where key=Topic , value=array of events to be raised on value change of topic //
		//											each one being a JSON object {event_type, event_subType}
		let arrTopicEvents = [];

		// array key+value where key=Topic , value=initialized to INIT, then the latest value acquired from MQTT  //
		//											serves to detect the 1st change occurring immediately after connection //
		let arrTopicValues = [];

		// ----------------------------------------------------------------------------------
		// #endregion Private variables
		// #region initialize
		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 */
		function initialize() {
			// Include js files
			includeJsFiles();

			// Include JS files via AJAX
			includeJsFilesAjax();

			// Include CSS files
			includeCssFiles();
		}
		// #endregion initialize
		// #region include functions
		function includeJsFiles() {
			SFU.includeCustomJsFiles(LIST_JS);
		}

		function includeJsFilesAjax() {
			LIST_JS_AJAX.forEach((url) => {
				$.ajax({
					type: "GET",
					url: url,
					dataType: "script",
					cache: true,
					async: false,
				});
			});
		}

		function includeCssFiles() {
			SFU.includeCustomCssFiles(LIST_CSS);
		}
		// #endregion include functions

		// #region Start Detection function

		/**
		 * StartAcquisitionEvents
		 *	Called externally on FormLoad of the Form associated, this function
		 *		- Loads configuration of Topics & Events mapped into local arrays
		 *		- Starts the acquisition by connecting to MQTT Broker and
		 *			subscribing to the Topics configured
		 *	Current format of context key : {formName: <formName>, entName: <entName>}
		 */
		function startAcquisitionEvents(contextKey = null, resetArraysTopicsEvents = true) {
			// Load the mapping configuration Topics-Events //
			loadConfigTopicsEventsMapping(contextKey, resetArraysTopicsEvents);

			// run once after 1 secs – async from OnFormLoad to speed up //
			//	commented out the IF check because you need to refresh the connection anyway each time you restart acquisition
			//		e.g. on change of Entity in context
			setTimeout(() => {
				// ---- if (!FT.Mqtt.isClientConnected(mqttClientID)) ---- force the reconnection anyway --
				startMqttAcquisitionEvents((contextKey = contextKey));
			}, 1000);
		}

		// #endregion Start Acquisition function

		// #region load configuration functions

		/**
		 * LoadConfigTopicsEventsMapping
		 *	From the config table, load the configuration carrying the combinations of
		 *		Mqtt Topic / Event(s) to raise , with the associated data
		 *	according to the context key passed as input
		 *  Account for the fact that the same Mqtt Topic may have to raise multiple Events
		 *
		 *	Current format of context key : {formName: <formName>, entName: <entName>}
		 *
		 *	On correct completion:
		 *		arrTopics = ["Group/EntName/Topic1","Group/EntName/Topic2",...]
		 *		arrTopicValues["Group/EntName/Topic1"] = "INIT"
		 *		arrTopicValues["Group/EntName/Topic2"] = "INIT"
		 *		arrTopicEvents["Group/EntName/Topic1"] = [{eventHandler: <event 1 handler>, eventType: <event 1 to raise>,
		 			eventSubType: <event1 subtype>}
		 *		,{eventHandler: <event 2 handler>, event_type: <event 2 to raise>, eventSubType: <data to attach event2>},...]
		 *		arrTopicEvents["Group/EntName/Topic2"] = [{eventHandler: <event 1 handler>,
		 			eventType: <event 1 to raise>, eventSubType: <event 1 subtype>}
		 *	 ,{eventHandler: <event 2 handler>, eventType: <event 2 to raise>, eventSubType: <data to attach event2>}...]
		 */
		function loadConfigTopicsEventsMapping(contextKey = null, resetArraysTopicsEvents = true) {
			// Get Entity Name from the context //
			//const { entName } = contextKey;
			const entName = contextKey.entName;

			// Query the config table using the contextKey as filter - default key Type is Form, no need to pass //
			const paramGetTopicsEvents = {
				keyValue: contextKey.formName,
			};
			const topicsEventsData = FT.WebApi.mesGetSync(
				"api/V3/DirectAccess",
				"SP_SA_FT_Config_MqttTopic_Events_Link",
				paramGetTopicsEvents,
				false,
			);
			// if requested to reset the arrays of Topics & Events (default), do so //
			if (resetArraysTopicsEvents) {
				arrTopics = []; // array of Topics to subscribe to //
				arrTopicEvents = [];
				arrTopicValues = [];
			}

			if (topicsEventsData != null && topicsEventsData.length > 0) {
				// Fill in the array with Topic Names serving for MQTT subscription //
				//	+ creates / updates the key+value entries where
				//		key = mqtt topic		value = array of objects {eventType: <event_type>, event_subType: <event_subType>}
				// Note: consider that the same Topic may have many Events i.e. same Topic appears many times
				topicsEventsData.forEach((topicEvent) => {
					// build the Topic full string replacing placeholders //
					const fullMqttTopic = topicEvent.mqtt_topic.replace("<EntName>", entName);

					// append Topic to the Topics list if not yet present //
					if (!arrTopics.includes(fullMqttTopic)) arrTopics.push(fullMqttTopic);

					// if Topic not yet present in list (Topic,Events) append it
					//		and set the event Type + SubType as 1st element in array value
					if (arrTopicEvents[fullMqttTopic] === undefined) {
						arrTopicEvents[fullMqttTopic] = [
							{
								eventHandler: topicEvent.event_handler,
								eventType: topicEvent.event_type.replace("<EntName>", entName),
								eventSubType: topicEvent.event_subtype.replace("<EntName>", entName),
							},
						];
					} else {
						arrTopicEvents[fullMqttTopic].push({
							eventHandler: topicEvent.event_handler,
							eventType: topicEvent.event_type.replace("<EntName>", entName),
							eventSubType: topicEvent.event_subtype.replace("<EntName>", entName),
						});
					}
				});
			}
		}

		// #endregion LoadConfiguration function

		// #region Start Stop OnConnect Acquisition Events from Mqtt //

		/**
		 * startMqttAcquisitionEvents
		 * ==========================
		 *	Start the acquisition from connection to MQTT topics
		 *	Argument is the callback on connect success: if passed, that is used, else a default one is used
		 */
		function startMqttAcquisitionEvents(contextKey, onConnectSuccess = null) {
			// use either the callback passed or the default one //
			const onConnectSuccessCallback = onConnectSuccess && onConnectSuccess !== null ? onConnectSuccess : onConnectMqttBroker;

			// console.log( "start acquis mqttClientID = " + JSON.stringify(mqttClientID) );

			// if there is an active connection to MQTT, disconnect //
			if (FT.Mqtt.isClientConnected(mqttClientID)) {
				// console.log("DISCONNECT PRIOR TO RECONNECTING - contextKey form=" + contextKey.formName + " ent=" + contextKey.entName);
				stopMqttAcquisitionEvents();
			}

			// console.log("CONNECTING MQTT FOR form=" + contextKey.formName + " ent=" + contextKey.entName);

			// Array of MQTT Topics to subscribe was built by function loading config topic-event mapping //

			// console.log("ARRAY TOPICS = " + JSON.stringify(arrTopics) );

			// MES connection init includes clientID creation and subscribing to tags in the array //
			//	Arguments: array of Topics to subscribe to / callback on data change of any topic / callback on connection
			//				whether to always return client for Primary Server / whether return always client for Failover Server
			//				interval in secs for 'keepAlive' / connection timeout in secs / set automatic reconnection
			//	includes callback for broker connection + callback run whenever there is a change in data
			if (!FT.Mqtt.isClientConnected(mqttClientID)) {
				mqttClientID = FT.Mqtt.connectionMesInit(
					arrTopics,
					onTopicDataChangeFromMqtt,
					onConnectSuccessCallback,
					false,
					false,
					30,
					10,
					true,
				);
			}
		}

		/**
		 * stopMqttAcquisitionEvents
		 * =====================
		 *	Stops the acquisition of Data from MQTT
		 */
		function stopMqttAcquisitionEvents() {
			// Unsubscribes from the current Scale topics + disconnect Client from broker //
			if (FT.Mqtt.isClientConnected(mqttClientID)) {
				FT.Mqtt.tagsUnsubscribe(mqttClientID, arrTopics, null);
				FT.Mqtt.clientDisconnect(mqttClientID);
			}
		}

		/**
		 * onConnectMqttBroker
		 * ===================
		 *	callback of positive connection and subscription
		 * 	Just mark on console log
		 */
		function onConnectMqttBroker() {
			console.log("OK CONNECTION TO MQTT BROKER");
		}

		// #endregion Start Stop OnConnect Acquisition Events from Mqtt //

		// #region OnDataChange Topic from Mqtt //
		/**
		 * onTopicDataChangeFromMqtt
		 * =========================
		 *	Callback when there is a change in one of the subscribed topics (e.g Events from Mqtt for the Entity)
		 *
		 */
		function onTopicDataChangeFromMqtt(messageObject, value) {
			// 'messageObject.destinationName' is the Topic full reference //
			//	this is the key to search for the list of Values and Events associated //

			// Do not raise Events if callback triggered immediately after connection //
			if (arrTopicValues[messageObject.destinationName] === undefined) {
				arrTopicValues[messageObject.destinationName] = value;
				return;
			}

			// Get the array of event objects associated to the Topic that changed //
			const arrEventsForTopic = arrTopicEvents[messageObject.destinationName];

			// for each Event in the array, either run the Handler indicated in configuration
			//			or raise the Windows Event indicated in configuration
			//		In both cases pass to the callback the value of the Topic as 'eventData'
			//	If Handler is specified in configuration, there it must be set with full namespace like  My.Namespace.FunctionName
			arrEventsForTopic.forEach((eventTopic) => {
				// if the config of the Event contains a Handler //
				if (eventTopic.eventHandler !== undefined && eventTopic.eventHandler !== null && eventTopic.eventHandler !== "") {
					// The Event Handler is specified in the JS that included the MQTT Event functionality //
					// 	This means the Handler has to be referred using the full namespace of the object + function name //
					//		as something like 	window["My"]["Namespace"]["FunctionName"](arguments)
					let context = window;
					const arrNamespaces = eventTopic.eventHandler.split("."); // split full Handler function name into parts //
					const functionName = arrNamespaces.pop(); // remove from array the last part (functionName) //
					for (
						let i = 0;
						i < arrNamespaces.length;
						i++ // build progressively the context (window) reference with the Namespace elements //
					) {
						context = context[arrNamespaces[i]];
					}

					// check that what we are going to call is actually a function defined //
					if (typeof context[functionName] === "function") {
						// build the arguments object and call the function - if no exception raised, return so the event is not raised //
						//	consider that an exception is likely raised by the execution of the Handler itself //
						const eventArgs = { eventType: eventTopic.eventType, eventSubType: eventTopic.eventSubType, data: value };
						try {
							context[functionName](eventArgs);
							return;
						} catch (err) {
							console.log("ERROR executing event handler: " + eventTopic.eventHandler + "  ERR=" + err.message);
						}
					} else alert("CONFIG ERROR: Event Handler is not a function: " + eventTopic.eventHandler);
				}

				// if no handler is set, or an invalid one is indicated, raise the Windows Event with Type + SubType indicated //
				FT.Common.windowEventDispatch(
					eventTopic.eventType,
					eventTopic.eventSubType,
					FT.Common.EVENT_SOURCE_TYPE.mqtt,
					messageObject.destinationName,
					value,
				);
			});
		}

		// #endregion OnNew Event from Mqtt //

		// #region return
		return {
			initialize: initialize,
			startAcquisitionEvents: startAcquisitionEvents,
		};
		// #endregion return
	}
})(window);
