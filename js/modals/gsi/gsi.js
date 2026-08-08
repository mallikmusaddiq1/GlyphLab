window.gsiSortOrder = window.gsiSortOrder || "ASC";
window.gsiActiveAlphas = window.gsiActiveAlphas || new Set();
window.gsiExactMatch = window.gsiExactMatch || !1;
let gsiData = [],
    gsiMappedData = [],
    filteredGsiData = [];

window.updateGsiUI = function() {
    let t = $("btnGsiAsc"),
        s = $("btnGsiDesc"),
        x = $("btnGsiExact"),
        cl = $("gsiClearWrap");
    t && t.classList.toggle("active", "ASC" === window.gsiSortOrder);
    s && s.classList.toggle("active", "DESC" === window.gsiSortOrder);
    x && x.classList.toggle("active", window.gsiExactMatch);
    document.querySelectorAll("#gsiAlphaContainer .sort-pill").forEach((e) => e.classList.toggle("active", window.gsiActiveAlphas.has(e.id.replace("btnGsiAlpha_", ""))));
    if (cl) cl.style.display = "ASC" !== window.gsiSortOrder || window.gsiActiveAlphas.size > 0 || window.gsiExactMatch ? "flex" : "none";
};

async function initGSI() {
    let e = await localforage.getItem("gsiExactMatch");
    null !== e && (window.gsiExactMatch = e);
    if (0 === gsiData.length)
        try {
            let e = await gCD("./data/datasets.json", !1),
                t = "string" == typeof e ? JSON.parse(e) : e;
            gsiData = t.gsi || [];
            gsiMappedData = [];
            filteredGsiData = [];
            let s = 5e3;
            for (let a = 0; a < gsiData.length; a += s) {
                gsiData.slice(a, a + s).forEach((e, t) => {
                    gsiMappedData.push({
                        str: e,
                        id: a + t + 1
                    });
                });
                await new Promise((e) => setTimeout(e, 0));
            }
            $("gsiAlphaContainer").innerHTML = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                .split("")
                .map((e) => `<button class="sort-pill ${window.gsiActiveAlphas.has(e) ? "active" : ""}" id="btnGsiAlpha_${e}" onclick="toggleGsiAlpha('${e}')">${e}</button>`)
                .join("");
            window.updateGsiUI();
        } catch (err) {}
}

async function openGSI() {
    ["detailsWrapper", "rangeWrapper", "transformWrapper", "bkmWrapper"].forEach((e) => {
        let t = $(e);
        t && (t.style.display = "none");
    });
    $("gsiWrapper").style.display = "block";
    uniModalTitle.innerHTML = '<svg width="20" height="20"><use href="#ic-glb"></use></svg> GLOBAL SEARCH INDEX';
    Object.assign(uniModalTitle.style, {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        color: "#FFA500"
    });
    let e = $("bkmIconSpan");
    e && (e.style.display = "none");
    document.querySelector(".modal-header").style.display = "flex";
    detailsModal.classList.add("show");
    0 === gsiData.length && (($("gsiContent").innerHTML = '<p style="color:var(--text-muted);text-align:center;">Loading index...</p>'), await initGSI());
    filterGSI(!1);
    let t = document.querySelector(".modal-box");
    [0, 10, 100, 250].forEach((e) =>
        setTimeout(() => {
            t && window.APP_S && window.APP_S.mb_gsiWrapper && (t.scrollTop = window.APP_S.mb_gsiWrapper.t);
            let a = $("gsiScrollContainer");
            a && window.APP_S && window.APP_S.gsiScrollContainer && (a.scrollTop = window.APP_S.gsiScrollContainer.t || 0);
        }, e)
    );
}

function toggleGsiSortArea() {
    let e = $("gsiSortArea");
    e && (e.style.display = "flex" === e.style.display ? "none" : "flex"), "function" == typeof AS && AS();
}

function setGsiSort(e) {
    (window.gsiSortOrder = e), window.updateGsiUI(), filterGSI(), "function" == typeof AS && AS();
}

function toggleGsiAlpha(e) {
    window.gsiActiveAlphas.has(e) ? window.gsiActiveAlphas.delete(e) : window.gsiActiveAlphas.add(e), window.updateGsiUI(), filterGSI(), "function" == typeof AS && AS();
}

window.toggleGsiExact = function() {
    (window.gsiExactMatch = !window.gsiExactMatch), localforage.setItem("gsiExactMatch", window.gsiExactMatch), window.updateGsiUI(), filterGSI(), "function" == typeof AS && AS();
};

function clearGsiSort() {
    window.gsiActiveAlphas.clear(), (window.gsiSortOrder = "ASC"), (window.gsiExactMatch = !1), localforage.setItem("gsiExactMatch", !1), window.updateGsiUI(), filterGSI(), "function" == typeof AS && AS();
}

function filterGSI(e = !0) {
    let t = $("gsiSearch").value.toLowerCase().trim(),
        s = /^\d+$/.test(t),
        a = [...gsiMappedData];
    if ((window.gsiActiveAlphas.size > 0 && (a = a.filter((e) => window.gsiActiveAlphas.has(e.str.charAt(0).toUpperCase()))), t))
        if (s) a = a.filter((e) => e.id == t);
        else if (window.gsiExactMatch) {
        let i = new RegExp("\\b" + t.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") + "\\b", "i");
        a = a.filter((e) => i.test(e.str));
    } else a = a.filter((e) => e.str.toLowerCase().includes(t));
    "DESC" === window.gsiSortOrder && a.reverse();
    filteredGsiData = a;
    !1 !== e && ($("gsiScrollContainer").scrollTop = 0);
    renderGSI();
}

function renderGSI() {
    let e = $("gsiSearch").value.toLowerCase().trim(),
        t = /^\d+$/.test(e),
        s = filteredGsiData.length,
        a = $("gsiScrollContainer");
    if (!a) return;
    $("gsiSpacer").style.height = 28 * s + "px";
    let i = Math.floor(a.scrollTop / 28),
        l = Math.max(0, i - 100),
        o = Math.min(s, l + Math.ceil(a.clientHeight / 28) + 200),
        n = "",
        r = window.gsiExactMatch && e && !t ? new RegExp("\\b" + e.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") + "\\b", "i") : null;
    for (let d = l; d < o; d++) {
        let w = filteredGsiData[d],
            c = escapeHTML(w.str);
        if (e && !t) {
            let p = -1;
            if (r) {
                let m = w.str.match(r);
                m && (p = m.index);
            } else p = w.str.toLowerCase().indexOf(e);
            if (p > -1) {
                let u = escapeHTML(w.str.substring(0, p)),
                    h = escapeHTML(w.str.substring(p, p + e.length)),
                    g = escapeHTML(w.str.substring(p + e.length));
                c = `${u}<span class="highlight-text">${h}</span>${g}`;
            }
        }
        n += `<button class="shortcut-btn" style="gap:6px" onclick="copyText('${escapeHTML(w.str).replace(/'/g, "\\'")}','Index')"><span class="c-amber" style="flex-shrink:0">${w.id}</span><div class="filter-text-wrap">${c}</div></button>`;
    }
    $("gsiContent").style.top = 28 * l + "px";
    $("gsiContent").innerHTML = n;
    setTimeout(() => {
        let e = $("gsiContent").children;
        for (let t = 0; t < e.length; t++) {
            let s = e[t].querySelector(".filter-text-wrap"),
                a = s?.querySelector(".highlight-text");
            s && a && (s.scrollLeft = a.offsetLeft - s.clientWidth / 2 + a.clientWidth / 2);
        }
    }, 0);
}

document.addEventListener("DOMContentLoaded", () => {
    let gsiScroller = $("gsiScrollContainer");
    if (gsiScroller) {
        gsiScroller.addEventListener("scroll", () => requestAnimationFrame(renderGSI));
    }
});