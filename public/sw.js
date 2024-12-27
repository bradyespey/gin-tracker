// Cache names
const CACHE_NAME = 'gin-rummy-cache-v1';
const OFFLINE_DATA = 'gin-rummy-offline-data';

// Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/src/main.tsx',
        '/src/index.css'
      ]);
    })
  );
});

// Handle fetch requests
self.addEventListener('fetch', (event) => {
  if (event.request.method === 'GET') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request);
        })
    );
  }
});

// Handle background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-games') {
    event.waitUntil(syncGames());
  }
});