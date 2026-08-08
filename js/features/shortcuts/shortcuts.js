function initCategories() {
    var htmlStr = "",
        counter = 1;
    if (currentFilterTab === 'SINGLE') {
        (U_BLOCKS || []).forEach((block, index) => {
            var activeClass = activeFilters.has('block-' + index) ? 'shortcut-btn active-filter' : 'shortcut-btn';
            htmlStr += `<button class="${activeClass}" data-num="${counter}" data-id="block-${index}" data-name="${block[2]}" onclick="toggleFilter('block-${index}', '${block[2]}')"><span class="c-amber">${counter}</span><div class="filter-text-wrap" data-fcat="f-block-${index}" id="f-block-${index}">${block[2]}</div></button>`;
            counter++;
        });
    } else if (currentFilterTab === 'COMBINED') {
        for (var group in COMBINED_GROUPS) {
            var activeClass = activeFilters.has('combined-' + group) ? 'shortcut-btn active-filter' : 'shortcut-btn';
            htmlStr += `<button class="${activeClass}" data-num="${counter}" data-id="combined-${group}" data-name="${group}" onclick="toggleFilter('combined-${group}', '${group}')"><span class="c-amber">${counter}</span><div class="filter-text-wrap" data-fcat="f-combined-${group}" id="f-combined-${group}">${group}</div></button>`;
            counter++;
        }
    } else if (currentFilterTab === 'GENCAT') {
        if (window.GC_DATA) {
            var hStr = "",
                cnt = 1,
                cats = [];
            for (var k in window.GC_DATA) cats.push({
                k: k,
                f: window.GC_DATA[k].f
            });
            cats.sort((a, b) => a.f.localeCompare(b.f));
            cats.forEach((c, idx) => {
                var id = 'gencat-' + idx;
                var aCls = activeFilters.has(id) ? 'shortcut-btn active-filter' : 'shortcut-btn';
                hStr += `<button class="${aCls}" data-num="${cnt}" data-short="${c.k}" data-id="${id}" data-name="${c.f}" onclick="toggleFilter('${id}', '${c.f}')"><span class="c-amber">${cnt}</span><span class="c-amber">${c.k}</span><div class="filter-text-wrap" data-fcat="f-${id}" id="f-${id}">${c.f}</div></button>`;
                cnt++;
            });
            shortcutsContainer.innerHTML = hStr;
            if (categorySearch.value) {
                filterCategories();
            } else {
                setTimeout(() => {
                    for (var i = 0; i < shortcutsContainer.children.length; i++) {
                        var btn = shortcutsContainer.children[i],
                            id = `f-${btn.dataset.id}`,
                            wrap = document.getElementById(id);
                        if (wrap) {
                            var sL = (window.APP_S && window.APP_S[id] && window.APP_S[id].l !== undefined) ? window.APP_S[id].l : (window.PENDING_FCAT_SCROLLS ? window.PENDING_FCAT_SCROLLS[id] : 0);
                            if (sL) wrap.scrollLeft = sL;
                        }
                    }
                }, 0);
            }
        }
        return;
    }
    shortcutsContainer.innerHTML = htmlStr;
    if (categorySearch.value) {
        filterCategories();
    } else {
        setTimeout(() => {
            for (var i = 0; i < shortcutsContainer.children.length; i++) {
                var btn = shortcutsContainer.children[i],
                    id = `f-${btn.dataset.id}`,
                    wrap = document.getElementById(id);
                if (wrap) {
                    var sL = (window.APP_S && window.APP_S[id] && window.APP_S[id].l !== undefined) ? window.APP_S[id].l : (window.PENDING_FCAT_SCROLLS ? window.PENDING_FCAT_SCROLLS[id] : 0);
                    if (sL) wrap.scrollLeft = sL;
                }
            }
        }, 0);
    }
}

function switchFilterTab(e) {
    currentFilterTab = e;
    ["tabSingle", "tabCombined", "tabGenCat"].forEach(id => {
        var el = document.getElementById(id);
        if (el) {
            var isActive = (id === "tabSingle" && e === "SINGLE") || (id === "tabCombined" && e === "COMBINED") || (id === "tabGenCat" && e === "GENCAT");
            el.style.color = isActive ? "var(--amber)" : "var(--text-muted)";
            el.style.borderBottom = isActive ? "3px solid var(--amber)" : "3px solid transparent";
        }
    });
    initCategories();
}

function filterCategories() {
    clearTimeout(fTO);
    fTO = setTimeout(() => {
        var searchQuery = categorySearch.value.toLowerCase().trim(),
            isNumeric = /^\d+$/.test(searchQuery),
            buttons = shortcutsContainer.children;
        for (var i = 0; i < buttons.length; i++) {
            var prefix, highlightText, btn = buttons[i],
                btnName = btn.dataset.name,
                btnId = btn.dataset.id,
                btnNameLower = btnName.toLowerCase(),
                shortCode = (btn.dataset.short || "").toLowerCase();
            var numHtml = `<span class="c-amber">${btn.dataset.num}</span>`;
            var sfHtml = btn.dataset.short ? `<span class="c-amber">${btn.dataset.short}</span>` : "";
            if (isNumeric) {
                if (btn.dataset.num === searchQuery) {
                    btn.style.display = "";
                    btn.innerHTML = `${numHtml}${sfHtml}<div class="filter-text-wrap" data-fcat="f-${btnId}" id="f-${btnId}">${btnName}</div>`;
                } else {
                    btn.style.display = "none";
                }
            } else if (searchQuery && shortCode === searchQuery) {
                btn.style.display = "";
                btn.innerHTML = `${numHtml}<span class="c-amber"><span class="highlight-text">${btn.dataset.short}</span></span><div class="filter-text-wrap" data-fcat="f-${btnId}" id="f-${btnId}">${btnName}</div>`;
            } else if (searchQuery && btnNameLower.includes(searchQuery)) {
                btn.style.display = "";
                var matchIndex = btnNameLower.indexOf(searchQuery);
                prefix = btnName.substring(0, matchIndex);
                highlightText = btnName.substring(matchIndex, matchIndex + searchQuery.length);
                var suffix = btnName.substring(matchIndex + searchQuery.length);
                btn.innerHTML = `${numHtml}${sfHtml}<div class="filter-text-wrap" data-fcat="f-${btnId}" id="f-${btnId}">${prefix}<span class="highlight-text">${highlightText}</span>${suffix}</div>`;
            } else if (searchQuery) {
                btn.style.display = "none";
            } else {
                btn.style.display = "";
                btn.innerHTML = `${numHtml}${sfHtml}<div class="filter-text-wrap" data-fcat="f-${btnId}" id="f-${btnId}">${btnName}</div>`;
            }
        }
        if (document.activeElement === categorySearch) shortcutsContainer.scrollTop = 0;
        setTimeout(() => {
            for (var i = 0; i < buttons.length; i++) {
                var btn = buttons[i];
                if (btn.style.display === "none") continue;
                var id = `f-${btn.dataset.id}`,
                    wrap = document.getElementById(id);
                if (wrap) {
                    if (searchQuery && !isNumeric && btn.dataset.name.toLowerCase().includes(searchQuery)) {
                        var hl = wrap.querySelector(".highlight-text");
                        if (hl) wrap.scrollLeft = hl.offsetLeft - (wrap.clientWidth / 2) + (hl.clientWidth / 2);
                    } else {
                        var sL = (window.APP_S && window.APP_S[id] && window.APP_S[id].l !== undefined) ? window.APP_S[id].l : (window.PENDING_FCAT_SCROLLS ? window.PENDING_FCAT_SCROLLS[id] : 0);
                        if (sL) wrap.scrollLeft = sL;
                    }
                }
            }
        }, 0);
    }, 0);
}