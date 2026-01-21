'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'

interface SettingsFormProps {
  group: string
  title: string
  description: string
  children: (props: {
    settings: Record<string, string>
    updateSetting: (key: string, value: string) => void
  }) => React.ReactNode
}

export function SettingsForm({ group, title, description, children }: SettingsFormProps) {
  const router = useRouter()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [originalSettings, setOriginalSettings] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch(`/api/settings?group=${group}`)
      const data = await response.json()
      setSettings(data)
      setOriginalSettings(data)
    } catch (err) {
      console.error('Failed to fetch settings:', err)
    } finally {
      setIsLoading(false)
    }
  }, [group])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setIsSaving(true)

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings, group }),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      setOriginalSettings(settings)
      setSuccess(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 mt-1">{description}</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700">{error}</div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-lg bg-green-50 text-green-700">
          Settings saved successfully!
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {children({ settings, updateSetting })}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/settings')}
        >
          Back to Settings
        </Button>
        <Button type="submit" loading={isSaving} disabled={!hasChanges}>
          Save Changes
        </Button>
      </div>
    </form>
  )
}
