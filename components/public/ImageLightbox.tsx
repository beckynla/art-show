'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface ImageLightboxProps {
  src: string
  alt: string
  children: React.ReactNode
}

export function ImageLightbox({ src, alt, children }: ImageLightboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(true)
    setIsZoomed(false)
  }

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setIsZoomed(false)
  }, [])

  const handleToggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsZoomed(!isZoomed)
  }

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleClose])

  return (
    <>
      <div onClick={handleOpen} className="cursor-zoom-in">
        {children}
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={handleClose}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 z-10"
            aria-label="Close"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Zoom hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {isZoomed ? 'Click to zoom out' : 'Click image to zoom in'} | Press ESC to close
          </div>

          {/* Image container */}
          <div
            className={`relative transition-transform duration-300 ${
              isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            onClick={handleToggleZoom}
          >
            <div
              className={`relative transition-all duration-300 ${
                isZoomed
                  ? 'w-[150vw] h-[150vh] max-w-none'
                  : 'w-[90vw] h-[90vh] max-w-5xl'
              }`}
              style={{ maxHeight: isZoomed ? 'none' : '90vh' }}
            >
              <Image
                src={src}
                alt={alt}
                fill
                className={`object-contain ${isZoomed ? 'object-cover' : 'object-contain'}`}
                sizes="100vw"
                priority
              />
            </div>
          </div>
        </div>
      )}
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
