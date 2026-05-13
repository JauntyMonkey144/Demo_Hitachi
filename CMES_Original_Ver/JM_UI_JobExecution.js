/*
Name:        	JM_UI_JobExecution.js
Description: 	JM_UI_JobExecution js file containing global logic pertaining to the JM_UI_JobExecution Form.

Ver  Release	By				Date				Change Description
001	 00.50.00	Fayaz A		2024-06-05  #2806 First version.
002  00.50.00 Praveen   2024-07-29  #3212 Added Paramater grpID to getNavigationData function.
003  00.70.00 Fayaz A   2024-08-19  # Added Paramater grpID and navigationFor to initializeForm function.
004  00.70.00	Chitta    2024-12-05  #3980 Rename sp_SA_TD_UC_JM_Navigation to sp_S_FT_Config_ByJob
005  00.70.00	Fayaz A   2025-02-10  # Replaced sp_S_FT_Config_ByJob with sp_SA_FT_Config_ExecutionButtons with composibility filters
006  00.70.00	Fayaz A   2025-02-20  #4116 Moved from use case to module level, UC_JM_UI_JobExecution to JM_UI_JobExecution.
007	 01.01.00	Fayaz A	  2025-05-14	#4955 A global variable, commandSelected, is defined to fetch and hold the selected command's
																					action details from filterData context on form load.
008	 01.01.00 Fayaz A		2025-05-28	#5008 Localization key update to refer from FT runtime locale file.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.JM = window.JM || {};
	JM.JobExecution = JM.JobExecution || {};
	JM.JobExecution = JobExecution();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function JobExecution() {
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;
		// ----------------------------------------------------------------------------------

		// ----------------------------- Private Variables ----------------------------------
		const _controls = {};
		let userInfo = "";
		let mesUserId = "";
		let selectedCard = "";
		let data = "";
		let navigationGrpId = "";
		let navigationSubGrpId = "";
		let commandSelected = ""; // Variable to hold the selected command's action details, including configured properties and their values
		let codeValue = ""; // Variable to hold the value of 'code' column from use case composability.
		// ----------------------------------------------------------------------------------

		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control, grpId, navigationFor) {
			// Initialize variables
			FORM.Control = Control;
			navigationGrpId = grpId;
			navigationSubGrpId = navigationFor;

			_controls.wwJobActions = FORM.Control.findByXmlNode("WWJA");
			_controls.epContainer = FORM.Control.findByXmlNode("EPC");
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
		 * Form load function
		 */
		function onFormLoad() {
			userInfo = FT.WorkTasks.userInfo();
			mesUserId = userInfo.MESUserId !== undefined ? userInfo.MESUserId : null;

			const filterData = FT.WorkTasks.contextGet(FORM.Control, "filterData");
			commandSelected = filterData.find((item) => item.type === "commandSelected");
			if (commandSelected) {
				commandSelected = JSON.parse(commandSelected.jsonValue);
				// Sample code to access context properties
				codeValue = commandSelected.code;
			}
			selectedCard = FT.WorkTasks.contextGet(FORM.Control, "eventData");
			if (selectedCard.length > 0) {
				data = JSON.parse(selectedCard[0].jsonValue);
				_controls.wwJobActions.value = "";
				if (data !== null && data.length > 0) {
					wwJobActionsSetData(
						navigationGrpId,
						navigationSubGrpId,
						data[0].ent_name,
						mesUserId,
						data[0].itemId !== undefined ? data[0].itemId : null,
						data[0].woId !== undefined ? data[0].woId : null,
						data[0].operId !== undefined ? data[0].operId : null,
						data[0].seqNo !== undefined ? data[0].seqNo : null,
					);
				}
			}
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
		function wwJobActionsSetData(grpId, category, entityName, userId, itemId, woId, operId, seqNo) {
			try {
				const parameterCollection = {
					grp_id: grpId,
					category: category,
					ent_name: entityName,
					user_id: userId.replace(/\\\\/g, "\\"),
					item_id: itemId,
					wo_id: woId,
					oper_id: operId,
					seq_no: seqNo,
				};
				const jobActionsData = FT.WebApi.mesGetSync(
					"api/V3/DirectAccess",
					"sp_SA_JM_Config_JobExecButtons",
					parameterCollection,
					false,
				);

				if (jobActionsData.length > 0) {
					_controls.wwJobActions.value = "";
					_controls.wwJobActions.widgetProperties.data = JSON.stringify(jobActionsData);
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

			throw errorMessage;
		}
		/**
		 * This function loads corresponding form of the selected card
		 */
		function wwJobActionOnDataChange() {
			if (_controls.wwJobActions.value !== null) {
				const selectedAction = JSON.parse(_controls.wwJobActions.value);
				const action = selectedAction[0].value;
				const formName = selectedAction[0].form_name;
				if (selectedAction) {
					const filterJsonValue = selectedAction[0];
					if (filterJsonValue.code === "**PC**") {
						filterJsonValue.code = codeValue;
						const filterDataObj = [{ type: "commandSelected", jsonValue: JSON.stringify(filterJsonValue) }];
						FT.WorkTasks.contextSet("", "filterData", JSON.stringify(filterDataObj));
					} else {
						const filterDataObj = [{ type: "commandSelected", jsonValue: JSON.stringify(filterJsonValue) }];
						FT.WorkTasks.contextSet("", "filterData", JSON.stringify(filterDataObj));
					}
				}
				if (action === "Refresh") {
					wwJobActionsSetData(
						navigationGrpId,
						navigationSubGrpId,
						data[0].ent_name,
						mesUserId,
						data[0].itemId !== undefined ? data[0].itemId : null,
						data[0].woId !== undefined ? data[0].woId : null,
						data[0].operId !== undefined ? data[0].operId : null,
						data[0].seqNo !== undefined ? data[0].seqNo : null,
					);
				} else {
					_controls.epContainer.url = "";
					_controls.epContainer.url = SFU.getFormUrl(formName);
				}
			}
		}

		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			wwJobActionOnDataChange: wwJobActionOnDataChange,
			wwJobActionsSetData: wwJobActionsSetData,
		};
	}
})(window);
