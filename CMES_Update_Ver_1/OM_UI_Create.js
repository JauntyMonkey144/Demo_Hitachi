/*
Name:        	OM_UI_Create.js
Description: 	OM_UI_Create js file containing global logic pertaining to the OM_UI_Create Form.

Ver		By						Date					Change Description
001		Ramesh V		 	2024-07-03		#3003 First version.
002		Ramesh V		 	2024-09-24		#Replaced the locally created getStrDateTime function with the FT.WorkTasks.dateTimeInStringFormat.
003		Praveen 		 	2024-09-24    #3958 While creating a WO  in Order Management,
                                  an extra 0 gets appended in Start Qty and Error handling to be done
004 	Fayaz A 			2025-02-19    #4306 Release Date check for lesser than Current Date is updated to consider the time zone.
005		Bas van B			2025-02-20		#4253 Translate line names and item descriptions.
006		Bas van B			2025-02-21		#4253	Use correct constants for translation GROUPS and KEYS.
007		Bas van B			2025-02-21		#4253 Use public TRANSLATION_GROUP and TRANSLATION_KEYS Ui objects to avoid errors when loaded as widget.
008		Fayaz A 			2025-03-10		#4286 Updated onItemSelectionChange to set UOM description for start quantity and required quantity.
008		Fayaz A 			2025-12-11		#5187 Added a user alert for successful work-order creation.
*/
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.OM = window.OM || {};
	OM.Create = OM.Create || {};
	OM.Create = Create();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function Create() {
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

		// ----------------------------------------------------------------------------------
		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			// Initialize variables
			FORM.Control = Control;
			_controls.rbWorkOder = FORM.Control.findByXmlNode("RBWO");
			_controls.ddProcess = FORM.Control.findByXmlNode("DDP");
			_controls.ddLine = FORM.Control.findByXmlNode("DDLN");
			_controls.ddSpecVer = FORM.Control.findByXmlNode("DDSV");
			_controls.txWoId = FORM.Control.findByXmlNode("TXWID");
			_controls.ddItem = FORM.Control.findByXmlNode("DDITM");
			_controls.ddBomVer = FORM.Control.findByXmlNode("DDBV");
			_controls.nrStartQty = FORM.Control.findByXmlNode("NRSQTY");
			_controls.nrReqQty = FORM.Control.findByXmlNode("NRRQTY");
			_controls.dtReleaseDate = FORM.Control.findByXmlNode("DTRD");
			_controls.dtDueDate = FORM.Control.findByXmlNode("DTDD");
			_controls.txCustomer = FORM.Control.findByXmlNode("TXCUST");
			_controls.hfNumDecimals = FORM.Control.findByXmlNode("HFND");
			_controls.lbReqQtytUOM = FORM.Control.findByXmlNode("LBRQU");
			_controls.lbStarQtytUOM = FORM.Control.findByXmlNode("LBSQU");

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
		 */
		function onFormLoad() {
			_controls.lbStarQtytUOM.value = "";
			_controls.lbReqQtytUOM.value = "";
			_controls.dtReleaseDate.value = FT.WorkTasks.dateTimeInStringFormat(_controls.dtReleaseDate, Date.now());
			ddLineListLoad();
			ddItemListLoad();
		}
		/**
		 * Loads the list of process and populates the dropdown control with the retrieved data.
		 * @returns {Object|null} The retrieved process data, or null if the request fails.
		 */
		function ddProcessListLoad() {
			parameterColl = {};
			FT.WebApi.mesGetAsync("api/itemprocesslink", "", parameterColl, false).then(
				(data) => {
					// Handle successful response data
					FT.WorkTasks.controlOptionsSetFromDataset("DDP", 0, data, "process_Id", "process_Id");
				},
				(error) => {
					// Handle error
					throw new Error("Error:", error);
				},
			);
		}
		/**
		 * Loads the list of Lines and populates the dropdown control with the retrieved data.
		 * @returns {Object|null} The retrieved lines data, or null if the request fails.
		 */
		function ddLineListLoad() {
			parameterColl = {};
			FT.WebApi.mesGetAsync("api/V3/line", "", parameterColl, false).then(
				(data) => {
					// Translate the line names
					const fields = [FT.Ui.translationColumnField("line_name", FT.Ui.TRANSLATION_GROUPS.grpEntDescription, ["line_name"])];
					const translatedData = FT.Ui.translateArray(data, fields);
					// Handle successful response data
					FT.WorkTasks.controlOptionsSetFromDataset("DDLN", 0, translatedData, "line_name", "line_id");
				},
				(error) => {
					// Handle error
					throw new Error("Error:", error);
				},
			);
		}
		/**
		 * Loads the list of OperSpecVersions and populates the dropdown control
		 *  with the retrieved data.
		 * @returns {Object|null} The retrieved OperSpecVersions data, or null if the request fails.
		 */
		function ddOperSpecVerListLoad() {
			parameterColl = { processId: _controls.ddProcess.value };
			FT.WebApi.mesGetAsync("api/OperSpecVer", "", parameterColl, false).then(
				(data) => {
					// Handle successful response data
					FT.WorkTasks.controlOptionsSetFromDataset("DDSV", 0, data, "ver_id", "ver_id");
				},
				(error) => {
					// Handle error
					throw new Error("Error:", error);
				},
			);
		}
		/**
		 * Loads the list of item and populates the dropdown control
		 *  with the retrieved data.
		 * @returns {Object|null} The retrieved Items data, or null if the request fails.
		 */
		function ddItemListLoad() {
			parameterColl = _controls.ddProcess.visible === true ? { processId: _controls.ddProcess.value } : {};
			const apiPath = _controls.ddProcess.visible === true ? "api/itemProcessLink" : "api/V3/Item";
			FT.WebApi.mesGetAsync(apiPath, "", parameterColl, false).then(
				(data) => {
					// Handle successful response data
					// Translate the item descriptions
					const fields = [
						FT.Ui.translationColumnField(
							"item_display",
							FT.Ui.TRANSLATION_GROUPS.grpItemItemDesc,
							FT.Ui.TRANSLATION_KEYS.keyItem,
						),
					];
					const translatedData = FT.Ui.translateArray(data, fields);

					// Pass the translated data to the dropdown
					FT.WorkTasks.controlOptionsSetFromDataset("DDITM", 0, translatedData, "item_display", "item_id");
				},
				(error) => {
					// Handle error
					throw new Error("Error:", error);
				},
			);
		}

		/**
		 * Loads the list of BOMVersions and populates the dropdown control
		 *  with the retrieved data.
		 * @returns {Object|null} The retrieved BOM Versions data, or null if the request fails.
		 */
		function ddBomVerListLoad() {
			parameterColl = { itemId: _controls.ddItem.value };
			FT.WebApi.mesGetAsync("api/BomVersion", "", parameterColl, false).then(
				(data) => {
					// Handle successful response data
					FT.WorkTasks.controlOptionsSetFromDataset("DDBV", 0, data, "ver_id", "ver_id");
				},
				(error) => {
					// Handle error
					throw new Error("Error:", error);
				},
			);
		}
		/**
		 * Loads the SpecVersions in the dropdwon based on the selected ProcessId from the dropdown.
		 */
		function onProcessSelectionChange() {
			ddOperSpecVerListLoad();
			ddItemListLoad();
		}
		/**
		 * Loads the SpecVersions in the dropdwon based on the selected ProcessId from the dropdown.
		 */
		function onLineSelectionChange() {
			ddItemListLoad();
		}
		/**
		 * Loads the BOM versions in the dropdwon based on the selected ItemId from the dropdown.
		 */
		function onItemSelectionChange() {
			// Set UOM description for start quantity and required quantity
			if (_controls.ddItem.value !== "") {
				const parameterCollection = {
					item_id: _controls.ddItem.value,
				};
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "SP_S_OM_Item_Uom", parameterCollection, false).then(
					(itemData) => {
						// Set the uom details
						_controls.lbReqQtytUOM.value = itemData[0].description;
						_controls.lbStarQtytUOM.value = itemData[0].description;
					},
					(error) => {
						// Handle error
						throw error("Error:", error);
					},
				);
			}

			if (_controls.ddProcess.value !== "" && _controls.ddItem.value !== "") {
				parameterColl = _controls.ddProcess.visible === true ? { processId: _controls.ddProcess.value } : {};
				const apiPath = _controls.ddProcess.visible === true ? "api/itemProcessLink" : "api/V3/Item";
				const itemDetails = FT.WebApi.mesGetSync(apiPath, "", parameterColl, false);

				FT.Common.setDecimalPlaces(
					_controls.nrStartQty,
					itemDetails.filter((item) => item.item_id === _controls.ddItem.value)[0].num_decimals,
				);
				FT.Common.setDecimalPlaces(
					_controls.nrReqQty,
					itemDetails.filter((item) => item.item_id === _controls.ddItem.value)[0].num_decimals,
				);
			}

			ddBomVerListLoad();
		}
		/**
		 * Load the controls and set the values based on the radio button click.
		 * @param {string} The WorkOrder type selected from the radio button.
		 */
		function rbWorkTypeSelect(selectedWoType) {
			const isProcessType = selectedWoType === "1";
			_controls.ddProcess.visible = isProcessType;
			_controls.ddSpecVer.visible = isProcessType;
			_controls.ddBomVer.visible = isProcessType;
			_controls.ddLine.visible = !isProcessType;
			if (isProcessType) {
				ddProcessListLoad();
			} else {
				ddLineListLoad();
				ddItemListLoad();
			}
		}
		/**
		 * Validate the due date is not before the release date.  If it is, give error and do not execute workflow.
		 * @returns {boolean} True if validation passes, false otherwise.
		 */
		function iwCreateWoOnPreWorkflow() {
			// Check if WoId and Item fields are empty
			if (FORM.Control.validateForm() === true) {
				if (!_controls.txWoId.value.trim() || !_controls.ddItem.value.trim()) {
					const title = skelta.localize.getString("@@OM_ValidationError@@");
					const errorMsg = skelta.localize.getString("@@OM_MandatoryValueError@@");
					let errorDetails = skelta.localize.getString("@@OM_MandatoryValueErrorDetails@@");
					errorDetails += !_controls.txWoId.value.trim()
						? ` ${skelta.localize.getString("@@OM_PoWoId@@")}`
						: ` ${skelta.localize.getString("@@OM_Item@@")}`;
					SFU.showError(title, errorMsg, null, errorDetails);
					return false;
				}

				// Check if ReleaseDate is before current date
				if (_controls.dtReleaseDate.value) {
					let releaseDate = new Date(_controls.dtReleaseDate.value);
					releaseDate = new Date(releaseDate.getTime() - releaseDate.getTimezoneOffset() * 60000);
					releaseDate = new Date(releaseDate).setHours(0, 0, 0, 0);
					const currentDate = new Date().setHours(0, 0, 0, 0);
					if (releaseDate < currentDate) {
						const title = skelta.localize.getString("@@OM_ValidationError@@");
						const errorMsg = skelta.localize.getString("@@OM_InvalidReleaseDate@@");
						const errorDetails = skelta.localize.getString("@@OM_ReleaseDateErrorDetails@@");
						SFU.showError(title, errorMsg, null, errorDetails);
						return false;
					}
				}

				// Check if DueDate is before ReleaseDate
				if (_controls.dtDueDate.value && _controls.dtReleaseDate.value) {
					const releaseDate = new Date(_controls.dtReleaseDate.value).getTime();
					const dueDate = new Date(_controls.dtDueDate.value).getTime();
					if (dueDate < releaseDate) {
						const title = skelta.localize.getString("@@OM_ValidationError@@");
						const errorMsg = skelta.localize.getString("@@OM_InvalidDueDate@@");
						const errorDetails = skelta.localize.getString("@@OM_DueDateErrorDetails@@");
						SFU.showError(title, errorMsg, null, errorDetails);
						return false;
					}
				}
				return true;
			}
			return false;
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwCreateWoOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch("om", "om.wo.add", FT.Common.EVENT_SOURCE_TYPE.form, "OM_UI_Create", "om.wo.add");
				const title = skelta.localize.getString("@@OM_SuccessfullTitle@@");
				const message = skelta.localize.getString("@@OM_SuccessfullCreateWoMessage@@").replace("{wo_id}",_controls.txWoId.value);
				// Clear form values and show succesfull message
				resetCreateFormValues();
				onFormLoad();
				SFU.showConfirmation(title, message);
			}
		}
		/**
		 * Clear form controll values.
		 */
		function resetCreateFormValues()
		{
			_controls.rbWorkOder.value = "0";
			  
			_controls.txWoId.value = "";  
			_controls.nrStartQty.value = "0";
			_controls.nrReqQty.value = "0";
			  
			_controls.dtDueDate.value = "";
			_controls.txCustomer.value = "";
			_controls.hfNumDecimals.value = "";
			_controls.lbReqQtytUOM.value = "";
			_controls.lbStarQtytUOM.value = "";
		}
		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			rbWorkTypeSelect: rbWorkTypeSelect,
			iwCreateWoOnPreWorkflow: iwCreateWoOnPreWorkflow,
			iwCreateWoOnPostWorkflow: iwCreateWoOnPostWorkflow,
			onProcessSelectionChange: onProcessSelectionChange,
			onItemSelectionChange: onItemSelectionChange,
			onLineSelectionChange: onLineSelectionChange,
		};
	}
})(window);
