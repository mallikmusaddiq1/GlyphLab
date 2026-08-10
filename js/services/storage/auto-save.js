var AS = () => {
    if (!isClearing && window.isAppReady) {
        clearTimeout(ast);
        ast = setTimeout(() => {
            try {
                let e = scrollArea && gridElement ? Math.floor(Math.max(0, scrollArea.getBoundingClientRect().top - gridElement.getBoundingClientRect().top + 80) / (itemHeight + GAP)) * gridCols : 0,
                    t = {
                        i: {},
                        s: APP_S,
                        ui: {},
                        v: {
                            tab: currentBkmTab,
                            filterTab: currentFilterTab,
                            item: listData[e] || null,
                            toolbarTab: window.currentToolbarTab || "search",
                            gsiSortOrder: window.gsiSortOrder || "ASC",
                            gsiActiveAlphas: window.gsiActiveAlphas ? Array.from(window.gsiActiveAlphas) : []
                        },
                        f: JSON.stringify([...activeFilters])
                    };
                document.querySelectorAll("input, textarea, select").forEach((e, a) => {
                    let r = e.id || "inp_" + a;
                    r && !["hideUnrendered", "liveUpdateCheck", "wrapSearchCheck", "wrapDraftCheck", "wrapFontCheck", "expandFontCheck", "desktopSiteCheck"].includes(r) && (t.i[r] = "checkbox" === e.type ? e.checked : e.value);
                });
                let mb = document.querySelector(".modal-box");
                if (mb) {
                    APP_S["modal-box"] = {
                        t: mb.scrollTop,
                        l: mb.scrollLeft
                    };
                    let activeWrap = ["detailsWrapper", "transformWrapper", "bkmWrapper", "rangeWrapper", "gsiWrapper"].find((w) => $(w)?.style.display === "block");
                    if (activeWrap) {
                        let key = "mb_" + activeWrap;
                        if (activeWrap === "bkmWrapper") key = "mb_bkmWrapper_" + currentBkmTab;
                        APP_S[key] = {
                            t: mb.scrollTop,
                            l: mb.scrollLeft
                        };
                    }
                }
                ["shortcutsContainer", "activeFiltersContainer", "transformContent", "filtersMenu", "gsiScrollContainer", "filterTabsHeader"].forEach((e) => {
                    let t = $(e);
                    t && (0 < t.offsetWidth || 0 < t.offsetHeight) && (APP_S[e] = {
                        t: t.scrollTop,
                        l: t.scrollLeft
                    });
                }),
                    document.querySelectorAll("[data-fcat]").forEach((e) => {
                        let t = e.getAttribute("data-fcat");
                        t && (0 < e.offsetWidth || 0 < e.offsetHeight) && (APP_S[t] = {
                            t: e.scrollTop,
                            l: e.scrollLeft
                        });
                    }),
                    ["sidebar", "toolbarCollapsible", "filtersMenu", "unifiedModal", "detailsWrapper", "transformWrapper", "bkmWrapper", "rangeWrapper", "gsiWrapper", "gsiSortArea"].forEach((e) => {
                        let a = $(e);
                        a && (t.ui[e] = {
                            c: a.className,
                            d: a.style.display
                        });
                    });
                let r = uniModalTitle;
                r && (t.ui.uniModalTitle = {
                    t: r.innerHTML,
                    c: r.style.color
                }), localforage.setItem("GLYPH_AUTO", JSON.stringify(t));
            } catch (e) {
                console.warn("Autosave Error:", e);
            }
        }, 50);
    }
};

let scrollAst;
var scrollAS = () => {
    clearTimeout(scrollAst);
    scrollAst = setTimeout(() => {
        AS();
    }, 250);
};

document.addEventListener("input", AS);
document.addEventListener("change", AS);
document.addEventListener("click", () => setTimeout(AS, 10));
document.addEventListener("scroll", scrollAS, { passive: true, capture: true });