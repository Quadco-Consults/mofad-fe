'use client'

import { useState } from 'react'
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
              {/* Platform surface */}
              <polygon
                points="0,0 300,150 600,0 300,-150"
                fill="#e5e7eb"
                stroke="#d1d5db"
                strokeWidth="2"
              />
              {/* Platform depth */}
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
              {/* Building base */}
              <polygon
                points="0,80 120,140 240,80 120,20"
                fill="#b8922f"
              />
              {/* Left wall */}
              <polygon
                points="0,80 0,-40 120,-100 120,20"
                fill="#8a6b22"
              />
              {/* Right wall */}
              <polygon
                points="120,20 120,-100 240,-40 240,80"
                fill="#d0a33e"
              />
              {/* Roof */}
              <polygon
                points="0,-40 120,-100 240,-40 120,20"
                fill="#e6c164"
              />

              {/* Building details - windows */}
              <rect x="20" y="-20" width="25" height="20" fill="#f5f5f5" opacity="0.3" />
              <rect x="55" y="-20" width="25" height="20" fill="#f5f5f5" opacity="0.3" />
              <rect x="20" y="15" width="25" height="20" fill="#f5f5f5" opacity="0.3" />
              <rect x="55" y="15" width="25" height="20" fill="#f5f5f5" opacity="0.3" />

              {/* Right wall windows */}
              <rect x="140" y="-20" width="25" height="20" fill="#f5f5f5" opacity="0.3" />
              <rect x="175" y="-20" width="25" height="20" fill="#f5f5f5" opacity="0.3" />
              <rect x="140" y="15" width="25" height="20" fill="#f5f5f5" opacity="0.3" />
              <rect x="175" y="15" width="25" height="20" fill="#f5f5f5" opacity="0.3" />

              {/* Roof vents */}
              <rect x="100" y="-85" width="40" height="15" fill="#a07d28" />
              <polygon points="100,-85 120,-95 140,-85" fill="#b8922f" />
            </g>

            {/* Secondary Structure - Gold Framework */}
            <g transform="translate(480, 240)">
              {/* Frame base */}
              <polygon
                points="0,60 80,100 160,60 80,20"
                fill="#b8922f"
              />
              {/* Frame left */}
              <polygon
                points="0,60 0,-60 80,-100 80,20"
                fill="#a07d28"
              />
              {/* Frame right */}
              <polygon
                points="80,20 80,-100 160,-60 160,60"
                fill="#d0a33e"
              />

              {/* Vertical beams */}
              <line x1="20" y1="40" x2="20" y2="-40" stroke="#e6c164" strokeWidth="4" />
              <line x1="60" y1="60" x2="60" y2="-60" stroke="#e6c164" strokeWidth="4" />
              <line x1="100" y1="60" x2="100" y2="-60" stroke="#d0a33e" strokeWidth="4" />
              <line x1="140" y1="40" x2="140" y2="-40" stroke="#d0a33e" strokeWidth="4" />

              {/* Horizontal beams - left side */}
              <line x1="10" y1="30" x2="70" y2="60" stroke="#e6c164" strokeWidth="2" />
              <line x1="10" y1="0" x2="70" y2="30" stroke="#e6c164" strokeWidth="2" />
              <line x1="10" y1="-30" x2="70" y2="0" stroke="#e6c164" strokeWidth="2" />

              {/* Horizontal beams - right side */}
              <line x1="90" y1="60" x2="150" y2="30" stroke="#d0a33e" strokeWidth="2" />
              <line x1="90" y1="30" x2="150" y2="0" stroke="#d0a33e" strokeWidth="2" />
              <line x1="90" y1="0" x2="150" y2="-30" stroke="#d0a33e" strokeWidth="2" />

              {/* Cross bracing */}
              <line x1="20" y1="40" x2="60" y2="0" stroke="#b8922f" strokeWidth="2" />
              <line x1="60" y1="40" x2="20" y2="0" stroke="#b8922f" strokeWidth="2" />
              <line x1="100" y1="40" x2="140" y2="0" stroke="#b8922f" strokeWidth="2" />
              <line x1="140" y1="40" x2="100" y2="0" stroke="#b8922f" strokeWidth="2" />
            </g>

            {/* Processing Tower - Gold Framework Structure */}
            <g transform="translate(560, 120)">
              {/* Tower base */}
              <polygon
                points="0,60 30,75 60,60 30,45"
                fill="#a07d28"
              />
              {/* Tower body - left side */}
              <polygon
                points="0,60 0,-120 30,-135 30,45"
                fill="#8a6b22"
              />
              {/* Tower body - right side */}
              <polygon
                points="30,45 30,-135 60,-120 60,60"
                fill="#d0a33e"
              />
              {/* Tower top */}
              <polygon
                points="0,-120 30,-135 60,-120 30,-105"
                fill="#e6c164"
              />

              {/* Tower framework details - horizontal beams */}
              <rect x="5" y="-100" width="20" height="4" fill="#e6c164" />
              <rect x="5" y="-75" width="20" height="4" fill="#e6c164" />
              <rect x="5" y="-50" width="20" height="4" fill="#e6c164" />
              <rect x="5" y="-25" width="20" height="4" fill="#e6c164" />
              <rect x="5" y="0" width="20" height="4" fill="#e6c164" />
              <rect x="5" y="25" width="20" height="4" fill="#e6c164" />

              {/* Vertical supports */}
              <line x1="8" y1="55" x2="8" y2="-115" stroke="#b8922f" strokeWidth="3" />
              <line x1="22" y1="50" x2="22" y2="-120" stroke="#b8922f" strokeWidth="3" />
              <line x1="38" y1="50" x2="38" y2="-120" stroke="#d0a33e" strokeWidth="3" />
              <line x1="52" y1="55" x2="52" y2="-115" stroke="#d0a33e" strokeWidth="3" />

              {/* Cross bracing */}
              <line x1="8" y1="-100" x2="22" y2="-75" stroke="#e6c164" strokeWidth="2" />
              <line x1="22" y1="-100" x2="8" y2="-75" stroke="#e6c164" strokeWidth="2" />
              <line x1="8" y1="-50" x2="22" y2="-25" stroke="#e6c164" strokeWidth="2" />
              <line x1="22" y1="-50" x2="8" y2="-25" stroke="#e6c164" strokeWidth="2" />
              <line x1="8" y1="0" x2="22" y2="25" stroke="#e6c164" strokeWidth="2" />
              <line x1="22" y1="0" x2="8" y2="25" stroke="#e6c164" strokeWidth="2" />

              {/* Antenna */}
              <line x1="30" y1="-135" x2="30" y2="-170" stroke="#6b7280" strokeWidth="3" />
              <circle cx="30" cy="-175" r="5" fill="#ef4444" />
            </g>

            {/* Storage Tanks - White/Gray */}
            <g transform="translate(180, 320)">
              {/* Tank 1 */}
              <ellipse cx="40" cy="50" rx="35" ry="18" fill="#d1d5db" />
              <rect x="5" y="0" width="70" height="50" fill="#e5e7eb" />
              <ellipse cx="40" cy="0" rx="35" ry="18" fill="#f9fafb" />
              <ellipse cx="40" cy="0" rx="25" ry="12" fill="none" stroke="#d1d5db" strokeWidth="2" />
            </g>

            <g transform="translate(260, 340)">
              {/* Tank 2 */}
              <ellipse cx="30" cy="40" rx="28" ry="14" fill="#d1d5db" />
              <rect x="2" y="0" width="56" height="40" fill="#e5e7eb" />
              <ellipse cx="30" cy="0" rx="28" ry="14" fill="#f9fafb" />
            </g>

            {/* Pipeline Network - Gold */}
            <g stroke="#d0a33e" strokeWidth="4" fill="none">
              <path d="M220,370 L320,420 L520,320" />
              <path d="M340,300 L340,380 L420,420" />
              <path d="M560,280 L560,350 L480,390" />
            </g>
            {/* Pipeline highlights */}
            <g stroke="#e6c164" strokeWidth="1.5" fill="none" opacity="0.6">
              <path d="M220,368 L320,418 L520,318" />
              <path d="M340,298 L340,378 L420,418" />
              <path d="M560,278 L560,348 L480,388" />
            </g>

            {/* Pipeline supports */}
            <g fill="#b8922f">
              <rect x="318" y="380" width="4" height="30" />
              <rect x="418" y="400" width="4" height="20" />
              <rect x="478" y="370" width="4" height="20" />
            </g>

            {/* Control Building - Gold accented */}
            <g transform="translate(380, 380)">
              <polygon
                points="0,30 50,55 100,30 50,5"
                fill="#e5e7eb"
              />
              <polygon
                points="0,30 0,-10 50,-35 50,5"
                fill="#d1d5db"
              />
              <polygon
                points="50,5 50,-35 100,-10 100,30"
                fill="#f3f4f6"
              />
              {/* Window - neutral glass */}
              <rect x="60" y="-5" width="20" height="15" fill="#e8e8e8" />
              <rect x="62" y="-3" width="16" height="11" fill="#f5f5f5" opacity="0.5" />
              {/* Window frame - gold */}
              <rect x="59" y="-6" width="22" height="2" fill="#d0a33e" />
              <rect x="59" y="9" width="22" height="2" fill="#b8922f" />
              {/* Door */}
              <rect x="10" y="5" width="12" height="20" fill="#6b7280" />
              {/* Door frame - gold */}
              <rect x="8" y="3" width="2" height="24" fill="#d0a33e" />
              <rect x="22" y="3" width="2" height="24" fill="#d0a33e" />
              <rect x="8" y="3" width="16" height="2" fill="#e6c164" />
              {/* Door handle */}
              <rect x="18" y="12" width="2" height="6" fill="#d0a33e" />
            </g>

            {/* Additional Gold Framework Structure - Scaffolding */}
            <g transform="translate(600, 320)">
              {/* Small frame base */}
              <polygon
                points="0,40 40,60 80,40 40,20"
                fill="#b8922f"
              />

              {/* Vertical columns */}
              <rect x="5" y="-25" width="6" height="60" fill="#d0a33e" />
              <rect x="35" y="-35" width="6" height="70" fill="#a07d28" />
              <rect x="69" y="-25" width="6" height="60" fill="#d0a33e" />

              {/* Top platform */}
              <polygon
                points="0,-20 40,-5 80,-20 40,-35"
                fill="#e6c164"
              />

              {/* Cross bracing */}
              <line x1="8" y1="30" x2="38" y2="-15" stroke="#b8922f" strokeWidth="2" />
              <line x1="38" y1="30" x2="8" y2="-15" stroke="#b8922f" strokeWidth="2" />
              <line x1="42" y1="30" x2="72" y2="-15" stroke="#b8922f" strokeWidth="2" />
              <line x1="72" y1="30" x2="42" y2="-15" stroke="#b8922f" strokeWidth="2" />

              {/* Horizontal beams */}
              <line x1="5" y1="10" x2="75" y2="10" stroke="#e6c164" strokeWidth="3" />
              <line x1="5" y1="-10" x2="75" y2="-10" stroke="#e6c164" strokeWidth="3" />

              {/* Safety railings on top */}
              <line x1="5" y1="-25" x2="40" y2="-40" stroke="#d0a33e" strokeWidth="2" />
              <line x1="40" y1="-40" x2="75" y2="-25" stroke="#d0a33e" strokeWidth="2" />
            </g>

            {/* Conveyor/Transport System */}
            <g transform="translate(450, 420)">
              {/* Conveyor belt */}
              <polygon
                points="0,20 150,95 160,90 10,15"
                fill="#4b5563"
              />
              <polygon
                points="0,20 0,30 150,105 150,95"
                fill="#374151"
              />
              {/* Belt surface highlight */}
              <polygon
                points="5,18 145,90 150,88 10,16"
                fill="#6b7280"
                opacity="0.5"
              />

              {/* Support frame - Gold */}
              <rect x="28" y="30" width="8" height="35" fill="#d0a33e" />
              <rect x="78" y="50" width="8" height="45" fill="#b8922f" />
              <rect x="128" y="75" width="8" height="30" fill="#d0a33e" />

              {/* Cross bracing on supports */}
              <line x1="32" y1="60" x2="82" y2="90" stroke="#e6c164" strokeWidth="2" />
              <line x1="82" y1="90" x2="132" y2="100" stroke="#e6c164" strokeWidth="2" />

              {/* Base plates */}
              <ellipse cx="32" cy="65" rx="6" ry="3" fill="#a07d28" />
              <ellipse cx="82" cy="95" rx="6" ry="3" fill="#a07d28" />
              <ellipse cx="132" cy="105" rx="6" ry="3" fill="#a07d28" />
            </g>

            {/* Decorative Elements */}
            {/* Small equipment with gold frame */}
            <g transform="translate(280, 420)">
              <rect x="0" y="0" width="30" height="20" fill="#9ca3af" />
              <rect x="5" y="-10" width="20" height="10" fill="#d1d5db" />
              {/* Equipment frame */}
              <rect x="-2" y="-12" width="2" height="34" fill="#d0a33e" />
              <rect x="30" y="-12" width="2" height="34" fill="#d0a33e" />
              <rect x="-2" y="-12" width="34" height="2" fill="#e6c164" />
            </g>

            {/* Gold Access Ladder */}
            <g transform="translate(540, 280)">
              {/* Ladder rails */}
              <line x1="0" y1="0" x2="0" y2="80" stroke="#d0a33e" strokeWidth="3" />
              <line x1="15" y1="0" x2="15" y2="80" stroke="#d0a33e" strokeWidth="3" />
              {/* Ladder rungs */}
              <line x1="0" y1="10" x2="15" y2="10" stroke="#e6c164" strokeWidth="2" />
              <line x1="0" y1="25" x2="15" y2="25" stroke="#e6c164" strokeWidth="2" />
              <line x1="0" y1="40" x2="15" y2="40" stroke="#e6c164" strokeWidth="2" />
              <line x1="0" y1="55" x2="15" y2="55" stroke="#e6c164" strokeWidth="2" />
              <line x1="0" y1="70" x2="15" y2="70" stroke="#e6c164" strokeWidth="2" />
              {/* Safety cage */}
              <path d="M-5,5 Q-10,40 -5,75" stroke="#b8922f" strokeWidth="1.5" fill="none" />
            </g>

            {/* Small Gold Tank Frame */}
            <g transform="translate(330, 360)">
              {/* Frame posts */}
              <rect x="0" y="0" width="4" height="40" fill="#d0a33e" />
              <rect x="36" y="0" width="4" height="40" fill="#d0a33e" />
              {/* Top rail */}
              <rect x="0" y="0" width="40" height="3" fill="#e6c164" />
              {/* Cross brace */}
              <line x1="2" y1="5" x2="38" y2="35" stroke="#b8922f" strokeWidth="2" />
            </g>

            {/* Ground shadows */}
            <g opacity="0.15">
              <ellipse cx="400" cy="480" rx="200" ry="30" fill="#4b5563" />
            </g>

            {/* Gold accent elements */}
            <g fill="#d0a33e" opacity="0.6">
              <rect x="650" y="200" width="40" height="8" />
              <rect x="665" y="215" width="25" height="6" />
              <rect x="650" y="228" width="40" height="8" />
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
