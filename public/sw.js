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

// Sync games with server
async function syncGames() {
  const db = await openDB();
  const pendingGames = await db.getAll('games', 'syncStatus', 'pending');
  
  for (const game of pendingGames) {
    try {
      const response = await fetch('/rest/v1/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': self.SUPABASE_KEY,
          'Authorization': `Bearer ${self.SUPABASE_KEY}`
        },
        body: JSON.stringify(game)
      });

      if (response.ok) {
        await db.delete('games', game.id);
      }
    } catch (error) {
      console.error('Sync failed for game:', error);
    }
  }
}