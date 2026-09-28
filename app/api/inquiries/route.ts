import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { buildInquiryEmail, getNotificationEmail, sendEmail } from '@/lib/email'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Public: submit an inquiry
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim() : ''
    const message = typeof body.message === 'string' ? body.message.trim() : ''
    const productId = typeof body.productId === 'string' ? body.productId : null
    const productTitle = typeof body.productTitle === 'string' ? body.productTitle : null

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    if (message.length > 5000) {
      return NextResponse.json({ error: 'Message is too long' }, { status: 400 })
    }

    await prisma.inquiry.create({
      data: { name, email, message, productId, productTitle },
    })

    // Email the artist. The inquiry is already saved, so a failed email never
    // fails the visitor's submission; it stays visible in admin either way.
    try {
      const to = await getNotificationEmail()
      if (to) {
        const product = productId
          ? await prisma.product.findUnique({ where: { id: productId }, select: { slug: true } })
          : null
        const result = await sendEmail({
          to,
          replyTo: email,
          ...buildInquiryEmail({ name, email, message, productTitle, productSlug: product?.slug ?? null }),
        })
        if (!result.ok) console.error('Inquiry notification not sent:', result.error)
      }
    } catch (error) {
      console.error('Inquiry notification failed:', error)
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Error creating inquiry:', error)
    return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 })
  }
}

// Admin: list inquiries
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const inquiries = await prisma.inquiry.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ inquiries })
  } catch (error) {
    console.error('Error fetching inquiries:', error)
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 })
  }
}
