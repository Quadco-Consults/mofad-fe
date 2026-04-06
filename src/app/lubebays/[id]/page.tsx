'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import apiClient from '@/lib/apiClient'
import {
  ArrowLeft,
  Store,
  MapPin,
  Phone,
  Mail,
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Calendar,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart3,
  Filter as FilterIcon
} from 'lucide-react'

export default function LubebayDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const lubebayId = params.id as string

  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'expenses' | 'reports'>('overview')
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)

  // Fetch lubebay details
  const { data: lubebay, isLoading: loadingLubebay } = useQuery({
    queryKey: ['lubebay', lubebayId],
    queryFn: () => apiClient.getLubebay(lubebayId)
  })

  // Fetch summary
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['lubebay-summary', lubebayId],
    queryFn: () => apiClient.getLubebaySummary(lubebayId)
  })

  // Fetch service transactions
  const { data: transactionsData } = useQuery({
    queryKey: ['lubebay-service-transactions', lubebayId],
    queryFn: () => apiClient.getLubebayServiceTransactions(lubebayId),
    enabled: activeTab === 'transactions'
  })

  // Fetch expenses
  const { data: expensesData } = useQuery({
    queryKey: ['lubebay-expenses', lubebayId],
    queryFn: () => apiClient.getLubebayExpenses(lubebayId),
    enabled: activeTab === 'expenses'
  })

  // Fetch monthly summary
  const { data: monthlyReport } = useQuery({
    queryKey: ['lubebay-monthly-summary', lubebayId],
    queryFn: () => apiClient.getLubebayMonthlySummary(lubebayId),
    enabled: activeTab === 'reports'
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loadingLubebay) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="ml-3 text-gray-600">Loading lubebay...</span>
        </div>
      </AppLayout>
    )
  }

  if (!lubebay) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-red-600" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Lubebay not found</h3>
          <button
            onClick={() => router.push('/lubebays')}
            className="mt-4 text-indigo-600 hover:text-indigo-500"
          >
            Back to Lubebays
          </button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/lubebays')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{lubebay.name}</h1>
              <p className="text-sm text-gray-500 mt-1">{lubebay.code}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowTransactionModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Sale
            </button>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Expense
            </button>
          </div>
        </div>

        {/* Lubebay Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Location</p>
                <p className="text-sm text-gray-900 mt-1">
                  {lubebay.address || 'N/A'}
                  {lubebay.state && <span className="block text-gray-600">{lubebay.state.name}</span>}
                </p>
              </div>
            </div>
            {lubebay.phone && (
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-sm text-gray-900 mt-1">{lubebay.phone}</p>
                </div>
              </div>
            )}
            {lubebay.email && (
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900 mt-1">{lubebay.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Balance</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {formatCurrency(Number(lubebay.current_balance))}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="mt-2 text-2xl font-bold text-green-600">
                  {formatCurrency(Number(summary?.total_sales || 0))}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {summary?.sales_count || 0} transactions
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="mt-2 text-2xl font-bold text-red-600">
                  {formatCurrency(Number(summary?.total_expenses || 0))}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {summary?.expense_count || 0} expenses
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Profit</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    Number(summary?.total_sales || 0) - Number(summary?.total_expenses || 0)
                  )}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <DollarSign className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'transactions', label: 'Transactions', icon: FileText },
              { id: 'expenses', label: 'Expenses', icon: DollarSign },
              { id: 'reports', label: 'Reports', icon: Calendar }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <p className="text-sm text-gray-600">
                  Overview of recent transactions and activities will be displayed here.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Transactions</h3>
                <div className="space-y-4">
                  {transactionsData?.transactions?.map((txn: any) => (
                    <div key={txn.id} className="border-b border-gray-200 pb-4 last:border-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{txn.transaction_number}</p>
                          <p className="text-sm text-gray-500">{formatDate(txn.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(Number(txn.total_amount))}
                          </p>
                          <span className={`
                            inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                            ${txn.approval_status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : txn.approval_status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                            }
                          `}>
                            {txn.approval_status}
                          </span>
                        </div>
                      </div>
                    </div>
                  )) || <p className="text-sm text-gray-500">No transactions found</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'expenses' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses</h3>
                <div className="space-y-4">
                  {expensesData?.expenses?.map((expense: any) => (
                    <div key={expense.id} className="border-b border-gray-200 pb-4 last:border-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{expense.name}</p>
                          <p className="text-sm text-gray-500">
                            {expense.expense_type} • {formatDate(expense.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-red-600">
                            {formatCurrency(Number(expense.amount))}
                          </p>
                          <span className={`
                            inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                            ${expense.approval_status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : expense.approval_status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                            }
                          `}>
                            {expense.approval_status}
                          </span>
                        </div>
                      </div>
                    </div>
                  )) || <p className="text-sm text-gray-500">No expenses found</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly P&L Report</h3>
              {monthlyReport && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-green-800">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-600 mt-2">
                        {formatCurrency(monthlyReport.revenue?.total || 0)}
                      </p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-red-800">Total Expenses</p>
                      <p className="text-2xl font-bold text-red-600 mt-2">
                        {formatCurrency(monthlyReport.expenses?.total || 0)}
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-blue-800">Net Profit</p>
                      <p className="text-2xl font-bold text-blue-600 mt-2">
                        {formatCurrency(monthlyReport.summary?.net_profit || 0)}
                      </p>
                    </div>
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
