import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { parseImages } from '@/lib/images'
import { ProductGallery } from '@/components/public/ProductGallery'
import { InquiryButton } from '@/components/public/InquiryButton'
import { ProductCard } from '@/components/public/ProductCard'
import { Reveal } from '@/components/public/Reveal'

function formatSize(product: {
  width: number | null
  height: number | null
  depth: number | null
  dimensionUnit: string
}): string | null {
  const parts = [product.width, product.height, product.depth].filter(
    (v): v is number => typeof v === 'number' && v > 0
  )
  if (parts.length === 0) return null
  return `${parts.join(' × ')} ${product.dimensionUnit || 'inches'}`
}

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
  const size = formatSize(product)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Gallery */}
        <ProductGallery images={product.images} title={product.title || 'Artwork'} />

        {/* Product Info */}
        <div>
          {/* Title — prominent (only if the piece has one) */}
          {product.title && (
            <h1 className="text-4xl md:text-5xl font-bold font-heading text-gray-900 leading-tight">
              {product.title}
            </h1>
          )}

          {/* Size — prominent */}
          {size && (
            <p className="mt-3 text-xl text-gray-600">{size}</p>
          )}

          {(product.status === 'sold' || product.status === 'reserved') && (
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

          {/* Inquiry — available on every piece */}
          <div className="mt-8">
            <InquiryButton productId={product.id} productTitle={product.title || 'this piece'} />
          </div>

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
            {relatedProducts.map((product, i) => (
              <Reveal key={product.id} delay={(i % 4) * 80}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
