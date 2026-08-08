window.setSearchMode = function(e) {
    currentSearchMode = e;
    localStorage.setItem("glyphlab_search_mode", e);
    let t = document.getElementById("btnSmartSearch"),
        a = document.getElementById("btnRawSearch");
    t && a && ("smart" === e ? (t.classList.add("active"), a.classList.remove("active")) : (a.classList.add("active"), t.classList.remove("active")));
    charInput && charInput.value && "function" == typeof window.findChar && window.findChar();
};

window.getRawSearchCardClass = function(r, e) {
    if (!e || "string" != typeof r) return "";
    try {
        let t = Array.from(new Intl.Segmenter(void 0, {
                granularity: "grapheme"
            }).segment(e.trim())).map((r) => r.segment),
            n = t.filter((r) => Array.from(r).length > 1),
            a = t.filter((r) => 1 === Array.from(r).length),
            o = n.flatMap((r) => Array.from(r)),
            i = n.length > 0;
        return n.includes(r) ? "thick-golden-glowing-card" : o.includes(r) ? "medium-white-glowing-card" : a.includes(r) ? (i ? "medium-golden-glow-card" : "thick-golden-glowing-card") : "";
    } catch (g) {
        return console.error("Raw Search HL Error:", g), "";
    }
};