import { readFile } from 'fs/promises'
import path from 'path'
import { getUploadsDir, IMAGE_CONTENT_TYPES } from '@/lib/storage'

// Serves uploaded images from UPLOAD_DIR. A production Next.js server only serves
// files that were in public/ at build time, so uploads made after launch need this route.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params
  const filename = segments.join('/')

  // Only plain filenames (no folders or "..") with an image extension
  if (segments.length !== 1 || !/^[\w.-]+$/.test(filename) || filename.startsWith('.')) {
    return new Response('Not found', { status: 404 })
  }
  const contentType = IMAGE_CONTENT_TYPES[path.extname(filename).slice(1).toLowerCase()]
  if (!contentType) {
    return new Response('Not found', { status: 404 })
  }

  try {
    const file = await readFile(path.join(getUploadsDir(), filename))
    return new Response(file, {
      headers: {
        'Content-Type': contentType,
        'X-Content-Type-Options': 'nosniff',
        // Filenames are unique per upload, so they can be cached forever
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new Response('Not found', { status: 404 })
  }
}
