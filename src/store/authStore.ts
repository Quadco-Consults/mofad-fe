import { create } from 'zustand'
import { persist } from 'zustand/middleware'
// Import both API clients for flexibility
import mockApi from '@/lib/mockApi'
import apiClient from '@/lib/apiClient'
import { User, LoginForm } from '@/types'

// Use real Django API by default, fallback to mock if needed
const USE_REAL_API = process.env.NEXT_PUBLIC_USE_REAL_API !== 'false'
const api = USE_REAL_API ? apiClient : mockApi

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
            throw new Error('Invalid response from server')
          }
        } catch (error: any) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Login failed',
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
          const response = await apiClient.verifyMFA(pendingEmail, totp)
          const user = response.user

          if (user && user.id) {
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
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

        if (!token) {
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

        set({ isLoading: true })
        try {
          const user = await api.getUser()

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
          // Token is invalid or expired
          localStorage.removeItem('auth_token')
          localStorage.removeItem('refresh_token')
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