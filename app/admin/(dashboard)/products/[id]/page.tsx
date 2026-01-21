import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { parseImages } from '@/lib/images'
import { ProductForm } from '@/components/admin/ProductForm'

async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
  })

  if (!product) return null

  return {
    ...product,
    images: parseImages(product.images),
  }
}

async function getCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
  })
  return categories.map((cat) => ({ value: cat.slug, label: cat.name }))
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [product, categories] = await Promise.all([
    getProduct(id),
    getCategories(),
  ])

  if (!product) {
    notFound()
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-gray-500 mt-1">{product.title}</p>
      </div>

      <ProductForm product={product} categories={categories} />
    </div>
  )
}
