window.finishSearchJump = e => {
    let t = defaultCardsToLoad - e,
        f = () => {
            "function" == typeof loadPrev && loadPrev(), setTimeout(endJmp, 100)
        };
    0 < t && "function" == typeof discoverBatch ? discoverBatch(t).then(f) : ("function" == typeof updateGridMetrics && updateGridMetrics(), f())
}, window.switchToolbarTab = t => {
    (window.currentToolbarTab = t), panelToolSearch && (panelToolSearch.style.display = "search" === t ? "block" : "none"), panelToolJump && (panelToolJump.style.display = "jump" === t ? "block" : "none"), panelToolDraft && (panelToolDraft.style.display = "draft" === t ? "block" : "none"), tabToolSearch && tabToolSearch.classList.toggle("active", "search" === t), tabToolJump && tabToolJump.classList.toggle("active", "jump" === t), tabToolDraft && tabToolDraft.classList.toggle("active", "draft" === t)
};