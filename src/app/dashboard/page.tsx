'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import apiClient from '@/lib/apiClient'
import { formatCurrency } from '@/lib/utils'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Maximize,
  Minimize,
  Activity,
  Sparkles,
  Globe,
  Shield,
  Zap,
  Play,
  Pause,
  Bell,
  Server,
  Database,
  CreditCard,
  Wifi,
  FileText,
  ChevronRight
} from 'lucide-react'

// Color schemes for premium cards
const premiumColorSchemes = {
  blue: {
    bg: 'from-blue-600 via-blue-500 to-cyan-500',
    light: 'from-blue-50 via-sky-50 to-cyan-50',
    icon: 'bg-gradient-to-br from-blue-500 to-cyan-500 text-blue-600 border border-blue-500',
    accent: 'text-blue-600',
    glow: 'shadow-blue-500',
    darkGlow: 'shadow-blue-600'
  },
  green: {
    bg: 'from-emerald-600 via-green-500 to-teal-500',
    light: 'from-emerald-50 via-green-50 to-teal-50',
    icon: 'bg-gradient-to-br from-emerald-500 to-teal-500 text-emerald-600 border border-emerald-500',
    accent: 'text-emerald-600',
    glow: 'shadow-emerald-500',
    darkGlow: 'shadow-emerald-600'
  },
  amber: {
    bg: 'from-amber-600 via-yellow-500 to-orange-500',
    light: 'from-amber-50 via-yellow-50 to-orange-50',
    icon: 'bg-gradient-to-br from-amber-500 to-orange-500 text-amber-600 border border-amber-500',
    accent: 'text-amber-600',
    glow: 'shadow-amber-500',
    darkGlow: 'shadow-amber-600'
  },
  red: {
    bg: 'from-red-600 via-red-500 to-rose-500',
    light: 'from-red-50 via-red-50 to-rose-50',
    icon: 'bg-gradient-to-br from-red-500 to-rose-500 text-red-600 border border-red-500',
    accent: 'text-red-600',
    glow: 'shadow-red-500',
    darkGlow: 'shadow-red-600'
  }
}

// Premium Card Component
function PremiumMetricCard({
  title,
  subtitle,
  value,
  change,
  target,
  icon: Icon,
  color = 'blue',
  isFullscreen = false,
  onToggleFullscreen
}: {
  title: string
  subtitle?: string
  value: number | string
  change?: number
  target?: number
  icon: React.ComponentType<any>
  color?: keyof typeof premiumColorSchemes
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
}) {
  const colors = premiumColorSchemes[color] || premiumColorSchemes.blue
  const progressPercentage = target && typeof value === 'number' ? Math.min((value / target) * 100, 100) : 0

  return (
    <div className="group relative">
      <div className="relative bg-white backdrop-blur-2xl border border-white rounded-2xl shadow-2xl hover:shadow-4xl transition-all duration-700 hover:scale-105 hover:bg-white overflow-hidden">
        {/* Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.light} opacity-50 group-hover:opacity-70 transition-opacity duration-700`}></div>

        {/* Content with Better Spacing */}
        <div className="relative p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className={`relative p-4 rounded-2xl ${colors.icon} shadow-lg group-hover:shadow-xl transition-all duration-500`}>
                <Icon className="h-7 w-7" />
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-25 transition-opacity duration-500`}></div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{title}</h3>
                {subtitle && (
                  <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
                )}
              </div>
            </div>

            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                className="p-2.5 rounded-xl bg-white hover:bg-white transition-all duration-300 text-slate-600 hover:text-slate-800 shadow-lg hover:shadow-xl backdrop-blur-sm"
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </button>
            )}
          </div>

          {/* Value Display */}
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-slate-900">
                {typeof value === 'number' ? formatCurrency(value) : value}
              </span>

              {change !== undefined && (
                <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl backdrop-blur-sm border shadow-lg ${
                  change >= 0
                    ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-300 shadow-green-500"
                    : "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-red-300 shadow-red-500"
                }`}>
                  {change >= 0 ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                  <span>{Math.abs(change)}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {target && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Progress to Target</span>
                <span className="px-2 py-1 bg-white rounded-full">{progressPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-white rounded-full h-3 overflow-hidden shadow-inner backdrop-blur-sm border border-white">
                <div
                  className={`relative h-full bg-gradient-to-r ${colors.bg} rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${progressPercentage}%` }}
                >
                  {/* Progress bar shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Current: {formatCurrency(value as number)}</span>
                <span>Target: {formatCurrency(target)}</span>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-white">
            <div className="flex items-center space-x-2">
              <span className="text-slate-500 font-medium">vs last month</span>
              <div className="flex items-center space-x-1.5 text-slate-600 bg-white px-2 py-1 rounded-lg backdrop-blur-sm">
                <Clock className="h-3 w-3" />
                <span className="font-medium">Updated {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [isLive, setIsLive] = useState(true)
  const [fullscreenCard, setFullscreenCard] = useState<string | null>(null)

  // Fetch dashboard stats
  const { data: stats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => apiClient.get('/api/dashboard/stats'),
    refetchInterval: isLive ? 30000 : false, // Refresh every 30 seconds when live
  })

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-3xl opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-white rounded-2xl backdrop-blur-sm opacity-80"></div>

          <div className="relative bg-white backdrop-blur-2xl border border-white rounded-2xl p-10 shadow-xl overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
              {/* Left Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="group relative">
                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                    <div className="relative p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl">
                      <Activity className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                      MOFAD Dashboard
                    </h1>
                    <p className="text-xl text-slate-600 font-medium">
                      Real-time business intelligence & analytics
                    </p>
                  </div>
                  <div className="hidden xl:flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300 rounded-2xl backdrop-blur-sm shadow-lg">
                    <Sparkles className="h-5 w-5 text-amber-600" />
                    <span className="text-sm font-bold text-amber-700 tracking-wide">AI-ENHANCED</span>
                  </div>
                </div>
              </div>

              {/* Right Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 px-4 py-2 bg-white backdrop-blur-sm rounded-xl border border-white shadow-lg">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-slate-700">Multi-location Network</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsLive(!isLive)}
                    className={`group flex items-center space-x-3 px-6 py-3 rounded-2xl font-bold transition-all duration-500 shadow-xl hover:shadow-2xl hover:scale-105 ${
                      isLive
                        ? 'bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 text-white hover:from-green-700 hover:to-emerald-600 shadow-green-500'
                        : 'bg-white backdrop-blur-sm border border-white text-slate-700 hover:bg-white shadow-slate-500'
                    }`}
                  >
                    {isLive ? (
                      <>
                        <Pause className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span>Live Mode On</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span>Start Live Mode</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <PremiumMetricCard
            title="Total Revenue"
            subtitle="Year to Date"
            value={Number(stats.total_sales_ytd) || 2450000}
            change={12.5}
            target={3000000}
            icon={TrendingUp}
            color="green"
          />
          <PremiumMetricCard
            title="Active Orders"
            subtitle="Processing & Pending"
            value={Number(stats.total_orders) || 847}
            change={-3.2}
            icon={ShoppingCart}
            color="blue"
          />
          <PremiumMetricCard
            title="Pending Approvals"
            subtitle="Requires Action"
            value={Number(stats.pending_approvals) || 23}
            change={8.1}
            icon={AlertTriangle}
            color="amber"
          />
          <PremiumMetricCard
            title="Customer Base"
            subtitle="Active Accounts"
            value={Number(stats.customer_count) || 1247}
            change={4.7}
            icon={Users}
            color="red"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Analytics Charts */}
          <div className="xl:col-span-2 space-y-8">
            {/* Revenue Analytics */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-3xl blur-2xl opacity-10"></div>
              <div className="relative bg-white backdrop-blur-xl border border-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                        <BarChart3 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">Revenue Analytics</h3>
                        <p className="text-sm text-slate-600">SAGE-powered financial insights</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-8 h-80 flex items-center justify-center">
                  <div className="text-center text-slate-500">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">Charts will be integrated here</p>
                    <p className="text-sm">Connect to your data visualization components</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* System Status */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-500 via-gray-500 to-stone-500 rounded-3xl blur-2xl opacity-10"></div>
              <div className="relative bg-white backdrop-blur-xl border border-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-slate-600 to-gray-600 rounded-xl">
                        <Server className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">System Status</h3>
                        <p className="text-sm text-slate-600">Infrastructure health</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 border border-green-200 rounded-lg">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-xs font-semibold text-green-700">Healthy</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { label: 'API Server', status: 'Online', icon: Server, color: 'green' },
                    { label: 'SAGE Database', status: 'Connected', icon: Database, color: 'green' },
                    { label: 'Payment Gateway', status: 'Active', icon: CreditCard, color: 'green' },
                    { label: 'Network Uptime', status: '99.9%', icon: Wifi, color: 'green' }
                  ].map((item, index) => {
                    const IconComponent = item.icon
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-xl border border-white">
                        <div className="flex items-center space-x-3">
                          <div className={`p-1.5 rounded-lg ${
                            item.color === 'green' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                            <IconComponent className="h-3 w-3" />
                          </div>
                          <span className="text-sm font-medium text-slate-700">{item.label}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            item.color === 'green' ? 'bg-green-500' : 'bg-gray-500'
                          }`}></div>
                          <span className={`text-sm font-semibold ${
                            item.color === 'green' ? 'text-green-600' : 'text-gray-600'
                          }`}>{item.status}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}