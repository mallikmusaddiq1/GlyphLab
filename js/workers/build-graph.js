var mGraph = new Map,
    dbReady = !1,
    blockSet = new Set,
    gencatSet = new Set,
    combinedSet = new Set;

async function buildGraph() {
    try {
        let unicodeText = await localforage.getItem("UnicodeData");
        if (!unicodeText) {
            unicodeText = await fetch("../../data/UnicodeData.txt", {
                cache: "force-cache"
            }).then(e => e.text());
            await localforage.setItem("UnicodeData", unicodeText);
        }
        let datasetsObj = await localforage.getItem("datasets");
        if (!datasetsObj) {
            datasetsObj = await fetch("../../data/datasets.json", {
                cache: "force-cache"
            }).then(e => e.json());
            await localforage.setItem("datasets", datasetsObj);
        }
        let e = {
                status: "fulfilled",
                value: unicodeText
            },
            r = {
                status: "fulfilled",
                value: datasetsObj
            };
        if ("fulfilled" === e.status)
            for (let i of e.value.split("\n")) {
                if (!i) continue;
                let l = i.split(";");
                if (l.length < 2) continue;
                let u = l[0],
                    c = parseInt(u, 16),
                    h = l[1] ? l[1].toUpperCase() : "";
                try {
                    mGraph.set(u, {
                        type: "cp",
                        cp: c,
                        char: String.fromCodePoint(c),
                        name: h,
                        origName: l[1] || "",
                        tags: [],
                        keywords: [],
                        annotations: [],
                        isCustom: !1
                    });
                } catch (f) {}
            }
        if ("fulfilled" === r.status && r.value) {
            let fontsData = r.value.fonts;
            if (fontsData) {
                let p = new Intl.Segmenter(void 0, {
                    granularity: "grapheme"
                });
                for (let [d, m] of Object.entries(fontsData)) {
                    if ("object" != typeof m || null === m) continue;
                    for (let [E, I] of Object.entries(m)) {
                        if (!I) continue;
                        let capStr = Array.isArray(I.fontCapital) ? String.fromCodePoint(...I.fontCapital) : (I.fontCapital || ""),
                            smlStr = Array.isArray(I.fontSmall) ? String.fromCodePoint(...I.fontSmall) : (I.fontSmall || ""),
                            numStr = Array.isArray(I.fontNumber) ? String.fromCodePoint(...I.fontNumber) : (I.fontNumber || ""),
                            A = capStr + smlStr + numStr,
                            T = Array.from(p.segment(A)).map(e => e.segment);
                        for (let y of T) {
                            let C = Array.from(y).map(e => e.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")).join("-");
                            if (C.includes("-")) continue;
                            mGraph.has(C) || mGraph.set(C, {
                                type: "cp",
                                cp: parseInt(C, 16),
                                char: y,
                                str: y,
                                name: (E + " Character").toLowerCase(),
                                origName: E,
                                tags: [],
                                keywords: [],
                                annotations: [],
                                isCustom: !0
                            });
                            let g = mGraph.get(C);
                            g.tags.push("fonts", d.toLowerCase(), E.toLowerCase());
                            g.keywords.push(...d.toLowerCase().split(" "), ...E.toLowerCase().split(" "), "fonts");
                        }
                    }
                }
            }
        }
        if (r.value && r.value.filters) {
            let blocks = [],
                customFilters = {};
            if (Array.isArray(r.value.filters)) blocks = r.value.filters;
            else if ("object" == typeof r.value.filters) {
                if (Array.isArray(r.value.filters.U_BLOCKS)) blocks = r.value.filters.U_BLOCKS;
                customFilters = r.value.filters;
            }
            for (let L of blocks) {
                if (!Array.isArray(L) || L.length < 3) continue;
                let M = L[2].toLowerCase();
                blockSet.add(M);
                let R_w = M.split(" ");
                for (let R = L[0]; R <= L[1]; R++) {
                    let S = R.toString(16).toUpperCase().padStart(4, "0");
                    if (mGraph.has(S)) {
                        let O = mGraph.get(S);
                        O.block = M;
                        O.tags.push("filters", M);
                        O.keywords.push(...R_w);
                    }
                }
            }
            for (let [v, b] of Object.entries(customFilters)) {
                if ("U_BLOCKS" === v || "gsi" === v || !Array.isArray(b)) continue;
                let vL = v.toLowerCase();
                blockSet.add(vL);
                for (let N of b) {
                    if ("string" != typeof N) continue;
                    let D = N.codePointAt(0).toString(16).toUpperCase().padStart(4, "0");
                    if (mGraph.has(D)) {
                        let U = mGraph.get(D);
                        U.block = vL;
                        U.tags.push("filters", vL);
                        U.keywords.push(...vL.split(" "));
                    }
                }
            }
        }
        if (r.value && r.value.GENERAL_CATEGORY) {
            for (let k in r.value.GENERAL_CATEGORY) {
                let catFull = r.value.GENERAL_CATEGORY[k].f.toLowerCase();
                gencatSet.add(catFull);
                let dt = r.value.GENERAL_CATEGORY[k].data;
                for (let i = 0; i < dt.length; i++) {
                    let v = dt[i];
                    if ("number" == typeof v) {
                        let S = v.toString(16).toUpperCase().padStart(4, "0");
                        if (mGraph.has(S)) {
                            let O = mGraph.get(S);
                            O.generalCategory = catFull;
                            O.tags.push("gencat", catFull);
                            O.keywords.push(...catFull.split(" "));
                        }
                    } else {
                        for (let j = v[0]; j <= v[1]; j++) {
                            let S = j.toString(16).toUpperCase().padStart(4, "0");
                            if (mGraph.has(S)) {
                                let O = mGraph.get(S);
                                O.generalCategory = catFull;
                                O.tags.push("gencat", catFull);
                                O.keywords.push(...catFull.split(" "));
                            }
                        }
                    }
                }
            }
        }
        try {
            if (r.value && r.value.combined)
                for (let gName in r.value.combined) {
                    let e = r.value.combined[gName];
                    if (!e) continue;
                    let rName = gName.toLowerCase();
                    combinedSet.add(rName);
                    for (let [o, n] of Object.entries(e)) {
                        let charStr = (o.includes(',') || !isNaN(o)) ? String.fromCodePoint(...o.split(',').map(Number)) : o,
                            t = Array.from(charStr).map(e => e.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")).join("-");
                        if (mGraph.has(t)) {
                            let a = mGraph.get(t);
                            a.combinedGroup = rName;
                            a.block = rName;
                            a.tags.push("filters", rName);
                        } else {
                            mGraph.set(t, {
                                type: t.includes("-") ? "combined" : "cp",
                                cp: t.includes("-") ? null : parseInt(t, 16),
                                char: charStr,
                                str: charStr,
                                name: n.toLowerCase(),
                                origName: n,
                                tags: ["combined", "filters", rName],
                                keywords: [],
                                annotations: [],
                                isCustom: !1,
                                combinedGroup: rName,
                                block: rName
                            });
                            let a = mGraph.get(t);
                            a.keywords.push(...rName.split(" "), "combined", "characters");
                        }
                    }
                }
        } catch (K) {}

        if ("fulfilled" === r.status && r.value && r.value.annotations) {
            for (let [tag, items] of Object.entries(r.value.annotations)) {
                let tagLower = tag.toLowerCase().trim();
                let list = Array.isArray(items) ? items : [items];

                let processCP = (cp) => {
                    let hex = cp.toString(16).toUpperCase().padStart(4, "0");
                    if (mGraph.has(hex)) {
                        mGraph.get(hex).annotations.push(tagLower);
                    } else {
                        let charStr = String.fromCodePoint(cp);
                        mGraph.set(hex, {
                            type: "cp",
                            cp: cp,
                            char: charStr,
                            str: charStr,
                            name: "",
                            origName: "",
                            tags: [],
                            keywords: [],
                            annotations: [tagLower],
                            isCustom: !1
                        });
                    }
                };

                for (let item of list) {
                    if (typeof item === "number") {
                        processCP(item);
                    } else if (Array.isArray(item)) {
                        let start = item[0],
                            end = item[1];
                        for (let cp = start; cp <= end; cp++) {
                            processCP(cp);
                        }
                    } else if (typeof item === "string") {
                        let cpList = item.split(/[,+]/).map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
                        if (cpList.length === 1) {
                            processCP(cpList[0]);
                        } else if (cpList.length > 1) {
                            let charStr = String.fromCodePoint(...cpList);
                            let hexKey = cpList.map(e => e.toString(16).toUpperCase().padStart(4, "0")).join("-");
                            if (mGraph.has(hexKey)) {
                                mGraph.get(hexKey).annotations.push(tagLower);
                            } else {
                                mGraph.set(hexKey, {
                                    type: "combined",
                                    cp: null,
                                    char: charStr,
                                    str: charStr,
                                    name: "",
                                    origName: "",
                                    tags: [],
                                    keywords: [],
                                    annotations: [tagLower],
                                    isCustom: !1
                                });
                            }
                        }
                    }
                }
            }
        }

        mGraph.forEach(e => {
            if (e.keywords && e.keywords.length) e.keywords = [...new Set(e.keywords)];
            if (e.annotations && e.annotations.length) e.annotations = [...new Set(e.annotations)];
        });
        dbReady = !0;
        self.postMessage({
            type: "SYSTEM_READY"
        });
    } catch (W) {
        console.error("Worker Build Failed:", W);
    }
}

buildGraph();