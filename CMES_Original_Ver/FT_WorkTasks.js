/*
Name:					FT_WorkTasks.js
Description:	FT_WorkTasks js file implements functions to interact with Work Tasks.

Ver		Release		By					Date		 		Change Description
001		00.50     Shamanth S	2024-06-14	#2693 First version.
002		00.50     A. Tonani		2024-07-17	Modify getUserInfo and getUserName to work without connector
003   00.50     R. Vatnaala 2024-07-25  Added new function to get dateTime in string format.
004   00.50     A. Tonani   2024-08-02  Fixed Check Workflow Function. Not working.
005   00.50			Shamanth S  2024-09-11  #3393 Updated contextGet and contextSet functions to handle form parameters.
006		00.50			A. Tonani		2024-09-17  Fixed result management in workflowCheckStatus when result is FN.
007   00.50			Shamanth S  2024-09-20  Added qmSample to context.
008   00.50			Praveen     2024-10-18  Modify workflowCheckStatus function.
009		00.70			Somya S			2024-12-17	Changes for Domain Name in UserInfo Function.
010		00.70     Chitta			2024-12-17	#4126 forms  MP_UI_JobProduce screen , lot and sublot needs to be in Context
011		00.70     Fayaz A			2025-01-08	#3894 Removed type 'MP_UI_JobProduce' from contextData variable and updated utilHistory.
012		01.00			Bas van B		2025-02-21	#4253 Added missing bomVerId and parentItemId to job bom context.
013   01.00			AT					2025-02-21  #4349 formTitleSet requires window.parent to work properly.
014   01.00			Fayaz A			2025-03-24  #4569 Added a catch for promise in function workflowCheckStatus.
015   01.01.00	Fayaz A			2025-05-14  #4955 Added a new type 'filterData' in contextData variable to hold the JSON value of selected action.
016   01.01.00	Praveen			2025-05-16  #5006 return false should only be called inside the if block in the observeNodes() function.
017   01.02.00	Fayaz A			2025-07-04  #5093 Updated sessionStorageJson functions to use sessionStorage directly instead of SFU functions.
		                                          Added new functions localStorageJsonSet and localStorageJsonGet that use SFU functions for
																							localStorage handling.
*/

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.FT = window.FT || {};
	FT.WorkTasks = FT.WorkTasks || {};
	FT.WorkTasks = WorkTasks();
	// Start Up Module
	FT.WorkTasks.initialize();

	// ------------------------------------------------------------------------------------
	/**
	 * workTasks
	 * @returns {null} workTasks template object.
	 */
	function WorkTasks() {
		// #region Constant variables
		// ---------------------------- Constant Variables ----------------------------------
		const LIST_JS = ["js/MES/FT_WebApi.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = [];

		// Context variable name stored in session storage
		const SS_CONTEXT = "ftContext";

		// WT Workflow Status
		const WF_STATUS = {
			executionPending: "EP",
			finishedWithErrors: "FE",
			finishedSuccessfully: "FN",
			failedAndRetryingTheWorkflowExecutedWithError: "FR",
			executing: "EX",
			paused: "PA",
			aborted: "AB",
			awaiting: "SL",
		};
		const WF_CHK_STATUS_RATE = 500; // 3.34 Rate (in milliseconds) for checking the status of a workflow with recursive function.
		const WF_CHK_STATUS_MAX = 120; // Maximum attempts for checking the status of a workflow.

		// WT Log Level
		const LOG_LEVEL = {
			production: 1,
			hyperCare: 2,
			Debug: 100,
		};

		// WT Log Type
		const LOG_TYPE = {
			error: 1,
			warning: 2,
			trace: 3,
		};

		// Default debug level
		const LOG_DEBUG_LEVEL_DEF = 100;
		// ----------------------------------------------------------------------------------
		// #endregion Constant variables
		// #region Private variables
		// ----------------------------- Private Variables ----------------------------------
		let logDebugLevel = 0;
		let domainvalue = "";
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

			// Load the debug level for logging from system_attr
			mesSettingsLoad();

			// Check if parent domain is configured
			// getParentDomainConfigured();
		}
		// #endregion initialize
		// #region include functions
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
		// #endregion include functions
		// #region mes&user functions
		/**
		 * Retrieves the core specific system attribute values for group "MES App Settings".
		 * All System Attributes required by FT not linked to specific functions should be loaded and processed there.
		 */
		function mesSettingsLoad() {
			// Load the debug level for logging from system_attr
			const mesPromise = FT.WebApi.mesSystemAttr("MES App Settings");

			mesPromise.then((result) => {
				logDebugLevel = result.find((element) => element.attr_id === 70100);
				logDebugLevel = logDebugLevel ? logDebugLevel.attr_value : LOG_DEBUG_LEVEL_DEF;
			});
		}

		/**
		 * Function to return loggedin MES USER
		 */
		function mesUserName() {
			return this.userInfo().MESUserId;
		}

		/**
		 * Returns the information related to the current user.
		 * @return {Object}
		 */
		function userInfo() {
			const _userInfo = SFU.getUserLookupExtendedInformation(SFU.getVirtualActorId());
			// TO DO Complete information using mes webapi to retrieve additional fields

			const mesAppSettingsData = FT.WebApi.mesSystemAttr("MES App Settings", false);

			if (mesAppSettingsData && mesAppSettingsData.length !== 0) {
				const parentDomain = $(mesAppSettingsData).filter((i, item) => item.attr_id === 70101);

				if (parentDomain && parentDomain.length !== 0 && parentDomain[0].attr_value !== "") {
					domainvalue = parentDomain[0].attr_value;
					const userId = _userInfo.UserId.Contains("\\") ? _userInfo.UserId.split("\\")[1] : _userInfo.UserId;
					// If domainvalue is set, use it to format MESUserId and MESUserName
					_userInfo.MESUserId = `${domainvalue}\\${userId}`;
					_userInfo.MESUserName = `${domainvalue}\\${userId}`;
					_userInfo.MESUserDescription = _userInfo.UserName;
				}
			}

			// Directly check this condition, without using 'else'
			if (_userInfo && !_userInfo.MESUserName && _userInfo.UserDistinguishedName) {
				// CN=User Name,OU=AVEVA Users,OU=Users,OU=Project Global,DC=sd,DC=domain,DC=com
				_userInfo.MESUserDescription = _userInfo.UserName;

				// If domainvalue is empty, use the logic from UserDistinguishedName
				_userInfo.UserDistinguishedName.split(",").forEach((element) => {
					if (element.startsWith("DC=") && !_userInfo.MESUserId) {
						_userInfo.MESUserId = `${element.replace("DC=", "")}\\${_userInfo.UserId}`;
						_userInfo.MESUserName = `${element.replace("DC=", "")}\\${_userInfo.UserId}`;
					}
				});
			}

			return _userInfo;
		}

		// #endregion mes&user functions
		// #region sessionstorage functions
		/**
		 * @param key The key of the item within the session storage.
		 * @param data The data object to be added to the session storage.
		 */
		function sessionStorageJsonSet(key, data) {
			const dataJson = JSON.stringify(data);
			sessionStorage.setItem(key, dataJson);
		}

		/**
		 * @param key The name of the item within the session storage
		 * @returns {object}JSON object containing the data
		 */
		function sessionStorageJsonGet(key) {
			const dataJson = sessionStorage.getItem(key);
			if (dataJson === undefined || dataJson === "") {
				return null;
			}
			return JSON.parse(dataJson);
		}
		// #endregion sessionstorage functions

		// #region localstorage functions
		/**
		 * @param key The key of the item within the local storage.
		 * @param data The data object to be added to the local storage.
		 */
		function localStorageJsonSet(key, data) {
			const dataJson = JSON.stringify(data);
			SFU.setStorageItem(key, dataJson);
		}

		/**
		 * @param key The name of the item within the session storage
		 * @returns {object}JSON object containing the data
		 */
		function localStorageJsonGet(key) {
			const dataJson = SFU.getStorageItem(key);
			if (dataJson === undefined || dataJson === "") {
				return null;
			}
			return JSON.parse(dataJson);
		}
		// #endregion localstorage functions

		// #region context functions
		/**
		 * Initializes the context object in SessionStorage with default fields and parameters.
		 */
		function contextInit() {
			const contextData = {
				site: [
					{
						entId: null,
						siteName: null,
						regionId: null,
					},
				],
				ent: [
					{
						entId: null,
						entName: null,
						desc: null,
					},
				],
				wo: [
					{
						woId: null,
						processId: null,
						bomVerId: null,
						specVerId: null,
						itemId: null,
						reqQty: null,
					},
				],
				job: [
					{
						woId: null,
						seqNo: null,
						operId: null,
					},
				],
				jobBom: [
					{
						woId: null,
						seqNo: null,
						operId: null,
						bomPos: null,
						bomVerId: null,
						parentItemId: null,
					},
				],
				jobStep: [
					{
						woId: null,
						seqNo: null,
						operId: null,
						stepNo: null,
					},
				],
				item: [
					{
						itemId: null,
						description: null,
						uomId: null,
					},
				],
				bomItem: [
					{
						parentItemId: null,
						verId: null,
						bomPos: null,
						itemId: null,
					},
				],
				eventData: [
					{
						type: null,
						jsonValue: null,
					},
				],
				filter: [
					{
						entId: null,
						startTime: null,
						endTime: null,
					},
				],
				utilHistory: [
					{
						reasonPending: null,
						logId: null,
						reasCode: null,
						eventTime: null,
						rawReasCd: null,
					},
				],
				sample: [
					{
						sampleId: null,
						sampleName: null,
					},
				],
				itemInv: [
					{
						rowId: null,
						jsonValue: null,
					},
				],
				filterData: [
					{
						type: null,
						jsonValue: null,
					},
				],
			};

			// Store the default context object in SessionStorage
			sessionStorageJsonSet(SS_CONTEXT, contextData);
		}

		/**
		 * It updates a specific value in the conetxt session storage object only.
		 *
		 * @param {string} node The node of the context object.
		 * @param {number} index The index of the specific node, considering it is an array.
		 * @param {string} property The property in the node that needs to be updated.
		 * @param {string} value The new value.
		 */
		function contextUpd(node, index, property, value) {
			let propertyValue = value;
			// AT Check value avoid to set undefined otherwise strigify remove the nodes
			if (propertyValue === undefined) {
				propertyValue = null;
			}

			const contextString = sessionStorageJsonGet(SS_CONTEXT);

			if (node !== undefined && node !== null && !Object.prototype.hasOwnProperty.call(contextString, node)) {
				throw new Error("The specified node is not defined in ftContext");
			} else if (index !== undefined && index !== null && !Object.prototype.hasOwnProperty.call(contextString[node], index)) {
				throw new Error("The specified index is not defined in ftContext[" + node + "]");
			} else if (
				property !== undefined &&
				property !== null &&
				!Object.prototype.hasOwnProperty.call(contextString[node][index], property)
			) {
				throw new Error("The specified property is not defined in ftContext[" + node + "][" + index + "]");
			}
			if (index !== undefined && index !== null && property !== undefined && property !== null) {
				contextString[node][index][property] = propertyValue;
			} else if (index !== undefined && index !== null) {
				contextString[node][index] = propertyValue;
			} else {
				contextString[node] = JSON.parse(propertyValue);
			}

			sessionStorageJsonSet(SS_CONTEXT, contextString);
		}

		/**
		 * Retrieves the value of a parameter.
		 * @param {string} control Skelta control.
		 * @param {string} param Form parameter
		 */
		function contextGet(control, param) {
			if (param) {
				if (control) {
					if (control.formParameters[param] !== undefined) {
						// Return the value of the parameter
						return control.formParameters[param].value;
					}
				}
				const url = window.location.search;
				if (url) {
					const urlParams = new URLSearchParams(url);
					if (urlParams.has(param)) {
						const paramValue = urlParams.get(param);
						return paramValue;
					}
				}
				const contextString = sessionStorageJsonGet(SS_CONTEXT);
				if (contextString) {
					// Check if the context object contains a variable named "param"
					if (Object.prototype.hasOwnProperty.call(contextString, param)) {
						// Return the parameter value
						return contextString[param];
					}
				} else {
					return null;
				}
			}
			return null;
		}

		/**
		 * Retrieves the value of a parameter.
		 * @param {string} control Skelta control.
		 * @param {string} param Form parameter.
		 * @param {string} value Value to be set.
		 * @returns {string} Indication of the type of parameter that has been updated (Form, URL, SessionStorage)
		 */
		function contextSet(control, param, value) {
			let type = null;
			if (param) {
				if (control) {
					if (control.formParameters[param] !== undefined) {
						// Set the value to the parameter
						control.formParameters[param].value = value;
						type = "Form";
						return type;
					}
				}
				const urlParams = new URLSearchParams(window.location.search);
				if (urlParams.has(param)) {
					// Set the URL parameter with value
					urlParams.set(param, value);
					window.location.search = urlParams.toString();
					type = "URL";
					return type;
				}
				const contextString = sessionStorageJsonGet(SS_CONTEXT);

				// Check if the context object contains a variable named "param"
				if (contextString && Object.prototype.hasOwnProperty.call(contextString, param)) {
					// Check if the context object contains a variable named "param"

					const contObj = Object.keys(contextString[param][0]);
					for (let i = 0; i < contObj.length; i++) {
						const prop = contObj[i];
						const val = JSON.parse(value)[0][prop];
						contextUpd(param, 0, prop, val);
					}
					type = "SessionStorage";
					return type;
				}
			}
			return type;
		}
		// #endregion context functions
		// #region form functions
		/**
		 * Opens the specified Skelta form.
		 * @param {string} formName
		 * @param {Object} embedPage  [optional] Skelta web page container
		 */
		function formOpen(formName, embedPage, formVersion) {
			if (!formName) return;
			const url = SFU.getFormUrl(formName, formVersion);
			if (!url) {
				SFU.showError("Skelta Error", skelta.localize.getString("@@FT_FormOpen@@").format(formName));
			} else if (embedPage) {
				if (url === embedPage.url) {
					// If the URL is not changed, reset the container property before reassigning the value.
					embedPage.url = "";
					embedPage.url = url;
				} else {
					embedPage.url = url;
				}
			} else {
				window.location.href = url;
			}
		}

		/**
		 * Sets the specified string as form title.
		 * @param {string} formTitle
		 */
		function formTitleSet(formTitle) {
			const $appTitle = window.parent.$("div.application-title");

			// If the Skelta menu button exists (i.e. overview forms), update the value using the specified title and (optional) site name.
			if ($appTitle.length) $appTitle.html(formTitle);
			// Otherwise update the value of the form title (e.g. pop-up forms).
			else $("[controlid='NF1']").find(".sktt").html(formTitle);
		}

		/**
		 * Returns whether the current form is used as embedded page.
		 */
		function formIsEmbedPage() {
			const attrId = $(window.parent.document).find("iframe").attr("id");
			return attrId ? attrId.indexOf("EmbedPage") !== -1 : false;
		}

		/**
		 * Returns whether the current window is loaded as main window or pop-up.
		 *
		 * @return {boolean} Indication if the form is a popup. True = is a popup.
		 */
		function formIsPopup() {
			return !!(this.skelta !== undefined && window.skelta !== undefined);
		}

		/**
		 * Returns the BaseForm control of the current Skelta form.
		 * @param {Object} form  [optional] window
		 * @return {Object}
		 */
		function formGetBaseForm(form) {
			let baseForm = form;
			if (!baseForm) baseForm = window;

			if (!baseForm.skelta) {
				return null;
			}
			const userContext = baseForm.skelta.userContext.getUserContext();
			const formUniqueKey = baseForm.skeltaUtils.getFormUniqueKey(userContext.appN, userContext.itemId, userContext.vStamp);
			const viewModelObject = baseForm.skeltaUtils.getViewModelObject(formUniqueKey);

			return viewModelObject.topLevelForm;
		}

		/**
		 * Watches for changes being made to the DOM tree and notifies them via a callback function.
		 * @param {Function} callback Callback function
		 * @param {string} target     DOM Node within the DOM tree to watch for changes
		 * @param {string} selector   Expression to match elements against
		 */
		function observeNodes(callback, target, selector) {
			const observer = new MutationObserver((mutations) => {
				$.each(mutations, (i, mutation) => {
					let flag = true;
					$.each(mutation.addedNodes, (j, node) => {
						if ($(node).is(selector) || $(node).has(selector).length) {
							callback(node, true);
							flag = false;
							return false; // <-- only stop if matched
						}
					});
					$.each(mutation.removedNodes, (j, node) => {
						if ($(node).is(selector) || $(node).has(selector).length) {
							callback(node);
							flag = false;
							return false; // <-- only stop if matched
						}
					});
					return flag;
				});
			});

			observer.observe(target, {
				childList: true,
				subtree: true,
			});
		}

		/**
		 * Watches for pop-up form events and notifies when a pop-up form is closed. Depends on observeNodes.
		 * @param {Function} callback Callback function
		 */
		function observePopupForms(callback) {
			let formName;
			observeNodes(onNodeChanged, document.body, "iframe");

			function onNodeChanged(node, added) {
				if (added) {
					const regex = /&fName=(\w+)/;
					const src = $(node).find("iframe").attr("src");
					const match = regex.exec(src);
					const matchString = match[1];
					formName = matchString;
				} else if (formName) {
					callback(formName);
					formName = undefined;
				}
			}
		}
		// #endregion form functions
		// #region logMessage functions
		/**
		 * logs message to console or to WTLogger Console.
		 * @param {Object/string} msg msg to print onto the console
		 * @param {int} debugLevel Debug level, 1= Production, 2=Hyper Care, 3 = Development
		 * @param {string} consoleType where to log the mesage, ALL = all consoles, WCS = WTLogger and hence in SMC, BCS= Browser Console
		 * @param {int} logType 1 = error, 2 = warning, 3 = information
		 * @param {boolean} forceLog Write log regardless of log level
		 */

		function logMessage(msg, debugLevel, consoleType, logType, forceLog) {
			if ((logDebugLevel >= debugLevel || forceLog) && consoleType === "ALL") {
				// eslint-disable-next-line no-console
				console.log(msg);
				SFU.logMessageToWMLogger(msg, logType);
			}
			if ((logDebugLevel >= debugLevel || forceLog) && consoleType === "BCS") {
				// eslint-disable-next-line no-console
				console.log(msg); // logging to browser console
			}
			if ((logDebugLevel >= debugLevel || forceLog) && consoleType === "WCS") {
				SFU.logMessageToWMLogger(msg, logType); // logging to WTLogger which is sending again to SMC
			}
		}
		// #endregion logMessage functions
		// #region controlOptions functions
		/**
		 * Returns whether the options of a Skelta control contain the specified value.
		 * @param {Object[]} options Options array of a compatible Skelta control (i.e. CheckBox, DropDown, RadioButtonGroup, List)
		 * @param {string} value     Option value to be found
		 * @return {boolean}
		 */
		function controlOptionsContains(options, value) {
			if (typeof value !== "string") return false;

			return value.split(";#").every((val) => {
				let foundValue = false;
				$.each(options, (option) => {
					if (option.optionvalue === val) {
						foundValue = true;
					}
				});
				return foundValue;
			});
		}

		/**
		 * Converts and returns the specified dataset to make it compatible with the 'Options' property value of a
		 *      compatible Skelta control (i.e. CheckBox, DropDown, RadioButtonGroup, List).
		 * @param {Object[]} data        Dataset to be converted
		 * @param {string} textProperty  [optional] name of the dataset field to be used as text property of the Skelta control.
		 *                               If not specified, the first field is used instead
		 * @param {string} valueProperty [optional] name of the dataset field to be used as value property of the Skelta control.
		 *                               If not specified, the second field is used instead
		 * @return {Object[]}            Converted dataset
		 */
		function controlOptionsConvertDataset2Options(data, textProperty, valueProperty) {
			const keys = Object.keys(data[0]);
			let txtProperty = textProperty;
			let valProperty = valueProperty;

			if (keys.length < (txtProperty && valProperty && txtProperty === valProperty ? 1 : 2)) {
				throw Error(
					"Not enough fields in the dataset. {textProperty: {0}, valueProperty: {1}, fieldCount: {2}}".format(
						txtProperty,
						valProperty,
						keys.length,
					),
				);
			}

			// If the text/value properties are not specified, use the first 2 properties.
			if (!textProperty) txtProperty = keys[0] === valProperty ? keys[1] : keys[0];

			if (!valProperty) valProperty = keys[1] === txtProperty ? keys[0] : keys[1];

			if (keys.indexOf(txtProperty) < 0 || keys.indexOf(valProperty) < 0) {
				throw Error(
					"Specified text/value properties are not valid. {textProperty: {0}, valueProperty: {1}}".format(
						txtProperty,
						valProperty,
					),
				);
			}

			// Create a copy of the dataset with just the 2 relevant properties (with the options format used by Skelta controls).
			const options = [];
			let text;
			$.each(data, (i, row) => {
				text = row[txtProperty];
				options.push({
					optiontext: /^@@.*@@$/.test(text) ? skelta.localize.getString(text) : String(text),
					optionvalue: String(row[valProperty]),
				});
			});

			return options;
		}

		/**
		 * Sets the 'Options' property value of a compatible Skelta control (i.e. CheckBox, DropDown, RadioButtonGroup, List).
		 * @param {string} xmlNode       Skelta control XML node
		 * @param {string} xmlNodeIndex  [optional] Skelta control index (applicable only for
		 *                               controls contained in a Skelta Base Form, otherwise leave empty or use 0)
		 * @param {Object[]} data        Source dataset
		 * @param {string} textProperty  [optional] Name of the source dataset field to be used as text property of the Skelta control.
		 *                               If not specified, the first field is used instead
		 * @param {string} valueProperty [optional] Name of the source dataset field to be used as value property of the Skelta control.
		 *                               If not specified, the second field is used instead
		 * @param {Object} defaultValue  [optional] Value of the source dataset record to be selected by default
		 * @param {int} defaultIndex     [optional] Index of the source dataset record to be selected by default,
		 *                               used as fall-back if the default value is not found
		 * @return {Object}              Skelta control
		 */
		function controlOptionsSetFromDataset(
			xmlNode,
			xmlNodeIndex,
			data,
			textProperty,
			valueProperty,
			defaultValue,
			defaultIndex,

			blankOption,
		) {
			const control = formGetBaseForm().findAllByXmlNode(xmlNode)[xmlNodeIndex || 0];
			if (!control || !Object.prototype.hasOwnProperty.call(control, "options")) {
				throw Error(
					"Control does not exist or does not have the required property. {xmlNode: {0}, index: {1}, property: options}".format(
						xmlNode,
						xmlNodeIndex || 0,
					),
				);
			}

			let options = null;
			let defalValue = defaultValue;

			if (data) {
				options = data.length > 0 ? controlOptionsConvertDataset2Options(data, textProperty, valueProperty) : null;
			}

			// If the options array is empty, reset the control.
			if (!options || options.length === 0) {
				control.value = "";
				control.options = [];
				return control;
			}

			// Determine the value to be assigned to the control:
			let newValue;

			// If specified, check if the default value is valid, otherwise fall-back to the default index.
			defalValue = defalValue === undefined || defalValue === null ? "" : String(defalValue);
			if (defalValue && control.value !== defalValue && controlOptionsContains(options, defalValue)) {
				newValue = defalValue;
			}

			// If specified, check if the default index is valid, otherwise fall-back to the current value.
			if (newValue === undefined && (defaultIndex || defaultIndex === 0) && options.length > defaultIndex) {
				newValue = options[defaultIndex].optionvalue;
			}

			// Check if the current value is valid, otherwise reset the value.
			if (newValue === undefined && !controlOptionsContains(options, control.value)) {
				// In case of drop-down, add an empty element.
				if (control.controlType === "DropDownChoice") {
					options.unshift({
						optiontext: "",
						optionvalue: "",
					});
				}
				newValue = "";
			}

			// In case of drop-downs, the first element is automatically selected and the previous value needs to be restored.
			if (newValue === undefined && control.controlType === "DropDownChoice") newValue = control.value;

			if (blankOption && !controlOptionsContains(options, control.value)) {
				// In case of drop-down, add an empty element.
				if (control.controlType === "DropDownChoice") {
					options.unshift({
						optiontext: "",
						optionvalue: "",
					});
				}
			}

			control.options = options;
			if (newValue !== undefined) control.value = newValue;

			return control;
		}
		// #endregion controlOptions functions
		// #region workflow functions
		/**
		 *  Verifies whether a workflow is executed successfully. If not, displays an error message.
		 * @param {Object} blockingOutput Value returned by the workflow (e.g. instance identifier)
		 * @param {string} workflowStatus Workflow status {EX: Executing, SL: Sleeping, FE: Finished with Errors, FN: Finished Normal}
		 *                                  can be null if workflow is still executing.
		 * @param {boolean} showErrorMessage [optional] Whether to show error message or not default true for bw compatibility.
		 * @returns {Promise} promise
		 */
		function workflowCheckStatus(blockingOutput, workflowStatus, showErrorMessage = true, timeout = 30000) {
			return new Promise((resolve, reject) => {
				let wfStatus = workflowStatus;
				if (wfStatus === WF_STATUS.executing && Number.isNaN(parseInt(blockingOutput, 10))) {
					// "EX"
					wfStatus = WF_STATUS.finishedWithErrors;
				} // "FE";
				if (!wfStatus || wfStatus === "") wfStatus = WF_STATUS.executing;
				if (!!blockingOutput && blockingOutput.includes("@@") && blockingOutput.includes("Err")) {
					wfStatus = WF_STATUS.finishedWithErrors;
				}
				if (wfStatus === WF_STATUS.executing || wfStatus === WF_STATUS.awaiting) {
					SFU.showLoader();
					let i = 0;
					const intervalId = setInterval(() => {
						const data = FT.WebApi.mesGetSync(
							"api/V3/DirectAccess",
							"sp_SA_FT_Wt_Sw_Execute_WorkflowStatus",
							{
								instance_id: blockingOutput,
								recursive: 1,
							},
							false,
						);

						if (!data) {
							clearInterval(intervalId);
							SFU.hideLoader();
							reject(SFU.showError("Dataset returned by stored procedure is empty."));
							return;
						}
						if (!data.length) {
							clearInterval(intervalId);
							SFU.hideLoader();
							reject(SFU.showError("Dataset returned by stored procedure is empty."));
							return;
						}

						let isChildError = false;
						data.forEach((obj) => {
							if (!!obj.wf_status && obj.wf_status === WF_STATUS.finishedWithErrors && obj.controlExec) {
								isChildError = true;
							}
						});

						if (isChildError) wfStatus = WF_STATUS.finishedWithErrors;
						else wfStatus = data[0].wf_status;

						if (!wfStatus || wfStatus === "") wfStatus = WF_STATUS.executing;

						// INCREASE ITERATION
						i += 1;

						// CHECK TIMEOUT
						if (i * WF_CHK_STATUS_RATE >= timeout || i >= WF_CHK_STATUS_MAX) {
							clearInterval(intervalId);
							SFU.hideLoader();

							reject({
								wfStatus: wfStatus,
								errorMessage: "Workflow in timeout. {blockingOutput: {0}, workflowStatus: {1}}".format(blockingOutput, wfStatus),
							});

							if (showErrorMessage) {
								SFU.showError(
									skelta.localize.getString("@@FT_Err@@"),
									skelta.localize.getString(blockingOutput || "@@FT_WorkflowExecutionError@@"),
								);
							}
							throw Error("Workflow in timeout. {blockingOutput: {0}, workflowStatus: {1}}".format(blockingOutput, wfStatus));
						}
						// CHECK NEXT ITERATION KEEP Promise active. Next iteration
						if ((wfStatus === WF_STATUS.executing || wfStatus === WF_STATUS.awaiting) && i < WF_CHK_STATUS_MAX) {
							return;
						}

						// SUCCESS
						if (wfStatus === WF_STATUS.finishedSuccessfully) {
							clearInterval(intervalId);
							SFU.hideLoader();
							resolve({ wfStatus: wfStatus, data: data });
						} else if (wfStatus !== WF_STATUS.finishedSuccessfully) {
							clearInterval(intervalId);
							SFU.hideLoader();

							let concatOutput;
							let concatMessage;
							data.forEach((obj) => {
								if (!!obj.wf_output && obj.wf_output !== "") {
									concatOutput = (concatOutput || "") + obj.wf_output + ";";
									concatMessage = (concatMessage || "") + skelta.localize.getString(obj.wf_output) + "<BR>";
								}
							});
							if (showErrorMessage) {
								SFU.showError(
									skelta.localize.getString("@@FT_Err@@"),
									skelta.localize.getString(concatMessage || "@@FT_WorkflowExecutionError@@"),
								);
							}
							throw Error(
								"Workflow finished with errors. {instanceId: {0}, workflowStatus: {1}, workflowOutput: {2}}".format(
									blockingOutput,
									wfStatus || "",
									concatOutput || "",
								),
							);
						}
					}, WF_CHK_STATUS_RATE);
				} else {
					// 006 workflow finished in error show error message.
					if (wfStatus !== WF_STATUS.finishedSuccessfully) {
						reject({
							wfStatus: wfStatus,
							errorMessage: "Workflow finished with errors. {blockingOutput: {0}, workflowStatus: {1}}".format(
								blockingOutput,
								wfStatus,
							),
						});

						if (showErrorMessage) {
							SFU.showError(
								skelta.localize.getString("@@FT_Err@@"),
								skelta.localize.getString(blockingOutput || "@@FT_WorkflowExecutionError@@"),
							);
						}
						throw Error(
							"Workflow finished with errors. {blockingOutput: {0}, workflowStatus: {1}}".format(blockingOutput, wfStatus),
						);
						// 008 To avoid issue with parentchild wf,
						// workflow can end with code FN even if in error. In those cases blocking output contains error message.
					} else if (
						wfStatus === WF_STATUS.finishedSuccessfully &&
						blockingOutput.length > 0 &&
						Number.isNaN(parseInt(blockingOutput, 10))
					) {
						reject({
							wfStatus: wfStatus,
							errorMessage: "Workflow finished with errors. {blockingOutput: {0}, workflowStatus: {1}}".format(
								blockingOutput,
								wfStatus,
							),
						});

						if (showErrorMessage) {
							SFU.showError(
								skelta.localize.getString("@@FT_Err@@"),
								skelta.localize.getString(blockingOutput || "@@FT_WorkflowExecutionError@@"),
							);
						}
						throw Error(
							"Workflow finished with errors. {blockingOutput: {0}, workflowStatus: {1}}".format(blockingOutput, wfStatus),
						);
					}
					// 008 Removed. User expericence. Requires additional user action to dismiss the message.
					// else if (wfStatus === WF_STATUS.finishedSuccessfully && blockingOutput.length === 0) {
					//	SFU.showConfirmation(skelta.localize.getString("Success"), "Successfully saved!");
					// }

					resolve({ wfStatus: wfStatus });
				}
			}).catch((err) => {
				// To handle the rejection here
				logMessage("Error caught:" + err);
			});
		}
		// #endregion workflow functions
		// #region datetime functions
		/**
		 * Converts a UTC datetime string to a formatted datetime string based on control type.
		 *
		 * @param {Object} control The control object that will display the datetime string.
		 * @param {String} dateTimeUtcValue  The datetime value in UTC format.
		 * @returns {String|null} The formatted datetime string, or null if input is invalid.
		 */
		function dateTimeInStringFormat(control, dateTimeUtcValue) {
			let strDate = null;

			if (dateTimeUtcValue !== null && dateTimeUtcValue !== "") {
				// Convert the UTC date-time string to a local Date object
				const dateTimeLocal = new Date(dateTimeUtcValue);

				// Convert the local Date object to the server's UTC format
				const dateTimeUtc = SFU.getDateTimeInServerUTCFormat(dateTimeLocal);

				// Check the type of control
				if (control.controlType === "DateTimeInput") {
					// If the control type is "DateTimeInput", format the UTC datetime for core value
					strDate = SFU.getDateTimeInStringFormat(dateTimeUtc, skelta.forms.constants.dateFormats.dateTimeFormatForCoreValue);
				} else {
					// If the control type is not "DateTimeInput", format the local datetime as a string
					strDate = dateTimeLocal.toLocaleString();
				}
			}

			// Return the formatted datetime string
			return strDate;
		}
		// #endregion datetime functions
		// #region return
		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			SS_CONTEXT: SS_CONTEXT,
			WF_STATUS: WF_STATUS,
			LOG_LEVEL: LOG_LEVEL,
			LOG_TYPE: LOG_TYPE,
			initialize: initialize,
			mesUserName: mesUserName,
			userInfo: userInfo,
			sessionStorageJsonSet: sessionStorageJsonSet,
			sessionStorageJsonGet: sessionStorageJsonGet,
			localStorageJsonSet: localStorageJsonSet,
			localStorageJsonGet: localStorageJsonGet,
			contextInit: contextInit,
			contextUpd: contextUpd,
			contextGet: contextGet,
			contextSet: contextSet,
			formOpen: formOpen,
			formTitleSet: formTitleSet,
			formIsEmbedPage: formIsEmbedPage,
			formIsPopup: formIsPopup,
			formGetBaseForm: formGetBaseForm,
			observeNodes: observeNodes,
			observePopupForms: observePopupForms,
			logMessage: logMessage,
			controlOptionsContains: controlOptionsContains,
			controlOptionsConvertDataset2Options: controlOptionsConvertDataset2Options,
			controlOptionsSetFromDataset: controlOptionsSetFromDataset,
			workflowCheckStatus: workflowCheckStatus,
			dateTimeInStringFormat: dateTimeInStringFormat,
		};
		// #endregion return
	}
})(window);
