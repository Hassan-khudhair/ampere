'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          // updateViaCache: 'none' ensures the browser always fetches the SW
          // file fresh from the network (bypasses HTTP cache), so updates deploy
          // immediately without users needing to hard-refresh.
          updateViaCache: 'none',
        })

        // Check for updates every 60 seconds while the app is open
        const interval = setInterval(() => registration.update(), 60_000)

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // A new version is ready. Reload to activate it.
              // In production you might show a "New version available — refresh"
              // banner instead of auto-reloading.
              window.location.reload()
            }
          })
        })

        return () => clearInterval(interval)
      } catch (err) {
        console.warn('[SW] Registration failed:', err)
      }
    }

    // Register after the page is fully loaded so it doesn't delay LCP
    if (document.readyState === 'complete') {
      register()
    } else {
      window.addEventListener('load', register, { once: true })
    }
  }, [])

  return null
}
