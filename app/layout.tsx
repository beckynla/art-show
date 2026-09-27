import type { Metadata } from 'next'
import { getAllSettings } from '@/lib/settings'
import './globals.css'

// Browser tab title and link previews (texts, social posts) use the shop name from
// Settings → General. Pages rendered at build time, when the database isn't
// available, fall back to a neutral title.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAllSettings().catch(() => ({} as Record<string, string>))

  const name = settings.shop_name || 'Gallery'
  const description = settings.shop_tagline || name
  const previewImage =
    (settings.show_hero !== 'false' && settings.hero_image) ||
    settings.greeting_image ||
    settings.shop_logo ||
    undefined

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
    title: name,
    description,
    openGraph: {
      title: name,
      siteName: name,
      description,
      type: 'website',
      ...(previewImage ? { images: [previewImage] } : {}),
    },
    twitter: {
      card: previewImage ? 'summary_large_image' : 'summary',
      title: name,
      description,
      ...(previewImage ? { images: [previewImage] } : {}),
    },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
