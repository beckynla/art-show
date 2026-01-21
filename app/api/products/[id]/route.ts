import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { stringifyImages } from '@/lib/images'

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

    // Check for duplicate slug (excluding current product)
    if (slug !== existingProduct.slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug },
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'A product with this slug already exists' },
          { status: 400 }
        )
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        title,
        slug,
        description,
        price,
        comparePrice,
        images: stringifyImages(images || []),
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
