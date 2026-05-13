/*
Name:        	QM_UI_SpcFilter.js
Description: 	QM_UI_SpcFilter js file containing global logic pertaining to the spc Filter dropdown form.

Ver		Release			By		    Date				Change Description
001		01.03.00  	Sunish Jacob		2025-09-18	#4209 First version.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.QM = window.QM || {};
	QM.SpcFilter = QM.SpcFilter || {};
	QM.SpcFilter = SpcFilter();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function SpcFilter() {
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const _controls = {};
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;
		// ----------------------------------------------------------------------------------

		// ----------------------------- Private Variables ----------------------------------

		// ----------------------------------------------------------------------------------
		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 *
		 */
		function initializeForm(Control) {
			
			// Initialize variables
			FORM.Control = Control;
			_controls.SpcChartWidget = FORM.Control.topLevelForm.findByXmlNode("WSPC");

			// Include js files
			includeJsFiles();

			// Include js files via ajax
			includeJsFilesAjax();

			// Include CSS files
			includeCssFiles();

			// Add code here
			onFormLoad();
		}

		function initializeSPCChart(control) {
			var chartData = new Object();
			
			var entId = parseInt(FORM.Control.findByXmlNode("ddlEntId").value);
			var itemId = FORM.Control.findByXmlNode("ddlItemId").value;
			var startTimeUtc = FORM.Control.findByXmlNode("StartDate").value;
			var endTimeUtc = FORM.Control.findByXmlNode("EndDate").value;

			var charId = parseInt(FORM.Control.findByXmlNode("ddlCharacteristic").value);
			var chartType = parseInt(FORM.Control.findByXmlNode("ddlSpcChartType").value);
			var xAxisLabel = parseInt(FORM.Control.findByXmlNode("ddlXAxisLabel").value);

			var charName = FORM.Control.findByXmlNode("ddlCharacteristic").displayValue;
			var xAxislabelTxt = FORM.Control.findByXmlNode("ddlXAxisLabel").displayValue;

			var chrttypebyfltr = getChartTypebyFilter(charId);
			
			var qmSpecId = -1;
			if (chrttypebyfltr != null && chrttypebyfltr.length > 0) {
				qmSpecId = chrttypebyfltr[0].qm_spec_id;
				var defaultChart = chrttypebyfltr[0].default_chart;

				if (defaultChart != null && chartType == 0) chartType = defaultChart;
			}
			//var chrtdatabyfltr = getChartDatabyFilter(charId, chartType, xAxisLabel);
			var chrtdatabyfltr = getChartDatabyFilter(charId, chartType, xAxisLabel, entId, itemId, startTimeUtc, endTimeUtc, "", "", "", "", "","");
			var ctrlRuledata = getControlRules(charId, qmSpecId);
			
			chartData.entId = entId;
			chartData.itemId = itemId;
			chartData.startTimeUtc = startTimeUtc;
			chartData.endTimeUtc = endTimeUtc
			chartData.charId = charId;
			chartData.chartType = chartType;
			chartData.xAxisLabel = xAxisLabel;
			chartData.charName = charName;
			chartData.xAxislabelTxt = xAxislabelTxt;
			(chartData.chrtdatabyfltr = chrtdatabyfltr), (chartData.chrttypebyfltr = chrttypebyfltr);
			chartData.ctrlRuledata = ctrlRuledata;
			chartData.themetype = "theme0";
			chartData.SpcNoRecordsId = 10;
			chartData.SPCChrtCnvsId = "SpcChartCanvasId";
			//FT.WorkTasks.contextSet(FORM.Control, "spcData", JSON.stringify(chartData));
			//iwAdjustInventoryOnPostWorkflow();
			//_controls.SpcChartWidget.widgetProperties.data = chartData;
			window.parent.QM.SpcChart.setWidgetData(chartData);
		}

/*function initializeSPCChart(control) {

  // helpers

  const toStr = v => (v === undefined || v === null ? "" : String(v));
 
  // read controls as strings (scalars)

  const entId        = toStr(FORM.Control.findByXmlNode("ddlEntId").value);

  const itemId       = toStr(FORM.Control.findByXmlNode("ddlItemId").value);

  const startTimeUtc = toStr(FORM.Control.findByXmlNode("StartDate").value);

  const endTimeUtc   = toStr(FORM.Control.findByXmlNode("EndDate").value);
 
  let   charId       = toStr(FORM.Control.findByXmlNode("ddlCharacteristic").value);

  let   chartType    = toStr(FORM.Control.findByXmlNode("ddlSpcChartType").value);

  const xAxisLabel   = toStr(FORM.Control.findByXmlNode("ddlXAxisLabel").value);
 
  const charName      = toStr(FORM.Control.findByXmlNode("ddlCharacteristic").displayValue);

  const xAxislabelTxt = toStr(FORM.Control.findByXmlNode("ddlXAxisLabel").displayValue);
 
  // datasets as arrays/objects (not stringified)

  const chrttypebyfltr = getChartTypebyFilter(Number(charId) || 0) || [];

  let   qmSpecId       = toStr(chrttypebyfltr[0]?.qm_spec_id ?? "");
 
  const defaultChart = chrttypebyfltr[0]?.default_chart;

  if (defaultChart != null && chartType === "0") {

    chartType = toStr(defaultChart);

  }
 
  const chrtdatabyfltr = getChartDatabyFilter(

    Number(charId)    || 0,

    Number(chartType) || 0,

    Number(xAxisLabel) || 0

  ) || [];
 
  const ctrlRuledata = getControlRules(Number(charId) || 0, Number(qmSpecId) || -1) || [];
 
  // chartData = array with one object at [0]

  const chartData = [{

    entId,

    itemId,

    startTimeUtc,

    endTimeUtc,

    charId,

    chartType,

    xAxisLabel,

    charName,

    xAxislabelTxt,

    chrtdatabyfltr,   // arrays/objects

    chrttypebyfltr,

    ctrlRuledata,

    themetype: "theme0",

    SpcNoRecordsId: "10",

    SPCChrtCnvsId: "SpcChartCanvasId"

  }];
 
  // Build the payload that matches contextSet’s merge logic

  // IMPORTANT: value must be a JSON string of an array; object at [0] must have keys present in SS_CONTEXT.eventData[0]

  const eventDataValue = JSON.stringify([{

    type: "spc",

    jsonValue: JSON.stringify(chartData)   // string

  }]);
 
  // Write via contextSet (session storage branch)

  FT.WorkTasks.contextSet("", "eventData", eventDataValue);
 
  iwAdjustInventoryOnPostWorkflow();

}*/

	/**
		 * Performs actions after the execution of a workflow.
		 */
		function iwAdjustInventoryOnPostWorkflow() {
		
				FT.Common.windowEventDispatch(
					"qm",
					"qm.spc.filter",
					FT.Common.EVENT_SOURCE_TYPE.form,
					"QM_UI_SpcFilter",
					"qm.spc.filter",
				);
		}
		
		//Gets the control rules for characteristic and QM Specs
		function getControlRules(charId, qmSpecId) {
		const parameterCollection = {
					charId: charId,
					qmSpecId: qmSpecId
				};
			return FT.WebApi.mesGetSync("api/V3/Sample/GetControlRules", "", parameterCollection, false);
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
		 * Form load function to bind cards with respect to entity from form parameters or if session variable EntID
		 */
		function onFormLoad() {
			try {
				ddlCharacteristicLoad();
				ddlEntIdLoad();
				ddItemListLoad();
				ddWOLoad();
				
			} catch (exception) {
				handleScriptError(exception);
			}
		}

		/**
		 * Loads the list of Enity and populates the dropdown control.
		 */
		function ddlEntIdLoad() {
			try {
				var ddlEntId = FORM.Control.findByXmlNode("ddlEntId");
				const parameterCollection = {};
				FT.WebApi.mesGetAsync("api/V3/Entity", "", parameterCollection, false).then(
					(data) => {
						FT.WorkTasks.controlOptionsSetFromDataset("ddlEntId", 0, data, "ent_name", "ent_id");
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
						FT.WorkTasks.controlOptionsSetFromDataset("ddlItemId", 0, translatedData, "item_desc", "item_id");
					}
				},
				(error) => {
					// Handle error
					handleScriptError(error);
				},
			);
		}
		/**
		 * This function WO data and populates a dropdown control
		 * @param {} null
		 * @returns {JSON} data
		 */
		function ddWOLoad() {
			try {
				var ddlWOId = FORM.Control.findByXmlNode("ddlWOId");
				const parameterCollection = {};
				FT.WebApi.mesGetAsync("api/V3/WO", "", parameterCollection, false).then(
					(data) => {
						FT.WorkTasks.controlOptionsSetFromDataset("ddlWOId", 0, data, "woDesc", "woId");
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
		 * Loads the list of Characteristic and populates the dropdown control.
		 */
		function ddlCharacteristicLoad() {
			var ddlCharacteristic = FORM.Control.findByXmlNode("ddlCharacteristic");
			const parameterColl = {
				charId: null,
			};
			FT.WebApi.mesGetAsync("api/v3/Characteristic", "", parameterColl, false).then(
				(data) => {
					// Handle successful response data
					let charactristics = [];
					if (data && data.length > 0) {
						charactristics = data.sort(function (a, b) {
							return a.char_desc.localeCompare(b.char_desc);
						});
					}
					FT.WorkTasks.controlOptionsSetFromDataset("ddlCharacteristic", 0, charactristics, "char_desc", "char_id");
					//ddlChartTypeLoad();
				},
				(error) => {
					// Handle error
					throw new Error("Error:", error);
				},
			);
		}

		/*function getChartDatabyFilter(charId, chartType, xAxisLabel) {
			const parameterCollection = {
					charId: charId,
					chartType: chartType,
					xAxisLabel:xAxisLabel
				};
			return FT.WebApi.mesGetSync("api/V3/Sample/GetChartDataByFilter", "", parameterCollection, false);
		}*/

		function getChartDatabyFilter(charId, chartType, xAxisLabel, entId = "", itemId="", startTimeUtc="", endTimeUtc="", itemCategoryId = "" , woId = "", operId = "", processId ="", segmentRequirementId = "", segmentResponseId = "",) {
			
			const parameterCollection = {
					charId: charId,
					chartType: chartType,
					xAxisLabel:xAxisLabel,
					entId:entId,
					itemId: itemId,
					startTimeUtc:startTimeUtc,
					endTimeUtc:endTimeUtc
				};
			return FT.WebApi.mesGetSync("api/V3/Sample/GetChartDataByFilter", "", parameterCollection, false);
		}
	
	function getChartTypebyFilter(charId) {
			const parameterColl = { charId: charId };
			return FT.WebApi.mesGetSync("api/V3/Sample/GetChartTypeByFilter", "", parameterColl, false);
			
		}

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
			initializeSPCChart: initializeSPCChart,
		};
	}
})(window);
