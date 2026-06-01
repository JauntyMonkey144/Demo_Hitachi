/* WidgetExample Configuration File
 *   Configuration Name : WidgetExample
 *	Version : 1.0
 *
 *	Ver		Date		Comment
 *	1.0		25-Feb-22	Initial version
Ver     	Release	By			Date				Change Description
001     	01.00		Chitta	2025-03-24	#4508 ,empty Test Data value
 */
(function () {
	var getConf = function (confName, widgetObject, cwidget, myConf) {
		if (typeof window.conf === "undefined") window.conf = {};
		//Config file name
		cwidget.on("confName", function () {
			if (myConf.confName != cwidget.confName) {
				myConf.confName = cwidget.confName;
				widgetObject.widgetTemplate.init();
			}
		});

		// data property
		cwidget.on("data", function () {
			//alert("something changes");
			if (typeof cwidget.data != "undefined") {
				if (cwidget.data !== "") {
					widgetObject.widgetTemplate.createWidgetContent(true, "data");
				}
			}
		});

		var conf = {
			tileContent: [
				{
					type: "BOMITEM",
					iconVisible: true,
					defaultIcon: "soda1.png",
					defaultItemSelection: true,
					defaultValue: true,
					displayTitle: true,
					itemValue: "JSON",
					html:
						'<div class="tile clickablecard item" itemValue="xxItemValue" style="background-color:xxTileColor">' +
						'<div class="tileImage">' +
						'<img src="./Custom/Widgets/images/xxIcon">' +
						"</div>" +
						'<div class="tileContent">' +
						'<b class="tile-title">xxTitle</b>' +
						'<p class="tile-description">xxDescription1</p>' +
						'<p class="tile-qty">xxDescription2 xxValue1</p>' +
						"</div>" +
						"</div>",
					dataMapper: [
						{ xxTitle: "title_desc", xxDescription1: "title", xxDescription2: "qty", xxValue1: "uom", xxTileColor: "tilecolor",xxIcon: { param: "icon", removeIfNull: true } },
					],
				},
			],
		}; // End Grid Configuration
		return conf;
	};

	var testData = "[";
	testData +=
		'{"type":"BomItem","id":"1","title":"Soda 1","titledesc":"Soda for coca cola 1","Qty":"10","UOM":"Kg","tilecolor":"#fff"},';
	testData +=
		'{"type":"BomItem","id":"2","title":"Soda 2","titledesc":"Soda for coca cola 2","Qty":"20","UOM":"Kg","tilecolor":"#fff"},';
	testData +=
		'{"type":"BomItem","id":"3","title":"Soda 3","titledesc":"Soda for coca cola 3","Qty":"10","UOM":"Kg","tilecolor":"#fff"},';
	testData +=
		'{"type":"bomitem","id":"4","title":"Soda 4","titledesc":"Soda for coca cola 4","Qty":"30","UOM":"Kg","tilecolor":"#fff"},';
	testData +=
		'{"type":"bomitem","id":"5","title":"Soda 5","titledesc":"Soda for coca cola 5","Qty":"10","UOM":"Kg","tilecolor":"#fff"}';
	testData += "]";

	// var testData = "";

	//Widget config name
	if (typeof window.conf === "undefined") window.conf = {};

	if (typeof window.conf["FT_SingleLevel2"] === "undefined") {
		window.conf["FT_SingleLevel2"] = getConf;
	}
	if (typeof window.conf["FT_SingleLevel2_testdata"] === "undefined") {
		testData = "[]";
		window.conf["FT_SingleLevel2_testdata"] = testData;
	}
})();
