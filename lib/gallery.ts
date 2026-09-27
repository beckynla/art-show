import type { Prisma } from '@prisma/client'
import { prisma } from './db'
import { getSettings } from './settings'

export type GalleryOrder = 'newest' | 'oldest' | 'custom'

export interface GalleryArrangement {
  order: GalleryOrder
  availableFirst: boolean
}

export function parseGalleryArrangement(shop: Record<string, string>): GalleryArrangement {
  const order = shop.gallery_order
  return {
    order: order === 'oldest' || order === 'custom' ? order : 'newest',
    availableFirst: shop.gallery_available_first !== 'false',
  }
}

// Order of the admin's custom arrangement; pieces never arranged (sortOrder 0) lead, newest first
export const customOrderBy: Prisma.ProductOrderByWithRelationInput[] = [
  { sortOrder: 'asc' },
  { createdAt: 'desc' },
]

// When "available first" is on, pieces for sale lead, then reserved, then everything else
const STATUS_RANK: Record<string, number> = { available: 0, reserved: 1 }

export async function getGalleryProducts(category?: string) {
  const { order, availableFirst } = parseGalleryArrangement(await getSettings('shop'))

  const products = await prisma.product.findMany({
    where: {
      // Show every piece in the gallery except explicitly hidden ones.
      // Most pieces are "display" (not for sale); "available" pieces get a discreet indicator.
      status: { not: 'hidden' },
      ...(category ? { category } : {}),
    },
    orderBy:
      order === 'custom'
        ? customOrderBy
        : { createdAt: order === 'oldest' ? 'asc' : 'desc' },
  })

  if (!availableFirst) return products

  // Stable sort keeps the chosen order within each status group
  const rank = (status: string) => STATUS_RANK[status] ?? 2
  return [...products].sort((a, b) => rank(a.status) - rank(b.status))
}
