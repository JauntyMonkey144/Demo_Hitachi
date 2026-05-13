/*
Name:					TD_UI_Dashboard.js
Description:	The TD_UI_Dashboard.js js file containing logic pertaining to the TD_UI_Dashboard Form.

Ver		Release			By						Date				Change Description
001		00.50.00		Shamanth S	  2024-05-27	#2806 First version of the file.
002 	00.50.01		Fayaz A				2024-08-27	#3331 Updated changes.
003 	00.70.00		PR 	  				2024-10-16	#3763 Remove all lookups and update with Web api calls.
004 	00.70.00		PR 	  				2024-10-23	#3337 Modify the wwEntityStateOnDataChange function.
005 	00.70.00		PR 	  				2024-10-23	#3337 Modify the wwEntityStateOnDataChange function.
006		00.70.00 		Fayaz A	  		2025-01-22	#4059 Removed all references of parent form controls and related functions.
007		00.70.00 		Fayaz A	  		2025-01-22	#4015 Hardcoded entity is removed & considered entity id configured in form parameter.
008		00.70.00 		Somya S   		2025-01-22	#4022 Updated .
009		01.00.00		Usha M				2025-02-27	#4355 Removed console.log
010		01.00.00 		Fayaz A	  		2025-03-24	#5471 FormName null check for is included before binding to Header and Container embedpage.
011		01.01.00 		Fayaz A	  		2025-05-06	#4874 A global variable, defaultHeaderForm, is defined to hold the default header form name
																and is set to 'header embedded page' when no header form is defined for the
																selected card.
012		01.01.00 		Fayaz A	  		2025-05-14	#4955 The function wwNavigationOnDataChange was updated to set the selected command value
																in the filterData context.
013		01.01.00 		Fayaz A	  		2025-05-23	#4874 The default header form logic has been updated to check if it's a new header form
																						before updating the URL.
014		01.01.00 		Fayaz A				2025-05-28	#5008 Localization key update to refer from FT runtime locale file.
015		01.01.00		Somya S				2025-06-03	#4888	ContextInint added in onEntitydropdownvaluechange.
016		01.02.00		Somya S				2025-06-30	#5073 EntityState - Not Compatible with presence of UCO's.
017		01.03.00		Somya S			  2025-09-11	#5151 Not able to start the the job in WO in JM_UI_JobStart.
018		01.03.00		Fayaz A			  2025-10-16	#5151 Updated wwEntityStateOnDataChange function to consider the.
019		02.00.00		Fayaz A			  2025-12-16	#5269 Added the embedded page "epBanner" to display the form configured for the 
														"TD_Dashboard" group with the type "BannerForm", and moved all logic related to 
														EntityState to the PE module form "PE_UI_EntState".

*/
// ------------------------------------------------------------- Immediate Functions ------------------------------------------------------------ //
((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.TD = window.TD || {};
	TD.Dashboard = TD.Dashboard || {};
	TD.Dashboard = Dashboard();
	// ------------------------------------------------------------------------------------
	/**
	 * formFunctions
	 *
	 * @returns {null} formFunctions template object.
	 */
	function Dashboard() {
		// ---------------------------- Constant Variables ----------------------------------
		// add here the files you want to include
		const LIST_JS = ["js/MES/FT_Common.js"];
		const LIST_JS_AJAX = [];
		const LIST_CSS = ["css/MES/FT_Common.css","css/MES/TD_UI_Dashboard.css"];
		const FORM = {};
		const NO_CONFIG_ENT_STATE_DATA =
			'[{"ent_id":"xxent_id","entity_name":"","raw_reason_code":"Not Configured","reason_code":"Not Configured",' +
			'"state_desc":"Not Configured","rcur":"0","rswitch":"NoConfig","equip_ent_id":"xxequip_ent_id"}]';
		const NAVIGATON_GRPID = "TD_Dashboard";
		const NAVIGATON_FOR = "Dashboard";
		const ENTITY_STATE = "Running"; // Default entity state to be used while creating first util event for the selected entity
		// ----------------------------------------------------------------------------------

		// ----------------------------- Private Variables ----------------------------------
		const _controls = {};
		FORM.Control = null;
		let userInfo = "";
		let mesUserId = "";
		let entName = "";

		/** Change selectChild value to show childrens of the entity {1 = Show children 0 = Dont show children};
		 * First priority is for form parameter selectChild, else this selectChild is considered as default
		 */
		let selectChild = 1;
		let loadedHeaderForm = "";
		let initialloadedHeaderForm = "";
		let defaultHeaderForm = "";
		let moduleEvent = "";
		// ----------------------------------------------------------------------------------
		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 *
		 * @param {object} Control - Control variable is used to get/set information from Form control.
		 */
		function initializeForm(Control) {
			// Initialize variables
			FORM.Control = Control;

			// _controls.fpEntId = FORM.Control.topLevelForm.formParameters.Entid;
			// _controls.fpSelectChild = FORM.Control.topLevelForm.formParameters.SelectChild;
			_controls.formParameters = FORM.Control.formParameters;

			_controls.ddEntity = FORM.Control.findByXmlNode("DDENT");
			_controls.wwJobProgress = FORM.Control.findByXmlNode("WWJP");
			 
			_controls.wwNavigation = FORM.Control.findByXmlNode("WWNAV");
			_controls.wwOEE = FORM.Control.findByXmlNode("WWOEE");
			_controls.epContainer = FORM.Control.findByXmlNode("EPC");
			_controls.epBanner = FORM.Control.findByXmlNode("EPB");
			_controls.epHeader = FORM.Control.findByXmlNode("EPH");

			_controls.hfEntityId = FORM.Control.findByXmlNode("HFEI");
			_controls.hfEntityState = FORM.Control.findByXmlNode("HFES"); 

			_controls.wwJobStepInfo = FORM.Control.findByXmlNode("WWJS");

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

		/**
		 * Form load function to bind cards with respect to entity from form parameters or if session variable EntID
		 */
		function onFormLoad() {
			// Following code is added to support pdf files to load inside an iframe
			$("#E1frameEmbedPage").removeAttr("sandbox");
			$("#E2frameEmbedPage").removeAttr("sandbox");

			setEmbedPageOverflowHiddenWindowLoad("TdHeader");
			// Inititalize context
			FT.WorkTasks.contextInit();
			userInfo = FT.WorkTasks.userInfo();

			mesUserId = userInfo.MESUserId !== undefined ? userInfo.MESUserId : null;
			try {
				const getEntityAll = getEntityOptions();
				if (getEntityAll.length > 0) {
					FT.WorkTasks.controlOptionsSetFromDataset("DDENT", 0, getEntityAll, "name", "ent_id", null, 0);

					entName = getEntityAll[0].name;
					entId = getEntityAll[0].ent_id;
					_controls.hfEntityId.value = entId;
					const entObj = [
						{
							entId: entId,
							entName: entName,
							desc: entName,
						},
					];
					FT.WorkTasks.contextSet(FORM.Control, "ent", JSON.stringify(entObj)); 

					 
					epSetBannerForm();

					wwNavigationSetHeader();
					// Get navigation/tabs for the entity

					wwNavigationSetData();

					FT.Common.windowEventListenerAdd("td", eventListener);
					
				} else {
					SFU.showError(
						skelta.localize.getString("@@TD_EntConfigMissing@@"),
						skelta.localize.getString("@@TD_EntConfigMissingMsg@@"),
					);
				}
			} catch (exception) {
				handleScriptError(exception);
			} finally {
				logExecutionTime();
			}
		}
		
		function eventListener(event) {
			const headerForm = event.detail.data[0].headerform;
			if (headerForm) {
				if (headerForm && loadedHeaderForm !== headerForm) {
					_controls.epHeader.url = "";
					loadedHeaderForm = headerForm;
					_controls.epHeader.url = SFU.getFormUrl(loadedHeaderForm);
				} else if (initialloadedHeaderForm !== loadedHeaderForm) {
					_controls.epHeader.url = "";
					loadedHeaderForm = initialloadedHeaderForm;
					_controls.epHeader.url = SFU.getFormUrl(loadedHeaderForm);
				}
			} else if (defaultHeaderForm) {
				if (defaultHeaderForm && loadedHeaderForm !== defaultHeaderForm) {
					_controls.epHeader.url = "";
					loadedHeaderForm = defaultHeaderForm;
					_controls.epHeader.url = SFU.getFormUrl(loadedHeaderForm);
				} else if (initialloadedHeaderForm !== loadedHeaderForm) {
					_controls.epHeader.url = "";
					loadedHeaderForm = initialloadedHeaderForm;
					_controls.epHeader.url = SFU.getFormUrl(loadedHeaderForm);
				}
			}

			setEmbedPageOverflowHidden("TdHeader");
			if (event.detail.data[0].module_event) {
				moduleEvent = event.detail.data[0].module_event;
				const eventModules = event.detail.data[0].module.split("|");

				// Loop through each module and attach a listener
				eventModules.forEach((module) => {
					FT.Common.windowEventListenerAdd(module, formEventListener);
				});
			}
		}

		function formEventListener(event) {
			// Split the module_event string into an array
			const eventList = moduleEvent.split("|");

			// Check if event.detail.subType matches any value in the array
			if (eventList.includes(event.detail.subType)) {
				// Set job progress of the running work order on the entity
				// wwEntityStateSetData();
			}
		}

		/**
		 * loads entities
		 * @returns {string} Returns ent_id and name
		 */
		function getEntityOptions() {
			const fpSelectChild = FT.WorkTasks.contextGet(_controls, "selectChild");
			selectChild = fpSelectChild !== undefined && fpSelectChild !== null ? fpSelectChild : selectChild;

			const fpEntId = FT.WorkTasks.contextGet(_controls, "entId");
			const entId = fpEntId !== undefined && fpEntId !== null ? fpEntId : null;

			const parameterCollection = { entid: entId, select_child: selectChild, user_name: mesUserId };
			const lookupSchemaAndData = FT.WebApi.mesGetSync("api/V3/DirectAccess", "sp_SA_TD_Ent", parameterCollection, false);
			if (SFU.isUndefined(lookupSchemaAndData) || lookupSchemaAndData == null || lookupSchemaAndData === "") {
				return '[{"OValue":"1","OText":"ValueOne" },{"OValue":"2","OText":"ValueTwo"},{"OValue":"3","OText":"ValueThree"}]';
			}

			return lookupSchemaAndData;
		}
		  
		/**
		 * Entity data change function
		 * @param {string} strEntId
		 * @param {string} strEntName
		 */
		function ddEntityOnDataChange(strEntId, strEntName) {
			FT.WorkTasks.contextInit();
			entId = Number.isNaN(parseInt(strEntId, 10)) ? strEntId : parseInt(strEntId, 10);

			entName = strEntName;
			const entObj = [
				{
					entId: entId,
					entName: entName,
					desc: entName,
				},
			];

			// Update selected entity to context
			FT.WorkTasks.contextSet(FORM.Control, "ent", JSON.stringify(entObj));
			try {
				// wwEntityStateSetData();
				epSetBannerForm();

				// Get navigation/tabs for the entity
				wwNavigationSetHeader();
				
				wwNavigationSetData();
				
			} catch (exception) {
				handleScriptError(exception);
			} finally {
				logExecutionTime();
			}
		}

		/**
		 * Widget navigation data change functionality
		 * Set navigation widget value(form_name) to the embed page.
		 */
		function wwNavigationOnDataChange() {
			_controls.epContainer.url = "";
			if (_controls.wwNavigation.value !== "") {
				const selectedAction = JSON.parse(_controls.wwNavigation.value);
				if (selectedAction) {
					const formName = selectedAction.form_name;
					const filterDataObj = [{ type: "commandSelected", jsonValue: JSON.stringify(selectedAction) }];
					FT.WorkTasks.contextSet("", "filterData", JSON.stringify(filterDataObj));
					_controls.epContainer.url = SFU.getFormUrl(formName);
				}
			}
		}

		/**
		 * Set navigation data from the config table
		 * @param {string} entity [optional]
		 * @param {string} grpId Group Id
		 * @param {string} navigationFor Navigation filter
		 * @returns
		 */
		function wwNavigationSetHeader() {
			try {
				const parameterCollection = {
					ent_name: entName,
					user_id: mesUserId,
					nav_grp_id: NAVIGATON_GRPID,
					type: "HeaderForm",
					category: NAVIGATON_FOR,
				};

				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_TD_Config_Dashboard", parameterCollection, false).then(
					(data) => {
						_controls.epHeader.url = "";
						if (data.length > 0) {
							loadedHeaderForm = data[0].form_name;
							defaultHeaderForm = loadedHeaderForm;
							initialloadedHeaderForm = loadedHeaderForm;
							if (loadedHeaderForm) {
								_controls.epHeader.url = SFU.getFormUrl(loadedHeaderForm);
							}
						}
					},
					(error) => {
						// Handle error
						throw error("Error:", error);
					},
				);
			} catch (exception) {
				handleScriptError(exception);
			}
		}

		/**
		 * Set navigation data from the config table
		 * @param {string} entity [optional]
		 * @param {string} grpId Group Id
		 * @param {string} navigationFor Navigation filter
		 * @returns
		 */
		function epSetBannerForm() {
			try {
				const parameterCollection = {
					ent_name: entName,
					user_id: mesUserId,
					nav_grp_id: NAVIGATON_GRPID,
					type: "BannerForm",
					category: NAVIGATON_FOR,
				};
 
				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_TD_Config_Dashboard", parameterCollection, false).then(
					(data) => {
						_controls.epBanner.url = "";
						if (data.length > 0) {
							let bannerForm = data[0].form_name; 
							if (bannerForm) {
								_controls.epBanner.url = SFU.getFormUrl(bannerForm);
							}
						}
					},
					(error) => {
						// Handle error
						throw error("Error:", error);
					},
				);
			} catch (exception) {
				handleScriptError(exception);
			}
		}
		/**
		 * Set navigation data from the config table
		 * @param {string} entity [optional]
		 * @param {string} grpId Group Id
		 * @param {string} navigationFor Navigation filter
		 * @returns
		 */
		function wwNavigationSetData() {
			try {
				const parameterCollection = {
					ent_name: entName,
					user_id: mesUserId,
					nav_grp_id: NAVIGATON_GRPID,
					type: "Tab",
					category: NAVIGATON_FOR,
				};

				FT.WebApi.mesGetAsync("api/V3/DirectAccess", "sp_SA_TD_Config_Dashboard", parameterCollection, false).then(
					(data) => {
						// to refresh
						const currentTimestamp = new Date().toString();
						data.forEach((item) => {
							item.last_edit_comment = currentTimestamp;
						});
						_controls.wwNavigation.widgetProperties.data = JSON.stringify(data);
					},
					(error) => {
						// Handle error
						throw error("Error:", error);
					},
				);
			} catch (exception) {
				handleScriptError(exception);
			}
		}

		/**
		 * To hide scroll bar of embed page by its class.
		 * @param {string} embedPageClass
		 * @returns
		 */
		function setEmbedPageOverflowHiddenWindowLoad(embedPageClass) {
			window.onload = function setEmbedPageOverFlowHidden() {
				const iframe = document.querySelector("." + embedPageClass + "_skctr iframe"); // Get the iframe element

				// Access the content inside the iframe
				const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

				// Find the div inside the iframe and apply styles
				const targetDiv = iframeDoc.querySelector(".skflx.skfc.skfdr.skfas.skcp");

				if (targetDiv) {
					const firstChildDiv = targetDiv.querySelector("div");
					firstChildDiv.style.overflow = "hidden"; // Apply overflow: hidden to the target div
				}
			};
		}
		/**
		 * To hide scroll bar of embed page by its class.
		 * @param {string} embedPageClass
		 * @returns
		 */
		function setEmbedPageOverflowHidden(embedPageClass) {
			const iframe = document.querySelector("." + embedPageClass + "_skctr iframe"); // Get the iframe element

			// Access the content inside the iframe
			const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

			// Find the div inside the iframe and apply styles
			const targetDiv = iframeDoc.querySelector(".skflx.skfc.skfdr.skfas.skcp");
			const targetDiv1 = iframeDoc.querySelector(".sksa.skfc.skfdc.skfas");
			if (targetDiv != null) {
				const childDivs = targetDiv.querySelectorAll("div");
				childDivs.forEach((child) => {
					child.style.overflow = "hidden";
				});
				if (targetDiv1) {
					const firstChildDiv1 = targetDiv1.querySelector("div");
					if (firstChildDiv1) {
						firstChildDiv1.style.overflow = "hidden";
					}
				}
				if (targetDiv) {
					const firstChildDiv = targetDiv.querySelector("div");
					if (firstChildDiv) {
						firstChildDiv.style.overflow = "hidden";
					}
				}
			}
		}
		/**
		 * @param {*} error
		 */
		function handleScriptError(error) {
			let errorMessage;

			if (error instanceof TypeError) {
				errorMessage = skelta.localize.getString("@@FT_UnexpectedType@@");
			} else if (error instanceof ReferenceError) {
				errorMessage = skelta.localize.getString("@@FT_ReferenceError@@");
			} else {
				errorMessage = skelta.localize.getString("@@FT_DuringScriptExecution@@");
			}
			SFU.showError(skelta.localize.getString("FormNGFErrorRunningScript_title"), errorMessage, null, error.message);

			throw errorMessage;
		}

		/**
		 * log execution time in skelta
		 */
		function logExecutionTime() {
			const skFnExecutionStartTime = new Date();
			FT.WorkTasks.logMessage("TD - execution time: " + (new Date() - skFnExecutionStartTime) + "ms");
		}

		/**
		 * Define which functions/properties are to be made public.
		 */
		return {
			initializeForm: initializeForm,
			getEntityOptions: getEntityOptions,
			ddEntityOnDataChange: ddEntityOnDataChange, 
			wwNavigationOnDataChange: wwNavigationOnDataChange,
			wwNavigationSetHeader: wwNavigationSetHeader,
			wwNavigationSetData: wwNavigationSetData, 
			
		};
	}
})(window);
