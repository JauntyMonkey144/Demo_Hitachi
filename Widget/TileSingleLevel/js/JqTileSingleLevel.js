/* widget template
 *	ver: 0.9
 *	Author: Wilwin Lewis
 */

// Add function to jQuery to render the widget html
jQuery.fn.widgetTemplateTileSingleLevel = function (options, data, cwidget) {
	let myDivId = this[0].id;

	inputDiv = "in1";
	m_html = "";
	var objJsonParent = JSON.parse(data);

	let selector = "#" + myDivId;
	var isItemSelected = 0;
	var tileContent = options.tileContent;
	var isAlreadySelected = 0;

	if (cwidget.move == "prev") {
		var $current = $(selector + " .clickablecard.cardselected");
		var $prev = $current.length ? $current.prev(".clickablecard") : $(selector + " .clickablecard").last();
		if (!$prev.length) {
			$prev = $(selector + " .clickablecard").last();
		}
		$prev.trigger("click");
		return;
	} else if (cwidget.move == "next") {
		var $current = $(selector + " .clickablecard.cardselected");
		var $next = $current.length ? $current.next(".clickablecard") : $(selector + " .clickablecard").first();
		if (!$next.length) {
			$next = $(selector + " .clickablecard").first();
		}
		$next.trigger("click");
		return;
	}

	$(selector + " .TileSingleLevelContent").empty();

	$(selector + " .TileSingleLevelTitle").empty();
	$(selector + " .TileSingleLevelTitle").append(cwidget.displayTitle);

	var leftRightIconHtml =
		'<div class="btnScroll hideDisplay"><div class="btnleft" > <img width="24px" src="custom/widgets/images/navigation--turn-left.svg"/></div><div class="btnright" > <img width="24px" src="custom/widgets/images/navigation--turn-right.svg"/></div></div><div style="height: 100%;overflow: hidden;white-space: nowrap;text-align: left; width: 95%; display: inline-block;" id="maindiv"><div style="display:block;width:auto;" id="ChildItems"></div></div>';
	$(selector + " #scroller").append(leftRightIconHtml);
	objJsonParent.forEach(function (objJson) {
		BuildHTMLItem(objJson);
	});

	$(selector).on("click", ".clickablecard", function () {
		var rawValue = $(this).attr("itemValue").replace(/\|\|/g, '"');
		var itemData = rawValue.includes("{") ? "[" + rawValue + "]" : rawValue;
		cwidget.value = itemData;
		$(selector + " .clickablecard").removeClass("cardselected");
		$(this).addClass("cardselected");
	});
	$(selector + " .clickablecard").each(function (index) {
		$(this).click(function () {
			var itemData = $(this).attr("itemValue").replace(/\|\|/g, '"').includes("{")
				? "[" + $(this).attr("itemValue").replace(/\|\|/g, '"') + "]"
				: $(this).attr("itemValue").replace(/\|\|/g, '"');
			cwidget.value = itemData;

			$(selector + " .clickablecard").removeClass("cardselected");
			$(this).addClass("cardselected");
		});
	});

	$("div.btnleft").click(() => {
		var container = document.getElementById("maindiv");
		$(container).animate({ scrollLeft: "+=150px" }, "slow");
	});
	$("div.btnright").click(() => {
		var container = document.getElementById("maindiv");
		$(container).animate({ scrollLeft: "-=150px" }, "slow");
	});

	var parentPanelID = $(selector + " #maindiv")[0];
	var childPanelID = $(selector + " #maindiv #ChildItems")[0];

	// console.log("Perent:"+parentPanelID.clientWidth + " child:"+childPanelID.scrollWidth)
	if (childPanelID.scrollWidth > parentPanelID.clientWidth) {
		$(selector + " .btnScroll").removeClass("hideDisplay");
	} else {
		$(selector + " .btnScroll").addClass("hideDisplay");
	}

	function BuildHTMLItem(jsonObjItem) {
		var tileItem = $(tileContent).filter(function (i, n) {
			return n.type.toLowerCase() === jsonObjItem.type.toLowerCase();
		})[0];

		if (tileItem != undefined) {
			// HTML for task item
			var Html = tileItem.html;
			// data map configuration
			var dataMapper = tileItem.dataMapper;
 
			if (Html != undefined && dataMapper != undefined) {
				dataMapper.forEach(function (DataMapperItem) {
					 
					if (tileItem.iconVisible) { 
						 
					}  
					if (tileItem.itemValue == "JSON") {
						Html = Html.replace("xxItemValue", JSON.stringify(jsonObjItem).replace(/"/g, "||"));
					} else if (tileItem.itemValue != undefined) {
						Html = Html.replace(
							"xxItemValue",
							jsonObjItem[tileItem.itemValue] != undefined ? jsonObjItem[tileItem.itemValue] : "No Value Defined",
						);
					}
					var dataMaperKeys = Object.keys(DataMapperItem) ;
					var dataMaperValues = Object.values(DataMapperItem);

					for (let i = 0; i < dataMaperKeys.length; i++) {
						var key = dataMaperKeys[i];
						let value = dataMaperValues[i];
 
						if (typeof value === "object" && value !== null) {
							const { param } = value;
							let { removeIfNull } = value;
							removeIfNull = removeIfNull !== undefined && removeIfNull != null ? removeIfNull : true;
							value = param;
							const checkDataIfNull = !!(
								jsonObjItem[value] !== undefined &&
								jsonObjItem[value] != null &&
								jsonObjItem[value] !== "" &&
								jsonObjItem[value].toLowerCase() === "hide"
							);
							if (checkDataIfNull && removeIfNull) {
								const regex = new RegExp(`<[^>]*${key}[^>]*>`, "g");
								Html = Html.replace(regex, "");
							}
						}
						if (key.toLowerCase().includes("date")) {
							Html = Html.replaceAll(
								key,
								jsonObjItem[value] != undefined
									? moment(jsonObjItem[value]).format(dateFormat)
									: key,
							);
						} else {
							Html = Html.replaceAll(
								key,
								jsonObjItem[value] != undefined ? jsonObjItem[value] : key,
							);
						}
					}
				});
				$(selector + " .TileSingleLevelContent #maindiv #ChildItems").append(Html);

				if (tileItem.defaultItemSelection) {
					if (cwidget.selectedValue != undefined && cwidget.selectedValue != "") {
						if (isItemSelected == 0 && cwidget.selectedValue == jsonObjItem[tileItem.itemValue]) {
							if (tileItem.itemValue == "JSON") {
								cwidget.value = "[" + JSON.stringify(jsonObjItem) + "]";
							} else if (tileItem.itemValue != undefined) {
								cwidget.value = jsonObjItem[tileItem.itemValue];
							}

							$(selector + " .clickablecard").removeClass("cardselected");
							$(selector + " .item")
								.last()
								.addClass("cardselected");
							isItemSelected = 1;
						}
					} else {
						if (isItemSelected == 0) {
							if (tileItem.itemValue == "JSON") {
								cwidget.value = "[" + JSON.stringify(jsonObjItem) + "]";
							} else if (tileItem.itemValue != undefined) {
								cwidget.value = jsonObjItem[tileItem.itemValue];
							}
							$(selector + " .clickablecard").removeClass("cardselected");
							$(selector + " .item")
								.last()
								.addClass("cardselected");
							isItemSelected = 1;
						}
					}
				}
			} else {
				//console.log("No Html or Data Mapper configured for " + jsonObjItem.type);
			}
		} else {
			//console.log("No proper card configuration found for type : " + jsonObjItem.type);
		}
	}
};
