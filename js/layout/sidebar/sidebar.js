window.AppConfig = {
    storeKey: "GLYPH_USER_SETTINGS",
    settings: [{
        id: "searchMode",
        type: "options",
        label: "SEARCH MODE",
        default: "smart",
        options: [{
            val: "smart",
            text: "SMART SEARCH",
            id: "btnSmartSearch"
        }, {
            val: "raw",
            text: "RAW<br>SEARCH",
            id: "btnRawSearch"
        }],
        action: e => {
            "function" == typeof setSearchMode && setSearchMode(e)
        }
    }, {
        id: "liveUpdateCheck",
        type: "toggle",
        label: "LIVE HEX UPDATE",
        default: !0,
        action: null
    }, {
        id: "hideUnrendered",
        type: "toggle",
        label: "HIDE UNRENDERED",
        default: !0,
        action: e => {
            let t = document.getElementById("btnRawSearch"),
                n = document.getElementById("charInput");
            t && t.classList.contains("active") && n && "" !== n.value.trim() ? "function" == typeof findChar && findChar() : "function" == typeof reloadFilters && reloadFilters()
        }
    }, {
        id: "desktopSiteCheck",
        type: "toggle",
        label: "DESKTOP SITE",
        default: !1,
        action: e => {
            let t = document.querySelector('meta[name="viewport"]');
            e ? (t && t.setAttribute("content", "width=1024"), document.cookie = "GLYPH_DESKTOP=true; max-age=31536000; path=/") : (t && t.setAttribute("content", "width=device-width,initial-scale=1,interactive-widget=resizes-content"), document.cookie = "GLYPH_DESKTOP=false; max-age=31536000; path=/")
        }
    }],
    state: {},
    renderInitial() {
        let e = document.getElementById("universalSettingsContainer");
        e && (e.innerHTML = "");
        let n = /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(navigator.userAgent),
            o = "ontouchstart" in window || navigator.maxTouchPoints > 0,
            a = !n && o;
        for (let l of this.settings) {
            let i = l.default;
            if ("desktopSiteCheck" === l.id) {
                let c = document.cookie.match(/(?:^|; )GLYPH_DESKTOP=([^;]*)/);
                i = c ? "true" === c[1] : a
            }
            this.state[l.id] = i;
            if (e)
                if ("toggle" === l.type) {
                    let r = document.createElement("label");
                    r.className = "toggle-switch", r.innerHTML = `<span class="toggle-label" style="color:var(--amber);flex:1;overflow-x:auto;white-space:nowrap;scrollbar-width:none;-webkit-overflow-scrolling:touch;margin-right:10px">${l.label}</span><input type="checkbox" id="${l.id}" ${i?"checked":""}><span class="slider"></span>`, r.querySelector("input").addEventListener("change", e => this.set(l.id, e.target.checked)), e.appendChild(r)
                } else if ("options" === l.type) {
                let s = document.createElement("div");
                s.className = "premium-panel", s.style.marginBottom = "8px", s.style.padding = "12px";
                let d = document.createElement("label");
                d.style.cssText = "color:var(--amber);font-weight:800;font-size:.8rem;letter-spacing:1px;margin-bottom:10px;display:block;text-align:center", d.innerHTML = l.label, s.appendChild(d);
                let m = document.createElement("div");
                m.style.cssText = "display:flex;gap:6px", l.options.forEach(e => {
                    let t = document.createElement("button");
                    t.id = e.id || `btn_${e.val}`, t.className = `search-mode-btn ${i===e.val?"active":""}`, t.innerHTML = e.text, t.onclick = () => {
                        Array.from(m.children).forEach(e => e.classList.remove("active")), t.classList.add("active"), this.set(l.id, e.val)
                    }, m.appendChild(t)
                }), s.appendChild(m), e.appendChild(s)
            }
            l.action && l.action(i)
        }
        window.hideCheckbox = document.getElementById("hideUnrendered"), window.liveUpdateCheck = document.getElementById("liveUpdateCheck")
    },
    async loadAsync() {
        let e = await localforage.getItem(this.storeKey);
        if (e)
            for (let t of this.settings)
                if (void 0 !== e[t.id]) {
                    this.state[t.id] = e[t.id];
                    let n = document.getElementById(t.id);
                    n && "toggle" === t.type && (n.checked = e[t.id]);
                    "options" === t.type && t.options.forEach(n => {
                        let o = document.getElementById(n.id || `btn_${n.val}`);
                        o && o.classList.toggle("active", n.val === e[t.id])
                    })
                }
    },
    async set(e, t) {
        this.state[e] = t;
        let n = this.settings.find(t => t.id === e);
        n && n.action && n.action(t), await localforage.setItem(this.storeKey, this.state)
    },
    async reset() {
        for (let e of this.settings) {
            this.state[e.id] = e.default;
            let t = document.getElementById(e.id);
            t && "toggle" === e.type && (t.checked = e.default), "options" === e.type && e.options.forEach(t => {
                let n = document.getElementById(t.id || `btn_${t.val}`);
                n && n.classList.toggle("active", t.val === e.default)
            }), e.action && e.action(e.default)
        }
        await localforage.setItem(this.storeKey, this.state), "function" == typeof showToast && showToast("Defaults Restored", "success")
    }
};

function clearCacheAndReload() {
    isClearing = !0, clearTimeout(ast), document.removeEventListener("input", AS), document.removeEventListener("change", AS), document.removeEventListener("click", AS), document.removeEventListener("scroll", AS, !0);
    let e = {
        i: {},
        s: {},
        ui: {},
        v: {
            tab: currentBkmTab,
            filterTab: "SINGLE"
        },
        f: "[]"
    };
    localforage.keys().then(t => {
        Promise.all(t.map(t => "GLYPH_BKM" !== t && "GLYPH_USER_SETTINGS" !== t && !t.startsWith("C_") ? localforage.removeItem(t) : Promise.resolve())).then(() => {
            localforage.setItem("GLYPH_AUTO", JSON.stringify(e)).then(() => {
                window.location.href = window.location.pathname
            })
        })
    })
}

function resetDefaults() {
    window.AppConfig.reset()
}

function appendToDraft(e) {
    var t = draftArea.selectionStart,
        n = draftArea.selectionEnd;
    draftArea.value = draftArea.value.substring(0, t) + e + draftArea.value.substring(n), draftArea.setSelectionRange(t + e.length, t + e.length)
}

function copyDraft() {
    var e = draftArea.value;
    e ? copyText(e, "Draft") : showToast("Draft is empty", "error")
}

function clearDraft() {
    draftArea.value = ""
}

function validateHex(e) {
    return /^[0-9A-Fa-f]{1,6}$/.test(e = e.replace(/^(U\+|0x)/i, "")) && 0 <= (e = parseInt(e, 16)) && e <= MAX_UNICODE ? e : null
}

function endJmp() {
    isJumping = !1, "function" == typeof renderVirtualGrid && renderVirtualGrid()
}

function jumpToHex() {
    var e = jumpHex.value.trim();
    null !== (e = validateHex("" === e ? "0021" : e)) ? (isJumping = !0, jumpHex.classList.remove("invalid"), jumpHex.value = toH(e).padStart(4, "0"), jumpDec.value = e.toString(10), "function" == typeof clearGrid && clearGrid(), activeFilters.clear(), "function" == typeof renderActiveFilters && renderActiveFilters(), isFilterMode = !1, hlWord = !1, currentTopHex = e, currentBottomHex = e, finishSearchJump(0)) : (jumpHex.classList.add("invalid"), showToast("Invalid Hex Code", "error"))
}

function toggleSidebar() {
    sidebar.classList.toggle("show")
}

function toggleToolbar() {
    var e = $("toolbarCollapsible"),
        t = $("toolbarToggleBtn");
    "none" === e.style.display || !e.style.display ? (e.style.display = "flex", t && (t.innerHTML = "\u25B2", t.setAttribute("aria-expanded", "true"))) : (e.style.display = "none", t && (t.innerHTML = "\u25BC", t.setAttribute("aria-expanded", "false"))), "function" == typeof updateGridMetrics && updateGridMetrics()
}
window.AppConfig.renderInitial(), window.AppConfig.loadAsync();