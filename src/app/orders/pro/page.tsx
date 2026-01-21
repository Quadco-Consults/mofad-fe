'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { formatCurrency, formatDateTime } from '@/lib/utils'
import {
  Plus,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Truck,
  Package,
  Send,
  FileCheck,
  PackageCheck,
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

interface PROStats {
  total: number
  draft: number
  sent: number
  confirmed: number
  partially_delivered: number
  delivered: number
  cancelled: number
  total_value: number
  pending_value: number
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'draft':
      return <Clock className="w-4 h-4 text-gray-500" />
    case 'sent':
      return <Send className="w-4 h-4 text-yellow-500" />
    case 'confirmed':
      return <FileCheck className="w-4 h-4 text-blue-500" />
    case 'partially_delivered':
      return <Truck className="w-4 h-4 text-orange-500" />
    case 'delivered':
      return <PackageCheck className="w-4 h-4 text-green-500" />
    case 'cancelled':
      return <XCircle className="w-4 h-4 text-red-500" />
    default:
      return <Clock className="w-4 h-4 text-gray-500" />
  }
}

const getStatusBadge = (status: string) => {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    partially_delivered: 'bg-orange-100 text-orange-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  const labels: Record<string, string> = {
    draft: 'Draft',
    sent: 'Sent',
    confirmed: 'Confirmed',
    partially_delivered: 'Partial',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.draft}`}>
      {labels[status] || status}
    </span>
  )
}

const getDeliveryBadge = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    partial: 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.pending}`}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending'}
    </span>
  )
}

export default function PROPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deliveryFilter, setDeliveryFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [proToDelete, setProToDelete] = useState<PRO | null>(null)
  const pageSize = 20

  // Fetch PROs with pagination and filters
  const { data: proData, isLoading } = useQuery({
    queryKey: ['pros', currentPage, searchTerm, statusFilter, deliveryFilter],
    queryFn: () => apiClient.getPros({
      page: currentPage,
      page_size: pageSize,
      search: searchTerm || undefined,
      status: statusFilter || undefined,
      delivery_status: deliveryFilter || undefined,
    }),
  })

  // Fetch stats
  const { data: stats } = useQuery<PROStats>({
    queryKey: ['pro-stats'],
    queryFn: () => apiClient.getProStats(),
  })

  // Extract results and pagination info
  const pros: PRO[] = proData?.results || (Array.isArray(proData) ? proData : [])
  const totalCount = proData?.paginator?.count ?? proData?.count ?? pros.length
  const totalPages = proData?.paginator?.total_pages ?? Math.ceil(totalCount / pageSize)

  // Selection hook
  const selection = useSelection<PRO>()

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.deletePro(id),
    onSuccess: () => {
      addToast({ title: 'PRO deleted successfully', type: 'success' })
      queryClient.invalidateQueries({ queryKey: ['pros'] })
      queryClient.invalidateQueries({ queryKey: ['pro-stats'] })
      setShowDeleteModal(false)
      setProToDelete(null)
    },
    onError: (error: any) => {
      addToast({ title: error.message || 'Failed to delete PRO', type: 'error' })
    },
  })

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => apiClient.bulkDeletePros(ids),
    onSuccess: (result) => {
      addToast({ title: `Deleted ${result.deleted_count} PROs successfully`, type: 'success' })
      queryClient.invalidateQueries({ queryKey: ['pros'] })
      queryClient.invalidateQueries({ queryKey: ['pro-stats'] })
      selection.clearSelection()
      setShowBulkDeleteModal(false)
    },
    onError: (error: any) => {
      addToast({ title: error.message || 'Failed to delete PROs', type: 'error' })
    },
  })

  const handleDelete = (pro: PRO) => {
    setProToDelete(pro)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (proToDelete) {
      deleteMutation.mutate(proToDelete.id)
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

  const handleDeliveryFilter = (value: string) => {
    setDeliveryFilter(value)
    setCurrentPage(1)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Purchase Orders (PRO)</h1>
            <p className="text-muted-foreground">Manage purchase orders and supplier communications</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              className="mofad-btn-primary"
              onClick={() => router.push('/orders/pro/create')}
            >
              <Plus className="w-4 h-4 mr-2" />
              New PRO
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total PROs</p>
                  <p className="text-2xl font-bold text-primary">{stats?.total || 0}</p>
                </div>
                <Package className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sent</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats?.sent || 0}</p>
                </div>
                <Send className="w-8 h-8 text-yellow-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Confirmed</p>
                  <p className="text-2xl font-bold text-blue-600">{stats?.confirmed || 0}</p>
                </div>
                <FileCheck className="w-8 h-8 text-blue-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Delivered</p>
                  <p className="text-2xl font-bold text-green-600">{stats?.delivered || 0}</p>
                </div>
                <PackageCheck className="w-8 h-8 text-green-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Value</p>
                  <p className="text-2xl font-bold text-secondary">
                    {formatCurrency(stats?.pending_value || 0)}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-secondary/60" />
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
                    placeholder="Search by PRO number, title, supplier..."
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
                  <option value="sent">Sent</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="partially_delivered">Partially Delivered</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={deliveryFilter}
                  onChange={(e) => handleDeliveryFilter(e.target.value)}
                >
                  <option value="">All Delivery</option>
                  <option value="pending">Pending</option>
                  <option value="partial">Partial</option>
                  <option value="completed">Completed</option>
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
            entityName="PROs"
          />
        )}

        {/* PRO List */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Orders ({totalCount})</CardTitle>
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
            ) : pros.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Purchase Orders</h3>
                <p className="text-muted-foreground mb-4">Get started by creating your first PRO.</p>
                <Button
                  className="mofad-btn-primary"
                  onClick={() => router.push('/orders/pro/create')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create PRO
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
                          checked={selection.isAllSelected(pros)}
                          onChange={() => selection.toggleAll(pros)}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">PRO Number</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Title</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Supplier</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Delivery</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Created</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pros.map((pro) => (
                      <tr key={pro.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selection.isSelected(pro.id)}
                            onChange={() => selection.toggle(pro.id)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {getStatusIcon(pro.status)}
                            <span className="ml-2 font-medium">{pro.pro_number}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{pro.title || '-'}</p>
                            <p className="text-sm text-muted-foreground">{pro.items_count || 0} items</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">{pro.supplier || '-'}</td>
                        <td className="py-3 px-4 font-medium">
                          {formatCurrency(Number(pro.total_amount) || 0)}
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(pro.status)}</td>
                        <td className="py-3 px-4">{getDeliveryBadge(pro.delivery_status)}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {formatDateTime(pro.created_at)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/orders/pro/${pro.id}`)}
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {pro.status === 'draft' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/orders/pro/${pro.id}/edit`)}
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                            {pro.status === 'draft' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(pro)}
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
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
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setProToDelete(null)
        }}
        onConfirm={confirmDelete}
        title="Delete Purchase Order"
        message={`Are you sure you want to delete PRO "${proToDelete?.pro_number}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmDialog
        open={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={confirmBulkDelete}
        title="Delete Selected PROs"
        message={`Are you sure you want to delete ${selection.selectedCount} selected PROs? This action cannot be undone.`}
        confirmText="Delete All"
        variant="danger"
        isLoading={bulkDeleteMutation.isPending}
      />
    </AppLayout>
  )
}
