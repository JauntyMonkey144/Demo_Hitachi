/*
Name:        	QM_UI_SpcChart.js
Description: 	QM_UI_SpcChart js file containing global logic pertaining to the spc form dropdown form.

Ver		Release			By		    Date				Change Description
001	  01.03.00	  Somya S		2025-09-26	SPC Chart context
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.QM = window.QM || {};
	QM.SpcChart = QM.SpcChart || {};
	QM.SpcChart = SpcChart();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function SpcChart() {
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;
		const QM_EVENTS = "qm.spc.filter";
		let chartData = new Object();
		const QM_MODULE = "qm";
		const QM_TIME_FILTER_DATA =
			'[{"orderby":1,"text":"Custom","value":"CUSTOM","start_time":"","end_time":"","start_time_readonly":0,"end_time_readonly":1}' +
			',{"orderby":2,"text":"1H","value":"1","start_time":"","end_time":"","start_time_readonly":0,"end_time_readonly":0}' +
			',{"orderby":3,"text":"12H","value":"12","start_time":"","end_time":"","start_time_readonly":0,"end_time_readonly":0}' +
			',{"orderby":4,"text":"8H","value":"8","start_time":"","end_time":"","start_time_readonly":0,"end_time_readonly":0,' +
			'"to_refresh":"xxCurDate"}' +
			"]";
		// ----------------------------------------------------------------------------------

		// ----------------------------- Private Variables ----------------------------------
		const _controls = {};

		// ----------------------------------------------------------------------------------
		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			// Initialize variables
			FORM.Control = Control;
			_controls.filter = FORM.Control.findByXmlNode("Embeddedform1");
			_controls.SpcChartWidget = FORM.Control.findByXmlNode("WSPC");

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
		 * Includes js files specified in LIST_JS
		 */
		function includeJsFiles() {
			SFU.includeCustomJsFiles(LIST_JS);
		}
		/**
		 * listens to events that have to be reacted upon by card widget to refresh
		 */
		function qmEventListener(event) {
			// Split the module_event string into an array
			const eventList = QM_EVENTS.split("|");

			// Check if event.detail.subType matches any value in the array
			if (eventList.includes(event.detail.subType)) {
				onFormLoad();
			}
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
				
				let filterData = [];
				const eventDataContext = FT.WorkTasks.contextGet(FORM.Control, "eventData");
				if (eventDataContext && eventDataContext.length > 0 && eventDataContext[0].type === "spc") {
					filterData = JSON.parse(eventDataContext[0].jsonValue);
				}
				_controls.SpcChartWidget.widgetProperties.data = filterData;
				// wwTimeFilterLoad();
				FT.Common.windowEventListenerAdd(QM_MODULE, qmEventListener);
			} catch (exception) {
				handleScriptError(exception);
			}
		}

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
		 * Get shift schedule time details for displaying it on the  widget
		 * @param {integer} shift_configured
		 * @returns {JSON}  data
		 */
		function wwTimeFilterLoad() {
			const currentTime = new Date();
			_controls.wwTimeFilter.widgetProperties.data = QM_TIME_FILTER_DATA.replace("xxCurDate", currentTime);
		}

		function setWidgetData(cData) {
			
			chartData = cData;
			const currentTime = new Date();
			const startDatetime = SFU.getDateTimeInServerUTCFormat(new Date(_controls.wwTimeFilter.widgetProperties.start));
			const endDatetime =
				_controls.wwTimeFilter.value === "shift" || _controls.wwTimeFilter.widgetProperties.selected.toUpperCase() === "CUSTOM"
					? SFU.getDateTimeInServerUTCFormat(new Date(_controls.wwTimeFilter.widgetProperties.end))
					: SFU.getDateTimeInServerUTCFormat(new Date(currentTime));
			chartData.startTimeUtc = startDatetime;
			chartData.endTimeUtc = endDatetime;
			_controls.SpcChartWidget.widgetProperties.data = chartData;
		}

		function wwTimeFilterOnDataChange() {
			setWidgetData(chartData);
		}

		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			setWidgetData: setWidgetData,
			wwTimeFilterOnDataChange: wwTimeFilterOnDataChange,
		};
	}
})(window);
