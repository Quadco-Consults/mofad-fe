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
        set({ isLoading: true, error: null })
        try {
          const response = await api.login(credentials)
          const user = response.user || response.data?.user

          if (user) {
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
          } else {
            throw new Error('Invalid response from server')
          }
        } catch (error: any) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Login failed',
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
      }),
    }
  )
)