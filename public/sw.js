// ─────────────────────────────────────────────────────────────────────────────
// Service Worker — Generator Subscription System
// Update CACHE_VERSION on every production deployment to bust stale caches.
// ─────────────────────────────────────────────────────────────────────────────

const CACHE_VERSION = 'v1.0.0'

const CACHES = {
  shell:  `shell-${CACHE_VERSION}`,   // offline page + manifest
  static: `static-${CACHE_VERSION}`,  // Next.js chunks, fonts, icons
  api:    `api-${CACHE_VERSION}`,     // Supabase responses (for offline reads)
}

// Pages / assets that must be cached at install time so offline works immediately
const SHELL_PRECACHE = [
  '/offline',
  '/manifest.json',
  '/icons/192',
  '/icons/512',
]

// ─── INSTALL ─────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  // Take control immediately — don't wait for old SW to retire
  self.skipWaiting()

  event.waitUntil(
    caches.open(CACHES.shell).then((cache) =>
      // Use allSettled so a single 404 doesn't abort the whole install
      Promise.allSettled(SHELL_PRECACHE.map((url) => cache.add(url)))
    )
  )
})

// ─── ACTIVATE ────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Immediately control all open tabs
      self.clients.claim(),

      // Delete every cache that doesn't belong to this version
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((key) => !Object.values(CACHES).includes(key))
            .map((key) => caches.delete(key))
        )
      ),
    ])
  )
})

// ─── FETCH ───────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ignore non-GET and non-http(s)
  if (request.method !== 'GET') return
  if (!url.protocol.startsWith('http')) return

  // Skip Next.js RSC prefetch requests — they carry special headers and
  // caching them can break client-side navigation.
  if (
    request.headers.get('RSC') === '1' ||
    request.headers.get('Next-Router-Prefetch') === '1'
  ) return

  // ── 1. Supabase API → Network First ──────────────────────────────────────
  // Always try the network; fall back to a stale cached response so the user
  // can still read data when offline.
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(networkFirst(request, CACHES.api, 4000))
    return
  }

  // ── 2. Next.js static chunks → Cache First ────────────────────────────────
  // These are content-hashed (_next/static/...) so stale = safe forever.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, CACHES.static))
    return
  }

  // ── 3. App icons + manifest → Cache First ────────────────────────────────
  if (
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/manifest.json' ||
    url.pathname === '/favicon.ico' ||
    url.pathname === '/apple-icon' ||
    url.pathname === '/icon'
  ) {
    event.respondWith(cacheFirst(request, CACHES.shell))
    return
  }

  // ── 4. Page navigation → Network, offline page on failure ─────────────────
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches
          .match('/offline')
          .then((r) => r || new Response('Offline', { status: 503 }))
      )
    )
    return
  }

  // ── 5. Everything else → Stale While Revalidate ───────────────────────────
  event.respondWith(staleWhileRevalidate(request, CACHES.static))
})

// ─── STRATEGIES ──────────────────────────────────────────────────────────────

/**
 * Cache First — return cached copy instantly; fetch & update cache in background.
 * Best for: versioned static assets that never change once deployed.
 */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      await cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('Asset not available offline', { status: 503 })
  }
}

/**
 * Network First — hit the network; fall back to cache on timeout/error.
 * Best for: API responses where freshness matters but offline reads are useful.
 */
async function networkFirst(request, cacheName, timeoutMs = 5000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(request, { signal: controller.signal })
    clearTimeout(timer)

    if (response.ok) {
      const cache = await caches.open(cacheName)
      await cache.put(request, response.clone())
    }
    return response
  } catch {
    clearTimeout(timer)

    const cached = await caches.match(request)
    if (cached) return cached

    return new Response(
      JSON.stringify({ error: 'offline', cached: false }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

/**
 * Stale While Revalidate — serve cache immediately, update in background.
 * Best for: semi-static resources where a slightly stale response is acceptable.
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)

  // Kick off a background revalidation regardless of cache hit
  const revalidate = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone())
      return response
    })
    .catch(() => cached)

  // Return stale immediately if we have it, otherwise await network
  return cached || revalidate
}
