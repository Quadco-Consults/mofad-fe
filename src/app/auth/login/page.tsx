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
  const [rememberMe, setRememberMe] = useState(false)

  // Clear any lingering errors when the login page loads
  useEffect(() => {
    clearError()
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
        alert('MFA verification required. Please check your email for the OTP code.')
        return
      }

      if (result.forcePasswordReset) {
        alert('Password reset required. Please reset your password.')
        return
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('LoginPage caught error:', error)
      // Error is handled by the store
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-24 bg-green-50">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="mb-12">
            {/* Logo */}
            <div className="mb-6 flex justify-center lg:justify-start">
              <img
                src="/modah_logo-removebg-preview.png"
                alt="MOFAD Energy Solutions"
                className="h-16 w-auto"
              />
            </div>
            {/* Company Branding */}
            <div className="text-center lg:text-left">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                MOFAD Energy Solutions
              </h1>
              <p className="text-lg font-semibold text-gray-700 mb-1">
                Enterprise ERP
              </p>
              <p className="text-green-600 font-medium text-base">
                Powering Nigeria's Energy Future
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-3">
                E-mail
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
                className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-gray-200 focus:border-green-500 focus:ring-0 text-gray-900 placeholder-gray-400 transition-colors text-base"
                placeholder="Enter your email address"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-3">
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
                  className="w-full px-0 py-3 pr-10 bg-transparent border-0 border-b-2 border-gray-200 focus:border-green-500 focus:ring-0 text-gray-900 placeholder-gray-400 transition-colors text-base"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <div
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-5 h-5 rounded flex items-center justify-center cursor-pointer transition-colors ${
                  rememberMe
                    ? 'bg-green-500 border-green-500'
                    : 'bg-white border-2 border-gray-300'
                }`}
              >
                {rememberMe && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <label
                onClick={() => setRememberMe(!rememberMe)}
                className="ml-3 text-sm text-gray-600 cursor-pointer select-none"
              >
                Remember me on this device
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg shadow-lg shadow-green-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-base"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-12">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <button
                onClick={() => {
                  alert('Please contact your administrator for account access')
                }}
                className="font-medium text-green-500 hover:text-green-600 transition-colors"
              >
                Contact Administrator
              </button>
            </p>
          </div>

          {/* Copyright */}
          <div className="mt-8 text-xs text-gray-400">
            <p>&copy; 2024 MOFAD Energy Solutions. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Right side - MOFAD Image */}
      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100">
        {/* MOFAD Facility Image */}
        <div className="absolute inset-0">
          <img
            src="/mofad 1.jpg"
            alt="MOFAD Energy Solutions Facility"
            className="w-full h-full object-cover"
          />
          {/* Overlay for better contrast with potential text */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30" />
        </div>

      </div>
    </div>
  )
}
