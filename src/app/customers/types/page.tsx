'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import { CustomerType } from '@/types/api'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Percent,
  TrendingUp,
  X,
  Save,
  Loader2,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CreditCard,
} from 'lucide-react'

// Form data interfaces
interface CreateCustomerTypeForm {
  name: string
  description: string
}

interface EditCustomerTypeForm {
  name: string
  description: string
  discount_rate: number
  credit_limit: number
  credit_days: number
  payment_terms: string
  requires_approval: boolean
  is_active: boolean
}

const initialCreateForm: CreateCustomerTypeForm = {
  name: '',
  description: '',
}

const initialEditForm: EditCustomerTypeForm = {
  name: '',
  description: '',
  discount_rate: 0,
  credit_limit: 0,
  credit_days: 30,
  payment_terms: '',
  requires_approval: false,
  is_active: true,
}

// Helper functions to parse API values (backend returns decimals as strings)
const toNumber = (value: any, defaultValue = 0): number => {
  const parsed = parseFloat(String(value))
  return isNaN(parsed) ? defaultValue : parsed
}

const toInt = (value: any, defaultValue = 0): number => {
  const parsed = parseInt(String(value), 10)
  return isNaN(parsed) ? defaultValue : parsed
}

export default function CustomerTypesPage() {
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  // State
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedType, setSelectedType] = useState<CustomerType | null>(null)
  const [createForm, setCreateForm] = useState<CreateCustomerTypeForm>(initialCreateForm)
  const [editForm, setEditForm] = useState<EditCustomerTypeForm>(initialEditForm)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Fetch customer types
  const { data: customerTypesData, isLoading, refetch } = useQuery({
    queryKey: ['customer-types', searchTerm, statusFilter],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (searchTerm) params.search = searchTerm
      if (statusFilter !== 'all') params.is_active = statusFilter === 'active' ? 'true' : 'false'
      return apiClient.get<{ paginator?: any; results?: CustomerType[] } | CustomerType[]>('/customer-types/', params)
    },
  })

  // Handle both paginated response { results: [...] } and direct array response
  const customerTypes: CustomerType[] = Array.isArray(customerTypesData)
    ? customerTypesData
    : (customerTypesData?.results || [])

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateCustomerTypeForm) => apiClient.post<CustomerType>('/customer-types/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-types'] })
      setShowCreateModal(false)
      setCreateForm(initialCreateForm)
      setFormErrors({})
      addToast({ type: 'success', title: 'Success', message: 'Customer type created successfully' })
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to create customer type'
      addToast({ type: 'error', title: 'Error', message })
      if (error.errors) {
        setFormErrors(error.errors)
      }
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<EditCustomerTypeForm> }) =>
      apiClient.patch<CustomerType>(`/customer-types/${id}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-types'] })
      setShowEditModal(false)
      setSelectedType(null)
      setFormErrors({})
      addToast({ type: 'success', title: 'Success', message: 'Customer type updated successfully' })
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to update customer type'
      addToast({ type: 'error', title: 'Error', message })
      if (error.errors) {
        setFormErrors(error.errors)
      }
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/customer-types/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-types'] })
      setShowDeleteModal(false)
      setSelectedType(null)
      addToast({ type: 'success', title: 'Success', message: 'Customer type deleted successfully' })
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to delete customer type'
      addToast({ type: 'error', title: 'Error', message })
    },
  })

  // Activate/Deactivate mutations
  const activateMutation = useMutation({
    mutationFn: (id: number) => apiClient.post(`/customer-types/${id}/activate/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-types'] })
      addToast({ type: 'success', title: 'Success', message: 'Customer type activated' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to activate' })
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => apiClient.post(`/customer-types/${id}/deactivate/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-types'] })
      addToast({ type: 'success', title: 'Success', message: 'Customer type deactivated' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to deactivate' })
    },
  })

  // Handlers
  const handleCreate = () => {
    setCreateForm(initialCreateForm)
    setFormErrors({})
    setShowCreateModal(true)
  }

  const handleEdit = (type: CustomerType) => {
    setSelectedType(type)
    setEditForm({
      name: type.name,
      description: type.description || '',
      discount_rate: toNumber(type.discount_rate),
      credit_limit: toNumber(type.credit_limit),
      credit_days: toInt(type.credit_days, 30),
      payment_terms: type.payment_terms || '',
      requires_approval: type.requires_approval || false,
      is_active: type.is_active,
    })
    setFormErrors({})
    setShowEditModal(true)
  }

  const handleView = (type: CustomerType) => {
    setSelectedType(type)
    setShowViewModal(true)
  }

  const handleDelete = (type: CustomerType) => {
    setSelectedType(type)
    setShowDeleteModal(true)
  }

  const validateCreateForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!createForm.name.trim()) errors.name = 'Name is required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateEditForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!editForm.name.trim()) errors.name = 'Name is required'
    if (editForm.discount_rate < 0 || editForm.discount_rate > 100) {
      errors.discount_rate = 'Discount rate must be between 0 and 100'
    }
    if (editForm.credit_limit < 0) errors.credit_limit = 'Credit limit cannot be negative'
    if (editForm.credit_days < 0) errors.credit_days = 'Credit days cannot be negative'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const submitCreate = () => {
    if (!validateCreateForm()) return
    createMutation.mutate(createForm)
  }

  const submitEdit = () => {
    if (!validateEditForm() || !selectedType) return
    updateMutation.mutate({ id: selectedType.id, data: editForm })
  }

  const confirmDelete = () => {
    if (selectedType) {
      deleteMutation.mutate(selectedType.id)
    }
  }

  // Stats
  const totalTypes = customerTypes.length
  const activeTypes = customerTypes.filter(t => t.is_active).length
  const totalCustomers = customerTypes.reduce((sum, t) => sum + (t.customers_count || 0), 0)

  const getStatusBadge = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800'
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Customer Types</h1>
            <p className="text-muted-foreground">Manage customer categories and their pricing structures</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="mofad-btn-primary" onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Customer Type
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Types</p>
                  <p className="text-2xl font-bold text-primary">{totalTypes}</p>
                </div>
                <Users className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Types</p>
                  <p className="text-2xl font-bold text-green-600">{activeTypes}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Customers</p>
                  <p className="text-2xl font-bold text-secondary">{totalCustomers.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-secondary/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search customer types..."
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Customer Types Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-16 bg-gray-200 rounded"></div>
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : customerTypes.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No customer types found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || statusFilter !== 'all'
                      ? 'Try adjusting your search or filters'
                      : 'Get started by adding your first customer type'}
                  </p>
                  <Button className="mofad-btn-primary" onClick={handleCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Customer Type
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            customerTypes.map((type) => (
              <Card key={type.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{type.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(type.is_active)}`}>
                          {type.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{type.description || 'No description'}</p>
                    </div>

                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleView(type)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(type)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(type)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Percent className="w-4 h-4 text-green-600" />
                        <span className="text-lg font-bold text-green-600">{toNumber(type.discount_rate)}%</span>
                      </div>
                      <p className="text-xs text-gray-600">Discount Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-600">{type.customers_count || 0}</p>
                      <p className="text-xs text-gray-600">Customers</p>
                    </div>
                  </div>

                  {/* Financial Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Credit Limit</span>
                      <span className="font-medium">{formatCurrency(toNumber(type.credit_limit))}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Credit Days</span>
                      <span className="font-medium">{toInt(type.credit_days)} days</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Requires Approval</span>
                      <span className="font-medium">{type.requires_approval ? 'Yes' : 'No'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t">
                    {type.is_active ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => deactivateMutation.mutate(type.id)}
                        disabled={deactivateMutation.isPending}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Deactivate
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => activateMutation.mutate(type.id)}
                        disabled={activateMutation.isPending}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Activate
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(type)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full m-4">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Add Customer Type</h2>
                <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="Enter customer type name"
                  />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    placeholder="Enter description (optional)"
                  />
                </div>

                <p className="text-sm text-gray-500">
                  You can add discount rates, credit limits, and other settings after creation by editing the customer type.
                </p>
              </div>
              <div className="flex justify-end gap-2 p-6 border-t">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button
                  className="mofad-btn-primary"
                  onClick={submitCreate}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Create
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
                <h2 className="text-xl font-semibold">Edit Customer Type</h2>
                <Button variant="ghost" onClick={() => setShowEditModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-6 space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                    {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={editForm.is_active ? 'active' : 'inactive'}
                      onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === 'active' })}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                </div>

                {/* Financial Settings */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Financial Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discount Rate (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                          formErrors.discount_rate ? 'border-red-500' : 'border-gray-300'
                        }`}
                        value={editForm.discount_rate}
                        onChange={(e) => setEditForm({ ...editForm, discount_rate: parseFloat(e.target.value) || 0 })}
                      />
                      {formErrors.discount_rate && <p className="text-red-500 text-xs mt-1">{formErrors.discount_rate}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit (₦)</label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                          formErrors.credit_limit ? 'border-red-500' : 'border-gray-300'
                        }`}
                        value={editForm.credit_limit}
                        onChange={(e) => setEditForm({ ...editForm, credit_limit: parseFloat(e.target.value) || 0 })}
                      />
                      {formErrors.credit_limit && <p className="text-red-500 text-xs mt-1">{formErrors.credit_limit}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Credit Days</label>
                      <input
                        type="number"
                        min="0"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                          formErrors.credit_days ? 'border-red-500' : 'border-gray-300'
                        }`}
                        value={editForm.credit_days}
                        onChange={(e) => setEditForm({ ...editForm, credit_days: parseInt(e.target.value) || 0 })}
                      />
                      {formErrors.credit_days && <p className="text-red-500 text-xs mt-1">{formErrors.credit_days}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        value={editForm.payment_terms}
                        onChange={(e) => setEditForm({ ...editForm, payment_terms: e.target.value })}
                        placeholder="e.g., Net 30"
                      />
                    </div>
                  </div>
                </div>

                {/* Approval Settings */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium text-gray-900 mb-3">Approval Settings</h3>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      checked={editForm.requires_approval}
                      onChange={(e) => setEditForm({ ...editForm, requires_approval: e.target.checked })}
                    />
                    <span className="text-sm text-gray-700">Requires approval for orders</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2 p-6 border-t sticky bottom-0 bg-white">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button
                  className="mofad-btn-primary"
                  onClick={submitEdit}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Update
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && selectedType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-lg w-full m-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Customer Type Details</h2>
                <Button variant="ghost" onClick={() => setShowViewModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedType.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedType.is_active)}`}>
                      {selectedType.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {selectedType.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-gray-900">{selectedType.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Discount Rate</label>
                    <p className="text-lg font-semibold text-green-600">{toNumber(selectedType.discount_rate)}%</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Customers</label>
                    <p className="text-lg font-semibold">{selectedType.customers_count || 0}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Credit Limit</label>
                    <p className="text-lg font-semibold">{formatCurrency(toNumber(selectedType.credit_limit))}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Credit Days</label>
                    <p className="text-lg font-semibold">{toInt(selectedType.credit_days)} days</p>
                  </div>
                </div>

                {selectedType.payment_terms && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payment Terms</label>
                    <p className="text-gray-900">{selectedType.payment_terms}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500">Requires Approval</label>
                  <p className="text-gray-900">{selectedType.requires_approval ? 'Yes' : 'No'}</p>
                </div>

                <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-gray-500">Created</label>
                    <p className="text-gray-900">{formatDateTime(selectedType.created_at)}</p>
                  </div>
                  <div>
                    <label className="text-gray-500">Last Updated</label>
                    <p className="text-gray-900">{formatDateTime(selectedType.updated_at)}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 p-6 border-t">
                <Button variant="outline" onClick={() => setShowViewModal(false)}>
                  Close
                </Button>
                <Button className="mofad-btn-primary" onClick={() => {
                  setShowViewModal(false)
                  handleEdit(selectedType)
                }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full m-4">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-red-600">Confirm Deletion</h2>
                <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Delete Customer Type</h3>
                    <p className="text-sm text-gray-600">This action cannot be undone</p>
                  </div>
                </div>
                <p className="text-gray-700">
                  Are you sure you want to delete <strong>{selectedType.name}</strong>?
                  {(selectedType.customers_count || 0) > 0 && (
                    <span className="text-red-600 block mt-2">
                      Warning: This customer type has {selectedType.customers_count} associated customers.
                    </span>
                  )}
                </p>
              </div>
              <div className="flex justify-end gap-2 p-6 border-t">
                <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={confirmDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
