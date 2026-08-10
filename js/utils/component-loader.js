(async function initGlyphLab() {
    const load = async (path) => {
        try {
            const res = await fetch(path);
            if (!res.ok) throw new Error(res.statusText);
            return await res.text();
        } catch (err) {
            console.error(`Error loading ${path}:`, err);
            return "";
        }
    };

    const iconNames = [
        "bkm", "clr", "det", "exp", "fab", "fil", 
        "fnt", "gsi", "imp", "rnd", "sch", "set", "spn"
    ];

    const [
        headMeta,
        spriteShell,
        mainGridShell,
        mainGridLoaders,
        mainGridRoot,
        sidebarShell,
        sidebarHeader,
        sidebarSettings,
        sidebarCacheControls,
        topbarShell,
        topbarHeaderBrand,
        topbarPanelSearch,
        topbarPanelJump,
        topbarPanelDraft,
        modalHeader,
        modalShell,
        modalBkmActions,
        modalBkmTabs,
        modalBkmLists,
        modalBkmShell,
        modalDetailsView,
        modalFontControls,
        modalFontResults,
        modalFontShell,
        modalGsiSearch,
        modalGsiSortArea,
        modalGsiViewport,
        modalGsiShell,
        modalRangeInputs,
        modalRangeExports,
        modalRangeProgress,
        modalRangeShell,
        updateBanner,
        toastNotification,
        fabShell,
        fabMenu,
        fabTrigger,
        filtersShell,
        filterHeader,
        filterSearch,
        filterTabs,
        shortcutsRoot,
        exportCss,
        exportHeader,
        exportFooter,
        ...icons
    ] = await Promise.all([
        load("./html/base/head-meta.html"),
        load("./html/svg/sprite-shell.html"),
        load("./html/layout/main-grid/shell.html"),
        load("./html/layout/main-grid/loaders.html"),
        load("./html/layout/main-grid/root.html"),
        load("./html/layout/sidebar/shell.html"),
        load("./html/layout/sidebar/header.html"),
        load("./html/layout/sidebar/settings.html"),
        load("./html/layout/sidebar/cache-controls.html"),
        load("./html/layout/topbar/shell.html"),
        load("./html/layout/topbar/header-brand.html"),
        load("./html/layout/topbar/panels/search.html"),
        load("./html/layout/topbar/panels/jump.html"),
        load("./html/layout/topbar/panels/draft.html"),
        load("./html/modals/header.html"),
        load("./html/modals/shell.html"),
        load("./html/modals/bookmarks/actions.html"),
        load("./html/modals/bookmarks/tabs.html"),
        load("./html/modals/bookmarks/lists.html"),
        load("./html/modals/bookmarks/shell.html"),
        load("./html/modals/details/view.html"),
        load("./html/modals/fonts/controls.html"),
        load("./html/modals/fonts/results.html"),
        load("./html/modals/fonts/shell.html"),
        load("./html/modals/gsi/search.html"),
        load("./html/modals/gsi/sort-area.html"),
        load("./html/modals/gsi/viewport.html"),
        load("./html/modals/gsi/shell.html"),
        load("./html/modals/range/inputs.html"),
        load("./html/modals/range/exports.html"),
        load("./html/modals/range/progress.html"),
        load("./html/modals/range/shell.html"),
        load("./html/features/alerts/update-banner.html"),
        load("./html/features/alerts/toast-notification.html"),
        load("./html/features/fab/shell.html"),
        load("./html/features/fab/menu.html"),
        load("./html/features/fab/trigger.html"),
        load("./html/features/filters/shell.html"),
        load("./html/features/filters/header.html"),
        load("./html/features/filters/search.html"),
        load("./html/features/filters/tabs.html"),
        load("./html/features/filters/shortcuts-root.html"),
        load("./css/templates/export.css"),
        load("./html/templates/export/header.html"),
        load("./html/templates/export/footer.html"),
        ...iconNames.map(name => load(`./html/svg/icons/${name}.html`))
    ]);

    window.EXPORT_TEMPLATES = {
        css: exportCss,
        header: exportHeader,
        footer: exportFooter
    };

    const fullSprite = spriteShell.replace("%ICONS%", () => icons.join(""));
    const fullMainGrid = mainGridShell.replace("%LOADERS%", () => mainGridLoaders).replace("%ROOT%", () => mainGridRoot);
    const fullSidebar = sidebarShell
        .replace("%HEADER%", () => sidebarHeader)
        .replace("%SETTINGS%", () => sidebarSettings)
        .replace("%CACHE_CONTROLS%", () => sidebarCacheControls);

    const fullTopbar = topbarShell
        .replace("%HEADER_BRAND%", () => topbarHeaderBrand)
        .replace("%PANEL_SEARCH%", () => topbarPanelSearch)
        .replace("%PANEL_JUMP%", () => topbarPanelJump)
        .replace("%PANEL_DRAFT%", () => topbarPanelDraft);

    const fullBkmModal = modalBkmShell
        .replace("%ACTIONS%", () => modalBkmActions)
        .replace("%TABS%", () => modalBkmTabs)
        .replace("%LISTS%", () => modalBkmLists);

    const fullFontModal = modalFontShell
        .replace("%CONTROLS%", () => modalFontControls)
        .replace("%RESULTS%", () => modalFontResults);

    const fullGsiModal = modalGsiShell
        .replace("%SEARCH%", () => modalGsiSearch)
        .replace("%SORT_AREA%", () => modalGsiSortArea)
        .replace("%VIEWPORT%", () => modalGsiViewport);

    const fullRangeModal = modalRangeShell
        .replace("%INPUTS%", () => modalRangeInputs)
        .replace("%EXPORTS%", () => modalRangeExports)
        .replace("%PROGRESS%", () => modalRangeProgress);

    const mountedModal = modalShell
        .replace("%HEADER%", () => modalHeader)
        .replace('<div id="mount-details"></div>', () => modalDetailsView)
        .replace('<div id="mount-range"></div>', () => fullRangeModal)
        .replace('<div id="mount-transform"></div>', () => fullFontModal)
        .replace('<div id="mount-bkm"></div>', () => fullBkmModal)
        .replace('<div id="mount-gsi"></div>', () => fullGsiModal);

    const fullFab = fabShell
        .replace("%FAB_MENU%", () => fabMenu)
        .replace("%FAB_TRIGGER%", () => fabTrigger);

    const fullFilters = filtersShell
        .replace("%HEADER%", () => filterHeader)
        .replace("%SEARCH%", () => filterSearch)
        .replace("%TABS%", () => filterTabs)
        .replace("%SHORTCUTS%", () => shortcutsRoot);

    const fullAlerts = updateBanner + toastNotification;
    const fullHTML = fullSprite + fullSidebar + fullTopbar + fullMainGrid + mountedModal + fullFilters + fullFab + fullAlerts;

    document.head.insertAdjacentHTML("afterbegin", headMeta);
    document.body.insertAdjacentHTML("afterbegin", fullHTML);

    const scriptsHTML = await load("./html/base/scripts.html");
    const parser = new DOMParser();
    const doc = parser.parseFromString(scriptsHTML, "text/html");
    const scripts = Array.from(doc.querySelectorAll("script"));
    const totalScripts = scripts.length;
    let loadedCount = 0;

    const checkDone = () => {
        if (++loadedCount === totalScripts) {
            document.dispatchEvent(new Event("DOMContentLoaded"));
            window.dispatchEvent(new Event("load"));
        }
    };

    if (totalScripts !== 0) {
        scripts.forEach(oldScript => {
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
        document.dispatchEvent(new Event("DOMContentLoaded"));
        window.dispatchEvent(new Event("load"));
    }
})();