'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import apiClient from '@/lib/apiClient'
import { formatCurrency } from '@/lib/utils'
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Truck,
  FileText,
  AlertTriangle,
  Edit,
  Send,
  Download,
  Image as ImageIcon,
} from 'lucide-react'
import type {
  SupplierReturnNote,
  SRNApproveData,
  SRNRejectData,
  SRNPickupData,
  SRNReplacementData,
  SRNRefundData,
} from '@/types/supplier-returns'
import { getStatusLabel, getStatusColor, getReturnTypeLabel, getResolutionTypeLabel } from '@/types/supplier-returns'

export default function SupplierReturnDetailPage() {
  const router = useRouter()
  const params = useParams()
  const queryClient = useQueryClient()
  const id = params.id as string

  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showPickupModal, setShowPickupModal] = useState(false)
  const [showReplacementModal, setShowReplacementModal] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)

  // Fetch SRN details
  const { data: srn, isLoading } = useQuery({
    queryKey: ['supplier-return', id],
    queryFn: async () => {
      const response = await apiClient.get(`/supplier-returns/${id}/`)
      return response as SupplierReturnNote
    },
  })

  // Submit for approval mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`/supplier-returns/${id}/submit/`)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-return', id] })
      queryClient.invalidateQueries({ queryKey: ['supplier-returns'] })
    },
  })

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (data: SRNApproveData) => {
      const response = await apiClient.post(`/supplier-returns/${id}/approve/`, data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-return', id] })
      queryClient.invalidateQueries({ queryKey: ['supplier-returns'] })
      setShowApproveModal(false)
    },
  })

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async (data: SRNRejectData) => {
      const response = await apiClient.post(`/supplier-returns/${id}/reject/`, data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-return', id] })
      queryClient.invalidateQueries({ queryKey: ['supplier-returns'] })
      setShowRejectModal(false)
    },
  })

  // Pickup mutation
  const pickupMutation = useMutation({
    mutationFn: async (data: SRNPickupData) => {
      const response = await apiClient.post(`/supplier-returns/${id}/pickup/`, data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-return', id] })
      queryClient.invalidateQueries({ queryKey: ['supplier-returns'] })
      setShowPickupModal(false)
    },
  })

  // Replacement mutation
  const replacementMutation = useMutation({
    mutationFn: async (data: SRNReplacementData) => {
      const response = await apiClient.post(`/supplier-returns/${id}/replacement/`, data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-return', id] })
      queryClient.invalidateQueries({ queryKey: ['supplier-returns'] })
      setShowReplacementModal(false)
    },
  })

  // Refund mutation
  const refundMutation = useMutation({
    mutationFn: async (data: SRNRefundData) => {
      const response = await apiClient.post(`/supplier-returns/${id}/refund/`, data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-return', id] })
      queryClient.invalidateQueries({ queryKey: ['supplier-returns'] })
      setShowRefundModal(false)
    },
  })

  // Close mutation
  const closeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`/supplier-returns/${id}/close/`)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-return', id] })
      queryClient.invalidateQueries({ queryKey: ['supplier-returns'] })
    },
  })

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-mofad-green"></div>
        </div>
      </AppLayout>
    )
  }

  if (!srn) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Supplier return not found</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{srn.srn_number}</h1>
              <p className="text-gray-600">{srn.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-4 py-2 rounded-lg font-medium ${getStatusColor(srn.status)}`}>
              {getStatusLabel(srn.status)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 flex-wrap">
              {srn.status === 'draft' && (
                <Button
                  onClick={() => submitMutation.mutate()}
                  disabled={submitMutation.isPending}
                  className="bg-mofad-green hover:bg-mofad-green/90 text-white"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit for Approval
                </Button>
              )}

              {srn.can_approve && (
                <Button
                  onClick={() => setShowApproveModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              )}

              {srn.can_reject && (
                <Button
                  onClick={() => setShowRejectModal(true)}
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              )}

              {srn.can_pickup && (
                <Button
                  onClick={() => setShowPickupModal(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Record Pickup
                </Button>
              )}

              {srn.status === 'replacement_pending' && (
                <Button
                  onClick={() => setShowReplacementModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Record Replacement
                </Button>
              )}

              {srn.status === 'refund_requested' && (
                <Button
                  onClick={() => setShowRefundModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Record Refund
                </Button>
              )}

              {(srn.status === 'replacement_received' || srn.status === 'refunded' || srn.status === 'picked_up') && (
                <Button
                  onClick={() => closeMutation.mutate()}
                  disabled={closeMutation.isPending}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Close Return
                </Button>
              )}

              {srn.debit_note_number && (
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Debit Note
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Return Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Return Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">PRO Number</p>
                <p className="font-medium">{srn.pro_number}</p>
              </div>
              {srn.grn_number && (
                <div>
                  <p className="text-sm text-gray-600">GRN Number</p>
                  <p className="font-medium">{srn.grn_number}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Warehouse</p>
                <p className="font-medium">{srn.warehouse_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Return Type</p>
                <p className="font-medium">{getReturnTypeLabel(srn.return_type)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Resolution Type</p>
                <p className="font-medium">{getResolutionTypeLabel(srn.resolution_type)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="font-medium">{srn.description}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supplier Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Supplier Name</p>
                <p className="font-medium">{srn.supplier}</p>
              </div>
              {srn.supplier_contact && (
                <div>
                  <p className="text-sm text-gray-600">Contact Person</p>
                  <p className="font-medium">{srn.supplier_contact}</p>
                </div>
              )}
              {srn.supplier_phone && (
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{srn.supplier_phone}</p>
                </div>
              )}
              {srn.supplier_email && (
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{srn.supplier_email}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Quantity</p>
                <p className="text-2xl font-bold text-gray-900">{srn.total_quantity}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Return Value</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(parseFloat(srn.total_return_value))}
                </p>
              </div>
              {srn.debit_note_number && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Debit Note</p>
                  <p className="text-lg font-bold text-blue-600">{srn.debit_note_number}</p>
                </div>
              )}
              {srn.refund_amount && parseFloat(srn.refund_amount) > 0 && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Refund Amount</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(parseFloat(srn.refund_amount))}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle>Returned Items ({srn.items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Quantity</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Unit Cost</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Total Value</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Condition</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Defect</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Photos</th>
                  </tr>
                </thead>
                <tbody>
                  {srn.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{item.product_name}</p>
                        <p className="text-sm text-gray-500">{item.product_sku}</p>
                        {item.batch_number && (
                          <p className="text-sm text-gray-500">Batch: {item.batch_number}</p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {item.quantity_returned} {item.product_unit}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(parseFloat(item.unit_cost))}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(parseFloat(item.total_value))}
                      </td>
                      <td className="py-3 px-4">
                        {item.packaging_condition && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {item.packaging_condition}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-900">{item.defect_description}</p>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.damage_photos && item.damage_photos.length > 0 ? (
                          <Button variant="ghost" size="sm">
                            <ImageIcon className="h-4 w-4" />
                            <span className="ml-1">{item.damage_photos.length}</span>
                          </Button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="w-0.5 h-full bg-gray-200" />
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium">Created</p>
                  <p className="text-sm text-gray-600">
                    {new Date(srn.created_at).toLocaleString()} by {srn.created_by_name}
                  </p>
                </div>
              </div>

              {srn.submitted_at && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Send className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="w-0.5 h-full bg-gray-200" />
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium">Submitted for Approval</p>
                    <p className="text-sm text-gray-600">
                      {new Date(srn.submitted_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {srn.approved_at && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="w-0.5 h-full bg-gray-200" />
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium">Approved</p>
                    <p className="text-sm text-gray-600">
                      {new Date(srn.approved_at).toLocaleString()} by {srn.approved_by_name}
                    </p>
                    {srn.debit_note_number && (
                      <p className="text-sm text-gray-600">Debit Note: {srn.debit_note_number}</p>
                    )}
                  </div>
                </div>
              )}

              {srn.picked_up_date && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <Truck className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="w-0.5 h-full bg-gray-200" />
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium">Picked Up</p>
                    <p className="text-sm text-gray-600">
                      {new Date(srn.picked_up_date).toLocaleDateString()} by {srn.picked_up_by}
                    </p>
                    {srn.pickup_vehicle_number && (
                      <p className="text-sm text-gray-600">Vehicle: {srn.pickup_vehicle_number}</p>
                    )}
                  </div>
                </div>
              )}

              {srn.replacement_received_date && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Package className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="w-0.5 h-full bg-gray-200" />
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium">Replacement Received</p>
                    <p className="text-sm text-gray-600">
                      {new Date(srn.replacement_received_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {srn.refund_date && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="w-0.5 h-full bg-gray-200" />
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium">Refund Received</p>
                    <p className="text-sm text-gray-600">
                      {new Date(srn.refund_date).toLocaleDateString()} - {formatCurrency(parseFloat(srn.refund_amount))}
                    </p>
                    {srn.refund_reference && (
                      <p className="text-sm text-gray-600">Ref: {srn.refund_reference}</p>
                    )}
                  </div>
                </div>
              )}

              {srn.closed_at && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Closed</p>
                    <p className="text-sm text-gray-600">
                      {new Date(srn.closed_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        {showApproveModal && (
          <ApproveModal
            onClose={() => setShowApproveModal(false)}
            onSubmit={(data) => approveMutation.mutate(data)}
            isPending={approveMutation.isPending}
          />
        )}

        {showRejectModal && (
          <RejectModal
            onClose={() => setShowRejectModal(false)}
            onSubmit={(data) => rejectMutation.mutate(data)}
            isPending={rejectMutation.isPending}
          />
        )}

        {showPickupModal && (
          <PickupModal
            onClose={() => setShowPickupModal(false)}
            onSubmit={(data) => pickupMutation.mutate(data)}
            isPending={pickupMutation.isPending}
          />
        )}

        {showReplacementModal && (
          <ReplacementModal
            onClose={() => setShowReplacementModal(false)}
            onSubmit={(data) => replacementMutation.mutate(data)}
            isPending={replacementMutation.isPending}
          />
        )}

        {showRefundModal && (
          <RefundModal
            onClose={() => setShowRefundModal(false)}
            onSubmit={(data) => refundMutation.mutate(data)}
            isPending={refundMutation.isPending}
            totalValue={parseFloat(srn.total_return_value)}
          />
        )}
      </div>
    </AppLayout>
  )
}

// Modal Components
function ApproveModal({
  onClose,
  onSubmit,
  isPending,
}: {
  onClose: () => void
  onSubmit: (data: SRNApproveData) => void
  isPending: boolean
}) {
  const [notes, setNotes] = useState('')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">Approve Supplier Return</h3>
        <p className="text-gray-600 mb-4">
          This will approve the return and generate a debit note. Are you sure?
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Approval Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Any notes..."
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={() => onSubmit({ notes: notes || undefined })}
            disabled={isPending}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isPending ? 'Approving...' : 'Approve'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function RejectModal({
  onClose,
  onSubmit,
  isPending,
}: {
  onClose: () => void
  onSubmit: (data: SRNRejectData) => void
  isPending: boolean
}) {
  const [reason, setReason] = useState('')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">Reject Supplier Return</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rejection Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Please provide a reason for rejection..."
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={() => onSubmit({ reason })}
            disabled={isPending || !reason}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isPending ? 'Rejecting...' : 'Reject'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function PickupModal({
  onClose,
  onSubmit,
  isPending,
}: {
  onClose: () => void
  onSubmit: (data: SRNPickupData) => void
  isPending: boolean
}) {
  const [formData, setFormData] = useState<SRNPickupData>({
    pickup_date: new Date().toISOString().split('T')[0],
    picked_up_by: '',
    vehicle_number: '',
    notes: '',
  })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">Record Supplier Pickup</h3>
        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pickup Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.pickup_date}
              onChange={(e) => setFormData({ ...formData, pickup_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Picked Up By <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.picked_up_by}
              onChange={(e) => setFormData({ ...formData, picked_up_by: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Supplier representative name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Number
            </label>
            <input
              type="text"
              value={formData.vehicle_number}
              onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Optional notes..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={() => onSubmit(formData)}
            disabled={isPending || !formData.pickup_date || !formData.picked_up_by}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isPending ? 'Recording...' : 'Record Pickup'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function ReplacementModal({
  onClose,
  onSubmit,
  isPending,
}: {
  onClose: () => void
  onSubmit: (data: SRNReplacementData) => void
  isPending: boolean
}) {
  const [grnId, setGrnId] = useState('')
  const [notes, setNotes] = useState('')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">Record Replacement Receipt</h3>
        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GRN ID <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={grnId}
              onChange={(e) => setGrnId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter GRN ID for replacement goods"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Optional notes..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={() => onSubmit({ grn_id: parseInt(grnId), notes: notes || undefined })}
            disabled={isPending || !grnId}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isPending ? 'Recording...' : 'Record Replacement'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function RefundModal({
  onClose,
  onSubmit,
  isPending,
  totalValue,
}: {
  onClose: () => void
  onSubmit: (data: SRNRefundData) => void
  isPending: boolean
  totalValue: number
}) {
  const [formData, setFormData] = useState<SRNRefundData>({
    amount: totalValue.toString(),
    refund_date: new Date().toISOString().split('T')[0],
    reference: '',
  })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">Record Refund Receipt</h3>
        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Refund Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <p className="text-sm text-gray-500 mt-1">Total return value: {formatCurrency(totalValue)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Refund Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.refund_date}
              onChange={(e) => setFormData({ ...formData, refund_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference Number
            </label>
            <input
              type="text"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Transaction reference"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={() => onSubmit(formData)}
            disabled={isPending || !formData.amount || !formData.refund_date}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isPending ? 'Recording...' : 'Record Refund'}
          </Button>
        </div>
      </div>
    </div>
  )
}
