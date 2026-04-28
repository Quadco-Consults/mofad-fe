'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import apiClient from '@/lib/apiClient'
import {
  PRFReversalRequest,
  canReversePRF,
  requiresManagerApproval,
  requiresGoodsReturn,
} from '@/types/reversals'
import { PRF } from '@/types/api'
import { RotateCcw, X, AlertTriangle, User, Loader2, CheckCircle } from 'lucide-react'

interface PRFReversalModalProps {
  prf: PRF
  isOpen: boolean
  onClose: () => void
}

export default function PRFReversalModal({ prf, isOpen, onClose }: PRFReversalModalProps) {
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const [reversalData, setReversalData] = useState<PRFReversalRequest>({
    reason: '',
    notes: '',
    authorized_by_id: undefined,
    force_admin_override: false,
  })

  const needsManagerApproval = requiresManagerApproval(prf.status)

  // Fetch users with manager/admin roles for authorization dropdown
  const { data: managers } = useQuery({
    queryKey: ['users', 'managers'],
    queryFn: async () => {
      const response = await apiClient.get('/users/')
      // Filter for users with admin or manager roles
      return response.filter((user: any) =>
        user.roles?.some((role: any) =>
          role.name === 'admin' || role.name === 'manager'
        )
      )
    },
    enabled: needsManagerApproval,
  })

  // Reversal mutation
  const reversalMutation = useMutation({
    mutationFn: async (data: PRFReversalRequest) => {
      return await apiClient.post(`/prfs/${prf.id}/reverse/`, data)
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['prf-detail', prf.id] })
      queryClient.invalidateQueries({ queryKey: ['prfs'] })

      addToast({
        type: 'success',
        title: 'PRF Reversed',
        message: data.message || 'PRF has been successfully reversed',
      })

      onClose()
      resetForm()
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Reversal Failed',
        message: error.message || 'Failed to reverse PRF',
      })
    },
  })

  const handleSubmit = () => {
    // Validation
    if (!reversalData.reason.trim()) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please provide a reason for reversal',
      })
      return
    }

    if (needsManagerApproval && !reversalData.authorized_by_id) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Manager authorization is required for fulfilled PRF reversal',
      })
      return
    }

    reversalMutation.mutate(reversalData)
  }

  const resetForm = () => {
    setReversalData({
      reason: '',
      notes: '',
      authorized_by_id: undefined,
      force_admin_override: false,
    })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Reverse PRF</h2>
              <p className="text-sm text-gray-600">PRF #{prf.prf_number}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warning Banner */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900 mb-1">Important Notice</h4>
                <p className="text-sm text-yellow-800">
                  Reversing this PRF will:
                </p>
                <ul className="text-sm text-yellow-800 list-disc list-inside mt-2 space-y-1">
                  <li>Cancel the PRF and change its status to "Cancelled"</li>
                  <li>Process refunds for any payments made</li>
                  {requiresGoodsReturn(prf.status, prf.goods_issued) && (
                    <li className="font-semibold">Require physical return of goods to warehouse</li>
                  )}
                  {needsManagerApproval && (
                    <li className="font-semibold">Require manager authorization approval</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* PRF Info */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">PRF Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Status:</span>
                <span className="ml-2 font-medium text-gray-900">{prf.status}</span>
              </div>
              <div>
                <span className="text-gray-600">Total:</span>
                <span className="ml-2 font-medium text-gray-900">₦{Number(prf.estimated_total).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">Customer:</span>
                <span className="ml-2 font-medium text-gray-900">{(prf as any).customer_name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600">Goods Issued:</span>
                <span className="ml-2 font-medium text-gray-900">{prf.goods_issued ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          {/* Reversal Form */}
          <div className="space-y-4">
            {/* Reason */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reason for Reversal <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={3}
                value={reversalData.reason}
                onChange={(e) => setReversalData({ ...reversalData, reason: e.target.value })}
                placeholder="Provide a detailed reason for reversing this PRF..."
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be recorded in the audit trail
              </p>
            </div>

            {/* Manager Authorization (if needed) */}
            {needsManagerApproval && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Authorizing Manager ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    value={reversalData.authorized_by_id || ''}
                    onChange={(e) => setReversalData({
                      ...reversalData,
                      authorized_by_id: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                    placeholder="Enter manager user ID"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Manager approval is required because goods have been fulfilled
                </p>
              </div>
            )}

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={2}
                value={reversalData.notes}
                onChange={(e) => setReversalData({ ...reversalData, notes: e.target.value })}
                placeholder="Any additional information about this reversal..."
              />
            </div>
          </div>

          {/* Goods Return Notice */}
          {requiresGoodsReturn(prf.status, prf.goods_issued) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Next Step: Goods Return</h4>
                  <p className="text-sm text-blue-800">
                    After reversing this PRF, you will need to physically collect the goods back
                    to the warehouse and mark them as returned in the system.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 sticky bottom-0 bg-white">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={reversalMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={reversalMutation.isPending || !reversalData.reason.trim()}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {reversalMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Reversing PRF...
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reverse PRF
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
