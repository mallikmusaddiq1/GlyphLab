window.finishSearchJump = e => {
    let t = defaultCardsToLoad - e,
        f = () => {
            if ("function" == typeof loadPrev) loadPrev();
            setTimeout(endJmp, 100);
        };
    if (0 < t && "function" == typeof discoverBatch) {
        discoverBatch(t).then(f);
    } else {
        if ("function" == typeof updateGridMetrics) updateGridMetrics();
        f();
    }
};

window.switchToolbarTab = t => {
    window.currentToolbarTab = t;
    if (panelToolSearch) panelToolSearch.style.display = "search" === t ? "block" : "none";
    if (panelToolJump) panelToolJump.style.display = "jump" === t ? "block" : "none";
    if (panelToolDraft) panelToolDraft.style.display = "draft" === t ? "block" : "none";
    if (tabToolSearch) tabToolSearch.classList.toggle("active", "search" === t);
    if (tabToolJump) tabToolJump.classList.toggle("active", "jump" === t);
    if (tabToolDraft) tabToolDraft.classList.toggle("active", "draft" === t);
};

window.setSearchMode = e => {
    currentSearchMode = e;
    localStorage.setItem("glyphlab_search_mode", e);
    if (btnSmartSearch) btnSmartSearch.classList.toggle("active", "smart" === e);
    if (btnRawSearch) btnRawSearch.classList.toggle("active", "smart" !== e);
    if (charInput && charInput.value && window.findChar) window.findChar();
};

window.newWorkerRegistration = null;
window.swUpdateAvailable = false;

window.getCurrentSWVersion = async function() {
    try {
        let res = await fetch("./service-worker.js", {
            cache: "no-cache"
        });
        if (res.ok) {
            let text = await res.text();
            let match = text.match(/CACHE_VERSION\s*=\s*["']([^"']+)["']/);
            if (match && match[1]) return match[1];
        }
    } catch (e) {}
    return "v1.0";
};

window.renderUpdateUI = async function() {
    let ver = await window.getCurrentSWVersion();
    let tableCurrentVer = document.getElementById("tableCurrentVer");
    if (tableCurrentVer) tableCurrentVer.innerText = ver;

    let redDot = document.getElementById("updateRedDot");
    let btn = document.getElementById("btnUpdateAction");
    let title = document.getElementById("sidebarUpdateTitle");
    let tableVerLabel = document.getElementById("tableVerLabel");

    if (title) title.innerText = "UPDATE STATUS";

    if (window.swUpdateAvailable) {
        if (redDot) redDot.style.display = "inline-block";
        if (tableVerLabel) tableVerLabel.innerText = "UPDATE AVAILABLE";
        if (btn) {
            btn.innerText = "UPDATE NOW";
            btn.style.background = "linear-gradient(90deg, #FFA500, #FFD700)";
            btn.style.color = "#000";
            btn.style.border = "none";
        }
    } else {
        if (redDot) redDot.style.display = "none";
        if (tableVerLabel) tableVerLabel.innerText = "INSTALLED VERSION";
        if (btn) {
            btn.innerText = "FETCH NEW UPDATE";
            btn.style.background = "rgba(255,255,255,0.03)";
            btn.style.color = "var(--amber)";
            btn.style.border = "1px solid rgba(255,215,0,0.2)";
        }
    }
};

window.handleUpdateClick = async function() {
    let btn = document.getElementById("btnUpdateAction");

    if (window.swUpdateAvailable) {
        if (btn) btn.innerText = "UPDATING...";

        let reg = window.newWorkerRegistration;
        if (reg && reg.waiting) {
            reg.waiting.postMessage("SKIP_WAITING");
        } else if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage("SKIP_WAITING");
        }

        setTimeout(() => {
            window.location.reload(true);
        }, 300);

    } else {
        if (btn) {
            btn.innerText = "CHECKING...";
            btn.disabled = true;
        }

        try {
            if (window.newWorkerRegistration) {
                await window.newWorkerRegistration.update();
            }

            let reg = window.newWorkerRegistration;
            if (reg && (reg.waiting || reg.installing)) {
                window.swUpdateAvailable = true;
                if (typeof showToast === "function") showToast("New update available!", "success");
            } else {
                window.swUpdateAvailable = false;
                if (typeof showToast === "function") showToast("Already on latest version", "success");
            }
        } catch (e) {
            if (typeof showToast === "function") showToast("Could not check updates", "error");
        } finally {
            if (btn) btn.disabled = false;
            await window.renderUpdateUI();
        }
    }
};

window.onload = async () => {
    let initialLoaderEl = document.getElementById("initialLoadingMsg");
    try {
        let t = await localforage.getItem("GLYPH_AUTO");
        let hasFilters = !1;
        if (t) {
            let a = JSON.parse(t);
            if (a.f) {
                let parsedF = JSON.parse(a.f);
                if (parsedF && (parsedF.length > 0 || Object.keys(parsedF).length > 0)) {
                    hasFilters = !0;
                }
            }
        }
        if (!hasFilters && initialLoaderEl) initialLoaderEl.style.display = "flex";
    } catch (e) {
        if (initialLoaderEl) initialLoaderEl.style.display = "flex";
    }

    const toggles = ["hideUnrendered", "liveUpdateCheck", "wrapSearchCheck", "wrapDraftCheck", "wrapFontCheck", "expandFontCheck"];

    toggles.forEach(id => {
        let el = document.getElementById(id);
        if (el) {
            let stored = localStorage.getItem("glyphlab_toggle_" + id);
            if (stored !== null) el.checked = stored === "true";
            if (id === "wrapSearchCheck" && charInput) charInput.classList.toggle("wrap-mode", el.checked);
            if (id === "wrapDraftCheck" && draftArea) draftArea.classList.toggle("wrap-mode", el.checked);
            if (id === "wrapFontCheck" && tInput) tInput.classList.toggle("wrap-mode", el.checked);
            if (id === "expandFontCheck" && transformContent) transformContent.classList.toggle("font-grid-expanded", el.checked);
        }
    });

    toggles.forEach(id => {
        let el = document.getElementById(id);
        if (el) {
            el.addEventListener("change", () => {
                localStorage.setItem("glyphlab_toggle_" + id, el.checked);
                if (id === "wrapSearchCheck" && charInput) charInput.classList.toggle("wrap-mode", el.checked);
                if (id === "wrapDraftCheck" && draftArea) draftArea.classList.toggle("wrap-mode", el.checked);
                if (id === "wrapFontCheck" && tInput) tInput.classList.toggle("wrap-mode", el.checked);
                if (id === "expandFontCheck" && transformContent) transformContent.classList.toggle("font-grid-expanded", el.checked);
                if (id === "hideUnrendered" && charInput && charInput.value && window.findChar) window.findChar();
            });
        }
    });

    try {
        let e = await localforage.getItem("GLYPH_BKM");
        if (e) bookmarks = new Set(e);
    } catch (e) {}

    setSearchMode(currentSearchMode);

    let pData = gCD("./data/datasets.json").then(async e => {
        if (e) {
            fontCategories = e.fonts || {};
            setTimeout(() => {
                let d = new Intl.Segmenter(void 0, {
                        granularity: "grapheme"
                    }),
                    u = x => x ? Array.from(d.segment(String.fromCodePoint(...x))).map(s => s.segment) : [];
                for (let [g, h] of Object.entries(fontCategories)) {
                    for (let [f, v] of Object.entries(h)) {
                        v.fontCapital = u(v.fontCapital);
                        v.fontSmall = u(v.fontSmall);
                        v.fontNumber = u(v.fontNumber);
                    }
                }
                if ((tInput.value || fontSearch.value) && "function" == typeof renderTransform) renderTransform();
            }, 50);

            U_BLOCKS = e.filters ? (e.filters.U_BLOCKS || e.filters) : [];
            if (e.GENERAL_CATEGORY) window.GC_DATA = e.GENERAL_CATEGORY;
            if ("function" == typeof initCategories) initCategories();
            if (categorySearch.value && "function" == typeof filterCategories) filterCategories();

            if (e.combined) {
                let a = {};
                let chunkKeys = Object.keys(e.combined);
                for (let i = 0; i < chunkKeys.length; i++) {
                    let g = chunkKeys[i];
                    a[g] = null;
                    let groupData = e.combined[g],
                        charGroup = [];
                    for (let k in groupData) {
                        let charStr = (k.includes(",") || !isNaN(k)) ? String.fromCodePoint(...k.split(",").map(Number)) : k;
                        let ex = typeof expandUnicode === "function" ? expandUnicode(charStr) : [charStr];
                        ex.forEach(cStr => {
                            let formattedName = groupData[k].toLowerCase().replace(/\b\w/g, m => m.toUpperCase());
                            COMBINED_CHARS[cStr] = formattedName;
                            COMBINED_CAT_MAP[cStr] = g;
                            charGroup.push({
                                str: cStr,
                                name: formattedName
                            });
                        });
                    }
                    a[g] = charGroup;
                    if (i % 5 === 0) await new Promise(r => setTimeout(r, 0));
                }
                COMBINED_GROUPS = a;
                if ("COMBINED" === currentFilterTab && "function" == typeof initCategories) initCategories();
            }
        }
    }).catch(() => {});

    window.loadUnicodeData();

    pData.then(() => {
        localforage.getItem("GLYPH_AUTO").then(t => {
            let uP = new URLSearchParams(window.location.search),
                uH = uP.get("hex"),
                uD = uP.get("decimal"),
                uS_smart = uP.get("smart-search"),
                uS_raw = uP.get("raw-search"),
                uS_old = uP.get("search"),
                uS = uS_smart || uS_raw || uS_old,
                uN = !!(uH || uD || uS);

            if (t) try {
                let a = JSON.parse(t),
                    r = !1,
                    cJ = !uN && !activeFilters.size && (!a.i || !a.i.charInput);
                if (a.v) {
                    if (a.v.tab) currentBkmTab = a.v.tab;
                    if (a.v.filterTab) currentFilterTab = a.v.filterTab;
                    if (a.v.gsiSortOrder) window.gsiSortOrder = a.v.gsiSortOrder;
                    if (a.v.gsiActiveAlphas) window.gsiActiveAlphas = new Set(a.v.gsiActiveAlphas);
                    if (a.v.toolbarTab) window.switchToolbarTab(a.v.toolbarTab);
                    if (a.v.item) {
                        window.PENDING_GRID_ITEM = a.v.item;
                        if (cJ) {
                            let e = "cp" === a.v.item.type ? a.v.item.cp : "combined" === a.v.item.type ? a.v.item.str.codePointAt(0) : null;
                            if (null !== e) {
                                jumpHex.value = toH(e).padStart(4, "0");
                                jumpDec.value = e.toString(10);
                                r = !1;
                            }
                        }
                    } else if (a.v.hex && cJ) {
                        jumpHex.value = a.v.hex;
                        let e = parseInt(a.v.hex, 16);
                        if (!isNaN(e)) {
                            jumpDec.value = e.toString(10);
                            r = !0;
                        }
                    }
                }
                if ("function" == typeof switchFilterTab) switchFilterTab(currentFilterTab);
                window.PENDING_FCAT_SCROLLS = {};
                if (a.s) {
                    APP_S = a.s;
                    if (a.s["modal-box"]) window.PENDING_MODAL_SCROLL = a.s["modal-box"].t;
                    for (let e in a.s) {
                        if (!["modal-box", "scrollArea", "shortcutsContainer", "filtersMenu", "transformContent", "activeFiltersContainer", "gsiScrollContainer"].includes(e)) {
                            window.PENDING_FCAT_SCROLLS[e] = a.s[e].l;
                        }
                    }
                }
                document.querySelectorAll("input, textarea, select").forEach((e, t) => {
                    let i = e.id || "inp_" + t;
                    if (["hideUnrendered", "liveUpdateCheck", "wrapSearchCheck", "wrapDraftCheck", "wrapFontCheck", "expandFontCheck", "desktopSiteCheck"].includes(e.id)) return;
                    if (void 0 !== a.i[i]) {
                        if ("charInput" === e.id && uS || r && ("jumpHex" === e.id || "jumpDec" === e.id)) {
                            return;
                        }
                        if ("checkbox" === e.type) e.checked = a.i[i];
                        else e.value = a.i[i];
                    }
                });
                if (a.ui) {
                    for (let e in a.ui) {
                        let t = $(e);
                        if (t && "uniModalTitle" !== e) {
                            if (void 0 !== a.ui[e].c) t.className = a.ui[e].c;
                            if (void 0 !== a.ui[e].d) t.style.display = a.ui[e].d;
                        }
                    }
                    if (a.ui.uniModalTitle) {
                        uniModalTitle.innerHTML = a.ui.uniModalTitle.t;
                        uniModalTitle.style.color = a.ui.uniModalTitle.c;
                    }
                    if (a.ui.toolbarCollapsible && "flex" === a.ui.toolbarCollapsible.d) {
                        let e = $("toolbarToggleBtn");
                        if (e) e.innerHTML = " ";
                    }
                }
                if (a.f) activeFilters = new Map(JSON.parse(a.f));

                window.RS = () => {
                    if (APP_S) {
                        ["shortcutsContainer", "filtersMenu", "transformContent", "gsiScrollContainer"].forEach(e => {
                            let t = $(e);
                            if (t && APP_S[e]) {
                                t.scrollTop = APP_S[e].t || 0;
                                t.scrollLeft = APP_S[e].l || 0;
                            }
                        });
                    }
                    if ("function" == typeof updateGridMetrics) updateGridMetrics();
                };
                [50, 300, 800].forEach(d => setTimeout(window.RS, d));

                if (a.ui && a.ui.unifiedModal && a.ui.unifiedModal.c.includes("show")) {
                    if (a.ui.rangeWrapper && "block" === a.ui.rangeWrapper.d && "function" == typeof openRangeModal) setTimeout(openRangeModal, 50);
                    else if (a.ui.bkmWrapper && "block" === a.ui.bkmWrapper.d && "function" == typeof openBkm) setTimeout(openBkm, 50);
                    else if (a.ui.gsiWrapper && "block" === a.ui.gsiWrapper.d && "function" == typeof openGSI) setTimeout(openGSI, 50);
                    else if (a.ui.transformWrapper && "block" === a.ui.transformWrapper.d && "function" == typeof renderTransform) setTimeout(renderTransform, 50);
                    else {
                        if (detailsModal) detailsModal.classList.remove("show");
                        if (detailsWrapper) detailsWrapper.style.display = "none";
                    }
                }
            } catch (e) {}

            window.isAppReady = !0;
            if ("function" == typeof updateGsiUI) updateGsiUI();
            if ("function" == typeof renderActiveFilters) renderActiveFilters();

            let doSearch = () => {
                if ("function" == typeof window.findChar) {
                    if ("smart" === currentSearchMode) setTimeout(window.findChar, 800);
                    else window.findChar();
                }
            };

            if (uN) {
                if (uS_smart) {
                    closeModals();
                    charInput.value = uS_smart;
                    window.setSearchMode("smart");
                } else if (uS_raw) {
                    closeModals();
                    charInput.value = uS_raw;
                    window.setSearchMode("raw");
                } else if (uS_old) {
                    closeModals();
                    charInput.value = uS_old;
                    if ("function" == typeof window.findChar) window.findChar();
                } else if (uH && validateHex(uH)) {
                    closeModals();
                    jumpHex.value = uH;
                    if ("function" == typeof window.jumpToHex) window.jumpToHex();
                } else if (uD && !isNaN(parseInt(uD, 10))) {
                    closeModals();
                    jumpHex.value = toH(parseInt(uD, 10)).padStart(4, "0");
                    if ("function" == typeof window.jumpToHex) window.jumpToHex();
                }
            } else if (charInput.value) {
                doSearch();
            } else if (0 < activeFilters.size) {
                if ("function" == typeof reloadFilters) reloadFilters();
            } else {
                if (!jumpHex.value) jumpHex.value = "0021";
                if ("function" == typeof window.jumpToHex) window.jumpToHex();
            }

            if (initialLoaderEl) initialLoaderEl.style.display = "none";

            let _t = 0;
            document.addEventListener("touchend", e => {
                var a = (new Date).getTime();
                if (a - _t <= 300) e.preventDefault();
                _t = a;
            }, !1);

            window.renderUpdateUI();
        }).catch(() => {
            window.isAppReady = !0;
            if (initialLoaderEl) initialLoaderEl.style.display = "none";
            window.renderUpdateUI();
        });
    });
};

if ("serviceWorker" in navigator) {
    let refreshing = false;
    let hadController = !!navigator.serviceWorker.controller;

    navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (hadController && !refreshing) {
            refreshing = true;
            window.location.reload(true);
        }
    });

    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("./service-worker.js", {
                updateViaCache: "none"
            })
            .then(reg => {
                window.newWorkerRegistration = reg;

                let onUpdateFound = async () => {
                    window.swUpdateAvailable = true;
                    await window.renderUpdateUI();
                };

                if (reg.waiting && navigator.serviceWorker.controller) {
                    onUpdateFound();
                }

                reg.addEventListener("updatefound", () => {
                    let newWorker = reg.installing;
                    if (newWorker) {
                        newWorker.addEventListener("statechange", () => {
                            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                                onUpdateFound();
                            }
                        });
                    }
                });

                window.renderUpdateUI();
            })
            .catch(err => console.warn("SW Registration Error:", err));
    });
}

document.addEventListener("DOMContentLoaded", () => {
    localforage.getItem("GLYPH_FAB_STATE").then(e => {
        if (e) {
            if ($("fabMenu")) $("fabMenu").classList.add("active");
            if ($("fabMain")) $("fabMain").classList.add("active");
        }
    });
    let tE = $("toast");
    if (tE) {
        new MutationObserver(() => {
            if (tE.innerText.includes("!")) {
                tE.innerText = tE.innerText.replace(/!/g, "");
            }
        }).observe(tE, {
            childList: !0,
            characterData: !0,
            subtree: !0
        });
    }
});

window.getRawSearchCardClass = function(r, e) {
    if (!e || "string" != typeof r) return "";
    try {
        let t = Array.from(new Intl.Segmenter(void 0, {
                granularity: "grapheme"
            }).segment(e.trim())).map(r => r.segment),
            n = t.filter(r => Array.from(r).length > 1),
            a = t.filter(r => 1 === Array.from(r).length),
            o = n.flatMap(r => Array.from(r)),
            i = n.length > 0;
        return n.includes(r) ? "thick-golden-glowing-card" : o.includes(r) ? "medium-white-glowing-card" : a.includes(r) ? i ? "medium-golden-glow-card" : "thick-golden-glowing-card" : "";
    } catch (g) {
        console.error("Raw Search HL Error:", g);
        return "";
    }
};