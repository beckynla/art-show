import { readFile } from 'fs/promises'
import { getSession } from '@/lib/auth'
import { isSnapshotName, snapshotPath } from '@/lib/backup'

// Admin: download one database snapshot
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name } = await params
  if (!isSnapshotName(name)) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const file = await readFile(snapshotPath(name))
    return new Response(file, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${name}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }
}
