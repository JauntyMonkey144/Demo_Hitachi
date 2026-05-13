/*
Name:        	OM_UI_Edit.js
Description: 	OM_UI_Edit js file containing global logic pertaining to the OM_UI_Edit Form.

Ver							By						Date					Change Description
001							Ramesh V		 	2024-07-03		#3003 First version.
002							Shamanth S	 	2024-10-11		#3493 Removed hard coded UOM "PIECES" and passing dynamic value from api.
003							Bas van B			2025-02-20		#4253 Translate wo_desc and uom_desc fields.
004							Bas van B			2025-02-21		#4253	Use correct constants for translation GROUPS and KEYS.
005		01.01			Bas van B			2025-02-21		#4253 Use public TRANSLATION_GROUP and TRANSLATION_KEYS Ui objects to avoid
																						errors when loaded as widget.
006		01.01.00	Fayaz A	  		2025-05-14		#4955 A global variable, commandSelected, is defined to fetch and hold the selected
																						command's action details from filterData context on form load.
*/
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.OM = window.OM || {};
	OM.Details = OM.Details || {};
	OM.Details = Details();
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
		const _controls = {};
		// ----------------------------------------------------------------------------------

		// ----------------------------- Private Variables ----------------------------------
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
			_controls.txWoId = FORM.Control.findByXmlNode("TXWID");
			_controls.txWoDesc = FORM.Control.findByXmlNode("TXWODS");
			_controls.txManfOrder = FORM.Control.findByXmlNode("TXMO");
			_controls.nrStartQty = FORM.Control.findByXmlNode("NRSQTY");
			_controls.nrReqQty = FORM.Control.findByXmlNode("NRRQTY");
			_controls.nrPriority = FORM.Control.findByXmlNode("NRPR");
			_controls.dtReleaseDate = FORM.Control.findByXmlNode("DTRD");
			_controls.dtDueDate = FORM.Control.findByXmlNode("DTDD");
			_controls.txCustomer = FORM.Control.findByXmlNode("TXCUST");
			_controls.txNotes = FORM.Control.findByXmlNode("TXNTS");
			_controls.hfNumDecimals = FORM.Control.findByXmlNode("HFNDEC");
			_controls.hfItemId = FORM.Control.findByXmlNode("HFIMID");
			_controls.lbStartUom = FORM.Control.findByXmlNode("LBSUM");
			_controls.lbReqUom = FORM.Control.findByXmlNode("LBRUM");

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
			// get context value of job & or setValue to hidden fields
			let woDetails;
			let parameterColl;
			// get context value of WO & or setValue to hidden fields
			const woContext = FT.WorkTasks.contextGet(FORM.Control, "wo");
			const filterData = FT.WorkTasks.contextGet(FORM.Control, "filterData");
			commandSelected = filterData.find((item) => item.type === "commandSelected");
			if (commandSelected) {
				commandSelected = JSON.parse(commandSelected.jsonValue);
				// Sample code to access context properties
				codeValue = commandSelected.code;
			}
			if (woContext && woContext.length > 0) {
				// fetch WO details from API
				parameterColl = { woId: woContext[0].woId };
				FT.WebApi.mesGetAsync("api/v3/WO/key", "", parameterColl, false).then(
					(data) => {
						// Handle successful response data
						if (data) {
							woDetails = data;
							// Set values to respective controls
							_controls.txWoId.value = woDetails.wo_id;
							_controls.txWoDesc.value = FT.Ui.translateValue(
								FT.Ui.TRANSLATION_GROUPS.grpWoWoDesc,
								woDetails.wo_desc,
								woDetails.wo_desc,
							);
							_controls.txManfOrder.value = woDetails.mo_id;
							_controls.nrStartQty.value = woDetails.qty_at_start;
							_controls.nrReqQty.value = woDetails.req_qty;
							_controls.nrPriority.value = woDetails.wo_priority;
							_controls.dtReleaseDate.value = FT.WorkTasks.dateTimeInStringFormat(
								_controls.dtReleaseDate,
								woDetails.release_time_utc,
							);
							_controls.dtDueDate.value = FT.WorkTasks.dateTimeInStringFormat(_controls.dtDueDate, woDetails.req_finish_time_utc);
							_controls.txCustomer.value = woDetails.cust_info;
							_controls.txNotes.value = woDetails.notes;
							_controls.hfNumDecimals.value = woDetails.num_decimals;
							_controls.hfItemId.value = woDetails.item_id;
							setDecimalPlaces(_controls.nrStartQty, parseInt(_controls.hfNumDecimals.value, 10));
							setDecimalPlaces(_controls.nrReqQty, parseInt(_controls.hfNumDecimals.value, 10));
							// ver 002
							_controls.lbStartUom.value = FT.Ui.translateValue(
								FT.Ui.TRANSLATION_GROUPS.grpUomDescription,
								woDetails.uom_desc,
								woDetails.uom_desc,
							);
							_controls.lbReqUom.value = FT.Ui.translateValue(
								FT.Ui.TRANSLATION_GROUPS.grpUomDescription,
								woDetails.uom_desc,
								woDetails.uom_desc,
							);
						}
					},
					(error) => {
						// Handle error
						throw new Error("Error:", error);
					},
				);
			}
		}
		/**
		 * Set the number of decimal places for a numeric control.
		 *
		 * @param {Object} control - The control to set decimal places for.
		 * @param {number} decimalPlaces - The number of decimal places to set.
		 */
		function setDecimalPlaces(control, decimalPlaces) {
			// Check if the control is undefined
			if (SFU.isUndefined(control)) {
				return;
			}

			try {
				const { value } = control;

				// Set the number of decimal places in the culture settings
				kendo.cultures[`${control.id}-culture`].numberFormat.decimals = decimalPlaces;

				const formatN = `n${decimalPlaces}`;

				// Set the options for the kendoNumericTextBox
				$($(control.domElement).parent()[0])
					.find("[data-skrl=skNumPkr]")
					.data("kendoNumericTextBox")
					.setOptions({ decimals: decimalPlaces, format: formatN });

				// Set the value for the kendoNumericTextBox
				$($(control.domElement).parent()[0]).find("[data-skrl=skNumPkr]").data("kendoNumericTextBox").value(value);
			} catch (ex) {
				// Handle error
				throw new Error("Error:", ex);
			}
		}

		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
		};
	}
})(window);
