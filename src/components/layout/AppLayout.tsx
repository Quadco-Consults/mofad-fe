'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter, usePathname } from 'next/navigation'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Loader2 } from 'lucide-react'
import { saveLastVisitedPath } from '@/components/RouteTracker'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, isLoading, checkAuth, _hasHydrated } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    // Only check auth after Zustand has hydrated from localStorage
    if (_hasHydrated && !isLoading && !isAuthenticated) {
      // Save the current path before redirecting to login
      if (pathname) {
        saveLastVisitedPath(pathname)
      }
      router.push('/auth/login')
    }
  }, [isAuthenticated, isLoading, _hasHydrated, router, pathname])

  if (isLoading || !_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          {/* Clean Modern Loading */}
          <div className="relative bg-white rounded-2xl p-12 shadow-xl border border-gray-100">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-mofad-green mb-6" />
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-gray-900">MOFAD ERP</h3>
              <p className="text-gray-600">Initializing workspace...</p>

              {/* Clean Progress Bar */}
              <div className="mt-6 w-64 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-mofad-green to-mofad-gold h-2 rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />

        {/* Main Content - Clean & Simple */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
            {/* Content with subtle fade-in animation */}
            <div className="animate-fade-in">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm lg:hidden z-30"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
    </div>
  )
}
