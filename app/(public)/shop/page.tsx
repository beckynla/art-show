import Image from 'next/image'
import { prisma } from '@/lib/db'
import { getSettings } from '@/lib/settings'
import { parseImages } from '@/lib/images'
import { ProductCard } from '@/components/public/ProductCard'
import { ProductFilters } from '@/components/public/ProductFilters'

interface ShopPageProps {
  searchParams: Promise<{ category?: string; sort?: string }>
}

async function getProducts(category?: string, sort?: string) {
  const where = {
    status: { in: ['available', 'sold'] as string[] },
    ...(category ? { category } : {}),
  }

  const orderBy = (() => {
    switch (sort) {
      case 'price-asc':
        return { price: 'asc' as const }
      case 'price-desc':
        return { price: 'desc' as const }
      case 'oldest':
        return { createdAt: 'asc' as const }
      default:
        return { createdAt: 'desc' as const }
    }
  })()

  return prisma.product.findMany({ where, orderBy })
}

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
  })
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams
  const [products, categories, shopSettings] = await Promise.all([
    getProducts(params.category, params.sort),
    getCategories(),
    getSettings('shop'),
  ])

  const productsWithImages = products.map((product) => ({
    ...product,
    images: parseImages(product.images),
  }))

  const title = shopSettings.shop_title || ''
  const description = shopSettings.shop_description || ''
  const emptyMessage = shopSettings.shop_empty_message || 'No products found'
  const bannerImage = shopSettings.shop_banner

  return (
    <div>
      {/* Banner */}
      {bannerImage && (
        <div className="relative h-48 md:h-64 bg-gray-900">
          <Image
            src={bannerImage}
            alt={title || 'Shop'}
            fill
            className="object-cover"
          />
          {title && (
            <>
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <h1 className="text-4xl md:text-5xl font-bold font-heading text-white">
                  {title}
                </h1>
              </div>
            </>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header - only show if no banner and has content */}
        {!bannerImage && (title || description) && (
          <div className="mb-8">
            {title && (
              <h1 className="text-3xl font-bold font-heading text-gray-900">{title}</h1>
            )}
            {description && (
              <p className={title ? "mt-2 text-gray-600" : "text-gray-600"}>{description}</p>
            )}
          </div>
        )}

        {/* Description under banner */}
        {bannerImage && description && (
          <p className="mb-8 text-gray-600 text-center max-w-2xl mx-auto">{description}</p>
        )}

        <ProductFilters
          categories={categories}
          currentCategory={params.category}
          currentSort={params.sort}
        />

        {productsWithImages.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {productsWithImages.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
