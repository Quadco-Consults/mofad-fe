'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, Filter, Calendar, DollarSign, TrendingUp, TrendingDown, CreditCard, Building, RefreshCw, FileSpreadsheet, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AppLayout } from '@/components/layout/AppLayout'
import apiClient from '@/lib/apiClient'
import { useToast } from '@/components/ui/Toast'

interface FinancialDashboardData {
  summary: {
    total_revenue: number
    total_expenses: number
    net_profit: number
    profit_margin: number
  }
  monthly_trends: Array<{
    month: string
    revenue: number
    expenses: number
    profit: number
  }>
  revenue_breakdown: {
    substore_sales: number
    lubebay_services: number
    other: number
  }
  expense_breakdown: Record<string, number>
  accounts_receivable: number
  accounts_payable: number
  cash_position: number
}

interface ProfitLossData {
  period: { start: string; end: string }
  revenue: {
    substore_sales: number
    lubebay_services: number
    other_income: number
    total: number
  }
  cost_of_goods_sold: number
  gross_profit: number
  operating_expenses: {
    salaries: number
    rent: number
    utilities: number
    marketing: number
    other: number
    total: number
  }
  operating_income: number
  other_expenses: number
  net_profit: number
  profit_margin: number
  monthly_breakdown: Array<{
    month: string
    revenue: number
    expenses: number
    profit: number
  }>
}

function FinancialReportsPage() {
  const [period, setPeriod] = useState<string>('ytd')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [exportingExcel, setExportingExcel] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const { addToast } = useToast()

  // Fetch financial dashboard data
  const { data: dashboardData, isLoading: dashboardLoading, refetch: refetchDashboard } = useQuery<FinancialDashboardData>({
    queryKey: ['financialDashboard', period],
    queryFn: () => apiClient.getFinancialDashboard(period),
  })

  // Fetch profit & loss data
  const { data: profitLossData, isLoading: plLoading } = useQuery<ProfitLossData>({
    queryKey: ['profitLoss', period, startDate, endDate],
    queryFn: () => apiClient.getProfitLossReport({
      period,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    }),
  })

  const isLoading = dashboardLoading || plLoading

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

  const summary = dashboardData?.summary || {
    total_revenue: 0,
    total_expenses: 0,
    net_profit: 0,
    profit_margin: 0
  }

  const monthlyTrends = dashboardData?.monthly_trends || []
  const revenueBreakdown = dashboardData?.revenue_breakdown || { substore_sales: 0, lubebay_services: 0, other: 0 }
  const expenseBreakdown = dashboardData?.expense_breakdown || {}
  const accountsReceivable = dashboardData?.accounts_receivable || 0
  const accountsPayable = dashboardData?.accounts_payable || 0
  const cashPosition = dashboardData?.cash_position || 0

  const plData = profitLossData || {
    period: { start: '', end: '' },
    revenue: { substore_sales: 0, lubebay_services: 0, other_income: 0, total: 0 },
    cost_of_goods_sold: 0,
    gross_profit: 0,
    operating_expenses: { salaries: 0, rent: 0, utilities: 0, marketing: 0, other: 0, total: 0 },
    operating_income: 0,
    other_expenses: 0,
    net_profit: 0,
    profit_margin: 0,
    monthly_breakdown: []
  }

  const totalRevenue = revenueBreakdown.substore_sales + revenueBreakdown.lubebay_services + revenueBreakdown.other
  const revenueItems = [
    { source: 'Product Sales (Substores)', amount: revenueBreakdown.substore_sales, percentage: totalRevenue > 0 ? (revenueBreakdown.substore_sales / totalRevenue) * 100 : 0 },
    { source: 'Service Revenue (Lubebays)', amount: revenueBreakdown.lubebay_services, percentage: totalRevenue > 0 ? (revenueBreakdown.lubebay_services / totalRevenue) * 100 : 0 },
    { source: 'Other Income', amount: revenueBreakdown.other, percentage: totalRevenue > 0 ? (revenueBreakdown.other / totalRevenue) * 100 : 0 },
  ].filter(r => r.amount > 0)

  const totalExpenses = Object.values(expenseBreakdown).reduce((sum, val) => sum + val, 0)
  const expenseItems = Object.entries(expenseBreakdown).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
  })).filter(e => e.amount > 0)

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
            <p className="text-gray-600">Comprehensive financial performance analysis and insights</p>
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
              onClick={() => refetchDashboard()}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.total_revenue)}</p>
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
                <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.total_expenses)}</p>
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
                <p className={`text-2xl font-bold ${summary.net_profit >= 0 ? 'text-primary-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.net_profit)}
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
                <p className={`text-2xl font-bold ${summary.profit_margin >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                  {formatPercentage(summary.profit_margin)}
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Financial Position */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accounts Receivable</p>
                <p className="text-xl font-bold text-blue-600">{formatCurrency(accountsReceivable)}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accounts Payable</p>
                <p className="text-xl font-bold text-orange-600">{formatCurrency(accountsPayable)}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Building className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cash Position</p>
                <p className={`text-xl font-bold ${cashPosition >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(cashPosition)}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Trend Chart */}
        {monthlyTrends.length > 0 && (
          <div className="mofad-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Financial Trend</h3>
            <div className="h-64 flex items-end space-x-2">
              {monthlyTrends.slice(-12).map((item, index) => {
                const maxValue = Math.max(...monthlyTrends.map(t => Math.max(t.revenue, t.expenses)), 1)
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

        {/* Expense & Revenue Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Breakdown */}
          <div className="mofad-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
            {revenueItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No revenue data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {revenueItems.map((revenue, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <div>
                          <p className="font-medium text-gray-900">{revenue.source}</p>
                          <p className="text-sm text-gray-500">{formatPercentage(revenue.percentage)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(revenue.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expense Breakdown */}
          <div className="mofad-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
            {expenseItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <TrendingDown className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No expense data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {expenseItems.map((expense, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                        <div>
                          <p className="font-medium text-gray-900">{expense.category}</p>
                          <p className="text-sm text-gray-500">{formatPercentage(expense.percentage)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(expense.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Profit & Loss Statement */}
        <div className="mofad-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Profit & Loss Statement</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="font-medium text-gray-900">Total Revenue</span>
              <span className="font-bold text-green-600">{formatCurrency(plData.revenue.total)}</span>
            </div>
            <div className="flex justify-between items-center py-2 pl-4">
              <span className="text-sm text-gray-600">Substore Sales</span>
              <span className="text-gray-900">{formatCurrency(plData.revenue.substore_sales)}</span>
            </div>
            <div className="flex justify-between items-center py-2 pl-4">
              <span className="text-sm text-gray-600">Lubebay Services</span>
              <span className="text-gray-900">{formatCurrency(plData.revenue.lubebay_services)}</span>
            </div>
            <div className="flex justify-between items-center py-2 pl-4 border-b border-gray-200">
              <span className="text-sm text-gray-600">Other Income</span>
              <span className="text-gray-900">{formatCurrency(plData.revenue.other_income)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium text-gray-900">Cost of Goods Sold</span>
              <span className="font-bold text-red-600">-{formatCurrency(plData.cost_of_goods_sold)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="font-medium text-gray-900">Gross Profit</span>
              <span className={`font-bold ${plData.gross_profit >= 0 ? 'text-primary-600' : 'text-red-600'}`}>
                {formatCurrency(plData.gross_profit)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium text-gray-900">Operating Expenses</span>
              <span className="font-bold text-red-600">-{formatCurrency(plData.operating_expenses.total)}</span>
            </div>
            <div className="flex justify-between items-center py-2 pl-4">
              <span className="text-sm text-gray-600">Salaries</span>
              <span className="text-gray-900">{formatCurrency(plData.operating_expenses.salaries)}</span>
            </div>
            <div className="flex justify-between items-center py-2 pl-4">
              <span className="text-sm text-gray-600">Rent</span>
              <span className="text-gray-900">{formatCurrency(plData.operating_expenses.rent)}</span>
            </div>
            <div className="flex justify-between items-center py-2 pl-4">
              <span className="text-sm text-gray-600">Utilities</span>
              <span className="text-gray-900">{formatCurrency(plData.operating_expenses.utilities)}</span>
            </div>
            <div className="flex justify-between items-center py-2 pl-4">
              <span className="text-sm text-gray-600">Marketing</span>
              <span className="text-gray-900">{formatCurrency(plData.operating_expenses.marketing)}</span>
            </div>
            <div className="flex justify-between items-center py-2 pl-4 border-b border-gray-200">
              <span className="text-sm text-gray-600">Other</span>
              <span className="text-gray-900">{formatCurrency(plData.operating_expenses.other)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-t-2 border-gray-300 bg-primary-50 px-4 -mx-4 rounded">
              <span className="font-bold text-gray-900">Net Profit</span>
              <span className={`font-bold text-lg ${plData.net_profit >= 0 ? 'text-primary-600' : 'text-red-600'}`}>
                {formatCurrency(plData.net_profit)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Profit Margin</span>
              <span className={`font-medium ${plData.profit_margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(plData.profit_margin)}
              </span>
            </div>
          </div>
        </div>

        {/* Monthly P&L Breakdown */}
        {plData.monthly_breakdown.length > 0 && (
          <div className="mofad-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly P&L Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Month</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Revenue</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Expenses</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Profit</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {plData.monthly_breakdown.map((item, index) => {
                    const margin = item.revenue > 0 ? ((item.profit / item.revenue) * 100) : 0
                    return (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{item.month}</td>
                        <td className="py-3 px-4 text-green-600">{formatCurrency(item.revenue)}</td>
                        <td className="py-3 px-4 text-red-600">{formatCurrency(item.expenses)}</td>
                        <td className={`py-3 px-4 font-bold ${item.profit >= 0 ? 'text-primary-600' : 'text-red-600'}`}>
                          {formatCurrency(item.profit)}
                        </td>
                        <td className={`py-3 px-4 ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercentage(margin)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default FinancialReportsPage
