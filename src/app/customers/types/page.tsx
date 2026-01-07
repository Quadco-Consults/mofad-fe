'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import mockApi from '@/lib/mockApi'
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
  pricing_scheme_id: number
}

interface EditCustomerTypeForm {
  name: string
  description: string
  discount_percentage: number
  min_order_quantity: number
  payment_terms: string
  commission_rate: number
  status: string
  pricing_scheme_id: number
}

interface PricingScheme {
  id: number
  name: string
  description: string
  base_discount: number
  payment_terms: string
  is_active: boolean
}

const initialCreateForm: CreateCustomerTypeForm = {
  name: '',
  description: '',
  pricing_scheme_id: 1,
}

const initialEditForm: EditCustomerTypeForm = {
  name: '',
  description: '',
  discount_percentage: 0,
  min_order_quantity: 0,
  payment_terms: '',
  commission_rate: 0,
  status: 'active',
  pricing_scheme_id: 1,
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
      const data = await mockApi.get<CustomerType[]>('/customer-types/')
      let filtered = data || []

      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(type =>
          type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (type.description && type.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      }

      // Apply status filter
      if (statusFilter === 'active') {
        filtered = filtered.filter(type => type.status === 'active')
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(type => type.status === 'inactive')
      }

      return filtered
    },
  })

  // Handle array response from mockApi
  const customerTypes: CustomerType[] = customerTypesData || []

  // Fetch pricing schemes
  const { data: pricingSchemesData } = useQuery({
    queryKey: ['pricing-schemes'],
    queryFn: async () => {
      return await mockApi.get<PricingScheme[]>('/pricing-schemes/')
    },
  })

  const pricingSchemes: PricingScheme[] = pricingSchemesData || []

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateCustomerTypeForm) => {
      // Find the selected pricing scheme
      const selectedScheme = pricingSchemes.find(scheme => scheme.id === data.pricing_scheme_id) || pricingSchemes[0]

      // Simulate creating a new customer type
      const newType: CustomerType = {
        id: Math.max(...customerTypes.map(t => t.id), 0) + 1,
        name: data.name,
        description: data.description,
        pricing_scheme_id: data.pricing_scheme_id,
        pricing_scheme_name: selectedScheme?.name || 'Cost Price',
        discount_percentage: selectedScheme?.base_discount || 0,
        min_order_quantity: 100,
        payment_terms: selectedScheme?.payment_terms || 'NET 45',
        commission_rate: 8.5,
        customer_count: 0,
        status: 'active',
        is_active: true,
        discount_rate: selectedScheme?.base_discount || 15,
        credit_limit: 0,
        credit_days: 30,
        requires_approval: false,
        customers_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      await mockApi.post('/customer-types/', newType)
      return newType
    },
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
    mutationFn: async ({ id, data }: { id: number; data: Partial<EditCustomerTypeForm> }) => {
      const updatedType = { ...selectedType, ...data, updated_at: new Date().toISOString() }
      await mockApi.patch(`/customer-types/${id}/`, updatedType)
      return updatedType
    },
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
    mutationFn: async (id: number) => {
      await mockApi.delete(`/customer-types/${id}/`)
      return true
    },
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
    mutationFn: async (id: number) => {
      const type = customerTypes.find(t => t.id === id)
      if (type) {
        const updatedType = { ...type, status: 'active', is_active: true, updated_at: new Date().toISOString() }
        await mockApi.patch(`/customer-types/${id}/`, updatedType)
      }
      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-types'] })
      addToast({ type: 'success', title: 'Success', message: 'Customer type activated' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to activate' })
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: async (id: number) => {
      const type = customerTypes.find(t => t.id === id)
      if (type) {
        const updatedType = { ...type, status: 'inactive', is_active: false, updated_at: new Date().toISOString() }
        await mockApi.patch(`/customer-types/${id}/`, updatedType)
      }
      return true
    },
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
      discount_percentage: type.discount_percentage || 0,
      min_order_quantity: type.min_order_quantity || 0,
      payment_terms: type.payment_terms || '',
      commission_rate: type.commission_rate || 0,
      status: type.status,
      pricing_scheme_id: type.pricing_scheme_id || 1,
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
    if (editForm.discount_percentage < 0 || editForm.discount_percentage > 100) {
      errors.discount_percentage = 'Discount percentage must be between 0 and 100'
    }
    if (editForm.min_order_quantity < 0) errors.min_order_quantity = 'Min order quantity cannot be negative'
    if (editForm.commission_rate < 0) errors.commission_rate = 'Commission rate cannot be negative'
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
  const activeTypes = customerTypes.filter(t => t.status === 'active').length
  const totalCustomers = customerTypes.reduce((sum, t) => sum + (t.customer_count || 0), 0)

  const getStatusBadge = (status: string) => {
    return status === 'active'
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

        {/* Customer Types Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pricing Scheme
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Terms
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4">
                          <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-48"></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-28"></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-12"></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-8"></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-16"></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="animate-pulse flex gap-2">
                            <div className="h-8 bg-gray-200 rounded w-8"></div>
                            <div className="h-8 bg-gray-200 rounded w-8"></div>
                            <div className="h-8 bg-gray-200 rounded w-8"></div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : customerTypes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
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
                      </td>
                    </tr>
                  ) : (
                    customerTypes.map((type) => (
                      <tr key={type.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{type.name}</div>
                            <div className="text-sm text-gray-500">{type.description || 'No description'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-blue-600">{type.pricing_scheme_name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Percent className="w-4 h-4 text-green-600 mr-1" />
                            <span className="text-sm font-medium text-green-600">{type.discount_percentage}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">{type.customer_count || 0}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">{type.payment_terms}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(type.status)}`}>
                            {type.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(type)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(type)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(type)}
                              className="text-red-600 hover:text-red-900"
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
          </CardContent>
        </Card>

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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pricing Scheme <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={createForm.pricing_scheme_id}
                    onChange={(e) => setCreateForm({ ...createForm, pricing_scheme_id: parseInt(e.target.value) })}
                  >
                    {pricingSchemes.filter(scheme => scheme.is_active).map(scheme => (
                      <option key={scheme.id} value={scheme.id}>
                        {scheme.name} ({scheme.base_discount}% discount)
                      </option>
                    ))}
                  </select>
                </div>

                <p className="text-sm text-gray-500">
                  The pricing scheme determines base discount rates and payment terms for this customer type.
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
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
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

                {/* Pricing Scheme */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Pricing & Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Scheme</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        value={editForm.pricing_scheme_id}
                        onChange={(e) => setEditForm({ ...editForm, pricing_scheme_id: parseInt(e.target.value) })}
                      >
                        {pricingSchemes.filter(scheme => scheme.is_active).map(scheme => (
                          <option key={scheme.id} value={scheme.id}>
                            {scheme.name} ({scheme.base_discount}% base discount)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                          formErrors.discount_percentage ? 'border-red-500' : 'border-gray-300'
                        }`}
                        value={editForm.discount_percentage}
                        onChange={(e) => setEditForm({ ...editForm, discount_percentage: parseFloat(e.target.value) || 0 })}
                      />
                      {formErrors.discount_percentage && <p className="text-red-500 text-xs mt-1">{formErrors.discount_percentage}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Quantity</label>
                      <input
                        type="number"
                        min="0"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                          formErrors.min_order_quantity ? 'border-red-500' : 'border-gray-300'
                        }`}
                        value={editForm.min_order_quantity}
                        onChange={(e) => setEditForm({ ...editForm, min_order_quantity: parseInt(e.target.value) || 0 })}
                      />
                      {formErrors.min_order_quantity && <p className="text-red-500 text-xs mt-1">{formErrors.min_order_quantity}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Commission Rate (%)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                          formErrors.commission_rate ? 'border-red-500' : 'border-gray-300'
                        }`}
                        value={editForm.commission_rate}
                        onChange={(e) => setEditForm({ ...editForm, commission_rate: parseFloat(e.target.value) || 0 })}
                      />
                      {formErrors.commission_rate && <p className="text-red-500 text-xs mt-1">{formErrors.commission_rate}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        value={editForm.payment_terms}
                        onChange={(e) => setEditForm({ ...editForm, payment_terms: e.target.value })}
                        placeholder="e.g., NET 30, Immediate, Letter of Credit"
                      />
                    </div>
                  </div>
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedType.status)}`}>
                      {selectedType.status === 'active' ? 'Active' : 'Inactive'}
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
                    <p className="text-lg font-semibold text-green-600">{selectedType.discount_percentage}%</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Customers</label>
                    <p className="text-lg font-semibold">{selectedType.customer_count || 0}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Min Order Quantity</label>
                    <p className="text-lg font-semibold">{selectedType.min_order_quantity?.toLocaleString() || 0}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Commission Rate</label>
                    <p className="text-lg font-semibold">{selectedType.commission_rate || 0}%</p>
                  </div>
                </div>

                {selectedType.payment_terms && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payment Terms</label>
                    <p className="text-gray-900">{selectedType.payment_terms}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500">Pricing Scheme</label>
                  <p className="text-gray-900 text-blue-600">{selectedType.pricing_scheme_name}</p>
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
                  {(selectedType.customer_count || 0) > 0 && (
                    <span className="text-red-600 block mt-2">
                      Warning: This customer type has {selectedType.customer_count} associated customers.
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
