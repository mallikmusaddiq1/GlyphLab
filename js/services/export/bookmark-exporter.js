function exportSingle(e) {
    var t = generateExportContent([currentDetailExportData], e);
    triggerDownload([t], "json" === e ? "application/json" : "txt" === e ? "text/plain" : "text/html", "glyphlab_export_" + currentDetailExportData.baseHex + "." + e)
}
async function exportBkm(e) {
    if (isBkmProcessing) return showToast("Process running!", "error");
    var tArr = [...bookmarks];
    if (0 === tArr.length) return void showToast("No bookmarks to export", "error");
    isBkmProcessing = !0;
    toggleProgress("bkm", !0);
    showToast("Background " + e.toUpperCase() + " Export Started...", "success");
    var aLen = tArr.length,
        rStart = Date.now(),
        lItems = [];
    for (var bIdx = 0; bIdx < aLen; bIdx++) {
        var bObj = resolveBkmId(tArr[bIdx]);
        bObj && lItems.push(bObj);
        if (bIdx % 100 === 0 || bIdx === aLen - 1) {
            updateProgress("bkm", Math.floor((bIdx + 1) / aLen * 50), 100, rStart);
            await new Promise(res => setTimeout(res, 0))
        }
    }
    var bkmBlobs = [],
        outStr = "",
        nLen = lItems.length;
    rStart = Date.now();
    if ("html" === e) {
        bkmBlobs.push(new Blob([getHTMLHeader()], {
            type: "text/html"
        }));
        for (var tIdx = 0; tIdx < nLen; tIdx++) {
            outStr += buildCardHTML(lItems[tIdx], tIdx, !1);
            if (tIdx % 100 === 0 || tIdx === nLen - 1) {
                bkmBlobs.push(new Blob([outStr], {
                    type: "text/html"
                }));
                outStr = "";
                updateProgress("bkm", 50 + Math.floor((tIdx + 1) / nLen * 50), 100, rStart);
                await new Promise(res => setTimeout(res, 0))
            }
        }
        bkmBlobs.push(new Blob([getHTMLFooter(!1)], {
            type: "text/html"
        }))
    } else {
        var grp = {
            SINGLE: {},
            COMBINED: {}
        };
        lItems.forEach(el => {
            var meta = getExpMeta(el);
            grp[meta.type] || (grp[meta.type] = {});
            grp[meta.type][meta.block] || (grp[meta.type][meta.block] = []);
            grp[meta.type][meta.block].push(el.items)
        });
        if (Object.keys(grp.SINGLE || {}).length === 0) delete grp.SINGLE;
        if (Object.keys(grp.COMBINED || {}).length === 0) delete grp.COMBINED;
        if ("json" === e) {
            outStr = "{\n";
            var tKeys = Object.keys(grp),
                bCount = 0;
            for (var tkIdx = 0; tkIdx < tKeys.length; tkIdx++) {
                var tName = tKeys[tkIdx];
                outStr += '  "' + tName + '": {\n';
                var bKeys = Object.keys(grp[tName]);
                for (var bkIdx = 0; bkIdx < bKeys.length; bkIdx++) {
                    var bName = bKeys[bkIdx];
                    outStr += '    "' + bName + '": [\n';
                    var itemsArr = grp[tName][bName];
                    for (var itIdx = 0; itIdx < itemsArr.length; itIdx++) {
                        var strItem = JSON.stringify(itemsArr[itIdx], null, 2).split("\n").map((line, lIdx) => 0 === lIdx ? line : "      " + line).join("\n");
                        outStr += "      " + strItem + (itIdx < itemsArr.length - 1 ? ",\n" : "\n");
                        bCount++;
                        if (bCount % 100 === 0 || bCount === nLen) {
                            bkmBlobs.push(new Blob([outStr], {
                                type: "application/json"
                            }));
                            outStr = "";
                            updateProgress("bkm", 50 + Math.floor(bCount / nLen * 50), 100, rStart);
                            await new Promise(res => setTimeout(res, 0))
                        }
                    }
                    outStr += "    ]" + (bkIdx < bKeys.length - 1 ? "," : "") + "\n"
                }
                outStr += "  }" + (tkIdx < tKeys.length - 1 ? "," : "") + "\n"
            }
            outStr += "}";
            if (outStr.trim().length > 2) {
                bkmBlobs.push(new Blob([outStr], {
                    type: "application/json"
                }));
                outStr = ""
            }
        } else if ("txt" === e) {
            var bCount = 0;
            for (var tName in grp) {
                for (var bName in grp[tName]) {
                    outStr += "\n\n[ " + tName + " - " + bName + " ]\n";
                    outStr += "=".repeat(tName.length + bName.length + 7) + "\n\n";
                    var itemsArr = grp[tName][bName];
                    for (var itIdx = 0; itIdx < itemsArr.length; itIdx++) {
                        var strItem = "=== " + itemsArr[itIdx].CHARACTER + " ===\n";
                        for (var prop in itemsArr[itIdx]) {
                            strItem += prop + ": " + itemsArr[itIdx][prop] + "\n"
                        }
                        outStr += strItem;
                        bCount++;
                        if (bCount % 100 === 0 || bCount === nLen) {
                            bkmBlobs.push(new Blob([outStr], {
                                type: "text/plain"
                            }));
                            outStr = "";
                            updateProgress("bkm", 50 + Math.floor(bCount / nLen * 50), 100, rStart);
                            await new Promise(res => setTimeout(res, 0))
                        }
                    }
                }
            }
        }
        if (outStr.trim().length > 0) {
            bkmBlobs.push(new Blob([outStr], {
                type: "text/plain"
            }));
            outStr = ""
        }
    }
    var mime = "json" === e ? "application/json" : "txt" === e ? "text/plain" : "text/html";
    triggerDownload(bkmBlobs, mime, "glyphlab_bookmarks_all." + e);
    showToast("Streaming Export Complete!", "success");
    isBkmProcessing = !1;
    toggleProgress("bkm", !1)
}