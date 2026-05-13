/*
Name:        	IM_UI_ItemTransferList.js
Description: 	IM_UI_ItemTransferList js file containing global logic pertaining to the Item Transfer List form.

Ver		Release	 By		    Date				Change Description
001		01.00    Praveen	2025-02-25			#4359 First version.
002		01.00	   Usha M		2025-02-28			#4378 Updated SP from "sp_S_IM_TRDataGetByFilter" -> "sp_sa_IM_Item_Transfer_GetByFilter"
003   01.00    Usha M		2025-03-04			#4355 Removed Debugger
004   02.00.00 Praveen	2025-12-18			#5274 Set the start and end date-time formats.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.IM = window.IM || {};
	IM.ItemTransferList = IM.ItemTransferList || {};
	IM.ItemTransferList = ItemTransferList();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function ItemTransferList() {
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
		let lastFilterValue = "";
		let selectedLocation = "";
		const TIME_FILTER_DATA =
			'[{"orderby":1,"text":"Custom","value":"CUSTOM","start_time":"","end_time":"","start_time_readonly":0,"end_time_readonly":1}' +
			',{"orderby":2,"text":"1H","value":"1","start_time":"","end_time":"","start_time_readonly":0,"end_time_readonly":0}' +
			',{"orderby":3,"text":"12H","value":"12","start_time":"","end_time":"","start_time_readonly":0,"end_time_readonly":0}' +
			',{"orderby":4,"text":"24H","value":"24","start_time":"","end_time":"","start_time_readonly":0,"end_time_readonly":0}]';
		// ----------------------------------------------------------------------------------
		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			// Initialize variables
			FORM.Control = Control;
			_controls.wwItemTransferList = FORM.Control.findByXmlNode("WWTL");
			_controls.wwCheckboxFilter = FORM.Control.findByXmlNode("WWCF");
			_controls.wwTimeFilter = FORM.Control.findByXmlNode("WWTF");
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
		 * Get shift schedule time details for displaying it on the  widget
		 * @param {integer} shift_configured
		 * @returns {JSON}  data
		 */
		function wwTimeFilterLoad() {
			_controls.wwTimeFilter.widgetProperties.data = TIME_FILTER_DATA;
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
				lastFilterValue = "";
				wwCheckboxFilterDataLoad();
				wwTimeFilterLoad();
				loadIMTransferList();
			} catch (exception) {
				handleScriptError(exception);
			}
		}
		/**
		 * Function to load WO Queue for an entity and assign data to grid widget
		 *
		 */
		function loadIMTransferList() {
			const startDatetime = SFU.getDateTimeInServerUTCFormat(new Date(_controls.wwTimeFilter.widgetProperties.start));
			const endDatetime = SFU.getDateTimeInServerUTCFormat(new Date(_controls.wwTimeFilter.widgetProperties.end));
			const parameterColl = {
				ent_id: selectedLocation,
				from_transfer_time_utc: startDatetime.toString("yyyy-MM-dd HH:mm:ss"),
				to_transfer_time_utc: endDatetime.toString("yyyy-MM-dd HH:mm:ss"),
			};
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_sa_IM_Item_Transfer_GetByFilter", parameterColl, false).then(
				(data) => {
					// Handle successful response data
					_controls.wwItemTransferList.widgetProperties.data = JSON.stringify(data);
				},
				(error) => {
					// Handle error
					throw Error("Error:", error);
				},
			);
		}
		/**
		 * Function to set Widget CheckboxList visible script
		 */
		function wwIMStatesVisibleScripts(Control) {
			$(Control.findById("W1").domElement).parent().css("overflow", "visible");
			$(Control.findById("W1").domElement).parent().parent().css("overflow", "visible");
			$(Control.findById("W1").domElement).parent().closest("div[controlid='W1']").css("z-index", "9999999999");
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
		 * @param {*} error
		 */
		function handleScriptError(error) {
			let errorMessage;
			if (error instanceof TypeError) {
				errorMessage = skelta.localize.getString("@@IM_UnexpectedType@@");
			} else if (error instanceof ReferenceError) {
				errorMessage = skelta.localize.getString("@@IM_ReferenceError@@");
			} else {
				errorMessage = skelta.localize.getString("@@IM_DuringScriptExecution@@");
			}
			SFU.showError(skelta.localize.getString("FormNGFErrorRunningScript_title"), errorMessage, null, error.message);
			throw errorMessage;
		}
		/**
		 * Function to load data for the checkbox filter widget
		 */
		function wwCheckboxFilterDataLoad() {
			parameterColl = { ent_id: selectedLocation, lang_id: FT.Ui.Translation.LangId };
			const spName = "sp_SA_IM_Filters";
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", spName, parameterColl, false).then(
				(data) => {
					// Handle successful response data
					const filteredData = data.filter((item) => item.group === "Location");

					_controls.wwCheckboxFilter.widgetProperties.data = JSON.stringify(filteredData);
				},
				(error) => {
					// Handle error
					throw Error("Error:", error);
				},
			);
		}
		/**
		 * On CheckBox Filter selection change
		 * @returns
		 */
		function wwCheckboxFilterOnDataChange() {
			const selectedValues = _controls.wwCheckboxFilter.value;
			if (selectedValues !== lastFilterValue) {
				lastFilterValue = selectedValues;
				selectedLocation = selectedValues.Location !== undefined ? selectedValues.Location.toString() : "";
				loadIMTransferList();
			}
		}
		/**
		 * On TimeFilter selection change
		 * @returns
		 */
		function wwTimeFilterOnDataChange() {
			loadIMTransferList();
		}
		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			wwPanelVisibleScripts: wwPanelVisibleScripts,
			wwIMStatesVisibleScripts: wwIMStatesVisibleScripts,
			wwCheckboxFilterOnDataChange: wwCheckboxFilterOnDataChange,
			wwTimeFilterOnDataChange: wwTimeFilterOnDataChange,
		};
	}
})(window);
