import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getStripe, generateOrderNumber } from '@/lib/stripe'
import { getSetting } from '@/lib/settings'
import { prisma } from '@/lib/db'
import Stripe from 'stripe'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    const stripe = await getStripe()
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      )
    }

    const webhookSecret = await getSetting('stripe_webhook_secret')
    if (!webhookSecret) {
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Parse items from metadata
        const items = JSON.parse(session.metadata?.items || '[]')

        // Get customer details
        const customerEmail = session.customer_details?.email || 'unknown@example.com'
        const customerName = session.customer_details?.name || 'Unknown'

        // Get shipping address
        const shippingAddress = session.shipping_details?.address
          ? {
              name: session.shipping_details.name || customerName,
              line1: session.shipping_details.address.line1 || '',
              line2: session.shipping_details.address.line2 || undefined,
              city: session.shipping_details.address.city || '',
              state: session.shipping_details.address.state || '',
              postalCode: session.shipping_details.address.postal_code || '',
              country: session.shipping_details.address.country || '',
            }
          : {
              name: customerName,
              line1: '',
              city: '',
              state: '',
              postalCode: '',
              country: '',
            }

        // Calculate totals
        const subtotal = items.reduce(
          (sum: number, item: { price: number; quantity: number }) =>
            sum + item.price * item.quantity,
          0
        )
        const shippingCost = session.shipping_cost?.amount_total || 0
        const total = session.amount_total || subtotal + shippingCost

        // Create order
        const order = await prisma.order.create({
          data: {
            orderNumber: generateOrderNumber(),
            customerEmail,
            customerName,
            items: JSON.stringify(items),
            subtotal,
            shippingCost,
            tax: 0,
            total,
            status: 'paid',
            shippingAddress: JSON.stringify(shippingAddress),
            stripeSessionId: session.id,
          },
        })

        // Mark products as sold (for one-of-a-kind items)
        for (const item of items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { status: 'sold', quantity: 0 },
          })
        }

        console.log('Order created:', order.orderNumber)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
