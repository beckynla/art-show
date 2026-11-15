import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { stringifyImages } from '@/lib/images'
import { generateUniqueSlug } from '@/lib/products'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const {
      title,
      slug,
      description,
      price,
      comparePrice,
      images,
      category,
      width,
      height,
      depth,
      dimensionUnit,
      weight,
      sku,
      quantity,
      status,
      featured,
      showPrice,
    } = body

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // All descriptor fields are optional. Keep the existing slug when unchanged;
    // otherwise derive a unique one (excluding this product from the collision check).
    const desiredSlug = slug || title || existingProduct.slug
    const finalSlug =
      desiredSlug === existingProduct.slug
        ? existingProduct.slug
        : await generateUniqueSlug(desiredSlug, id)

    const product = await prisma.product.update({
      where: { id },
      data: {
        title: title || '',
        slug: finalSlug,
        description: description || null,
        price: typeof price === 'number' ? price : 0,
        comparePrice: typeof comparePrice === 'number' ? comparePrice : null,
        images: stringifyImages(images || []),
        category: category || null,
        width,
        height,
        depth,
        dimensionUnit: dimensionUnit || 'inches',
        weight,
        sku: sku || null,
        quantity: quantity ?? 1,
        status: status || 'available',
        featured: featured || false,
        showPrice: showPrice === true,
      },
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

const STATUSES = ['available', 'display', 'sold', 'reserved', 'hidden']

// Change only a product's status and/or price visibility, from the product page's admin buttons
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { status, showPrice } = await request.json()

    if (status !== undefined && !STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    if (showPrice !== undefined && typeof showPrice !== 'boolean') {
      return NextResponse.json({ error: 'Invalid showPrice' }, { status: 400 })
    }

    const product = await prisma.product.update({
      where: { id },
      data: { status, showPrice },
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error updating product status:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await prisma.product.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
