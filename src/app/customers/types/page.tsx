'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { BulkActionBar } from '@/components/ui/BulkActionBar'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import apiClient from '@/lib/apiClient'
import { formatCurrency } from '@/lib/utils'
import { Pagination } from '@/components/ui/Pagination'
import { useToast } from '@/components/ui/Toast'
import { useSelection } from '@/hooks/useSelection'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Percent,
  X,
  Save,
  Loader2,
  RefreshCw,
  Eye,
  CheckCircle,
  CreditCard,
  Power,
  PowerOff,
  Calendar,
} from 'lucide-react'

interface CustomerType {
  id: number
  name: string
  description: string | null
  discount_rate: number | null
  credit_limit: number | null
  credit_days: number | null
  payment_terms: string | null
  requires_approval: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

interface CustomerTypeFormData {
  name: string
  description: string
  discount_rate: number
  credit_limit: number
  credit_days: number
  payment_terms: string
  requires_approval: boolean
}

const initialFormData: CustomerTypeFormData = {
  name: '',
  description: '',
  discount_rate: 0,
  credit_limit: 0,
  credit_days: 30,
  payment_terms: 'NET 30',
  requires_approval: false,
}

export default function CustomerTypesPage() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  // State
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedType, setSelectedType] = useState<CustomerType | null>(null)
  const [formData, setFormData] = useState<CustomerTypeFormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  // Fetch customer types
  const { data: customerTypesData, isLoading, error, refetch } = useQuery({
    queryKey: ['customer-types', searchTerm, statusFilter],
    queryFn: async () => {
      const params: any = {}
      if (searchTerm) params.search = searchTerm
      if (statusFilter !== 'all') params.is_active = statusFilter === 'active'
      return apiClient.getCustomerTypes(params)
    },
  })

  // Get customer types from response
  const allCustomerTypes: CustomerType[] = Array.isArray(customerTypesData)
    ? customerTypesData
    : customerTypesData?.results || customerTypesData?.data?.results || []

  // Pagination calculations
  const totalCount = allCustomerTypes.length
  const totalPages = Math.ceil(totalCount / pageSize) || 1
  const startIndex = (currentPage - 1) * pageSize
  const customerTypes = allCustomerTypes.slice(startIndex, startIndex + pageSize)

  // Selection for bulk actions
  const selection = useSelection({
    items: customerTypes,
    getId: (item) => item.id,
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CustomerTypeFormData) => apiClient.createCustomerType({
      name: data.name,
      description: data.description || undefined,
      discount_percentage: data.discount_rate,
      credit_limit: data.credit_limit,
      credit_days: data.credit_days,
      requires_approval: data.requires_approval,
      is_active: true,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-types'] })
      showToast('Customer type created successfully', 'success')
      setShowCreateModal(false)
      setFormData(initialFormData)
      setFormErrors({})
    },
    onError: (error: any) => {
      showToast(error.message || 'Failed to create customer type', 'error')
      if (error.errors) {
        setFormErrors(error.errors)
      }
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CustomerTypeFormData> }) =>
      apiClient.updateCustomerType(id, {
        name: data.name,
        description: data.description || undefined,
        discount_percentage: data.discount_rate,
        credit_limit: data.credit_limit,
        credit_days: data.credit_days,
        requires_approval: data.requires_approval,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-types'] })
      showToast('Customer type updated successfully', 'success')
      setShowEditModal(false)
      setSelectedType(null)
      setFormData(initialFormData)
      setFormErrors({})
    },
    onError: (error: any) => {
      showToast(error.message || 'Failed to update customer type', 'error')
      if (error.errors) {
        setFormErrors(error.errors)
      }
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteCustomerType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-types'] })
      showToast('Customer type deleted successfully', 'success')
      setShowDeleteModal(false)
      setSelectedType(null)
    },
    onError: (error: any) => {
      showToast(error.message || 'Failed to delete customer type', 'error')
    },
  })

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      apiClient.updateCustomerType(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-types'] })
      showToast('Status updated successfully', 'success')
    },
    onError: (error: any) => {
      showToast(error.message || 'Failed to update status', 'error')
    },
  })

  // Bulk delete handler
  const handleBulkDelete = async () => {
    const selectedIds = selection.getSelectedIds()
    if (selectedIds.length === 0) return

    setIsBulkDeleting(true)
    try {
      for (const id of selectedIds) {
        await apiClient.deleteCustomerType(id)
      }
      queryClient.invalidateQueries({ queryKey: ['customer-types'] })
      showToast(`Successfully deleted ${selectedIds.length} customer type(s)`, 'success')
      selection.clearSelection()
      setShowBulkDeleteModal(false)
    } catch (error: any) {
      showToast(error.message || 'Failed to delete some customer types', 'error')
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
    }))

    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!formData.name.trim()) errors.name = 'Name is required'
    if (formData.discount_rate < 0 || formData.discount_rate > 100) {
      errors.discount_rate = 'Discount must be between 0 and 100'
    }
    if (formData.credit_limit < 0) errors.credit_limit = 'Credit limit must be positive'
    if (formData.credit_days < 0) errors.credit_days = 'Credit days must be positive'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreate = () => {
    if (!validateForm()) return
    createMutation.mutate(formData)
  }

  const handleUpdate = () => {
    if (!selectedType || !validateForm()) return
    updateMutation.mutate({ id: selectedType.id, data: formData })
  }

  const handleDelete = () => {
    if (!selectedType) return
    deleteMutation.mutate(selectedType.id)
  }

  const handleView = (type: CustomerType) => {
    setSelectedType(type)
    setShowViewModal(true)
  }

  const handleEdit = (type: CustomerType) => {
    setSelectedType(type)
    setFormData({
      name: type.name,
      description: type.description || '',
      discount_rate: type.discount_rate || 0,
      credit_limit: type.credit_limit || 0,
      credit_days: type.credit_days || 30,
      payment_terms: type.payment_terms || 'NET 30',
      requires_approval: type.requires_approval || false,
    })
    setFormErrors({})
    setShowEditModal(true)
  }

  const handleDeleteClick = (type: CustomerType) => {
    setSelectedType(type)
    setShowDeleteModal(true)
  }

  const handleToggleActive = (type: CustomerType) => {
    toggleActiveMutation.mutate({ id: type.id, is_active: !type.is_active })
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

  // Calculate stats from all data (not paginated)
  const totalTypes = allCustomerTypes.length
  const activeTypes = allCustomerTypes.filter(t => t.is_active).length
  const avgDiscount = allCustomerTypes.length > 0
    ? (allCustomerTypes.reduce((sum, t) => sum + (t.discount_rate || 0), 0) / allCustomerTypes.length).toFixed(1)
    : '0'

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Types</h1>
            <p className="text-gray-600">Manage customer categories, pricing, and credit terms</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button className="mofad-btn-primary" onClick={() => {
              setFormData(initialFormData)
              setFormErrors({})
              setShowCreateModal(true)
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer Type
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Types</p>
                <p className="text-2xl font-bold text-gray-900">{totalTypes}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Types</p>
                <p className="text-2xl font-bold text-green-600">{activeTypes}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Discount</p>
                <p className="text-2xl font-bold text-purple-600">{avgDiscount}%</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Percent className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search customer types..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            <span className="ml-2 text-gray-600">Loading customer types...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Failed to load customer types. Please try again.</p>
            <Button variant="outline" className="mt-2" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {/* Customer Types Table */}
        {!isLoading && !error && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <Checkbox
                      checked={selection.isAllSelected}
                      indeterminate={selection.isPartiallySelected}
                      onChange={selection.toggleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit Limit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit Days</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customerTypes.map((type) => (
                  <tr key={type.id} className={`hover:bg-gray-50 ${selection.isSelected(type.id) ? 'bg-primary-50' : ''}`}>
                    <td className="px-4 py-4">
                      <Checkbox
                        checked={selection.isSelected(type.id)}
                        onChange={() => selection.toggleSelect(type.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{type.name}</div>
                        {type.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">{type.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Percent className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-gray-900">{type.discount_rate || 0}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 text-blue-500 mr-1" />
                        <span className="text-sm text-gray-900">{formatCurrency(type.credit_limit || 0)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-orange-500 mr-1" />
                        <span className="text-sm text-gray-900">{type.credit_days || 0} days</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(type.is_active)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleView(type)} title="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(type)} title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(type)}
                          title={type.is_active ? 'Deactivate' : 'Activate'}
                          className={type.is_active ? 'text-yellow-600' : 'text-green-600'}
                        >
                          {type.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(type)}
                          className="text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {customerTypes.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No customer types found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== 'all'
                    ? 'No customer types match your search criteria.'
                    : 'Get started by adding your first customer type.'}
                </p>
                <Button className="mofad-btn-primary" onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Customer Type
                </Button>
              </div>
            )}
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

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Add Customer Type</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="e.g., Premium Customer"
                  />
                  {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Brief description of this customer type..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount Rate (%)</label>
                    <input
                      type="number"
                      name="discount_rate"
                      value={formData.discount_rate}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      step="0.1"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors.discount_rate ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {formErrors.discount_rate && <p className="text-red-500 text-sm mt-1">{formErrors.discount_rate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit (₦)</label>
                    <input
                      type="number"
                      name="credit_limit"
                      value={formData.credit_limit}
                      onChange={handleInputChange}
                      min="0"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors.credit_limit ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {formErrors.credit_limit && <p className="text-red-500 text-sm mt-1">{formErrors.credit_limit}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Credit Days</label>
                    <input
                      type="number"
                      name="credit_days"
                      value={formData.credit_days}
                      onChange={handleInputChange}
                      min="0"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors.credit_days ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {formErrors.credit_days && <p className="text-red-500 text-sm mt-1">{formErrors.credit_days}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                    <select
                      name="payment_terms"
                      value={formData.payment_terms}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="NET 7">NET 7</option>
                      <option value="NET 15">NET 15</option>
                      <option value="NET 30">NET 30</option>
                      <option value="NET 45">NET 45</option>
                      <option value="NET 60">NET 60</option>
                      <option value="NET 90">NET 90</option>
                      <option value="Cash on Delivery">Cash on Delivery</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="requires_approval"
                    checked={formData.requires_approval}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Requires approval for orders
                  </label>
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
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
                      Create
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Edit Customer Type</h3>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount Rate (%)</label>
                    <input
                      type="number"
                      name="discount_rate"
                      value={formData.discount_rate}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      step="0.1"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors.discount_rate ? 'border-red-500' : 'border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit (₦)</label>
                    <input
                      type="number"
                      name="credit_limit"
                      value={formData.credit_limit}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Credit Days</label>
                    <input
                      type="number"
                      name="credit_days"
                      value={formData.credit_days}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                    <select
                      name="payment_terms"
                      value={formData.payment_terms}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="NET 7">NET 7</option>
                      <option value="NET 15">NET 15</option>
                      <option value="NET 30">NET 30</option>
                      <option value="NET 45">NET 45</option>
                      <option value="NET 60">NET 60</option>
                      <option value="NET 90">NET 90</option>
                      <option value="Cash on Delivery">Cash on Delivery</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="requires_approval"
                    checked={formData.requires_approval}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Requires approval for orders
                  </label>
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

        {/* View Modal */}
        {showViewModal && selectedType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Customer Type Details</h3>
                <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-900">{selectedType.name}</h2>
                  {getStatusBadge(selectedType.is_active)}
                </div>

                {selectedType.description && (
                  <p className="text-gray-600">{selectedType.description}</p>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{selectedType.discount_rate || 0}%</p>
                    <p className="text-sm text-gray-600">Discount Rate</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(selectedType.credit_limit || 0)}</p>
                    <p className="text-sm text-gray-600">Credit Limit</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{selectedType.credit_days || 0}</p>
                    <p className="text-sm text-gray-600">Credit Days</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-purple-600">{selectedType.payment_terms || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Payment Terms</p>
                  </div>
                </div>

                <div className="flex items-center pt-2">
                  {selectedType.requires_approval ? (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                      Requires Approval
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      No Approval Required
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => setShowViewModal(false)}>Close</Button>
                <Button className="mofad-btn-primary" onClick={() => {
                  setShowViewModal(false)
                  handleEdit(selectedType)
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-red-600">Delete Customer Type</h3>
                <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete <strong>{selectedType.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                <Button
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Action Bar */}
        <BulkActionBar
          selectedCount={selection.selectedCount}
          onDelete={() => setShowBulkDeleteModal(true)}
          onClearSelection={selection.clearSelection}
        />

        {/* Bulk Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showBulkDeleteModal}
          onClose={() => setShowBulkDeleteModal(false)}
          onConfirm={handleBulkDelete}
          title="Delete Customer Types"
          message={`Are you sure you want to delete ${selection.selectedCount} customer type(s)? This action cannot be undone.`}
          confirmText="Delete"
          isLoading={isBulkDeleting}
          variant="danger"
        />
      </div>
    </AppLayout>
  )
}
