'use client'

import { useState } from 'react'
import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Plus, Edit, Trash2, Eye, DollarSign, Percent, Calendar, Users, MapPin, X, Save, Loader2, CheckCircle, Power, PowerOff, RefreshCw, Package } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AppLayout } from '@/components/layout/AppLayout'
import { Checkbox } from '@/components/ui/Checkbox'
import { Pagination } from '@/components/ui/Pagination'
import { BulkActionBar } from '@/components/ui/BulkActionBar'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useSelection } from '@/hooks/useSelection'
import apiClient from '@/lib/apiClient'
import { useToast } from '@/components/ui/Toast'
import { formatCurrency } from '@/lib/utils'

interface PriceScheme {
  id: number
  name: string | null
  description: string | null
  customer_type: number | null
  customer_type_name: string | null
  location: number | null
  location_name: string | null
  markup_percentage: number
  discount_percentage: number
  minimum_quantity: number
  effective_from: string | null
  effective_to: string | null
  is_active: boolean
  product: number | null
  product_name: string | null
  price: number | null
  created_at: string
  updated_at: string
}

interface CustomerType {
  id: number
  name: string
  is_active: boolean
}

interface Location {
  id: number
  name: string
  code: string
  is_active: boolean
}

interface Product {
  id: number
  name: string
  code: string
  cost_price?: number
}

interface ProductPricing {
  product: Product
  cost_price: number
  direct_price: number | null
  retail_price: number | null
}

interface PriceSchemeFormData {
  name: string
  description: string
  customer_type: number | ''
  location: number | ''
  markup_percentage: string
  discount_percentage: string
  minimum_quantity: string
  effective_from: string
  effective_to: string
  product: number | ''
  price: string
}

const initialFormData: PriceSchemeFormData = {
  name: '',
  description: '',
  customer_type: '',
  location: '',
  markup_percentage: '0',
  discount_percentage: '0',
  minimum_quantity: '0',
  effective_from: '',
  effective_to: '',
  product: '',
  price: '',
}

function PriceSchemesPage() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [customerTypeFilter, setCustomerTypeFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [selectedScheme, setSelectedScheme] = useState<PriceScheme | null>(null)
  const [formData, setFormData] = useState<PriceSchemeFormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Selection hook for bulk operations
  const selection = useSelection<PriceScheme>()

  // Fetch price schemes
  const { data: schemesData, isLoading, error, refetch } = useQuery({
    queryKey: ['price-schemes', searchTerm, statusFilter, customerTypeFilter, currentPage, pageSize],
    queryFn: async () => {
      const params: any = { page: currentPage, size: pageSize }
      if (searchTerm) params.search = searchTerm
      if (statusFilter !== 'all') params.is_active = statusFilter === 'active'
      if (customerTypeFilter !== 'all') params.customer_type = customerTypeFilter
      return apiClient.getPriceSchemes(params)
    },
  })

  // Fetch customer types for dropdown
  const { data: customerTypesData } = useQuery({
    queryKey: ['customer-types-dropdown'],
    queryFn: () => apiClient.getCustomerTypes({ is_active: true }),
  })

  // Fetch locations for dropdown
  const { data: locationsData } = useQuery({
    queryKey: ['locations-dropdown'],
    queryFn: () => apiClient.getLocations({ is_active: true }),
  })

  // Fetch products for dropdown
  const { data: productsData } = useQuery({
    queryKey: ['products-dropdown'],
    queryFn: () => apiClient.getProducts(),
  })

  // Get data from responses
  const schemes: PriceScheme[] = Array.isArray(schemesData)
    ? schemesData
    : schemesData?.results || schemesData?.data?.results || []

  // Extract pagination info
  const totalCount = schemesData?.paginator?.count || schemesData?.count || schemes.length
  const totalPages = schemesData?.paginator?.total_pages || Math.ceil(totalCount / pageSize) || 1

  const customerTypes: CustomerType[] = Array.isArray(customerTypesData)
    ? customerTypesData
    : customerTypesData?.results || customerTypesData?.data?.results || []

  const locations: Location[] = Array.isArray(locationsData)
    ? locationsData
    : locationsData?.results || locationsData?.data?.results || []

  const products: Product[] = Array.isArray(productsData)
    ? productsData
    : productsData?.results || productsData?.data?.results || []

  // Transform schemes data into product pricing format
  const productPricingData: ProductPricing[] = React.useMemo(() => {
    const productMap = new Map<number, ProductPricing>()

    schemes.forEach(scheme => {
      if (!scheme.product || !scheme.customer_type_name) return

      const productId = scheme.product
      const product = products.find(p => p.id === productId)
      if (!product) return

      if (!productMap.has(productId)) {
        productMap.set(productId, {
          product,
          cost_price: scheme.product_name ? 0 : 0, // Will be updated below
          direct_price: null,
          retail_price: null,
        })
      }

      const pricing = productMap.get(productId)!

      // Get cost price from the product object (assuming it has cost_price)
      // We'll need to fetch this from the backend product data
      if (scheme.customer_type_name === 'Direct Customer') {
        pricing.direct_price = scheme.price || 0
        // Calculate cost price from direct price (reverse 25% markup)
        pricing.cost_price = scheme.price ? (scheme.price / 1.25) : 0
      } else if (scheme.customer_type_name === 'Station') {
        pricing.retail_price = scheme.price || 0
      }
    })

    return Array.from(productMap.values())
  }, [schemes, products])

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.createPriceScheme(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-schemes'] })
      showToast('Price scheme created successfully', 'success')
      setShowAddModal(false)
      setFormData(initialFormData)
      setFormErrors({})
    },
    onError: (error: any) => {
      showToast(error.message || 'Failed to create price scheme', 'error')
      if (error.errors) {
        setFormErrors(error.errors)
      }
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiClient.updatePriceScheme(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-schemes'] })
      showToast('Price scheme updated successfully', 'success')
      setShowEditModal(false)
      setSelectedScheme(null)
      setFormData(initialFormData)
      setFormErrors({})
    },
    onError: (error: any) => {
      showToast(error.message || 'Failed to update price scheme', 'error')
      if (error.errors) {
        setFormErrors(error.errors)
      }
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.deletePriceScheme(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-schemes'] })
      showToast('Price scheme deleted successfully', 'success')
      setShowDeleteModal(false)
      setSelectedScheme(null)
    },
    onError: (error: any) => {
      showToast(error.message || 'Failed to delete price scheme', 'error')
    },
  })

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      apiClient.updatePriceScheme(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-schemes'] })
      showToast('Price scheme status updated successfully', 'success')
    },
    onError: (error: any) => {
      showToast(error.message || 'Failed to update price scheme status', 'error')
    },
  })

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: (number | string)[]) => apiClient.bulkDeletePriceSchemes(ids),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['price-schemes'] })
      setShowBulkDeleteModal(false)
      selection.clearSelection()

      if (response.failed_count > 0) {
        showToast(`Deleted ${response.deleted_count} price schemes. ${response.failed_count} failed.`, 'warning')
      } else {
        showToast(`Successfully deleted ${response.deleted_count} price schemes`, 'success')
      }
    },
    onError: (error: any) => {
      showToast(error.message || 'Failed to delete price schemes', 'error')
    },
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!formData.name.trim()) errors.name = 'Scheme name is required'
    const markupVal = parseFloat(formData.markup_percentage)
    const discountVal = parseFloat(formData.discount_percentage)
    if (isNaN(markupVal) || markupVal < 0 || markupVal > 100) {
      errors.markup_percentage = 'Markup must be between 0 and 100'
    }
    if (isNaN(discountVal) || discountVal < 0 || discountVal > 100) {
      errors.discount_percentage = 'Discount must be between 0 and 100'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const prepareFormDataForSubmit = () => {
    const data: any = {
      name: formData.name,
      markup_percentage: parseFloat(formData.markup_percentage) || 0,
      discount_percentage: parseFloat(formData.discount_percentage) || 0,
      minimum_quantity: parseFloat(formData.minimum_quantity) || 0,
    }
    if (formData.description) data.description = formData.description
    if (formData.customer_type) data.customer_type = formData.customer_type
    if (formData.location) data.location = formData.location
    if (formData.effective_from) data.effective_from = formData.effective_from
    if (formData.effective_to) data.effective_to = formData.effective_to
    if (formData.product) data.product = formData.product
    if (formData.price) data.price = parseFloat(formData.price)
    return data
  }

  const handleCreate = () => {
    if (!validateForm()) return
    createMutation.mutate(prepareFormDataForSubmit())
  }

  const handleUpdate = () => {
    if (!selectedScheme || !validateForm()) return
    updateMutation.mutate({ id: selectedScheme.id, data: prepareFormDataForSubmit() })
  }

  const handleDelete = () => {
    if (!selectedScheme) return
    deleteMutation.mutate(selectedScheme.id)
  }

  const handleView = (scheme: PriceScheme) => {
    setSelectedScheme(scheme)
    setShowViewModal(true)
  }

  const handleEdit = (scheme: PriceScheme) => {
    setSelectedScheme(scheme)
    setFormData({
      name: scheme.name || '',
      description: scheme.description || '',
      customer_type: scheme.customer_type || '',
      location: scheme.location || '',
      markup_percentage: scheme.markup_percentage?.toString() || '0',
      discount_percentage: scheme.discount_percentage?.toString() || '0',
      minimum_quantity: scheme.minimum_quantity?.toString() || '0',
      effective_from: scheme.effective_from ? scheme.effective_from.split('T')[0] : '',
      effective_to: scheme.effective_to ? scheme.effective_to.split('T')[0] : '',
      product: scheme.product || '',
      price: scheme.price?.toString() || '',
    })
    setFormErrors({})
    setShowEditModal(true)
  }

  const handleDeleteClick = (scheme: PriceScheme) => {
    setSelectedScheme(scheme)
    setShowDeleteModal(true)
  }

  const handleToggleActive = (scheme: PriceScheme) => {
    toggleActiveMutation.mutate({ id: scheme.id, is_active: !scheme.is_active })
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

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString()
  }

  const isSchemeValid = (scheme: PriceScheme) => {
    if (!scheme.is_active) return false
    const now = new Date()
    if (scheme.effective_from && new Date(scheme.effective_from) > now) return false
    if (scheme.effective_to && new Date(scheme.effective_to) < now) return false
    return true
  }

  // Product handlers
  const handleViewProduct = (product: Product) => {
    showToast(`Viewing details for ${product.name}`, 'info')
    // TODO: Implement product view modal or navigate to product detail page
  }

  const handleEditProduct = (product: Product) => {
    showToast(`Editing pricing for ${product.name}`, 'info')
    // TODO: Implement product pricing edit modal
  }

  // Calculate summary stats
  const totalProducts = productPricingData.length
  const productsWithDirectPrice = productPricingData.filter(p => p.direct_price !== null).length
  const productsWithRetailPrice = productPricingData.filter(p => p.retail_price !== null).length
  const avgMarkupPercentage = productsWithDirectPrice > 0
    ? productPricingData.filter(p => p.direct_price !== null).reduce((sum, p) => {
        const markup = p.cost_price > 0 ? ((p.direct_price! - p.cost_price) / p.cost_price * 100) : 0
        return sum + markup
      }, 0) / productsWithDirectPrice
    : 0


  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Price Schemes</h1>
            <p className="text-gray-600">Manage pricing rules by customer type and location</p>
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
              Add Price Scheme
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">With Direct Price</p>
                <p className="text-2xl font-bold text-green-600">{productsWithDirectPrice}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">With Retail Price</p>
                <p className="text-2xl font-bold text-primary-600">{productsWithRetailPrice}</p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Markup</p>
                <p className="text-2xl font-bold text-purple-600">{avgMarkupPercentage.toFixed(1)}%</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Percent className="h-5 w-5 text-purple-600" />
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
              placeholder="Search schemes..."
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
            value={customerTypeFilter}
            onChange={(e) => setCustomerTypeFilter(e.target.value)}
          >
            <option value="all">All Customer Types</option>
            {customerTypes.map(ct => (
              <option key={ct.id} value={ct.id}>{ct.name}</option>
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
            <span className="ml-2 text-gray-600">Loading price schemes...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Failed to load price schemes. Please try again.</p>
            <Button variant="outline" className="mt-2" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {/* Price Schemes Table */}
        {!isLoading && !error && (
          <div className="mofad-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="w-12 py-3 px-4">
                      <Checkbox
                        checked={selection.isAllSelected(productPricingData.map(p => ({ id: p.product.id })))}
                        indeterminate={selection.isPartiallySelected(productPricingData.map(p => ({ id: p.product.id })))}
                        onChange={() => selection.toggleAll(productPricingData.map(p => ({ id: p.product.id })))}
                      />
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Product Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Product Code</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Cost Price</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Direct Sales Price</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Retail Price</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {productPricingData.map((pricing) => (
                    <tr
                      key={pricing.product.id}
                      className={`hover:bg-gray-50 ${selection.isSelected(pricing.product.id) ? 'bg-primary-50' : ''}`}
                    >
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selection.isSelected(pricing.product.id)}
                          onChange={() => selection.toggle(pricing.product.id)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Package className="h-5 w-5 text-primary-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {pricing.product.name && pricing.product.name.trim()
                                ? pricing.product.name
                                : pricing.product.code || `Product ${pricing.product.id}`}
                            </div>
                            <div className="text-sm text-gray-500">Product ID: {pricing.product.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-900 font-mono">{pricing.product.code}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-medium text-gray-900">{formatCurrency(pricing.cost_price)}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-medium text-green-600">
                          {pricing.direct_price ? formatCurrency(pricing.direct_price) : '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-medium text-blue-600">
                          {pricing.retail_price ? formatCurrency(pricing.retail_price) : '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleViewProduct(pricing.product)} title="View Product">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEditProduct(pricing.product)} title="Edit Pricing">
                            <Edit className="h-4 w-4" />
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
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && productPricingData.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No price schemes found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || customerTypeFilter !== 'all'
                ? 'No schemes match your search criteria.'
                : 'Get started by adding your first price scheme.'}
            </p>
            <Button className="mofad-btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Price Scheme
            </Button>
          </div>
        )}

        {/* Add Price Scheme Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Add New Price Scheme</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheme Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="e.g., Wholesale Customer Discount"
                  />
                  {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Describe the pricing scheme"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
                  <select
                    name="customer_type"
                    value={formData.customer_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Customer Types</option>
                    {customerTypes.map(ct => (
                      <option key={ct.id} value={ct.id}>{ct.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Locations</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name} ({loc.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Markup Percentage</label>
                  <input
                    type="number"
                    name="markup_percentage"
                    value={formData.markup_percentage}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors.markup_percentage ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.markup_percentage && <p className="text-red-500 text-sm mt-1">{formErrors.markup_percentage}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage</label>
                  <input
                    type="number"
                    name="discount_percentage"
                    value={formData.discount_percentage}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors.discount_percentage ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.discount_percentage && <p className="text-red-500 text-sm mt-1">{formErrors.discount_percentage}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Quantity</label>
                  <input
                    type="number"
                    name="minimum_quantity"
                    value={formData.minimum_quantity}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product (Optional)</label>
                  <select
                    name="product"
                    value={formData.product}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Products</option>
                    {products.map(prod => (
                      <option key={prod.id} value={prod.id}>{prod.name} ({prod.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Effective From</label>
                  <input
                    type="date"
                    name="effective_from"
                    value={formData.effective_from}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Effective To</label>
                  <input
                    type="date"
                    name="effective_to"
                    value={formData.effective_to}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fixed Price (Optional)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Leave empty to use percentage"
                  />
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
                      Create Scheme
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Price Scheme Modal */}
        {showEditModal && selectedScheme && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Edit Price Scheme</h3>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheme Name <span className="text-red-500">*</span>
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
                <div className="md:col-span-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
                  <select
                    name="customer_type"
                    value={formData.customer_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Customer Types</option>
                    {customerTypes.map(ct => (
                      <option key={ct.id} value={ct.id}>{ct.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Locations</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name} ({loc.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Markup Percentage</label>
                  <input
                    type="number"
                    name="markup_percentage"
                    value={formData.markup_percentage}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors.markup_percentage ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.markup_percentage && <p className="text-red-500 text-sm mt-1">{formErrors.markup_percentage}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage</label>
                  <input
                    type="number"
                    name="discount_percentage"
                    value={formData.discount_percentage}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors.discount_percentage ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.discount_percentage && <p className="text-red-500 text-sm mt-1">{formErrors.discount_percentage}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Quantity</label>
                  <input
                    type="number"
                    name="minimum_quantity"
                    value={formData.minimum_quantity}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product (Optional)</label>
                  <select
                    name="product"
                    value={formData.product}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Products</option>
                    {products.map(prod => (
                      <option key={prod.id} value={prod.id}>{prod.name} ({prod.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Effective From</label>
                  <input
                    type="date"
                    name="effective_from"
                    value={formData.effective_from}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Effective To</label>
                  <input
                    type="date"
                    name="effective_to"
                    value={formData.effective_to}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fixed Price (Optional)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
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

        {/* View Price Scheme Modal */}
        {showViewModal && selectedScheme && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Price Scheme Details</h3>
                <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedScheme.name || 'Unnamed Scheme'}</h2>
                    {selectedScheme.description && (
                      <p className="text-sm text-gray-500">{selectedScheme.description}</p>
                    )}
                  </div>
                  {getStatusBadge(selectedScheme.is_active)}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Customer Type</label>
                    <p className="text-sm text-gray-900">{selectedScheme.customer_type_name || 'All Types'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Location</label>
                    <p className="text-sm text-gray-900">{selectedScheme.location_name || 'All Locations'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Markup</label>
                    <p className="text-sm text-green-600 font-medium">+{selectedScheme.markup_percentage?.toFixed(2) || 0}%</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Discount</label>
                    <p className="text-sm text-red-600 font-medium">-{selectedScheme.discount_percentage?.toFixed(2) || 0}%</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Minimum Quantity</label>
                    <p className="text-sm text-gray-900">{selectedScheme.minimum_quantity || 0}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Fixed Price</label>
                    <p className="text-sm text-gray-900">
                      {selectedScheme.price ? formatCurrency(selectedScheme.price) : '-'}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Validity Period</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Effective From</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedScheme.effective_from)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Effective To</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedScheme.effective_to)}</p>
                    </div>
                  </div>
                  {isSchemeValid(selectedScheme) && (
                    <div className="mt-3 p-2 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-700 font-medium">This scheme is currently active and valid</p>
                    </div>
                  )}
                </div>

                {selectedScheme.product_name && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Product Specific</h4>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{selectedScheme.product_name}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => setShowViewModal(false)}>Close</Button>
                <Button className="mofad-btn-primary" onClick={() => {
                  setShowViewModal(false)
                  handleEdit(selectedScheme)
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Scheme
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedScheme && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-red-600">Delete Price Scheme</h3>
                <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete <strong>{selectedScheme.name || 'this scheme'}</strong>? This action cannot be undone.
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
                      Delete Scheme
                    </>
                  )}
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
          title="Delete Multiple Price Schemes"
          message={`Are you sure you want to delete ${selection.selectedCount} price scheme${selection.selectedCount > 1 ? 's' : ''}? This action cannot be undone.`}
          confirmText={`Delete ${selection.selectedCount} Scheme${selection.selectedCount > 1 ? 's' : ''}`}
          variant="danger"
          isLoading={bulkDeleteMutation.isPending}
        />

        {/* Bulk Action Bar */}
        <BulkActionBar
          selectedCount={selection.selectedCount}
          onClearSelection={selection.clearSelection}
          onBulkDelete={() => setShowBulkDeleteModal(true)}
          isDeleting={bulkDeleteMutation.isPending}
          entityName="price scheme"
        />
      </div>
    </AppLayout>
  )
}

export default PriceSchemesPage
