'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import apiClient from '@/lib/apiClient'
import { PaymentVoucher } from '@/types'
import {
  ArrowLeft,
  FileText,
  User,
  Calendar,
  DollarSign,
  CreditCard,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Receipt,
  Ban,
  AlertCircle,
  Download,
  Printer,
} from 'lucide-react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  finance_review: 'bg-blue-100 text-blue-800',
  cfo_approval: 'bg-purple-100 text-purple-800',
  md_approval: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  paid: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

const statusLabels = {
  draft: 'Draft',
  finance_review: 'Finance Review',
  cfo_approval: 'CFO Approval',
  md_approval: 'MD Approval',
  approved: 'Approved',
  paid: 'Paid',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
}

const paymentMethodLabels = {
  bank_transfer: 'Bank Transfer',
  cheque: 'Cheque',
  cash: 'Cash',
  mobile_money: 'Mobile Money',
}

const formatCurrency = (amount: string | number) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(numAmount)
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function PaymentVoucherDetailPage() {
  const router = useRouter()
  const params = useParams()
  const voucherId = params?.id as string
  const queryClient = useQueryClient()

  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showConfirmPaymentModal, setShowConfirmPaymentModal] = useState(false)
  const [comments, setComments] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [paymentReference, setPaymentReference] = useState('')
  const [paymentDate, setPaymentDate] = useState('')
  const [paymentNotes, setPaymentNotes] = useState('')
  const [activeTab, setActiveTab] = useState<'details' | 'pdf'>('details')

  // Fetch voucher details
  const { data: voucher, isLoading } = useQuery<PaymentVoucher>({
    queryKey: ['payment-voucher', voucherId],
    queryFn: () => apiClient.getPaymentVoucherById(voucherId),
    enabled: !!voucherId,
  })

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: () => apiClient.submitPaymentVoucher(voucherId),
    onSuccess: () => {
      alert('Payment voucher submitted for review')
      queryClient.invalidateQueries({ queryKey: ['payment-voucher', voucherId] })
    },
    onError: (error: any) => {
      alert(`Error: ${error.message || 'Failed to submit voucher'}`)
    },
  })

  // Finance review mutation
  const financeReviewMutation = useMutation({
    mutationFn: () => apiClient.financeReviewPaymentVoucher(voucherId, comments),
    onSuccess: () => {
      alert('Voucher reviewed and forwarded to CFO')
      setComments('')
      queryClient.invalidateQueries({ queryKey: ['payment-voucher', voucherId] })
    },
    onError: (error: any) => {
      alert(`Error: ${error.message || 'Failed to review voucher'}`)
    },
  })

  // CFO approval mutation
  const cfoApproveMutation = useMutation({
    mutationFn: () => apiClient.cfoApprovePaymentVoucher(voucherId, comments),
    onSuccess: () => {
      alert('Voucher approved by CFO and forwarded to MD')
      setComments('')
      queryClient.invalidateQueries({ queryKey: ['payment-voucher', voucherId] })
    },
    onError: (error: any) => {
      alert(`Error: ${error.message || 'Failed to approve voucher'}`)
    },
  })

  // MD approval mutation
  const mdApproveMutation = useMutation({
    mutationFn: () => apiClient.mdApprovePaymentVoucher(voucherId, comments),
    onSuccess: () => {
      alert('Voucher approved by MD')
      setComments('')
      queryClient.invalidateQueries({ queryKey: ['payment-voucher', voucherId] })
    },
    onError: (error: any) => {
      alert(`Error: ${error.message || 'Failed to approve voucher'}`)
    },
  })

  // Confirm payment mutation
  const confirmPaymentMutation = useMutation({
    mutationFn: () =>
      apiClient.confirmPaymentVoucher(voucherId, {
        payment_reference: paymentReference,
        payment_date: paymentDate,
        notes: paymentNotes,
      }),
    onSuccess: () => {
      alert('Payment confirmed successfully')
      setShowConfirmPaymentModal(false)
      setPaymentReference('')
      setPaymentDate('')
      setPaymentNotes('')
      queryClient.invalidateQueries({ queryKey: ['payment-voucher', voucherId] })
    },
    onError: (error: any) => {
      alert(`Error: ${error.message || 'Failed to confirm payment'}`)
    },
  })

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: () => apiClient.rejectPaymentVoucher(voucherId, rejectReason),
    onSuccess: () => {
      alert('Voucher rejected')
      setShowRejectModal(false)
      setRejectReason('')
      queryClient.invalidateQueries({ queryKey: ['payment-voucher', voucherId] })
    },
    onError: (error: any) => {
      alert(`Error: ${error.message || 'Failed to reject voucher'}`)
    },
  })

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: () => apiClient.cancelPaymentVoucher(voucherId),
    onSuccess: () => {
      alert('Voucher cancelled')
      queryClient.invalidateQueries({ queryKey: ['payment-voucher', voucherId] })
    },
    onError: (error: any) => {
      alert(`Error: ${error.message || 'Failed to cancel voucher'}`)
    },
  })

  const handlePrint = () => {
    // Make sure we're on the PDF tab
    if (activeTab !== 'pdf') {
      setActiveTab('pdf')
      // Wait a bit for the tab to render
      setTimeout(() => {
        window.print()
      }, 100)
    } else {
      window.print()
    }
  }

  const handleDownloadPDF = async () => {
    try {
      // Call the backend API to generate PDF
      const response = await fetch(`${API_BASE_URL}/payment-vouchers/${voucherId}/generate-pdf/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to generate PDF')
      }

      // Get the PDF blob
      const blob = await response.blob()

      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `MOFAD_${voucher?.voucher_number || 'Payment_Voucher'}.pdf`
      document.body.appendChild(a)
      a.click()

      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    )
  }

  if (!voucher) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Voucher Not Found</h2>
          <Button onClick={() => router.push('/admin/payment-vouchers')} className="mt-4">
            Back to Vouchers
          </Button>
        </div>
      </AppLayout>
    )
  }

  const approvalProgress = voucher.approval_progress || 0

  return (
    <AppLayout>
      <style jsx global>{`
        @media print {
          /* Hide everything by default */
          body * {
            visibility: hidden !important;
          }

          /* Hide specific layout elements */
          nav,
          aside,
          header,
          footer,
          [role="navigation"],
          [role="banner"],
          .sidebar,
          .header,
          .navigation,
          .no-print {
            display: none !important;
            visibility: hidden !important;
          }

          /* Show only the voucher print content */
          #voucher-print-content,
          #voucher-print-content * {
            visibility: visible !important;
          }

          #voucher-print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }

          /* Ensure print area fills the page */
          body {
            margin: 0;
            padding: 0;
          }

          /* Page break settings */
          @page {
            size: A4;
            margin: 0.5in;
          }
        }
      `}</style>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between no-print">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{voucher.voucher_number}</h1>
              <p className="text-muted-foreground mt-1">Payment Voucher Details</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Print
            </Button>
            <Button
              onClick={handleDownloadPDF}
              className="text-white flex items-center gap-2"
              style={{ backgroundColor: '#D4AF37' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B8941F'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D4AF37'}
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                statusColors[voucher.status as keyof typeof statusColors]
              }`}
            >
              {statusLabels[voucher.status as keyof typeof statusLabels]}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 no-print print:hidden">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('details')}
                className={`flex-1 px-4 py-2.5 rounded-md font-medium transition-all ${
                  activeTab === 'details'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  Details
                </div>
              </button>
              <button
                onClick={() => setActiveTab('pdf')}
                className={`flex-1 px-4 py-2.5 rounded-md font-medium transition-all ${
                  activeTab === 'pdf'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Receipt className="w-4 h-4" />
                  PDF Document
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Action Buttons */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-3">
              {voucher.status === 'draft' && (
                <>
                  <Button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending}>
                    <Send className="w-4 h-4 mr-2" />
                    {submitMutation.isPending ? 'Submitting...' : 'Submit for Review'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/admin/payment-vouchers/${voucherId}/edit`)}
                  >
                    Edit Voucher
                  </Button>
                </>
              )}

              {voucher.status === 'finance_review' && (
                <>
                  <Button
                    onClick={() => financeReviewMutation.mutate()}
                    disabled={financeReviewMutation.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {financeReviewMutation.isPending ? 'Processing...' : 'Approve & Forward to CFO'}
                  </Button>
                  <Button variant="destructive" onClick={() => setShowRejectModal(true)}>
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}

              {voucher.status === 'cfo_approval' && (
                <>
                  <Button onClick={() => cfoApproveMutation.mutate()} disabled={cfoApproveMutation.isPending}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {cfoApproveMutation.isPending ? 'Processing...' : 'Approve & Forward to MD'}
                  </Button>
                  <Button variant="destructive" onClick={() => setShowRejectModal(true)}>
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}

              {voucher.status === 'md_approval' && (
                <>
                  <Button onClick={() => mdApproveMutation.mutate()} disabled={mdApproveMutation.isPending}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {mdApproveMutation.isPending ? 'Processing...' : 'Final Approval'}
                  </Button>
                  <Button variant="destructive" onClick={() => setShowRejectModal(true)}>
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}

              {voucher.status === 'approved' && (
                <Button onClick={() => setShowConfirmPaymentModal(true)}>
                  <Receipt className="w-4 h-4 mr-2" />
                  Confirm Payment
                </Button>
              )}

              {['draft', 'finance_review', 'cfo_approval', 'md_approval'].includes(voucher.status) && (
                <Button variant="outline" onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending}>
                  <Ban className="w-4 h-4 mr-2" />
                  {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Voucher'}
                </Button>
              )}
                </div>
              </CardContent>
            </Card>

            {/* Progress Bar */}
            <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Approval Progress</span>
                <span className="text-sm font-bold text-primary">{approvalProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-500"
                  style={{ width: `${approvalProgress}%` }}
                />
              </div>
            </div>
          </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Voucher Details */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold mb-4">Voucher Information</h2>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Voucher Number</p>
                    <p className="font-medium">{voucher.voucher_number}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Related Memo</p>
                    <p className="font-medium">{voucher.memo_number || 'N/A'}</p>
                    {voucher.memo_title && (
                      <p className="text-sm text-muted-foreground">{voucher.memo_title}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Payee Name</p>
                    <p className="font-medium">{voucher.payee_name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="text-2xl font-bold text-green-700">{formatCurrency(voucher.amount)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Method</p>
                    <p className="font-medium">
                      {paymentMethodLabels[voucher.payment_method as keyof typeof paymentMethodLabels]}
                    </p>
                  </div>
                </div>

                {voucher.payee_bank_name && (
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Bank Details</p>
                      <p className="font-medium">{voucher.payee_bank_name}</p>
                      {voucher.payee_account_number && (
                        <p className="text-sm text-muted-foreground">
                          {voucher.payee_account_number} - {voucher.payee_account_name}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-sm">{voucher.description}</p>
                  </div>
                </div>

                {voucher.notes && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="text-sm">{voucher.notes}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="text-sm">{formatDate(voucher.created_at)}</p>
                    {voucher.created_by_name && (
                      <p className="text-xs text-muted-foreground">by {voucher.created_by_name}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Approval Timeline */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Approval Workflow</h2>

              <div className="space-y-4">
                {/* Finance Review */}
                <div className="flex items-start gap-3">
                  {voucher.finance_reviewed_at ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : voucher.status === 'finance_review' ? (
                    <Clock className="w-5 h-5 text-yellow-600 mt-0.5 animate-pulse" />
                  ) : (
                    <div className="w-5 h-5 mt-0.5 rounded-full border-2 border-gray-300" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">Finance Review</p>
                    {voucher.finance_reviewed_at ? (
                      <>
                        <p className="text-sm text-green-600">
                          Approved by {voucher.finance_reviewed_by_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatDate(voucher.finance_reviewed_at)}</p>
                        {voucher.finance_comments && (
                          <p className="text-sm text-muted-foreground mt-1">{voucher.finance_comments}</p>
                        )}
                      </>
                    ) : voucher.status === 'finance_review' ? (
                      <p className="text-sm text-yellow-600">Pending review</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not started</p>
                    )}
                  </div>
                </div>

                {/* CFO Approval */}
                <div className="flex items-start gap-3">
                  {voucher.cfo_approved_at ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : voucher.status === 'cfo_approval' ? (
                    <Clock className="w-5 h-5 text-yellow-600 mt-0.5 animate-pulse" />
                  ) : (
                    <div className="w-5 h-5 mt-0.5 rounded-full border-2 border-gray-300" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">CFO Approval</p>
                    {voucher.cfo_approved_at ? (
                      <>
                        <p className="text-sm text-green-600">Approved by {voucher.cfo_approved_by_name}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(voucher.cfo_approved_at)}</p>
                        {voucher.cfo_comments && (
                          <p className="text-sm text-muted-foreground mt-1">{voucher.cfo_comments}</p>
                        )}
                      </>
                    ) : voucher.status === 'cfo_approval' ? (
                      <p className="text-sm text-yellow-600">Pending approval</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not started</p>
                    )}
                  </div>
                </div>

                {/* MD Approval */}
                <div className="flex items-start gap-3">
                  {voucher.md_approved_at ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : voucher.status === 'md_approval' ? (
                    <Clock className="w-5 h-5 text-yellow-600 mt-0.5 animate-pulse" />
                  ) : (
                    <div className="w-5 h-5 mt-0.5 rounded-full border-2 border-gray-300" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">MD Approval</p>
                    {voucher.md_approved_at ? (
                      <>
                        <p className="text-sm text-green-600">Approved by {voucher.md_approved_by_name}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(voucher.md_approved_at)}</p>
                        {voucher.md_comments && (
                          <p className="text-sm text-muted-foreground mt-1">{voucher.md_comments}</p>
                        )}
                      </>
                    ) : voucher.status === 'md_approval' ? (
                      <p className="text-sm text-yellow-600">Pending approval</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not started</p>
                    )}
                  </div>
                </div>

                {/* Payment Confirmation */}
                <div className="flex items-start gap-3">
                  {voucher.paid_at ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                  ) : voucher.status === 'approved' ? (
                    <Clock className="w-5 h-5 text-green-600 mt-0.5 animate-pulse" />
                  ) : (
                    <div className="w-5 h-5 mt-0.5 rounded-full border-2 border-gray-300" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">Payment</p>
                    {voucher.paid_at ? (
                      <>
                        <p className="text-sm text-emerald-600">Paid by {voucher.paid_by_name}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(voucher.paid_at)}</p>
                        {voucher.payment_reference && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Ref: {voucher.payment_reference}
                          </p>
                        )}
                        {voucher.payment_date && (
                          <p className="text-xs text-muted-foreground">
                            Payment Date: {formatDate(voucher.payment_date)}
                          </p>
                        )}
                      </>
                    ) : voucher.status === 'approved' ? (
                      <p className="text-sm text-green-600">Ready for payment</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not started</p>
                    )}
                  </div>
                </div>

                {/* Rejection */}
                {voucher.status === 'rejected' && (
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-600">Rejected</p>
                        <p className="text-sm">Rejected by {voucher.rejected_by_name}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(voucher.rejected_at || null)}</p>
                        {voucher.rejection_reason && (
                          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-800">{voucher.rejection_reason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
            </div>
          </div>
        )}

        {/* PDF Document Tab */}
        {activeTab === 'pdf' && (
          <div id="voucher-print-content" className="bg-white print:shadow-none print:border-none">
            <div className="min-h-screen p-12 print:p-8">
              {/* Company Header */}
              <div className="flex items-center justify-between mb-8 border-b-2 border-black pb-4">
                <img
                  src="/modah_logo-removebg-preview.png"
                  alt="MOFAD Energy Solutions"
                  className="h-20 object-contain"
                />
                <div className="text-right">
                  <h1 className="text-2xl font-bold">MOFAD ENERGY</h1>
                  <p className="text-xs text-gray-600">Ltd. RC: 1053500</p>
                  <p className="text-xs text-gray-600 mt-2">T.O.S. Benson Crescent, Utako District Abuja FCT, Nigeria</p>
                  <p className="text-xs text-gray-600">Tel: 0813 790 0018, 0816 941 0758, 0908 125 7948</p>
                </div>
              </div>

              {/* Payment Method Badge */}
              <div className="flex justify-center mb-6">
                <div className="border-4 border-orange-600 px-8 py-3 inline-block">
                  <h2 className="text-xl font-bold text-orange-600 uppercase">
                    {paymentMethodLabels[voucher.payment_method as keyof typeof paymentMethodLabels]}
                  </h2>
                </div>
              </div>

              {/* Date and Voucher Number */}
              <div className="flex justify-between mb-6">
                <p className="font-bold text-sm">DATED: {formatDate(voucher.created_at)}</p>
                <p className="font-bold text-sm">No: {voucher.voucher_number}</p>
              </div>

              {/* Director Line */}
              <p className="text-sm italic mb-4">THE DIRECTOR OF FINANCE AND ACCOUNTS</p>

              {/* Amount in words */}
              <p className="text-sm italic mb-4">
                Please pay the sum of N <span className="font-bold">{parseFloat(voucher.amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </p>

              {/* Payee */}
              <p className="text-sm italic mb-6">
                to Messrs/Mr/Mrs/Miss <span className="font-bold">{voucher.payee_name}</span>
              </p>

              {/* Items Description Table */}
              <div className="border-2 border-black mb-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="px-3 py-2 text-xs font-bold text-center border-r-2 border-black" rowSpan={2}>INVOICE NO.</th>
                      <th className="px-3 py-2 text-xs font-bold text-center border-r-2 border-black" rowSpan={2}>DESCRIPTION OF ITEMS</th>
                      <th className="px-3 py-2 text-xs font-bold text-center border-r-2 border-black" rowSpan={2}>UNIT PRICE</th>
                      <th className="px-3 py-2 text-xs font-bold text-center" colSpan={2}>AMOUNT</th>
                    </tr>
                    <tr className="border-b-2 border-black">
                      <th className="px-3 py-2 text-xs font-bold text-center border-r-2 border-black">N</th>
                      <th className="px-3 py-2 text-xs font-bold text-center">K</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-black">
                      <td className="px-3 py-3 text-xs text-center border-r-2 border-black">
                        {voucher.memo_number || ''}
                      </td>
                      <td className="px-3 py-3 text-xs border-r-2 border-black">
                        {voucher.description}
                      </td>
                      <td className="px-3 py-3 text-xs text-right border-r-2 border-black">
                        {formatCurrency(voucher.amount)}
                      </td>
                      <td className="px-3 py-3 text-xs text-right border-r-2 border-black">
                        {Math.floor(parseFloat(voucher.amount)).toLocaleString('en-NG')}
                      </td>
                      <td className="px-3 py-3 text-xs text-right">
                        {String(Math.round((parseFloat(voucher.amount) - Math.floor(parseFloat(voucher.amount))) * 100)).padStart(2, '0')}
                      </td>
                    </tr>
                    {/* Empty rows for spacing */}
                    {[...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b border-black">
                        <td className="px-3 py-3 text-xs border-r-2 border-black h-8">&nbsp;</td>
                        <td className="px-3 py-3 text-xs border-r-2 border-black">&nbsp;</td>
                        <td className="px-3 py-3 text-xs border-r-2 border-black">&nbsp;</td>
                        <td className="px-3 py-3 text-xs border-r-2 border-black">&nbsp;</td>
                        <td className="px-3 py-3 text-xs">&nbsp;</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Approval Section */}
              <div className="border-2 border-black mb-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="px-4 py-2 text-sm font-bold text-center border-r-2 border-black">PREPARED BY</th>
                      <th className="px-4 py-2 text-sm font-bold text-center border-r-2 border-black">CHECKED BY</th>
                      <th className="px-4 py-2 text-sm font-bold text-center">APPROVED BY</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b-2 border-black">
                      <td className="px-4 py-8 border-r-2 border-black text-center h-24">
                        {voucher.created_by_name && (
                          <div>
                            <p className="text-xs font-bold">{voucher.created_by_name}</p>
                            <p className="text-xs mt-1">{formatDate(voucher.created_at)}</p>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-8 border-r-2 border-black text-center">
                        {voucher.finance_reviewed_by_name && (
                          <div>
                            <p className="text-xs font-bold">{voucher.finance_reviewed_by_name}</p>
                            <p className="text-xs mt-1">{formatDate(voucher.finance_reviewed_at || null)}</p>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-8 text-center">
                        {voucher.md_approved_by_name && (
                          <div>
                            <p className="text-xs font-bold">{voucher.md_approved_by_name}</p>
                            <p className="text-xs mt-1">{formatDate(voucher.md_approved_at || null)}</p>
                          </div>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-xs text-center border-r-2 border-black">
                        Date: {formatDate(voucher.created_at)}
                      </td>
                      <td className="px-4 py-2 text-xs text-center border-r-2 border-black">
                        Date: {voucher.finance_reviewed_at ? formatDate(voucher.finance_reviewed_at) : '___________'}
                      </td>
                      <td className="px-4 py-2 text-xs text-center">
                        Date: {voucher.md_approved_at ? formatDate(voucher.md_approved_at) : '___________'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Bottom Section: Accounting Codes and Received By */}
              <div className="flex gap-4">
                {/* Accounting Codes Table */}
                <div className="flex-1">
                  <div className="border-2 border-black">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-black">
                          <th className="px-3 py-2 text-xs font-bold text-center border-r-2 border-black">CODE</th>
                          <th className="px-3 py-2 text-xs font-bold text-center border-r-2 border-black">DEBIT</th>
                          <th className="px-3 py-2 text-xs font-bold text-center">CREDIT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const accountingEntries = voucher?.accounting_entries || [];
                          const totalDebit = accountingEntries.reduce((sum: number, entry: any) =>
                            sum + (entry.entry_type === 'debit' ? parseFloat(entry.amount) : 0), 0);
                          const totalCredit = accountingEntries.reduce((sum: number, entry: any) =>
                            sum + (entry.entry_type === 'credit' ? parseFloat(entry.amount) : 0), 0);

                          // Display up to 5 entries
                          const displayEntries = [...accountingEntries.slice(0, 5)];
                          // Fill remaining rows with empty data
                          while (displayEntries.length < 5) {
                            displayEntries.push(null);
                          }

                          return (
                            <>
                              {displayEntries.map((entry: any, i: number) => (
                                <tr key={i} className="border-b border-black">
                                  <td className="px-3 py-2 text-xs border-r-2 border-black h-6">
                                    {entry ? (
                                      <>
                                        <div className="font-bold">{entry.gl_code}</div>
                                        {entry.gl_code_description && (
                                          <div className="text-[8px] text-gray-600">{entry.gl_code_description}</div>
                                        )}
                                      </>
                                    ) : '\u00A0'}
                                  </td>
                                  <td className="px-3 py-2 text-xs border-r-2 border-black text-right">
                                    {entry && entry.entry_type === 'debit' ? `N ${parseFloat(entry.amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '\u00A0'}
                                  </td>
                                  <td className="px-3 py-2 text-xs text-right">
                                    {entry && entry.entry_type === 'credit' ? `N ${parseFloat(entry.amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '\u00A0'}
                                  </td>
                                </tr>
                              ))}
                              <tr className="border-t-2 border-black">
                                <td className="px-3 py-2 text-xs font-bold text-center border-r-2 border-black">TOTAL</td>
                                <td className="px-3 py-2 text-xs font-bold border-r-2 border-black text-right">
                                  {totalDebit > 0 ? `N ${totalDebit.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '\u00A0'}
                                </td>
                                <td className="px-3 py-2 text-xs font-bold text-right">
                                  {totalCredit > 0 ? `N ${totalCredit.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '\u00A0'}
                                </td>
                              </tr>
                            </>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Received By Section */}
                <div className="flex-1">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold mb-1">RECEIVED BY:</p>
                      <p className="text-xs mb-2">Name</p>
                      <div className="border-b border-gray-400 h-8 mb-4">&nbsp;</div>
                    </div>
                    <div>
                      <p className="text-xs font-bold mb-1">SIGNATURE:</p>
                      <div className="border-b border-gray-400 h-8 mb-4">&nbsp;</div>
                    </div>
                    <div>
                      <p className="text-xs font-bold mb-1">DATE:</p>
                      <div className="border-b border-gray-400 h-6">&nbsp;</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Confirmation (if paid) */}
              {voucher.status === 'paid' && voucher.payment_reference && (
                <div className="mt-8 border-2 border-green-600 bg-green-50 p-4">
                  <p className="font-bold text-green-600 text-lg">PAYMENT CONFIRMED</p>
                  <p className="text-sm"><span className="font-bold">Payment Reference:</span> {voucher.payment_reference}</p>
                  <p className="text-sm"><span className="font-bold">Payment Date:</span> {formatDate(voucher.payment_date || null)}</p>
                  <p className="text-sm"><span className="font-bold">Confirmed By:</span> {voucher.paid_by_name}</p>
                  <p className="text-sm"><span className="font-bold">Date Confirmed:</span> {formatDate(voucher.paid_at || null)}</p>
                </div>
              )}

              {/* Rejection Notice (if rejected) */}
              {voucher.status === 'rejected' && (
                <div className="mt-8 border-2 border-red-600 bg-red-50 p-4">
                  <p className="font-bold text-red-600 text-lg">REJECTED</p>
                  <p className="text-sm"><span className="font-bold">Rejected By:</span> {voucher.rejected_by_name}</p>
                  <p className="text-sm"><span className="font-bold">Date:</span> {formatDate(voucher.rejected_at || null)}</p>
                  {voucher.rejection_reason && (
                    <p className="text-sm mt-2"><span className="font-bold">Reason:</span> {voucher.rejection_reason}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Reject Payment Voucher</h3>
            <textarea
              className="w-full border border-gray-300 rounded-md p-3 mb-4"
              rows={4}
              placeholder="Please provide a reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowRejectModal(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => rejectMutation.mutate()}
                disabled={!rejectReason || rejectMutation.isPending}
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Reject Voucher'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Payment Modal */}
      {showConfirmPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Confirm Payment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Payment Reference *</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="Bank reference or cheque number"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Date *</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                <textarea
                  className="w-full border border-gray-300 rounded-md p-2"
                  rows={3}
                  placeholder="Additional notes..."
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <Button variant="outline" onClick={() => setShowConfirmPaymentModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => confirmPaymentMutation.mutate()}
                disabled={!paymentReference || !paymentDate || confirmPaymentMutation.isPending}
              >
                {confirmPaymentMutation.isPending ? 'Confirming...' : 'Confirm Payment'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
