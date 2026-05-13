/*
Name:       	FT_Mqtt.js
Description:	FT_Mqtt js Provides functions for handling the communication between Worktask forms and MQTT broker.

Ver		Release 	By    				Date     		Change Description
001		00.50			Ramesh V			2024-06-14	#2695 First version.
002		00.50			Shamanth S		2024-10-14	#3560 Added new attribute to enable or disable SSL.
003		00.50			Praveen 		  2024-10-26	#3578 check whether in this moment a connection exists or not.
004		01.02.00 	Fayaz A				2025-07-04	#5093 Updated to set and retrieve data using FT functions instead of accessing storage directly.
*/

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.FT = window.FT || {};
	FT.Mqtt = FT.Mqtt || {};
	FT.Mqtt = Mqtt();
	// Start up module
	FT.Mqtt.initialize();
	// ------------------------------------------------------------------------------------

	/**
	 * FT.Mqtt
	 * @returns {object} FT.Mqtt template object.
	 */
	function Mqtt() {
		// #region Constant variables
		// ---------------------------- Constant Variables ----------------------------------
		const LIST_JS = ["js/MES/FT_WebApi.js", "./MQTT/mqttws31-min.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = [];
		const SS_CONFIG_RUNNING = "ftMqttConfigRunning";
		const MES_MQTT_BROKER_PRI = 0;

		// ----------------------------------------------------------------------------------
		// #endregion Constant variables
		// #region Private variables
		// ----------------------------- Private Variables ----------------------------------
		let brokerIdentity;
		let userCfgTimeLimitMinutes;
		let primaryHost;
		let primaryPort;
		let failoverHost;
		let failoverPort;
		let userName;
		let password;
		let path;
		let brokerConfig;
		let isSsl;
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

			// Load the MQTT settings from system_attr
			settingsLoad();
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
		// #region settingsLoad function
		function settingsLoad() {
			const GroupName = "MQTT Connection Settings";
			FT.WebApi.mesSystemAttr(GroupName)
				.then((result) => {
					const data = result;
					if (!data || data.length === 0) {
						SFU.showError(skelta.localize.getString("@@FT_ApiError@@"), skelta.localize.getString("@@FT_APIErrorDesc@@"));
						return;
					}

					data.forEach((item) => {
						const { attr_id: attrId, attr_value: attrValue } = item;

						switch (attrId) {
							case 70000:
								broker = attrValue;
								break;
							case 70001:
								brokerIdentity = attrValue;
								break;
							case 70002:
								primaryHost = attrValue;
								break;
							case 70003:
								primaryPort = attrValue;
								break;
							case 70004:
								failoverHost = attrValue;
								break;
							case 70005:
								failoverPort = attrValue;
								break;
							case 70006:
								groupId = attrValue;
								break;
							case 70007:
								userCfgTimeLimitMinutes = attrValue;
								break;
							case 70008:
								userName = attrValue;
								break;
							case 70009:
								password = attrValue;
								break;
							case 70010:
								path = attrValue;
								break;
							case 70011:
								isSsl = attrValue;
								break;
							default:
								// Handle unknown attribute descriptions if necessary
								break;
						}
					});

					const config = {
						BrokerIdentity: brokerIdentity,
						User: userName,
						Password: password,
						TimeStamp: new Date().toISOString(),
						Path: path,
					};
					FT.WorkTasks.sessionStorageJsonSet(SS_CONFIG_RUNNING, JSON.stringify(config));
				})
				.catch((error) => {
					throw new Error(error);
				});
		}
		// #endregion settingsLoad function
		// #region client functions
		/**
		 * Function: Returns a new instance of the MES MQTT client requested.
		 * Notes:
		 * when both parameter are false automatic selection based on active broker as until version 2.1
		 * when both parameter are true  primary is returned
		 * @param {boolean} primary       [optional] Always return client for primary broker
		 * @param {boolean} failover        [optional] Always return client for failover broker
		 * @return {Object} client  Phao MQTT Client
		 */
		function clientMesGet(primary, failover) {
			let brokerServerHost;
			let connectionPort;
			let isPrimary = primary;
			let isFailover = failover;

			brokerConfig = JSON.parse(FT.WorkTasks.sessionStorageJsonGet(SS_CONFIG_RUNNING));

			if (!(primary || failover) && brokerConfig) {
				const brokerID = brokerConfig.BrokerIdentity;
				const currentTimestamp = new Date();
				const expirationDateTime = new Date(brokerConfig.TimeStamp);
				expirationDateTime.setMinutes(expirationDateTime.getMinutes() + parseInt(userCfgTimeLimitMinutes, 10));

				if (brokerID === "0") {
					return null;
				}

				if (currentTimestamp < expirationDateTime) {
					if (brokerID === "primary") {
						isPrimary = true;
						isFailover = false;
					} else if (brokerID === "failover") {
						isPrimary = false;
						isFailover = true;
					}
				} else {
					isPrimary = false;
					isFailover = false;
					sessionStorage.removeItem(SS_CONFIG_RUNNING);
				}
			}

			if (isPrimary) {
				brokerServerHost = primaryHost;
				connectionPort = primaryPort;
			} else if (isFailover) {
				brokerServerHost = failoverHost;
				connectionPort = failoverPort;
			} else {
				brokerServerHost = brokerIdentity === String(MES_MQTT_BROKER_PRI) ? primaryHost : failoverHost;
				connectionPort = brokerIdentity === String(MES_MQTT_BROKER_PRI) ? primaryPort : failoverPort;
			}

			if (!brokerServerHost || !connectionPort) return null;

			const clientUID = SFU.getVirtualActorId() + new Date().getTime() + Math.random();
			return new Paho.MQTT.Client(brokerServerHost, Number(connectionPort), path, "" + clientUID);
		}
		/**
		 * Private Function: Returns a new instance of MQTT client for the specified connection parameters.
		 * To be used when connecting to other MQTT broker not managed by MES.
		 * @param {string} brokerIP     [required] MQTT broker IP or hostname
		 * @param {integer} brokerPort  [required] MQTT WebSocket Port
		 * @param {string} brokerPath   [optional] MQTT broker path
		 * @param {string} clientId     [optional] MQTT client id if null a default is generated
		 * @return {Object} client  Phao MQTT Client
		 */

		function clientGet(brokerIP, brokerPort, brokerPath, clientId) {
			const uniqueClientId = clientId || SFU.getVirtualActorId() + new Date().getTime() + Math.random();
			return new Paho.MQTT.Client(brokerIP, Number(brokerPort), brokerPath, uniqueClientId);
		}

		function clientSend(client, messageObject) {
			if (client && client.isConnected() && messageObject) {
				client.send(messageObject);
			}
		}

		function clientDisconnect(client) {
			if (client && client.isConnected()) {
				client.disconnect();
			}
		}
		// #endregion client functions
		// #region connection functions
		/**
		 *  Function: Initializes the MQTT communication to specified client.
		 *
		 * @param {object}   client         [required] MQTT Client Instance
		 * @param {string[]} tagNames       [optional] List of mqtt tags to subscribe on connection
		 * @param {Function} onValueReceived    [optional] Callback function for notifying tag value received
		 * @param {Function} onConnect          [optional] Callback function for notifying connect success
		 * @param {integer} keepAliveInterval   [optional] MQTT keep alive interval seconds default 30
		 * @param {integer} timeout         [optional] MQTT connection timeout seconds default 10
		 */
		function connectionInit(client, tagNames, onValueReceived, onConnect, keepAliveInterval = 30, timeout = 10) {
			if (!client) return;
			client.isConnecting = true;

			client.onConnectionLost = onConnectionLost;
			client.onMessageArrived = onMessageArrived;
			brokerConfig = JSON.parse(FT.WorkTasks.sessionStorageJsonGet(SS_CONFIG_RUNNING));
			const connectionOptions = {
				keepAliveInterval: keepAliveInterval,
				timeout: timeout,
				onSuccess: onConnectSuccess,
				onFailure: onConnectFailure,
			};
			if (typeof window !== "undefined" && window.location.protocol === "https:") {
				connectionOptions.useSSL = true;
				connectionOptions.userName = brokerConfig.User;
				connectionOptions.password = brokerConfig.Password;
			}
			client.reconnect = () => {
				if (!client.isConnected() && !client.isConnecting) {
					client.isConnecting = true;
					client.connect(connectionOptions);
				}
			};

			client.connect(connectionOptions);

			function onConnectSuccess() {
				client.isConnecting = false;

				const subscribeOptions = {
					onSuccess: onSubscribeSuccess,
					onFailure: onSubscribeFailure,
				};
				if (!!tagNames && tagNames.length > 0) {
					tagNames.forEach((tagName) => {
						const mqttItemName = !!groupId && groupId !== "" && tagName.indexOf("/") === -1 ? groupId + "/" + tagName : tagName;
						client.subscribe(mqttItemName, subscribeOptions);
					});
				}

				if (onConnect) onConnect(client);
			}

			function onConnectFailure(responseObject) {
				client.isConnecting = false;
				if (onConnect) onConnect(client);
				throw new Error(`[MQTT] Connection failure. Error: ${responseObject.errorMessage}`);
			}

			function onSubscribeSuccess() {}

			function onSubscribeFailure(responseObject) {
				if (responseObject.errorCode !== 0) {
					throw new Error(`[MQTT] Subscription failure. Error: ${responseObject.errorMessage}`);
				}
			}

			function onMessageArrived(messageObject) {
				try {
					const { payloadString } = messageObject;
					const payload = JSON.parse(payloadString);
					const value = payload.d || "";
					onValueReceived(messageObject, value);
				} catch (errmsg) {
					throw new Error(`Error in callback function: ${errmsg}`);
				}
			}

			function onConnectionLost(responseObject) {
				if (responseObject.errorCode !== 0) {
					// Attempt to reconnect
					client.reconnect();
					throw new Error(`[MQTT] Connection lost. Error: ${responseObject.errorMessage}`);
				}
			}

			window.onbeforeunload = () => {
				if (client.isConnected()) client.disconnect();
			};
		}

		/**
		 * Initializes the MQTT communication for the MES broker.
		 * @param {string[]} tagNames MQTT tags to subscribe to.
		 * @param {Function} onValueReceived Callback for tag value received.
		 * @param {Function} onConnect Callback for connection success.
		 * @param {boolean} primary Use the primary broker.
		 * @param {boolean} failover Use the failover broker.
		 * @param {integer} keepAliveInterval Keep alive interval in seconds.
		 * @param {integer} timeout Connection timeout in seconds.
		 * @return {Object} MQTT Client instance.
		 */
		function connectionMesInit(
			tagNames,
			onValueReceived,
			onConnect,
			primary = false,
			failover = false,
			keepAliveInterval = 30,
			timeout = 10,
			reconnect = true,
		) {
			const client = clientMesGet(primary, failover);
			if (!client) return null;

			connectionInit(client, tagNames, onValueReceived, onConnect, keepAliveInterval, timeout);

			return client;
		}
		// #endregion connection functions
		// #region tag action functions
		/**
		 * Public Function To add additional tags to an existing MQTT Connection
		 * @param {Function} client          [required] reference to MQTT client with active connection
		 * @param {string[]} tagNames      List of tags to subscribe.
		 * @param {function} onValueReceived  Callback to update.
		 */
		function tagsSubscribe(client, tagNames, onValueReceived) {
			if (!client) {
				throw new Error("MQTT client is not provided.");
			}

			const connectOptions = {
				onSuccess: () => {
					if (!!tagNames && tagNames.length > 0) {
						tagNames.forEach((tagName) => {
							const mqttItemName = !!groupId && groupId !== "" && tagName.indexOf("/") === -1 ? groupId + "/" + tagName : tagName;
							client.subscribe(mqttItemName, {
								onSuccess: () => {},
								onFailure: (error) => {
									throw new Error(`Failed to subscribe to ${mqttItemName}: ${error}`);
								},
							});
						});
					}

					client.onMessageArrived = (message) => {
						try {
							const { payloadString } = message;
							const payload = JSON.parse(payloadString);
							const value = payload.d || "";
							// Call the provided callback function with the received value
							onValueReceived(message, value);
						} catch (errmsg) {
							throw new Error(`Error in callback function: ${errmsg}`);
						}
					};
				},
				onFailure: (error) => {
					throw new Error(`Failed to connect to MQTT broker: ${error}`);
				},
			};

			if (!client.isConnected()) {
				if (typeof window !== "undefined" && window.location.protocol === "https:") {
					connectOptions.useSSL = true;
					connectOptions.userName = brokerConfig.User;
					connectOptions.password = brokerConfig.Password;
				}
				client.connect(connectOptions);
			}
		}

		/**
		 * Public Function To remove tags from an existing MQTT Connection
		 * @param {Function} client          [required] reference to MQTT client with active connection
		 * @param {string[]} tagNames           List of tags to subscribe.
		 */
		function tagsUnsubscribe(client, tagNames, onMessageArrived = null) {
			if (!client) return;

			// Check if the client is connected
			if (!client.isConnected()) {
				throw new Error("Cannot unsubscribe: client is not connected.");
			}

			// Optionally set the onMessageArrived callback if provided
			if (onMessageArrived) {
				client.onMessageArrived = onMessageArrived;
			}
			if (!!tagNames && tagNames.length > 0) {
				// Unsubscribe from each tag
				tagNames.forEach((tagName) => {
					const mqttItemName = !!groupId && groupId !== "" && tagName.indexOf("/") === -1 ? groupId + "/" + tagName : tagName;
					client.unsubscribe(mqttItemName, {
						onSuccess: () => {},
						onFailure: (error) => {
							throw new Error(`Failed to unsubscribe from ${mqttItemName}: ${error.errorMessage}`);
						},
					});
				});
			}
		}

		/**
		 * Public Function: Writes the specified value to the specified tag destination of the MES MQTT Broker.
		 * Always writes on 2 brokers when failover broker exists
		 * @param {string} tagName    MQTT destination
		 * @param {Object} tagValue   Value to be written
		 * @param {object} client OPTIONAL client to use
		 */
		function tagWrite(tagName, tagValue, client) {
			let primaryClient;
			let backupClient;

			// Step 01: Check Clients
			if (client) {
				// Step 01 A: Use passed client
				primaryClient = client;
			} else {
				// Step 01 B: Use MES clients
				primaryClient = clientMesGet(true, false);

				if (!!failoverHost && failoverHost !== primaryHost) {
					backupClient = clientMesGet(false, true);
				}
			}

			if (!primaryClient && !backupClient) {
				return;
			}

			// Step 02: Prepare the message
			// Prepare the message Common
			// Write the value.
			let dataType = 0;
			if (typeof tagValue === "boolean") {
				dataType = 11;
			} else if (typeof tagValue === "string") {
				dataType = 8;
			} else if (typeof tagValue === "number") {
				dataType = 3; // TODO: verify if we need to distinguish between 3=integer and 4=decimal.
			}

			const payload = {
				d: tagValue,
				dt: dataType,
				ts: new Date().toISOString(),
				q: 192,
			};
			const message = new Paho.MQTT.Message(JSON.stringify(payload));

			message.destinationName = tagName;

			// Step 03: Start Connections
			if (primaryClient) {
				connectionInit(primaryClient, [], null, onPrimaryConnectSuccess);
			}
			if (backupClient) {
				connectionInit(backupClient, [], null, onBackupConnectSuccess);
			}

			function onPrimaryConnectSuccess() {
				primaryClient.send(message);

				// After writing the value, disconnect.
				primaryClient.disconnect();
			}

			function onBackupConnectSuccess() {
				backupClient.send(message);

				// After writing the value, disconnect.
				backupClient.disconnect();
			}
		}

		/**
		 * Writes the specified values to the specified MQTT tag destinations of the MES MQTT Broker.
		 * @param {Array} tagList An array of objects containing MQTT tag names and values.
		 * @param {Object} client OPTIONAL MQTT client to use.
		 */
		function tagWriteMultiple(tagList, client) {
			let mqttPrimaryClient;
			let mqttBackupClient;

			// Step 01: Check Clients
			if (client) {
				// Step 01 A: Use passed client
				mqttPrimaryClient = client;
			} else {
				// Step 01 B: Use MES clients
				mqttPrimaryClient = clientMesGet(true, false);

				if (failoverHost && failoverHost !== primaryHost) {
					mqttBackupClient = clientMesGet(false, true);
				}
			}

			if (!mqttPrimaryClient && !mqttBackupClient) return;

			// Step 02: Prepare the messages
			const messages = tagList.map((item) => {
				const { tagName, tagValue } = item;

				// Determine data type
				let dataType = 0;
				if (typeof tagValue === "boolean") {
					dataType = 11;
				} else if (typeof tagValue === "string") {
					dataType = 8;
				} else if (typeof tagValue === "number") {
					dataType = 3; // TODO: verify if we need to distinguish between 3=integer and 4=decimal
				}

				const payload = {
					d: tagValue,
					dt: dataType,
					ts: new Date().toISOString(),
					q: 192,
				};
				const message = new Paho.MQTT.Message(JSON.stringify(payload));
				message.destinationName = tagName;

				return message;
			});

			// Step 03: Start Connections
			if (mqttPrimaryClient) {
				if (mqttPrimaryClient.isConnected()) {
					sendAllMessages(mqttPrimaryClient, messages);
				} else {
					connectionInit(mqttPrimaryClient, [], null, () => sendAllMessages(mqttPrimaryClient, messages));
				}
			}

			if (mqttBackupClient) {
				if (mqttBackupClient.isConnected()) {
					sendAllMessages(mqttBackupClient, messages);
				} else {
					connectionInit(mqttBackupClient, [], null, () => sendAllMessages(mqttBackupClient, messages));
				}
			}

			function sendAllMessages(mqttClient, mqttMessages) {
				mqttMessages.forEach((message) => {
					mqttClient.send(message);
				});
				// After writing the values, disconnect.
				mqttClient.disconnect();
			}
		}
		// if client is connected //
		function isClientConnected(client) {
			if (client !== undefined && client !== "" && client !== null) return client.isConnected();
			return false;
		}
		// #endregion tag action functions
		// #region return
		return {
			initialize: initialize,
			clientMesGet: clientMesGet,
			clientGet: clientGet,
			connectionInit: connectionInit,
			connectionMesInit: connectionMesInit,
			tagsSubscribe: tagsSubscribe,
			tagsUnsubscribe: tagsUnsubscribe,
			tagWrite: tagWrite,
			tagWriteMultiple: tagWriteMultiple,
			clientSend: clientSend,
			clientDisconnect: clientDisconnect,
			isClientConnected: isClientConnected,
		};
		// #endregion return
	}
})(window);
