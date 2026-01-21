'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CartIcon } from './CartIcon'

interface HeaderProps {
  shopName: string
  shopLogo: string | null
}

export function Header({ shopName, shopLogo }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            {shopLogo ? (
              <Image
                src={shopLogo}
                alt={shopName}
                width={40}
                height={40}
                className="h-10 w-auto"
              />
            ) : null}
            <span className="text-xl font-bold text-gray-900 font-heading">
              {shopName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/shop" className="text-gray-600 hover:text-gray-900 font-medium">
              Shop
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900 font-medium">
              About
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900 font-medium">
              Contact
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <CartIcon />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-4">
              <Link
                href="/shop"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Shop
              </Link>
              <Link
                href="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                About
              </Link>
              <Link
                href="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Contact
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
