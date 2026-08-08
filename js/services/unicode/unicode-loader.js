window.loadUnicodeData = async () => {
    let e = await localforage.getItem("UnicodeData");
    while (!e) await new Promise(r => setTimeout(r, 100)), e = await localforage.getItem("UnicodeData");
    var r = {
            L: "Left-to-Right",
            R: "Right-to-Left",
            AL: "Right-to-Left Arabic",
            EN: "European Number",
            ES: "European Separator",
            ET: "European Terminator",
            AN: "Arabic Number",
            CS: "Common Separator",
            NSM: "Nonspacing Mark",
            BN: "Boundary Neutral",
            B: "Paragraph Separator",
            S: "Segment Separator",
            WS: "Whitespace",
            ON: "Other Neutrals",
            LRE: "Left-to-Right Embedding",
            LRO: "Left-to-Right Override",
            RLE: "Right-to-Left Embedding",
            RLO: "Right-to-Left Override",
            PDF: "Pop Directional Format",
            LRI: "Left-to-Right Isolate",
            RLI: "Right-to-Left Isolate",
            FSI: "First Strong Isolate",
            PDI: "Pop Directional Isolate"
        },
        n = e.split("\n");
    let chunkSize = 2000;
    for (let i = 0; i < n.length; i += chunkSize) {
        let chunk = n.slice(i, i + chunkSize);
        for (let j of chunk) {
            var a = j.split(";");
            if (15 <= a.length) {
                var o = a[0].padStart(4, "0").toUpperCase(),
                    c = a[1];
                "<control>" === c && (c = a[10] || "Control Character " + o), unicodeNames[o] = c.toUpperCase();
                var u = {};
                a[3] && "0" !== a[3] && (u["COMBINING CLASS"] = a[3]), a[4] && (u["BIDI CLASS"] = (r[a[4]] || a[4]).toUpperCase()), a[5] && (u.DECOMPOSITION = a[5]), a[6] && (u["DECIMAL DIGIT VALUE"] = a[6]), a[7] && (u["DIGIT VALUE"] = a[7]), a[8] && (u["NUMERIC VALUE"] = a[8]), ("Y" === a[9] || "N" === a[9]) && (u.MIRRORED = "Y" === a[9] ? "YES" : "NO"), a[10] && a[10] !== c && (u["UNICODE 1.0 NAME"] = a[10]), a[11] && (u["ISO 10646 COMMENT"] = a[11]), a[12] && (u["UPPERCASE MAPPING"] = "U+" + a[12]), a[13] && (u["LOWERCASE MAPPING"] = "U+" + a[13]), a[14] && (u["TITLECASE MAPPING"] = "U+" + a[14]), 0 < Object.keys(u).length && (unicodeDetailsData[o] = u)
            }
        }
        await new Promise(res => setTimeout(res, 0))
    }
};