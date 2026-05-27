/**
Name:           OM_Queue_V3_conf.js of KendoGrid Configuration File
Description:    This file contains the configuration data to be used for the Workorder records of form UC_OM_UI_Queue.
 *
Ver     Release     By                    Date                    Change Description
001   00.50.00  Krishna       2024-11-04    #Initial version
002     01.00.00    Chittaranjan    2025-04-02      #4770 Due date format should be format: "{0:g}"
003     01.01.00  Somya S               2025-05-08      #4963 Equipment is renamed to Line while creating the Wo.
004     01.01.01  Praveen       2025-06-06      #5026 Add localization in grid column header.
**/
(() => {
    function getConf(confName, widgetObject, cwidget, myConf) {
        if (typeof window.conf === "undefined") window.conf = {};

        // BẢN VÁ TỐI ƯU HIỂN THỊ: Tự động chèn CSS Class vào trình duyệt để xử lý màu thông minh
        if (!document.getElementById('custom-wo-status-style')) {
            var style = document.createElement('style');
            style.id = 'custom-wo-status-style';
            style.innerHTML = 
                ".status-badge { font-weight: bold; } " +
                ".k-grid tbody tr:not(.k-state-selected) .status-COMPLETE { color: rgb(21, 120, 36); } " +
                ".k-grid tbody tr:not(.k-state-selected) .status-RUNNING { color: rgb(0, 100, 210); } " +
                ".k-grid tbody tr:not(.k-state-selected) .status-HOLD { color: rgb(180, 120, 0); } " +
                ".k-grid tbody tr:not(.k-state-selected) .status-CANCEL { color: rgb(200, 30, 30); } " +
                ".k-grid tbody tr.k-state-selected .status-badge { color: #ffffff !important; }"; // Ép thành màu trắng khi được chọn
            document.head.appendChild(style);
        }

        //Config file name
        cwidget.on("confName", function () {
            if (myConf.confName != cwidget.confName) {
                var gridChildren = $(widgetObject.kendoGrid.domElement).children();
                var gridChildrenData = $(widgetObject.kendoGrid.domElement).children("#kendogrid").data("kendoGrid");
                myConf.confName = cwidget.confName;
                widgetObject.kendoGrid.init(gridChildren, gridChildrenData);
            }
        });

        //notify operations
        cwidget.on("notify", function () {
            var notifyobj;
            var grid = $(widgetObject.kendoGrid.domElement).children("#kendogrid").data("kendoGrid");
            if (typeof cwidget.notify != "undefined" && cwidget.notify !== "") {
                try {
                    notifyobj = JSON.parse(cwidget.notify);
                } catch (ex) {
                    return;
                }
            }
            var functionName = "";
            var fileType = "";
            var field = "";
            var operator = "";
            var value = "";
            var validationResult = false;
            if (notifyobj != null && notifyobj.Functionname != null) {
                functionName = notifyobj.Functionname.toUpperCase();
            }
            switch (functionName) {
                case "EXPORT":
                    if (notifyobj.Filetype != null) {
                        fileType = notifyobj.Filetype.toUpperCase();
                    }
                    if (fileType == "PDF") {
                        grid.saveAsPDF();
                    } else if (fileType == "EXCEL") {
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
                        field: field,
                        operator: operator,
                        value: value,
                    });
                    grid.dataSource.read();
                    break;
                case "VALIDATE":
                    validationResult = notifyobj.result;
                    if (validationResult == false) {
                        widgetObject.kendoGrid.handleValidationResult();
                    }
                    break;
            }
        });

        //Select Top Grid Item
        cwidget.on("selectTopGridItem", function () {
            var selectobj = "";
            if (cwidget.selectTopGridItem != null && cwidget.selectTopGridItem != "undefined" && cwidget.selectTopGridItem != "") {
                selectobj = JSON.parse(cwidget.selectTopGridItem);
            }
            myConf.isSelectTopGridItem = false;
            if (selectobj === true) {
                myConf.isSelectTopGridItem = true;
            }
        });

        // data property
        cwidget.on("data", function () {
            var grid = $(widgetObject.kendoGrid.domElement).children("#kendogrid").data("kendoGrid");
            if (cwidget.data !== "") {
                myConf.useData = true;
                grid.dataSource.read();
            }
        });

        var conf = {
            dataSource: {
                transport: {
                    read: widgetObject.kendoGrid.dataSourceRead,
                    update: widgetObject.kendoGrid.dataSourceUpdate,
                },
                change: widgetObject.kendoGrid.dataSourceChange,
                schema: {
                    model: {
                        id: "wo_id",
                        fields: {
                            item_id: { type: "string", editable: false },
                            req_finish_time_utc: { type: "date", editable: false },
                            actual_fg: { type: "number", editable: false}
                        },
                    },
                },
                filterable: true,
            },
            // ==========================================================
            // CẤU HÌNH CỘT (COLUMNS)
            // ==========================================================
            columns: [
                {
                    field: "wo_id",
                    title: WW_localize("@@OM_PoWoId@@"),
                },
                {
                    field: "process_id",
                    title: WW_localize("@@OM_WOProcessId@@"),
                },
                {
                    field: "item_id",
                    title: WW_localize("@@FT_ItemId@@"),
                },
                {
                    field: "item_desc",
                    title: WW_localize("@@FT_ItemDescription@@"),
                },
                {
                    field: "mo_id",
                    title: WW_localize("Factory"),
                },
                {
                    field: "wo_status_desc",
                    title: WW_localize("@@OM_WOStatus@@"),
                    // Gán CSS Class tương ứng với trạng thái thay vì fix cứng Inline CSS
                    template: "# var st = data.wo_status_desc ? data.wo_status_desc.toUpperCase() : ''; " +
                              "var cls = ''; " +
                              "if(st.indexOf('COMPLETE')>-1){cls='status-COMPLETE';} " +
                              "else if(st.indexOf('RUNNING')>-1){cls='status-RUNNING';} " +
                              "else if(st.indexOf('HOLD')>-1||st.indexOf('SUSPEND')>-1){cls='status-HOLD';} " +
                              "else if(st.indexOf('CANCEL')>-1){cls='status-CANCEL';} #" +
                              "<span class='status-badge #=cls#'>#= data.wo_status_desc || '' #</span>"
                },
                {
                    field: "req_finish_time_utc",
                    title: WW_localize("@@OM_DueDate@@"),
                    format: "{0:g}",
                    filterable: { ui: "datetimepicker" },
                },
                {
                    field: "qty_reqd",
                    title: WW_localize("@@FT_Qty@@"),
                },
                {
                    field: "actual_fg", 
                    title: "Actual Finish Good", 
                },
                {
                    field: "uom_desc",
                    title: WW_localize("@@FT_Units@@"),
                },
                {
                    field: "target_sched_line_name",
                    title: WW_localize("@@FT_Line@@"),
                },
            ],
            // Options
            noRecords: true,
            filterable: {
                extra: false, 
            },
            resizable: true,
            sortable: {
                mode: "multiple",
                allowUnsort: true,
                showIndexes: true,
            },
            editable: false,
            selectable: true,
            scrollable: true,
            persistSelection: true,
            pageable: {
                pageSize: 7,
                position: "bottom",
                responsive: true,
            },
            // Events
            cellClick: "onCellClick($event)",
            dblclick: "onDblClick()",
            beforeEdit: widgetObject.kendoGrid.beforeEdit,
            change: widgetObject.kendoGrid.change,
            edit: widgetObject.kendoGrid.edit,
            cancel: widgetObject.kendoGrid.cancel,
            remove: widgetObject.kendoGrid.remove,
            save: widgetObject.kendoGrid.save,
            search: widgetObject.kendoGrid.search,
            saveChanges: widgetObject.kendoGrid.saveChanges,
            cellClose: widgetObject.kendoGrid.cellClose,
            dataBinding: widgetObject.kendoGrid.dataBinding,
            dataBound: function (e) {
                widgetObject.kendoGrid.dataBound(e, "widgetObject.kendoGrid.dataBound");
            },
        }; 
        widgetObject.kendoGrid.editCallback = function (e) {};
        return conf;
    }

    //Widget config name
    if (typeof window.conf === "undefined") window.conf = {};

    if (typeof window.conf["OM_Queue_V3"] === "undefined") {
        window.conf["OM_Queue_V3"] = getConf;
    }
})();