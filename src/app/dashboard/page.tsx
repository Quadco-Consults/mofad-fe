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
  MapPin,
  Download,
  Filter,
  Plus,
} from 'lucide-react'
import { RevenueAreaChart, DonutChart, SalesLineChart } from '@/components/dashboard/EnhancedCharts'

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
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange'
  isCurrency?: boolean
  link?: string
}

interface WarehouseRevenueCard {
  id: string
  name: string
  location: string
  revenue: number
  change: number
  orders: number
  status: 'active' | 'inactive'
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
    blue: 'from-blue-50 to-blue-100/80',
    green: 'from-emerald-50 to-emerald-100/80',
    yellow: 'from-amber-50 to-amber-100/80',
    red: 'from-red-50 to-red-100/80',
    purple: 'from-purple-50 to-purple-100/80',
    orange: 'from-orange-50 to-orange-100/80',
  }

  const iconColors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    yellow: 'from-amber-500 to-amber-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  }

  const ringColors = {
    blue: 'ring-blue-200/50',
    green: 'ring-emerald-200/50',
    yellow: 'ring-amber-200/50',
    red: 'ring-red-200/50',
    purple: 'ring-purple-200/50',
    orange: 'ring-orange-200/50',
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

function WarehouseRevenueCard({ warehouse }: { warehouse: WarehouseRevenueCard }) {
  return (
    <Card className="bg-white border border-orange-200 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Building2 className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{warehouse.name}</h3>
              <p className="text-sm text-gray-500 flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {warehouse.location}
              </p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            warehouse.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {warehouse.status}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(warehouse.revenue, true)}</p>
            <div className="flex items-center space-x-2 mt-1">
              <div className={`flex items-center px-2 py-1 rounded-full ${
                warehouse.change >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {warehouse.change >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
                )}
                <span className={`text-xs font-medium ${
                  warehouse.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {warehouse.change >= 0 ? '+' : ''}{warehouse.change}%
                </span>
              </div>
              <span className="text-xs text-gray-500">vs last month</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <span className="text-sm text-gray-600">Orders</span>
            <span className="text-sm font-semibold text-gray-900">{warehouse.orders.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SalesChart({ data, isLoading }: { data: SalesAnalytics; isLoading: boolean }) {
  const monthlyData = data?.monthly_sales || []
  const maxSales = Math.max(...monthlyData.map(m => m.total_sales || 0), 1)

  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  if (monthlyData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center bg-white rounded-xl border-2 border-dashed border-orange-200">
        <div className="text-center text-orange-600">
          <div className="p-4 bg-orange-100 rounded-full w-fit mx-auto mb-4">
            <BarChart3 className="h-12 w-12" />
          </div>
          <p className="text-lg font-semibold mb-2">No Sales Data Available</p>
          <p className="text-sm text-orange-500 max-w-sm">
            Sales data will appear here once transactions are recorded
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-80 bg-white rounded-xl border border-orange-100 p-4">
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
                    className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t transition-all duration-300 group-hover:from-orange-600 group-hover:to-orange-500"
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
  const [selectedWarehouse, setSelectedWarehouse] = useState('all')
  const [selectedPeriod, setSelectedPeriod] = useState('last_30_days')

  // Fetch dashboard stats
  const { data: dashboardStats, isLoading: statsLoading, refetch: refetchStats } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: () => apiClient.getDashboardStats(),
  })

  // Fetch sales analytics
  const { data: salesAnalytics, isLoading: salesLoading } = useQuery<SalesAnalytics>({
    queryKey: ['salesAnalytics', selectedPeriod],
    queryFn: () => apiClient.getSalesAnalytics(selectedPeriod),
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

  // Mock warehouse data for the design
  const warehouseData: WarehouseRevenueCard[] = [
    {
      id: '1',
      name: 'Abuja Main Warehouse',
      location: 'Abuja, FCT',
      revenue: 12500000,
      change: 12.3,
      orders: 234,
      status: 'active'
    },
    {
      id: '2',
      name: 'Kano Main Warehouse',
      location: 'Kano, KN',
      revenue: 8750000,
      change: 8.7,
      orders: 187,
      status: 'active'
    },
    {
      id: '3',
      name: 'Wuse Warehouse',
      location: 'Wuse, Abuja',
      revenue: 6200000,
      change: -2.1,
      orders: 156,
      status: 'active'
    }
  ]

  // Mock data for charts
  const revenueChartData = [
    { month: 'Jan', revenue: 8500000, profit: 1700000 },
    { month: 'Feb', revenue: 9200000, profit: 1840000 },
    { month: 'Mar', revenue: 10800000, profit: 2160000 },
    { month: 'Apr', revenue: 11500000, profit: 2300000 },
    { month: 'May', revenue: 12200000, profit: 2440000 },
    { month: 'Jun', revenue: 13100000, profit: 2620000 },
  ]

  const salesChartData = [
    { month: 'Jan', sales: 8500000, growth: 12 },
    { month: 'Feb', sales: 9200000, growth: 8 },
    { month: 'Mar', sales: 10800000, growth: 17 },
    { month: 'Apr', sales: 11500000, growth: 6 },
    { month: 'May', sales: 12200000, growth: 6 },
    { month: 'Jun', sales: 13100000, growth: 7 },
  ]

  const lubebayPerformanceData = [
    { name: 'LubeBay A', value: 2800000, color: '#ea580c' },
    { name: 'LubeBay B', value: 2100000, color: '#fb923c' },
    { name: 'LubeBay C', value: 1900000, color: '#fed7aa' },
    { name: 'LubeBay D', value: 1700000, color: '#fdba74' },
    { name: 'Others', value: 1500000, color: '#f59e0b' },
  ]

  const handleRefresh = () => {
    refetchStats()
  }

  return (
    <AppLayout>
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening with your warehouses today.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
            <button className="flex items-center px-3 py-2 text-sm text-white bg-orange-600 rounded-lg hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </button>
          </div>
        </div>

        {/* Top Warehouse Revenue Cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Top Warehouse Revenue</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {warehouseData.map((warehouse) => (
              <WarehouseRevenueCard key={warehouse.id} warehouse={warehouse} />
            ))}
          </div>
        </div>

        {/* Revenue Chart and Performance Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Line Chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900">Revenue Trends</CardTitle>
                <select
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                >
                  <option value="all">All Warehouses</option>
                  <option value="abuja">Abuja Main</option>
                  <option value="kano">Kano Main</option>
                  <option value="wuse">Wuse</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <RevenueAreaChart data={revenueChartData} isLoading={false} />
            </CardContent>
          </Card>

          {/* Top Performing LubeBays */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-gray-900">Top Performing LubeBays</CardTitle>
            </CardHeader>
            <CardContent>
              <DonutChart
                data={lubebayPerformanceData}
                centerValue="₦10.0M"
                centerLabel="Total Revenue"
                isLoading={false}
              />
            </CardContent>
          </Card>
        </div>

        {/* Expenses and Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Expenses */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900">Recent Expenses</CardTitle>
                <Link href="/accounts/expenses" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                  View All
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Fuel Transportation', amount: 450000, date: '2024-01-20', category: 'Logistics' },
                  { name: 'Equipment Maintenance', amount: 125000, date: '2024-01-19', category: 'Maintenance' },
                  { name: 'Staff Salaries', amount: 2800000, date: '2024-01-18', category: 'Personnel' },
                  { name: 'Utility Bills', amount: 85000, date: '2024-01-17', category: 'Utilities' },
                  { name: 'Security Services', amount: 180000, date: '2024-01-16', category: 'Security' }
                ].map((expense, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Package className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{expense.name}</p>
                        <p className="text-xs text-gray-500">{expense.category} • {expense.date}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatNumber(expense.amount, true)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* LubeBay Services Transactions */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900">LubeBay Services</CardTitle>
                <Link href="/channels/lubebays" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                  View All
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: 'LB001', service: 'Oil Change Service', amount: 25000, status: 'Completed', customer: 'Ahmed Ibrahim' },
                  { id: 'LB002', service: 'Engine Diagnostics', amount: 15000, status: 'In Progress', customer: 'Sarah Mohammed' },
                  { id: 'LB003', service: 'Brake Service', amount: 35000, status: 'Completed', customer: 'John Okafor' },
                  { id: 'LB004', service: 'Transmission Service', amount: 45000, status: 'Pending', customer: 'Fatima Ali' },
                  { id: 'LB005', service: 'Air Filter Replacement', amount: 8000, status: 'Completed', customer: 'David Okoro' }
                ].map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Car className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{transaction.service}</p>
                        <p className="text-xs text-gray-500">{transaction.id} • {transaction.customer}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatNumber(transaction.amount, true)}
                      </p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        transaction.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section - Sales Performance Chart */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900">Sales Performance</CardTitle>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
              >
                <option value="last_7_days">Last 7 days</option>
                <option value="last_30_days">Last 30 days</option>
                <option value="last_90_days">Last 90 days</option>
                <option value="ytd">This year</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <SalesLineChart data={salesChartData} isLoading={false} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
