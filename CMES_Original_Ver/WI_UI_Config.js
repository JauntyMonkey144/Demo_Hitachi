/*
Name:        	WI_UI_Config.js
Description: 	WI_UI_Config js file containing logic pertaining to the WI_UI_Config form.

Ver	 		Release  	By					Date				Change Description
001	 		00.70			Fayaz A     2024-09-05	#2869 First version.
002	 		00.70			Somya		  	2024-12-02	#3726 Review Comment Changes.
003			01.00			Usha M			2025-02-27	#4355 Removed console.log.
004			01.00			Bas van B		2025-03-05	#4253 Translate MD in filter and table.
005			01.00			Fayaz A			2025-03-24	#4567 Modified the data binding to widget navigation widget, added wwNavigationSetData
																								function to set data to navigation widget.
006			01.00			Fayaz A			2025-04-02	#4742 Updated to selectById with last row id to have it selected on load.
007			01.01			Praveen 		2025-05-09	#4872 If no data is returned, the widget's data is cleared in the wwInstructionListLoad().
*/

((window) => {
	//  ------------------------------ Global Variables ------------------------------------
	window.WI = window.WI || {};
	WI.Config = WI.Config || {};
	WI.Config = Config();
	//  ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */

	function Config() {
		//  ---------------------------- Constant Variables ----------------------------------
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;
		const WI_EVENTS = "wi.instruction.add|wi.instruction.update";
		const WI_MODULE = "wi";
		const INSTRUCTION_DATA =
			'[{"command": "view","form_name": "WI_UI_View","icon": "view--show.svg", "title":"View"},' +
			'{"command": "add","form_name": "WI_UI_Add","icon": "action--create.svg", "title":"Add"},' +
			'{"command": "edit","form_name": "WI_UI_Edit","icon": "action--edit.svg", "title":"Edit"},' +
			'{"command": "delete","form_name": "","icon": "action--delete.svg", "title":"Delete"},' +
			'{"command": "refresh","form_name": "","icon": "action--refresh.svg", "title":"Refresh", "ToRefresh":"xxDate"}]';
		const VIEW_INSTRUCTION_DATA =
			'{"command": "view","form_name": "WI_UI_View","icon": "view--show.svg", "title":"View","ToRefresh":"xxDate"}';
		//  ----------------------------------------------------------------------------------

		//  ----------------------------- Private Variables ----------------------------------
		/** Change default entity id{entityId} as per requirement. First priority is for form parameter entId,
		 * else this entId is considered as default; */
		let entityId = 1;
		const _controls = {};
		let lastFilterValue = "";
		let selectedEntities = "";
		let selectedInstructionTypes = "";

		//  ----------------------------------------------------------------------------------

		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			//  Initialize variables
			FORM.Control = Control;
			_controls.wwNavigation = FORM.Control.findByXmlNode("WWIN");
			_controls.wwCheckboxFilter = FORM.Control.findByXmlNode("WWCF");
			_controls.wwInstructionList = FORM.Control.findByXmlNode("WWIL");
			_controls.hfInstructionAction = FORM.Control.findByXmlNode("HFIN");
			_controls.hfInstructionListRow = FORM.Control.findByXmlNode("HFIR");
			_controls.hfRowId = FORM.Control.findByXmlNode("HFID");
			_controls.iwSetActive = FORM.Control.findByXmlNode("IWSA");
			_controls.epInstructionDetails = FORM.Control.findByXmlNode("EPID");

			//  Include js files
			includeJsFiles();

			//  Include js files via ajax
			includeJsFilesAjax();

			//  Include CSS files
			includeCssFiles();

			//  Add code here
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

		/**
		 * Form load function for the controls
		 */
		function onFormLoad() {
			if (
				FORM.Control.formParameters.entId !== undefined &&
				FORM.Control.formParameters.entId.value != null &&
				FORM.Control.formParameters.entId.value !== ""
			) {
				entityId = FORM.Control.formParameters.entId.value;
			}
			wwCheckboxFilterDataLoad();
			wwInstructionListLoad();
			lastFilterValue = "";
			wwNavigationSetData();
			FT.Common.windowEventListenerAdd(WI_MODULE, wiEventListener);
		}
		/**
		 * Function to set Instruction actions and assign data to navigation widget
		 */
		function wwNavigationSetData() {
			_controls.wwNavigation.widgetProperties.selectedValue = "view";
			_controls.wwNavigation.widgetProperties.float = "right";
			_controls.wwNavigation.widgetProperties.data = INSTRUCTION_DATA.replace("xxDate", Date.now());
		}
		/**
		 * listens to events that have to be reacted upon by Nav bar to refresh
		 */
		function wiEventListener(event) {
			// Split the module_event string into an array
			const eventList = WI_EVENTS.split("|");

			// Check if event.detail.subType matches any value in the array
			if (eventList.includes(event.detail.subType)) {
				_controls.epInstructionDetails.url = "";
				wwInstructionListLoad();
				wwNavigationSetData();
			}
		}
		/**
		 * Function to load Instruction and assign data to grid widget
		 */
		function wwInstructionListLoad() {
			const parameterColl = {
				ent_id_list: selectedEntities,
				type_id_list: selectedInstructionTypes,
			};
			const spName = "sp_SA_WI_Instruction_List";
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", spName, parameterColl, false).then(
				(data) => {
					// Translate the data.
					const fields = [
						FT.Ui.translationColumnField(
							"ent_desc",
							FT.Ui.TRANSLATION_GROUPS.grpEntDescription,
							FT.Ui.TRANSLATION_KEYS.keyEnt,
							"ent_name",
						),
						FT.Ui.translationColumnField("item_desc", FT.Ui.TRANSLATION_GROUPS.grpItemItemDesc, FT.Ui.TRANSLATION_KEYS.keyItem),
					];
					const translatedData = FT.Ui.translateArray(data, fields);
					if (translatedData.length > 0) {
						// Assign data to the grid.
						_controls.wwInstructionList.widgetProperties.selectById = translatedData[translatedData.length - 1].row_id;
						_controls.wwInstructionList.widgetProperties.data = JSON.stringify(translatedData);
					} else {
						_controls.wwInstructionList.widgetProperties.selectById = "";
						_controls.wwInstructionList.widgetProperties.data = JSON.stringify(translatedData);
					}
				},
				(error) => {
					// Handle error
					throw Error("Error:", error);
				},
			);
		}

		/**
		 * Function to assign instructionNavigation widget value to InstructionAction Hidden Field value
		 */
		function wwInstirctionNavigationActionChange() {
			_controls.hfInstructionAction.value = _controls.wwNavigation.value != null ? _controls.wwNavigation.value : "";
		}

		/**
		 * Function to load corresponding form for the selected action
		 */
		function hdInstructionActionOnActionChange() {
			_controls.epInstructionDetails.url = "";
			const selectedAction = _controls.hfInstructionAction.value ? JSON.parse(_controls.hfInstructionAction.value).command : "";
			const formName = _controls.hfInstructionAction.value ? JSON.parse(_controls.hfInstructionAction.value).form_name : "";
			const instructionRowSelected = _controls.hfInstructionListRow.value;

			if (selectedAction === "add") {
				_controls.epInstructionDetails.url = SFU.getFormUrl(formName);
			} else if (selectedAction === "refresh") {
				wwInstructionListLoad();
				wwNavigationSetData();
			} else if (instructionRowSelected !== undefined && instructionRowSelected !== "") {
				if (selectedAction === "edit") {
					_controls.epInstructionDetails.url = SFU.getFormUrl(formName);
				} else if (selectedAction === "view") {
					const eventDataObj = [
						{
							type: "eventData",
							jsonValue: JSON.stringify(JSON.parse(instructionRowSelected)),
						},
					];

					FT.WorkTasks.contextSet("", "eventData", JSON.stringify(eventDataObj));
					_controls.epInstructionDetails.url = SFU.getFormUrl(formName);
				} else if (selectedAction === "delete") {
					_controls.hfRowId.value = JSON.parse(instructionRowSelected).row_id;
					SFU.showConfirmation(
						skelta.localize.getString("@@WI_DelInstruction@@"),
						skelta.localize.getString("@@WI_DelInstructionMsg@@"),
						(val) => {
							if (val) {
								SFU.invokeWorkflow(_controls.iwSetActive);
							}
						},
					);
				}
			}
		}

		/**
		 * Function to assign Instruction widget value to Row Hidden Field value
		 */
		function wwInstructionListOnRowChange() {
			_controls.hfInstructionListRow.value =
				_controls.wwInstructionList.widgetProperties.selectedRow != null
					? _controls.wwInstructionList.widgetProperties.selectedRow
					: "";

			_controls.wwNavigation.widgetProperties.selectedValue = "view";
			_controls.wwNavigation.value = VIEW_INSTRUCTION_DATA.replace("xxDate", Date.now());
		}
		/**
		 * Function to refresh the instruction details after a status change.
		 *  * @param {Object} blockingOutput Value returned by the workflow (e.g. instance identifier)
		 * @param {string} workflowStatus Workflow status {EX: Executing, SL: Sleeping, FE: Finished with Errors, FN: Finished Normal}
		 *  can be null if workflow is still executing.
		 */
		function iwSetActiveInsturction(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, false, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				wwInstructionListLoad();
				wwNavigationSetData();
			}
		}
		/**
		 * Function to set WidgetDropNav visible script
		 */
		function wwCheckboxFilterSetVisibleScripts(Control) {
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
		function wwCheckboxFilterOnDataChange() {
			const selectedValues = _controls.wwCheckboxFilter.value;
			if (selectedValues !== lastFilterValue) {
				lastFilterValue = selectedValues;
				selectedEntities = selectedValues.Entity !== undefined ? selectedValues.Entity.toString() : "";
				selectedInstructionTypes = selectedValues.InstructionType !== undefined ? selectedValues.InstructionType.toString() : "";
				wwInstructionListLoad();
			}
		}
		/**
		 * Function to load Filter for Instruction and assign data to grid widget
		 */
		function wwCheckboxFilterDataLoad() {
			const parameterColl = { ent_id: entityId };
			const spName = "sp_SA_WI_Filters";
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", spName, parameterColl, false).then(
				(data) => {
					// Translate the enitty descriptions.
					const fields = [FT.Ui.translationColumnField("display", FT.Ui.TRANSLATION_GROUPS.grpEntDescription, ["display"])];
					// Filter data on entity group, so the other groups will not be affected.
					let translatedData = FT.Ui.translateArray(
						data.filter((dd) => dd.group === "Entity"),
						fields,
					);
					// Replace the entity group in the data with the translated data.
					translatedData = translatedData.concat(data.filter((dd) => dd.group !== "Entity"));
					// Assign data to the filter widget.
					_controls.wwCheckboxFilter.widgetProperties.data = JSON.stringify(translatedData);
				},
				(error) => {
					// Handle error
					throw Error("Error:", error);
				},
			);
		}

		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			wwInstirctionNavigationActionChange: wwInstirctionNavigationActionChange,
			hdInstructionActionOnActionChange: hdInstructionActionOnActionChange,
			wwInstructionListOnRowChange: wwInstructionListOnRowChange,
			iwSetActiveInsturction: iwSetActiveInsturction,
			wwCheckboxFilterSetVisibleScripts: wwCheckboxFilterSetVisibleScripts,
			wwCheckboxFilterDataLoad: wwCheckboxFilterDataLoad,
			wwPanelVisibleScripts: wwPanelVisibleScripts,
			wwCheckboxFilterOnDataChange: wwCheckboxFilterOnDataChange,
		};
	}
})(window);
