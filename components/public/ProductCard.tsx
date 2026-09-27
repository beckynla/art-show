import Link from 'next/link'
import Image from 'next/image'
import { getPrimaryImage } from '@/lib/images'
import type { ProductImage } from '@/types'

interface ProductCardProps {
  product: {
    id: string
    title: string
    slug: string
    images: ProductImage[]
    status: string
    width?: number | null
    height?: number | null
    depth?: number | null
    dimensionUnit?: string | null
  }
}

// Only pieces that are (or were) for sale get a discreet indicator.
// Display-only pieces intentionally show nothing.
const availabilityMeta: Record<string, { label: string; dotClass: string }> = {
  available: { label: 'available', dotClass: 'bg-emerald-500' },
  reserved: { label: 'reserved', dotClass: 'bg-amber-500' },
  sold: { label: 'sold', dotClass: 'bg-gray-400' },
}

function formatSize(product: ProductCardProps['product']): string | null {
  const parts = [product.width, product.height, product.depth].filter(
    (v): v is number => typeof v === 'number' && v > 0
  )
  if (parts.length === 0) return null
  return `${parts.join(' × ')} ${product.dimensionUnit || 'inches'}`
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = getPrimaryImage(product.images)
  const size = formatSize(product)
  const meta = availabilityMeta[product.status]

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block transition-transform duration-300 ease-out hover:-translate-y-2"
    >
      {/* Natural aspect ratio — artwork is never cropped or stretched */}
      <div className="relative overflow-hidden bg-gray-100 mb-4 shadow-sm transition-shadow duration-300 group-hover:shadow-2xl">
        <Image
          src={primaryImage}
          alt={product.title}
          width={0}
          height={0}
          className="block w-full h-auto group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </div>

      {/* Size only — no title */}
      {size && (
        <p className="text-sm text-gray-700 group-hover:text-primary-600 transition-colors">
          {size}
        </p>
      )}

      {/* Discreet availability indicator */}
      {meta && (
        <div className="mt-1 flex items-center gap-1.5">
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${meta.dotClass}`} />
          <span className="text-[11px] uppercase tracking-wider text-gray-400">
            {meta.label}
          </span>
        </div>
      )}
    </Link>
  )
}
