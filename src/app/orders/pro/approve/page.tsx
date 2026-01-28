'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { useToast } from '@/components/ui/Toast'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  FileCheck,
  AlertTriangle,
} from 'lucide-react'

interface PRO {
  id: number
  pro_number: string
  title: string | null
  description: string | null
  supplier: string | null
  supplier_contact: string | null
  supplier_email: string | null
  supplier_phone: string | null
  total_amount: number | string
  status: 'draft' | 'sent' | 'confirmed' | 'partially_delivered' | 'delivered' | 'cancelled'
  delivery_status: 'pending' | 'partial' | 'completed'
  delivery_location: number | null
  delivery_location_name: string | null
  created_by: number | null
  created_by_name: string | null
  created_at: string
  expected_delivery_date: string | null
  items_count: number
  items: any[]
  payment_terms: string | null
  payment_method: string | null
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending_review':
      return <Clock className="w-4 h-4 text-yellow-500" />
    case 'pending_approval':
      return <Send className="w-4 h-4 text-orange-500" />
    case 'reviewed':
      return <FileCheck className="w-4 h-4 text-blue-500" />
    default:
      return <Clock className="w-4 h-4 text-gray-500" />
  }
}

const getStatusBadge = (status: string) => {
  const colors: Record<string, string> = {
    pending_review: 'bg-yellow-100 text-yellow-800',
    pending_approval: 'bg-orange-100 text-orange-800',
    reviewed: 'bg-blue-100 text-blue-800',
  }

  const labels: Record<string, string> = {
    pending_review: 'Pending Review',
    pending_approval: 'Pending Approval',
    reviewed: 'Reviewed',
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.pending_review}`}>
      {labels[status] || status}
    </span>
  )
}

export default function ApprovePROPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedProId, setSelectedProId] = useState<number | null>(null)
  const [selectedProAction, setSelectedProAction] = useState<'review_reject' | 'reject' | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const pageSize = 20

  // Fetch PROs pending review or approval
  const { data: proData, isLoading } = useQuery({
    queryKey: ['pros-pending-approval', currentPage, searchTerm],
    queryFn: () => apiClient.getPros({
      page: currentPage,
      page_size: pageSize,
      search: searchTerm || undefined,
      status: 'pending_review,pending_approval', // Show PROs pending review or approval
    }),
  })

  // Extract results and pagination info
  const pros: PRO[] = proData?.results || (Array.isArray(proData) ? proData : [])
  const totalCount = proData?.paginator?.count ?? proData?.count ?? pros.length
  const totalPages = proData?.paginator?.total_pages ?? (totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1)

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleView = (id: number) => {
    router.push(`/orders/pro/${id}`)
  }

  // Mutations for approval actions
  const reviewMutation = useMutation({
    mutationFn: (id: number) => apiClient.reviewPro(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pros-pending-approval'] })
      addToast({ type: 'success', title: 'Success', message: 'PRO reviewed and sent to approver' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to review PRO' })
    },
  })

  const approveMutation = useMutation({
    mutationFn: (id: number) => apiClient.approvePro(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pros-pending-approval'] })
      addToast({ type: 'success', title: 'Success', message: 'PRO approved successfully' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to approve PRO' })
    },
  })

  const reviewRejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => apiClient.reviewRejectPro(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pros-pending-approval'] })
      addToast({ type: 'success', title: 'Success', message: 'PRO rejected at review stage' })
      setShowRejectModal(false)
      setRejectionReason('')
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to reject PRO' })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => apiClient.rejectPro(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pros-pending-approval'] })
      addToast({ type: 'success', title: 'Success', message: 'PRO rejected at approval stage' })
      setShowRejectModal(false)
      setRejectionReason('')
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to reject PRO' })
    },
  })

  const handleReview = (id: number) => {
    if (confirm('Are you sure you want to review and send this PRO to approver?')) {
      reviewMutation.mutate(id)
    }
  }

  const handleApprove = (id: number) => {
    if (confirm('Are you sure you want to approve this PRO?')) {
      approveMutation.mutate(id)
    }
  }

  const handleRejectClick = (id: number, action: 'review_reject' | 'reject') => {
    setSelectedProId(id)
    setSelectedProAction(action)
    setShowRejectModal(true)
  }

  const handleRejectConfirm = () => {
    if (!selectedProId || !rejectionReason.trim()) {
      addToast({ type: 'error', title: 'Error', message: 'Please provide a rejection reason' })
      return
    }

    if (selectedProAction === 'review_reject') {
      reviewRejectMutation.mutate({ id: selectedProId, reason: rejectionReason })
    } else {
      rejectMutation.mutate({ id: selectedProId, reason: rejectionReason })
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">View/Approve PRO</h1>
            <p className="text-muted-foreground">Review purchase orders pending your review or approval</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Pending</p>
                  <p className="text-2xl font-bold text-foreground">{totalCount}</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold text-foreground">
                    {pros.filter(p => p.status === 'pending_review').length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileCheck className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                  <p className="text-2xl font-bold text-foreground">
                    {pros.filter(p => p.status === 'pending_approval').length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by PRO number, supplier..."
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PRO Table */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Orders - Awaiting Review/Approval ({totalCount})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : pros.length === 0 ? (
              <div className="text-center py-12">
                <FileCheck className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-foreground">No pending PROs</h3>
                <p className="mt-1 text-sm text-muted-foreground">All purchase orders have been reviewed/approved.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">PRO Number</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Supplier</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Items</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total Amount</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Received Value</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Pending Value</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Created</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pros.map((pro) => {
                      // Calculate received and pending values
                      const items = pro.items || []
                      const receivedValue = items.reduce((sum: number, item: any) => {
                        const received = Number(item.received_quantity || item.quantity_delivered || 0)
                        const unitPrice = Number(item.unit_price || 0)
                        return sum + (received * unitPrice)
                      }, 0)

                      const totalOrderValue = Number(pro.total_amount) || 0
                      const pendingValue = totalOrderValue - receivedValue

                      return (
                        <tr key={pro.id} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(pro.status)}
                              <span className="font-medium text-foreground">{pro.pro_number}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-foreground">{pro.supplier || 'N/A'}</div>
                              {pro.supplier_contact && (
                                <div className="text-sm text-muted-foreground">{pro.supplier_contact}</div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-foreground">{pro.items_count} item(s)</td>
                          <td className="py-3 px-4 text-right font-medium text-foreground">
                            {formatCurrency(totalOrderValue)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-medium text-green-600">
                              {formatCurrency(receivedValue)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className={`font-medium ${pendingValue > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                              {formatCurrency(pendingValue)}
                            </span>
                          </td>
                          <td className="py-3 px-4">{getStatusBadge(pro.status)}</td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-muted-foreground">
                              {formatDateTime(pro.created_at)}
                            </div>
                            {pro.created_by_name && (
                              <div className="text-xs text-muted-foreground">By: {pro.created_by_name}</div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {pro.status === 'pending_review' && (
                                <>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleReview(pro.id)}
                                    title="Review & Send to Approver"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Review
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleRejectClick(pro.id, 'review_reject')}
                                    title="Reject"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              {pro.status === 'pending_approval' && (
                                <>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleApprove(pro.id)}
                                    title="Approve PRO"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleRejectClick(pro.id, 'reject')}
                                    title="Reject"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleView(pro.id)}
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Reject PRO</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Please provide a reason for rejecting this PRO:
            </p>
            <textarea
              className="w-full border border-input rounded-md p-2 min-h-[100px] mb-4"
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectionReason('')
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectConfirm}
                disabled={!rejectionReason.trim()}
              >
                Reject PRO
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
