import { prisma } from '@/lib/db'
import { ProductForm } from '@/components/admin/ProductForm'

async function getCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
  })
  return categories.map((cat) => ({ value: cat.slug, label: cat.name }))
}

export default async function NewProductPage() {
  const categories = await getCategories()

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-gray-500 mt-1">Create a new artwork listing</p>
      </div>

      <ProductForm categories={categories} />
    </div>
  )
}
