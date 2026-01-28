'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { PRF } from '@/types/api'
import {
  ArrowLeft,
  Download,
  Printer,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Building,
  User,
  Calendar,
  MapPin,
  Package,
  Hash,
  FileText,
  Phone,
  Mail,
  ThumbsUp,
  ThumbsDown,
  Send,
  X,
  Loader2
} from 'lucide-react'

// Helper functions for localStorage management (same as in main PRF page)
const getMockPRFs = (): PRF[] => {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem('mofad_mock_prfs')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error reading PRFs from localStorage:', error)
  }

  return []
}

// Status badge component
const getStatusBadge = (status: string) => {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800 border-gray-300',
    pending_review: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    reviewed: 'bg-blue-100 text-blue-800 border-blue-300',
    pending_approval: 'bg-orange-100 text-orange-800 border-orange-300',
    approved: 'bg-green-100 text-green-800 border-green-300',
    rejected: 'bg-red-100 text-red-800 border-red-300',
    partially_fulfilled: 'bg-purple-100 text-purple-800 border-purple-300',
    fulfilled: 'bg-green-200 text-green-900 border-green-400',
    cancelled: 'bg-gray-200 text-gray-700 border-gray-400',
  }

  const labels: Record<string, string> = {
    draft: 'DRAFT',
    pending_review: 'PENDING REVIEW',
    reviewed: 'REVIEWED',
    pending_approval: 'PENDING APPROVAL',
    approved: 'APPROVED',
    rejected: 'REJECTED',
    partially_fulfilled: 'PARTIALLY FULFILLED',
    fulfilled: 'FULFILLED',
    cancelled: 'CANCELLED',
  }

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${colors[status] || colors.draft}`}>
      {labels[status] || status.toUpperCase()}
    </span>
  )
}

export default function PRFViewPage() {
  const router = useRouter()
  const params = useParams()
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const printRef = useRef<HTMLDivElement>(null)

  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectAction, setRejectAction] = useState<'review' | 'approve'>('review')
  const [rejectionReason, setRejectionReason] = useState('')

  const prfId = params?.id ? parseInt(params.id as string) : null

  // Fetch PRF from API with localStorage fallback
  const { data: prf, isLoading } = useQuery({
    queryKey: ['prf-detail', prfId],
    queryFn: async () => {
      if (!prfId) return null
      try {
        // Try API first using typed method
        return await apiClient.getPrfById(prfId)
      } catch (error) {
        // Fallback to localStorage
        const mockPRFs = getMockPRFs()
        const foundPRF = mockPRFs.find(p => p.id === prfId)
        return foundPRF || null
      }
    },
    enabled: !!prfId,
  })

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: () => apiClient.submitPrf(prfId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prf-detail', prfId] })
      addToast({ type: 'success', title: 'Success', message: 'PRF submitted for review' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to submit PRF' })
    }
  })

  // Review mutation
  const reviewMutation = useMutation({
    mutationFn: () => apiClient.reviewPrf(prfId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prf-detail', prfId] })
      addToast({ type: 'success', title: 'Success', message: 'PRF reviewed and sent for approval' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to review PRF' })
    }
  })

  // Review Reject mutation
  const reviewRejectMutation = useMutation({
    mutationFn: (reason: string) => apiClient.reviewRejectPrf(prfId!, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prf-detail', prfId] })
      setShowRejectModal(false)
      setRejectionReason('')
      addToast({ type: 'info', title: 'Rejected', message: 'PRF has been rejected during review' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to reject PRF' })
    }
  })

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: () => apiClient.approvePrf(prfId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prf-detail', prfId] })
      addToast({ type: 'success', title: 'Approved', message: 'PRF has been approved' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to approve PRF' })
    }
  })

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: (reason: string) => apiClient.rejectPrf(prfId!, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prf-detail', prfId] })
      setShowRejectModal(false)
      setRejectionReason('')
      addToast({ type: 'info', title: 'Rejected', message: 'PRF has been rejected' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to reject PRF' })
    }
  })

  // Handler functions
  const handleSubmit = () => submitMutation.mutate()
  const handleReview = () => reviewMutation.mutate()
  const handleApprove = () => approveMutation.mutate()

  const handleReviewReject = () => {
    setRejectAction('review')
    setShowRejectModal(true)
  }

  const handleApprovalReject = () => {
    setRejectAction('approve')
    setShowRejectModal(true)
  }

  const confirmReject = () => {
    if (!rejectionReason.trim()) {
      addToast({ type: 'error', title: 'Error', message: 'Please provide a rejection reason' })
      return
    }

    if (rejectAction === 'review') {
      reviewRejectMutation.mutate(rejectionReason)
    } else {
      rejectMutation.mutate(rejectionReason)
    }
  }


  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>PRF ${prf?.prf_number}</title>
              <style>
                * { box-sizing: border-box; }
                body {
                  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
                  margin: 0;
                  padding: 0;
                  line-height: 1.5;
                  color: #1f2937;
                  background: white;
                }
                .bg-gradient-to-r {
                  background: linear-gradient(90deg, #D4AF37, #B8941F);
                  color: white;
                  padding: 30px;
                  margin-bottom: 0;
                }
                .text-white { color: white !important; }
                .text-blue-100 { color: rgba(252, 233, 106, 0.8); }
                .bg-white { background: white; }
                .rounded-lg { border-radius: 8px; }
                .p-3 { padding: 12px; }
                .w-16, .h-16 { width: 64px; height: 64px; }
                .bg-blue-600 { background: #2563eb; }
                .text-2xl { font-size: 24px; }
                .text-3xl { font-size: 30px; }
                .font-bold { font-weight: bold; }
                .flex { display: flex; }
                .items-center { align-items: center; }
                .gap-6 { gap: 24px; }
                .gap-4 { gap: 16px; }
                .gap-3 { gap: 12px; }
                .mt-1, .mt-2 { margin-top: 8px; }
                .mt-8 { margin-top: 32px; }
                .pt-4 { padding-top: 16px; }
                .border-t { border-top: 1px solid rgba(59, 130, 246, 0.3); }
                .tracking-wide { letter-spacing: 0.05em; }
                .justify-between { justify-content: space-between; }
                .bg-white\\/20 { background: rgba(255, 255, 255, 0.2); }
                .px-4, .py-2 { padding: 8px 16px; }
                .border { border: 1px solid rgba(255, 255, 255, 0.3); }
                .text-sm { font-size: 14px; }
                .p-8 { padding: 32px; }
                .grid { display: grid; }
                .grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
                .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
                .bg-gray-50 { background: #f9fafb; }
                .border-gray-200 { border: 1px solid #e5e7eb; }
                .text-gray-600 { color: #6b7280; }
                .text-gray-900 { color: #111827; }
                .uppercase { text-transform: uppercase; }
                .mb-2, .mb-6, .mb-8 { margin-bottom: 16px; }
                .font-medium { font-weight: 500; }
                .font-semibold { font-weight: 600; }
                .w-8, .h-8 { width: 32px; height: 32px; }
                .bg-blue-100 { background: #dbeafe; }
                .text-blue-600 { color: #2563eb; }
                .text-xl { font-size: 20px; }
                .overflow-hidden { overflow: hidden; }
                table { width: 100%; border-collapse: collapse; margin: 16px 0; }
                th, td {
                  border: 1px solid #e5e7eb;
                  padding: 12px 16px;
                  text-align: left;
                }
                th {
                  background: #f9fafb;
                  font-weight: 600;
                  text-transform: uppercase;
                  font-size: 12px;
                  letter-spacing: 0.05em;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .hover\\:bg-gray-50:hover { background: #f9fafb; }
                .bg-blue-50 { background: #eff6ff; }
                .border-t-2 { border-top: 2px solid #3b82f6; }
                .text-blue-600 { color: #2563eb; }
                .border-gray-200 { border: 1px solid #e5e7eb; }
                .space-y-1 > * + * { margin-top: 4px; }
                .text-xs { font-size: 12px; }
                .text-gray-500 { color: #6b7280; }

                @media print {
                  @page {
                    size: A4;
                    margin: 0.5in 0.4in;
                    padding: 0;
                  }

                  body {
                    margin: 0 !important;
                    padding: 0 !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    font-size: 12px !important;
                    line-height: 1.3 !important;
                  }

                  .print-container {
                    max-width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                  }

                  .bg-gradient-to-r {
                    background: linear-gradient(90deg, #D4AF37, #B8941F) !important;
                    color: white !important;
                    padding: 15px !important;
                    margin: 0 !important;
                  }

                  .p-8 { padding: 12px !important; }
                  .p-6 { padding: 8px !important; }
                  .p-4 { padding: 6px !important; }
                  .gap-6 { gap: 8px !important; }
                  .gap-4 { gap: 6px !important; }
                  .gap-3 { gap: 4px !important; }
                  .mb-8 { margin-bottom: 12px !important; }
                  .mb-6 { margin-bottom: 8px !important; }
                  .mb-4 { margin-bottom: 6px !important; }
                  .mt-6 { margin-top: 8px !important; }

                  .no-print { display: none !important; }
                  .rounded-xl, .rounded-lg { border-radius: 0 !important; }
                  .shadow-lg, .shadow-xl { box-shadow: none !important; }

                  table {
                    width: 100% !important;
                    border-collapse: collapse !important;
                    font-size: 11px !important;
                  }

                  th, td {
                    border: 1px solid #e5e7eb !important;
                    padding: 6px 8px !important;
                    text-align: left !important;
                  }

                  .text-3xl { font-size: 18px !important; }
                  .text-2xl { font-size: 16px !important; }
                  .text-xl { font-size: 14px !important; }
                  .text-lg { font-size: 13px !important; }
                  .text-base { font-size: 12px !important; }
                  .text-sm { font-size: 11px !important; }
                  .text-xs { font-size: 10px !important; }
                }
              </style>
            </head>
            <body>
              ${printRef.current.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  const handleDownloadPDF = async () => {
    if (!printRef.current) return

    // Enhanced print-to-PDF approach with better styling
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>PRF ${prf?.prf_number || 'Document'}</title>
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
              background: #f3f4f6 !important;
              font-weight: 600 !important;
              font-size: 10px !important;
              text-transform: uppercase !important;
            }
            .total-row {
              background: #fef3cd !important;
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!prf) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-12">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">PRF Not Found</h2>
          <p className="text-gray-600 mb-4">The requested Purchase Requisition Form could not be found.</p>
          <Button onClick={() => router.push('/orders/prf')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to PRFs
          </Button>
        </div>
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200 no-print">
          <div className="flex items-center gap-4">
            <Button onClick={() => router.push('/orders/prf')} variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to PRFs
            </Button>
            <div className="border-l border-gray-300 pl-4">
              <h1 className="text-xl font-semibold text-gray-900">PRF #{prf.prf_number}</h1>
              <p className="text-gray-600 text-sm">Purchase Requisition Form Details</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Print
            </Button>
            <Button onClick={handleDownloadPDF} className="text-white flex items-center gap-2" style={{ backgroundColor: '#D4AF37', '&:hover': { backgroundColor: '#B8941F' } }} onMouseEnter={(e) => e.target.style.backgroundColor = '#B8941F'} onMouseLeave={(e) => e.target.style.backgroundColor = '#D4AF37'}>
              <Download className="w-4 h-4" />
              Download PDF
            </Button>

            {/* Approval Workflow Buttons */}
            {prf.status === 'draft' && (
              <Button
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                {submitMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Submit for Review
              </Button>
            )}

            {prf.status === 'pending_review' && (
              <>
                <Button
                  onClick={handleReview}
                  disabled={reviewMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  {reviewMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Review & Send to Approver
                </Button>
                <Button
                  onClick={handleReviewReject}
                  disabled={reviewRejectMutation.isPending}
                  className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
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

            {prf.status === 'pending_approval' && (
              <>
                <Button
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  {approveMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ThumbsUp className="w-4 h-4" />
                  )}
                  Approve
                </Button>
                <Button
                  onClick={handleApprovalReject}
                  disabled={rejectMutation.isPending}
                  className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                >
                  {rejectMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ThumbsDown className="w-4 h-4" />
                  )}
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>

        {/* PRF Document */}
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
                    <p className="font-bold text-lg">{prf.prf_number}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/20">
                <div className="flex items-center gap-4">
                  <div className="w-1 h-8 bg-white/80 rounded-full"></div>
                  <h2 className="text-3xl font-bold tracking-wide">PURCHASE REQUEST FORM</h2>
                </div>
              </div>
            </div>
          </div>

          {/* Document Content */}
          <div className="p-8">
            {/* Request Information Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E8F4F0' }}>
                  <FileText className="w-5 h-5 text-green-700" style={{ color: '#1B4F3A' }} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Request Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide block mb-2">Date of Request</label>
                  <p className="text-base font-medium text-gray-900">{formatDateTime((prf as any).order_date || new Date().toISOString()).split(',')[0]}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide block mb-2">Deliver To</label>
                  <p className="text-base font-medium text-gray-900">{(prf as any).customer_location_name || 'MOFAD Headquarters'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide block mb-2">Customer</label>
                  <p className="text-base font-medium text-gray-900">
                    {(prf as any).customer_name || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {`Client Type: ${(prf as any).client_type === "1" ? "Regular" : (prf as any).client_type || 'N/A'}`}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide block mb-2">Priority Level</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    prf.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    prf.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    prf.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {prf.priority?.toUpperCase()}
                  </span>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide block mb-2">Status</label>
                  {getStatusBadge(prf.status)}
                </div>

              </div>
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
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-800 uppercase tracking-wide border-r border-gray-300">Qty</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-800 uppercase tracking-wide border-r border-gray-300">Unit Cost</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-800 uppercase tracking-wide">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {((prf as any).order_snapshot || []).map((item: any, index: number) => (
                      <tr key={index} className={`border-b border-gray-200 transition-colors ${
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
                        <td className="px-6 py-4 text-center font-bold text-lg text-gray-900 border-r border-gray-200">{item.product_quantity}</td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900 border-r border-gray-200">{formatCurrency(item.product_price)}</td>
                        <td className="px-6 py-4 text-right font-bold text-lg" style={{ color: '#1B4F3A' }}>{formatCurrency(parseFloat(item.product_price) * parseFloat(item.product_quantity))}</td>
                      </tr>
                    ))}
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
                          {formatCurrency(prf.estimated_total)}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {((prf as any).order_snapshot || []).length} item(s)
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Requested By</h4>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Name: Admin User</p>
                    <p className="text-sm text-gray-600">Position: System Administrator</p>
                    <p className="text-sm text-gray-600">Date: {formatDateTime(new Date().toISOString()).split(',')[0]}</p>
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">Signature: ________________</p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Department Head</h4>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Name: ________________</p>
                    <p className="text-sm text-gray-600">Position: Department Head</p>
                    <p className="text-sm text-gray-600">Date: ________________</p>
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">Signature: ________________</p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Finance Approval</h4>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Name: ________________</p>
                    <p className="text-sm text-gray-600">Position: Finance Manager</p>
                    <p className="text-sm text-gray-600">Date: ________________</p>
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">Signature: ________________</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-gray-200 pt-6 text-center">
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                <p className="font-semibold">This is an official MOFAD Energy Solutions Purchase Request Form</p>
                <p className="mt-1">Generated on {formatDateTime(new Date().toISOString())}</p>
                <p className="mt-2 text-xs">© 2025 MOFAD Energy Solutions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rejection Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full m-4">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-red-600">
                  Reject PRF
                </h2>
                <Button variant="ghost" onClick={() => setShowRejectModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-100">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{prf?.prf_number}</h3>
                    <p className="text-sm text-gray-600">{prf?.title}</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  Please provide a reason for rejecting this PRF.
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 p-6 border-t">
                <Button variant="outline" onClick={() => setShowRejectModal(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={confirmReject}
                  disabled={
                    !rejectionReason.trim() ||
                    reviewRejectMutation.isPending ||
                    rejectMutation.isPending
                  }
                >
                  {(reviewRejectMutation.isPending || rejectMutation.isPending) ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  Reject
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}