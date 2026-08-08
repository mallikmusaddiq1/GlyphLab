function buildCardHTML(e, t, a = !1) {
    var r = getExpMeta(e),
        l = JSON.stringify(e.items).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"),
        i = '<div class="card" id="card-' + t + '" data-type="' + r.type + '" data-block="' + r.block.replace(/"/g, "&quot;") + '" data-idx="' + r.idx + '" data-json="' + l + '" data-title="' + e.title.replace(/"/g, "&quot;") + '" data-sub="' + (e.sub || "") + '" data-basehex="' + e.baseHex + '" style="position:relative;"><button class="menu-btn" onclick="tM(' + t + ')" style="position:absolute; top:15px; left:15px; background:none; border:none; color:#FFD700; font-size:1.5rem; cursor:pointer;">&#8942;</button><div class="menu-dropdown" id="m-' + t + '" style="display:none; position:absolute; top:45px; left:15px; background:#111111; border:1px solid rgba(255,215,0,0.2); border-radius:8px; padding:8px; flex-direction:column; gap:5px; z-index:10; box-shadow:0 5px 15px rgba(0,0,0,0.8);"><button onclick="dLS(' + t + ', \'json\')" style="background:none; border:none; color:#fff; cursor:pointer; text-align:left; padding:5px 10px; font-size:0.8rem; border-radius:4px;">Export JSON</button><button onclick="dLS(' + t + ', \'txt\')" style="background:none; border:none; color:#fff; cursor:pointer; text-align:left; padding:5px 10px; font-size:0.8rem; border-radius:4px;">Export TXT</button>';
    a || (i += '<button onclick="dLPNG(' + t + ')" style="background:none; border:none; color:#fff; cursor:pointer; text-align:left; padding:5px 10px; font-size:0.8rem; border-radius:4px;">Export PNG</button>');
    i += '</div><div class="main-sym">' + e.title + '</div><div class="sub-title" style="visibility:hidden;">&nbsp;</div>';
    for (var prop in e.items) {
        var val = String(e.items[prop]),
            valHtml = val.startsWith("http") ? '<a href="' + val + '" target="_blank">' + escapeHTML(val) + '</a>' : escapeHTML(val),
            cp = val.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/"/g, "&quot;");
        i += '<div class="row" onclick="cpTxt(\'' + cp + '\', this)" style="cursor:pointer;" title="Tap to copy"><span class="lbl">' + prop + '</span><span class="val">' + valHtml + '</span></div>'
    }
    return i += '</div>', i
}

function generateExportContent(e, t) {
    if ("json" === t || "txt" === t) {
        var a = {
            SINGLE: {},
            COMBINED: {}
        };
        if (e.forEach(e => {
                var t = getExpMeta(e);
                a[t.type][t.block] || (a[t.type][t.block] = []);
                a[t.type][t.block].push(e.items)
            }), 0 === Object.keys(a.SINGLE).length && delete a.SINGLE, 0 === Object.keys(a.COMBINED).length && delete a.COMBINED, "json" === t) return JSON.stringify(a, null, 2);
        var r = "";
        for (var k1 in a) {
            for (var k2 in a[k1]) {
                r += "\n\n[ " + k1 + " - " + k2 + " ]\n";
                r += "=".repeat(k1.length + k2.length + 7) + "\n\n";
                a[k1][k2].forEach(e => {
                    var t = "=== " + e.CHARACTER + " ===\n";
                    for (var prop in e) t += prop + ": " + e[prop] + "\n";
                    r += t
                })
            }
        }
        return r.trim()
    }
    if ("html" === t) {
        var cards = e.map((e, t) => buildCardHTML(e, t, !1)).join("");
        return getHTMLHeader() + cards + getHTMLFooter(!1)
    }
}