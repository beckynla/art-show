'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface Category {
  id: string
  name: string
  slug: string
}

interface ProductFiltersProps {
  categories: Category[]
  currentCategory?: string
  currentSort?: string
}

const sortOptions = [
  { value: '', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
]

export function ProductFilters({
  categories,
  currentCategory,
  currentSort,
}: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/shop?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-4">
      {/* Category Filter */}
      {categories.length > 0 && (
        <div>
          <label htmlFor="category" className="sr-only">
            Category
          </label>
          <select
            id="category"
            value={currentCategory || ''}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Sort Filter */}
      <div>
        <label htmlFor="sort" className="sr-only">
          Sort
        </label>
        <select
          id="sort"
          value={currentSort || ''}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
