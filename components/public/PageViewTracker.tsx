'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Only the first page of a visit came from the outside site in document.referrer
let isFirstView = true

// Records each public page view for the admin Analytics page
export function PageViewTracker() {
  const pathname = usePathname()

  useEffect(() => {
    const body = JSON.stringify({
      path: pathname,
      referrer: isFirstView ? document.referrer : '',
    })
    isFirstView = false

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }))
    } else {
      fetch('/api/track', { method: 'POST', body, keepalive: true }).catch(() => {})
    }
  }, [pathname])

  return null
}
