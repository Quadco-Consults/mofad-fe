'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, Filter, Calendar, DollarSign, TrendingUp, TrendingDown, FileSpreadsheet, Loader2, ShoppingCart, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AppLayout } from '@/components/layout/AppLayout'
import apiClient from '@/lib/apiClient'
import { useToast } from '@/components/ui/Toast'

type BusinessTab = 'overview' | 'direct_sales' | 'lubebay'

function FinancialReportsPage() {
  const [activeTab, setActiveTab] = useState<BusinessTab>('overview')
  const [period, setPeriod] = useState<string>('ytd')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [exportingExcel, setExportingExcel] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const { addToast } = useToast()

  // Fetch overview dashboard data
  const { data: dashboardData, isLoading: dashboardLoading, refetch: refetchDashboard } = useQuery({
    queryKey: ['financialDashboard', period],
    queryFn: () => apiClient.getFinancialDashboard(period),
    enabled: activeTab === 'overview'
  })

  // Fetch direct sales report
  const { data: directSalesData, isLoading: directSalesLoading, refetch: refetchDirectSales } = useQuery({
    queryKey: ['directSalesReport', period],
    queryFn: () => apiClient.getDirectSalesReport(period),
    enabled: activeTab === 'direct_sales'
  })

  // Fetch lubebay report
  const { data: lubebayData, isLoading: lubebayLoading, refetch: refetchLubebay } = useQuery({
    queryKey: ['lubebayReport', period],
    queryFn: () => apiClient.getLubebayReport(period),
    enabled: activeTab === 'lubebay'
  })

  const isLoading = dashboardLoading || directSalesLoading || lubebayLoading

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount)
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
      await apiClient.downloadReport('financial', 'excel', {
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
      await apiClient.downloadReport('financial', 'pdf', {
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

  const handleRefresh = () => {
    if (activeTab === 'overview') refetchDashboard()
    else if (activeTab === 'direct_sales') refetchDirectSales()
    else if (activeTab === 'lubebay') refetchLubebay()
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
            <p className="text-gray-600">Comprehensive financial performance analysis by business type</p>
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
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <TrendingUp className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
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

        {/* Period Indicator */}
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

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <TrendingUp className="h-5 w-5 mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('direct_sales')}
                className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'direct_sales'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Direct Sales
              </button>
              <button
                onClick={() => setActiveTab('lubebay')}
                className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'lubebay'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Wrench className="h-5 w-5 mr-2" />
                Lubebay Services
              </button>
            </nav>
          </div>

          {/* Overview Tab Content */}
          {activeTab === 'overview' && dashboardData && (
            <div className="p-6 space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="mofad-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(dashboardData.summary.total_revenue)}</p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="mofad-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Expenses</p>
                      <p className="text-2xl font-bold text-red-600">{formatCurrency(dashboardData.summary.total_expenses)}</p>
                    </div>
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                </div>

                <div className="mofad-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Net Profit</p>
                      <p className={`text-2xl font-bold ${dashboardData.summary.net_profit >= 0 ? 'text-primary-600' : 'text-red-600'}`}>
                        {formatCurrency(dashboardData.summary.net_profit)}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-primary-600" />
                    </div>
                  </div>
                </div>

                <div className="mofad-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Profit Margin</p>
                      <p className={`text-2xl font-bold ${dashboardData.summary.profit_margin >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                        {formatPercentage(dashboardData.summary.profit_margin)}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="mofad-card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Business Type</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ShoppingCart className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-gray-900">Direct Sales</p>
                          <p className="text-sm text-gray-500">
                            {formatPercentage((dashboardData.revenue_breakdown.substore_sales / dashboardData.summary.total_revenue) * 100 || 0)}
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-gray-900">{formatCurrency(dashboardData.revenue_breakdown.substore_sales)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Wrench className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium text-gray-900">Lubebay Services</p>
                          <p className="text-sm text-gray-500">
                            {formatPercentage((dashboardData.revenue_breakdown.lubebay_services / dashboardData.summary.total_revenue) * 100 || 0)}
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-gray-900">{formatCurrency(dashboardData.revenue_breakdown.lubebay_services)}</p>
                    </div>
                  </div>
                </div>

                <div className="mofad-card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Position</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Accounts Receivable</span>
                      <span className="font-semibold text-blue-600">{formatCurrency(dashboardData.accounts_receivable)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Accounts Payable</span>
                      <span className="font-semibold text-orange-600">{formatCurrency(dashboardData.accounts_payable)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-medium text-gray-900">Cash Position</span>
                      <span className={`font-bold ${dashboardData.cash_position >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(dashboardData.cash_position)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Trends */}
              {dashboardData.monthly_trends.length > 0 && (
                <div className="mofad-card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Financial Trend</h3>
                  <div className="h-64 flex items-end space-x-2">
                    {dashboardData.monthly_trends.slice(-12).map((item, index) => {
                      const maxValue = Math.max(...dashboardData.monthly_trends.map(t => Math.max(t.revenue, t.expenses)), 1)
                      const revenueHeight = (item.revenue / maxValue) * 100
                      const expenseHeight = (item.expenses / maxValue) * 100
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center group">
                          <div className="w-full flex space-x-1">
                            <div className="flex-1 relative">
                              <div
                                className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t"
                                style={{ height: `${Math.max(revenueHeight, 5)}%`, minHeight: '4px' }}
                              ></div>
                            </div>
                            <div className="flex-1 relative">
                              <div
                                className="w-full bg-gradient-to-t from-red-500 to-red-400 rounded-t"
                                style={{ height: `${Math.max(expenseHeight, 5)}%`, minHeight: '4px' }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 mt-2">{item.month}</span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                      <span className="text-sm text-gray-600">Revenue</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                      <span className="text-sm text-gray-600">Expenses</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Direct Sales Tab Content */}
          {activeTab === 'direct_sales' && directSalesData && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="mofad-card">
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(directSalesData.summary.total_revenue)}</p>
                </div>
                <div className="mofad-card">
                  <p className="text-sm text-gray-600">Expenses</p>
                  <p className="text-xl font-bold text-red-600">{formatCurrency(directSalesData.summary.total_expenses)}</p>
                </div>
                <div className="mofad-card">
                  <p className="text-sm text-gray-600">Profit</p>
                  <p className="text-xl font-bold text-primary-600">{formatCurrency(directSalesData.summary.net_profit)}</p>
                </div>
                <div className="mofad-card">
                  <p className="text-sm text-gray-600">Margin</p>
                  <p className="text-xl font-bold text-purple-600">{formatPercentage(directSalesData.summary.profit_margin)}</p>
                </div>
                <div className="mofad-card">
                  <p className="text-sm text-gray-600">Orders</p>
                  <p className="text-xl font-bold text-blue-600">{directSalesData.summary.total_orders}</p>
                </div>
                <div className="mofad-card">
                  <p className="text-sm text-gray-600">Avg Order</p>
                  <p className="text-xl font-bold text-indigo-600">{formatCurrency(directSalesData.summary.avg_order_value)}</p>
                </div>
              </div>

              {/* Financial Statement Breakdown */}
              <div className="mofad-card">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Profit & Loss Statement - Direct Sales</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b-2 border-gray-300 bg-green-50 px-4 -mx-4">
                    <span className="font-bold text-gray-900">Revenue (Product Sales)</span>
                    <span className="font-bold text-xl text-green-600">{formatCurrency(directSalesData.summary.total_revenue)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600 pl-4">Total Orders: {directSalesData.summary.total_orders}</span>
                    <span className="text-sm text-gray-600">Avg Order: {formatCurrency(directSalesData.summary.avg_order_value)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 mt-4 border-b-2 border-gray-300 bg-red-50 px-4 -mx-4">
                    <span className="font-bold text-gray-900">Operating Expenses (Allocated)</span>
                    <span className="font-bold text-xl text-red-600">-{formatCurrency(directSalesData.summary.total_expenses)}</span>
                  </div>
                  <div className="text-sm text-gray-500 pl-4">
                    <p>* 50% allocation of total company expenses</p>
                  </div>
                  <div className="flex justify-between items-center py-4 mt-4 border-t-2 border-primary-300 bg-primary-50 px-4 -mx-4 rounded">
                    <span className="font-bold text-lg text-gray-900">Net Profit</span>
                    <span className={`font-bold text-2xl ${directSalesData.summary.net_profit >= 0 ? 'text-primary-600' : 'text-red-600'}`}>
                      {formatCurrency(directSalesData.summary.net_profit)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Profit Margin</span>
                    <span className={`font-bold text-lg ${directSalesData.summary.profit_margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercentage(directSalesData.summary.profit_margin)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Monthly Breakdown Table */}
              {directSalesData.monthly_breakdown.length > 0 && (
                <div className="mofad-card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Month</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-700">Revenue</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-700">Orders</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-700">Avg Order Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {directSalesData.monthly_breakdown.map((item, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-gray-900">{item.month}</td>
                            <td className="py-3 px-4 text-right text-green-600 font-semibold">{formatCurrency(item.revenue)}</td>
                            <td className="py-3 px-4 text-right text-gray-900">{item.orders}</td>
                            <td className="py-3 px-4 text-right text-blue-600">{formatCurrency(item.avg_order_value)}</td>
                          </tr>
                        ))}
                        <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                          <td className="py-3 px-4">TOTAL</td>
                          <td className="py-3 px-4 text-right text-green-600">{formatCurrency(directSalesData.summary.total_revenue)}</td>
                          <td className="py-3 px-4 text-right">{directSalesData.summary.total_orders}</td>
                          <td className="py-3 px-4 text-right text-blue-600">{formatCurrency(directSalesData.summary.avg_order_value)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Lubebay Tab Content */}
          {activeTab === 'lubebay' && lubebayData && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="mofad-card">
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(lubebayData.summary.total_revenue)}</p>
                </div>
                <div className="mofad-card">
                  <p className="text-sm text-gray-600">Expenses</p>
                  <p className="text-xl font-bold text-red-600">{formatCurrency(lubebayData.summary.total_expenses)}</p>
                </div>
                <div className="mofad-card">
                  <p className="text-sm text-gray-600">Profit</p>
                  <p className="text-xl font-bold text-primary-600">{formatCurrency(lubebayData.summary.net_profit)}</p>
                </div>
                <div className="mofad-card">
                  <p className="text-sm text-gray-600">Margin</p>
                  <p className="text-xl font-bold text-purple-600">{formatPercentage(lubebayData.summary.profit_margin)}</p>
                </div>
                <div className="mofad-card">
                  <p className="text-sm text-gray-600">Transactions</p>
                  <p className="text-xl font-bold text-blue-600">{lubebayData.summary.total_transactions}</p>
                </div>
                <div className="mofad-card">
                  <p className="text-sm text-gray-600">Avg Value</p>
                  <p className="text-xl font-bold text-indigo-600">{formatCurrency(lubebayData.summary.avg_transaction_value)}</p>
                </div>
              </div>

              {/* Financial Statement Breakdown */}
              <div className="mofad-card">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Profit & Loss Statement - Lubebay Services</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b-2 border-gray-300 bg-green-50 px-4 -mx-4">
                    <span className="font-bold text-gray-900">Revenue (Service Revenue)</span>
                    <span className="font-bold text-xl text-green-600">{formatCurrency(lubebayData.summary.total_revenue)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600 pl-4">Total Transactions: {lubebayData.summary.total_transactions}</span>
                    <span className="text-sm text-gray-600">Avg Transaction: {formatCurrency(lubebayData.summary.avg_transaction_value)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 mt-4 border-b-2 border-gray-300 bg-red-50 px-4 -mx-4">
                    <span className="font-bold text-gray-900">Operating Expenses (Allocated)</span>
                    <span className="font-bold text-xl text-red-600">-{formatCurrency(lubebayData.summary.total_expenses)}</span>
                  </div>
                  <div className="text-sm text-gray-500 pl-4">
                    <p>* 50% allocation of total company expenses</p>
                  </div>
                  <div className="flex justify-between items-center py-4 mt-4 border-t-2 border-primary-300 bg-primary-50 px-4 -mx-4 rounded">
                    <span className="font-bold text-lg text-gray-900">Net Profit</span>
                    <span className={`font-bold text-2xl ${lubebayData.summary.net_profit >= 0 ? 'text-primary-600' : 'text-red-600'}`}>
                      {formatCurrency(lubebayData.summary.net_profit)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Profit Margin</span>
                    <span className={`font-bold text-lg ${lubebayData.summary.profit_margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercentage(lubebayData.summary.profit_margin)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Monthly Breakdown Table */}
              {lubebayData.monthly_breakdown.length > 0 && (
                <div className="mofad-card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Month</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-700">Revenue</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-700">Transactions</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-700">Avg Transaction</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lubebayData.monthly_breakdown.map((item, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-gray-900">{item.month}</td>
                            <td className="py-3 px-4 text-right text-green-600">{formatCurrency(item.revenue)}</td>
                            <td className="py-3 px-4 text-right text-gray-900">{item.transactions}</td>
                            <td className="py-3 px-4 text-right text-blue-600">{formatCurrency(item.avg_transaction_value)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Top Lubebays */}
              {lubebayData.top_lubebays.length > 0 && (
                <div className="mofad-card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Lubebays</h3>
                  <div className="space-y-3">
                    {lubebayData.top_lubebays.slice(0, 5).map((lubebay, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{lubebay.lubebay__name}</p>
                          <p className="text-sm text-gray-500">{lubebay.transaction_count} transactions</p>
                        </div>
                        <p className="font-bold text-green-600">{formatCurrency(lubebay.total_revenue)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

export default FinancialReportsPage
