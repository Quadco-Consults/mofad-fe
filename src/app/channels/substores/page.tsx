'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
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
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  X,
  Building2,
  MapPin,
  User,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Package,
  DollarSign,
  Fuel,
  Wrench,
} from 'lucide-react'

interface Substore {
  id: number
  name: string
  code: string
  substore_type: string
  state: number | null
  state_name: string | null
  location: number | null
  location_name?: string | null
  customer: number | null
  customer_name?: string | null
  manager: number | null
  manager_name?: string | null
  phone: string | null
  email: string | null
  address: string | null
  is_active: boolean
  current_balance: number | string
  credit_limit: number | string
  available_credit?: number | string
  is_credit_exceeded?: boolean
  created_datetime: string
  updated_datetime: string
  old_reference_id?: number | null
}

const getStatusBadge = (isActive: boolean) => {
  return isActive ? (
    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
      Active
    </span>
  ) : (
    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
      Inactive
    </span>
  )
}

const getTypeBadge = (type: string) => {
  const typeConfig: Record<string, { label: string; color: string }> = {
    station: {
      label: 'Fuel Station',
      color: 'bg-orange-100 text-orange-800',
    },
    distribution: {
      label: 'Distribution',
      color: 'bg-blue-100 text-blue-800',
    },
    retail: {
      label: 'Retail',
      color: 'bg-green-100 text-green-800',
    },
    wholesale: {
      label: 'Wholesale',
      color: 'bg-purple-100 text-purple-800',
    },
  }

  const config = typeConfig[type] || {
    label: type ? type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ') : 'Unknown',
    color: 'bg-gray-100 text-gray-800',
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  )
}


export default function SubstoresPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [stateFilter, setStateFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)

  // Selection hook
  const selection = useSelection<Substore>()

  // Bulk delete modal state
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedSubstore, setSelectedSubstore] = useState<Substore | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'lubebay' as 'lubebay' | 'filling_station',
    location: '',
    state: '',
    manager: '',
    phone: '',
    email: '',
    status: 'active' as 'active' | 'inactive',
    opening_date: '',
    monthly_sales: 0,
    commission_rate: 0,
    rating: 0
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const { data: substoresList, isLoading } = useQuery({
    queryKey: ['substores-list', currentPage, pageSize, searchTerm, statusFilter, typeFilter, stateFilter],
    queryFn: () => apiClient.get('/substores/', {
      page: currentPage,
      size: pageSize,
      search: searchTerm || undefined,
      is_active: statusFilter === 'active' ? 'true' : statusFilter === 'inactive' ? 'false' : undefined,
      substore_type: typeFilter !== 'all' ? typeFilter : undefined,
      state: stateFilter !== 'all' ? stateFilter : undefined,
    }),
  })

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: (number | string)[]) => apiClient.bulkDeleteSubstores(ids),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['substores-list'] })
      setShowBulkDeleteModal(false)
      selection.clearSelection()
      addToast({
        type: 'success',
        title: 'Bulk Delete Complete',
        message: `Successfully deleted ${response.deleted_count || selection.selectedIds.length} substore(s)`,
      })
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: error.message || 'Failed to delete substores',
      })
    },
  })

  // Helper to extract array from API response
  const extractResults = (data: any) => {
    if (!data) return []
    if (Array.isArray(data)) return data
    if (data.results && Array.isArray(data.results)) return data.results
    return []
  }

  // Get pagination info
  const totalCount = substoresList?.paginator?.count ?? substoresList?.count ?? 0
  const totalPages = substoresList?.paginator?.total_pages ?? Math.ceil(totalCount / pageSize)

  const substores = extractResults(substoresList)

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiClient.post('/substores/', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substores-list'] })
      addToast({ type: 'success', title: 'Success', message: 'Substore created successfully' })
      setShowCreateModal(false)
      resetForm()
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: 'Failed to create substore' })
    }
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      return apiClient.put(`/substores//${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substores-list'] })
      addToast({ type: 'success', title: 'Success', message: 'Substore updated successfully' })
      setShowEditModal(false)
      setSelectedSubstore(null)
      resetForm()
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: 'Failed to update substore' })
    }
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiClient.delete(`/substores//${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substores-list'] })
      addToast({ type: 'success', title: 'Success', message: 'Substore deleted successfully' })
      setShowDeleteModal(false)
      setSelectedSubstore(null)
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: 'Failed to delete substore' })
    }
  })

  // Form handlers
  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      type: 'lubebay',
      location: '',
      state: '',
      manager: '',
      phone: '',
      email: '',
      status: 'active',
      opening_date: '',
      monthly_sales: 0,
      commission_rate: 0,
      rating: 0
    })
    setFormErrors({})
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) errors.name = 'Name is required'
    if (!formData.code.trim()) errors.code = 'Code is required'
    if (!formData.location.trim()) errors.location = 'Location is required'
    if (!formData.state.trim()) errors.state = 'State is required'
    if (!formData.manager.trim()) errors.manager = 'Manager is required'
    if (!formData.phone.trim()) errors.phone = 'Phone is required'
    if (!formData.email.trim()) errors.email = 'Email is required'
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format'
    }
    if (!formData.opening_date) errors.opening_date = 'Opening date is required'
    if (formData.commission_rate < 0 || formData.commission_rate > 100) {
      errors.commission_rate = 'Commission rate must be between 0 and 100'
    }
    if (formData.rating < 0 || formData.rating > 5) {
      errors.rating = 'Rating must be between 0 and 5'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // CRUD handlers
  const handleCreate = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const handleEdit = (substore: Substore) => {
    setSelectedSubstore(substore)
    setFormData({
      name: substore.name,
      code: substore.code,
      type: substore.type,
      location: substore.location,
      state: substore.state,
      manager: substore.manager,
      phone: substore.phone,
      email: substore.email,
      status: substore.status,
      opening_date: substore.opening_date,
      monthly_sales: substore.monthly_sales,
      commission_rate: substore.commission_rate,
      rating: substore.rating
    })
    setFormErrors({})
    setShowEditModal(true)
  }

  const handleDelete = (substore: Substore) => {
    setSelectedSubstore(substore)
    setShowDeleteModal(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    const substoreData = {
      ...formData,
      monthly_sales: Number(formData.monthly_sales),
      commission_rate: Number(formData.commission_rate),
      rating: Number(formData.rating)
    }

    if (selectedSubstore) {
      updateMutation.mutate({ id: selectedSubstore.id, ...substoreData })
    } else {
      createMutation.mutate(substoreData)
    }
  }

  const confirmDelete = () => {
    if (selectedSubstore) {
      deleteMutation.mutate(selectedSubstore.id)
    }
  }

  // Get unique states for filter
  const states: string[] = Array.from(new Set(substores.map((s: Substore) => s.state)))

  // Get unique types for filter
  const types: string[] = Array.from(new Set(substores.map((s: Substore) => s.type)))

  // Navigation handler
  const handleViewSubstore = (substoreId: number) => {
    router.push(`/substores//${substoreId}`)
  }

  // Filter substores (server-side filtering is primary, this is for immediate UI feedback)
  const filteredSubstores = substores.filter((substore: Substore) => {
    const matchesSearch = !searchTerm ||
      (substore.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       substore.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       substore.state_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       substore.manager_name?.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && substore.is_active) ||
      (statusFilter === 'inactive' && !substore.is_active)
    const matchesState = stateFilter === 'all' || String(substore.state) === stateFilter
    const matchesType = typeFilter === 'all' || substore.substore_type === typeFilter

    return matchesSearch && matchesStatus && matchesState && matchesType
  })

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Substores Network</h1>
            <p className="text-muted-foreground">Manage substore locations and performance</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="mofad-btn-primary" onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Substore
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Substores</p>
                  <p className="text-2xl font-bold text-primary">6</p>
                </div>
                <Building2 className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-green-600">5</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Sales</p>
                  <p className="text-2xl font-bold text-secondary">₦55.9M</p>
                </div>
                <DollarSign className="w-8 h-8 text-secondary/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Substores</p>
                  <p className="text-2xl font-bold text-accent">{substores.filter((s: Substore) => s.is_active).length}</p>
                </div>
                <Building2 className="w-8 h-8 text-accent/60" />
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
                    placeholder="Search substores..."
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <select
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="station">Fuel Station</option>
                  <option value="distribution">Distribution</option>
                  <option value="retail">Retail Outlet</option>
                  <option value="wholesale">Wholesale</option>
                </select>

                <select
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                >
                  <option value="all">All States</option>
                  {states.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>

                <select
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Substores Table */}
        <Card>
          <CardContent className="p-0">
            {filteredSubstores.length === 0 ? (
              <div className="p-12 text-center">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No substores found</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all' || stateFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'No substores have been added yet'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="w-12 py-3 px-4">
                        <Checkbox
                          checked={selection.isAllSelected(filteredSubstores)}
                          indeterminate={selection.isPartiallySelected(filteredSubstores)}
                          onChange={() => selection.toggleAll(filteredSubstores)}
                        />
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Substore</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Location</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Manager</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Balance</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Updated</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {isLoading ? (
                      [...Array(6)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded w-4"></div></td>
                          <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                          <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                          <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                          <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                          <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div></td>
                          <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div></td>
                          <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                          <td className="py-3 px-4"><div className="h-8 bg-gray-200 rounded w-20 mx-auto"></div></td>
                        </tr>
                      ))
                    ) : (
                      filteredSubstores.map((substore: Substore) => (
                        <tr key={substore.id} className={`hover:bg-gray-50 ${selection.isSelected(substore.id) ? 'bg-blue-50' : ''}`}>
                          <td className="py-3 px-4">
                            <Checkbox
                              checked={selection.isSelected(substore.id)}
                              onChange={() => selection.toggle(substore.id)}
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{substore.name}</div>
                                <div className="text-sm text-gray-500 font-mono">{substore.code}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {getTypeBadge(substore.substore_type)}
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-900">{substore.state_name || '-'}</span>
                              </div>
                              <div className="text-sm text-gray-500">{substore.location_name || substore.address || '-'}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-900">{substore.manager_name || '-'}</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Phone className="w-3 h-3" />
                                <span>{substore.phone || '-'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {getStatusBadge(substore.is_active)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div>
                              <div className="font-bold text-primary">{formatCurrency(parseFloat(String(substore.current_balance || 0)))}</div>
                              <div className="text-sm text-gray-500 flex items-center justify-end gap-1">
                                <DollarSign className="w-3 h-3" />
                                <span>Limit: {formatCurrency(parseFloat(String(substore.credit_limit || 0)))}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-500">
                              {substore.updated_datetime ? formatDateTime(substore.updated_datetime).split(',')[0] : '-'}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Calendar className="w-3 h-3" />
                              <span>Since {substore.created_datetime ? new Date(substore.created_datetime).getFullYear() : '-'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex gap-1 justify-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewSubstore(substore.id)}
                                title="View Dashboard"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Edit Substore"
                                onClick={() => handleEdit(substore)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Delete Substore"
                                onClick={() => handleDelete(substore)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={(page) => {
              setCurrentPage(page)
              selection.clearSelection()
            }}
          />
        )}

        {/* Bulk Action Bar */}
        <BulkActionBar
          selectedCount={selection.selectedCount}
          onClearSelection={selection.clearSelection}
          onBulkDelete={() => setShowBulkDeleteModal(true)}
          isDeleting={bulkDeleteMutation.isPending}
          entityName="substores"
        />

        {/* Bulk Delete Confirmation Dialog */}
        <ConfirmDialog
          open={showBulkDeleteModal}
          onClose={() => setShowBulkDeleteModal(false)}
          onConfirm={() => bulkDeleteMutation.mutate(selection.selectedIds)}
          title="Delete Selected Substores"
          message={`Are you sure you want to delete ${selection.selectedCount} substore(s)? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          isLoading={bulkDeleteMutation.isPending}
        />
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold">
                  {selectedSubstore ? 'Edit Substore' : 'Create New Substore'}
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCreateModal(false)
                    setShowEditModal(false)
                    setSelectedSubstore(null)
                    resetForm()
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter substore name"
                    />
                    {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code *
                    </label>
                    <input
                      type="text"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                        formErrors.code ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                      placeholder="Enter substore code"
                    />
                    {formErrors.code && <p className="text-red-500 text-xs mt-1">{formErrors.code}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type *
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'lubebay' | 'filling_station' }))}
                    >
                      <option value="lubebay">Lubebay</option>
                      <option value="filling_station">Filling Station</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location *
                    </label>
                    <input
                      type="text"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                        formErrors.location ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Enter location"
                    />
                    {formErrors.location && <p className="text-red-500 text-xs mt-1">{formErrors.location}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                        formErrors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="Enter state"
                    />
                    {formErrors.state && <p className="text-red-500 text-xs mt-1">{formErrors.state}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Manager *
                    </label>
                    <input
                      type="text"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                        formErrors.manager ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.manager}
                      onChange={(e) => setFormData(prev => ({ ...prev, manager: e.target.value }))}
                      placeholder="Enter manager name"
                    />
                    {formErrors.manager && <p className="text-red-500 text-xs mt-1">{formErrors.manager}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <input
                      type="text"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                        formErrors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter phone number"
                    />
                    {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                        formErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address"
                    />
                    {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opening Date *
                    </label>
                    <input
                      type="date"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                        formErrors.opening_date ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.opening_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, opening_date: e.target.value }))}
                    />
                    {formErrors.opening_date && <p className="text-red-500 text-xs mt-1">{formErrors.opening_date}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Sales
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.monthly_sales}
                      onChange={(e) => setFormData(prev => ({ ...prev, monthly_sales: Number(e.target.value) }))}
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Commission Rate (%)
                    </label>
                    <input
                      type="number"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                        formErrors.commission_rate ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.commission_rate}
                      onChange={(e) => setFormData(prev => ({ ...prev, commission_rate: Number(e.target.value) }))}
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    {formErrors.commission_rate && <p className="text-red-500 text-xs mt-1">{formErrors.commission_rate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rating
                    </label>
                    <input
                      type="number"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                        formErrors.rating ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.rating}
                      onChange={(e) => setFormData(prev => ({ ...prev, rating: Number(e.target.value) }))}
                      placeholder="0"
                      min="0"
                      max="5"
                      step="0.1"
                    />
                    {formErrors.rating && <p className="text-red-500 text-xs mt-1">{formErrors.rating}</p>}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false)
                    setShowEditModal(false)
                    setSelectedSubstore(null)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="mofad-btn-primary"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <span>Loading...</span>
                  ) : (
                    <span>{selectedSubstore ? 'Update Substore' : 'Create Substore'}</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">Delete Substore</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete &quot;{selectedSubstore?.name}&quot;? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setSelectedSubstore(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={confirmDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </AppLayout>
  )
}