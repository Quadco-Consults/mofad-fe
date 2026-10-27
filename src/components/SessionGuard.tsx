'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { isSessionExpired, millisecondsUntilSessionExpiry } from '@/lib/session'
import { saveLastVisitedPath } from '@/components/RouteTracker'

/**
 * Bounces the user to the login page as soon as their session is over.
 *
 * The middleware already covers hard refreshes and link clicks (the session
 * cookie expires with the refresh token, so it is simply gone by then). This
 * covers the cases middleware cannot see:
 *
 *  - a tab left open past the expiry, where no navigation ever happens
 *  - returning to a backgrounded tab after the session lapsed
 *  - client-side transitions on a page that issues no API request
 *
 * Mount inside the authenticated shell; it renders nothing.
 */
export function SessionGuard() {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, expireSession } = useAuthStore()

  // Guards against firing the redirect twice while one is already in flight.
  const redirectingRef = useRef(false)

  useEffect(() => {
    if (!isAuthenticated) return

    const bounce = () => {
      if (redirectingRef.current) return
      redirectingRef.current = true

      // Remember where they were so login can send them back.
      if (pathname) {
        saveLastVisitedPath(pathname)
      }

      expireSession()
      router.replace('/auth/login?session_expired=true')
    }

    const checkNow = () => {
      if (isSessionExpired()) bounce()
    }

    // 1. On mount and on every route change.
    checkNow()
    if (redirectingRef.current) return

    // 2. When the tab regains focus or becomes visible again.
    const onVisible = () => {
      if (document.visibilityState === 'visible') checkNow()
    }
    window.addEventListener('focus', checkNow)
    document.addEventListener('visibilitychange', onVisible)

    // 3. A timer that fires exactly when the session lapses, so a user sitting
    //    idle on a page is redirected instead of discovering it on their next
    //    click. setTimeout caps out at ~24.8 days, so clamp it.
    const remaining = millisecondsUntilSessionExpiry()
    let timer: ReturnType<typeof setTimeout> | undefined
    if (remaining !== null) {
      timer = setTimeout(checkNow, Math.min(remaining + 1000, 2 ** 31 - 1))
    }

    return () => {
      window.removeEventListener('focus', checkNow)
      document.removeEventListener('visibilitychange', onVisible)
      if (timer) clearTimeout(timer)
    }
  }, [isAuthenticated, pathname, expireSession, router])

  return null
}
