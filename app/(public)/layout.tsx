import { redirect } from 'next/navigation'
import { Header } from '@/components/public/Header'
import { Footer } from '@/components/public/Footer'
import { CartProvider } from '@/components/public/CartProvider'
import { generateThemeCSS, getThemeSettings, getGoogleFontsUrl } from '@/lib/theme'
import { prisma } from '@/lib/db'
import { getSetting } from '@/lib/settings'

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
  const googleFontsUrl = await getGoogleFontsUrl()
  const showAbout = (await getSetting('show_about')) !== 'false'

  return (
    <CartProvider>
      {googleFontsUrl && <link rel="stylesheet" href={googleFontsUrl} />}
      <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
      <div className="min-h-screen flex flex-col bg-background">
        <Header shopName={theme.shopName} shopLogo={theme.shopLogo} showAbout={showAbout} />
        <main className="flex-1">{children}</main>
        <Footer showAbout={showAbout} />
      </div>
    </CartProvider>
  )
}
