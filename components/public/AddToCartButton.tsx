'use client'

import { useState } from 'react'
import { useCart } from './CartProvider'
import { Button } from '@/components/ui'

interface AddToCartButtonProps {
  product: {
    id: string
    title: string
    price: number
    image: string | null
  }
  label?: string
}

export function AddToCartButton({ product, label = 'Add to Cart' }: AddToCartButtonProps) {
  const { addItem, items } = useCart()
  const [isAdded, setIsAdded] = useState(false)

  const isInCart = items.some((item) => item.productId === product.id)

  const handleAdd = () => {
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
    })
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  return (
    <Button
      onClick={handleAdd}
      size="lg"
      className="w-full"
      disabled={isInCart}
    >
      {isAdded ? (
        <>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Added to Cart
        </>
      ) : isInCart ? (
        'Already in Cart'
      ) : (
        <>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          {label}
        </>
      )}
    </Button>
  )
}
