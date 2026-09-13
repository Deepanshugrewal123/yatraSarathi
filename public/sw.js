/**
 * YatraSarathi — Progressive Web App Service Worker
 *
 * Cache Strategy:
 * - App Shell: Pre-caches critical entry assets on install.
 * - Navigation: Network-first, falls back to pre-cached shell when offline.
 * - Static Assets: Cache-first with network revalidation for local bundled assets.
 * - API & Secrets: STRICTLY BYPASSES /api/ and external APIs. Never caches sensitive data.
 * - Map Tiles: Bypasses third-party OpenStreetMap tile caching to respect usage policies.
 */

const CACHE_NAME = "yatrasarathi-static-v1";

const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/favicon.svg"
];

// Install Event: Precache app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch((err) => {
        // Precache error should not break service worker registration
        console.warn("[SW] Precache warning:", err);
      })
  );
});

// Activate Event: Clean up stale/outdated caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
            return null;
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch Event: Intelligent routing and caching
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  // STRICT PRIVACY & API BOUNDARY: Never cache /api/ endpoints
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Strictly avoid caching cross-origin third-party resources (OSM tiles, external CDNs)
  if (url.origin !== self.location.origin) {
    return;
  }

  // Navigation requests (HTML pages): Network-first with cache fallback
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cached = await caches.match("/index.html");
        return cached || (await caches.match("/"));
      })
    );
    return;
  }

  // Static Assets (JS, CSS, SVGs, Images): Cache-first with background revalidation
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Asynchronously revalidate in background if online
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {
            // Offline - ignore network revalidation failure
          });
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== "basic"
        ) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});
