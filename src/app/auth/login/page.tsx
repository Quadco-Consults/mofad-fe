'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/store/authStore'
import { LoginForm } from '@/types'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  // Clear any lingering errors and persisted state when the login page loads
  useEffect(() => {
    console.log('[LOGIN_PAGE] Component mounted, clearing errors and checking localStorage...')

    // Clear current error state
    clearError()

    // Also clear any persisted auth state if there are issues
    const authStorage = localStorage.getItem('auth-storage')
    if (authStorage) {
      try {
        const parsedAuth = JSON.parse(authStorage)
        if (parsedAuth.state?.error) {
          console.log('[LOGIN_PAGE] Found persisted error in localStorage, clearing...')
          // Clear the entire auth storage to reset state
          localStorage.removeItem('auth-storage')
          localStorage.removeItem('auth_token')
          // Force a page refresh to clear state
          window.location.reload()
        }
      } catch (e) {
        console.log('[LOGIN_PAGE] Error parsing auth storage, clearing it...')
        localStorage.removeItem('auth-storage')
        localStorage.removeItem('auth_token')
      }
    }

    console.log('[LOGIN_PAGE] Initialization complete')
  }, [clearError])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    console.log('LoginPage form submitted with data:', { email: data.email })
    console.log('Current auth state:', { isLoading, error, isAuthenticated: useAuthStore.getState().isAuthenticated })

    try {
      console.log('Clearing error and calling login...')
      clearError()
      await login(data)
      console.log('Login completed, navigating to dashboard...')
      router.push('/dashboard')
    } catch (error) {
      console.error('LoginPage caught error:', error)
      // Error is handled by the store
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <h1 className="text-5xl font-bold mb-4">MOFAD</h1>
            <p className="text-xl opacity-90">Distribution Management System</p>
          </div>
          <div className="space-y-4 text-lg opacity-80">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-white rounded-full mr-4"></div>
              <span>Inventory Management</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-white rounded-full mr-4"></div>
              <span>Sales Tracking</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-white rounded-full mr-4"></div>
              <span>Financial Control</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-white rounded-full mr-4"></div>
              <span>Real-time Analytics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-12 bg-gray-50">
        <div className="max-w-md mx-auto w-full">
          {/* Mobile Brand Header */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">MOFAD</h1>
            <p className="text-gray-600">Distribution Management System</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
              <p className="text-gray-600 mt-2">Please sign in to your account</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    {...register('remember')}
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <button
                  type="button"
                  className="text-sm text-primary-600 hover:text-primary-500"
                  onClick={() => {
                    // TODO: Implement forgot password
                    alert('Forgot password functionality not implemented yet')
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    // TODO: Implement registration or contact admin
                    alert('Please contact your administrator for account access')
                  }}
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Contact Administrator
                </button>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>&copy; 2024 MOFAD. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}