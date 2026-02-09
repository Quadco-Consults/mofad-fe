'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Plus, Search, MapPin, Wrench, Phone, TrendingUp, AlertTriangle, Eye, Edit, Trash2, Star, X, Save, Loader2 } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { Pagination } from '@/components/ui/Pagination'
import { BulkActionBar } from '@/components/ui/BulkActionBar'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useSelection } from '@/hooks/useSelection'
import apiClient from '@/lib/apiClient'
import { useToast } from '@/components/ui/Toast'

interface Lubebay {
  id: string | number
  name: string
  code: string
  address: string | null
  state_name: string | null
  location_name: string | null
  manager_name: string | null
  phone: string | null
  email: string | null
  is_active: boolean
  current_balance: string
  warehouse_name: string | null
  substore_name: string | null
  opening_time: string | null
  closing_time: string | null
  // Legacy support for mock data
  location?: string
  state?: string
  manager?: string
  status?: 'active' | 'maintenance' | 'inactive'
  bays?: number
  monthlyRevenue?: number
  lastInspection?: string
  services?: string[]
  rating?: number
}

export default function LubebaysPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'maintenance' | 'inactive'>('all')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  // Selection hook
  const selection = useSelection<Lubebay>()

  // Bulk delete modal state
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedLubebay, setSelectedLubebay] = useState<any>(null)

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    state: '',
    manager: '',
    phone: '',
    bays: 1,
    services: [] as string[],
    notes: ''
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch lubebays
  const { data: lubebaysData, isLoading, error, refetch } = useQuery({
    queryKey: ['lubebays', currentPage, pageSize, searchTerm, statusFilter],
    queryFn: async () => {
      try {
        const params: Record<string, string> = {
          page: String(currentPage),
          size: String(pageSize),
        }
        if (statusFilter !== 'all') params.is_active = statusFilter === 'active' ? 'true' : 'false'
        if (searchTerm) params.search = searchTerm

        console.log('Fetching lubebays with params:', params)
        const response = await apiClient.get('/lubebays/', params)
        console.log('Lubebays response:', response)
        return response
      } catch (err) {
        console.error('Error fetching lubebays:', err)
        throw err
      }
    },
  })

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: (number | string)[]) => apiClient.bulkDeleteLubebays(ids),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['lubebays'] })
      setShowBulkDeleteModal(false)
      selection.clearSelection()
      addToast({
        type: 'success',
        title: 'Bulk Delete Complete',
        message: `Successfully deleted ${response.deleted_count || selection.selectedIds.length} lubebay(s)`,
      })
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: error.message || 'Failed to delete lubebays',
      })
    },
  })

  // Handle both array and paginated responses
  const extractResults = (data: any) => {
    if (Array.isArray(data)) return data
    if (data?.results && Array.isArray(data.results)) return data.results
    return []
  }

  // Get pagination info
  const totalCount = lubebaysData?.paginator?.count ?? lubebaysData?.count ?? 0
  const totalPages = lubebaysData?.paginator?.total_pages ?? Math.ceil(totalCount / pageSize)

  const lubebays = extractResults(lubebaysData)

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiClient.post('/lubebays/', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lubebays'] })
      addToast({ type: 'success', title: 'Success', message: 'Lubebay created successfully' })
      setShowCreateModal(false)
      resetForm()
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to create lubebay' })
      if (error.errors) setFormErrors(error.errors)
    }
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiClient.put(`/lubebays/${selectedLubebay.id}/`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lubebays'] })
      addToast({ type: 'success', title: 'Success', message: 'Lubebay updated successfully' })
      setShowEditModal(false)
      resetForm()
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to update lubebay' })
      if (error.errors) setFormErrors(error.errors)
    }
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/lubebays/${id}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lubebays'] })
      addToast({ type: 'success', title: 'Success', message: 'Lubebay deleted successfully' })
      setShowDeleteModal(false)
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to delete lubebay' })
    }
  })

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!formData.name.trim()) errors.name = 'Lubebay name is required'
    if (!formData.location.trim()) errors.location = 'Location is required'
    if (!formData.state.trim()) errors.state = 'State is required'
    if (!formData.manager.trim()) errors.manager = 'Manager name is required'
    if (!formData.phone.trim()) errors.phone = 'Phone number is required'
    if (formData.bays < 1) errors.bays = 'Number of bays must be at least 1'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Form handlers
  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      state: '',
      manager: '',
      phone: '',
      bays: 1,
      services: [],
      notes: ''
    })
    setFormErrors({})
    setIsSubmitting(false)
  }

  const handleCreateClick = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const handleEditClick = (lubebay: any) => {
    setFormData({
      name: lubebay.name || '',
      location: lubebay.location || '',
      state: lubebay.state || '',
      manager: lubebay.manager || '',
      phone: lubebay.phone || '',
      bays: lubebay.bays || 1,
      services: lubebay.services || [],
      notes: lubebay.notes || ''
    })
    setSelectedLubebay(lubebay)
    setFormErrors({})
    setShowEditModal(true)
  }

  const handleDeleteClick = (lubebay: any) => {
    setSelectedLubebay(lubebay)
    setShowDeleteModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      if (showCreateModal) {
        await createMutation.mutateAsync(formData)
      } else if (showEditModal) {
        await updateMutation.mutateAsync(formData)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewLubebay = (lubebayId: string) => {
    router.push(`/channels/lubebays/${lubebayId}`)
  }

  const filteredLubebays = lubebays.filter((lubebay: any) => {
    const name = lubebay.name || ''
    const address = lubebay.address || lubebay.location || ''
    const state = lubebay.state_name || lubebay.state || ''

    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         state.toLowerCase().includes(searchTerm.toLowerCase())

    // For API data, use is_active; for mock data use status
    const isActiveStatus = lubebay.is_active !== undefined
      ? (lubebay.is_active ? 'active' : 'inactive')
      : (lubebay.status || 'active')

    const matchesStatus = statusFilter === 'all' || isActiveStatus === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-red-100 text-red-800'
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const totalLubebays = lubebays.length
  const activeLubebays = lubebays.filter((l: Lubebay) => {
    // For API data use is_active, for mock data use status
    return l.is_active !== undefined ? l.is_active : (l.status === 'active')
  }).length
  const totalRevenue = lubebays.reduce((sum: number, l: Lubebay) => sum + (l.monthlyRevenue || 0), 0)
  const averageRating = lubebays.length > 0
    ? lubebays.reduce((sum: number, l: Lubebay) => sum + (l.rating || 0), 0) / lubebays.length
    : 0

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Lubebay Network</h1>
            <p className="text-muted-foreground">Manage MOFAD lubebay service centers</p>
          </div>
          <Button className="mofad-btn-primary" onClick={handleCreateClick}>
            <Plus className="h-4 w-4 mr-2" />
            Add Lubebay
          </Button>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="mofad-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Lubebays</p>
              <p className="text-2xl font-bold text-gray-900">{totalLubebays}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="mofad-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Centers</p>
              <p className="text-2xl font-bold text-green-600">{activeLubebays}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Wrench className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="mofad-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-primary-600">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="mofad-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-yellow-600">{averageRating.toFixed(1)}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <div className="text-yellow-600">⭐</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search lubebays..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="maintenance">Maintenance</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Lubebays Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 py-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4 mt-2"></div>
                    </div>
                    <div className="w-20 h-4 bg-gray-200 rounded"></div>
                    <div className="w-24 h-4 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Lubebays</h3>
              <p className="text-gray-500 mb-2">
                {error instanceof Error ? error.message : 'Failed to load lubebays'}
              </p>
              <p className="text-sm text-gray-400 mb-4">
                Check your internet connection or try logging in again.
              </p>
              <Button className="mofad-btn-primary" onClick={() => refetch()}>
                Try Again
              </Button>
            </div>
          ) : filteredLubebays.length === 0 ? (
            <div className="p-12 text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No lubebays found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first lubebay'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <>
                  <p className="text-sm text-gray-400 mb-4">
                    Total records from API: {lubebaysData?.count || lubebaysData?.paginator?.count || 0}
                  </p>
                  <p className="text-xs text-gray-400 mb-4">
                    Debug: {JSON.stringify({ hasData: !!lubebaysData, dataKeys: lubebaysData ? Object.keys(lubebaysData) : [] })}
                  </p>
                </>
              )}
              <Button className="mofad-btn-primary" onClick={handleCreateClick}>
                <Plus className="w-4 h-4 mr-2" />
                Add Lubebay
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="w-12 py-3 px-4">
                      <Checkbox
                        checked={selection.isAllSelected(filteredLubebays)}
                        indeterminate={selection.isPartiallySelected(filteredLubebays)}
                        onChange={() => selection.toggleAll(filteredLubebays)}
                      />
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Lubebay</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Manager</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Bays</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Monthly Revenue</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Rating</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Services</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Last Inspection</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLubebays.map((lubebay: Lubebay) => (
                    <tr key={lubebay.id} className={`hover:bg-gray-50 ${selection.isSelected(lubebay.id) ? 'bg-blue-50' : ''}`}>
                      <td className="py-3 px-4">
                        <Checkbox
                          checked={selection.isSelected(lubebay.id)}
                          onChange={() => selection.toggle(lubebay.id)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Wrench className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{lubebay.name}</div>
                            <div className="text-sm text-gray-500">{lubebay.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-900 max-w-[200px] truncate">
                              {lubebay.address || lubebay.location || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {lubebay.state_name || lubebay.state || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-gray-900">
                          {lubebay.manager_name || lubebay.manager || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-600">{lubebay.phone || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-primary">{lubebay.bays || '-'}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-bold text-green-600">
                          {lubebay.monthlyRevenue ? formatCurrency(lubebay.monthlyRevenue) : 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {lubebay.rating ? (
                            <>
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              <span className="font-medium text-gray-900">{lubebay.rating}</span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">N/A</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {(lubebay.services && lubebay.services.length > 0) ? (
                            <>
                              {lubebay.services.slice(0, 2).map((service, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {service}
                                </span>
                              ))}
                              {lubebay.services.length > 2 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  +{lubebay.services.length - 2} more
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">N/A</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-sm text-gray-600">
                          {lubebay.lastInspection ? new Date(lubebay.lastInspection).toLocaleDateString() : 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center">
                          {(() => {
                            // Determine status from either is_active (API) or status (mock)
                            const status = lubebay.is_active !== undefined
                              ? (lubebay.is_active ? 'active' : 'inactive')
                              : (lubebay.status || 'active')
                            return (
                              <>
                                {status === 'maintenance' && (
                                  <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
                                )}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(status)}`}>
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </span>
                              </>
                            )
                          })()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="View Dashboard"
                            onClick={() => handleViewLubebay(lubebay.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Manage Lubebay"
                            onClick={() => handleEditClick(lubebay)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Delete Lubebay"
                            onClick={() => handleDeleteClick(lubebay)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
          entityName="lubebays"
        />

        {/* Bulk Delete Confirmation Dialog */}
        <ConfirmDialog
          open={showBulkDeleteModal}
          onClose={() => setShowBulkDeleteModal(false)}
          onConfirm={() => bulkDeleteMutation.mutate(selection.selectedIds)}
          title="Delete Selected Lubebays"
          message={`Are you sure you want to delete ${selection.selectedCount} lubebay(s)? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          isLoading={bulkDeleteMutation.isPending}
        />

        {/* Create/Edit Modal */}
        {(showCreateModal || showEditModal) && createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {showCreateModal ? 'Add New Lubebay' : 'Edit Lubebay'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCreateModal(false)
                    setShowEditModal(false)
                    resetForm()
                  }}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-gray-900 border-b pb-2">Basic Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lubebay Name *
                      </label>
                      <input
                        type="text"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                          formErrors.name ? 'border-red-300' : 'border-gray-300'
                        }`}
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter lubebay name"
                      />
                      {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <select
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                          formErrors.state ? 'border-red-300' : 'border-gray-300'
                        }`}
                        value={formData.state}
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      >
                        <option value="">Select State</option>
                        <option value="Lagos">Lagos</option>
                        <option value="FCT">FCT (Abuja)</option>
                        <option value="Rivers">Rivers</option>
                        <option value="Kano">Kano</option>
                        <option value="Kaduna">Kaduna</option>
                        <option value="Ogun">Ogun</option>
                        <option value="Katsina">Katsina</option>
                        <option value="Bauchi">Bauchi</option>
                        <option value="Jigawa">Jigawa</option>
                        <option value="Benue">Benue</option>
                      </select>
                      {formErrors.state && <p className="text-red-500 text-xs mt-1">{formErrors.state}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location *
                      </label>
                      <input
                        type="text"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                          formErrors.location ? 'border-red-300' : 'border-gray-300'
                        }`}
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Enter full address"
                      />
                      {formErrors.location && <p className="text-red-500 text-xs mt-1">{formErrors.location}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Manager Name *
                      </label>
                      <input
                        type="text"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                          formErrors.manager ? 'border-red-300' : 'border-gray-300'
                        }`}
                        value={formData.manager}
                        onChange={(e) => setFormData(prev => ({ ...prev, manager: e.target.value }))}
                        placeholder="Enter manager name"
                      />
                      {formErrors.manager && <p className="text-red-500 text-xs mt-1">{formErrors.manager}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                          formErrors.phone ? 'border-red-300' : 'border-gray-300'
                        }`}
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+234 xxx xxx xxxx"
                      />
                      {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Service Bays *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                          formErrors.bays ? 'border-red-300' : 'border-gray-300'
                        }`}
                        value={formData.bays}
                        onChange={(e) => setFormData(prev => ({ ...prev, bays: parseInt(e.target.value) || 1 }))}
                        placeholder="Number of service bays"
                      />
                      {formErrors.bays && <p className="text-red-500 text-xs mt-1">{formErrors.bays}</p>}
                    </div>
                  </div>
                </div>

                {/* Services Information */}
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-gray-900 border-b pb-2">Services Offered</h3>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      'Oil Change',
                      'Filter Replacement',
                      'Brake Service',
                      'Tire Service',
                      'AC Service',
                      'Engine Diagnostics',
                      'Quick Service',
                      'Transmission Service',
                      'Cooling System',
                    ].map((service) => (
                      <label key={service} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                          checked={formData.services.includes(service)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                services: [...prev.services, service]
                              }))
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                services: prev.services.filter(s => s !== service)
                              }))
                            }
                          }}
                        />
                        <span className="text-sm text-gray-700">{service}</span>
                      </label>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes about this lubebay..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false)
                      setShowEditModal(false)
                      resetForm()
                    }}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 mofad-btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {showCreateModal ? 'Creating...' : 'Updating...'}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {showCreateModal ? 'Create Lubebay' : 'Update Lubebay'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedLubebay && createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Delete Lubebay</h3>
                    <p className="text-gray-500">This action cannot be undone.</p>
                  </div>
                </div>

                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete <span className="font-semibold">{selectedLubebay.name}</span>?
                  This will permanently remove the lubebay and all associated data.
                </p>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1"
                    disabled={deleteMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => deleteMutation.mutate(selectedLubebay.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Lubebay
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      </div>
    </AppLayout>
  )
}