window.WORKER_READY = false;

var worker = typeof Worker !== "undefined" ? new Worker("./js/workers/worker.js") : null;

if (worker) {
    worker.addEventListener("message", e => {
        if (e.data && e.data.type === "SYSTEM_READY") {
            window.WORKER_READY = true;
        }
    });
}

var checkChunk = e => new Promise(t => {
    if (!worker || !window.WORKER_READY) {
        return t(e.map(hex => typeof isVisible === "function" ? isVisible(hex) : 1));
    }
    
    var r = Math.random(),
        n = ev => {
            if (ev.data.id === r) {
                worker.removeEventListener("message", n);
                t(ev.data.results);
            }
        };
    worker.addEventListener("message", n);
    worker.postMessage({ id: r, hexes: e });
});

async function getVisibilityBulk(e) {
    var t = e.filter(hex => !visibilityCache.has(hex));
    if (t.length > 0) {
        var r = await checkChunk(t);
        t.forEach((hex, i) => visibilityCache.set(hex, r[i]));
    }
}

function isVisible(e) {
    if (visibilityCache.has(e)) return visibilityCache.get(e);
    
    if (visibilityCache.size > 20000) visibilityCache.clear();
    
    if (e >= 55296 && e <= 57343) {
        visibilityCache.set(e, 3);
        return 3;
    }
    
    var t = String.fromCodePoint(e);
    if (" " === t) {
        visibilityCache.set(e, 2);
        return 2;
    }
    if (/[\u0000-\u001F\u007F-\u009F]/.test(t)) {
        visibilityCache.set(e, 3);
        return 3;
    }
    
    ctx.clearRect(0, 0, 16, 16);
    ctx.fillText(t, 0, 0);
    var r = new Uint32Array(ctx.getImageData(0, 0, 16, 16).data.buffer),
        n = true,
        i = true;
        
    for (var a = 0; a < 256; a++) {
        if (r[a] !== emptyData[a]) n = false;
        if (r[a] !== tofuData[a]) i = false;
        if (!n && !i) break;
    }
    
    var res = i ? 3 : n ? 2 : 1;
    visibilityCache.set(e, res);
    return res;
}
