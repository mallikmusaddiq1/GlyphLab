window.RAW_MATCH_START = -1;
window.RAW_MATCH_END = -1;
window.LAST_RAW_QUERY = "";
window.LAST_LIST_LEN = -1;

function updateGridMetrics() {
    if (!gridElement) return;
    var w = gridElement.clientWidth;
    if (w === 0) w = window.innerWidth - (window.innerWidth <= 600 ? 20 : 80);
    gridCols = window.innerWidth <= 600 ? 3 : mMx(1, mF((w + GAP) / (130 + GAP)));
    itemWidth = (w - (gridCols - 1) * GAP) / gridCols;
    itemHeight = 1.48 * itemWidth;
    var rows = mC(listData.length / gridCols);
    gridElement.style.height = rows * (itemHeight + GAP) + "px";
    window.renderVirtualGrid && window.renderVirtualGrid()
}

function getCardHTML(e) {
    var t, a, r, i, n, o, l, bId;
    if ("cp" === e.type) {
        var s = toH(e.cp).padStart(4, "0");
        t = `&#${e.cp};`, a = "U+" + s, l = "Click to append to draft", r = `data-action="details" data-cp="${e.cp}"`, n = `data-cp="${e.cp}" data-type="Symbol"`, o = `data-str="${s}" data-type="Hex"`, i = `data-cp="${e.cp}"`, bId = e.cp
    } else if ("combined" === e.type) {
        t = e.str;
        var displayName = COMBINED_CHARS[e.str] ? COMBINED_CHARS[e.str].toUpperCase() : "";
        a = displayName ? `<div class="symbol-hex" title="${displayName}">${displayName}</div>` : `<div class="symbol-hex"></div>`;
        l = `Add ${displayName||"COMBINED CHARACTER"} to draft`, r = `data-action="combinedDetails" data-str="${e.str}" data-name="${displayName}"`, n = `data-str="${t}" data-type="Symbol"`;
        var cps = Array.from(t).map(x => "U+" + toH(x.codePointAt(0)).padStart(4, "0"));
        o = `data-str="${cps.join(" ")}" data-type="Hex"`, i = `data-str="${t}"`, bId = e.str
    } else {
        return ""
    }
    var isB = bookmarks.has(String(bId)),
        stC = isB ? '#FFD700' : 'rgba(255,255,255,0.2)',
        stBtn = `<button data-bkm-btn="${bId}" class="bkm-btn-style" style="color:${stC}" onclick="tglBkm(event, '${bId}', this)"><svg width="18" height="18" viewBox="0 0 24 24" fill="${isB?'currentColor':'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg></button>`;
    return `${stBtn}<div class="symbol-char-container" title="${l}" data-action="draft" ${i}><div class="symbol-char" aria-hidden="true">${t}</div></div>${"combined"===e.type?a:`<div class="symbol-hex">${a}</div>`}<div class="copy-actions"><button class="copy-btn copy-details" ${r} aria-label="Details">DETAILS</button><div class="sym-hex-row"><button class="copy-btn copy-sym" data-action="copy" ${n} aria-label="Copy symbol">SYM</button><button class="copy-btn copy-hex" data-action="copy" ${o} aria-label="Copy hex code">HEX</button></div></div>`
}
window.renderVirtualGrid = function() {
    if (typeof currentSearchMode !== "undefined" && currentSearchMode !== "smart" && window.ACTIVE_RAW_QUERY) {
        let q = window.ACTIVE_RAW_QUERY.trim();
        if (q !== window.LAST_RAW_QUERY || listData.length !== window.LAST_LIST_LEN) {
            window.LAST_RAW_QUERY = q;
            window.LAST_LIST_LEN = listData.length;
            window.RAW_MATCH_START = -1;
            window.RAW_MATCH_END = -1;
            let expSeq = [];
            let segs = Array.from(new Intl.Segmenter(void 0, {
                granularity: "grapheme"
            }).segment(q)).map(r => r.segment);
            for (let s of segs) {
                let p = Array.from(s);
                if (p.length > 1) {
                    expSeq.push(s);
                    expSeq.push(...p)
                } else {
                    expSeq.push(s)
                }
            }
            if (expSeq.length > 0) {
                for (let i = 0; i <= listData.length - expSeq.length; i++) {
                    let match = !0;
                    for (let j = 0; j < expSeq.length; j++) {
                        let it = listData[i + j],
                            cS = it.str ? it.str : (it.cp ? String.fromCodePoint(it.cp) : "");
                        if (cS !== expSeq[j]) {
                            match = !1;
                            break
                        }
                    }
                    if (match) {
                        window.RAW_MATCH_START = i;
                        window.RAW_MATCH_END = i + expSeq.length - 1;
                        break
                    }
                }
            }
        }
    }
    if (gridCols && scrollArea && gridElement) {
        for (var t = mMx(0, scrollArea.getBoundingClientRect().top - gridElement.getBoundingClientRect().top), a = scrollArea.clientHeight, a = (t = mMx(0, mF(t / (itemHeight + GAP)))) + mC(a / (itemHeight + GAP)) + 1, r = t * gridCols, i = (t = mMn(listData.length, a * gridCols)) - r; cardPool.length < i;) {
            var e = document.createElement("div");
            e.className = "symbol-card", e.style.position = "absolute", e.style.display = "none", cardPool.push(e), gridElement.appendChild(e)
        }
        if (t >= listData.length - 3 * gridCols && !isFetching && (isFilterMode ? 0 < pendingFilterItems.length && window.discoverFilterBatch(100) : currentBottomHex <= MAX_UNICODE && window.discoverBatch(100)), !isJumping && liveUpdateCheck && liveUpdateCheck.checked && jumpHex && jumpDec && document.activeElement !== jumpHex && document.activeElement !== jumpDec && (a = mF(mMx(0, scrollArea.getBoundingClientRect().top - gridElement.getBoundingClientRect().top + 80) / (itemHeight + GAP)) * gridCols, listData[a])) {
            var curItem = null;
            "cp" === listData[a].type ? curItem = listData[a].cp : "combined" === listData[a].type && (curItem = listData[a].str.codePointAt(0)), null !== curItem && (jumpHex.value = toH(curItem).padStart(4, "0"), jumpDec.value = curItem.toString(10))
        }
        var activeIdx = mF(mMx(0, scrollArea.getBoundingClientRect().top - gridElement.getBoundingClientRect().top + 80) / (itemHeight + GAP)) * gridCols;
        for (var c = 0; c < cardPool.length; c++) {
            var n, o, l = cardPool[c],
                origS = r + c,
                s = origS;
            if (c < i && s < listData.length) {
                n = listData[s];
                o = mF(s / gridCols);
                s = s % gridCols * (itemWidth + GAP);
                o *= itemHeight + GAP;
                l.style.left = s + "px";
                l.style.top = o + "px";
                l.style.width = itemWidth + "px";
                l.style.height = itemHeight + "px";
                l.style.display = "flex";
                s = n.type + "_" + (n.str || n.cp || n.code || n.name);
                if (l.dataset.hash !== s) {
                    l.dataset.hash = s;
                    l.innerHTML = getCardHTML(n)
                }
                l.classList.remove("thin-golden-border", "normal-white-card", "normal-golden-card", "medium-white-glowing-card", "medium-golden-glow-card", "thick-golden-glowing-card");
                if (origS === activeIdx) {
                    l.classList.add("thin-golden-border")
                }
                if (typeof currentSearchMode !== "undefined" && currentSearchMode !== "smart" && window.ACTIVE_RAW_QUERY) {
                    let cS = n.str ? n.str : (n.cp ? String.fromCodePoint(n.cp) : "");
                    if (origS >= window.RAW_MATCH_START && origS <= window.RAW_MATCH_END && window.getRawSearchCardClass && cS) {
                        let rC = window.getRawSearchCardClass(cS, window.ACTIVE_RAW_QUERY);
                        if (rC) l.classList.add(rC)
                    }
                } else if (n.cardClass) {
                    l.classList.add(n.cardClass)
                }
            } else {
                l.style.display = "none";
                l.dataset.hash = ""
            }
        }
    }
};
window.discoverBatch = async function(r = 100) {
    if (isFetching) return;
    isFetching = !0;
    var e = ++currentFetchId,
        t = 0,
        a = 0;
    while (t < r && currentBottomHex <= MAX_UNICODE && a < 10000) {
        if (e !== currentFetchId) return void(isFetching = !1);
        var chunk = [];
        for (var i = 0; i < 100 && (currentBottomHex + i) <= MAX_UNICODE; i++) {
            if (!visibilityCache.has(currentBottomHex + i)) chunk.push(currentBottomHex + i)
        }
        if (chunk.length > 0) await getVisibilityBulk(chunk);
        for (var i = 0; i < 100; i++) {
            if (e !== currentFetchId) return void(isFetching = !1);
            if (t >= r || currentBottomHex > MAX_UNICODE) break;
            var h = currentBottomHex,
                v = visibilityCache.get(h) || isVisible(h);
            if (!(hideCheckbox && hideCheckbox.checked && v === 3)) {
                listData.push({
                    type: "cp",
                    cp: h
                });
                t++
            }
            currentBottomHex++;
            a++
        }
        await new Promise(res => requestAnimationFrame(res))
    }
    if (e === currentFetchId) {
        updateGridMetrics();
        isFetching = !1
    }
};
window.clearGrid = function() {
    currentFetchId++, listData = [], isFetching = !1;
    if (gridElement) gridElement.style.height = "0px";
    if (scrollArea) scrollArea.scrollTop = 0
};
window.discoverFilterBatch = async function(r = 100) {
    if (isFetching) return;
    isFetching = !0;
    var e = currentFetchId,
        t = 0,
        a = 0;
    while (t < r && pendingFilterItems.length > 0 && a < 100000) {
        if (e !== currentFetchId) return void(isFetching = !1);
        var chunk = pendingFilterItems.slice(0, 100).filter(i => i.type === 'cp').map(i => i.cp);
        if (chunk.length > 0) await getVisibilityBulk(chunk);
        for (var i = 0; i < 100; i++) {
            if (e !== currentFetchId) return void(isFetching = !1);
            if (t >= r || pendingFilterItems.length === 0) break;
            var item = pendingFilterItems.shift(),
                v = item.type === 'cp' ? (visibilityCache.get(item.cp) || isVisible(item.cp)) : 1;
            if (item.type === 'cp' && (hideCheckbox && hideCheckbox.checked && v === 3)) {} else {
                listData.push(item);
                t++
            }
            a++
        }
        await new Promise(res => requestAnimationFrame(res))
    }
    if (e === currentFetchId) {
        updateGridMetrics();
        isFetching = !1
    }
};
window.addEventListener("resize", updateGridMetrics);
if (gridElement) {
    gridElement.addEventListener("click", e => {
        (e = e.target.closest("[data-action]")) && ("draft" === (e = e.dataset).action ? window.appendToDraft && window.appendToDraft(e.cp ? sFCP(e.cp) : e.str) : "details" === e.action ? "function" == typeof openDetails && openDetails(Number(e.cp)) : "combinedDetails" === e.action ? "function" == typeof openCombinedDetails && openCombinedDetails(e.str, e.name) : "copy" === e.action && copyText(e.cp ? sFCP(e.cp) : e.str, e.type))
    })
};
if (jumpHex) {
    jumpHex.addEventListener("input", () => {
        var e = parseInt(jumpHex.value.replace(/^(U\+|0x)/i, ""), 16);
        isNaN(e) || e > MAX_UNICODE || (jumpDec.value = e.toString(10))
    })
};
if (jumpDec) {
    jumpDec.addEventListener("input", () => {
        var e = parseInt(jumpDec.value, 10);
        isNaN(e) || e > MAX_UNICODE || (jumpHex.value = toH(e).padStart(4, "0"))
    })
};