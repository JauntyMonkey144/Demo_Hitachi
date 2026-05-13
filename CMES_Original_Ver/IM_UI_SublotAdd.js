/*
Name:        	IM_UI_SublotAdd.js
Description: 	IM_UI_SublotAdd js file containing logic pertaining to the add Sublot form.

Ver		Release	    By					Date					Change Description
001		01.02.00  	Praveen  		2025-06-18		#5100 First version.
*/

((window) => {
	//  ------------------------------ Global Variables ------------------------------------
	window.IM = window.IM || {};
	IM.SublotAdd = IM.SublotAdd || {};
	IM.SublotAdd = SublotAdd();
	//  ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */

	function SublotAdd() {
		//  ---------------------------- Constant Variables ----------------------------------
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;
		const _controls = {};

		// ----------------------------- Private Variables ----------------------------------
		const LVL = 1;

		// ----------------------------------------------------------------------------------
		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			//  Initialize variables
			FORM.Control = Control;
			_controls.ddItemClass = FORM.Control.findByXmlNode("DDITC");
			_controls.ddItemDesc = FORM.Control.findByXmlNode("DDIT");
			_controls.ddLot = FORM.Control.findByXmlNode("DDLT");
			_controls.txSublot = FORM.Control.findByXmlNode("TXSLT");
			_controls.ddGrade = FORM.Control.findByXmlNode("DDGD");
			_controls.ddState = FORM.Control.findByXmlNode("DDST");
			_controls.dtExpriyDate = FORM.Control.findByXmlNode("DTEXP");
			_controls.txSpare1 = FORM.Control.findByXmlNode("TXSP1");
			_controls.txSpare2 = FORM.Control.findByXmlNode("TXSP2");
			_controls.txSpare3 = FORM.Control.findByXmlNode("TXSP3");
			_controls.txSpare4 = FORM.Control.findByXmlNode("TXSP4");
			_controls.txSpare5 = FORM.Control.findByXmlNode("TXSP5");
			_controls.txSpare6 = FORM.Control.findByXmlNode("TXSP6");
			_controls.txComment = FORM.Control.findByXmlNode("TXCM");
			_controls.lbTitle = FORM.Control.findByXmlNode("LBHDR");
			_controls.hfLVL = FORM.Control.findByXmlNode("HFLVL");

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
			_controls.hfLVL.value = LVL;
			const titleString = skelta.localize.getString("@@IM_Add@@");
			_controls.lbTitle.value = titleString;
			ddItemClass();
			ddItemGradeLoad();
			ddItemStateLoad();
		}
		/**
		 * Loads the list of item grades and populates the dropdown control.
		 */
		function ddItemGradeLoad() {
			const parameterColl = {};
			FT.WebApi.mesGetAsync("api/ItemGrade", "", parameterColl, false).then(
				(data) => {
					// Handle successful response data
					let strOptions = [];
					if (data && data.length > 0) {
						// Translate the grade descriptions
						const fields = [
							FT.Ui.translationColumnField(
								"item_grade_desc",
								FT.Ui.TRANSLATION_GROUPS.grpItemGradeItemGradeDesc,
								FT.Ui.TRANSLATION_KEYS.keyItemGrade,
							),
						];
						strOptions = FT.Ui.translateArray(data, fields);
					}
					FT.WorkTasks.controlOptionsSetFromDataset("DDGD", 0, strOptions, "item_grade_desc", "item_grade_cd");
				},
				(error) => {
					// Handle error
					throw new Error("Error:", error);
				},
			);
		}
		/**
		 * Loads the list of item state and populates the dropdown control.
		 */
		function ddItemStateLoad() {
			const parameterColl = {};
			FT.WebApi.mesGetAsync("api/ItemState", "", parameterColl, false).then(
				(data) => {
					// Handle successful response data
					let strOptions = [];
					if (data && data.length > 0) {
						// Translate teh status descriptions
						const fields = [
							FT.Ui.translationColumnField(
								"item_status_desc",
								FT.Ui.TRANSLATION_GROUPS.grpItemStateItemStatusDesc,
								FT.Ui.TRANSLATION_KEYS.keyItemState,
							),
						];
						strOptions = FT.Ui.translateArray(data, fields);
					}
					FT.WorkTasks.controlOptionsSetFromDataset("DDST", 0, strOptions, "item_status_desc", "item_status_cd");
				},
				(error) => {
					// Handle error
					throw new Error("Error:", error);
				},
			);
		}
		/**
		 * Loads the list of item class and populates the dropdown control.
		 */
		function ddItemClass() {
			const parameterColl = {};
			const spName = "sp_SA_Item_Class";
			const data = FT.WebApi.mesGetSync("api/V3/DirectAccess", spName, parameterColl, false);
			FT.WorkTasks.controlOptionsSetFromDataset("DDITC", 0, data, "item_class_desc", "item_class_id");
		}

		/**
		 * Loads the list of item and populates the dropdown control.
		 */
		function ddItemLoad() {
			const parameterColl = { itemClassId: _controls.ddItemClass.value };
			const data = FT.WebApi.mesGetSync("api/V3/Item/filter", "", parameterColl, false);
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
			FT.WorkTasks.controlOptionsSetFromDataset("DDIT", 0, strOptions, "item_desc", "item_id");
		}
		/**
		 * Trigger item load when item class dropdown value changes.
		 */
		function onChangeDDItemClass() {
			ddItemLoad();
		}
		/**
		 * Trigger item load when item dropdown value changes.
		 */
		function onChangeDDItem() {
			ddLotLoad();
			setExpiryDateBasedOnLifetime();
		}
		/**
		 * Updates the expiry date control based on the lifetime of the selected item.
		 * Fetches item data using the itemId, then enables/disables and sets mandatory
		 * status of the expiry date input according to the item's lifetime value.
		 *
		 * @param {string} itemId - The ID of the selected item.
		 */
		function setExpiryDateBasedOnLifetime() {
			const parameterColl = { itemId: _controls.ddItemDesc.value };
			const data = FT.WebApi.mesGetSync("api/V3/Item/key", "", parameterColl, false);
			if (data) {
				const lifeTime = data.lifetime;
				if (lifeTime === 0 || lifeTime === null) {
					_controls.dtExpriyDate.enable = false;
					_controls.dtExpriyDate.isMandatory = false;
				} else if (lifeTime > 0) {
					_controls.dtExpriyDate.enable = true;
					_controls.dtExpriyDate.isMandatory = true;
					const currentTimestamp = new Date();
					currentTimestamp.setMinutes(currentTimestamp.getMinutes() + parseInt(lifeTime, 10));
					_controls.dtExpriyDate.value = FT.WorkTasks.dateTimeInStringFormat(_controls.dtExpriyDate, currentTimestamp.toString());
				} else {
					_controls.dtExpriyDate.enable = false;
					_controls.dtExpriyDate.isMandatory = false;
					_controls.dtExpriyDate.value = "";
				}
			}
		}
		/**
		 * Loads the list of Lot no and populates the dropdown control with the retrieved data.
		 */
		function ddLotLoad() {
			parameterColl = { itemId: _controls.ddItemDesc.value };
			const invLotData = FT.WebApi.mesGetSync("api/V3/Lot", "", parameterColl, false);
			if (invLotData.length > 0) {
				FT.WorkTasks.controlOptionsSetFromDataset("DDLT", 0, invLotData, "lot_no", "lot_no");
			}
		}

		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwSublotOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"im",
					"im.SublotAdd.add",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"IM_UI_SublotAdd",
					"im.SublotAdd.add",
				);
			}
		}

		/**
		 * Safely converts a value to a string, returning an empty string if null or undefined.
		 */
		function getString(str) {
			if (str == null || typeof str === "undefined") {
				return "";
			}
			return str.toString();
		}

		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			iwSublotOnPostWorkflow: iwSublotOnPostWorkflow,
			ddItemGradeLoad: ddItemGradeLoad,
			ddItemStateLoad: ddItemStateLoad,
			ddItemLoad: ddItemLoad,
			ddLotLoad: ddLotLoad,
			onChangeDDItemClass: onChangeDDItemClass,
			onChangeDDItem: onChangeDDItem,
			setExpiryDateBasedOnLifetime: setExpiryDateBasedOnLifetime,
		};
	}
})(window);
