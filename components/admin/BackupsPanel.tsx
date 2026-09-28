'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'

interface SnapshotRow {
  name: string
  size: number
  createdAt: string
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function BackupsPanel({ snapshots }: { snapshots: SnapshotRow[] }) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  const takeSnapshot = async () => {
    setIsCreating(true)
    setError('')
    try {
      const response = await fetch('/api/backup/snapshots', { method: 'POST' })
      if (!response.ok) throw new Error('Failed to create snapshot')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create snapshot')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Full backup */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900">Full backup</h2>
        <p className="text-sm text-gray-500 mt-1 mb-4">
          Downloads everything — your paintings, settings, text, inquiries and every image — as one
          file. Save it somewhere off this server, like your computer, iCloud or Google Drive. A good
          habit is once a month, or after adding new paintings.
        </p>
        <a
          href="/api/backup/download"
          className="inline-flex items-center justify-center px-4 py-2 font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
        >
          Download full backup
        </a>
        <p className="text-xs text-gray-400 mt-2">
          This can take a minute; the file includes all your images.
        </p>
      </div>

      {/* Snapshots */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Daily snapshots</h2>
            <p className="text-sm text-gray-500 mt-1">
              A copy of your database is saved automatically once a day, the first time you use
              admin, so there is always a version from before that day&apos;s edits. The last 14
              are kept. Images aren&apos;t included because uploads are never overwritten.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={takeSnapshot} loading={isCreating}>
            Take snapshot now
          </Button>
        </div>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        {snapshots.length === 0 ? (
          <p className="text-sm text-gray-500">No snapshots yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100 border border-gray-100 rounded-lg">
            {snapshots.map((snapshot) => (
              <li key={snapshot.name} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(snapshot.createdAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                  <p className="text-xs text-gray-500">{formatSize(snapshot.size)}</p>
                </div>
                <a
                  href={`/api/backup/snapshots/${snapshot.name}`}
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        )}

        <p className="text-xs text-gray-400 mt-4">
          To roll the site back to a snapshot, ask for help — restoring replaces all current content.
        </p>
      </div>
    </div>
  )
}
