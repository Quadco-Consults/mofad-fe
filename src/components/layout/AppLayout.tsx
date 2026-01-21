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
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Save the current path before redirecting to login
      // This allows the user to return to this page after logging back in
      if (pathname) {
        saveLastVisitedPath(pathname)
      }
      router.push('/auth/login')
    }
  }, [isAuthenticated, isLoading, router, pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
        <div className="text-center">
          <div className="relative">
            {/* Animated background circles */}
            <div className="absolute inset-0 -top-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute inset-0 -bottom-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>

            {/* Modern loading spinner */}
            <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-2xl">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-white mb-6" />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">MOFAD ERP</h3>
                <p className="text-slate-300">Initializing your workspace...</p>

                {/* Modern progress bar */}
                <div className="mt-4 w-full bg-white/10 rounded-full h-1.5">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full animate-pulse w-3/4"></div>
                </div>
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
    <div className="h-screen flex bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-hidden">
      {/* Modern Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Modern Header */}
        <Header onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />

        {/* Main Content with Glassmorphism */}
        <main className="flex-1 overflow-hidden relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-slate-50/90 to-blue-50/80"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, rgba(59, 130, 246, 0.1) 2px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}></div>

          {/* Content Container */}
          <div className="relative h-full overflow-y-auto">
            <div className="p-6 lg:p-8 max-w-full">
              {/* Modern Content Wrapper */}
              <div className="animate-in fade-in duration-500">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay with blur effect */}
      {!sidebarCollapsed && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Floating Elements for Visual Enhancement */}
      <div className="fixed top-20 right-10 w-32 h-32 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-20 left-10 w-40 h-40 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  )
}