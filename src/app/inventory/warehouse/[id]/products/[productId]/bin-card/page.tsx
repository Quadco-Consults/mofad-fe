'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'
import { Package, TrendingUp, TrendingDown, FileText, ArrowLeft, Filter, Calendar } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function BinCardPage() {
  const params = useParams()
  const warehouseId = params.id as string
  const productId = params.productId as string

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  // Fetch bin card data using the dedicated endpoint
  const { data: binCardData, isLoading, error, refetch } = useQuery({
    queryKey: ['bin-card', warehouseId, productId, startDate, endDate],
    queryFn: async () => {
      console.log('[BinCard] Fetching data for warehouse:', warehouseId, 'product:', productId)
      const params: any = {}
      if (startDate) params.start_date = startDate
      if (endDate) params.end_date = endDate

      const result = await apiClient.getProductBinCard(warehouseId, productId, params)
      console.log('[BinCard] Received data:', result)
      return result
    },
    enabled: !!warehouseId && !!productId,
  })

  // Filter transactions by type
  const filteredTransactions = binCardData?.transactions?.filter((txn: any) => {
    if (typeFilter === 'all') return true
    return txn.transaction_type === typeFilter
  }) || []

  const getTransactionTypeBadge = (type: string) => {
    const typeMap: Record<string, { color: string; label: string }> = {
      'receipt': { color: 'bg-green-100 text-green-800 border-green-200', label: 'Receipt' },
      'issue': { color: 'bg-red-100 text-red-800 border-red-200', label: 'Issue' },
      'transfer_in': { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Transfer In' },
      'transfer_out': { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Transfer Out' },
      'adjustment': { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Adjustment' },
      'loss': { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Loss' },
      'return': { color: 'bg-cyan-100 text-cyan-800 border-cyan-200', label: 'Return' },
    }

    const config = typeMap[type] || { color: 'bg-gray-100 text-gray-800 border-gray-200', label: type }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const getTransactionIcon = (type: string) => {
    if (type.includes('in') || type === 'receipt' || type === 'return') {
      return <TrendingUp className="w-4 h-4 text-green-600" />
    } else if (type.includes('out') || type === 'issue' || type === 'loss') {
      return <TrendingDown className="w-4 h-4 text-red-600" />
    }
    return <FileText className="w-4 h-4 text-gray-600" />
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading bin card...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h3 className="text-red-800 font-semibold mb-2">Error Loading Bin Card</h3>
            <p className="text-red-600 text-sm mb-4">{(error as any)?.message || 'Failed to load data'}</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/inventory/warehouse/${warehouseId}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Warehouse
          </Link>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Bin Card - Product Movement</h1>
                <p className="text-gray-600">Track all inventory transactions for this product in {binCardData?.warehouse_name || 'warehouse'}</p>
              </div>
              <Package className="w-12 h-12 text-blue-600" />
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Product</p>
                <p className="text-lg font-semibold text-gray-900">{binCardData?.product_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Warehouse</p>
                <p className="text-lg font-semibold text-gray-900">{binCardData?.warehouse_name || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Stock</p>
                <p className="text-2xl font-bold text-gray-900">{binCardData?.current_quantity || 0}</p>
                <p className="text-xs text-gray-500 mt-1">units</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Received</p>
                <p className="text-2xl font-bold text-green-600">{binCardData?.total_receipts || 0}</p>
                <p className="text-xs text-gray-500 mt-1">units</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Issued</p>
                <p className="text-2xl font-bold text-red-600">{binCardData?.total_issues || 0}</p>
                <p className="text-xs text-gray-500 mt-1">units</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{binCardData?.transaction_count || 0}</p>
                <p className="text-xs text-gray-500 mt-1">total</p>
              </div>
              <FileText className="w-8 h-8 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Transaction Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Transactions</option>
                <option value="receipt">Receipt</option>
                <option value="issue">Issue</option>
                <option value="transfer_in">Transfer In</option>
                <option value="transfer_out">Transfer Out</option>
                <option value="adjustment">Adjustment</option>
                <option value="loss">Loss/Damage</option>
                <option value="return">Return</option>
              </select>
            </div>

            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('')
                  setEndDate('')
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Clear Dates
              </button>
            )}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Received
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issued
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performed By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="font-medium">No transactions found</p>
                      <p className="text-sm mt-1">
                        {typeFilter !== 'all'
                          ? 'Try changing the filter or date range'
                          : 'Transactions will appear here once goods are received or issued'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((txn: any) => (
                    <tr key={txn.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(txn.transaction_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-mono">
                        {txn.reference_number || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(txn.transaction_type)}
                          {getTransactionTypeBadge(txn.transaction_type)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {txn.description || txn.reason || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <span className="text-green-600 font-medium">
                          {txn.quantity_in > 0 ? `+${txn.quantity_in}` : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <span className="text-red-600 font-medium">
                          {txn.quantity_out > 0 ? `-${txn.quantity_out}` : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                        {txn.balance_after || txn.quantity_after || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {txn.created_by_name || 'System'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-gray-100 rounded text-xs font-mono">
            <p><strong>Debug:</strong></p>
            <p>Warehouse ID: {warehouseId}</p>
            <p>Product ID: {productId}</p>
            <p>Transactions: {binCardData?.transactions?.length || 0}</p>
            <p>Filtered: {filteredTransactions.length}</p>
          </div>
        )}
      </div>
    </div>
  )
}
