'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export function LandingNavigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/landing" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="text-xl font-bold text-gray-900">MOFAD Energy</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/home" className="text-gray-700 hover:text-orange-600 transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-orange-600 transition-colors">
              About
            </Link>
            <Link href="/business-divisions" className="text-gray-700 hover:text-orange-600 transition-colors">
              Services
            </Link>
            <Link href="/gallery" className="text-gray-700 hover:text-orange-600 transition-colors">
              Gallery
            </Link>
            <Link
              href="/auth/login"
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/home"
              className="block py-2 text-gray-700 hover:text-orange-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/about"
              className="block py-2 text-gray-700 hover:text-orange-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/business-divisions"
              className="block py-2 text-gray-700 hover:text-orange-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              href="/gallery"
              className="block py-2 text-gray-700 hover:text-orange-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Gallery
            </Link>
            <Link
              href="/auth/login"
              className="block py-3 px-6 bg-orange-500 text-white text-center rounded-lg hover:bg-orange-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
