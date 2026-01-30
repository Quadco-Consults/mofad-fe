'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/store/authStore'
import { LoginForm } from '@/types'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { getRedirectPath } from '@/components/RouteTracker'

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState('')

  // Check for session expired parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('session_expired') === 'true') {
        setSessionExpiredMessage('Your session has expired. Please log in again.')
        // Clear the query parameter
        const newUrl = window.location.pathname
        window.history.replaceState({}, '', newUrl)
      }
    }
  }, [])

  // Clear any lingering errors and invalid redirect paths when the login page loads
  useEffect(() => {
    clearError()
    // Clear any saved landing page redirects from localStorage
    if (typeof window !== 'undefined') {
      const lastPath = localStorage.getItem('mofad_last_visited_path')
      if (lastPath === '/landing' || lastPath === '/') {
        localStorage.removeItem('mofad_last_visited_path')
      }
    }
  }, [clearError])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    try {
      clearError()
      const result = await login(data)

      if (result.requiresMfa) {
        router.push('/auth/mfa-verify')
        return
      }

      if (result.forcePasswordReset) {
        router.push('/auth/change-password')
        return
      }

      // Wait a moment for state to persist before redirecting
      await new Promise(resolve => setTimeout(resolve, 100))

      // Get redirect path and ensure it's not landing page
      const redirectPath = getRedirectPath()
      const finalPath = redirectPath === '/landing' || redirectPath === '/'
        ? '/dashboard'
        : redirectPath

      router.push(finalPath)
    } catch (error) {
      console.error('LoginPage caught error:', error)
      // Error is handled by the store
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-24 bg-orange-50">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="mb-8">
            {/* Logo */}
            <div className="mb-8 flex justify-center lg:justify-start">
              <img
                src="/modah_logo-removebg-preview.png"
                alt="MOFAD Energy Solutions"
                className="h-20 w-auto"
              />
            </div>
            {/* Welcome Message */}
            <div className="text-center lg:text-left mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Welcome Back
              </h1>
              <p className="text-gray-600 font-medium text-base leading-relaxed">
                Your trusted and reliable Partner in energy distribution.
                We strive to provide the best and most satisfactory experience
                in all our engagements with customers, business associates and employees.
              </p>
            </div>
          </div>

          {/* Session Expired Message */}
          {sessionExpiredMessage && (
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
              <p className="text-yellow-700 text-sm font-medium">{sessionExpiredMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your company email address *
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
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-gray-900 placeholder-gray-400 transition-all text-base"
                placeholder="company@email.com"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-gray-900 placeholder-gray-400 transition-all text-base"
                  placeholder="************"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
              )}
              <div className="mt-2">
                <a
                  href="/auth/forgot-password"
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
                >
                  forget password?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold rounded-lg shadow-lg shadow-orange-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-base"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Signing in...
                </span>
              ) : (
                'Log In'
              )}
            </button>

            {/* Footer Text */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => {
                    alert('Please contact your administrator for account access')
                  }}
                  className="font-medium text-orange-600 hover:text-orange-700 transition-colors"
                >
                  Sign up
                </button>
              </p>
            </div>
          </form>

          {/* Copyright */}
          <div className="mt-8 text-xs text-gray-400 text-center">
            <p>&copy; 2024 MOFAD Energy Solutions. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Right side - MOFAD Image */}
      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-orange-100 to-orange-200">
        {/* MOFAD Facility Image */}
        <div className="absolute inset-0">
          <img
            src="/mofad 1.jpg"
            alt="MOFAD Energy Solutions Facility"
            className="w-full h-full object-cover"
          />
          {/* Enhanced Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/40 via-orange-500/20 to-orange-900/60" />
        </div>

        {/* Overlay Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-8 max-w-lg">
            <h2 className="text-4xl font-bold mb-4">MOFAD Energy</h2>
            <p className="text-xl font-semibold mb-6">Enterprise Management System</p>
            <p className="text-lg leading-relaxed opacity-90">
              Streamlining operations across Nigeria&apos;s energy distribution network with
              cutting-edge technology and unmatched reliability.
            </p>
          </div>
        </div>

        {/* Decorative Pattern */}
        <div className="absolute bottom-0 right-0 w-64 h-64 opacity-10">
          <div className="w-full h-full bg-gradient-to-tl from-white/20 via-transparent to-transparent rounded-tl-full"></div>
        </div>
      </div>
    </div>
  )
}
