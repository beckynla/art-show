import { redirect } from 'next/navigation'
import { getSession, getCurrentUser } from '@/lib/auth'
import { Sidebar } from '@/components/admin/Sidebar'
import { Header } from '@/components/admin/Header'
import { ToastProvider } from '@/components/ui'
import { ensureDailySnapshot } from '@/lib/backup'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  // If no session, redirect to login (middleware handles this too, but double-check)
  if (!session) {
    redirect('/admin/login')
  }

  const user = await getCurrentUser()

  // Keep a daily database snapshot from before the day's edits (runs in the background)
  void ensureDailySnapshot()

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="pl-64">
          <Header user={user ?? undefined} />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </ToastProvider>
  )
}
