'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui'
import { GooglePhotosPicker } from './GooglePhotosPicker'

interface SettingsImageInputProps {
  label: string
  value: string
  onChange: (url: string) => void
  helpText?: string
}

export function SettingsImageInput({ label, value, onChange, helpText }: SettingsImageInputProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [showGooglePicker, setShowGooglePicker] = useState(false)

  const handleFileUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return

      const file = files[0]
      setIsUploading(true)
      setError('')

      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed')
        setIsUploading(false)
        return
      }

      if (file.size > 25 * 1024 * 1024) {
        setError('Image must be under 25MB')
        setIsUploading(false)
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
        onChange(data.url)
      } catch {
        setError('Failed to upload image')
      } finally {
        setIsUploading(false)
      }
    },
    [onChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      handleFileUpload(e.dataTransfer.files)
    },
    [handleFileUpload]
  )

  const handleRemove = () => {
    onChange('')
  }

  const handleGooglePhotoSelect = (url: string) => {
    onChange(url)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {value ? (
        <div className="relative inline-block">
          <div className="relative w-48 h-32 rounded-lg overflow-hidden border border-gray-200">
            <Image
              src={value}
              alt={label}
              fill
              className="object-cover"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <p className="text-xs text-gray-500 mt-1 truncate max-w-[12rem]">{value}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors"
          >
            <input
              type="file"
              id={`file-upload-${label}`}
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
            <label htmlFor={`file-upload-${label}`} className="cursor-pointer">
              <svg
                className="w-8 h-8 text-gray-400 mx-auto mb-2"
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
              <p className="text-sm text-gray-600">
                {isUploading ? (
                  'Uploading...'
                ) : (
                  <>
                    <span className="text-primary-600 hover:text-primary-700">Click to upload</span>
                    {' '}or drag and drop
                  </>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF, WebP up to 25MB — large photos are resized automatically</p>
            </label>
          </div>

          <div className="text-center">
            <span className="text-xs text-gray-400">or</span>
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

      {error && <p className="text-sm text-red-600">{error}</p>}
      {helpText && !error && <p className="text-sm text-gray-500">{helpText}</p>}

      {showGooglePicker && (
        <GooglePhotosPicker
          onSelect={handleGooglePhotoSelect}
          onClose={() => setShowGooglePicker(false)}
        />
      )}
    </div>
  )
}
