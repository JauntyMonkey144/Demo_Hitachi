/*
Name:        	AM_UI_UserLink.js
Description: 	Andon Configuration js file containing global logic pertaining to the AM_UI_UserLink Form.

Ver   Release		By						Date				Change Description
001   00.70.00 	Praveen			  2024-08-29	#3384 First version.
002		01.00.00 	Bas van B			2025-02-26	#4253 Translated Andon MD.
003		01.00.00 	Praveen 			2025-03-26	#4630 Add userdetails function
004	 	01.01.00 	Fayaz A				2025-05-28	#5008 Localization key update to refer from FT runtime locale file.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.AM = window.AM || {};
	AM.UserLink = AM.UserLink || {};
	AM.UserLink = UserLink();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function UserLink() {
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
		let errorMessage;
		// ----------------------------------------------------------------------------------
		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			// Initialize variables
			FORM.Control = Control;
			_controls.wwAndonUserLink = FORM.Control.findByXmlNode("WWUL");
			_controls.ddType = FORM.Control.findByXmlNode("DDTY");
			_controls.listUserName = FORM.Control.findByXmlNode("LIUN");
			_controls.userlookup = FORM.Control.findByXmlNode("ULUR");

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
			try {
				ddTypeLoad();
				listUserLoad();
				wwAndonUserLinkLoad();
			} catch (exception) {
				handleScriptError(exception);
			}
		}

		/**
		 * @param {*} error
		 */
		function handleScriptError(error) {
			if (error instanceof TypeError) {
				errorMessage = skelta.localize.getString("@@FT_UnexpectedType@@");
			} else if (error instanceof ReferenceError) {
				errorMessage = skelta.localize.getString("@@FT_ReferenceError@@");
			} else {
				errorMessage = skelta.localize.getString("@@FT_DuringScriptExecution@@");
			}
			SFU.showError(skelta.localize.getString("FormNGFErrorRunningScript_title"), errorMessage, null, error.message);
		}

		/**
		 * Get user name for displaying it on the dropdown control
		 * @param null
		 * @returns {JSON} data
		 */
		function listUserLoad() {
			try {
				const parameterCollection = {};
				FT.WebApi.mesGetAsync("api/V3/UserName", "", parameterCollection, false).then(
					(data) => {
						FT.WorkTasks.controlOptionsSetFromDataset("LIUN", 0, data, "user_id", "user_id");
					},
					(error) => {
						// Handle error
						throw error("Error:", error);
					},
				);
			} catch (exception) {
				handleScriptError(exception);
			}
		}
		/**
		 * Get andon user link details for displaying it on the widget
		 * @param {integer} type_id
		 * @returns {JSON} data
		 */
		function wwAndonUserLinkLoad() {
			try {
				const parameterCollection = { type_id: _controls.ddType.value };
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "SP_SA_AM_Andon_Type_User_Link", parameterCollection, false).then(
					(data) => {
						// Translate the andon types
						const fields = [
							FT.Ui.translationColumnField(
								"type_desc",
								FT.Ui.TRANSLATION_GROUPS.grpAmAndonTypeTypeDesc,
								FT.Ui.TRANSLATION_KEYS.keyAmAndonType,
							),
						];
						const translatedData = FT.Ui.translateArray(data, fields);
						_controls.wwAndonUserLink.widgetProperties.data = JSON.stringify(translatedData);
					},
					(error) => {
						// Handle error
						throw error("Error:", error);
					},
				);
			} catch (exception) {
				handleScriptError(exception);
			}
		}
		/**
		 *  Handles changes in user data and performs API calls to add user links.
		 * @param {string} listuserid
		 * @param {string} userlookup
		 * @returns {} null
		 */
		function fbAddOnDataChange(listuserid, userlookup) {
			if (userlookup !== "" && _controls.ddType.value !== "") {
				userInfo = userDetails(userlookup);
				if (userInfo.MESUserId !== "") {
					const parameterCollection = {
						type_id: _controls.ddType.value,
						user_id: userInfo.MESUserId,
					};
					FT.WebApi.mesGetAsync("api/V3/DirectAccess", "SP_I_AM_Andon_Type_User_Link", parameterCollection, false).then(
						() => {
							wwAndonUserLinkLoad();
						},
						(error) => {
							// Handle error
							throw error("Error:", error);
						},
					);
				}
			} else if (listuserid !== "" && _controls.ddType.value !== "") {
				const identifiersArray = listuserid.split(";#");
				try {
					for (let i = 0; i < identifiersArray.length; i++) {
						const parameterCollection = { type_id: _controls.ddType.value, user_id: identifiersArray[i] };
						FT.WebApi.mesGetAsync("api/V3/DirectAccess", "SP_I_AM_Andon_Type_User_Link", parameterCollection, false).then(
							() => {
								wwAndonUserLinkLoad();
							},
							(error) => {
								// Handle error
								throw error("Error:", error);
							},
						);
					}
				} catch (exception) {
					handleScriptError(exception);
				}
			}
		}
		/**
		 * deleting andon type record and load the widget
		 * @param {string} modifiedData
		 * @param {string} selectedRow
		 */
		function wwAndonUserLinkConfigDelete(modifiedData, selectedRow) {
			const parameterCollection = {
				id: selectedRow.id,
			};
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_D_AM_Andon_Type_User_Link", parameterCollection, false).then(
				() => {
					wwAndonUserLinkLoad();
				},
				(error) => {
					// Handle error
					throw error("Error:", error);
				},
			);
		}
		/**
		 * Get Type details for displaying it on the dropdown control
		 * @param null
		 * @returns {JSON} data
		 */
		function ddTypeLoad() {
			try {
				const parameterCollection = {};
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_AM_Andon_Type", parameterCollection, false).then(
					(data) => {
						// Translate the andon types
						const fields = [
							FT.Ui.translationColumnField("char_desc", FT.Ui.TRANSLATION_GROUPS.grpAmAndonTypeTypeDesc, ["char_desc"]),
						];
						const translatedData = FT.Ui.translateArray(data, fields);
						FT.WorkTasks.controlOptionsSetFromDataset("DDTY", 0, translatedData, "char_desc", "type_id");
					},
					(error) => {
						// Handle error
						throw error("Error:", error);
					},
				);
			} catch (exception) {
				handleScriptError(exception);
			}
		}
		/**
		 * dropdown type on selection change for displaying it on the widget
		 * @returns
		 */
		function ddTypeOnDataChange() {
			wwAndonUserLinkLoad();
		}
		/**
		 * Returns the information related to the user.
		 * @return {Object}
		 */
		function userDetails(getVirtualActorId) {
			const _userInfo = SFU.getUserLookupExtendedInformation(getVirtualActorId);
			// TO DO Complete information using mes webapi to retrieve additional fields

			const mesAppSettingsData = FT.WebApi.mesSystemAttr("MES App Settings", false);

			if (mesAppSettingsData && mesAppSettingsData.length !== 0) {
				const parentDomain = $(mesAppSettingsData).filter((i, item) => item.attr_id === 70101);

				if (parentDomain && parentDomain.length !== 0 && parentDomain[0].attr_value !== "") {
					domainvalue = parentDomain[0].attr_value;
					const userId = _userInfo.UserId.Contains("\\") ? _userInfo.UserId.split("\\")[1] : _userInfo.UserId;
					// If domainvalue is set, use it to format MESUserId and MESUserName
					_userInfo.MESUserId = `${domainvalue}\\${userId}`;
					_userInfo.MESUserName = `${domainvalue}\\${userId}`;
					_userInfo.MESUserDescription = _userInfo.UserName;
				}
			}

			// Directly check this condition, without using 'else'
			if (_userInfo && !_userInfo.MESUserName && _userInfo.UserDistinguishedName) {
				// CN=User Name,OU=AVEVA Users,OU=Users,OU=Project Global,DC=sd,DC=domain,DC=com
				_userInfo.MESUserDescription = _userInfo.UserName;

				// If domainvalue is empty, use the logic from UserDistinguishedName
				_userInfo.UserDistinguishedName.split(",").forEach((element) => {
					if (element.startsWith("DC=") && !_userInfo.MESUserId) {
						_userInfo.MESUserId = `${element.replace("DC=", "")}\\${_userInfo.UserId}`;
						_userInfo.MESUserName = `${element.replace("DC=", "")}\\${_userInfo.UserId}`;
					}
				});
			}

			return _userInfo;
		}
		return {
			initializeForm: initializeForm,
			listUserLoad: listUserLoad,
			ddTypeLoad: ddTypeLoad,
			wwAndonUserLinkLoad: wwAndonUserLinkLoad,
			ddTypeOnDataChange: ddTypeOnDataChange,
			fbAddOnDataChange: fbAddOnDataChange,
			wwAndonUserLinkConfigDelete: wwAndonUserLinkConfigDelete,
		};
	}
})(window);
