/*
Name:					FT_Common.js
Description:	The FT_Common.js file contains the common JavaScript functions required across all projects/modules.
							New functions that apply to all modules are added and defined here.

Ver		Release 	By				Date		Change Description
001		00.50		Somya Saxena	2024-06-14	#2692 First version of the file.
002		00.50		Somya Saxena	2024-07-02	#2692 Added Constant for MES_REAS_GRP_CD.
003		00.50		João Caldeira	2024-08-14	#3290 Added windowEvent function to dispatch custom events to window.top.
004		00.50		A. Tonani		2024-09-17 	Added String.prototype.format, to be able to update items in curly braces in strings.
005		00.70		João Caldeira	2024-10-02	#3290 Changed windowEvent function name to windowEventDispatch.
																				Added windowEventListener function to listen to events.
006		00.70		Shamanth S		2024-10-03	#3686 Changed planned, plannedWarning to ready, readyWarning in MES_SAMPLE_STATUS.
007		00.70		João Caldeira	2024-11-15	#3938 Added windowEventListenerRemove function to remove liteners.
																				Renamed windowEventListener to windowEventListenerAdd.
																				Changed the parameters of windowEventListenerAdd.
																				Added EVENT_SOURCE_TYPE variable to define event source types.
																				Updated MES_SAMPLE_FREQ_TYPE to have the types defined
																				and used by MES.
																				Removed QM_CHAR_TYPE since this is redundant.
008	 	00.70		Chitta			2024-12-05	#3937 Removed MES_REAS_GRP_CD since Item reason group ID codes (MES_REAS_GRP_CD)
																				must not call from FT_Common.js
009	 	00.70		João Caldeira	2024-12-06	#3937 Added ITEM_REAS_GRP_TYPE variable to list the different types a group can be.
010		01.03		BB				2025-09-19	#5175 Added new jsonParse function.
011		02.00.00	Praveen			2025-12-17	#5262  Added two utility functions (dateUtc2Local, dateLocal2Utc) to handle UTC
															and local date conversion.

*/

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.FT = window.FT || {};
	FT.Common = FT.Common || {};
	FT.Common = Common();
	// Start Up Module
	FT.Common.initialize();
	// ------------------------------------------------------------------------------------

	/**
	 * FT.CommonTemplate
	 * @returns {object} FT.CommonTemplate template object.
	 */
	function Common() {
		// #region Constant variables
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const LIST_JS = ["js/MES/FT_WebApi.js", "js/MES/FT_WorkTasks.js", "js/MES/FT_Mqtt.js", "js/MES/FT_UI.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = [];

		/**  Constant:  Numeric Formatting String @type {String} */
		const FORMAT_FLOAT = {
			decimal0: "#,###.0",
			decimal1: "#,###.#",
			decimal2: "#,###.##",
			decimal3: "#,###.###",
		};

		/** Constant: Time formatting string @type {String} */
		const FORMAT_TIME = {
			hhMm: "HH:MM",
			hhMmSs: "HH:MM:SS",
		};

		/** Constant: Event type string @type {String} */
		const EVENT_SOURCE_TYPE = {
			mqtt: "MQTT",
			form: "Form",
			workflow: "Workflow",
		};

		// MES Attribute Data Type
		const MES_ATTR_DATA_TYPE = {
			stringShort: 0,
			enum: 1,
			int: 2,
			currency: 3,
			color: 4,
			date: 5,
			float: 6,
			percent: 7,
			bool: 8,
			string: 12,
		};

		// MES Item Reason Group Type
		const MES_ITEM_REAS_GRP_TYPE = {
			hidden: 0,
			production: 1,
			consumption: 2,
			reject: 3,
		};

		// MES Job State Code
		const MES_JOB_STATE_CD = {
			new: 1,
			ready: 2,
			running: 3,
			complete: 4,
			suspended: 5,
			onHold: 6,
			canceled: 7,
			bypassed: 8,
			superseded: 9,
		};

		// MES Work Order State Code
		const MES_WO_STATE_CD = {
			released: 0,
			started: 1,
			completed: 2,
			closed: 3,
		};

		// MES Characteristic Type
		const MES_CHARACTERISTIC_TYPE = {
			variable: 0,
			binary: 1,
			counted: 2,
			catalog: 3,
			date: 4,
			text: 5,
		};

		// MES Sample Frequency Type
		const MES_SAMPLE_FREQ_TYPE = {
			shift: 0,
			calendarTime: 1,
			production: 3,
			lotNo: 6,
			jobStart: 8,
			manual: 19,
			jobEnd: 20,
		};

		/**  Constant:  MES Sample Status enumeration @type {integer} */
		const MES_SAMPLE_STATUS = {
			ready: 1,
			readyWarning: 2,
			missed: 3,
			inProgress: 4,
			late: 5,
			complete: 6,
			completeLate: 7,
			cancelled: 8,
		};

		/**  Constant:  MES Sample Result enumeration @type {integer} */
		const MES_SAMPLE_RESULT = {
			pending: 1,
			good: 2,
			occ: 3,
			oos: 4,
			oocKey: 5,
			oosKey: 6,
			oocCritical: 7,
			oosCritical: 8,
		};

		// ----------------------------------------------------------------------------------
		// #endregion Constant variables
		// #region Private variables
		// ----------------------------- Private Variables ----------------------------------
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

		// #region ExecutePeriodic function
		/**
		 * Executes a given function with a certain delay. Arguments can be provided to the function as required.
		 *
		 * @param {object} func The function object name.
		 * @param {number} delay The time delay, in miliseconds.
		 * @param {} args The arguments of the function, as required and dynamic.
		 * @returns The function result.
		 */
		function funcExecutePeriodic(func, delay, ...args) {
			func(...args);
			return setInterval(func, delay, ...args);
		}
		// #endregion funcExecutePeriodic
		// #region color functions
		/**
		 * Converts a color in BGR decimal format (standard MES) to a hexadecimal value.
		 *
		 * @param {number} bgrValue The color decimal value in BGR to convert to Hexadecimal.
		 * @returns {string} The color code in hexadecimal value.
		 */
		function colorBgr2Hex(bgrValue) {
			const rgb = (bgrValue && 0xff0000) / 0x10000 || (bgrValue && 0xff00) || (bgrValue && 0xff) * 0x10000;
			let rgbHex = "000000" + rgb.toString(16);
			rgbHex = "#" + rgbHex.slice(-6);
			return rgbHex;
		}

		/**
		 * Converts a color in hexadecimal format to the equivalent RGB components.
		 *
		 * @param {string} hexValue The hexadecimal representation of the color.
		 * @returns {Object|null} An object containing the RGB components {red, green, blue}, or null if the input is invalid.
		 */
		function colorHex2Rgb(hex) {
			const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			const result = {
				red: parseInt(rgb[1], 16),
				green: parseInt(rgb[2], 16),
				blue: parseInt(rgb[3], 16),
				hexValue: hex, // Return the input hexadecimal value
			};
			// Return null if the input doesn't match the expected pattern
			return rgb ? result : null;
		}

		/**
		 * Converts the RGB components of a color to the equivalent hexadecimal representation.
		 *
		 * @param {number} red The red component of the color (0-255).
		 * @param {number} green The green component of the color (0-255).
		 * @param {number} blue The blue component of the color (0-255).
		 * @returns {string} The hexadecimal representation of the color.
		 */
		function colorRgb2Hex(red, green, blue) {
			// Convert the RGB components to a single hexadecimal number
			const hexValue = "#" + (red * 65536 + green * 256 + blue).toString(16).padStart(6, "0").toUpperCase();

			return hexValue;
		}

		/**
		 * Calculates the luminance of the given color and based on that determines if the best
		 * contrasting color is black or white, returning the hexadecimal value of white or black.
		 *
		 * @param {string} hexValue The hexadecimal representation of the color.
		 * @returns {string} The hexadecimal of black or white.
		 */
		function colorContrast(hex) {
			const rgb = colorHex2Rgb(hex);
			if (!rgb) {
				throw new Error("Invalid hex color format");
			}

			// Calculate perceptive luminance
			const contrast = (0.299 * rgb.red + 0.587 * rgb.green + 0.114 * rgb.blue) / 255;

			// Determine if the background color is light or dark
			return contrast > 0.5 ? "#000000" : "#FFFFFF";
		}
		// #endregion color functions
		// #region format functions
		/**
		 * Converts a duration (in milliseconds) to a time span string in the specified format.
		 * @param {number} duration - The duration in milliseconds.
		 * @param {string} [format="hh:mm:ss"] - The desired format (default is "hh:mm:ss").
		 * @returns {string} - The formatted time span string.
		 */
		function formatDuration2TimeSpan(duration, format = "hh:mm:ss") {
			// Validate input
			if (typeof duration !== "number" || duration < 0) {
				throw new Error("Invalid duration value. Please provide a non-negative integer.");
			}

			// Calculate hours, minutes, and seconds
			const hours = Math.floor(duration / 3600000); // 1 hour = 3600000 milliseconds
			const minutes = Math.floor((duration % 3600000) / 60000); // 1 minute = 60000 milliseconds
			const seconds = Math.floor((duration % 60000) / 1000); // 1 second = 1000 milliseconds

			// Format the time span
			const formattedTime = format
				.replace("hh", String(hours).padStart(2, "0"))
				.replace("mm", String(minutes).padStart(2, "0"))
				.replace("ss", String(seconds).padStart(2, "0"));

			return formattedTime;
		}

		/**
		 * Returns the string representation of the specified number.
		 *
		 * @param {float} value
		 * @param {int} decimals
		 * @param {string} culture
		 * @return {string}
		 */
		function formatNumber(value, decimals, culture) {
			if (value === null) return ""; // empty string.
			return (Math.round(value * 10 ** decimals) / 10 ** decimals).toLocaleString(culture, {
				minimumFractionDigits: decimals,
				maximumFractionDigits: decimals,
			});
		}

		/**
		 * Converts the value of objects to strings based on the formats specified and inserts them into another string.
		 * @return {string}
		 */
		if (!String.prototype.format) {
			// eslint-disable-next-line no-extend-native
			String.prototype.format = function format(...args) {
				return this.replace(/{(\d+)}/g, (match, number) => (args[number] !== undefined ? args[number] : match));
			};
		}
		// #endregion format functions
		// #region events
		/**
		 * Triggers an event in the top most window. This will make the event available to every component that subscribes to an event.
		 * @param {string} type The event name. It must follow a specific naming convention.
		 * @param {string} subType The event sub-type, used to filter out the events assigned to the same type.
		 * It must follow a specific naming convention.
		 * @param {string} sourceType The event source type that triggered the event, as defined in EVENT_SOURCE_TYPE.
		 * @param {string} sourceId The event identifier. This can be an MQTT tag, a form name or a workflow name, or a combination of these.
		 * @param {object} data The data to be sent with the event.
		 */
		function windowEventDispatch(type, subType, sourceType, sourceId, data) {
			const detail = {
				subType: subType,
				sourceType: sourceType,
				sourceId: sourceId,
				data: data,
			};

			const options = {
				bubbles: false,
				cancelable: true,
				composed: false,
				detail: detail,
			};

			const event = new CustomEvent(type, options);
			// Dispatch the event to the top
			window.top.dispatchEvent(event);
		}

		/**
		 * Listens to an event in the top most window.
		 * @param {string} type The event name. It must follow a specific naming convention.
		 * @param {string} listener The listener object or function to handle the event.
		 */
		function windowEventListenerAdd(type, listener) {
			// Add the event listener at the top window
			window.top.addEventListener(type, listener, false);
		}

		/**
		 * Removes the listener to an event in the top most window.
		 * @param {string} type The event name. It must follow a specific naming convention and it must be the same as the original listener created.
		 * @param {string} listener The listener object or function to handle the event. This must be the same function used to create the listener.
		 */
		function windowEventListenerRemove(type, listener) {
			// Add the event listener at the top window
			window.top.removeEventListener(type, listener, false);
		}
		// #endregion events

		/**
		 * function to set decimal places for the control
		 */
		function setDecimalPlaces(control, decimalPlaces) {
			if (SFU.isUndefined(control)) {
				return;
			}
			try {
				const controlValue = control.value;
				kendo.cultures[control.id + "-culture"].numberFormat.decimals = decimalPlaces;
				const formatN = "n" + decimalPlaces;
				$($(control.domElement).parent()[0])
					.find("[data-skrl=skNumPkr]")
					.data("kendoNumericTextBox")
					.setOptions({ decimals: decimalPlaces, format: formatN });
				$($(control.domElement).parent()[0]).find("[data-skrl=skNumPkr]").data("kendoNumericTextBox").value(controlValue);
			} catch (ex) {
				// catch exceptions
			}
		}

		/**
		 * Returns the parsed JSON into an object. Uses try to avoid parsing errors when
		 * string was undefined, empty or in invalid format. Returns null if parsing failed.
		 *
		 * @param {string} json JSON formatted string to be parsed
		 * @returns {object} Parsed JSON. Null if string was not formatted correctly.
		 */
		function jsonParse(json) {
			try {
				// Return parsed json
				return JSON.parse(json);
			} catch (error) {
				// Return null if empty
				return null;
			}
		}
		// #region datetime functions
		/**
		 * Converts a UTC date string into a localized date-time string.
		 * Validates the input before formatting and returns an error message
		 * if the date is invalid.
		 *
		 * @param {string} dateUtc - A date string in UTC format.
		 * @returns {string} Localized date-time string or "Invalid date!" if parsing fails.
		 */
		function dateUtc2Local(dateUtc) {
			const timestamp = Date.parse(dateUtc);

			// If the number is valid
			if (!Number.isNaN(timestamp)) {
				// Return the date in local time zone
				return new Date(dateUtc).toLocaleString();
			}
			return "Invalid date!";
		}

		/**
		 * Converts a local date string into an ISO UTC string.
		 * Validates the input before formatting and returns an error message
		 * if the date is invalid.
		 *
		 * @param {string} dateLocal - A date string in local time format.
		 * @returns {string} ISO UTC string or "Invalid date!" if parsing fails.
		 */
		function dateLocal2Utc(dateLocal) {
			const timestamp = Date.parse(dateLocal);

			// If the number is valid
			if (!Number.isNaN(timestamp)) {
				// Return the date in UTC (ISO format)
				return new Date(dateLocal).toISOString();
			}
			return "Invalid date!";
		}
		// #endregion datetime functions

		// #region return
		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			FORMAT_FLOAT: FORMAT_FLOAT,
			FORMAT_TIME: FORMAT_TIME,
			EVENT_SOURCE_TYPE: EVENT_SOURCE_TYPE,
			MES_ATTR_DATA_TYPE: MES_ATTR_DATA_TYPE,
			MES_ITEM_REAS_GRP_TYPE: MES_ITEM_REAS_GRP_TYPE,
			MES_JOB_STATE_CD: MES_JOB_STATE_CD,
			MES_WO_STATE_CD: MES_WO_STATE_CD,
			MES_CHARACTERISTIC_TYPE: MES_CHARACTERISTIC_TYPE,
			MES_SAMPLE_FREQ_TYPE: MES_SAMPLE_FREQ_TYPE,
			MES_SAMPLE_RESULT: MES_SAMPLE_RESULT,
			MES_SAMPLE_STATUS: MES_SAMPLE_STATUS,
			initialize: initialize,
			funcExecutePeriodic: funcExecutePeriodic,
			colorBgr2Hex: colorBgr2Hex,
			colorHex2Rgb: colorHex2Rgb,
			colorRgb2Hex: colorRgb2Hex,
			colorContrast: colorContrast,
			formatDuration2TimeSpan: formatDuration2TimeSpan,
			formatNumber: formatNumber,
			jsonParse: jsonParse,
			windowEventDispatch: windowEventDispatch,
			windowEventListenerAdd: windowEventListenerAdd,
			windowEventListenerRemove: windowEventListenerRemove,
			setDecimalPlaces: setDecimalPlaces,
			dateUtc2Local: dateUtc2Local,
			dateLocal2Utc: dateLocal2Utc,
		};
		// #endregion return
	}

	// We need that our library is globally accessible, then we save in the window
})(window);
