function AS(immediate = false) {
    if (window.isClearing) return;

    const performSave = async () => {
        try {
            const i = {};
            const inputs = document.querySelectorAll("input, textarea, select");
            inputs.forEach((el, idx) => {
                if (
                    [
                        "hideUnrendered",
                        "liveUpdateCheck",
                        "wrapSearchCheck",
                        "wrapDraftCheck",
                        "wrapFontCheck",
                        "expandFontCheck",
                        "desktopSiteCheck"
                    ].includes(el.id)
                ) {
                    return;
                }
                const key = el.id || ("inp_" + idx);
                i[key] = el.type === "checkbox" ? el.checked : el.value;
            });

            const s = {};

            const containerIds = [
                "scrollArea",
                "shortcutsContainer",
                "filtersMenu",
                "transformContent",
                "activeFiltersContainer",
                "gsiScrollContainer",
                "filterTabsHeader",
                "gsiAlphaContainer",
                "categoryFilters",
                "combinedCategoryFilter",
                "singleCategoryFilter",
                "generalCategoryFilter",
                "filterTabsContainer"
            ];

            containerIds.forEach((id) => {
                const el = document.getElementById(id);
                if (el) {
                    s[id] = {
                        t: el.scrollTop || 0,
                        l: el.scrollLeft || 0
                    };
                }
            });

            const modalBox = document.querySelector(".modal-box");
            if (modalBox) {
                s["modal-box"] = {
                    t: modalBox.scrollTop || 0,
                    l: modalBox.scrollLeft || 0
                };
                ["detailsWrapper", "transformWrapper", "bkmWrapper", "rangeWrapper", "gsiWrapper"].forEach((wId) => {
                    const wEl = document.getElementById(wId);
                    if (wEl && wEl.style.display !== "none") {
                        s["mb_" + wId] = {
                            t: modalBox.scrollTop || 0,
                            l: modalBox.scrollLeft || 0
                        };
                        if (wId === "bkmWrapper" && typeof window.currentBkmTab !== "undefined") {
                            s["mb_bkmWrapper_" + window.currentBkmTab] = {
                                t: modalBox.scrollTop || 0,
                                l: modalBox.scrollLeft || 0
                            };
                        }
                    }
                });
            }

            const filterWrappers = document.querySelectorAll(".filter-text-wrap, [data-fcat]");
            filterWrappers.forEach((el) => {
                if (el.id) {
                    s[el.id] = {
                        t: el.scrollTop || 0,
                        l: el.scrollLeft || 0
                    };
                }
            });

            const fontWrappers = document.querySelectorAll("#transformContent [data-fcat]");
            fontWrappers.forEach((el) => {
                const fcat = el.getAttribute("data-fcat");
                if (fcat) {
                    s[fcat] = {
                        t: el.scrollTop || 0,
                        l: el.scrollLeft || 0
                    };
                }
            });

            const v = {
                tab: typeof window.currentBkmTab !== "undefined" ? window.currentBkmTab : "SINGLE",
                filterTab: typeof window.currentFilterTab !== "undefined" ? window.currentFilterTab : "SINGLE",
                gsiSortOrder: window.gsiSortOrder || "ASC",
                gsiActiveAlphas: window.gsiActiveAlphas ? Array.from(window.gsiActiveAlphas) : [],
                toolbarTab: window.currentToolbarTab || "search",
                hex: document.getElementById("jumpHex") ? document.getElementById("jumpHex").value : "0021",
                item: window.PENDING_GRID_ITEM || null
            };

            const getUIObj = (id) => {
                const el = document.getElementById(id);
                if (!el) return null;
                return {
                    c: el.className || "",
                    d: el.style.display || ""
                };
            };

            const ui = {
                unifiedModal: getUIObj("unifiedModal"),
                detailsWrapper: getUIObj("detailsWrapper"),
                rangeWrapper: getUIObj("rangeWrapper"),
                bkmWrapper: getUIObj("bkmWrapper"),
                transformWrapper: getUIObj("transformWrapper"),
                gsiWrapper: getUIObj("gsiWrapper"),
                toolbarCollapsible: getUIObj("toolbarCollapsible"),
                filtersMenu: getUIObj("filtersMenu"),
                gsiSortArea: getUIObj("gsiSortArea"),
                uniModalTitle: document.getElementById("uniModalTitle") ?
                    {
                        t: document.getElementById("uniModalTitle").innerHTML,
                        c: document.getElementById("uniModalTitle").style.color
                    } :
                    null
            };

            const f =
                typeof window.activeFilters !== "undefined" && window.activeFilters ?
                JSON.stringify(Array.from(window.activeFilters.entries())) :
                "[]";

            const autoState = {
                i,
                s,
                ui,
                v,
                f
            };

            window.APP_S = s;
            if (typeof APP_S !== "undefined") {
                APP_S = s;
            }

            const jsonString = JSON.stringify(autoState);
            if (window.localforage) {
                await window.localforage.setItem("GLYPH_AUTO", jsonString);
            } else {
                localStorage.setItem("GLYPH_AUTO", jsonString);
            }
        } catch (err) {
            console.warn("[AutoSave] Error saving state:", err);
        }
    };

    if (immediate === true) {
        clearTimeout(window.ast);
        performSave();
    } else {
        clearTimeout(window.ast);
        window.ast = setTimeout(performSave, 150);
    }
}

window.AS = AS;

window.restoreFilterScrolls = function() {
    if (!window.APP_S) return;

    const applyScrolls = () => {
        const s = window.APP_S;
        if (!s) return;

        const filterTabsHeader = document.getElementById("filterTabsHeader");
        if (filterTabsHeader && s["filterTabsHeader"] && typeof s["filterTabsHeader"].l === "number") {
            filterTabsHeader.scrollLeft = s["filterTabsHeader"].l;
        }

        const shortcutsContainer = document.getElementById("shortcutsContainer");
        if (shortcutsContainer && s["shortcutsContainer"]) {
            if (typeof s["shortcutsContainer"].t === "number") shortcutsContainer.scrollTop = s["shortcutsContainer"].t;
            if (typeof s["shortcutsContainer"].l === "number") shortcutsContainer.scrollLeft = s["shortcutsContainer"].l;
        }

        const filterWrappers = document.querySelectorAll(".filter-text-wrap, [data-fcat]");
        filterWrappers.forEach((el) => {
            if (el.id && s[el.id] && typeof s[el.id].l === "number" && s[el.id].l > 0) {
                el.scrollLeft = s[el.id].l;
            }
        });

        const categorySliders = ["categoryFilters", "combinedCategoryFilter", "singleCategoryFilter", "generalCategoryFilter", "activeFiltersContainer"];
        categorySliders.forEach((id) => {
            const el = document.getElementById(id);
            if (el && s[id] && typeof s[id].l === "number") {
                el.scrollLeft = s[id].l;
            }
        });
    };

    applyScrolls();
    requestAnimationFrame(() => {
        setTimeout(applyScrolls, 50);
        setTimeout(applyScrolls, 200);
        setTimeout(applyScrolls, 600);
        setTimeout(applyScrolls, 1200);
    });
};

const origRS = window.RS;
window.RS = function() {
    if (typeof origRS === "function") origRS();
    if (typeof window.restoreFilterScrolls === "function") window.restoreFilterScrolls();
};

function attachAutoSaveListeners() {
    document.addEventListener("input", () => window.AS(), {
        passive: true
    });
    document.addEventListener("change", () => window.AS(), {
        passive: true
    });
    document.addEventListener("click", () => window.AS(), {
        passive: true
    });

    document.addEventListener(
        "scroll",
        (e) => {
            if (e.target && e.target.nodeType === 1) {
                window.AS();
            }
        }, {
            capture: true,
            passive: true
        }
    );

    window.addEventListener("beforeunload", () => window.AS(true));

    setTimeout(() => {
        if (window.localforage) {
            window.localforage.getItem("GLYPH_AUTO").then((data) => {
                if (data) {
                    try {
                        const parsed = typeof data === "string" ? JSON.parse(data) : data;
                        if (parsed && parsed.s) {
                            window.APP_S = parsed.s;
                            if (typeof APP_S !== "undefined") APP_S = parsed.s;

                            window.PENDING_FCAT_SCROLLS = window.PENDING_FCAT_SCROLLS || {};
                            for (let key in parsed.s) {
                                window.PENDING_FCAT_SCROLLS[key] = parsed.s[key].l;
                            }

                            window.restoreFilterScrolls();
                        }
                    } catch (e) {}
                }
            });
        }
    }, 10);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", attachAutoSaveListeners);
} else {
    attachAutoSaveListeners();
}

class AutoSaveService {
    saveState() {
        window.AS(true);
    }
    debouncedSave() {
        window.AS(false);
    }
    restoreScrolls() {
        if (typeof window.restoreFilterScrolls === "function") {
            window.restoreFilterScrolls();
        }
    }
    init() {
        window.AS();
    }
}

window.autoSaveService = new AutoSaveService();