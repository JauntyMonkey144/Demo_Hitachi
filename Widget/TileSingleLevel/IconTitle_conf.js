/** WidgetExample Configuration File
 *   Configuration Name : WidgetExample
 *	Version : 1.0
 *
 *	Ver		Date		Comment
 *	1.0		25-Feb-22	Initial version
Ver     	Release	By			Date				Change Description
001     	01.00		Chitta	2025-03-24	#4508 ,empty Test Data value
 **/
(function () {
	var getConf = function (confName, widgetObject, cwidget, myConf) {
		if (typeof window.conf === "undefined") window.conf = {};
		//Config file name

		var conf = {
			tileContent: [
				{
					type: "IconTitle",
					iconVisible: false,
					defaultIcon: "..images/production--product.svg",
					defaultItemSelection: true,
					defaultValue: true,
					displayTitle: true,
					itemValue: "reas_cd",
					html:
						'<span class="MDCCTile square verticalarray  uilab-black-subtitle-2-or-button flex-vertical clickablecard item" itemValue="xxItemValue" style="background-color:xxTileColor">' +
						'<img class="TileIcon" src="../images/xxIcon" /><span class="md_buttonname square">xxTitle</span>' +
						"</span>",
					dataMapper: [{ xxTitle: "reas_desc", xxTileColor: "tilecolor", xxIcon: "icon" }],
				},
			],
		}; // End Grid Configuration
		return conf;
	};

	var testData = "[";
	testData +=
		'{"type":"IconTitle","reas_cd":"1","reas_desc":"IconTitle 1","description1":"IconTitle for coca cola 1","description2":"10","value1":"Kg","tilecolor":"#ffffe9","icon":"production--product.svg"},';
	testData +=
		'{"type":"IconTitle","reas_cd":"2","reas_desc":"IconTitle 2","description1":"IconTitle for coca cola 2","description2":"20","value1":"Kg","tilecolor":"#ffffe9","icon":"properties--quality-specification.svg"},';
	testData +=
		'{"type":"IconTitle","reas_cd":"3","reas_desc":"IconTitle 3","description1":"IconTitle for coca cola 3","description2":"10","value1":"Kg","tilecolor":"#ffffe9","icon":"production--product.svg"},';
	testData +=
		'{"type":"IconTitle","reas_cd":"4","reas_desc":"IconTitle 4","description1":"IconTitle for coca cola 4","description2":"30","value1":"Kg","tilecolor":"#ffffe9","icon":"configuration--tools.svg"},';
	testData +=
		'{"type":"IconTitle","reas_cd":"5","reas_desc":"IconTitle 5","description1":"IconTitle for coca cola 5","description2":"10","value1":"Kg","tilecolor":"#ffffe9","icon":"production--product.svg"}';
	testData += "]";

	//testData = "";

	//Widget config name
	if (typeof window.conf === "undefined") window.conf = {};

	if (typeof window.conf["IconTitle"] === "undefined") {
		window.conf["IconTitle"] = getConf;
	}
	if (typeof window.conf["IconTitle_testdata"] === "undefined") {
		testData = "[]";
		window.conf["IconTitle_testdata"] = testData;
	}
})();
