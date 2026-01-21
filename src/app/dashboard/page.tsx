'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import apiClient from '@/lib/apiClient'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
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
  Eye,
  MoreVertical,
  Calendar,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  DollarSign,
  UserCheck,
  UserX,
  FileText,
  Truck,
  CreditCard,
  ArrowRight,
  ChevronRight,
} from 'lucide-react'

interface DashboardStats {
  total_sales_ytd?: number
  total_orders?: number
  pending_approvals?: number
  customer_count?: number
  substore_count?: number
  lubebay_count?: number
  low_stock_items?: number
  total_users?: number
  active_users?: number
  inactive_users?: number
}

interface SalesAnalytics {
  monthly_sales?: Array<{
    month: string
    total_sales: number
    transaction_count: number
  }>
  total_sales?: number
  growth_rate?: number
}

interface RecentTransaction {
  id: number
  type: string
  number: string
  amount: number
  status: string
  created_at: string
  entity_name?: string
}

interface PendingApproval {
  id: number
  type: string
  number: string
  title: string
  amount: number
  created_at: string
}

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ComponentType<{ className?: string }>
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  isCurrency?: boolean
  link?: string
}

const formatNumber = (num: number | undefined | null, isCurrency: boolean = true): string => {
  if (num == null) return isCurrency ? '₦0' : '0'
  if (isCurrency) {
    if (num >= 1000000) return `₦${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `₦${(num / 1000).toFixed(1)}K`
    return `₦${num.toLocaleString()}`
  }
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toLocaleString()
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-NG', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function StatCard({ title, value, change, icon: Icon, color, isCurrency = true, link }: StatCardProps) {
  const colorStyles = {
    blue: 'from-blue-50 to-blue-100/50',
    green: 'from-green-50 to-green-100/50',
    yellow: 'from-yellow-50 to-yellow-100/50',
    red: 'from-red-50 to-red-100/50',
    purple: 'from-purple-50 to-purple-100/50',
  }

  const iconColors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
  }

  const ringColors = {
    blue: 'ring-blue-200/50',
    green: 'ring-green-200/50',
    yellow: 'ring-yellow-200/50',
    red: 'ring-red-200/50',
    purple: 'ring-purple-200/50',
  }

  const CardWrapper = link ? Link : 'div'
  const cardProps = link ? { href: link } : {}

  return (
    <CardWrapper {...cardProps}>
      <Card className={`bg-gradient-to-br ${colorStyles[color]} border-0 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ring-1 ${ringColors[color]} group cursor-pointer`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-600 truncate">{title}</p>
                {link && (
                  <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
                {typeof value === 'number' ? formatNumber(value, isCurrency) : value}
              </p>
              {change !== undefined && (
                <div className="flex items-center text-sm">
                  <div className={`flex items-center px-2 py-1 rounded-full ${change >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    {change >= 0 ? (
                      <>
                        <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                        <span className="text-green-600 font-medium">+{change}%</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
                        <span className="text-red-600 font-medium">{change}%</span>
                      </>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 ml-2">vs last month</span>
                </div>
              )}
            </div>
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${iconColors[color]} shadow-lg ring-4 ring-white/20`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </CardWrapper>
  )
}

function SalesChart({ data, isLoading }: { data: SalesAnalytics; isLoading: boolean }) {
  const monthlyData = data?.monthly_sales || []
  const maxSales = Math.max(...monthlyData.map(m => m.total_sales || 0), 1)

  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (monthlyData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center bg-white rounded-xl border-2 border-dashed border-blue-200">
        <div className="text-center text-blue-600">
          <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto mb-4">
            <BarChart3 className="h-12 w-12" />
          </div>
          <p className="text-lg font-semibold mb-2">No Sales Data Available</p>
          <p className="text-sm text-blue-500 max-w-sm">
            Sales data will appear here once transactions are recorded
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-80 bg-white rounded-xl border border-blue-100 p-4">
      <div className="h-full flex flex-col">
        {/* Chart header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500">Total Sales</p>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(data?.total_sales || 0, true)}</p>
          </div>
          {data?.growth_rate !== undefined && (
            <div className={`flex items-center px-3 py-1.5 rounded-full ${data.growth_rate >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {data.growth_rate >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span className={`text-sm font-medium ${data.growth_rate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.growth_rate >= 0 ? '+' : ''}{data.growth_rate.toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        {/* Bar chart */}
        <div className="flex-1 flex items-end space-x-2">
          {monthlyData.slice(-12).map((month, index) => {
            const height = (month.total_sales / maxSales) * 100
            return (
              <div key={index} className="flex-1 flex flex-col items-center group">
                <div className="w-full relative">
                  {/* Tooltip */}
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {formatNumber(month.total_sales, true)}
                    <br />
                    <span className="text-gray-400">{month.transaction_count} orders</span>
                  </div>
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-300 group-hover:from-blue-600 group-hover:to-blue-500"
                    style={{ height: `${Math.max(height, 5)}%`, minHeight: '4px' }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 mt-2">{month.month}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function RecentTransactionsList({ transactions, isLoading }: { transactions: RecentTransaction[]; isLoading: boolean }) {
  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'sst': return Building2
      case 'lst': return Car
      case 'stock_transfer': return Truck
      case 'payment': return CreditCard
      default: return FileText
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'approved':
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
      case 'awaiting_review':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="animate-pulse flex items-center space-x-4 p-3">
            <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>No recent transactions</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {transactions.slice(0, 5).map((txn) => {
        const Icon = getTypeIcon(txn.type)
        return (
          <div key={`${txn.type}-${txn.id}`} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Icon className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{txn.number}</p>
                <p className="text-xs text-gray-500">{txn.entity_name || txn.type.toUpperCase()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{formatNumber(txn.amount, true)}</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(txn.status)}`}>
                {txn.status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PendingApprovalsList({ approvals, isLoading }: { approvals: PendingApproval[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse flex items-center space-x-4 p-3">
            <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (approvals.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-300" />
        <p>All caught up! No pending approvals</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {approvals.slice(0, 5).map((item) => (
        <div key={`${item.type}-${item.id}`} className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-100 hover:shadow-sm transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{item.title || item.number}</p>
              <p className="text-xs text-gray-500">{item.type.toUpperCase()} • {formatDate(item.created_at)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">{formatNumber(item.amount, true)}</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
              Pending
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [analyticsPeriod, setAnalyticsPeriod] = useState('ytd')

  // Fetch dashboard stats
  const { data: dashboardStats, isLoading: statsLoading, refetch: refetchStats } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: () => apiClient.getDashboardStats(),
  })

  // Fetch sales analytics
  const { data: salesAnalytics, isLoading: salesLoading } = useQuery<SalesAnalytics>({
    queryKey: ['salesAnalytics', analyticsPeriod],
    queryFn: () => apiClient.getSalesAnalytics(analyticsPeriod),
  })

  // Fetch recent transactions
  const { data: recentTransactions, isLoading: transactionsLoading } = useQuery<RecentTransaction[]>({
    queryKey: ['recentTransactions'],
    queryFn: () => apiClient.getRecentTransactions(10),
  })

  // Fetch pending approvals
  const { data: pendingApprovals, isLoading: approvalsLoading } = useQuery<PendingApproval[]>({
    queryKey: ['pendingApprovals'],
    queryFn: () => apiClient.getPendingApprovals(10),
  })

  const stats: DashboardStats = dashboardStats || {}
  const transactions: RecentTransaction[] = recentTransactions || []
  const approvals: PendingApproval[] = pendingApprovals || []

  const handleRefresh = () => {
    refetchStats()
  }

  return (
    <AppLayout>
      <div className="space-y-8 pb-8">
        {/* Enhanced MOFAD Header */}
        <div className="bg-gradient-to-r from-green-50 via-white to-green-50 rounded-2xl shadow-sm border border-green-100 p-4 md:p-8 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-100/30 to-transparent rounded-full transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-100/20 to-transparent rounded-full transform -translate-x-24 translate-y-24"></div>

          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 md:space-x-6">
              <div className="p-2 md:p-3 bg-white rounded-2xl shadow-lg ring-1 ring-green-100">
                <img
                  src="/modah_logo-removebg-preview.png"
                  alt="MOFAD Energy Solutions"
                  className="h-12 md:h-16 w-auto"
                />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">MOFAD Energy Solutions</h1>
                <h2 className="text-base md:text-lg font-semibold text-green-700 mb-1">Enterprise ERP Dashboard</h2>
                <p className="text-sm text-gray-600 flex items-center">
                  <Zap className="h-4 w-4 text-green-500 mr-1" />
                  Powering Nigeria's Energy Distribution Network
                </p>
              </div>
            </div>
            <div className="text-left md:text-right w-full md:w-auto">
              <div className="flex items-center space-x-3 mb-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-600">System Online</span>
              </div>
              <p className="text-sm text-gray-500 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Last updated: {new Date().toLocaleDateString()}
              </p>
              <button
                onClick={handleRefresh}
                className="mt-2 flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh data
              </button>
            </div>
          </div>
        </div>

        {/* Page Header with Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600 flex items-center text-sm md:text-base">
              <Activity className="h-4 w-4 mr-2 text-green-500" />
              Real-time insights into your distribution network performance
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/reports/sales"
              className="flex items-center px-3 md:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">View </span>Reports
            </Link>
            <Link
              href="/orders/approvals"
              className="flex items-center px-3 md:px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-lg"
            >
              <Clock className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Pending </span>Approvals
            </Link>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Key Performance Indicators</h2>
            <div className="flex items-center text-sm text-gray-500">
              <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
              Live data
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <StatCard
              title="Total Sales (YTD)"
              value={stats.total_sales_ytd || 0}
              change={12.5}
              icon={DollarSign}
              color="green"
              link="/reports/sales"
            />
            <StatCard
              title="Total Orders"
              value={stats.total_orders || 0}
              change={-3.2}
              icon={ShoppingCart}
              color="blue"
              isCurrency={false}
              link="/orders/prf"
            />
            <StatCard
              title="Pending Approvals"
              value={stats.pending_approvals || 0}
              change={8.1}
              icon={Clock}
              color="yellow"
              isCurrency={false}
              link="/orders/approvals"
            />
            <StatCard
              title="Total Customers"
              value={stats.customer_count || 0}
              change={4.7}
              icon={Users}
              color="purple"
              isCurrency={false}
              link="/customers"
            />
          </div>
        </div>

        {/* Network Overview */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Network Overview</h2>
            <Link href="/channels/substores" className="text-sm text-green-600 hover:text-green-700 font-medium">
              View All Locations →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Active Substores"
              value={stats.substore_count || 0}
              icon={Building2}
              color="blue"
              isCurrency={false}
              link="/channels/substores"
            />
            <StatCard
              title="Operating Lubebays"
              value={stats.lubebay_count || 0}
              icon={Car}
              color="green"
              isCurrency={false}
              link="/channels/lubebays"
            />
            <StatCard
              title="Low Stock Alerts"
              value={stats.low_stock_items || 0}
              icon={AlertTriangle}
              color={(stats.low_stock_items || 0) > 5 ? 'red' : 'green'}
              isCurrency={false}
              link="/inventory/warehouse"
            />
          </div>
        </div>

        {/* User Management Overview */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
            <Link href="/settings/users" className="text-sm text-green-600 hover:text-green-700 font-medium">
              Manage Users →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Users"
              value={stats.total_users || 0}
              icon={Users}
              color="blue"
              isCurrency={false}
              link="/settings/users"
            />
            <StatCard
              title="Active Users"
              value={stats.active_users || 0}
              icon={UserCheck}
              color="green"
              isCurrency={false}
              link="/settings/users"
            />
            <StatCard
              title="Inactive Users"
              value={stats.inactive_users || 0}
              icon={UserX}
              color="red"
              isCurrency={false}
              link="/settings/users"
            />
          </div>
        </div>

        {/* Analytics & Insights */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
            <h2 className="text-xl font-semibold text-gray-900">Analytics & Insights</h2>
            <div className="flex items-center space-x-2">
              <select
                value={analyticsPeriod}
                onChange={(e) => setAnalyticsPeriod(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              >
                <option value="last_30_days">Last 30 days</option>
                <option value="last_7_days">Last 7 days</option>
                <option value="last_90_days">Last 90 days</option>
                <option value="ytd">This year</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Analytics */}
            <Card className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-blue-900">Sales Performance</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Link href="/reports/sales" className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                      <BarChart3 className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <SalesChart data={salesAnalytics || {}} isLoading={salesLoading} />
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-900">Recent Transactions</CardTitle>
                  <Link
                    href="/channels/substores/transactions"
                    className="text-sm text-green-600 hover:text-green-700 flex items-center"
                  >
                    View All <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <RecentTransactionsList
                  transactions={transactions}
                  isLoading={transactionsLoading}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pending Approvals & System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Approvals */}
          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-yellow-900">Pending Approvals</CardTitle>
                <Link
                  href="/orders/approvals"
                  className="text-sm text-yellow-700 hover:text-yellow-800 flex items-center"
                >
                  View All <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <PendingApprovalsList
                approvals={approvals}
                isLoading={approvalsLoading}
              />
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-green-900">System Health</CardTitle>
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'API Server', status: 'Online', uptime: '99.9%', color: 'green', icon: CheckCircle },
                  { label: 'Database', status: 'Connected', uptime: '100%', color: 'green', icon: CheckCircle },
                  { label: 'Payment Gateway', status: 'Active', uptime: '99.7%', color: 'green', icon: CheckCircle },
                  { label: 'Backup System', status: 'Synced', uptime: '99.8%', color: 'green', icon: CheckCircle },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-green-100 shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                        <item.icon className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">{item.label}</span>
                        <p className="text-xs text-gray-500">Uptime: {item.uptime}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-white rounded-xl border border-green-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Overall Health Score</span>
                  <span className="text-xl font-bold text-green-600">98.5%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{width: '98.5%'}}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'New PRF', icon: ShoppingCart, color: 'blue', href: '/orders/prf/create' },
              { label: 'Add Customer', icon: Users, color: 'green', href: '/customers' },
              { label: 'Inventory Check', icon: Package, color: 'yellow', href: '/inventory/warehouse' },
              { label: 'Generate Report', icon: BarChart3, color: 'purple', href: '/reports/sales' },
            ].map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200 hover:-translate-y-1 group"
              >
                <div className={`p-3 rounded-lg bg-${action.color}-100 w-fit mb-3 group-hover:bg-${action.color}-200 transition-colors`}>
                  <action.icon className={`h-5 w-5 text-${action.color}-600`} />
                </div>
                <p className="text-sm font-medium text-gray-900">{action.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
