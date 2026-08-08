function openRangeModal() {
    switchModalView("rangeWrapper");
    uniModalTitle.innerHTML = '<svg width="20" height="20" aria-hidden="true"><use href="#ic-exp"></use></svg> RANGE EXPORT';
    uniModalTitle.style.display = "flex";
    uniModalTitle.style.alignItems = "center";
    uniModalTitle.style.gap = "6px";
    document.querySelector(".modal-header").style.display = "flex";
    if ($("bkmIconSpan")) $("bkmIconSpan").style.display = "none";
    uniModalTitle.style.color = "#FFA500";
    detailsModal.classList.add("show");
    document.body.style.overflow = "hidden";
    detailsModal.setAttribute("aria-modal", "true");
    detailsModal.setAttribute("role", "dialog");
    setTimeout(() => {
        let e = detailsModal.querySelector("button, input, [tabindex]:not([tabindex='-1'])");
        e && e.focus()
    }, 100);
    var mb = document.querySelector(".modal-box");
    if (window.APP_S && window.APP_S["mb_rangeWrapper"]) mb.scrollTop = window.APP_S["mb_rangeWrapper"].t;
    setTimeout(() => {
        if (mb && window.APP_S && window.APP_S["mb_rangeWrapper"]) mb.scrollTop = window.APP_S["mb_rangeWrapper"].t
    }, 50);
    setTimeout(() => {
        if (mb && window.APP_S && window.APP_S["mb_rangeWrapper"]) mb.scrollTop = window.APP_S["mb_rangeWrapper"].t
    }, 150)
}

function closeModals() {
    detailsModal.classList.remove("show");
    switchModalView("");
    document.body.style.overflow = "";
    detailsModal.removeAttribute("aria-modal");
    AS()
}