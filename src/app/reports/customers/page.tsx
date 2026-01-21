'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, Filter, Calendar, Users, DollarSign, TrendingUp, Star, RefreshCw, FileSpreadsheet, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AppLayout } from '@/components/layout/AppLayout'
import apiClient from '@/lib/apiClient'
import { useToast } from '@/components/ui/Toast'

interface CustomerAnalyticsData {
  summary: {
    total_customers: number
    active_customers: number
    new_customers: number
    churned_customers: number
    average_lifetime_value: number
  }
  by_type: Array<{
    type_id: number
    type_name: string
    customer_count: number
    total_revenue: number
    average_order_value: number
  }>
  by_location: Array<{
    state_id: number
    state_name: string
    customer_count: number
    total_revenue: number
  }>
  top_customers: Array<{
    customer_id: number
    customer_name: string
    total_transactions: number
    total_spent: number
    last_purchase_date: string
  }>
  customer_trends: Array<{
    month: string
    new_customers: number
    active_customers: number
    churned: number
  }>
  purchase_frequency: {
    one_time: number
    occasional: number
    regular: number
    frequent: number
  }
}

function CustomerReportsPage() {
  const [period, setPeriod] = useState<string>('ytd')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [exportingExcel, setExportingExcel] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const { addToast } = useToast()

  // Fetch customer analytics data
  const { data: reportData, isLoading, refetch } = useQuery<CustomerAnalyticsData>({
    queryKey: ['customerAnalytics', period, startDate, endDate],
    queryFn: () => apiClient.getCustomerAnalytics({
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
      await apiClient.downloadReport('customers', 'excel', {
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
      await apiClient.downloadReport('customers', 'pdf', {
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
    total_customers: 0,
    active_customers: 0,
    new_customers: 0,
    churned_customers: 0,
    average_lifetime_value: 0
  }

  const customersByType = reportData?.by_type || []
  const customersByLocation = reportData?.by_location || []
  const topCustomers = reportData?.top_customers || []
  const customerTrends = reportData?.customer_trends || []
  const purchaseFrequency = reportData?.purchase_frequency || { one_time: 0, occasional: 0, regular: 0, frequent: 0 }

  const retentionRate = summary.total_customers > 0
    ? ((summary.total_customers - summary.churned_customers) / summary.total_customers) * 100
    : 0

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Reports</h1>
            <p className="text-gray-600">Comprehensive customer analytics and behavior insights</p>
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
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-primary-600">{formatNumber(summary.total_customers)}</p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold text-green-600">{formatNumber(summary.active_customers)}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New Customers</p>
                <p className="text-2xl font-bold text-blue-600">{formatNumber(summary.new_customers)}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Retention Rate</p>
                <p className="text-2xl font-bold text-purple-600">{formatPercentage(retentionRate)}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Lifetime Value</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(summary.average_lifetime_value)}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Frequency */}
        <div className="mofad-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Frequency Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-600 mb-2">{formatNumber(purchaseFrequency.one_time)}</div>
              <div className="text-sm text-gray-700">One-time Buyers</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">{formatNumber(purchaseFrequency.occasional)}</div>
              <div className="text-sm text-blue-700">Occasional (2-3 purchases)</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">{formatNumber(purchaseFrequency.regular)}</div>
              <div className="text-sm text-green-700">Regular (4-6 purchases)</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">{formatNumber(purchaseFrequency.frequent)}</div>
              <div className="text-sm text-purple-700">Frequent (7+ purchases)</div>
            </div>
          </div>
        </div>

        {/* Top Customers */}
        <div className="mofad-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Customers</h3>
          {topCustomers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No customer data available for this period</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Rank</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Transactions</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Total Spent</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Last Purchase</th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.slice(0, 10).map((customer, index) => (
                    <tr key={customer.customer_id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-medium text-sm">{index + 1}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">{customer.customer_name}</td>
                      <td className="py-3 px-4">{formatNumber(customer.total_transactions)}</td>
                      <td className="py-3 px-4 font-bold text-primary-600">{formatCurrency(customer.total_spent)}</td>
                      <td className="py-3 px-4 text-gray-500">
                        {new Date(customer.last_purchase_date).toLocaleDateString('en-NG')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Customer Segmentation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customers by Type */}
          <div className="mofad-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Customers by Type</h3>
            {customersByType.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No customer type data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {customersByType.map((type) => (
                  <div key={type.type_id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-primary-500 rounded"></div>
                        <div>
                          <p className="font-medium text-gray-900">{type.type_name}</p>
                          <p className="text-sm text-gray-500">
                            {type.customer_count} customers • Avg: {formatCurrency(type.average_order_value)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(type.total_revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customers by Location */}
          <div className="mofad-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Customers by Location</h3>
            {customersByLocation.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No location data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {customersByLocation.slice(0, 6).map((location) => (
                  <div key={location.state_id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <div>
                          <p className="font-medium text-gray-900">{location.state_name}</p>
                          <p className="text-sm text-gray-500">{location.customer_count} customers</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(location.total_revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Customer Growth Trend */}
        {customerTrends.length > 0 && (
          <div className="mofad-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Growth Trend</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Month</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">New Customers</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Active Customers</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Churned</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Net Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {customerTrends.map((trend, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{trend.month}</td>
                      <td className="py-3 px-4 text-green-600">+{formatNumber(trend.new_customers)}</td>
                      <td className="py-3 px-4">{formatNumber(trend.active_customers)}</td>
                      <td className="py-3 px-4 text-red-600">-{formatNumber(trend.churned)}</td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${trend.new_customers - trend.churned >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {trend.new_customers - trend.churned >= 0 ? '+' : ''}{formatNumber(trend.new_customers - trend.churned)}
                        </span>
                      </td>
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

export default CustomerReportsPage
