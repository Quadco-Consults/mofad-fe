'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Package,
  Calendar,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from 'lucide-react'

interface BinCardTransaction {
  id: number
  transaction_number: string
  transaction_type: string
  quantity: number
  stock_balance: number
  cost_price: number | null
  sale_price: number | null
  reference_number: string | null
  created_at: string
}

const getTransactionIcon = (type: string) => {
  switch (type) {
    case 'CREDIT':
      return <ArrowDown className="w-4 h-4 text-green-500" />
    case 'DEBIT':
      return <ArrowUp className="w-4 h-4 text-red-500" />
    default:
      return <Package className="w-4 h-4 text-gray-500" />
  }
}

const getTransactionColor = (type: string) => {
  switch (type) {
    case 'CREDIT':
      return 'text-green-600 bg-green-50'
    case 'DEBIT':
      return 'text-red-600 bg-red-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export default function SubstoreBinCardPage() {
  const params = useParams()
  const router = useRouter()
  const substoreId = params?.id as string
  const productId = params?.productId as string

  const [dateFilter, setDateFilter] = useState({
    start_date: '',
    end_date: ''
  })

  // Fetch substore details
  const { data: substore } = useQuery({
    queryKey: ['substore', substoreId],
    queryFn: () => apiClient.getSubstoreById(substoreId),
    enabled: !!substoreId,
  })

  // Fetch bin card data
  const { data: binCardData, isLoading, error } = useQuery({
    queryKey: ['substore-bincard', substoreId, productId, dateFilter],
    queryFn: () => apiClient.getSubstoreBinCard(substoreId, productId, {
      start_date: dateFilter.start_date || undefined,
      end_date: dateFilter.end_date || undefined
    }),
    enabled: !!substoreId && !!productId,
  })

  if (error) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-red-500">Error loading bin card. Please try again.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push(`/inventory/substore/${substoreId}`)}
            >
              Back to Substore
            </Button>
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
            <p className="mt-2 text-gray-500">Loading bin card...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  const transactions = binCardData?.transactions || []

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push(`/inventory/substore/${substoreId}`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Inventory
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bin Card</h1>
              <p className="text-gray-600">
                {binCardData?.product_name} at {substore?.name || binCardData?.substore_name}
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Stock</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {binCardData?.current_quantity?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Receipts</p>
                  <p className="text-2xl font-bold text-green-600">
                    {binCardData?.total_receipts?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Issues</p>
                  <p className="text-2xl font-bold text-red-600">
                    {binCardData?.total_issues?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Transactions</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {binCardData?.transaction_count || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Date Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateFilter.start_date}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, start_date: e.target.value }))}
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateFilter.end_date}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, end_date: e.target.value }))}
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              {(dateFilter.start_date || dateFilter.end_date) && (
                <Button
                  variant="outline"
                  onClick={() => setDateFilter({ start_date: '', end_date: '' })}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {transactions.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-500">
                  {dateFilter.start_date || dateFilter.end_date
                    ? 'Try adjusting your date filters'
                    : 'No stock movements recorded for this product'
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Transaction #</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Quantity</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Balance</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Cost Price</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Sale Price</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transactions.map((txn: BinCardTransaction) => {
                      const isCredit = txn.transaction_type === 'CREDIT'

                      return (
                        <tr key={txn.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-900">
                              {formatDateTime(txn.created_at)}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm font-mono text-gray-700">
                              {txn.transaction_number || '-'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {getTransactionIcon(txn.transaction_type)}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTransactionColor(txn.transaction_type)}`}>
                                {txn.transaction_type === 'CREDIT' ? 'Stock In' : 'Stock Out'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className={`font-bold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                              {isCredit ? '+' : '-'}{txn.quantity?.toLocaleString() || 0}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-bold text-gray-900">
                              {txn.stock_balance?.toLocaleString() || 0}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {txn.cost_price ? formatCurrency(txn.cost_price) : '-'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {txn.sale_price ? formatCurrency(txn.sale_price) : '-'}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">
                              {txn.reference_number || '-'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
