'use client'

import { useEffect } from 'react'

/**
 * Registers the service worker (public/sw.js) that caches static assets to save
 * bandwidth and improve performance. Registration only runs in production: in
 * development a cached service worker would serve stale assets and mask changes.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (!('serviceWorker' in navigator)) return

    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('Service worker registration failed:', error)
      })
    }

    if (document.readyState === 'complete') {
      register()
    } else {
      window.addEventListener('load', register)
      return () => window.removeEventListener('load', register)
    }
  }, [])

  return null
}
