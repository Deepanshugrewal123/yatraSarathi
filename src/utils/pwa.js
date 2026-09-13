/**
 * PWA Service Worker Registration Utility
 *
 * Safely registers the service worker in modern browsers while failing silently
 * in environments without Service Worker support, private browsing modes,
 * or during SSR/automated unit tests.
 */

export function registerServiceWorker() {
  if (
    typeof window === "undefined" ||
    typeof navigator === "undefined" ||
    !("serviceWorker" in navigator)
  ) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        if (import.meta.env?.DEV) {
          console.log(
            "[PWA] ServiceWorker successfully registered with scope:",
            registration.scope
          );
        }
      })
      .catch((err) => {
        // Safe graceful degradation: app continues normal operation even if SW fails
        console.warn("[PWA] ServiceWorker registration ignored/failed:", err);
      });
  });
}
