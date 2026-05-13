/*
Name:        	AM_UI_Report.js
Description: 	Andon Report js file containing global logic pertaining to the AM_UI_Report Form.

Ver       Release			By						Date				Change Description
001       00.70		    Praveen			  2024-08-29	#3381 First version.
002				01.00				Bas van B			2025-02-26	#4253 Translate MD in report.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.AM = window.AM || {};
	AM.Report = AM.Report || {};
	AM.Report = Report();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function Report() {
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
			_controls.wwAndonReport = FORM.Control.findByXmlNode("WWHR");
			_controls.wwCheckboxFilter = FORM.Control.findByXmlNode("WWFS");

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
		 * Form load function for the controls
		 *  The following actions are performed:
		 * - Loads time filter data
		 */
		function onFormLoad() {
			try {
				wwCheckboxFilterDataLoad();
				wwTimeFilterLoad();
				wwAndonStatewiseReportLoad();
			} catch (exception) {
				handleScriptError(exception);
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
		/**
		 *  This function loads the Andon  data based on the selected filters such as Andon types,
		 *  states, entities, and time range (start and end time)
		 * @param {int} type_id
		 * @param {int} state_id
		 * @param {datetime} start_time
		 * @param {datetime} end_time
		 * @returns {JSON} data
		 */
		function wwAndonStatewiseReportLoad() {
			try {
				const parameterCollection = {
					type_id: _selectedAndonTypes,
					state_id: _selectedStates,
					ent_id: _selectedEntities,
					start_time: _controls.wwTimeFilter.widgetProperties.start,
					end_time: _controls.wwTimeFilter.widgetProperties.end,
				};
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_AM_Andon_Log_CountByState", parameterCollection, false).then(
					(data) => {
						// Translate Types
						const fields = [
							FT.Ui.translationColumnField(
								"type_desc",
								FT.Ui.TRANSLATION_GROUPS.grpAmAndonTypeTypeDesc,
								FT.Ui.TRANSLATION_KEYS.keyAmAndonType,
							),
						];
						const translatedData = FT.Ui.translateArray(data, fields);

						translatedData.forEach((row) => {
							// Translate the states
							Object.keys(row).forEach((key) => {
								if (key !== "type_desc") {
									// Translate the state description by replacing the property with the translated property name.
									const newKey = FT.Ui.translateValue(FT.Ui.TRANSLATION_GROUPS.grpAmAndonStateStateDesc, key, key);
									if (key !== newKey) {
										Object.defineProperty(row, newKey, Object.getOwnPropertyDescriptor(row, key));
										delete row[key];
									}
								}
							});
						});
						_controls.wwAndonReport.widgetProperties.data = JSON.stringify(translatedData);
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
		 * Timefilter widget on selection change for reload the widget
		 */
		function wwTimeFilterOnDataChange() {
			wwAndonStatewiseReportLoad();
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
				wwAndonStatewiseReportLoad();
			}
		}
		/**
		 * Function to set WidgetDropNav visible script
		 */
		function wwDropNavigationSetVisibleScripts(Control) {
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
		return {
			initializeForm: initializeForm,
			wwAndonStatewiseReportLoad: wwAndonStatewiseReportLoad,
			wwTimeFilterOnDataChange: wwTimeFilterOnDataChange,
			wwDropNavigationSetVisibleScripts: wwDropNavigationSetVisibleScripts,
			wwCheckboxFilterOnDataChange: wwCheckboxFilterOnDataChange,
			wwPanelVisibleScripts: wwPanelVisibleScripts,
		};
	}
})(window);
