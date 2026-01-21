'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Loader2, ArrowLeft, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api-client'
import { getRedirectPath } from '@/components/RouteTracker'

export default function MfaVerifyPage() {
  const router = useRouter()
  const { pendingEmail, isMfaRequired, verifyMfa, isLoading, error, clearError, forcePasswordReset } = useAuthStore()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [localError, setLocalError] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Redirect if no pending MFA
    if (!isMfaRequired || !pendingEmail) {
      router.push('/auth/login')
    }
  }, [isMfaRequired, pendingEmail, router])

  useEffect(() => {
    clearError()
    // Focus first input on mount
    inputRefs.current[0]?.focus()
  }, [clearError])

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    // Move to next input if value entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace - move to previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newOtp = [...otp]

    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i]
    }

    setOtp(newOtp)

    // Focus the next empty input or the last one
    const nextEmptyIndex = newOtp.findIndex(val => !val)
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus()
    } else {
      inputRefs.current[5]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpCode = otp.join('')

    if (otpCode.length !== 6) {
      setLocalError('Please enter the complete 6-digit code')
      return
    }

    try {
      setLocalError(null)
      await verifyMfa(otpCode)

      // Check if force password reset is required
      if (forcePasswordReset) {
        router.push('/auth/change-password')
      } else {
        // Redirect to last visited page or dashboard
        router.push(getRedirectPath())
      }
    } catch (err: any) {
      setLocalError(err.message || 'Invalid OTP code. Please try again.')
      // Clear the OTP inputs
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    }
  }

  const handleResendOtp = async () => {
    if (!pendingEmail) return

    try {
      setResending(true)
      setLocalError(null)
      await api.resendOtp(pendingEmail, 'MFA')
    } catch (err: any) {
      setLocalError(err.message || 'Failed to resend OTP. Please try again.')
    } finally {
      setResending(false)
    }
  }

  if (!isMfaRequired || !pendingEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
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
                <ShieldCheck className="w-8 h-8 text-green-500" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center lg:text-left">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Two-Factor Authentication
              </h1>
              <p className="text-gray-600">
                We've sent a verification code to <span className="text-green-600 font-medium">{pendingEmail}</span>. Please enter the code below to continue.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {(error || localError) && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <p className="text-red-600 text-sm">{error || localError}</p>
            </div>
          )}

          {/* OTP Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* OTP Input Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-4 text-center">
                Enter 6-digit verification code
              </label>
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center text-2xl font-mono font-bold border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
                  />
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full py-4 px-6 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg shadow-lg shadow-green-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-base"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Verifying...
                </span>
              ) : (
                'Verify & Continue'
              )}
            </button>
          </form>

          {/* Resend Code */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-2">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendOtp}
              disabled={resending}
              className="text-green-500 hover:text-green-600 font-medium text-sm"
            >
              {resending ? 'Sending...' : 'Resend Code'}
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
