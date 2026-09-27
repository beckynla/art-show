import { prisma } from '@/lib/db'
import { getSettings } from '@/lib/settings'
import { parseImages, getPrimaryImage } from '@/lib/images'
import { customOrderBy, parseGalleryArrangement } from '@/lib/gallery'
import { GalleryArranger } from '@/components/admin/GalleryArranger'

export default async function ArrangeGalleryPage() {
  const [products, shopSettings] = await Promise.all([
    prisma.product.findMany({
      where: { status: { not: 'hidden' } },
      orderBy: customOrderBy,
    }),
    getSettings('shop'),
  ])

  const { order, availableFirst } = parseGalleryArrangement(shopSettings)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Arrange Gallery</h1>
        <p className="text-gray-500 mt-1">Choose the order pieces appear in your public gallery</p>
      </div>

      <GalleryArranger
        products={products.map((product) => ({
          id: product.id,
          title: product.title,
          status: product.status,
          image: getPrimaryImage(parseImages(product.images)),
        }))}
        initialOrder={order}
        initialAvailableFirst={availableFirst}
      />
    </div>
  )
}
