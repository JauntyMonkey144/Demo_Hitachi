/*
Name:        	IM_UI_LotAttributeView.js
Description: 	IM_UI_LotAttributeView js file containing logic pertaining to the view Lot Atttibutes form.

Ver		Release	     By			    Date			   Change Description
001		01.02.00  	 Praveen    2025-06-07	 #5111 First version.
*/

((window) => {
	//  ------------------------------ Global Variables ------------------------------------
	window.IM = window.IM || {};
	IM.LotAttributeView = IM.LotAttributeView || {};
	IM.LotAttributeView = LotAttributeView();
	//  ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */

	function LotAttributeView() {
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
			_controls.txItemDesc = FORM.Control.findByXmlNode("TXITD");
			_controls.txLot_no = FORM.Control.findByXmlNode("TXLTN");
			_controls.txAttributeValue = FORM.Control.findByXmlNode("TXATV");
			_controls.txNote = FORM.Control.findByXmlNode("TXNT");
			_controls.txComment = FORM.Control.findByXmlNode("TXCMT");
			_controls.txAttribute = FORM.Control.findByXmlNode("TXATT");
			_controls.lbTitle = FORM.Control.findByXmlNode("LBHDR");

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
			const titleString = skelta.localize.getString("@@IM_HDRDetails@@");
			_controls.lbTitle.value = titleString;
			const selectedLotAttr = FT.WorkTasks.contextGet(FORM.Control, "itemInv");
			if (selectedLotAttr.length > 0) {
				bindLotAttrDetails();
			}
		}

		/**
		 * This function with a header context, where you control the display of attribute details or reset
		 *  the form fields based on user actions
		 */
		function bindLotAttrDetails() {
			const lotAttr = FT.WorkTasks.contextGet(FORM.Control, "itemInv")[0].jsonValue;
			_controls.txAttribute.value = lotAttr.attr_desc;
			_controls.txAttributeValue.value = lotAttr.attr_value;
			_controls.txNote.value = lotAttr.notes;
			_controls.txLot_no.value = lotAttr.lot_no;
			_controls.txItemDesc.value = lotAttr.item_desc;
			_controls.txComment.value = lotAttr.last_edit_comment;
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
		};
	}
})(window);
