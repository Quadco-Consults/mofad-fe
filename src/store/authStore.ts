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

  // Actions
  login: (credentials: LoginForm) => Promise<void>
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

      login: async (credentials: LoginForm) => {
        console.log('[AUTH_STORE] 🎯 Login initiated for:', { email: credentials.email })
        console.log('[AUTH_STORE] Using API client:', USE_REAL_API ? 'Real Django API' : 'Mock API')

        // Clear any existing errors and set loading state
        console.log('[AUTH_STORE] Clearing errors and setting loading state...')
        set({ isLoading: true, error: null })

        try {
          console.log('[AUTH_STORE] Calling API login...')
          const response = await api.login(credentials)
          console.log('[AUTH_STORE] API login response received:', response)

          // Extract user from response
          const user = response?.user || response?.data?.user || response

          console.log('[AUTH_STORE] Extracted user data:', user)

          if (user && user.email) {
            console.log('[AUTH_STORE] ✅ Valid user data found, updating store...')
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null, // Explicitly clear any errors on successful login
            })
            console.log('[AUTH_STORE] 🎉 Auth store updated successfully!')
            console.log('[AUTH_STORE] Final auth state:', {
              isAuthenticated: true,
              userId: user.id,
              userEmail: user.email,
              userName: user.name
            })
          } else {
            console.error('[AUTH_STORE] ❌ Invalid user data in response:', response)
            throw new Error('Invalid user data received from server')
          }
        } catch (error: any) {
          console.error('[AUTH_STORE] ❌ Login failed with error:', error)
          console.error('[AUTH_STORE] Error details:', {
            message: error?.message,
            status: error?.status,
            stack: error?.stack,
            type: typeof error,
            fullError: error
          })

          const errorMessage = error?.message || 'Login failed'
          console.log('[AUTH_STORE] Setting error state:', errorMessage)

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          })

          // Re-throw error to be handled by the UI
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
          })
        }
      },

      checkAuth: async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

        if (!token) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false
          })
          return
        }

        set({ isLoading: true })
        try {
          const response = await api.getUser()
          const user = response.user || response.data || response

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          // Token is invalid or expired
          localStorage.removeItem('auth_token')
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
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
        // Don't persist error, isLoading states - these should be reset on page load
      }),
    }
  )
)