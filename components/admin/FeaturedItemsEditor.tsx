'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { Button, Input, Textarea } from '@/components/ui'
import { GooglePhotosPicker } from './GooglePhotosPicker'

export interface FeaturedItem {
  id: string
  image: string
  title: string
  description?: string
  link?: string
}

interface FeaturedItemsEditorProps {
  items: FeaturedItem[]
  onChange: (items: FeaturedItem[]) => void
  maxItems?: number
}

export function FeaturedItemsEditor({ items, onChange, maxItems = 8 }: FeaturedItemsEditorProps) {
  const [isUploading, setIsUploading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [googlePickerForItem, setGooglePickerForItem] = useState<string | null>(null)

  const generateId = () => Math.random().toString(36).substring(2, 9)

  const handleAddItem = () => {
    if (items.length >= maxItems) return
    const newItem: FeaturedItem = {
      id: generateId(),
      image: '',
      title: '',
      description: '',
      link: '',
    }
    onChange([...items, newItem])
  }

  const handleRemoveItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id))
  }

  const handleUpdateItem = (id: string, field: keyof FeaturedItem, value: string) => {
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  const handleFileUpload = useCallback(
    async (itemId: string, files: FileList | null) => {
      if (!files || files.length === 0) return

      const file = files[0]
      setIsUploading(itemId)
      setError('')

      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed')
        setIsUploading(null)
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be under 5MB')
        setIsUploading(null)
        return
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
        handleUpdateItem(itemId, 'image', data.url)
      } catch {
        setError('Failed to upload image')
      } finally {
        setIsUploading(null)
      }
    },
    [items, onChange]
  )

  const handleDrop = useCallback(
    (itemId: string, e: React.DragEvent) => {
      e.preventDefault()
      handleFileUpload(itemId, e.dataTransfer.files)
    },
    [handleFileUpload]
  )

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= items.length) return

    const newItems = [...items]
    const [movedItem] = newItems.splice(index, 1)
    newItems.splice(newIndex, 0, movedItem)
    onChange(newItems)
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      {items.map((item, index) => (
        <div
          key={item.id}
          className="border border-gray-200 rounded-lg p-4 bg-white"
        >
          <div className="flex items-start gap-4">
            {/* Image Upload */}
            <div className="flex-shrink-0">
              {item.image ? (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                  <Image
                    src={item.image}
                    alt={item.title || 'Featured item'}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleUpdateItem(item.id, 'image', '')}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div
                    onDrop={(e) => handleDrop(item.id, e)}
                    onDragOver={(e) => e.preventDefault()}
                    className="w-32 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-primary-500 transition-colors"
                  >
                    <input
                      type="file"
                      id={`upload-${item.id}`}
                      accept="image/*"
                      onChange={(e) => handleFileUpload(item.id, e.target.files)}
                      className="hidden"
                    />
                    <label htmlFor={`upload-${item.id}`} className="cursor-pointer text-center p-2">
                      {isUploading === item.id ? (
                        <span className="text-xs text-gray-500">Uploading...</span>
                      ) : (
                        <>
                          <svg className="w-5 h-5 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="text-xs text-gray-500 block">Upload</span>
                        </>
                      )}
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGooglePickerForItem(item.id)}
                    className="w-32 text-xs text-gray-600 hover:text-primary-600 flex items-center justify-center gap-1"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z"/>
                    </svg>
                    Google Photos
                  </button>
                </div>
              )}
            </div>

            {/* Fields */}
            <div className="flex-1 space-y-3">
              <Input
                label="Title"
                value={item.title}
                onChange={(e) => handleUpdateItem(item.id, 'title', e.target.value)}
                placeholder="Item title"
              />
              <Textarea
                label="Description (optional)"
                value={item.description || ''}
                onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                placeholder="Brief description..."
                rows={2}
              />
              <Input
                label="Link (optional)"
                value={item.link || ''}
                onChange={(e) => handleUpdateItem(item.id, 'link', e.target.value)}
                placeholder="/shop or https://..."
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => moveItem(index, 'up')}
                disabled={index === 0}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                title="Move up"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => moveItem(index, 'down')}
                disabled={index === items.length - 1}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                title="Move down"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleRemoveItem(item.id)}
                className="p-1 text-red-400 hover:text-red-600"
                title="Remove"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}

      {items.length < maxItems && (
        <Button type="button" variant="outline" onClick={handleAddItem}>
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Featured Item
        </Button>
      )}

      <p className="text-sm text-gray-500">
        {items.length}/{maxItems} items. Drag images to upload or click to select.
      </p>

      {/* Google Photos Picker */}
      {googlePickerForItem && (
        <GooglePhotosPicker
          onSelect={(url) => {
            handleUpdateItem(googlePickerForItem, 'image', url)
            setGooglePickerForItem(null)
          }}
          onClose={() => setGooglePickerForItem(null)}
        />
      )}
    </div>
  )
}
