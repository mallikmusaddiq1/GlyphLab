var gCD = async (u, j = !0) => {
    let c = await localforage.getItem("C_" + u);
    if (c) return c;
    let r = await fetch(u),
        d = j ? await r.json() : await r.text();
    return localforage.setItem("C_" + u, d), d
};