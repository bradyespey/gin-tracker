//public/sw.js

const CACHE_NAME = 'gin-rummy-cache-v1';

// Listen for sync events
self.addEventListener('sync', async (event) => {
  if (event.tag === 'sync-games') {
    event.waitUntil(syncGames());
  }
});

// Handle fetch events for offline support
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Sync games with server (Firebase)
// Note: Actual sync is handled by gameService.ts using Firebase
// This is kept for service worker registration compatibility
async function syncGames() {
  // Sync is now handled client-side via Firebase
  // Service worker sync events trigger client-side sync manager
  console.log('Sync event received - handled by client-side sync manager');
}