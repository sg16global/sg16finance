/* Self-uninstalling service worker (kill switch).
   The previous Pages-era SW was cache-first: it served stale copies after every deploy,
   which broke pages whose assets no longer existed. Browsers still holding that SW
   will download this file, delete every cache it created, and uninstall themselves.
   After that, all requests go straight to the network and always get the live site.
   Do NOT add a fetch handler or precache list here. */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))),
      self.clients.claim(),
      self.registration.unregister(),
    ]),
  );
});
