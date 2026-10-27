import { create } from 'zustand'
import { persist } from 'zustand/middleware'
// Use the unified API client
import api from '@/lib/api-client'
import { User, LoginForm } from '@/types'
import { getTokenExpiry, isSessionExpired } from '@/lib/session'

// Helper function to set cookie.
// `expiresAt` is an absolute epoch (ms) so the cookie dies exactly when the
// session does - that is what lets middleware bounce an expired user on a
// refresh or a link click without having to inspect the token itself.
const setCookie = (name: string, value: string, expiresAt: number) => {
  if (typeof window === 'undefined') return
  const expires = new Date(expiresAt)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

// Outlives the session on purpose. Middleware uses it to tell "this session
// expired" apart from "never logged in here", so the bounce to /login can
// explain itself on a plain refresh - before any client code has run.
const SESSION_MARKER_COOKIE = 'had_session'

// The session cookie should outlive the access token but die with the refresh
// token. If neither carries a readable expiry, fall back to the backend's
// default refresh lifetime.
const resolveSessionExpiry = (refreshToken?: string | null, accessToken?: string | null) =>
  getTokenExpiry(refreshToken) ?? getTokenExpiry(accessToken) ?? Date.now() + SEVEN_DAYS_MS

// Helper function to delete cookie
const deleteCookie = (name: string) => {
  if (typeof window === 'undefined') return
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  isMfaRequired: boolean
  pendingEmail: string | null
  forcePasswordReset: boolean
  // Set when the session lapsed on its own (as opposed to never having been
  // logged in) so the redirect can explain why the user landed on /login.
  sessionExpired: boolean
  _hasHydrated: boolean

  // Actions
  login: (credentials: LoginForm) => Promise<{ requiresMfa?: boolean; forcePasswordReset?: boolean }>
  verifyMfa: (totp: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  expireSession: () => void
  updateUser: (user: Partial<User>) => void
  clearError: () => void
  setHasHydrated: (hasHydrated: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isMfaRequired: false,
      pendingEmail: null,
      forcePasswordReset: false,
      sessionExpired: false,
      _hasHydrated: false,

      login: async (credentials: LoginForm) => {
        set({ isLoading: true, error: null, isMfaRequired: false, pendingEmail: null, sessionExpired: false })
        try {
          const response = await api.login(credentials)

          // Check if MFA is required
          if (response.is_mfa_required) {
            set({
              isLoading: false,
              isMfaRequired: true,
              pendingEmail: credentials.email,
              forcePasswordReset: response.force_password_reset,
            })
            return { requiresMfa: true }
          }

          // Check if force password reset is required
          if (response.force_password_reset) {
            set({
              isLoading: false,
              forcePasswordReset: true,
              pendingEmail: credentials.email,
            })
            return { forcePasswordReset: true }
          }

          // Login successful - user is authenticated
          const user = response.user
          if (user && user.id) {
            // Store user data in localStorage for frontend-only authentication
            if (typeof window !== 'undefined') {
              localStorage.setItem('auth_user', JSON.stringify(user))
              // Set auth cookie for middleware to recognize authenticated state.
              // It expires with the refresh token so the browser drops it the
              // moment the session is unrecoverable.
              setCookie(
                'auth_token',
                response.tokens?.access_token || 'authenticated',
                resolveSessionExpiry(response.tokens?.refresh_token, response.tokens?.access_token)
              )
              setCookie(SESSION_MARKER_COOKIE, '1', Date.now() + THIRTY_DAYS_MS)
            }

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              isMfaRequired: false,
              pendingEmail: null,
              forcePasswordReset: false,
            })
            return {}
          } else {
            throw new Error('Invalid user data received from server')
          }
        } catch (error: any) {
          const errorMessage = error?.message || 'Login failed'

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
            isMfaRequired: false,
            pendingEmail: null,
          })
          throw error
        }
      },

      verifyMfa: async (totp: string) => {
        const { pendingEmail } = get()
        if (!pendingEmail) {
          throw new Error('No pending MFA verification')
        }

        set({ isLoading: true, error: null })
        try {
          const response = await api.verifyMFA(pendingEmail, totp)
          const user = response.user

          if (user && user.id) {
            // Store user data in localStorage for frontend-only authentication
            if (typeof window !== 'undefined') {
              localStorage.setItem('auth_user', JSON.stringify(user))
              // Set auth cookie for middleware to recognize authenticated state.
              // It expires with the refresh token so the browser drops it the
              // moment the session is unrecoverable.
              setCookie(
                'auth_token',
                response.tokens?.access_token || 'authenticated',
                resolveSessionExpiry(response.tokens?.refresh_token, response.tokens?.access_token)
              )
              setCookie(SESSION_MARKER_COOKIE, '1', Date.now() + THIRTY_DAYS_MS)
            }

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              isMfaRequired: false,
              pendingEmail: null,
            })
          } else {
            throw new Error('MFA verification failed')
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'MFA verification failed',
          })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await api.logout()
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          // Clear all auth data from localStorage and cookies
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('auth_user')
            deleteCookie('auth_token')
            deleteCookie(SESSION_MARKER_COOKIE)
          }

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            isMfaRequired: false,
            pendingEmail: null,
            forcePasswordReset: false,
            // A deliberate sign-out is not an expiry - don't tell the user
            // their session timed out.
            sessionExpired: false,
          })
        }
      },

      checkAuth: async () => {
        // An expired session has to be caught before anything else - including
        // the "already authenticated" shortcut below, which would otherwise
        // keep handing back a stale logged-in state until some API call
        // happened to 401.
        if (typeof window !== 'undefined' && isSessionExpired()) {
          get().expireSession()
          return
        }

        // If already authenticated, don't re-check
        const currentState = get()
        if (currentState.isAuthenticated && currentState.user) {
          set({ isLoading: false })
          return
        }

        // Set loading state at the start
        set({ isLoading: true })

        // Frontend-only authentication check using localStorage
        if (typeof window === 'undefined') {
          set({ isLoading: false })
          return
        }

        const token = localStorage.getItem('auth_token')
        const storedUser = localStorage.getItem('auth_user')

        if (!token || !storedUser) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isMfaRequired: false,
            pendingEmail: null,
            forcePasswordReset: false,
          })
          return
        }

        try {
          const user = JSON.parse(storedUser)
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            isMfaRequired: false,
            pendingEmail: null,
            forcePasswordReset: false,
          })
        } catch (error) {
          // Invalid stored data
          localStorage.removeItem('auth_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('auth_user')
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            isMfaRequired: false,
            pendingEmail: null,
            forcePasswordReset: false,
          })
        }
      },

      // Tear down a session that has lapsed. Clears tokens, the persisted
      // user and the middleware cookie, then flags why so the login page can
      // say "your session expired" instead of silently appearing.
      expireSession: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('auth_user')
          deleteCookie('auth_token')
        }

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          isMfaRequired: false,
          pendingEmail: null,
          forcePasswordReset: false,
          sessionExpired: true,
        })
      },

      updateUser: (updatedUser: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          const newUser = { ...currentUser, ...updatedUser }
          // Update both Zustand store and localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_user', JSON.stringify(newUser))
          }
          set({ user: newUser })
        }
      },

      clearError: () => {
        set({ error: null })
      },

      setHasHydrated: (hasHydrated: boolean) => {
        set({ _hasHydrated: hasHydrated })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isMfaRequired: state.isMfaRequired,
        pendingEmail: state.pendingEmail,
        forcePasswordReset: state.forcePasswordReset,
        sessionExpired: state.sessionExpired,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
      // Skip hydration check initially to prevent flash
      skipHydration: false,
    }
  )
)
