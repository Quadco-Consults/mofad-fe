'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Loader2, ArrowLeft, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api-client'

interface ResetPasswordForm {
  otp: string
  newPassword: string
  confirmPassword: string
}

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>()

  const newPassword = watch('newPassword')

  useEffect(() => {
    if (!email) {
      router.push('/auth/forgot-password')
    }
  }, [email, router])

  const onSubmit = async (data: ResetPasswordForm) => {
    try {
      setIsLoading(true)
      setError(null)

      await api.resetPassword(email, data.otp, data.newPassword)

      setIsSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    try {
      setIsLoading(true)
      setError(null)
      await api.resendOtp(email, 'PASSWORD_RESET')
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex">
        {/* Left side - Success Message */}
        <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-24 bg-green-50">
          <div className="max-w-md w-full">
            {/* Logo */}
            <div className="mb-6 flex justify-center lg:justify-start">
              <img
                src="/modah_logo-removebg-preview.png"
                alt="MOFAD Energy Solutions"
                className="h-16 w-auto"
              />
            </div>

            {/* Success Icon */}
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Password Reset Successfully!
              </h1>
              <p className="text-gray-600">
                Your password has been reset. You can now login with your new password.
              </p>
            </div>

            {/* Login Button */}
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full py-4 px-6 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg shadow-lg shadow-green-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 text-base"
            >
              Go to Login
            </button>
          </div>
        </div>

        {/* Right side - Image */}
        <div className="hidden lg:block lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100">
          <div className="absolute inset-0">
            <img
              src="/mofad 1.jpg"
              alt="MOFAD Energy Solutions Facility"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
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

            {/* Icon */}
            <div className="flex justify-center lg:justify-start mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-green-500" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center lg:text-left">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Reset Your Password
              </h1>
              <p className="text-gray-600">
                Enter the OTP code sent to <span className="text-green-600 font-medium">{email}</span> and create your new password.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* OTP Field */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-3">
                OTP Code
              </label>
              <input
                {...register('otp', {
                  required: 'OTP code is required',
                  minLength: {
                    value: 6,
                    message: 'OTP code must be 6 digits',
                  },
                  maxLength: {
                    value: 6,
                    message: 'OTP code must be 6 digits',
                  },
                })}
                type="text"
                maxLength={6}
                className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-gray-200 focus:border-green-500 focus:ring-0 text-gray-900 placeholder-gray-400 transition-colors text-base tracking-widest text-center font-mono"
                placeholder="Enter 6-digit code"
              />
              {errors.otp && (
                <p className="mt-2 text-sm text-red-600">{errors.otp.message}</p>
              )}
            </div>

            {/* New Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-3">
                New Password
              </label>
              <div className="relative">
                <input
                  {...register('newPassword', {
                    required: 'New password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-0 py-3 pr-10 bg-transparent border-0 border-b-2 border-gray-200 focus:border-green-500 focus:ring-0 text-gray-900 placeholder-gray-400 transition-colors text-base"
                  placeholder="Enter new password"
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
              {errors.newPassword && (
                <p className="mt-2 text-sm text-red-600">{errors.newPassword.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-3">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value =>
                      value === newPassword || 'Passwords do not match',
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="w-full px-0 py-3 pr-10 bg-transparent border-0 border-b-2 border-gray-200 focus:border-green-500 focus:ring-0 text-gray-900 placeholder-gray-400 transition-colors text-base"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
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
                  Resetting...
                </span>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-2">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendOtp}
              disabled={isLoading}
              className="text-green-500 hover:text-green-600 font-medium text-sm"
            >
              {isLoading ? 'Sending...' : 'Resend OTP'}
            </button>
          </div>

          {/* Back to Login */}
          <div className="mt-8 text-center">
            <Link
              href="/auth/login"
              className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </div>

          {/* Copyright */}
          <div className="mt-8 text-xs text-gray-400 text-center">
            <p>&copy; 2024 MOFAD Energy Solutions. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100">
        <div className="absolute inset-0">
          <img
            src="/mofad 1.jpg"
            alt="MOFAD Energy Solutions Facility"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30" />
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
