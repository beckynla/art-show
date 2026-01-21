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
    if (Array.isArray(parsed)) return parsed
    return []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const homepage = await getSettings('homepage')

  // Check visibility settings (default to true if not set)
  const showHero = homepage.show_hero !== 'false'
  const showFeatured = homepage.show_featured !== 'false'
  const showAbout = homepage.show_about !== 'false'

  // Parse featured items
  const featuredItems = parseFeaturedItems(homepage.featured_items || '[]')

  // Check if hero section has content
  const hasHeroContent = homepage.hero_title || homepage.hero_image || homepage.hero_subtitle

  // Check if about section has content
  const hasAboutContent = homepage.about_title || homepage.about_content || homepage.about_image

  // Check if any section is visible
  const hasVisibleContent =
    (showHero && hasHeroContent) ||
    (showFeatured && featuredItems.length > 0) ||
    (showAbout && hasAboutContent)

  return (
    <div>
      {/* Hero Section */}
      {showHero && hasHeroContent && (
        <section className="relative bg-gray-900 text-white">
          {homepage.hero_image && (
            <Image
              src={homepage.hero_image}
              alt="Hero"
              fill
              className="object-cover"
              priority
            />
          )}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
            <div className="max-w-2xl">
              {homepage.hero_title && (
                <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">
                  {homepage.hero_title}
                </h1>
              )}
              {homepage.hero_subtitle && (
                <p className="text-lg md:text-xl text-gray-300 mb-8">
                  {homepage.hero_subtitle}
                </p>
              )}
              {homepage.hero_button_text && (
                <Link
                  href={homepage.hero_button_link || '/shop'}
                  className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  {homepage.hero_button_text}
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Featured Section */}
      {showFeatured && featuredItems.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {(homepage.featured_title || homepage.featured_description) && (
              <div className="text-center mb-12">
                {homepage.featured_title && (
                  <h2 className="text-3xl font-bold font-heading text-gray-900">
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

      {/* About Section */}
      {showAbout && hasAboutContent && (
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {homepage.about_image && (
                <ImageLightbox src={homepage.about_image} alt="About">
                  <div className="relative aspect-square rounded-lg overflow-hidden cursor-zoom-in">
                    <Image
                      src={homepage.about_image}
                      alt="About"
                      fill
                      className="object-cover"
                    />
                  </div>
                </ImageLightbox>
              )}
              <div className={homepage.about_image ? '' : 'md:col-span-2 text-center max-w-2xl mx-auto'}>
                {homepage.about_title && (
                  <h2 className="text-3xl font-bold font-heading text-gray-900 mb-6">
                    {homepage.about_title}
                  </h2>
                )}
                {homepage.about_content && (
                  <div className="prose prose-lg text-gray-600">
                    {homepage.about_content.split('\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                )}
                <Link
                  href="/about"
                  className="inline-block mt-6 text-primary-600 font-medium hover:text-primary-700"
                >
                  Learn more &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Empty State - show when no content is configured */}
      {!hasVisibleContent && (
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
              Browse Shop
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
