import { create } from 'zustand'
import { persist } from 'zustand/middleware'
// Use the unified API client
import api from '@/lib/api-client'
import { User, LoginForm } from '@/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  isMfaRequired: boolean
  pendingEmail: string | null
  forcePasswordReset: boolean

  // Actions
  login: (credentials: LoginForm) => Promise<{ requiresMfa?: boolean; forcePasswordReset?: boolean }>
  verifyMfa: (totp: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
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

      login: async (credentials: LoginForm) => {
        set({ isLoading: true, error: null, isMfaRequired: false, pendingEmail: null })
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
          // Clear all auth data from localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('auth_user')
          }

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

      checkAuth: async () => {
        // Frontend-only authentication check using localStorage
        if (typeof window === 'undefined') return

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

      clearError: () => {
        set({ error: null })
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
      }),
    }
  )
)
