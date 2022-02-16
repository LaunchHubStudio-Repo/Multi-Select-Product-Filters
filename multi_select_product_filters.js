$(document).ready(function () {
    //Global variables
    const ALL_ITEMS_HTML = $(".products-flex-container .list-grid").html();
    const ALL_ITEMS_ARRAY = $.makeArray($(".products-flex-container .list-grid .grid-item"));
    const SPECIAL_CHARS = /[^a-z0-9]/gi

    /* HTML Templates */
    const OPENING_TAG_SEARCH_FILTER_OUTER = '<div class="search-filter-outer" style="display: none;">';
    const FILTER_BY_TEXT = '<div class="filterByText"><span style="opacity: 0.5;">Filter by:</span><button aria-label="Clear all filters" style="visibility: hidden;" class="clearAll">Clear All</button><i class="fa fa-times"></i></div><div class="activeFilterCon desktopFilters"></div>';
    const OPENING_TAG_FILTER_CONTAINER = '<div class="filter-container">';
    const OPENING_TAG_FILTER_AND_CLOSE = '<div class="filterAndClose open"><div class="filter-text open" tabindex="0" aria-expanded="true" role="button" aria-label="Expand %filter_name% filter group"><div class="filterCloseTrigger">%filter_name%<div class="filterContainerTotal"></div></div><i class="fa fa-angle-down"></i></div>';
    const OPENING_TAG_TAGS_CONTAINER = '<div class="tags-container open">';
    const CHECKBOX_CONTAINER = '<div class="select-label"><input type="checkbox" id="%tag_value%" name="%tag_name%" value="%tag_name%" aria-checked="false" /><span class="checkmark"></span><label for="%tag_value%">%label_value%</label></div>';
    const MOBILE_BUTTONS = '<div class="mobileButtonContainers"><div class="applyFilters">Apply Filters</div><div tabindex="0" role="button" aria-label="Clear all filters" class="clearAll" style="visibility: hidden;">Clear All</div></div>';
    const CLOSING_TAG = "</div>";
    /* HTML Templates */

    var htmlString = OPENING_TAG_SEARCH_FILTER_OUTER + FILTER_BY_TEXT + OPENING_TAG_FILTER_CONTAINER;

    Util_templateHelper = function (templateString, data) {
        templateString = $.trim(templateString);
        return templateString.replace(/%(\w*)%/g, function (m, key) {
            return data.hasOwnProperty(key) ? data[key] : "";
        });
    };

    buildFilterModule = function () {
        var categoryPathname = window.location.pathname;
        var sections = $(".list-section-title a[href='" + categoryPathname + "']").closest(".user-items-list").find(".user-items-list-simple .list-item");
        sections.each(function () {
            var me = $(this);
            var pairs = $(this).find(".list-item-content__description p");
            htmlString += Util_templateHelper(OPENING_TAG_FILTER_AND_CLOSE, {
                filter_name: me.find(".list-item-content__title").html().trim(),
            }) + OPENING_TAG_TAGS_CONTAINER;
            pairs.each(function () {
                var cleanString = $(this).html().replace(/\r\n|\n|\r/gm, "").trim();
                if (cleanString.length > 0) {
                    var tagName = cleanString.trim();
                    htmlString += Util_templateHelper(CHECKBOX_CONTAINER, {
                        tag_value: tagName.replace(SPECIAL_CHARS, ""),
                        tag_name: tagName,
                        label_value: tagName
                    });
                }
            });
            htmlString += CLOSING_TAG + CLOSING_TAG;
        });
        htmlString += CLOSING_TAG + MOBILE_BUTTONS + CLOSING_TAG;
        if (sections.length > 0) {
            $(".nested-category-tree-wrapper > ul").after(htmlString);
            $(".products-flex-container").before("<div class='topBarCon'><div id='results_count'>Total results: " + ALL_ITEMS_ARRAY.length + " / " + ALL_ITEMS_ARRAY.length + "</div><div class='activeFilterCon mobileFilters'></div><select class='sortPrice desktop' aria-label='Sort by Price'><option value='0'>Price High to Low</option><option value='1'>Price Low to High</option></select></div>");
            $("<div class='filterAndSort'><div class='mobileFilterButton'><i class='fa fa-filter'></i>Filter by<span class='filterItems'></span></div><select aria-label='Sort by Price' class='sortPrice mobile'><option value='0'>Price High to Low</option><option value='1'>Price Low to High</option></select></div>").insertAfter(".nested-category-tree-wrapper .search-filter-outer");
        }
        if ($(window).width() >= 800) {
            $(".search-filter-outer").css("display", "block");
        }

        //Hide page section with code block
        $(".list-section-title a[href]").closest("section.page-section").addClass("onlyInEditMode");
    };
    buildFilterModule();

    $(window).on("orientationchange", function () {
        if ($(window).width() < 800) {
            $(".search-filter-outer").css("display", "none");
            $(".header").css("z-index", "2");
        } else {
            $(".search-filter-outer").css("display", "block");
            $(".header").css("z-index", "2");
        }
    });

    /* This function is necessary for images to show when searching through them. Otherwise, the native lazy load function does not load images. */
    overrideLazyLoad = function (selector) {
        var imageSrc = selector.find(".grid-image .grid-image-wrapper img").attr("data-src");
        var coverImageSrc = selector.find(".grid-image .grid-image-wrapper img.grid-image-cover").attr("data-src");
        var hoverImageSrc = selector.find(".grid-image .grid-image-wrapper img.grid-image-hover").attr("data-src");

        selector.find(".grid-image .grid-image-wrapper img.grid-image-cover").attr("src", coverImageSrc + "");
        selector.find(".grid-image .grid-image-wrapper img.grid-image-cover").attr("style", "width: 100%; height: 100%; object-fit: cover; opacity: 1;");

        selector.find(".grid-image .grid-image-wrapper img.grid-image-hover").attr("src", hoverImageSrc + "");
        selector.find(".grid-image .grid-image-wrapper img.grid-image-hover").attr("style", "width: 100%; height: 100%; object-fit: cover;");

        selector.addClass("is-loaded");
        return selector;
    };

    /* Search function that is triggered on key up. This searches through item tags and the item titles. */
    searchItems = function (items, containers, i, onlyTags) {
        var filteredItemsArray = [];
        var filteredItemsHTML = "";
        var searchString = "";
        var filterArray = [];
        if (typeof containers[i] == "string") {
            filterArray = containers[i].split(",");
            filterDisplay(containers);
        }
        filterArray = filterArray.filter(function (str) { //Remove empty strings
            return str.trim().replace(SPECIAL_CHARS, "").toLowerCase() != "";
        });

        var sortPriceVal = $(window).width() > 800 ? $(".sortPrice.desktop").val() : $(".sortPrice.mobile").val()

        if (sortPriceVal == "0" || sortPriceVal == 0) {
            const eitherSort = (arr = []) => {
                const sorter = (a, b) => {
                    return parseFloat($(b).find(".sqs-money-native").html()) - parseInt($(a).find(".sqs-money-native").html());
                };
                arr.sort(sorter);
            };
            eitherSort(items);
        } else {
            const eitherSort = (arr = []) => {
                const sorter = (a, b) => {
                    return parseFloat($(a).find(".sqs-money-native").html()) - parseInt($(b).find(".sqs-money-native").html());
                };
                arr.sort(sorter);
            };
            eitherSort(items);
        }

        items.forEach(function (item) {
            var me = item;
            var tags = checkItemTags(me); //Get tags of current item
            var itemTitle = $(me).find(".grid-item-link").attr("aria-label"); //Item title
            itemTitle = itemTitle.replace(SPECIAL_CHARS, "").toLowerCase();

            //If array is empty, rebuild original HTML
            if (filterArray.length == 0) {
                me = overrideLazyLoad($(me));
                filteredItemsArray.push(me)
            } else {
                if (onlyTags) {
                    filterArray.forEach(function (str) {
                        if (tagsIncludeString(str, tags) && !isDuplicate($(me).attr("data-item-id"), filteredItemsArray)) {
                            me = overrideLazyLoad($(me));
                            filteredItemsArray.push(me);
                        }
                    });
                }
            }
        });
        if (i != containers.length) {
            i++;
            return searchItems(filteredItemsArray, containers, i, onlyTags)
        }
        var results = (filteredItemsArray.length == 0 && searchString.length == 0) ? ALL_ITEMS_ARRAY.length : filteredItemsArray.length;
        $("#results_count").html("Total results: " + results + " / " + ALL_ITEMS_ARRAY.length);
        filteredItemsArray.forEach(function (e) {
            filteredItemsHTML += $(e[0]).prop("outerHTML");
        });
        return filteredItemsHTML;
    };

    isDuplicate = function (id, array) {
        if (array.length == 0) {
            return false;
        }
        return array.some(function (item) {
            return item.attr("data-item-id") == id;
        });
    };


    /* Get all tags of a current item */
    checkItemTags = function (selector) {
        var classes = selector.classList || selector[0].classList;
        var filteredClasses = [];
        classes.forEach(function (name, i) {
            if (classes[i].startsWith("tag-")) {
                filteredClasses.push(classes[i].substring(classes[i].indexOf('-') + 1).trim().replace(SPECIAL_CHARS, "").toLowerCase());
            }
        });
        return filteredClasses;
    };

    /* Check if the string is included in any of the tags */
    tagsIncludeString = function (str, tagList) {
        str = str.trim().replace(SPECIAL_CHARS, "").toLowerCase();
        return tagList.some(function (tag) {
            return tag.trim().replace(SPECIAL_CHARS, "").toLowerCase() == str;
        });
    };

    /* Check if the item has both currently filtered tags. */
    tagsIncludeStringFilter = function (strList, tagList) {
        return strList.every(function (str) {
            return tagList.indexOf(str.trim().replace(SPECIAL_CHARS, "").toLowerCase()) != -1;
        });
    };

    setFilteredItems = function (items, containers, filterBool) {
        var filteredItemsHTML = searchItems(items, containers, 0, filterBool);
        if (filteredItemsHTML == "") {
            $(".products-flex-container .list-grid").html("<p>No items match the selected filters.</p>");
        } else {
            $(".products-flex-container .list-grid").html(filteredItemsHTML);
        }
    };

    filterDisplay = function (filters) {
        filters = filters.filter(function (str) { return str.length > 0 });
        var totalFilters = 0;
        var activeFilterText = "";
        if (filters.length == 0) {
            $(".clearAll").css("visibility", "hidden");
        }
        filters.forEach(function (str) {
            var currFilterTotal = 0;
            var currFilters = str.split(",").filter(function (str) { return str.length > 0 });
            currFilters.forEach(function (str) {
                totalFilters++;
                currFilterTotal++;
                if (str.length != 0) {
                    $(".tags-container input[type='checkbox'][value='" + str + "']").prop("checked", true).addClass("active");
                    $(".tags-container input[type='checkbox'][value='" + str + "']").attr("aria-checked", true)
                    $(".tags-container input[type='checkbox'][value='" + str + "']").closest(".filterAndClose").find(".filter-text .filterContainerTotal").html("(" + currFilterTotal + ")");
                    activeFilterText += "<button aria-label='Clear " + str + " filter' class='active-filter-ind'>" + str + "</button>";
                }
            });
        });

        $(".tags-container").each(function () {
            if ($(this).find("input[type='checkbox']:checked").length == 0) {
                $(this).prev(".filter-text").find(".filterContainerTotal").html("");
            }
        });

        activeFilterText += "<div class='clearAll' style='visibility: visible;'>Clear All</div>";
        $(".activeFilterCon").html(activeFilterText);

        $(".filterItems").html("(" + totalFilters + ")");

        $(".active-filter-ind").on("click", function () {
            var me = $(this);
            var selectEls = $(".tags-container input[type='checkbox'].active");
            selectEls.each(function () {
                if ($(this).val() == decodeURI(me.text())) {
                    $(this).prop("checked", false);
                    redirect();
                }
            });
        });

        $(".filter-text").on("focus", function (e) {
            e.stopImmediatePropagation();
            var me = $(this);
            $(document).on("keyup", function (event) {
                if (me.hasClass("focus-visible")) {
                    event.stopImmediatePropagation();

                    var keycode = (event.keyCode ? event.keyCode : event.which);
                    if (keycode == '13' || keycode == '32') {
                        me.toggleClass("open");
                        me.closest(".filterAndClose").toggleClass("open");
                        me.next(".tags-container").toggleClass("open");
                        me.next(".tags-container").slideToggle();
                    }
                }
            });
        });
        /* END: ADA-Compliant focus events */

        $(".clearAll").on("click", function () {
            var me = $(this);
            var selectEls = $(".tags-container input[type='checkbox'].active");
            selectEls.each(function () {
                $(this).prop("checked", false);
                $(this).removeClass("active");
                $(".activeFilterCon").html("");
                redirect();
            });
        });

        if (filters.length > 0) {
            $(".clearAll").css("visibility", "visible");
            $(".mobileButtonContainers .applyFilters").removeClass("disabled");
        } else {
            $(".clearAll").css("visibility", "hidden");
            $(".mobileButtonContainers .applyFilters").addClass("disabled");
        }
    };

    redirect = function () {
        var activeFilterText = "";

        var filterURL = window.location.href.split('?')[0] + "?";
        var containers = $(".nested-category-tree-wrapper .tags-container");
        containers.each(function (i) {
            var activeFils = "";
            $(this).find("input[type='checkbox']:checked").each(function () {
                activeFils += encodeURIComponent($(this).val()) + ",";
            });
            filterURL += "container" + i + "=" + activeFils + "&";
            filterURL += "container" + i + "_isOpen=" + $(this).hasClass("open") + "&";
        });
        window.history.pushState({}, '', filterURL);
        init();
        //window.location.replace(filterURL);
    };

    $(".tags-container input[type='checkbox']").on("change", function () {
        if ($(this).prop("checked") == false) {
            $(this).attr("aria-checked", "false");
        } else {
            $(this).attr("aria-checked", "true");
        }
        if ($(window).width() >= 800) {
            redirect();
        } else {
            $(".mobileButtonContainers .applyFilters").removeClass("disabled");
        }
    });

    $(".sortPrice").on("change", function () {
        redirect();
    });

    $(document).on('data-attribute-changed', function () {
        console.log("Data attribute changed");
        $(this).next(".checkmark").addClass("focus-visible");
    });


    $(".filter-text").on("click", function () {
        $(this).toggleClass("open");
        $(this).closest(".filterAndClose").toggleClass("open");
        $(this).next(".tags-container").toggleClass("open");
        $(this).next(".tags-container").slideToggle();
    });

    $(".mobileFilterButton").on("click", function () {
        $(".nested-category-tree-wrapper .search-filter-outer").slideDown(100);
        $(".header").css("z-index", "-1");

        $(".filterByText .fa-times").on("click", function () {
            $(".nested-category-tree-wrapper .search-filter-outer").slideUp(100, function () {
                $(".header").css("z-index", "2");
            });
        });
    });

    $(".mobileButtonContainers .applyFilters:not(.disabled)").on("click", function () {
        redirect();
        $(".nested-category-tree-wrapper .search-filter-outer").slideUp(100, function () {
            $(".header").css("z-index", "2");
        });
    });

    getFiltersFromURL = function (fullURL, count) {
        let params = (new URL(fullURL)).searchParams;
        var filterArray = [];

        for (let i = 0; i < count; i++) {
            if (params.get("container" + i) != null) {
                filterArray.push(decodeURIComponent(params.get("container" + i)));
            }
        }
        if (filterArray.length == 0) {
            $(".filterAndClose").removeClass("open");
            $(".filterAndClose").find(".filter-text").removeClass("open");
            $(".filterAndClose").find(".tags-container").removeClass("open").css("display", "none");
        }
        return filterArray;
    };

    getOpenDisplayFromURL = function (fullURL, count) {
        let params = (new URL(fullURL)).searchParams;
        var containers = $(".nested-category-tree-wrapper .tags-container");

        for (let i = 0; i < count; i++) {
            var currDisplay = params.get("container" + i + "_isOpen");
            if (currDisplay == "false") {
                $(containers[i]).css("display", "none");
                $(containers[i]).removeClass("open");
                $(containers[i]).closest(".filterAndClose").removeClass("open");
                $(containers[i]).closest(".filterAndClose").find(".filter-text").removeClass("open");
                $(containers[i]).closest(".filterAndClose").find(".filter-text").attr("aria-expanded", "false");
            }
        }
    };
    init = function () {
        var filterArray = getFiltersFromURL(document.location, $(".nested-category-tree-wrapper .tags-container").length);
        getOpenDisplayFromURL(document.location, $(".nested-category-tree-wrapper .tags-container").length);
        setFilteredItems(ALL_ITEMS_ARRAY, filterArray, true);
    }
    init();
});