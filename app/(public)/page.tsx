import Link from 'next/link'
import Image from 'next/image'
import { getSettings } from '@/lib/settings'
import { FeaturedGrid } from '@/components/public/FeaturedGrid'
import { ImageLightbox } from '@/components/public/ImageLightbox'

interface FeaturedItem {
  id: string
  image: string
  title: string
  description?: string
  link?: string
}

function parseFeaturedItems(json: string): FeaturedItem[] {
  try {
    const parsed = JSON.parse(json)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const homepage = await getSettings('homepage')

  // Curated showcase images (not necessarily products) — managed in admin.
  const featuredItems = parseFeaturedItems(homepage.featured_items || '[]').filter((i) => i.image)

  // Check visibility settings (default to true if not set)
  const showHero = homepage.show_hero !== 'false'
  const showGreeting = homepage.show_greeting !== 'false'
  const showFeatured = homepage.show_featured !== 'false'

  // A slimmed hero — primarily the optional hero image (title/subtitle still supported)
  const hasHeroContent = homepage.hero_title || homepage.hero_image || homepage.hero_subtitle

  // Which portion of the hero photo to show (CSS object-position), set in admin
  const heroPosition = homepage.hero_position || 'center'

  // How tall/wide a banner the hero occupies, set in admin
  const heroHeightClass =
    {
      short: 'min-h-[320px]',
      standard: 'min-h-[460px]',
      tall: 'min-h-[640px]',
      full: 'min-h-[85vh]',
    }[homepage.hero_height || 'standard'] || 'min-h-[460px]'

  // Homepage greeting content — distinct from the /about page
  const hasGreetingContent =
    homepage.greeting_title || homepage.greeting_content || homepage.greeting_image

  return (
    <div>
      {/* Hero Section — optional image at the very top */}
      {showHero && hasHeroContent && (
        <section className={`relative flex items-center bg-gray-900 text-white ${heroHeightClass}`}>
          {homepage.hero_image && (
            <Image
              src={homepage.hero_image}
              alt="Hero"
              fill
              className="object-cover"
              style={{ objectPosition: heroPosition }}
              priority
            />
          )}
          <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-2xl">
              {homepage.hero_title && (
                <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">
                  {homepage.hero_title}
                </h1>
              )}
              {homepage.hero_subtitle && (
                <p className="text-lg md:text-xl text-gray-300">
                  {homepage.hero_subtitle}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Greeting Section — homepage welcome, distinct from the /about page */}
      {showGreeting && hasGreetingContent && (
        <section className="pt-16 md:pt-24 pb-8 md:pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {homepage.greeting_image && (
                <ImageLightbox src={homepage.greeting_image} alt={homepage.greeting_title || 'Welcome'}>
                  <div className="relative aspect-square rounded-lg overflow-hidden cursor-zoom-in">
                    <Image
                      src={homepage.greeting_image}
                      alt={homepage.greeting_title || 'Welcome'}
                      fill
                      className="object-cover"
                    />
                  </div>
                </ImageLightbox>
              )}
              <div className={homepage.greeting_image ? '' : 'md:col-span-2 text-center max-w-2xl mx-auto'}>
                {homepage.greeting_title && (
                  <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-6">
                    {homepage.greeting_title}
                  </h2>
                )}
                {homepage.greeting_content && (
                  <div className="prose prose-lg text-gray-600">
                    {homepage.greeting_content.split('\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured images — a curated showcase beneath the hero/profile */}
      {showFeatured && featuredItems.length > 0 && (
        <section className="pt-8 md:pt-10 pb-16 md:pb-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {(homepage.featured_title || homepage.featured_description) && (
              <div className="text-center mb-12">
                {homepage.featured_title && (
                  <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900">
                    {homepage.featured_title}
                  </h2>
                )}
                {homepage.featured_description && (
                  <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                    {homepage.featured_description}
                  </p>
                )}
              </div>
            )}

            <FeaturedGrid items={featuredItems} />
          </div>
        </section>
      )}

      {/* Empty state — only when nothing at all is configured */}
      {!hasHeroContent && !hasGreetingContent && !(showFeatured && featuredItems.length > 0) && (
        <section className="py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold font-heading text-gray-900 mb-4">
              Welcome
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              This site is being set up. Check back soon for artwork!
            </p>
            <Link
              href="/shop"
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Browse Gallery
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
