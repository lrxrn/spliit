'use client'

import { ToastAction } from '@/components/ui/toast'
import { useToast } from '@/components/ui/use-toast'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

// How often to ask the browser to check for a new service worker (1 hour),
// so long-lived tabs notice deploys without a manual refresh.
const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000

/**
 * Registers the service worker (public/sw.js) that caches static assets to save
 * bandwidth and improve performance, and prompts the user to reload when a new
 * version has been deployed.
 *
 * Registration only runs in production: in development a cached service worker
 * would serve stale assets and mask changes.
 */
export function ServiceWorkerRegistration() {
  const { toast } = useToast()
  const t = useTranslations('Pwa')

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (!('serviceWorker' in navigator)) return

    let cleanup: (() => void) | undefined

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')

        // Reload exactly once the waiting worker takes control, so the page
        // picks up the new assets. Guard against reload loops.
        let refreshing = false
        const onControllerChange = () => {
          if (refreshing) return
          refreshing = true
          window.location.reload()
        }
        navigator.serviceWorker.addEventListener(
          'controllerchange',
          onControllerChange,
        )

        const promptUpdate = (worker: ServiceWorker) => {
          toast({
            title: t('updateTitle'),
            description: t('updateDescription'),
            duration: Infinity,
            action: (
              <ToastAction
                altText={t('reload')}
                onClick={() => worker.postMessage('SKIP_WAITING')}
              >
                {t('reload')}
              </ToastAction>
            ),
          })
        }

        // A new worker may already be waiting (installed before this page load).
        if (registration.waiting && navigator.serviceWorker.controller) {
          promptUpdate(registration.waiting)
        }

        // Otherwise watch for one to finish installing.
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return
          newWorker.addEventListener('statechange', () => {
            // `controller` is only set when an older worker is already in
            // control, which distinguishes an update from a first install.
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              promptUpdate(newWorker)
            }
          })
        })

        // Proactively check for updates on an interval and when the tab is
        // brought back to the foreground.
        const interval = window.setInterval(
          () => registration.update(),
          UPDATE_CHECK_INTERVAL,
        )
        const onVisibilityChange = () => {
          if (document.visibilityState === 'visible') registration.update()
        }
        document.addEventListener('visibilitychange', onVisibilityChange)

        cleanup = () => {
          navigator.serviceWorker.removeEventListener(
            'controllerchange',
            onControllerChange,
          )
          document.removeEventListener('visibilitychange', onVisibilityChange)
          window.clearInterval(interval)
        }
      } catch (error) {
        console.error('Service worker registration failed:', error)
      }
    }

    if (document.readyState === 'complete') {
      register()
    } else {
      const onLoad = () => register()
      window.addEventListener('load', onLoad)
      cleanup = () => window.removeEventListener('load', onLoad)
    }

    return () => cleanup?.()
  }, [toast, t])

  return null
}
