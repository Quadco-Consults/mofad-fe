'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import api from '@/lib/api-client'
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Download,
  Eye,
  X,
  Filter,
  Loader2,
  AlertCircle
} from 'lucide-react'

interface Customer {
  id: number
  name: string
  email: string | null
  phone_number: string | null
  address: string | null
  customer_type: {
    id: number
    name: string
  } | null
  customer_type_name?: string
  tax_number: string | null
  contact_person: string | null
  credit_limit: number | null
  payment_terms: number | null
  notes: string | null
  status: 'active' | 'inactive' | 'suspended'
  is_verified: boolean
  current_balance: number
  total_orders: number
  total_spent: number
  created_at: string
  updated_at: string
}

interface CustomerType {
  id: number
  name: string
  description: string | null
  is_active: boolean
}

export default function CustomersPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    customer_type: '',
    email: '',
    phone_number: '',
    address: '',
    contact_person: '',
    credit_limit: '',
    payment_terms: '',
    notes: ''
  })

  const itemsPerPage = 30

  // Fetch customers with search and pagination
  const { data: customersResponse, isLoading: customersLoading, error: customersError } = useQuery({
    queryKey: ['customers', { search: searchTerm, page: currentPage, page_size: itemsPerPage }],
    queryFn: () => api.getCustomers({
      search: searchTerm || undefined,
      page: currentPage,
      page_size: itemsPerPage
    }),
    keepPreviousData: true
  })

  // Fetch customer types for the form
  const { data: customerTypes } = useQuery({
    queryKey: ['customer-types'],
    queryFn: () => api.getCustomerTypes({ is_active: true })
  })

  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: (data: any) => api.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      setShowAddModal(false)
      setShowSuccessModal(true)
      // Reset form
      setFormData({
        name: '',
        customer_type: '',
        email: '',
        phone_number: '',
        address: '',
        contact_person: '',
        credit_limit: '',
        payment_terms: '',
        notes: ''
      })
    },
    onError: (error) => {
      console.error('Error creating customer:', error)
      // TODO: Show error message to user
    }
  })

  const customers = customersResponse?.results || customersResponse?.data?.results || []
  const totalCount = customersResponse?.paginator?.count || customersResponse?.data?.paginator?.count || customersResponse?.count || 0
  const totalPages = customersResponse?.paginator?.total_pages || customersResponse?.data?.paginator?.total_pages || Math.ceil(totalCount / itemsPerPage)

  const filteredCustomers = customers
  const paginatedCustomers = customers

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium"
    return status === 'active'
      ? `${baseClasses} bg-green-100 text-green-800 border border-green-200`
      : `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`
  }

  const handleAddCustomer = () => {
    setShowAddModal(true)
  }

  const handleSubmitCustomer = () => {
    const submitData = {
      name: formData.name,
      email: formData.email || undefined,
      phone_number: formData.phone_number || undefined,
      address: formData.address || undefined,
      customer_type: parseInt(formData.customer_type),
      contact_person: formData.contact_person || undefined,
      credit_limit: formData.credit_limit ? parseFloat(formData.credit_limit) : undefined,
      payment_terms: formData.payment_terms ? parseInt(formData.payment_terms) : undefined,
      notes: formData.notes || undefined,
    }

    createCustomerMutation.mutate(submitData)
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Customers</h1>
            <p className="text-gray-600">Manage customer information and relationships</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleAddCustomer}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Customer
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                <option>Last 30 days</option>
                <option>Last 60 days</option>
                <option>Last 90 days</option>
              </select>
              <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter by
              </button>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {customersLoading && (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500 mb-4" />
                <p className="text-gray-600">Loading customers...</p>
              </div>
            </div>
          )}

          {customersError && (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 mx-auto text-red-500 mb-4" />
                <p className="text-gray-600">Error loading customers. Please try again.</p>
              </div>
            </div>
          )}

          {!customersLoading && !customersError && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-orange-500 to-amber-500">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Customer Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Customer Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Contact</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-white">Balance</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white">Orders</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white">Verified</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white">Status</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        {searchTerm ? 'No customers found matching your search.' : 'No customers available.'}
                      </td>
                    </tr>
                  ) : (
                    paginatedCustomers.map((customer, index) => (
                      <tr key={customer.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{customer.name}</div>
                          {customer.contact_person && (
                            <div className="text-sm text-gray-500">Contact: {customer.contact_person}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {customer.customer_type?.name || customer.customer_type_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          <div className="text-sm">
                            {customer.email && <div>{customer.email}</div>}
                            {customer.phone_number && <div>{customer.phone_number}</div>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900">
                          {formatCurrency(customer.current_balance || 0)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button className="text-orange-600 hover:text-orange-800 font-medium text-sm">
                            View ({customer.total_orders || 0})
                          </button>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            customer.is_verified
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          }`}>
                            {customer.is_verified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={getStatusBadge(customer.status)}>
                            {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => router.push(`/customers/${customer.id}`)}
                              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View Customer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          {/* Pagination */}
          {!customersLoading && !customersError && totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} items
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 text-sm font-medium text-gray-700">
                  {currentPage}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-700 ml-2">
                  of {totalPages}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-8 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">add customer</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Customer ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer ID *</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Auto-generated"
                  disabled
                />
              </div>

              {/* Customer Name and Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer Type *</label>
                  <select
                    value={formData.customer_type}
                    onChange={(e) => setFormData({ ...formData, customer_type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  >
                    <option value="">Select customer type</option>
                    {customerTypes?.results?.map((type: CustomerType) => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Email and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="customer@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="+234 xxx xxx xxxx"
                  />
                </div>
              </div>

              {/* Contact Person and Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter contact person name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter address"
                  />
                </div>
              </div>

              {/* Credit Limit and Payment Terms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Credit Limit (₦)</label>
                  <input
                    type="number"
                    value={formData.credit_limit}
                    onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms (Days)</label>
                  <input
                    type="number"
                    value={formData.payment_terms}
                    onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="30"
                    min="0"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Additional notes about the customer"
                  rows={3}
                />
              </div>
            </div>

            <div className="p-8 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleSubmitCustomer}
                disabled={createCustomerMutation.isPending}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {createCustomerMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {createCustomerMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Success</h2>
            <p className="text-gray-600 mb-6">
              Customer has been successfully added to the system.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  )
}