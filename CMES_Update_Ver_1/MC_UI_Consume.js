/*
Name:           MC_UI_Consume.js
Description:    MC_UI_Consume js file containing global logic pertaining to the MC_UI_Consume Form.

Ver  Release                By                  Date                Change Description
001                                 Shamanth S  2024-04-29  #3103 First version.
002     00.70.00            Chitta          2024-12-05  #3937 Item reason group ID codes must not call from FT_Common.js.
003     00.70.00            Chitta          2024-12-10  #4058   ReasGrpCDConsumed const removed and used SP - sp_S_FT_Item_Reas_ByGrpHierarchy
                                                                instead sp_SA_MC_Item_Reas for Reasons Hierarchy.
004     00.70.00            Chitta          2024-12-13  #4063 qtyCons should be number field and those decimal points has to configure dynamically.
005     00.70.00            Chitta          2024-12-17  #4126 forms MC_UI_Consume  multi level title widget header needs to hide.
005     00.70.00            Chitta          2024-12-19  #4126 forms MC_UI_Consume  Qty , lot , sub lot must refer values from Inventory Items.
006     00.70.00            Chitta          2025-02-09  #Package Testing Items dropdown must load after BOM Item selection only.
007     01.00.00            Bas van B       2025-02-26  #4253 Translated MD in UI.
008     01.00.00            Bas van B       2025-02-26  #4253 Solved issue on initial card load.
009     01.00.00            Praveen         2025-02-27  #4289 Add the web API to load the entity that can store a filter in the ddFromEntityLoad
                                                                                function.
010     01.01.00            Fayaz A         2025-05-28  #5008 Localization key update to refer from FT runtime locale file.
011     01.00.00 SP1    Fayaz A         2025-10-28  #5217 Applied JSON.parse to filtered data for function retrieveLotAndSubLot .
012     02.00.00            Praveen     2025-12-16  #5237 Set a decimal limit for the “Qty Consumed” field, controlled by the item table.
013     02.01.00            Vinh        2026-05-27  Update loadInventory to auto-select Entity based on Item.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //
((window) => {
    // ------------------------------ Global Variables ------------------------------------
    window.MC = window.MC || {};
    MC.Consume = MC.Consume || {};
    MC.Consume = Consume();
    // ------------------------------------------------------------------------------------
    /**
     * formFunctions
     *
     * @returns {null} formFunctions template object.
     */
    function Consume() {
        // ---------------------------- Constant Variables ----------------------------------
        // add here the files you want to include
        const LIST_JS = ["js/MES/FT_Common.js"];
        const LIST_JS_AJAX = [];
        const LIST_CSS = ["css/MES/FT_Common.css"];
        const FORM = {};
        FORM.Control = null;
        const _controls = {};

        // ----------------------------- Private Variables ----------------------------------
        const STORAGEKEY = "sessionData_MP_UI_JobProduce";
        let datalotsublot = "";
        // ----------------------------------------------------------------------------------
        /**
         * Initializes different controls inside with proper data. Called on form load.
         *
         * @param {object} Control - Control variable is used to get/set information from Form control.
         */
        function initializeForm(Control) {
            // Initialize variables
            FORM.Control = Control;
            _controls.wwBomItems = FORM.Control.findByXmlNode("WWBI");
            _controls.wwConsReas = FORM.Control.findByXmlNode("WWCRS");
            _controls.itemDesc = FORM.Control.findByXmlNode("TXITM");
            _controls.qtyCons = FORM.Control.findByXmlNode("NRQTY");
            _controls.qtyRemain = FORM.Control.findByXmlNode("TXQRM");
            _controls.hfWoId = FORM.Control.findByXmlNode("HFWID");
            _controls.hfOperId = FORM.Control.findByXmlNode("HFOPID");
            _controls.hfSeqNo = FORM.Control.findByXmlNode("HFSQN");
            _controls.hfBomPos = FORM.Control.findByXmlNode("HFBP");
            _controls.hfItemId = FORM.Control.findByXmlNode("HFII");
            _controls.hfEntId = FORM.Control.findByXmlNode("HFEI");
            _controls.hfEntName = FORM.Control.findByXmlNode("HFEN");
            _controls.hfReas = FORM.Control.findByXmlNode("HFRES");
            _controls.hfJobPos = FORM.Control.findByXmlNode("HFJP");
            _controls.ddFromEntity = FORM.Control.findByXmlNode("DDFE");
            _controls.ddFromInventory = FORM.Control.findByXmlNode("DDFI");
            _controls.txLotNo = FORM.Control.findByXmlNode("TXLN");
            _controls.txSubLotNo = FORM.Control.findByXmlNode("TXSL");
            _controls.hfItemInvetoryData = FORM.Control.findByXmlNode("HFID");
            _controls.hfQTYConsume = FORM.Control.findByXmlNode("HFQTY");
            _controls.hfFGLot_no = FORM.Control.findByXmlNode("HFFLT");
            _controls.hfFGSublot_no = FORM.Control.findByXmlNode("HFFST");

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
         * Form load function for the controls
         */
        function onFormLoad() {
            try {
                const [selectedCard] = FT.WorkTasks.contextGet(FORM.Control, "eventData") || [];
                const [dataJson] = JSON.parse(selectedCard.jsonValue);
                const data = dataJson;
                if (data != null) {
                    _controls.hfWoId.value = data.woId;
                    _controls.hfOperId.value = data.operId;
                    _controls.hfSeqNo.value = data.seqNo;
                    _controls.hfEntId.value = data.ent_id;
                    _controls.hfEntName.value = data.ent_name;
                    _controls.hfJobPos.value = "0";
                    loadBomItems();
                    datalotsublot = retrieveLotAndSubLot(data.woId, data.operId, data.seqNo);
                    if (datalotsublot) {
                        _controls.hfFGLot_no.value = datalotsublot.lot;
                        _controls.hfFGSublot_no.value = datalotsublot.sublot;
                    } else {
                        _controls.hfFGLot_no = "";
                        _controls.hfFGSublot_no = "";
                    }
                }
                _controls.hfItemInvetoryData.value = "[]";
                const parameterCollection = {
                    reas_grp_type: FT.Common.MES_ITEM_REAS_GRP_TYPE.consumption,
                };

                FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_S_FT_Item_Reas_ByGrpHierarchy", parameterCollection, false).then(
                    (dataR) => {
                        let reasonData = dataR;
                        if (reasonData != null && reasonData.length > 0) {
                            // Translate the consumption reasons
                            const fields = [
                                FT.Ui.translationColumnField("display", FT.Ui.TRANSLATION_GROUPS.grpItemReasReasDesc, ["display"]),
                                FT.Ui.translationColumnField("display", FT.Ui.TRANSLATION_GROUPS.grpItemReasGrpReasGrpDesc, ["display"]),
                                FT.Ui.translationColumnField(
                                    "reas_desc",
                                    FT.Ui.TRANSLATION_GROUPS.grpItemReasReasDesc,
                                    FT.Ui.TRANSLATION_KEYS.keyItemReas,
                                ),
                                FT.Ui.translationColumnField(
                                    "reas_grp_desc",
                                    FT.Ui.TRANSLATION_GROUPS.grpItemReasGrpReasGrpDesc,
                                    FT.Ui.TRANSLATION_KEYS.keyItemReasGrp,
                                ),
                            ];
                            reasonData = FT.Ui.translateArray(dataR, fields);
                        }
                        _controls.wwConsReas.widgetProperties.notify = '{"Functionname":"HIDEHEADER"}';
                        _controls.wwConsReas.widgetProperties.data = JSON.stringify(reasonData);
                    },
                    (error) => {
                        // Handle error
                        throw error("@@FT_NotFound@@");
                    },
                );
            } catch (error) {
                SFU.showError(skelta.localize.getString("@@FT_FailedError@@"), skelta.localize.getString("@@FT_Failed@@") + ": " + error);
            }
            ddFromEntityLoad();
        }
        /**
         * Function to clear WWInventry dependent controls
         *
         */
        function clearControlsOnDDISelect() {
            _controls.txLotNo.value = "";
            _controls.txSubLotNo.value = "";
            _controls.qtyCons.value = 0;
            _controls.hfItemInvetoryData.value = "[]";
        }

        /**
         * Function to load WO Queue for an entity and assign data to grid widget
         * THÊM: isAutoFind = false
         */
        function loadInventory(isAutoFind = false) {
        
            clearControlsOnDDISelect();
            if (_controls.hfItemId.value === "") {
                return;
            }

            const dataE = [];
            FT.WorkTasks.controlOptionsSetFromDataset("DDFI", 0, dataE, "ItemDetils", "ItemDetils");
            
            // NẾU isAutoFind = true, bỏ qua dropdown entity hiện tại để lấy tồn kho toàn mạng lưới
            const searchEntName = isAutoFind ? "" : _controls.ddFromEntity.value;

            const parameterColl = {
                entId: "",
                entName: searchEntName,
                itemID: _controls.hfItemId.value,
                ent: "",
                itemDesc: "",
                itemClassId: "",
                lotNo: "",
                sublotNo: "",
                itemGradeCd: "",
                itemStateCd: "",
                fromExpiryDate: "",
                toExpiryDate: "",
            };
            FT.WebApi.mesGetAsync("api/V3/itemInventory", "", parameterColl, false).then(
                (data) => {
                    // Handle successful response data
                    if (data != null && data.length > 0) {
                        
                        // AUTO-SELECT LOGIC: Ép Dropdown Entity nhảy về Entity chứa Item vừa tìm được
                        if (isAutoFind && data[0].ent_name) {
                            if (_controls.ddFromEntity) {
                                _controls.ddFromEntity.value = data[0].ent_name;
                            }
                            // Lọc dữ liệu hiển thị cho đúng Entity vừa auto-select
                            data = data.filter(d => d.ent_name === data[0].ent_name);
                        }

                        if (data.length > 0) {
                            $.each(data, (i) => {
                                data[i].ItemDetails =
                                    "Lot:" +
                                    (data[i].lot_no || "") +
                                    " | Sub Lot:" +
                                    (data[i].sublot_no || "") +
                                    " | Qty Available:" +
                                    (data[i].qty_left || "");
                            });
                            FT.WorkTasks.controlOptionsSetFromDataset("DDFI", 0, data, "ItemDetails", "row_id_h");
                            _controls.hfItemInvetoryData.value = JSON.stringify(data);
                            _controls.ddFromInventory.value = data[0].row_id_h;
                            ddFIonDataChange(); // Auto trigger set textbox values
                        } else {
                            FT.WorkTasks.controlOptionsSetFromDataset("DDFI", 0, [], "ItemDetails", "row_id_h");
                            _controls.hfItemInvetoryData.value = "[]";
                        }
                    } else {
                        FT.WorkTasks.controlOptionsSetFromDataset("DDFI", 0, [], "ItemDetails", "row_id_h");
                        _controls.hfItemInvetoryData.value = "[]";
                    }
                },
                (error) => {
                    // Handle error
                    throw Error("Error:", error);
                },
            );
        }

        /**
         * get the widget items and assign it to control
         */
        function loadBomItems() {
            try {
                const parameterCollectionBom = {
                    wo_id: _controls.hfWoId.value,
                    oper_id: _controls.hfOperId.value,
                    seq: _controls.hfSeqNo.value,
                };
                FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_MC_Job_Bom", parameterCollectionBom, false).then(
                    (getBomItemsData) => {
                        if (getBomItemsData.DisplayColumn === "" && getBomItemsData.ValueColumn === "" && getBomItemsData.Data.length === 0) {
                            throw new Error("@@FT_NotFound@@");
                        }
                        // Translate Bom Item Data
                        const fields = [FT.Ui.translationColumnField("title_desc", FT.Ui.TRANSLATION_GROUPS.grpItemItemDesc, ["title"])];
                        _controls.wwBomItems.widgetProperties.data = JSON.stringify(FT.Ui.translateArray(getBomItemsData, fields));
                    },
                    (error) => {
                        // Handle error
                        throw new Error("Error:", error);
                    },
                );
            } catch (error) {
                SFU.showError(skelta.localize.getString("@@FT_FailedError@@"), skelta.localize.getString("@@FT_Failed@@") + ": " + error);
            }
        }

        /**
         * get the widget items and assign it to control
         */
        function bomItemsOnDataChange() {
            const wdBomItems = JSON.parse(_controls.wwBomItems.value);
            _controls.hfItemId.value = wdBomItems[0].title;
            _controls.itemDesc.value = wdBomItems[0].title_desc;
            _controls.qtyRemain.value = wdBomItems[0].qty;
            _controls.hfBomPos.value = wdBomItems[0].bom_pos;
            setCtrlsNoOfDecimals();
            
            // SỬA ĐỔI: Chuyển cờ isAutoFind thành true để kích hoạt tìm kiếm và gán Entity
            loadInventory(true);
        }

        /**
         * Display Consumption reason on data change event.
         */
        function consReasonOnDataChange() {
            try {
                if (_controls.wwConsReas.value !== null) {
                    wdConsumeReas = JSON.parse(_controls.wwConsReas.value);
                    _controls.hfReas.value = wdConsumeReas;
                }
            } catch (error) {
                // Empty block
            }
        }
        /**
         * Loads the list of entities which can store and populates the dropdown control.
         */
        // function ddFromEntityLoad() {
        //  const parameterColl = { canStore: true };
        //  FT.WebApi.mesGetAsync("api/v3/Entity/filter", "", parameterColl, false).then(
        //      (data) => {
        //          // Handle successful response data
        //          if (data != null && data.length > 0) {
        //              // Translate the data
        //              const fields = [
        //                  FT.Ui.translationColumnField(
        //                      "description",
        //                      FT.Ui.TRANSLATION_GROUPS.grpEntDescription,
        //                      FT.Ui.TRANSLATION_KEYS.keyEnt,
        //                  ),
        //              ];
        //              const translatedData = FT.Ui.translateArray(data, fields);
        //              FT.WorkTasks.controlOptionsSetFromDataset("DDFE", 0, translatedData, "description", "ent_name");
        //              _controls.ddFromEntity.value = data[0].ent_name;
        //          } else {
        //              FT.WorkTasks.controlOptionsSetFromDataset("DDFE", 0, [], "ent_name", "ent_name");
        //          }
        //      },
        //      (error) => {
        //          // Handle error
        //          handleScriptError(error);
        //      },
        //  );
        // }
        function ddFromEntityLoad() {
            const parameterColl = { canStore: true };
            FT.WebApi.mesGetAsync("api/v3/Entity/filter", "", parameterColl, false).then(
                (data) => {
                    if (data && data.length > 0) {
                        const fields = [
                            FT.Ui.translationColumnField(
                                "description",
                                FT.Ui.TRANSLATION_GROUPS.grpEntDescription,
                                FT.Ui.TRANSLATION_KEYS.keyEnt,
                            ),
                        ];
                        const translatedData = FT.Ui.translateArray(data, fields);
                        const mappedData = translatedData.map(item => ({
                            optiontext: item.description || item.ent_name || "",
                            optionvalue: item.ent_name || ""
                        }));
                        FT.WorkTasks.controlOptionsSetFromDataset("DDFE", 0, mappedData, "optiontext", "optionvalue");
                        if (_controls.ddFromEntity) {
                            _controls.ddFromEntity.value = mappedData[0].optionvalue;
                        }
                    } else {
                        // Clear if no data
                        FT.WorkTasks.controlOptionsSetFromDataset("DDFE", 0, [], "optiontext", "optionvalue");
                    }
                },
                (error) => {
                    handleScriptError(error);
                },
            );
        }
        /**
         * Reduce Consumption item
         */
        function reduceConsButtonClick() {
            const QTYCONSUME = parseFloat(_controls.qtyCons.value);
            if (QTYCONSUME > 1) {
                _controls.qtyCons.value = QTYCONSUME - 1;
            }
        }

        /**
         * Add consumption item
         */
        function addConsButtonClick() {
            const QTYCONSUME = parseFloat(_controls.qtyCons.value);
            if (QTYCONSUME >= 0) {
                _controls.qtyCons.value = QTYCONSUME + 1;
            }
        }

        /**
         * Pre workflow execution
         * @returns {boolean} Description of the return value.
         */
        function preWfExeCons() {
            const qtyConsume = parseFloat(_controls.qtyCons.value);
            if (qtyConsume === "") {
                SFU.showError(skelta.localize.getString("@@MC_EmptyQty@@"), skelta.localize.getString("@@MC_EmptyQty@@"));
                return false;
            }
            if (qtyConsume === 0) {
                SFU.showError(skelta.localize.getString("@@MC_ZeroQty@@"), skelta.localize.getString("@@MC_ZeroQty@@"));
                return false;
            }
            if (qtyConsume < 0) {
                SFU.showError(skelta.localize.getString("@@MC_NegQty@@"), skelta.localize.getString("@@MC_NegQty@@"));
                return false;
            }

            _controls.hfQTYConsume.value = _controls.qtyCons.value;
            return true;
        }

        /**
         * post workflow execution consumption.
         * @param blockingOutput
         * @returns {boolean} Description of the return value.
         */
        function postWfExecCons(blockingOutput, workflowStatus) {
            FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
            // if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
            //  SFU.showError(skelta.localize.getString("@@MC_AddConsFailed@@"), workflowStatus);
            // }
            _controls.wwBomItems.widgetProperties.data = "";

            loadBomItems();
            return true;
        }
        /**
         * load ddFromInventory on change of ddFromEntity
         */
        function ddFEonDataChange() {
            loadInventory();
        }

        function getSelRecDDFI() {
            const dSelItm = null;
            // eslint-disable-next-line radix
            const invItmVal = parseInt(_controls.ddFromInventory.value);
            const invData = JSON.parse(_controls.hfItemInvetoryData.value);
            const curSelItmlist = invData.filter((dItem) => dItem.row_id_h === invItmVal);
            if (curSelItmlist.length > 0) {
                const curSelItm = curSelItmlist[0];
                return curSelItm;
            }
            return dSelItm;
        }
        /**
         * assign dependent contols values  on change of ddFromInventory
         */
        function ddFIonDataChange() {
            
            const curSelItm = getSelRecDDFI();
            if (curSelItm != null) {
                _controls.txLotNo.value = curSelItm.lot_no;
                _controls.txSubLotNo.value = curSelItm.sublot_no;
                //  _controls.qtyCons.value = curSelItm.qty_left;
                //const numDecimals = curSelItm.num_decimals_h;
                // FT.Common.setDecimalPlaces(_controls.qtyCons, numDecimals);
            } 
            /*else {
                _controls.txLotNo.value = "";
                _controls.txSubLotNo.value = "";
                FT.Common.setDecimalPlaces(_controls.qtyCons, 0);
            }*/
        }
        /*
         * set decimal limit to number controls by Item table
         */
        function setCtrlsNoOfDecimals() {
            
            parameterColl = { itemId: _controls.hfItemId.value };
            const itemDetails = FT.WebApi.mesGetSync("api/V3/Item/key", "", parameterColl, false);
            FT.Common.setDecimalPlaces(_controls.qtyCons, itemDetails.num_decimals);
        }
        // Function to retrieve lot and sublot for the given wo, oper, and seq
        function retrieveLotAndSubLot(wo) {
            // Retrieve the data from session storage
            const sessionData = JSON.parse(sessionStorage.getItem(STORAGEKEY)) || [];
            if (sessionData && sessionData.length > 0) {
                // Find the entry that matches wo, oper, and seq
                const result = JSON.parse(sessionData).find((item) => item.wo === wo); // && /*item.oper === oper && item.seq === seq*/);

                // Return lot and sublot if found, otherwise return null
                if (result) {
                    return { lot: result.lot, sublot: result.sublot, toentity: result.toentity };
                }
            }

            return null; // Entry not found
        }
        /**
         * Define which functions/properties are to be made public.
         */

        return {
            initializeForm: initializeForm,
            consReasonOnDataChange: consReasonOnDataChange,
            bomItemsOnDataChange: bomItemsOnDataChange,
            reduceConsButtonClick: reduceConsButtonClick,
            addConsButtonClick: addConsButtonClick,
            preWfExeCons: preWfExeCons,
            postWfExecCons: postWfExecCons,
            ddFEonDataChange: ddFEonDataChange,
            ddFIonDataChange: ddFIonDataChange,
        };
    }
})(window);