/*
Name:        	SC_UI_Dashboard.js
Description: 	Main js file containing global logic pertaining to the SC_UI_Dashboard form.

Ver		Release 	By					Date				Change Description
001		00.50.00	Fayaz A			2024-06-03	#2778 First version.
002		00.50.00	Praveen 	  2024-10-16	#3763 Remove all lookups and update with Web api calls.
003 	00.70.00	Somya S     2024-11-15	Corrected ESLint Errors in the file.
004		00.70.00	Somya S     2024-12-09	#4018 Header Visibility changes
005   00.70.00	Fayaz A     2025-01-22	#4190 Hardcoded entity is removed & considered entity id configured in form parameter.
006   00.70.00	Fayaz A     2025-03-24	#4563 Updated hfEntityOnDataChange fucntion to not cleared selectedValue property of wwNavigationBar.
007		01.01.00 	Fayaz A	  	2025-05-14	#4955 The function hfNavbarOnDataChange was updated to set the selected command value
																in the filterData context.
008		01.01.00 	Fayaz A			2025-05-28	#5008 Localization key update to refer from FT runtime locale file.
009		01.02.00 	Fayaz A			2025-07-01	#5067 Implemented logic to take into account the category provided in the form parameters, which is
																				used to determine and display the appropriate tabs and header based
																				on the selected category.
010		01.03.00	Somya S			2025-09-23	Sandbox issue and the 'allow-modals' keyword is not set."
*/

((window) => {
	//  ------------------------------ Global Variables ------------------------------------
	window.SC = window.SC || {};
	SC.Dashboard = SC.Dashboard || {};
	SC.Dashboard = Dashboard();
	//  ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */

	function Dashboard() {
		//  ---------------------------- Constant Variables ----------------------------------
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;
		//  ----------------------------------------------------------------------------------

		//  ----------------------------- Private Variables ----------------------------------
		const _controls = {};
		let entName = "";
		let userInfo = "";
		let mesUserId = "";
		const NAVIGATON_GRPID = "SC_Dashboard";
		let inputEntId;
		let category;
		//  ----------------------------------------------------------------------------------

		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			//  Initialize variables
			FORM.Control = Control;
			_controls.wwDropNavigation = FORM.Control.findByXmlNode("WWDN");
			_controls.hfEntity = FORM.Control.findByXmlNode("HFENT");
			_controls.hfNavbar = FORM.Control.findByXmlNode("HFNAV");
			_controls.wwNavigationBar = FORM.Control.findByXmlNode("WWNB");
			_controls.epHeader = FORM.Control.findByXmlNode("EPH");
			_controls.epContainer = FORM.Control.findByXmlNode("EPC");
			_controls.formParameters = FORM.Control.formParameters;

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
		 * Form load function
		 */
		function onFormLoad() {
			// Following code is added to support allow-modal in iframe

			$("#E2frameEmbedPage").removeAttr("sandbox");
			//  initialize context
			FT.WorkTasks.contextInit();
			const entId = FT.WorkTasks.contextGet(_controls, "entId");
			const fpCategoryValue = FT.WorkTasks.contextGet(_controls, "category");

			if (entId != null && entId !== "") {
				inputEntId = entId;
				_controls.wwDropNavigation.widgetProperties.selectedValue = entId;
			} else {
				inputEntId = null;
				_controls.wwDropNavigation.widgetProperties.selectedValue = "";
			}
			if (fpCategoryValue != null && fpCategoryValue !== "") {
				category = fpCategoryValue;
			} else {
				category = null;
			}
			userInfo = FT.WorkTasks.userInfo();
			mesUserId = userInfo.MESUserId !== undefined ? userInfo.MESUserId : null;

			const parameterColl = {
				entid: inputEntId,
				user_name: mesUserId,
			};
			let entChildrenData = FT.WebApi.mesGetSync("api/V3/DirectAccess", "sp_SA_SC_Ent_Children", parameterColl, false);
			if (entChildrenData !== undefined && entChildrenData != null && entChildrenData.length > 0) {
				const fields = [FT.Ui.translationColumnField("description", FT.Ui.TRANSLATION_GROUPS.grpEntDescription, ["value"])];
				entChildrenData = FT.Ui.translateArray(entChildrenData, fields);
				_controls.wwDropNavigation.widgetProperties.data = JSON.stringify(entChildrenData);
			} else {
				SFU.showError(
					skelta.localize.getString("@@SC_EntConfigMissing@@"),
					skelta.localize.getString("@@SC_EntConfigMissingMsg@@"),
				);
			}
		}
		/**
		 * Function to set WidgetDropNav visible script
		 */
		function wwDropNavigationSetVisibleScripts(Control) {
			$(Control.findById("W2").domElement).parent().css("overflow", "visible");
			$(Control.findById("W2").domElement).parent().parent().css("overflow", "visible");
			$(Control.findById("W2").domElement).parent().closest("div[controlid='W2']").css("z-index", "9999999999");
			return true;
		}

		/**
		 * Function to assing WidgetDropNav value to hiddenfield - Called on widget value change
		 */
		function wwDropNavigationOnDataChange() {
			try {
				_controls.hfEntity.value = _controls.wwDropNavigation.value;
			} catch (exception) {
				handleScriptError(exception);
			}
		}
		/**
		 * Function to load Supervisor Cockpit configuration for the selected entity - Called on hidden field hfEntity data change
		 */
		function hfEntityOnDataChange() {
			var hfEntValue = _controls.hfEntity.value;
			const entId = hfEntValue.id;
			entName = hfEntValue.label;
			const entObj = [
				{
					entId: entId,
					entName: entName,
					desc: null,
				},
			];
			FT.WorkTasks.contextSet(FORM.Control, "ent", JSON.stringify(entObj));

			// clear header and container embedpage
			_controls.epHeader.url = "";
			_controls.epContainer.url = "";
			_controls.wwNavigationBar.value = "";

			wwNavigationSetHeader();
			wwNavigationSetData();
		}

		/**
		 * Set navigation data from the config table
		 * @param {string} entity [optional]
		 * @param {string} grpId Group Id
		 * @param {string} navigationFor Navigation filter
		 * @returns
		 */
		function wwNavigationSetHeader() {
			try {
				const parameterCollection = {
					ent_name: entName,
					user_id: mesUserId,
					nav_grp_id: NAVIGATON_GRPID,
					type: "HeaderForm",
					category: category,
				};

				const data = FT.WebApi.mesGetSync("api/V3/DirectAccess", "sp_SA_SC_Config_Dashboard", parameterCollection, false);

				if (data.length > 0) {
					_controls.epHeader.visible = true;
					_controls.epHeader.url = "";
					_controls.epHeader.url = SFU.getFormUrl(data[0].form_name);
				} else {
					_controls.epHeader.visible = false;
				}
			} catch (exception) {
				handleScriptError(exception);
			}
		}

		/**
		 * Set navigation data from the config table
		 * @param {string} entity [optional]
		 * @param {string} grpId Group Id
		 * @param {string} navigationFor Navigation filter
		 * @returns
		 */
		function wwNavigationSetData() {
			try {
				const parameterCollection = {
					ent_name: entName,
					user_id: mesUserId,
					nav_grp_id: NAVIGATON_GRPID,
					type: "Tab",
					category: category,
				};

				const data = FT.WebApi.mesGetSync("api/V3/DirectAccess", "sp_SA_SC_Config_Dashboard", parameterCollection, false);

				if (data.length > 0) {
					// to refresh
					const currentTimestamp = new Date().toString();
					data.forEach((item) => {
						item.last_edit_comment = currentTimestamp;
					});
					_controls.wwNavigationBar.widgetProperties.data = JSON.stringify(data);
				}
			} catch (exception) {
				handleScriptError(exception);
			}
		}

		/**
		 * Function to assing widget value to hiddenfield - Called on widget value change
		 */
		function wwNavigationBarOnDataChange() {
			_controls.hfNavbar.value = _controls.wwNavigationBar.value;
		}

		/**
		 * Function to assing form name to embed page - Called on hidden field hfNavBar data change
		 */
		function hfNavbarOnDataChange() {
			_controls.epContainer.url = "";
			if (_controls.hfNavbar.value !== "") {
				const selectedAction = JSON.parse(_controls.hfNavbar.value);
				if (selectedAction) {
					const formName = selectedAction.form_name;
					const filterDataObj = [{ type: "commandSelected", jsonValue: JSON.stringify(selectedAction) }];
					FT.WorkTasks.contextSet("", "filterData", JSON.stringify(filterDataObj));
					_controls.epContainer.url = SFU.getFormUrl(formName);
				}
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
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			wwDropNavigationSetVisibleScripts: wwDropNavigationSetVisibleScripts,
			wwDropNavigationOnDataChange: wwDropNavigationOnDataChange,
			hfEntityOnDataChange: hfEntityOnDataChange,
			wwNavigationBarOnDataChange: wwNavigationBarOnDataChange,
			hfNavbarOnDataChange: hfNavbarOnDataChange,
		};
	}
})(window);
