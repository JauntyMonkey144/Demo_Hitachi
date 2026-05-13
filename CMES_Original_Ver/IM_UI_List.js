/*
Name:        	IM_UI_List.js
Description: 	IM_UI_List js file containing global logic pertaining to the Inventory List form.

Ver		Release	  By		    Date				Change Description
001		00.70  	  Praveen		2024-11-05	#3852 First version.
002		00.70     Chitta		2025-01-13	#3858 for Merge , popup screen needs to close and default menu has to
																		reselect and click of cancel or merge submit
003		00.70		  Chitta		2025-02-10	#4272 Merge screen have popup on button click and
																		this popup must disable on cancel or submit
004		01.00		  Bas van B	2025-02-25	#4253 Translated table and filter data
005		01.00		  Usha M		2025-02-27	#4355 Removed console.log
006   01.00     Usha M 		2025-03-03  #4391 Code Review changes made as per the bug list
007		01.00		  Chitta		2025-03-11	#4436	FT.Ui.Translation.LangId is optional for sp_SA_IM_Filters
008		01.00		  Chitta		2025-03-20	#4531 in loadIMList , wwNavbarWidgetOnClickRefresh removed this  _controls.embedPageInventory.url
009		01.01.00  Somya S		2025-05-09	#4887	EmbedPageUrl needs to be empty on click of Refresh Button to avoid Random Data Displayed.
010		01.01.00  Fayaz A		2025-05-14	#4955 The function wwNavbarWidgetOnClick was updated to set the selected command value
																							in the filterData context.
011 	01.01.00  Praveen		2025-05-14	#4994 Disable the "Shipping" button if the location where the material is located is not configured
                                            with "canship".
012 	01.01.00  Fayaz A		2025-05-16	#4999 The .replace(/\\/g, "\\\\") operation was removed from the mesUserId variable.
013   01.01.00  Praveen   2025-05-19  #5000 Show equipment hierarchy Inventort List in the function loadIMList()
014		01.01.00  Fayaz A		2025-05-22	#4955 Parent code value logic is added in wwNavbarWidgetOnClick function to set "CODE" value.
015	 	01.01.00	Fayaz A		2025-05-28	#5008 Localization key update to refer from FT runtime locale file.
016	 	01.02.00	Praveen		2025-07-01	#5101 Handles the entity name from either the context or the form parameter.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.IM = window.IM || {};
	IM.List = IM.List || {};
	IM.List = List();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctionsreplace(/\\/g, "\\\\")
	 *
	 * @returns {null} formFunctions template object.
	 */
	function List() {
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;
		const NAVIGATON_GRPID = "IM_InvButtonBar";
		const NAVIGATON_FOR = "IMActions";
		const IM_EVENTS =
			"im.itemInv.receive|im.itemInv.reclassify|im.itemInv.scrap|im.itemInv.split|im.itemInv.transfer|" +
			"+ im.itemInv.merge|im.itemInv.adjust|im.itemInv.shipping";
		const IM_MODULE = "im";

		// ----------------------------------------------------------------------------------

		// ----------------------------- Private Variables ----------------------------------
		const _controls = {};
		let userInfo = "";
		let lastFilterValue = "";
		let selectedGrade = "";
		let selectedState = "";
		let selectedItemClass = "";
		let selectedLocation = "";
		let mesUserId = "";
		let entId = "";
		let entName = "";
		let commandSelected = ""; // Variable to hold the selected command's action details, including configured properties and their values
		let codeValue = ""; // Variable to hold the value of 'code' column from use case composability.
		// ----------------------------------------------------------------------------------
		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			// Initialize variables
			FORM.Control = Control;
			_controls.wwIMQueue = FORM.Control.findByXmlNode("WWIN");
			_controls.wwCheckboxFilter = FORM.Control.findByXmlNode("WWFS");
			_controls.wwNavigation = FORM.Control.findByXmlNode("WWNV");
			_controls.hfIMRow = FORM.Control.findByXmlNode("HFIMR");
			_controls.embedPageInventory = FORM.Control.findByXmlNode("EPIM");
			_controls.formParameters = FORM.Control.formParameters;
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

		/**
		 * Form load function to bind cards with respect to entity from form parameters or if session variable EntID
		 */
		function onFormLoad() {
			try {
				entId = formParameters.entId.value;
				const entContext = FT.WorkTasks.contextGet(FORM.Control, "ent");
				if (entContext !== null && entContext[0].entId !== null) {
					entId = formParameters.entId.value == null ? entContext[0].entId : formParameters.entId.value;
					selectedLocation = entId;
				} else {
					selectedLocation = "";
					FT.WorkTasks.contextInit();
				}
				const filterData = FT.WorkTasks.contextGet(FORM.Control, "filterData");
				commandSelected = filterData.find((item) => item.type === "commandSelected");
				if (commandSelected) {
					commandSelected = JSON.parse(commandSelected.jsonValue);
					// Sample code to access context properties
					codeValue = commandSelected.code;
				}
				lastFilterValue = "";
				userInfo = FT.WorkTasks.userInfo();
				mesUserId = userInfo.MESUserId !== undefined ? userInfo.MESUserId : null;
				entName = formParameters.entId.value == null ? entContext[0].entName : loadEntityName(entId);
				wwCheckboxFilterDataLoad();
				_controls.wwNavigation.widgetProperties.selectedValue = "details";
				_controls.wwNavigation.widgetProperties.float = "right";
				_controls.wwNavigation.widgetProperties.command = "transfer,scrap,reclassify,merge,split,adjust,SublotLevel,shipping";
				wwNavigationSetData(NAVIGATON_GRPID, NAVIGATON_FOR, entName, mesUserId);
				loadIMList();
			} catch (exception) {
				handleScriptError(exception);
			}
			FT.Common.windowEventListenerAdd(IM_MODULE, imEventListener);
		}

		/**
		 * listens to events that have to be reacted upon by card widget to refresh
		 */
		function imEventListener(event) {
			// Split the module_event string into an array
			const eventList = IM_EVENTS.split("|");
			if (event.detail.subType === "im.itemInv.merge") {
				$(".EPIMP_skcn").css({
					position: "relative",
					top: "auto",
					right: "auto",
				});
				wwNavbarWidgetOnClickRefresh();
			} else if (eventList.includes(event.detail.subType)) {
				// Check if event.detail.subType matches any value in the array
				wwNavbarWidgetOnClickRefresh();
			}
		}

		/**
		 * extracts relevant information from the selected value in the  widget and stores it in the eventData contextSet.
		 */
		function wwGridOnClick() {
			_controls.hfIMRow.value =
				_controls.wwIMQueue.widgetProperties.selectedRow != null ? _controls.wwIMQueue.widgetProperties.selectedRow : "";
			if (_controls.wwIMQueue.widgetProperties.selectedRow != null) {
				const selectedRow = JSON.parse(_controls.wwIMQueue.widgetProperties.selectedRow);
				const inventoryObj = [
					{
						rowId: selectedRow != null ? selectedRow.row_id_h : null,
						jsonValue: selectedRow,
					},
				];
				FT.WorkTasks.contextSet("", "itemInv", JSON.stringify(inventoryObj));
				if (selectedRow.item_class_id === "IM_HandlingUnits") {
					_controls.embedPageInventory.url = "";
					_controls.wwNavigation.widgetProperties.selectedValue = "details";
					_controls.wwNavigation.widgetProperties.command = "transfer,scrap,reclassify,merge,split,receive,adjust,shipping";
				} else {
					const selectedAction = JSON.parse(_controls.wwNavigation.value);
					if (selectedAction.command.toLowerCase() === "sublotlevel") {
						_controls.wwNavigation.widgetProperties.selectedValue = "details";
					}
					enableButton(selectedRow != null ? selectedRow.qty_left : null);
				}
				wwNavbarWidgetOnClick();
			}
		}
		/**
		 * Function to load WO Queue for an entity and assign data to grid widget
		 *
		 */
		function loadIMList() {
			_controls.embedPageInventory.url = "";
			const parameterColl = {
				ent_id: selectedLocation === "" ? entId : selectedLocation,
				item_class_list: selectedItemClass,
				grade_list: selectedGrade,
				state_list: selectedState,
			};
			const spName = "sp_SA_IM_Item_Inv_WithChildEnt";
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", spName, parameterColl, false).then(
				(data) => {
					// Translate the data
					let translatedData = data;
					if (data != null && data.length > 0) {
						const fields = [
							FT.Ui.translationColumnField(
								"description",
								FT.Ui.TRANSLATION_GROUPS.grpEntDescription,
								FT.Ui.TRANSLATION_KEYS.keyEnt,
							),
							FT.Ui.translationColumnField(
								"item_class_desc",
								FT.Ui.TRANSLATION_GROUPS.grpItemClassItemClassDesc,
								FT.Ui.TRANSLATION_KEYS.keyItemClass,
							),
							FT.Ui.translationColumnField("item_desc", FT.Ui.TRANSLATION_GROUPS.grpItemItemDesc, FT.Ui.TRANSLATION_KEYS.keyItem),
							FT.Ui.translationColumnField(
								"item_grade_desc",
								FT.Ui.TRANSLATION_GROUPS.grpItemGradeItemGradeDesc,
								FT.Ui.TRANSLATION_KEYS.keyItemGrade,
							),
							FT.Ui.translationColumnField("item_inv_uom_description", FT.Ui.TRANSLATION_GROUPS.grpUomDescription, [
								"item_inv_uom_description",
							]),
							FT.Ui.translationColumnField(
								"item_status_desc",
								FT.Ui.TRANSLATION_GROUPS.grpItemStateItemStatusDesc,
								FT.Ui.TRANSLATION_KEYS.keyItemState,
							),
							FT.Ui.translationColumnField("units", FT.Ui.TRANSLATION_GROUPS.grpUomDescription, ["units"]),
						];
						translatedData = FT.Ui.translateArray(data, fields);
					}
					// Handle successful response data
					_controls.wwIMQueue.widgetProperties.data = JSON.stringify(translatedData);
				},
				(error) => {
					// Handle error
					throw Error("Error:", error);
				},
			);
		}
		/**
		 * Function that have to be reacted upon by widget to refresh
		 */
		function wwNavbarWidgetOnClickRefresh() {
			_controls.wwNavigation.widgetProperties.selectedValue = "";
			_controls.wwNavigation.widgetProperties.float = "right";
			wwNavigationSetData(NAVIGATON_GRPID, NAVIGATON_FOR, entName, mesUserId);
			loadIMList();
		}
		/**
		 * Updates the form URL of an embedded page based on the selected value from the Navbar widget.
		 */
		function wwNavbarWidgetOnClick() {
			if (_controls.wwNavigation.value !== "{}") {
				const selectedAction = JSON.parse(_controls.wwNavigation.value);
				if (selectedAction.code === "**PC**") {
					selectedAction.code = codeValue;
					const filterDataObj = [{ type: "commandSelected", jsonValue: JSON.stringify(selectedAction) }];
					FT.WorkTasks.contextSet("", "filterData", JSON.stringify(filterDataObj));
				} else {
					const filterDataObj = [{ type: "commandSelected", jsonValue: JSON.stringify(selectedAction) }];
					FT.WorkTasks.contextSet("", "filterData", JSON.stringify(filterDataObj));
				}
				if (selectedAction.command.toLowerCase() === "refresh") {
					_controls.wwIMQueue.widgetProperties.selectById = null;
					_controls.wwNavigation.widgetProperties.selectedValue = "details";
					_controls.wwNavigation.widgetProperties.float = "right";
					_controls.wwNavigation.widgetProperties.command = "transfer,scrap,reclassify,merge,split,adjust,SublotLevel,shipping";
					wwNavigationSetData(NAVIGATON_GRPID, NAVIGATON_FOR, entName, mesUserId);
					loadIMList();
				} else if (selectedAction.command.toLowerCase() === "merge") {
					_controls.embedPageInventory.url = "";
					_controls.embedPageInventory.url = SFU.getFormUrl(selectedAction.form_name);
					$(".EPIMP_skcn").css({
						position: "fixed",
						top: "0",
						right: "0",
						height: "100%",
					});
				} else if (selectedAction.command.toLowerCase() === "receive") {
					if (
						_controls.wwIMQueue.widgetProperties.selectedRow === "" ||
						_controls.wwIMQueue.widgetProperties.selectedRow === "null" ||
						_controls.wwIMQueue.widgetProperties.selectedRow === null
					) {
						const inventoryObj = [
							{
								rowId: null,
								jsonValue: null,
							},
						];
						FT.WorkTasks.contextSet("", "itemInv", JSON.stringify(inventoryObj));
					}
					_controls.embedPageInventory.url = "";
					_controls.embedPageInventory.url = SFU.getFormUrl(selectedAction.form_name);
				} else if (
					_controls.wwIMQueue.widgetProperties.selectedRow !== "" &&
					_controls.wwIMQueue.widgetProperties.selectedRow !== "null" &&
					_controls.wwIMQueue.widgetProperties.selectedRow !== null
				) {
					_controls.embedPageInventory.url = "";
					_controls.embedPageInventory.url = SFU.getFormUrl(selectedAction.form_name);
				}

				if (selectedAction.command.toLowerCase() !== "merge") {
					$(".EPIMP_skcn").css({
						position: "relative",
						top: "auto",
						right: "auto",
					});
				}
			}
		}

		/**
		 * Enables the button based on the quantity and item class of the selected row.
		 * Determines available commands for actions like transfer, scrap, reclassify, etc.
		 * @param {number} strQuantity - The quantity value that determines command options.
		 */
		function enableButton(strQuantity) {
			// Parse the selected row from the widget properties
			const selectedRow = JSON.parse(_controls.wwIMQueue.widgetProperties.selectedRow);
			parameterColl = { itemId: selectedRow.item_id };

			// Handle case where quantity is 0 or less (allow all commands)
			if (strQuantity <= 0) {
				_controls.wwNavigation.widgetProperties.command = "transfer,scrap,reclassify,merge,split,SublotLevel,shipping";
			} else if (selectedRow.item_class_id === "IM_HandlingUnits") {
				_controls.wwNavigation.widgetProperties.command = "SublotLevel";
			} else {
				// Make an API call to get the item class data for this item
				const getItemClass = FT.WebApi.mesGetSync("api/ItemClass", "", parameterColl, false);

				// Find the item class that matches the selected row's item_class_id
				const itemClassId = getItemClass.find((item) => item.item_class_id === selectedRow.item_class_id);

				// Based on the item class, set the allowed commands
				if (itemClassId && itemClassId.produced === true) {
					parameterColl = { entId: selectedRow.ent_id };
					const data = FT.WebApi.mesGetSync("api/v3/Entity/key", "", parameterColl, false);
					// Condition to decide whether to include "shipping"
					const includeShipping = data.can_ship; // Set this to true or false based on your condition
					_controls.wwNavigation.widgetProperties.command = `SublotLevel${includeShipping ? "" : ",shipping"}`;
				} else {
					_controls.wwNavigation.widgetProperties.command = "SublotLevel,shipping";
				}
			}

			// Retrieve the current command and check if it is valid
			const getCommand = _controls.wwNavigation.widgetProperties.command;
			if (
				_controls.wwNavigation.widgetProperties.command
					.split(",")
					.includes(JSON.parse(_controls.wwNavigation.value).command.toLowerCase())
			) {
				// If the current command is valid, update the selected value to "details"
				_controls.wwNavigation.widgetProperties.selectedValue = "details";
				_controls.wwNavigation.widgetProperties.command = getCommand;
			}
		}

		/**
		 * Function to load data for the checkbox filter widget
		 */
		function wwCheckboxFilterDataLoad() {
			let parameterColl = { ent_id: entId };

			if (FT.Ui.Translation !== undefined) {
				if (FT.Ui.Translation.LangId !== undefined) {
					parameterColl = { ent_id: entId, lang_id: FT.Ui.Translation.LangId };
				}
			}

			const spName = "sp_SA_IM_Filters";
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", spName, parameterColl, false).then(
				(data) => {
					// Handle successful response data
					_controls.wwCheckboxFilter.widgetProperties.data = JSON.stringify(data);
				},
				(error) => {
					// Handle error
					throw Error("Error:", error);
				},
			);
		}

		/**
		 * Set navigation data from the config table
		 * @param {string} entity [optional]
		 * @param {string} grpId Group Id
		 * @param {string} category Navigation filter
		 * @param {string} entityName filter
		 * @param {string} userId filter
		 * @param {string} itemId filter
		 * @param {string} woId filter
		 * @param {string} operId filter
		 * @param {string} seqNo filter
		 * @returns
		 */
		function wwNavigationSetData(grpId, category, entityName, userId, itemId, woId, operId, seqNo) {
			try {
				const parameterCollection = {
					grp_id: grpId,
					category: category,
					ent_name: entityName,
					user_id: userId,
					item_id: itemId !== undefined ? itemId : null,
					wo_id: woId !== undefined ? woId : null,
					oper_id: operId !== undefined ? operId : null,
					seq_no: seqNo !== undefined ? seqNo : null,
				};
				const invActionsData = FT.WebApi.mesGetSync("api/V3/DirectAccess", "sp_SA_FT_Config_Actions", parameterCollection, false);

				if (invActionsData.length > 0) {
					invActionsData[0].cfg_desc = Date().toString();
					_controls.wwNavigation.widgetProperties.selectedValue = "details";
					_controls.wwNavigation.widgetProperties.float = "right";
					_controls.wwNavigation.widgetProperties.data = JSON.stringify(invActionsData);
				}
			} catch (exception) {
				handleScriptError(exception);
			}
		}
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

		/**
		 * Function to set Widget CheckboxList visible script
		 */
		function wwIMStatesVisibleScripts(Control) {
			$(Control.findById("W2").domElement).parent().css("overflow", "visible");
			$(Control.findById("W2").domElement).parent().parent().css("overflow", "visible");
			$(Control.findById("W2").domElement).parent().closest("div[controlid='W2']").css("z-index", "9999999999");
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
		 * dropdown type on selection change for reload the widget
		 * @returns
		 */
		function wwCheckboxFilterOnDataChange() {
			const selectedValues = _controls.wwCheckboxFilter.value;
			if (selectedValues !== lastFilterValue) {
				lastFilterValue = selectedValues;
				selectedGrade = selectedValues.Grade !== undefined ? selectedValues.Grade.toString() : "";
				selectedState = selectedValues.State !== undefined ? selectedValues.State.toString() : "";
				selectedItemClass = selectedValues.ItemClass !== undefined ? selectedValues.ItemClass.toString() : "";
				selectedLocation = selectedValues.Location !== undefined ? selectedValues.Location.toString() : "";
				loadIMList();
			}
		}
		/**
		 * Retrieves the name of an entity based on its ID.
		 * @param {number} entId - The unique identifier of the entity.
		 * @returns {string} The name of the entity.
		 */
		function loadEntityName() {
			parameterColl = { entId: entId };
			const data = FT.WebApi.mesGetSync("api/v3/Entity/key", "", parameterColl, false);
			return data.ent_name;
		}
		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			wwIMStatesVisibleScripts: wwIMStatesVisibleScripts,
			wwPanelVisibleScripts: wwPanelVisibleScripts,
			wwCheckboxFilterOnDataChange: wwCheckboxFilterOnDataChange,
			wwGridOnClick: wwGridOnClick,
			wwNavbarWidgetOnClick: wwNavbarWidgetOnClick,
		};
	}
})(window);
