var scrollTicking = false;

function initLiveScroll() {
    var sa = document.getElementById("scrollArea") || window.scrollArea;
    if (sa) {
        sa.addEventListener("scroll", () => {
            if (!scrollTicking) {
                window.requestAnimationFrame(() => {
                    let isJmp = typeof isJumping !== "undefined" ? isJumping : false;
                    
                    if (!isJmp && sa.scrollTop < 600 && currentTopHex > 33 && !isFetching) {
                        if (typeof window.loadPrev === "function") window.loadPrev();
                    }
                    
                    if (typeof window.renderVirtualGrid === "function") window.renderVirtualGrid();
                    scrollTicking = false;
                });
                scrollTicking = true;
            }
        }, { passive: true });
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLiveScroll);
} else {
    initLiveScroll();
}

window.loadPrev = async function() {
    if ((typeof isFilterMode !== "undefined" && isFilterMode) || (typeof isFetching !== "undefined" && isFetching)) return;
    
    isFetching = true;
    var limitCount = 0;
    var itemsAdded = [];
    var targetCount = 6 * gridCols; 
    var sa = document.getElementById("scrollArea") || window.scrollArea;
    
    while (itemsAdded.length < targetCount && currentTopHex > 33 && limitCount < 5000) {
        var chunk = [];
        for (var i = 1; i <= 100 && (currentTopHex - i) >= 33; i++) {
            if (!visibilityCache.has(currentTopHex - i)) {
                chunk.push(currentTopHex - i);
            }
        }
        
        if (chunk.length > 0 && typeof getVisibilityBulk === "function") {
            await getVisibilityBulk(chunk);
        }
        
        for (var i = 0; i < 100; i++) {
            if (itemsAdded.length >= targetCount || currentTopHex <= 33) break;
            var hexVal = --currentTopHex;
            var vStat = visibilityCache.get(hexVal) || (typeof isVisible === 'function' ? isVisible(hexVal) : 1);
            
            var hideCb = document.getElementById("hideUnrendered") || window.hideCheckbox;
            if (!(hideCb && hideCb.checked && vStat === 3)) {
                itemsAdded.push({ type: "cp", cp: hexVal });
            }
            limitCount++;
        }
    }
    
    if (itemsAdded.length > 0) {
        itemsAdded.reverse();
        
        while (itemsAdded.length % gridCols !== 0 && currentTopHex > 33 && limitCount < 6000) {
            var hexVal = --currentTopHex;
            var vStat = visibilityCache.get(hexVal) || (typeof isVisible === 'function' ? isVisible(hexVal) : 1);
            
            var hideCb = document.getElementById("hideUnrendered") || window.hideCheckbox;
            if (!(hideCb && hideCb.checked && vStat === 3)) {
                itemsAdded.unshift({ type: "cp", cp: hexVal });
            }
            limitCount++;
        }
        
        while (itemsAdded.length % gridCols !== 0) {
            itemsAdded.unshift({ type: "empty" });
        }
        
        var oldScrollTop = sa ? sa.scrollTop : 0;
        listData = itemsAdded.concat(listData);
        
        if (typeof window.updateGridMetrics === "function") {
            window.updateGridMetrics();
        }
        
        if (sa) {
            var addedHeight = (itemsAdded.length / gridCols) * (itemHeight + GAP);
            sa.scrollTo(0, oldScrollTop + addedHeight);
        }
    }
    isFetching = false;
};

window.getCurrentVisibleHex = function() {
    var sa = document.getElementById("scrollArea") || window.scrollArea;
    var gEl = document.getElementById("symbolGrid") || window.gridElement;
    
    if (!sa || !gEl) return 33;
    var topOffset = Math.max(0, sa.getBoundingClientRect().top - gEl.getBoundingClientRect().top + 80);
    var idx = Math.floor(topOffset / (itemHeight + GAP)) * gridCols;
    
    if (listData[idx]) {
        if (listData[idx].type === "cp") return listData[idx].cp;
        if (listData[idx].type === "combined") return listData[idx].str.codePointAt(0);
    }
    
    var jHex = document.getElementById("jumpHex") || window.jumpHex;
    var jH = jHex && jHex.value ? jHex.value.trim() : "";
    if (jH && typeof validateHex === "function" && validateHex(jH) !== null) {
        return parseInt(jH, 16);
    }
    return 33;
};
