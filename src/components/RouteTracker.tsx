'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Routes that should NOT be saved as "last visited"
const EXCLUDED_ROUTES = [
  '/',
  '/landing',
  '/auth/login',
  '/auth/mfa-verify',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/change-password',
]

const LAST_VISITED_KEY = 'mofad_last_visited_path'

/**
 * Saves the last visited path to localStorage
 */
export function saveLastVisitedPath(path: string) {
  if (typeof window === 'undefined') return

  // Don't save auth routes
  if (EXCLUDED_ROUTES.some(route => path.startsWith(route))) {
    return
  }

  localStorage.setItem(LAST_VISITED_KEY, path)
}

/**
 * Gets the last visited path from localStorage
 */
export function getLastVisitedPath(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(LAST_VISITED_KEY)
}

/**
 * Clears the last visited path from localStorage
 */
export function clearLastVisitedPath() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(LAST_VISITED_KEY)
}

/**
 * Gets the redirect path after login (last visited or dashboard)
 */
export function getRedirectPath(): string {
  const lastPath = getLastVisitedPath()
  clearLastVisitedPath() // Clear after reading so it's only used once
  return lastPath || '/dashboard'
}

/**
 * RouteTracker component that saves the current path on route changes
 * Add this to your providers to enable automatic route tracking
 */
export function RouteTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname) {
      saveLastVisitedPath(pathname)
    }
  }, [pathname])

  return null // This component doesn't render anything
}
