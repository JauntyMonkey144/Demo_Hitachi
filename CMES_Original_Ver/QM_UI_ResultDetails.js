/*
Name:        	QM_UI_ResultDetails.js
Description: 	QM_UI_ResultDetails js file containing global logic pertaining to the QM_UI_ResultDetails Form.

Ver		Release		By			Date						Change Description
001		00.70			PR			2024-11-13	    #3914 First version.
002		01.00			BB			2025-03-04			#4253 Translate the MD.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.QM = window.QM || {};
	QM.ResultDetails = QM.ResultDetails || {};
	QM.ResultDetails = ResultDetails();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function ResultDetails() {
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
		const charItemType = "CharItem";
		// ----------------------------------------------------------------------------------
		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			// Initialize variables
			FORM.Control = Control;
			_controls.wwSampleChar = FORM.Control.findByXmlNode("WWCH");
			_controls.hfSampleId = FORM.Control.findByXmlNode("HFSI");
			_controls.wwSpecLimit = FORM.Control.findByXmlNode("WWSL");
			_controls.lbUpperLowLimit = FORM.Control.findByXmlNode("LBUDL");
			_controls.wwViewResult = FORM.Control.findByXmlNode("WWSD");

			_controls.lbSampleSize = FORM.Control.findByXmlNode("LBS");
			_controls.nrResultValue = FORM.Control.findByXmlNode("NRRV");
			_controls.hfSmapleResult = FORM.Control.findByXmlNode("HFMSR");

			_controls.hfCharId = FORM.Control.findByXmlNode("HFCI");
			_controls.hfCharName = FORM.Control.findByXmlNode("HFCN");
			_controls.hfNumDecimal = FORM.Control.findByXmlNode("HFCND");
			_controls.hfLRV = FORM.Control.findByXmlNode("HFLRV");
			_controls.hfURV = FORM.Control.findByXmlNode("HFURV");
			_controls.hfMaxRow = FORM.Control.findByXmlNode("HFMR");

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
				const sampleContext = FT.WorkTasks.contextGet(FORM.Control, "sample");
				_controls.hfSampleId.value = sampleContext[0].sampleId;
				loadSampleCharacteristics();
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
				errorMessage = skelta.localize.getString("@@QM_UnexpectedType@@");
			} else if (error instanceof ReferenceError) {
				errorMessage = skelta.localize.getString("@@QM_ReferenceError@@");
			} else {
				errorMessage = skelta.localize.getString("@@QM_DuringScriptExecution@@");
			}
			SFU.showError(skelta.localize.getString("FormNGFErrorRunningScript_title"), errorMessage, null, error.message);
		}
		/**
		 * Loads sample characteristics data based on the sample ID
		 * @returns {JSON} sample characteristics data
		 */
		function loadSampleCharacteristics() {
			const parameterColl = {
				sample_id: _controls.hfSampleId.value,
				char_type: charItemType,
			};
			FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_QM_Sample_GetChars", parameterColl, false).then(
				(data) => {
					// Handle successful response data
					// Translate the characteristics
					const fields = [
						FT.Ui.translationColumnField(
							"char_desc",
							FT.Ui.TRANSLATION_GROUPS.grpCharacteristicCharDesc,
							FT.Ui.TRANSLATION_KEYS.keyCharacteristic,
						),
						FT.Ui.translationColumnField(
							"qm_spec_desc",
							FT.Ui.TRANSLATION_GROUPS.grpQmSpecQmSpecDesc,
							FT.Ui.TRANSLATION_KEYS.keyQmSpec,
							"qm_spec_name",
						),
						FT.Ui.translationColumnField("uom_desc", FT.Ui.TRANSLATION_GROUPS.grpUomDescription, ["uom_desc"]),
					];
					const charData = FT.Ui.translateArray(data, fields);
					// Assign translated characteristics to widget.
					_controls.wwSampleChar.widgetProperties.data = JSON.stringify(charData);
				},
				(error) => {
					// Handle error
					throw Error("Error:", error);
				},
			);
		}
		/**
		 * Handles changes in characteristic data.
		 * This function is triggered when characteristic data is updated.
		 * It parses the JSON data, extracts relevant values, and updates
		 * the progress bar if the characteristic type is 0.
		 *
		 * @throws {Error} Throws an error if parsing the JSON fails or if
		 *                 the expected data structure is not present.
		 */
		function characteristicOnDataChange() {
			const wwCharData = JSON.parse(_controls.wwSampleChar.value);
			loadSelectedSampleCharacteristic(wwCharData);

			const lrv = wwCharData[0].lrv == null ? "" : parseFloat(wwCharData[0].lrv);
			const urv = wwCharData[0].urv == null ? "" : parseFloat(wwCharData[0].urv);
			const lsv = wwCharData[0].lsv == null ? "" : parseFloat(wwCharData[0].lsv);
			const usv = wwCharData[0].usv == null ? "" : parseFloat(wwCharData[0].usv);
			const target = parseFloat(wwCharData[0].target);
			const charType = parseInt(wwCharData[0].type_h, 10);

			if (charType === 0) {
				const parameterCollChar = { char_id: wwCharData[0].char_id, char_name: null };
				// let characteristicDetails;
				const characteristicDetails = FT.WebApi.mesGetSync(
					"api/V3/DirectAccess",
					"sp_S_QM_Characteristic",
					parameterCollChar,
					false,
				);
				if (characteristicDetails.length > 0) {
					if (characteristicDetails[0].catalog === null) {
						_controls.wwSpecLimit.visible = true;
						setProgressBar(lrv, urv, lsv, usv, target);
					} else {
						_controls.wwSpecLimit.visible = false;
					}
				}
			}
		}
		/**
		 * Loads the selected sample characteristic data into the form controls.
		 *
		 * This function retrieves characteristic data from the provided row,
		 * updates relevant form controls, and manages the visibility and
		 * state of result fields based on the characteristic's properties.
		 * It also fetches associated sample results and updates the UI
		 * to reflect the current state of results and sample sizes.
		 *
		 * @param {Array} selectedCharRow - An array containing the selected
		 *                                   characteristic data. Expected to be
		 *                                   in the format of an array with
		 *                                   at least one object representing
		 *                                   the characteristic details.
		 *
		 * @returns {void} This function does not return a value but updates
		 *                 the UI and form control properties based on the
		 *                 loaded characteristic data and retrieved sample results.
		 */
		function loadSelectedSampleCharacteristic(selectedCharRow) {
			const charData = selectedCharRow[0];
			const charId = parseInt(charData.char_id, 10);
			_controls.hfCharId.value = charId;
			_controls.hfCharName.value = charData.char_name;
			_controls.hfNumDecimal.value = charData.num_decimals;
			_controls.hfLRV.value = charData.lrv != null ? charData.lrv : "";
			_controls.hfURV.value = charData.urv != null ? charData.urv : "";
			const minSampleSize = charData.minimum_sample_size_h;
			const maxSampleSize = charData.maximum_sample_size_h;
			const actSampleSize = charData.act_sample_size_h;
			const normalSampleSize = charData.normal_sample_size_h;
			const sampleSize = normalSampleSize > actSampleSize ? normalSampleSize : actSampleSize;
			_controls.hfMaxRow.value = String(maxSampleSize);
			const sampleId = charData.sample_id;
			_controls.hfSampleId.value = sampleId;
			let sampleResult;
			const parameterColl = { sampleId: _controls.hfSampleId.value, charId: charId };
			const propName = "QM_Result";
			window.conf[propName].chardata = charData;
			FT.WebApi.mesGetAsync("api/v3/sample/result", "", parameterColl, false).then(
				(data) => {
					if (data) {
						const filteredData = data.filter((item) => item.superseded === 0);
						sampleResult = filteredData;
						if (sampleResult !== null) {
							if (sampleResult.length > sampleSize) {
								createControl = sampleResult.length;
							} else {
								createControl = sampleSize;
							}
						} else {
							createControl = sampleSize;
						}

						_controls.wwViewResult.widgetProperties.data = JSON.stringify(sampleResult);

						_controls.lbSampleSize.value =
							"Sample Size - min/default/max : " +
							String(minSampleSize) +
							"/" +
							String(normalSampleSize) +
							"/" +
							(String(maxSampleSize) === "NaN" ? skelta.localize.getString("@@QM_ResultNone@@") : String(maxSampleSize));
					}
				},
				(error) => {
					// Handle error
					throw new Error("Error:", error);
				},
			);
		}
		/**
		 * Sets the progress bar limits based on provided values.
		 *
		 * This function calculates the minimum and maximum scales for the progress
		 * bar based on the given limits and target value. It adjusts the visibility
		 * of the upper/lower limit labels based on the input conditions and updates
		 * the widget properties of the progress bar with the calculated data.
		 *
		 * @param {number|string} lrv - The lower range value. Can be a number or an empty string.
		 * @param {number|string} urv - The upper range value. Can be a number or an empty string.
		 * @param {number|string} lsv - The lower specification value. Can be a number or an empty string.
		 * @param {number|string} usv - The upper specification value. Can be a number or an empty string.
		 * @param {number} target - The target value, which should be a number.
		 *
		 * @returns {void} This function does not return a value but modifies the global
		 *                 control properties for the progress bar.
		 */
		function setProgressBar(lrv, urv, lsv, usv, target) {
			let minScale = 0;
			let maxscale = "";

			let modlrv;
			modlrv = lrv === "NaN" ? "" : lrv;
			let modurv;
			modurv = urv === "NaN" ? "" : urv;
			if (target === 0 && lsv === "" && usv === "" && modlrv === "" && modurv === "") {
				_controls.lbUpperLowLimit.visible = true;
			} else {
				_controls.lbUpperLowLimit.visible = false;
			}
			if ((target != null || target !== undefined) && lsv === "" && usv === "" && lrv === "" && modurv === "") {
				maxscale = target + target * 0.2;
				modlrv = minScale;
				modurv = maxscale;
			}
			if (lsv !== "" && modlrv === "") {
				modlrv = parseFloat(lsv - (target - lsv) * 0.2);
			}
			if (lsv !== "" && usv === "" && modlrv === "" && modurv === "") {
				maxscale = usv + (usv - target) * 0.2;
			}
			if (usv !== "" && modurv === "") {
				modurv = parseFloat(usv + (usv - target) * 0.2);
			}
			if (modlrv !== "" && urv === "") {
				minScale = modlrv;
			}
			if (modurv !== "" && modlrv === "") {
				maxscale = modurv;
			}
			if (modurv !== "" && modlrv !== "") {
				minScale = modlrv;
				maxscale = modurv;
			}
			const modusv = usv === "" ? 0 : usv;
			const modlsv = lsv === "" ? 0 : lsv;
			const sampleRange =
				'[{"udl":"' +
				maxscale.toFixed(2) +
				'","usl":"' +
				modusv.toFixed(2) +
				'","lsl":"' +
				modlsv.toFixed(2) +
				'","ldl":"' +
				minScale.toFixed(2) +
				'","Actual":"' +
				target +
				'"}]';
			_controls.wwSpecLimit.widgetProperties.data = sampleRange;
		}

		return {
			initializeForm: initializeForm,
			loadSampleCharacteristics: loadSampleCharacteristics,
			characteristicOnDataChange: characteristicOnDataChange,
		};
	}
})(window);
