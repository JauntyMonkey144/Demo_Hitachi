/*
Name:           IM_InventoryDetails_conf.js of KendoGrid Configuration File
Description:    Main configuration file with Dynamic CSS injection for grid coloring.
*/
(function () {
    // 1. Tự động chèn CSS vào trang để đổi màu text và xử lý khi chọn dòng
    if (!document.getElementById("custom-grid-styles")) {
        var css = `
            .cell-normal { color: #28a745; font-weight: bold; }
            .cell-poor { color: #ffc107; font-weight: bold; }
            .cell-scarps { color: #dc3545; font-weight: bold; }
            .cell-finished-goods { color: #009688; font-weight: bold; }
            .cell-raw-materials { color: #795548; font-weight: bold; }
            .cell-wip-materials { color: #00bcd4; font-weight: bold; }
            .cell-production-scraps { color: #d32f2f; font-weight: bold; }

            /* Ép màu trắng khi dòng được chọn (tránh bị chìm màu) */
            .k-state-selected .cell-normal,
            .k-state-selected .cell-poor,
            .k-state-selected .cell-scarps,
            .k-state-selected .cell-finished-goods,
            .k-state-selected .cell-raw-materials,
            .k-state-selected .cell-wip-materials,
            .k-state-selected .cell-production-scraps {
                color: #ffffff !important;
            }
        `;
        var style = document.createElement('style');
        style.id = "custom-grid-styles";
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
    }

    // Hàm helper để tạo class name an toàn
    function getGridClass(text) {
        if (!text) return "";
        return "cell-" + text.toLowerCase().replace(/\s+/g, '-');
    }

    var getConf = function (confName, widgetObject, cwidget, myConf) {
        if (typeof window.conf === "undefined") window.conf = {};

        cwidget.on("confName", function () {
            if (myConf.confName != cwidget.confName) {
                var gridChildren = $(widgetObject.kendoGrid.domElement).children();
                var gridChildrenData = $(widgetObject.kendoGrid.domElement).children("#kendogrid").data("kendoGrid");
                myConf.confName = cwidget.confName;
                widgetObject.kendoGrid.init(gridChildren, gridChildrenData);
            }
        });

        cwidget.on("notify", function () {
            var notifyobj;
            var grid = $(widgetObject.kendoGrid.domElement).children("#kendogrid").data("kendoGrid");
            if (typeof cwidget.notify != "undefined" && cwidget.notify !== "") {
                try { notifyobj = JSON.parse(cwidget.notify); } catch (ex) { return; }
            }
            var functionName = notifyobj != null && notifyobj.Functionname != null ? notifyobj.Functionname.toUpperCase() : "";
            
            switch (functionName) {
                case "EXPORT":
                    var fileType = notifyobj.Filetype ? notifyobj.Filetype.toUpperCase() : "";
                    if (fileType == "PDF") grid.saveAsPDF();
                    else if (fileType == "EXCEL") grid.saveAsExcel();
                    break;
                case "RESETSORTORDER": grid.dataSource.sort({}); break;
                case "CLEARFILTER": grid.dataSource.filter({}); break;
                case "FILTER":
                    grid.dataSource.filter({ field: notifyobj.field, operator: notifyobj.operator, value: notifyobj.value });
                    grid.dataSource.read();
                    break;
                case "VALIDATE":
                    if (notifyobj.result == false) widgetObject.kendoGrid.handleValidationResult();
                    break;
            }
        });

        cwidget.on("selectTopGridItem", function () {
            var selectobj = (cwidget.selectTopGridItem != null && cwidget.selectTopGridItem != "") ? JSON.parse(cwidget.selectTopGridItem) : "";
            myConf.isSelectTopGridItem = (selectobj === true);
        });

        cwidget.on("data", function () {
            var grid = $(widgetObject.kendoGrid.domElement).children("#kendogrid").data("kendoGrid");
            if (cwidget.data !== "") {
                myConf.UseData = true;
                grid.dataSource.read();
            }
        });

        var conf = {
            widgetTitle: "",
            dataSource: {
                transport: {
                    read: widgetObject.kendoGrid.dataSourceRead,
                    update: widgetObject.kendoGrid.dataSourceUpdate,
                    destroy: widgetObject.kendoGrid.dataSourceDestroy,
                    create: widgetObject.kendoGrid.dataSourceCreate,
                },
                change: widgetObject.kendoGrid.dataSourceChange,
                sort: [{ field: "item_id", dir: "desc" }],
                schema: {
                    model: {
                        id: "row_id_h",
                        fields: {
                            item_id: { editable: false },
                            type_desc: { type: "string" },
                            user_id: { type: "string" },
                            expiry_date_local: { type: "date" },
                        },
                    },
                },
                filterable: true,
            },
            columns: [
                { field: "item_id", title: WW_localize("@@FT_ItemId@@") },
                { field: "item_desc", title: WW_localize("@@FT_ItemDescription@@") },
                { field: "lot_no", title: WW_localize("@@FT_Lot@@") },
                { field: "sublot_no", title: WW_localize("@@FT_SubLot@@") },
                { field: "qty_left", title: WW_localize("@@FT_Qty@@") },
                { field: "item_inv_uom_description", title: WW_localize("@@FT_Units@@") },
                { field: "description", title: WW_localize("@@FT_Location@@") },
                { 
                    field: "item_grade_desc", 
                    title: WW_localize("@@IM_ItemGrade@@"),
                    template: function(dataItem) {
                        var val = dataItem.item_grade_desc || "";
                        return '<span class="' + getGridClass(val) + '">' + val + '</span>';
                    }
                },
                { 
                    field: "item_status_desc", 
                    title: WW_localize("@@IM_ItemState@@"),
                    template: function(dataItem) {
                        var val = dataItem.item_status_desc || "";
                        return '<span class="' + getGridClass(val) + '">' + val + '</span>';
                    }
                },
                {
                    field: "expiry_date_local",
                    title: WW_localize("@@FT_ExpiryDate@@"),
                    format: "{0:g}",
                    filterable: { ui: "datetimepicker" },
                },
            ],
            noRecords: true,
            filterable: { extra: false },
            resizable: true,
            sortable: { mode: "multiple", allowUnsort: true, showIndexes: true },
            editable: { mode: "inline", createAt: "top" },
            selectable: "row",
            scrollable: true,
            persistSelection: true,
            pageable: { pageSize: 7, position: "bottom", responsive: true },
            // Events
            cellClick: "onCellClick($event)",
            dblclick: "onDblClick()",
            change: widgetObject.kendoGrid.change,
            dataBound: function (e) {
                var grid = e.sender;
                grid.tbody.find(".status").each(function () {
                    var row = $(this).closest("tr");
                    var model = grid.dataItem(row);
                    $(this).kendoProgressBar({ max: model.qty_reqd, value: model.qty_prod });
                });
                if (widgetObject.kendoGrid && widgetObject.kendoGrid.dataBound) {
                    widgetObject.kendoGrid.dataBound(e, "widgetObject.kendoGrid.dataBound");
                }
            }
        }; 
        return conf;
    };

    if (typeof window.conf === "undefined") window.conf = {};
    if (typeof window.conf["IM_InventoryDetails"] === "undefined") window.conf["IM_InventoryDetails"] = getConf;
})();