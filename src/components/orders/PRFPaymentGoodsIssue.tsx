'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import {
  CreditCard,
  CheckCircle,
  Loader2,
  X,
  DollarSign,
  Calendar,
  Package,
  Truck,
  AlertCircle,
  Ban,
  Clock,
} from 'lucide-react'

interface PRF {
  id: number
  prf_number: string
  status: string
  estimated_total: number
  payment_confirmed: boolean
  payment_confirmed_by_name?: string
  payment_confirmed_at?: string
  payment_confirmation_notes?: string
  goods_issued: boolean
  goods_issued_by_name?: string
  goods_issued_at?: string
  goods_issue_notes?: string
  total_lodged?: number
  outstanding_balance?: number
  payment_status?: {
    confirmed: boolean
    total_required: number
    total_paid: number
    outstanding: number
    percentage_paid: number
  }
  issue_status?: {
    issued: boolean
    ready: boolean
    can_issue: boolean
  }
  lodgements?: Array<{
    id: number
    lodgement_number: string
    amount_lodged: number
    lodgement_date: string
    approval_status: string
    payment_method: string
  }>
}

interface PRFPaymentGoodsIssueProps {
  prf: PRF
}

export default function PRFPaymentGoodsIssue({ prf }: PRFPaymentGoodsIssueProps) {
  const { addToast } = useToast()
  const queryClient = useQueryClient()
  const [showConfirmPayment, setShowConfirmPayment] = useState(false)
  const [showIssueGoods, setShowIssueGoods] = useState(false)
  const [paymentNotes, setPaymentNotes] = useState('')
  const [issueNotes, setIssueNotes] = useState('')

  // Confirm payment mutation
  const confirmPaymentMutation = useMutation({
    mutationFn: (data: { notes: string }) =>
      apiClient.post(`/prfs/${prf.id}/confirm-payment/`, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['prf-detail', prf.id] })
      queryClient.invalidateQueries({ queryKey: ['prfs'] })

      addToast({
        title: 'Payment Confirmed',
        message: response.data.message || 'Payment has been confirmed successfully',
        type: 'success',
      })

      setShowConfirmPayment(false)
      setPaymentNotes('')
    },
    onError: (error: any) => {
      addToast({
        title: 'Payment Confirmation Failed',
        message: error.response?.data?.error || error.message || 'Failed to confirm payment',
        type: 'error',
      })
    },
  })

  // Issue goods mutation
  const issueGoodsMutation = useMutation({
    mutationFn: (data: { notes: string }) =>
      apiClient.post(`/prfs/${prf.id}/issue-goods/`, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['prf-detail', prf.id] })
      queryClient.invalidateQueries({ queryKey: ['prfs'] })

      addToast({
        title: 'Goods Issued',
        message: response.data.message || 'Goods have been issued successfully',
        type: 'success',
      })

      setShowIssueGoods(false)
      setIssueNotes('')
    },
    onError: (error: any) => {
      addToast({
        title: 'Goods Issue Failed',
        message: error.response?.data?.error || error.message || 'Failed to issue goods',
        type: 'error',
      })
    },
  })

  const handleConfirmPayment = () => {
    if (!paymentNotes.trim()) {
      addToast({
        title: 'Notes Required',
        message: 'Please add notes about the payment confirmation',
        type: 'error',
      })
      return
    }

    confirmPaymentMutation.mutate({ notes: paymentNotes })
  }

  const handleIssueGoods = () => {
    if (!issueNotes.trim()) {
      addToast({
        title: 'Notes Required',
        message: 'Please add notes about the goods issue',
        type: 'error',
      })
      return
    }

    issueGoodsMutation.mutate({ notes: issueNotes })
  }

  // Calculate payment details
  const paymentStatus = prf.payment_status || {
    confirmed: prf.payment_confirmed,
    total_required: prf.estimated_total,
    total_paid: prf.total_lodged || 0,
    outstanding: prf.outstanding_balance || prf.estimated_total,
    percentage_paid: ((prf.total_lodged || 0) / prf.estimated_total) * 100,
  }

  const issueStatus = prf.issue_status || {
    issued: prf.goods_issued,
    ready: prf.status === 'ready_for_issue',
    can_issue: prf.status === 'ready_for_issue' && prf.payment_confirmed,
  }

  return (
    <div className="space-y-6">
      {/* Payment Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Status
            </CardTitle>
            {prf.payment_confirmed ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Payment Confirmed</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Payment Pending</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Payment Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(paymentStatus.total_required)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Amount Paid</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(paymentStatus.total_paid)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Outstanding</p>
              <p className="text-lg font-bold text-red-600">
                {formatCurrency(paymentStatus.outstanding)}
              </p>
            </div>
          </div>

          {/* Payment Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Payment Progress</span>
              <span className="font-medium">{paymentStatus.percentage_paid.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  paymentStatus.percentage_paid >= 100
                    ? 'bg-green-600'
                    : paymentStatus.percentage_paid >= 50
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(paymentStatus.percentage_paid, 100)}%` }}
              />
            </div>
          </div>

          {/* Lodgements List */}
          {prf.lodgements && prf.lodgements.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Payment History</h4>
              <div className="space-y-2">
                {prf.lodgements.map((lodgement) => (
                  <div
                    key={lodgement.id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="font-medium text-sm">{lodgement.lodgement_number}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(lodgement.lodgement_date).toLocaleDateString()} •{' '}
                          {lodgement.payment_method.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {formatCurrency(lodgement.amount_lodged)}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {lodgement.approval_status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Confirmation Status */}
          {prf.payment_confirmed && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">Payment Confirmed</p>
                  <p className="text-sm text-green-700 mt-1">
                    Confirmed by {prf.payment_confirmed_by_name} on{' '}
                    {prf.payment_confirmed_at &&
                      formatDateTime(prf.payment_confirmed_at)}
                  </p>
                  {prf.payment_confirmation_notes && (
                    <p className="text-sm text-green-600 mt-2 italic">
                      "{prf.payment_confirmation_notes}"
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Confirm Payment Action */}
          {!prf.payment_confirmed &&
            prf.status === 'approved' &&
            paymentStatus.percentage_paid >= 100 && (
              <div className="mt-6">
                {!showConfirmPayment ? (
                  <Button
                    onClick={() => setShowConfirmPayment(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Payment Received
                  </Button>
                ) : (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Confirm Payment</h4>
                      <button
                        onClick={() => setShowConfirmPayment(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirmation Notes <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={paymentNotes}
                          onChange={(e) => setPaymentNotes(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Add notes about payment confirmation (e.g., payment method, transaction reference, etc.)"
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={handleConfirmPayment}
                          disabled={confirmPaymentMutation.isPending}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          {confirmPaymentMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Confirming...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Confirm Payment
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => setShowConfirmPayment(false)}
                          variant="outline"
                          disabled={confirmPaymentMutation.isPending}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          {/* Insufficient Payment Warning */}
          {!prf.payment_confirmed &&
            prf.status === 'approved' &&
            paymentStatus.percentage_paid < 100 && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-900">Payment Incomplete</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Outstanding balance: {formatCurrency(paymentStatus.outstanding)}. Payment
                      must be confirmed before goods can be issued.
                    </p>
                  </div>
                </div>
              </div>
            )}
        </CardContent>
      </Card>

      {/* Goods Issue Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Goods Issue Status
            </CardTitle>
            {prf.goods_issued ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Goods Issued</span>
              </div>
            ) : issueStatus.ready ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                <Truck className="w-4 h-4" />
                <span className="text-sm font-medium">Ready for Issue</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-800 rounded-full">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Not Ready</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Goods Issued Status */}
          {prf.goods_issued && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">Goods Issued from Warehouse</p>
                  <p className="text-sm text-green-700 mt-1">
                    Issued by {prf.goods_issued_by_name} on{' '}
                    {prf.goods_issued_at && formatDateTime(prf.goods_issued_at)}
                  </p>
                  {prf.goods_issue_notes && (
                    <p className="text-sm text-green-600 mt-2 italic">
                      "{prf.goods_issue_notes}"
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Ready for Issue */}
          {!prf.goods_issued && issueStatus.ready && (
            <>
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Ready for Goods Issue</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Payment confirmed. Storekeeper can now issue goods from warehouse.
                    </p>
                  </div>
                </div>
              </div>

              {/* Issue Goods Action */}
              {!showIssueGoods ? (
                <Button
                  onClick={() => setShowIssueGoods(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Issue Goods from Warehouse
                </Button>
              ) : (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Issue Goods</h4>
                    <button
                      onClick={() => setShowIssueGoods(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mb-4 p-3 bg-white border border-orange-300 rounded-md">
                    <p className="text-sm text-gray-700">
                      <strong>Important:</strong> This action will:
                    </p>
                    <ul className="mt-2 ml-5 text-sm text-gray-600 list-disc space-y-1">
                      <li>Deduct items from warehouse inventory</li>
                      <li>Create stock transactions</li>
                      <li>Update customer account balance</li>
                      <li>Mark PRF as goods issued</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Issue Notes <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={issueNotes}
                        onChange={(e) => setIssueNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Add notes about goods issue (e.g., condition of goods, delivery details, etc.)"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={handleIssueGoods}
                        disabled={issueGoodsMutation.isPending}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        {issueGoodsMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Issuing Goods...
                          </>
                        ) : (
                          <>
                            <Package className="w-4 h-4 mr-2" />
                            Issue Goods
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => setShowIssueGoods(false)}
                        variant="outline"
                        disabled={issueGoodsMutation.isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Not Ready */}
          {!prf.goods_issued && !issueStatus.ready && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Ban className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Not Ready for Goods Issue</p>
                  <p className="text-sm text-gray-700 mt-1">
                    {!prf.payment_confirmed
                      ? 'Payment must be confirmed before goods can be issued.'
                      : 'PRF must be approved and payment confirmed.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
