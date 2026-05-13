/*
Name:        	IM_UI_SublotView.js
Description: 	IM_UI_SublotView js file containing logic pertaining to the Sublot details form.

Ver		Release    	By					Date					Change Description
001		01.02.00  	Praveen  		2025-06-18		#5098 First version.
*/

((window) => {
	//  ------------------------------ Global Variables ------------------------------------
	window.IM = window.IM || {};
	IM.SublotView = IM.SublotView || {};
	IM.SublotView = SublotView();
	//  ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */

	function SublotView() {
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
			_controls.txItemDesc = FORM.Control.findByXmlNode("TXTD");
			_controls.txLot = FORM.Control.findByXmlNode("TXLT");
			_controls.txSublot = FORM.Control.findByXmlNode("TXSLT");
			_controls.txGradeDesc = FORM.Control.findByXmlNode("TXGRD");
			_controls.txStateDesc = FORM.Control.findByXmlNode("TXSTD");
			_controls.txExpriyDate = FORM.Control.findByXmlNode("TXEXP");
			_controls.txSpare1 = FORM.Control.findByXmlNode("TXSP1");
			_controls.txSpare2 = FORM.Control.findByXmlNode("TXSP2");
			_controls.txSpare3 = FORM.Control.findByXmlNode("TXSP3");
			_controls.txSpare4 = FORM.Control.findByXmlNode("TXSP4");
			_controls.txSpare5 = FORM.Control.findByXmlNode("TXSP5");
			_controls.txSpare6 = FORM.Control.findByXmlNode("TXSP6");
			_controls.txComment = FORM.Control.findByXmlNode("TXCM");
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
			const selectedLot = FT.WorkTasks.contextGet(FORM.Control, "itemInv");
			if (selectedLot.length > 0) {
				bindSublotDetails(selectedLot[0].jsonValue.item_id, selectedLot[0].jsonValue.lot_no, selectedLot[0].jsonValue.sublot_no);
			}
		}
		/**
		 * Fetches and binds lot details to UI controls based on item ID and lot number.
		 * @param {string} itemId
		 * @param {string} lotno
		 * @param {string} sublotno
		 * @returns {JSON} data
		 */
		function bindSublotDetails(itemId, lotno, sublotno) {
			const parameterColl = { item_id: itemId, lot_no: lotno, sublot_no: sublotno };
			const spName = "sp_SA_IM_Sublot";
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", spName, parameterColl, false).then(
				(data) => {
					// Handle successful response data
					_controls.txItemDesc.value = data[0].item_desc;
					_controls.txLot.value = data[0].lot_no;
					_controls.txSublot.value = data[0].sublot_no;
					_controls.txGradeDesc.value = data[0].item_grade_desc;
					_controls.txStateDesc.value = data[0].item_status_desc;
					_controls.txExpriyDate.value = FT.WorkTasks.dateTimeInStringFormat(_controls.txExpriyDate, data[0].expiry_date);
					_controls.txSpare1.value = data[0].spare1;
					_controls.txSpare2.value = data[0].spare2;
					_controls.txSpare3.value = data[0].spare3;
					_controls.txSpare4.value = data[0].spare4;
					_controls.txSpare5.value = data[0].spare5;
					_controls.txSpare6.value = data[0].spare6;
					_controls.txComment.value = data[0].last_edit_comment;
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
		};
	}
})(window);
