/*
Name:        	UC_OM_UI_Queue.js
Description: 	UC_OM_UI_Queue js file containing global logic pertaining to the UC_OM_UI_Queue Form.

Ver		Release	 By						Date				Change Description
001		05.00	   Shamanth S		2024-07-11	#3002 First version.
002		05.00	   Shamanth S		2024-08-07	#3261 Changed the name OM_UI_Queue to UC_OM_UI_Queue.
003 	07.00	   Fayaz A			2024-12-02	#3648 Time filter is visible only for completed work orders.
004		01.00	   Bas van B		2025-02-20	#4253 Translate the status filter and WO table data.
005		01.00	   Bas van B		2025-02-21	#4253	Use correct constants for translation GROUPS and KEYS.
006		01.00	   Bas van B		2025-02-21	#4253 Use public TRANSLATION_GROUP and TRANSLATION_KEYS Ui
																							objects to avoid errors when loaded as widget.
007	  01.00	   Praveen			2025-02-21	#4339 Add logic in lastNoHrs parameter.
008	  01.00	   Fayaz A			2025-02-25	#3982 Updated function wwTimeFilterLoad to load widget data from OM_TIME_FILTER_DATA.
009		01.00		 Fayaz A			2025-03-10	#4631 When there are no wo data returned all the wo actions(except refresh and details)
																				are made inactive, For grid, selected row, null check is included in
																				the function wwOmQueueOnDataChange.
010	  01.01.00 Praveen			2025-05-20	#4992 Time filter visible always.
011		01.01.00 Fayaz A			2025-05-22	#4955 Parent code value logic is added in hfWoActionOnDataChange function to set "CODE" value.
012		01.01.00 Fayaz A			2025-05-28	#5008 Localization key update to refer from FT runtime locale file.
013		01.01.01 Fayaz A			2025-06-16	#5024 Updated setNavigationData function to accept lang_id as input parameter.
014		01.02.00 Fayaz A			2025-06-30	#5091 Function wwWoStatesOnDataChange is updated to check if there is change in selected states.
015		01.02.00 Fayaz A			2025-06-30	#5087 Function to set commands (to enable and disable) is updated to consider wo state "onHold".
016		01.02.00 Praveen			2025-07-01	#5086 Disable the edit and delete command buttons for complete work orders within
017		01.02.00	Somya S			2025-06-30	#5069	Added the showloader and hideloader function

                                              the enableButton function.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

/*
Name:           UC_OM_UI_Queue.js
Description:    UC_OM_UI_Queue js file containing global logic pertaining to the UC_OM_UI_Queue Form.
*/

((window) => {
    window.OM = window.OM || {};
    OM.Queue = OM.Queue || {};
    OM.Queue = Queue();

    function Queue() {
        const LIST_JS = ["js/MES/FT_Common.js"];
        const LIST_JS_AJAX = [];
        const LIST_CSS = ["css/MES/FT_Common.css"];
        const FORM = {};
        FORM.Control = null;
        const NAVIGATON_GRPID = "OM_OrderButtonBar";
        const NAVIGATON_FOR = "OMActions";
        const OM_EVENTS = "om.wo.release|om.wo.cancel|om.wo.clone|om.wo.add|om.wo.delete|om.wo.update";
        const OM_MODULE = "om";
        const OM_TIME_FILTER_DATA =
            '[{"orderby":1,"text":"Custom","value":"CUSTOM","start_time":"","end_time":"","start_time_readonly":0,"end_time_readonly":1}' +
            ',{"orderby":2,"text":"1H","value":"1","start_time":"","end_time":"","start_time_readonly":0,"end_time_readonly":0}' +
            ',{"orderby":3,"text":"12H","value":"12","start_time":"","end_time":"","start_time_readonly":0,"end_time_readonly":0}' +
            ',{"orderby":4,"text":"8H","value":"8","start_time":"","end_time":"","start_time_readonly":0,"end_time_readonly":0,' +
            '"to_refresh":"xxCurDate"}' +
            "]";

        const _controls = {};
        let userInfo = "";
        let mesUserId = "";
        let entName = "";
        let woStatesSelected = "";
        let commandSelected = ""; 
        let codeValue = ""; 

        function initializeForm(Control) {
            FORM.Control = Control;
            _controls.wwOmNavbar = FORM.Control.findByXmlNode("WWNB");
            _controls.wwOmQueue = FORM.Control.findByXmlNode("WWOQ");
            _controls.wwOmStates = FORM.Control.findByXmlNode("WWFS");
            _controls.hfWoRow = FORM.Control.findByXmlNode("HFWOR");
            _controls.hfWoAction = FORM.Control.findByXmlNode("HFWOA");
            _controls.epDetails = FORM.Control.findByXmlNode("EPOM");
            _controls.wwTimeFilter = FORM.Control.findByXmlNode("WWTF");
            _controls.lbTimeFilterMsg = FORM.Control.findByXmlNode("LBMS");

            includeJsFiles();
            includeJsFilesAjax();
            includeCssFiles();
            onFormLoad();
        }

        function includeJsFiles() { SFU.includeCustomJsFiles(LIST_JS); }
        function includeJsFilesAjax() {
            if (LIST_JS_AJAX.length > 0) {
                $.ajax({ type: "GET", url: LIST_JS_AJAX, dataType: "script", cache: true, async: false });
            }
        }
        function includeCssFiles() { SFU.includeCustomCssFiles(LIST_CSS); }

        function onFormLoad() {
            try {
                userInfo = FT.WorkTasks.userInfo();
                mesUserId = userInfo.MESUserId !== undefined ? userInfo.MESUserId : null;
                if (FORM.Control.formParameters.entId !== undefined && FORM.Control.formParameters.entId.value != null && FORM.Control.formParameters.entId.value !== "") {
                    entId = FORM.Control.formParameters.entId.value;
                    if (FORM.Control.formParameters.entName !== undefined && FORM.Control.formParameters.entName.value != null && FORM.Control.formParameters.entName.value !== "") {
                        entName = FORM.Control.formParameters.entName.value;
                    }
                } else {
                    const entContext = FT.WorkTasks.contextGet(FORM.Control, "ent");
                    entId = entContext[0].entId;
                    entName = entContext[0].entName;
                }
                const filterData = FT.WorkTasks.contextGet(FORM.Control, "filterData");
                commandSelected = filterData.find((item) => item.type === "commandSelected");
                if (commandSelected) {
                    commandSelected = JSON.parse(commandSelected.jsonValue);
                    codeValue = commandSelected.code;
                }
                loadOmStates();

                _controls.wwOmNavbar.widgetProperties.selectedValue = "details";
                _controls.wwOmNavbar.widgetProperties.float = "right";
                _controls.wwOmNavbar.widgetProperties.command = "edit,delete,release,cancel,clone,bom,job";
                setNavigationData(NAVIGATON_GRPID, NAVIGATON_FOR, entName, mesUserId);
                wwTimeFilterLoad();

                FT.Common.windowEventListenerAdd(OM_MODULE, omEventListener);
            } catch (exception) {
                handleScriptError(exception);
            }
        }

        function omEventListener(event) {
            const eventList = OM_EVENTS.split("|");
            if (eventList.includes(event.detail.subType)) {
                loadWoQueue(woStatesSelected);
            }
        }

        function setNavigationData(grpId, category, entityName, userId, itemId, woId, operId, seqNo) {
            try {
                const parameterCollection = {
                    grp_id: grpId, category: category, ent_name: entityName, user_id: userId,
                    item_id: itemId !== undefined ? itemId : null,
                    wo_id: woId !== undefined ? woId : null,
                    oper_id: operId !== undefined ? operId : null,
                    seq_no: seqNo !== undefined ? seqNo : null,
                };
                let woActionsData = FT.WebApi.mesGetSync("api/V3/DirectAccess", "sp_SA_FT_Config_Actions", parameterCollection, false);
                const fields = [FT.Ui.translationColumnField("title", FT.Ui.TRANSLATION_GROUPS.grpFtConfigParam01AsTitle, ["title"])];
                woActionsData = FT.Ui.translateArray(woActionsData, fields);

                if (woActionsData.length > 0) {
                    woActionsData[0].cfg_desc = Date().toString();
                    _controls.wwOmNavbar.widgetProperties.selectedValue = JSON.stringify(woActionsData[0]); 
                    _controls.wwOmNavbar.widgetProperties.float = "right";
                    _controls.wwOmNavbar.widgetProperties.data = JSON.stringify(woActionsData);
                }
            } catch (exception) {
                handleScriptError(exception);
            }
        }

        function loadOmStates() {
            const filterKeys = ["bypassed", "superseded", "canceled"];
            const ftCommonJobStates = Object.entries(FT.Common.MES_JOB_STATE_CD)
                .filter(([key]) => !filterKeys.includes(key))
                .map(([key, value]) => ({ display: key.toLocaleUpperCase(), value: String(value) }));
            const group = "State";
            const title = "State";

            let formattedJobStates = ftCommonJobStates.map((item) => ({
                group: group, Title: title, value: parseInt(item.value, 10), display: item.display,
            }));
            const fields = [FT.Ui.translationColumnField("display", FT.Ui.TRANSLATION_GROUPS.grpJobStateStateDesc, ["display"])];
            formattedJobStates = FT.Ui.translateArray(formattedJobStates, fields);
            _controls.wwOmStates.widgetProperties.data = JSON.stringify(formattedJobStates);
        }

        function wwWoStatesOnDataChange() {
            if (woStatesSelected !== _controls.wwOmStates.value) {
                woStatesSelected = _controls.wwOmStates.value;
                _controls.lbTimeFilterMsg.visible = false;
                loadWoQueue(woStatesSelected);
            }
        }

        function wwTimeFilterLoad() {
            const currentTime = new Date();
            _controls.wwTimeFilter.widgetProperties.data = OM_TIME_FILTER_DATA.replace("xxCurDate", currentTime);
        }

        function wwTimeFilterOnDataChange() { loadWoQueue(woStatesSelected); }

        function showPageLoader() {
            try {
                if (skelta.DeviceOS === "WorkTasks") {
                    window.top.showLoader();
                } else {
                    const $loader = $("#skloader");
                    if ($loader.length > 0) {
                        if ($loader[0].childNodes.length === 0 && typeof n !== "undefined") {
                            const loaderObj = n.getLoaderObject();
                            $loader[0].appendChild(loaderObj);
                        }
                        try {
                            const actionVal = _controls.hfWoAction.value;
                            if (actionVal) {
                                const form = JSON.parse(actionVal);
                                if (form.form_name) {
                                    const formUrl = SFU.getFormUrl(form.form_name);
                                    $loader.attr("data-skpage", formUrl);
                                }
                            }
                        } catch (error) { throw new Error("Failed to parse form_name: " + error.message); }
                        $loader.attr("data-skloader", "1");
                    }
                }
            } catch (exception) { handleScriptError(exception); }
        }

        function hidePageLoader() {
            try {
                if (skelta.DeviceOS === "WorkTasks") { window.top.hideLoader(); } 
                else { $("#skloader").attr("data-skloader", "0"); }
            } catch (exception) { handleScriptError(exception); }
        }

        function loadWoQueue(jobStates) {
            showPageLoader();
            const lastNhrs = _controls.wwTimeFilter.value;
            const parameterColl = {
                newState: jobStates !== "" && jobStates.State.includes(FT.Common.MES_JOB_STATE_CD.new.toString()),
                readyState: jobStates !== "" && jobStates.State.includes(FT.Common.MES_JOB_STATE_CD.ready.toString()),
                runningState: jobStates !== "" && jobStates.State.includes(FT.Common.MES_JOB_STATE_CD.running.toString()),
                completeState: jobStates !== "" && jobStates.State.includes(FT.Common.MES_JOB_STATE_CD.complete.toString()),
                suspendedState: jobStates !== "" && jobStates.State.includes(FT.Common.MES_JOB_STATE_CD.suspended.toString()),
                onHoldState: jobStates !== "" && jobStates.State.includes(FT.Common.MES_JOB_STATE_CD.onHold.toString()),
                targetSchedLineId: "-1",
                includeWorkOrdersFromProcess: true,
                lastEditHr: parseInt(lastNhrs, 10),
            };
            
            FT.WebApi.mesGetAsync("api/V3/WO/filter", "", parameterColl, false).then(
                (data) => {
                    hidePageLoader();
                    if (data != null && data.length > 0) {
                        
                        // LẤY ACTUAL_FG TỪ CUSTOM STORED PROCEDURE
                        try {
                            const woIds = data.map(item => item.wo_id).join(',');
                            const fgData = FT.WebApi.mesGetSync("api/V3/DirectAccess", "usp_S_Custom_GetActualFG_By_WOs", { wo_ids: woIds }, false);
                            data.forEach(wo => {
                                const match = fgData.find(f => f.wo_id === wo.wo_id);
                                wo.actual_fg = match ? match.actual_fg : 0;
                            });
                        } catch (e) {
                            console.error("Error fetching Actual FG: ", e);
                            data.forEach(wo => wo.actual_fg = 0); 
                        }

                        const fields = [
                            FT.Ui.translationColumnField("wo_desc", FT.Ui.TRANSLATION_GROUPS.grpWoWoDesc, FT.Ui.TRANSLATION_KEYS.keyWo),
                            FT.Ui.translationColumnField("process_desc", FT.Ui.TRANSLATION_GROUPS.grpProcessProcessDesc, FT.Ui.TRANSLATION_KEYS.keyProcess),
                            FT.Ui.translationColumnField("item_desc", FT.Ui.TRANSLATION_GROUPS.grpItemItemDesc, FT.Ui.TRANSLATION_KEYS.keyItem),
                            FT.Ui.translationColumnField("target_sched_line_name", FT.Ui.TRANSLATION_GROUPS.grpEntEntDescription, ["target_sched_line_name"]),
                            FT.Ui.translationColumnField("uom_desc", FT.Ui.TRANSLATION_GROUPS.grpUomDescription, ["uom_desc"]),
                            FT.Ui.translationColumnField("wo_status_desc", FT.Ui.TRANSLATION_GROUPS.grpJobStateStateDesc, ["wo_status_desc"]),
                        ];
                        const translatedData = FT.Ui.translateArray(data, fields);
                        _controls.wwOmQueue.widgetProperties.data = JSON.stringify(translatedData);
                    } else {
                        _controls.wwOmQueue.widgetProperties.data = JSON.stringify([]);
                        _controls.hfWoAction.value = JSON.stringify([]);
                        _controls.wwOmNavbar.widgetProperties.float = "right";
                        _controls.wwOmNavbar.widgetProperties.selectedValue = "details";
                        _controls.wwOmNavbar.widgetProperties.command = "edit,delete,release,cancel,clone,bom,job";
                        _controls.epDetails.url = "";
                    }
                },
                (error) => { hidePageLoader(); throw Error("Error:", error); }
            );
        }

        function wwOmQueueOnDataChange() {
            _controls.hfWoRow.value = _controls.wwOmQueue.widgetProperties.selectedRow != null ? _controls.wwOmQueue.widgetProperties.selectedRow : "";
            _controls.epDetails.url = "";
            const woQueueRow = JSON.parse(_controls.wwOmQueue.widgetProperties.selectedRow);

            // BẮN TÍN HIỆU ĐỒNG BỘ QUA WINDOW.TOP ĐỂ XUYÊN IFRAME
            if (woQueueRow != null) {
                window.top.MES_SELECTED_WO_DATA = woQueueRow; 
                window.top.dispatchEvent(new CustomEvent('om.wo.progressSync', { detail: woQueueRow }));
            } else {
                window.top.MES_SELECTED_WO_DATA = null;
                window.top.dispatchEvent(new CustomEvent('om.wo.progressSync', { detail: null }));
            }

            if (woQueueRow != null) {
                setNavigationData(
                    NAVIGATON_GRPID, NAVIGATON_FOR, entName, mesUserId,
                    woQueueRow && woQueueRow.item_id !== undefined ? woQueueRow.item_id : null,
                    woQueueRow && woQueueRow.wo_id !== undefined ? woQueueRow.wo_id : null,
                    woQueueRow && woQueueRow.oper_id !== undefined ? woQueueRow.oper_id : null,
                    woQueueRow && woQueueRow.seq_no !== undefined ? woQueueRow.seq_no : null,
                );
                if (woQueueRow) enableButton(woQueueRow.wo_status);
            } else {
                enableButton("");
            }
            hfWoActionOnDataChange();
        }

        function enableButton(strStatus) {
            const intJobState = parseInt(strStatus, 10);
            if (intJobState === FT.Common.MES_JOB_STATE_CD.complete) _controls.wwOmNavbar.widgetProperties.command = "release,cancel,edit,delete";
            else if (intJobState === FT.Common.MES_JOB_STATE_CD.canceled) _controls.wwOmNavbar.widgetProperties.command = "release,cancel";
            else if (intJobState === FT.Common.MES_JOB_STATE_CD.suspended) _controls.wwOmNavbar.widgetProperties.command = "release";
            else if (intJobState === FT.Common.MES_JOB_STATE_CD.onHold) _controls.wwOmNavbar.widgetProperties.command = "release";
            else if (intJobState === FT.Common.MES_JOB_STATE_CD.running) _controls.wwOmNavbar.widgetProperties.command = "edit,delete,release";
            else if (intJobState === FT.Common.MES_JOB_STATE_CD.ready) _controls.wwOmNavbar.widgetProperties.command = "release";
            else if (intJobState === FT.Common.MES_JOB_STATE_CD.new) _controls.wwOmNavbar.widgetProperties.command = "{}";
            
            const getCommand = _controls.wwOmNavbar.widgetProperties.command;
            if (_controls.wwOmNavbar.widgetProperties.command.split(",").includes(JSON.parse(_controls.wwOmNavbar.value).command.toLowerCase()) === true) {
                _controls.wwOmNavbar.widgetProperties.selectedValue = "details";
                _controls.wwOmNavbar.widgetProperties.command = getCommand;
            }
        }

        function wwOmActionOnDataChange() { _controls.hfWoAction.value = _controls.wwOmNavbar.value != null ? _controls.wwOmNavbar.value : ""; }

        function hfWoActionOnDataChange() {
            var selectedAction = JSON.parse(_controls.hfWoAction.value);
            var woQueueRow = _controls.hfWoRow.value;
            if (selectedAction.code === "**PC**") {
                selectedAction.code = codeValue;
                const filterDataObj = [{ type: "commandSelected", jsonValue: JSON.stringify(selectedAction) }];
                FT.WorkTasks.contextSet("", "filterData", JSON.stringify(filterDataObj));
            } else {
                const filterDataObj = [{ type: "commandSelected", jsonValue: JSON.stringify(selectedAction) }];
                FT.WorkTasks.contextSet("", "filterData", JSON.stringify(filterDataObj));
            }
            if (selectedAction.command === "refresh") {
                _controls.epDetails.url = "";
                loadWoQueue(woStatesSelected);
                _controls.wwOmNavbar.widgetProperties.selectedValue = "details";
                _controls.wwOmNavbar.widgetProperties.float = "right";
            } else if (selectedAction.command === "add") {
                _controls.epDetails.url = selectedAction.form_name !== undefined ? SFU.getFormUrl(selectedAction.form_name) : "";
            } else if (woQueueRow !== "" && _controls.hfWoRow.value !== "") {
                woQueueRow = JSON.parse(_controls.hfWoRow.value);
                const woObj = [{
                    woId: woQueueRow.wo_id, processId: woQueueRow.process_id, bomVerId: woQueueRow.bom_ver_id,
                    specVerId: woQueueRow.spec_ver_id, itemId: woQueueRow.item_id, reqQty: woQueueRow.req_qty,
                }];
                FT.WorkTasks.contextSet("", "wo", JSON.stringify(woObj));
                const bomObj = [{ woId: woQueueRow.wo_id }];
                FT.WorkTasks.contextSet("", "jobBom", JSON.stringify(bomObj));
                _controls.epDetails.url = selectedAction.form_name !== undefined ? SFU.getFormUrl(selectedAction.form_name) : "";
            }
        }

        function handleScriptError(error) {
            let errorMessage;
            if (error instanceof TypeError) errorMessage = skelta.localize.getString("@@FT_UnexpectedType@@");
            else if (error instanceof ReferenceError) errorMessage = skelta.localize.getString("@@FT_ReferenceError@@");
            else errorMessage = skelta.localize.getString("@@FT_DuringScriptExecution@@");
            SFU.showError(skelta.localize.getString("FormNGFErrorRunningScript_title"), errorMessage, null, error.message);
            throw errorMessage;
        }

        function wwWOStatesVisibleScripts(Control) {
            $(Control.findById("W3").domElement).parent().css("overflow", "visible");
            $(Control.findById("W3").domElement).parent().parent().css("overflow", "visible");
            $(Control.findById("W3").domElement).parent().closest("div[controlid='W3']").css("z-index", "9999999999");
            return true;
        }

        function wwPanelVisibleScripts(formControl, panelId, indexValue) {
            $(formControl.findById(panelId).domElement).css("z-index", indexValue);
            return true;
        }

        return {
            initializeForm: initializeForm, wwOmQueueOnDataChange: wwOmQueueOnDataChange,
            wwOmActionOnDataChange: wwOmActionOnDataChange, hfWoActionOnDataChange: hfWoActionOnDataChange,
            wwWoStatesOnDataChange: wwWoStatesOnDataChange, wwWOStatesVisibleScripts: wwWOStatesVisibleScripts,
            wwPanelVisibleScripts: wwPanelVisibleScripts, wwTimeFilterOnDataChange: wwTimeFilterOnDataChange,
            showPageLoader: showPageLoader, hidePageLoader: hidePageLoader,
        };
    }
})(window);