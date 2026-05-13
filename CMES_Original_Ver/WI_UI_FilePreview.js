/*
Name:        	WI_UI_FilePreview.js
Description: 	WI_UI_FilePreview.js js file contains the logic for Previewing the file based on the Entity Selection.

Ver	 	Release			By					Date				Change Description
001	 	00.70				Praveen			2024-05-24	#3110 First version.
002		00.70				Somya		  	2024-12-02	#3726 Review Comment Changes
003		02.00.00			Fayaz A		  	2025-12-12	#5222 Updated to accept the item from context
*/

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.WI = window.WI || {};
	WI.FilePreview = WI.FilePreview || {};
	WI.FilePreview = FilePreview();
	// ------------------------------------------------------------------------------------
	/**
	 * FilePreview
	 *
	 * @returns {null} FilePreview template object.
	 */
	function FilePreview() {
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
		// ----------------------------------------------------------------------------------
		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			// Initialize variables
			FORM.Control = Control;
			_controls.wwFiles = FORM.Control.findByXmlNode("WWFL");
			_controls.wwFileViewer = FORM.Control.findByXmlNode("WWFV");
			_controls.lbInstructionMsg = FORM.Control.findByXmlNode("LBIM");

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
				_controls.wwFiles.visible = false;
				_controls.wwFileViewer.visible = false;
				wwFilesDataLoad();
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
		 * Get Item ID of running job on entity
		 */
		function getItemIdByEnt(entName) {
			let jobData = "";
			let itemId = null;
			const parameterCollection = { ent_name: entName, status: FT.Common.MES_JOB_STATE_CD.running };
			jobData = FT.WebApi.mesGetSync("api/V3/DirectAccess", "SP_S_JM_Job_Progress", parameterCollection, false);
			if (jobData !== undefined && jobData !== "" && jobData.length !== 0) {
				itemId = jobData[0].item;
			}
			return itemId;
		}
		/**
		 * Set data to Files (TileSinglevel - TD_ProdReas) widegt
		 */
		function wwFilesDataLoad() {
			const entContext = FT.WorkTasks.contextGet(FORM.Control, "ent");
			const { entId } = entContext[0];
			const { entName } = entContext[0];
			const selectedCard = FT.WorkTasks.contextGet(FORM.Control, "eventData");
			data = JSON.parse(selectedCard[0].jsonValue);
			let itemId = null;
			if (data && data.length > 0) {
				itemId = data[0].itemId && data[0].itemId !== undefined && data[0].itemId !== "" ? data[0].itemId : null;
			}
			if (itemId === null) {
				itemId = getItemIdByEnt(entName);
			}

			try {
				const parameterCollection = {
					ent_id: entId,
					item_id: itemId,
				};

				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_WI_instruction", parameterCollection, false).then(
					(fileData) => {
						if (fileData !== undefined && fileData != null && fileData.length > 0) {
							_controls.wwFiles.visible = true;
							_controls.wwFiles.widgetProperties.displayTitle = skelta.localize.getString("@@WI_SelectFile@@");
							_controls.wwFiles.widgetProperties.data = JSON.stringify(fileData);
							_controls.lbInstructionMsg.visible = false;
						} else {
							_controls.wwFiles.visible = false;
							_controls.wwFileViewer.visible = false;
							_controls.lbInstructionMsg.value = skelta.localize.getString("@@WI_NoFilesDataMsg@@");
							_controls.lbInstructionMsg.visible = true;
						}
					},
					(error) => {
						// Handle error
						_controls.lbInstructionMsg.value = skelta.localize.getString("@@WI_NoFilesDataMsg@@");
						_controls.lbInstructionMsg.visible = true;
						throw error("Error:", error);
					},
				);
			} catch (exception) {
				_controls.lbInstructionMsg.value = skelta.localize.getString("@@WI_NoFilesDataMsg@@");
				_controls.lbInstructionMsg.visible = true;
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
			const fileId = _controls.wwFiles.value;
			try {
				const parameterCollection = {
					row_id: fileId,
				};
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_S_WI_instruction", parameterCollection, false).then(
					(fileData) => {
						if (fileData != null && fileData.length > 0) {
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
							_controls.lbInstructionMsg.value = skelta.localize.getString("@@WI_NoDataInFilePreviewMsg@@");
							_controls.wwFileViewer.visible = false;
						}
					},
					(error) => {
						// Handle error
						_controls.lbInstructionMsg.visible = true;
						_controls.lbInstructionMsg.value = skelta.localize.getString("@@WI_NoDataInFilePreviewMsg@@");
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
			wwFilesDataLoad: wwFilesDataLoad,
			wwFileViewerDataLoad: wwFileViewerDataLoad,
		};
	}
})(window);
