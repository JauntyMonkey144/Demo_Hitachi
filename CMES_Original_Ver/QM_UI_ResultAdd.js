/*
Name:        	QM_UI_ResultAdd.js
Description: 	QM_UI_ResultAdd js file containing global logic pertaining to the QM_UI_ResultAdd Form.

Ver		Release		By				  Date				Change Description
001		00.70.00	Praveen			2024-09-19	#3617 First version.
002		01.00.00	BB					2025-03-04	#4253 Translate the MD.
003		01.01.00 	Fayaz A			2025-05-28	#5008 Localization key update to refer from FT runtime locale file.
004		01.03.00 	Praveen			2025-08-01	#5129 Go to next characteristic after saving a sample result.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.QM = window.QM || {};
	QM.ResultAdd = QM.ResultAdd || {};
	QM.ResultAdd = ResultAdd();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function ResultAdd() {
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
		let charwidgetProperties = "";
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
			_controls.iwSave = FORM.Control.findByXmlNode("IWSave");
			_controls.fbAddRow = FORM.Control.findByXmlNode("FBAR");
			_controls.bfNumResult = FORM.Control.findByXmlNode("BFNR");
			_controls.bfDDResult = FORM.Control.findByXmlNode("BFDR");
			_controls.lbSampleSize = FORM.Control.findByXmlNode("LBS");
			_controls.nrResultValue = FORM.Control.findByXmlNode("NRRV");
			_controls.hfSmapleResult = FORM.Control.findByXmlNode("HFMSR");
			_controls.hfCharId = FORM.Control.findByXmlNode("HFCI");
			_controls.hfCharName = FORM.Control.findByXmlNode("HFCN");
			_controls.hfNumDecimal = FORM.Control.findByXmlNode("HFCND");
			_controls.hfLRV = FORM.Control.findByXmlNode("HFLRV");
			_controls.hfURV = FORM.Control.findByXmlNode("HFURV");
			_controls.hfMaxRow = FORM.Control.findByXmlNode("HFMR");
			_controls.ddResultValue = FORM.Control.findByXmlNode("DDRV");
			_controls.hfDeleteButton = FORM.Control.findByXmlNode("HFDDC");
			_controls.hfIsCatalog = FORM.Control.findByXmlNode("HFICAT");
			_controls.fbPervious = FORM.Control.findByXmlNode("FBPRV");
			_controls.fbNext = FORM.Control.findByXmlNode("FBNXT");
			_controls.panelButton = FORM.Control.findByXmlNode("PLBT");

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
				charwidgcetProperties = "";
				const selectedCard = FT.WorkTasks.contextGet(FORM.Control, "eventData");
				const sampleContext = JSON.parse(selectedCard[0].jsonValue);
				_controls.hfSampleId.value = sampleContext[0].sample_id;
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
				errorMessage = skelta.localize.getString("@@FT_UnexpectedType@@");
			} else if (error instanceof ReferenceError) {
				errorMessage = skelta.localize.getString("@@FT_ReferenceError@@");
			} else {
				errorMessage = skelta.localize.getString("@@FT_DuringScriptExecution@@");
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
					// Translate characteristics
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
					// Assign translated characteristics to widget
					_controls.wwSampleChar.widgetProperties.data = JSON.stringify(charData);
					if (data.length > 1) {
						_controls.panelButton.visible = true;
					} else {
						// _controls.panelButton.visible = false;
					}
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
			const automatedColl = charData.automated_coll_h;
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
			if (automatedColl === "true") {
				_controls.iwSave.enable = false;
			} else {
				_controls.iwSave.enable = true;
			}
			_controls.bfNumResult.removeAll();
			_controls.bfDDResult.removeAll();

			let sampleResult;
			let createControl;
			const parameterColl = { sampleId: _controls.hfSampleId.value, charId: charId };
			const data = FT.WebApi.mesGetSync("api/v3/sample/result", "", parameterColl, false); // .then(
			// (data) => {
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
				const parameterCollChar = { char_id: charId, char_name: null };
				let spName = "sp_S_QM_Characteristic";
				// let characteristicDetails;
				const characteristicDetails = FT.WebApi.mesGetSync("api/V3/DirectAccess", spName, parameterCollChar, false); // .then(
				// (data1) => {
				if (characteristicDetails.length > 0) {
					// characteristicDetails = data1;
					const jsonArrCatalog = [];
					if (characteristicDetails[0].catalog !== null) {
						_controls.bfDDResult.visible = true;
						_controls.bfNumResult.visible = false;
						const ParamsArray = [];
						ParamsArray.push({
							FieldName: "catalog_id",
							DataType: "int",
							Value: characteristicDetails[0].catalog,
						});

						const parameterCollCatalog = { catalog_id: characteristicDetails[0].catalog };
						spName = "sp_SA_QM_Catalog_Option";
						let catalogOptions;

						const data2 = FT.WebApi.mesGetSync("api/V3/DirectAccess", spName, parameterCollCatalog, false); // .then(
						// (data2) => {
						if (data2.length > 0) {
							catalogOptions = data2;

							jsonArrCatalog.push({
								optiontext: "",
								optionvalue: "",
							});
							for (let catRow = 0; catRow < catalogOptions.length; catRow++) {
								jsonArrCatalog.push({
									optiontext: catalogOptions[catRow].name,
									optionvalue: catalogOptions[catRow].value,
								});
							}
							let newRecord;
							for (let valueNo = 1; valueNo <= createControl; valueNo++) {
								const catalogRow = {
									lblResultDDValueNo: String(valueNo),
									HFDDC: "",
									D1: "",
								};
								newRecord = _controls.bfDDResult.addRecord(catalogRow);
								if (automatedColl === "true") _controls.ddResultValue.enable = false;

								if (valueNo - 1 === createControl - 1) {
									document.getElementsByClassName("skcdo ResultsFormGrid_skcdo")[valueNo - 1].style.visibility = "visible";
								} else {
									document.getElementsByClassName("skcdo ResultsFormGrid_skcdo")[valueNo - 1].style.visibility = "hidden";
								}
							}
							newRecord.D1.isMandatory = false;
							const bfRecords = _controls.bfDDResult.records();
							const len = bfRecords.length;
							for (let index = 0; index < len; index++) {
								bfRecords[index].D1.options = jsonArrCatalog;
								bfRecords[index].D1.optionText = "optiontext";
								bfRecords[index].D1.optionValue = "optionValue";
							}
						}
					} else {
						_controls.bfDDResult.visible = false;
						_controls.bfNumResult.visible = true;
						let newRecord;
						for (let valueNo = 1; valueNo <= createControl; valueNo++) {
							const numRow = {
								lblResultValueNo: String(valueNo),
								HFNVC: "",
								N1: "",
							};
							newRecord = _controls.bfNumResult.addRecord(numRow);
							if (automatedColl === "true") newRecord.N1.enable = false;
							// if (valueNo - 1 === createControl - 1) {
							if (createControl >= valueNo) {
								document.getElementsByClassName("skcdo ResultsFormGrid_skcdo")[valueNo - 1].style.visibility = "hidden";
							} else {
								document.getElementsByClassName("skcdo ResultsFormGrid_skcdo")[valueNo - 1].style.visibility = "visible";
							}
						}

						newRecord.N1.isMandatory = false;
						// }
					}
					if (createControl === 1) {
						document.getElementsByClassName("skcdo ResultsFormGrid_skcdo")[0].style.visibility = "hidden";
					}
					_controls.lbSampleSize.value =
						"Sample Size - min/default/max : " +
						String(minSampleSize) +
						"/" +
						String(normalSampleSize) +
						"/" +
						(String(maxSampleSize) === "NaN" ? skelta.localize.getString("@@QM_ResultNone@@") : String(maxSampleSize));

					let lsv = "";
					let usv = "";
					if (sampleResult !== null) {
						const severityCd = parseInt(charData.severity_cd, 10);
						lsv = charData.lsv;
						usv = charData.usv;
						let resultRecords;
						if (characteristicDetails[0].catalog !== null) {
							resultRecords = _controls.bfDDResult.records();
						} else {
							resultRecords = _controls.bfNumResult.records();
						}

						for (let index = 0; index < sampleResult.length; index++) {
							if (sampleResult[index].superseded === 0) {
								const valueNo = sampleResult[index].value_no;
								const resultRecord = resultRecords[valueNo - 1];
								if (resultRecord !== undefined) {
									if (characteristicDetails[0].catalog !== null) {
										resultRecord.D1.value = String(sampleResult[index].result_value);
										resultRecord.H2.value = String(sampleResult[index].result_value);
										resultRecord.D1.isMandatory = false;
										resultRecord.F2.value = "<BPMUITemplates>\\NextGenForms\\images\\check-circle.png";
										resultRecord.F2.visible = true;
										resultRecord.isDeleteDisabled = true;
									} else {
										resultRecord.N1.value = String(sampleResult[index].result_value);
										resultRecord.H1.value = String(sampleResult[index].result_value);
										resultRecord.N1.isMandatory = false;
										resultRecord.F3.value = "<BPMUITemplates>\\NextGenForms\\images\\check-circle.png";
										resultRecord.F3.visible = true;
										document.getElementsByClassName("skcdo ResultsFormGrid_skcdo")[index].style.visibility = "hidden";
									}
									if (severityCd > 1 && (lsv !== null || usv !== null)) {
										if (
											(lsv !== null && sampleResult[index].result_value < parseInt(lsv, 10)) ||
											(usv !== null && sampleResult[index].result_value > parseInt(usv, 10))
										) {
											switch (severityCd) {
												case 0:
												case 1:
													break;
												case 2:
													if (characteristicDetails[0].catalog !== null) {
														resultRecord.F2.value = "<BPMUITemplates>\\NextGenForms\\images\\close-circle-outline.png";
														resultRecord.F2.visible = true;
													} else {
														resultRecord.F3.value = "<BPMUITemplates>\\NextGenForms\\images\\close-circle-outline.png";
														resultRecord.F3.visible = true;
													}
													break;
												case 3:
													if (characteristicDetails[0].catalog !== null) {
														resultRecord.F2.value = "<BPMUITemplates>\\NextGenForms\\images\\close-circle-outline.png";
														resultRecord.F2.visible = true;
													} else {
														resultRecord.F3.value = "<BPMUITemplates>\\NextGenForms\\images\\close-circle-outline.png";
														resultRecord.F3.visible = true;
													}
													break;
												case 4:
													if (characteristicDetails[0].catalog !== null) {
														resultRecord.F2.value = "<BPMUITemplates>\\NextGenForms\\images\\close-circle.png";
														resultRecord.F3.visible = true;
													} else {
														resultRecord.F3.value = "<BPMUITemplates>\\NextGenForms\\images\\close-circle.png";
														resultRecord.F3.visible = true;
													}

													break;
												default:
													break;
											}
										}
									}
								}
							}
						}
						let records;
						if (characteristicDetails[0].catalog !== null) {
							records = _controls.bfDDResult.records();
						} else {
							records = _controls.bfNumResult.records();
						}
						const max = parseInt(_controls.hfMaxRow.value, 10);
						if (records.length >= max) {
							if (sampleResult.length < max) {
								_controls.iwSave.enable = true;
								_controls.fbAddRow.enable = false;
							} else {
								//	_controls.iwSave.enable = false;
								_controls.fbAddRow.enable = false;
							}
						} else {
							_controls.fbAddRow.enable = true;
						}
					} else {
						let records;
						if (characteristicDetails[0].catalog !== null) {
							records = _controls.bfDDResult.records();
						} else {
							_controls.bfNumResult.records();
						}
						const max = parseInt(_controls.hfMaxRow.value, 10);
						if (max > records.length) {
							_controls.iwSave.enable = true;
							_controls.fbAddRow.enable = true;
						} else {
							_controls.fbAddRow.enable = false;
						}
					}
				}
			}
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
		/**
		 * Validates the result value against specified lower and upper reference values.
		 *
		 * This function checks if the result value from the associated form is within
		 * the defined limits specified in the parent form. If the result value is
		 * outside these limits, an error message is displayed. If the value is valid,
		 * it updates the corresponding record and marks the field as mandatory.
		 *
		 * @returns {void} This function does not return a value but performs validation
		 *                 and may update the UI or record values.
		 */
		function validateReasonableLimits() {
			const { associatedForm } = FORM.Control.associatedForm;
			const { dataContainerForm } = FORM.Control.dataContainerForm;
			const records = dataContainerForm.records();
			let { parentForm } = 0;
			if (dataContainerForm && dataContainerForm.parentForm) {
				parentForm = dataContainerForm.parentForm;
			}
			const currentRecordIndex = records.indexOf(associatedForm);
			const recordObj = records[currentRecordIndex];
			if (recordObj !== null && recordObj !== undefined) {
				let resultValue = recordObj.N1.value;
				if (resultValue !== null && resultValue !== "") {
					resultValue = parseFloat(resultValue);
					const lrv = parseFloat(parentForm.H9.value);
					const urv = parseFloat(parentForm.H10.value);
					if (resultValue < lrv || resultValue > urv) {
						const titleString = skelta.localize.getString("@@QM_ValidationError@@");
						const resultRangeString = skelta.localize.getString("@@QM_ResultRangeError@@");
						SFU.showError(titleString, resultRangeString);
						window.setTimeout(() => {
							_controls.nrResultValue.value = recordObj.H1.value;
						}, 100);
					} else {
						recordObj.H1.value = recordObj.N1.value;
						recordObj.N1.isMandatory = true;
					}
				}
			}
		}
		/**
		 * function to set number control visible
		 * @returns
		 */
		function charNumResultVisibility() {
			var decimalPlaces = _controls.hfNumDecimal.value;
			if (decimalPlaces !== "") {
				setDecimalPlaces(parseInt(decimalPlaces, 10));
			}
			return true;
		}
		/**
		 * function to set decimal places
		 * @param decimalPlaces
		 */
		function setDecimalPlaces(decimalPlaces) {
			if (SFU.isUndefined(FORM.Control)) {
				return;
			}
			try {
				const { value } = FORM.Control.value;
				kendo.cultures[FORM.Control.id + "-culture"].numberFormat.decimals = decimalPlaces;
				const formatN = "n" + decimalPlaces;
				$($(FORM.Control.domElement).parent()[0]).find("[data-skrl=skNumPkr]").data("kendoNumericTextBox").setOptions({
					decimals: decimalPlaces,
					format: formatN,
				});
				$($(FORM.Control.domElement).parent()[0]).find("[data-skrl=skNumPkr]").data("kendoNumericTextBox").value(value);
			} catch (exc) {
				// Empty block
			}
		}
		/**
		 * function to execute on pre workflow
		 */
		function iwQualityResultOnPreWorkflow() {
			try {
				_controls.hfSmapleResult.value = formMultipleResultsJson(FORM.Control);
				const result = JSON.parse(_controls.hfSmapleResult.value);
				if (result[0].results.length === 0) {
					SFU.showError(
						skelta.localize.getString("@@QM_SampleMinResult@@"),
						skelta.localize.getString("@@QM_SampleMinResultError@@"),
					);
				}
			} catch (exception) {
				/* empty */
			}
		}
		/**
		 * funtion to format and map valus in multiresult json
		 * @returns
		 */
		function formMultipleResultsJson() {
			selectedCharDetails = JSON.parse(_controls.wwSampleChar.value);
			const parameterCollChar = { char_id: selectedCharDetails[0].char_id, char_name: null };
			const spName = "sp_S_QM_Characteristic";
			// let characteristicDetails;
			const characteristicDetails = FT.WebApi.mesGetSync("api/V3/DirectAccess", spName, parameterCollChar, false);
			let resultsString = '[{"char_name": "' + _controls.hfCharName.value + '", "results": [';
			let firstRecord = true;
			let { dataContainerForm } = {};
			if (characteristicDetails[0].catalog !== null) {
				dataContainerForm = _controls.bfDDResult.dataContainerForm;
			} else {
				dataContainerForm = _controls.bfNumResult.dataContainerForm;
			}

			// const { dataContainerForm } = _controls.bfNumResult.dataContainerForm;

			const records = dataContainerForm.records();
			const totalRecords = records.length;
			let havepreValue = false;
			for (let i = 0; i < totalRecords; i++) {
				const recordObj = records[i];
				if (
					characteristicDetails[0].catalog !== null
						? recordObj.findChildRecordControlByXmlNode("DDRV").isMandatory
						: recordObj.N1.isMandatory
				) {
					return resultsString; // skip adding if mandatory
				}

				if (!firstRecord) {
					if (characteristicDetails[0].catalog !== null) {
						if (havepreValue === true) {
							if (String(recordObj.findChildRecordControlByXmlNode("DDRV").value) !== "") {
								resultsString += ",";
							}
						}
					} else if (havepreValue === true) {
						if (String(recordObj.findByXmlNode("NRRV").value) !== "") {
							resultsString += ",";
						}
					}
				} else {
					firstRecord = false;
				}
				if (characteristicDetails[0].catalog !== null) {
					havepreValue = false;
					if (!recordObj.findChildRecordControlByXmlNode("IMGDD").visible) {
						if (String(recordObj.findChildRecordControlByXmlNode("DDRV").value) !== "") {
							resultsString +=
								'{"value_no": ' +
								String(recordObj.Data.lblResultDDValueNo) +
								', "result_value": ' +
								String(recordObj.findChildRecordControlByXmlNode("DDRV").value) +
								', "act_sample_size": 1}';
							havepreValue = true;
						}
					}
					recordObj.findChildRecordControlByXmlNode("DDRV").isMandatory = false;
				} else {
					havepreValue = false;
					if (String(recordObj.findByXmlNode("NRRV").value) !== "") {
						resultsString +=
							'{"value_no": ' +
							recordObj.Data.lblResultValueNo +
							', "result_value": ' +
							String(recordObj.findByXmlNode("NRRV").value) +
							', "act_sample_size": 1}';
						havepreValue = true;
					}
					recordObj.findByXmlNode("NRRV").isMandatory = false;
				}
			}
			resultsString += "]}]";
			return resultsString;
		}
		/**
		 * function to execute on post workflow
		 * @param blockingOutput
		 */
		function iwQualityResultOnPostWorkflow(blockingOutput, workflowStatus) {
			const jsonErrors = JSON.parse(blockingOutput);
			for (let i = 0; i < jsonErrors.Result1.Errors.length; i++) {
				FT.WorkTasks.workflowCheckStatus(
					jsonErrors.Result1.Errors[i].CharName + " - " + jsonErrors.Result1.Errors[i].Error,
					workflowStatus,
					true,
					30000,
				);
			}
			for (let i = 0; i < jsonErrors.Result2.Violations.length; i++) {
				if (jsonErrors.Result2.Violations[i].Violations !== "") {
					FT.WorkTasks.workflowCheckStatus(
						jsonErrors.Result2.Violations[i].CharName + " - " + jsonErrors.Result2.Violations[i].Violations,
						workflowStatus,
						true,
						30000,
					);
				}
			}
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				FT.Common.windowEventDispatch(
					"qm",
					"qm.result.add",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"QM_UI_ResultAdd",
					"qm.result.add",
				);
			}
		}
		/**
		 * function to add new row
		 */
		function addResultRow() {
			const wwCharData = JSON.parse(_controls.wwSampleChar.value);
			const automatedColl = wwCharData[0].automated_coll_h;
			const records = _controls.bfNumResult.records();
			const existingSeq = [];
			for (let i = 0; i <= records.length - 1; i++) {
				existingSeq.push(records[i].Data.lblResultValueNo);
			}
			const numbers = [existingSeq.join(",")];
			let missingSeq = [];
			for (let i = 1; i <= wwCharData[0].maximum_sample_size_h; i++) {
				if (!numbers[0].includes(i)) {
					missingSeq.push(i);
				}
			}
			const valueNo = missingSeq[0];
			const newNumRow = {
				lblResultValueNo: String(valueNo),
				HF_N_V_C: "",
				NR_C_R_V: "",
			};
			missingSeq = "";
			const newRecord = _controls.bfNumResult.addRecord(newNumRow);
			if (automatedColl === "true") newRecord.findByXmlNode("NRRV").enable = false;
			newRecord.findByXmlNode("NRRV").isMandatory = false;
			const maxRow = parseInt(_controls.hfMaxRow.value, 10);
			if (records.length === maxRow) {
				_controls.fbAddRow.enable = false;
			}
			for (let rec = 0; rec < records.length; rec++) {
				if (rec === records.length - 1) {
					document.getElementsByClassName("skcdo ResultsFormGrid_skcdo")[rec].style.visibility = "visible";
				} else {
					document.getElementsByClassName("skcdo ResultsFormGrid_skcdo")[rec].style.visibility = "hidden";
				}
			}
		}
		/**
		 * function to delete new row
		 */
		function recordDeleteBaseForm() {
			const wwCharData = JSON.parse(_controls.wwSampleChar.value);
			const baseformLength = _controls.bfNumResult.records().length;
			const { dataContainerForm } = _controls.bfNumResult.dataContainerForm;
			const records = dataContainerForm.records();
			const recordObj = records[baseformLength - 1];
			if (wwCharData[0].normal_sample_size_h < baseformLength) {
				if (String(recordObj.findByXmlNode("NRRV").value) === "") {
					document.getElementsByClassName("skcdo ResultsFormGrid_skcdo")[baseformLength - 1].style.visibility = "visible";
					_controls.fbAddRow.enable = true;
				}
			}
		}
		/**
		 * Handles the click event for the "Previous" button by setting the widget’s move property to "prev"
		 */
		function onPreviousClick() {
			try {
				charwidgetProperties = "prev";
				SFU.invokeWorkflow(_controls.iwSave);
				// _controls.wwSampleChar.widgetProperties.move = "prev";
			} catch (exception) {
				/* empty */
			}
		}
		/**
		 * Handles the click event for the "Next" button by setting the widget’s move property to "next"
		 */
		function onNextClick() {
			try {
				charwidgetProperties = "next";
				SFU.invokeWorkflow(_controls.iwSave);
			} catch (exception) {
				/* empty */
			}
		}
		/**
		 * function to execute on pre workflow
		 */
		function iwSaveOnPreWorkflow() {
			try {
				_controls.hfSmapleResult.value = formMultipleResultsJson(FORM.Control);
			} catch (exception) {
				/* empty */
			}
		}
		/**
		 * function to execute on post workflow
		 * @param blockingOutput
		 */
		function iwSaveOnPostWorkflow(blockingOutput, workflowStatus) {
			const jsonErrors = JSON.parse(blockingOutput);
			for (let i = 0; i < jsonErrors.Result1.Errors.length; i++) {
				FT.WorkTasks.workflowCheckStatus(
					jsonErrors.Result1.Errors[i].CharName + " - " + jsonErrors.Result1.Errors[i].Error,
					workflowStatus,
					true,
					30000,
				);
			}
			for (let i = 0; i < jsonErrors.Result2.Violations.length; i++) {
				if (jsonErrors.Result2.Violations[i].Violations !== "") {
					FT.WorkTasks.workflowCheckStatus(
						jsonErrors.Result2.Violations[i].CharName + " - " + jsonErrors.Result2.Violations[i].Violations,
						workflowStatus,
						true,
						30000,
					);
				}
			}
			if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
				_controls.wwSampleChar.widgetProperties.move = charwidgetProperties;
			}
		}
		return {
			initializeForm: initializeForm,
			loadSampleCharacteristics: loadSampleCharacteristics,
			characteristicOnDataChange: characteristicOnDataChange,
			validateReasonableLimits: validateReasonableLimits,
			charNumResultVisibility: charNumResultVisibility,
			iwQualityResultOnPreWorkflow: iwQualityResultOnPreWorkflow,
			iwQualityResultOnPostWorkflow: iwQualityResultOnPostWorkflow,
			iwSaveOnPreWorkflow: iwSaveOnPreWorkflow,
			iwSaveOnPostWorkflow: iwSaveOnPostWorkflow,
			addResultRow: addResultRow,
			recordDeleteBaseForm: recordDeleteBaseForm,
			onPreviousClick: onPreviousClick,
			onNextClick: onNextClick,
		};
	}
})(window);
