'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui'
import { GooglePhotosPicker } from './GooglePhotosPicker'
import type { ProductImage } from '@/types'

interface ImageInputProps {
  images: ProductImage[]
  onChange: (images: ProductImage[]) => void
  maxImages?: number
}

export function ImageInput({ images, onChange, maxImages = 10 }: ImageInputProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [error, setError] = useState('')
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [showGooglePicker, setShowGooglePicker] = useState(false)

  const handleFileUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return

      setIsUploading(true)
      setError('')

      const newImages: ProductImage[] = []

      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          setError('Only image files are allowed')
          continue
        }

        if (file.size > 5 * 1024 * 1024) {
          setError('Images must be under 5MB')
          continue
        }

        try {
          const formData = new FormData()
          formData.append('file', file)

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            throw new Error('Upload failed')
          }

          const data = await response.json()
          newImages.push({ type: 'local', url: data.url })
        } catch {
          setError('Failed to upload image')
        }
      }

      if (newImages.length > 0) {
        const combined = [...images, ...newImages].slice(0, maxImages)
        onChange(combined)
      }

      setIsUploading(false)
    },
    [images, onChange, maxImages]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      handleFileUpload(e.dataTransfer.files)
    },
    [handleFileUpload]
  )

  const handleAddUrl = () => {
    if (!urlInput.trim()) return

    setError('')
    const trimmedUrl = urlInput.trim()

    // Validate URL
    try {
      const parsedUrl = new URL(trimmedUrl)

      // Only allow http:// and https:// URLs, not file:// or other protocols
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        setError('Only http:// and https:// URLs are supported. To upload a local file, use the drag-and-drop area above.')
        return
      }
    } catch {
      setError('Please enter a valid URL (starting with http:// or https://)')
      return
    }

    const newImage: ProductImage = { type: 'external', url: trimmedUrl }
    const combined = [...images, newImage].slice(0, maxImages)
    onChange(combined)
    setUrlInput('')
  }

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newImages = [...images]
    const draggedImage = newImages[draggedIndex]
    newImages.splice(draggedIndex, 1)
    newImages.splice(index, 0, draggedImage)
    onChange(newImages)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <div className="space-y-4">
      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={`${image.url}-${index}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative group aspect-square rounded-lg overflow-hidden border-2 cursor-move ${
                draggedIndex === index ? 'border-primary-500 opacity-50' : 'border-gray-200'
              }`}
            >
              <Image
                src={image.url}
                alt={`Image ${index + 1}`}
                fill
                className="object-cover"
              />
              {index === 0 && (
                <span className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                  Primary
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <span className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {image.type}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors"
        >
          <input
            type="file"
            id="file-upload"
            multiple
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer"
          >
            <svg
              className="w-12 h-12 text-gray-400 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-gray-600">
              {isUploading ? (
                'Uploading...'
              ) : (
                <>
                  <span className="text-primary-600 hover:text-primary-700">Click to upload</span>
                  {' '}or drag and drop
                </>
              )}
            </p>
            <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF, WebP up to 5MB</p>
          </label>
        </div>
      )}

      {/* URL Input and Google Photos */}
      {images.length < maxImages && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Or paste an image URL (https://...)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Button type="button" variant="secondary" onClick={handleAddUrl}>
              Add URL
            </Button>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setShowGooglePicker(true)}
            className="w-full"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z"/>
            </svg>
            Select from Google Photos
          </Button>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Help Text */}
      <p className="text-sm text-gray-500">
        Drag images to reorder. The first image will be the primary image shown on the shop.
        {images.length > 0 && ` ${images.length}/${maxImages} images added.`}
      </p>

      {/* Google Photos Picker */}
      {showGooglePicker && (
        <GooglePhotosPicker
          onSelect={(url) => {
            const newImage: ProductImage = { type: 'external', url }
            const combined = [...images, newImage].slice(0, maxImages)
            onChange(combined)
            setShowGooglePicker(false)
          }}
          onClose={() => setShowGooglePicker(false)}
        />
      )}
    </div>
  )
}
