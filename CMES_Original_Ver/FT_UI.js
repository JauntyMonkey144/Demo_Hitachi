/*
Name:					FT_Ui.js
Description:	FT_Ui js file containing global logic pertaining to the User interface functions.

Ver		By							Date				Change Description
001		Somya Saxena		2024-06-14	#2838 First version.
002		Bas van Buuren	2025-02-19	#4253 Added translation functionality to the FT.Ui.
003		Bas van Buuren	2025-02-19	#4253 Get translations reload time from system attributes.
004		Bas van Buuren	2025-02-20	#4253 Added translation groups and keys as constants. Added function
																	to generate column translation field objects.
005		Bas van Buuren	2025-02-20	#4253 Improved group and key dictionaries and applied naming convention rules.
006		Bas van Buuren	2025-02-21	#4253 Also reload translations when localization is changed. Put groups and keys in readonly objects.
007		Bas van Buuren	2025-02-21	#4253 Removed typo from wo|wo_desc translation group.
008		Bas van Buuren	2025-02-21	#4253 Moved TRANSLATION_GROUP and TRANSLATION_KEYS objects to return, to make sure it is loaded before
																	embedded forms/widgets try to access it.
009		Bas van Buuren	2025-02-21	#4253	Removed typo in bom_item|instruction.
010		Bas van Buuren	2025-02-21	#4253 Added functions to create general and value type translation fields for array translations.
011		Bas van Buuren	2025-02-24	#4253 Added check whether data is an array in translate array function. If it is not an array, put the single
																	value in an array before processing.
012		Bas van Buuren	2025-02-26	#4253 Changed not existing column name attr_name into attr_desc in attr translation key.
																	Added null check in translateArray().
013		Bas van Buuren	2025-02-26	#4253 Removed null check on property value in translateArray.
014		Bas van Buuren	2025-02-26	#4253 Allow multiple translation groups on same column in translateArray function.
015		Bas van Buuren	2025-02-27	#4253 Removed white space in KEY_UTIL_REAS constant.
016		Bas van Buuren	2025-03-03	#4253 Added sample result and status to the translation groups and keys.
017		Bas van Buuren	2025-03-03	#4253 Added field options to have alternative defaultColumn and defaultTemplate to generate default strings in
																	translate array in case no translation was found.
018		Bas van Buuren	2025-03-05	#4253 Use product standard string id to get the language id from the IETF language tag.
*/

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.FT = window.FT || {};
	FT.Ui = FT.Ui || {};
	FT.Ui = Ui();
	// Start up module
	FT.Ui.initialize();
	// ------------------------------------------------------------------------------------

	/**
	 * FT.Mqtt
	 * @returns {object} FT.Mqtt template object.
	 */
	function Ui() {
		// #region Constant variables
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const LIST_JS = [];
		const LIST_JS_AJAX = [];
		const LIST_CSS = [];
		// Context variable name stored in session storage
		const SS_TRANSLATIONS = "ftUiTranslation";
		const SS_TRANSLATIONS_RELOAD_TIME = 15; // Reload if the last time the data was loaded was more than 15 minutes ago if not configured.
		// GROUP DEFINITIONS
		const GRP_ATTR_ATTR_DESC = "attr|attr_desc";
		const GRP_ATTR_SET_POSSIBLE_VALUE = "attr_set|possible_value";
		const GRP_BOM_ITEM_INSTRUCTION = "bom_item|instruction";
		const GRP_BOM_ITEM_SUBST_INSTRUCTION = "bom_item_subst|instruction";
		const GRP_BOM_VER_VER_COMMENTS = "bom_ver|ver_comments";
		const GRP_CATEGORY_CATEGORY_DESC = "category|category_desc";
		const GRP_CAUSE_CAUSE_DESC = "cause|cause_desc";
		const GRP_CAUSE_GRP_CAUSE_GRP_DESC = "cause_grp|cause_grp_desc";
		const GRP_CERT_TYPE_SIGNOFF_NOTES = "cert_type|signoff_notes";
		const GRP_CHARACTERISTIC_CHAR_DESC = "characteristic|char_desc";
		const GRP_CORR_ACTION_ACTION_DESC = "corr_action|action_desc";
		const GRP_ENT_DESCRIPTION = "ent|description";
		const GRP_FILE_TYPE_FILE_DESC = "file_type|file_desc";
		const GRP_ITEM_ITEM_DESC = "item|item_desc";
		const GRP_ITEM_CLASS_ITEM_CLASS_DESC = "item_class|item_class_desc";
		const GRP_ITEM_GRADE_ITEM_GRADE_DESC = "item_grade|item_grade_desc";
		const GRP_ITEM_REAS_REAS_DESC = "item_reas|reas_desc";
		const GRP_ITEM_REAS_GRP_REAS_GRP_DESC = "item_reas_grp|reas_grp_desc";
		const GRP_ITEM_STATE_ITEM_STATUS_DESC = "item_state|item_status_desc";
		const GRP_ITEM_SUBST_INSTRUCTION = "item_subst|instruction";
		const GRP_JOB_STATE_STATE_DESC = "job_state|state_desc";
		const GRP_KPI_KPI_DESC = "kpi|kpi_desc";
		const GRP_KPI_STATE_STATE_DESC = "kpi_state|state_desc";
		const GRP_OPER_OPER_DESC = "oper|oper_desc";
		const GRP_OPER_STEP_STEP_DESC = "oper_step|step_desc";
		const GRP_OPER_STEP_CHOICE_CHOICE_LABEL = "oper_step_choice|choice_label";
		const GRP_OPER_STEP_GRP_STEP_GRP_DESC = "oper_step_grp|step_grp_desc";
		const GRP_PROCESS_PROCESS_DESC = "process|process_desc";
		const GRP_QM_SPEC_QM_SPEC_DESC = "qm_spec|qm_spec_desc";
		const GRP_SAMPLE_SAMPLE_RESULT = "sample|sample_result";
		const GRP_SAMPLE_SAMPLE_STATUS = "sample|sample_status";
		const GRP_SAMPLE_FREQ_FREQ_DESC = "sample_freq|freq_desc";
		const GRP_SAMPLE_PLAN_PLAN_DESC = "sample_plan|plan_desc";
		const GRP_SHIFT_SHIFT_DESC = "shift|shift_desc";
		const GRP_SHIFT_PATTERN_PATTERN_NAME = "shift_pattern|pattern_name";
		const GRP_SPC_RULE_RULE_DESC = "spc_rule|rule_desc";
		const GRP_SPEC_SPEC_DESC = "spec|spec_desc";
		const GRP_SUBLOT_LEVEL_DESC_LVL_DESC = "sublot_level_desc|lvl_desc";
		const GRP_UOM_DESCRIPTION = "uom|description";
		const GRP_UTIL_REAS_REAS_DESC = "util_reas|reas_desc";
		const GRP_UTIL_REAS_CATEGORY_SET_POSSIBLE_VALUE = "util_reas_category_set|possible_value";
		const GRP_UTIL_REAS_GRP_REAS_GRP_DESC = "util_reas_grp|reas_grp_desc";
		const GRP_UTIL_STATE_STATE_DESC = "util_state|state_desc";
		const GRP_WO_WO_DESC = "wo|wo_desc";
		const GRP_AM_ANDON_TYPE_TYPE_DESC = "AM.andon_type|type_desc";
		const GRP_AM_ANDON_STATE_STATE_DESC = "AM.andon_state|state_desc";
		const GRP_AM_ANDON_ISSUE_ISSUE_DESC = "AM.andon_issue|issue_desc";
		// KEY Constants
		const KEY_ATTR = "attr_desc|attr_grp";
		const KEY_ATTR_SET = "attr_id|possible_value";
		const KEY_BOM_ITEM = "parent_item_id|ver_id|item_id";
		const KEY_BOM_ITEM_SUBST = "parent_item_id|ver_id|bom_pos|alt_no";
		const KEY_BOM_VER = "parent_item_id|ver_id";
		const KEY_CATEGORY = "category_id";
		const KEY_CAUSE = "cause_id";
		const KEY_CAUSE_GRP = "cause_grp_id";
		const KEY_CERT_TYPE = "cert_name";
		const KEY_CHARACTERISTIC = "char_id";
		const KEY_CORR_ACTION = "action_id";
		const KEY_ENT = "ent_name";
		const KEY_FILE_TYPE = "file_ext";
		const KEY_ITEM = "item_id";
		const KEY_ITEM_CLASS = "item_class_id";
		const KEY_ITEM_GRADE = "item_grade_desc";
		const KEY_ITEM_REAS = "reas_desc";
		const KEY_ITEM_REAS_GRP = "reas_grp_desc";
		const KEY_ITEM_STATE = "item_status_desc";
		const KEY_ITEM_SUBST = "orig_item_id|alt_no";
		const KEY_JOB_STATE = "state_desc";
		const KEY_KPI = "kpi_name";
		const KEY_KPI_STATE = "state_desc";
		const KEY_OPER = "process_id|oper_id";
		const KEY_OPER_STEP = "process_id|oper_id|step_name";
		const KEY_OPER_STEP_CHOICE = "process_id|oper_id|step_name";
		const KEY_OPER_STEP_GRP = "process_id|oper_id|step_grp_desc";
		const KEY_PROCESS = "process_id";
		const KEY_QM_SPEC = "qm_spec_name";
		const KEY_SAMPLE_FREQ = "freq_name";
		const KEY_SAMPLE_PLAN = "plan_name";
		const KEY_SAMPLE_RESULT = "sample_result";
		const KEY_SAMPLE_STATUS = "sample_status";
		const KEY_SHIFT = "shift_desc";
		const KEY_SHIFT_PATTERN = "pattern_name";
		const KEY_SPC_RULE = "rule_desc";
		const KEY_SPEC = "spec_desc";
		const KEY_SUBLOT_LEVEL_DESC = "item_id|lvl";
		const KEY_UOM = "description";
		const KEY_UTIL_REAS = "reas_grp_desc|reas_desc";
		const KEY_UTIL_REAS_CATEGORY_SET = "category|possible_value";
		const KEY_UTIL_REAS_GRP = "reas_grp_desc";
		const KEY_UTIL_STATE = "state_desc";
		const KEY_WO = "wo_id";
		const KEY_AM_ANDON_TYPE = "type_desc";
		const KEY_AM_ANDON_STATE = "state_desc";
		const KEY_AM_ANDON_ISSUE = "issue_desc";

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

			// Copy the namespace to the window.top
			window.top.FT = window.top.FT || window.FT || {};
			window.top.FT.Ui = window.top.FT.Ui || window.FT.Ui || {};

			// Load the language translations
			langLoad();
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
		// #region splitter functions
		/**
		 * Adds the splitter control to the given panel control, with the given configuration.
		 *
		 * @param {object} control - The control to add the splitter to.
		 * @param {object} config - The configuration to apply to the splitter.
		 */
		function splitterAdd(control, config) {
			// Validate parameters
			if (typeof control !== "object" || control === null) {
				throw new Error("Invalid control object");
			}
			if (typeof config !== "object" || config === null) {
				throw new Error("Invalid config object");
			}

			// Create a computed observable to watch for the form loaded state
			ko.computed(() => {
				if (control.topLevelForm.isFormLoaded() === true) {
					const panelMainDiv = $("[controlid=" + control.id + "]");
					if (panelMainDiv.length === 0) return;

					const panelContainerDiv = panelMainDiv.find(" > div > .skcw");
					if (panelContainerDiv.length === 0) return;

					panelContainerDiv.css("border", "0px");
					panelContainerDiv.find("> .skcb").removeAttr("data-sknoc");

					const splitterElement = $("div[controlid=" + control.id + "] .skcb.skflx").slice(0, 1);
					if (splitterElement.length > 0) {
						splitterElement.kendoSplitter(config);
					}
				}
			});
		}
		/**
		 * Collapses the specified panel of the splitter control.
		 *
		 * @param {object} control - The control containing the splitter.
		 * @param {string} [panelNum="last"] - The panel number to collapse. Defaults to "last".
		 * @param {boolean} [fromParent=false] - Whether to collapse from the parent.
		 */
		function splitterCollapse(control, panelNum = "last", fromParent = false) {
			const panstring = ".k-pane:" + panelNum;
			const panelMainDiv = $("[controlid=" + control.id + "]");
			const panelContainerDiv = panelMainDiv.find(" > div > .skcw");
			panelContainerDiv.css("border", "0px");
			const panelDiv = panelContainerDiv.find("> .skcb");
			panelDiv.removeAttr("data-sknoc");
			const splitter = $("div[controlid=" + control.id + "] .skcb.skflx")
				.slice(0, 1)
				.data("kendoSplitter");
			splitter.collapse(panstring);
		}

		/**
		 * Expands the specified panel of the splitter control.
		 *
		 * @param {object} control - The control containing the splitter.
		 * @param {string} [panelNum="last"] - The panel number to expand. Defaults to "last".
		 * @param {boolean} [fromParent=false] - Whether to expand from the parent.
		 */
		function splitterExpand(control, panelNum = "last", fromParent = false) {
			const panstring = ".k-pane:" + panelNum;
			const panelMainDiv = $("[controlid=" + control.id + "]");
			const panelContainerDiv = panelMainDiv.find(" > div > .skcw");
			panelContainerDiv.css("border", "0px");
			const panelDiv = panelContainerDiv.find("> .skcb");
			panelDiv.removeAttr("data-sknoc");
			const splitter = $("div[controlid=" + control.id + "] .skcb.skflx")
				.slice(0, 1)
				.data("kendoSplitter");
			splitter.expand(panstring);
		}

		/**
		 * Removes the last panel of the splitter control.
		 *
		 * @param {object} control - The control containing the splitter.
		 */
		function SplitterRemove(control) {
			ko.computed(() => {
				// Ensure the form is loaded before performing operations
				// if (control.topLevelForm.isFormLoaded() === true) {
				const _splitter = $("div[controlid=" + control.id + "] .skcb.skflx")
					.slice(0, 1)
					.data("kendoSplitter");
				_splitter.collapse(".k-pane:last");
				// }
			});
		}
		// #endregion splitter functions

		// #region language localization functions
		/**
		 * Loads the lang_id in MES asscoiated with the EC culture. If one is found, it continues by loading the language group definition.
		 */
		function langLoad() {
			// Check if the translation is not loaded yet in the top window.
			if (window.top.FT.Ui.Translation == null) {
				// Load from session storage
				window.top.FT.Ui.Translation = FT.WorkTasks.sessionStorageJsonGet(SS_TRANSLATIONS);

				// Define elapsed time.
				let timeElapsed = 0;

				// Check if there was already translation data in the session storage.
				if (window.top.FT.Ui.Translation != null && window.top.FT.Ui.Translation.TimeLoaded != null) {
					// Get the time when previously loaded.
					const timeLoaded = window.top.FT.Ui.Translation.TimeLoaded;
					// Calculate the elapsed time in minuts.
					timeElapsed = (new Date().getTime() - timeLoaded) / 60000;
				}

				// Get the reload time from system attr
				let parameterCollection = {
					attr_id: 70102,
					grp_id: 101,
				};
				const sysData = FT.WebApi.mesGetSync("api/V3/DirectAccess", "sp_SA_system_attr", parameterCollection, false);
				let translationsReloadTime = SS_TRANSLATIONS_RELOAD_TIME; // Used if nothing is configured.
				if (sysData != null && sysData.length > 0) {
					translationsReloadTime = parseInt(sysData[0].attr_value, 10);
				}

				// If there was nothing in the session storage.
				// Or the language of the previous load does not match the current culture.
				// Or the last time we loaded this was longer than the configured time and the configured time is bigger than zero.
				// If the configured time is set to -1 for example, then it will never be reloaded.
				if (
					!window.top.FT.Ui.Translation ||
					window.top.FT.Ui.Translation.locale !== skelta.userContext.getUserContextFor("culture") ||
					(timeElapsed >= translationsReloadTime && translationsReloadTime >= 0)
				) {
					// (Re)Initialize the translation object.
					window.top.FT.Ui.Translation = {};
					// Get the localelization of the session.
					window.top.FT.Ui.Translation.locale = skelta.userContext.getUserContextFor("culture");

					// Define the language string id (product string id for IETF language tags).
					const stringId = 6253;

					// Get the language definitions from MES.
					parameterCollection = { string_id: stringId, grp_id: 1, string: window.top.FT.Ui.Translation.locale };
					const [data] = FT.WebApi.mesGetSync("api/V3/DirectAccess", "sp_SA_Language", parameterCollection, false);

					// Check if the language is defined in MES
					if (data != null) {
						// Add the language ID to the translation object
						window.top.FT.Ui.Translation.LangId = data.lang_id;
						// Continue by loading the language groups
						langGrpLoad();
					}
				}
			}
		}

		/**
		 * Loads the language group definition. For each group id that is retreived, it loads the respective translations.
		 */
		function langGrpLoad() {
			// Load all the language groups defined in MES
			const parameterCollection = {};
			let data = FT.WebApi.mesGetSync("api/V3/DirectAccess", "sp_SA_Language_Grp", parameterCollection, false);

			// Only get the groups whose ID is bigger than 1000
			const grpIdMin = 1000;
			data = data.filter((row) => row.grp_id >= grpIdMin);

			// Load the translations
			data.forEach((row) => {
				langGrpStringLoad(row.grp_id, row.grp_desc);
			});

			// Store the UTC datetime of when the translations were loaded
			window.top.FT.Ui.Translation.TimeLoaded = new Date().getTime();
			// Save the translations in the session storage
			FT.WorkTasks.sessionStorageJsonSet(SS_TRANSLATIONS, window.top.FT.Ui.Translation);
		}

		/**
		 * Loads the translations defined for the given group.
		 *
		 * @param {number} grpId The group identifier. This is the main variable to load the data.
		 * @param {string} grpDesc The group description. This is only used to store the data in the translation object.
		 */
		function langGrpStringLoad(grpId, grpDesc) {
			// Load all the group translations
			const parameterCollection = { lang_id: window.top.FT.Ui.Translation.LangId, grp_id: grpId };
			const data = FT.WebApi.mesGetSync("api/V3/DirectAccess", "sp_SA_Language", parameterCollection, false);

			// Check if the data returned is not empty
			if (data != null && data.length > 0) {
				// Create an object where the context column defines the key of the object for the given string
				const translations = {};
				data.forEach((row) => {
					translations[row.context] = row.string;
				});

				// Save the translation object in memory
				window.top.FT.Ui.Translation[grpDesc] = translations;
			}
		}

		/**
		 * Translates specific data column(s) in a given array.
		 * @param {Array} data The array of data to be translated.
		 * @param {Array} fields Array containing the details to use for translation.
		 * This is an array with an object of structure group, column and keys.
		 * The keys object is in turn defined by type and value, where type is set as "value" or "column".
		 * It must follow the order defined in the MES language table's context column.
		 * Type "column" indicates that another column value from the data array is used for the key.
		 * Type "value" indicates that a fixed value is used as the key.
		 * [Optional] defaultColumn can be used to use the value of a different column in case no translation is found.
		 * [Optional] defaultTemplate can be used to define a function with the defaultColumn or column value as argument. This function
		 * should return a string.
		 * ExAMPLE:
		 * fields = [
		 * 	{ group: "oper|oper_desc", column: "job_desc", keys: [{ type: "value", value: "LineAPallet"}, { type: "column", value: "oper_id" }]},
		 * 	{ group: "oper|oper_desc", column: "job_desc", keys: [{ type: "column", value: "process_id"}, { type: "column", value: "oper_id" }]},
		 * 	{ group: "item|item_desc", column: "item_desc", keys: ["item_id"] },
		 * 	{ group: "item|item_desc", column: "item_desc", keys: ["item_id"], defaultColumn: "item_id" },
		 * 	{ group: "item|item_desc", column: "item_desc", keys: ["item_id"]
		 * 		, defaultColumn: "item_id", defaultTemplate: ((item) => item.toLocaleUpperCase()) }
		 * ];
		 * @returns {Array} The translated data.
		 */
		function translateArray(data, fields) {
			// If no data is defined, quit
			if (data == null) {
				return data;
			}

			let dataArray = data;
			// Check if data is not an array
			if (!Array.isArray(data)) {
				// Put data in an array
				dataArray = [data];
			}
			// Process the translations
			const dataProcessed = dataArray.map((row) => {
				let rowTranslated = row;
				// For each field defined for translation.
				fields.forEach((field) => {
					const keyArray = [];
					let keyValue = "";
					// For each ke defied in the field definition.
					field.keys.forEach((key) => {
						// Check if the key is defined by a fixed value.
						if (key.type === "value") {
							// Add the key value directly to the keys array.
							keyArray.push(key.value);
						} else {
							// Otherwise if the key is defined by a column in the data array.
							keyArray.push(row[key.value]);
						}
					});
					// The key values in the MES language table's context column, are concatenated with a "|" separator
					keyValue = keyArray.join("|");

					// Check if a default string should be generated from template of our colum.
					let defaultString;
					if (typeof field.defaultTemplate === "function") {
						// If default template function is defined, call it to create the default string.
						// Send defaultColumn as parameter if defined.
						// Send culumn if not defined.
						defaultString = field.defaultTemplate(rowTranslated[field.defaultColumn || field.column]);
					} else if (typeof field.defaultColumn === "string") {
						// Set the default to the column value of the default column if defined as string.
						defaultString = rowTranslated[field.defaultColumn];
					} else {
						// By default use the current column value.
						defaultString = rowTranslated[field.column];
					}

					// Update the column to translate with thte respective group+key translation
					rowTranslated = {
						...rowTranslated,
						[field.column]: translateValue(field.group, keyValue, defaultString),
					};
				});
				return rowTranslated;
			});
			return dataProcessed;
		}

		/**
		 * Returns the translation for a given group and key.
		 *
		 * @param {string} group The group identifier, defined in MES language_grp table.
		 * @param {string} key The key identifier, defined in MES language table's context column, for the given group.
		 * @param {string} defaultString Default value of the string, in case no translation is found.
		 * @returns {string} Translated string. In case of no translated value defined, returns the default string.
		 */
		function translateValue(group, key, defaultString) {
			// Check if the group is defined in the translation list
			if (window.top.FT.Ui.Translation[group] != null) {
				// Return the value with matching key or the key if not exists
				return window.top.FT.Ui.Translation[group][key] || defaultString;
			}
			// Return the keu as the default value
			return defaultString;
		}

		/**
		 * Returns a translation field object.
		 *
		 * @param {string} column Column to be translated
		 * @param {string} group Group identifier.
		 * @param {Array} keys Array of keys.
		 * @param {string} defaultColumn [Optional] Data column to take default string from.
		 * @param {Function} defaultTemplate [Optional] Manipulate template of default value.
		 * 	Input parameter is either defaultColumn value of the row if defined or column value of the row by default.
		 * 	Returns a string to be shown by default.
		 * @returns {Object} Translation field.
		 */
		function translationField(column, group, keys, defaultColumn, defaultTemplate) {
			// Create a new field object
			const field = { group: group, column: column, keys: keys };

			// Check if a default column is defined
			if (defaultColumn != null) {
				field.defaultColumn = defaultColumn;
			}

			// Check if a default template is defined
			if (defaultTemplate != null) {
				field.defaultTemplate = defaultTemplate;
			}
			// return the field object
			return field;
		}

		/**
		 * Returns a field object with column type keys.
		 *
		 * @param {string} column Column to be translated.
		 * @param {string} group Group identifier.
		 * @param {Array} keys Array of the translation keys.
		 * @param {string} defaultColumn [Optional] Data column to take default string from.
		 * @param {Function} defaultTemplate [Optional] Manipulate template of default value.
		 * 	Input parameter is either defaultColumn value of the row if defined or column value of the row by default.
		 * 	Returns a string to be shown by default.
		 * @returns {Object} Translation field.
		 */
		function translationColumnField(column, group, keys, defaultColumn, defaultTemplate) {
			// Create field object.
			const field = { group: group, column: column, keys: [] };

			// Add the keys to the field.
			keys.forEach((key) => {
				field.keys.push({ type: "column", value: key });
			});

			// Check if a default column is defined
			if (defaultColumn != null) {
				field.defaultColumn = defaultColumn;
			}

			// Check if a default template is defined
			if (defaultTemplate != null) {
				field.defaultTemplate = defaultTemplate;
			}

			// Return the field object.
			return field;
		}

		/**
		 * Returns a field object with value type keys.
		 *
		 * @param {string} column Column to be translated.
		 * @param {string} group Group identifier.
		 * @param {Array} values Array of key values.
		 * @param {string} defaultColumn [Optional] Data column to take default string from.
		 * @param {Function} defaultTemplate [Optional] Manipulate template of default value.
		 * 	Input parameter is either defaultColumn value of the row if defined or column value of the row by default.
		 * 	Returns a string to be shown by default.
		 * @returns {Object} Translation field.
		 */
		function translationValueField(column, group, values, defaultColumn, defaultTemplate) {
			// Create field object.
			const field = { group: group, column: column, keys: [] };

			// Add the values to the keys array.
			values.forEach((value) => {
				field.keys.push({ type: "value", value: value });
			});

			// Check if a default column is defined
			if (defaultColumn != null) {
				field.defaultColumn = defaultColumn;
			}

			// Check if a default template is defined
			if (defaultTemplate != null) {
				field.defaultTemplate = defaultTemplate;
			}

			// Return the field object.
			return field;
		}

		/**
		 * Returns a read-only object conataining the list of default translation field groups.
		 *
		 * @returns {object} Frozen object with al available field groups or default group identifier.
		 */
		function translationGroups() {
			const groups = {
				grpAttrAttrDesc: GRP_ATTR_ATTR_DESC,
				grpAttrSetPossibleValue: GRP_ATTR_SET_POSSIBLE_VALUE,
				grpBomItemInstruction: GRP_BOM_ITEM_INSTRUCTION,
				grpBomItemSubstInstruction: GRP_BOM_ITEM_SUBST_INSTRUCTION,
				grpBomVerVerComments: GRP_BOM_VER_VER_COMMENTS,
				grpCategoryCategoryDesc: GRP_CATEGORY_CATEGORY_DESC,
				grpCauseCauseDesc: GRP_CAUSE_CAUSE_DESC,
				grpCauseGrpCauseGrpDesc: GRP_CAUSE_GRP_CAUSE_GRP_DESC,
				grpCertTypeSignoffNotes: GRP_CERT_TYPE_SIGNOFF_NOTES,
				grpCharacteristicCharDesc: GRP_CHARACTERISTIC_CHAR_DESC,
				grpCorrActionActionDesc: GRP_CORR_ACTION_ACTION_DESC,
				grpEntDescription: GRP_ENT_DESCRIPTION,
				grpFileTypeFileDesc: GRP_FILE_TYPE_FILE_DESC,
				grpItemItemDesc: GRP_ITEM_ITEM_DESC,
				grpItemClassItemClassDesc: GRP_ITEM_CLASS_ITEM_CLASS_DESC,
				grpItemGradeItemGradeDesc: GRP_ITEM_GRADE_ITEM_GRADE_DESC,
				grpItemReasReasDesc: GRP_ITEM_REAS_REAS_DESC,
				grpItemReasGrpReasGrpDesc: GRP_ITEM_REAS_GRP_REAS_GRP_DESC,
				grpItemStateItemStatusDesc: GRP_ITEM_STATE_ITEM_STATUS_DESC,
				grpItemSubstInstruction: GRP_ITEM_SUBST_INSTRUCTION,
				grpJobStateStateDesc: GRP_JOB_STATE_STATE_DESC,
				grpKpiKpiDesc: GRP_KPI_KPI_DESC,
				grpKpiStateStateDesc: GRP_KPI_STATE_STATE_DESC,
				grpOperOperDesc: GRP_OPER_OPER_DESC,
				grpOperStepStepDesc: GRP_OPER_STEP_STEP_DESC,
				grpOperStepChoiceChoiceLabel: GRP_OPER_STEP_CHOICE_CHOICE_LABEL,
				grpOperStepGrpStepGrpDesc: GRP_OPER_STEP_GRP_STEP_GRP_DESC,
				grpProcessProcessDesc: GRP_PROCESS_PROCESS_DESC,
				grpQmSpecQmSpecDesc: GRP_QM_SPEC_QM_SPEC_DESC,
				grpSampleSampleResult: GRP_SAMPLE_SAMPLE_RESULT,
				grpSampleSampleStatus: GRP_SAMPLE_SAMPLE_STATUS,
				grpSampleFreqFreqDesc: GRP_SAMPLE_FREQ_FREQ_DESC,
				grpSamplePlanPlanDesc: GRP_SAMPLE_PLAN_PLAN_DESC,
				grpShiftShiftDesc: GRP_SHIFT_SHIFT_DESC,
				grpShiftPatternPatternName: GRP_SHIFT_PATTERN_PATTERN_NAME,
				grpSpcRuleRuleDesc: GRP_SPC_RULE_RULE_DESC,
				grpSpecSpecDesc: GRP_SPEC_SPEC_DESC,
				grpSublotLevelDescLvlDesc: GRP_SUBLOT_LEVEL_DESC_LVL_DESC,
				grpUomDescription: GRP_UOM_DESCRIPTION,
				grpUtilReasReasDesc: GRP_UTIL_REAS_REAS_DESC,
				grpUtilReasCategorySetPossibleValue: GRP_UTIL_REAS_CATEGORY_SET_POSSIBLE_VALUE,
				grpUtilReasGrpReasGrpDesc: GRP_UTIL_REAS_GRP_REAS_GRP_DESC,
				grpUtilStateStateDesc: GRP_UTIL_STATE_STATE_DESC,
				grpWoWoDesc: GRP_WO_WO_DESC,
				grpAmAndonTypeTypeDesc: GRP_AM_ANDON_TYPE_TYPE_DESC,
				grpAmAndonStateStateDesc: GRP_AM_ANDON_STATE_STATE_DESC,
				grpAmAndonIssueIssueDesc: GRP_AM_ANDON_ISSUE_ISSUE_DESC,
			};

			// Freeze the object to make it readonly
			Object.freeze(groups);

			return groups;
		}

		/**
		 * Returns a readonly object of the default keys of each table.
		 *
		 * @returns {Object} Frozen object containing all translation keys for every table.
		 */
		function translationKeys() {
			const keys = {
				keyAttr: KEY_ATTR.split("|"),
				keyAttrSet: KEY_ATTR_SET.split("|"),
				keyBomItem: KEY_BOM_ITEM.split("|"),
				keyBomItemSubst: KEY_BOM_ITEM_SUBST.split("|"),
				keyBomVer: KEY_BOM_VER.split("|"),
				keyCategory: KEY_CATEGORY.split("|"),
				keyCause: KEY_CAUSE.split("|"),
				keyCauseGrp: KEY_CAUSE_GRP.split("|"),
				keyCertType: KEY_CERT_TYPE.split("|"),
				keyCharacteristic: KEY_CHARACTERISTIC.split("|"),
				keyCorrAction: KEY_CORR_ACTION.split("|"),
				keyEnt: KEY_ENT.split("|"),
				keyFileType: KEY_FILE_TYPE.split("|"),
				keyItem: KEY_ITEM.split("|"),
				keyItemClass: KEY_ITEM_CLASS.split("|"),
				keyItemGrade: KEY_ITEM_GRADE.split("|"),
				keyItemReas: KEY_ITEM_REAS.split("|"),
				keyItemReasGrp: KEY_ITEM_REAS_GRP.split("|"),
				keyItemState: KEY_ITEM_STATE.split("|"),
				keyItemSubst: KEY_ITEM_SUBST.split("|"),
				keyJobState: KEY_JOB_STATE.split("|"),
				keyKpi: KEY_KPI.split("|"),
				keyKpiState: KEY_KPI_STATE.split("|"),
				keyOper: KEY_OPER.split("|"),
				keyOperStep: KEY_OPER_STEP.split("|"),
				keyOperStepChoice: KEY_OPER_STEP_CHOICE.split("|"),
				keyOperStepGrp: KEY_OPER_STEP_GRP.split("|"),
				keyProcess: KEY_PROCESS.split("|"),
				keyQmSpec: KEY_QM_SPEC.split("|"),
				keySampleFreq: KEY_SAMPLE_FREQ.split("|"),
				keySamplePlan: KEY_SAMPLE_PLAN.split("|"),
				keySampleResult: KEY_SAMPLE_RESULT.split("|"),
				keySampleStatus: KEY_SAMPLE_STATUS.split("|"),
				keyShift: KEY_SHIFT.split("|"),
				keyShiftPattern: KEY_SHIFT_PATTERN.split("|"),
				keySpcRule: KEY_SPC_RULE.split("|"),
				keySpec: KEY_SPEC.split("|"),
				keySublotLevelDesc: KEY_SUBLOT_LEVEL_DESC.split("|"),
				keyUom: KEY_UOM.split("|"),
				keyUtilReas: KEY_UTIL_REAS.split("|"),
				keyUtilReasCategorySet: KEY_UTIL_REAS_CATEGORY_SET.split("|"),
				keyUtilReasGrp: KEY_UTIL_REAS_GRP.split("|"),
				keyUtilState: KEY_UTIL_STATE.split("|"),
				keyWo: KEY_WO.split("|"),
				keyAmAndonType: KEY_AM_ANDON_TYPE.split("|"),
				keyAmAndonState: KEY_AM_ANDON_STATE.split("|"),
				keyAmAndonIssue: KEY_AM_ANDON_ISSUE.split("|"),
			};

			// Freeze the keys to make it read only
			Object.freeze(keys);

			return keys;
		}
		// #endregion language localization functions
		// #region return
		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			TRANSLATION_GROUPS: translationGroups(),
			TRANSLATION_KEYS: translationKeys(),
			initialize: initialize,
			splitterAdd: splitterAdd,
			splitterCollapse: splitterCollapse,
			splitterExpand: splitterExpand,
			SplitterRemove: SplitterRemove,
			translateArray: translateArray,
			translateValue: translateValue,
			translationField: translationField,
			translationColumnField: translationColumnField,
			translationValueField: translationValueField,
		};
		// #endregion return
	}

	// We need that our library is globally accessible, then we save in the window
})(window);
