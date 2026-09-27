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
      <div className="relative isolate min-h-screen flex flex-col bg-background">
        {theme.backgroundImage && (
          <>
            <div
              aria-hidden
              className="fixed inset-0 -z-10 bg-center"
              style={{
                backgroundImage: `url("${theme.backgroundImage.replace(/"/g, '%22')}")`,
                backgroundSize: theme.backgroundImageStyle === 'tile' ? 'auto' : 'cover',
                backgroundRepeat: theme.backgroundImageStyle === 'tile' ? 'repeat' : 'no-repeat',
              }}
            />
            {/* Veil in the background color controls how strongly the image shows */}
            <div
              aria-hidden
              className="fixed inset-0 -z-10 bg-background"
              style={{ opacity: 1 - theme.backgroundImageStrength / 100 }}
            />
          </>
        )}
        <Header shopName={theme.shopName} shopLogo={theme.shopLogo} showAbout={showAbout} />
        <main className="flex-1">{children}</main>
        <Footer showAbout={showAbout} />
      </div>
    </CartProvider>
  )
}
