self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("loadmaster-cache").then(cache => {
      return cache.addAll([
        "/",
        "/index.html",
        "/manifest.json",
        "/modules/vehicle_cg.html"
        // Add other modules here
      ]);
    })
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
