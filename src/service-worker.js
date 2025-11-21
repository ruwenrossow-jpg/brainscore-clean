import { build, files, version } from '$service-worker';

const CACHE = `cache-${version}`;
const ASSETS = [...build, ...files];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(async (keys) => {
      for (const key of keys) {
        if (key !== CACHE) await caches.delete(key);
      }
      await self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  async function respond() {
    const url = new URL(event.request.url);
    const cache = await caches.open(CACHE);

    // Serve cached assets
    if (ASSETS.includes(url.pathname)) {
      const response = await cache.match(url.pathname);
      if (response) return response;
    }

    // Try network first for dynamic content
    try {
      const response = await fetch(event.request);
      
      // Cache successful responses
      if (response.status === 200) {
        cache.put(event.request, response.clone());
      }
      
      return response;
    } catch {
      // Fallback to cache
      const response = await cache.match(event.request);
      if (response) return response;

      // Return offline page for navigation requests
      if (event.request.mode === 'navigate') {
        const fallback = await cache.match('/');
        if (fallback) return fallback;
      }

      return new Response('Network error', {
        status: 408,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  }

  event.respondWith(respond());
});
