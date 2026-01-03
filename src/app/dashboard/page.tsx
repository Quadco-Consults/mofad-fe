'use client'

import React from 'react'
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
  Activity,
  Building2,
  Car,
  Package,
} from 'lucide-react'

interface DashboardStats {
  total_sales_ytd?: number
  total_orders?: number
  pending_approvals?: number
  customer_count?: number
  substore_count?: number
  lubebay_count?: number
  low_stock_items?: number
}

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ComponentType<{ className?: string }>
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `₦${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `₦${(num / 1000).toFixed(1)}K`
  return `₦${num.toLocaleString()}`
}

function StatCard({ title, value, change, icon: Icon, color }: StatCardProps) {
  const colorStyles = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    yellow: 'bg-yellow-50',
    red: 'bg-red-50',
    purple: 'bg-purple-50',
  }

  const iconColors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
  }

  return (
    <Card className={`${colorStyles[color]} border-0`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-xl font-bold text-gray-900 mt-2">
              {typeof value === 'number' ? formatNumber(value) : value}
            </p>
            {change !== undefined && (
              <p className="flex items-center text-sm mt-2">
                {change >= 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-green-600">+{change}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                    <span className="text-red-600">{change}%</span>
                  </>
                )}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full ${iconColors[color]}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  // Fetch dashboard stats
  const { data: dashboardStats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: () => apiClient.getDashboardStats(),
  })

  const stats: DashboardStats = dashboardStats || {}

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* MOFAD Logo Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src="/mofad-logo.svg"
                alt="MOFAD Energy Solutions"
                className="h-16 w-auto"
              />
              <div className="text-right">
                <h2 className="text-lg font-semibold text-gray-900">Enterprise ERP</h2>
                <p className="text-sm text-gray-500">Distribution Management System</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Last updated</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Here&apos;s what&apos;s happening with your distribution network.
            </p>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            title="Total Sales (YTD)"
            value={stats.total_sales_ytd || 0}
            change={12.5}
            icon={TrendingUp}
            color="green"
          />
          <StatCard
            title="Total Orders"
            value={stats.total_orders || 0}
            change={-3.2}
            icon={ShoppingCart}
            color="blue"
          />
          <StatCard
            title="Pending Approvals"
            value={stats.pending_approvals || 0}
            change={8.1}
            icon={AlertTriangle}
            color="yellow"
          />
          <StatCard
            title="Total Customers"
            value={stats.customer_count || 0}
            change={4.7}
            icon={Users}
            color="purple"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Substores"
            value={stats.substore_count || 0}
            icon={Building2}
            color="blue"
          />
          <StatCard
            title="Lubebays"
            value={stats.lubebay_count || 0}
            icon={Car}
            color="green"
          />
          <StatCard
            title="Low Stock Items"
            value={stats.low_stock_items || 0}
            icon={Package}
            color={(stats.low_stock_items || 0) > 5 ? 'red' : 'green'}
          />
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Charts Coming Soon</p>
                  <p className="text-sm">Sales analytics visualization will be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'API Server', status: 'Online', color: 'green' },
                  { label: 'Database', status: 'Connected', color: 'green' },
                  { label: 'Payment Gateway', status: 'Active', color: 'green' },
                  { label: 'Network Uptime', status: '99.9%', color: 'green' },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <CheckCircle className={`h-4 w-4 text-${item.color}-500`} />
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    </div>
                    <span className={`text-sm font-semibold text-${item.color}-600`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
