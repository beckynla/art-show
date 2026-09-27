import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { stringifyImages } from '@/lib/images'
import { generateUniqueSlug } from '@/lib/products'

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

    // All descriptor fields are optional. Derive a unique slug from whatever
    // is provided (explicit slug → title → fallback) and default price to 0.
    const finalSlug = await generateUniqueSlug(slug || title || '')

    const product = await prisma.product.create({
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
