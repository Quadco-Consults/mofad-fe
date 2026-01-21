'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { BulkActionBar } from '@/components/ui/BulkActionBar'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useSelection } from '@/hooks/useSelection'
import { useToast } from '@/components/ui/Toast'
import apiClient from '@/lib/apiClient'
import { formatDateTime } from '@/lib/utils'
import {
  Plus,
  Search,
  Download,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeftRight,
  Package,
  Building,
  User,
  Truck,
  AlertCircle,
  Send,
  MapPin,
  FileCheck,
} from 'lucide-react'

interface StockTransferItem {
  id: number
  product: number
  product_name: string
  product_code: string
  product_unit: string
  quantity_to_transfer: number | string
  quantity_shipped: number | string
  quantity_received: number | string
  unit_cost: number | string
  total_cost: number | string
  status: string
  quantity_damaged: number | string
  damage_notes: string | null
  batch_number: string | null
  expiry_date: string | null
}

interface StockTransfer {
  id: number
  transfer_number: string
  from_warehouse: number
  from_warehouse_name: string | null
  to_warehouse: number
  to_warehouse_name: string | null
  transfer_date: string | null
  expected_date: string | null
  reason: string | null
  status: 'draft' | 'pending' | 'approved' | 'in_transit' | 'partially_received' | 'completed' | 'cancelled'
  requested_by: number | null
  requested_by_name: string | null
  approved_by: number | null
  approved_by_name: string | null
  shipped_by: number | null
  shipped_by_name: string | null
  received_by: number | null
  received_by_name: string | null
  created_at: string
  approved_at: string | null
  shipped_at: string | null
  received_at: string | null
  carrier: string | null
  tracking_number: string | null
  transport_cost: number | string | null
  notes: string | null
  total_items: number
  total_quantity: number | string
  items: StockTransferItem[]
}

interface TransferStats {
  total: number
  draft: number
  pending: number
  approved: number
  in_transit: number
  partially_received: number
  completed: number
  cancelled: number
  total_transport_cost: number
}

const getStatusBadge = (status: string) => {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    in_transit: 'bg-purple-100 text-purple-800',
    partially_received: 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  const labels: Record<string, string> = {
    draft: 'Draft',
    pending: 'Pending',
    approved: 'Approved',
    in_transit: 'In Transit',
    partially_received: 'Partial',
    completed: 'Completed',
    cancelled: 'Cancelled'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.draft}`}>
      {labels[status] || status}
    </span>
  )
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'draft':
      return <Clock className="w-4 h-4 text-gray-500" />
    case 'pending':
      return <Send className="w-4 h-4 text-yellow-500" />
    case 'approved':
      return <FileCheck className="w-4 h-4 text-blue-500" />
    case 'in_transit':
      return <Truck className="w-4 h-4 text-purple-500" />
    case 'partially_received':
      return <Package className="w-4 h-4 text-orange-500" />
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-500" />
    case 'cancelled':
      return <XCircle className="w-4 h-4 text-red-500" />
    default:
      return <Package className="w-4 h-4 text-gray-500" />
  }
}

// View Transfer Details Modal Component
function ViewTransferModal({ isOpen, onClose, transferId }: { isOpen: boolean; onClose: () => void; transferId: number | null }) {
  const { data: transfer, isLoading, error } = useQuery({
    queryKey: ['transfer-details', transferId],
    queryFn: () => apiClient.getStockTransferById(transferId!),
    enabled: isOpen && !!transferId
  })

  if (!isOpen || !transferId) return null

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Transfer Details</h2>
            <Button variant="ghost" onClick={onClose} className="text-xl">×</Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-gray-500">Loading transfer details...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-500">Error loading transfer details. Please try again.</p>
            </div>
          )}

          {transfer && (
            <div className="space-y-6">
              {/* Transfer Header Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Transfer Number</span>
                    <p className="font-semibold text-gray-900">{transfer.transfer_number}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Status</span>
                    <div className="mt-1">{getStatusBadge(transfer.status)}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Requested By</span>
                    <p className="text-gray-900">{transfer.requested_by_name || '-'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Created</span>
                    <p className="text-gray-900">{formatDateTime(transfer.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Route Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Transfer Route
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">From</p>
                        <p className="text-blue-600 font-semibold">{transfer.from_warehouse_name || `Warehouse ${transfer.from_warehouse}`}</p>
                      </div>
                    </div>

                    <ArrowLeftRight className="w-6 h-6 text-gray-400" />

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Building className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">To</p>
                        <p className="text-green-600 font-semibold">{transfer.to_warehouse_name || `Warehouse ${transfer.to_warehouse}`}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Items */}
              {transfer.items && transfer.items.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Transfer Items ({transfer.items.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {transfer.items.map((item: StockTransferItem) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{item.product_name}</p>
                              <p className="text-sm text-gray-500 font-mono">{item.product_code}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                              {Number(item.quantity_to_transfer).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">{item.product_unit}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {(transfer.notes || transfer.reason) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notes & Reason</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {transfer.reason && <p className="text-gray-700 mb-2"><strong>Reason:</strong> {transfer.reason}</p>}
                    {transfer.notes && <p className="text-gray-700">{transfer.notes}</p>}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <div className="flex justify-end mt-6 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  )

  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null
}

export default function StockTransfersPage() {
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedTransferId, setSelectedTransferId] = useState<number | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [transferToDelete, setTransferToDelete] = useState<StockTransfer | null>(null)
  const pageSize = 20

  // Fetch transfers with pagination
  const { data: transfersData, isLoading } = useQuery({
    queryKey: ['stock-transfers', currentPage, searchTerm, statusFilter],
    queryFn: () => apiClient.getStockTransfers({
      page: currentPage,
      page_size: pageSize,
      search: searchTerm || undefined,
      status: statusFilter || undefined,
    }),
  })

  // Fetch stats
  const { data: stats } = useQuery<TransferStats>({
    queryKey: ['stock-transfer-stats'],
    queryFn: () => apiClient.getStockTransferStats(),
  })

  // Extract results and pagination info
  const transfers: StockTransfer[] = transfersData?.results || (Array.isArray(transfersData) ? transfersData : [])
  const totalCount = transfersData?.paginator?.count ?? transfersData?.count ?? transfers.length
  const totalPages = transfersData?.paginator?.total_pages ?? Math.ceil(totalCount / pageSize)

  // Selection hook
  const selection = useSelection<StockTransfer>()

  // Workflow mutations
  const submitMutation = useMutation({
    mutationFn: (id: number) => apiClient.submitStockTransfer(id),
    onSuccess: () => {
      addToast({ title: 'Transfer submitted for approval', type: 'success' })
      queryClient.invalidateQueries({ queryKey: ['stock-transfers'] })
      queryClient.invalidateQueries({ queryKey: ['stock-transfer-stats'] })
    },
    onError: (error: any) => {
      addToast({ title: error.message || 'Failed to submit transfer', type: 'error' })
    },
  })

  const approveMutation = useMutation({
    mutationFn: (id: number) => apiClient.approveStockTransfer(id),
    onSuccess: () => {
      addToast({ title: 'Transfer approved', type: 'success' })
      queryClient.invalidateQueries({ queryKey: ['stock-transfers'] })
      queryClient.invalidateQueries({ queryKey: ['stock-transfer-stats'] })
    },
    onError: (error: any) => {
      addToast({ title: error.message || 'Failed to approve transfer', type: 'error' })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id: number) => apiClient.rejectStockTransfer(id),
    onSuccess: () => {
      addToast({ title: 'Transfer rejected', type: 'success' })
      queryClient.invalidateQueries({ queryKey: ['stock-transfers'] })
      queryClient.invalidateQueries({ queryKey: ['stock-transfer-stats'] })
    },
    onError: (error: any) => {
      addToast({ title: error.message || 'Failed to reject transfer', type: 'error' })
    },
  })

  const shipMutation = useMutation({
    mutationFn: (id: number) => apiClient.shipStockTransfer(id),
    onSuccess: () => {
      addToast({ title: 'Transfer shipped', type: 'success' })
      queryClient.invalidateQueries({ queryKey: ['stock-transfers'] })
      queryClient.invalidateQueries({ queryKey: ['stock-transfer-stats'] })
    },
    onError: (error: any) => {
      addToast({ title: error.message || 'Failed to ship transfer', type: 'error' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteStockTransfer(id),
    onSuccess: () => {
      addToast({ title: 'Transfer deleted', type: 'success' })
      queryClient.invalidateQueries({ queryKey: ['stock-transfers'] })
      queryClient.invalidateQueries({ queryKey: ['stock-transfer-stats'] })
      setShowDeleteModal(false)
      setTransferToDelete(null)
    },
    onError: (error: any) => {
      addToast({ title: error.message || 'Failed to delete transfer', type: 'error' })
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => apiClient.bulkDeleteStockTransfers(ids),
    onSuccess: (result) => {
      addToast({ title: `Deleted ${result.deleted_count} transfers`, type: 'success' })
      queryClient.invalidateQueries({ queryKey: ['stock-transfers'] })
      queryClient.invalidateQueries({ queryKey: ['stock-transfer-stats'] })
      selection.clearSelection()
      setShowBulkDeleteModal(false)
    },
    onError: (error: any) => {
      addToast({ title: error.message || 'Failed to delete transfers', type: 'error' })
    },
  })

  const handleViewTransfer = (transferId: number) => {
    setSelectedTransferId(transferId)
    setIsViewModalOpen(true)
  }

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false)
    setSelectedTransferId(null)
  }

  const handleDelete = (transfer: StockTransfer) => {
    setTransferToDelete(transfer)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (transferToDelete) {
      deleteMutation.mutate(transferToDelete.id)
    }
  }

  const handleBulkDelete = () => {
    setShowBulkDeleteModal(true)
  }

  const confirmBulkDelete = () => {
    const ids = selection.selectedIds.map(id => Number(id))
    bulkDeleteMutation.mutate(ids)
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Stock Transfers</h1>
            <p className="text-muted-foreground">Manage inventory transfers between warehouses</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              className="mofad-btn-primary"
              onClick={() => window.location.href = '/inventory/transfers/create'}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Transfer
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Transfers</p>
                  <p className="text-2xl font-bold text-primary">{stats?.total || 0}</p>
                </div>
                <ArrowLeftRight className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Transit</p>
                  <p className="text-2xl font-bold text-purple-600">{stats?.in_transit || 0}</p>
                </div>
                <Truck className="w-8 h-8 text-purple-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats?.completed || 0}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600">{stats?.cancelled || 0}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by transfer number, reason..."
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <select
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={statusFilter}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="in_transit">In Transit</option>
                  <option value="partially_received">Partially Received</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Action Bar */}
        {selection.selectedCount > 0 && (
          <BulkActionBar
            selectedCount={selection.selectedCount}
            onClearSelection={selection.clearSelection}
            onBulkDelete={handleBulkDelete}
            isDeleting={bulkDeleteMutation.isPending}
            entityName="transfers"
          />
        )}

        {/* Transfers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Transfers ({totalCount})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-muted rounded-md"></div>
                  </div>
                ))}
              </div>
            ) : transfers.length === 0 ? (
              <div className="text-center py-12">
                <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Stock Transfers</h3>
                <p className="text-muted-foreground mb-4">Get started by creating your first transfer.</p>
                <Button
                  className="mofad-btn-primary"
                  onClick={() => window.location.href = '/inventory/transfers/create'}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Transfer
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selection.isAllSelected(transfers)}
                          onChange={() => selection.toggleAll(transfers)}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Transfer #</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Route</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Items</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Requested By</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Created</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transfers.map((transfer) => (
                      <tr key={transfer.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selection.isSelected(transfer.id)}
                            onChange={() => selection.toggle(transfer.id)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(transfer.status)}
                            <span className="font-medium">{transfer.transfer_number}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div className="flex items-center gap-1 text-blue-600">
                              <Building className="w-3 h-3" />
                              <span className="font-medium">{transfer.from_warehouse_name || `Warehouse ${transfer.from_warehouse}`}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1 text-green-600">
                              <ArrowLeftRight className="w-3 h-3" />
                              <span>{transfer.to_warehouse_name || `Warehouse ${transfer.to_warehouse}`}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-medium">{transfer.total_items || 0}</span>
                          <span className="text-xs text-muted-foreground ml-1">items</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(transfer.status)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 text-gray-400" />
                            <span className="text-sm">{transfer.requested_by_name || '-'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {formatDateTime(transfer.created_at)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1 justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewTransfer(transfer.id)}
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>

                            {transfer.status === 'draft' && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                  onClick={() => submitMutation.mutate(transfer.id)}
                                  disabled={submitMutation.isPending}
                                  title="Submit for Approval"
                                >
                                  <Send className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(transfer)}
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}

                            {transfer.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => approveMutation.mutate(transfer.id)}
                                  disabled={approveMutation.isPending}
                                  title="Approve"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => rejectMutation.mutate(transfer.id)}
                                  disabled={rejectMutation.isPending}
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}

                            {transfer.status === 'approved' && (
                              <Button
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                                onClick={() => shipMutation.mutate(transfer.id)}
                                disabled={shipMutation.isPending}
                                title="Mark as Shipped"
                              >
                                <Truck className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
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
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Transfer Modal */}
        <ViewTransferModal
          isOpen={isViewModalOpen}
          onClose={handleCloseViewModal}
          transferId={selectedTransferId}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmDialog
          open={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setTransferToDelete(null)
          }}
          onConfirm={confirmDelete}
          title="Delete Stock Transfer"
          message={`Are you sure you want to delete transfer "${transferToDelete?.transfer_number}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="danger"
          isLoading={deleteMutation.isPending}
        />

        {/* Bulk Delete Confirmation Modal */}
        <ConfirmDialog
          open={showBulkDeleteModal}
          onClose={() => setShowBulkDeleteModal(false)}
          onConfirm={confirmBulkDelete}
          title="Delete Selected Transfers"
          message={`Are you sure you want to delete ${selection.selectedCount} selected transfers? This action cannot be undone.`}
          confirmText="Delete All"
          variant="danger"
          isLoading={bulkDeleteMutation.isPending}
        />
      </div>
    </AppLayout>
  )
}
