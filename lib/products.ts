import { prisma } from '@/lib/db'
import { slugify } from '@/lib/utils'

/**
 * Produce a URL-safe, unique product slug. Falls back to "piece" when there's
 * no title/slug to derive one from, and appends -2, -3, … on collisions.
 * Pass excludeId when editing so a product doesn't collide with itself.
 */
export async function generateUniqueSlug(desired: string, excludeId?: string): Promise<string> {
  const base = slugify(desired) || 'piece'
  let candidate = base
  let n = 1
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug: candidate } })
    if (!existing || existing.id === excludeId) return candidate
    n += 1
    candidate = `${base}-${n}`
  }
}
