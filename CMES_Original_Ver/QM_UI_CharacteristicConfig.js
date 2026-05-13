/*
Name:        	QM_UI_CharacteristicConfig.js
Description: 	QM_UI_CharacteristicConfig js file containing logic pertaining to the QM_UI_CharacteristicConfig form.

Ver		Release		By					Date				Change Description
001		00.70			Krishna M		2024-11-08	#2918 First version.
002		01.00			Usha M			2025-02-27	#4355 Removed console.log
003		01.00			Bas van B		2025-03-04	#4253 Translate MD in table.
004		01.00			Bas van B		2025-03-04	#4253 Translate MD in table.
005		01.00			Chitta			2025-03-20	#4531 wwOnCharLinkCatalogRowChange ,wwOnCharLinkCatalogActionChange method validation
																			  for controls.wwCharLinkCatalogDetails.widgetProperties.selectedRow
																				implemented
*/

((window) => {
	//  ------------------------------ Global Variables ------------------------------------
	window.QM = window.QM || {};
	QM.CharacteristicConfig = QM.CharacteristicConfig || {};
	QM.CharacteristicConfig = CharacteristicConfig();
	//  ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */

	function CharacteristicConfig() {
		//  ---------------------------- Constant Variables ----------------------------------
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;
		const _controls = {};
		const QM_EVENTS = "qm.characteristic.add|qm.characteristic.edit|qm.characteristic.delete";
		const QM_MODULE = "qm";
		//  ----------------------------------------------------------------------------------

		//  ----------------------------- Private Variables ----------------------------------
		const NAVIGATON_GRPID = "QM_CharButtonBar";
		const NAVIGATON_FOR = "CharCatalogLinkButton";
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
			_controls.wwCharConfigNavigation = FORM.Control.findByXmlNode("WWCCLN");
			_controls.wwCharLinkCatalogDetails = FORM.Control.findByXmlNode("WWCLC");
			_controls.hfCharID = FORM.Control.findByXmlNode("HFRID");
			_controls.iwDelCharacteristic = FORM.Control.findByXmlNode("IWDCCL");
			_controls.epCharDetail = FORM.Control.findByXmlNode("EPPRD");

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
			if (
				FORM.Control.formParameters.entId !== undefined &&
				FORM.Control.formParameters.entId.value != null &&
				FORM.Control.formParameters.entId.value !== ""
			) {
				entId = FORM.Control.formParameters.entId.value;

				if (
					FORM.Control.formParameters.entName !== undefined &&
					FORM.Control.formParameters.entName.value != null &&
					FORM.Control.formParameters.entName.value !== ""
				) {
					entName = FORM.Control.formParameters.entName.value;
				}
			} else {
				const entContext = FT.WorkTasks.contextGet(FORM.Control, "ent");
				entId = entContext[0].entId;
				entName = entContext[0].entName;
			}
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
				const charConfigNavigationData = FT.WebApi.mesGetSync(
					"api/V3/DirectAccess",
					"sp_SA_FT_Config_Actions",
					parameterCollection,
					false,
				);

				if (charConfigNavigationData.length > 0) {
					_controls.wwCharConfigNavigation.widgetProperties.selectedValue = "add";
					_controls.wwCharConfigNavigation.widgetProperties.float = "right";
					_controls.wwCharConfigNavigation.widgetProperties.data = JSON.stringify(charConfigNavigationData);
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
			wwCharLinkCatalogLoad();
			// subscribe to the QM events to update grid
			FT.Common.windowEventListenerAdd(QM_MODULE, qmEventListener);
		}
		/**
		 * listens to events that have to be reacted upon by card widget to refresh
		 */
		function qmEventListener(event) {
			// Split the module_event string into an array
			const eventList = QM_EVENTS.split("|");

			// Check if event.detail.subType matches any value in the array
			if (eventList.includes(event.detail.subType)) {
				wwCharLinkCatalogLoad();
			}
		}
		/**
		 * Function to load Prod rate details and assign data to grid widget
		 */
		function wwCharLinkCatalogLoad() {
			parameterColl = {};
			const spName = "sp_SA_QM_Characteristic";
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", spName, parameterColl, false).then(
				(data) => {
					// Handle successful response data
					// Translate the master data
					const fields = [
						FT.Ui.translationColumnField(
							"char_desc",
							FT.Ui.TRANSLATION_GROUPS.grpCharacteristicCharDesc,
							FT.Ui.TRANSLATION_KEYS.keyCharacteristic,
						),
						FT.Ui.translationColumnField("uom", FT.Ui.TRANSLATION_GROUPS.grpUomDescription, ["uom"]),
					];
					const translatedData = FT.Ui.translateArray(data, fields);
					_controls.wwCharLinkCatalogDetails.widgetProperties.data = JSON.stringify(translatedData);
					_controls.epCharDetail.url = "";
					_controls.wwCharConfigNavigation.value = "";
					_controls.wwCharConfigNavigation.widgetProperties.command = "Delete";
					wwNavigationSetData(NAVIGATON_GRPID, NAVIGATON_FOR, entName, mesUserId);
				},
				(error) => {
					// Handle error
					throw Error("Error:", error);
				},
			);
		}

		/**
		 * Function to assign ProdNavigation widget value to ProdAction Hidden Field value
		 */
		function wwOnCharLinkCatalogActionChange() {
			if (_controls.wwCharConfigNavigation.value !== "") {
				let selectedAction = JSON.parse(_controls.wwCharConfigNavigation.value);
				if (_controls.wwCharConfigNavigation.widgetProperties.selectedValue.toLowerCase() === "add") {
					const navigationData = JSON.parse(_controls.wwCharConfigNavigation.widgetProperties.data);

					$.each(navigationData, (i, item) => {
						if (item.type.toLowerCase() === "add") {
							selectedAction = item;
							return false;
						}
					});
				}
				if (selectedAction.command.toLowerCase() === "refresh") {
					_controls.wwCharConfigNavigation.widgetProperties.selectedValue = "add";
					_controls.wwCharConfigNavigation.widgetProperties.float = "right";
					_controls.wwCharConfigNavigation.widgetProperties.command = "add,edit";

					wwCharLinkCatalogLoad();
					wwNavbarLoad();
				} else if (
					_controls.wwCharLinkCatalogDetails.widgetProperties.selectedRow !== "" &&
					_controls.wwCharLinkCatalogDetails.widgetProperties.selectedRow !== "null"
				) {
					_controls.epCharDetail.url = "";
					if (selectedAction.command.toLowerCase() === "add") {
						_controls.epCharDetail.url = SFU.getFormUrl(selectedAction.form_name);
					} else if (selectedAction.command.toLowerCase() === "edit") {
						_controls.epCharDetail.url = SFU.getFormUrl(selectedAction.form_name);
					} else if (selectedAction.command.toLowerCase() === "delete") {
						SFU.showConfirmation(
							skelta.localize.getString("@@QM_DelCharCharacteristic@@"),
							skelta.localize.getString("@@QM_DelCharCharacteristicMsg@@"),
							(val) => {
								if (val) {
									SFU.invokeWorkflow(_controls.iwDelCharacteristic);
									wwNavbarLoad();
								}
							},
						);
					}
				} else {
					_controls.epCharDetail.url = "";
					_controls.epCharDetail.url = SFU.getFormUrl(selectedAction.form_name);
				}
			}
		}

		/**
		 * Function to assign ProdRateDetails widget value to Row Hidden Field value
		 */
		function wwOnCharLinkCatalogRowChange() {
			const selRow = JSON.parse(_controls.wwCharLinkCatalogDetails.widgetProperties.selectedRow);
			if (selRow !== null && selRow !== "null" && selRow !== "") {
				_controls.hfCharID.value =
					_controls.wwCharLinkCatalogDetails.widgetProperties.selectedRow != null
						? _controls.wwCharLinkCatalogDetails.widgetProperties.selectedRow
						: "";
				_controls.hfCharID.value = JSON.parse(_controls.wwCharLinkCatalogDetails.widgetProperties.selectedRow).char_id;
				const charLinkCatalogRow = JSON.parse(_controls.wwCharLinkCatalogDetails.widgetProperties.selectedRow);
				if (selRow.qm_spec_char_link === 0) {
					_controls.wwCharConfigNavigation.widgetProperties.command = "{}";
				} else {
					_controls.wwCharConfigNavigation.widgetProperties.float = "right";
					_controls.wwCharConfigNavigation.widgetProperties.command = "Delete";
				}
				wwNavigationSetData(
					NAVIGATON_GRPID,
					NAVIGATON_FOR,
					entName,
					mesUserId,
					charLinkCatalogRow.item_id !== undefined ? charLinkCatalogRow.item_id : null,
					charLinkCatalogRow.wo_id !== undefined ? charLinkCatalogRow.wo_id : null,
					charLinkCatalogRow.oper_id !== undefined ? charLinkCatalogRow.oper_id : null,
					charLinkCatalogRow.seq_no !== undefined ? charLinkCatalogRow.seq_no : null,
				);
			}
			wwOnCharLinkCatalogActionChange();
		}
		/**
		 * Function to refresh the product details after a deletion.
		 * @param {Object} blockingOutput Value returned by the workflow (e.g. instance identifier)
		 * @param {string} workflowStatus Workflow status {EX: Executing, SL: Sleeping, FE: Finished with Errors, FN: Finished Normal}
		 *  can be null if workflow is still executing.
		 */
		function iwDeleteCharLinkCatalogWorkflow(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, false, 30000);
			wwCharLinkCatalogLoad();
			_controls.wwCharConfigNavigation.widgetProperties.command = "{}";
		}

		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			wwOnCharLinkCatalogActionChange: wwOnCharLinkCatalogActionChange,
			wwOnCharLinkCatalogRowChange: wwOnCharLinkCatalogRowChange,
			iwDeleteCharLinkCatalogWorkflow: iwDeleteCharLinkCatalogWorkflow,
			wwNavbarLoad: wwNavbarLoad,
		};
	}
})(window);
