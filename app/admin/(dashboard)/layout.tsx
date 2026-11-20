import { redirect } from 'next/navigation'
import { getSession, getCurrentUser } from '@/lib/auth'
import { AdminShell } from '@/components/admin/AdminShell'
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
      <AdminShell user={user ?? undefined}>{children}</AdminShell>
    </ToastProvider>
  )
}
