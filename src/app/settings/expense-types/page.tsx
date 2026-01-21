'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Plus, Edit, Trash2, Eye, Receipt, DollarSign, Building2, X, Save, Loader2, CheckCircle, Power, PowerOff, RefreshCw, FileText, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { BulkActionBar } from '@/components/ui/BulkActionBar'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { AppLayout } from '@/components/layout/AppLayout'
import apiClient from '@/lib/apiClient'
import { useToast } from '@/components/ui/Toast'
import { formatCurrency } from '@/lib/utils'
import { Pagination } from '@/components/ui/Pagination'
import { useSelection } from '@/hooks/useSelection'

interface ExpenseType {
  id: number
  name: string
  description: string | null
  category: string
  requires_approval: boolean
  approval_limit: number | null
  account_code: string | null
  is_tax_deductible: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

interface ExpenseTypeFormData {
  name: string
  description: string
  category: string
  requires_approval: boolean
  approval_limit: string
  account_code: string
  is_tax_deductible: boolean
}

const CATEGORY_OPTIONS = [
  { value: 'operational', label: 'Operational' },
  { value: 'administrative', label: 'Administrative' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'transport', label: 'Transport' },
  { value: 'other', label: 'Other' },
]

const initialFormData: ExpenseTypeFormData = {
  name: '',
  description: '',
  category: 'operational',
  requires_approval: false,
  approval_limit: '',
  account_code: '',
  is_tax_deductible: true,
}

function ExpenseTypesPage() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedType, setSelectedType] = useState<ExpenseType | null>(null)
  const [formData, setFormData] = useState<ExpenseTypeFormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, categoryFilter])

  // Fetch expense types
  const { data: typesData, isLoading, error, refetch } = useQuery({
    queryKey: ['expense-types', searchTerm, statusFilter, categoryFilter],
    queryFn: async () => {
      const params: any = {}
      if (searchTerm) params.search = searchTerm
      if (statusFilter !== 'all') params.is_active = statusFilter === 'active'
      if (categoryFilter !== 'all') params.category = categoryFilter
      return apiClient.getExpenseTypes(params)
    },
  })

  // Get expense types from response
  const allExpenseTypes: ExpenseType[] = Array.isArray(typesData)
    ? typesData
    : typesData?.results || typesData?.data?.results || []

  // Pagination calculations
  const totalCount = allExpenseTypes.length
  const totalPages = Math.ceil(totalCount / pageSize) || 1
  const startIndex = (currentPage - 1) * pageSize
  const expenseTypes = allExpenseTypes.slice(startIndex, startIndex + pageSize)

  // Selection for bulk actions
  const selection = useSelection({
    items: expenseTypes,
    getId: (item) => item.id,
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.createExpenseType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-types'] })
      showToast('Expense type created successfully', 'success')
      setShowAddModal(false)
      setFormData(initialFormData)
      setFormErrors({})
    },
    onError: (error: any) => {
      showToast(error.message || 'Failed to create expense type', 'error')
      if (error.errors) {
        setFormErrors(error.errors)
      }
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiClient.updateExpenseType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-types'] })
      showToast('Expense type updated successfully', 'success')
      setShowEditModal(false)
      setSelectedType(null)
      setFormData(initialFormData)
      setFormErrors({})
    },
    onError: (error: any) => {
      showToast(error.message || 'Failed to update expense type', 'error')
      if (error.errors) {
        setFormErrors(error.errors)
      }
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteExpenseType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-types'] })
      showToast('Expense type deleted successfully', 'success')
      setShowDeleteModal(false)
      setSelectedType(null)
    },
    onError: (error: any) => {
      showToast(error.message || 'Failed to delete expense type', 'error')
    },
  })

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      apiClient.updateExpenseType(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-types'] })
      showToast('Expense type status updated successfully', 'success')
    },
    onError: (error: any) => {
      showToast(error.message || 'Failed to update expense type status', 'error')
    },
  })

  // Bulk delete handler
  const handleBulkDelete = async () => {
    const selectedIds = selection.getSelectedIds()
    if (selectedIds.length === 0) return

    setIsBulkDeleting(true)
    try {
      for (const id of selectedIds) {
        await apiClient.deleteExpenseType(id)
      }
      queryClient.invalidateQueries({ queryKey: ['expense-types'] })
      showToast(`Successfully deleted ${selectedIds.length} expense type(s)`, 'success')
      selection.clearSelection()
      setShowBulkDeleteModal(false)
    } catch (error: any) {
      showToast(error.message || 'Failed to delete some expense types', 'error')
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!formData.name.trim()) errors.name = 'Expense type name is required'
    if (!formData.category) errors.category = 'Category is required'
    if (formData.requires_approval && !formData.approval_limit) {
      errors.approval_limit = 'Approval limit is required when approval is enabled'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const prepareFormDataForSubmit = () => {
    const data: any = {
      name: formData.name,
      category: formData.category,
      requires_approval: formData.requires_approval,
      is_tax_deductible: formData.is_tax_deductible,
    }
    if (formData.description) data.description = formData.description
    if (formData.approval_limit) data.approval_limit = parseFloat(formData.approval_limit)
    if (formData.account_code) data.account_code = formData.account_code
    return data
  }

  const handleCreate = () => {
    if (!validateForm()) return
    createMutation.mutate(prepareFormDataForSubmit())
  }

  const handleUpdate = () => {
    if (!selectedType || !validateForm()) return
    updateMutation.mutate({ id: selectedType.id, data: prepareFormDataForSubmit() })
  }

  const handleDelete = () => {
    if (!selectedType) return
    deleteMutation.mutate(selectedType.id)
  }

  const handleView = (type: ExpenseType) => {
    setSelectedType(type)
    setShowViewModal(true)
  }

  const handleEdit = (type: ExpenseType) => {
    setSelectedType(type)
    setFormData({
      name: type.name,
      description: type.description || '',
      category: type.category,
      requires_approval: type.requires_approval,
      approval_limit: type.approval_limit?.toString() || '',
      account_code: type.account_code || '',
      is_tax_deductible: type.is_tax_deductible,
    })
    setFormErrors({})
    setShowEditModal(true)
  }

  const handleDeleteClick = (type: ExpenseType) => {
    setSelectedType(type)
    setShowDeleteModal(true)
  }

  const handleToggleActive = (type: ExpenseType) => {
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

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      operational: 'bg-blue-100 text-blue-800',
      administrative: 'bg-purple-100 text-purple-800',
      marketing: 'bg-pink-100 text-pink-800',
      maintenance: 'bg-orange-100 text-orange-800',
      utilities: 'bg-cyan-100 text-cyan-800',
      transport: 'bg-green-100 text-green-800',
      other: 'bg-gray-100 text-gray-800',
    }
    const label = CATEGORY_OPTIONS.find(c => c.value === category)?.label || category
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[category] || colors.other}`}>
        {label}
      </span>
    )
  }

  // Calculate summary stats from all data (not paginated)
  const totalTypes = allExpenseTypes.length
  const activeTypes = allExpenseTypes.filter(t => t.is_active).length
  const requiresApproval = allExpenseTypes.filter(t => t.requires_approval).length
  const taxDeductible = allExpenseTypes.filter(t => t.is_tax_deductible).length

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Expense Types</h1>
            <p className="text-gray-600">Manage expense categories and approval settings</p>
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
              Add Expense Type
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Types</p>
                <p className="text-2xl font-bold text-gray-900">{totalTypes}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Receipt className="h-5 w-5 text-blue-600" />
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
                <p className="text-sm text-gray-600">Requires Approval</p>
                <p className="text-2xl font-bold text-orange-600">{requiresApproval}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tax Deductible</p>
                <p className="text-2xl font-bold text-purple-600">{taxDeductible}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-purple-600" />
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
              placeholder="Search expense types..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {CATEGORY_OPTIONS.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
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
            <span className="ml-2 text-gray-600">Loading expense types...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Failed to load expense types. Please try again.</p>
            <Button variant="outline" className="mt-2" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {/* Expense Types Table */}
        {!isLoading && !error && (
          <div className="mofad-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="py-3 px-4 text-left">
                      <Checkbox
                        checked={selection.isAllSelected}
                        indeterminate={selection.isPartiallySelected}
                        onChange={selection.toggleSelectAll}
                      />
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Expense Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Account Code</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Requires Approval</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Approval Limit</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Tax Deductible</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {expenseTypes.map((type) => (
                    <tr key={type.id} className={`hover:bg-gray-50 ${selection.isSelected(type.id) ? 'bg-primary-50' : ''}`}>
                      <td className="py-3 px-4">
                        <Checkbox
                          checked={selection.isSelected(type.id)}
                          onChange={() => selection.toggleSelect(type.id)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Receipt className="h-5 w-5 text-primary-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{type.name}</div>
                            {type.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">{type.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getCategoryBadge(type.category)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-900 font-mono text-sm">
                          {type.account_code || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {type.requires_approval ? (
                          <span className="text-orange-600 font-medium">Yes</span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-gray-900">
                          {type.approval_limit ? formatCurrency(type.approval_limit) : '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {type.is_tax_deductible ? (
                          <span className="text-green-600 font-medium">Yes</span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getStatusBadge(type.is_active)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
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
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && expenseTypes.length === 0 && (
          <div className="text-center py-12">
            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No expense types found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'No types match your search criteria.'
                : 'Get started by adding your first expense type.'}
            </p>
            <Button className="mofad-btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense Type
            </Button>
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

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Add Expense Type</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
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
                    placeholder="e.g., Office Supplies"
                  />
                  {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Description of this expense type"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors.category ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    {CATEGORY_OPTIONS.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  {formErrors.category && <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Code</label>
                  <input
                    type="text"
                    name="account_code"
                    value={formData.account_code}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., EXP-001"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="requires_approval"
                    id="requires_approval"
                    checked={formData.requires_approval}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="requires_approval" className="text-sm text-gray-700">
                    Requires Approval
                  </label>
                </div>
                {formData.requires_approval && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Approval Limit <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="approval_limit"
                      value={formData.approval_limit}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors.approval_limit ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Amount requiring approval"
                    />
                    {formErrors.approval_limit && <p className="text-red-500 text-sm mt-1">{formErrors.approval_limit}</p>}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_tax_deductible"
                    id="is_tax_deductible"
                    checked={formData.is_tax_deductible}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="is_tax_deductible" className="text-sm text-gray-700">
                    Tax Deductible
                  </label>
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
            <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Edit Expense Type</h3>
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
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors.category ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    {CATEGORY_OPTIONS.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Code</label>
                  <input
                    type="text"
                    name="account_code"
                    value={formData.account_code}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="requires_approval"
                    id="edit_requires_approval"
                    checked={formData.requires_approval}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="edit_requires_approval" className="text-sm text-gray-700">
                    Requires Approval
                  </label>
                </div>
                {formData.requires_approval && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Approval Limit <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="approval_limit"
                      value={formData.approval_limit}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors.approval_limit ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {formErrors.approval_limit && <p className="text-red-500 text-sm mt-1">{formErrors.approval_limit}</p>}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_tax_deductible"
                    id="edit_is_tax_deductible"
                    checked={formData.is_tax_deductible}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="edit_is_tax_deductible" className="text-sm text-gray-700">
                    Tax Deductible
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
                <h3 className="text-lg font-bold">Expense Type Details</h3>
                <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Receipt className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedType.name}</h2>
                    {getCategoryBadge(selectedType.category)}
                  </div>
                  {getStatusBadge(selectedType.is_active)}
                </div>

                {selectedType.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Description</label>
                    <p className="text-sm text-gray-900">{selectedType.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Account Code</label>
                    <p className="text-sm text-gray-900 font-mono">{selectedType.account_code || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Requires Approval</label>
                    <p className="text-sm text-gray-900">{selectedType.requires_approval ? 'Yes' : 'No'}</p>
                  </div>
                  {selectedType.requires_approval && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Approval Limit</label>
                      <p className="text-sm text-gray-900">
                        {selectedType.approval_limit ? formatCurrency(selectedType.approval_limit) : '-'}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Tax Deductible</label>
                    <p className="text-sm text-gray-900">{selectedType.is_tax_deductible ? 'Yes' : 'No'}</p>
                  </div>
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

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-red-600">Delete Expense Type</h3>
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
          title="Delete Expense Types"
          message={`Are you sure you want to delete ${selection.selectedCount} expense type(s)? This action cannot be undone.`}
          confirmText="Delete"
          isLoading={isBulkDeleting}
          variant="danger"
        />
      </div>
    </AppLayout>
  )
}

export default ExpenseTypesPage
