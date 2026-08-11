function getExpMeta(e) {
    var t = "COMBINED CHARACTERS" === e.items.TYPE,
        a = t ? "COMBINED" : "SINGLE",
        r = e.items["BLOCK"] || e.items["CATEGORY BLOCK"],
        l = r && "UNKNOWN BLOCK" !== r.toUpperCase() ? r : "UNKNOWN",
        i = 0;
    if ("UNKNOWN" !== l) {
        if (t) {
            var o = Object.keys(COMBINED_GROUPS).findIndex(function(e) {
                return e.toUpperCase() === l.toUpperCase();
            });
            if (o >= 0) i = o + 1;
        } else {
            var n = U_BLOCKS.findIndex(function(e) {
                return e[2].toUpperCase() === l.toUpperCase();
            });
            if (n >= 0) i = n + 1;
        }
    }
    return {
        type: a,
        block: l,
        idx: i
    };
}

function copyLink() {
    var e = window.location.origin + window.location.pathname + "?hex=" + currentDetailExportData.baseHex;
    copyText(e, "Link");
}