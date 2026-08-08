var $ = i => document.getElementById(i);

function switchModalView(e) {
    ["detailsWrapper", "transformWrapper", "bkmWrapper", "rangeWrapper"].forEach(t => {
        let r = $(t);
        r && (r.style.display = t === e ? "block" : "none")
    });
    "gsiWrapper" !== e && $("gsiWrapper") && ($("gsiWrapper").style.display = "none")
}
window.switchModalView = switchModalView;

function updateTabStyles(e, t, r) {
    let a = $(e),
        l = $(t),
        s = "SINGLE" === r;
    a && (a.style.color = s ? "#FFA500" : "var(--text-muted)", a.style.borderBottom = s ? "3px solid #FFA500" : "none"), l && (l.style.color = "COMBINED" === r ? "#FFA500" : "var(--text-muted)", l.style.borderBottom = "COMBINED" === r ? "3px solid #FFA500" : "none")
}

function toggleProgress(e, t) {
    let r = $(e + "ProgCont"),
        a = $(e + "ProgBar"),
        l = $(e + "ProgTxt"),
        o = $(e + "ProgETA");
    r && (r.style.display = t ? "flex" : "none"), t || (a && (a.style.width = "0%"), l && (l.innerText = "0%"), o && (o.innerText = "Calculating ETA..."))
}

function updateProgress(e, t, r, a) {
    let l = $(e + "ProgBar"),
        o = $(e + "ProgTxt"),
        n = $(e + "ProgETA"),
        s = Math.floor(t / r * 100);
    if (l && (l.style.width = s + "%"), o && (o.innerText = s + "%"), n) {
        let i = Date.now() - a,
            p = Math.max(0, Math.floor(i / t * (r - t) / 1e3));
        n.innerText = p > 60 ? Math.floor(p / 60) + "m " + p % 60 + "s remaining" : p + "s remaining"
    }
}

function triggerDownload(e, t, r) {
    let a = new Blob(e, {
            type: t
        }),
        l = URL.createObjectURL(a),
        o = document.createElement("a");
    o.href = l, o.download = r, o.click(), setTimeout(() => URL.revokeObjectURL(l), 1e4)
}

function showToast(e, t = "success") {
    let r = $("toast");
    r && (r.innerText = e, r.className = "error" === t ? "error show" : "show", setTimeout(() => r.classList.remove("show"), 2e3))
}

function copyText(e, t) {
    navigator.clipboard.writeText(e).then(() => {
        showToast(t + " Copied!", "success")
    }).catch(() => {
        showToast("Copy Failed", "error")
    })
}