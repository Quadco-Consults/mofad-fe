'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  DollarSign,
  Building,
  X,
  ArrowDownLeft,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Store,
  Wrench,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { AppLayout } from '@/components/layout/AppLayout'
import { useToast } from '@/components/ui/Toast'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Lodgement {
  id: number
  lodgement_number: string
  lodgement_type: 'substore' | 'lubebay' | 'customer'
  entity_name?: string
  substore?: number
  substore_name?: string
  lubebay?: number
  lubebay_name?: string
  customer?: number
  customer_name?: string
  expected_amount: number
  amount_lodged: number
  variance: number
  lodgement_date: string
  payment_method: string
  bank_name?: string
  account_number?: string
  deposit_slip_number?: string
  reference_number?: string
  transaction_reference?: string
  description?: string
  notes?: string
  variance_reason?: string
  approval_status: string
  rejection_reason?: string
  lodged_by_name?: string
  approved_by_name?: string
  created_at: string
}

interface LodgementFormData {
  lodgement_type: 'substore' | 'lubebay' | 'customer'
  substore?: number
  lubebay?: number
  customer?: number
  amount_lodged: number
  lodgement_date: string
  payment_method: string
  bank_name?: string
  account_number?: string
  deposit_slip_number?: string
  reference_number?: string
  transaction_reference?: string
  description?: string
  notes?: string
  variance_reason?: string
  substore_transaction_ids?: number[]
  lubebay_transaction_ids?: number[]
}

function LodgementsPage() {
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)

  // Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all')

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [selectedLodgement, setSelectedLodgement] = useState<Lodgement | null>(null)
  const [approvalNotes, setApprovalNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)

  // Form state
  const [formData, setFormData] = useState<LodgementFormData>({
    lodgement_type: 'substore',
    amount_lodged: 0,
    lodgement_date: new Date().toISOString().split('T')[0],
    payment_method: 'bank_transfer',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Fetch lodgements
  const { data: lodgementsData, isLoading, error, refetch } = useQuery({
    queryKey: ['lodgements', page, pageSize, searchTerm, statusFilter, typeFilter, paymentMethodFilter],
    queryFn: async () => {
      const params: Record<string, any> = {
        page,
        page_size: pageSize,
      }
      if (statusFilter !== 'all') params.approval_status = statusFilter
      if (typeFilter !== 'all') params.lodgement_type = typeFilter
      if (paymentMethodFilter !== 'all') params.payment_method = paymentMethodFilter
      if (searchTerm) params.search = searchTerm
      return apiClient.getLodgements(params)
    },
  })

  // Fetch lodgement stats
  const { data: statsData } = useQuery({
    queryKey: ['lodgement-stats', typeFilter],
    queryFn: () => apiClient.getLodgementStats(typeFilter !== 'all' ? typeFilter : undefined),
  })

  // Fetch substores for dropdown
  const { data: substoresData } = useQuery({
    queryKey: ['substores-dropdown'],
    queryFn: () => apiClient.getSubstores({ page_size: 1000 }),
    enabled: showAddModal || showEditModal,
  })

  // Fetch lubebays for dropdown
  const { data: lubebaysData } = useQuery({
    queryKey: ['lubebays-dropdown'],
    queryFn: () => apiClient.getLubebays({ page_size: 1000 }),
    enabled: showAddModal || showEditModal,
  })

  // Fetch customers for dropdown
  const { data: customersData } = useQuery({
    queryKey: ['customers-dropdown'],
    queryFn: () => apiClient.get('/customers/', { page_size: 1000 }),
    enabled: showAddModal || showEditModal,
  })

  // Helper to extract array from API response
  const extractResults = (data: any) => {
    if (!data) return []
    if (Array.isArray(data)) return data
    if (data.results && Array.isArray(data.results)) return data.results
    return []
  }

  const lodgements = extractResults(lodgementsData)
  const totalCount = lodgementsData?.count || lodgements.length
  const totalPages = Math.ceil(totalCount / pageSize)
  const substores = extractResults(substoresData)
  const lubebays = extractResults(lubebaysData)
  const customers = extractResults(customersData)

  const stats = statsData || {
    total: 0,
    pending: 0,
    awaiting_approval: 0,
    approved: 0,
    rejected: 0,
    total_lodged: 0,
  }

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: LodgementFormData) => apiClient.createLodgement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lodgements'] })
      queryClient.invalidateQueries({ queryKey: ['lodgement-stats'] })
      setShowAddModal(false)
      resetForm()
      addToast({ type: 'success', title: 'Success', message: 'Lodgement created successfully' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to create lodgement' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<LodgementFormData> }) =>
      apiClient.updateLodgement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lodgements'] })
      queryClient.invalidateQueries({ queryKey: ['lodgement-stats'] })
      setShowEditModal(false)
      setSelectedLodgement(null)
      resetForm()
      addToast({ type: 'success', title: 'Success', message: 'Lodgement updated successfully' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to update lodgement' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteLodgement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lodgements'] })
      queryClient.invalidateQueries({ queryKey: ['lodgement-stats'] })
      setShowDeleteModal(false)
      setSelectedLodgement(null)
      addToast({ type: 'success', title: 'Success', message: 'Lodgement deleted successfully' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to delete lodgement' })
    },
  })

  const approveMutation = useMutation({
    mutationFn: (id: number) => apiClient.approveLodgement(id, approvalNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lodgements'] })
      queryClient.invalidateQueries({ queryKey: ['lodgement-stats'] })
      setShowApproveModal(false)
      setSelectedLodgement(null)
      setApprovalNotes('')
      addToast({ type: 'success', title: 'Approved', message: 'Lodgement has been approved' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to approve lodgement' })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id: number) => apiClient.rejectLodgement(id, rejectionReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lodgements'] })
      queryClient.invalidateQueries({ queryKey: ['lodgement-stats'] })
      setShowApproveModal(false)
      setSelectedLodgement(null)
      setRejectionReason('')
      addToast({ type: 'warning', title: 'Rejected', message: 'Lodgement has been rejected' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to reject lodgement' })
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => apiClient.bulkDeleteLodgements(ids),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lodgements'] })
      queryClient.invalidateQueries({ queryKey: ['lodgement-stats'] })
      setShowBulkDeleteModal(false)
      setSelectedIds([])
      addToast({ type: 'success', title: 'Success', message: `Deleted ${data.deleted_count} lodgements` })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to delete lodgements' })
    },
  })

  const resetForm = () => {
    setFormData({
      lodgement_type: 'substore',
      amount_lodged: 0,
      lodgement_date: new Date().toISOString().split('T')[0],
      payment_method: 'bank_transfer',
    })
    setFormErrors({})
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.amount_lodged || formData.amount_lodged <= 0) {
      errors.amount_lodged = 'Amount must be greater than 0'
    }
    if (!formData.lodgement_date) {
      errors.lodgement_date = 'Date is required'
    }
    if (formData.lodgement_type === 'substore' && !formData.substore) {
      errors.substore = 'Please select a substore'
    }
    if (formData.lodgement_type === 'lubebay' && !formData.lubebay) {
      errors.lubebay = 'Please select a lubebay'
    }
    if (formData.lodgement_type === 'customer' && !formData.customer) {
      errors.customer = 'Please select a customer'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    if (showEditModal && selectedLodgement) {
      updateMutation.mutate({ id: selectedLodgement.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (lodgement: Lodgement) => {
    setSelectedLodgement(lodgement)
    setFormData({
      lodgement_type: lodgement.lodgement_type,
      substore: lodgement.substore,
      lubebay: lodgement.lubebay,
      customer: lodgement.customer,
      amount_lodged: lodgement.amount_lodged,
      lodgement_date: lodgement.lodgement_date,
      payment_method: lodgement.payment_method,
      bank_name: lodgement.bank_name,
      account_number: lodgement.account_number,
      deposit_slip_number: lodgement.deposit_slip_number,
      reference_number: lodgement.reference_number,
      transaction_reference: lodgement.transaction_reference,
      description: lodgement.description,
      notes: lodgement.notes,
      variance_reason: lodgement.variance_reason,
    })
    setShowEditModal(true)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pendingIds = lodgements
        .filter((l: Lodgement) => l.approval_status === 'pending' || l.approval_status === 'cancelled')
        .map((l: Lodgement) => l.id)
      setSelectedIds(pendingIds)
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id])
    } else {
      setSelectedIds(selectedIds.filter(i => i !== id))
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'awaiting_approval':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      awaiting_approval: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      approved: 'Approved',
      pending: 'Pending',
      awaiting_approval: 'Awaiting Approval',
      rejected: 'Rejected',
      cancelled: 'Cancelled',
    }
    return labels[status] || status
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'substore':
        return <Store className="h-4 w-4 text-blue-600" />
      case 'lubebay':
        return <Wrench className="h-4 w-4 text-purple-600" />
      case 'customer':
        return <Users className="h-4 w-4 text-green-600" />
      default:
        return <Building className="h-4 w-4 text-gray-600" />
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      substore: 'Substore',
      lubebay: 'Lubebay',
      customer: 'Customer',
    }
    return labels[type] || type
  }

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'Cash',
      bank_transfer: 'Bank Transfer',
      cheque: 'Cheque',
      pos: 'POS',
      mobile_money: 'Mobile Money',
    }
    return labels[method] || method
  }

  const getEntityName = (lodgement: Lodgement) => {
    return lodgement.entity_name ||
           lodgement.substore_name ||
           lodgement.lubebay_name ||
           lodgement.customer_name ||
           'Unknown'
  }

  if (error) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="bg-red-50 text-red-800 p-4 rounded-lg">
            Error loading lodgements: {(error as any).message || 'Unknown error'}
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Account Lodgements</h1>
            <p className="text-gray-600">Manage deposits from substores, lubebays, and customers</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button className="mofad-btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Lodgement
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending + (stats.awaiting_approval || 0)}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Lodged</p>
                <p className="text-xl font-bold text-primary-600">{formatCurrency(stats.total_lodged)}</p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search lodgements..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
            />
          </div>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
          >
            <option value="all">All Types</option>
            <option value="substore">Substore</option>
            <option value="lubebay">Lubebay</option>
            <option value="customer">Customer</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="awaiting_approval">Awaiting Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={paymentMethodFilter}
            onChange={(e) => { setPaymentMethodFilter(e.target.value); setPage(1) }}
          >
            <option value="all">All Methods</option>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cheque">Cheque</option>
            <option value="pos">POS</option>
            <option value="mobile_money">Mobile Money</option>
          </select>

          {selectedIds.length > 0 && (
            <Button
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50"
              onClick={() => setShowBulkDeleteModal(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete ({selectedIds.length})
            </Button>
          )}
        </div>

        {/* Lodgements Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 py-3">
                      <div className="w-5 h-5 bg-gray-200 rounded"></div>
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4 mt-2"></div>
                      </div>
                      <div className="w-20 h-4 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : lodgements.length === 0 ? (
              <div className="p-12 text-center">
                <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No lodgements found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by creating your first lodgement'}
                </p>
                <Button className="mofad-btn-primary" onClick={() => setShowAddModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Lodgement
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="py-3 px-4 w-12">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                            checked={selectedIds.length > 0 && selectedIds.length === lodgements.filter((l: Lodgement) => l.approval_status === 'pending' || l.approval_status === 'cancelled').length}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                          />
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Lodgement</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Entity</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900">Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Method</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Date</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {lodgements.map((lodgement: Lodgement) => (
                        <tr key={lodgement.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            {(lodgement.approval_status === 'pending' || lodgement.approval_status === 'cancelled') && (
                              <input
                                type="checkbox"
                                className="rounded border-gray-300"
                                checked={selectedIds.includes(lodgement.id)}
                                onChange={(e) => handleSelectOne(lodgement.id, e.target.checked)}
                              />
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <ArrowDownLeft className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{lodgement.lodgement_number}</div>
                                <div className="text-sm text-gray-500">by {lodgement.lodged_by_name || 'Unknown'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(lodgement.lodgement_type)}
                              <span className="text-sm">{getTypeLabel(lodgement.lodgement_type)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-900">{getEntityName(lodgement)}</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-bold text-green-600">{formatCurrency(lodgement.amount_lodged)}</span>
                            {lodgement.variance !== 0 && (
                              <div className={`text-xs ${lodgement.variance < 0 ? 'text-red-500' : 'text-blue-500'}`}>
                                Var: {formatCurrency(lodgement.variance)}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-700">{getPaymentMethodLabel(lodgement.payment_method)}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-sm text-gray-600">{formatDate(lodgement.lodgement_date)}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(lodgement.approval_status)}`}>
                              {getStatusIcon(lodgement.approval_status)}
                              {getStatusLabel(lodgement.approval_status)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => { setSelectedLodgement(lodgement); setShowViewModal(true) }}
                                className="p-1 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded"
                                title="View"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              {(lodgement.approval_status === 'pending' || lodgement.approval_status === 'awaiting_approval') && (
                                <>
                                  <button
                                    onClick={() => handleEdit(lodgement)}
                                    className="p-1 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded"
                                    title="Edit"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => { setSelectedLodgement(lodgement); setShowApproveModal(true) }}
                                    className="p-1 text-gray-600 hover:text-green-600 hover:bg-gray-100 rounded"
                                    title="Approve/Reject"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                              {lodgement.approval_status === 'pending' && (
                                <button
                                  onClick={() => { setSelectedLodgement(lodgement); setShowDeleteModal(true) }}
                                  className="p-1 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <div className="text-sm text-gray-600">
                      Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} lodgements
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm">
                        Page {page} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Modal */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">
                  {showEditModal ? 'Edit Lodgement' : 'New Lodgement'}
                </h2>
                <button onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm() }}>
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lodgement Type *</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    value={formData.lodgement_type}
                    onChange={(e) => setFormData({ ...formData, lodgement_type: e.target.value as any, substore: undefined, lubebay: undefined, customer: undefined })}
                    disabled={showEditModal}
                  >
                    <option value="substore">Substore</option>
                    <option value="lubebay">Lubebay</option>
                    <option value="customer">Customer</option>
                  </select>
                </div>

                {formData.lodgement_type === 'substore' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Substore *</label>
                    <select
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors.substore ? 'border-red-500' : 'border-gray-300'}`}
                      value={formData.substore || ''}
                      onChange={(e) => setFormData({ ...formData, substore: Number(e.target.value) })}
                    >
                      <option value="">Select substore</option>
                      {substores.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    {formErrors.substore && <p className="text-red-500 text-xs mt-1">{formErrors.substore}</p>}
                  </div>
                )}

                {formData.lodgement_type === 'lubebay' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lubebay *</label>
                    <select
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors.lubebay ? 'border-red-500' : 'border-gray-300'}`}
                      value={formData.lubebay || ''}
                      onChange={(e) => setFormData({ ...formData, lubebay: Number(e.target.value) })}
                    >
                      <option value="">Select lubebay</option>
                      {lubebays.map((l: any) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                    {formErrors.lubebay && <p className="text-red-500 text-xs mt-1">{formErrors.lubebay}</p>}
                  </div>
                )}

                {formData.lodgement_type === 'customer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
                    <select
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors.customer ? 'border-red-500' : 'border-gray-300'}`}
                      value={formData.customer || ''}
                      onChange={(e) => setFormData({ ...formData, customer: Number(e.target.value) })}
                    >
                      <option value="">Select customer</option>
                      {customers.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    {formErrors.customer && <p className="text-red-500 text-xs mt-1">{formErrors.customer}</p>}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors.amount_lodged ? 'border-red-500' : 'border-gray-300'}`}
                      value={formData.amount_lodged || ''}
                      onChange={(e) => setFormData({ ...formData, amount_lodged: parseFloat(e.target.value) || 0 })}
                    />
                    {formErrors.amount_lodged && <p className="text-red-500 text-xs mt-1">{formErrors.amount_lodged}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors.lodgement_date ? 'border-red-500' : 'border-gray-300'}`}
                      value={formData.lodgement_date}
                      onChange={(e) => setFormData({ ...formData, lodgement_date: e.target.value })}
                    />
                    {formErrors.lodgement_date && <p className="text-red-500 text-xs mt-1">{formErrors.lodgement_date}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="pos">POS</option>
                    <option value="mobile_money">Mobile Money</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      value={formData.bank_name || ''}
                      onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      value={formData.account_number || ''}
                      onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Slip #</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      value={formData.deposit_slip_number || ''}
                      onChange={(e) => setFormData({ ...formData, deposit_slip_number: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reference #</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      value={formData.reference_number || ''}
                      onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm() }}>
                    Cancel
                  </Button>
                  <Button type="submit" className="mofad-btn-primary" disabled={createMutation.isPending || updateMutation.isPending}>
                    {createMutation.isPending || updateMutation.isPending ? 'Saving...' : showEditModal ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && selectedLodgement && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Lodgement Details</h2>
                <button onClick={() => { setShowViewModal(false); setSelectedLodgement(null) }}>
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    {getTypeIcon(selectedLodgement.lodgement_type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedLodgement.lodgement_number}</h3>
                    <p className="text-gray-600">{getTypeLabel(selectedLodgement.lodgement_type)} Lodgement</p>
                  </div>
                  <div className="ml-auto">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(selectedLodgement.approval_status)}`}>
                      {getStatusIcon(selectedLodgement.approval_status)}
                      {getStatusLabel(selectedLodgement.approval_status)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div>
                    <p className="text-sm text-gray-600">Entity</p>
                    <p className="font-medium">{getEntityName(selectedLodgement)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium">{formatDate(selectedLodgement.lodgement_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Amount Lodged</p>
                    <p className="font-bold text-green-600 text-lg">{formatCurrency(selectedLodgement.amount_lodged)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Expected Amount</p>
                    <p className="font-medium">{formatCurrency(selectedLodgement.expected_amount)}</p>
                  </div>
                  {selectedLodgement.variance !== 0 && (
                    <div>
                      <p className="text-sm text-gray-600">Variance</p>
                      <p className={`font-medium ${selectedLodgement.variance < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                        {formatCurrency(selectedLodgement.variance)}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-medium">{getPaymentMethodLabel(selectedLodgement.payment_method)}</p>
                  </div>
                  {selectedLodgement.bank_name && (
                    <div>
                      <p className="text-sm text-gray-600">Bank</p>
                      <p className="font-medium">{selectedLodgement.bank_name}</p>
                    </div>
                  )}
                  {selectedLodgement.deposit_slip_number && (
                    <div>
                      <p className="text-sm text-gray-600">Deposit Slip #</p>
                      <p className="font-medium">{selectedLodgement.deposit_slip_number}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Lodged By</p>
                    <p className="font-medium">{selectedLodgement.lodged_by_name || 'Unknown'}</p>
                  </div>
                  {selectedLodgement.approved_by_name && (
                    <div>
                      <p className="text-sm text-gray-600">Approved By</p>
                      <p className="font-medium">{selectedLodgement.approved_by_name}</p>
                    </div>
                  )}
                </div>

                {selectedLodgement.description && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="font-medium">{selectedLodgement.description}</p>
                  </div>
                )}

                {selectedLodgement.rejection_reason && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">Rejection Reason</p>
                    <p className="font-medium text-red-600">{selectedLodgement.rejection_reason}</p>
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <Button variant="outline" onClick={() => { setShowViewModal(false); setSelectedLodgement(null) }}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Approve/Reject Modal */}
        {showApproveModal && selectedLodgement && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Approve or Reject Lodgement</h2>
                <button onClick={() => { setShowApproveModal(false); setSelectedLodgement(null); setApprovalNotes(''); setRejectionReason('') }}>
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="text-center">
                  <p className="font-medium">{selectedLodgement.lodgement_number}</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedLodgement.amount_lodged)}</p>
                  <p className="text-gray-600">{getEntityName(selectedLodgement)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Approval Notes (optional)</label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    placeholder="Add any notes..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason (required for rejection)</label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Reason for rejection..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                    onClick={() => {
                      if (!rejectionReason.trim()) {
                        addToast({ type: 'error', title: 'Error', message: 'Please provide a rejection reason' })
                        return
                      }
                      rejectMutation.mutate(selectedLodgement.id)
                    }}
                    disabled={rejectMutation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => approveMutation.mutate(selectedLodgement.id)}
                    disabled={approveMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedLodgement && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Delete Lodgement?</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete {selectedLodgement.lodgement_number}? This action cannot be undone.
                </p>
                <div className="flex justify-center gap-3">
                  <Button variant="outline" onClick={() => { setShowDeleteModal(false); setSelectedLodgement(null) }}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => deleteMutation.mutate(selectedLodgement.id)}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Delete Confirmation Modal */}
        {showBulkDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Delete {selectedIds.length} Lodgements?</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete these lodgements? This action cannot be undone.
                </p>
                <div className="flex justify-center gap-3">
                  <Button variant="outline" onClick={() => { setShowBulkDeleteModal(false); setSelectedIds([]) }}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => bulkDeleteMutation.mutate(selectedIds)}
                    disabled={bulkDeleteMutation.isPending}
                  >
                    {bulkDeleteMutation.isPending ? 'Deleting...' : 'Delete All'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default LodgementsPage
