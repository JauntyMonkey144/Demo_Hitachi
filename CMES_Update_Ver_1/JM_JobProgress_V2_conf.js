/* WidgetExample Configuration File
 *   Configuration Name : JobProgress
 *	Version : 1.0
 *
 *	Ver		Date		Comment
 *	1.0		25-Feb-22	Initial version
 */
(function () {
	var getConf = function (confName, widgetObject, cwidget, myConf) {
		if (typeof window.conf === "undefined") window.conf = {};

		//Config file name
		cwidget.on("confName", function () {
			if (myConf.confName != cwidget.confName) {
				myConf.confName = cwidget.confName;
				widgetObject.JobStateProgress.init();
			}
		});
		
		var conf = {
			onclick: "Progress_doIt",
			header: [
				{
					id: "h",
					textfield: "text",
				},
			],
			rowTemplate: [
				{
					field: "id",
					name: "id",
					type: "text",
					hidden: true,
				},
				{
					field: "text",
					name: "",
					type: "input",
				},
				{
					field: "value",
					name: "",
					type: "progress",
				},
			],
		}; // End Grid Configuration
		return conf;
	};

	var testData = "";
	//Widget config name
	if (typeof window.conf === "undefined") window.conf = {};

	if (typeof window.conf["JM_JobProgress"] === "undefined") {
		window.conf["JM_JobProgress"] = getConf;
	}

	if (typeof window.conf["JM_JobProgress_testdata"] === "undefined") {
		window.conf["JM_JobProgress_testdata"] = testData;
	}
})();
