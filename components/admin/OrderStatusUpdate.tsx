'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Select } from '@/components/ui'

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
]

interface OrderStatusUpdateProps {
  orderId: string
  currentStatus: string
}

export function OrderStatusUpdate({ orderId, currentStatus }: OrderStatusUpdateProps) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')

  const handleUpdate = async () => {
    if (status === currentStatus) return

    setError('')
    setIsUpdating(true)

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <Select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        options={statusOptions}
      />
      <Button
        onClick={handleUpdate}
        loading={isUpdating}
        disabled={status === currentStatus}
        className="w-full"
      >
        Update Status
      </Button>
    </div>
  )
}
