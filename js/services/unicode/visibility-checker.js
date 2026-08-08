var worker = "undefined" != typeof Worker ? new Worker("./js/workers/worker.js") : null,
    checkChunk = e => new Promise(t => {
        if (!worker) return void t(e.map(e => isVisible(e)));
        var r = Math.random(),
            n = e => {
                e.data.id === r && (worker.removeEventListener("message", n), t(e.data.results))
            };
        worker.addEventListener("message", n), worker.postMessage({
            id: r,
            hexes: e
        })
    });
async function getVisibilityBulk(e) {
    var t = e.filter(e => !visibilityCache.has(e));
    if (0 < t.length) {
        var r = await checkChunk(t);
        t.forEach((e, t) => visibilityCache.set(e, r[t]))
    }
}

function isVisible(e) {
    if (visibilityCache.has(e)) return visibilityCache.get(e);
    if (1e4 < visibilityCache.size && visibilityCache.clear(), 55296 <= e && e <= 57343) return visibilityCache.set(e, 3), 3;
    var t = sFCP(e);
    if (" " === t) return visibilityCache.set(e, 2), 2;
    if (/[\u0000-\u001F\u007F-\u009F]/.test(t)) return visibilityCache.set(e, 3), 3;
    ctx.clearRect(0, 0, 16, 16), ctx.fillText(t, 0, 0);
    var r = new Uint32Array(ctx.getImageData(0, 0, 16, 16).data.buffer),
        n = !0,
        i = !0;
    for (var a = 0; a < 256 && (r[a] !== emptyData[a] && (n = !1), r[a] !== tofuData[a] && (i = !1), n || i); a++);
    return t = i ? 3 : n ? 2 : 1, visibilityCache.set(e, t), t
}