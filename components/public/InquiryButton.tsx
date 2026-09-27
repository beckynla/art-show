'use client'

import { useState } from 'react'
import { Button, Modal, ModalFooter } from '@/components/ui'

interface InquiryButtonProps {
  productId: string
  productTitle: string
}

export function InquiryButton({ productId, productTitle }: InquiryButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(
    `Hello, I'm interested in "${productTitle}". Could you tell me more about it?`
  )
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  const close = () => {
    setIsOpen(false)
    // Reset back to a clean state shortly after closing
    setTimeout(() => {
      setStatus('idle')
      setError('')
      setName('')
      setEmail('')
      setMessage(`Hello, I'm interested in "${productTitle}". Could you tell me more about it?`)
    }, 200)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    setError('')

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, productId, productTitle }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Something went wrong')
      }

      setStatus('success')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500'

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group inline-flex items-center gap-3 border border-gray-900 px-8 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-gray-900 transition-colors duration-300 ease-out hover:bg-gray-900 hover:text-white"
      >
        Inquire About This Piece
        <span className="transition-transform duration-300 ease-out group-hover:translate-x-1">
          &rarr;
        </span>
      </button>

      <Modal isOpen={isOpen} onClose={close} title={`Inquire about "${productTitle}"`} size="lg">
        {status === 'success' ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Inquiry sent</h3>
            <p className="mt-1 text-gray-600">Thank you — we&apos;ll be in touch soon.</p>
            <div className="mt-6">
              <Button onClick={close}>Close</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={inputClass}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <ModalFooter className="-mx-6 -mb-4">
              <Button type="button" variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" loading={status === 'submitting'}>
                Send Inquiry
              </Button>
            </ModalFooter>
          </form>
        )}
      </Modal>
    </>
  )
}
