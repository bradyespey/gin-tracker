const CACHE_NAME = 'gin-rummy-cache-v1';
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        OFFLINE_URL,
        '/src/main.tsx',
        '/src/index.css'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
  } else {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
  }
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-games') {
    event.waitUntil(
      fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    );
  }
});