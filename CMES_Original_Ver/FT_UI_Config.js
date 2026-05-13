/*
Name:					FT_UI_Config.js
Description:	The FT_UI_Config.js js file containing logic pertaining to the FT_UI_Config Form.

Ver		Release		By						Date				Change Description
001		00.50			Krishna M			2024-07-05	#2993 First version of the file.
002		00.50			Krishna M			2024-07-05	#3299 FT - Form - FT_UI_Config requires corrections.
003		00.70			J. Caldeira		2024-10-21	#3727 Updated form to receive configuration from the database and with it
																					update the grid configuration.
004		00.70			J. Caldeira		2024-11-20	#3948 Added status_cd column to selected row when saving changes. This is currently
																					only handled as a bit (checkbox) type column.
005		00.70.01	Chitta				2025-01-20	#4183 action field multi select dropdown values must come from DB.
006		01.00.00	Fayaz A				2025-03-27	#4653 Updated ddConfigGroupLoad function to select the firt item by default.
007		01.02.00	Fayaz A				2025-06-16	#5075 Updated wwConfigUpdate to accept params from param21 to param25.
008		01.03.00	BB						2025-09-16	#5149 Updated screen to use the grid model. Now infinite parameters are supported.
																					Added tooltips to toolbar. Added confirmation message after
																					JSON import.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.FT = window.FT || {};
	FT.Config = FT.Config || {};
	FT.Config = Config();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function Config() {
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		// ----------------------------------------------------------------------------------

		// ----------------------------- Private Variables ----------------------------------
		const _controls = {};
		FORM.Control = null;
		let _groupId;
		let _category;
		let _confData;
		// ----------------------------------------------------------------------------------
		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			// Initialize variables
			FORM.Control = Control;
			_controls.ddConfigGroup = FORM.Control.findByXmlNode("DDCG");
			_controls.ddCategory = FORM.Control.findByXmlNode("DDC");
			_controls.wwToolbar = FORM.Control.findByXmlNode("WWT");
			_controls.wwConfig = FORM.Control.findByXmlNode("WWC");

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

		// #region onFormLoad
		/**
		 * Form load function to bind cards with respect to entity from form parameters or if session variable EntID
		 */
		function onFormLoad() {
			// Inititalize context
			FT.WorkTasks.contextInit();

			// Initialize the toolbar model
			wwToolbarModel();
			// Initialize the config groups dropdown
			ddConfigGroupOptions();
		}
		// #endregion
		// #region DD Config Group
		/**
		 * loads groups
		 * @returns {string} Returns ent_id and name
		 */
		function ddConfigGroupOptions() {
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_FT_Config_Grp", {}, false).then(
				(data) => {
					FT.WorkTasks.controlOptionsSetFromDataset(
						_controls.ddConfigGroup.xmlNodeBoundTo,
						0,
						data,
						"grp_desc",
						"grp_id",
						null,
						0,
					);
				},
				(error) => {
					// Handle error
					handleScriptError(error);
				},
			);
		}

		/**
		 * Reload the data on group selection change.
		 *
		 * @param {string} currentValue The currently selected value in the group dropdown.
		 */
		function ddConfigGroupOnDataChange(currentValue) {
			// Store the selected group globally
			_groupId = currentValue;
			// Clear the selected category
			_category = "";
			// Update the grid model
			wwConfigModel();
			// Update the grid data
			wwConfigData();
		}
		// #endregion

		// #region DD Category
		/**
		 * Reload the data on category selection change.
		 *
		 * @param {string} currentValue The currently selected value in the category dropdown.
		 */
		function ddCategoryOnDataChange(currentValue) {
			// Update the category
			_category = currentValue;
			// Check if a filter is selected
			if (_category != null && _category !== "") {
				// Filter the data on category
				const data = _confData.filter((conf) => conf.category === _category);
				// Update the grid data with filtered values
				_controls.wwConfig.widgetProperties.data = JSON.stringify(data);
			} else {
				// Show all data in the grid
				_controls.wwConfig.widgetProperties.data = JSON.stringify(_confData);
			}
		}
		// #endregion

		// #region WW Config
		/**
		 * Loads the model of the configuration grid.
		 */
		function wwConfigModel() {
			// Only load if a group id is selected
			if (_groupId != null && _groupId !== "") {
				// Get the configuration id from the selected option
				const parameters = {
					grp_id: _groupId,
				};

				// Get the grid model from the MESDB
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_S_FT_Config_Param_GridModel", parameters, false).then(
					(data) => {
						if (data != null && data.length > 0) {
							// Update the grid model with the retreived value
							_controls.wwConfig.widgetProperties.model = data[0].json_model;
						}
					},
					(error) => {
						// Handle error
						handleScriptError(error);
					},
				);
			}
		}

		/**
		 * Loads the data of the configuration grid.
		 */
		function wwConfigData() {
			const parameters = {
				grp_id: _groupId,
			};

			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_FT_Config_ByJson", parameters, false).then(
				(data) => {
					// Store the data array locally
					_confData = data;

					// Reset the categories
					const categories = [{ cat_id: "", cat_desc: skelta.localize.getString("@@FT_All@@") }];
					// Check if data is received
					if (data != null && data.length > 0) {
						_confData.forEach((conf) => {
							// Check if the category is not alread added
							if (categories.filter((cat) => cat.cat_id === conf.category).length <= 0) {
								// Add the category to the array
								categories.push({ cat_id: conf.category, cat_desc: conf.category });
							}
						});
					}

					// Update the category dropdown
					FT.WorkTasks.controlOptionsSetFromDataset(
						_controls.ddCategory.xmlNodeBoundTo,
						0,
						categories,
						"cat_desc",
						"cat_id",
						null,
						0,
					);

					// Load the data into the grid
					_controls.wwConfig.widgetProperties.data = JSON.stringify(_confData);
				},
				(error) => {
					// Handle error
					handleScriptError(error);
				},
			);
		}

		/**
		 * Updates configuration in MESDB
		 *
		 * @param {object} row Saved row in kendo grid
		 */
		function wwConfigUpdate(row) {
			// Check if the group id is defined, if not set it to the selected config group in the dropdown
			if (row.grp_id == null || row.grp_id === "") {
				row.grp_id = _controls.ddConfigGroup.value;
			}
			// Pass the row as JSON string to the update sp
			const parameters = {
				json_row: JSON.stringify(row),
			};

			// Update the config header and values
			FT.WebApi.mesPost("api/V3/DirectAccess", "sp_U_FT_Config_ByJson", parameters, false).then(
				() => {
					// Reload the configuration data
					wwConfigData();
				},
				(error) => {
					// Throw error
					handleScriptError(error);
				},
			);
		}

		/**
		 * Delete configuration in MESDB
		 *
		 * @param {object} row Deleted row in kendo grid
		 */
		function wwConfigDelete(row) {
			// Check if the row is defined
			if (row != null) {
				// Get the group id and the config id from the deleted row
				const parameters = {
					grp_id: row.grp_id,
					cfg_id: row.cfg_id,
				};

				// Delete the row in MES
				FT.WebApi.mesPost("api/V3/DirectAccess", "sp_D_FT_Config_Header", parameters, false).then(
					() => {
						// Reload the configuration data to sync with the stored values
						wwConfigData();
					},
					(error) => {
						// throw error
						handleScriptError(error);
					},
				);
			}
		}
		// #endregion

		// #region WW toolbar
		function wwToolbarModel() {
			// Create the model
			const model = {
				align: "right",
				buttons: [
					{
						icon: "action--create.svg",
						command: "add",
						tooltip: skelta.localize.getString("@@FT_Add@@"),
					},
					{
						icon: "application--microsoft-excel.svg",
						command: "exportExcel",
						tooltip: skelta.localize.getString("@@FT_ExportExcel@@"),
					},
					{
						icon: "data--database-export.svg",
						command: "exportJson",
						tooltip: skelta.localize.getString("@@FT_ExportJson@@"),
					},
					{
						icon: "data--database-import.svg",
						command: "importJson",
						tooltip: skelta.localize.getString("@@FT_ImportJson@@"),
					},
				],
			};

			// Assign the model to the toolbar
			_controls.wwToolbar.widgetProperties.model = JSON.stringify(model);
		}

		/**
		 * Event when a toolbar button is clicked
		 * @param {string} command Clicked command
		 */
		function wwToolbarOnClick(command) {
			switch (command) {
				case "add":
					// Trigger the addrow event
					_controls.wwConfig.widgetProperties.addRow = "True";
					break;
				case "exportExcel":
					// Trigger the grid to export to excel
					_controls.wwConfig.widgetProperties.export = "excel";
					break;
				case "exportJson":
					// Trigger the grid to export to json
					_controls.wwConfig.widgetProperties.export = "json";
					break;
				case "importJson":
					SFU.showConfirmation(
						skelta.localize.getString("@@FT_ConfigImportConfirmHeader@@"),
						skelta.localize.getString("@@FT_ConifgImportConfirmMessage@@"),
						(result) => {
							// Only import if the user confirmed
							if (result) {
								// Execute the import JSON function
								importJson();
							}
						},
					);
					break;
				default:
					break;
			}
		}

		/**
		 * Imports a json file and overwrites the config with the values in the SP
		 */
		function importJson() {
			// Create open file dialogue
			const input = $(document.createElement("input"));
			input.attr("type", "file");
			input.attr("accept", ".json");
			input.trigger("click");
			// Event when user selected a file
			input.on("change", (event) => {
				if (event.currentTarget.files != null && event.currentTarget.files.length > 0) {
					try {
						// Get the file from the event
						const file = event.currentTarget.files[0];

						// Create a file reader
						const reader = new FileReader();

						// Read the json
						reader.readAsText(file);

						// Create reader load event
						reader.onload = () => {
							// Get the json result
							const json = reader.result;

							if (json == null || json === "") {
								handleScriptError({ responseText: skelta.localize.getString("@@FT_JSONFileEmpty@@") });
								return;
							}

							// Parse the json to an object
							const gridDef = JSON.parse(json);

							// Verify if the file contains data
							if (gridDef.data == null || gridDef.data.length === 0) {
								handleScriptError({ responseText: skelta.localize.getString("@@FT_JSONFileNoData@@") });
								return;
							}

							// Verify the json data is for the correct config table
							if (gridDef.data[0].grp_id !== _groupId) {
								handleScriptError({ responseText: skelta.localize.getString("@@FT_JSONFileWrongGroup@@") });
								return;
							}

							// Set the procedure parameter to the json from the file
							const parameters = {
								json: json,
							};

							// Call JSON import stored procedure to import the data
							FT.WebApi.mesPost("api/V3/DirectAccess", "sp_U_FT_Config_ImportJson", parameters, false).then(
								() => {
									// Show confirmation message
									SFU.showAlert(
										skelta.localize.getString("@@FT_ConfigImportSuccessHeader@@"),
										skelta.localize.getString("@@FT_ConfigImportSuccessMessage@@"),
									);
									// Reload the configuration data to sync with the stored values
									wwConfigData();
								},
								(error) => {
									// throw error
									handleScriptError(error);
								},
							);
						};
					} catch (error) {
						handleScriptError(error);
					}
				}
			});
			// Avoid going to a new page
			return false;
		}
		// #endregion

		// #region handleScriptError
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
			SFU.showError(skelta.localize.getString("FormNGFErrorRunningScript_title"), errorMessage, null, error.responseText);
		}
		// #endregion

		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			ddConfigGroupOnDataChange: ddConfigGroupOnDataChange,
			ddCategoryOnDataChange: ddCategoryOnDataChange,
			wwToolbarOnClick: wwToolbarOnClick,
			wwConfigUpdate: wwConfigUpdate,
			wwConfigDelete: wwConfigDelete,
		};
	}
})(window);
