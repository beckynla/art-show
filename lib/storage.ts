import path from 'path'

// Where uploaded images are stored. Defaults to public/uploads for local development;
// in production set UPLOAD_DIR to a folder on a persistent disk (e.g. /data/uploads).
export function getUploadsDir(): string {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads')
}

// Image types accepted for upload, and the extension each is saved with
export const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
}

// Content type served for each stored extension ('jpeg' covers older uploads)
export const IMAGE_CONTENT_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
}
