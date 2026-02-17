'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, Filter, Calendar, Loader2, ShoppingCart, Wrench, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { AppLayout } from '@/components/layout/AppLayout'
import apiClient from '@/lib/apiClient'
import { useToast } from '@/components/ui/Toast'

type BusinessTab = 'overview' | 'direct_sales' | 'lubebay'

function FinancialReportsPage() {
  const [activeTab, setActiveTab] = useState<BusinessTab>('overview')
  const [period, setPeriod] = useState<string>('monthly')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const { addToast } = useToast()

  // Fetch overview dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['financialDashboard', period],
    queryFn: () => apiClient.getFinancialDashboard(period),
    enabled: activeTab === 'overview'
  })

  // Fetch direct sales report
  const { data: directSalesData, isLoading: directSalesLoading } = useQuery({
    queryKey: ['directSalesReport', period],
    queryFn: () => apiClient.getDirectSalesReport(period),
    enabled: activeTab === 'direct_sales'
  })

  // Fetch lubebay report
  const { data: lubebayData, isLoading: lubebayLoading } = useQuery({
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
      case 'monthly': return 'This Month'
      case 'last_month': return 'Last Month'
      case 'quarterly': return 'This Quarter'
      case 'last_quarter': return 'Last Quarter'
      case 'half_year': return 'Half Year'
      case 'annual': return 'Annual (This Year)'
      case 'ytd': return 'Year to Date'
      case 'last_30_days': return 'Last 30 Days'
      case 'last_90_days': return 'Last 90 Days'
      case 'last_7_days': return 'Last 7 Days'
      case 'custom': return 'Custom Range'
      default: return p
    }
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Reports</h1>
            <p className="text-gray-600">Profit & Loss Statements</p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/reports/monthly"
              className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Monthly P&L
            </Link>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  <option value="monthly">This Month</option>
                  <option value="last_month">Last Month</option>
                  <option value="quarterly">This Quarter</option>
                  <option value="last_quarter">Last Quarter</option>
                  <option value="half_year">Half Year</option>
                  <option value="annual">Annual</option>
                  <option value="ytd">Year to Date</option>
                </select>
              </div>
            </div>
          </div>
        )}

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
                Consolidated P&L
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

          {activeTab === 'overview' && dashboardData && (
            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-2">Consolidated Profit & Loss Statement</h2>
                <p className="text-white/90">Combined financial performance across all business units</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">GROSS MARGIN BY LOCATION</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">LOCATION</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">STATION</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">LUBEBAY</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">DIRECT SALES</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 bg-gray-100">TOTAL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {dashboardData.gross_margin_by_location?.map((location: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{location.location}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(location.station_margin)}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(location.lubebay_margin)}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(location.direct_sales_margin)}</td>
                          <td className="px-4 py-3 text-sm text-right font-bold text-gray-900 bg-gray-50">{formatCurrency(location.total_margin)}</td>
                        </tr>
                      ))}
                      <tr className="bg-primary-50 font-bold">
                        <td className="px-4 py-3 text-sm text-gray-900">TOTAL GROSS MARGIN</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(dashboardData.gross_margin_totals?.station || 0)}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(dashboardData.gross_margin_totals?.lubebay || 0)}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(dashboardData.gross_margin_totals?.direct_sales || 0)}</td>
                        <td className="px-4 py-3 text-sm text-right text-green-600 bg-green-50">{formatCurrency(dashboardData.gross_margin_for_month)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">HEAD OFFICE EXPENSES</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">EXPENSE TYPE</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {dashboardData.head_office_expenses && Object.entries(dashboardData.head_office_expenses).map(([key, value]: [string, any]) => (
                        <tr key={key} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{key}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(value)}</td>
                        </tr>
                      ))}
                      <tr className="bg-red-50 font-bold">
                        <td className="px-4 py-3 text-sm text-gray-900">TOTAL EXPENSES</td>
                        <td className="px-4 py-3 text-sm text-right text-red-600">{formatCurrency(dashboardData.total_expenses)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg p-6">
                  <p className="text-sm text-gray-600 mb-1">Gross Margin for Month</p>
                  <p className="text-3xl font-bold text-green-600">{formatCurrency(dashboardData.gross_margin_for_month)}</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-rose-50 border-l-4 border-red-500 rounded-lg p-6">
                  <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
                  <p className="text-3xl font-bold text-red-600">{formatCurrency(dashboardData.total_expenses)}</p>
                </div>

                <div className={`bg-gradient-to-br ${dashboardData.net_profit >= 0 ? 'from-blue-50 to-indigo-50 border-l-4 border-blue-500' : 'from-orange-50 to-red-50 border-l-4 border-red-500'} rounded-lg p-6`}>
                  <p className="text-sm text-gray-600 mb-1">Net Profit for Month</p>
                  <p className={`text-3xl font-bold ${dashboardData.net_profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {formatCurrency(dashboardData.net_profit)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Margin: {formatPercentage(dashboardData.profit_margin)}
                  </p>
                </div>
              </div>

              {(dashboardData.under_lodgement_pos || dashboardData.sweepable_funds) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Under Lodgement (POS Payment)</h3>
                    <p className="text-2xl font-bold text-orange-600">{formatCurrency(dashboardData.under_lodgement_pos || 0)}</p>
                  </div>

                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Sweepable Funds</h3>
                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(dashboardData.sweepable_funds || 0)}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'direct_sales' && directSalesData && (
            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-2">Direct Sales Profit & Loss Statement</h2>
                <p className="text-white/90">Financial performance for direct sales operations</p>
              </div>

              <div className="bg-green-50 rounded-lg shadow-lg p-6">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">GROSS MARGIN FOR THE MONTH</h3>
                <p className="text-4xl font-bold text-green-600">{formatCurrency(directSalesData.gross_margin_for_month)}</p>
                {directSalesData.gross_margin_breakdown?.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {directSalesData.gross_margin_breakdown.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.location}</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(item.gross_margin)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">EXPENSES</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <tbody className="divide-y divide-gray-200">
                      {directSalesData.expenses && Object.entries(directSalesData.expenses).map(([key, value]: [string, any]) => (
                        <tr key={key} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{key}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(value)}</td>
                        </tr>
                      ))}
                      <tr className="bg-red-50 font-bold">
                        <td className="px-4 py-3 text-sm text-gray-900">TOTAL EXPENSES</td>
                        <td className="px-4 py-3 text-sm text-right text-red-600">{formatCurrency(directSalesData.total_expenses)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg shadow-lg p-6">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">NET PROFIT FOR THE MONTH</h3>
                <p className={`text-4xl font-bold ${directSalesData.net_profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(directSalesData.net_profit)}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'lubebay' && lubebayData && (
            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-2">Lubebay Services Profit & Loss Statement</h2>
                <p className="text-white/90">Financial performance for lubebay operations</p>
              </div>

              <div className="bg-green-50 rounded-lg shadow-lg p-6">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">GROSS PROFIT FOR THE MONTH</h3>
                <p className="text-4xl font-bold text-green-600">{formatCurrency(lubebayData.gross_profit_for_month)}</p>
                {lubebayData.gross_profit_breakdown?.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {lubebayData.gross_profit_breakdown.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.location}</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(item.gross_profit)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">EXPENSES</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <tbody className="divide-y divide-gray-200">
                      {lubebayData.expenses && Object.entries(lubebayData.expenses).map(([key, value]: [string, any]) => (
                        <tr key={key} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{key}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(value)}</td>
                        </tr>
                      ))}
                      <tr className="bg-red-50 font-bold">
                        <td className="px-4 py-3 text-sm text-gray-900">TOTAL EXPENSES</td>
                        <td className="px-4 py-3 text-sm text-right text-red-600">{formatCurrency(lubebayData.total_expenses)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg shadow-lg p-6">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">NET PROFIT FOR THE MONTH</h3>
                <p className={`text-4xl font-bold ${lubebayData.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(lubebayData.net_profit)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

export default FinancialReportsPage
