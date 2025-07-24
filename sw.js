const cacheName = "loadmaster-pro-cache-v1";
const assets = [
  "/",
  "/index.html",
  "/style.css",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/modules/restraint.html",
  "/modules/loadshift.html",
  "/modules/winching.html",
  "/modules/tires_over_100psi.html",
  "/modules/vehiclecg.html",
  "/modules/sleeper.html",
  "/modules/approach.html"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(assets);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});