'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, Filter, Calendar, TrendingUp, TrendingDown, DollarSign, Users, Package, Eye, RefreshCw, FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AppLayout } from '@/components/layout/AppLayout'
import apiClient from '@/lib/apiClient'
import { useToast } from '@/components/ui/Toast'

interface SalesReportData {
  summary: {
    total_sales: number
    total_transactions: number
    total_quantity: number
    average_order_value: number
    unique_customers: number
  }
  trends: Array<{
    period: string
    sales: number
    transactions: number
    quantity: number
  }>
  by_product: Array<{
    product_id: number
    product_name: string
    quantity_sold: number
    revenue: number
    percentage: number
  }>
  by_customer: Array<{
    customer_id: number
    customer_name: string
    transactions: number
    total_spent: number
    percentage: number
  }>
  by_substore: Array<{
    substore_id: number
    substore_name: string
    sales: number
    transactions: number
    percentage: number
  }>
}

function SalesReportsPage() {
  const [period, setPeriod] = useState<string>('ytd')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [exportingExcel, setExportingExcel] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const { addToast } = useToast()

  // Fetch sales report data
  const { data: reportData, isLoading, refetch } = useQuery<SalesReportData>({
    queryKey: ['salesReport', period, startDate, endDate],
    queryFn: () => apiClient.getSalesReport({
      period,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    }),
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-NG').format(num)
  }

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`
  }

  const getPeriodLabel = (p: string) => {
    switch (p) {
      case 'ytd': return 'Year to Date'
      case 'last_30_days': return 'Last 30 Days'
      case 'last_90_days': return 'Last 90 Days'
      case 'last_7_days': return 'Last 7 Days'
      case 'custom': return 'Custom Range'
      default: return p
    }
  }

  const handleExportExcel = async () => {
    setExportingExcel(true)
    try {
      await apiClient.downloadReport('sales', 'excel', {
        period,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      })
      addToast({ type: 'success', title: 'Excel report downloaded successfully' })
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to export Excel report' })
    } finally {
      setExportingExcel(false)
    }
  }

  const handleExportPdf = async () => {
    setExportingPdf(true)
    try {
      await apiClient.downloadReport('sales', 'pdf', {
        period,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      })
      addToast({ type: 'success', title: 'PDF report downloaded successfully' })
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to export PDF report' })
    } finally {
      setExportingPdf(false)
    }
  }

  const summary = reportData?.summary || {
    total_sales: 0,
    total_transactions: 0,
    total_quantity: 0,
    average_order_value: 0,
    unique_customers: 0
  }

  const topProducts = reportData?.by_product || []
  const topCustomers = reportData?.by_customer || []
  const substoreBreakdown = reportData?.by_substore || []
  const trends = reportData?.trends || []

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Reports</h1>
            <p className="text-gray-600">Comprehensive sales performance analytics and insights</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <div className="relative">
              <Button
                variant="outline"
                onClick={handleExportExcel}
                disabled={exportingExcel}
              >
                {exportingExcel ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                )}
                Excel
              </Button>
            </div>
            <Button
              className="mofad-btn-primary"
              onClick={handleExportPdf}
              disabled={exportingPdf}
            >
              {exportingPdf ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              PDF
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow p-4 space-y-4">
            <h3 className="font-semibold text-gray-900">Report Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  value={period}
                  onChange={(e) => {
                    setPeriod(e.target.value)
                    if (e.target.value !== 'custom') {
                      setStartDate('')
                      setEndDate('')
                    }
                  }}
                >
                  <option value="ytd">Year to Date</option>
                  <option value="last_7_days">Last 7 Days</option>
                  <option value="last_30_days">Last 30 Days</option>
                  <option value="last_90_days">Last 90 Days</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              {period === 'custom' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Period Selector */}
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
          <Calendar className="h-5 w-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Report Period:</span>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            {getPeriodLabel(period)}
          </span>
          {isLoading && (
            <div className="flex items-center text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading data...
            </div>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-primary-600">{formatCurrency(summary.total_sales)}</p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-blue-600">{formatNumber(summary.total_transactions)}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unique Customers</p>
                <p className="text-2xl font-bold text-green-600">{formatNumber(summary.unique_customers)}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Order Value</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(summary.average_order_value)}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Items Sold</p>
                <p className="text-2xl font-bold text-orange-600">{formatNumber(summary.total_quantity)}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Sales Trend Chart */}
        {trends.length > 0 && (
          <div className="mofad-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h3>
            <div className="h-64 flex items-end space-x-2">
              {trends.slice(-12).map((item, index) => {
                const maxSales = Math.max(...trends.map(t => t.sales), 1)
                const height = (item.sales / maxSales) * 100
                return (
                  <div key={index} className="flex-1 flex flex-col items-center group">
                    <div className="w-full relative">
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {formatCurrency(item.sales)}
                      </div>
                      <div
                        className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t transition-all duration-300 group-hover:from-green-600 group-hover:to-green-500"
                        style={{ height: `${Math.max(height, 5)}%`, minHeight: '8px' }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-2 truncate w-full text-center">{item.period}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="mofad-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
            {topProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No product data available for this period</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topProducts.slice(0, 5).map((product, index) => (
                  <div key={product.product_id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-medium text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.product_name}</p>
                          <p className="text-sm text-gray-500">{formatNumber(product.quantity_sold)} units</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(product.revenue)}</p>
                      <p className="text-sm text-gray-500">{formatPercentage(product.percentage)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Customers */}
          <div className="mofad-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customers</h3>
            {topCustomers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No customer data available for this period</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topCustomers.slice(0, 5).map((customer, index) => (
                  <div key={customer.customer_id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-medium text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{customer.customer_name}</p>
                          <p className="text-sm text-gray-500">{customer.transactions} transactions</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(customer.total_spent)}</p>
                      <p className="text-sm text-gray-500">{formatPercentage(customer.percentage)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sales by Substore */}
        <div className="mofad-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Sales by Substore</h3>
          {substoreBreakdown.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No substore data available for this period</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Substore</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Total Sales</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Transactions</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">% of Total</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {substoreBreakdown.map((substore) => (
                    <tr key={substore.substore_id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{substore.substore_name}</td>
                      <td className="py-3 px-4">{formatCurrency(substore.sales)}</td>
                      <td className="py-3 px-4">{formatNumber(substore.transactions)}</td>
                      <td className="py-3 px-4">{formatPercentage(substore.percentage)}</td>
                      <td className="py-3 px-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                            style={{ width: `${substore.percentage}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sales Trends Table */}
        {trends.length > 0 && (
          <div className="mofad-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Sales by Period</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Period</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Sales</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Transactions</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {trends.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{item.period}</td>
                      <td className="py-3 px-4">{formatCurrency(item.sales)}</td>
                      <td className="py-3 px-4">{formatNumber(item.transactions)}</td>
                      <td className="py-3 px-4">{formatNumber(item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default SalesReportsPage
