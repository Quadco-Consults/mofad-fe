'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity,
  Users,
  Menu,
  X,
} from 'lucide-react'

export default function PublicNavigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/home' && pathname === '/') return true
    return pathname === path
  }

  const navItems = [
    { name: 'Home', href: '/home' },
    { name: 'About Us', href: '/about' },
    { name: 'Business Divisions', href: '/business-divisions' },
    { name: 'Gallery', href: '/gallery' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Brand */}
          <Link href="/home" className="flex items-center">
            <img
              src="/modah_logo-removebg-preview.png"
              alt="MOFAD Energy Solutions"
              className="h-14 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-[#0170B9] font-semibold'
                    : 'text-[#4B4F58] hover:text-[#0170B9]'
                }`}
                style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px' }}
              >
                {item.name}
              </Link>
            ))}

            <div className="flex items-center space-x-3">
              <Link
                href="/auth/login"
                className="px-6 py-3 bg-[#0170B9] text-white font-semibold rounded-sm hover:bg-[#015aa0] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
                style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px', borderRadius: '2px', padding: '15px 20px' }}
              >
                <Users className="w-4 h-4" />
                <span>Staff Login</span>
              </Link>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-white border-2 border-[#0170B9] text-[#0170B9] font-semibold rounded-sm hover:bg-[#0170B9] hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                style={{ fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '15px', borderRadius: '2px', padding: '13px 20px' }}
              >
                Dashboard
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-[#0170B9]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block py-2 font-medium ${
                  isActive(item.href)
                    ? 'text-[#0170B9] font-semibold'
                    : 'text-[#4B4F58] hover:text-[#0170B9]'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-3 border-t border-gray-100 space-y-3">
              <Link
                href="/auth/login"
                className="flex items-center justify-center space-x-2 w-full px-6 py-3 bg-[#0170B9] text-white font-semibold rounded-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Users className="w-4 h-4" />
                <span>Staff Login</span>
              </Link>
              <Link
                href="/dashboard"
                className="block w-full px-6 py-3 bg-white border-2 border-[#0170B9] text-[#0170B9] font-semibold rounded-sm text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Access Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}