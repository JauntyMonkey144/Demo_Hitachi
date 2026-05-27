/*
Name:                   MP_UI_JobProduce.js
Description:    MP_UI_JobProduce js file containing global logic pertaining the functionality for AddProduction and Reject.

Ver     Release     By                  Date                Change Description
001     00.50           Somya S             2024-06-14  #2865 First version of the file.
002     00.70         Chitta                2024-12-05  #3937 Item reason group ID codes must not call from FT_Common.js
003     00.70           Chitta              2024-12-10  #4058   ReasGrpCDProduced and ReasGrpCDReject constants removed and used
                                                                                                SP - sp_S_FT_Item_Reas_ByGrpHierarchy instead
                                                                                                sp_SA_MP_Item_Reas for Reasons Hierarchy
                                                                                                Removed unnessasry code of windows dispatch of "OM.Cancel" event
                                                                                                for function - iwGoodAddOnPostWorkflow
004     00.70           Chitta              2024-12-13  #4063 QtytoProduceDisplay, QtytoRejectDisplay should be number field
                                                                                                and those decimal points has to configure dynamically
005     00.70       Chitta              2024-12-17  #4126 forms MP_UI_JobProduce  multi level title widget header needs to hide.
                                                                                                lot and sublot needs to be in Context
006     01.00           Bas van B           2025-02-26  #4253 Translated MD in UI.
007     01.00           Fayaz A             2025-03-28  #4527 Updated iwGoodAddOnPostWorkflow function to pass the
                                                                                                        data as "DontChangeUrl" in windowEventDispatch.
008     01.01.00    Chitta              2025-05-08  #4902 Reject reason group selector code removed.
009     01.01.00    Fayaz A         2025-05-14  #4955 A global variable, commandSelected, is defined to fetch and hold the selected command's
                                                                                                action details from filterData context on form load.
010     01.01.00    Fayaz A             2025-05-28  #5008 Localization key update to refer from FT runtime locale file.
011     01.02.00    Fayaz A             2025-07-04  #5093 Updated to set and retrieve data using FT functions instead of accessing storage directly.
012     01.03.01    Fayaz A             2025-12-02  #5228   Added form button and moved iwGoodAddOnPreWorkflow logic to fbAddProdOnclick to handle the
                                                                                                Negative Qty production with in limit [-qtyProdced, 0]
                                                                                                and a confirmation.
013     01.03.07    Vinh                2026-05-27  Update strict multi-stage routing map (M1 -> M1.1 -> M1.2 -> FGStore1).
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //

((window) => {
    // ------------------------------ Global Variables ------------------------------------
    window.MP = window.MP || {};
    MP.JobProduce = MP.JobProduce || {};
    MP.JobProduce = JobProduce();
    // ------------------------------------------------------------------------------------
    /**
     * formFunctions
     *
     * @returns {null} formFunctions template object.
     */
    function JobProduce() {
        // ---------------------------- Constant Variables ----------------------------------
        // add here the files you want to include
        const LIST_JS = ["js/MES/FT_Common.js"];
        const LIST_JS_AJAX = [];
        const LIST_CSS = ["css/MES/FT_Common.css"];
        const FORM = {};
        const _controls = {};
        FORM.Control = null;
        const siteId = 1; // configure as per requirements.
        const STORAGEKEY = "sessionData_MP_UI_JobProduce"; // Key to store in sessionStorage
        // ----------------------------------------------------------------------------------

        // ----------------------------- Private Variables ----------------------------------
        let dataJson;
        let entVal = 0;
        let qtyRemaining = 0;
        let entId = 0;
        let datalotsublot = "";
        let commandSelected = ""; // Variable to hold the selected command's action details, including configured properties and their values
        let codeValue = ""; // Variable to hold the value of 'code' column from use case composability.
        // ----------------------------------------------------------------------------------
        /**
         * Initializes different controls inside with proper data. Called on form load.
         */
        function initializeForm(Control) {
            // Initialize variables
            FORM.Control = Control;
            _controls.txItem = FORM.Control.findByXmlNode("TXITEM");
            _controls.txLot = FORM.Control.findByXmlNode("TXLOT");
            _controls.txSubLot = FORM.Control.findByXmlNode("TXSL");
            _controls.hfProdType = FORM.Control.findByXmlNode("HFPT");
            _controls.txtQtyRemaining = FORM.Control.findByXmlNode("TXQR");
            _controls.nrQtytoProduceDisplay = FORM.Control.findByXmlNode("NRQPD");
            _controls.hfQtyToProduce = FORM.Control.findByXmlNode("HFQP");
            _controls.hfQtyProduced = FORM.Control.findByXmlNode("HFQPD");
            _controls.hfItemId = FORM.Control.findByXmlNode("HFII");
            _controls.hfEntId = FORM.Control.findByXmlNode("HFEI");
            _controls.hfWoId = FORM.Control.findByXmlNode("HFWI");
            _controls.hfOperId = FORM.Control.findByXmlNode("HFOI");
            _controls.hfSqn = FORM.Control.findByXmlNode("HFSQN");
            _controls.hfJobPos = FORM.Control.findByXmlNode("HFJP");
            _controls.hfJobStep = FORM.Control.findByXmlNode("HFJS");
            _controls.hfAltLoc = FORM.Control.findByXmlNode("HFAL");
            _controls.hfUpdateInv = FORM.Control.findByXmlNode("HFUI");
            _controls.hfMcNewLots = FORM.Control.findByXmlNode("HFNL");
            _controls.hfQtyToReduceBy = FORM.Control.findByXmlNode("HFQR");
            _controls.hfNumDecimalSelJob = FORM.Control.findByXmlNode("HFND");
            _controls.hfUomQtyRem = FORM.Control.findByXmlNode("HFUQR");
            _controls.hfUomQtyProd = FORM.Control.findByXmlNode("HFUQP");
            _controls.hfStorageLocation = FORM.Control.findByXmlNode("HFSL");
            _controls.hfEntName = FORM.Control.findByXmlNode("HFEN");
            _controls.wwGoodProdReas = FORM.Control.findByXmlNode("WWREAS");
            _controls.ddToEntity = FORM.Control.findByXmlNode("DDTE");
            _controls.iwAddProd = FORM.Control.findByXmlNode("IWPROD");

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

        // --- HÀM TẠO LOT TỰ ĐỘNG ---
        function generateLotAndSublot(woId) {
            const date = new Date();
            const year = date.getFullYear().toString().substr(-2);
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const dateString = `${year}${month}${day}`;
            
            const woSuffix = woId && woId.length > 4 ? woId.substr(-4) : (woId || "0000");

            return {
                lot: `L${dateString}-${woSuffix}`,
                sublot: `SL1` 
            };
        }

        /**
         * Form load function to bind selected card values eventData to the Production form.
         */
        function onFormLoad() {
            const filterData = FT.WorkTasks.contextGet(FORM.Control, "filterData");
            commandSelected = filterData.find((item) => item.type === "commandSelected");
            if (commandSelected) {
                commandSelected = JSON.parse(commandSelected.jsonValue);
                codeValue = commandSelected.code;
            }
            _controls.txtQtyRemaining = FORM.Control.findByXmlNode("TXQR");
            {
                const [selectedCard] = FT.WorkTasks.contextGet(FORM.Control, "eventData") || [];
                [dataJson] = JSON.parse(selectedCard.jsonValue);
                const data = dataJson;
                if (data != null) {
                    const productionType = "1";
                    setCtrlsNoOfDecimals(data.itemId);
                    qtyRemaining = parseFloat(data.qty) - parseFloat(data.qty_prod);
                    if (qtyRemaining < 0) {
                        qtyRemaining = 0;
                    }
                    _controls.txItem.value = FT.Ui.translateValue(FT.Ui.TRANSLATION_GROUPS.grpItemItemDesc, data.itemId, data.item_desc);
                    _controls.hfProdType.value = productionType;
                    _controls.txtQtyRemaining.value = qtyRemaining;
                    _controls.hfQtyToProduce.value = qtyRemaining;

                    _controls.hfQtyProduced.value = data.qty_prod;
                    _controls.hfItemId.value = data.itemId;
                    _controls.nrQtytoProduceDisplay.value = 0; 
                    _controls.hfEntId.value = data.ent_id;
                    _controls.hfEntName.value = data.ent_name;
                    _controls.hfWoId.value = data.woId;
                    _controls.hfOperId.value = data.operId;
                    _controls.hfSqn.value = data.seqNo;
                    _controls.hfJobPos.value = "0";
                    _controls.hfJobStep.value = 1;
                    _controls.hfAltLoc.value = 1;
                    _controls.hfUpdateInv.value = 0;
                    _controls.hfMcNewLots.value = 1;
                    _controls.hfUomQtyRem.value = data.uom_desc;
                    _controls.hfUomQtyProd.value = data.uom_desc;

                    datalotsublot = retrieveLotAndSubLot(data.woId, data.operId, data.seqNo);
                    let targetStoreToSelect = ""; 

                    if (datalotsublot && datalotsublot.lot && datalotsublot.lot.trim() !== "") {
                        _controls.txLot.value = datalotsublot.lot;
                        _controls.txSubLot.value = datalotsublot.sublot;
                        if (datalotsublot.toentity) {
                            targetStoreToSelect = datalotsublot.toentity;
                        }
                    } else {
                        const autoGenerated = generateLotAndSublot(data.woId);
                        _controls.txLot.value = autoGenerated.lot;
                        _controls.txSubLot.value = autoGenerated.sublot;
                        
                        // BẢN ĐỒ ĐỊNH TUYẾN CHÍNH XÁC (Routing Map)
                        const routingMap = {
                            "Machine1": "Machine1.1",
                            "Machine1.1": "Machine1.2",
                            "Machine1.2": "FGStore1",
                            "Machine2": "Machine2.1",
                            "Machine2.1": "Machine2.2",
                            "Machine2.2": "FGStore2",
                            "Machine3": "Machine3.1",
                            "Machine3.1": "Machine3.2",
                            "Machine3.2": "FGStore3"
                        };

                        if (data.ent_name && routingMap[data.ent_name]) {
                            targetStoreToSelect = routingMap[data.ent_name];
                        }
                    }
                    
                    // Thực hiện cơ chế load danh sách và thiết lập lựa chọn tự động
                    ddToEntityLoad(targetStoreToSelect);

                    typeVal = data.type;
                    entVal = data.ent_name;
                    entId = data.ent_id;
                }

                let actFinishTimeUTC = null;
                if (actFinishTimeUTC === null) {
                    actFinishTimeUTC = Date.now();
                }
                try {
                    const parameterColl = { reas_grp_type: FT.Common.MES_ITEM_REAS_GRP_TYPE.production };
                    FT.WebApi.mesGetAsync("api/v3/DirectAccess", "sp_S_FT_Item_Reas_ByGrpHierarchy", parameterColl, false).then(
                        (reasData) => {
                            if (reasData != null && reasData.length > 0) {
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
                                const reasonData = FT.Ui.translateArray(reasData, fields);
                                _controls.wwGoodProdReas.widgetProperties.notify = '{"Functionname":"HIDEHEADER"}';
                                _controls.wwGoodProdReas.widgetProperties.data = JSON.stringify(reasonData);
                            }
                        },
                        (error) => {
                            throw new Error("Error:", error);
                        },
                    );
                } catch (error) {
                    SFU.showError(skelta.localize.getString("@@FT_FailedError@@"), skelta.localize.getString("@@FT_Failed@@"));
                }
            }
        }

        /*
         * set decimal limit to number controls by Item table
         */
        function setCtrlsNoOfDecimals(itemID) {
            parameterColl = { item_id: itemID };
            FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_S_Item", parameterColl, false).then((data) => {
                if (data != null && data.length > 0) {
                    const numDecimals = data[0].num_decimals;
                    _controls.hfNumDecimalSelJob.value = numDecimals;
                    FT.Common.setDecimalPlaces(_controls.nrQtytoProduceDisplay, numDecimals);
                }
            });
        }

        /**
         * Load Dropdown Entity và thiết lập độ trễ an toàn để render UI
         */
        function ddToEntityLoad(targetStoreToSelect = "") {
            const parameterColl = { site: siteId };
            let entityData = FT.WebApi.mesGetSync("api/V3/DirectAccess", "sp_SA_FT_Ent_CanStore", parameterColl, false);
            
            if (entityData && entityData.length > 0) {
                const fields = [
                    FT.Ui.translationColumnField("description", FT.Ui.TRANSLATION_GROUPS.grpEntDescription, FT.Ui.TRANSLATION_KEYS.keyEnt),
                ];

                entityData = FT.Ui.translateArray(entityData, fields);

                const sanitizedData = entityData.map(item => ({
                    description: item.description || item.ent_name || "Unknown",
                    ent_name: item.ent_name || ""
                }));

                FT.WorkTasks.controlOptionsSetFromDataset("DDTE", 0, sanitizedData, "description", "ent_name");

                if (targetStoreToSelect && _controls.ddToEntity) {
                    setTimeout(() => {
                        _controls.ddToEntity.value = targetStoreToSelect;
                        saveContext(); 
                    }, 250); 
                }
            }
        }   

        function fbAddProdOnClick() {
            _controls.hfQtyToProduce.value = _controls.nrQtytoProduceDisplay.value;
            _controls.hfEntName.value = entVal;
            _controls.hfEntId.value = entId;
            _controls.hfStorageLocation.value = _controls.wwGoodProdReas.value;
            _controls.hfProdType.value = "";
            if (_controls.hfUpdateInv.value) {
                if (_controls.hfStorageLocation.value === "") {
                    const title = skelta.localize.getString("@@MP_ValidationError@@");
                    const errorMsg = skelta.localize.getString("@@MP_InvalidDefStorageLoc@@");
                    const errorDetails = skelta.localize.getString("@@MP_DefStorageLocErrorDetails@@");
                    SFU.showError(title, errorMsg, null, errorDetails);
                    return false;
                }
            }
            if (_controls.hfQtyToReduceBy.value) {
                if (parseFloat(_controls.hfQtyToProduce.value) * -1 > parseFloat(_controls.hfQtyToReduceBy.value)) {
                    const title = skelta.localize.getString("@@MP_ValidationError@@");
                    const errorMsg = skelta.localize.getString("@@MP_QtyToReduceByError@@") + " " + _controls.hfQtyToReduceBy.value;
                    const errorDetails = skelta.localize.getString("@@MP_QtyToReduceByErrorDetails@@");
                    SFU.showError(title, errorDetails, null, errorMsg);
                    return false;
                }
                return true;
            }
            if (_controls.hfQtyToProduce.value === "") {
                SFU.showError(
                    skelta.localize.getString("@@MP_QtyToProdMand@@"),
                    null,
                    skelta.localize.getString("@@MP_InvalidProduceQty@@"),
                );
                return false;
            }
            if (parseFloat(_controls.hfQtyToProduce.value) === 0) {
                const title = skelta.localize.getString("@@MP_ValidationError@@");
                const errorMsg = skelta.localize.getString("@@MP_InvalidProduceQty@@");
                const errorDetails = skelta.localize.getString("@@MP_ProduceZeroQtyErrDetails@@");
                SFU.showError(title, errorDetails, null, errorMsg);
                return false;
            }
            if (parseFloat(_controls.hfQtyToProduce.value) < 0) {
                const qtyProduced = parseFloat(_controls.hfQtyProduced.value) || 0;
                const qtyToProduce = parseFloat(_controls.hfQtyToProduce.value) || 0;
                const lowerLimit = -qtyProduced;
                const isValid = validateProductionQty(qtyProduced, qtyToProduce);

                if (!isValid) {
                    const message = skelta.localize.getString("@@MP_NegativeProductionAllowedMessage@@");
                    SFU.showError(
                        skelta.localize.getString("@@MP_ValidationError@@"),
                        message.replace("{lowerLimit}", lowerLimit).replace("{qtyToProduce}", qtyToProduce),
                    );
                    return false;
                }

                confirmAndRun(
                    skelta.localize.getString("@@MP_NegQtyConfirmationTitle@@"),
                    skelta.localize.getString("@@MP_NegQtyConfirmationMessage@@"),
                    () => {
                        SFU.invokeWorkflow(_controls.iwAddProd);
                        return true;
                    },
                    null,
                );
            } else {
                SFU.invokeWorkflow(_controls.iwAddProd);
                return true;
            }
            return false;
        }
        function validateProductionQty(qtyProduced, qtyToProduce) {
            if (qtyProduced === 0) {
                if (qtyToProduce < 0) {
                    return false;
                }
                return true;
            }
            if (qtyToProduce < 0) {
                const lowerLimit = -qtyProduced;
                if (qtyToProduce < lowerLimit) {
                    return false;
                }
            }
            return { valid: true };
        }

        async function confirmAndRun(title, message, action) {
            const ok = await confirmAsync(title, message);
            if (!ok) return false;

            await action();
            return true;
        }
        function confirmAsync(title, message) {
            return new Promise((resolve) => {
                SFU.showConfirmation(title, message, (val) => {
                    resolve(val === true);
                });
            });
        }

        function iwGoodAddOnPreWorkflow() {
            _controls.hfQtyToProduce.value = _controls.nrQtytoProduceDisplay.value;
            _controls.hfEntName.value = entVal;
            _controls.hfEntId.value = entId;
            _controls.hfStorageLocation.value = _controls.wwGoodProdReas.value;
            _controls.hfProdType.value = "";
            if (_controls.hfUpdateInv.value) {
                if (_controls.hfStorageLocation.value === "") {
                    const title = skelta.localize.getString("@@MP_ValidationError@@");
                    const errorMsg = skelta.localize.getString("@@MP_InvalidDefStorageLoc@@");
                    const errorDetails = skelta.localize.getString("@@MP_DefStorageLocErrorDetails@@");
                    SFU.showError(title, errorMsg, null, errorDetails);
                    return false;
                }
            }
            if (_controls.hfQtyToReduceBy.value) {
                if (parseFloat(_controls.hfQtyToProduce.value) * -1 > parseFloat(_controls.hfQtyToReduceBy.value)) {
                    const title = skelta.localize.getString("@@MP_ValidationError@@");
                    const errorMsg = skelta.localize.getString("@@MP_QtyToReduceByError@@") + " " + _controls.hfQtyToReduceBy.value;
                    const errorDetails = skelta.localize.getString("@@MP_QtyToReduceByErrorDetails@@");
                    SFU.showError(title, errorDetails, null, errorMsg);
                    return false;
                }
            }
            if (_controls.hfQtyToProduce.value === "") {
                SFU.showError(
                    skelta.localize.getString("@@MP_QtyToProdMand@@"),
                    null,
                    skelta.localize.getString("@@MP_InvalidProduceQty@@"),
                );
                return false;
            }
            if (parseFloat(_controls.hfQtyToProduce.value) === 0) {
                const title = skelta.localize.getString("@@MP_ValidationError@@");
                const errorMsg = skelta.localize.getString("@@MP_InvalidProduceQty@@");
                const errorDetails = skelta.localize.getString("@@MP_ProduceZeroQtyErrDetails@@");
                SFU.showError(title, errorDetails, null, errorMsg);
                return false;
            }
            if (parseFloat(_controls.hfQtyToProduce.value) < 0) {
                SFU.showError(
                    skelta.localize.getString("@@MP_NegQtyNotAllowedTitle@@"),
                    skelta.localize.getString("@@MP_NegQtyNotAllowedTitle@@"),
                    null,
                    skelta.localize.getString("@@MP_InvalidProduceQty@@"),
                );
                return false;
            }

            return true;
        }

        function iwGoodAddOnPostWorkflow(blockingOutput, workflowStatus) {
            storeToSessionStorage(
                dataJson.woId,
                dataJson.operId,
                dataJson.seqNo,
                _controls.txLot.value,
                _controls.txSubLot.value,
                _controls.ddToEntity.value,
            );

            FT.WorkTasks.workflowCheckStatus(blockingOutput, workflowStatus, true, 30000);
            if (workflowStatus === FT.WorkTasks.WF_STATUS.finishedSuccessfully) {
                FT.Common.windowEventDispatch(
                    "mp",
                    "mp.itemProd.produce",
                    FT.Common.EVENT_SOURCE_TYPE.form,
                    "MP_UI_JobProduce",
                    "DontChangeUrl",
                );

                setTimeout(() => {
                    const [selectedCard] = FT.WorkTasks.contextGet(FORM.Control, "eventData") || [];
                    [dataJson] = JSON.parse(selectedCard.jsonValue);
                    const data = dataJson;
                    if (data != null) {
                        qtyRemaining = parseFloat(data.qty) - parseFloat(data.qty_prod);
                        if (qtyRemaining < 0) {
                            qtyRemaining = 0;
                        }
                        _controls.txtQtyRemaining.value = qtyRemaining;
                        _controls.hfQtyToProduce.value = qtyRemaining;
                        _controls.hfQtyProduced.value = data.qty_prod;
                    }
                }, 2000);
            }
        }

        function fbGoodReduceOnClick() {
            var qtyProduce = parseFloat(_controls.nrQtytoProduceDisplay.value);
            if (qtyProduce > 1) {
                _controls.nrQtytoProduceDisplay.value = qtyProduce - 1;
            }
        }

        function fbGoodAddOnClick() {
            var qtyProduce = parseFloat(_controls.nrQtytoProduceDisplay.value);
            if (qtyProduce >= 0) {
                _controls.nrQtytoProduceDisplay.value = qtyProduce + 1;
            }
        }

        function saveContext() {
            storeToSessionStorage(
                dataJson.woId,
                dataJson.operId,
                dataJson.seqNo,
                _controls.txLot.value,
                _controls.txSubLot.value,
                _controls.ddToEntity.value,
            );
        }
        function txLotOnChange() {
            saveContext();
        }
        function txSubLotOnChange() {
            saveContext();
        }
        function ddEntityOnChange() {
            saveContext();
        }

        function storeToSessionStorage(wo, oper, seq, lot, sublot, toentity) {
            const sessionData = JSON.parse(FT.WorkTasks.sessionStorageJsonGet(STORAGEKEY)) || [];
            const existingIndex = sessionData.findIndex((item) => item.wo === wo); 

            if (existingIndex !== -1) {
                sessionData[existingIndex].lot = lot;
                sessionData[existingIndex].sublot = sublot;
                sessionData[existingIndex].toentity = toentity;
            } else {
                sessionData.push({
                    wo: wo,
                    oper: oper,
                    seq: seq,
                    lot: lot,
                    sublot: sublot,
                    toentity: toentity,
                });
            }
            FT.WorkTasks.sessionStorageJsonSet(STORAGEKEY, JSON.stringify(sessionData));
        }

        function retrieveLotAndSubLot(wo) {
            const sessionData = JSON.parse(FT.WorkTasks.sessionStorageJsonGet(STORAGEKEY)) || [];
            const result = sessionData.find((item) => item.wo === wo); 
            if (result) {
                return { lot: result.lot, sublot: result.sublot, toentity: result.toentity };
            }
            return null;
        }

        return {
            initializeForm: initializeForm,
            iwGoodAddOnPreWorkflow: iwGoodAddOnPreWorkflow,
            iwGoodAddOnPostWorkflow: iwGoodAddOnPostWorkflow,
            fbGoodReduceOnClick: fbGoodReduceOnClick,
            fbGoodAddOnClick: fbGoodAddOnClick,
            txLotOnChange: txLotOnChange,
            txSubLotOnChange: txSubLotOnChange,
            ddEntityOnChange: ddEntityOnChange,
            fbAddProdOnClick: fbAddProdOnClick,
        };
    }
})(window);