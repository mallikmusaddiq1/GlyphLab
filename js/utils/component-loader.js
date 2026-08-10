(async function initGlyphLab() {
    const loadHTML = async (path) => {
        try {
            const res = await fetch(path);
            if (!res.ok) throw new Error(res.statusText);
            return await res.text();
        } catch (err) {
            console.error(`Component Load Error (${path}):`, err);
            return "";
        }
    };

    const iconNames = ["bkm", "clr", "det", "exp", "fab", "fil", "fnt", "gsi", "imp", "rnd", "sch", "set", "spn"];

    const components = await Promise.all([
        loadHTML("./html/base/head-meta.html"),
        loadHTML("./html/svg/sprite-shell.html"),
        loadHTML("./html/layout/main-grid/shell.html"),
        loadHTML("./html/layout/main-grid/loaders.html"),
        loadHTML("./html/layout/main-grid/root.html"),
        loadHTML("./html/layout/sidebar/shell.html"),
        loadHTML("./html/layout/sidebar/header.html"),
        loadHTML("./html/layout/sidebar/settings.html"),
        loadHTML("./html/layout/sidebar/cache-controls.html"),
        loadHTML("./html/layout/topbar/shell.html"),
        loadHTML("./html/layout/topbar/header-brand.html"),
        loadHTML("./html/layout/topbar/panels/search.html"),
        loadHTML("./html/layout/topbar/panels/jump.html"),
        loadHTML("./html/layout/topbar/panels/draft.html"),
        loadHTML("./html/modals/header.html"),
        loadHTML("./html/modals/shell.html"),
        loadHTML("./html/modals/bookmarks/actions.html"),
        loadHTML("./html/modals/bookmarks/tabs.html"),
        loadHTML("./html/modals/bookmarks/lists.html"),
        loadHTML("./html/modals/bookmarks/shell.html"),
        loadHTML("./html/modals/details/view.html"),
        loadHTML("./html/modals/fonts/controls.html"),
        loadHTML("./html/modals/fonts/results.html"),
        loadHTML("./html/modals/fonts/shell.html"),
        loadHTML("./html/modals/gsi/search.html"),
        loadHTML("./html/modals/gsi/sort-area.html"),
        loadHTML("./html/modals/gsi/viewport.html"),
        loadHTML("./html/modals/gsi/shell.html"),
        loadHTML("./html/modals/range/inputs.html"),
        loadHTML("./html/modals/range/exports.html"),
        loadHTML("./html/modals/range/progress.html"),
        loadHTML("./html/modals/range/shell.html"),
        loadHTML("./html/features/alerts/update-banner.html"),
        loadHTML("./html/features/alerts/toast-notification.html"),
        loadHTML("./html/features/fab/shell.html"),
        loadHTML("./html/features/fab/menu.html"),
        loadHTML("./html/features/fab/trigger.html"),
        loadHTML("./html/features/filters/shell.html"),
        loadHTML("./html/features/filters/header.html"),
        loadHTML("./html/features/filters/search.html"),
        loadHTML("./html/features/filters/tabs.html"),
        loadHTML("./html/features/filters/shortcuts-root.html"),
        loadHTML("./css/templates/export.css"),
        loadHTML("./html/templates/export/header.html"),
        loadHTML("./html/templates/export/footer.html"),
        ...iconNames.map(name => loadHTML(`./html/svg/icons/${name}.html`))
    ]);

    const [
        headMeta, spriteShell, mainGridShell, mainGridLoaders, mainGridRoot,
        sidebarShell, sidebarHeader, sidebarSettings, sidebarCacheControls,
        topbarShell, topbarHeaderBrand, topbarPanelSearch, topbarPanelJump, topbarPanelDraft,
        modalHeader, modalShell, modalBkmActions, modalBkmTabs, modalBkmLists, modalBkmShell,
        modalDetailsView, modalFontControls, modalFontResults, modalFontShell,
        modalGsiSearch, modalGsiSortArea, modalGsiViewport, modalGsiShell,
        modalRangeInputs, modalRangeExports, modalRangeProgress, modalRangeShell,
        updateBanner, toastNotification, fabShell, fabMenu, fabTrigger,
        filtersShell, filterHeader, filterSearch, filterTabs, shortcutsRoot,
        exportCss, exportHeader, exportFooter, ...icons
    ] = components;

    window.EXPORT_TEMPLATES = {
        css: exportCss,
        header: exportHeader,
        footer: exportFooter
    };

    const domParser = new DOMParser();

    const buildFragment = (templateStr, replacements = {}) => {
        let parsedStr = templateStr;
        for (let [key, value] of Object.entries(replacements)) {
            parsedStr = parsedStr.split(key).join(value);
        }
        const doc = domParser.parseFromString(parsedStr, 'text/html');
        const frag = document.createDocumentFragment();
        Array.from(doc.body.childNodes).forEach(node => frag.appendChild(node));
        return frag;
    };

    document.head.appendChild(buildFragment(headMeta));

    const appWrapper = document.createDocumentFragment();

    appWrapper.appendChild(buildFragment(spriteShell, {
        "%ICONS%": icons.join("")
    }));
    appWrapper.appendChild(buildFragment(sidebarShell, {
        "%HEADER%": sidebarHeader,
        "%SETTINGS%": sidebarSettings,
        "%CACHE_CONTROLS%": sidebarCacheControls
    }));
    appWrapper.appendChild(buildFragment(topbarShell, {
        "%HEADER_BRAND%": topbarHeaderBrand,
        "%PANEL_SEARCH%": topbarPanelSearch,
        "%PANEL_JUMP%": topbarPanelJump,
        "%PANEL_DRAFT%": topbarPanelDraft
    }));
    appWrapper.appendChild(buildFragment(mainGridShell, {
        "%LOADERS%": mainGridLoaders,
        "%ROOT%": mainGridRoot
    }));

    const modalsFrag = buildFragment(modalShell, {
        "%HEADER%": modalHeader
    });
    modalsFrag.getElementById("mount-details")?.appendChild(buildFragment(modalDetailsView));
    modalsFrag.getElementById("mount-range")?.appendChild(buildFragment(modalRangeShell, {
        "%INPUTS%": modalRangeInputs,
        "%EXPORTS%": modalRangeExports,
        "%PROGRESS%": modalRangeProgress
    }));
    modalsFrag.getElementById("mount-transform")?.appendChild(buildFragment(modalFontShell, {
        "%CONTROLS%": modalFontControls,
        "%RESULTS%": modalFontResults
    }));
    modalsFrag.getElementById("mount-bkm")?.appendChild(buildFragment(modalBkmShell, {
        "%ACTIONS%": modalBkmActions,
        "%TABS%": modalBkmTabs,
        "%LISTS%": modalBkmLists
    }));
    modalsFrag.getElementById("mount-gsi")?.appendChild(buildFragment(modalGsiShell, {
        "%SEARCH%": modalGsiSearch,
        "%SORT_AREA%": modalGsiSortArea,
        "%VIEWPORT%": modalGsiViewport
    }));
    appWrapper.appendChild(modalsFrag);

    appWrapper.appendChild(buildFragment(filtersShell, {
        "%HEADER%": filterHeader,
        "%SEARCH%": filterSearch,
        "%TABS%": filterTabs,
        "%SHORTCUTS%": shortcutsRoot
    }));
    appWrapper.appendChild(buildFragment(fabShell, {
        "%FAB_MENU%": fabMenu,
        "%FAB_TRIGGER%": fabTrigger
    }));
    appWrapper.appendChild(buildFragment(updateBanner + toastNotification));

    document.body.prepend(appWrapper);

    const scriptsHTML = await loadHTML("./html/base/scripts.html");
    const scriptDoc = domParser.parseFromString(scriptsHTML, "text/html");
    const scriptTags = Array.from(scriptDoc.querySelectorAll("script"));

    let loadedCount = 0;
    const checkDone = () => {
        if (++loadedCount === scriptTags.length) {
            document.dispatchEvent(new Event("DOMContentLoaded"));
            window.dispatchEvent(new Event("load"));
        }
    };

    if (scriptTags.length !== 0) {
        scriptTags.forEach(oldScript => {
            const newScript = document.createElement("script");
            if (oldScript.src) {
                newScript.src = oldScript.src;
                newScript.async = false;
                newScript.onload = checkDone;
                newScript.onerror = checkDone;
                document.body.appendChild(newScript);
            } else {
                newScript.textContent = oldScript.textContent;
                document.body.appendChild(newScript);
                checkDone();
            }
        });
    } else {
        checkDone();
    }
})();