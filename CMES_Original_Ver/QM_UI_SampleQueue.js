/*
Name:        	QM_UI_SampleQueue.js
Description: 	Quality Sample Queue js file containing logic pertaining to the QM_UI_SampleQueue form.

Ver		Release		By					Date				Change Description
001		00.70			Shamanth		2024-09-17	#3634 First version.
002		01.00			Fayaz A			2025-02-25	#3982 Updated function wwTimeFilterLoad to load widget data from QM_TIME_FILTER_DATA.
003		01.00			Usha M			2025-02-27	#4355 Removed console.log.
004		01.00			Bas van B		2025-03-03	#4253	Translated MD in que table.
005		01.00			Bas van B		2025-03-03	#4253 Also translate the sample result and status.
006		01.00			Bas van B		2025-03-03	#4253 Added template for default string of sample status and result in table.
007		01.00			Bas van B		2025-03-03	#4253 Corrected default string values.
008		01.00			Bas van B		2025-03-04	#4253 Moved translation default string templates to QM.Common.js. Load sample states from
																							QM_Common.
009   01.01			Somya S			2025-05-05	#4899 Set the command value for wwSampleStatesOnDataChange.
010   01.01			Praveen			2025-05-05	#4958 Convert the endDatetime to SFU. getDateTimeInServerUTCFormat in the loadSampleQueue function
011		01.01.00  Fayaz A			2025-05-22	#4955 The function wwNavbarWidgetOnClick was updated to set the selected command value
																								in the filterData context.
012		01.01.00  Fayaz A			2025-05-22	#4955 Parent code value logic is added in wwNavbarWidgetOnClick function to set "CODE" value.
013		01.01.00 	Fayaz A			2025-05-28	#5008 Localization key update to refer from FT runtime locale file.
014		01.02.00 	Fayaz A			2025-06-30	#5091 Function wwSampleStatesOnDataChange is updated to check if there is change in selected states.
015		01.02.00	Somya S			2025-06-30	#5069	Added the showloader and hideloader function
016   02.00.00  Praveen	    2025-12-18	#5274 Set the start and end date-time formats.

*/

((window) => {
	//  ------------------------------ Global Variables ------------------------------------
	window.QM = window.QM || {};
	QM.SampleQueue = QM.SampleQueue || {};
	QM.SampleQueue = SampleQueue();
	//  ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */

	function SampleQueue() {
		//  ---------------------------- Constant Variables ----------------------------------
		const LIST_JS = ["js/MES/FT_Common.js", "js/MES/QM_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;
		const NAVIGATON_GRPID = "QM_SampleButtonBar";
		const NAVIGATON_FOR = "QmQueue";
		const QM_EVENTS =
			"qm.sample.samplecancel|qm.catalog.add|qm.catalog.update|qm.characteristic.add|qm.characteristic.update| " +
			"qm.characteristic.delete|qm.sample.sampleadd|qm.sample.sampleedit|qm.sample.samplefinalize|qm.sample.samplepull|" +
			"qm.result.resultadd|qm.result.add";
		const QM_MODULE = "qm";
		const QM_TIME_FILTER_DATA =
			'[{"orderby":1,"text":"Custom","value":"CUSTOM","start_time":"","end_time":"","start_time_readonly":0,"end_time_readonly":1}' +
			',{"orderby":2,"text":"1H","value":"1","start_time":"","end_time":"","start_time_readonly":0,"end_time_readonly":0}' +
			',{"orderby":3,"text":"12H","value":"12","start_time":"","end_time":"","start_time_readonly":0,"end_time_readonly":0}' +
			',{"orderby":4,"text":"8H","value":"8","start_time":"","end_time":"","start_time_readonly":0,"end_time_readonly":0,' +
			'"to_refresh":"xxCurDate"}' +
			"]";
		//  ----------------------------------------------------------------------------------

		//  ----------------------------- Private Variables ----------------------------------
		const _controls = {};
		let sampleStatesSelected = "";
		let entId = "";
		let entName = "";
		let mesUserId = "";
		let userInfo = "";
		let commandSelected = ""; // Variable to hold the selected command's action details, including configured properties and their values
		let codeValue = ""; // Variable to hold the value of 'code' column from use case composability.
		// let entName = "";
		//  ----------------------------------------------------------------------------------

		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			//  Initialize variables
			FORM.Control = Control;
			_controls.wwSampleNavigation = FORM.Control.findByXmlNode("WWSN");
			_controls.wwSampleQueue = FORM.Control.findByXmlNode("WWSQ");
			_controls.wwSampleStatus = FORM.Control.findByXmlNode("WWS");
			_controls.wwTimeFilter = FORM.Control.findByXmlNode("WWTF");
			_controls.hfSampleAction = FORM.Control.findByXmlNode("HFSA");
			_controls.hfSampleRow = FORM.Control.findByXmlNode("HFSR");
			_controls.epSampleDetail = FORM.Control.findByXmlNode("EPSD");
			_controls.formParameters = FORM.Control.formParameters;
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
			// if the form is configured from supervisor cockpit
			const directForm = formParameters.directform.value;
			const entContext = FT.WorkTasks.contextGet(FORM.Control, "ent");
			userInfo = FT.WorkTasks.userInfo();
			mesUserId = userInfo.MESUserId !== undefined ? userInfo.MESUserId.replace(/\\/g, "\\\\") : null;
			if (entContext !== null && entContext[0].entId !== null) {
				entId = directForm == null ? entContext[0].entId : "";
				entName = entContext[0].entName;
			} else {
				//  initialize context
				FT.WorkTasks.contextInit();
			}
			const filterData = FT.WorkTasks.contextGet(FORM.Control, "filterData");
			commandSelected = filterData.find((item) => item.type === "commandSelected");
			if (commandSelected) {
				commandSelected = JSON.parse(commandSelected.jsonValue);
				// Sample code to access context properties
				codeValue = commandSelected.code;
			}
			setSampleStatus();
			_controls.wwSampleNavigation.widgetProperties.selectedValue = "view";
			_controls.wwSampleNavigation.widgetProperties.float = "right";
			_controls.wwSampleNavigation.widgetProperties.command = "edit,cancel,pull,finalize,viewresult,result";
			wwSampleNavigationSetData(NAVIGATON_GRPID, NAVIGATON_FOR, entName, mesUserId);
			wwTimeFilterLoad();
			// subscribe to the QM events to update grid
			FT.Common.windowEventListenerAdd(QM_MODULE, qmEventListener);
		}

		/**
		 * listens to events that have to be reacted upon by card widget to refresh
		 */
		function qmEventListener(event) {
			// Split the module_event string into an array
			const eventList = QM_EVENTS.split("|");

			// Check if event.detail.subType matches any value in the array
			if (eventList.includes(event.detail.subType)) {
				loadSampleQueue(sampleStatesSelected);
			}
		}

		/**
		 * Set Sample States to wwWidgetState from FT Common
		 * @returns
		 */
		function setSampleStatus() {
			// Read all states
			let ftCommonSampleStatus = Object.entries(QM.Common.SAMPLE_STATES).map((status) => ({
				display: status[1],
				value: status[0],
			}));

			// Define group and title for the MultiSelectionFilter
			const group = "State";
			const title = "State";

			// Translate the sample states
			const fields = [FT.Ui.translationColumnField("display", FT.Ui.TRANSLATION_GROUPS.grpSampleSampleStatus, ["value"])];
			ftCommonSampleStatus = FT.Ui.translateArray(ftCommonSampleStatus, fields);

			// Transforming to the desired format, focusing only on "State"
			const formattedJobStates = ftCommonSampleStatus.map((item) => ({
				group: group,
				Title: title,
				value: item.value,
				display: item.display,
			}));
			_controls.wwSampleStatus.widgetProperties.data = JSON.stringify(formattedJobStates);
		}
		/**
		 * On SampleState selection change
		 * @returns
		 */
		function wwSampleStatesOnDataChange() {
			if (sampleStatesSelected !== _controls.wwSampleStatus.value) {
				sampleStatesSelected = _controls.wwSampleStatus.value;
				loadSampleQueue(sampleStatesSelected);

				_controls.wwSampleNavigation.widgetProperties.selectedValue = "view";
				_controls.wwSampleNavigation.widgetProperties.float = "right";
				_controls.wwSampleNavigation.widgetProperties.command = "edit,cancel,pull,finalize,viewresult,result";
				wwSampleNavigationSetData(NAVIGATON_GRPID, NAVIGATON_FOR, entName, mesUserId);
			}
		}
		/**
		 * Get shift schedule time details for displaying it on the  widget
		 * @param {integer} shift_configured
		 * @returns {JSON}  data
		 */
		function wwTimeFilterLoad() {
			const currentTime = new Date();
			_controls.wwTimeFilter.widgetProperties.data = QM_TIME_FILTER_DATA.replace("xxCurDate", currentTime);
		}
		/**
		 * On TimeFilter selection change
		 * @returns
		 */
		function wwTimeFilterOnDataChange() {
			loadSampleQueue(sampleStatesSelected);
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
		function wwSampleNavigationSetData(grpId, category, entityName, userId, itemId, woId, operId, seqNo) {
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

				const qmSampleData = FT.WebApi.mesGetSync("api/V3/DirectAccess", "sp_SA_FT_Config_Actions", parameterCollection, false);

				if (qmSampleData.length > 0) {
					qmSampleData[0].cfg_desc = Date().toString();
					_controls.wwSampleNavigation.widgetProperties.selectedValue = "view";
					_controls.wwSampleNavigation.widgetProperties.float = "right";
					_controls.wwSampleNavigation.widgetProperties.data = JSON.stringify(qmSampleData);
				}
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
							const actionVal = _controls.hfSampleAction.value;
							if (actionVal) {
								const form = JSON.parse(actionVal);
								if (form.form_name) {
									const formUrl = SFU.getFormUrl(form.form_name);
									$loader.attr("data-skpage", formUrl);
								}
							}
						} catch (error) {
							throw new Error("Failed to parse form_name from hfSampleAction: " + error.message);
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
		 * Function to load sample Queue and assign data to grid widget
		 * @param {string} sampleStatus sample states to be filtered out seperated with comma
		 */
		function loadSampleQueue(sampleStatusArray) {
			showPageLoader();
			const currentTime = new Date();
			const sampleStatus =
				sampleStatusArray && sampleStatusArray.State && sampleStatusArray.State.length > 0
					? sampleStatusArray.State.join(", ")
					: "";

			const startDatetime = SFU.getDateTimeInServerUTCFormat(new Date(_controls.wwTimeFilter.widgetProperties.start));
			const endDatetime =
				_controls.wwTimeFilter.value === "shift" || _controls.wwTimeFilter.widgetProperties.selected.toUpperCase() === "CUSTOM"
					? SFU.getDateTimeInServerUTCFormat(new Date(_controls.wwTimeFilter.widgetProperties.end))
					: SFU.getDateTimeInServerUTCFormat(new Date(currentTime));
			const parameterColl = {
				sampleName: "",
				sampleTimeStartUtc: startDatetime.toString("yyyy-MM-dd HH:mm:ss"),
				sampleTimeEndUtc: endDatetime.toString("yyyy-MM-dd HH:mm:ss"),
				status: sampleStatus,
				entId: entId,
			};
			FT.WebApi.mesGetAsync("api/V3/Sample/filter", "", parameterColl, false).then(
				(data) => {
					hidePageLoader();
					// Handle successful response data
					if (data != null && data.length > 0) {
						// Translate the data
						const fields = [
							FT.Ui.translationColumnField("category_desc", FT.Ui.TRANSLATION_GROUPS.grpCategoryCategoryDesc, [
								"item_category_id",
							]),
							FT.Ui.translationColumnField(
								"context_ent_desc",
								FT.Ui.TRANSLATION_GROUPS.grpEntDescription,
								["context_ent_name"],
								"context_ent_name",
							),
							FT.Ui.translationColumnField(
								"context_item_desc",
								FT.Ui.TRANSLATION_GROUPS.grpItemItemDesc,
								["context_item_id"],
								"context_item_id",
							),
							FT.Ui.translationColumnField(
								"context_oper_desc",
								FT.Ui.TRANSLATION_GROUPS.grpOperOperDesc,
								["process_id", "context_oper_id"],
								"context_oper_id",
							),
							FT.Ui.translationColumnField(
								"ent_desc",
								FT.Ui.TRANSLATION_GROUPS.grpEntDescription,
								FT.Ui.TRANSLATION_KEYS.keyEnt,
								"ent_name",
							),
							FT.Ui.translationColumnField(
								"freq_desc",
								FT.Ui.TRANSLATION_GROUPS.grpSampleFreqFreqDesc,
								FT.Ui.TRANSLATION_KEYS.keySampleFreq,
							),
							FT.Ui.translationColumnField(
								"item_desc",
								FT.Ui.TRANSLATION_GROUPS.grpItemItemDesc,
								FT.Ui.TRANSLATION_KEYS.keyItem,
								"item_id",
							),
							FT.Ui.translationColumnField(
								"oper_desc",
								FT.Ui.TRANSLATION_GROUPS.grpOperOperDesc,
								FT.Ui.TRANSLATION_KEYS.keyOper,
								"oper_id",
							),
							FT.Ui.translationColumnField(
								"wo_desc",
								FT.Ui.TRANSLATION_GROUPS.grpWoWoDesc,
								FT.Ui.TRANSLATION_KEYS.keyWo,
								"wo_id",
							),
							FT.Ui.translationColumnField(
								"sample_result_desc",
								FT.Ui.TRANSLATION_GROUPS.grpSampleSampleResult,
								FT.Ui.TRANSLATION_KEYS.keySampleResult,
								"sample_result",
								QM.Common.translationSampleResultDefaultTemplate,
							),
							FT.Ui.translationColumnField(
								"sample_status_desc",
								FT.Ui.TRANSLATION_GROUPS.grpSampleSampleStatus,
								FT.Ui.TRANSLATION_KEYS.keySampleStatus,
								"sample_status",
								QM.Common.translationSampleStatusDefaultTemplate,
							),
						];
						const translatedData = FT.Ui.translateArray(data, fields);

						// Assign data to the grid
						_controls.wwSampleQueue.widgetProperties.data = JSON.stringify(translatedData);
						_controls.epSampleDetail.url = "";
					} else {
						_controls.wwSampleQueue.widgetProperties.data = JSON.stringify(data);
						_controls.epSampleDetail.url = "";
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
		 * Function to assign Sample Navigation widget value to SampleAction Hidden Field value
		 */
		function wwSampleActionOnDataChange() {
			_controls.hfSampleAction.value = _controls.wwSampleNavigation.value != null ? _controls.wwSampleNavigation.value : "";
		}

		/**
		 * Function to load corresponding form for the selected sample action
		 */
		function hfSampleActionOnDataChange() {
			const selectedAction = JSON.parse(_controls.hfSampleAction.value);
			var sampleQueueRow = _controls.hfSampleRow.value;

			if (selectedAction.code === "**PC**") {
				selectedAction.code = codeValue;
				const filterDataObj = [{ type: "commandSelected", jsonValue: JSON.stringify(selectedAction) }];
				FT.WorkTasks.contextSet("", "filterData", JSON.stringify(filterDataObj));
			} else {
				const filterDataObj = [{ type: "commandSelected", jsonValue: JSON.stringify(selectedAction) }];
				FT.WorkTasks.contextSet("", "filterData", JSON.stringify(filterDataObj));
			}

			if (selectedAction.command === "refresh") {
				_controls.epSampleDetail.url = "";

				loadSampleQueue(sampleStatesSelected);
				_controls.wwSampleNavigation.widgetProperties.selectedValue = "view";
				_controls.wwSampleNavigation.widgetProperties.float = "right";
				wwSampleNavigationSetData(NAVIGATON_GRPID, NAVIGATON_FOR, entName, mesUserId);
			} else if (selectedAction.command === "create") {
				_controls.epSampleDetail.url = selectedAction.form_name !== undefined ? SFU.getFormUrl(selectedAction.form_name) : "";
			} else if (sampleQueueRow !== "" && _controls.hfSampleRow.value !== "") {
				sampleQueueRow = JSON.parse(_controls.hfSampleRow.value);
				// update selected sample details to context
				const sampleObj = [
					{
						sampleId: sampleQueueRow.sample_id,
						sampleName: sampleQueueRow.sample_name,
					},
				];
				FT.WorkTasks.contextSet("", "sample", JSON.stringify(sampleObj));
				const eventDataObj = [
					{
						type: "Quality",
						jsonValue: "[" + JSON.stringify(sampleQueueRow) + "]",
					},
				];
				FT.WorkTasks.contextSet("", "eventData", JSON.stringify(eventDataObj));
				_controls.epSampleDetail.url = "";
				_controls.epSampleDetail.url = selectedAction.form_name !== undefined ? SFU.getFormUrl(selectedAction.form_name) : "";
			}
		}
		/**
		 * Function to assign SampleQueue widget value to SampleRow Hidden Field value
		 */
		function wwSampleQueueOnDataChange() {
			_controls.hfSampleRow.value =
				_controls.wwSampleQueue.widgetProperties.selectedRow != null ? _controls.wwSampleQueue.widgetProperties.selectedRow : "";
			const qmSampleQueueRow = JSON.parse(_controls.wwSampleQueue.widgetProperties.selectedRow);
			if (qmSampleQueueRow !== null) {
				enableButton(JSON.parse(_controls.wwSampleQueue.widgetProperties.selectedRow).sample_status);
				wwSampleNavigationSetData(
					NAVIGATON_GRPID,
					NAVIGATON_FOR,
					entName,
					mesUserId,
					qmSampleQueueRow.item_id !== undefined ? qmSampleQueueRow.item_id : null,
					qmSampleQueueRow.wo_id !== undefined ? qmSampleQueueRow.wo_id : null,
					qmSampleQueueRow.oper_id !== undefined ? qmSampleQueueRow.oper_id : null,
					qmSampleQueueRow.seq_no !== undefined ? qmSampleQueueRow.seq_no : null,
				);
				wwSampleActionOnDataChange();
				hfSampleActionOnDataChange();
			}
		}

		/**
		 * Function to set sample navigation commands (to enable and disable) based on sample state
		 * @param {string} strStatus
		 */
		function enableButton(strStatus) {
			const intSampleState = parseInt(strStatus, 10);
			if (intSampleState === FT.Common.MES_SAMPLE_STATUS.ready) {
				_controls.wwSampleNavigation.widgetProperties.command = "viewresult,result";
			} else if (intSampleState === FT.Common.MES_SAMPLE_STATUS.readyWarning) {
				_controls.wwSampleNavigation.widgetProperties.command = "viewresult,result";
			} else if (intSampleState === FT.Common.MES_SAMPLE_STATUS.missed) {
				_controls.wwSampleNavigation.widgetProperties.command = "pull,result";
			} else if (intSampleState === FT.Common.MES_SAMPLE_STATUS.inProgress) {
				_controls.wwSampleNavigation.widgetProperties.command = "cancel,result";
			} else if (intSampleState === FT.Common.MES_SAMPLE_STATUS.late) {
				_controls.wwSampleNavigation.widgetProperties.command = "pull,result";
			} else if (intSampleState === FT.Common.MES_SAMPLE_STATUS.complete) {
				_controls.wwSampleNavigation.widgetProperties.command = "pull";
			} else if (intSampleState === FT.Common.MES_SAMPLE_STATUS.completeLate) {
				_controls.wwSampleNavigation.widgetProperties.command = "pull";
			} else if (intSampleState === FT.Common.MES_SAMPLE_STATUS.cancelled) {
				_controls.wwSampleNavigation.widgetProperties.command = "cancel,pull";
			}
			const getCommand = _controls.wwSampleNavigation.widgetProperties.command;
			if (
				_controls.wwSampleNavigation.widgetProperties.command
					.split(",")
					.includes(JSON.parse(_controls.wwSampleNavigation.value).command.toLowerCase()) === true
			) {
				_controls.wwSampleNavigation.widgetProperties.selectedValue = "view";
				_controls.wwSampleNavigation.widgetProperties.command = getCommand;
			}
		}
		/**
		 * Function to set Widget CheckboxList visible script
		 */
		function wwSampleStatusVisibleScripts(Control) {
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
			wwSampleStatesOnDataChange: wwSampleStatesOnDataChange,
			wwSampleActionOnDataChange: wwSampleActionOnDataChange,
			hfSampleActionOnDataChange: hfSampleActionOnDataChange,
			wwSampleQueueOnDataChange: wwSampleQueueOnDataChange,
			wwTimeFilterOnDataChange: wwTimeFilterOnDataChange,
			wwSampleStatusVisibleScripts: wwSampleStatusVisibleScripts,
			wwPanelVisibleScripts: wwPanelVisibleScripts,
			wwSampleNavigationSetData: wwSampleNavigationSetData,
			wwTimeFilterLoad: wwTimeFilterLoad,
			showPageLoader: showPageLoader,
			hidePageLoader: hidePageLoader,
		};
	}
})(window);
