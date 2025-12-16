'use client'

import { useQuery } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatNumber } from '@/lib/utils'
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
} from 'lucide-react'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { PendingApprovals } from '@/components/dashboard/PendingApprovals'

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ComponentType<{ className?: string }>
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
}

function StatCard({ title, value, change, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-600 bg-blue-50',
    green: 'bg-green-500 text-green-600 bg-green-50',
    yellow: 'bg-yellow-500 text-yellow-600 bg-yellow-50',
    red: 'bg-red-500 text-red-600 bg-red-50',
    purple: 'bg-purple-500 text-purple-600 bg-purple-50',
  }

  const [iconBg, textColor, cardBg] = colorClasses[color].split(' ')

  return (
    <Card className={`${cardBg} border-0`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
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
                <span className="text-gray-500 ml-1">from last month</span>
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full ${iconBg}`}>
            <Icon className={`h-8 w-8 text-white`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiClient.getDashboardStats(),
  })

  // TODO: Implement sales analytics endpoint in Django
  const { data: salesAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['sales-analytics'],
    queryFn: () => Promise.resolve({}), // Placeholder until backend implements this endpoint
  })

  const stats = dashboardStats || {}

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Here's what's happening with your distribution network.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Last updated</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date().toLocaleString()}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Sales (YTD)"
            value={formatCurrency(stats.total_sales_ytd || 0)}
            change={12.5}
            icon={DollarSign}
            color="green"
          />
          <StatCard
            title="Total Orders"
            value={stats.total_orders || 0}
            change={8.2}
            icon={ShoppingCart}
            color="blue"
          />
          <StatCard
            title="Pending Approvals"
            value={stats.pending_approvals || 0}
            icon={AlertTriangle}
            color="yellow"
          />
          <StatCard
            title="Active Customers"
            value={stats.customer_count || 0}
            change={5.1}
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
            color={stats.low_stock_items > 5 ? 'red' : 'green'}
          />
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading analytics...</p>
                  </div>
                </div>
              ) : (
                <DashboardCharts data={salesAnalytics?.data} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentTransactions />
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <PendingApprovals />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <button className="w-full p-4 text-left bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
                <div className="flex items-center">
                  <ShoppingCart className="h-5 w-5 text-primary-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Create PRF</p>
                    <p className="text-sm text-gray-600">New purchase requisition</p>
                  </div>
                </div>
              </button>

              <button className="w-full p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Stock Adjustment</p>
                    <p className="text-sm text-gray-600">Adjust inventory levels</p>
                  </div>
                </div>
              </button>

              <button className="w-full p-4 text-left bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-yellow-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Add Customer</p>
                    <p className="text-sm text-gray-600">Register new customer</p>
                  </div>
                </div>
              </button>

              <button className="w-full p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-purple-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">View Reports</p>
                    <p className="text-sm text-gray-600">Sales & inventory reports</p>
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}