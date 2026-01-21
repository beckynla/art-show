'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { ProductImage } from '@/types'
import { ImageLightbox } from './ImageLightbox'

interface ProductGalleryProps {
  images: ProductImage[]
  title: string
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">No image</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image with Lightbox */}
      <ImageLightbox
        src={images[selectedIndex].url}
        alt={`${title} - Image ${selectedIndex + 1}`}
      >
        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-zoom-in">
          <Image
            src={images[selectedIndex].url}
            alt={`${title} - Image ${selectedIndex + 1}`}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          {/* Zoom hint icon */}
          <div className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>
        </div>
      </ImageLightbox>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden ${
                index === selectedIndex
                  ? 'ring-2 ring-primary-600'
                  : 'ring-1 ring-gray-200 hover:ring-gray-300'
              }`}
            >
              <Image
                src={image.url}
                alt={`${title} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
