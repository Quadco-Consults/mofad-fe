'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { formatCurrency, formatDateTime, getStatusColor } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import {
  FileText,
  ShoppingCart,
  Building2,
  Car,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'

const getEntityIcon = (entityType: string) => {
  switch (entityType.toUpperCase()) {
    case 'PRF':
      return FileText
    case 'PRO':
      return ShoppingCart
    case 'SST':
      return Building2
    case 'LST':
      return Car
    case 'CUSTOMER_TRANSACTION':
    case 'ACCOUNT_TRANSACTION':
      return DollarSign
    default:
      return Clock
  }
}

const getEntityLabel = (entityType: string) => {
  switch (entityType.toUpperCase()) {
    case 'PRF':
      return 'Purchase Requisition'
    case 'PRO':
      return 'Purchase Order'
    case 'SST':
      return 'Substore Transaction'
    case 'LST':
      return 'Lubebay Service'
    case 'CUSTOMER_TRANSACTION':
      return 'Customer Payment'
    case 'ACCOUNT_TRANSACTION':
      return 'Account Transaction'
    default:
      return entityType
  }
}

export function PendingApprovals() {
  const { data: approvals, isLoading, refetch } = useQuery({
    queryKey: ['pending-approvals'],
    queryFn: () => api.getPendingApprovals({ limit: 10 }),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const handleApprove = async (approvalId: number, level: number) => {
    try {
      await api.approveItem(approvalId, level)
      refetch()
    } catch (error) {
      console.error('Failed to approve item:', error)
    }
  }

  const handleReject = async (approvalId: number) => {
    const reason = prompt('Please provide a reason for rejection:')
    if (!reason) return

    try {
      await api.rejectItem(approvalId, reason)
      refetch()
    } catch (error) {
      console.error('Failed to reject item:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg animate-pulse">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="space-x-2">
              <div className="h-8 w-16 bg-gray-200 rounded inline-block"></div>
              <div className="h-8 w-16 bg-gray-200 rounded inline-block"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const pendingApprovals = approvals?.data || []

  if (pendingApprovals.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <p className="text-gray-500">No pending approvals</p>
        <p className="text-sm text-gray-400 mt-1">All items have been processed</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {pendingApprovals.map((approval: any) => {
        const Icon = getEntityIcon(approval.entity_type)
        const entityLabel = getEntityLabel(approval.entity_type)

        return (
          <div
            key={approval.id}
            className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {/* Entity Icon */}
            <div className="p-2 bg-yellow-100 rounded-full">
              <Icon className="h-5 w-5 text-yellow-600" />
            </div>

            {/* Approval Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-gray-900">
                  {approval.approval_number || approval.entity_reference}
                </p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  getStatusColor('PENDING')
                }`}>
                  Level {approval.current_level + 1} Approval
                </span>
              </div>

              <p className="text-sm text-gray-600 mt-1">
                {entityLabel} • {approval.entity_description || 'Awaiting approval'}
              </p>

              {approval.amount && (
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  Amount: {formatCurrency(approval.amount)}
                </p>
              )}

              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                <span>
                  Created: {formatDateTime(approval.created_at)}
                </span>
                {approval.submitted_by && (
                  <span>
                    By: {approval.submitted_by_name || approval.submitted_by}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReject(approval.id)}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button
                size="sm"
                onClick={() => handleApprove(approval.id, approval.current_level + 1)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
            </div>
          </div>
        )
      })}

      {/* View All Link */}
      <div className="pt-4 border-t border-gray-200">
        <button className="w-full text-center text-sm text-primary-600 hover:text-primary-800 font-medium">
          View all pending approvals
        </button>
      </div>
    </div>
  )
}