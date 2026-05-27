/*
Name:           JM_UI_JobProgress.js
Description:    Event-driven Job Progress Bar synchronized with WO Queue Grid (Advanced Widget)
*/
((window) => {
    window.JM = window.JM || {};
    JM.JobProgress = JM.JobProgress || {};
    JM.JobProgress = JobProgress();

    function JobProgress() {
        const LIST_JS = ["js/MES/FT_Common.js"];
        const LIST_CSS = ["css/MES/FT_Common.css"];
        const FORM = {};
        const _controls = {};

        function initializeForm(Control) {
            FORM.Control = Control;
            _controls.wwJobProgress = FORM.Control.findByXmlNode("WWJP");
            SFU.includeCustomJsFiles(LIST_JS);
            SFU.includeCustomCssFiles(LIST_CSS);
            onFormLoad();
        }

        function onFormLoad() {
            try {
                console.log(">>> [CHART DEBUG] Form JM_UI_JobProgress đã bắt đầu Load trên Iframe!");

                // 1. Lắng nghe tín hiệu click từ lưới Work Order
                window.top.addEventListener('om.wo.progressSync', function(e) {
                    var woData = e.detail;
                    console.log(">>> [CHART DEBUG] Nhận tín hiệu Click từ Grid:", woData);
                    
                    if (woData && woData.wo_id) {
                        var entName = woData.target_sched_line_name || woData.mo_id || window.top.MES_CURRENT_ENTITY || ""; 
                        var woStatus = woData.wo_status !== undefined ? woData.wo_status : FT.Common.MES_JOB_STATE_CD.running;
                        console.log(`>>> [CHART DEBUG] Gọi truy vấn -> Ent: '${entName}', Status: ${woStatus}, WO: ${woData.wo_id}`);
                        setJobProgressData(entName, woStatus, woData.wo_id, woData.oper_id, woData.seq_no);
                    } else {
                        console.log(">>> [CHART DEBUG] Dữ liệu Grid rỗng, xóa biểu đồ.");
                        _controls.wwJobProgress.widgetProperties.data = JSON.stringify([]);
                    }
                });

                // 2. Khởi chạy lần đầu nếu có dữ liệu lưu trong hộp thư chung
                if (window.top.MES_SELECTED_WO_DATA) {
                    var initData = window.top.MES_SELECTED_WO_DATA;
                    var initEnt = initData.target_sched_line_name || initData.mo_id || window.top.MES_CURRENT_ENTITY || "";
                    var initStatus = initData.wo_status !== undefined ? initData.wo_status : FT.Common.MES_JOB_STATE_CD.running;
                    setJobProgressData(initEnt, initStatus, initData.wo_id, initData.oper_id, initData.seq_no);
                } else {
                    let entName = window.top.MES_CURRENT_ENTITY || "";
                    if (!entName) {
                        if (FORM.Control.formParameters.entName && FORM.Control.formParameters.entName.value) {
                            entName = FORM.Control.formParameters.entName.value;
                        } else {
                            const entContext = FT.WorkTasks.contextGet(FORM.Control, "ent");
                            if (entContext && entContext.length > 0) entName = entContext[0].entName;
                        }
                    }
                    if (entName) setJobProgressData(entName, FT.Common.MES_JOB_STATE_CD.running, null, null, null);
                }
            } catch (exception) {
                console.error(">>> [CHART DEBUG] Lỗi nghiêm trọng lúc Init:", exception);
            }
        }

        function setJobProgressData(entity, status, targetWoId, targetOperId, targetSeq) {
            if (!entity) return;
            const parameterColl = { ent_name: entity, status: status };
            
            FT.WebApi.mesGetAsync("api/V3/DirectAccess", "SP_S_JM_Job_Progress", parameterColl, false).then(
                (data) => {
                    let jobProgressData = data;
                    if (jobProgressData && jobProgressData.length > 0) {
                        if (targetWoId) {
                            let jobContextData = jobProgressData.find(job => 
                                job.wo_id === targetWoId && (targetOperId == null || job.oper_id === targetOperId) && (targetSeq == null || job.seq === targetSeq)
                            );
                            if (jobContextData) jobProgressData = [jobContextData];
                            else jobProgressData = []; 
                        } else {
                            jobProgressData.splice(1, Infinity); 
                        }
                        
                        if (jobProgressData.length > 0) {
                            const fields = [
                                FT.Ui.translationColumnField("entity", FT.Ui.TRANSLATION_GROUPS.grpEntDescription, ["entity"]),
                                FT.Ui.translationColumnField("item_desc", FT.Ui.TRANSLATION_GROUPS.grpItemItemDesc, ["item"]),
                                FT.Ui.translationColumnField("job_desc", FT.Ui.TRANSLATION_GROUPS.grpOperOperDesc, FT.Ui.TRANSLATION_KEYS.keyOper),
                                FT.Ui.translationColumnField("status", FT.Ui.TRANSLATION_GROUPS.grpJobStateStateDesc, ["status"]),
                            ];
                            jobProgressData = FT.Ui.translateArray(jobProgressData, fields);
                        }
                    }
                    _controls.wwJobProgress.widgetProperties.data = JSON.stringify(jobProgressData || []);
                },
                (error) => { console.error(">>> [CHART DEBUG] Lỗi WebAPI:", error); }
            );
        }

        return { initializeForm: initializeForm };
    }
})(window);