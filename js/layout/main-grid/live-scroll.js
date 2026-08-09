var scrollTicking = false;

if (typeof scrollArea !== "undefined" && scrollArea) {
    scrollArea.addEventListener("scroll", () => {
        if (!scrollTicking) {
            window.requestAnimationFrame(() => {
                let isJmp = typeof isJumping !== "undefined" ? isJumping : false;
                
                if (!isJmp && scrollArea.scrollTop < 600 && currentTopHex > 33 && !isFetching) {
                    if (typeof window.loadPrev === "function") window.loadPrev();
                }
                
                if (typeof window.renderVirtualGrid === "function") window.renderVirtualGrid();
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    }, { passive: true });
}

window.loadPrev = async function() {
    if ((typeof isFilterMode !== "undefined" && isFilterMode) || (typeof isFetching !== "undefined" && isFetching)) return;
    
    isFetching = true;
    var limitCount = 0;
    var itemsAdded = [];
    var targetCount = 6 * gridCols; 
    
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
            
            if (!(typeof hideCheckbox !== "undefined" && hideCheckbox && hideCheckbox.checked && vStat === 3)) {
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
            
            if (!(typeof hideCheckbox !== "undefined" && hideCheckbox && hideCheckbox.checked && vStat === 3)) {
                itemsAdded.unshift({ type: "cp", cp: hexVal });
            }
            limitCount++;
        }
        
        while (itemsAdded.length % gridCols !== 0) {
            itemsAdded.unshift({ type: "empty" });
        }
        
        var oldScrollTop = scrollArea.scrollTop;
        listData = itemsAdded.concat(listData);
        
        if (typeof window.updateGridMetrics === "function") {
            window.updateGridMetrics();
        }
        
        if (typeof scrollArea !== "undefined" && scrollArea) {
            var addedHeight = (itemsAdded.length / gridCols) * (itemHeight + GAP);
            scrollArea.scrollTo(0, oldScrollTop + addedHeight);
        }
    }
    isFetching = false;
};

window.getCurrentVisibleHex = function() {
    if (typeof scrollArea === "undefined" || !scrollArea || typeof gridElement === "undefined" || !gridElement) return 33;
    var topOffset = Math.max(0, scrollArea.getBoundingClientRect().top - gridElement.getBoundingClientRect().top + 80);
    var idx = Math.floor(topOffset / (itemHeight + GAP)) * gridCols;
    
    if (listData[idx]) {
        if (listData[idx].type === "cp") return listData[idx].cp;
        if (listData[idx].type === "combined") return listData[idx].str.codePointAt(0);
    }
    
    var jH = typeof jumpHex !== "undefined" && jumpHex && jumpHex.value ? jumpHex.value.trim() : "";
    if (jH && typeof validateHex === "function" && validateHex(jH) !== null) {
        return parseInt(jH, 16);
    }
    return 33;
};