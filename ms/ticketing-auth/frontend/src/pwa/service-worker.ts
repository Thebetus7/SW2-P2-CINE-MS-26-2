/**
 * Service Worker para funcionamiento Offline y PWA según PLAN-18.
 */
const CACHE_NAME = 'cinecenter-ticketing-v1';
const STATIC_ASSETS = ['/', '/login', '/cartelera', '/mis-tickets'];

self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('fetch', (event: any) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
