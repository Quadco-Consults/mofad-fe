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
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-24 bg-[#f5f7fa]">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">
              SIGN IN
            </h1>
            <p className="text-gray-500 text-base leading-relaxed">
              Welcome to MOFAD Distribution Management System.
              <br />
              Sign in to access your account.
            </p>
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
                className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-gray-200 focus:border-primary-500 focus:ring-0 text-gray-900 placeholder-gray-400 transition-colors text-base"
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
                  className="w-full px-0 py-3 pr-10 bg-transparent border-0 border-b-2 border-gray-200 focus:border-primary-500 focus:ring-0 text-gray-900 placeholder-gray-400 transition-colors text-base"
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
                    ? 'bg-primary-500 border-primary-500'
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
              className="w-full py-4 px-6 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg shadow-lg shadow-primary-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-base"
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
                className="font-medium text-primary-500 hover:text-primary-600 transition-colors"
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

      {/* Right side - Illustration */}
      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        {/* Industrial Background Pattern */}
        <div className="absolute inset-0">
          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `
                linear-gradient(to right, #b8922f 1px, transparent 1px),
                linear-gradient(to bottom, #b8922f 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        {/* Isometric Industrial Illustration */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            viewBox="0 0 800 600"
            className="w-full h-full max-w-4xl"
            style={{ transform: 'scale(1.1)' }}
          >
            {/* Background Elements - Light structures */}
            <g opacity="0.3">
              {/* Storage Tanks Background */}
              <ellipse cx="150" cy="200" rx="40" ry="20" fill="#d1d5db" />
              <rect x="110" y="140" width="80" height="60" fill="#e5e7eb" />
              <ellipse cx="150" cy="140" rx="40" ry="20" fill="#f3f4f6" />

              <ellipse cx="250" cy="220" rx="35" ry="17" fill="#d1d5db" />
              <rect x="215" y="165" width="70" height="55" fill="#e5e7eb" />
              <ellipse cx="250" cy="165" rx="35" ry="17" fill="#f3f4f6" />
            </g>

            {/* Main Platform Base */}
            <g transform="translate(200, 280)">
              <polygon
                points="0,0 300,150 600,0 300,-150"
                fill="#e5e7eb"
                stroke="#d1d5db"
                strokeWidth="2"
              />
              <polygon
                points="0,0 0,20 300,170 300,150"
                fill="#d1d5db"
              />
              <polygon
                points="300,150 300,170 600,20 600,0"
                fill="#9ca3af"
              />
            </g>

            {/* Main Building Structure - Gold */}
            <g transform="translate(320, 200)">
              <polygon
                points="0,80 120,140 240,80 120,20"
                fill="#b8922f"
              />
              <polygon
                points="0,80 0,-40 120,-100 120,20"
                fill="#8a6b22"
              />
              <polygon
                points="120,20 120,-100 240,-40 240,80"
                fill="#d0a33e"
              />
              <polygon
                points="0,-40 120,-100 240,-40 120,20"
                fill="#e6c164"
              />
              <rect x="20" y="-20" width="25" height="20" fill="#f5f5f5" opacity="0.3" />
              <rect x="55" y="-20" width="25" height="20" fill="#f5f5f5" opacity="0.3" />
              <rect x="20" y="15" width="25" height="20" fill="#f5f5f5" opacity="0.3" />
              <rect x="55" y="15" width="25" height="20" fill="#f5f5f5" opacity="0.3" />
              <rect x="140" y="-20" width="25" height="20" fill="#f5f5f5" opacity="0.3" />
              <rect x="175" y="-20" width="25" height="20" fill="#f5f5f5" opacity="0.3" />
              <rect x="140" y="15" width="25" height="20" fill="#f5f5f5" opacity="0.3" />
              <rect x="175" y="15" width="25" height="20" fill="#f5f5f5" opacity="0.3" />
              <rect x="100" y="-85" width="40" height="15" fill="#a07d28" />
              <polygon points="100,-85 120,-95 140,-85" fill="#b8922f" />
            </g>

            {/* Ground shadows */}
            <g opacity="0.15">
              <ellipse cx="400" cy="480" rx="200" ry="30" fill="#4b5563" />
            </g>
          </svg>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/20" />

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-200 to-transparent" />
      </div>
    </div>
  )
}
