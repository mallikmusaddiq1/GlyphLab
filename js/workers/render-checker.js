var useOC = "undefined" != typeof OffscreenCanvas,
    cvs = useOC ? new OffscreenCanvas(16, 16) : null,
    cx = cvs ? cvs.getContext("2d", {
        willReadFrequently: !0
    }) : null,
    empData, tData;
if (cx) {
    cx.font = "14px sans-serif";
    cx.textBaseline = "top";
    cx.clearRect(0, 0, 16, 16);
    empData = new Uint32Array(cx.getImageData(0, 0, 16, 16).data.buffer);
    cx.fillText(String.fromCodePoint(1114111), 0, 0);
    tData = new Uint32Array(cx.getImageData(0, 0, 16, 16).data.buffer)
}

function checkRenderStatus(e) {
    if (!cx || !e) return 1;
    cx.clearRect(0, 0, 16, 16);
    cx.fillText(e, 0, 0);
    let t = new Uint32Array(cx.getImageData(0, 0, 16, 16).data.buffer),
        a = !0,
        r = !0;
    for (let n = 0; n < 256; n++) {
        if (t[n] !== empData[n]) a = !1;
        if (t[n] !== tData[n]) r = !1;
        if (!a && !r) break
    }
    return r ? 3 : a ? 2 : 1
}

function filterUnrendered(e) {
    let t = [];
    for (let a = 0; a < e.length; a++) {
        if (e[a].char) {
            let r = checkRenderStatus(e[a].char);
            if (3 === r || 2 === r) continue
        }
        t.push(e[a])
    }
    return t
}