'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui'

interface SettingsImageInputProps {
  label: string
  value: string
  onChange: (url: string) => void
  helpText?: string
}

export function SettingsImageInput({ label, value, onChange, helpText }: SettingsImageInputProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')

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

      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be under 5MB')
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
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF, WebP up to 5MB</p>
          </label>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {helpText && !error && <p className="text-sm text-gray-500">{helpText}</p>}
    </div>
  )
}
