/*
Name:        	IM_UI_SublotEdit.js
Description: 	IM_UI_SublotEdit js file containing logic pertaining to the edit Sublot form.

Ver		Release   	By					Date					Change Description
001		01.02.00  	Praveen  		2025-06-18		#5099 First version.
*/

((window) => {
	//  ------------------------------ Global Variables ------------------------------------
	window.IM = window.IM || {};
	IM.SublotEdit = IM.SublotEdit || {};
	IM.SublotEdit = SublotEdit();
	//  ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */

	function SublotEdit() {
		//  ---------------------------- Constant Variables ----------------------------------
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;
		const _controls = {};
		//  ----------------------------------------------------------------------------------

		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			//  Initialize variables
			FORM.Control = Control;
			_controls.ddItemDesc = FORM.Control.findByXmlNode("DDITD");
			_controls.txLot = FORM.Control.findByXmlNode("TXLT");
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
			_controls.blSeriano = FORM.Control.findByXmlNode("BLSN");

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
			const titleString = skelta.localize.getString("@@IM_Edit@@");
			_controls.lbTitle.value = titleString;
			const selectedLot = FT.WorkTasks.contextGet(FORM.Control, "itemInv");
			if (selectedLot.length > 0) {
				ddItemLoad();
				ddItemGradeLoad();
				ddItemStateLoad();
				bindSublotDetails(selectedLot[0].jsonValue);
			}
		}
		/**
		 * Loads the list of item grades and populates the dropdown control.
		 */
		function ddItemGradeLoad() {
			const parameterColl = {};
			const itemGrade = FT.WebApi.mesGetSync("api/ItemGrade", "", parameterColl, false);
			let strOptions = [];
			if (itemGrade.length > 0) {
				// Translate the grade descriptions
				const fields = [
					FT.Ui.translationColumnField(
						"item_grade_desc",
						FT.Ui.TRANSLATION_GROUPS.grpItemGradeItemGradeDesc,
						FT.Ui.TRANSLATION_KEYS.keyItemGrade,
					),
				];
				strOptions = FT.Ui.translateArray(itemGrade, fields);
			}
			FT.WorkTasks.controlOptionsSetFromDataset("DDGD", 0, strOptions, "item_grade_desc", "item_grade_cd");
		}

		/**
		 * Loads the list of item state and populates the dropdown control.
		 */
		function ddItemStateLoad() {
			const parameterColl = {};
			const itemState = FT.WebApi.mesGetSync("api/ItemState", "", parameterColl, false);
			let strOptions = [];
			if (itemState.length > 0) {
				// Translate teh status descriptions
				const fields = [
					FT.Ui.translationColumnField(
						"item_status_desc",
						FT.Ui.TRANSLATION_GROUPS.grpItemStateItemStatusDesc,
						FT.Ui.TRANSLATION_KEYS.keyItemState,
					),
				];
				strOptions = FT.Ui.translateArray(itemState, fields);
			}
			FT.WorkTasks.controlOptionsSetFromDataset("DDST", 0, strOptions, "item_status_desc", "item_status_cd");
		}

		/**
		 * Binds sublot details from the given object to the corresponding UI controls.
		 * @param {Object} SublotObj - The sublot details object.
		 */
		function bindSublotDetails(SublotObj) {
			if (SublotObj) {
				// Handle successful response data
				_controls.ddItemDesc.value = SublotObj.item_id;
				_controls.txLot.value = SublotObj.lot_no;
				_controls.txSublot.value = SublotObj.sublot_no;
				_controls.ddGrade.value = SublotObj.grade_cd;
				_controls.ddState.value = SublotObj.status_cd;
				_controls.dtExpriyDate.value =
					SublotObj.expiry_date !== null
						? FT.WorkTasks.dateTimeInStringFormat(_controls.dtExpriyDate, SublotObj.expiry_date)
						: "";
				_controls.txSpare1.value = SublotObj.spare1;
				_controls.txSpare2.value = SublotObj.spare2;
				_controls.txSpare3.value = SublotObj.spare3;
				_controls.txSpare4.value = SublotObj.spare4;
				_controls.txSpare5.value = SublotObj.spare5;
				_controls.txSpare6.value = SublotObj.spare6;
				_controls.txComment.value = SublotObj.last_edit_comment;
				_controls.blSeriano.defaultValue = SublotObj.is_serial_no === false ? "False" : "True";
			}
		}
		/**
		 * Loads the list of item  and populates the dropdown control
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
			FT.WorkTasks.controlOptionsSetFromDataset("DDITD", 0, strOptions, "item_desc", "item_id");
		}

		/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwEditSubotOnPostWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"im",
					"im.SublotEdit.edit",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"IM_UI_SublotEdit",
					"im.SublotEdit.edit",
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
			iwEditSubotOnPostWorkflow: iwEditSubotOnPostWorkflow,
		};
	}
})(window);
