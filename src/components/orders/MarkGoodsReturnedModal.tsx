'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import apiClient from '@/lib/apiClient'
import { GoodsReturnRequest } from '@/types/reversals'
import { PRF } from '@/types/api'
import { Package, X, Loader2, CheckCircle, Calendar } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

interface MarkGoodsReturnedModalProps {
  prf: PRF
  isOpen: boolean
  onClose: () => void
}

export default function MarkGoodsReturnedModal({ prf, isOpen, onClose }: MarkGoodsReturnedModalProps) {
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const [notes, setNotes] = useState('')

  // Mark goods returned mutation
  const markReturnedMutation = useMutation({
    mutationFn: async (data: GoodsReturnRequest) => {
      return await apiClient.post(`/prfs/${prf.id}/mark_goods_returned/`, data)
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['prf-detail', prf.id] })
      queryClient.invalidateQueries({ queryKey: ['prfs'] })

      addToast({
        type: 'success',
        title: 'Goods Returned',
        message: 'Goods have been marked as returned successfully',
      })

      onClose()
      setNotes('')
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Operation Failed',
        message: error.message || 'Failed to mark goods as returned',
      })
    },
  })

  const handleSubmit = () => {
    markReturnedMutation.mutate({ notes })
  }

  const handleClose = () => {
    setNotes('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-lg w-full m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Mark Goods as Returned</h2>
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
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Confirm Goods Return</h4>
                <p className="text-sm text-blue-800">
                  This action confirms that the goods have been physically returned to the warehouse
                  and inventory adjustments have been completed.
                </p>
              </div>
            </div>
          </div>

          {/* PRF Info */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Reversal Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Reversed At:</span>
                <span className="font-medium text-gray-900">
                  {(prf as any).reversed_at ? formatDateTime((prf as any).reversed_at) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reversed By:</span>
                <span className="font-medium text-gray-900">
                  {(prf as any).reversed_by_name || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reversal Reason:</span>
                <span className="font-medium text-gray-900 text-right ml-4">
                  {(prf as any).reversal_reason || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Return Notes (Optional)
            </label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about the goods return (condition, discrepancies, etc.)..."
            />
            <p className="text-xs text-gray-500 mt-1">
              These notes will be recorded in the audit trail
            </p>
          </div>

          {/* Current Date/Time Info */}
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <Calendar className="w-4 h-4" />
            <span>Goods return date will be recorded as: <span className="font-semibold text-gray-900">{formatDateTime(new Date().toISOString())}</span></span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={markReturnedMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={markReturnedMutation.isPending}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {markReturnedMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Marking as Returned...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm Goods Returned
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
