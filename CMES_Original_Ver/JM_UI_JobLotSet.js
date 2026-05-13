/*
Name:        	JM_UI_JobLotSet.js
Description: 	JM_UI_JobLotSet js file containing global logic pertaining to the JM_UI_JobLotSetData Form.

Ver		Release		By						Date				Change Description
001		00.50			Ramesh V		 	2024-05-16	#2770 First version.
002		00.70			João Caldeira 2024-11-19	#3942 Updated form and file name from JM_UI_LotSet to JM_UI_JobLotSet.
																					Added code to dispatch event on job lot set.
003		00.70			Chitta		 		2025-02-11	#4274 use web api instead loopups.
004		01.00			Bas van B			2025-02-24	#4253 Translate the item reasons and entities.
005		01.02.00 	Fayaz A				2025-07-04	#5093 Updated to set and retrieve data using FT functions instead of accessing storage directly.
*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //
/** IIFE
 * */
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.JM = window.JM || {};
	JM.JobLotSet = JM.JobLotSet || {};
	JM.JobLotSet = JobLotSet();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function JobLotSet() {
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css"];
		const FORM = {};
		FORM.Control = null;
		// ----------------------------------------------------------------------------------

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
			_controls.txItem = FORM.Control.findByXmlNode("TXITEM");
			_controls.ddProductionReason = FORM.Control.findByXmlNode("DDPR");
			_controls.txLot = FORM.Control.findByXmlNode("TXLOT");
			_controls.txSubLot = FORM.Control.findByXmlNode("TXSLOT");
			_controls.ddSubLot = FORM.Control.findByXmlNode("DDSL");
			_controls.hfReasonCode = FORM.Control.findByXmlNode("HFRSCD");
			_controls.hfBomPos = FORM.Control.findByXmlNode("HFBPOS");
			_controls.hfJobPos = FORM.Control.findByXmlNode("HFJPOS");
			_controls.hfWoId = FORM.Control.findByXmlNode("HFWID");
			_controls.hfEId = FORM.Control.findByXmlNode("HFEID");
			_controls.hfOperId = FORM.Control.findByXmlNode("HFOID");
			_controls.hfSequenceNo = FORM.Control.findByXmlNode("HFSNO");

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
			const groupType = getGroupType();
			getProductionReasons(groupType, "");
			getDefStorageEntities();
		}

		/**
		 * Determines the group type to use when retrieving item reasons.
		 * @returns {number} - The group type (Produced: 1, Consumed: 2).
		 */
		function getGroupType() {
			var groupType = 1;
			if (_controls.hfBomPos && _controls.hfBomPos.value != null && parseInt(_controls.hfBomPos.value, 10) > 0) {
				groupType = 2;
			}
			return groupType;
		}

		/**
		 * Retrieves production reasons based on the specified group type.
		 * @param {number} groupType - The group type to filter reasons (Produced: 1, Consumed: 2, Manual waste objects: 3).
		 * @param {string} formtitle - The title of the form to enable default select option.
		 * @returns {object[]} - An array of production reasons.
		 */
		function getProductionReasons(groupType, formtitle) {
			const searchId = "itemReasons";
			let data = JSON.parse(FT.WorkTasks.sessionStorageJsonGet(searchId));
			if (data === null) {
				data = FT.WebApi.mesGetSync("api/ItemReason", "", null, false);
				FT.WorkTasks.sessionStorageJsonSet(searchId, JSON.stringify(data));
			}
			if (data !== null && !SFU.isUndefined(groupType) && groupType !== null) {
				// Translate the data
				const fields = [
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
				data = FT.Ui.translateArray(data, fields);

				// checking & eliminating duplicate operation ids
				const temp = {};
				// Store each of the elements in an object keyed of of the name field.
				// If the name already exists then it is just replaced with the most recent one.
				for (let i = 0; i < data.length; i++) {
					if (data[i].reas_grp_type === groupType) {
						data[i].reas_grp_desc = data[i].reas_grp_desc + "\\" + data[i].reas_desc;
						temp[data[i].reas_grp_desc] = data[i];
					}
				}
				// Resetting the array
				data = [];
				data = Object.values(temp);
				// Enabling default select option for setLotdata form
				const SetLotDataTitle = skelta.localize.getString("@@SetLotDataTitle@@");
				if (SetLotDataTitle === formtitle) {
					if (data && data.length > 0) {
						const defaultseloption = {
							reas_cd: "",
							reas_grp_desc: "",
						};
						data.unshift(defaultseloption);
					}
				}
			}
			// return  data;
			if (SFU.isUndefined(data) || data == null || data === "") {
				// return '"[{"OValue":"1","OText":"ValueOne" },{"OValue":"2","OText":"ValueTwo"},{"OValue":"3","OText":"ValueThree"}]"';
			}
			// return data;
			FT.WorkTasks.controlOptionsSetFromDataset("DDPR", 0, data, "reas_grp_desc", "reas_cd");
		}

		/**
		 * Retrieves the default storage locations.
		 * @returns {object[]} - An array of default storage entities.
		 */
		function getDefStorageEntities() {
			const parameterCollection = { canStore: true };
			let data = FT.WebApi.mesGetSync("api/v3/Entity", "", parameterCollection, false);

			// Check if data is received
			if (data != null && data.length > 0) {
				// Translate the data
				const fields = [
					FT.Ui.translationColumnField("description", FT.Ui.TRANSLATION_GROUPS.grpEntDescription, FT.Ui.TRANSLATION_KEYS.keyEnt),
					FT.Ui.translationColumnField("ent_name", FT.Ui.TRANSLATION_GROUPS.grpEntDescription, FT.Ui.TRANSLATION_KEYS.keyEnt),
				];
				data = FT.Ui.translateArray(data, fields);
			}

			// return data;
			FT.WorkTasks.controlOptionsSetFromDataset("DDSL", 0, data, "ent_name", "ent_id");
		}

		return {
			initializeForm: initializeForm,
			getGroupType: getGroupType,
			getProductionReasons: getProductionReasons,
			getDefStorageEntities: getDefStorageEntities,
		};
	}
})(window);
