'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface AdminProductActionsProps {
  productId: string
  status: string
  showPrice: boolean
  hasPrice: boolean
}

// Shown at the bottom of a product page only to a logged-in admin
export function AdminProductActions({ productId, status, showPrice, hasPrice }: AdminProductActionsProps) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const isHidden = status === 'hidden'

  const handleHide = async () => {
    if (!confirm('Hide this piece? Visitors won\'t see it in the gallery or be able to open its page.')) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'hidden' }),
      })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      setError('Failed to hide this piece')
    } finally {
      setBusy(false)
    }
  }

  const handleTogglePrice = async () => {
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showPrice: !showPrice }),
      })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      setError('Failed to change price visibility')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this piece permanently? This can\'t be undone.')) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      router.push('/shop')
      router.refresh()
    } catch {
      setError('Failed to delete this piece')
      setBusy(false)
    }
  }

  const buttonClass =
    'inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50'

  return (
    <section className="mt-16 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
        Admin — only you can see this
      </p>
      {isHidden && (
        <p className="mt-2 text-sm text-amber-700">
          This piece is hidden from visitors. Edit it to change its status.
        </p>
      )}
      {/* Show price toggle */}
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={showPrice}
          onClick={handleTogglePrice}
          disabled={busy}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors disabled:opacity-50 ${
            showPrice ? 'bg-emerald-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
              showPrice ? 'translate-x-[22px]' : 'translate-x-0.5'
            }`}
          />
        </button>
        <span className="text-sm text-gray-700">
          Show price to visitors
          {!hasPrice && <span className="text-gray-400"> (no price set yet — add one with Edit)</span>}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
        <Link
          href={`/admin/products/${productId}`}
          className={`${buttonClass} bg-white border border-gray-300 text-gray-700 hover:bg-gray-100`}
        >
          Edit
        </Link>
        {!isHidden && (
          <button
            type="button"
            onClick={handleHide}
            disabled={busy}
            className={`${buttonClass} bg-white border border-gray-300 text-gray-700 hover:bg-gray-100`}
          >
            Hide
          </button>
        )}
        <button
          type="button"
          onClick={handleDelete}
          disabled={busy}
          className={`${buttonClass} bg-red-600 text-white hover:bg-red-700`}
        >
          Delete
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </section>
  )
}
