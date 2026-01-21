'use client'

import { useState, useEffect } from 'react'
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
import { Customer, CustomerFormData, CustomerType, PaymentType, State } from '@/types/api'
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Users,
  Building,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  X,
  Save,
  AlertTriangle,
  Loader2,
  RefreshCw,
  CheckCircle,
  XCircle,
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

const initialFormData: CustomerFormData = {
  name: '',
  email: '',
  phone: '',
  alt_phone: '',
  customer_type: undefined,
  payment_type: undefined,
  old_reference_id: '',
  address: '',
  city: '',
  state: undefined,
  postal_code: '',
  business_name: '',
  credit_limit: 0,
  current_balance: 0,
  payment_terms: '',
  contact_person: '',
  contact_person_phone: '',
  contact_person_email: '',
  status: 'active',
  preferred_delivery_method: 'both',
  notes: ''
}

export default function CustomersPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState<CustomerFormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Selection hook for bulk operations
  const selection = useSelection<Customer>()

  // Fetch customers
  const { data: customersData, isLoading, error, refetch } = useQuery({
    queryKey: ['customers', searchTerm, statusFilter, typeFilter, currentPage, pageSize],
    queryFn: async () => {
      const params: Record<string, any> = { page: currentPage, size: pageSize }
      if (statusFilter !== 'all') params.status = statusFilter
      if (typeFilter !== 'all') params.customer_type = typeFilter
      if (searchTerm) params.search = searchTerm
      return apiClient.get('/customers/', params)
    },
  })

  // Fetch customer types for dropdown
  const { data: customerTypesData } = useQuery({
    queryKey: ['customer-types'],
    queryFn: () => apiClient.get('/customer-types/'),
  })

  // Fetch payment types for dropdown
  const { data: paymentTypesData } = useQuery({
    queryKey: ['payment-types'],
    queryFn: () => apiClient.get('/payment-types/'),
  })

  // Fetch states for dropdown
  const { data: statesData } = useQuery({
    queryKey: ['states'],
    queryFn: () => apiClient.get('/states/'),
  })

  // Handle both array and paginated responses
  const extractResults = (data: any) => {
    if (Array.isArray(data)) return data
    if (data?.results && Array.isArray(data.results)) return data.results
    return []
  }

  const customers = extractResults(customersData)
  const customerTypes = extractResults(customerTypesData)
  const paymentTypes = extractResults(paymentTypesData)
  const states = extractResults(statesData)

  // Extract pagination info
  const totalCount = customersData?.paginator?.count || customersData?.count || customers.length
  const totalPages = customersData?.paginator?.total_pages || Math.ceil(totalCount / pageSize) || 1

  // Create customer mutation
  const createMutation = useMutation({
    mutationFn: (data: CustomerFormData) => apiClient.post('/customers/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      setShowAddModal(false)
      resetForm()
      addToast({ type: 'success', title: 'Success', message: 'Customer created successfully' })
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to create customer'
      addToast({ type: 'error', title: 'Error', message })
      if (error.errors) {
        setFormErrors(error.errors)
      }
    },
  })

  // Update customer mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CustomerFormData> }) =>
      apiClient.put(`/customers/${id}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      setShowEditModal(false)
      resetForm()
      addToast({ type: 'success', title: 'Success', message: 'Customer updated successfully' })
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to update customer'
      addToast({ type: 'error', title: 'Error', message })
      if (error.errors) {
        setFormErrors(error.errors)
      }
    },
  })

  // Delete customer mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/customers/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      setShowDeleteModal(false)
      setSelectedCustomer(null)
      addToast({ type: 'success', title: 'Success', message: 'Customer deleted successfully' })
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to delete customer'
      addToast({ type: 'error', title: 'Error', message })
    },
  })

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: (number | string)[]) => apiClient.bulkDeleteCustomers(ids),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      setShowBulkDeleteModal(false)
      selection.clearSelection()

      if (response?.failed_count > 0) {
        addToast({
          type: 'warning',
          title: 'Partial Success',
          message: `Deleted ${response.deleted_count} customers. ${response.failed_count} failed.`
        })
      } else {
        addToast({
          type: 'success',
          title: 'Success',
          message: `Successfully deleted ${response?.deleted_count || selection.selectedCount} customers`
        })
      }
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to delete customers'
      addToast({ type: 'error', title: 'Error', message })
    },
  })

  // Helper functions
  const resetForm = () => {
    setFormData(initialFormData)
    setFormErrors({})
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // All fields are optional, but validate format if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAdd = () => {
    resetForm()
    setShowAddModal(true)
  }

  const handleView = (customer: Customer) => {
    router.push(`/customers/${customer.id}`)
  }

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer)
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      alt_phone: customer.alt_phone || '',
      customer_type: customer.customer_type,
      payment_type: customer.payment_type,
      old_reference_id: customer.old_reference_id || '',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state,
      postal_code: customer.postal_code || '',
      business_name: customer.business_name || '',
      credit_limit: customer.credit_limit,
      current_balance: customer.current_balance,
      payment_terms: customer.payment_terms || '',
      contact_person: customer.contact_person || '',
      contact_person_phone: customer.contact_person_phone || '',
      contact_person_email: customer.contact_person_email || '',
      status: customer.status,
      preferred_delivery_method: customer.preferred_delivery_method,
      notes: customer.notes || ''
    })
    setFormErrors({})
    setShowEditModal(true)
  }

  const handleDelete = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowDeleteModal(true)
  }

  const handleSaveNew = () => {
    if (!validateForm()) return
    createMutation.mutate(formData)
  }

  const handleSaveEdit = () => {
    if (!validateForm() || !selectedCustomer) return
    updateMutation.mutate({ id: selectedCustomer.id, data: formData })
  }

  const confirmDelete = () => {
    if (selectedCustomer) {
      deleteMutation.mutate(selectedCustomer.id)
    }
  }

  // Stats calculation
  const totalCustomers = customers.length
  const activeCustomers = customers.filter(c => c.status === 'active').length
  const totalOutstanding = customers.reduce((sum, c) => sum + (c.current_balance || 0), 0)

  // Input component with error handling
  const FormInput = ({
    label,
    name,
    type = 'text',
    required = false,
    placeholder = '',
    value,
    onChange,
    className = ''
  }: {
    label: string
    name: string
    type?: string
    required?: boolean
    placeholder?: string
    value: string | number
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
    className?: string
  }) => (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
          formErrors[name] ? 'border-red-500' : 'border-gray-300'
        }`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      {formErrors[name] && (
        <p className="text-red-500 text-xs mt-1">{formErrors[name]}</p>
      )}
    </div>
  )

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Customers</h1>
            <p className="text-muted-foreground">Manage customer information and relationships</p>
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
            <Button className="mofad-btn-primary" onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Customers</p>
                  <p className="text-2xl font-bold text-primary">{totalCustomers}</p>
                </div>
                <Users className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-green-600">{activeCustomers}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Outstanding</p>
                  <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalOutstanding)}</p>
                </div>
                <CreditCard className="w-8 h-8 text-orange-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Customer Types</p>
                  <p className="text-2xl font-bold text-secondary">{customerTypes?.length || 0}</p>
                </div>
                <Building className="w-8 h-8 text-secondary/60" />
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
                    placeholder="Search customers by name, email, phone..."
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
                  <option value="blacklisted">Blacklisted</option>
                </select>

                <select
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  {customerTypes?.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-medium text-red-800">Error loading customers</p>
                  <p className="text-sm text-red-600">{(error as any).message || 'An unexpected error occurred'}</p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customers Table */}
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
            ) : customers.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first customer'}
                </p>
                <Button className="mofad-btn-primary" onClick={handleAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Customer
                </Button>
              </div>
            ) : (
              <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="w-12 py-3 px-4">
                        <Checkbox
                          checked={selection.isAllSelected(customers)}
                          indeterminate={selection.isPartiallySelected(customers)}
                          onChange={() => selection.toggleAll(customers)}
                        />
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Location</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Payment Type</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Credit Limit</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Balance</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Total Spent</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Verified</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {customers.map((customer) => (
                      <tr
                        key={customer.id}
                        className={`hover:bg-gray-50 ${selection.isSelected(customer.id) ? 'bg-primary-50' : ''}`}
                      >
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selection.isSelected(customer.id)}
                            onChange={() => selection.toggle(customer.id)}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{customer.name || 'Unnamed Customer'}</div>
                              <div className="text-sm text-gray-500">{customer.customer_code}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-700">
                            {customer.customer_type_name || (customer.customer_type ? `ID: ${customer.customer_type}` : 'No type')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            {customer.email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-600 truncate max-w-[150px]">{customer.email}</span>
                              </div>
                            )}
                            {customer.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-600">{customer.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {(customer.city || customer.state_name) && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-600 truncate max-w-[120px]">
                                {[customer.city, customer.state_name].filter(Boolean).join(', ') || 'No location'}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {customer.payment_type_name && (
                            <div className="flex items-center gap-2 text-sm">
                              <CreditCard className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-600">{customer.payment_type_name}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(customer.credit_limit)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-semibold ${customer.current_balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(customer.current_balance)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(customer.total_spent)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center">
                            {customer.is_verified ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(customer.status)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="View Customer"
                              onClick={() => handleView(customer)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Edit Customer"
                              onClick={() => handleEdit(customer)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Delete Customer"
                              onClick={() => handleDelete(customer)}
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
              </>
            )}
          </CardContent>
        </Card>

        {/* Add Customer Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
                <h2 className="text-xl font-semibold">Add Customer</h2>
                <Button variant="ghost" onClick={() => setShowAddModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-6 space-y-6">
                {/* Customer Name - Full Width */}
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Customer name</label>
                  <input
                    type="text"
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-primary bg-transparent"
                    placeholder="Customer name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                {/* Customer Type, Payment Type, Old Reference ID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Customer Type</label>
                    <select
                      className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-primary bg-transparent appearance-none cursor-pointer"
                      value={formData.customer_type || ''}
                      onChange={(e) => setFormData({...formData, customer_type: e.target.value ? parseInt(e.target.value) : undefined})}
                    >
                      <option value="">Customer Type</option>
                      {customerTypes?.map((type) => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Payment type</label>
                    <select
                      className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-primary bg-transparent appearance-none cursor-pointer"
                      value={formData.payment_type || ''}
                      onChange={(e) => setFormData({...formData, payment_type: e.target.value ? parseInt(e.target.value) : undefined})}
                    >
                      <option value="">Payment type</option>
                      {paymentTypes?.map((type) => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Old Reference ID</label>
                    <input
                      type="text"
                      className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-primary bg-transparent"
                      placeholder="Old Reference ID"
                      value={formData.old_reference_id || ''}
                      onChange={(e) => setFormData({...formData, old_reference_id: e.target.value})}
                    />
                  </div>
                </div>

                {/* Email, Phone, Alternate Phone */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Email address</label>
                    <input
                      type="email"
                      className={`w-full px-0 py-2 border-0 border-b focus:outline-none focus:border-primary bg-transparent ${
                        formErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Email address"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Phone</label>
                    <input
                      type="tel"
                      className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-primary bg-transparent"
                      placeholder="Phone"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Alternate phone</label>
                    <input
                      type="tel"
                      className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-primary bg-transparent"
                      placeholder="Alternate phone"
                      value={formData.alt_phone || ''}
                      onChange={(e) => setFormData({...formData, alt_phone: e.target.value})}
                    />
                  </div>
                </div>

                {/* State, Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Select state</label>
                    <select
                      className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-primary bg-transparent appearance-none cursor-pointer"
                      value={formData.state || ''}
                      onChange={(e) => setFormData({...formData, state: e.target.value ? parseInt(e.target.value) : undefined})}
                    >
                      <option value="">Select state</option>
                      {states?.map((state) => (
                        <option key={state.id} value={state.id}>{state.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Address</label>
                    <input
                      type="text"
                      className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-primary bg-transparent"
                      placeholder="Address"
                      value={formData.address || ''}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                </div>

                {/* Current Balance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Current Balance</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-primary bg-transparent"
                      placeholder="Current Balance"
                      value={formData.current_balance || 0}
                      onChange={(e) => setFormData({...formData, current_balance: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 p-6 border-t sticky bottom-0 bg-white">
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white px-8"
                  onClick={handleSaveNew}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <>Submit <span className="ml-2">&#10148;</span></>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Customer Modal */}
        {showEditModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
                <h2 className="text-xl font-semibold">Edit Customer - {selectedCustomer.name || selectedCustomer.customer_code}</h2>
                <Button variant="ghost" onClick={() => setShowEditModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-6 space-y-6">
                {/* Customer Name - Full Width */}
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Customer name</label>
                  <input
                    type="text"
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-primary bg-transparent"
                    placeholder="Customer name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                {/* Customer Type, Payment Type, Old Reference ID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Customer Type</label>
                    <select
                      className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-primary bg-transparent appearance-none cursor-pointer"
                      value={formData.customer_type || ''}
                      onChange={(e) => setFormData({...formData, customer_type: e.target.value ? parseInt(e.target.value) : undefined})}
                    >
                      <option value="">Customer Type</option>
                      {customerTypes?.map((type) => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Payment type</label>
                    <select
                      className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-primary bg-transparent appearance-none cursor-pointer"
                      value={formData.payment_type || ''}
                      onChange={(e) => setFormData({...formData, payment_type: e.target.value ? parseInt(e.target.value) : undefined})}
                    >
                      <option value="">Payment type</option>
                      {paymentTypes?.map((type) => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Old Reference ID</label>
                    <input
                      type="text"
                      className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-primary bg-transparent"
                      placeholder="Old Reference ID"
                      value={formData.old_reference_id || ''}
                      onChange={(e) => setFormData({...formData, old_reference_id: e.target.value})}
                    />
                  </div>
                </div>

                {/* Email, Phone, Alternate Phone */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Email address</label>
                    <input
                      type="email"
                      className={`w-full px-0 py-2 border-0 border-b focus:outline-none focus:border-primary bg-transparent ${
                        formErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Email address"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Phone</label>
                    <input
                      type="tel"
                      className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-primary bg-transparent"
                      placeholder="Phone"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Alternate phone</label>
                    <input
                      type="tel"
                      className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-primary bg-transparent"
                      placeholder="Alternate phone"
                      value={formData.alt_phone || ''}
                      onChange={(e) => setFormData({...formData, alt_phone: e.target.value})}
                    />
                  </div>
                </div>

                {/* State, Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Select state</label>
                    <select
                      className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-primary bg-transparent appearance-none cursor-pointer"
                      value={formData.state || ''}
                      onChange={(e) => setFormData({...formData, state: e.target.value ? parseInt(e.target.value) : undefined})}
                    >
                      <option value="">Select state</option>
                      {states?.map((state) => (
                        <option key={state.id} value={state.id}>{state.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Address</label>
                    <input
                      type="text"
                      className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-primary bg-transparent"
                      placeholder="Address"
                      value={formData.address || ''}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                </div>

                {/* Current Balance, Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Current Balance</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-primary bg-transparent"
                      placeholder="Current Balance"
                      value={formData.current_balance || 0}
                      onChange={(e) => setFormData({...formData, current_balance: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Status</label>
                    <select
                      className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-primary bg-transparent appearance-none cursor-pointer"
                      value={formData.status || 'active'}
                      onChange={(e) => setFormData({...formData, status: e.target.value as CustomerFormData['status']})}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                      <option value="blacklisted">Blacklisted</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 p-6 border-t sticky bottom-0 bg-white">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white px-8"
                  onClick={handleSaveEdit}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Update Customer
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* View Customer Modal */}
        {showViewModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Customer Details</h2>
                <Button variant="ghost" onClick={() => setShowViewModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedCustomer.name || 'Unnamed Customer'}</h3>
                    <p className="text-muted-foreground">{selectedCustomer.customer_code}</p>
                    {getStatusBadge(selectedCustomer.status)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Customer Type</label>
                      <p className="text-gray-900">{selectedCustomer.customer_type_name || (selectedCustomer.customer_type ? `ID: ${selectedCustomer.customer_type}` : '-')}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Payment Type</label>
                      <p className="text-gray-900">{selectedCustomer.payment_type_name || (selectedCustomer.payment_type ? `ID: ${selectedCustomer.payment_type}` : '-')}</p>
                    </div>
                    {selectedCustomer.old_reference_id && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Old Reference ID</label>
                        <p className="text-gray-900">{selectedCustomer.old_reference_id}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{selectedCustomer.email || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-gray-900">{selectedCustomer.phone || '-'}</p>
                    </div>
                    {selectedCustomer.alt_phone && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Alternate Phone</label>
                        <p className="text-gray-900">{selectedCustomer.alt_phone}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-500">Address</label>
                      <p className="text-gray-900">{selectedCustomer.address || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">State</label>
                      <p className="text-gray-900">{selectedCustomer.state_name || (selectedCustomer.state ? `ID: ${selectedCustomer.state}` : '-')}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Credit Limit</label>
                      <p className="text-gray-900 font-semibold">{formatCurrency(selectedCustomer.credit_limit)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Current Balance</label>
                      <p className={`font-semibold ${selectedCustomer.current_balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(selectedCustomer.current_balance)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Total Spent</label>
                      <p className="text-gray-900 font-semibold">{formatCurrency(selectedCustomer.total_spent)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Verified</label>
                      <p className="text-gray-900">{selectedCustomer.is_verified ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Delivery Preference</label>
                      <p className="text-gray-900 capitalize">{selectedCustomer.preferred_delivery_method}</p>
                    </div>
                  </div>
                </div>

                {selectedCustomer.contact_person && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Contact Person</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Name</label>
                        <p className="text-gray-900">{selectedCustomer.contact_person}</p>
                      </div>
                      {selectedCustomer.contact_person_phone && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Phone</label>
                          <p className="text-gray-900">{selectedCustomer.contact_person_phone}</p>
                        </div>
                      )}
                      {selectedCustomer.contact_person_email && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Email</label>
                          <p className="text-gray-900">{selectedCustomer.contact_person_email}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="text-gray-500">Created</label>
                      <p className="text-gray-900">{formatDateTime(selectedCustomer.created_at)}</p>
                    </div>
                    <div>
                      <label className="text-gray-500">Last Updated</label>
                      <p className="text-gray-900">{formatDateTime(selectedCustomer.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 p-6 border-t">
                <Button variant="outline" onClick={() => setShowViewModal(false)}>
                  Close
                </Button>
                <Button className="mofad-btn-primary" onClick={() => {
                  setShowViewModal(false)
                  handleEdit(selectedCustomer)
                }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Customer
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedCustomer && (
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
                    <h3 className="font-semibold text-gray-900">Delete Customer</h3>
                    <p className="text-sm text-gray-600">This action cannot be undone</p>
                  </div>
                </div>
                <p className="text-gray-700">
                  Are you sure you want to delete <strong>{selectedCustomer.name}</strong>?
                  All associated transaction history and data will be permanently removed.
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
                  Delete Customer
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Delete Confirmation Modal */}
        <ConfirmDialog
          open={showBulkDeleteModal}
          onClose={() => setShowBulkDeleteModal(false)}
          onConfirm={() => bulkDeleteMutation.mutate(selection.selectedIds)}
          title="Delete Multiple Customers"
          message={`Are you sure you want to delete ${selection.selectedCount} customer${selection.selectedCount > 1 ? 's' : ''}? This action cannot be undone.`}
          confirmText={`Delete ${selection.selectedCount} Customer${selection.selectedCount > 1 ? 's' : ''}`}
          variant="danger"
          isLoading={bulkDeleteMutation.isPending}
        />

        {/* Bulk Action Bar */}
        <BulkActionBar
          selectedCount={selection.selectedCount}
          onClearSelection={selection.clearSelection}
          onBulkDelete={() => setShowBulkDeleteModal(true)}
          isDeleting={bulkDeleteMutation.isPending}
          entityName="customer"
        />
      </div>
    </AppLayout>
  )
}
