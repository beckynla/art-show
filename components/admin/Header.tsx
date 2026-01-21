'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui'

interface HeaderProps {
  user?: {
    name?: string | null
    email: string
  }
}

export function Header({ user }: HeaderProps) {
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
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          {/* Breadcrumb or page title can go here */}
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-gray-600">
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
