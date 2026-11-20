'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface AdminShellProps {
  user?: { name?: string | null; email: string }
  children: React.ReactNode
}

// Sidebar is always visible on large screens; on phones and tablets it slides in from a menu button
export function AdminShell({ user, children }: AdminShellProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  // Close the menu after navigating
  useEffect(() => setMenuOpen(false), [pathname])

  // Close on Escape and keep the page from scrolling behind the open menu
  useEffect(() => {
    if (!menuOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <div className="min-h-screen bg-gray-50">
      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="lg:pl-64">
        <Header user={user} onMenuClick={() => setMenuOpen(true)} />
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
