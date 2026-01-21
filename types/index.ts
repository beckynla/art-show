// Product types
export interface Product {
  id: string
  title: string
  slug: string
  description: string | null
  price: number // in cents
  comparePrice: number | null
  images: ProductImage[]
  category: string | null
  width: number | null
  height: number | null
  depth: number | null
  dimensionUnit: string
  weight: number | null
  sku: string | null
  quantity: number
  status: 'available' | 'sold' | 'reserved' | 'hidden'
  featured: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ProductImage {
  type: 'local' | 'external'
  url: string
}

// Order types
export interface Order {
  id: string
  orderNumber: string
  customerEmail: string
  customerName: string
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  tax: number
  total: number
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  shippingAddress: ShippingAddress
  stripeSessionId: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  productId: string
  title: string
  price: number
  quantity: number
  image: string | null
}

export interface ShippingAddress {
  name: string
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

// Category types
export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  sortOrder: number
}

// Setting types
export interface Setting {
  id: string
  key: string
  value: string
  type: 'string' | 'number' | 'boolean' | 'json'
  group: string
}

// Cart types
export interface CartItem {
  productId: string
  title: string
  price: number
  image: string | null
  quantity: number
}

export interface Cart {
  items: CartItem[]
  subtotal: number
}

// User types
export interface User {
  id: string
  email: string
  name: string | null
  role: string
}

// Session types
export interface Session {
  userId: string
  email: string
  role: string
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}
