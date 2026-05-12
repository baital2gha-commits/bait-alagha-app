const CACHE_NAME = 'bait-alagha-v1';
const assets = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/Images/Logo.avif',
  '/Images/Cover.avif'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      cache.addAll(assets);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
