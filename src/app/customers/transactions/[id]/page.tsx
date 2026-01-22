'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Download, Edit, Trash2, TrendingUp, CreditCard, Clock, MapPin, User, Calendar, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AppLayout } from '@/components/layout/AppLayout'
import apiClient from '@/lib/apiClient'

interface CustomerTransaction {
  id: number
  customer: number
  customer_name: string
  transaction_type: 'sale' | 'payment' | 'credit' | 'refund' | 'debit' | 'adjustment'
  reference_number: string
  reference_type: string
  reference_id: number
  amount: number
  balance_before: number
  balance_after: number
  payment_method: string
  payment_reference: string
  description: string
  notes: string
  status: 'completed' | 'pending' | 'cancelled' | 'failed'
  created_by: number
  created_by_name: string
  approved_by: number
  created_at: string
  updated_at: string
  approved_at: string
}

export default function TransactionViewPage() {
  const params = useParams()
  const router = useRouter()
  const transactionId = params?.id as string

  const { data: transactionResponse, isLoading, error } = useQuery({
    queryKey: ['customer-transactions'],
    queryFn: () => apiClient.get('/customer-transactions/')
  })

  const transactions = (transactionResponse?.results || []) as CustomerTransaction[]

  const transaction = transactions.find(t => t.id === parseInt(transactionId))

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'long'
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sale': return <TrendingUp className="h-6 w-6" />
      case 'payment': return <CreditCard className="h-6 w-6" />
      case 'credit': return <Clock className="h-6 w-6" />
      case 'refund': return <TrendingUp className="h-6 w-6 rotate-180" />
      default: return <TrendingUp className="h-6 w-6" />
    }
  }

  const getTypeBadge = (type: string) => {
    const styles = {
      sale: 'bg-green-100 text-green-800 border-green-200',
      payment: 'bg-blue-100 text-blue-800 border-blue-200',
      credit: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      refund: 'bg-red-100 text-red-800 border-red-200'
    }
    return styles[type as keyof typeof styles] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getAmountColor = (type: string) => {
    if (type === 'payment' || type === 'credit') return 'text-green-600'
    if (type === 'refund') return 'text-red-600'
    return 'text-gray-900'
  }

  if (error) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-red-500">Error loading transaction details. Please try again.</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-500">Loading transaction details...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!transaction) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-gray-500">Transaction not found.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/customers/transactions')}
            >
              Back to Transactions
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/customers/transactions')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Transactions
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Transaction Details</h1>
              <p className="text-gray-600">View complete transaction information</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Transaction Overview Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTypeBadge(transaction.transaction_type).replace('text-', 'text-').replace('bg-', 'bg-')}`}>
                  {getTypeIcon(transaction.transaction_type)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{transaction.reference_number}</h2>
                  <p className="text-gray-600">{transaction.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${getAmountColor(transaction.transaction_type)}`}>
                  {transaction.transaction_type === 'payment' || transaction.transaction_type === 'credit' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </div>
                <span className={`inline-flex px-3 py-1 text-sm leading-5 font-semibold rounded-full border ${getStatusBadge(transaction.status || 'unknown')}`}>
                  {(transaction.status || 'Unknown').charAt(0).toUpperCase() + (transaction.status || 'unknown').slice(1)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
            {/* Customer Information */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">Customer</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{transaction.customer_name}</p>
                <p className="text-sm text-gray-600">Customer</p>
                <p className="text-xs text-gray-400">ID: {transaction.customer}</p>
              </div>
            </div>

            {/* Date & Time */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Date & Time</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{formatDateTime(transaction.created_at)}</p>
                <p className="text-sm text-gray-600">by {transaction.created_by_name}</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <CreditCard className="h-4 w-4" />
                <span className="text-sm font-medium">Payment Method</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{transaction.payment_method}</p>
                <p className="text-sm text-gray-600">{transaction.payment_reference}</p>
              </div>
            </div>

            {/* Transaction Type */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">Transaction Type</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 capitalize">{transaction.transaction_type}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Transaction Amount</p>
                <p className={`text-xl font-bold ${getAmountColor(transaction.transaction_type)}`}>
                  {transaction.transaction_type === 'payment' || transaction.transaction_type === 'credit' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${transaction.balance_after >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <DollarSign className={`h-5 w-5 ${transaction.balance_after >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Balance After Transaction</p>
                <p className={`text-xl font-bold ${transaction.balance_after >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(transaction.balance_after))}
                </p>
                <p className="text-xs text-gray-500">
                  {transaction.balance_after >= 0 ? 'Credit Balance' : 'Outstanding Amount'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeBadge(transaction.transaction_type).split(' ')[0]}`}>
                {getTypeIcon(transaction.transaction_type)}
              </div>
              <div>
                <p className="text-sm text-gray-600">Transaction Type</p>
                <p className="text-xl font-bold text-gray-900 capitalize">{transaction.transaction_type}</p>
                <span className={`inline-flex px-2 py-1 text-xs leading-4 font-medium rounded-full border ${getTypeBadge(transaction.transaction_type || 'unknown')}`}>
                  {(transaction.transaction_type || 'Unknown').charAt(0).toUpperCase() + (transaction.transaction_type || 'unknown').slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                <p className="text-gray-900 font-mono">{transaction.reference_number}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                <p className="text-gray-900">{transaction.created_by_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Description</label>
                <p className="text-gray-900">{transaction.description}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <p className="text-gray-900">{transaction.notes || 'No additional notes'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}