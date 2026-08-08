function openTransform(e = !0) {
    switchModalView("transformWrapper"), uniModalTitle.innerHTML = '<svg width="20" height="20"><use href="#ic-fnt"></use></svg> FONTS', uniModalTitle.style.display = "flex", uniModalTitle.style.alignItems = "center", uniModalTitle.style.gap = "6px", document.querySelector(".modal-header").style.display = "flex", $("bkmIconSpan") && ($("bkmIconSpan").style.display = "none"), uniModalTitle.style.color = "#FFA500", detailsModal.classList.add("show"), renderTransform(), AS()
}

function renderTransform() {
    clearTimeout(rTO), rTO = setTimeout(() => {
        let e = tInput.value || "GlyphLab",
            t = "",
            r = fontSearch.value.toLowerCase().trim(),
            n = document.querySelector(".modal-box"),
            a = void 0 !== window.PENDING_MODAL_SCROLL ? window.PENDING_MODAL_SCROLL : n.scrollTop,
            o = Array.from(document.querySelectorAll("#transformContent div[data-fcat]")).map(e => e.scrollLeft),
            l = renderTransform.lastQuery !== r,
            s = "undefined" == typeof renderTransform.lastQuery,
            i = 1,
            c = /^\d+$/.test(r);
        renderTransform.lastQuery = r;
        for (let [g, h] of Object.entries(fontCategories)) {
            let m = "";
            for (let [f, v] of Object.entries(h)) {
                let y, x, C, w = i++;
                if (c) {
                    if (String(w) !== r) continue
                } else if (r && !f.toLowerCase().includes(r)) continue;
                let S = v.fontCapital || [],
                    E = v.fontSmall || [],
                    O = v.fontNumber || [],
                    N = "";
                for (y of e) {
                    let _ = y.charCodeAt(0);
                    65 <= _ && _ <= 90 && 26 === S.length ? N += S[_ - 65] : 97 <= _ && _ <= 122 && 26 === E.length ? N += E[_ - 97] : 48 <= _ && _ <= 57 && 10 === O.length ? N += O[_ - 48] : N += y
                }
                let j = f.toUpperCase();
                if (!c && r && -1 < (v = j.toLowerCase().indexOf(r))) {
                    x = j.substring(0, v), C = j.substring(v, v + r.length), v = j.substring(v + r.length), j = x + `<span class="highlight-text">${C}</span>` + v
                }
                m += `<div class="detail-item" style="margin-bottom:0;scroll-snap-align:center;height:fit-content;min-height:38px" data-text="${escapeHTML(N)}" onclick="copyText(this.dataset.text, '${f} Text')"><span class="detail-label" style="white-space:normal;word-break:break-all;line-height:1.2;padding-right:10px;flex:1"><span class="c-amber" style="margin-right:6px">${w}</span>${j}</span><span class="detail-val" style="font-family:'Segoe UI',sans-serif;text-align:right;white-space:pre-wrap">${escapeHTML(N)}</span></div>`
            }
            m && (t += `<div style="font-weight:800;color:#FFA500;margin:10px 0 6px 4px;font-size:0.8rem;text-transform:uppercase;letter-spacing:1px">${g}</div><div data-fcat="${g}" style="display:grid;grid-template-rows:repeat(5,auto);align-items:start;grid-auto-flow:column;grid-auto-columns:85%;overflow-x:auto;gap:6px;padding-bottom:6px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none"><style>#transformContent::-webkit-scrollbar{display:none}</style>${m}</div>`)
        }
        transformContent.innerHTML = t || '<p style="color:var(--text-muted); text-align:center; margin-top:20px;">No fonts found</p>', l && !s ? n.scrollTop = 0 : n.scrollTop = a, window.PENDING_MODAL_SCROLL = void 0, document.querySelectorAll("#transformContent div[data-fcat]").forEach((e, t) => {
            let r = e.getAttribute("data-fcat");
            window.PENDING_FCAT_SCROLLS && void 0 !== window.PENDING_FCAT_SCROLLS[r] ? (e.scrollLeft = window.PENDING_FCAT_SCROLLS[r], delete window.PENDING_FCAT_SCROLLS[r]) : e.scrollLeft = l && !s ? 0 : o[t] || 0
        }), AS()
    }, 0)
}