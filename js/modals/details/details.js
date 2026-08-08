function rCat(e) {
    if (window.GC_DATA) {
        for (var k in window.GC_DATA) {
            var dt = window.GC_DATA[k].data;
            for (var i = 0; i < dt.length; i++) {
                var v = dt[i];
                if (typeof v === "number") {
                    if (e === v) return window.GC_DATA[k].f
                } else {
                    if (e >= v[0] && e <= v[1]) return window.GC_DATA[k].f
                }
            }
        }
    }
    if (e >= 55296 && e <= 57343) return "Surrogate Character";
    if ((e >= 57344 && e <= 63743) || (e >= 983040 && e <= 1048573) || (e >= 1048576 && e <= 1114109)) return "Private Use Character";
    if ((e & 65534) === 65534 || (e >= 64976 && e <= 65007)) return "Unassigned Character";
    return "Unassigned Character"
}

function resolveBkmId(id) {
    id = String(id);
    if (!id.includes('-') && /^\d+$/.test(id)) return buildDetObj_cp(parseInt(id, 10));
    if (COMBINED_CHARS[id]) return buildDetObj_combined(id, COMBINED_CHARS[id]);
    if (Array.from(id).length > 1) return buildDetObj_combined(id, "");
    return buildDetObj_cp(id.codePointAt(0))
}

function buildDetObj_cp(e) {
    var t = sFCP(e),
        a = toH(e).padStart(4, "0"),
        r = 65535 < e ? "0x" + toH(t.charCodeAt(0)).padStart(4, "0") + " 0x" + toH(t.charCodeAt(1)).padStart(4, "0") : "0x" + a,
        i = "0x" + toH(e).padStart(8, "0"),
        n = 65535 < e ? "\\U" + toH(e).padStart(8, "0") : "\\u" + a,
        o = Array.from((new TextEncoder).encode(t)).map(x => "\\x" + toH(x).padStart(2, "0")).join(""),
        l = getAdvFmt(t),
        s = getBlock(e);
    if (s) s = s.toUpperCase();
    var pageLink = window.location.origin + window.location.pathname + '?hex=' + a;
    var itms = {};
    var oN = unicodeNames[a];
    if (oN) itms["OFFICIAL NAME"] = oN;
    var octal = Array.from((new TextEncoder).encode(t)).map(x => "\\" + x.toString(8).padStart(3, "0")).join("");
    Object.assign(itms, {
        "TYPE": "SINGLE CHARACTERS",
        "BLOCK": s,
        "CHARACTER": t,
        "UNICODE HEX": "U+" + a,
        "DECIMAL CODE": e,
        "HTML DECIMAL": "&#" + e + ";",
        "HTML HEX": "&#x" + a + ";",
        "C / C++ / JAVA / PY": n,
        "CSS ESCAPE": "\\" + a,
        "JS / JSON ES6": "\\u{" + a + "}",
        "OCTAL ESCAPE": octal,
        "URL ENCODED": l.s,
        "BASE64 ENCODED": l.c,
        "PUNYCODE IDN": l.l,
        "UTF-8 BYTES": o,
        "UTF-8 BINARY": l.n,
        "UTF-16 HEX": r,
        "UTF-32 HEX": i
    });
    if (unicodeDetailsData[a]) Object.assign(itms, unicodeDetailsData[a]);
    itms["GENERAL CATEGORY"] = rCat(e);
    if (itms["UNICODE 1.0 NAME"]) itms["UNICODE 1.0 NAME"] = itms["UNICODE 1.0 NAME"].toUpperCase();
    itms["PERMALINK"] = pageLink;
    return {
        bkmId: e,
        baseHex: a,
        title: t,
        sub: s,
        items: itms
    }
}

function buildDetObj_combined(str, name) {
    var cps = Array.from(str).map(x => x.codePointAt(0)),
        a = sFCP(...cps),
        r = cps.map(x => "U+" + toH(x).padStart(4, "0")).join(" "),
        i = getAdvFmt(a);
    var items = {};
    var oN = COMBINED_CHARS[str] || name;
    if (oN) items["OFFICIAL NAME"] = oN.toUpperCase();
    var catBlock = COMBINED_CAT_MAP[str] || "";
    if (catBlock) catBlock = catBlock.toUpperCase();
    items["TYPE"] = "COMBINED CHARACTERS";
    if (catBlock) items["BLOCK"] = catBlock;
    items["CHARACTER"] = a;
    items["SEQUENCE HEX"] = r;
    cps.forEach((x, idx) => {
        items["PART " + (idx + 1)] = sFCP(x) + " U+" + toH(x).padStart(4, "0") + ""
    });
    items["HTML DECIMAL"] = cps.map(x => "&#" + x + ";").join("");
    items["HTML HEX"] = cps.map(x => "&#x" + toH(x).padStart(4, "0") + ";").join("");
    items["JS / JSON ES6"] = cps.map(x => "\\u{" + toH(x).padStart(4, "0") + "}").join("");
    items["URL ENCODED"] = i.s;
    items["BASE64 ENCODED"] = i.c;
    items["PUNYCODE IDN"] = i.l;
    items["UTF-8 BINARY"] = i.n;
    return {
        bkmId: str,
        baseHex: toH(cps[0]).padStart(4, "0"),
        title: a,
        sub: catBlock,
        items
    }
}

function getDetailRow(e, t, a) {
    var r;
    return "N/A" === t ? "" : (a = String(a).replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/"/g, "&quot;"), r = escapeHTML(String(t)), `<div class="detail-item" onclick="copyText('${a}', '${e}')"><span class="detail-label det-lbl">${e}</span><span class="detail-val det-val">${r}</span></div>`)
}

function showDet(e) {
    detailsContent.innerHTML = e, switchModalView("detailsWrapper"), uniModalTitle.innerHTML = `<svg width="20" height="20"><use href="#ic-det"></use></svg> ADVANCED DETAILS`, uniModalTitle.className = "modal-title md-title-custom", document.querySelector(".modal-header").style.display = "flex", $("bkmIconSpan") && ($("bkmIconSpan").style.display = "none"), detailsModal.classList.add("show");
    var mb = document.querySelector(".modal-box");
    if (window.APP_S && window.APP_S["mb_detailsWrapper"]) mb.scrollTop = window.APP_S["mb_detailsWrapper"].t
}

function renderDetObj(obj) {
    currentDetailExportData = obj;
    var linkBtn = obj.items["PERMALINK"] ? `<button class="btn btn-purple" onclick="copyLink()">LINK</button>` : '';
    var html = `<style>.details-list-panel .det-val{white-space:nowrap!important;overflow-x:auto!important;scrollbar-width:none!important;-webkit-overflow-scrolling:touch;font-family:inherit!important;font-size:0.62rem!important;font-weight:800!important;color:#ffffff!important;}.details-list-panel .det-val::-webkit-scrollbar{display:none;}</style><div class="premium-panel details-actions-panel"><button class="btn copy-hex" onclick="exportSingle('html')">HTML</button><button class="btn btn-orange" onclick="expPNG()">PNG</button>${linkBtn}</div><div class="premium-panel details-hero-panel"><div class="md-t1">${obj.title}</div></div><div class="premium-panel details-list-panel">`;
    for (var k in obj.items) html += getDetailRow(k, obj.items[k], obj.items[k]);
    html += `</div>`;
    showDet(html)
}

function openDetails(e) {
    renderDetObj(buildDetObj_cp(e))
}

function openCombinedDetails(str, name) {
    renderDetObj(buildDetObj_combined(str, name))
}

function getAdvFmt(e) {
    return {
        s: safeEncode(encodeURIComponent, e),
        c: safeEncode(e => btoa(unescape(encodeURIComponent(e))), e),
        n: Array.from((new TextEncoder).encode(e)).map(e => e.toString(2).padStart(8, "0")).join(" "),
        l: safeEncode(e => {
            var t = new URL("http://" + e + ".com").hostname.replace(".com", "");
            return t !== e && t.startsWith("xn--") ? t : "N/A"
        }, e)
    }
}