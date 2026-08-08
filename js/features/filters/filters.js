function getBlock(hexVal) {
    for (var i = 0; i < U_BLOCKS.length; i++) {
        if (hexVal >= U_BLOCKS[i][0] && hexVal <= U_BLOCKS[i][1]) return U_BLOCKS[i][2];
    }
    return "Unknown Block";
}

function toggleFilter(filterId, filterName) {
    activeFilters.has(filterId) ? activeFilters.delete(filterId) : activeFilters.set(filterId, filterName);
    renderActiveFilters();
    if (typeof charInput !== "undefined" && charInput.value.trim() && currentSearchMode === "smart") {
        window.findChar()
    } else {
        reloadFilters()
    }
}

function renderActiveFilters() {
    var btnElem, container = $("activeFiltersContainer"),
        clearBtn = $("clearMenuBtn");
    for (btnElem of $("shortcutsContainer").getElementsByTagName("button")) {
        var dataId = btnElem.getAttribute("data-id");
        dataId && activeFilters.has(dataId) ? btnElem.classList.add("active-filter") : btnElem.classList.remove("active-filter");
    }
    if (0 === activeFilters.size) {
        container.style.display = "none";
        container.innerHTML = "";
        clearBtn.style.display = "none";
    } else {
        container.style.display = "flex";
        clearBtn.style.display = "block";
        var htmlStr = '<button class="clear-all-btn" onclick="clearAllFilters()">CLEAR ALL</button>';
        activeFilters.forEach((name, id) => {
            htmlStr += `<div class="filter-pill" onclick="toggleFilter('${id}', '${name}')">${name} <button class="close-pill" style="pointer-events:none">&times;</button></div>`;
        });
        container.innerHTML = htmlStr;
        if (typeof updateGridMetrics === "function") updateGridMetrics();
    }
}

function clearAllFilters() {
    activeFilters.clear();
    renderActiveFilters();
    if (typeof charInput !== "undefined" && charInput.value.trim() && currentSearchMode === "smart") {
        window.findChar()
    } else {
        reloadFilters()
    }
}
async function reloadFilters() {
    window.randomSessionId = (window.randomSessionId || 0) + 1;
    var currentVisibleHex = typeof getCurrentVisibleHex === "function" ? getCurrentVisibleHex() : 33;
    currentFetchId++;
    listData = [];
    gridElement.style.height = "0px";
    scrollArea.scrollTop = 0;
    isFetching = !1;
    if (0 === activeFilters.size) {
        isFilterMode = !1;
        hlWord = !1;
        currentTopHex = currentVisibleHex;
        currentBottomHex = currentVisibleHex;
        if (typeof toH === "function") jumpHex.value = toH(currentVisibleHex).padStart(4, "0");
        else jumpHex.value = currentVisibleHex.toString(16).toUpperCase().padStart(4, "0");
        jumpDec.value = currentVisibleHex.toString(10);
        jumpHex.classList.remove("invalid");
        isJumping = !0;
        if ("function" == typeof discoverBatch) discoverBatch(defaultCardsToLoad).then(() => {
            if (typeof loadPrev === "function") loadPrev();
            setTimeout(typeof endJmp === "function" ? endJmp : () => {}, 100);
        });
        else if ("function" == typeof window.discoverBatch) window.discoverBatch(defaultCardsToLoad).then(() => {
            if (typeof loadPrev === "function") loadPrev();
            setTimeout(typeof endJmp === "function" ? endJmp : () => {}, 100);
        });
    } else {
        isFilterMode = !0;
        hlWord = !1;
        pendingFilterItems = [];
        var hasBaseFilters = !1,
            activeGenCats = new Set();
        activeFilters.forEach((name, id) => {
            if (id.startsWith("gencat-")) activeGenCats.add(name);
            else hasBaseFilters = !0;
        });
        if (hasBaseFilters) {
            activeFilters.forEach((name, id) => {
                if (id === "special-combined") {
                    for (var k in COMBINED_CHARS) {
                        pendingFilterItems.push({
                            type: "combined",
                            str: k,
                            name: COMBINED_CHARS[k]
                        });
                    }
                } else if (id.startsWith("combined-")) {
                    if (COMBINED_GROUPS[name]) {
                        COMBINED_GROUPS[name].forEach(item => pendingFilterItems.push({
                            type: "combined",
                            str: item.str,
                            name: item.name
                        }));
                    }
                } else if (id.startsWith("block-")) {
                    id = parseInt(id.split("-")[1]);
                    var startHex = U_BLOCKS[id][0],
                        endHex = U_BLOCKS[id][1];
                    for (var i = startHex; i <= endHex; i++) pendingFilterItems.push({
                        type: "cp",
                        cp: i
                    });
                }
            });
        }
        if (activeGenCats.size > 0 && window.GC_DATA) {
            var isValidCat = new Uint8Array(0x110000);
            for (var k in window.GC_DATA) {
                var catFull = window.GC_DATA[k].f;
                if (activeGenCats.has(catFull)) {
                    var dt = window.GC_DATA[k].data;
                    for (var i = 0; i < dt.length; i++) {
                        var v = dt[i];
                        if (typeof v === "number") isValidCat[v] = 1;
                        else
                            for (var j = v[0]; j <= v[1]; j++) isValidCat[j] = 1;
                    }
                }
            }
            if (!hasBaseFilters) {
                for (var cp = 0; cp <= 0x10FFFF; cp++) {
                    if (isValidCat[cp] === 1) pendingFilterItems.push({
                        type: "cp",
                        cp: cp
                    });
                }
            } else {
                pendingFilterItems = pendingFilterItems.filter(item => {
                    if (item.type === 'cp') return isValidCat[item.cp] === 1;
                    if (item.type === 'combined') {
                        var firstCode = item.str.codePointAt(0);
                        return isValidCat[firstCode] === 1;
                    }
                    return !1;
                });
            }
        }
        var loadCount = defaultCardsToLoad,
            pendingGridItem = window.PENDING_GRID_ITEM;
        if (pendingGridItem) {
            var foundIndex = pendingFilterItems.findIndex(x => x.type === pendingGridItem.type && (pendingGridItem.type === 'cp' ? x.cp === pendingGridItem.cp : x.str === pendingGridItem.str));
            if (foundIndex > 0) loadCount = foundIndex + defaultCardsToLoad;
            window.PENDING_GRID_ITEM = null;
        }
        if (typeof discoverFilterBatch === "function") discoverFilterBatch(loadCount).then(() => {
            if (pendingGridItem) {
                var actualIndex = listData.findIndex(x => x.type === pendingGridItem.type && (pendingGridItem.type === 'cp' ? x.cp === pendingGridItem.cp : x.str === pendingGridItem.str));
                if (actualIndex > 0) scrollArea.scrollTop = Math.floor(actualIndex / gridCols) * (itemHeight + GAP);
                else scrollArea.scrollTo(0, 0);
            } else {
                scrollArea.scrollTo(0, 0);
            }
        });
    }
}

function toggleFilters() {
    filtersMenu.classList.toggle("show")
}