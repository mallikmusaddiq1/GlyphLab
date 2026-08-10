var saveBkm = () => localforage.setItem("GLYPH_BKM", [...bookmarks]);
var getModScroll = () => {
    var e = document.querySelector(".modal-box");
    return e ? e.scrollTop : 0
};
window.bkmRawSearch = function(e) {
    var t = resolveBkmId(e);
    if (!t) return;
    var a = t.title;
    closeModals();
    if (charInput) charInput.value = a;
    window.executeRawSearch && window.executeRawSearch(a)
};

function tglBkm(e, t, o) {
    if (e) e.stopPropagation();
    var r = String(t),
        n = !bookmarks.has(r);
    if (n) bookmarks.add(r);
    else bookmarks.delete(r);
    var a = n ? "#FFD700" : "rgba(255,255,255,0.2)";
    if (o) {
        o.style.color = a;
        var l = o.querySelector("svg");
        if (l) l.setAttribute("fill", n ? "currentColor" : "none")
    }
    document.querySelectorAll("button[data-bkm-btn]").forEach(e => {
        if (e.getAttribute("data-bkm-btn") === r) {
            e.style.color = a;
            var t = e.querySelector("svg");
            if (t) t.setAttribute("fill", n ? "currentColor" : "none")
        }
    }), saveBkm(), "function" == typeof renderVirtualGrid && window.renderVirtualGrid(), AS()
}

function switchBkmTab(e) {
    window.PENDING_MODAL_SCROLL = getModScroll(), currentBkmTab = e, openBkm(), AS()
}

function clearSelectedBkm() {
    window.PENDING_MODAL_SCROLL = getModScroll(), [...bookmarks].map(e => resolveBkmId(e)).filter(Boolean).forEach(e => {
        var t = "COMBINED CHARACTERS" === e.items.TYPE;
        if ("SINGLE" === currentBkmTab && !t || "COMBINED" === currentBkmTab && t) {
            bookmarks.delete(String(e.bkmId));
            document.querySelectorAll(`button[data-bkm-btn="${e.bkmId}"]`).forEach(btn => {
                btn.style.color = "rgba(255,255,255,0.2)";
                var svg = btn.querySelector("svg");
                if (svg) svg.setAttribute("fill", "none")
            })
        }
    }), saveBkm(), openBkm(), document.querySelectorAll(".symbol-card").forEach(c => c.dataset.hash = ""), "function" == typeof renderVirtualGrid && window.renderVirtualGrid(), showToast("SINGLE" === currentBkmTab ? "SINGLE CLEARED" : "COMBINED CLEARED", "success")
}

function copyAllBkm() {
    var e = [...bookmarks].map(e => resolveBkmId(e)).filter(Boolean).filter(e => {
        var t = "COMBINED CHARACTERS" === e.items.TYPE;
        return "SINGLE" === currentBkmTab && !t || "COMBINED" === currentBkmTab && t
    }).map(e => e.title).join("");
    e ? copyText(e, "Bookmarks") : showToast("Nothing to copy", "error")
}

function openBkm() {
    switchModalView("bkmWrapper");
    var e = document.querySelector(".modal-header");
    if (e) e.style.display = "none";
    detailsModal.classList.add("show");
    var t = [...bookmarks].map(e => resolveBkmId(e)).filter(Boolean),
        o = "";
    var hasSingle = t.some(e => "COMBINED CHARACTERS" !== e.items.TYPE),
        hasCombined = t.some(e => "COMBINED CHARACTERS" === e.items.TYPE);
    var ab = $("bkmActionsBox"),
        tp = $("bkmTabsPanel"),
        tSingle = $("bkmTabSingle"),
        tCombined = $("bkmTabCombined");
    var btnH = $("bkmHtmlBtn"),
        btnE = $("bkmJsonExpBtn"),
        btnI = $("bkmJsonImpBtn");
    if (btnH) btnH.style.display = t.length === 0 ? "none" : "";
    if (btnE) btnE.style.display = t.length === 0 ? "none" : "";
    if (btnI) btnI.style.display = "";
    if (t.length === 0) {
        if (ab) ab.style.display = "flex";
        if (tp) tp.style.display = "none"
    } else if (hasSingle && !hasCombined) {
        currentBkmTab = "SINGLE";
        if (ab) ab.style.display = "flex";
        if (tp) tp.style.display = "block";
        if (tSingle) {
            tSingle.innerHTML = "SINGLE CHARACTERS";
            tSingle.style.display = "block";
            tSingle.style.flex = "none";
            tSingle.style.width = "100%"
        }
        if (tCombined) tCombined.style.display = "none"
    } else if (!hasSingle && hasCombined) {
        currentBkmTab = "COMBINED";
        if (ab) ab.style.display = "flex";
        if (tp) tp.style.display = "block";
        if (tCombined) {
            tCombined.innerHTML = "COMBINED CHARACTERS";
            tCombined.style.display = "block";
            tCombined.style.flex = "none";
            tCombined.style.width = "100%"
        }
        if (tSingle) tSingle.style.display = "none"
    } else {
        if (ab) ab.style.display = "flex";
        if (tp) tp.style.display = "block";
        if (tSingle) {
            tSingle.innerHTML = "SINGLE<br>CHARACTERS";
            tSingle.style.display = "block";
            tSingle.style.flex = "1";
            tSingle.style.width = "auto"
        }
        if (tCombined) {
            tCombined.innerHTML = "COMBINED<br>CHARACTERS";
            tCombined.style.display = "block";
            tCombined.style.flex = "1";
            tCombined.style.width = "auto"
        }
    }
    t.forEach(e => {
        var t = "COMBINED CHARACTERS" === e.items.TYPE;
        if ("SINGLE" === currentBkmTab && t) return;
        if ("COMBINED" === currentBkmTab && !t) return;
        var r = `window.bkmRawSearch('${escapeHTML(e.bkmId)}')`,
            n = e.sub ? `<span style="display:block; color:#FFA500; font-weight:bold; font-size:0.9rem; text-transform:uppercase;">${e.sub}</span>` : "";
        o += `<div class="detail-item" style="height:auto; display:flex; align-items:center; gap:10px; cursor:pointer" onclick="${r}"><span style="font-size:2rem; min-width:50px; text-align:center; flex-shrink:0">${e.title}</span><div style="flex:1; display:flex; flex-direction:column; min-width:0">${n}</div><button class="c-btn" style="font-size:1.5rem; flex-shrink:0" onclick="window.PENDING_MODAL_SCROLL=getModScroll(); tglBkm(event, '${e.bkmId}', null); openBkm();">&times;</button></div>`
    });
    $("bkmContent").innerHTML = o;
    var scb = $("bkmStickyClearBox");
    if (t.length > 0) {
        if (scb) scb.style.display = "block"
    } else {
        if (scb) scb.style.display = "none"
    }
    t.length === 0 ? ($("emptyBkmState").style.display = "flex", $("bkmContent").style.display = "none") : ($("emptyBkmState").style.display = "none", $("bkmContent").style.display = "flex"), updateTabStyles("bkmTabSingle", "bkmTabCombined", currentBkmTab);
    var r = document.querySelector(".modal-box");
    if (window.APP_S && window.APP_S["mb_bkmWrapper_" + currentBkmTab]) {
        r.scrollTop = window.APP_S["mb_bkmWrapper_" + currentBkmTab].t
    } else if (window.APP_S && window.APP_S["mb_bkmWrapper"]) {
        r.scrollTop = window.APP_S["mb_bkmWrapper"].t
    } else if (void 0 !== window.PENDING_MODAL_SCROLL) {
        r.scrollTop = window.PENDING_MODAL_SCROLL;
        window.PENDING_MODAL_SCROLL = void 0
    }
    setTimeout(() => {
        if (r && window.APP_S) {
            var k = "mb_bkmWrapper_" + currentBkmTab;
            if (window.APP_S[k]) r.scrollTop = window.APP_S[k].t;
            else if (window.APP_S["mb_bkmWrapper"]) r.scrollTop = window.APP_S["mb_bkmWrapper"].t
        }
    }, 50), setTimeout(() => {
        if (r && window.APP_S) {
            var k = "mb_bkmWrapper_" + currentBkmTab;
            if (window.APP_S[k]) r.scrollTop = window.APP_S[k].t;
            else if (window.APP_S["mb_bkmWrapper"]) r.scrollTop = window.APP_S["mb_bkmWrapper"].t
        }
    }, 150), AS()
}
window.toggleCacheToggles = function() {
    let e = document.getElementById("cacheTogglesContainer");
    e && (e.style.display = "none" === e.style.display || !e.style.display ? "flex" : "none")
};
window.executeCustomClearCache = function() {
    window.isClearing = !0;
    let e = document.getElementById("ccAppCacheCheck")?.checked,
        a = document.getElementById("ccSingleBkmCheck")?.checked,
        r = document.getElementById("ccCombinedBkmCheck")?.checked;
    let n = [];
    if (e) {
        let o = localStorage.getItem("glyphlab_search_mode");
        let tVals = {};
        ["hideUnrendered", "liveUpdateCheck", "wrapSearchCheck", "wrapDraftCheck", "wrapFontCheck", "expandFontCheck"].forEach(id => {
            tVals[id] = localStorage.getItem("glyphlab_toggle_" + id)
        });
        localStorage.clear();
        if (o) localStorage.setItem("glyphlab_search_mode", o);
        for (let id in tVals) {
            if (tVals[id] !== null) localStorage.setItem("glyphlab_toggle_" + id, tVals[id])
        }
        n.push(localforage.keys().then(t => {
            let c = [];
            t.forEach(t => {
                if (t.startsWith("C_") || "GLYPH_AUTO" === t || "GLYPH_FAB_STATE" === t) c.push(localforage.removeItem(t))
            });
            return Promise.all(c)
        }))
    }
    if (a || r) {
        let o = [];
        bookmarks.forEach(e => {
            let t = typeof resolveBkmId === "function" ? resolveBkmId(e) : null,
                i = t && t.items && "COMBINED CHARACTERS" === t.items.TYPE;
            if (i && r) o.push(e);
            if (!i && a) o.push(e)
        });
        o.forEach(e => bookmarks.delete(e)), n.push(localforage.setItem("GLYPH_BKM", [...bookmarks]))
    }
    Promise.all(n).then(() => {
        document.body.style.opacity = "0";
        setTimeout(() => location.reload(), 50)
    }).catch(() => {
        document.body.style.opacity = "0";
        setTimeout(() => location.reload(), 50)
    })
};
window._origResetDefaults = window.resetDefaults;
window.resetDefaults = function() {
    let e = document.getElementById("ccAppCacheCheck"),
        t = document.getElementById("ccSingleBkmCheck"),
        a = document.getElementById("ccCombinedBkmCheck");
    if (e) e.checked = !0;
    if (t) t.checked = !1;
    if (a) a.checked = !1;
    ["hideUnrendered", "liveUpdateCheck", "wrapSearchCheck", "wrapDraftCheck", "wrapFontCheck", "expandFontCheck"].forEach(id => {
        localStorage.removeItem("glyphlab_toggle_" + id)
    });
    if ("function" == typeof window._origResetDefaults) window._origResetDefaults();
    else if ("function" == typeof window.clearCacheAndReload) window.clearCacheAndReload()
};