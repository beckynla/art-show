'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'

// Sends a sample inquiry alert so the admin can confirm notifications arrive
export function TestEmailButton({ disabled }: { disabled?: boolean }) {
  const [isSending, setIsSending] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)

  const sendTest = async () => {
    setIsSending(true)
    setResult(null)
    try {
      const response = await fetch('/api/notifications/test', { method: 'POST' })
      const data = await response.json()
      setResult(
        response.ok
          ? { ok: true, text: `Test email sent to ${data.to}. Check your inbox (and spam folder).` }
          : { ok: false, text: data.error || 'Failed to send test email' }
      )
    } catch {
      setResult({ ok: false, text: 'Failed to send test email' })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" onClick={sendTest} loading={isSending} disabled={disabled}>
        Send test email
      </Button>
      {disabled && <p className="text-sm text-gray-500">Save your changes before sending a test.</p>}
      {result && (
        <p className={`text-sm ${result.ok ? 'text-green-700' : 'text-red-600'}`}>{result.text}</p>
      )}
    </div>
  )
}
