var isExportingRange = !1;
async function startRangeExport(e) {
    if (isExportingRange) return void showToast("Export already in progress!", "error");
    var t = $("rangeStart").value.trim(),
        r = $("rangeEnd").value.trim();
    if (!t || !r) return void showToast("Enter Start & End Hex", "error");
    var a = parseInt(t, 16),
        o = parseInt(r, 16);
    if (isNaN(a) || isNaN(o) || a > o || a < 0 || o > 1114111) return void showToast("Invalid Export Range", "error");
    isExportingRange = !0;
    var n = document.querySelectorAll(".range-btn");
    toggleProgress("range", !0), n.forEach(x => {
        x.style.opacity = "0.5", x.style.pointerEvents = "none"
    }), showToast(`Background ${e.toUpperCase()} Export Started...`, "success");
    var i = [],
        l = "",
        s = o - a + 1,
        p = Date.now();
    if ("json" === e) {
        i.push(new Blob(['{\n  "SINGLE": {\n'], {
            type: "application/json"
        }));
        var _t = "",
            _r = !0,
            _n = !0;
        for (var g = a; g <= o; g++) {
            var c = buildDetObj_cp(g),
                m = getExpMeta(c).block;
            m !== _t && (_r || (l += "\n    ],\n"), l += `    "${m}": [\n`, _t = m, _r = !1, _n = !0), _n || (l += ",\n"), l += "      " + JSON.stringify(c.items), _n = !1, g % 250 != 0 && g !== o || (i.push(new Blob([l], {
                type: "application/json"
            })), l = "", updateProgress("range", g - a + 1, s, p), await new Promise(x => setTimeout(x, 0)))
        }
        i.push(new Blob(["\n    ]\n  }\n}"], {
            type: "application/json"
        }))
    } else if ("txt" === e) {
        var _t = "";
        for (var _r = a; _r <= o; _r++) {
            var _n = buildDetObj_cp(_r),
                g = getExpMeta(_n).block;
            _t !== g && (l += ("" !== _t ? "\n\n" : "") + `[ SINGLE - ${g} ]\n` + "=".repeat(g.length + 14) + "\n\n", _t = g);
            var c = "=== " + _n.items.CHARACTER + " ===\n";
            for (var _e in _n.items) c += _e + ": " + _n.items[_e] + "\n";
            l += c + "\n", _r % 250 != 0 && _r !== o || (i.push(new Blob([l], {
                type: "text/plain"
            })), l = "", updateProgress("range", _r - a + 1, s, p), await new Promise(x => setTimeout(x, 0)))
        }
    }
    var g = "json" === e ? "application/json" : "text/plain";
    triggerDownload(i, g, `glyphlab_range_${t}_to_${r}.${e}`), showToast("Streaming Export Complete!", "success"), isExportingRange = !1, toggleProgress("range", !1), n.forEach(x => {
        x.style.opacity = "1", x.style.pointerEvents = "auto"
    })
}