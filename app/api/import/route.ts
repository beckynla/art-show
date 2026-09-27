import { timingSafeEqual } from 'crypto'
import { mkdir, rename, writeFile } from 'fs/promises'
import path from 'path'
import { getUploadsDir, IMAGE_CONTENT_TYPES } from '@/lib/storage'

// TEMPORARY: one-time import of the local database and uploaded images onto the
// server's persistent disk when first going live. Disabled unless IMPORT_TOKEN is set.
// Remove this route once the import is done.

function isAuthorized(request: Request, token: string): boolean {
  const given = Buffer.from(request.headers.get('authorization') || '')
  const expected = Buffer.from(`Bearer ${token}`)
  return given.length === expected.length && timingSafeEqual(given, expected)
}

// Resolve ?file= to an allowed destination: the database, or a single image in uploads
function resolveTarget(file: string | null): string | null {
  if (file === 'prod.db') {
    const url = process.env.DATABASE_URL || ''
    const dbPath = url.startsWith('file:') ? url.slice('file:'.length) : ''
    return path.isAbsolute(dbPath) ? dbPath : null
  }
  const match = file?.match(/^uploads\/([\w-]+\.(\w+))$/)
  if (match && IMAGE_CONTENT_TYPES[match[2].toLowerCase()]) {
    return path.join(getUploadsDir(), match[1])
  }
  return null
}

export async function POST(request: Request) {
  const token = process.env.IMPORT_TOKEN
  if (!token || token.length < 32) {
    return new Response('Not found', { status: 404 })
  }
  if (!isAuthorized(request, token)) {
    return new Response('Unauthorized', { status: 401 })
  }

  const target = resolveTarget(new URL(request.url).searchParams.get('file'))
  if (!target) {
    return new Response('Invalid file', { status: 400 })
  }

  const data = Buffer.from(await request.arrayBuffer())
  if (data.length === 0) {
    return new Response('Empty body', { status: 400 })
  }

  // Write to a temp file then rename, so a partial upload never replaces a good file
  await mkdir(path.dirname(target), { recursive: true })
  const temp = `${target}.importing`
  await writeFile(temp, data)
  await rename(temp, target)

  return Response.json({ saved: path.basename(target), bytes: data.length })
}
