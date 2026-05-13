/*
Name:        	WI_UI_Add.js
Description: 	WI_UI_Add js file containing global logic pertaining to the WI_UI_Add Form.

Ver	 	Release			By					Date				Change Description
001		00.70.00		Fayaz A 		2024-09-05	#3459 First version.
002		01.01.00		Praveen 		2025-05-09	#4872 checking the validate of file type in fileupload control.
003		01.01.00 		Fayaz A			2025-05-28	#5008 Localization key update to refer from FT runtime locale file.
*/
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.WI = window.WI || {};
	WI.Add = WI.Add || {};
	WI.Add = Add();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function Add() {
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;
		const GRP_ID = "WI_Config";
		const CATEGORY = "FileLocation";
		// ----------------------------------------------------------------------------------

		// ----------------------------- Private Variables ----------------------------------
		const _controls = {};
		let filePath = "";
		let userInfo = "";
		let mesUserId = "";
		let controlElement = "";
		// ----------------------------------------------------------------------------------
		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			// Initialize variables
			FORM.Control = Control;
			_controls.ddInstructionType = FORM.Control.findByXmlNode("DDWIT");
			_controls.ddEntity = FORM.Control.findByXmlNode("DDEN");
			_controls.ddItem = FORM.Control.findByXmlNode("DDIT");
			_controls.ddBomVerId = FORM.Control.findByXmlNode("DDBV");
			_controls.ddFileType = FORM.Control.findByXmlNode("DDFT");
			_controls.attFileUploadImage = FORM.Control.findByXmlNode("ATFNI");
			_controls.attFileUploadDocx = FORM.Control.findByXmlNode("ATFND");
			_controls.attFileUploadPDF = FORM.Control.findByXmlNode("ATFNP");
			_controls.attFileUploadVideo = FORM.Control.findByXmlNode("ATFNV");
			_controls.txtFileName = FORM.Control.findByXmlNode("TXFN");
			_controls.hfFilePath = FORM.Control.findByXmlNode("HFFP");
			_controls.iwAdd = FORM.Control.findByXmlNode("IWA");

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
			ddWorkInstructionsTypeLoad();
			ddEntitiesLoad();
			ddItemListLoad();
			getFilePath();
			visibleAttachmentButton();
		}
		/**
		 * Loads the list of item and populates the dropdown control
		 *  with the retrieved data.
		 * @returns {Object|null} The retrieved Items data, or null if the request fails.
		 */
		function ddWorkInstructionsTypeLoad() {
			parameterColl = {};
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "SP_SA_WI_Instruction_Type", parameterColl, false).then(
				(data) => {
					// Handle successful response data
					if (data != null && data.length > 0) {
						FT.WorkTasks.controlOptionsSetFromDataset("DDWIT", 0, data, "type_desc", "type_id");
					}
				},
				(error) => {
					// Handle error
					handleScriptError(error);
				},
			);
		}
		/**
		 * Loads the list of item and populates the dropdown control
		 *  with the retrieved data.
		 * @returns {Object|null} The retrieved Items data, or null if the request fails.
		 */
		function ddEntitiesLoad() {
			userInfo = FT.WorkTasks.userInfo();
			mesUserId = userInfo.MESUserId !== undefined ? userInfo.MESUserId : null;
			parameterColl = { userId: mesUserId };
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
					handleScriptError(error);
				},
			);
		}
		/**
		 * Loads the list of item and populates the dropdown control
		 *  with the retrieved data.
		 * @returns {Object|null} The retrieved Items data, or null if the request fails.
		 */
		function ddItemListLoad() {
			parameterColl = {};
			const apiPath = "api/V3/Item";
			FT.WebApi.mesGetAsync(apiPath, "", parameterColl, false).then(
				(data) => {
					// Handle successful response data
					if (data != null && data.length > 0) {
						// Translate the item descriptions
						const fields = [
							FT.Ui.translationColumnField("item_desc", FT.Ui.TRANSLATION_GROUPS.grpItemItemDesc, FT.Ui.TRANSLATION_KEYS.keyItem),
						];
						const translatedData = FT.Ui.translateArray(data, fields);
						// Assign data to the dropdown.
						FT.WorkTasks.controlOptionsSetFromDataset("DDIT", 0, translatedData, "item_desc", "item_id");
					}
				},
				(error) => {
					// Handle error
					handleScriptError(error);
				},
			);
		}
		/**
		 * Loads the list of BOMVersions and populates the dropdown control
		 *  with the retrieved data.
		 * @returns {Object|null} The retrieved BOM Versions data, or null if the request fails.
		 */
		function ddBomVerListLoad() {
			parameterColl = { itemId: _controls.ddItem.value };
			FT.WebApi.mesGetAsync("api/BomVersion", "", parameterColl, false).then(
				(data) => {
					// Handle successful response data
					if (data != null && data.length > 0) {
						FT.WorkTasks.controlOptionsSetFromDataset("DDBV", 0, data, "ver_id", "ver_id");
					}
				},
				(error) => {
					// Handle error
					handleScriptError(error);
				},
			);
		}
		/**
		 * Handles the attachment upload event and assigns the uploaded file path to a textbox.
		 */
		function onAttachmentUpload() {
			_controls.txtFileName.value = "";
			// Get the attachment control element
			if (_controls.ddFileType.value === "IMAGE") {
				controlElement = _controls.attFileUploadImage;
			} else if (_controls.ddFileType.value === "PDF") {
				controlElement = _controls.attFileUploadPDF;
			} else if (_controls.ddFileType.value === "VIDEO") {
				controlElement = _controls.attFileUploadVideo;
			} else if (_controls.ddFileType.value === "WORD_DOC") {
				controlElement = _controls.attFileUploadDocx;
			}
			// Check if the controlElement and its fileList are valid, and if fileList contains any files
			if (controlElement && controlElement.fileList && controlElement.fileList.length > 0) {
				// Check if filePath ends with a backslash, if not, add it
				if (!filePath.endsWith("\\")) {
					filePath += "\\";
				}
				const fileUploadPath = filePath;
				// Assign the name of the first file in the fileList to the txtFileName textbox
				_controls.txtFileName.value = controlElement.fileList[0].name();
				_controls.hfFilePath.value = _controls.txtFileName.value.replace(/\\/g, "\\\\");
				// _controls.attFileUpload.filePathTemplate = fileUploadPath.replace(/\\/g, "\\\\") + "\\<FileName>.<FileExtension>";
				if (_controls.ddFileType.value === "IMAGE") {
					_controls.attFileUploadImage.filePathTemplate = fileUploadPath.replace(/\\/g, "\\\\") + "\\<FileName>.<FileExtension>";
				} else if (_controls.ddFileType.value === "PDF") {
					_controls.attFileUploadPDF.filePathTemplate = fileUploadPath.replace(/\\/g, "\\\\") + "\\<FileName>.<FileExtension>";
				} else if (_controls.ddFileType.value === "VIDEO") {
					_controls.attFileUploadVideo.filePathTemplate = fileUploadPath.replace(/\\/g, "\\\\") + "\\<FileName>.<FileExtension>";
				} else if (_controls.ddFileType.value === "WORD_DOC") {
					_controls.attFileUploadDocx.filePathTemplate = fileUploadPath.replace(/\\/g, "\\\\") + "\\<FileName>.<FileExtension>";
				}
			}
		}
		/**
		 * Handles the change event for the file type dropdown.
		 */
		function ddFileTypeChange() {
			_controls.txtFileName.value = "";
			visibleAttachmentButton();
			if (_controls.ddFileType.value === "STREAM_URL") {
				_controls.txtFileName.readOnly = false;
				_controls.txtFileName.tagName = skelta.localize.getString("@@WI_Url@@");
				_controls.hfFilePath.value = _controls.txtFileName.value.replace(/\\/g, "\\\\");
			} else {
				_controls.txtFileName.readOnly = true;
				_controls.txtFileName.tagName = skelta.localize.getString("@@WI_File@@");
			}
		}
		/**
		 * Handles the Add instruction preWorkflow execution.
		 */
		function iwAddInstructionPreExec() {
			_controls.hfFilePath.value = _controls.txtFileName.value.replace(/\\/g, "\\\\");
		}
		/**
		 * to get the FIlePath from the configuration.
		 */
		function getFilePath() {
			const parameterCollection = { grp_id: GRP_ID, category: CATEGORY, status_cd: 0 };
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_FT_Config", parameterCollection, false).then(
				(data) => {
					if (data != null && data.length > 0) {
						if (data[0].param16 != null && data[0].param16 !== "") {
							filePath = data[0].param16;
							_controls.iwAdd.enable = true;
						} else {
							_controls.iwAdd.enable = false;
							SFU.showWarning(
								skelta.localize.getString("@@WI_NoPathConfiguredErrorTitle@@"),
								skelta.localize.getString("@@WI_NoPathConfiguredErrorMsg@@"),
							);
						}
					}
				},
				(error) => {
					_controls.iwAdd.enable = false;
					// Handle error
					throw error("Error:", error);
				},
			);
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
		 * Performs actions after the execution of a workflow.
		 */
		function iwAddInstructionPostExec(blockingOutput, workflowStatus) {
			FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"wi",
					"wi.instruction.add",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"WI_UI_Add",
					"wi.instruction.add",
				);
			}
		}
		/**
		 * This function you’ve provided is designed to toggle the visibility of file upload buttons
		   based on the selected file type from a dropdown
		 */
		function visibleAttachmentButton() {
			if (_controls.ddFileType.value === "IMAGE") {
				_controls.attFileUploadImage.visible = true;
				_controls.attFileUploadDocx.visible = false;
				_controls.attFileUploadVideo.visible = false;
				_controls.attFileUploadPDF.visible = false;
			} else if (_controls.ddFileType.value === "PDF") {
				_controls.attFileUploadDocx.visible = false;
				_controls.attFileUploadVideo.visible = false;
				_controls.attFileUploadPDF.visible = true;
				_controls.attFileUploadImage.visible = false;
			} else if (_controls.ddFileType.value === "VIDEO") {
				_controls.attFileUploadDocx.visible = false;
				_controls.attFileUploadPDF.visible = false;
				_controls.attFileUploadImage.visible = false;
				_controls.attFileUploadVideo.visible = true;
			} else if (_controls.ddFileType.value === "WORD_DOC") {
				_controls.attFileUploadDocx.visible = true;
				_controls.attFileUploadVideo.visible = false;
				_controls.attFileUploadPDF.visible = false;
				_controls.attFileUploadImage.visible = false;
			} else {
				_controls.attFileUploadDocx.visible = false;
				_controls.attFileUploadVideo.visible = false;
				_controls.attFileUploadPDF.visible = false;
				_controls.attFileUploadImage.visible = false;
			}
		}
		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			ddBomVerListLoad: ddBomVerListLoad,
			onAttachmentUpload: onAttachmentUpload,
			ddFileTypeChange: ddFileTypeChange,
			iwAddInstructionPreExec: iwAddInstructionPreExec,
			iwAddInstructionPostExec: iwAddInstructionPostExec,
			visibleAttachmentButton: visibleAttachmentButton,
		};
	}
})(window);
