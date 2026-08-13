var isExportingRange = false;

window.openRangeModal = function() {
    if (typeof switchModalView === "function") switchModalView("rangeWrapper");

    var uniModalTitle = document.getElementById("uniModalTitle");
    if (uniModalTitle) {
        uniModalTitle.innerHTML = '<svg width="20" height="20"><use href="#ic-exp"></use></svg> RANGE EXPORT';
        uniModalTitle.className = "modal-title md-title-custom";
        uniModalTitle.style.color = "#FFA500";
        uniModalTitle.style.display = "flex";
        uniModalTitle.style.alignItems = "center";
        uniModalTitle.style.gap = "6px";
    }

    var header = document.querySelector(".modal-header");
    if (header) header.style.display = "flex";

    var bkmIconSpan = document.getElementById("bkmIconSpan");
    if (bkmIconSpan) bkmIconSpan.style.display = "none";

    var unifiedModal = document.getElementById("unifiedModal");
    if (unifiedModal) unifiedModal.classList.add("show");

    if (typeof AS === "function") AS();
};

async function startRangeExport(e) {
    if (isExportingRange) return void showToast("Export already in progress!", "error");

    var t = document.getElementById("rangeStart").value.trim(),
        r = document.getElementById("rangeEnd").value.trim();

    if (!t || !r) return void showToast("Enter Start & End Hex", "error");

    var a = parseInt(t, 16),
        o = parseInt(r, 16);

    if (isNaN(a) || isNaN(o) || a > o || a < 0 || o > 1114111) return void showToast("Invalid Export Range", "error");

    isExportingRange = true;

    var n = document.querySelectorAll(".range-btn");
    toggleProgress("range", true);

    n.forEach(x => {
        x.style.opacity = "0.5";
        x.style.pointerEvents = "none";
    });

    showToast(`Background ${e.toUpperCase()} Export Started...`, "success");

    var i = [],
        l = "",
        s = o - a + 1,
        p = Date.now();

    if ("json" === e) {
        i.push(new Blob(['{\n  "SINGLE": {\n'], {
            type: "application/json"
        }));
        var _t = "",
            _r = true,
            _n = true;

        for (var g = a; g <= o; g++) {
            var c = buildDetObj_cp(g),
                m = getExpMeta(c).block;

            if (m !== _t) {
                if (!_r) l += "\n    ],\n";
                l += `    "${m}": [\n`;
                _t = m;
                _r = false;
                _n = true;
            }

            if (!_n) l += ",\n";
            l += "      " + JSON.stringify(c.items);
            _n = false;

            if (g % 250 !== 0 && g !== o) continue;

            i.push(new Blob([l], {
                type: "application/json"
            }));
            l = "";
            updateProgress("range", g - a + 1, s, p);
            await new Promise(x => setTimeout(x, 0));
        }
        i.push(new Blob(["\n    ]\n  }\n}"], {
            type: "application/json"
        }));
    } else if ("txt" === e) {
        var _t = "";
        for (var _r = a; _r <= o; _r++) {
            var _n = buildDetObj_cp(_r),
                g = getExpMeta(_n).block;

            if (_t !== g) {
                l += ("" !== _t ? "\n\n" : "") + `[ SINGLE - ${g} ]\n` + "=".repeat(g.length + 14) + "\n\n";
                _t = g;
            }

            var c = "=== " + _n.items.CHARACTER + " ===\n";
            for (var _e in _n.items) c += _e + ": " + _n.items[_e] + "\n";
            l += c + "\n";

            if (_r % 250 !== 0 && _r !== o) continue;

            i.push(new Blob([l], {
                type: "text/plain"
            }));
            l = "";
            updateProgress("range", _r - a + 1, s, p);
            await new Promise(x => setTimeout(x, 0));
        }
    }

    var gType = "json" === e ? "application/json" : "text/plain";
    triggerDownload(i, gType, `glyphlab_range_${t}_to_${r}.${e}`);

    showToast("Streaming Export Complete!", "success");
    isExportingRange = false;
    toggleProgress("range", false);

    n.forEach(x => {
        x.style.opacity = "1";
        x.style.pointerEvents = "auto";
    });
}

window.startRangeExport = startRangeExport;