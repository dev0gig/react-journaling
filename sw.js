/**
 * Service Worker for Offline-First Caching
 *
 * This service worker implements two caching strategies to improve performance and enable offline functionality:
 * 1. Network Fallback, then Cache: For the main HTML document. This ensures users always get the latest version if they are online.
 * 2. Cache, then Network Fallback: For all static assets (CSS, JS, images, fonts). This serves assets instantly from the cache.
 */

const CACHE_NAME = 'knowledge-journal-cache-v1';

// A list of essential assets to be pre-cached during the service worker installation.
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx', // In a real app this would be the bundled JS file
  'https://cdn-icons-png.freepik.com/512/3352/3352473.png',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200',
  'https://fonts.gstatic.com/s/materialsymbolsoutlined/v195/kJF1BvYX7BgnkSrUwT8OhrdQw4oELdPIeeII9v6oFsI.woff2',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
];

/**
 * Install Event
 * Fired when the service worker is first installed.
 * It opens a cache and adds the essential assets to it.
 */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching essential assets');
        // Pre-cache the assets. If any asset fails to download, the installation will fail.
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch(error => {
        console.error('[Service Worker] Failed to cache assets during install:', error);
      })
  );
});

/**
 * Activate Event
 * Fired when the service worker is activated.
 * It cleans up old, unused caches to free up storage.
 */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // If the cache name is different from the current one, it's an old cache.
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

/**
 * Fetch Event
 * Fired for every network request made by the page.
 * It intercepts requests and applies the appropriate caching strategy.
 */
self.addEventListener('fetch', event => {
  const { request } = event;

  // Strategy 1: Network Fallback, then Cache (for navigation requests, e.g., HTML files)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // If the network request succeeds, clone the response.
          const responseToCache = response.clone();
          // Cache the new response for future offline use.
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(request, responseToCache);
            });
          // Return the fresh response from the network.
          return response;
        })
        .catch(() => {
          // If the network request fails (e.g., user is offline),
          // try to serve the page from the cache.
          console.log('[Service Worker] Network failed, serving from cache for:', request.url);
          return caches.match('/'); // Fallback to the cached root page.
        })
    );
    return;
  }

  // Strategy 2: Cache, then Network Fallback (for static assets)
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        // If the asset is found in the cache, return it immediately.
        if (cachedResponse) {
          return cachedResponse;
        }

        // If the asset is not in the cache, fetch it from the network.
        return fetch(request).then(networkResponse => {
            // If the fetch succeeds, cache the new response and return it.
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(request, responseToCache);
              });
            return networkResponse;
          })
          .catch(error => {
              console.error('[Service Worker] Fetch failed for:', request.url, error);
              // We could return a placeholder for failed assets like images here if needed.
          });
      })
  );
});
