// Session lifetime helpers.
//
// The backend issues a short-lived access token (24h by default) and a
// longer-lived refresh token (7 days) that is NOT rotated. So the real
// session length is the refresh token's lifetime: while it is alive an
// expired access token is silently swapped for a new one, and once it dies
// nothing can be recovered and the user has to log in again.
//
// Everything here is deliberately conservative: a session is only reported
// as expired when we can actually prove it from a token's `exp` claim.
// If no expiry can be read we assume the session is still good, so a
// malformed or unexpected token never logs someone out spuriously.

export interface JwtPayload {
  exp?: number
  iat?: number
  [key: string]: any
}

/** Decode a JWT payload without verifying it (the server does that). */
export function decodeJwt(token?: string | null): JwtPayload | null {
  if (!token) return null

  const parts = token.split('.')
  if (parts.length !== 3) return null

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)

    const decoded = typeof atob === 'function'
      ? decodeURIComponent(
          atob(padded)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        )
      : Buffer.from(padded, 'base64').toString('utf-8')

    return JSON.parse(decoded)
  } catch {
    return null
  }
}

/** A token's expiry as an epoch timestamp in ms, or null if unreadable. */
export function getTokenExpiry(token?: string | null): number | null {
  const payload = decodeJwt(token)
  if (!payload || typeof payload.exp !== 'number') return null
  return payload.exp * 1000
}

/**
 * When the current session ends, as an epoch timestamp in ms.
 * Falls back to the access token when there is no refresh token to read.
 */
export function getSessionExpiry(): number | null {
  if (typeof window === 'undefined') return null

  const refreshExpiry = getTokenExpiry(localStorage.getItem('refresh_token'))
  if (refreshExpiry !== null) return refreshExpiry

  return getTokenExpiry(localStorage.getItem('auth_token'))
}

/**
 * True only when we can prove the session is over.
 *
 * `skewMs` treats a session that is about to lapse as already gone, so we
 * redirect a moment early rather than letting a request fail first.
 */
export function isSessionExpired(skewMs = 5000): boolean {
  const expiry = getSessionExpiry()
  if (expiry === null) return false // Nothing to prove expiry with - assume valid
  return Date.now() >= expiry - skewMs
}

/** Milliseconds until the session lapses, or null if it can't be determined. */
export function millisecondsUntilSessionExpiry(): number | null {
  const expiry = getSessionExpiry()
  if (expiry === null) return null
  return Math.max(0, expiry - Date.now())
}

/** True when credentials are present at all (regardless of freshness). */
export function hasStoredCredentials(): boolean {
  if (typeof window === 'undefined') return false
  return Boolean(localStorage.getItem('auth_token') && localStorage.getItem('auth_user'))
}
