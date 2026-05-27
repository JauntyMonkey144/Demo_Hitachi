/*
Name:           JM_UI_JobStart.js
Description:    JM_UI_JobStart js file containing global logic pertaining to the JM_UI_JobStart Form.

Ver     Release     By                  Date                Change Description
001     00.50           Ramesh V            2024-05-16  #2768 First version.
002     00.70           João Caldeira 2024-11-19    #3942 Updated form and file name from JM_UI_Start to JM_UI_JobStart.
                                                                Added code to dispatch event on job start.
003     00.70           Chitta              2024-12-11  #4060 FT.Common.windowEventDispatch function must call on succefully Job Start only.
004     00.70           Fayaz A             2025-03-25  #4293 Updated to set the hfRunningEntId value from entity context.
005     01.02.00    Somya S             2025-07-07  #5085 Added can_runjob check to enable the commands.
006     01.03.00    Somya S             2025-09-11  #5151 Not able to start the job in WO Api is updated.
007     01.03.01    Vinh                2026-05-26  Added Machine Setting & Operator validation.
*/
((window) => {
    // ------------------------------ Global Variables ------------------------------------
    window.JM = window.JM || {};
    JM.JobStart = JM.JobStart || {};
    JM.JobStart = JobStart();
    // ------------------------------------------------------------------------------------
    /**
     * formFunctions
     *
     * @returns {null} formFunctions template object.
     */
    function JobStart() {
        // ---------------------------- Constant Variables ----------------------------------
        // add here the files you want to include
        const LIST_JS = ["js/MES/FT_Common.js"];
        const LIST_JS_AJAX = [];
        const LIST_CSS = ["css/MES/FT_Common.css"];
        const FORM = {};
        FORM.Control = null;

        // ----------------------------- Private Variables ----------------------------------
        const _controls = {};
        // ----------------------------------------------------------------------------------
        /**
         * Initializes different controls inside with proper data. Called on form load.
         *
         * @param {object} Control - Control variable is used to get/set information from Form control.
         */
        function initializeForm(Control) {
            // Initialize variables
            FORM.Control = Control;
            _controls.hfWoId = FORM.Control.findByXmlNode("HFWID");
            _controls.hfOperId = FORM.Control.findByXmlNode("HFOID");
            _controls.hfSeqNo = FORM.Control.findByXmlNode("HFSNO");
            _controls.hfRunningEntId = FORM.Control.findByXmlNode("HFREID");
            _controls.hfTargetScheduledEntId = FORM.Control.findByXmlNode("HFTSEID");

            // --- THÊM KHAI BÁO 4 TEXTBOX MỚI TẠI ĐÂY ---
            _controls.txtRecipeTemp = FORM.Control.findByXmlNode("RecipeTemp");
            _controls.txtMachineID = FORM.Control.findByXmlNode("MachineID");
            _controls.txtOperatorName = FORM.Control.findByXmlNode("OperatorName");
            _controls.txtPassword = FORM.Control.findByXmlNode("Password");
            _controls.txtTargetTime = FORM.Control.findByXmlNode("TargetTime");
            _controls.txtMotorSpeed = FORM.Control.findByXmlNode("MotorSpeed");
            // Include js files
            includeJsFiles();

            // Include js files via ajax
            includeJsFilesAjax();

            // Include CSS files
            includeCssFiles();

            // Add code here
            onFormLoad();
        }

        /**
         * Includes js files specified in LIST_JS
         */
        function includeJsFiles() {
            SFU.includeCustomJsFiles(LIST_JS);
        }

        /**
         * Includes js files specified in ListJsAjax, to be loaded using ajax call.
         */
        function includeJsFilesAjax() {
            if (LIST_JS_AJAX.length > 0) {
                $.ajax({
                    type: "GET",
                    url: LIST_JS_AJAX,
                    dataType: "script",
                    cache: true,
                    async: false,
                });
            }
        }

        /**
         * Includes CSS files specified in ListCss
         */
        function includeCssFiles() {
            SFU.includeCustomCssFiles(LIST_CSS);
        }

        // INCLUDE NEW FUNCTIONS HERE

/**
         * Validates inputs, checks password, and saves data to DB before starting the job.
         */
        function validateMachineSettings() {
            const recipe = _controls.txtRecipeTemp ? _controls.txtRecipeTemp.value : "";
            const machine = _controls.txtMachineID ? _controls.txtMachineID.value : "";
            const operator = _controls.txtOperatorName ? _controls.txtOperatorName.value : "";
            const password = _controls.txtPassword ? _controls.txtPassword.value.trim() : "";
            const targetTime = _controls.txtTargetTime ? _controls.txtTargetTime.value.trim() : "";
            const motorSpeed = _controls.txtMotorSpeed ? _controls.txtMotorSpeed.value.trim() : "";
            // 1. Kiểm tra xem có nhập đủ thông tin không
            if (!recipe || !machine || !operator || !password) {
                SFU.showError("Warning", "Please enter complete Machine Operation and Setup Information before starting the job!");
                return false; 
            }

            // 2. KIỂM TRA MẬT KHẨU
            if (password !== "/6T5Q0wnZC54jbrMumSOog==") {
                SFU.showError("Access denied", "Incorrect password! Please check again.");
                // Xóa trắng ô password để người dùng nhập lại (Tùy chọn)
                if (_controls.txtPassword) _controls.txtPassword.value = "";
                return false; // Ngăn chặn Start Job
            }

            // 3. LƯU VÀO DATABASE
            try {
                const parameterColl = {
                    wo_id: _controls.hfWoId.value,
                    oper_id: _controls.hfOperId.value,
                    seq_no: _controls.hfSeqNo.value,
                    operator_name: operator,
                    machine_id: machine,
                    recipe_temp: recipe,
                    target_time: targetTime, // MAP VỚI BIẾN MỚI TRONG SP
                    motor_speed: motorSpeed  // MAP VỚI BIẾN MỚI TRONG SP
                };

                // Gọi Stored Procedure để lưu dữ liệu
                FT.WebApi.mesGetSync("api/V3/DirectAccess", "usp_CUS_Insert_Machine_Setup", parameterColl, false);
                
                return true; // Cho phép Workflow Start
            } 
            catch (error) {
                SFU.showError("System error", "Unable to save Machine Setting data: " + error.message);
                return false; 
            }
        }

        /**
         * Form load function for the controls
         */
        function onFormLoad() {
            const jobContext = FT.WorkTasks.contextGet(FORM.Control, "job");
            const entContext = FT.WorkTasks.contextGet(FORM.Control, "ent");

            if (jobContext && jobContext.length > 0) {
                const parameterColl = {
                    woId: jobContext[0].woId,
                    operId: jobContext[0].operId,
                    seqNo: jobContext[0].seqNo,
                };

                FT.WebApi.mesGetAsync("api/v3/Jobs/key", "", parameterColl, false).then(
                    (data) => {
                        if (data) {
                            _controls.hfWoId.value = data.wo_id;
                            _controls.hfOperId.value = data.oper_id;
                            _controls.hfSeqNo.value = data.seq_no;
                            _controls.hfTargetScheduledEntId.value = data.target_sched_ent_id;

                            let isRunJobEnabled = false;

                            if (entContext && entContext.length > 0) {
                                const selectedEntId = entContext[0].entId;
                                const parameterCol2 = { entId: selectedEntId };

                                const entity = FT.WebApi.mesGetSync("api/v3/Entity/key", "", parameterCol2, false);

                                if (entity && entity.can_run_jobs === true) {
                                    isRunJobEnabled = true;
                                    _controls.hfRunningEntId.value = selectedEntId;
                                } else {
                                    _controls.hfRunningEntId.value = data.run_ent_id || "";
                                }
                            } else {
                                _controls.hfRunningEntId.value = data.run_ent_id || "";
                            }

                            JM.JobStart.isRunJobEnabled = isRunJobEnabled;
                        }
                    },
                    (error) => {
                        throw new Error("Error fetching job details: " + error.message);
                    },
                );
            }
        }
        /**
         * Performs actions after the execution of a workflow.
         */
        function iwJobStartOnPostWorkflow(blockingOutput, workflowStatus) {
            FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
            if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully && blockingOutput === "") {
                FT.Common.windowEventDispatch("jm", "jm.job.start", FT.Common.EVENT_SOURCE_TYPE.form, "JM_UI_JobStart", "jm.job.start");
            }
        }
        /**
         * Define which functions/properties are to be made public.
         */
        return {
            initializeForm: initializeForm,
            iwJobStartOnPostWorkflow: iwJobStartOnPostWorkflow,
            validateMachineSettings: validateMachineSettings // CẤP QUYỀN TRUY CẬP CHO HÀM KIỂM TRA
        };
    }
})(window);