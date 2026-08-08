self.addEventListener("message", function(e) {
    let t = e.data;
    let {
        id: r,
        hexes: o
    } = t;
    if (r && o) {
        let n = [];
        if (!cx) return void self.postMessage({
            id: r,
            results: o.map(() => 1)
        });
        for (let a = 0; a < o.length; a++) {
            let s = o[a];
            if (s >= 55296 && s <= 57343) {
                n.push(3);
                continue
            }
            let i = String.fromCodePoint(s);
            if ("­" === i) {
                n.push(2);
                continue
            }
            if (/[\u0000-\u001F\u007F-\u009F]/.test(i)) {
                n.push(3);
                continue
            }
            n.push(checkRenderStatus(i))
        }
        self.postMessage({
            id: r,
            results: n
        })
    }
});