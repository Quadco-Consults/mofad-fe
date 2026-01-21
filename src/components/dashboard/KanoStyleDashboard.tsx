'use client'

import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  Package,
  DollarSign,
  Building2,
  Car,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  MoreHorizontal,
  Calendar,
  MapPin,
  Activity,
  Target,
  Award,
  FileText,
  BarChart3
} from 'lucide-react'
import { formatCurrency, formatNumber, cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ComponentType<{ className?: string }>
  trend?: 'up' | 'down' | 'stable'
  subtitle?: string
  color: 'green' | 'blue' | 'orange' | 'red' | 'purple'
}

// Clean, professional stat card inspired by Kano Justice design
function CleanStatCard({
  title,
  value,
  change,
  icon: Icon,
  trend,
  subtitle,
  color
}: StatCardProps) {
  const colorSchemes = {
    green: {
      bg: 'bg-green-50',
      icon: 'bg-green-600',
      text: 'text-green-600',
      badge: 'bg-green-100 text-green-700'
    },
    blue: {
      bg: 'bg-blue-50',
      icon: 'bg-blue-600',
      text: 'text-blue-600',
      badge: 'bg-blue-100 text-blue-700'
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'bg-orange-600',
      text: 'text-orange-600',
      badge: 'bg-orange-100 text-orange-700'
    },
    red: {
      bg: 'bg-red-50',
      icon: 'bg-red-600',
      text: 'text-red-600',
      badge: 'bg-red-100 text-red-700'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'bg-purple-600',
      text: 'text-purple-600',
      badge: 'bg-purple-100 text-purple-700'
    }
  }

  const colors = colorSchemes[color] || colorSchemes.blue

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-lg ${colors.icon}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{typeof value === 'number' ? formatCurrency(value) : value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
        </div>

        {change !== undefined && (
          <div className={cn(
            "flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium",
            change >= 0
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          )}>
            {change >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Recent transactions table component
function RecentTransactionsTable() {
  const transactions = [
    { id: 'TXN-001', customer: 'Dangote Petroleum', amount: 5650000, status: 'Completed', date: '2024-12-16' },
    { id: 'TXN-002', customer: 'Total Nigeria', amount: 3420000, status: 'Pending', date: '2024-12-16' },
    { id: 'TXN-003', customer: 'Mobil Nigeria', amount: 7890000, status: 'In Progress', date: '2024-12-15' },
    { id: 'TXN-004', customer: 'Conoil Plc', amount: 2150000, status: 'Completed', date: '2024-12-15' },
    { id: 'TXN-005', customer: 'Oando Marketing', amount: 4320000, status: 'Under Review', date: '2024-12-15' }
  ]

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'Completed': 'bg-green-100 text-green-700',
      'Pending': 'bg-yellow-100 text-yellow-700',
      'In Progress': 'bg-blue-100 text-blue-700',
      'Under Review': 'bg-orange-100 text-orange-700'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-700'}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        <p className="text-sm text-gray-600 mt-1">Latest customer transactions and orders</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {transaction.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.customer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {formatCurrency(transaction.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(transaction.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Active operations list
function ActiveOperations() {
  const operations = [
    { id: 'OP-001', title: 'Lagos Distribution Center', type: 'Fuel Delivery', location: 'Lagos, Nigeria', progress: 85 },
    { id: 'OP-002', title: 'Kano Lubebay Service', type: 'Oil Change Service', location: 'Kano, Nigeria', progress: 60 },
    { id: 'OP-003', title: 'Abuja Substore Restock', type: 'Inventory Transfer', location: 'Abuja, Nigeria', progress: 95 },
    { id: 'OP-004', title: 'Port Harcourt Terminal', type: 'Bulk Loading', location: 'Port Harcourt, Nigeria', progress: 40 }
  ]

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Active Operations</h3>
        <p className="text-sm text-gray-600 mt-1">Ongoing distribution and service activities</p>
      </div>
      <div className="p-6 space-y-4">
        {operations.map((operation) => (
          <div key={operation.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{operation.title}</h4>
                <p className="text-sm text-gray-600">{operation.type}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{operation.progress}%</p>
                <div className="flex items-center text-xs text-gray-500">
                  <MapPin className="w-3 h-3 mr-1" />
                  {operation.location}
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  operation.progress >= 80 ? 'bg-green-600' :
                  operation.progress >= 60 ? 'bg-blue-600' :
                  operation.progress >= 40 ? 'bg-orange-600' : 'bg-red-600'
                }`}
                style={{ width: `${operation.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Performance metrics
function PerformanceMetrics() {
  const metrics = [
    { label: 'Response Time', value: '4.2 days', change: 15, trend: 'down' as const },
    { label: 'Delivery Rate', value: '94%', change: 8, trend: 'up' as const },
    { label: 'Customer Satisfaction', value: '4.7/5', change: 3, trend: 'up' as const },
    { label: 'System Uptime', value: '99.9%', change: 0.1, trend: 'stable' as const }
  ]

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
        <p className="text-sm text-gray-600 mt-1">Key operational performance indicators</p>
      </div>
      <div className="p-6 grid grid-cols-2 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
            <div className="text-sm text-gray-600 mb-2">{metric.label}</div>
            <div className={cn(
              "flex items-center justify-center space-x-1 text-xs font-medium",
              metric.trend === 'up' ? "text-green-600" :
              metric.trend === 'down' ? "text-red-600" : "text-gray-600"
            )}>
              {metric.trend === 'up' && <TrendingUp className="w-3 h-3" />}
              {metric.trend === 'down' && <TrendingDown className="w-3 h-3" />}
              <span>
                {metric.trend === 'stable' ? 'Stable' :
                 `${metric.change > 0 ? '+' : ''}${metric.change}%`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function KanoStyleDashboard() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to MOFAD Distribution Management System</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CleanStatCard
          title="Total Cases"
          value={1247}
          change={12}
          icon={FileText}
          color="green"
          subtitle="Active distribution orders"
        />
        <CleanStatCard
          title="Pending Advisory"
          value={38}
          change={5}
          icon={AlertTriangle}
          color="orange"
          subtitle="Require attention"
        />
        <CleanStatCard
          title="Active Prosecution"
          value={156}
          change={8}
          icon={Activity}
          color="blue"
          subtitle="Ongoing operations"
        />
        <CleanStatCard
          title="Civil Litigation"
          value={89}
          change={-3}
          icon={Target}
          color="purple"
          subtitle="Customer disputes"
        />
      </div>

      {/* Revenue and Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CleanStatCard
          title="Revenue (YTD)"
          value={234567890}
          change={15}
          icon={DollarSign}
          color="green"
          subtitle="Total year-to-date revenue"
        />
        <CleanStatCard
          title="Active Orders"
          value={892}
          change={8}
          icon={ShoppingCart}
          color="blue"
          subtitle="Processing pipeline"
        />
        <CleanStatCard
          title="Inventory Health"
          value="94%"
          change={3}
          icon={Package}
          color="green"
          subtitle="Stock availability"
        />
        <CleanStatCard
          title="Customer Growth"
          value={456}
          change={12}
          icon={Users}
          color="purple"
          subtitle="New customers this month"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Recent Transactions */}
        <div className="lg:col-span-2">
          <RecentTransactionsTable />
        </div>

        {/* Right Column - Active Operations */}
        <div>
          <ActiveOperations />
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PerformanceMetrics />

        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <p className="text-sm text-gray-600 mt-1">Frequently used operations</p>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            {[
              { label: 'Create PRF', icon: ShoppingCart, href: '/orders/prf/create' },
              { label: 'Add Customer', icon: Users, href: '/customers' },
              { label: 'Stock Transfer', icon: Building2, href: '/inventory/transfers' },
              { label: 'View Reports', icon: BarChart3, href: '/reports' }
            ].map((action, index) => {
              const Icon = action.icon
              return (
                <button
                  key={index}
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Icon className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">{action.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}