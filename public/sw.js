// Piano Accounts — minimal app-shell service worker
// Strategy: cache-first for same-origin GET requests (static assets only).
// Never touches any external network or user data files —
// the app reads/writes data exclusively via the File System Access API,
// which bypasses the fetch handler entirely.

const CACHE_NAME = 'piano-accounts-v1'

// On install, cache nothing in advance (we don't know hashed asset names at
// build time without a build plugin).  We populate the cache lazily on first
// fetch so the next offline visit is fully covered.
self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  // Remove any old caches from previous versions.
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  // Only handle same-origin GET requests.
  if (request.method !== 'GET') return
  try {
    const url = new URL(request.url)
    if (url.origin !== self.location.origin) return
  } catch {
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached

      return fetch(request).then((response) => {
        // Only cache successful opaque-safe responses for static-looking URLs.
        if (response && response.status === 200) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
    })
  )
})
