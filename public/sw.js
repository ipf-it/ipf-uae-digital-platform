/* IPF UAE service worker.
 * Version bumped 2026-10-05 after the Vande Mataram autoplay fix.
 * On activation we PURGE every cache this origin owns so clients that
 * were serving a stale bundle (which still contained the autoplay
 * useEffect) are forced to re-fetch the current version from the
 * network. */
const SW_VERSION = "ipf-sw-2026-10-05";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      await self.clients.claim();
      // Tell every open client to reload so they pick up the fresh bundle.
      const clientsList = await self.clients.matchAll({ type: "window" });
      for (const client of clientsList) {
        client.postMessage({ type: "ipf-sw-updated", version: SW_VERSION });
      }
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).pathname.startsWith("/api/")) {
    return;
  }
  event.respondWith(
    fetch(request).catch(() => caches.match(request).then((cached) => cached || Response.error())),
  );
});
