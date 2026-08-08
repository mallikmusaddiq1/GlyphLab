function expandUnicode(e) {
    if ("string" != typeof e) return [];
    let t = [];
    return e.split(",").forEach(e => {
        if (e = e.trim()) {
            let r = e.match(/^U\+([0-9A-Fa-f]{1,6})-U\+([0-9A-Fa-f]{1,6})$/i);
            if (r) {
                let o = parseInt(r[1], 16),
                    n = parseInt(r[2], 16);
                if (o <= n) {
                    for (let e = o; e <= n; e++) t.push(String.fromCodePoint(e));
                    return
                }
            }
            e = e.replace(/U\+([0-9A-Fa-f]{1,6})/gi, (e, t) => String.fromCodePoint(parseInt(t, 16))), e && t.push(e)
        }
    }), t
}