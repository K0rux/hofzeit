'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              toast('Neue Version verfügbar', {
                description: 'Bitte laden Sie die Seite neu.',
                action: {
                  label: 'Neu laden',
                  onClick: () => {
                    newWorker.postMessage('skipWaiting')
                    window.location.reload()
                  },
                },
                duration: Infinity,
              })
            }
          })
        })
      })
    }
  }, [])

  return null
}
