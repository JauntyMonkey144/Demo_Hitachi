/*
Name:					FT_UI_ConfigGrp.js
Description:	The FT_UI_ConfigGrp.js js file containing logic pertaining to the FT_UI_ConfigGrp Form.

Ver		Release		By						Date				Change Description
001		01.02.00	Fayaz A				2025-06-16	#5080 First version of the file.
002		01.03.00	BB						2025-09-16	#5149 Use new grid model. Updated look and feel. Only show delete button on records that can
																					be deleted. Only enable user to edit the PK when inserting
																					a new group. Added tooltip to add button.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.FT = window.FT || {};
	FT.ConfigGrp = FT.ConfigGrp || {};
	FT.ConfigGrp = ConfigGrp();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function ConfigGrp() {
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
		// ----------------------------------------------------------------------------------
		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			// Initialize variables
			FORM.Control = Control;
			_controls.wwConfigGrp = FORM.Control.findByXmlNode("WWCG");
			_controls.wwToolbar = FORM.Control.findByXmlNode("WWT");

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

			// Load config group model
			wwConfigGrpModel();

			// Load config group data
			wwConfigGrpData();

			// Load the toolbar model
			wwToolbarModel();
		}
		// #endregion

		// #region WW Toolbar
		/**
		 * Creates the toolbar button(s)
		 */
		function wwToolbarModel() {
			// Create the toolbar model
			const model = {
				align: "right",
				buttons: [
					{
						icon: "action--create.svg",
						command: "add",
						tooltip: skelta.localize.getString("@@FT_Add@@"),
					},
				],
			};

			// Assign the model to the toolbar
			_controls.wwToolbar.widgetProperties.model = JSON.stringify(model);
		}

		/**
		 * Event when any of the buttons in the toolbar is clicked
		 *
		 * @param {string} command Command of the clicked button
		 */
		function wwToolbarOnClick(command) {
			// Check witch button is clicked
			switch (command) {
				case "add":
					// Trigger the add row of the config group table
					_controls.wwConfigGrp.widgetProperties.addRow = "True";
					break;

				default:
					break;
			}
		}
		// #endregion

		// #region WW Config Group
		/**
		 * Sets the grid model
		 */
		function wwConfigGrpModel() {
			// Create the model
			const model = {
				id: "grp_id",
				editable: ["edit", "destroy"],
				fields: [
					{
						field: "grp_id",
						type: "string",
						title: skelta.localize.getString("@@FT_ConfigGroupId@@"),
						// Only editable when adding new config group
						editableCondition: (dataItem) => dataItem.grp_id == null || dataItem.grp_id === "",
						validation: {
							required: true,
							unique: true,
						},
					},
					{ field: "grp_desc", type: "string", title: skelta.localize.getString("@@FT_GroupDescription@@") },
				],
			};

			// Set the model of the grid
			_controls.wwConfigGrp.widgetProperties.model = model;
		}

		/**
		 * Loads the data for the config group table.
		 */
		function wwConfigGrpData() {
			const parameterCollection = {
				grp_id: null,
			};

			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_FT_Config_Grp", parameterCollection, false).then(
				(data) => {
					_controls.wwConfigGrp.widgetProperties.data = JSON.stringify(data);
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
		function wwConfigGrpOnDataBound(event) {
			// Get the grid from the event.sender
			const grid = event.sender;

			// iterate through each row
			grid.tbody.find("tr[role='row']").each((index, row) => {
				// Get the viewmodel behind the row
				const dataItem = grid.dataItem(row);

				// Verify if the group has values attached
				if (dataItem.has_values) {
					// Remove the delete button
					$(row).find(".k-grid-delete").remove();
				}
			});
		}

		/**
		 * Event when an added or edited row is saved. Saves the change in the MESDB
		 * @param {Object} row Saved row
		 */
		function wwConfigGrpOnUpdate(row) {
			// Get the parameters from the saved row
			const parameters = {
				grp_id: row.grp_id,
				grp_desc: row.grp_desc,
			};

			// Update the MESDB with the changes.
			FT.WebApi.mesPost("api/V3/DirectAccess", "sp_U_FT_Config_Grp", parameters, false).then(
				() => {
					// Reload the configuration data
					wwConfigGrpData();
				},
				(error) => {
					// Handle error
					handleScriptError(error);
				},
			);
		}

		/**
		 * Deletes the config group in the MESDB
		 *
		 * @param {Object} row deleted row
		 */
		function wwConfigGrpOnDelete(row) {
			// For extra savety, only execute if the row does not have values
			if (!row.has_values) {
				// Create the parameter set
				const parameters = {
					grp_id: row.grp_id,
				};

				// Delete the row in the MESDB
				FT.WebApi.mesPost("api/V3/DirectAccess", "sp_D_FT_Config_Grp", parameters, false).then(
					() => {
						wwConfigGrpData();
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
		 * @param {object} error
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

			throw errorMessage;
		}
		// #endregion

		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			wwConfigGrpOnUpdate: wwConfigGrpOnUpdate,
			wwConfigGrpOnDelete: wwConfigGrpOnDelete,
			wwConfigGrpOnDataBound: wwConfigGrpOnDataBound,
			wwToolbarOnClick: wwToolbarOnClick,
		};
	}
})(window);
