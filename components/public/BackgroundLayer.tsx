'use client'

import { useEffect, useRef } from 'react'

interface BackgroundLayerProps {
  src: string
  style: 'cover' | 'tile'
  /** How strongly the image shows through the background color (0–100) */
  strength: number
  parallax: boolean
}

// Fraction of the page scroll the background moves: 0 = fixed, 1 = scrolls with content
const PARALLAX_SPEED = 0.2

/**
 * Site-wide background image fixed behind the page, with an optional parallax
 * drift on scroll. Respects the user's "reduce motion" preference.
 */
export function BackgroundLayer({ src, style, strength, parallax }: BackgroundLayerProps) {
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = imageRef.current
    if (!el || !parallax) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0

    // Make the layer tall enough that drifting never reveals an edge
    const resize = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      el.style.height = `${window.innerHeight + Math.max(0, maxScroll) * PARALLAX_SPEED}px`
    }
    const update = () => {
      frame = 0
      el.style.transform = `translate3d(0, ${-window.scrollY * PARALLAX_SPEED}px, 0)`
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    resize()
    update()
    const observer = new ResizeObserver(resize)
    observer.observe(document.body)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', resize)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', resize)
      el.style.height = ''
      el.style.transform = ''
    }
  }, [parallax])

  return (
    <>
      <div
        ref={imageRef}
        aria-hidden
        className="fixed inset-x-0 top-0 h-screen -z-10 bg-center will-change-transform"
        style={{
          backgroundImage: `url("${src.replace(/"/g, '%22')}")`,
          backgroundSize: style === 'tile' ? 'auto' : 'cover',
          backgroundRepeat: style === 'tile' ? 'repeat' : 'no-repeat',
        }}
      />
      {/* Veil in the background color controls how strongly the image shows */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 bg-background"
        style={{ opacity: 1 - strength / 100 }}
      />
    </>
  )
}
