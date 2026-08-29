/**
 * Door-mode service worker.
 *
 * Door mode is the only part of Vera that has to survive with no network, so
 * it is the only part this caches. Everything else falls through untouched —
 * this worker deliberately does not call respondWith for requests it does not
 * own, so normal browsing is unaffected by its presence.
 *
 * Without it, an offline refresh at the door shows a blank page: the queued
 * scans are safe in IndexedDB, but the operator cannot keep working.
 */
const SHELL_CACHE = "vera-door-shell-v1";
const ASSET_CACHE = "vera-door-assets-v1";

self.addEventListener("install", (event) => {
  // A door reloading mid-event should get the new worker immediately rather
  // than waiting for every tab to close.
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();

      await Promise.all(
        names
          .filter((name) => name !== SHELL_CACHE && name !== ASSET_CACHE)
          .filter((name) => name.startsWith("vera-door-"))
          .map((name) => caches.delete(name)),
      );

      await self.clients.claim();
    })(),
  );
});

const isDoorPage = (url) =>
  url.origin === self.location.origin &&
  /^\/organizer\/events\/[^/]+\/check-in\/?$/.test(url.pathname);

const isBuildAsset = (url) =>
  url.origin === self.location.origin &&
  (url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/fonts/"));

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // The API must never be served from cache — a stale roster or a replayed
  // sync response would be worse than an honest failure.
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Build assets are content-hashed, so cache-first is safe and makes an
  // offline reload instant.
  if (isBuildAsset(url)) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);

        if (cached) {
          return cached;
        }

        const response = await fetch(request);

        if (response.ok) {
          const cache = await caches.open(ASSET_CACHE);
          cache.put(request, response.clone());
        }

        return response;
      })(),
    );
    return;
  }

  // The door page itself: network-first so an online reload is always fresh,
  // falling back to the last good copy when there is no signal.
  if (request.mode === "navigate" && isDoorPage(url)) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);

          if (response.ok) {
            const cache = await caches.open(SHELL_CACHE);
            cache.put(request, response.clone());
          }

          return response;
        } catch {
          const cached = await caches.match(request);

          if (cached) {
            return cached;
          }

          return new Response(
            "<!doctype html><meta charset=utf-8><title>Door mode</title>" +
              "<body style=\"font-family:system-ui;padding:40px;line-height:1.5\">" +
              "<h1>Door mode is not cached yet</h1>" +
              "<p>Open this page once while online to make it work offline.</p>",
            { status: 200, headers: { "Content-Type": "text/html" } },
          );
        }
      })(),
    );
  }
});
