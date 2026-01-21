'use client'

import Link from 'next/link'
import { useCart } from './CartProvider'

export function CartIcon() {
  const { itemCount } = useCart()

  return (
    <Link
      href="/cart"
      className="relative p-2 text-gray-600 hover:text-gray-900"
      aria-label="Shopping cart"
    >
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  )
}
