import sharp from 'sharp'

// Longest side of stored images: sharp on large high-resolution screens, far smaller than
// phone-camera originals. Proportions are always preserved; small images are never enlarged.
const MAX_DIMENSION = 2560

export interface ProcessedImage {
  buffer: Buffer
  extension: string
}

/**
 * Prepares an uploaded image for the gallery:
 * - applies the camera's orientation so sideways phone photos display upright
 * - shrinks it to fit within MAX_DIMENSION, keeping its exact aspect ratio
 * - removes metadata such as GPS location, but keeps the colour profile so colours stay accurate
 * - saves photos as high-quality JPEG; images with transparency stay PNG/WebP
 * GIFs are left untouched to preserve animation.
 */
export async function processUploadedImage(input: Buffer, mimeType: string): Promise<ProcessedImage> {
  if (mimeType === 'image/gif') {
    return { buffer: input, extension: 'gif' }
  }

  const image = sharp(input, { failOn: 'error' })
  const { hasAlpha } = await image.metadata()

  const pipeline = image
    .rotate()
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
    .keepIccProfile()

  if (hasAlpha && mimeType === 'image/png') {
    return { buffer: await pipeline.png({ compressionLevel: 9 }).toBuffer(), extension: 'png' }
  }
  if (hasAlpha && mimeType === 'image/webp') {
    return { buffer: await pipeline.webp({ quality: 90 }).toBuffer(), extension: 'webp' }
  }

  // Full colour resolution (4:4:4) keeps fine brushwork and colour edges crisp
  const buffer = await pipeline
    .jpeg({ quality: 86, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toBuffer()
  return { buffer, extension: 'jpg' }
}
