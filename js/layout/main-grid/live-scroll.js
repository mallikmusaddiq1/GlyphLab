window.scrollTicking = false;

const topSentinel = document.createElement("div");
topSentinel.id = "grid-top-sentinel";
topSentinel.style.cssText = "position:absolute; top:0; width:100%; height:10px; pointer-events:none; z-index:-1;";

const bottomSentinel = document.createElement("div");
bottomSentinel.id = "grid-bottom-sentinel";
bottomSentinel.style.cssText = "position:absolute; bottom:0; width:100%; height:10px; pointer-events:none; z-index:-1;";

function initSentinels() {
    if (window.gridElement && !document.getElementById("grid-top-sentinel")) {
        window.gridElement.appendChild(topSentinel);
        window.gridElement.appendChild(bottomSentinel);

        window.gridObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.target.id === "grid-bottom-sentinel" && !window.isFetching) {
                        let isJmp = typeof isJumping !== "undefined" ? isJumping : false;
                        if (!isJmp && window.currentBottomHex <= window.MAX_UNICODE) {
                            if (window.isFilterMode && typeof window.discoverFilterBatch === "function") {
                                window.discoverFilterBatch(100);
                            } else if (typeof window.discoverBatch === "function") {
                                window.discoverBatch(100);
                            }
                        }
                    }
                    if (entry.target.id === "grid-top-sentinel" && !window.isFetching) {
                        let isJmp = typeof isJumping !== "undefined" ? isJumping : false;
                        if (!isJmp && window.currentTopHex > 33) {
                            if (typeof window.loadPrev === "function") window.loadPrev();
                        }
                    }
                }
            });
        }, {
            root: window.scrollArea,
            rootMargin: "600px"
        });

        window.gridObserver.observe(topSentinel);
        window.gridObserver.observe(bottomSentinel);
    }
}

document.addEventListener("DOMContentLoaded", initSentinels);
setTimeout(initSentinels, 1000);

if (window.scrollArea) {
    window.scrollArea.addEventListener("scroll", () => {
        if (!window.scrollTicking) {
            window.requestAnimationFrame(() => {
                if (typeof window.renderVirtualGrid === "function") window.renderVirtualGrid();
                window.scrollTicking = false;
            });
            window.scrollTicking = true;
        }
    }, { passive: true });
}

window.loadPrev = async function() {
    if (isFilterMode || isFetching) return;
    isFetching = true;
    var e = 0, t = [];
    
    while (t.length < 4 * gridCols && currentTopHex > 33 && e < 5000) {
        var chunk = [];
        for (var i = 1; i <= 100 && (currentTopHex - i) >= 33; i++) {
            if (!visibilityCache.has(currentTopHex - i)) chunk.push(currentTopHex - i);
        }
        if (chunk.length > 0 && typeof getVisibilityBulk === "function") await getVisibilityBulk(chunk);
        
        for (var i = 0; i < 100; i++) {
            if (t.length >= 4 * gridCols || currentTopHex <= 33) break;
            var h = --currentTopHex,
                v = visibilityCache.get(h) || (typeof isVisible === "function" ? isVisible(h) : 1);
            if (!(typeof hideCheckbox !== "undefined" && hideCheckbox && hideCheckbox.checked && v === 3)) {
                t.push({ type: "cp", cp: h });
            }
            e++;
        }
    }
    
    if (t.length > 0) {
        t.reverse();
        while (t.length % gridCols !== 0 && currentTopHex > 33 && e < 6000) {
            var h = --currentTopHex,
                v = visibilityCache.get(h) || (typeof isVisible === "function" ? isVisible(h) : 1);
            if (!(typeof hideCheckbox !== "undefined" && hideCheckbox && hideCheckbox.checked && v === 3)) {
                t.unshift({ type: "cp", cp: h });
            }
            e++;
        }
        while (t.length % gridCols !== 0) t.unshift({ type: "empty" });
        listData = t.concat(listData);
        if (scrollArea) {
            var scrl = scrollArea.scrollTop;
            if (typeof updateGridMetrics === "function") updateGridMetrics();
            scrollArea.scrollTo(0, scrl + (t.length / gridCols) * (itemHeight + GAP));
        }
    }
    isFetching = false;
};

window.getCurrentVisibleHex = function() {
    if (!scrollArea || !gridElement) return 33;
    var e = Math.max(0, scrollArea.getBoundingClientRect().top - gridElement.getBoundingClientRect().top + 80),
        e = Math.floor(e / (itemHeight + GAP)) * gridCols;
    return listData[e] ? ("cp" === listData[e].type ? listData[e].cp : ("combined" === listData[e].type ? listData[e].str.codePointAt(0) : 33)) : (e = jumpHex && jumpHex.value ? jumpHex.value.trim() : "") && null !== (typeof validateHex === "function" ? validateHex(e) : null) ? parseInt(e, 16) : 33;
};
