'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Textarea, Select } from '@/components/ui'
import { ImageInput } from './ImageInput'
import type { ProductImage } from '@/types'

interface ProductFormProps {
  product?: {
    id: string
    title: string
    slug: string
    description: string | null
    price: number
    comparePrice: number | null
    images: ProductImage[]
    category: string | null
    width: number | null
    height: number | null
    depth: number | null
    dimensionUnit: string
    weight: number | null
    sku: string | null
    quantity: number
    status: string
    featured: boolean
  }
  categories: { value: string; label: string }[]
}

const statusOptions = [
  { value: 'display', label: 'Display Only (not for sale)' },
  { value: 'available', label: 'Available (for sale)' },
  { value: 'sold', label: 'Sold' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'hidden', label: 'Hidden' },
]

const dimensionUnitOptions = [
  { value: 'inches', label: 'Inches' },
  { value: 'cm', label: 'Centimeters' },
]

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter()
  const isEditing = !!product

  const [formData, setFormData] = useState({
    title: product?.title || '',
    slug: product?.slug || '',
    description: product?.description || '',
    price: product ? (product.price / 100).toFixed(2) : '',
    comparePrice: product?.comparePrice ? (product.comparePrice / 100).toFixed(2) : '',
    images: product?.images || [],
    category: product?.category || '',
    width: product?.width?.toString() || '',
    height: product?.height?.toString() || '',
    depth: product?.depth?.toString() || '',
    dimensionUnit: product?.dimensionUnit || 'inches',
    weight: product?.weight?.toString() || '',
    sku: product?.sku || '',
    quantity: product?.quantity?.toString() || '1',
    status: product?.status || 'available',
    featured: product?.featured || false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    // Auto-generate slug from title
    if (name === 'title' && !isEditing) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      setFormData((prev) => ({ ...prev, slug }))
    }
  }

  const handleImagesChange = (images: ProductImage[]) => {
    setFormData((prev) => ({ ...prev, images }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const payload = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description || null,
        price: formData.price ? Math.round(parseFloat(formData.price) * 100) : 0,
        comparePrice: formData.comparePrice
          ? Math.round(parseFloat(formData.comparePrice) * 100)
          : null,
        images: formData.images,
        category: formData.category || null,
        width: formData.width ? parseFloat(formData.width) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        depth: formData.depth ? parseFloat(formData.depth) : null,
        dimensionUnit: formData.dimensionUnit,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        sku: formData.sku || null,
        quantity: parseInt(formData.quantity) || 1,
        status: formData.status,
        featured: formData.featured,
      }

      const url = isEditing ? `/api/products/${product.id}` : '/api/products'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save product')
      }

      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!product || !confirm('Are you sure you want to delete this product?')) {
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete product')
      }

      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-700">{error}</div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Sunset Over Mountains"
            helpText="Optional — leave blank for an untitled piece"
          />
          <Input
            label="Slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            placeholder="e.g., sunset-over-mountains"
            helpText="Optional — auto-generated if left blank"
          />
          <div className="md:col-span-2">
            <Textarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe your artwork..."
            />
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Images</h2>
        <ImageInput images={formData.images} onChange={handleImagesChange} />
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={handleChange}
            placeholder="0.00"
            helpText="Optional — prices are not shown publicly"
          />
          <Input
            label="Compare at Price"
            name="comparePrice"
            type="number"
            step="0.01"
            min="0"
            value={formData.comparePrice}
            onChange={handleChange}
            placeholder="0.00"
            helpText="Original price for showing discounts"
          />
        </div>
      </div>

      {/* Dimensions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Dimensions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Input
            label="Width"
            name="width"
            type="number"
            step="0.1"
            min="0"
            value={formData.width}
            onChange={handleChange}
          />
          <Input
            label="Height"
            name="height"
            type="number"
            step="0.1"
            min="0"
            value={formData.height}
            onChange={handleChange}
          />
          <Input
            label="Depth"
            name="depth"
            type="number"
            step="0.1"
            min="0"
            value={formData.depth}
            onChange={handleChange}
          />
          <Select
            label="Unit"
            name="dimensionUnit"
            value={formData.dimensionUnit}
            onChange={handleChange}
            options={dimensionUnitOptions}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Input
            label="Weight (lbs)"
            name="weight"
            type="number"
            step="0.1"
            min="0"
            value={formData.weight}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Organization */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Organization</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={[{ value: '', label: 'Select category' }, ...categories]}
          />
          <Input
            label="SKU"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            placeholder="e.g., ART-001"
          />
          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={statusOptions}
          />
          <Input
            label="Quantity"
            name="quantity"
            type="number"
            min="0"
            value={formData.quantity}
            onChange={handleChange}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="featured" className="text-sm font-medium text-gray-700">
              Featured product
            </label>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div>
          {isEditing && (
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              Delete Product
            </Button>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/products')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </div>
    </form>
  )
}
