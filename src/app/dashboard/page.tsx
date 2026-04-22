'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/Card'
import apiClient from '@/lib/apiClient'
import Link from 'next/link'
import {
  DollarSign,
  Package,
  Building2,
  Car,
  Wrench,
  ShoppingCart,
  RefreshCw,
  ArrowUpRight,
  MapPin,
} from 'lucide-react'

interface WarehouseValue {
  id: number
  name: string
  location: string
  stock_value: number
  sales: number
  item_count: number
}

interface DashboardStats {
  // Sales Metrics
  total_sales_ytd: number
  lubebay_sales: number
  lubebay_services_sales: number
  direct_sales: number
  carwash_sales: number
  total_services_sales: number

  // Stock Metrics
  stock_value: number
  warehouse_values: WarehouseValue[]
  low_stock_items: number

  // General Metrics
  total_orders: number
  pending_approvals: number
  customer_count: number
  product_count: number
  warehouse_count: number
  lubebay_count: number
}

const formatCurrency = (amount: number): string => {
  if (!amount && amount !== 0) return '₦0'
  if (amount >= 1000000) return `₦${(amount / 1000000).toFixed(1)}M`
  if (amount >= 1000) return `₦${(amount / 1000).toFixed(1)}K`
  return `₦${amount.toLocaleString()}`
}

interface MetricCardProps {
  title: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  link?: string
  subtitle?: string
}

function MetricCard({ title, value, icon: Icon, color, bgColor, link, subtitle }: MetricCardProps) {
  const CardWrapper = link ? Link : 'div'
  const cardProps: any = link ? { href: link } : {}

  return (
    <CardWrapper {...cardProps}>
      <Card className={`${bgColor} border-0 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {formatCurrency(value)}
              </p>
              {subtitle && (
                <p className="text-xs text-gray-500">{subtitle}</p>
              )}
            </div>
            <div className={`p-4 rounded-2xl ${color} shadow-lg`}>
              <Icon className="h-8 w-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </CardWrapper>
  )
}

function WarehouseCard({ warehouse }: { warehouse: WarehouseValue }) {
  return (
    <Card className="bg-white border border-gray-200 hover:shadow-md transition-all duration-300">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">{warehouse.name}</h3>
              <p className="text-xs text-gray-500 flex items-center mt-0.5">
                <MapPin className="h-3 w-3 mr-1" />
                {warehouse.location}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Stock Value</span>
            <span className="text-sm font-bold text-gray-900">{formatCurrency(warehouse.stock_value)}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Sales</span>
            <span className="text-sm font-bold text-green-600">{formatCurrency(warehouse.sales)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Items</span>
            <span className="text-sm font-semibold text-gray-700">{(warehouse.item_count || 0).toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  // Fetch dashboard stats
  const { data: dashboardStats, isLoading, refetch } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const data = await apiClient.getDashboardStats()
      return data as unknown as DashboardStats
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const stats: DashboardStats = dashboardStats || {
    total_sales_ytd: 0,
    lubebay_sales: 0,
    lubebay_services_sales: 0,
    direct_sales: 0,
    carwash_sales: 0,
    total_services_sales: 0,
    stock_value: 0,
    warehouse_values: [],
    low_stock_items: 0,
    total_orders: 0,
    pending_approvals: 0,
    customer_count: 0,
    product_count: 0,
    warehouse_count: 0,
    lubebay_count: 0,
  }

  return (
    <AppLayout>
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Real-time business metrics and performance overview</p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        )}

        {!isLoading && (
          <>
            {/* Primary Sales Metrics */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Lubebay Sales"
                  value={stats.lubebay_sales}
                  icon={Car}
                  color="bg-gradient-to-br from-blue-500 to-blue-600"
                  bgColor="bg-gradient-to-br from-blue-50 to-blue-100/80"
                  link="/channels/lubebays"
                  subtitle="Product sales from lubebays"
                />

                <MetricCard
                  title="Stock Value"
                  value={stats.stock_value}
                  icon={Package}
                  color="bg-gradient-to-br from-purple-500 to-purple-600"
                  bgColor="bg-gradient-to-br from-purple-50 to-purple-100/80"
                  link="/inventory"
                  subtitle="Total inventory value"
                />

                <MetricCard
                  title="Direct Sales"
                  value={stats.direct_sales}
                  icon={ShoppingCart}
                  color="bg-gradient-to-br from-green-500 to-green-600"
                  bgColor="bg-gradient-to-br from-green-50 to-green-100/80"
                  link="/channels/substores"
                  subtitle="Substore sales"
                />

                <MetricCard
                  title="Services Sales"
                  value={stats.total_services_sales}
                  icon={Wrench}
                  color="bg-gradient-to-br from-orange-500 to-orange-600"
                  bgColor="bg-gradient-to-br from-orange-50 to-orange-100/80"
                  subtitle="Lubebay & carwash services"
                />
              </div>
            </div>

            {/* Service Breakdown */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Services Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-amber-50 to-amber-100/80 border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Lubebay Services</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(stats.lubebay_services_sales)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Oil change, diagnostics, etc.</p>
                      </div>
                      <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg">
                        <Wrench className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100/80 border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Carwash Sales</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(stats.carwash_sales)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Car cleaning services</p>
                      </div>
                      <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg">
                        <Car className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/80 border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(stats.total_sales_ytd)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">All channels combined</p>
                      </div>
                      <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Warehouse Values */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Warehouse Stock & Sales</h2>
                <Link
                  href="/inventory"
                  className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center"
                >
                  View All
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Link>
              </div>

              {stats.warehouse_values.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stats.warehouse_values.map((warehouse) => (
                    <WarehouseCard key={warehouse.id} warehouse={warehouse} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600">No warehouse data available</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Quick Stats */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <Card className="bg-white">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-600 mb-1">Warehouses</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.warehouse_count}</p>
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-600 mb-1">Lubebays</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.lubebay_count}</p>
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-600 mb-1">Products</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.product_count}</p>
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-600 mb-1">Customers</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.customer_count}</p>
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-600 mb-1">Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_orders}</p>
                  </CardContent>
                </Card>

                <Card className={`${stats.low_stock_items > 0 ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-600 mb-1">Low Stock</p>
                    <p className={`text-2xl font-bold ${stats.low_stock_items > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      {stats.low_stock_items}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
