import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

// Saves the admin's custom gallery arrangement: ids in display order
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { ids } = await request.json()

    if (!Array.isArray(ids) || !ids.every((id) => typeof id === 'string')) {
      return NextResponse.json(
        { error: 'An array of product ids is required' },
        { status: 400 }
      )
    }

    await prisma.$transaction(
      ids.map((id: string, index: number) =>
        prisma.product.update({
          where: { id },
          data: { sortOrder: index + 1 },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering products:', error)
    return NextResponse.json(
      { error: 'Failed to save arrangement' },
      { status: 500 }
    )
  }
}
