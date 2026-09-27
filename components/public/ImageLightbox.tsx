'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'

interface ImageLightboxProps {
  src: string
  alt: string
  children: React.ReactNode
}

export function ImageLightbox({ src, alt, children }: ImageLightboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

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

  const overlay = (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 sm:p-8"
      onClick={handleClose}
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
