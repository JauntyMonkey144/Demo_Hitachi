/*
Name:					TD_UI_EntSelect.js
Description:	The TD_UI_EntSelect.js js file containing logic pertaining to the TD_UI_EntSelect.js Form.

Ver		Release			By						Date				Change Description
001		02.00.00		Somya S	                2025-01-14			# First version of the file.

*/


((window) => {
	window.TD = window.TD || {};
	TD.Dashboard = Dashboard();

	function Dashboard() {
		/* -------------------- Constants -------------------- */
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_CSS = ["css/MES/FT_Common.css", "css/MES/TD_UI_Dashboard.css"];
		const NAVIGATON_GRPID = "TD_Dashboard";
		const NAVIGATON_FOR = "Dashboard";
		const FORM = {};

		/* -------------------- Private Variables -------------------- */
		const _controls = {};
		let userInfo = null;
		let mesUserId = null;
		let entName = "";
		let loadedHeaderForm = "";

		/* -------------------- Initialization -------------------- */
		function initializeForm(Control) {
			FORM.Control = Control;

			_controls.formParameters = FORM.Control.formParameters;

			// SC controls
			_controls.wwDropNavigation = FORM.Control.findByXmlNode("TV");
			_controls.hfEntity = FORM.Control.findByXmlNode("HFENT");

			// TD controls
			_controls.wwNavigation = FORM.Control.findByXmlNode("WWNAV");
			_controls.epHeader = FORM.Control.findByXmlNode("EPH");
			_controls.epBanner = FORM.Control.findByXmlNode("EPB");
			_controls.epContainer = FORM.Control.findByXmlNode("EPC");

			SFU.includeCustomJsFiles(LIST_JS);
			SFU.includeCustomCssFiles(LIST_CSS);

			onFormLoad();
		}

		/* -------------------- Form Load -------------------- */
		function onFormLoad() {
			$("#E1frameEmbedPage").removeAttr("sandbox");
			$("#E2frameEmbedPage").removeAttr("sandbox");

			setEmbedPageOverflowHiddenWindowLoad("TdHeader");

			FT.WorkTasks.contextInit();
			userInfo = FT.WorkTasks.userInfo();
			mesUserId = userInfo?.MESUserId ?? null;

			loadEntityDropNavigation();
		}

		/* -------------------- Entity Drop Navigation (SC behavior) -------------------- */
		function loadEntityDropNavigation() {
			const inputEntId = FT.WorkTasks.contextGet(_controls, "entId");

			const parameterColl = {
				entid: inputEntId,
				user_name: mesUserId,
			};

			let entChildrenData = FT.WebApi.mesGetSync(
				"api/V3/DirectAccess",
				"sp_SA_SC_Ent_Children",
				parameterColl,
				false
			);

			if (!entChildrenData || entChildrenData.length === 0) {
				SFU.showError(
					skelta.localize.getString("@@SC_EntConfigMissing@@"),
					skelta.localize.getString("@@SC_EntConfigMissingMsg@@")
				);
				return;
			}

			const fields = [
				FT.Ui.translationColumnField(
					"description",
					FT.Ui.TRANSLATION_GROUPS.grpEntDescription,
					["value"]
				),
			];

			entChildrenData = FT.Ui.translateArray(entChildrenData, fields);
			_controls.wwDropNavigation.widgetProperties.data =
				JSON.stringify(entChildrenData);

			// Auto-load TD dashboard if entId already exists
			if (inputEntId) {
				const selected = entChildrenData.find((e) => e.child === inputEntId);
				if (selected) {
					_controls.wwDropNavigation.widgetProperties.selectedValue = inputEntId;
					
					handleEntitySelection(selected.id, selected.label);
				}
			}
		}


		/* -------------------- Drop Navigation Events -------------------- */
		function wwDropNavigationOnDataChange() {
			
			if (!_controls.wwDropNavigation?.value) return;

			const selected = _controls.wwDropNavigation.value;
			if (!selected?.id) return;

			
			handleEntitySelection(selected.id, selected.label);
		}

		function handleEntitySelection(entId, entityName) {
			
			entName = entityName;

			const entObj = [
				{
					entId: entId,
					entName: entName,
					desc: entName,
				},
			];

			FT.WorkTasks.contextInit();
			FT.WorkTasks.contextSet(FORM.Control, "ent", JSON.stringify(entObj));

				epSetBannerForm();
			wwNavigationSetHeader();
			wwNavigationSetData();
			FT.Common.windowEventListenerAdd("td", eventListener);
		
		}

		

		function wwNavigationOnDataChange() {
			_controls.epContainer.url = "";

			if (_controls.wwNavigation.value) {
				const selectedAction = JSON.parse(_controls.wwNavigation.value);
				const filterDataObj = [
					{ type: "commandSelected", jsonValue: JSON.stringify(selectedAction) },
				];
				FT.WorkTasks.contextSet("", "filterData", JSON.stringify(filterDataObj));
				_controls.epContainer.url = SFU.getFormUrl(selectedAction.form_name);
			}
		}
/**
		 * Function to set WidgetDropNav visible script
		 */
		function wwDropNavigationSetVisibleScripts(Control) {
			$(Control.findById("W2").domElement).parent().css("overflow", "visible");
			$(Control.findById("W2").domElement).parent().parent().css("overflow", "visible");
			$(Control.findById("W2").domElement).parent().closest("div[controlid='W2']").css("z-index", "9999999999");
			return true;
		}

		function wwNavigationSetHeader() {
			const parameterCollection = {
				ent_name: entName,
				user_id: mesUserId,
				nav_grp_id: NAVIGATON_GRPID,
				type: "HeaderForm",
				category: NAVIGATON_FOR,
			};

			FT.WebApi.mesGetAsync(
				"api/V3/DirectAccess",
				"sp_SA_TD_Config_Dashboard",
				parameterCollection,
				false
			).then((data) => {
				_controls.epHeader.url = "";
				if (data?.length > 0 && data[0].form_name) {
					loadedHeaderForm = data[0].form_name;
					_controls.epHeader.url = SFU.getFormUrl(loadedHeaderForm);
				}
			});
		}

		function epSetBannerForm() {
			const parameterCollection = {
				ent_name: entName,
				user_id: mesUserId,
				nav_grp_id: NAVIGATON_GRPID,
				type: "BannerForm",
				category: NAVIGATON_FOR,
			};

			FT.WebApi.mesGetAsync(
				"api/V3/DirectAccess",
				"sp_SA_TD_Config_Dashboard",
				parameterCollection,
				false
			).then((data) => {
				_controls.epBanner.url = "";
				if (data?.length > 0 && data[0].form_name) {
					_controls.epBanner.url = SFU.getFormUrl(data[0].form_name);
				}
			});
		}

		function wwNavigationSetData() {
			const parameterCollection = {
				ent_name: entName,
				user_id: mesUserId,
				nav_grp_id: NAVIGATON_GRPID,
				type: "Tab",
				category: NAVIGATON_FOR,
			};

			FT.WebApi.mesGetAsync(
				"api/V3/DirectAccess",
				"sp_SA_TD_Config_Dashboard",
				parameterCollection,
				false
			).then((data) => {
				const ts = new Date().toString();
				data.forEach((item) => (item.last_edit_comment = ts));
				_controls.wwNavigation.widgetProperties.data = JSON.stringify(data);
			});
		}

		/* -------------------- Utilities -------------------- */
		function eventListener(event) {
			const headerForm = event.detail?.data?.[0]?.headerform;
			if (headerForm && loadedHeaderForm !== headerForm) {
				_controls.epHeader.url = "";
				loadedHeaderForm = headerForm;
				_controls.epHeader.url = SFU.getFormUrl(loadedHeaderForm);
			}
			setEmbedPageOverflowHidden("TdHeader");
		}

		function setEmbedPageOverflowHiddenWindowLoad(embedPageClass) {
			window.onload = function () {
				const iframe = document.querySelector("." + embedPageClass + "_skctr iframe");
				if (!iframe) return;
				const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
				const targetDiv = iframeDoc.querySelector(".skflx.skfc.skfdr.skfas.skcp");
				if (targetDiv) {
					const firstChildDiv = targetDiv.querySelector("div");
					if (firstChildDiv) firstChildDiv.style.overflow = "hidden";
				}
			};
		}

		function setEmbedPageOverflowHidden(embedPageClass) {
			const iframe = document.querySelector("." + embedPageClass + "_skctr iframe");
			if (!iframe) return;
			const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
			const targetDiv = iframeDoc.querySelector(".skflx.skfc.skfdr.skfas.skcp");
			if (targetDiv) {
				targetDiv.querySelectorAll("div").forEach((d) => (d.style.overflow = "hidden"));
			}
		}

		/* -------------------- Public API -------------------- */
	
return {
	initializeForm: initializeForm,                   // Form initialization
	wwDropNavigationOnDataChange: wwDropNavigationOnDataChange, // DropNav value change      // Hidden field entity change
	wwNavigationOnDataChange: wwNavigationOnDataChange,         // TD Navigation tabs change
	wwDropNavigationSetVisibleScripts: wwDropNavigationSetVisibleScripts,  // DropNav styling adjustments
};

	}
})(window);
