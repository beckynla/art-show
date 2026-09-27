'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ImageLightbox } from './ImageLightbox'
import { Reveal } from './Reveal'
import { MasonryGrid } from './MasonryGrid'

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
    <MasonryGrid itemGapClass="gap-6">
      {items.map((item, i) => (
        <Reveal key={item.id} delay={(i % 4) * 80}>
          <FeaturedCard item={item} />
        </Reveal>
      ))}
    </MasonryGrid>
  )
}

function FeaturedCard({ item }: { item: FeaturedItem }) {
  const cardContent = (
    <div className="bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {item.image && (
        <ImageLightbox src={item.image} alt={item.title || 'Featured'}>
          <div className="relative overflow-hidden">
            <Image
              src={item.image}
              alt={item.title || 'Featured'}
              width={0}
              height={0}
              className="block w-full h-auto group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
        <div className="bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          {item.image && (
            <ImageLightbox src={item.image} alt={item.title || 'Featured'}>
              <div className="relative overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title || 'Featured'}
                  width={0}
                  height={0}
                  className="block w-full h-auto group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
