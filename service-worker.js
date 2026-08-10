const CACHE_VERSION = "v0.0.3";
const CACHE_NAME = `glyphlab-dynamic-${CACHE_VERSION}`;

const SHELL_ASSETS = [
    "./",
    "./index.html",
    "./manifest.json",
    "./assets/icon.png",
    "./css/base/reset.css",
    "./js/app-init.js"
];

self.addEventListener("install", (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(SHELL_ASSETS).catch(err => console.warn("Shell cache partial fail:", err));
        })
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME && key.startsWith("glyphlab-")) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener("message", (event) => {
    if (event.data === "SKIP_WAITING" || (event.data && event.data.type === "SKIP_WAITING")) {
        self.skipWaiting();
    }
});

self.addEventListener("fetch", (event) => {
    const req = event.request;
    if (req.method !== "GET" || !req.url.startsWith("http")) return;

    event.respondWith(
        caches.match(req, {
            ignoreSearch: true
        }).then((cachedResponse) => {
            const networkFetch = fetch(req).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
                    const clone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(req, clone)).catch(() => {});
                }
                return networkResponse;
            }).catch(() => {
                return cachedResponse;
            });

            return cachedResponse || networkFetch;
        })
    );
});