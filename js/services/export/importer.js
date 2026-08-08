var isBkmProcessing = !1;

function impBkmJ() {
    if (isBkmProcessing) return showToast("Process running!", "error");
    var e = document.createElement("input");
    e.type = "file";
    e.accept = ".json";
    e.onchange = e => {
        var t = e.target.files[0];
        if (!t) return;
        var a = new FileReader;
        a.onload = async e => {
            try {
                var a = JSON.parse(e.target.result),
                    r = [];

                function l(e) {
                    Array.isArray(e) ? e.forEach(e => {
                        e.CHARACTER || e["DECIMAL CODE"] || e["COMBINED HEX"] || e["SEQUENCE HEX"] ? r.push(e) : l(e)
                    }) : e && "object" == typeof e && Object.values(e).forEach(l)
                }
                l(a);
                isBkmProcessing = !0;
                showToast("Importing Bookmarks...", "success");
                toggleProgress("bkm", !0);
                var i = r.length,
                    o = Date.now();
                for (var n = 0; n < i; n++) {
                    var s = r[n];
                    if (s["DECIMAL CODE"]) bookmarks.add(String(s["DECIMAL CODE"]));
                    else if (s.CHARACTER && !s["DECIMAL CODE"]) bookmarks.add(String(s.CHARACTER));
                    else if (s["COMBINED HEX"]) {
                        var c = s["COMBINED HEX"].replace(/U\+/g, "").split(" ");
                        bookmarks.add(`${parseInt(c[0],16)}-${parseInt(c[1],16)}`)
                    } else if (s["SEQUENCE HEX"]) {
                        var h = s["SEQUENCE HEX"].replace(/U\+/g, "").split(" ").map(e => e.toLowerCase());
                        bookmarks.add(h.join("-"))
                    }
                    n % 250 != 0 && n !== i - 1 || (updateProgress("bkm", n + 1, i, o), await new Promise(e => setTimeout(e, 0)))
                }
                localforage.setItem("GLYPH_BKM", [...bookmarks]);
                "function" == typeof openBkm && openBkm();
                AS();
                showToast("Imported!", "success")
            } catch (e) {
                showToast("Invalid JSON", "error")
            } finally {
                isBkmProcessing = !1;
                toggleProgress("bkm", !1)
            }
        };
        a.readAsText(t)
    };
    e.click()
}