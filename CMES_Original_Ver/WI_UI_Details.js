/*
Name:        	WI_UI_Details.js
Description: 	WI_UI_Details.js js file containing global logic pertaining to the WI_UI_Details Form.

Ver	Release	By				Date				Change Description
001	00.70		Praveen		2024-05-24	#3110 First version.
002	00.70		Somya		  2024-12-02	#3726 Review Comment Changes.
003	01.00		Bas van B	2025-03-05	#4253 Translate entity and item descriptions in dropdowns.
*/

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.WI = window.WI || {};
	WI.Details = WI.Details || {};
	WI.Details = Details();
	// ------------------------------------------------------------------------------------
	/**
	 * Details
	 *
	 * @returns {null} Details template object.
	 */
	function Details() {
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
		let userInfo = "";
		let mesUserId = "";
		// ----------------------------------------------------------------------------------
		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			// Initialize variables
			FORM.Control = Control;
			_controls.ddInstructionType = FORM.Control.findByXmlNode("DDTY");
			_controls.ddEntity = FORM.Control.findByXmlNode("DDEN");
			_controls.ddItem = FORM.Control.findByXmlNode("DDII");
			_controls.ddFiles = FORM.Control.findByXmlNode("DDFN");
			_controls.lbInstructionMsg = FORM.Control.findByXmlNode("LBIM");

			_controls.wwFileViewer = FORM.Control.findByXmlNode("WWFV");

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
		 * Form load function
		 */
		function onFormLoad() {
			try {
				_controls.wwFileViewer.visible = false;
				ddEntityDataLoad();
				ddInstructionTypeDataLoad();
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
				errorMessage = skelta.localize.getString("@@WI_UnexpectedType@@");
			} else if (error instanceof ReferenceError) {
				errorMessage = skelta.localize.getString("@@WI_ReferenceError@@");
			} else {
				errorMessage = skelta.localize.getString("@@WI_DuringScriptExecution@@");
			}
			SFU.showError(skelta.localize.getString("FormNGFErrorRunningScript_title"), errorMessage, null, error.message);
			throw errorMessage;
		}
		/**
		 * 	/**
		 * Set data to entity dropdown
		 */
		function ddEntityDataLoad() {
			userInfo = FT.WorkTasks.userInfo();
			mesUserId = userInfo.MESUserId !== undefined ? userInfo.MESUserId : null;
			const parameterColl = { userId: mesUserId };
			FT.WebApi.mesGetAsync("api/V3/UserEntityAccess", "", parameterColl, false).then(
				(data) => {
					// Handle successful response data
					if (data != null && data.length > 0) {
						// Translate the entity descriptions
						const fields = [
							FT.Ui.translationColumnField(
								"ent_desc",
								FT.Ui.TRANSLATION_GROUPS.grpEntDescription,
								FT.Ui.TRANSLATION_KEYS.keyEnt,
								"ent_name",
							),
						];
						const translatedData = FT.Ui.translateArray(data, fields);
						// Assign data to the dropdown.
						FT.WorkTasks.controlOptionsSetFromDataset("DDEN", 0, translatedData, "ent_desc", "ent_id");
					}
				},
				(error) => {
					// Handle error
					throw new Error("Error:", error);
				},
			);
		}
		/**
		 * Set data to item dropdown
		 */
		function ddItemDataLoad() {
			const entId = _controls.ddEntity.value !== undefined && _controls.ddEntity.value !== "" ? _controls.ddEntity.value : null;

			try {
				const parameterCollection = {
					ent_id: entId,
				};
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_WI_instruction_Items", parameterCollection, false).then(
					(data) => {
						// Translate the item descriptions
						const fields = [
							FT.Ui.translationColumnField("item_desc", FT.Ui.TRANSLATION_GROUPS.grpItemItemDesc, FT.Ui.TRANSLATION_KEYS.keyItem),
						];
						const translatedData = FT.Ui.translateArray(data, fields);
						// Assign data to the dropdown.
						FT.WorkTasks.controlOptionsSetFromDataset("DDII", 0, translatedData, "item_desc", "item_id");
					},
					(error) => {
						// Handle error
						throw new Error("Error:", error);
					},
				);
			} catch (exception) {
				handleScriptError(exception);
			}
		}
		/**
		 * Set data to instruction type dropdown
		 */
		function ddInstructionTypeDataLoad() {
			const parameterColl = {};
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "SP_SA_WI_Instruction_Type", parameterColl, false).then(
				(data) => {
					// Handle successful response data
					if (data != null && data.length > 0) {
						FT.WorkTasks.controlOptionsSetFromDataset("DDTY", 0, data, "type_desc", "type_id");
					}
				},
				(error) => {
					// Handle error
					throw new Error("Error:", error);
				},
			);
		}

		/**
		 * Set data to Files dropdown
		 */
		function ddFilesDataLoad() {
			const entId = _controls.ddEntity.value !== undefined && _controls.ddEntity.value !== "" ? _controls.ddEntity.value : null;
			const prodId = _controls.ddItem.value !== undefined && _controls.ddItem.value !== "" ? _controls.ddItem.value : null;
			const typeId =
				_controls.ddInstructionType.value !== undefined && _controls.ddInstructionType.value !== ""
					? _controls.ddInstructionType.value
					: null;

			try {
				const parameterCollection = {
					ent_id: entId,
					item_id: prodId,
					type_id: typeId,
				};
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_WI_instruction", parameterCollection, false).then(
					(fileData) => {
						FT.WorkTasks.controlOptionsSetFromDataset("DDFN", 0, fileData, "reas_desc", "reas_cd");
					},
					(error) => {
						// Handle error
						throw new Error("Error:", error);
					},
				);
			} catch (exception) {
				handleScriptError(exception);
			}
		}
		/**
		 * Includes js files specified in LIST_JS
		 */
		function includeJsFiles() {
			SFU.includeCustomJsFiles(LIST_JS);
		}
		/**
		 * Prepare json data from selected file item details and bind it to FileViewer widget
		 */
		function wwFileViewerDataLoad() {
			const fileId = _controls.ddFiles.value;
			try {
				const parameterCollection = {
					row_id: fileId,
				};
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_S_WI_instruction", parameterCollection, false).then(
					(fileData) => {
						if (fileData.length > 0) {
							_controls.wwFileViewer.widgetProperties.displayTitle = fileData[0].file_desc;
							const wwFileData = [];
							const fileRawData = {
								type: fileData[0].file_type,
								file_path: fileData[0].file_path,
								reas_desc: fileData[0].file_desc,
							};

							wwFileData.push(fileRawData);
							_controls.wwFileViewer.widgetProperties.data = JSON.stringify(wwFileData);
							_controls.lbInstructionMsg.visible = false;
							_controls.wwFileViewer.visible = true;
						} else {
							_controls.lbInstructionMsg.visible = true;
							_controls.lbInstructionMsg.value = skelta.localize.getString("@@WI_NoDataMsg@@");
							_controls.wwFileViewer.visible = false;
						}
					},
					(error) => {
						// Handle error
						_controls.lbInstructionMsg.visible = true;
						_controls.lbInstructionMsg.value = skelta.localize.getString("@@WI_NoDataMsg@@");
						_controls.wwFileViewer.visible = false;
						throw error("Error:", error);
					},
				);
			} catch (exception) {
				handleScriptError(exception);
			}
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
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			ddItemDataLoad: ddItemDataLoad,
			ddInstructionTypeDataLoad: ddInstructionTypeDataLoad,
			ddFilesDataLoad: ddFilesDataLoad,
			wwFileViewerDataLoad: wwFileViewerDataLoad,
		};
	}
})(window);
