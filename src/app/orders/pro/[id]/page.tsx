'use client'

import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter, useParams } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toast'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import {
  ArrowLeft,
  Download,
  Printer,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Truck,
  Package,
  Building,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Hash,
  DollarSign,
  Edit,
  RefreshCw,
  Send,
  CreditCard,
  ShoppingCart,
  ClipboardList,
  CheckCircle2,
  Ban,
  Loader2
} from 'lucide-react'

interface PROItem {
  id?: number
  product_id: string | number
  product_name: string
  product_code?: string
  product_price?: string | number
  product_quantity?: string | number
  quantity?: number
  unit_price?: number
  total_price?: number
  received_quantity?: number
  notes?: string
}

interface PRO {
  id: number
  pro_number: string
  title?: string | null
  description?: string | null
  supplier?: string | null
  supplier_id?: number
  supplier_name?: string
  supplier_contact?: string | null
  supplier_address?: string
  supplier_phone?: string | null
  supplier_email?: string | null
  delivery_address?: string | null
  delivery_location_name?: string | null
  prf?: number | null
  prf_id?: number
  prf_number?: string
  status: 'draft' | 'pending_review' | 'reviewed' | 'pending_approval' | 'approved' | 'rejected' | 'sent' | 'confirmed' | 'partially_delivered' | 'delivered' | 'cancelled'
  delivery_status: 'pending' | 'partial' | 'completed'
  total_amount: string | number
  subtotal?: string | number
  tax_amount?: string | number
  discount_amount?: string | number
  shipping_cost?: number
  discount?: number
  grand_total?: number
  payment_terms?: string | null
  payment_method?: string | null
  delivery_terms?: string
  expected_delivery_date?: string | null
  expected_delivery?: string
  actual_delivery?: string
  delivered_at?: string | null
  created_by?: number | string | null
  created_by_name?: string | null
  reviewer?: number | null
  reviewer_name?: string | null
  reviewed_by?: number | null
  reviewed_by_name?: string | null
  reviewed_at?: string | null
  approver?: number | null
  approver_name?: string | null
  approved_by?: number | null
  approved_by_name?: string | null
  approved_at?: string | null
  confirmed_at?: string | null
  sent_at?: string | null
  submitted_at?: string | null
  rejected_at?: string | null
  rejection_reason?: string | null
  notes?: string | null
  terms_conditions?: string | null
  items: PROItem[]
  items_count?: number
  order_snapshot?: PROItem[]
  warehouse_id?: number
  po_number?: string | null
  transaction_id?: string | null
  approval_status?: string
  created_at: string
  updated_at?: string
}

const getStatusConfig = (status: string) => {
  const configs: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
    draft: {
      color: 'text-gray-700',
      bg: 'bg-gray-100 border-gray-300',
      icon: <Clock className="w-4 h-4" />,
      label: 'DRAFT'
    },
    pending_review: {
      color: 'text-yellow-700',
      bg: 'bg-yellow-100 border-yellow-300',
      icon: <Clock className="w-4 h-4" />,
      label: 'PENDING REVIEW'
    },
    reviewed: {
      color: 'text-blue-700',
      bg: 'bg-blue-100 border-blue-300',
      icon: <CheckCircle className="w-4 h-4" />,
      label: 'REVIEWED'
    },
    pending_approval: {
      color: 'text-purple-700',
      bg: 'bg-purple-100 border-purple-300',
      icon: <Clock className="w-4 h-4" />,
      label: 'PENDING APPROVAL'
    },
    approved: {
      color: 'text-green-700',
      bg: 'bg-green-100 border-green-300',
      icon: <CheckCircle className="w-4 h-4" />,
      label: 'APPROVED'
    },
    rejected: {
      color: 'text-red-700',
      bg: 'bg-red-100 border-red-300',
      icon: <XCircle className="w-4 h-4" />,
      label: 'REJECTED'
    },
    sent: {
      color: 'text-amber-700',
      bg: 'bg-amber-100 border-amber-300',
      icon: <Send className="w-4 h-4" />,
      label: 'SENT TO SUPPLIER'
    },
    confirmed: {
      color: 'text-blue-700',
      bg: 'bg-blue-100 border-blue-300',
      icon: <CheckCircle className="w-4 h-4" />,
      label: 'CONFIRMED'
    },
    delivered: {
      color: 'text-emerald-700',
      bg: 'bg-emerald-100 border-emerald-300',
      icon: <Package className="w-4 h-4" />,
      label: 'DELIVERED'
    },
    cancelled: {
      color: 'text-red-700',
      bg: 'bg-red-100 border-red-300',
      icon: <XCircle className="w-4 h-4" />,
      label: 'CANCELLED'
    }
  }
  return configs[status] || configs.draft
}

const getDeliveryConfig = (status: string) => {
  const configs: Record<string, { color: string; bg: string; label: string }> = {
    pending: { color: 'text-amber-700', bg: 'bg-amber-50', label: 'Pending' },
    partial: { color: 'text-orange-700', bg: 'bg-orange-50', label: 'Partial' },
    completed: { color: 'text-emerald-700', bg: 'bg-emerald-50', label: 'Completed' }
  }
  return configs[status] || configs.pending
}

export default function PRODetailPage() {
  const router = useRouter()
  const params = useParams()
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const printRef = useRef<HTMLDivElement>(null)
  const proId = parseInt(params.id as string)

  // State for workflow actions
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [showReviewRejectDialog, setShowReviewRejectDialog] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showSendDialog, setShowSendDialog] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'pdf'>('details')
  const [rejectionReason, setRejectionReason] = useState('')

  const { data: pro, isLoading, error, refetch } = useQuery({
    queryKey: ['pro-detail', proId],
    queryFn: async () => {
      return apiClient.getProById(proId)
    },
  })

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => apiClient.getCurrentUser(),
  })

  // Status update mutations
  const statusMutation = useMutation({
    mutationFn: ({ status }: { status: string }) => apiClient.updateProStatus(proId, status),
    onSuccess: (response, { status }) => {
      const statusNames = {
        sent: 'sent to supplier',
        confirmed: 'confirmed',
        cancelled: 'cancelled'
      }
      addToast({
        title: 'PRO Updated Successfully',
        description: `PRO has been ${statusNames[status as keyof typeof statusNames] || 'updated'}`,
        type: 'success'
      })
      queryClient.invalidateQueries({ queryKey: ['pro-detail', proId] })
      queryClient.invalidateQueries({ queryKey: ['pros'] })
      refetch()
      // Close all dialogs
      setShowSendDialog(false)
      setShowConfirmDialog(false)
      setShowCancelDialog(false)
    },
    onError: (error: any) => {
      addToast({
        title: 'Failed to update PRO',
        description: error.message || 'An error occurred while updating the PRO',
        type: 'error'
      })
    }
  })

  // Submit for review mutation
  const submitMutation = useMutation({
    mutationFn: () => apiClient.submitPro(proId),
    onSuccess: () => {
      addToast({
        title: 'PRO Submitted Successfully',
        description: 'PRO has been submitted for review',
        type: 'success'
      })
      queryClient.invalidateQueries({ queryKey: ['pro-detail', proId] })
      queryClient.invalidateQueries({ queryKey: ['pros'] })
      refetch()
      setShowSubmitDialog(false)
    },
    onError: (error: any) => {
      addToast({
        title: 'Failed to submit PRO',
        description: error.message || 'An error occurred while submitting the PRO',
        type: 'error'
      })
    }
  })

  // Review mutation
  const reviewMutation = useMutation({
    mutationFn: () => apiClient.reviewPro(proId),
    onSuccess: () => {
      addToast({
        title: 'PRO Reviewed Successfully',
        description: 'PRO has been reviewed and sent for approval',
        type: 'success'
      })
      queryClient.invalidateQueries({ queryKey: ['pro-detail', proId] })
      queryClient.invalidateQueries({ queryKey: ['pros'] })
      refetch()
      setShowReviewDialog(false)
    },
    onError: (error: any) => {
      addToast({
        title: 'Failed to review PRO',
        description: error.message || 'An error occurred while reviewing the PRO',
        type: 'error'
      })
    }
  })

  // Review reject mutation
  const reviewRejectMutation = useMutation({
    mutationFn: (reason: string) => apiClient.reviewRejectPro(proId, reason),
    onSuccess: () => {
      addToast({
        title: 'PRO Rejected',
        description: 'PRO has been rejected at review stage',
        type: 'success'
      })
      queryClient.invalidateQueries({ queryKey: ['pro-detail', proId] })
      queryClient.invalidateQueries({ queryKey: ['pros'] })
      refetch()
      setShowReviewRejectDialog(false)
      setRejectionReason('')
    },
    onError: (error: any) => {
      addToast({
        title: 'Failed to reject PRO',
        description: error.message || 'An error occurred while rejecting the PRO',
        type: 'error'
      })
    }
  })

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: () => apiClient.approvePro(proId),
    onSuccess: () => {
      addToast({
        title: 'PRO Approved Successfully',
        description: 'PRO has been approved',
        type: 'success'
      })
      queryClient.invalidateQueries({ queryKey: ['pro-detail', proId] })
      queryClient.invalidateQueries({ queryKey: ['pros'] })
      refetch()
      setShowApproveDialog(false)
    },
    onError: (error: any) => {
      addToast({
        title: 'Failed to approve PRO',
        description: error.message || 'An error occurred while approving the PRO',
        type: 'error'
      })
    }
  })

  // Reject at approval stage mutation
  const rejectMutation = useMutation({
    mutationFn: (reason: string) => apiClient.rejectPro(proId, reason),
    onSuccess: () => {
      addToast({
        title: 'PRO Rejected',
        description: 'PRO has been rejected at approval stage',
        type: 'success'
      })
      queryClient.invalidateQueries({ queryKey: ['pro-detail', proId] })
      queryClient.invalidateQueries({ queryKey: ['pros'] })
      refetch()
      setShowRejectDialog(false)
      setRejectionReason('')
    },
    onError: (error: any) => {
      addToast({
        title: 'Failed to reject PRO',
        description: error.message || 'An error occurred while rejecting the PRO',
        type: 'error'
      })
    }
  })

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    if (!printRef.current) return

    // Enhanced print-to-PDF approach with professional styling matching PRF design
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>PRO ${pro?.pro_number || 'Document'}</title>
          <style>
            @page {
              size: A4;
              margin: 0.5in;
            }
            * { box-sizing: border-box; }
            body {
              font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
              margin: 0;
              padding: 0;
              line-height: 1.4;
              color: #1f2937;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .header-gradient {
              background: linear-gradient(135deg, #D4AF37 0%, #B8941F 50%, #1B4F3A 100%) !important;
              color: white !important;
              padding: 20px !important;
            }
            .logo-container {
              background: rgba(255, 255, 255, 0.95) !important;
              padding: 8px !important;
              border-radius: 8px !important;
              display: inline-block !important;
            }
            .company-title {
              font-size: 24px !important;
              font-weight: bold !important;
              margin-bottom: 8px !important;
            }
            .contact-info {
              display: flex !important;
              gap: 20px !important;
              font-size: 12px !important;
              margin-top: 8px !important;
            }
            .document-ref {
              background: rgba(255, 255, 255, 0.2) !important;
              padding: 8px 12px !important;
              border-radius: 8px !important;
              border: 1px solid rgba(255, 255, 255, 0.3) !important;
            }
            .section-title {
              font-size: 18px !important;
              font-weight: bold !important;
              margin: 20px 0 15px 0 !important;
              color: #1f2937 !important;
            }
            .info-grid {
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
              gap: 15px !important;
              margin-bottom: 20px !important;
            }
            .info-card {
              background: #f9fafb !important;
              padding: 12px !important;
              border: 1px solid #e5e7eb !important;
              border-radius: 8px !important;
            }
            .info-label {
              font-size: 10px !important;
              font-weight: 600 !important;
              color: #6b7280 !important;
              text-transform: uppercase !important;
              margin-bottom: 4px !important;
            }
            .info-value {
              font-size: 12px !important;
              font-weight: 500 !important;
              color: #1f2937 !important;
            }
            table {
              width: 100% !important;
              border-collapse: collapse !important;
              margin: 15px 0 !important;
              font-size: 11px !important;
            }
            th, td {
              border: 1px solid #d1d5db !important;
              padding: 8px !important;
              text-align: left !important;
            }
            th {
              background: linear-gradient(90deg, #F3F4F6, #E5E7EB) !important;
              font-weight: 600 !important;
              font-size: 10px !important;
              text-transform: uppercase !important;
            }
            .total-row {
              background: linear-gradient(90deg, #FEF3C7, #FDE68A) !important;
              border-top: 3px solid #D4AF37 !important;
              font-weight: bold !important;
            }
            .footer {
              text-align: center !important;
              margin-top: 30px !important;
              padding-top: 20px !important;
              border-top: 1px solid #d1d5db !important;
              font-size: 10px !important;
              color: #6b7280 !important;
            }
            .no-print { display: none !important; }
          </style>
        </head>
        <body>
          ${printRef.current.innerHTML}
        </body>
      </html>
    `)

    printWindow.document.close()

    // Wait for content to load, then trigger print
    setTimeout(() => {
      printWindow.focus()
      printWindow.print()
    }, 500)
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 space-y-6">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-24 bg-gray-200 rounded"></div>
              <div className="h-8 w-64 bg-gray-200 rounded"></div>
            </div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-2 gap-6">
              <div className="h-40 bg-gray-200 rounded-lg"></div>
              <div className="h-40 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error || !pro) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center py-16 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-100">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Purchase Order Not Found</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              The purchase order you&apos;re looking for doesn&apos;t exist or may have been removed.
            </p>
            <Button onClick={() => router.back()} className="mofad-btn-primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  const statusConfig = getStatusConfig(pro.status)
  const deliveryConfig = getDeliveryConfig(pro.delivery_status)

  // Normalize items from both PROItem format and legacy order_snapshot format
  const rawItems = pro.items || []
  const items = rawItems.map((item: Record<string, unknown>) => {
    const quantity = Number(item.product_quantity) || Number(item.quantity) || Number(item.qty) || Number(item.ordered_quantity) || 0
    const unitPrice = Number(item.product_price) || Number(item.unit_price) || Number(item.price) || Number(item.cost) || 0
    return {
      id: item.id || item.product_id || Math.random(),
      product_id: item.product_id || item.product || item.id,
      product_name: item.product_name || item.name || item.product || 'Unknown Product',
      product_code: item.product_code || item.code || '',
      quantity,
      unit_price: unitPrice,
      total_price: Number(item.total_price) || Number(item.total) || (quantity * unitPrice),
      received_quantity: Number(item.received_quantity) || Number(item.quantity_delivered) || 0,
      notes: item.notes || item.specifications || '',
    }
  })

  const subtotal = items.reduce((sum: number, item: { total_price: number }) => sum + (item.total_price || 0), 0)
  // Use total_amount from API if available, otherwise calculate from subtotal
  const grandTotal = pro.grand_total || Number(pro.total_amount) || (subtotal + Number(pro.tax_amount || 0) + (pro.shipping_cost || 0) - Number(pro.discount_amount || pro.discount || 0))

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200 no-print">
          <div className="flex items-center gap-4">
            <Button onClick={() => router.back()} variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to PROs
            </Button>
            <div className="border-l border-gray-300 pl-4">
              <h1 className="text-xl font-semibold text-gray-900">PRO #{pro.pro_number}</h1>
              <p className="text-gray-600 text-sm">Purchase Order Details</p>
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

            {/* Workflow Actions */}
            {pro.status === 'draft' && (
              <>
                <Button
                  onClick={() => setShowSubmitDialog(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  disabled={submitMutation.isPending || !pro.reviewer}
                >
                  {submitMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Submit for Review
                </Button>
                <Button
                  onClick={() => router.push(`/orders/pro/${proId}/edit`)}
                  className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Order
                </Button>
                <Button
                  onClick={() => setShowCancelDialog(true)}
                  className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                >
                  <Ban className="w-4 h-4" />
                  Cancel
                </Button>
              </>
            )}

            {pro.status === 'pending_review' && currentUser && pro.reviewer === currentUser.id && (
              <>
                <Button
                  onClick={() => setShowReviewDialog(true)}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                  disabled={reviewMutation.isPending}
                >
                  {reviewMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Review & Forward
                </Button>
                <Button
                  onClick={() => setShowReviewRejectDialog(true)}
                  className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                  disabled={reviewRejectMutation.isPending}
                >
                  {reviewRejectMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  Reject
                </Button>
              </>
            )}

            {pro.status === 'pending_approval' && currentUser && pro.approver === currentUser.id && (
              <>
                <Button
                  onClick={() => setShowApproveDialog(true)}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                  disabled={approveMutation.isPending}
                >
                  {approveMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Approve
                </Button>
                <Button
                  onClick={() => setShowRejectDialog(true)}
                  className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                  disabled={rejectMutation.isPending}
                >
                  {rejectMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  Reject
                </Button>
              </>
            )}

            {pro.status === 'approved' && (
              <Button
                onClick={() => setShowSendDialog(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                disabled={statusMutation.isPending}
              >
                {statusMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Send to Supplier
              </Button>
            )}

            {pro.status === 'sent' && (
              <Button
                onClick={() => setShowConfirmDialog(true)}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                disabled={statusMutation.isPending}
              >
                {statusMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Confirm Order
              </Button>
            )}
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
                  <ClipboardList className="w-4 h-4" />
                  Details & Delivery Status
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
                  <FileText className="w-4 h-4" />
                  PDF Document
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Delivery Schedule & Item Receipt Status */}
        {activeTab === 'details' && (
          <div className="space-y-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Delivery Schedule & Item Receipt Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Delivery Information */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide block mb-1">Expected Delivery</label>
                        <p className="text-sm font-medium text-blue-900">
                          {pro.expected_delivery ? formatDateTime(pro.expected_delivery).split(' ')[0] : 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide block mb-1">Actual Delivery</label>
                        <p className="text-sm font-medium text-blue-900">
                          {pro.delivered_at ? formatDateTime(pro.delivered_at).split(' ')[0] : 'Pending'}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide block mb-1">Delivery Location</label>
                        <p className="text-sm font-medium text-blue-900">
                          {pro.delivery_location_name || 'MOFAD Headquarters'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Item Receipt Status Table */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Item-by-Item Receipt Status
                    </h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Item</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Unit Price</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Ordered</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Received</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Pending</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Total Value</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, index) => {
                            const received = item.received_quantity || 0
                            const ordered = item.quantity
                            const pending = ordered - received
                            const percentage = (received / ordered) * 100
                            const unitPrice = item.unit_price || 0
                            const totalValue = ordered * unitPrice

                            return (
                              <tr key={item.id} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                <td className="px-4 py-3">
                                  <div>
                                    <p className="font-medium text-gray-900">{item.product_name}</p>
                                    {item.product_code && (
                                      <p className="text-xs text-gray-500 font-mono">{item.product_code}</p>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <span className="text-sm text-gray-700">{formatCurrency(unitPrice)}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className="font-semibold text-gray-900">{ordered}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`font-bold ${
                                    received >= ordered ? 'text-green-600' : received > 0 ? 'text-orange-600' : 'text-gray-400'
                                  }`}>
                                    {received}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`font-semibold ${pending > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                                    {pending}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <span className="font-bold text-gray-900">{formatCurrency(totalValue)}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {percentage === 100 ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                      <CheckCircle className="w-3 h-3" />
                                      Complete
                                    </span>
                                  ) : percentage > 0 ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                                      <Clock className="w-3 h-3" />
                                      Partial ({percentage.toFixed(0)}%)
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                                      <AlertTriangle className="w-3 h-3" />
                                      Pending
                                    </span>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t-2 border-blue-200">
                            <td className="px-4 py-3 font-bold text-gray-900">Total</td>
                            <td className="px-4 py-3 text-right font-bold text-gray-900">-</td>
                            <td className="px-4 py-3 text-center font-bold text-gray-900">
                              {items.reduce((sum, item) => sum + item.quantity, 0)}
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-green-600">
                              {items.reduce((sum, item) => sum + (item.received_quantity || 0), 0)}
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-red-600">
                              {items.reduce((sum, item) => sum + (item.quantity - (item.received_quantity || 0)), 0)}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-gray-900">
                              {formatCurrency(items.reduce((sum, item) => sum + (item.quantity * (item.unit_price || 0)), 0))}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {(() => {
                                const totalOrdered = items.reduce((sum, item) => sum + item.quantity, 0)
                                const totalReceived = items.reduce((sum, item) => sum + (item.received_quantity || 0), 0)
                                const overallPercentage = (totalReceived / totalOrdered) * 100

                                return (
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                      <div
                                        className={`h-2 rounded-full transition-all ${
                                          overallPercentage === 100 ? 'bg-green-500' : overallPercentage > 0 ? 'bg-orange-500' : 'bg-gray-400'
                                        }`}
                                        style={{ width: `${overallPercentage}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs font-semibold text-gray-700">{overallPercentage.toFixed(0)}%</span>
                                  </div>
                                )
                              })()}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* PRO Document */}
        {activeTab === 'pdf' && (
        <div ref={printRef} className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200 print:shadow-none print:rounded-none print:border-none print:max-w-none print:w-full print:h-auto print:m-0 print:p-0">
          {/* Professional Header */}
          <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 50%, #1B4F3A 100%)' }}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full" style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 2px, transparent 0)`,
                backgroundSize: '30px 30px'
              }}></div>
            </div>

            <div className="relative p-8 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="bg-white/95 p-4 rounded-xl shadow-lg backdrop-blur-sm">
                    <img
                      src="/modah_logo-removebg-preview.png"
                      alt="MOFAD Energy Solutions"
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">MOFAD Energy Solutions</h1>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-white/90">
                      <span className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                        <MapPin className="w-4 h-4" />
                        <span>45 TOS Benson Crescent, Utako, Abuja FCT</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                        <Phone className="w-4 h-4" />
                        <span>+234 809 123 4567</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                        <Mail className="w-4 h-4" />
                        <span>info@mofadenergy.com</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/30">
                    <p className="text-xs text-white/80 mb-1">Document Reference</p>
                    <p className="font-bold text-lg">{pro.pro_number}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/20">
                <div className="flex items-center gap-4">
                  <div className="w-1 h-8 bg-white/80 rounded-full"></div>
                  <h2 className="text-3xl font-bold tracking-wide">PURCHASE ORDER</h2>
                </div>
              </div>
            </div>
          </div>

          {/* Document Content */}
          <div className="p-8">
            {/* Order Information Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E8F4F0' }}>
                  <FileText className="w-5 h-5 text-green-700" style={{ color: '#1B4F3A' }} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Order Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide block mb-2">Date of Order</label>
                  <p className="text-base font-medium text-gray-900">{formatDateTime(pro.created_at).split(',')[0]}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide block mb-2">Deliver To</label>
                  <p className="text-base font-medium text-gray-900">{pro.delivery_location_name || 'MOFAD Headquarters'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide block mb-2">Supplier</label>
                  <p className="text-base font-medium text-gray-900">
                    {pro.supplier_name || pro.supplier || 'N/A'}
                  </p>
                  {pro.supplier_contact && (
                    <p className="text-sm text-gray-600 mt-1">Contact: {pro.supplier_contact}</p>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide block mb-2">Expected Delivery</label>
                  <p className="text-base font-medium text-gray-900">
                    {pro.expected_delivery ? formatDateTime(pro.expected_delivery).split(' ')[0] : 'TBD'}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide block mb-2">Status</label>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border-2 ${statusConfig.bg} ${statusConfig.color}`}>
                    {statusConfig.icon}
                    {statusConfig.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Supplier Information Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EFF6FF' }}>
                  <Building className="w-5 h-5 text-blue-600" style={{ color: '#2563EB' }} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Supplier Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide block mb-2">Supplier Name</label>
                  <p className="text-base font-medium text-gray-900">{pro.supplier_name || pro.supplier || 'Not specified'}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide block mb-2">Contact Information</label>
                  <p className="text-base font-medium text-gray-900">
                    {pro.supplier_contact || pro.supplier_phone || 'N/A'}
                  </p>
                  {pro.supplier_email && (
                    <p className="text-sm text-gray-600 mt-1">Email: {pro.supplier_email}</p>
                  )}
                </div>
              </div>

              {pro.supplier_address && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-6">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide block mb-2">Supplier Address</label>
                  <p className="text-base font-medium text-gray-900">{pro.supplier_address}</p>
                </div>
              )}
            </div>

            {/* Items & Services Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FDF4E7' }}>
                    <Package className="w-5 h-5 text-amber-600" style={{ color: '#D4AF37' }} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Items & Services</h3>
                </div>
                <p className="text-sm text-gray-600">Detailed breakdown of items and services</p>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: 'linear-gradient(90deg, #F3F4F6, #E5E7EB)' }}>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wide border-r border-gray-300">S/N</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wide border-r border-gray-300">Description of Items/Services</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-800 uppercase tracking-wide border-r border-gray-300">Code</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-800 uppercase tracking-wide border-r border-gray-300">Qty Ordered</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-800 uppercase tracking-wide border-r border-gray-300">Qty Received</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-800 uppercase tracking-wide border-r border-gray-300">Unit Cost</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-800 uppercase tracking-wide">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center">
                          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 font-medium">No items in this order</p>
                        </td>
                      </tr>
                    ) : (
                      items.map((item, index) => (
                        <tr key={item.id} className={`border-b border-gray-200 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        } hover:bg-blue-50/30`}>
                          <td className="px-6 py-4 text-center font-bold text-gray-900 border-r border-gray-200">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-sm">
                              {index + 1}
                            </div>
                          </td>
                          <td className="px-6 py-4 border-r border-gray-200">
                            <div>
                              <p className="font-semibold text-gray-900 mb-1">{item.product_name || 'Unknown Product'}</p>
                              {item.notes && <p className="text-sm text-gray-600 italic">{item.notes}</p>}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center border-r border-gray-200">
                            <span className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-700">
                              {item.product_code || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-lg text-gray-900 border-r border-gray-200">{item.quantity}</td>
                          <td className="px-6 py-4 text-center border-r border-gray-200">
                            <span className={`font-bold text-lg ${
                              (item.received_quantity || 0) >= item.quantity
                                ? 'text-emerald-600'
                                : (item.received_quantity || 0) > 0
                                  ? 'text-amber-600'
                                  : 'text-gray-400'
                            }`}>
                              {item.received_quantity?.toLocaleString() || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-gray-900 border-r border-gray-200">{formatCurrency(item.unit_price)}</td>
                          <td className="px-6 py-4 text-right font-bold text-lg" style={{ color: '#1B4F3A' }}>{formatCurrency(item.total_price)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: 'linear-gradient(90deg, #FEF3C7, #FDE68A)', borderTop: '3px solid #D4AF37' }}>
                      <td colSpan={6} className="px-6 py-5 text-right font-bold text-xl text-gray-900">
                        <div className="flex items-center justify-end gap-2">
                          <span>Grand Total:</span>
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="font-bold text-2xl" style={{ color: '#D4AF37' }}>
                          {formatCurrency(grandTotal)}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {items.length} item(s)
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Approval Workflow Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E8F4F0' }}>
                  <CheckCircle className="w-5 h-5" style={{ color: '#1B4F3A' }} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Approval Workflow</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Created By</h4>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Name: {pro.created_by_name || 'Admin User'}</p>
                    <p className="text-sm text-gray-600">Position: Purchase Manager</p>
                    <p className="text-sm text-gray-600">Date: {formatDateTime(pro.created_at).split(',')[0]}</p>
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">Signature: ________________</p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Reviewer (1st Level)</h4>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Name: {pro.reviewed_by_name || pro.reviewer_name || '________________'}</p>
                    <p className="text-sm text-gray-600">Position: Reviewer</p>
                    <p className="text-sm text-gray-600">Date: {pro.reviewed_at ? formatDateTime(pro.reviewed_at).split(',')[0] : '________________'}</p>
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">Signature: ________________</p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Approver (2nd Level)</h4>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Name: {pro.approved_by_name || pro.approver_name || '________________'}</p>
                    <p className="text-sm text-gray-600">Position: Approver</p>
                    <p className="text-sm text-gray-600">Date: {pro.approved_at ? formatDateTime(pro.approved_at).split(',')[0] : '________________'}</p>
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">Signature: ________________</p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Supplier Confirmation</h4>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Name: {pro.supplier_name || '________________'}</p>
                    <p className="text-sm text-gray-600">Position: Supplier Representative</p>
                    <p className="text-sm text-gray-600">Date: {pro.confirmed_at ? formatDateTime(pro.confirmed_at).split(',')[0] : '________________'}</p>
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">Signature: ________________</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {pro.notes && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Notes & Remarks</h3>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap">{pro.notes}</p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="border-t-2 border-gray-200 pt-6 text-center">
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                <p className="font-semibold">This is an official MOFAD Energy Solutions Purchase Order</p>
                <p className="mt-1">Generated on {formatDateTime(new Date().toISOString())}</p>
                <p className="mt-2 text-xs">© 2025 MOFAD Energy Solutions</p>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Workflow Confirmation Dialogs */}

      {/* Submit for Review Dialog */}
      <ConfirmDialog
        open={showSubmitDialog}
        onClose={() => setShowSubmitDialog(false)}
        onConfirm={() => submitMutation.mutate()}
        title="Submit PRO for Review"
        message={`Are you sure you want to submit PRO "${pro.pro_number}" for review? It will be sent to ${pro.reviewer_name || 'the assigned reviewer'} for first-level review.`}
        confirmText="Submit for Review"
        confirmVariant="primary"
        isLoading={submitMutation.isPending}
      />

      {/* Review Dialog */}
      <ConfirmDialog
        open={showReviewDialog}
        onClose={() => setShowReviewDialog(false)}
        onConfirm={() => reviewMutation.mutate()}
        title="Review PRO"
        message={`Are you sure you want to approve this review? PRO "${pro.pro_number}" will be forwarded to ${pro.approver_name || 'the assigned approver'} for final approval.`}
        confirmText="Review & Forward"
        confirmVariant="primary"
        isLoading={reviewMutation.isPending}
      />

      {/* Review Reject Dialog */}
      <ConfirmDialog
        open={showReviewRejectDialog}
        onClose={() => {
          setShowReviewRejectDialog(false)
          setRejectionReason('')
        }}
        onConfirm={() => reviewRejectMutation.mutate(rejectionReason)}
        title="Reject PRO at Review Stage"
        message={`Are you sure you want to reject PRO "${pro.pro_number}"? Please provide a reason for rejection.`}
        confirmText="Reject PRO"
        variant="danger"
        isLoading={reviewRejectMutation.isPending}
      >
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rejection Reason
          </label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Enter reason for rejection..."
          />
        </div>
      </ConfirmDialog>

      {/* Approve Dialog */}
      <ConfirmDialog
        open={showApproveDialog}
        onClose={() => setShowApproveDialog(false)}
        onConfirm={() => approveMutation.mutate()}
        title="Approve PRO"
        message={`Are you sure you want to approve PRO "${pro.pro_number}"? Once approved, it can be sent to the supplier.`}
        confirmText="Approve PRO"
        confirmVariant="primary"
        isLoading={approveMutation.isPending}
      />

      {/* Reject at Approval Stage Dialog */}
      <ConfirmDialog
        open={showRejectDialog}
        onClose={() => {
          setShowRejectDialog(false)
          setRejectionReason('')
        }}
        onConfirm={() => rejectMutation.mutate(rejectionReason)}
        title="Reject PRO at Approval Stage"
        message={`Are you sure you want to reject PRO "${pro.pro_number}"? Please provide a reason for rejection.`}
        confirmText="Reject PRO"
        variant="danger"
        isLoading={rejectMutation.isPending}
      >
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rejection Reason
          </label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Enter reason for rejection..."
          />
        </div>
      </ConfirmDialog>

      {/* Send to Supplier Dialog */}
      <ConfirmDialog
        open={showSendDialog}
        onClose={() => setShowSendDialog(false)}
        onConfirm={() => statusMutation.mutate({ status: 'sent' })}
        title="Send PRO to Supplier"
        message={`Are you sure you want to send PRO "${pro.pro_number}" to the supplier? Once sent, the supplier will be notified and the order status will be updated.`}
        confirmText="Send to Supplier"
        confirmVariant="primary"
        isLoading={statusMutation.isPending}
      />

      {/* Confirm Order Dialog */}
      <ConfirmDialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={() => statusMutation.mutate({ status: 'confirmed' })}
        title="Confirm Order"
        message={`Are you sure you want to confirm PRO "${pro.pro_number}"? This indicates that the supplier has accepted the order and will proceed with fulfillment.`}
        confirmText="Confirm Order"
        confirmVariant="primary"
        isLoading={statusMutation.isPending}
      />

      {/* Cancel Dialog */}
      <ConfirmDialog
        open={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={() => statusMutation.mutate({ status: 'cancelled' })}
        title="Cancel Purchase Order"
        message={`Are you sure you want to cancel PRO "${pro.pro_number}"? This action cannot be undone and the order will be marked as cancelled.`}
        confirmText="Cancel Order"
        variant="danger"
        isLoading={statusMutation.isPending}
      />
    </AppLayout>
  )
}
