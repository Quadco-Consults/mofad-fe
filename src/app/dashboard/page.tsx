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
  Eye,
  MoreVertical,
  Calendar,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  DollarSign,
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

  return (
    <Card className={`bg-gradient-to-br ${colorStyles[color]} border-0 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ring-1 ${ringColors[color]} group`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600 truncate">{title}</p>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <MoreVertical className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
              {typeof value === 'number' ? formatNumber(value) : value}
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
              <button className="mt-2 flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors">
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
            <button className="flex items-center px-3 md:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Eye className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">View </span>Reports
            </button>
            <button className="flex items-center px-3 md:px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-lg">
              <Calendar className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Schedule </span>Report
            </button>
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
              icon={Clock}
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
        </div>

        {/* Network Overview */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Network Overview</h2>
            <button className="text-sm text-green-600 hover:text-green-700 font-medium">
              View All Locations →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Active Substores"
              value={stats.substore_count || 0}
              icon={Building2}
              color="blue"
            />
            <StatCard
              title="Operating Lubebays"
              value={stats.lubebay_count || 0}
              icon={Car}
              color="green"
            />
            <StatCard
              title="Low Stock Alerts"
              value={stats.low_stock_items || 0}
              icon={AlertTriangle}
              color={(stats.low_stock_items || 0) > 5 ? 'red' : 'green'}
            />
          </div>
        </div>

        {/* Analytics & Insights */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
            <h2 className="text-xl font-semibold text-gray-900">Analytics & Insights</h2>
            <div className="flex items-center space-x-2">
              <select className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white">
                <option>Last 30 days</option>
                <option>Last 7 days</option>
                <option>Last 90 days</option>
                <option>This year</option>
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
                    <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                      <BarChart3 className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-white rounded-xl border-2 border-dashed border-blue-200">
                  <div className="text-center text-blue-600">
                    <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                      <BarChart3 className="h-12 w-12" />
                    </div>
                    <p className="text-lg font-semibold mb-2">Interactive Charts Coming Soon</p>
                    <p className="text-sm text-blue-500 max-w-sm">
                      Advanced sales analytics with trend analysis, forecasting, and drill-down capabilities will be available here
                    </p>
                    <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                      Request Demo
                    </button>
                  </div>
                </div>
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
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            <button className="text-sm text-gray-500 hover:text-gray-700">
              Customize →
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'New Order', icon: ShoppingCart, color: 'blue' },
              { label: 'Add Customer', icon: Users, color: 'green' },
              { label: 'Inventory Check', icon: Package, color: 'yellow' },
              { label: 'Generate Report', icon: BarChart3, color: 'purple' },
            ].map((action, index) => (
              <button
                key={index}
                className={`p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200 hover:-translate-y-1 group`}
              >
                <div className={`p-3 rounded-lg bg-${action.color}-100 w-fit mb-3 group-hover:bg-${action.color}-200 transition-colors`}>
                  <action.icon className={`h-5 w-5 text-${action.color}-600`} />
                </div>
                <p className="text-sm font-medium text-gray-900">{action.label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
