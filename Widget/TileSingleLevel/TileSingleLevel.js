/* ConsumptionItems: 
	Version 0.9
Ver     	Release	By			Date				Change Description
001     	01.00		Chitta	2025-03-24	#4508 ,removed alert message

*/
(function () {
	// Set manual configuration

	var myConf = {};
	myConf.widgetName = "./";
	myConf.confName = "FT_SingleLevel";
	myConf.divId = "#myTileSingleLevel";
	//myConf.widgetClass=".k-grid";
	myConf.UseData = false;
	var histdata = null;

	var cwidget = WW_getNewCwidget(cwidget, myConf);

	// Create a mdm.ConsumptionItems object to contain functions and data
	var mdm = mdm || {};
	mdm.widgetTemplate = mdm.widgetTemplate || {};

	/**
	 * Save the domElement
	 */
	if (!WW_isUndefinedOrNull(window.getDivId)) {
		// if WT proxy exists get dynamic divId, if not existing manual divId used
		var $domElement = $(window.getDivId(cwidget, myConf.divId));
		mdm.widgetTemplate.domElement = $domElement.length > 0 ? $domElement[0] : null;
	} else {
		mdm.widgetTemplate.domElement = cwidget.domElement;
	}

	cwidget.destroyWidget = function () {
		// This would take care of clearing internal subscriptions and events.
		cwidget.destroy();

		// destroy other events and subscriptions if any
		mdm.widgetTemplate.destroyWidget();
	};

	/**
	 * Initialization function for custom kendoGrid and SkeltaGrid
	 */
	mdm.widgetTemplate.init = function () {
		mdm.widgetTemplate.createWidgetContent(false, "init");
	};

	/**
	 * Global do it function handler:
	 * Finds correct widget object and raise webwidget control ondatachange scripts
	 * as well as setting the value property
	 */
	widgetTemplate_doIt = function (myDiv, chipselector, event) {
		alert("Widget Template Do It");
	};

	mdm.widgetTemplate.createWidgetContent = function (isdata, source) {
		let myData = "";
		var wConf = {};
		// Check if data from continer exists
		if (!isdata) {
			if (typeof cwidget.data !== "undefined" && cwidget.data != null) if (cwidget.data != "") myData = cwidget.data; //cwidget.onCellChange =data;
		}
		//check if widgetProperties data - has some value
		if (isdata) {
			if (typeof cwidget.control.widgetProperties.data !== "undefined" && cwidget.control.widgetProperties.data != null)
				if (cwidget.control.widgetProperties.data != "") myData = cwidget.control.widgetProperties.data;
		}
		// if no data from container exists, use configuration file data
		if (myData == "") myData = WW_getTestData(myConf.confName, "_testdata");

		/**
		 * get configuration from config array
		 **/
		wConf = WW_getMyConf(mdm, cwidget, myConf);

		if (wConf != null) {
			if (histdata != myData) {
				var widget = $(mdm.widgetTemplate.domElement).widgetTemplateTileSingleLevel(wConf, myData, cwidget);
				//histdata = cwidget.data;
			}
		} else {
			alert("Error loading configuration");
		}
	};

	mdm.widgetTemplate.destroyWidget = function () {
		//console.log("widgetTemplate: destroyWidget is called.");

		// destroy events and subscriptions if any
		delete mdm.widgetTemplate.domElement;
	};

	// =======================================================================
	// Event example
	// =======================================================================

	mdm.widgetTemplate.beforeEdit = function (e) {};

	//added by faya
	customClick = function (e) {
		var rowIndex = Object.keys(e.sender._selectedIds)[0];
		mdm.widgetTemplate.event = e;
	};
	mdm.widgetTemplate.onCellChange = function (e) {
		// var rowIndex = Object.keys(e.sender._selectedIds)[0];
		// mdm.widgetTemplate.widgetScripts.event = e;
	};
	//added by faya
	// =======================================================================
	// Initialize the form
	// =======================================================================

	// Call the initialization when the document is ready
	$(document).ready(mdm.widgetTemplate.init);
})();
