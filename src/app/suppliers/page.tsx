'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Pagination } from '@/components/ui/Pagination'
import { BulkActionBar } from '@/components/ui/BulkActionBar'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useSelection } from '@/hooks/useSelection'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Building,
  Phone,
  Mail,
  MapPin,
  Package,
  Star,
  DollarSign,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  X,
  Save,
  Loader2,
} from 'lucide-react'

const getStatusBadge = (status: string) => {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    suspended: 'bg-yellow-100 text-yellow-800',
    blacklisted: 'bg-red-100 text-red-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

const getSupplierTypeBadge = (type: string) => {
  const colors: Record<string, string> = {
    Primary: 'bg-blue-100 text-blue-800',
    Premium: 'bg-purple-100 text-purple-800',
    Standard: 'bg-green-100 text-green-800',
    Specialized: 'bg-orange-100 text-orange-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
      {type}
    </span>
  )
}

const getRatingStars = (rating: number) => {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Star
        key={i}
        className={`w-4 h-4 ${i <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
      />
    )
  }
  return <div className="flex">{stars}</div>
}

export default function SuppliersPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null)

  // Selection hook for bulk operations
  const selection = useSelection<any>()

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, typeFilter])

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    supplier_type: 'Standard',
    payment_terms: 'Net 30',
    credit_limit: 0,
    products_supplied: [] as string[],
    tax_id: '',
    bank_account: '',
    notes: ''
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch suppliers
  const { data: suppliersData, isLoading, error, refetch } = useQuery({
    queryKey: ['suppliers', searchTerm, statusFilter, typeFilter, currentPage, pageSize],
    queryFn: async () => {
      const params: Record<string, any> = { page: currentPage, size: pageSize }
      if (statusFilter !== 'all') params.status = statusFilter
      if (typeFilter !== 'all') params.supplier_type = typeFilter
      if (searchTerm) params.search = searchTerm
      return apiClient.get('/suppliers', params)
    },
  })

  // Handle both array and paginated responses
  const extractResults = (data: any) => {
    if (Array.isArray(data)) return data
    if (data?.results && Array.isArray(data.results)) return data.results
    return []
  }

  const allSuppliers = extractResults(suppliersData)

  // Pagination calculations
  const totalCount = suppliersData?.paginator?.count || suppliersData?.count || allSuppliers.length
  const totalPages = suppliersData?.paginator?.total_pages || Math.ceil(totalCount / pageSize) || 1

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiClient.post('/suppliers', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      addToast({ type: 'success', title: 'Success', message: 'Supplier created successfully' })
      setShowCreateModal(false)
      resetForm()
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to create supplier' })
      if (error.errors) setFormErrors(error.errors)
    }
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiClient.put(`/suppliers/${selectedSupplier.id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      addToast({ type: 'success', title: 'Success', message: 'Supplier updated successfully' })
      setShowEditModal(false)
      resetForm()
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to update supplier' })
      if (error.errors) setFormErrors(error.errors)
    }
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiClient.delete(`/suppliers/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      addToast({ type: 'success', title: 'Success', message: 'Supplier deleted successfully' })
      setShowDeleteModal(false)
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to delete supplier' })
    }
  })

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: (number | string)[]) => {
      return apiClient.post('/suppliers/bulk-delete/', { ids })
    },
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      setShowBulkDeleteModal(false)
      selection.clearSelection()

      if (response?.failed_count > 0) {
        addToast({
          type: 'warning',
          title: 'Partial Success',
          message: `Deleted ${response.deleted_count} suppliers. ${response.failed_count} failed.`
        })
      } else {
        addToast({
          type: 'success',
          title: 'Success',
          message: `Successfully deleted ${response?.deleted_count || selection.selectedCount} suppliers`
        })
      }
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to delete suppliers' })
    }
  })

  // Filter suppliers based on search and filters (client-side filtering for already fetched data)
  const filteredSuppliers = allSuppliers.filter((supplier: any) => {
    const matchesSearch = !searchTerm ||
                         supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter
    const matchesType = typeFilter === 'all' || supplier.supplier_type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  // Apply pagination for client-side filtered data
  const suppliers = filteredSuppliers

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!formData.name.trim()) errors.name = 'Supplier name is required'
    if (!formData.contact_person.trim()) errors.contact_person = 'Contact person is required'
    if (!formData.email.trim()) errors.email = 'Email is required'
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }
    if (!formData.phone.trim()) errors.phone = 'Phone number is required'
    if (formData.credit_limit < 0) errors.credit_limit = 'Credit limit cannot be negative'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Form handlers
  const resetForm = () => {
    setFormData({
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      supplier_type: 'Standard',
      payment_terms: 'Net 30',
      credit_limit: 0,
      products_supplied: [],
      tax_id: '',
      bank_account: '',
      notes: ''
    })
    setFormErrors({})
    setIsSubmitting(false)
  }

  const handleCreateClick = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const handleEditClick = (supplier: any) => {
    setFormData({
      name: supplier.name || '',
      contact_person: supplier.contact_person || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      supplier_type: supplier.supplier_type || 'Standard',
      payment_terms: supplier.payment_terms || 'Net 30',
      credit_limit: supplier.credit_limit || 0,
      products_supplied: supplier.products_supplied || [],
      tax_id: supplier.tax_id || '',
      bank_account: supplier.bank_account || '',
      notes: supplier.notes || ''
    })
    setSelectedSupplier(supplier)
    setFormErrors({})
    setShowEditModal(true)
  }

  const handleDeleteClick = (supplier: any) => {
    setSelectedSupplier(supplier)
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

  const handleView = (supplier: any) => {
    router.push(`/suppliers/${supplier.id}`)
  }


  // Get unique supplier types for filter
  const supplierTypes = [...new Set(filteredSuppliers.map((s: any) => s.supplier_type))]

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Suppliers</h1>
            <p className="text-muted-foreground">Manage petroleum suppliers and vendor relationships</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="mofad-btn-primary" onClick={handleCreateClick}>
              <Plus className="w-4 h-4 mr-2" />
              Add Supplier
            </Button>
          </div>
        </div>


        {/* Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search suppliers..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>

            <select
              className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              {supplierTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Suppliers Table */}
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
            ) : filteredSuppliers.length === 0 ? (
              <div className="p-12 text-center">
                <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first supplier'}
                </p>
                <Button className="mofad-btn-primary" onClick={handleCreateClick}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Supplier
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="w-12 py-3 px-4">
                        <Checkbox
                          checked={selection.isAllSelected(suppliers)}
                          indeterminate={selection.isPartiallySelected(suppliers)}
                          onChange={() => selection.toggleAll(suppliers)}
                        />
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Supplier</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Products</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Payment Terms</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Credit Limit</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Balance</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">YTD Orders</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Rating</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {suppliers.map((supplier: any) => (
                      <tr key={supplier.id} className={`hover:bg-gray-50 ${selection.isSelected(supplier.id) ? 'bg-primary/5' : ''}`}>
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selection.isSelected(supplier.id)}
                            onChange={() => selection.toggle(supplier.id)}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <Building className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{supplier.name}</div>
                              <div className="text-sm text-gray-500">{supplier.contact_person}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getSupplierTypeBadge(supplier.supplier_type)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-600 truncate max-w-[150px]">{supplier.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-600">{supplier.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Package className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600">
                              {supplier.products_supplied?.slice(0, 2).join(', ')}
                              {supplier.products_supplied?.length > 2 && ` +${supplier.products_supplied.length - 2} more`}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">{supplier.payment_terms}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(supplier.credit_limit)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-semibold ${supplier.current_balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(supplier.current_balance)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(supplier.total_value_ytd)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {supplier.total_orders_ytd} orders
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getRatingStars(Math.round(supplier.rating))}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(supplier.status)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="View Supplier"
                              onClick={() => handleView(supplier)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Edit Supplier"
                              onClick={() => handleEditClick(supplier)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Delete Supplier"
                              onClick={() => handleDeleteClick(supplier)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalCount > 0 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalCount={totalCount}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    className="border-t"
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Modal */}
        {(showCreateModal || showEditModal) && createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {showCreateModal ? 'Add New Supplier' : 'Edit Supplier'}
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
                        Supplier Name *
                      </label>
                      <input
                        type="text"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                          formErrors.name ? 'border-red-300' : 'border-gray-300'
                        }`}
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter supplier name"
                      />
                      {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Person *
                      </label>
                      <input
                        type="text"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                          formErrors.contact_person ? 'border-red-300' : 'border-gray-300'
                        }`}
                        value={formData.contact_person}
                        onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                        placeholder="Enter contact person name"
                      />
                      {formErrors.contact_person && <p className="text-red-500 text-xs mt-1">{formErrors.contact_person}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                          formErrors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter email address"
                      />
                      {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
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
                        placeholder="Enter phone number"
                      />
                      {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter supplier address"
                    />
                  </div>
                </div>

                {/* Business Information */}
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-gray-900 border-b pb-2">Business Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Supplier Type
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        value={formData.supplier_type}
                        onChange={(e) => setFormData(prev => ({ ...prev, supplier_type: e.target.value }))}
                      >
                        <option value="Standard">Standard</option>
                        <option value="Primary">Primary</option>
                        <option value="Premium">Premium</option>
                        <option value="Specialized">Specialized</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Terms
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        value={formData.payment_terms}
                        onChange={(e) => setFormData(prev => ({ ...prev, payment_terms: e.target.value }))}
                      >
                        <option value="Net 30">Net 30</option>
                        <option value="Net 60">Net 60</option>
                        <option value="Net 90">Net 90</option>
                        <option value="Cash on Delivery">Cash on Delivery</option>
                        <option value="Advance Payment">Advance Payment</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Credit Limit (₦)
                      </label>
                      <input
                        type="number"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                          formErrors.credit_limit ? 'border-red-300' : 'border-gray-300'
                        }`}
                        value={formData.credit_limit}
                        onChange={(e) => setFormData(prev => ({ ...prev, credit_limit: parseFloat(e.target.value) || 0 }))}
                        placeholder="0"
                      />
                      {formErrors.credit_limit && <p className="text-red-500 text-xs mt-1">{formErrors.credit_limit}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tax ID
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        value={formData.tax_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, tax_id: e.target.value }))}
                        placeholder="Enter tax ID"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Account
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.bank_account}
                      onChange={(e) => setFormData(prev => ({ ...prev, bank_account: e.target.value }))}
                      placeholder="Enter bank account details"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes about the supplier..."
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
                        {showCreateModal ? 'Create Supplier' : 'Update Supplier'}
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
        {showDeleteModal && selectedSupplier && createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Delete Supplier</h3>
                    <p className="text-gray-500">This action cannot be undone.</p>
                  </div>
                </div>

                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete <span className="font-semibold">{selectedSupplier.name}</span>?
                  This will permanently remove the supplier and all associated data.
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
                    onClick={() => deleteMutation.mutate(selectedSupplier.id)}
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
                        Delete Supplier
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Bulk Delete Confirmation Modal */}
        <ConfirmDialog
          open={showBulkDeleteModal}
          onClose={() => setShowBulkDeleteModal(false)}
          onConfirm={() => bulkDeleteMutation.mutate(selection.selectedIds)}
          title="Delete Multiple Suppliers"
          message={`Are you sure you want to delete ${selection.selectedCount} supplier${selection.selectedCount > 1 ? 's' : ''}? This action cannot be undone.`}
          confirmText={`Delete ${selection.selectedCount} Supplier${selection.selectedCount > 1 ? 's' : ''}`}
          variant="danger"
          isLoading={bulkDeleteMutation.isPending}
        />

        {/* Bulk Action Bar */}
        <BulkActionBar
          selectedCount={selection.selectedCount}
          onClearSelection={selection.clearSelection}
          onBulkDelete={() => setShowBulkDeleteModal(true)}
          isDeleting={bulkDeleteMutation.isPending}
          entityName="supplier"
        />
      </div>
    </AppLayout>
  )
}