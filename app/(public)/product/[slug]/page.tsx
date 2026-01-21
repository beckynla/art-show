import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { parseImages } from '@/lib/images'
import { formatCurrency } from '@/lib/stripe'
import { ProductGallery } from '@/components/public/ProductGallery'
import { AddToCartButton } from '@/components/public/AddToCartButton'
import { ProductCard } from '@/components/public/ProductCard'

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
  })

  if (!product) return null

  return {
    ...product,
    images: parseImages(product.images),
  }
}

async function getRelatedProducts(category: string | null, excludeId: string) {
  if (!category) return []

  const products = await prisma.product.findMany({
    where: {
      category,
      id: { not: excludeId },
      status: 'available',
    },
    take: 4,
  })

  return products.map((p) => ({
    ...p,
    images: parseImages(p.images),
  }))
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(product.category, product.id)
  const isAvailable = product.status === 'available'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Gallery */}
        <ProductGallery images={product.images} title={product.title} />

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold font-heading text-gray-900">
            {product.title}
          </h1>

          <div className="mt-4 flex items-center gap-4">
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-lg text-gray-500 line-through">
                {formatCurrency(product.comparePrice)}
              </span>
            )}
          </div>

          {!isAvailable && (
            <div className="mt-4 inline-block bg-gray-100 text-gray-800 px-4 py-2 rounded-full font-medium">
              {product.status === 'sold' ? 'Sold' : 'Reserved'}
            </div>
          )}

          {product.description && (
            <div className="mt-6 prose prose-gray">
              {product.description.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          )}

          {/* Dimensions */}
          {(product.width || product.height || product.depth) && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">Dimensions</h3>
              <p className="mt-1 text-gray-600">
                {[
                  product.width && `${product.width}`,
                  product.height && `${product.height}`,
                  product.depth && `${product.depth}`,
                ]
                  .filter(Boolean)
                  .join(' x ')}{' '}
                {product.dimensionUnit}
              </p>
            </div>
          )}

          {/* Add to Cart */}
          {isAvailable && (
            <div className="mt-8">
              <AddToCartButton
                product={{
                  id: product.id,
                  title: product.title,
                  price: product.price,
                  image: product.images[0]?.url || null,
                }}
              />
            </div>
          )}

          {/* SKU */}
          {product.sku && (
            <p className="mt-6 text-sm text-gray-500">SKU: {product.sku}</p>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-bold font-heading text-gray-900 mb-8">
            Related Artwork
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
