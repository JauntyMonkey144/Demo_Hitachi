/*
Name:					FT_UI_ConfigParam.js
Description:	The FT_UI_ConfigParam.js js file containing logic pertaining to the FT_UI_ConfigParam Form.

Ver		Release		By						Date				Change Description
001		01.02.00	Fayaz A				2025-06-16	#5075 First version of the file.
002		01.03.00	BB						2025-09-16	#5149	Updated form to use the kendo grid model. Improved to best practices.
																					Added config param set editor. Added tooltip to add buttons.
003		01.03.00	BB						2025-09-19	#5175 Use common jsonParse for JSON validation.
004		01.03.00	BB						2025-09-26	#5149	Added input param validation. Check if parameter is not output.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.FT = window.FT || {};
	FT.ConfigParam = FT.ConfigParam || {};
	FT.ConfigParam = Config();
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
		let _paramId;
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
			_controls.wwToolbar = FORM.Control.findByXmlNode("WWT");
			_controls.wwConfigParam = FORM.Control.findByXmlNode("WWCP");
			_controls.wwConfigParamSet = FORM.Control.findByXmlNode("WWCPS");

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

			// Load the grid models
			wwConfigParamModel();
			wwConfigParamSetModel();

			// Load the config groups
			ddConfigGroupOptions();

			// Load the toolbar buttons
			wwToolbarModel();
		}
		// #endregion
		// #region DD Config Group
		/**
		 * Loads the config groups into the config groups dropdown
		 */
		function ddConfigGroupOptions() {
			const parameterCollection = {};
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_FT_Config_Grp", parameterCollection, false).then(
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
		 * Reload the config param grid data on group selection change.
		 *
		 * @param {string} currentValue The currently selected value in the group dropdown.
		 */
		function ddConfigGroupOnDataChange(currentValue) {
			_groupId = currentValue;

			// Update the config param data with the new group
			wwConfigParamData();
		}
		// #endregion

		// #region WW Toolbar
		/**
		 * Loads the toolbar button definition(s)
		 */
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
						icon: "action--create-list.svg",
						command: "addSet",
						tooltip: skelta.localize.getString("@@FT_AddSetValue@@"),
					},
				],
			};

			// Assign the model to the toolbar
			_controls.wwToolbar.widgetProperties.model = JSON.stringify(model);

			// Disable the add set button
			_controls.wwToolbar.widgetProperties.buttonsDisable = "addSet";
		}

		/**
		 * Executes the clicked command
		 *
		 * @param {string} command clicked command
		 */
		function wwToolbarOnClick(command) {
			// Check which command is clicked
			switch (command) {
				case "add":
					// Trigger config param grid to add a new row
					_controls.wwConfigParam.widgetProperties.addRow = "True";
					break;
				case "addSet":
					// Add a new row to the param set table
					_controls.wwConfigParamSet.widgetProperties.addRow = "True";
					break;
				default:
					break;
			}
		}
		// #endregion

		// #region WW Config Param
		/**
		 * Creates and assigned the model of the config param grid
		 */
		function wwConfigParamModel() {
			// Create the grid model
			const model = {
				id: "param_id",
				editable: ["edit", "destroy"],
				persistSelection: true,
				fields: [
					{
						field: "param_id",
						type: "number",
						title: skelta.localize.getString("@@FT_ParamId@@"),
						validation: { required: true, unique: true, min: 1 },
						format: "{0:n0}",
						// Only editable when adding new config param
						editableCondition: (dataItem) => dataItem.param_id == null || dataItem.param_id === 0,
					},
					{
						field: "param_name",
						type: "string",
						title: skelta.localize.getString("@@FT_ParamName@@"),
						validation: { required: true },
					},
					{
						field: "param_order",
						type: "number",
						title: skelta.localize.getString("@@FT_DisplayOrder@@"),
						format: "{0:n0}",
						validation: { required: true, unique: true },
					},
					{
						field: "json_column",
						type: "string",
						title: skelta.localize.getString("@@FT_JSONConfiguration@@"),
						validation: {
							isJson: (element) => {
								// Only test if the element is the json_column column
								if (element.is("[name='json_column']")) {
									// Set the error message attribtue
									element.attr("data-isJson-msg", skelta.localize.getString("@@FT_NoValidJson@@"));
									// Get the value
									const value = element.val();

									// Not a rquiered field
									if (value == null || value === "") {
										return true;
									}

									// Verify whether the value can successfully be parsed.
									return FT.Common.jsonParse(value) != null;
								}
								// Test passed
								return true;
							},
						},
					},
					{
						field: "set_function",
						type: "string",
						title: skelta.localize.getString("@@FT_SetFunction@@"),
						validation: {
							validStoredProcedure: (element) => {
								// Only test if the element is the set_function column
								if (element.is("[name='set_function']")) {
									// Set the error message attribtue
									element.attr("data-validStoredProcedure-msg", skelta.localize.getString("@@FT_NoValidSetSp@@"));

									// Get the value
									const value = element.val();

									// If the value is empty, test is passed. Field is not required
									if (value == null || value === "") {
										return true;
									}

									// Check if the stored procedure is filter stored procedure
									if (value.indexOf("sp_SA") !== 0) {
										// Test failed
										return false;
									}

									// Verify if the SP exists in MESDB and has the correct parameters
									try {
										const parameters = {
											sp_name: value,
										};

										// Verify input parameters
										let data = FT.WebApi.mesGetSync(
											"api/V3/DirectAccess",
											"sp_SA_FT_StoredProcedureParamInfo",
											parameters,
											false,
										);

										// Check if data is returned
										if (data != null && data.length === 1) {
											// check if input parameter is called field
											if (data[0].param_name === "field" && !data[0].is_output) {
												// Check returned values
												data = FT.WebApi.mesGetSync("api/V3/DirectAccess", value, { field: "test" }, false);

												// check data is returned
												if (data != null && data.length > 0) {
													// Verify properties
													if (
														Object.prototype.hasOwnProperty.call(data[0], "field") &&
														Object.prototype.hasOwnProperty.call(data[0], "value") &&
														Object.prototype.hasOwnProperty.call(data[0], "display_value")
													) {
														// SP is valid.
														return true;
													}
												}
											}
										}
										// SP is invalid
										return false;
									} catch (error) {
										return false;
									}
								}
								return true;
							},
						},
					},
				],
			};

			// Assign the grid model to the grid
			_controls.wwConfigParam.widgetProperties.model = model;
		}

		/**
		 * Loads the config parameters for the selected group id
		 */
		function wwConfigParamData() {
			const parameters = {
				grp_id: _groupId,
			};

			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_FT_Config_Param", parameters, false).then(
				(data) => {
					_controls.wwConfigParam.widgetProperties.data = JSON.stringify(data);
				},
				(error) => {
					// Handle error
					handleScriptError(error);
				},
			);
		}

		/**
		 * Event when data is bound to the assigned lot databound grid.
		 * Removes delete buttons if has values is set to true.
		 *
		 * @param {Object} event databound event
		 */
		function wwConfigParamOnDataBound(event) {
			// Get the grid from the event.sender
			const grid = event.sender;

			// iterate through each row
			grid.tbody.find("tr[role='row']").each((index, row) => {
				// Get the viewmodel behind the row
				const dataItem = grid.dataItem(row);

				// Verify if the group has values attached
				if (dataItem.has_value) {
					// Remove the delete button
					$(row).find(".k-grid-delete").remove();
				}
			});
		}

		/**
		 * Event when the user selects a row in the parameter grid.
		 * Triggers the parameter set grid to load and show if it has values.
		 *
		 * @param {Object} row Selected row
		 */
		function wwConfigParamOnRowSelection(row) {
			// Check if a row is selected
			if (row != null && row.length > 0) {
				// Update the selected parameter
				_paramId = row[0].param_id;
				// Load the parameter set
				wwConfigParamSetData();
				// Enable the add set button
				_controls.wwToolbar.widgetProperties.buttonsEnable = "addSet";
			} else {
				// Disable the add set button
				_controls.wwToolbar.widgetProperties.buttonsDisable = "addSet";
			}
		}

		/**
		 * Updates MESDB with the saved row. (Updates existing, creates new)
		 *
		 * @param {Object} row Saved row
		 */
		function wwConfigParamOnUpdate(row) {
			// Define the stored procedure parameters
			const parameters = {
				grp_id: _groupId,
				param_id: row.param_id,
				param_name: row.param_name,
				param_order: row.param_order,
				json_column: row.json_column,
				set_function: row.set_function,
			};

			// Execture update procedure
			FT.WebApi.mesPost("api/V3/DirectAccess", "sp_U_FT_Config_Param", parameters, false).then(
				() => {
					// Reload the configuration parameter data
					wwConfigParamData();
				},
				(error) => {
					// Handle error
					handleScriptError(error);
				},
			);
		}

		/**
		 * Deletes parameter in MESDB.
		 *
		 * @param {Object} row Deleted row
		 */
		function wwConfigParamOnDelete(row) {
			// Additional safety check
			if (!row.has_value) {
				// Define the stored procedure parameters
				const parameters = {
					grp_id: _groupId,
					param_id: row.param_id,
				};

				// Execute delete procedure
				FT.WebApi.mesPost("api/V3/DirectAccess", "sp_D_FT_Config_Param", parameters, false).then(
					() => {
						// Reload the configuration parameter data
						wwConfigParamData();
					},
					(error) => {
						// Handle error
						handleScriptError(error);
					},
				);
			}
		}
		// #endregion

		// #region WW Config Param Set
		function wwConfigParamSetModel() {
			// Create the model
			const model = {
				id: "set_param_index",
				editable: ["edit", "destroy"],
				fields: [
					{
						field: "set_param",
						type: "string",
						title: skelta.localize.getString("@@FT_Value@@"),
						// Only editable when not in use
						editableCondition: (dataItem) => !dataItem.is_used,
						validation: { required: true, unique: true },
					},
					{
						field: "set_param_display",
						type: "string",
						title: skelta.localize.getString("@@FT_DisplayText@@"),
						validation: { required: true, unique: true },
					},
				],
			};

			// Assign the model to the grid
			_controls.wwConfigParamSet.widgetProperties.model = model;
		}

		/**
		 * Loads the config parameter set data for the selected parameter
		 */
		function wwConfigParamSetData() {
			const parameters = {
				grp_id: _groupId,
				param_id: _paramId,
			};

			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_FT_Config_Param_Set", parameters, false).then(
				(data) => {
					_controls.wwConfigParamSet.widgetProperties.data = JSON.stringify(data);
				},
				(error) => {
					// Handle error
					handleScriptError(error);
				},
			);
		}

		/**
		 * Event when data is bound to the assigned lot databound grid.
		 * Removes delete buttons if is used is set to true.
		 *
		 * @param {Object} event databound event
		 */
		function wwConfigParamSetOnDataBound(event) {
			// Get the grid from the event.sender
			const grid = event.sender;

			// iterate through each row
			grid.tbody.find("tr[role='row']").each((index, row) => {
				// Get the viewmodel behind the row
				const dataItem = grid.dataItem(row);

				// If the row is not marked for editing
				if (!dataItem.can_edit) {
					// Remove the edit button
					$(row).find(".k-grid-edit").remove();
				}

				// Verify if parameter set value is used or not marked for editing
				if (dataItem.is_used || !dataItem.can_edit) {
					// Remove the delete button
					$(row).find(".k-grid-delete").remove();
				}
			});
		}

		/**
		 * Updates MESDB with the saved row. (Updates existing, creates new)
		 *
		 * @param {Object} row Saved row
		 */
		function wwConfigParamSetOnUpdate(row) {
			// Define the stored procedure parameters
			const parameters = {
				grp_id: _groupId,
				param_id: _paramId,
				set_param_index: row.set_param_index,
				set_param: row.set_param,
				set_param_display: row.set_param_display,
			};

			// Execture update procedure
			FT.WebApi.mesPost("api/V3/DirectAccess", "sp_U_FT_Config_Param_Set", parameters, false).then(
				() => {
					// Reload the configuration parameter and parameter set data
					wwConfigParamData();
					wwConfigParamSetData();
				},
				(error) => {
					// Handle error
					handleScriptError(error);
				},
			);
		}

		/**
		 * Deletes parameter set value in MESDB.
		 *
		 * @param {Object} row Deleted row
		 */
		function wwConfigParamSetOnDelete(row) {
			// Additional safety check
			if (row != null && !row.is_used) {
				// Define the stored procedure parameters
				const parameters = {
					grp_id: _groupId,
					param_id: _paramId,
					set_param_index: row.set_param_index,
				};

				// Execute delete procedure
				FT.WebApi.mesPost("api/V3/DirectAccess", "sp_D_FT_Config_Param_Set", parameters, false).then(
					() => {
						// Reload the configuration parameter set data
						wwConfigParamSetData();
					},
					(error) => {
						// Handle error
						handleScriptError(error);
					},
				);
			}
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
			SFU.showError(skelta.localize.getString("FormNGFErrorRunningScript_title"), errorMessage, null, error.message);

			throw errorMessage;
		}
		// #endregion

		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			ddConfigGroupOnDataChange: ddConfigGroupOnDataChange,
			wwConfigParamOnDataBound: wwConfigParamOnDataBound,
			wwConfigParamOnRowSelection: wwConfigParamOnRowSelection,
			wwConfigParamOnUpdate: wwConfigParamOnUpdate,
			wwConfigParamOnDelete: wwConfigParamOnDelete,
			wwConfigParamSetOnDataBound: wwConfigParamSetOnDataBound,
			wwConfigParamSetOnUpdate: wwConfigParamSetOnUpdate,
			wwConfigParamSetOnDelete: wwConfigParamSetOnDelete,
			wwToolbarOnClick: wwToolbarOnClick,
		};
	}
})(window);
