function toTitle(e) {
    return e ? e.toUpperCase() : ""
}
self.addEventListener("message", function(e) {
    let t = e.data;
    if ("SMART_SEARCH" === t.type) {
        if (!dbReady) return void self.postMessage({
            type: "SEARCH_RESULTS",
            results: []
        });
        let rawQ = t.query ? t.query.trim() : "";
        let q = rawQ.toLowerCase().normalize("NFD");

        function performSmartSearch(query, rawQuery) {
            if (!query) return [];
            let results = [];
            let isSingleLatin = /^[a-zA-Z0-9]$/.test(rawQuery);
            let qSeg = Array.from(new Intl.Segmenter(void 0, {
                granularity: "grapheme"
            }).segment(rawQuery));
            let isSingleSymbol = qSeg.length === 1 && !isSingleLatin;
            let qWords = query.split(/\s+/).filter(w => w.length > 0);
            let isSingleWord = qWords.length === 1 && qWords[0].length >= 2 && !isSingleSymbol;
            let isMultiWord = qWords.length > 1;
            if (isSingleLatin) {
                let targetBlocks = new Set();
                let exactWordRegex = new RegExp("\\b" + query + "\\b", "i");
                mGraph.forEach(item => {
                    if (item.char && item.char.toLowerCase() === query) {
                        if (item.block) targetBlocks.add(item.block)
                    }
                });
                mGraph.forEach(item => {
                    let match = !1,
                        score = 0,
                        cClass = "";
                    let nameL = item.name ? item.name.toLowerCase() : "";
                    let origL = item.origName ? item.origName.toLowerCase() : "";
                    if (item.char && item.char.toLowerCase() === query) {
                        match = !0;
                        score = item.char === rawQuery ? 3000 : 2900;
                        cClass = "thick-golden-glowing-card"
                    } else if (exactWordRegex.test(nameL) || exactWordRegex.test(origL)) {
                        match = !0;
                        score = 2000;
                        cClass = "medium-golden-glow-card"
                    } else if (targetBlocks.size > 0 && item.block && targetBlocks.has(item.block)) {
                        match = !0;
                        score = 1000;
                        cClass = "medium-white-glowing-card"
                    }
                    if (match) {
                        results.push({
                            ...item,
                            relevanceScore: score,
                            cardClass: cClass
                        })
                    }
                })
            } else if (isSingleSymbol) {
                let targetBlocks = new Set();
                let cleanRawQ = rawQuery.replace(/[\uFE0F\uFE0E]/g, "");
                let rawCps = Array.from(cleanRawQ);
                let isCombined = rawCps.length > 1;
                if (isCombined) {
                    let hexKey = rawCps.map(e => e.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")).join("-");
                    if (mGraph.has(hexKey) && mGraph.get(hexKey).combinedGroup) {
                        targetBlocks.add(mGraph.get(hexKey).combinedGroup)
                    } else {
                        mGraph.forEach(item => {
                            let cleanItem = item.char ? item.char.replace(/[\uFE0F\uFE0E]/g, "") : "";
                            if (cleanItem === cleanRawQ && item.combinedGroup) targetBlocks.add(item.combinedGroup)
                        })
                    }
                } else {
                    let cp = cleanRawQ.codePointAt(0);
                    if (cp !== undefined) {
                        let hexKey = cp.toString(16).toUpperCase().padStart(4, "0");
                        if (mGraph.has(hexKey) && mGraph.get(hexKey).block) {
                            targetBlocks.add(mGraph.get(hexKey).block)
                        } else {
                            mGraph.forEach(item => {
                                let cleanItem = item.char ? item.char.replace(/[\uFE0F\uFE0E]/g, "") : "";
                                if (cleanItem === cleanRawQ && item.block) targetBlocks.add(item.block)
                            })
                        }
                    }
                }
                mGraph.forEach(item => {
                    let match = !1,
                        score = 0,
                        cClass = "";
                    let nameL = item.name ? item.name.toLowerCase() : "";
                    let origL = item.origName ? item.origName.toLowerCase() : "";
                    let cleanItem = item.char ? item.char.replace(/[\uFE0F\uFE0E]/g, "") : "";
                    let isInTargetBlock = !1;
                    if (targetBlocks.size > 0) {
                        if (isCombined && item.combinedGroup && targetBlocks.has(item.combinedGroup)) {
                            isInTargetBlock = !0
                        } else if (!isCombined && item.block && targetBlocks.has(item.block)) {
                            isInTargetBlock = !0
                        }
                    }
                    if (item.char === rawQuery || (cleanItem && cleanItem === cleanRawQ)) {
                        match = !0;
                        score = 3000;
                        cClass = "thick-golden-glowing-card"
                    } else if (nameL.includes(query) || origL.includes(query)) {
                        match = !0;
                        score = 2000;
                        cClass = "medium-golden-glow-card"
                    } else if (isInTargetBlock) {
                        match = !0;
                        score = 1000;
                        cClass = "medium-white-glowing-card"
                    }
                    if (match) {
                        results.push({
                            ...item,
                            relevanceScore: score,
                            cardClass: cClass
                        })
                    }
                })
            } else if (isSingleWord) {
                let targetBlocks = new Set();
                let pureWholeWordRegex = new RegExp("\\b" + query + "\\b", "i");
                let compoundWordRegex = new RegExp("\\b" + query + "|" + query + "\\b", "i");
                mGraph.forEach(item => {
                    let nameL = item.name ? item.name.toLowerCase() : "";
                    let origL = item.origName ? item.origName.toLowerCase() : "";
                    if (nameL === query || origL === query) {
                        if (item.block) targetBlocks.add(item.block);
                        if (item.combinedGroup) targetBlocks.add(item.combinedGroup)
                    }
                });
                mGraph.forEach(item => {
                    let match = !1,
                        score = 0,
                        cClass = "";
                    let nameL = item.name ? item.name.toLowerCase() : "";
                    let origL = item.origName ? item.origName.toLowerCase() : "";
                    let isExactName = (nameL === query || origL === query);
                    let isAnnotation = item.annotations && item.annotations.includes(query);
                    let isInTargetBlock = targetBlocks.size > 0 && ((item.block && targetBlocks.has(item.block)) || (item.combinedGroup && targetBlocks.has(item.combinedGroup)));
                    let isPartialMatch = nameL.includes(query) || origL.includes(query);
                    let isPureWholeWord = pureWholeWordRegex.test(nameL) || pureWholeWordRegex.test(origL);
                    let isWholeOrCompoundWord = compoundWordRegex.test(nameL) || compoundWordRegex.test(origL);
                    if (isExactName) {
                        match = !0;
                        score = 3500;
                        cClass = "thick-golden-glowing-card"
                    } else if (isAnnotation) {
                        match = !0;
                        score = 3000;
                        cClass = "thick-golden-glowing-card"
                    } else if (isPureWholeWord && isInTargetBlock) {
                        match = !0;
                        score = 2700;
                        cClass = "medium-golden-glow-card"
                    } else if (isPureWholeWord) {
                        match = !0;
                        score = 2600;
                        cClass = "medium-golden-glow-card"
                    } else if (isInTargetBlock && isPartialMatch) {
                        match = !0;
                        score = 2500;
                        cClass = "medium-golden-glow-card"
                    } else if (isWholeOrCompoundWord) {
                        match = !0;
                        score = 2000;
                        cClass = "medium-golden-glow-card"
                    } else if (isInTargetBlock) {
                        match = !0;
                        score = 1000;
                        cClass = "medium-white-glowing-card"
                    } else if (isPartialMatch) {
                        match = !0;
                        score = 500;
                        cClass = "thin-white-card"
                    }
                    if (match) {
                        results.push({
                            ...item,
                            relevanceScore: score,
                            cardClass: cClass
                        })
                    }
                })
            } else if (isMultiWord) {
                let targetBlocks = new Set();
                mGraph.forEach(item => {
                    let nameL = item.name ? item.name.toLowerCase() : "";
                    let origL = item.origName ? item.origName.toLowerCase() : "";
                    if (nameL === query || origL === query) {
                        if (item.block) targetBlocks.add(item.block);
                        if (item.combinedGroup) targetBlocks.add(item.combinedGroup)
                    }
                });
                let wordFreq = new Map();
                qWords.forEach(w => {
                    let count = 0;
                    let regex = new RegExp("\\b" + w + "\\b", "i");
                    mGraph.forEach(item => {
                        let nameL = item.name ? item.name.toLowerCase() : "";
                        let origL = item.origName ? item.origName.toLowerCase() : "";
                        if (regex.test(nameL) || regex.test(origL)) count++;
                    });
                    wordFreq.set(w, count)
                });
                let sortedWords = [...qWords].sort((a, b) => wordFreq.get(a) - wordFreq.get(b));
                let phaseCombinations = [];
                for (let i = qWords.length; i >= 1; i--) {
                    phaseCombinations.push(sortedWords.slice(0, i))
                }
                mGraph.forEach(item => {
                    let match = !1,
                        score = 0,
                        cClass = "";
                    let nameL = item.name ? item.name.toLowerCase() : "";
                    let origL = item.origName ? item.origName.toLowerCase() : "";
                    let isExactName = (nameL === query || origL === query);
                    let isAnnotation = item.annotations && item.annotations.includes(query);
                    let isInTargetBlock = targetBlocks.size > 0 && ((item.block && targetBlocks.has(item.block)) || (item.combinedGroup && targetBlocks.has(item.combinedGroup)));
                    if (isExactName) {
                        match = !0;
                        score = 3500;
                        cClass = "thick-golden-glowing-card"
                    } else if (isAnnotation) {
                        match = !0;
                        score = 3000;
                        cClass = "thick-golden-glowing-card"
                    } else {
                        let phaseMatched = !1;
                        for (let idx = 0; idx < phaseCombinations.length; idx++) {
                            let combo = phaseCombinations[idx];
                            let allMatch = combo.every(w => {
                                let regex = new RegExp("\\b" + w + "\\b", "i");
                                return regex.test(nameL) || regex.test(origL)
                            });
                            if (allMatch) {
                                match = !0;
                                score = isInTargetBlock ? 2900 - (idx * 50) : 2800 - (idx * 100);
                                cClass = "medium-golden-glow-card";
                                phaseMatched = !0;
                                break
                            }
                        }
                        if (!phaseMatched) {
                            if (isInTargetBlock) {
                                match = !0;
                                score = 1000;
                                cClass = "medium-white-glowing-card"
                            } else {
                                let partialMatch = qWords.some(w => nameL.includes(w) || origL.includes(w));
                                if (partialMatch) {
                                    match = !0;
                                    score = 500;
                                    cClass = "thin-white-card"
                                }
                            }
                        }
                    }
                    if (match) {
                        results.push({
                            ...item,
                            relevanceScore: score,
                            cardClass: cClass
                        })
                    }
                })
            } else {
                mGraph.forEach(item => {
                    let match = !1,
                        score = 0;
                    let nameL = item.name ? item.name.toLowerCase() : "";
                    let origL = item.origName ? item.origName.toLowerCase() : "";
                    if (item.char === query) {
                        match = !0;
                        score = 1000
                    } else if (nameL === query || origL === query) {
                        match = !0;
                        score = 900
                    } else {
                        let textToSearch = [nameL, origL];
                        if (item.keywords) textToSearch.push(...item.keywords);
                        if (item.tags) textToSearch.push(...item.tags);
                        if (item.annotations) textToSearch.push(...item.annotations);
                        let fullText = textToSearch.join(" ");
                        let allWordsMatch = qWords.every(word => fullText.includes(word));
                        if (allWordsMatch) {
                            match = !0;
                            score = 500
                        }
                    }
                    if (match) {
                        results.push({
                            ...item,
                            relevanceScore: score
                        })
                    }
                })
            }
            results.sort((a, b) => b.relevanceScore - a.relevanceScore);
            if (isSingleWord || isMultiWord) {
                let has3500 = results.some(r => r.relevanceScore === 3500);
                if (!has3500) {
                    results = results.filter(r => r.relevanceScore !== 1000)
                }
            }
            if (t.activeFilters && t.activeFilters.length > 0) {
                let hasBlockFilter = t.activeFilters.some(f => blockSet.has(f)),
                    hasCombinedFilter = t.activeFilters.some(f => combinedSet.has(f)),
                    hasGencatFilter = t.activeFilters.some(f => gencatSet.has(f));
                results = results.filter(item => {
                    let baseMatch = !0;
                    if (hasBlockFilter || hasCombinedFilter) {
                        baseMatch = (item.block && t.activeFilters.includes(item.block)) || (item.combinedGroup && t.activeFilters.includes(item.combinedGroup))
                    }
                    let genMatch = !0;
                    if (hasGencatFilter) {
                        genMatch = item.generalCategory && t.activeFilters.includes(item.generalCategory)
                    }
                    return baseMatch && genMatch
                })
            }
            return results
        }
        let s = performSmartSearch(q, rawQ);
        if (t.hideUnren) s = filterUnrendered(s);
        for (let c = 0; c < s.length; c++) s[c].name = toTitle(s[c].origName || s[c].name || "");
        return void self.postMessage({
            type: "SEARCH_RESULTS",
            results: s
        })
    }
});