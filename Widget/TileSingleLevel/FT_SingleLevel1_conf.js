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
		cwidget.on("confName", function () {
			if (myConf.confName != cwidget.confName) {
				myConf.confName = cwidget.confName;
				widgetObject.widgetTemplate.init();
			}
		});
		cwidget.on("move", function () {
			if (typeof cwidget.data != "undefined") {
				widgetObject.widgetTemplate.createWidgetContent(true, "next");
			}
		});
		// data property
		cwidget.on("data", function () {
			//alert("something changes");
			if (typeof cwidget.data != "undefined") {
				if (cwidget.data !== "") {
					widgetObject.widgetTemplate.createWidgetContent(true, "data");
					//cwidget.onCellChange = "";
					//alert("from widget data"+cwidget.widgetProperties.data);
				}
			}
		});
		var conf = {
			tileContent: [
				{
					type: "CharItem",
					iconVisible: false,
					defaultIcon: "po.svg",
					defaultItemSelection: true,
					defaultValue: true,
					displayTitle: true,
					itemValue: "JSON",
					html:
						'<div class="tile clickablecard item" itemValue="xxItemValue" style="background-color:xxTileColor">' +
						'<div class="tileImage">' +
						'<img src="../../images/xxIcon">' +
						"</div>" +
						'<div class="tileContent">' +
						'<b class="tile-title">xxTitle</b>' +
						'<p class="tile-description">xxDescription1</p>' + 
						"</div>" +
						"</div>",
					dataMapper: [
						{
							xxTitle: "char_desc",
							xxIcon: { param: "icon", removeIfNull: true },
							xxDescription1: "qm_spec_name",
							xxDescription2: "target",
							xxValue1: "uom_desc",
							xxTileColor: "tilecolor",
						},
					],
				},
			],
		}; // End Grid Configuration
		return conf;
	};

	var testData = "[";
	testData +=
		'{"type":"CharItem","sample_id":"201","char_id":"1","char_name":"E9000004","char_num":null,"char_desc":"Aveva_Soda_PH_Level","type_h":"0","num_decimals":"2","severity_cd_h":"2","minimum_sample_size_h":"1","maximum_sample_size_h":"5","sample_size_source_h":null,"normal_sample_size_h":"5","automated_coll_h":"False","act_sample_size_h":"5","qm_spec_id":"0","qm_spec_name":"Aveva_ManualQMSpec","ver_id":"1001","value":"6.00","target":"7","lsv":"6.7","usv":"7.3","lrv":null,"urv":null,"target_vis":"      7.00","lsv_vis":"      6.70","usv_vis":"      7.30","lrv_vis":null,"urv_vis":null,"result_no":"1","final":"True","equipment":null,"uom_id":"0","uom_desc":"Pieces","catalog_type":null,"catalog_id":null,"isformularesult":"False","last_edit_comment":"6.00","last_edit_by":"SD\\praveenkumar.t","last_edit_at":"7/29/2023 4:35:02 AM","hmi_order_nr":null,"inputsource":null,"color_h":"16777215","color_bck":"255"},';
	testData +=
		'{"type":"CharItem","sample_id":"202","char_id":"2","char_name":"E9000004","char_num":null,"char_desc":"Aveva_Soda_PH_Level","type_h":"0","num_decimals":"2","severity_cd_h":"2","minimum_sample_size_h":"1","maximum_sample_size_h":"5","sample_size_source_h":null,"normal_sample_size_h":"5","automated_coll_h":"False","act_sample_size_h":"5","qm_spec_id":"0","qm_spec_name":"Aveva_ManualQMSpec","ver_id":"1001","value":"6.00","target":"7","lsv":"6.7","usv":"7.3","lrv":null,"urv":null,"target_vis":"      7.00","lsv_vis":"      6.70","usv_vis":"      7.30","lrv_vis":null,"urv_vis":null,"result_no":"1","final":"True","equipment":null,"uom_id":"0","uom_desc":"Pieces","catalog_type":null,"catalog_id":null,"isformularesult":"False","last_edit_comment":"6.00","last_edit_by":"SD\\praveenkumar.t","last_edit_at":"7/29/2023 4:35:02 AM","hmi_order_nr":null,"inputsource":null,"color_h":"16777215","color_bck":"255"}';
	testData += "]";

	//testData = "";

	//Widget config name
	if (typeof window.conf === "undefined") window.conf = {};

	if (typeof window.conf["FT_SingleLevel1"] === "undefined") {
		window.conf["FT_SingleLevel1"] = getConf;
	}
	if (typeof window.conf["FT_SingleLevel1_testdata"] === "undefined") {
		testData = "[]";
		window.conf["FT_SingleLevel1_testdata"] = testData;
	}
})();
