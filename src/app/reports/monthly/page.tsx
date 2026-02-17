'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  ChevronLeft,
  Loader2,
  FileText,
  ShoppingCart,
  Wrench,
  Car,
  Users,
  Fuel,
  Truck,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Printer
} from 'lucide-react'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/AppLayout'
import apiClient from '@/lib/apiClient'

function MonthlyPLPage() {
  const now = new Date()
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1)
  const [isCurrentMonth, setIsCurrentMonth] = useState(true)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['monthlyPL', selectedYear, selectedMonth],
    queryFn: () =>
      isCurrentMonth
        ? apiClient.getMonthlyPL()
        : apiClient.getMonthlyPL(selectedYear, selectedMonth),
    staleTime: 60_000,
  })

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount)

  const handleMonthChange = (year: number, month: number) => {
    const isNow =
      year === now.getFullYear() && month === now.getMonth() + 1
    setSelectedYear(year)
    setSelectedMonth(month)
    setIsCurrentMonth(isNow)
  }

  const getPrfStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getPrfStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return <CheckCircle className="h-3 w-3" />
      case 'pending': return <Clock className="h-3 w-3" />
      case 'rejected': return <AlertCircle className="h-3 w-3" />
      default: return <FileText className="h-3 w-3" />
    }
  }

  const revenue = data?.revenue
  const expenses = data?.expenses
  const summary = data?.summary
  const prfs = data?.prfs
  const availableMonths = data?.available_months || []

  const netProfit = summary?.net_profit ?? 0
  const isProfit = netProfit >= 0

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/reports/financial"
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Financial Reports
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Monthly P&L</h1>
              <p className="text-gray-500 text-sm">
                {data?.month || 'Loading...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Month Selector */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`}
                onChange={(e) => {
                  const [y, m] = e.target.value.split('-').map(Number)
                  handleMonthChange(y, m)
                }}
              >
                {/* Current month always first */}
                <option value={`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`}>
                  {new Date(now.getFullYear(), now.getMonth()).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })} (Current)
                </option>
                {availableMonths
                  .filter(
                    (m) =>
                      !(m.year === now.getFullYear() && m.month === now.getMonth() + 1)
                  )
                  .map((m) => (
                    <option
                      key={`${m.year}-${m.month}`}
                      value={`${m.year}-${String(m.month).padStart(2, '0')}`}
                    >
                      {m.label}
                    </option>
                  ))}
              </select>
            </div>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <span className="ml-3 text-gray-500">Loading report...</span>
          </div>
        ) : isError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-700 font-medium">Failed to load monthly P&L</p>
            <button
              onClick={() => refetch()}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Net P&L Summary Banner */}
            <div className={`rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
              isProfit
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
            }`}>
              <div>
                <p className="text-sm opacity-80">Net {isProfit ? 'Profit' : 'Loss'} — {data?.month}</p>
                <p className="text-4xl font-bold mt-1">
                  {isProfit ? '+' : ''}{formatCurrency(netProfit)}
                </p>
                <p className="text-sm opacity-80 mt-1">
                  Profit Margin: {(summary?.profit_margin ?? 0).toFixed(1)}%
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white/20 rounded-lg p-4">
                  <p className="text-xs opacity-80">Total Revenue</p>
                  <p className="text-xl font-bold">{formatCurrency(revenue?.total ?? 0)}</p>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <p className="text-xs opacity-80">Total Expenses</p>
                  <p className="text-xl font-bold">{formatCurrency(expenses?.total ?? 0)}</p>
                </div>
              </div>
            </div>

            {/* Revenue & Expenses Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Section */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-green-50 border-b border-green-100 flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-green-900">Revenue</h2>
                  <span className="ml-auto text-lg font-bold text-green-700">
                    {formatCurrency(revenue?.total ?? 0)}
                  </span>
                </div>
                <div className="divide-y divide-gray-100">
                  {[
                    {
                      label: 'Direct Sales',
                      value: revenue?.direct_sales ?? 0,
                      icon: <ShoppingCart className="h-4 w-4 text-blue-500" />,
                      sub: `${summary?.direct_sales_count ?? 0} orders`,
                    },
                    {
                      label: 'Lubebay Products',
                      value: revenue?.lubebay_products ?? 0,
                      icon: <Wrench className="h-4 w-4 text-orange-500" />,
                      sub: 'Lubricant sales',
                    },
                    {
                      label: 'Lubebay Services',
                      value: revenue?.lubebay_services ?? 0,
                      icon: <Settings className="h-4 w-4 text-purple-500" />,
                      sub: `${summary?.lubebay_transaction_count ?? 0} transactions`,
                    },
                    {
                      label: 'Car Wash',
                      value: revenue?.car_wash ?? 0,
                      icon: <Car className="h-4 w-4 text-cyan-500" />,
                      sub: 'Car wash revenue',
                    },
                  ].map((item) => (
                    <div key={item.label} className="px-6 py-4 flex items-center gap-4">
                      <div className="p-2 bg-gray-50 rounded-lg">{item.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.sub}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(item.value)}
                        </p>
                        {(revenue?.total ?? 0) > 0 && (
                          <p className="text-xs text-gray-400">
                            {((item.value / (revenue?.total ?? 1)) * 100).toFixed(1)}%
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expenses Section */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-red-50 border-b border-red-100 flex items-center gap-3">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <h2 className="text-lg font-semibold text-red-900">Expenses</h2>
                  <span className="ml-auto text-lg font-bold text-red-700">
                    {formatCurrency(expenses?.total ?? 0)}
                  </span>
                </div>
                <div className="divide-y divide-gray-100">
                  {[
                    {
                      label: 'Staff Salary',
                      value: expenses?.staff_salary ?? 0,
                      icon: <Users className="h-4 w-4 text-indigo-500" />,
                    },
                    {
                      label: 'Commission',
                      value: expenses?.commission ?? 0,
                      icon: <DollarSign className="h-4 w-4 text-yellow-500" />,
                    },
                    {
                      label: 'Fuelling',
                      value: expenses?.fuelling ?? 0,
                      icon: <Fuel className="h-4 w-4 text-orange-500" />,
                    },
                    {
                      label: 'Loading',
                      value: expenses?.loading ?? 0,
                      icon: <Truck className="h-4 w-4 text-gray-500" />,
                    },
                    {
                      label: 'Repairs & Maintenance',
                      value: expenses?.repairs ?? 0,
                      icon: <Settings className="h-4 w-4 text-red-500" />,
                    },
                    {
                      label: 'General Expenses',
                      value: expenses?.general ?? 0,
                      icon: <FileText className="h-4 w-4 text-blue-500" />,
                    },
                    {
                      label: 'Other Expenses',
                      value: expenses?.other ?? 0,
                      icon: <AlertCircle className="h-4 w-4 text-purple-500" />,
                    },
                  ].map((item) => (
                    <div key={item.label} className="px-6 py-3 flex items-center gap-4">
                      <div className="p-2 bg-gray-50 rounded-lg">{item.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">{item.label}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(item.value)}
                        </p>
                        {(expenses?.total ?? 0) > 0 && (
                          <p className="text-xs text-gray-400">
                            {((item.value / (expenses?.total ?? 1)) * 100).toFixed(1)}%
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* P&L Summary Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">P&L Summary — {data?.month}</h2>
              </div>
              <div className="divide-y divide-gray-100">
                <div className="px-6 py-3 flex justify-between items-center bg-green-50">
                  <span className="font-medium text-gray-700">Total Revenue</span>
                  <span className="font-bold text-green-700 text-lg">{formatCurrency(revenue?.total ?? 0)}</span>
                </div>
                <div className="px-6 py-3 flex justify-between items-center bg-red-50">
                  <span className="font-medium text-gray-700">Total Expenses</span>
                  <span className="font-bold text-red-700 text-lg">({formatCurrency(expenses?.total ?? 0)})</span>
                </div>
                <div className={`px-6 py-4 flex justify-between items-center ${isProfit ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                  <span className="font-bold text-gray-900 text-lg">Net {isProfit ? 'Profit' : 'Loss'}</span>
                  <span className={`font-bold text-xl ${isProfit ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {isProfit ? '+' : ''}{formatCurrency(netProfit)}
                  </span>
                </div>
                <div className="px-6 py-3 flex justify-between items-center">
                  <span className="text-gray-600">Profit Margin</span>
                  <span className={`font-semibold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                    {(summary?.profit_margin ?? 0).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* PRFs for the Month */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Purchase Requisition Forms (PRFs)
                  </h2>
                  <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    {prfs?.count ?? 0} PRFs
                  </span>
                </div>
                <span className="font-semibold text-gray-700">
                  Total: {formatCurrency(prfs?.total_amount ?? 0)}
                </span>
              </div>
              {(prfs?.list?.length ?? 0) === 0 ? (
                <div className="px-6 py-12 text-center">
                  <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No PRFs found for this month</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">PRF #</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">Date</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wide">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wide">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {prfs?.list.map((prf) => (
                        <tr key={prf.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-orange-600">
                            {prf.prf_number}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                            {prf.title || '—'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {prf.date}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getPrfStatusColor(prf.status)}`}>
                              {getPrfStatusIcon(prf.status)}
                              {prf.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-right text-gray-900">
                            {formatCurrency(prf.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t border-gray-200">
                      <tr>
                        <td colSpan={4} className="px-6 py-3 text-sm font-semibold text-gray-700">
                          Total PRF Amount
                        </td>
                        <td className="px-6 py-3 text-right text-sm font-bold text-gray-900">
                          {formatCurrency(prfs?.total_amount ?? 0)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            {/* Period Info */}
            {data?.period && (
              <div className="text-center text-xs text-gray-400">
                Report period: {data.period.start} to {data.period.end}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  )
}

export default MonthlyPLPage
