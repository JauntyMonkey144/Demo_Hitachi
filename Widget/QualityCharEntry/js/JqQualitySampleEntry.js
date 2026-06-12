/* QualitySampleEntry jQuery Plugin
 * Version: 1.0.1
 */
jQuery.fn.widgetQualitySampleEntry = function (options, data, cwidget) {

    var myDivId  = this[0].id;
    var selector = "#" + myDivId;

    var parsedData = {};
    var rows       = [];

    try {
        var raw = (typeof data === "string") ? JSON.parse(data) : data;
        if (Array.isArray(raw)) {
            rows = raw;
        } else {
            parsedData = raw;
            rows = Array.isArray(raw.rows) ? raw.rows : [];
        }
    } catch (e) {
        rows = [];
    }

    var conf       = options;
    var columns    = (parsedData && parsedData.columns && parsedData.columns.length > 0) 
                        ? parsedData.columns 
                        : (conf.columns || []);
                        
    var maxRows    = conf.maxRows || 20;
    var rowData    = [];   

    rows.forEach(function (r) {
        rowData.push(jQuery.extend({}, r));
    });

    var defaultRows = conf.defaultRows || 4;
    while (rowData.length < defaultRows) {
        rowData.push(buildEmptyRow());
    }

    var plugin = {
        addRow    : addRow,
        removeRow : removeRow,
        saveResults: saveResults,
        getRows   : function () { return rowData; }
    };
    $.data(this[0], "qse-plugin", plugin);

    renderAll();

    function renderAll() {
        renderHeader();
        renderTable();
        renderFooter();
    }

    function renderHeader() {
        var titleEl    = $(selector + " #qse-title");
        var subtitleEl = $(selector + " #qse-subtitle");

        var titleText = conf.title || "Quality Sample Entry";
        if (cwidget && cwidget.displayTitle && cwidget.displayTitle !== "") {
            titleText = cwidget.displayTitle;
        }
        titleEl.text(titleText);

        var parts = [];
        if (parsedData[conf.sampleIDField]) parts.push("Sample ID: " + parsedData[conf.sampleIDField]);
        if (parsedData[conf.itemField])     parts.push("Item: " + parsedData[conf.itemField]);
        subtitleEl.text(parts.join(" | "));
    }

    function renderTable() {
        buildThead();
        buildTbody();
    }

    function buildThead() {
        var $thead = $(selector + " #qse-thead");
        $thead.empty();

        var colsHtml = "";

        if (conf.showRowNumbers) {
            colsHtml += '<th class="qse-th qse-col-num">#</th>';
        }

        columns.forEach(function (col) {
            var style = col.width ? ' style="width:' + col.width + 'px"' : "";
            colsHtml += '<th class="qse-th"' + style + '>' +
                            '<span class="qse-col-label">' + (col.label || col.key) + '</span>' +
                            (col.subLabel ? '<span class="qse-col-sublabel">' + col.subLabel + '</span>' : '') +
                        '</th>';
        });

        if (conf.showActionCol) {
            colsHtml += '<th class="qse-th qse-col-action">Action</th>';
        }

        $thead.html('<tr>' + colsHtml + '</tr>');
    }

    function buildTbody() {
        var $tbody = $(selector + " #qse-tbody");
        $tbody.empty();

        rowData.forEach(function (row, idx) {
            $tbody.append(buildRowHtml(row, idx));
        });

        bindCellEvents();
    }

    function buildRowHtml(row, idx) {
        var cells = "";

        if (conf.showRowNumbers) {
            cells += '<td class="qse-td qse-td-num">' + (idx + 1) + '</td>';
        }

        columns.forEach(function (col) {
            var val = (row[col.key] !== undefined && row[col.key] !== null) ? row[col.key] : "";
            var outOfRange = isOutOfRange(col, val);
            var cellClass  = "qse-td" + (outOfRange ? " qse-cell-invalid" : "");

            cells += '<td class="' + cellClass + '" data-row="' + idx + '" data-col="' + col.key + '">';

            if (col.type === "select") {
                cells += buildSelectCell(col, val, idx);
            } else {
                cells += buildInputCell(col, val, idx);
            }

            cells += '</td>';
        });

        if (conf.showActionCol) {
            cells += '<td class="qse-td qse-td-action">' +
                        '<a href="javascript:void(0);" class="qse-btn-delete" onclick="window.QSE_removeRow(' + idx + ', event);" title="Delete row" style="text-decoration: none; display: inline-block;">' +
                            '<span class="qse-icon-x">&#10005;</span>' +
                        '</a>' +
                     '</td>';
        }

        return '<tr class="qse-row" data-row-index="' + idx + '">' + cells + '</tr>';
    }

    function buildInputCell(col, val, idx) {
        return '<input ' +
                    'class="qse-cell-input" ' +
                    'type="' + (col.type === "number" ? "number" : "text") + '" ' +
                    'value="' + escapeAttr(val) + '" ' +
                    'data-row="' + idx + '" ' +
                    'data-col="' + col.key + '" ' +
                    (col.min !== undefined ? 'min="' + col.min + '" ' : '') +
                    (col.max !== undefined ? 'max="' + col.max + '" ' : '') +
                    'step="any" ' +
                    'placeholder="" ' +
               '/>';
    }

    function buildSelectCell(col, val, idx) {
        var opts = (col.options || []).map(function (o) {
            return '<option value="' + escapeAttr(o) + '"' + (o == val ? ' selected' : '') + '>' + escapeHtml(o) + '</option>';
        }).join("");
        return '<select class="qse-cell-select" data-row="' + idx + '" data-col="' + col.key + '">' + opts + '</select>';
    }

    function bindCellEvents() {
        $(selector + " .qse-cell-input").off("input change").on("input change", function () {
            var rowIdx = parseInt($(this).data("row"), 10);
            var colKey = $(this).data("col");
            var val    = $(this).val();

            rowData[rowIdx][colKey] = val;

            var colConf = getColConf(colKey);
            var td = $(this).closest("td");
            if (isOutOfRange(colConf, val)) {
                td.addClass("qse-cell-invalid");
            } else {
                td.removeClass("qse-cell-invalid");
            }
        });

        $(selector + " .qse-cell-select").off("change").on("change", function () {
            var rowIdx = parseInt($(this).data("row"), 10);
            var colKey = $(this).data("col");
            rowData[rowIdx][colKey] = $(this).val();
        });
    }

    function renderFooter() {
        clearMessage();
    }

    function addRow() {
        if (rowData.length >= maxRows) {
            showMessage("Maximum " + maxRows + " rows allowed.", "warn");
            return;
        }
        rowData.push(buildEmptyRow());
        buildTbody();
        clearMessage();
    }

    function removeRow(idx) {
        if (rowData.length <= 1) {
            showMessage("At least one row is required.", "warn");
            return;
        }
        rowData.splice(idx, 1);
        buildTbody();
        clearMessage();
    }

    function saveResults() {
        collectFromDOM();
        var errors = validateRows();
        if (errors.length > 0) {
            showMessage("Please fill required fields: " + errors.join(", "), "error");
            return;
        }

        var result = {
            sample_id : parsedData[conf.sampleIDField] || "",
            item      : parsedData[conf.itemField] || "",
            savedAt   : new Date().toISOString(),
            rows      : rowData
        };

        var resultJson = JSON.stringify(result);

        if (cwidget) {
            cwidget.value = resultJson;
        }

        if (typeof window.parent !== "undefined" && window.parent !== window) {
            try {
                if (window.parent.BPMWidget && typeof window.parent.BPMWidget.setValue === "function") {
                    window.parent.BPMWidget.setValue(conf.resultField || "qse_result", resultJson);
                }
            } catch (ex) {}
        }
        showMessage("Results saved successfully.", "success");
    }

    function buildEmptyRow() {
        var r = {};
        columns.forEach(function (col) {
            r[col.key] = (col.defaultValue !== undefined) ? col.defaultValue : "";
        });
        return r;
    }

    function getColConf(key) {
        for (var i = 0; i < columns.length; i++) {
            if (columns[i].key === key) return columns[i];
        }
        return null;
    }

    function isOutOfRange(col, val) {
        if (!col || col.type !== "number") return false;
        if (val === "" || val === null || val === undefined) return false;
        var num = parseFloat(val);
        if (isNaN(num)) return true;
        if (col.min !== undefined && num < col.min) return true;
        if (col.max !== undefined && num > col.max) return true;
        return false;
    }

    function validateRows() {
        var errors = [];
        columns.forEach(function (col) {
            if (!col.required) return;
            rowData.forEach(function (row, i) {
                if (row[col.key] === "" || row[col.key] === null || row[col.key] === undefined) {
                    errors.push(col.label + " (row " + (i + 1) + ")");
                }
            });
        });
        return errors;
    }

    function collectFromDOM() {
        $(selector + " .qse-cell-input").each(function () {
            var rowIdx = parseInt($(this).data("row"), 10);
            var colKey = $(this).data("col");
            if (!isNaN(rowIdx) && colKey && rowData[rowIdx] !== undefined) {
                rowData[rowIdx][colKey] = $(this).val();
            }
        });
        $(selector + " .qse-cell-select").each(function () {
            var rowIdx = parseInt($(this).data("row"), 10);
            var colKey = $(this).data("col");
            if (!isNaN(rowIdx) && colKey && rowData[rowIdx] !== undefined) {
                rowData[rowIdx][colKey] = $(this).val();
            }
        });
    }

    function showMessage(text, type) {
        var $msg = $(selector + " #qse-msg");
        $msg.text(text).removeClass("qse-msg-success qse-msg-warn qse-msg-error").addClass("qse-msg-" + (type || "success"));
        if (type === "success") {
            setTimeout(function () { clearMessage(); }, 3000);
        }
    }

    function clearMessage() {
        $(selector + " #qse-msg").text("").removeClass("qse-msg-success qse-msg-warn qse-msg-error");
    }

    function escapeAttr(val) { return String(val).replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
    function escapeHtml(val) { return String(val).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

    return this;
};