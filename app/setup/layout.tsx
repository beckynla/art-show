import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'

export default async function SetupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if setup is already complete
  const setupComplete = await prisma.setting.findUnique({
    where: { key: 'setup_complete' }
  }).catch(() => null)

  if (setupComplete?.value === 'true') {
    redirect('/')
  }

  return <>{children}</>
}
