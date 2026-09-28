import type { ProductImage } from '@/types'

// Validate and normalize image URLs
export function validateImageUrl(url: string): boolean {
  if (!url) return false

  // Local uploads
  if (url.startsWith('/uploads/')) {
    return true
  }

  // External URLs (Google Photos, etc.)
  try {
    const parsedUrl = new URL(url)
    const allowedHosts = [
      'lh3.googleusercontent.com',
      'photos.google.com',
      'drive.google.com',
    ]
    return allowedHosts.some(host => parsedUrl.hostname.includes(host)) ||
           parsedUrl.protocol === 'https:'
  } catch {
    return false
  }
}

// Parse images from database (stored as JSON string)
export function parseImages(imagesJson: string): ProductImage[] {
  try {
    const parsed = JSON.parse(imagesJson)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((img): img is ProductImage =>
      img && typeof img === 'object' &&
      'type' in img &&
      'url' in img
    )
  } catch {
    return []
  }
}

// Stringify images for database storage
export function stringifyImages(images: ProductImage[]): string {
  return JSON.stringify(images)
}

// Get the first image URL or a placeholder
export function getPrimaryImage(images: ProductImage[] | string): string {
  const imageArray = typeof images === 'string' ? parseImages(images) : images

  if (imageArray.length === 0) {
    return '/placeholder-image.svg'
  }

  return imageArray[0].url
}

// Convert Google Photos sharing URL to direct image URL
export function convertGooglePhotosUrl(url: string): string {
  // Google Photos sharing URLs like:
  // https://photos.app.goo.gl/xxx or https://photos.google.com/share/xxx
  // Already work directly with the share URL in most cases

  // lh3.googleusercontent.com URLs work directly
  if (url.includes('lh3.googleusercontent.com')) {
    return url
  }

  // For Google Photos share links, we'll use them as-is
  // The user will need to get the direct image link
  return url
}

// Generate a unique filename for uploads
export function generateUploadFilename(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg'
  return `${timestamp}-${random}.${extension}`
}

// Get allowed file types for image uploads
export function getAllowedImageTypes(): string[] {
  return ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
}

// Check if a file type is allowed
export function isAllowedImageType(mimeType: string): boolean {
  return getAllowedImageTypes().includes(mimeType)
}

// Maximum file size for uploads (25MB). Photos are resized after upload, so large
// phone-camera originals are fine; GIFs are stored as-is and keep a smaller limit.
export const MAX_IMAGE_SIZE = 25 * 1024 * 1024
export const MAX_GIF_SIZE = 5 * 1024 * 1024

// Check if file size is within limits
export function isValidImageSize(sizeInBytes: number): boolean {
  return sizeInBytes <= MAX_IMAGE_SIZE
}

// Create a ProductImage object
export function createProductImage(url: string, type?: 'local' | 'external'): ProductImage {
  const imageType = type || (url.startsWith('/uploads/') ? 'local' : 'external')
  return { type: imageType, url }
}
