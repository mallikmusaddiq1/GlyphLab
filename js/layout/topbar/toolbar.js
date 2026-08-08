window.executeRawSearch = function(e) {
    window.ACTIVE_RAW_QUERY = e;
    isJumping = true;
    if (typeof clearGrid === "function") clearGrid();
    isFilterMode = false;
    hlWord = true;
    let t = new Intl.Segmenter(void 0, {
            granularity: "grapheme"
        }),
        a = Array.from(t.segment(e)).map((e) => e.segment);
    listData = [];
    a.forEach((e) => {
        let t = Array.from(e);
        1 < t.length ? (listData.push({
            type: "combined",
            str: e,
            name: COMBINED_CHARS[e] || "",
            hl: "bold"
        }), t.forEach((e) => {
            listData.push({
                type: "cp",
                cp: e.codePointAt(0),
                hl: "normal"
            });
        })) : listData.push({
            type: "cp",
            cp: e.codePointAt(0),
            hl: "normal"
        });
    });
    if (0 !== listData.length) {
        let r = listData[0],
            n = "combined" === r.type ? r.str.codePointAt(0) : r.cp,
            o = listData[listData.length - 1],
            i = "combined" === o.type ? o.str.codePointAt(0) : o.cp;
        jumpHex && ((jumpHex.value = toH(n).padStart(4, "0")), jumpHex.classList.remove("invalid"));
        jumpDec && (jumpDec.value = n.toString(10));
        currentTopHex = n;
        currentBottomHex = i + 1;
        if (typeof window.finishSearchJump === "function") window.finishSearchJump(listData.length);
    }
};

window.jumpToHex = function() {
    window.ACTIVE_RAW_QUERY = "";
    let e = jumpHex ? jumpHex.value.trim() : "";
    null !== (e = typeof validateHex === "function" ? validateHex("" === e ? "0021" : e) : null) ? (!isFilterMode && !hlWord && listData.length > 0 && "cp" === listData[0].type && listData[0].cp === e ? (scrollArea && (scrollArea.scrollTop = 0), jumpHex && (jumpHex.classList.remove("invalid"), (jumpHex.value = toH(e).padStart(4, "0"))), jumpDec && (jumpDec.value = e.toString(10))) : ((isJumping = true), jumpHex && (jumpHex.classList.remove("invalid"), (jumpHex.value = toH(e).padStart(4, "0"))), jumpDec && (jumpDec.value = e.toString(10)), typeof clearGrid === "function" && clearGrid(), activeFilters.clear(), typeof renderActiveFilters === "function" && renderActiveFilters(), (isFilterMode = false), (hlWord = false), (currentTopHex = e), (currentBottomHex = e), typeof window.finishSearchJump === "function" && window.finishSearchJump(0))) : (jumpHex && jumpHex.classList.add("invalid"), typeof showToast === "function" && showToast("Invalid Hex Code", "error"));
};

window.findChar = function() {
    let e = charInput ? charInput.value.trim() : "",
        t = document.getElementById("notFoundMsg");
    if (!e) return (window.ACTIVE_RAW_QUERY = ""), t && (t.style.display = "none"), window.jumpToHex();
    if ("smart" === currentSearchMode) {
        window.ACTIVE_RAW_QUERY = "";
        isJumping = true;
        if (typeof clearGrid === "function") clearGrid();
        isFilterMode = true;
        hlWord = true;
        let a = document.getElementById("loadingMsg");
        t && (t.style.display = "none");
        a && (a.style.display = "flex");
        let fNames = Array.from(activeFilters.values()).map((x) => x.toLowerCase());
        return void worker.postMessage({
            type: "SMART_SEARCH",
            query: e,
            hideUnren: hideCheckbox && hideCheckbox.checked,
            activeFilters: fNames
        });
    }
    executeRawSearch(e);
};

if (worker) {
    worker.addEventListener("message", function(e) {
        if ("SEARCH_RESULTS" === e.data.type) {
            let t = e.data.results,
                a = document.getElementById("notFoundMsg"),
                r = document.getElementById("loadingMsg");
            if (r) r.style.display = "none";
            let n = charInput ? charInput.value.trim() : "";
            if (t && 0 < t.length) {
                if (a) a.style.display = "none";
                isFilterMode = false;
                hlWord = true;
                let o = t[0],
                    i = "combined" === o.type ? o.str.codePointAt(0) : o.cp,
                    l = t[t.length - 1],
                    d = "combined" === l.type ? l.str.codePointAt(0) : l.cp;
                jumpHex && ((jumpHex.value = toH(i).padStart(4, "0")), jumpHex.classList.remove("invalid"));
                jumpDec && (jumpDec.value = i.toString(10));
                currentFetchId++;
                listData = [...t];
                currentTopHex = i;
                currentBottomHex = d + 1;
                if (typeof window.finishSearchJump === "function") window.finishSearchJump(listData.length);
            } else {
                if (a) {
                    a.style.display = "block";
                    a.innerHTML = n ? `No results found for '<span style="color:#FFA500">${escapeHTML(n)}</span>'` : `No symbols found. Try adjusting your search.`;
                }
                listData = [];
                pendingFilterItems = [];
                if (typeof clearGrid === "function") clearGrid();
                if (typeof updateGridMetrics === "function") updateGridMetrics();
                if (typeof window.endJmp === "function") window.endJmp();
            }
        }
    });
}

document.addEventListener("input", function(e) {
    e.target && "charInput" === e.target.id && 0 === e.target.value.trim().length && "function" == typeof window.findChar && window.findChar();
});