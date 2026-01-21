import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { stringifyImages } from '@/lib/images'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    // Validate required fields
    if (!title || !slug || !price) {
      return NextResponse.json(
        { error: 'Title, slug, and price are required' },
        { status: 400 }
      )
    }

    // Check for duplicate slug
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: 'A product with this slug already exists' },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
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
        dimensionUnit: dimensionUnit || 'inches',
        weight,
        sku,
        quantity: quantity || 1,
        status: status || 'available',
        featured: featured || false,
      },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
