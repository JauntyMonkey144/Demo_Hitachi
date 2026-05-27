/*
Name:        	IM_UI_Receive.js
Description: 	IM_UI_Receive js file containing global logic pertaining to the IM_UI_Receive Form.

Ver	Release		By							Date						Change Description
001	00.70.00	Chittaranjan		2024-11-05			#3853 First version.
002	00.70.00	Chittaranjan		2025-01-27			#4227 UOM ID and Units must mapped with selected Item dropdown.
003	00.70.00	Chittaranjan		2025-02-19			#4323 When Item Selection is empty on page load,
																								error must not through in from onChangeDDItem.
004 00.70.00	Usha M				  2025-02-20			#4292 Updated iwReceiveInventoryOnPreWorkflow function to validate when the Quantity is 0.
005	01.00.00	Bas van B				2025-02-25			#4253 Translate the values in the dropdowns.
006	01.00.00	Bas van B				2025-02-25			#4253 Moved DDIData array from global decalaration to Receive object.
007	01.00.00	Praveen  				2025-03-20			#4524 function ddLocationLoad add the parameter canStore:true
008	01.01.00	Praveen  				2025-05-14			#4994 function ddLocationLoad() add the parameter object canReceive:true
009	01.01.00	Fayaz A					2025-05-28			#5008 Localization key update to refer from FT runtime locale file.
010	02.00.00	Fayaz A					2026-05-13			#5008 Fix bug in Location dropdown panel .
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.IM = window.IM || {};
	IM.Receive = IM.Receive || {};
	IM.Receive = Receive();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function Receive() {
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
		let DDIData = [];

		// ----------------------------------------------------------------------------------
		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			// Initialize variables
			FORM.Control = Control;
			_controls.ddLocation = FORM.Control.findByXmlNode("DDL");
			_controls.ddItem = FORM.Control.findByXmlNode("DDI");
			_controls.nrQty = FORM.Control.findByXmlNode("NRQ");
			_controls.lbQty = FORM.Control.findByXmlNode("LBQ");
			_controls.txBatch = FORM.Control.findByXmlNode("TXB"); // here batch and lot both are same
			_controls.txSlot = FORM.Control.findByXmlNode("TXSL");
			_controls.ddItemGrade = FORM.Control.findByXmlNode("DDIG");
			_controls.ddItemState = FORM.Control.findByXmlNode("DDIS");
			_controls.dtExpire = FORM.Control.findByXmlNode("DTE");
			_controls.txComments = FORM.Control.findByXmlNode("TXC");
			_controls.hfEntID = FORM.Control.findByXmlNode("HFEID");
			_controls.hfItemID = FORM.Control.findByXmlNode("HFIID");
			_controls.hfUOMID = FORM.Control.findByXmlNode("HFUID");

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
				ddLocationLoad();
				ddItemLoad();
				ddItemGradeLoad();
				ddItemStateLoad();
				getInventoryReceive();
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
		 * function to  assign values to the controls of inventory Receive to the data of the selected inventory record
		 * @param {*} control , data
		 */
		function assignInventoryReceive(data) {
			_controls.ddLocation.value = data.ent_id;
			_controls.ddItem.value = data.item_id;
			_controls.nrQty.value = data.qty_left;
			FT.Common.setDecimalPlaces(_controls.nrQty, parseInt(data.num_decimals_h, 10));
			_controls.lbQty.value = data.units;
			_controls.txBatch.value = data.lot_no; // here batch and lot both are same
			_controls.txSlot.value = data.sublot_no;
			_controls.ddItemGrade.value = data.item_grade_cd;
			_controls.ddItemState.value = data.item_status_cd;

			_controls.dtExpire.value = FT.WorkTasks.dateTimeInStringFormat(_controls.dtExpire, data.expiry_date);
			_controls.txComments.value = "";
			_controls.hfEntID.value = data.ent_id;
			_controls.hfItemID.value = data.item_id;
			_controls.hfUOMID.value = data.uom_id_h;

			onChangeDDItem(); // _controls.ddItem value re assigned.
		}

		/**
		 * function to get the inventory Receive to the data of the selected inventory record
		 */
		function getInventoryReceive() {
			const objRecID = FT.WorkTasks.contextGet("", "itemInv");
			if (objRecID[0].jsonValue != null) {
				if (objRecID.length > 0) {
					assignInventoryReceive(objRecID[0].jsonValue);
				}
			}
		}

		//Fix bug cho truong hop danh sach localtion hien thi khong dung voi du lieu location da cai dat o MES Client
		/**
         * Load and populate the dropdown list with entity locations that can receive and store items.
         * Retrieves entity data from the API, translates the descriptions, and formats it for UI dropdown.
         */
        function ddLocationLoad() {
            // FIX 1: Thêm const để khai báo biến chuẩn xác, tránh lỗi ReferenceError
            const parameterColl = { canReceive: true, canStore: true };
            const data = FT.WebApi.mesGetSync("api/v3/Entity", "", parameterColl, false);
            const strOptions = [];

            if (data && data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    // FIX 2: Tạo Fallback. Nếu description bị null thì lấy ent_name đắp vào để không bị mất chữ
                    const fallbackDesc = data[i].description ? data[i].description : data[i].ent_name;
                    
                    // Translate the entity description
                    const description = FT.Ui.translateValue(
                        FT.Ui.TRANSLATION_GROUPS.grpEntDescription,
                        data[i].ent_name,
                        fallbackDesc
                    );

                    const finalDesc = getString(description) || getString(data[i].ent_name);

                    strOptions.push({ 
                        ent_id: getString(data[i].ent_id), 
                        ent_name: finalDesc,
                    });
                }
            }
            // Ép Skelta framework đọc chuẩn cấu trúc optiontext và optionvalue
            FT.WorkTasks.controlOptionsSetFromDataset("DDL", 0, strOptions, "ent_name", "ent_id");
        }


		/**
		 * Loads the list of item  and populates the dropdown control
		 *  with the retrieved data.
		 */
		function ddItemLoad() {
			const data = FT.WebApi.mesGetSync("api/V3/Item", "", "", false);
			DDIData = [];
			const strOptions = [];
			if (data && data.length > 0) {
				// Translate the data
				const fields = [
					FT.Ui.translationColumnField(
						"item_class_desc",
						FT.Ui.TRANSLATION_GROUPS.grpItemClassItemClassDesc,
						FT.Ui.TRANSLATION_KEYS.keyItemClass,
					),
					FT.Ui.translationColumnField("item_desc", FT.Ui.TRANSLATION_GROUPS.grpItemItemDesc, FT.Ui.TRANSLATION_KEYS.keyItem),
					FT.Ui.translationColumnField("uom_description", FT.Ui.TRANSLATION_GROUPS.grpUomDescription, ["uom_description"]),
				];
				DDIData = FT.Ui.translateArray(data, fields);
				for (let i = 0; i < DDIData.length; i++) {
					// translate the item description
					strOptions.push({ item_id: getString(DDIData[i].item_id), item_desc: DDIData[i].item_desc });
				}
			}
			FT.WorkTasks.controlOptionsSetFromDataset("DDI", 0, strOptions, "item_desc", "item_id");
		}

		/**
		 * Event when the selected item changes
		 */
		function onChangeDDItem() {
			const data = DDIData;
			const selDDItem = data.find((itm) => itm.item_id === _controls.ddItem.value);
			if (selDDItem !== undefined && selDDItem !== null) {
				_controls.hfItemID.value = selDDItem.item_id;
				_controls.lbQty.value = selDDItem.uom_description;
				_controls.hfUOMID.value = selDDItem.uom_id;
				FT.Common.setDecimalPlaces(_controls.nrQty, parseInt(selDDItem.num_decimals, 10));
			}
		}

		/**
		 * Loads the list of item reason and populates the dropdown control
		 *  with the retrieved data.
		 * @returns {Object|null} The retrieved item reason data, or null if the request fails.
		 */
		function ddItemStateLoad() {
			const data = FT.WebApi.mesGetSync("api/ItemState", "", "", false);
			const strOptions = [];
			if (data && data.length > 0) {
				for (let i = 0; i < data.length; i++) {
					// Translate the status description
					const statusDesc = FT.Ui.translateValue(
						FT.Ui.TRANSLATION_GROUPS.grpItemStateItemStatusDesc,
						data[i].item_status_desc,
						data[i].item_status_desc,
					);
					strOptions.push({
						item_status_cd: getString(data[i].item_status_cd),
						item_status_desc: getString(statusDesc),
					});
				}
			}
			FT.WorkTasks.controlOptionsSetFromDataset("DDIS", 0, strOptions, "item_status_desc", "item_status_cd");
		}
		/**
		 * Loads the list of item reason and populates the dropdown control
		 *  with the retrieved data.
		 * @returns {Object|null} The retrieved item reason data, or null if the request fails.
		 */
		function ddItemGradeLoad() {
			const data = FT.WebApi.mesGetSync("api/ItemGrade", "", "", false);
			const strOptions = [];
			if (data && data.length > 0) {
				for (let i = 0; i < data.length; i++) {
					// Translate the grade description
					const gradeDesc = FT.Ui.translateValue(
						FT.Ui.TRANSLATION_GROUPS.grpItemGradeItemGradeDesc,
						data[i].item_grade_desc,
						data[i].item_grade_desc,
					);
					strOptions.push({
						item_grade_cd: getString(data[i].item_grade_cd),
						item_grade_desc: getString(gradeDesc),
					});
				}
			}
			FT.WorkTasks.controlOptionsSetFromDataset("DDIG", 0, strOptions, "item_grade_desc", "item_grade_cd");
		}
		/**
		 * Prepares data and sets control values before executing the workflow.
		 */
		function iwReceiveInventoryOnPreWorkflow() {
			let ret = true;
			let title = "";
			let errorDetails = "";
			if (FORM.Control.validateForm() === true) {
				if (parseFloat(_controls.nrQty.value) <= 0) {
					title = skelta.localize.getString("@@IM_RecvQuantityErr@@");
					errorDetails = skelta.localize.getString("@@IM_RecvQuantityErrDetails@@");
					SFU.showError(title, errorDetails, null, null);
					ret = false;
				} else if (_controls.dtExpire.value) {
					const expiryDate = new Date(_controls.dtExpire.value);
					const currentDate = new Date(new Date().toDateString());
					if (expiryDate < currentDate) {
						title = skelta.localize.getString("@@IM_RecvExpiryDateErr@@");
						errorDetails = skelta.localize.getString("@@IM_RecvExpiryDateErrDetails@@");
						SFU.showError(title, errorDetails, null, null);
						ret = false;
					}
				}
			} else {
				ret = false;
			}
			return ret;
		}
		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwReceiveInventoryOnPostWorkflow(blockingOutput, workflowStatus) {
			const wfResult = skelta.localize.getString(blockingOutput);

			if (blockingOutput !== "" || workflowStatus !== FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				const titleString = skelta.localize.getString("@@IM_ReceiveError@@");
				SFU.showError(titleString, wfResult);
			} else if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"im",
					"im.itemInv.receive",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"IM_UI_Receive",
					"im.itemInv.receive",
				);
			}
		}

		// #region utility functions
		/**
		 *return empty string if input is null or undefined
		 * @param {string} input string or value which needs to convert as string.
		 */
		function getString(str) {
			if (str == null || typeof str === "undefined") {
				return "";
			}
			return str.toString();
		}
		// #endregion utility functions

		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			onChangeDDItem: onChangeDDItem,
			iwReceiveInventoryOnPreWorkflow: iwReceiveInventoryOnPreWorkflow,
			iwReceiveInventoryOnPostWorkflow: iwReceiveInventoryOnPostWorkflow,
		};
	}
})(window);
