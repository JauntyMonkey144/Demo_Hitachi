/* Name: JM_UI_JobProgress.js */
((window) => {
    window.JM = window.JM || {};
    window.JM.JobProgress = window.JM.JobProgress || {};

    // Hàm này sẽ được AVEVA tự động gọi khi Form load xong
    window.JM.JobProgress.initializeForm = function(Control) {
        var _controls = {
            wwJobProgress: Control.findByXmlNode("WWJP")
        };
        console.log(">>> [CHART DEBUG] JM.JobProgress.initializeForm đã kích hoạt!");
        onFormLoad(_controls);
    };

    function onFormLoad(_controls) {
        window.top.addEventListener('om.wo.progressSync', function(e) {
            var woData = e.detail;
            if (woData && woData.wo_id) {
                var entName = woData.target_sched_line_name || window.top.MES_CURRENT_ENTITY || ""; 
                var woStatus = woData.wo_status !== undefined ? woData.wo_status : 3;
                setJobProgressData(_controls, entName, woStatus, woData.wo_id);
            }
        });
    }

    function setJobProgressData(_controls, entity, status, targetWoId) {
        if (!entity || entity.toUpperCase() === "LA") return;
        
        console.log(">>> [DEBUG] Đang gọi API với WO:", targetWoId); // LOG 1

        FT.WebApi.mesGetAsync("api/V3/DirectAccess", "usp_SP_S_JM_Job_Progress", { wo_id: targetWoId }, false).then(
            (data) => {
                console.log(">>> [DEBUG] Dữ liệu từ SP trả về:", data); // LOG 2 - QUAN TRỌNG
                
                let jobProgressData = data || [];
                if (_controls.wwJobProgress) {
                    _controls.wwJobProgress.widgetProperties.data = JSON.stringify(jobProgressData);
                    console.log(">>> [DEBUG] Đã gán dữ liệu vào Widget");
                }
            },
            (err) => {
                console.error(">>> [DEBUG] Lỗi gọi API:", err);
            }
        );
    }
})(window);