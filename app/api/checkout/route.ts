import { NextResponse } from 'next/server'
import { getStripe, isStripeConfigured, generateOrderNumber } from '@/lib/stripe'
import { getSetting } from '@/lib/settings'
import { prisma } from '@/lib/db'
import type { CartItem } from '@/types'

export async function POST(request: Request) {
  try {
    // Check if Stripe is configured
    const stripeConfigured = await isStripeConfigured()
    if (!stripeConfigured) {
      return NextResponse.json(
        { error: 'Payment processing is not configured. Please contact the shop owner.' },
        { status: 500 }
      )
    }

    const stripe = await getStripe()
    if (!stripe) {
      return NextResponse.json(
        { error: 'Failed to initialize payment processor' },
        { status: 500 }
      )
    }

    const { items } = await request.json() as { items: CartItem[] }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    // Verify products exist and prices match
    const productIds = items.map((item) => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    })

    const productMap = new Map(products.map((p) => [p.id, p]))

    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.title}` },
          { status: 400 }
        )
      }
      if (product.status !== 'available') {
        return NextResponse.json(
          { error: `Product is no longer available: ${item.title}` },
          { status: 400 }
        )
      }
      if (product.price !== item.price) {
        return NextResponse.json(
          { error: `Price has changed for: ${item.title}. Please refresh and try again.` },
          { status: 400 }
        )
      }
    }

    // Get shipping settings
    const shippingEnabled = await getSetting('shipping_enabled')
    const shippingFlatRate = await getSetting('shipping_flat_rate')
    const shippingFreeThreshold = await getSetting('shipping_free_threshold')

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    // Calculate shipping
    let shippingCost = 0
    if (shippingEnabled === 'true' && shippingFlatRate) {
      const flatRate = Math.round(parseFloat(shippingFlatRate) * 100)
      const freeThreshold = shippingFreeThreshold
        ? Math.round(parseFloat(shippingFreeThreshold) * 100)
        : null

      if (!freeThreshold || subtotal < freeThreshold) {
        shippingCost = flatRate
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: items.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.title,
            images: item.image ? [item.image.startsWith('http') ? item.image : `${appUrl}${item.image}`] : [],
          },
          unit_amount: item.price,
        },
        quantity: item.quantity,
      })),
      ...(shippingCost > 0 && {
        shipping_options: [
          {
            shipping_rate_data: {
              type: 'fixed_amount',
              fixed_amount: {
                amount: shippingCost,
                currency: 'usd',
              },
              display_name: 'Standard Shipping',
            },
          },
        ],
      }),
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU'],
      },
      customer_creation: 'always',
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cart`,
      metadata: {
        items: JSON.stringify(items.map((item) => ({
          productId: item.productId,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
        }))),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
