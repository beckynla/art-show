import { listSnapshots } from '@/lib/backup'
import { BackupsPanel } from '@/components/admin/BackupsPanel'

export const dynamic = 'force-dynamic'

export default async function BackupsPage() {
  const snapshots = await listSnapshots()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Backups</h1>
        <p className="text-gray-500 mt-1">Keep copies of your site&apos;s content safe</p>
      </div>

      <BackupsPanel
        snapshots={snapshots.map((s) => ({
          name: s.name,
          size: s.size,
          createdAt: s.createdAt.toISOString(),
        }))}
      />
    </div>
  )
}
