import { Readable } from 'stream'
import { getSession } from '@/lib/auth'
import { createFullBackupStream } from '@/lib/backup'

// Admin: download everything (database + all images) as one .tar.gz file
export async function GET() {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { stream, filename } = await createFullBackupStream()
    return new Response(Readable.toWeb(stream) as ReadableStream, {
      headers: {
        'Content-Type': 'application/gzip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Error creating full backup:', error)
    return Response.json({ error: 'Failed to create backup' }, { status: 500 })
  }
}
