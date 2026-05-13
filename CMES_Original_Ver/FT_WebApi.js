/*
Name:        	FT_WebApi.js
Description: 	FT_WebApi js file containing global logic pertaining to the WEB API calls.

Ver	  Release		By						Date				      Change Description
001	  00.50	   		Ramesh V		2024-06-14				#2694 First version.
002	  00.50	   		AT					2024-08-02				Changed token from getUserAccessToken to getClientCredentialToken
003	  00.70	   		Ramesh V		2024-09-24				The `.replace(/\\/g, "\\\\")` was removed because the APIs can handle the escaping of
																								backslashes in file paths and user names.
004		00.70				Somya S			2024-12-17				mesSystemAttr function Updated for Sync and Async.
*/

((window) => {
	// ------------------------------ Global Variables ------------------------------------
	window.FT = window.FT || {};
	FT.WebApi = FT.WebApi || {};
	FT.WebApi = WebApi();
	// Start up module
	FT.WebApi.initialize();
	// ------------------------------------------------------------------------------------
	/**
	 * WebAPi
	 *
	 * @returns {null} WebAPi template object.
	 */
	function WebApi() {
		// #region Constant variables
		// ---------------------------- Constant Variables ----------------------------------
		// Add here the files you want to include
		const LIST_JS = [];
		const LIST_JS_AJAX = [];
		const LIST_CSS = [];
		// ----------------------------------------------------------------------------------
		// #endregion Constant variables
		// #region Private variables
		// ----------------------------- Private Variables ----------------------------------
		// ----------------------------------------------------------------------------------
		// #endregion Private variables
		// #region initialize
		/**
		 * Initializes different controls inside with proper data. Called on form load.
		 */
		function initialize() {
			// Include JS files
			includeJsFiles();

			// Include JS files via AJAX
			includeJsFilesAjax();

			// Include CSS files
			includeCssFiles();
		}
		// #endregion initialize
		// #region include functions
		/**
		 * Includes JS files specified in LIST_JS
		 */
		function includeJsFiles() {
			SFU.includeCustomJsFiles(LIST_JS);
		}

		/**
		 * Includes JS files specified in LIST_JS_AJAX, to be loaded using AJAX call.
		 */
		function includeJsFilesAjax() {
			LIST_JS_AJAX.forEach((url) => {
				$.ajax({
					type: "GET",
					url: url,
					dataType: "script",
					cache: true,
					async: false,
				});
			});
		}

		/**
		 * Includes CSS files specified in LIST_CSS
		 */
		function includeCssFiles() {
			SFU.includeCustomCssFiles(LIST_CSS);
		}
		// #endregion include functions
		// #region base functions
		/**
		 * Returns the base url of the running application based on the used device.
		 * Example:
		 * includePort = true  window.location.origin: "https://hostname:port" URL of enterprise console web portal
		 * includePort = false window.location.origin: "https://hostname"  URL without specific port.
		 * @param {boolean} includePort  Specifies whether BaseURL should be having port or without port.
		 * @return {string}
		 */
		function baseUrl(includePort = false) {
			const isWTProApp = skelta.forms.utilities.isWorkTasksPro();
			const serverUrl = skelta.forms.utilities.getServerUrl("");
			// WEB API on enterprise console site
			if (includePort && !isWTProApp) {
				return window.location.origin;
			}
			// WEB API on standard ports
			if (!includePort && !isWTProApp) {
				return `${window.location.protocol}//${window.location.hostname}`;
			}
			// WorkTask Pro APP WEB API on enterprise console site
			if (includePort && isWTProApp) {
				return skelta.utilities.getUriObjectFromString(serverUrl).origin;
			}
			// WorkTask Pro APP WEB API on standard ports
			if (!includePort && isWTProApp) {
				const { protocol } = skelta.utilities.getUriObjectFromString(serverUrl).protocol;
				const { hostname } = skelta.utilities.getUriObjectFromString(serverUrl);
				return `${protocol}//${hostname}`;
			}
			return null;
		}
		/**
		 * Public Function: Basic Function that calls a generic web API with the specified parameters using AJAX and callbacks.
		 * @param {string} httpRequestType  The HTTP request type (e.g., "GET", "POST").
		 * @param {string} url  The URL of the web API.
		 * @param {boolean} isAsync  Specifies whether the request should be asynchronous.
		 * @param {any} httpPostData The data to be sent to the web API.
		 * @param {string} bearer [Optional] Bearer token
		 * @param {object} header [Optional] Header of the request
		 * @param {Function} [fnSuccess] Optional callback function to execute on a successful AJAX request.
		 * @param {Function} [fnError] Optional callback function to execute on an unsuccessful AJAX request.
		 */
		function callGeneric(
			httpRequestType,
			url,
			isAsync = false,
			httpPostData = null,
			bearer = null,
			header = {},
			fnSuccess = null,
			fnError = null,
		) {
			const _header = header || (bearer ? { Authorization: "BEARER " + bearer } : {});
			let responseData = [];

			// Create the AJAX request
			const ajaxRequest = $.ajax({
				type: httpRequestType,
				async: isAsync,
				url: url,
				xhrFields: {
					withCredentials: true,
				},
				headers: _header,
				contentType: "application/json; charset=utf-8",
				data: JSON.stringify(httpPostData),
				dataType: "json",
			})
				.done((result, textStatus, jqXHR) => {
					// Callback function for successful AJAX request
					if (fnSuccess && typeof fnSuccess === "function") fnSuccess(result, textStatus, jqXHR);
					if (!isAsync) responseData = result;
				})
				.fail((jqXHR, textStatus, err) => {
					// Callback function for an unsuccessful AJAX request
					if (fnError && typeof fnError === "function") fnError(jqXHR, textStatus, err);
				});

			return isAsync ? ajaxRequest : responseData;
		}
		// #endegion base functions
		// #region mes functions
		/**
		 * Public Function: function to execute ASYNC GET calls to MES Web API. The reference to the web api must include the path as specificed in
		 * MES web api v1 or V3 user manual.
		 * Example: MES Web API V3 api = "/api/v3/Jobs/key"
		 * Example: MES Web API V3 api = "/api/v3/DirectAccess"
		 * Example: MES Web API V1 api = "/api/jobs"
		 * Example: MES Web API V1 api = "/api/DirectAccess"
		 * @param {string} api Web Api Reference as specified in V3 or V2 manual.
		 * @param {string} spName The spName to execute. Required only in case of direct access api.
		 * @param {object} parameters Javascript object containing the parameters to provide to the call. {entityId:24,"reasonCd:8}
		 * @param {boolean} includePort optional default false used for web api url
		 * @returns {Promise} promise
		 */
		function mesGetAsync(api, spName, parameters, includePort = false) {
			const type = "GET";
			const isAsync = true;
			const bearerToken = SFU.getUserAccessToken();
			let url;

			// Validation
			if (SFU.isEmpty(api)) throw new Error("API is not defined");
			if (!SFU.isEmpty(api) && api.toLowerCase().includes("directaccess") && SFU.isEmpty(spName)) {
				throw new Error("DirectAccess requires SP Name Parameter");
			}

			// Construct URL based on API and parameters
			if (api.toLowerCase().includes("directaccess")) {
				// Parameters sent as JSON object
				url = `${baseUrl(includePort)}/mesmw/${api}?spName=${encodeURIComponent(spName)}
				&spParams=${encodeURIComponent(parameters ? JSON.stringify(parameters) : "")}`;
			} else {
				// Each parameter in object is sent as key=value
				url = `${baseUrl(includePort)}/mesmw/${api}`;
				// Constructing the query parameters
				const queryParams = new URLSearchParams();

				if (parameters) {
					// Get entries of the parameters object as an array of [key, value] pairs
					Object.entries(parameters).forEach(([key, value]) => {
						// Convert non-string values to strings
						const stringValue = typeof value === "string" ? value : JSON.stringify(value);
						// Append the key-value pair to the URLSearchParams object, properly encoding the value
						queryParams.append(encodeURIComponent(key), stringValue);
					});
					url += "?" + queryParams.toString();
				}
			}

			// Return a promise
			return new Promise((resolve, reject) => {
				callGeneric(type, url, isAsync, null, bearerToken, null, resolve, reject);
			});
		}

		/**
		 * Public Function: function to execute SYNC GET calls to MES Web API. The reference to the web api must include the path as specificed in
		 * MES web api v1 or V3 user manual.
		 * Example: MES Web API V3 api = "/api/v3/Jobs/key"
		 * Example: MES Web API V3 api = "/api/v3/DirectAccess"
		 * Example: MES Web API V1 api = "/api/jobs"
		 * Example: MES Web API V1 api = "/api/DirectAccess"
		 * @param {string} api Web Api Reference as specified in V3 or V2 manual.
		 * @param {string} spName The spName to execute. Required only in case of direct access api.
		 * @param {object} parameters Javascript object containing the parameters to provide to the call. {entityId:24,"reasonCd:8}
		 * @param {boolean} includePort optional default false used for web api url
		 * @returns {object} data
		 */
		function mesGetSync(api, spName, parameters, includePort = false) {
			const type = "GET";
			const isAsync = false;
			const bearerToken = SFU.getUserAccessToken();
			let url;

			// Validation
			if (SFU.isEmpty(api)) throw new Error("API is not defined");
			if (!SFU.isEmpty(api) && api.toLowerCase().includes("directaccess") && SFU.isEmpty(spName)) {
				throw new Error("DirectAccess requires SP Name Parameter");
			}

			// Construct URL based on API and parameters
			if (api.toLowerCase().includes("directaccess")) {
				// Parameters sent as JSON object
				url = `${baseUrl(includePort)}/mesmw/${api}?spName=${encodeURIComponent(spName)}
				&spParams=${encodeURIComponent(parameters ? JSON.stringify(parameters) : "")}`;
			} else {
				// Each parameter in object is sent as key=value
				url = `${baseUrl(includePort)}/mesmw/${api}`;
				// Constructing the query parameters
				const queryParams = new URLSearchParams();

				if (parameters) {
					// Get entries of the parameters object as an array of [key, value] pairs
					Object.entries(parameters).forEach(([key, value]) => {
						// Convert non-string values to strings
						const stringValue = typeof value === "string" ? value : JSON.stringify(value);
						// Append the key-value pair to the URLSearchParams object, properly encoding the value
						queryParams.append(encodeURIComponent(key), stringValue);
					});
					url += "?" + queryParams.toString();
				}
			}

			// Return a data object
			return callGeneric(type, url, isAsync, null, bearerToken, null, null, null);
		}

		/**
		 * Public Function: function to execute GETY calls to MES Web API. The reference to the web api must include the path as specificed in
		 * MES web api v1 or V3 user manual.
		 * Example: MES Web API V3 api = "/api/v3/Jobs/key"
		 * Example: MES Web API V3 api = "/api/v3/DirectAccess"
		 * Example: MES Web API V1 api = "/api/jobs"
		 * Example: MES Web API V1 api = "/api/DirectAccess"
		 * @param   {string}    api Web Api Reference as specified in V3 or V2 manual.
		 * @param   {string}    spName Required only in case of direct access api.
		 * @param   {object}    parameters Javascript object "{ent_id:'4',raw_reas_cd:'Down'}"
		 * @param   {boolean}   includePort  optional default false used for web api url
		 * @returns {Promise} promise
		 */
		function mesPost(api, spName, parameters, includePort = false) {
			return new Promise((resolve, reject) => {
				const type = "POST";
				const isAsync = true;
				const bearerToken = SFU.getUserAccessToken();
				// Validation
				if (SFU.isEmpty(api)) {
					reject(new Error("API is not defined"));
					return;
				}
				if (api.toLowerCase().includes("directaccess") && SFU.isEmpty(spName)) {
					reject(new Error("DirectAccess requires SP Name Parameter"));
					return;
				}

				let url;

				// Construct URL based on API and parameters
				if (api.toLowerCase().includes("directaccess")) {
					// Parameters sent as JSON object
					url = `${baseUrl(includePort)}/mesmw/${api}?spName=${spName}`;
				} else {
					// Each parameter in object is sent as key=value
					url = `${baseUrl(includePort)}/mesmw/${api}`;
				}

				// Call the generic function
				callGeneric(type, url, isAsync, parameters, bearerToken, null, resolve, reject);
			});
		}

		/**
		 * Asynchronous Wrapper of Work Task getLookupSchemaAndData, implemented using JavaScript promise.
		 *
		 * @param {string} lookupName
		 * @param {object[]} lookupParameters JSON Object [ {Name: "@key",Value: "value" },..]
		 * @param {boolean} getAllColumnData Optional Pass this as true (default) when all the columns from the Data Lookup query are required.
		 * @returns {Promise} promise
		 */
		function mesGetLookupAsync(lookupName, lookupParameters, getAllColumnData = true) {
			return new Promise((resolve, reject) => {
				try {
					const lookupSchemaAndData = SFU.getLookupSchemaAndData(lookupName, lookupParameters, getAllColumnData);
					resolve(lookupSchemaAndData); // Resolve the promise with the result
				} catch (error) {
					reject(error); // Reject the promise if an error occurs
					throw error;
				}
			});
		}

		/**
		 * Retrieves specific system attribute values for a given group.
		 *
		 * @param {string} groupDesc The group description used in system_attr_grp table.
		 * @returns {Promise} Promise containing the result.
		 */
		/**
		 * Retrieves specific system attribute values for a given group.
		 *
		 * @param {string} groupDesc The group description used in system_attr_grp table.
		 * @param {boolean} async The execution type synchronous and asynchronous.
		 * @returns {Promise} Promise containing the result if the async is true else returns mesGetSync.
		 */
		function mesSystemAttr(groupDesc, async = true) {
			const apiString = "api/v3/DirectAccess";
			const parameters = { grp_desc: groupDesc };
			const spName = "sp_SA_FT_System_Attr_ByDesc";
			if (async) {
				return new Promise((resolve, reject) => {
					try {
						FT.WebApi.mesGetAsync(apiString, spName, parameters, false)
							.then((data) => {
								resolve(data); // Resolve the promise with the data
							})
							.catch((error) => {
								reject(error); // Reject the promise if an error occurs
							});
					} catch (error) {
						reject(error); // Reject the promise if an error occurs in the try block
					}
				});
			}
			return FT.WebApi.mesGetSync(apiString, spName, parameters, false);
		}

		// #endregion mes functions
		// #region return
		return {
			initialize: initialize,
			baseUrl: baseUrl,
			callGeneric: callGeneric,
			mesPost: mesPost,
			mesGetSync: mesGetSync,
			mesGetAsync: mesGetAsync,
			mesGetLookupAsync: mesGetLookupAsync,
			mesSystemAttr: mesSystemAttr,
		};
		// #endregion return
	}
})(window);
