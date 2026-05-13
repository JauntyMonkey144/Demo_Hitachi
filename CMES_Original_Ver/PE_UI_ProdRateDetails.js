/*
Name:        	PE_UI_ProdRateDetails.js
Description: 	PE_UI_ProdRateDetails js file containing logic pertaining to the PE_UI_ProdRateDetails form.

Ver	 Release	By				Date					Change Description
001	 00.70    Ramesh V	2024-06-22		#2918 First version.
002	 00.70    Praveen		2024-10-18		#3249 Navigation Button Control Hardcode.
003  01.00    Usha M		2025-02-26    #4355 Removed console.log.
004	 01.00	  Bas van B	2025-02-27		#4253 Translate MD.
005	 01.00    Fayaz A		2025-03-27		#4628 In the function wwOnProdRateRowChange and
                                            wwOnProdRateActionChange null check for selected row is included.
006	 01.01.00 Praveen		2025-04-30    #4877 In the function wwOnProdRateRowChange remove the wwNavigationSetData() and check the grid selection.
007	 01.01.00 Praveen   2025-05-29		#4997 Rename the procedure name sp_SA_PE_Prod_Rate in the onFormLoad().

*/

((window) => {
	//  ------------------------------ Global Variables ------------------------------------
	window.PE = window.PE || {};
	PE.ProdRateDetails = PE.ProdRateDetails || {};
	PE.ProdRateDetails = ProdRateDetails();
	//  ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */

	function ProdRateDetails() {
		//  ---------------------------- Constant Variables ----------------------------------
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;
		const _controls = {};
		const PE_EVENTS = "pe.prodRate.add|pe.prodRate.update";
		const PE_MODULE = "pe";
		//  ----------------------------------------------------------------------------------

		//  ----------------------------- Private Variables ----------------------------------
		const NAVIGATON_GRPID = "PE_ProdRateButtonBar";
		const NAVIGATON_FOR = "ProductionButton";
		let userInfo = "";
		let entName = "";
		let mesUserId = "";
		//  ----------------------------------------------------------------------------------

		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			//  Initialize variables
			FORM.Control = Control;
			_controls.wwProdRateNavigation = FORM.Control.findByXmlNode("WWPRN");
			_controls.wwProdRateDetails = FORM.Control.findByXmlNode("WWPRQ");
			_controls.hfProdRateAction = FORM.Control.findByXmlNode("HFPRA");
			_controls.hfProdRateRow = FORM.Control.findByXmlNode("HFPR");
			_controls.hfRowId = FORM.Control.findByXmlNode("HFRID");
			_controls.iwDelProdRate = FORM.Control.findByXmlNode("IWDEL");
			_controls.epProdRateDetail = FORM.Control.findByXmlNode("EPPRD");

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
		 * Get Navigation details for displaying it on the Navbar widget
		 */
		function wwNavbarLoad() {
			userInfo = FT.WorkTasks.userInfo();
			mesUserId = userInfo.MESUserId !== undefined ? userInfo.MESUserId : null;
			const entContext = FT.WorkTasks.contextGet(FORM.Control, "ent");
			entName = entContext[0].entName;
			wwNavigationSetData(NAVIGATON_GRPID, NAVIGATON_FOR, entName, mesUserId);
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
				const prodRateActionsData = FT.WebApi.mesGetSync(
					"api/V3/DirectAccess",
					"sp_SA_FT_Config_Actions",
					parameterCollection,
					false,
				);

				if (prodRateActionsData.length > 0) {
					prodRateActionsData[0].cfg_desc = Date().toString();
					_controls.wwProdRateNavigation.widgetProperties.selectedValue = "Add";
					_controls.wwProdRateNavigation.widgetProperties.float = "right";
					_controls.wwProdRateNavigation.widgetProperties.command = "Edit,Delete";
					_controls.wwProdRateNavigation.widgetProperties.data = JSON.stringify(prodRateActionsData);
				}
			} catch (exception) {
				handleScriptError(exception);
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
			wwNavbarLoad();
			wwProdRateDetailsLoad();
			FT.Common.windowEventListenerAdd(PE_MODULE, peEventListener);
		}

		/**
		 * listens to events that have to be reacted upon by card widget to refresh
		 */
		function peEventListener(event) {
			// Split the module_event string into an array
			const eventList = PE_EVENTS.split("|");
			// Check if event.detail.subType matches any value in the array
			if (eventList.includes(event.detail.subType)) {
				wwOnProdRateActionChangeRefresh();
			}
		}

		/**
		 * Function to load Prod rate details and assign data to grid widget
		 */
		function wwProdRateDetailsLoad() {
			parameterColl = {};
			const spName = "sp_SA_PE_Prod_Rate";

			FT.WebApi.mesGetAsync("api/V3/DirectAccess", spName, parameterColl, false).then(
				(data) => {
					// Handle successful response data
					// Translate the data

					const fields = [
						FT.Ui.translationColumnField("uom", FT.Ui.TRANSLATION_GROUPS.grpUomDescription, ["uom"]),
						FT.Ui.translationColumnField("ent_name", FT.Ui.TRANSLATION_GROUPS.grpEntDescription, FT.Ui.TRANSLATION_KEYS.keyEnt),
						FT.Ui.translationColumnField("item_id", FT.Ui.TRANSLATION_GROUPS.grpItemItemDesc, FT.Ui.TRANSLATION_KEYS.keyItem),
					];
					const translatedData = FT.Ui.translateArray(data, fields);
					_controls.wwProdRateDetails.widgetProperties.data = JSON.stringify(translatedData);
				},
				(error) => {
					// Handle error
					throw Error("Error:", error);
				},
			);
		}

		/**
		 * Function that have to be reacted upon by card widget to refresh
		 */
		function wwOnProdRateActionChangeRefresh() {
			_controls.wwProdRateNavigation.widgetProperties.float = "right";
			wwNavbarLoad();
			wwProdRateDetailsLoad();
		}

		/**
		 * Function to assign ProdNavigation widget value to ProdAction Hidden Field value
		 */
		function wwOnProdRateActionChange() {
			const selectedAction = JSON.parse(_controls.wwProdRateNavigation.value);
			if (selectedAction.command.toLowerCase() === "refresh") {
				wwOnProdRateActionChangeRefresh();
			} else if (_controls.wwProdRateDetails.widgetProperties.selectedRow) {
				_controls.epProdRateDetail.url = "";
				_controls.hfRowId.value = JSON.parse(_controls.wwProdRateDetails.widgetProperties.selectedRow).row_id;
				if (selectedAction.command.toLowerCase() === "add") {
					_controls.epProdRateDetail.url = SFU.getFormUrl(selectedAction.form_name);
				} else if (selectedAction.command.toLowerCase() === "edit") {
					_controls.epProdRateDetail.url = SFU.getFormUrl(selectedAction.form_name);
				} else if (selectedAction.command.toLowerCase() === "delete") {
					SFU.showConfirmation(
						skelta.localize.getString("@@PE_DelProdRate@@"),
						skelta.localize.getString("@@PE_DelProdRateConfMsg@@"),
						(val) => {
							if (val) {
								SFU.invokeWorkflow(_controls.iwDelProdRate);
								wwNavbarLoad();
							}
						},
					);
				}
			} else {
				_controls.epProdRateDetail.url = "";
				_controls.epProdRateDetail.url = SFU.getFormUrl(selectedAction.form_name);
			}
		}

		/**
		 * Function to assign ProdRateDetails widget value to Row Hidden Field value
		 */
		function wwOnProdRateRowChange() {
			if (
				_controls.wwProdRateDetails.widgetProperties.selectedRow !== null &&
				_controls.wwProdRateDetails.widgetProperties.selectedRow !== ""
			) {
				_controls.hfProdRateRow.value =
					_controls.wwProdRateDetails.widgetProperties.selectedRow != null
						? _controls.wwProdRateDetails.widgetProperties.selectedRow
						: "";
				_controls.wwProdRateNavigation.widgetProperties.command = "{}";
				wwOnProdRateActionChange();
			} else {
				_controls.wwProdRateNavigation.widgetProperties.command = "{}";
				_controls.wwProdRateNavigation.widgetProperties.command = "Edit,Delete";
			}
		}
		/**
		 * Function to refresh the product details after a deletion.
		 *  * @param {Object} blockingOutput Value returned by the workflow (e.g. instance identifier)
		 * @param {string} workflowStatus Workflow status {EX: Executing, SL: Sleeping, FE: Finished with Errors, FN: Finished Normal}
		 *  can be null if workflow is still executing.
		 */
		function iwDeleteProdRateWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, false, 30000);
			wwProdRateDetailsLoad();
		}
		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			wwOnProdRateActionChange: wwOnProdRateActionChange,
			wwOnProdRateRowChange: wwOnProdRateRowChange,
			iwDeleteProdRateWorkflow: iwDeleteProdRateWorkflow,
			wwNavbarLoad: wwNavbarLoad,
		};
	}
})(window);
