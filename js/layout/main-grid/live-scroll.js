var scrollTicking = !1;
if (scrollArea) {
    scrollArea.addEventListener("scroll", () => {
        scrollTicking || (window.requestAnimationFrame(() => {
            let isJmp = typeof isJumping !== "undefined" ? isJumping : !1;
            !isJmp && scrollArea.scrollTop < 300 && 33 < currentTopHex && !isFetching && window.loadPrev && window.loadPrev(), window.renderVirtualGrid && window.renderVirtualGrid(), scrollTicking = !1
        }), scrollTicking = !0)
    }, {
        passive: !0
    })
};
window.loadPrev = async function() {
    if (isFilterMode || isFetching) return;
    isFetching = !0;
    var e = 0,
        t = [];
    while (t.length < 4 * gridCols && currentTopHex > 33 && e < 5000) {
        var chunk = [];
        for (var i = 1; i <= 100 && (currentTopHex - i) >= 33; i++) {
            if (!visibilityCache.has(currentTopHex - i)) chunk.push(currentTopHex - i)
        }
        if (chunk.length > 0) await getVisibilityBulk(chunk);
        for (var i = 0; i < 100; i++) {
            if (t.length >= 4 * gridCols || currentTopHex <= 33) break;
            var h = --currentTopHex,
                v = visibilityCache.get(h) || isVisible(h);
            if (!(hideCheckbox && hideCheckbox.checked && v === 3)) {
                t.push({
                    type: "cp",
                    cp: h
                })
            }
            e++
        }
    }
    if (t.length > 0) {
        t.reverse();
        while (t.length % gridCols !== 0 && currentTopHex > 33 && e < 6000) {
            var h = --currentTopHex,
                v = visibilityCache.get(h) || isVisible(h);
            if (!(hideCheckbox && hideCheckbox.checked && v === 3)) t.unshift({
                type: "cp",
                cp: h
            });
            e++
        }
        while (t.length % gridCols !== 0) t.unshift({
            type: "empty"
        });
        listData = t.concat(listData);
        if (scrollArea) {
            var scrl = scrollArea.scrollTop;
            window.updateGridMetrics && window.updateGridMetrics();
            scrollArea.scrollTo(0, scrl + (t.length / gridCols) * (itemHeight + GAP))
        }
    }
    isFetching = !1
};
window.getCurrentVisibleHex = function() {
    if (!scrollArea || !gridElement) return 33;
    var e = mMx(0, scrollArea.getBoundingClientRect().top - gridElement.getBoundingClientRect().top + 80),
        e = mF(e / (itemHeight + GAP)) * gridCols;
    return listData[e] ? ("cp" === listData[e].type ? listData[e].cp : ("combined" === listData[e].type ? listData[e].str.codePointAt(0) : 33)) : (e = jumpHex && jumpHex.value ? jumpHex.value.trim() : "") && null !== window.validateHex(e) ? parseInt(e, 16) : 33
};