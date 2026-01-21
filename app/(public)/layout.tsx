import { redirect } from 'next/navigation'
import { Header } from '@/components/public/Header'
import { Footer } from '@/components/public/Footer'
import { CartProvider } from '@/components/public/CartProvider'
import { generateThemeCSS, getThemeSettings } from '@/lib/theme'
import { prisma } from '@/lib/db'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if setup is complete
  const setupComplete = await prisma.setting.findUnique({
    where: { key: 'setup_complete' }
  }).catch(() => null)

  if (!setupComplete || setupComplete.value !== 'true') {
    redirect('/setup')
  }

  const themeCSS = await generateThemeCSS()
  const theme = await getThemeSettings()

  return (
    <CartProvider>
      <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
      <div className="min-h-screen flex flex-col">
        <Header shopName={theme.shopName} shopLogo={theme.shopLogo} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </CartProvider>
  )
}
