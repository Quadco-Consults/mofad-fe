'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Loader2, ArrowLeft, Mail, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api-client'

interface ForgotPasswordForm {
  email: string
}

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>()

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      setIsLoading(true)
      setError(null)

      await api.forgotPassword(data.email)

      setSubmittedEmail(data.email)
      setIsSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    try {
      setIsLoading(true)
      setError(null)
      await api.resendOtp(submittedEmail, 'PASSWORD_RESET')
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
                Check Your Email
              </h1>
              <p className="text-gray-600 mb-2">
                We've sent a password reset code to:
              </p>
              <p className="text-green-600 font-medium mb-4">
                {submittedEmail}
              </p>
              <p className="text-sm text-gray-500">
                Please check your email and enter the OTP code on the next page to reset your password.
              </p>
            </div>

            {/* Proceed to Reset Button */}
            <button
              onClick={() => router.push(`/auth/reset-password?email=${encodeURIComponent(submittedEmail)}`)}
              className="w-full py-4 px-6 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg shadow-lg shadow-green-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 text-base mb-4"
            >
              Continue to Reset Password
            </button>

            {/* Resend Link */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">
                Didn't receive the email?
              </p>
              <button
                onClick={handleResendOtp}
                disabled={isLoading}
                className="text-green-500 hover:text-green-600 font-medium text-sm"
              >
                {isLoading ? 'Sending...' : 'Click to resend'}
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
                <Mail className="w-8 h-8 text-green-500" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center lg:text-left">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Forgot Password?
              </h1>
              <p className="text-gray-600">
                No worries! Enter your email address and we'll send you a code to reset your password.
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-3">
                E-mail Address
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
                placeholder="Enter your registered email address"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
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
                  Sending...
                </span>
              ) : (
                'Send Reset Code'
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-12 text-center">
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
