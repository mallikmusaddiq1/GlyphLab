const gSC = () => {
    for (;;) {
        var e = Math.floor(1114112 * Math.random());
        if (e >= 55296 && e <= 63743 || e >= 983040) continue;
        var t = (e >= 127744 && e <= 130047) || (e >= 9728 && e <= 10175) || (e >= 126976 && e <= 127231),
            o = (e >= 8192 && e <= 9727) || (e >= 10240 && e <= 10495) || (e >= 119040 && e <= 119295),
            a = (e >= 32 && e <= 751) || (e >= 880 && e <= 7423),
            n = (e >= 13312 && e <= 19903) || (e >= 19968 && e <= 40959) || (e >= 131072 && e <= 196607) || (e >= 44032 && e <= 55215) || (e >= 94208 && e <= 100351) || (e >= 73728 && e <= 82944);
        if (t) return e;
        else if (o) {
            if (Math.random() < .6) return e
        } else if (a) {
            if (Math.random() < .15) return e
        } else if (n) {
            if (Math.random() < .002) return e
        } else if (Math.random() < .02) return e
    }
};
window.toggleRandomMode = function() {
    window.generateRandomSymbols()
};
window.generateRandomSymbols = async function() {
    window.randomSessionId = (window.randomSessionId || 0) + 1;
    var curSession = window.randomSessionId;
    var t = document.getElementById("loadingMsg");
    t && (t.style.display = "flex");
    var nf = document.getElementById("notFoundMsg");
    nf && (nf.style.display = "none");
    if (typeof activeFilters !== "undefined") {
        activeFilters.clear();
    }
    if ("function" == typeof renderActiveFilters) {
        renderActiveFilters();
    }
    window.clearGrid && window.clearGrid();
    listData = [];
    currentBottomHex = MAX_UNICODE + 1;
    currentTopHex = 33;
    isFilterMode = !1;
    hlWord = !1;
    if (typeof scrollArea !== "undefined" && scrollArea) {
        scrollArea.scrollTop = 0;
    }
    var a = 0,
        n = hideCheckbox ? hideCheckbox.checked : true,
        s = new Set,
        isFirst = !0;
    while (listData.length < 10000 && a < 2e5) {
        if (curSession !== window.randomSessionId) break;
        var e = [];
        for (var c = 0; c < 1e3; c++) {
            var r = gSC();
            s.has(r) || (s.add(r), e.push(r))
        }
        window.getVisibilityBulk && await window.getVisibilityBulk(e);
        if (curSession !== window.randomSessionId) break;
        for (var p of e) {
            if (listData.length >= 10000) break;
            var v = visibilityCache.has(p) ? visibilityCache.get(p) : isVisible(p);
            n && 3 === v || listData.push({
                type: "cp",
                cp: p,
                hl: !1
            })
        }
        a += 1e3;
        t && (t.style.display = "none");
        "function" == typeof updateGridMetrics && window.updateGridMetrics();
        if (isFirst) {
            if (typeof scrollArea !== "undefined" && scrollArea) {
                scrollArea.scrollTop = 0;
            }
            isFirst = !1;
        }
        await new Promise(res => setTimeout(res, 0))
    }
    if (curSession === window.randomSessionId && t) t.style.display = "none"
};