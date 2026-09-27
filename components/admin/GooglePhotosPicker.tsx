'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui'

interface GooglePhoto {
  id: string
  url: string
  thumbnail: string
  filename: string
  width?: string
  height?: string
}

interface GooglePhotosPickerProps {
  onSelect: (url: string) => void
  onClose: () => void
}

export function GooglePhotosPicker({ onSelect, onClose }: GooglePhotosPickerProps) {
  const [status, setStatus] = useState<'loading' | 'not_configured' | 'not_connected' | 'connected'>('loading')
  const [photos, setPhotos] = useState<GooglePhoto[]>([])
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
  const [loadingPhotos, setLoadingPhotos] = useState(false)
  const [error, setError] = useState('')

  // Check connection status on mount
  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/google-photos/status')
      const data = await response.json()

      if (!data.configured) {
        setStatus('not_configured')
      } else if (!data.connected) {
        setStatus('not_connected')
      } else {
        setStatus('connected')
        loadPhotos()
      }
    } catch {
      setError('Failed to check Google Photos status')
      setStatus('not_configured')
    }
  }

  const loadPhotos = useCallback(async (pageToken?: string) => {
    setLoadingPhotos(true)
    setError('')

    try {
      const url = new URL('/api/google-photos', window.location.origin)
      if (pageToken) {
        url.searchParams.set('pageToken', pageToken)
      }

      const response = await fetch(url.toString())
      const data = await response.json()

      if (!response.ok) {
        if (!data.connected) {
          setStatus('not_connected')
          return
        }
        throw new Error(data.error || 'Failed to load photos')
      }

      if (pageToken) {
        setPhotos(prev => [...prev, ...data.photos])
      } else {
        setPhotos(data.photos)
      }
      setNextPageToken(data.nextPageToken || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load photos')
    } finally {
      setLoadingPhotos(false)
    }
  }, [])

  const connectToGoogle = async () => {
    try {
      const response = await fetch('/api/auth/google')
      const data = await response.json()

      if (data.url) {
        // Open in same window - will redirect back after auth
        window.location.href = data.url
      } else {
        setError(data.error || 'Failed to get auth URL')
      }
    } catch {
      setError('Failed to connect to Google')
    }
  }

  const handleSelect = (photo: GooglePhoto) => {
    onSelect(photo.url)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Select from Google Photos</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {status === 'loading' && (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading...</div>
            </div>
          )}

          {status === 'not_configured' && (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Google Photos Not Configured</h3>
              <p className="text-gray-500 mb-4">
                Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your environment variables.
              </p>
            </div>
          )}

          {status === 'not_connected' && (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Connect to Google Photos</h3>
              <p className="text-gray-500 mb-4">
                Connect your Google account to browse and select photos from your library.
              </p>
              <Button onClick={connectToGoogle}>
                Connect Google Photos
              </Button>
            </div>
          )}

          {status === 'connected' && (
            <>
              {error && (
                <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-700">{error}</div>
              )}

              {photos.length === 0 && !loadingPhotos && (
                <div className="text-center py-12 text-gray-500">
                  No photos found in your Google Photos library.
                </div>
              )}

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {photos.map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => handleSelect(photo)}
                    className="relative aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  >
                    <Image
                      src={photo.thumbnail}
                      alt={photo.filename}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
                    />
                  </button>
                ))}
              </div>

              {loadingPhotos && (
                <div className="text-center py-4 text-gray-500">
                  Loading photos...
                </div>
              )}

              {nextPageToken && !loadingPhotos && (
                <div className="text-center py-4">
                  <Button
                    variant="outline"
                    onClick={() => loadPhotos(nextPageToken)}
                  >
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
