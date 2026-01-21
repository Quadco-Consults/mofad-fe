'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Plus, Edit, Trash2, Eye, MapPin, Users, Building2, X, Save, Loader2, CheckCircle, XCircle, Power, PowerOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Pagination } from '@/components/ui/Pagination'
import { BulkActionBar } from '@/components/ui/BulkActionBar'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { AppLayout } from '@/components/layout/AppLayout'
import { useSelection } from '@/hooks/useSelection'
import apiClient from '@/lib/apiClient'
import { useToast } from '@/components/ui/Toast'

interface State {
  id: number
  name: string
  code: string
  capital: string | null
  zone: string | null
  zone_display: string | null
  is_active: boolean
  warehouse_count: number
  substore_count: number
  lubebay_count: number
  customer_count: number
  created_at: string
  updated_at: string
}

interface StateFormData {
  name: string
  code: string
  capital: string
  zone: string
}

const ZONE_OPTIONS = [
  { value: 'south_west', label: 'South West' },
  { value: 'south_east', label: 'South East' },
  { value: 'south_south', label: 'South South' },
  { value: 'north_west', label: 'North West' },
  { value: 'north_east', label: 'North East' },
  { value: 'north_central', label: 'North Central' },
]

const initialFormData: StateFormData = {
  name: '',
  code: '',
  capital: '',
  zone: '',
}

function StatesPage() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [zoneFilter, setZoneFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(12)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedState, setSelectedState] = useState<State | null>(null)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [formData, setFormData] = useState<StateFormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Selection hook for bulk operations
  const selection = useSelection<State>()

  // Reset to first page when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handleZoneFilterChange = (value: string) => {
    setZoneFilter(value)
    setCurrentPage(1)
  }

  // Fetch states
  const { data: statesData, isLoading, error, refetch } = useQuery({
    queryKey: ['states', searchTerm, statusFilter, zoneFilter, currentPage, pageSize],
    queryFn: async () => {
      const params: any = {
        page: currentPage,
        page_size: pageSize,
      }
      if (searchTerm) params.search = searchTerm
      if (statusFilter !== 'all') params.is_active = statusFilter === 'active'
      if (zoneFilter !== 'all') params.zone = zoneFilter
      return apiClient.getStates(params)
    },
  })

  // Get states from response and pagination info
  const states: State[] = Array.isArray(statesData)
    ? statesData
    : statesData?.results || statesData?.data?.results || []

  // Extract total count for pagination
  const getTotalCount = (data: any): number => {
    if (!data) return 0
    if (Array.isArray(data)) return data.length
    if (data.paginator?.count !== undefined) return data.paginator.count
    if (data.count !== undefined) return data.count
    if (data.results && Array.isArray(data.results)) return data.results.length
    return 0
  }

  const getTotalPages = (data: any): number => {
    if (!data) return 0
    if (data.paginator?.total_pages !== undefined) return data.paginator.total_pages
    return Math.ceil(getTotalCount(data) / pageSize)
  }

  const totalCount = getTotalCount(statesData)
  const totalPages = getTotalPages(statesData)

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: StateFormData) => apiClient.createState(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['states'] })
      showToast('State created successfully', 'success')
      setShowAddModal(false)
      setFormData(initialFormData)
      setFormErrors({})
    },
    onError: (error: any) => {
      showToast(error.message || 'Failed to create state', 'error')
      if (error.errors) {
        setFormErrors(error.errors)
      }
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<StateFormData> }) =>
      apiClient.updateState(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['states'] })
      showToast('State updated successfully', 'success')
      setShowEditModal(false)
      setSelectedState(null)
      setFormData(initialFormData)
      setFormErrors({})
    },
    onError: (error: any) => {
      showToast(error.message || 'Failed to update state', 'error')
      if (error.errors) {
        setFormErrors(error.errors)
      }
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteState(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['states'] })
      showToast('State deleted successfully', 'success')
      setShowDeleteModal(false)
      setSelectedState(null)
    },
    onError: (error: any) => {
      showToast(error.message || 'Failed to delete state', 'error')
    },
  })

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      apiClient.updateState(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['states'] })
      showToast('State status updated successfully', 'success')
    },
    onError: (error: any) => {
      showToast(error.message || 'Failed to update state status', 'error')
    },
  })

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: (number | string)[]) => apiClient.bulkDeleteStates(ids),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['states'] })
      setShowBulkDeleteModal(false)
      selection.clearSelection()

      if (response.failed_count > 0) {
        showToast(`Deleted ${response.deleted_count} states. ${response.failed_count} failed.`, 'warning')
      } else {
        showToast(`Successfully deleted ${response.deleted_count} states`, 'success')
      }
    },
    onError: (error: any) => {
      showToast(error.message || 'Failed to delete states', 'error')
    },
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!formData.name.trim()) errors.name = 'State name is required'
    if (!formData.code.trim()) errors.code = 'State code is required'
    if (formData.code.length > 3) errors.code = 'State code must be 3 characters or less'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreate = () => {
    if (!validateForm()) return
    createMutation.mutate(formData)
  }

  const handleUpdate = () => {
    if (!selectedState || !validateForm()) return
    updateMutation.mutate({ id: selectedState.id, data: formData })
  }

  const handleDelete = () => {
    if (!selectedState) return
    deleteMutation.mutate(selectedState.id)
  }

  const handleView = (state: State) => {
    setSelectedState(state)
    setShowViewModal(true)
  }

  const handleEdit = (state: State) => {
    setSelectedState(state)
    setFormData({
      name: state.name,
      code: state.code,
      capital: state.capital || '',
      zone: state.zone || '',
    })
    setFormErrors({})
    setShowEditModal(true)
  }

  const handleDeleteClick = (state: State) => {
    setSelectedState(state)
    setShowDeleteModal(true)
  }

  const handleToggleActive = (state: State) => {
    toggleActiveMutation.mutate({ id: state.id, is_active: !state.is_active })
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

  const getZoneColor = (zone: string | null) => {
    if (!zone) return 'bg-gray-100 text-gray-800'
    const colors: Record<string, string> = {
      'south_west': 'bg-blue-100 text-blue-800',
      'south_east': 'bg-green-100 text-green-800',
      'south_south': 'bg-purple-100 text-purple-800',
      'north_west': 'bg-orange-100 text-orange-800',
      'north_east': 'bg-red-100 text-red-800',
      'north_central': 'bg-indigo-100 text-indigo-800'
    }
    return colors[zone] || 'bg-gray-100 text-gray-800'
  }

  // Calculate summary stats
  const totalStates = states.length
  const activeStates = states.filter(s => s.is_active).length
  const totalCustomers = states.reduce((sum, s) => sum + (s.customer_count || 0), 0)
  const totalWarehouses = states.reduce((sum, s) => sum + (s.warehouse_count || 0), 0)

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">States & Territories</h1>
            <p className="text-gray-600">Manage geographical regions and state-specific settings</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button className="mofad-btn-primary" onClick={() => {
              setFormData(initialFormData)
              setFormErrors({})
              setShowAddModal(true)
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add State
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total States</p>
                <p className="text-2xl font-bold text-gray-900">{totalStates}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active States</p>
                <p className="text-2xl font-bold text-green-600">{activeStates}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-primary-600">{totalCustomers}</p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Warehouses</p>
                <p className="text-2xl font-bold text-purple-600">{totalWarehouses}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search states..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={zoneFilter}
            onChange={(e) => handleZoneFilterChange(e.target.value)}
          >
            <option value="all">All Zones</option>
            {ZONE_OPTIONS.map(zone => (
              <option key={zone.value} value={zone.value}>{zone.label}</option>
            ))}
          </select>

          <Button variant="outline">
            Export Data
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            <span className="ml-2 text-gray-600">Loading states...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Failed to load states. Please try again.</p>
            <Button variant="outline" className="mt-2" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {/* States Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {states.map((state) => (
              <div
                key={state.id}
                className={`mofad-card hover:shadow-lg transition-shadow ${selection.isSelected(state.id) ? 'ring-2 ring-primary-500' : ''}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Checkbox
                      checked={selection.isSelected(state.id)}
                      onChange={() => selection.toggle(state.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{state.name}</h3>
                        {getStatusBadge(state.is_active)}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        {state.zone && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getZoneColor(state.zone)}`}>
                            {state.zone_display || state.zone}
                          </span>
                        )}
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded font-mono">
                          {state.code}
                        </span>
                      </div>
                      {state.capital && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-1" />
                          Capital: {state.capital}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleView(state)} title="View">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(state)} title="Edit">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(state)}
                      title={state.is_active ? 'Deactivate' : 'Activate'}
                      className={state.is_active ? 'text-yellow-600' : 'text-green-600'}
                    >
                      {state.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(state)}
                      className="text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="h-4 w-4 text-primary-600" />
                      <span className="text-lg font-bold text-primary-600">{state.customer_count || 0}</span>
                    </div>
                    <p className="text-xs text-gray-600">Customers</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Building2 className="h-4 w-4 text-green-600" />
                      <span className="text-lg font-bold text-green-600">{state.warehouse_count || 0}</span>
                    </div>
                    <p className="text-xs text-gray-600">Warehouses</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Building2 className="h-4 w-4 text-purple-600" />
                      <span className="text-lg font-bold text-purple-600">{state.substore_count || 0}</span>
                    </div>
                    <p className="text-xs text-gray-600">Substores</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !error && totalCount > 0 && (
          <div className="mofad-card">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && states.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No states found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || zoneFilter !== 'all'
                ? 'No states match your search criteria.'
                : 'Get started by adding your first state.'}
            </p>
            <Button className="mofad-btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add State
            </Button>
          </div>
        )}

        {/* Add State Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Add New State</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="e.g., Lagos"
                  />
                  {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    maxLength={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors.code ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="e.g., LA"
                  />
                  {formErrors.code && <p className="text-red-500 text-sm mt-1">{formErrors.code}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capital</label>
                  <input
                    type="text"
                    name="capital"
                    value={formData.capital}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Ikeja"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                  <select
                    name="zone"
                    value={formData.zone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Zone</option>
                    {ZONE_OPTIONS.map(zone => (
                      <option key={zone.value} value={zone.value}>{zone.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button
                  className="mofad-btn-primary"
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create State
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit State Modal */}
        {showEditModal && selectedState && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Edit State</h3>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    maxLength={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors.code ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.code && <p className="text-red-500 text-sm mt-1">{formErrors.code}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capital</label>
                  <input
                    type="text"
                    name="capital"
                    value={formData.capital}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                  <select
                    name="zone"
                    value={formData.zone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Zone</option>
                    {ZONE_OPTIONS.map(zone => (
                      <option key={zone.value} value={zone.value}>{zone.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
                <Button
                  className="mofad-btn-primary"
                  onClick={handleUpdate}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* View State Modal */}
        {showViewModal && selectedState && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">State Details</h3>
                <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{selectedState.name}</h2>
                  {getStatusBadge(selectedState.is_active)}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">State Code</label>
                    <p className="text-sm text-gray-900 font-mono">{selectedState.code}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Capital</label>
                    <p className="text-sm text-gray-900">{selectedState.capital || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Zone</label>
                    <p className="text-sm text-gray-900">{selectedState.zone_display || selectedState.zone || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Status</label>
                    <p className="text-sm text-gray-900">{selectedState.is_active ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Statistics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-primary-600">{selectedState.customer_count || 0}</p>
                      <p className="text-sm text-gray-600">Customers</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{selectedState.warehouse_count || 0}</p>
                      <p className="text-sm text-gray-600">Warehouses</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{selectedState.substore_count || 0}</p>
                      <p className="text-sm text-gray-600">Substores</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">{selectedState.lubebay_count || 0}</p>
                      <p className="text-sm text-gray-600">Lubebays</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => setShowViewModal(false)}>Close</Button>
                <Button className="mofad-btn-primary" onClick={() => {
                  setShowViewModal(false)
                  handleEdit(selectedState)
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit State
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmDialog
          open={showDeleteModal && !!selectedState}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          title="Delete State"
          message={
            selectedState ? (
              <>
                Are you sure you want to delete <strong>{selectedState.name}</strong>? This action cannot be undone.
                {(selectedState.customer_count > 0 || selectedState.warehouse_count > 0) && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Warning: This state has {selectedState.customer_count} customers and {selectedState.warehouse_count} warehouses associated with it.
                    </p>
                  </div>
                )}
              </>
            ) : ''
          }
          confirmText="Delete State"
          variant="danger"
          isLoading={deleteMutation.isPending}
        />

        {/* Bulk Delete Confirmation Modal */}
        <ConfirmDialog
          open={showBulkDeleteModal}
          onClose={() => setShowBulkDeleteModal(false)}
          onConfirm={() => bulkDeleteMutation.mutate(selection.selectedIds)}
          title="Delete Multiple States"
          message={`Are you sure you want to delete ${selection.selectedCount} state${selection.selectedCount > 1 ? 's' : ''}? This action cannot be undone.`}
          confirmText={`Delete ${selection.selectedCount} State${selection.selectedCount > 1 ? 's' : ''}`}
          variant="danger"
          isLoading={bulkDeleteMutation.isPending}
        />

        {/* Bulk Action Bar */}
        <BulkActionBar
          selectedCount={selection.selectedCount}
          onClearSelection={selection.clearSelection}
          onBulkDelete={() => setShowBulkDeleteModal(true)}
          isDeleting={bulkDeleteMutation.isPending}
          entityName="state"
        />
      </div>
    </AppLayout>
  )
}

export default StatesPage
