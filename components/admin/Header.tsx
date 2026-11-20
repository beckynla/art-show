'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui'

interface HeaderProps {
  user?: {
    name?: string | null
    email: string
  }
  onMenuClick: () => void
}

export function Header({ user, onMenuClick }: HeaderProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/admin/login')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
      <div className="flex h-14 sm:h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onMenuClick}
            className="-ml-2 p-2 text-gray-600 hover:text-gray-900 lg:hidden"
            aria-label="Open menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-gray-900 lg:hidden">Admin</span>
        </div>

        <div className="flex min-w-0 items-center gap-4">
          {user && (
            <span className="hidden truncate text-sm text-gray-600 sm:inline">
              {user.name || user.email}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            loading={isLoggingOut}
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
