import Stripe from 'stripe'
import { getSetting } from './settings'

let stripeInstance: Stripe | null = null

export async function getStripe(): Promise<Stripe | null> {
  const secretKey = await getSetting('stripe_secret_key')

  if (!secretKey) {
    return null
  }

  // Create new instance if key changed or doesn't exist
  if (!stripeInstance) {
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
      typescript: true
    })
  }

  return stripeInstance
}

// Reset the Stripe instance (call when keys are updated)
export function resetStripeInstance(): void {
  stripeInstance = null
}

export async function isStripeConfigured(): Promise<boolean> {
  const secretKey = await getSetting('stripe_secret_key')
  const publishableKey = await getSetting('stripe_publishable_key')
  return !!(secretKey && publishableKey)
}

export async function getStripePublishableKey(): Promise<string | null> {
  return getSetting('stripe_publishable_key')
}

// Format amount for Stripe (already in cents in our system)
export function formatAmountForStripe(amount: number): number {
  return Math.round(amount)
}

// Format amount from Stripe to display
export function formatAmountFromStripe(amount: number): string {
  return (amount / 100).toFixed(2)
}

// Format currency for display
export function formatCurrency(amountInCents: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amountInCents / 100)
}

// Generate a unique order number
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `AB-${timestamp}-${random}`
}
