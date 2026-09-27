'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import type { GalleryOrder } from '@/lib/gallery'

export interface ArrangerProduct {
  id: string
  title: string
  status: string
  image: string
}

interface GalleryArrangerProps {
  products: ArrangerProduct[]
  initialOrder: GalleryOrder
  initialAvailableFirst: boolean
}

const orderOptions: { value: GalleryOrder; label: string; description: string }[] = [
  { value: 'newest', label: 'Newest first', description: 'Most recently added pieces lead' },
  { value: 'oldest', label: 'Oldest first', description: 'Pieces appear in the order you added them' },
  { value: 'custom', label: 'My arrangement', description: 'Exactly the order you set below' },
]

const statusStyles: Record<string, string> = {
  available: 'bg-emerald-100 text-emerald-800',
  reserved: 'bg-amber-100 text-amber-800',
  sold: 'bg-gray-200 text-gray-700',
  display: 'bg-blue-100 text-blue-800',
  hidden: 'bg-gray-100 text-gray-500',
}

export function GalleryArranger({ products, initialOrder, initialAvailableFirst }: GalleryArrangerProps) {
  const router = useRouter()
  const [items, setItems] = useState(products)
  const [order, setOrder] = useState<GalleryOrder>(initialOrder)
  const [availableFirst, setAvailableFirst] = useState(initialAvailableFirst)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [arrangementChanged, setArrangementChanged] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const hasChanges =
    arrangementChanged || order !== initialOrder || availableFirst !== initialAvailableFirst

  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= items.length) return
    setItems((prev) => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
    setArrangementChanged(true)
    // Rearranging only makes sense for the custom order, so switch to it
    setOrder('custom')
    setMessage(null)
  }

  const save = async () => {
    setIsSaving(true)
    setMessage(null)
    try {
      const settingsRes = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group: 'shop',
          settings: {
            gallery_order: order,
            gallery_available_first: availableFirst ? 'true' : 'false',
          },
        }),
      })
      if (!settingsRes.ok) throw new Error('Failed to save gallery order')

      if (arrangementChanged) {
        const reorderRes = await fetch('/api/products/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: items.map((item) => item.id) }),
        })
        if (!reorderRes.ok) throw new Error('Failed to save arrangement')
      }

      setArrangementChanged(false)
      setMessage({ type: 'success', text: 'Gallery arrangement saved!' })
      router.refresh()
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to save' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Order mode */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-5">
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-3">Gallery order</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {orderOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer ${
                  order === option.value
                    ? 'border-primary-600 ring-1 ring-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="gallery_order"
                  value={option.value}
                  checked={order === option.value}
                  onChange={() => {
                    setOrder(option.value)
                    setMessage(null)
                  }}
                  className="mt-1 text-primary-600 focus:ring-primary-500"
                />
                <span>
                  <span className="block text-sm font-medium text-gray-900">{option.label}</span>
                  <span className="block text-sm text-gray-500">{option.description}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={availableFirst}
            onChange={(e) => {
              setAvailableFirst(e.target.checked)
              setMessage(null)
            }}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span>
            <span className="block text-sm font-medium text-gray-900">Show available pieces first</span>
            <span className="block text-sm text-gray-500">
              Pieces for sale lead the gallery, then reserved, then the rest — each group keeps the
              order chosen above
            </span>
          </span>
        </label>
      </div>

      {/* Custom arrangement */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-medium text-gray-900">My arrangement</h2>
          <p className="text-sm text-gray-500 mt-1">
            Drag pieces into the order you want, or use the arrows. The gallery reads left to right,
            top to bottom. New pieces you add appear at the start.
            {order !== 'custom' && ' Used when "My arrangement" is selected above.'}
          </p>
        </div>

        <div
          className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 ${
            order === 'custom' ? '' : 'opacity-60'
          }`}
        >
          {items.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => {
                setDragIndex(index)
                e.dataTransfer.effectAllowed = 'move'
              }}
              onDragOver={(e) => {
                e.preventDefault()
                if (dragIndex !== null && dragIndex !== index) {
                  move(dragIndex, index)
                  setDragIndex(index)
                }
              }}
              onDragEnd={() => setDragIndex(null)}
              className={`group rounded-lg border bg-white cursor-grab active:cursor-grabbing select-none transition-shadow ${
                dragIndex === index
                  ? 'border-primary-600 shadow-lg opacity-50'
                  : 'border-gray-200 hover:shadow-md'
              }`}
            >
              <div className="relative aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="160px"
                  className="object-contain pointer-events-none"
                />
                <span className="absolute top-1.5 left-1.5 min-w-6 h-6 px-1.5 rounded-full bg-gray-900/75 text-white text-xs font-medium flex items-center justify-center">
                  {index + 1}
                </span>
              </div>
              <div className="p-2 space-y-1.5">
                <p className="text-xs font-medium text-gray-900 truncate" title={item.title}>
                  {item.title || <span className="italic text-gray-400">Untitled</span>}
                </p>
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`text-[10px] uppercase tracking-wide font-medium px-1.5 py-0.5 rounded ${
                      statusStyles[item.status] || statusStyles.display
                    }`}
                  >
                    {item.status}
                  </span>
                  <div className="flex">
                    <button
                      type="button"
                      onClick={() => move(index, index - 1)}
                      disabled={index === 0}
                      aria-label={`Move ${item.title} earlier`}
                      className="p-1 text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      &larr;
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, index + 1)}
                      disabled={index === items.length - 1}
                      aria-label={`Move ${item.title} later`}
                      className="p-1 text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={() => router.push('/admin/products')}>
          Back to Products
        </Button>
        <Button type="button" onClick={save} loading={isSaving} disabled={!hasChanges}>
          Save Changes
        </Button>
      </div>
    </div>
  )
}
