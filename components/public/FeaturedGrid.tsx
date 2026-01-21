'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ImageLightbox } from './ImageLightbox'

interface FeaturedItem {
  id: string
  image: string
  title: string
  description?: string
  link?: string
}

interface FeaturedGridProps {
  items: FeaturedItem[]
}

export function FeaturedGrid({ items }: FeaturedGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <FeaturedCard key={item.id} item={item} />
      ))}
    </div>
  )
}

function FeaturedCard({ item }: { item: FeaturedItem }) {
  const cardContent = (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {item.image && (
        <ImageLightbox src={item.image} alt={item.title || 'Featured'}>
          <div className="relative aspect-square">
            <Image
              src={item.image}
              alt={item.title || 'Featured'}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </ImageLightbox>
      )}
      {(item.title || item.description) && (
        <div className="p-4">
          {item.title && (
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
              {item.title}
            </h3>
          )}
          {item.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {item.description}
            </p>
          )}
        </div>
      )}
    </div>
  )

  // If there's a link, wrap title/description in link but keep image with lightbox
  if (item.link) {
    return (
      <div className="group">
        <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          {item.image && (
            <ImageLightbox src={item.image} alt={item.title || 'Featured'}>
              <div className="relative aspect-square">
                <Image
                  src={item.image}
                  alt={item.title || 'Featured'}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </ImageLightbox>
          )}
          {(item.title || item.description) && (
            <Link href={item.link} className="block p-4">
              {item.title && (
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {item.title}
                </h3>
              )}
              {item.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {item.description}
                </p>
              )}
            </Link>
          )}
        </div>
      </div>
    )
  }

  return <div className="group">{cardContent}</div>
}
