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
					type: "ProdReason",
					iconVisible: false,
					defaultIcon: "soda1.png",
					defaultItemSelection: true,
					defaultValue: true,
					displayTitle: true,
					itemValue: "reas_cd",
					html:
						'<span class="MDCCTile verticalarray  uilab-black-subtitle-2-or-button flex-vertical clickablecard item" itemValue="xxItemValue" style="background-color:xxTileColor">' +
						'<span class="md_buttonname">xxTitle</span>' +
						"</span>",
					dataMapper: [{ xxTitle: "reas_desc", xxTileColor: "tilecolor" }],
				},
			],
		}; // End Grid Configuration
		return conf;
	};

	var testData = "[";
	testData +=
		'{"type":"ProdReason","reas_cd":"1","reas_desc":"ProdReason 1","description1":"ProdReason for coca cola 1","description2":"10","value1":"Kg","tilecolor":"#ffffe9"},';
	testData +=
		'{"type":"ProdReason","reas_cd":"2","reas_desc":"ProdReason 2","description1":"ProdReason for coca cola 2","description2":"20","value1":"Kg","tilecolor":"#ffffe9"},';
	testData +=
		'{"type":"ProdReason","reas_cd":"3","reas_desc":"ProdReason 3","description1":"ProdReason for coca cola 3","description2":"10","value1":"Kg","tilecolor":"#ffffe9"},';
	testData +=
		'{"type":"ProdReason","reas_cd":"4","reas_desc":"ProdReason 4","description1":"ProdReason for coca cola 4","description2":"30","value1":"Kg","tilecolor":"#ffffe9"},';
	testData +=
		'{"type":"ProdReason","reas_cd":"5","reas_desc":"ProdReason 5","description1":"ProdReason for coca cola 5","description2":"10","value1":"Kg","tilecolor":"#ffffe9"}';
	testData += "]";

	//testData = "";

	//Widget config name
	if (typeof window.conf === "undefined") window.conf = {};

	if (typeof window.conf["Tiles"] === "undefined") {
		window.conf["Tiles"] = getConf;
	}
	if (typeof window.conf["Tiles_testdata"] === "undefined") {
		testData = "[]";
		window.conf["Tiles_testdata"] = testData;
	}
})();
