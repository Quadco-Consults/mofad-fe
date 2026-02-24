'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import apiClient from '@/lib/apiClient'
import {
  ArrowLeft,
  Save,
  Send,
  FileText,
  User,
  Building2,
  CreditCard,
  DollarSign,
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface PaymentVoucherFormData {
  memo: number | null
  payee_name: string
  payee_bank_name: string
  payee_account_number: string
  payee_account_name: string
  payment_method: 'bank_transfer' | 'cheque' | 'cash' | 'mobile_money'
  amount: string
  description: string
  notes: string
}

const formatCurrency = (amount: number | string) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) || 0 : amount
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(numAmount)
}

export default function CreatePaymentVoucherPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<PaymentVoucherFormData>({
    memo: null,
    payee_name: '',
    payee_bank_name: '',
    payee_account_number: '',
    payee_account_name: '',
    payment_method: 'bank_transfer',
    amount: '',
    description: '',
    notes: '',
  })

  // Fetch approved memos (procurement memos)
  const { data: memosData } = useQuery({
    queryKey: ['memos', 'approved', 'procurement'],
    queryFn: async () => {
      const response = await apiClient.get('/memos/?status=approved&category=procurement')
      return response
    },
  })

  const memos = memosData?.results || memosData || []

  // Auto-fill payee information when memo is selected
  const handleMemoChange = (memoId: string) => {
    const selectedMemo = memos.find((m: any) => m.id === parseInt(memoId))
    if (selectedMemo && selectedMemo.supplier_name) {
      setFormData(prev => ({
        ...prev,
        memo: parseInt(memoId),
        payee_name: selectedMemo.supplier_name || '',
        payee_bank_name: selectedMemo.supplier_bank_name || '',
        payee_account_number: selectedMemo.supplier_bank_account || '',
        payee_account_name: selectedMemo.supplier_account_name || selectedMemo.supplier_name || '',
        amount: selectedMemo.total_estimated_cost ? selectedMemo.total_estimated_cost.toString() : '',
        description: `Payment for ${selectedMemo.subject || selectedMemo.memo_number}`,
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        memo: parseInt(memoId),
      }))
    }
  }

  // Create payment voucher mutation
  const createVoucherMutation = useMutation({
    mutationFn: async (data: PaymentVoucherFormData) => {
      const payload: any = {
        ...data,
        amount: parseFloat(data.amount),
      }
      // Remove memo if it's null
      if (payload.memo === null) {
        delete payload.memo
      }
      return await apiClient.createPaymentVoucher(payload)
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['payment-vouchers'] })
      toast.success('Payment voucher created successfully!')

      const voucherId = response?.id || response?.data?.id
      if (voucherId) {
        router.push(`/admin/payment-vouchers/${voucherId}`)
      } else {
        router.push('/admin/payment-vouchers')
      }
    },
    onError: (error: any) => {
      console.error('Error creating payment voucher:', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to create payment voucher')
    },
  })

  // Submit as draft
  const handleSaveDraft = () => {
    if (!formData.memo || !formData.payee_name || !formData.amount || !formData.description) {
      toast.error('Please fill in all required fields')
      return
    }
    createVoucherMutation.mutate(formData)
  }

  // Submit for review
  const handleSubmitForReview = async () => {
    if (!formData.memo || !formData.payee_name || !formData.amount || !formData.description) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const payload: any = {
        ...formData,
        amount: parseFloat(formData.amount),
      }
      // Remove memo if it's null
      if (payload.memo === null) {
        delete payload.memo
      }

      const response = await apiClient.createPaymentVoucher(payload)

      const voucherId = response?.id || response?.data?.id

      if (voucherId) {
        // Submit for review
        await apiClient.submitPaymentVoucher(voucherId)
        queryClient.invalidateQueries({ queryKey: ['payment-vouchers'] })
        toast.success('Payment voucher created and submitted for review!')
        router.push(`/admin/payment-vouchers/${voucherId}`)
      }
    } catch (error: any) {
      console.error('Error creating/submitting payment voucher:', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to create payment voucher')
    }
  }

  const handleInputChange = (field: keyof PaymentVoucherFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const selectedMemo = memos.find((m: any) => m.id === formData.memo)

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create Payment Voucher</h1>
            <p className="text-muted-foreground mt-1">Create a new payment voucher for supplier payment</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Voucher Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Memo Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Related Memo *
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                value={formData.memo || ''}
                onChange={(e) => handleMemoChange(e.target.value)}
                required
              >
                <option value="">Select a memo...</option>
                {memos.map((memo: any) => (
                  <option key={memo.id} value={memo.id}>
                    {memo.memo_number} - {memo.title} ({formatCurrency(memo.total_estimated_cost)})
                  </option>
                ))}
              </select>
              {selectedMemo && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm">
                    <strong>Supplier:</strong> {selectedMemo.supplier_name}
                  </p>
                  <p className="text-sm">
                    <strong>Total Cost:</strong> {formatCurrency(selectedMemo.total_estimated_cost)}
                  </p>
                </div>
              )}
            </div>

            {/* Payee Information */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Payee Name *
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                placeholder="Enter payee name"
                value={formData.payee_name}
                onChange={(e) => handleInputChange('payee_name', e.target.value)}
                required
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <CreditCard className="w-4 h-4 inline mr-2" />
                Payment Method *
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                value={formData.payment_method}
                onChange={(e) => handleInputChange('payment_method', e.target.value)}
                required
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="cash">Cash</option>
                <option value="mobile_money">Mobile Money</option>
              </select>
            </div>

            {/* Bank Details (conditional on payment method) */}
            {(formData.payment_method === 'bank_transfer' || formData.payment_method === 'mobile_money') && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Building2 className="w-4 h-4 inline mr-2" />
                    Bank Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter bank name"
                    value={formData.payee_bank_name}
                    onChange={(e) => handleInputChange('payee_bank_name', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Account Number</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      placeholder="Enter account number"
                      value={formData.payee_account_number}
                      onChange={(e) => handleInputChange('payee_account_number', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Account Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      placeholder="Enter account name"
                      value={formData.payee_account_name}
                      onChange={(e) => handleInputChange('payee_account_name', e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <DollarSign className="w-4 h-4 inline mr-2" />
                Amount (₦) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                required
              />
              {formData.amount && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Amount in words: {formatCurrency(parseFloat(formData.amount))}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Description *
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Enter payment description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Notes (Optional)
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                rows={2}
                placeholder="Additional notes..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={createVoucherMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {createVoucherMutation.isPending ? 'Saving...' : 'Save as Draft'}
              </Button>
              <Button onClick={handleSubmitForReview}>
                <Send className="w-4 h-4 mr-2" />
                Submit for Review
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
