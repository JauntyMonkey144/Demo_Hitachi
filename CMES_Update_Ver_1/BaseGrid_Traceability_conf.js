/** BaseGrid Configuration File
*   Configuration Name : BaseGrid
*	Version : 1.2
*
*	Ver		Date		Comment
*	1.0		25-Feb-22	Initial version
*	1.1		15-Apr-22	BaseGrid config
 *	1.2		10-Feb-22	Update for select top grid
**/
(function () {
try {
    var getConf = function (confName, widgetObject, cwidget, myConf) {
        if (typeof (window.conf) === 'undefined')
            window.conf = {};

        //Config file name 
        cwidget.on("confName", function () {
            if (myConf.confName != cwidget.confName) {
                var gridChildren = $(widgetObject.baseGrid.domElement).children();
                var gridChildrenData = $(widgetObject.baseGrid.domElement).children("#kendogrid").data("kendoGrid");
                myConf.confName = cwidget.confName;
                widgetObject.baseGrid.init(gridChildren, gridChildrenData);
            }
			
        });

        //notify operations
        cwidget.on("notify", function () {
			
            var notifyobj;
            var grid = $(widgetObject.baseGrid.domElement).children("#kendogrid").data("kendoGrid");
            if (typeof cwidget.notify != "undefined" && cwidget.notify !== "") {
                try {
                    notifyobj = JSON.parse(cwidget.notify);
                }
                catch (ex) {
                    //alert(WW_localize("@@WidgetBaseGridErrorParsingNotify@@") + ex);
                    console.log(WW_localize("@@WidgetBaseGridErrorParsingNotify@@") + ex);
                    return;
                }
            } 
            var functionName = "";
            var fileType = "";
            var field = "";
            var operator = "";
            var value = "";
            var validationResult = false;
            if (notifyobj != null && notifyobj.Functionname != null)
            {
                functionName = notifyobj.Functionname.toUpperCase();
            }
            switch (functionName) {
                case "EXPORT":
                    if (notifyobj.Filetype != null)
                    {
                        fileType = notifyobj.Filetype.toUpperCase();
                    }
                    if (fileType == "PDF") {
                        grid.saveAsPDF();
                    }
                    else if (fileType == "EXCEL") {
                        grid.saveAsExcel();
                    }
                    break;
                case "RESETSORTORDER":
                    grid.dataSource.sort({});
                    break;
                case "CLEARFILTER":
                    grid.dataSource.filter({});
                    break;
                case "FILTER":
                    field = notifyobj.field;
                    operator = notifyobj.operator;
                    value = notifyobj.value;
                    grid.dataSource.filter({
                        "field": field,
                        "operator": operator,
                        "value": value
                    });
                    grid.dataSource.read();
                    break;
                case "VALIDATE":
                    validationResult = notifyobj.result;
                    if (validationResult == false){
                        widgetObject.baseGrid.HandleValidationResult();
                    }
                    break;
            }
        });

        //Select Top Grid Item
        cwidget.on("selectTopGridItem", function () {
            var selectobj = "";
            if (cwidget.selectTopGridItem != null && cwidget.selectTopGridItem != 'undefined' && cwidget.selectTopGridItem != '') {
                selectobj = JSON.parse(cwidget.selectTopGridItem);
            }
            myConf.isSelectTopGridItem = false;
            if (selectobj === true) {
                myConf.isSelectTopGridItem = true;
            }
        });

        // data property
        cwidget.on("data", function () {
            var grid = $(widgetObject.baseGrid.domElement).children("#kendogrid").data("kendoGrid");
            if (cwidget.data !== "") {
				myConf.useData = true;
                grid.dataSource.read();
            }
        });

        var conf = {
            widgetTitle: WW_localize("@@WidgetBaseGridWidgetTitle@@"),
            dataSource: {
                transport: {
                    read: widgetObject.baseGrid.dataSourceRead,
                    update: widgetObject.baseGrid.dataSourceUpdate,
                },
                change: widgetObject.baseGrid.dataSourceChange,
                // section for cell datatypes and input field.
                schema: {
                    model: {
                        id: "NumberOrder", // Khóa chính từ SQL
                        fields: {
                            "NumberOrder": { type: "number", editable: false },
                            "WorkOrder": { type: "string", editable: false },
                            "Product": { type: "string", editable: false },
                            "ProductName": { type: "string", editable: false },
                            "Qty": { type: "number", editable: false },
                            "ProcessName": { type: "string", editable: false },
                            "Process": { type: "string", editable: false },
                            "Factory": { type: "string", editable: false },
                            "FromDate": { type: "string", editable: false },
                            "ToDate": { type: "string", editable: false },
                            "Status": { type: "string", editable: false }
                        }
                    }
                },
                filterable: true,
            },
            // Columns
            //Column names,title,template are specified here
            columns: [
                { field: "NumberOrder", title: "No.", width: "80px" },
                { field: "WorkOrder", title: "Work Order", width: "120px" },
                { field: "Product", title: "Product", width: "120px" },
                { field: "ProductName", title: "Product Name", width: "150px" },
                { field: "Qty", title: "Quantity", width: "100px" },
                { field: "ProcessName", title: "Process Name", width: "180px" },
                { field: "Process", title: "Process", width: "120px" },
                { field: "Factory", title: "Factory", width: "120px" },
                { field: "FromDate", title: "From Date", width: "150px" },
                { field: "ToDate", title: "To Date", width: "150px" },
                { field: "Status", title: "Status", width: "120px" }
            ],
            // Options
            noRecords: true,
            filterable: {
                extra: false, //do not show extra filters
            },
            resizable: true,
            sortable: {
                mode: "multiple",
                allowUnsort: true,
                showIndexes: true
            },
            editable: true,
            selectable: true,
            scrollable: true,
            persistSelection: true,
            pageable: {
                pageSize: 7,
                position: "bottom",
                responsive: true
            },
            // Events
            cellClick: "onCellClick($event)",
            dblclick: "onDblClick()",
            beforeEdit: widgetObject.baseGrid.beforeEdit,
            change: widgetObject.baseGrid.change,
            edit: widgetObject.baseGrid.edit,
            cancel: widgetObject.baseGrid.cancel,
            remove: widgetObject.baseGrid.remove,
            save: widgetObject.baseGrid.save,
            search: widgetObject.baseGrid.search,
            saveChanges: widgetObject.baseGrid.saveChanges,
            cellClose: widgetObject.baseGrid.cellClose,
            dataBinding: widgetObject.baseGrid.dataBinding,
            dataBound: function (e) {
                widgetObject.baseGrid.dataBound(e, "widgetObject.baseGrid.dataBound");
            }
        }; // End Grid Configuration
		widgetObject.baseGrid.editCallback =  function (e) {}
        return conf;
    }

    //Widget config name
    if (typeof (window.conf) === 'undefined')
        window.conf = {};

    if (typeof (window.conf['BaseGrid_Traceability']) === 'undefined') {
        window.conf['BaseGrid_Traceability'] = getConf;
    }
} catch (globalErr) {
        console.error("CRITICAL ERROR in BaseGrid_Traceability_conf.js Script execution: ", globalErr);
    }
})();