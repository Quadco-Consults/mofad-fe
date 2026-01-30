'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Loader2 } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, checkAuth, _hasHydrated } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    // Wait for Zustand to hydrate before redirecting
    if (_hasHydrated && !isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard')
      } else {
        router.push('/landing')
      }
    }
  }, [isAuthenticated, isLoading, _hasHydrated, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">MOFAD</h1>
          <p className="text-lg text-gray-600">Distribution Management System</p>
        </div>
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500" />
        <p className="mt-4 text-gray-500">Loading...</p>
      </div>
    </div>
  )
}