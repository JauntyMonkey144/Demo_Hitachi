/*
Name:        	IM_UI_Details.js
Description: 	IM_UI_Details js file containing global logic pertaining to the IM_UI_Details Form.

Ver		Release		By						Date						Change Description
001		00.70  		Chittaranjan	2024-11-05			#3851 First version
002		01.00		  Bas van B			2025-02-25			#4253 Use correct field for item class description
003   01.00     Usha M 				2025-03-03      #4390 The function getInventoryDetails is only called once, hence its integrated
004   01.00     Usha M				2025-03-03      #4343 UI Fixes
005		01.01.00	Fayaz A	  		2025-05-14			#4955 A global variable, commandSelected, is defined to fetch and hold the selected command's
																							action details from filterData context on form load.
006	 	01.01.00	Fayaz A				2025-05-28			#5008 Localization key update to refer from FT runtime locale file.
007   01.00.00  Praveen				2025-05-29      #5018 Use the matched index i to get the correct description.
008   02.00.00  Praveen				2025-12-11      #5261 Movable Entity with storage location map.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.IM = window.IM || {};
	IM.Details = IM.Details || {};
	IM.Details = Details();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function Details() {
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
			_controls.txSublotNO = FORM.Control.findByXmlNode("TXSL");
			_controls.txtScannableID = FORM.Control.findByXmlNode("TXISID");
			_controls.txtStorageEntID = FORM.Control.findByXmlNode("TXISEID");
			_controls.txtLotGrade = FORM.Control.findByXmlNode("TXILG");
			_controls.txtLotState = FORM.Control.findByXmlNode("TXILS");
			_controls.txtLotExpiryDate = FORM.Control.findByXmlNode("TXILED");
			_controls.txItemClassDisplay = FORM.Control.findByXmlNode("TXIC");
			_controls.dtRecive = FORM.Control.findByXmlNode("DTR");
			_controls.ddLocStatus = FORM.Control.findByXmlNode("DDLS");
			_controls.txWoID = FORM.Control.findByXmlNode("TXIWID");
			_controls.txOperID = FORM.Control.findByXmlNode("TXIOID");
			_controls.txSeqNO = FORM.Control.findByXmlNode("TXISN");
			_controls.txSpare1 = FORM.Control.findByXmlNode("TXIS1");
			_controls.txSpare2 = FORM.Control.findByXmlNode("TXIS2");
			_controls.txSpare3 = FORM.Control.findByXmlNode("TXIS3");
			_controls.txSpare4 = FORM.Control.findByXmlNode("TXIS4");

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
				const objRecID = FT.WorkTasks.contextGet("", "itemInv");
				const filterData = FT.WorkTasks.contextGet(FORM.Control, "filterData");
				commandSelected = filterData.find((item) => item.type === "commandSelected");
				if (commandSelected) {
					commandSelected = JSON.parse(commandSelected.jsonValue);
					// Sample code to access context properties
					codeValue = commandSelected.code;
				}
				if (objRecID) {
					if (objRecID.length > 0) {
						assignInventoryDetails(objRecID[0].jsonValue);
					}
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
		 * function to  assign values to the controls of inventory details to the data of the selected inventory record
		 * @param {*} control , data
		 */
		function assignInventoryDetails(data) {
			_controls.txSublotNO.value = data.sublot_no;
			_controls.txItemClassDisplay.value = data.item_class_desc;
			_controls.dtRecive.value = FT.WorkTasks.dateTimeInStringFormat(_controls.dtRecive, data.date_in_utc);
			_controls.ddLocStatus.defaultValue = data.loc_status.toString();
			_controls.txWoID = data.wo_id;
			_controls.txOperID = data.oper_id;
			_controls.txSeqNO = data.seq_no;
			_controls.txSpare1.value = data.spare1;
			_controls.txSpare2.value = data.spare2;
			_controls.txSpare3.value = data.spare3;
			_controls.txSpare4.value = data.spare4;
			getStorageDetails(data.ent_id, data.item_id, data.lot_no, data.sublot_no);
			getlotDetails(data.item_id, data.lot_no);
		}

		/*
		 * function to get the storage details for the selected entity of inventory record if it is movable
		 */
		function getStorageDetails(entID) {
			debugger
			//parameterColl1 = { ent_id: entID };
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_S_Storage_Exec", { ent_id: entID }, false).then(
				(storageData) => {
					if (storageData != null && storageData.length > 0) {
						if (storageData[0].movable === true) {
							_controls.txtScannableID.visible = true;
							_controls.txtStorageEntID.visible = true;
							_controls.txtScannableID.value = storageData[0].scannable_id;
							const entData = FT.WebApi.mesGetSync("api/v3/Entity", "", { entId: entID }, false);
							if (entData != null && entData.length > 0) {
								/*const fields = [
									FT.Ui.translationColumnField(
										"ent_name",
										FT.Ui.TRANSLATION_GROUPS.grpEntDescription,
										FT.Ui.TRANSLATION_KEYS.keyEnt,
									),
								];
								data = FT.Ui.translateArray(entData, fields);*/
								_controls.txtStorageEntID.value = entData[0].ent_name;
							}
						} else {
							_controls.txtScannableID.visible = false;
							_controls.txtStorageEntID.visible = false;
						}
					} else {
						_controls.txtScannableID.visible = false;
						_controls.txtStorageEntID.visible = false;
					}
				},
				(error) => {
					throw Error("Error:", error);
				},
			);
		}

		/*
		 * function to get the Lot Grade and Lot State details for the selected inventory record
		 */
		function getlotDetails(itemID, lotNo) {
			if (lotNo !== null) {
				parameterColl = { itemId: itemID, lotNo: lotNo };
				const lotData = FT.WebApi.mesGetSync("api/v3/Lot/key", "", parameterColl, false);
				const itemGradeData = FT.WebApi.mesGetSync("api/ItemGrade", "", "", false);
				if (itemGradeData && itemGradeData.length > 0) {
					for (i = 0; i < itemGradeData.length; i++) {
						if (lotData.grade_cd === itemGradeData[i].item_grade_cd) {
							_controls.txtLotGrade.value = itemGradeData[i].item_grade_desc.toString();
							break;
						}
					}
				}
				const itemStateData = FT.WebApi.mesGetSync("api/ItemState", "", "", false);
				if (itemStateData && itemStateData.length > 0) {
					for (i = 0; i < itemStateData.length; i++) {
						if (lotData.status_cd === itemStateData[i].item_status_cd) {
							_controls.txtLotState.value = itemStateData[i].item_status_desc.toString();
							break;
						}
					}
				}
				_controls.txtLotExpiryDate.value = lotData.expiry_date;
			}
		}

		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			getStorageDetails: getStorageDetails,
			getlotDetails: getlotDetails,
		};
	}
})(window);
