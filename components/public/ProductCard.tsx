import Link from 'next/link'
import Image from 'next/image'
import { getPrimaryImage } from '@/lib/images'
import { formatCurrency } from '@/lib/stripe'
import type { ProductImage } from '@/types'

interface ProductCardProps {
  product: {
    id: string
    title: string
    slug: string
    price: number
    comparePrice: number | null
    images: ProductImage[]
    status: string
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = getPrimaryImage(product.images)
  const isSold = product.status === 'sold'

  return (
    <Link href={`/product/${product.slug}`} className="group">
      <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
        <Image
          src={primaryImage}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {isSold && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-4 py-2 rounded-full font-medium">
              Sold
            </span>
          </div>
        )}
      </div>
      <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
        {product.title}
      </h3>
      <div className="mt-1 flex items-center gap-2">
        <span className={`font-medium ${isSold ? 'text-gray-500' : 'text-gray-900'}`}>
          {formatCurrency(product.price)}
        </span>
        {product.comparePrice && product.comparePrice > product.price && (
          <span className="text-gray-500 line-through text-sm">
            {formatCurrency(product.comparePrice)}
          </span>
        )}
      </div>
    </Link>
  )
}
