//main-QualityCharEntry.js
(function () {
    // SỬA USEDATA THÀNH TRUE ĐỂ NHẬN DỮ LIỆU SAU KHI F5
    var myConf = { widgetName: "./", confName: "QualityCharEntry", divId: "#myQualityCharEntry", UseData: true };
    var cwidget = WW_getNewCwidget(window.cwidget, myConf);
    var mdm = mdm || { widgetTemplate: {} };
    mdm.widgetTemplate.domElement = cwidget.domElement;
    var state = { columns: [], rows: [] };

    mdm.widgetTemplate.init = function () { 
        mdm.widgetTemplate.createWidgetContent(); 
        // LẮNG NGHE SỰ KIỆN ĐỂ LOAD LẠI KHI CÓ DATA TỪ F5
        cwidget.on("data", function() { mdm.widgetTemplate.createWidgetContent(); });
        cwidget.on("notify", function() { mdm.widgetTemplate.createWidgetContent(); });
    };
    
    mdm.widgetTemplate.createWidgetContent = function () {
        // --- GIỮ NGUYÊN CSS CỦA BẠN ---
        if ($("#qce-custom-styles").length === 0) {
            var cssString = `
                <style id="qce-custom-styles">
                    .qce-wrap { background: #ffffff; padding: 15px; border-radius: 6px; font-family: 'Segoe UI', Roboto, sans-serif; width: 100%; box-sizing: border-box;}
                    .qce-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 12px; }
                    .qce-title-group { display: flex; flex-direction: column; gap: 4px; }
                    .qce-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; line-height: 1.2; }
                    .qce-sub { font-size: 13px; color: #64748b; margin: 0; line-height: 1.2; }
                    .qce-actions { display: flex; gap: 10px; align-items: center; }
                    .div-btn-add, .div-btn-save { display: inline-block; cursor: pointer; user-select: none; text-align: center; border-radius: 4px; font-size: 14px; transition: background 0.2s; }
                    .div-btn-add { border: 1px solid #534AB7; color: #534AB7; background: #ffffff; padding: 7px 16px; font-weight: 500; }
                    .div-btn-add:hover { background: #f5f3ff; }
                    .div-btn-save { background: #534AB7; color: #ffffff; padding: 7px 20px; font-weight: 600; }
                    .div-btn-save:hover { background: #4338ca; }
                    .qce-table-wrapper { border: 1px solid #cbd5e1; border-radius: 6px; overflow-x: auto; background: #fff; }
                    .qce-table { width: 100%; border-collapse: collapse; text-align: center; white-space: nowrap; margin: 0; }
                    .qce-table th, .qce-table td { border-bottom: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1; vertical-align: middle; padding: 0; height: 44px; }
                    .qce-table th:last-child, .qce-table td:last-child { border-right: none; }
                    .qce-table tr:last-child td { border-bottom: none; }
                    .qce-table th { background: #f8fafc; color: #1e293b; font-weight: 600; font-size: 13px; padding: 12px 8px; }
                    .qce-table th span { display: block; font-weight: 400; font-size: 11px; color: #64748b; margin-top: 4px; }
                    .qce-input, .qce-select { width: 100%; height: 100%; min-height: 44px; border: none; background: transparent; text-align: center; font-size: 14px; color: #334155; box-sizing: border-box; }
                    .qce-input:focus, .qce-select:focus { outline: 2px solid #534AB7; outline-offset: -2px; background: #ffffff; }
                    .qce-select { appearance: none; -webkit-appearance: none; cursor: pointer; background-image: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3E%3Cpath fill='%23334155' d='M2 0L0 2h4zm0 5L0 3h4z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right .75rem center; background-size: 8px 10px; }
                    .div-btn-del { color: #ef4444; font-size: 18px; cursor: pointer; user-select: none; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
                    .div-btn-del:hover { background: #fee2e2; }
                </style>
            `;
            $("head").append(cssString);
        }

        // --- GIỮ NGUYÊN KHUNG HTML CỦA BẠN ---
        if ($(mdm.widgetTemplate.domElement).find(".qce-wrap").length === 0) {
            var htmlOnly = `
                <div class="qce-wrap">
                    <div class="qce-header">
                        <div class="qce-title-group">
                            <div class="qce-title">Quality Sample Entry</div>
                            <div class="qce-sub" id="qce-subtitle">Loading data...</div>
                        </div>
                        <div class="qce-actions">
                            <div class="div-btn-add" onclick="window.QCE.addRow(event)">+ Add Sample Row</div>
                            <div class="div-btn-save" onclick="window.QCE.saveData(event)">Save Results</div>
                        </div>
                    </div>
                    <div class="qce-table-wrapper">
                        <table class="qce-table">
                            <thead id="qce-thead"></thead>
                            <tbody id="qce-tbody"></tbody>
                        </table>
                    </div>
                </div>
            `;
            $(mdm.widgetTemplate.domElement).html(htmlOnly);
        }

        var raw = cwidget.control?.widgetProperties?.data || cwidget.data || "";
        if (!raw) return;
        try {
            var payload = JSON.parse(raw);
            
            if (Array.isArray(payload) && payload.length > 0) {
                // --- BẮT ĐẦU VÙNG CẬP NHẬT: KIỂM TRA CATALOG CHUẨN XÁC ---
                state.columns = payload.map(function(char) {
                    var opts = [];
                    var isCatalog = false;
                    var catalogId = null;

                    try {
                        // Tự động quét DB để chắc chắn đây có phải Catalog không
                        var charId = char.char_id || char.char_name;
                        var charDetails = FT.WebApi.mesGetSync("api/V3/DirectAccess", "sp_S_QM_Characteristic", { char_id: charId, char_name: null }, false);
                        
                        if (charDetails && charDetails.length > 0 && charDetails[0].catalog !== null) {
                            catalogId = charDetails[0].catalog;
                            isCatalog = true;
                        }
                    } catch(e) { 
                        console.error("Lỗi khi kiểm tra Catalog ID", e); 
                    }

                    // Nếu là Catalog, gọi API lấy danh sách Dropdown (Text hiển thị, Value lưu trữ)
                    if (isCatalog && catalogId) {
                        try {
                            var catData = FT.WebApi.mesGetSync("api/V3/DirectAccess", "sp_SA_QM_Catalog_Option", { catalog_id: catalogId }, false);
                            if (catData && catData.length > 0) {
                                opts.push({ text: "", value: "" }); // Thêm dòng trống đầu tiên
                                catData.forEach(function(c) {
                                    opts.push({ text: c.name, value: c.value }); // Cấu trúc Object
                                });
                            }
                        } catch(e) { 
                            console.error("Lỗi khi tải Option cho Catalog", e); 
                        }
                    }

                    return {
                        key: char.char_id || char.char_name,
                        label: char.char_desc || char.char_name,
                        subLabel: char.uom_desc || "",
                        type: isCatalog ? "select" : "number",
                        options: opts // Chứa Object {text, value}
                    };
                });
                // --- KẾT THÚC VÙNG CẬP NHẬT ---
                
                var baseData = payload[0];
                var subText = `Sample ID: ${baseData.sample_id || "N/A"} | Item: ${baseData.item_desc || "N/A"} | Lot: ${baseData.lot_no || "N/A"} | Sublot: ${baseData.sublot_no || "N/A"} | Oper: ${baseData.oper_id || "N/A"}`;
                $(mdm.widgetTemplate.domElement).find("#qce-subtitle").text(subText);
                
                if (!state.rows || state.rows.length === 0) state.rows = [{}];
            } else if (payload.columns) {
                var subText = `Sample ID: ${payload.sample_id || "N/A"} | Item: ${payload.item_desc || "N/A"} | Lot: ${payload.lot_no || "N/A"} | Sublot: ${payload.sublot_no || "N/A"} | Oper: ${payload.oper_id || "N/A"}`;
                $(mdm.widgetTemplate.domElement).find("#qce-subtitle").text(subText);
                
                state.columns = payload.columns || [];
                state.rows = payload.rows && payload.rows.length ? payload.rows : [{}];
            }

            renderTable();
        } catch (e) {
            console.error("Lỗi khi parse Payload", e);
        }
    };

    function syncState() {
        var currentRows = [];
        $(mdm.widgetTemplate.domElement).find("#qce-tbody tr").each(function() {
            var rowData = {};
            $(this).find("input, select").each(function() {
                rowData[$(this).data("col")] = $(this).val();
            });
            currentRows.push(rowData);
        });
        state.rows = currentRows;
    }

    function renderTable() {
        var thead = "<tr><th style='width:50px;'>#</th>";
        state.columns.forEach(function(col) {
            thead += "<th>" + col.label + "<span>" + col.subLabel + "</span></th>";
        });
        thead += "<th style='width:60px;'>Action</th></tr>";
        $(mdm.widgetTemplate.domElement).find("#qce-thead").html(thead);

        var tbody = "";
        state.rows.forEach(function(row, idx) {
            tbody += "<tr><td style='color:#94a3b8; font-weight: 500;'>" + (idx + 1) + "</td>";
            state.columns.forEach(function(col) {
                var val = row[col.key] || "";
                
                // CẬP NHẬT LOGIC: Tách Text và Value khi vẽ thẻ Select
                if (col.type === "select" || (col.options && col.options.length > 0)) {
                    var optsHtml = col.options.map(function(o) {
                        var text = typeof o === 'object' ? o.text : o;
                        var optVal = typeof o === 'object' ? o.value : o;
                        return `<option value="${optVal}" ${optVal == val ? 'selected' : ''}>${text}</option>`;
                    }).join('');
                    tbody += `<td><select class="qce-select" data-col="${col.key}">${optsHtml}</select></td>`;
                } else {
                    tbody += `<td><input type="text" class="qce-input" data-col="${col.key}" value="${val}"/></td>`;
                }
            });
            tbody += `<td><div class="div-btn-del" onclick="window.QCE.delRow(${idx}, event)">✕</div></td></tr>`;
        });
        $(mdm.widgetTemplate.domElement).find("#qce-tbody").html(tbody);
    }

    window.QCE = {
        addRow: function(e) { 
            if (e) { e.preventDefault(); e.stopPropagation(); }
            syncState(); 
            state.rows.push({}); 
            renderTable(); 
        },
        delRow: function(idx, e) { 
            if (e) { e.preventDefault(); e.stopPropagation(); }
            syncState(); 
            if(state.rows.length > 1) { 
                state.rows.splice(idx, 1); 
                renderTable(); 
            } 
        },
        saveData: function(e) {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            syncState();
            cwidget.value = JSON.stringify(state.rows);
            // Ép Skelta cập nhật Value
            if (cwidget.control && cwidget.control.trigger) {
                cwidget.control.trigger("change");
            }
        }
    };

    $(document).ready(mdm.widgetTemplate.init);
})();
(function(){ var getConf = function() { return { title: "QCE" }; }; if (!window.conf) window.conf = {}; window.conf['QualityCharEntry'] = getConf; })();