'use client'

import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatDateTime, getStatusColor } from '@/lib/utils'
import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react'

export function RecentTransactions() {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => apiClient.getRecentTransactions(),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-3 animate-pulse">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    )
  }

  const recentTransactions = transactions || []

  if (recentTransactions.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No recent transactions found</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {recentTransactions.map((transaction: any, index: number) => {
        const isIncoming = transaction.type === 'CREDIT' || transaction.type === 'PAYMENT'

        return (
          <div
            key={transaction.id || index}
            className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            {/* Transaction Icon */}
            <div className={`p-2 rounded-full ${
              isIncoming ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {isIncoming ? (
                <ArrowDownRight className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowUpRight className="h-4 w-4 text-red-600" />
              )}
            </div>

            {/* Transaction Details */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {transaction.description || transaction.reference || 'Transaction'}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-xs text-gray-500">
                  {transaction.customer_name || transaction.entity_name || 'Unknown'}
                </p>
                <span className="text-xs text-gray-400">•</span>
                <p className="text-xs text-gray-500">
                  {formatDateTime(transaction.created_at)}
                </p>
              </div>
            </div>

            {/* Amount and Status */}
            <div className="text-right">
              <p className={`text-sm font-semibold ${
                isIncoming ? 'text-green-600' : 'text-red-600'
              }`}>
                {isIncoming ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
              </p>
              {transaction.status && (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  getStatusColor(transaction.status)
                }`}>
                  {transaction.status.replace('_', ' ')}
                </span>
              )}
            </div>
          </div>
        )
      })}

      {/* View All Link */}
      <div className="pt-4 border-t border-gray-200">
        <button className="w-full text-center text-sm text-primary-600 hover:text-primary-800 font-medium">
          View all transactions
        </button>
      </div>
    </div>
  )
}