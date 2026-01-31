'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import {
  CreditCard,
  Plus,
  Loader2,
  X,
  DollarSign,
  Calendar,
  FileText,
  CheckCircle
} from 'lucide-react'

interface PROPaymentSectionProps {
  proId: number | string
  proNumber: string
  supplierName: string
  totalAmount: number
  paidAmount: number
}

export function PROPaymentSection({
  proId,
  proNumber,
  supplierName,
  totalAmount,
  paidAmount
}: PROPaymentSectionProps) {
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'bank_transfer',
    description: `Payment for ${proNumber}`,
    notes: '',
    transaction_reference: '',
    bank_account: '',
    cheque_number: '',
    status: 'cleared'
  })

  const { addToast } = useToast()
  const queryClient = useQueryClient()

  // Fetch payments for this PRO
  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['pro-payments', proId],
    queryFn: () => apiClient.getProPayments(proId)
  })

  const payments = paymentsData?.payments || []
  const pendingAmount = paymentsData?.pending_amount || (totalAmount - paidAmount)

  // Record payment mutation
  const recordPaymentMutation = useMutation({
    mutationFn: (data: any) => apiClient.recordProPayment(proId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['pro-payments', proId] })
      queryClient.invalidateQueries({ queryKey: ['pro', proId] })
      queryClient.invalidateQueries({ queryKey: ['pros'] })

      addToast({
        title: 'Payment Recorded',
        description: response.message || 'Payment has been recorded successfully',
        type: 'success'
      })

      setShowPaymentForm(false)
      setFormData({
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'bank_transfer',
        description: `Payment for ${proNumber}`,
        notes: '',
        transaction_reference: '',
        bank_account: '',
        cheque_number: '',
        status: 'cleared'
      })
    },
    onError: (error: any) => {
      addToast({
        title: 'Payment Recording Failed',
        description: error.message || 'Failed to record payment',
        type: 'error'
      })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      addToast({
        title: 'Invalid Amount',
        description: 'Please enter a valid payment amount',
        type: 'error'
      })
      return
    }

    recordPaymentMutation.mutate(formData)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment History
          </CardTitle>
          {pendingAmount > 0 && !showPaymentForm && (
            <Button
              onClick={() => setShowPaymentForm(true)}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Record Payment
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Payment Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Paid Amount</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(paidAmount)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Pending Amount</p>
            <p className="text-lg font-bold text-red-600">{formatCurrency(pendingAmount)}</p>
          </div>
        </div>

        {/* Payment Form */}
        {showPaymentForm && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Record New Payment</h4>
              <button
                onClick={() => setShowPaymentForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter amount"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Pending: {formatCurrency(pendingAmount)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                    <option value="card">Card Payment</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction Reference
                  </label>
                  <input
                    type="text"
                    value={formData.transaction_reference}
                    onChange={(e) => setFormData({ ...formData, transaction_reference: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="TRF-123456"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Payment description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Additional notes"
                  rows={2}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={recordPaymentMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {recordPaymentMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Recording...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Record Payment
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPaymentForm(false)}
                  disabled={recordPaymentMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Payment History Table */}
        {paymentsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
            <span className="ml-2 text-gray-600">Loading payments...</span>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <CreditCard className="w-12 h-12 mx-auto text-gray-400" />
            <p className="mt-4 text-gray-600">No payments recorded</p>
            <p className="text-sm text-gray-500 mt-2">
              Record the first payment to track payment progress
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Payment Number</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Method</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Reference</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-blue-600">
                      {payment.payment_number}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-green-600 text-right">
                      {formatCurrency(parseFloat(payment.amount) || 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 capitalize">
                      {payment.payment_method?.replace('_', ' ') || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {payment.transaction_reference || payment.reference_number || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {payment.description || 'No description'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        payment.status === 'cleared' ? 'bg-green-100 text-green-800' :
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        payment.status === 'bounced' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1) || 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
