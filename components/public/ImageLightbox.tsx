'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'

interface ImageLightboxProps {
  src: string
  alt: string
  children: React.ReactNode
  // When provided, the lightbox shows arrows and supports arrow keys and swiping
  onPrev?: () => void
  onNext?: () => void
  // e.g. "2 / 5"
  position?: string
}

// Horizontal distance (px) a touch must travel to count as a swipe
const SWIPE_THRESHOLD = 50

export function ImageLightbox({ src, alt, children, onPrev, onNext, position }: ImageLightboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => setMounted(true), [])

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(true)
  }

  const handleClose = useCallback(() => setIsOpen(false), [])

  // Close on Escape and lock body scroll while open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
      else if (e.key === 'ArrowLeft') onPrev?.()
      else if (e.key === 'ArrowRight') onNext?.()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleClose, onPrev, onNext])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (dx > SWIPE_THRESHOLD) onPrev?.()
    else if (dx < -SWIPE_THRESHOLD) onNext?.()
  }

  const arrowClass =
    'absolute top-1/2 -translate-y-1/2 z-10 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 p-2 sm:p-3 rounded-full'

  const overlay = (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 sm:p-8"
      onClick={handleClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
        aria-label="Close"
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {onPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPrev()
          }}
          className={`${arrowClass} left-2 sm:left-4`}
          aria-label="Previous image"
        >
          <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      {onNext && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
          className={`${arrowClass} right-2 sm:right-4`}
          aria-label="Next image"
        >
          <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
      {position && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/80">
          {position}
        </div>
      )}

      {/* Contained image — click image itself doesn't close */}
      <div
        className="relative w-full h-full max-w-6xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image src={src} alt={alt} fill className="object-contain" sizes="100vw" priority />
      </div>
    </div>
  )

  return (
    <>
      <div onClick={handleOpen} className="cursor-zoom-in">
        {children}
      </div>

      {isOpen && mounted && createPortal(overlay, document.body)}
    </>
  )
}

// Simple wrapper for making any image clickable to open lightbox
export function LightboxImage({
  src,
  alt,
  className,
  fill,
  width,
  height,
  sizes,
  priority,
}: {
  src: string
  alt: string
  className?: string
  fill?: boolean
  width?: number
  height?: number
  sizes?: string
  priority?: boolean
}) {
  return (
    <ImageLightbox src={src} alt={alt}>
      {fill ? (
        <Image
          src={src}
          alt={alt}
          fill
          className={className}
          sizes={sizes}
          priority={priority}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width || 400}
          height={height || 400}
          className={className}
          sizes={sizes}
          priority={priority}
        />
      )}
    </ImageLightbox>
  )
}
