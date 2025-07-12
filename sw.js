const CACHE_NAME = "loadmaster-pro-cache-v1";
const urlsToCache = [
  "index.html",
  "manifest.json",
  "icons/icon-192.png",
  "icons/icon-512.png",
  // Add any module pages you want cached offline:
  "modules/restraint.html",
  "modules/loadshift.html",
  "modules/winching.html",
  "modules/tires_over_100psi.html",
  "modules/vehiclecg.html",
  "modules/sleeper.html",
  "modules/approach.html"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
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