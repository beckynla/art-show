'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface HeaderProps {
  shopName: string
  shopLogo: string | null
  showAbout: boolean
}

export function Header({ shopName, shopLogo, showAbout }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Fully transparent at the top so it sits on the page background; once scrolled
  // (or with the mobile menu open) a frosted tint fades in to keep links readable
  const isFrosted = isScrolled || isMobileMenuOpen

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-300 ${
        isFrosted
          ? 'bg-[color-mix(in_srgb,var(--color-background)_70%,transparent)] backdrop-blur-md border-black/5'
          : 'bg-transparent border-transparent'
      }`}
    >
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

          {/* Right Side: navigation pushed to the far right + cart */}
          <div className="flex items-center gap-6 md:gap-8">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/shop" className="text-gray-600 hover:text-gray-900 font-medium">
                Gallery
              </Link>
              {showAbout && (
                <Link href="/about" className="text-gray-600 hover:text-gray-900 font-medium">
                  About
                </Link>
              )}
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 font-medium">
                Contact
              </Link>
            </nav>

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
                Gallery
              </Link>
              {showAbout && (
                <Link
                  href="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  About
                </Link>
              )}
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
