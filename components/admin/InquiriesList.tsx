'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui'
import { formatDateTime } from '@/lib/utils'

export interface Inquiry {
  id: string
  name: string
  email: string
  message: string
  productTitle: string | null
  status: string
  createdAt: string
}

function statusVariant(status: string) {
  if (status === 'new') return 'success'
  if (status === 'archived') return 'default'
  return 'info'
}

export function InquiriesList({ initialInquiries }: { initialInquiries: Inquiry[] }) {
  const [inquiries, setInquiries] = useState(initialInquiries)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const updateStatus = async (id: string, status: string) => {
    setBusy(id)
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setInquiries((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)))
      }
    } finally {
      setBusy(null)
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this inquiry? This cannot be undone.')) return
    setBusy(id)
    try {
      const res = await fetch(`/api/inquiries/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setInquiries((prev) => prev.filter((q) => q.id !== id))
      }
    } finally {
      setBusy(null)
    }
  }

  const toggle = (q: Inquiry) => {
    const opening = expanded !== q.id
    setExpanded(opening ? q.id : null)
    if (opening && q.status === 'new') updateStatus(q.id, 'read')
  }

  if (inquiries.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries yet</h3>
        <p className="text-gray-500">Inquiries from visitors will appear here.</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-200">
      {inquiries.map((q) => (
        <div key={q.id} className={q.status === 'new' ? 'bg-primary-50/40' : ''}>
          <div className="flex items-center gap-4 px-6 py-4">
            <button onClick={() => toggle(q)} className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{q.name}</span>
                <Badge variant={statusVariant(q.status)}>{q.status}</Badge>
              </div>
              <div className="text-sm text-gray-500">
                {q.email}
                {q.productTitle && <> · re: <span className="text-gray-700">{q.productTitle}</span></>}
              </div>
            </button>
            <span className="text-sm text-gray-500 whitespace-nowrap hidden sm:block">
              {formatDateTime(q.createdAt)}
            </span>
            <button onClick={() => toggle(q)} className="text-primary-600 hover:text-primary-800 text-sm">
              {expanded === q.id ? 'Hide' : 'View'}
            </button>
          </div>

          {expanded === q.id && (
            <div className="px-6 pb-5">
              <div className="rounded-lg bg-gray-50 p-4 text-gray-700 whitespace-pre-wrap">
                {q.message}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <a
                  href={`mailto:${q.email}?subject=${encodeURIComponent(
                    q.productTitle ? `Re: your inquiry about "${q.productTitle}"` : 'Re: your inquiry'
                  )}`}
                  className="font-medium text-primary-600 hover:text-primary-800"
                >
                  Reply by email
                </a>
                {q.status !== 'archived' ? (
                  <button
                    onClick={() => updateStatus(q.id, 'archived')}
                    disabled={busy === q.id}
                    className="text-gray-500 hover:text-gray-800"
                  >
                    Archive
                  </button>
                ) : (
                  <button
                    onClick={() => updateStatus(q.id, 'read')}
                    disabled={busy === q.id}
                    className="text-gray-500 hover:text-gray-800"
                  >
                    Unarchive
                  </button>
                )}
                <button
                  onClick={() => remove(q.id)}
                  disabled={busy === q.id}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
