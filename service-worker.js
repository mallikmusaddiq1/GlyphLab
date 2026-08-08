const CACHE_VERSION = "v0.2",
      CACHE_NAME = `glyphlab-cache-${CACHE_VERSION}`,
      PRECACHE_ASSETS = [
        "./",
        "./index.html",
        "./html/base/head-meta.html",
        "./html/base/scripts.html",
        "./html/features/alerts/toast-notification.html",
        "./html/features/alerts/update-banner.html",
        "./html/features/fab/menu.html",
        "./html/features/fab/shell.html",
        "./html/features/fab/trigger.html",
        "./html/features/filters/header.html",
        "./html/features/filters/search.html",
        "./html/features/filters/shell.html",
        "./html/features/filters/tabs.html",
        "./html/features/filters/shortcuts-root.html",
        "./html/layout/main-grid/loaders.html",
        "./html/layout/main-grid/root.html",
        "./html/layout/main-grid/shell.html",
        "./html/layout/sidebar/cache-controls.html",
        "./html/layout/sidebar/header.html",
        "./html/layout/sidebar/settings.html",
        "./html/layout/sidebar/shell.html",
        "./html/layout/topbar/header-brand.html",
        "./html/layout/topbar/panels/draft.html",
        "./html/layout/topbar/panels/jump.html",
        "./html/layout/topbar/panels/search.html",
        "./html/layout/topbar/shell.html",
        "./html/modals/header.html",
        "./html/modals/shell.html",
        "./html/modals/bookmarks/actions.html",
        "./html/modals/bookmarks/lists.html",
        "./html/modals/bookmarks/shell.html",
        "./html/modals/bookmarks/tabs.html",
        "./html/modals/details/view.html",
        "./html/modals/fonts/controls.html",
        "./html/modals/fonts/results.html",
        "./html/modals/fonts/shell.html",
        "./html/modals/gsi/search.html",
        "./html/modals/gsi/shell.html",
        "./html/modals/gsi/sort-area.html",
        "./html/modals/gsi/viewport.html",
        "./html/modals/range/exports.html",
        "./html/modals/range/inputs.html",
        "./html/modals/range/progress.html",
        "./html/modals/range/shell.html",
        "./css/templates/export.css",
        "./html/templates/export/header.html",
        "./html/templates/export/footer.html",
        "./html/svg/sprite-shell.html",
        "./html/svg/icons/bkm.html",
        "./html/svg/icons/clr.html",
        "./html/svg/icons/det.html",
        "./html/svg/icons/exp.html",
        "./html/svg/icons/fab.html",
        "./html/svg/icons/fil.html",
        "./html/svg/icons/fnt.html",
        "./html/svg/icons/gsi.html",
        "./html/svg/icons/imp.html",
        "./html/svg/icons/rnd.html",
        "./html/svg/icons/sch.html",
        "./html/svg/icons/set.html",
        "./html/svg/icons/spn.html",
        "./css/base/variables.css",
        "./css/base/reset.css",
        "./css/base/typography.css",
        "./css/components/buttons.css",
        "./css/components/inputs.css",
        "./css/components/switches.css",
        "./css/components/cards.css",
        "./css/layout/topbar.css",
        "./css/layout/sidebar.css",
        "./css/layout/modal.css",
        "./css/layout/main-grid.css",
        "./css/features/symbol-card.css",
        "./css/features/fab.css",
        "./css/features/filters.css",
        "./css/features/bookmarks.css",
        "./css/features/fonts.css",
        "./css/features/gsi.css",
        "./css/features/alerts.css",
        "./css/utilities/animations.css",
        "./css/utilities/helpers.css",
        "./css/utilities/media-queries.css",
        "./js/app-init.js",
        "./js/store/app-state.js",
        "./js/utils/component-loader.js",
        "./js/utils/dom.js",
        "./js/utils/formatters.js",
        "./js/utils/string.js",
        "./js/features/fab/fab.js",
        "./js/features/filters/filters.js",
        "./js/features/random/random.js",
        "./js/features/shortcuts/shortcuts.js",
        "./js/modals/fonts/fonts.js",
        "./js/layout/topbar/toolbar.js",
        "./js/layout/sidebar/sidebar.js",
        "./js/modals/bookmarks/bookmarks.js",
        "./js/modals/gsi/gsi.js",
        "./js/layout/main-grid/virtual-grid.js",
        "./js/modals/range/range-export.js",
        "./js/modals/details/details.js",
        "./js/layout/main-grid/live-scroll.js",
        "./js/modals/modal-dialog.js",
        "./js/workers/worker.js",
        "./js/workers/build-graph.js",
        "./js/workers/smart-search.js",
        "./js/workers/render-checker.js",
        "./js/workers/scroll-renderer.js",
        "./lib/localforage.min.js",
        "./data/datasets.json",
        "./data/UnicodeData.txt",
        "./assets/icon.png",
        "./manifest.json",
        "./js/services/storage/dataset-cache.js",
        "./js/services/storage/auto-save.js",
        "./js/services/unicode/visibility-checker.js",
        "./js/services/unicode/unicode-loader.js",
        "./js/services/export/helpers.js",
        "./js/services/export/doc-runtime.js",
        "./js/services/export/templates.js",
        "./js/services/export/generators.js",
        "./js/services/export/png-exporter.js",
        "./js/services/export/importer.js",
        "./js/services/export/bookmark-exporter.js"
      ];

self.addEventListener("install", (t) => {
  t.waitUntil(
    caches.open(CACHE_NAME).then((e) =>
      Promise.allSettled(PRECACHE_ASSETS.map((asset) => e.add(asset).catch(() => {})))
    )
  );
});

self.addEventListener("activate", (t) => {
  t.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) return caches.delete(key);
          })
        )
      )
    ])
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING" || (event.data && event.data.type === "SKIP_WAITING")) {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (t) => {
  if ("GET" !== t.request.method) return;
  const url = new URL(t.request.url);
  
  if (url.pathname.endsWith("service-worker.js") || !url.protocol.startsWith("http")) {
    return;
  }

  t.respondWith(
    caches.match(t.request, { ignoreSearch: true }).then((e) =>
      e ||
      fetch(t.request)
        .then((res) => {
          if (res && 200 === res.status) {
            const s = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(t.request, s)).catch(() => {});
          }
          return res;
        })
        .catch(() => {})
    )
  );
});