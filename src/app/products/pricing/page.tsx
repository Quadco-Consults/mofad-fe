'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import mockApi from '@/lib/mockApi'
import { formatCurrency } from '@/lib/utils'
import {
  Search,
  Download,
  Package,
  DollarSign,
  TrendingUp,
  Fuel,
  Droplets,
  Settings,
  RefreshCw,
  Edit2,
  Check,
  X,
  Plus,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react'

interface Product {
  id: number
  name: string
  code: string
  category: string
  cost_price: number
  direct_sales_price: number
  retail_selling_price: number
  unit_of_measure: string
  brand?: string
  is_active: boolean
}

const getCategoryIcon = (category: string) => {
  switch (category?.toLowerCase()) {
    case 'fuel':
      return <Fuel className="w-4 h-4 text-red-500" />
    case 'lubricant':
    case 'engine_oil':
      return <Droplets className="w-4 h-4 text-blue-500" />
    case 'additive':
      return <Settings className="w-4 h-4 text-green-500" />
    case 'service':
      return <TrendingUp className="w-4 h-4 text-purple-500" />
    default:
      return <Package className="w-4 h-4 text-gray-500" />
  }
}

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    'fuel': 'Fuel',
    'lubricant': 'Lubricants',
    'additive': 'Additives',
    'service': 'Services',
    'equipment': 'Equipment',
    'other': 'Other',
  }
  return labels[category] || category
}

const calculateMargin = (sellingPrice: number, costPrice: number) => {
  if (costPrice === 0) return 0
  return ((sellingPrice - costPrice) / costPrice) * 100
}

export default function PricingPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [editingFields, setEditingFields] = useState<Record<string, string>>({}) // Format: "productId-field" -> value
  const [editMode, setEditMode] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    code: '',
    category: 'fuel',
    cost_price: 0,
    direct_sales_price: 0,
    retail_selling_price: 0,
    unit_of_measure: '',
    brand: '',
    is_active: true
  })

  const queryClient = useQueryClient()

  const { data: productsData, isLoading, refetch } = useQuery({
    queryKey: ['products-pricing'],
    queryFn: () => mockApi.get('/products/'),
  })

  const products = Array.isArray(productsData) ? productsData : []

  // CRUD Mutations
  const createProductMutation = useMutation({
    mutationFn: (data: Partial<Product>) => mockApi.post('/products', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-pricing'] })
      setShowCreateModal(false)
      resetForm()
    }
  })

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<Product> }) =>
      mockApi.patch(`/products/${id}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-pricing'] })
      setShowEditModal(false)
      resetForm()
    }
  })

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => mockApi.delete(`/products/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-pricing'] })
      setShowDeleteModal(false)
      setSelectedProduct(null)
    }
  })

  // Mutation for updating multiple product prices
  const updateProductsMutation = useMutation({
    mutationFn: async (updates: { id: number, field: string, value: number }[]) => {
      const promises = updates.map(update =>
        mockApi.patch(`/products/${update.id}/`, { [update.field]: update.value })
      )
      return Promise.all(promises)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-pricing'] })
      setEditingFields({})
      setEditMode(false)
    }
  })

  // Helper functions for editing
  const toggleEditMode = () => {
    if (editMode) {
      // Cancel all edits
      setEditingFields({})
    }
    setEditMode(!editMode)
  }

  const startEditingField = (productId: number, field: 'cost_price' | 'direct_sales_price' | 'retail_selling_price', currentValue: number) => {
    const key = `${productId}-${field}`
    setEditingFields(prev => ({
      ...prev,
      [key]: currentValue.toString()
    }))
  }

  const updateEditingField = (productId: number, field: string, value: string) => {
    const key = `${productId}-${field}`
    setEditingFields(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const removeEditingField = (productId: number, field: string) => {
    const key = `${productId}-${field}`
    setEditingFields(prev => {
      const newFields = { ...prev }
      delete newFields[key]
      return newFields
    })
  }

  const saveAllEdits = async () => {
    const updates = Object.entries(editingFields).map(([key, value]) => {
      const [productId, field] = key.split('-')
      const numValue = parseFloat(value)
      return {
        id: parseInt(productId),
        field,
        value: numValue
      }
    }).filter(update => !isNaN(update.value) && update.value >= 0)

    if (updates.length > 0) {
      await updateProductsMutation.mutateAsync(updates)
    }
  }

  const cancelAllEdits = () => {
    setEditingFields({})
    setEditMode(false)
  }

  const isFieldEditing = (productId: number, field: string) => {
    const key = `${productId}-${field}`
    return key in editingFields
  }

  const getEditValue = (productId: number, field: string) => {
    const key = `${productId}-${field}`
    return editingFields[key] || ''
  }

  // CRUD Helper functions
  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      category: 'fuel',
      cost_price: 0,
      direct_sales_price: 0,
      retail_selling_price: 0,
      unit_of_measure: '',
      brand: '',
      is_active: true
    })
    setSelectedProduct(null)
  }

  const openCreateModal = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const openEditModal = (product: Product) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      code: product.code,
      category: product.category,
      cost_price: product.cost_price,
      direct_sales_price: product.direct_sales_price,
      retail_selling_price: product.retail_selling_price,
      unit_of_measure: product.unit_of_measure,
      brand: product.brand,
      is_active: product.is_active
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product)
    setShowDeleteModal(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedProduct) {
      updateProductMutation.mutate({ id: selectedProduct.id, data: formData })
    } else {
      createProductMutation.mutate(formData)
    }
  }

  const handleDelete = () => {
    if (selectedProduct) {
      deleteProductMutation.mutate(selectedProduct.id)
    }
  }

  // Price Display Component (for editing mode)
  const PriceDisplay = ({
    productId,
    field,
    value,
    color
  }: {
    productId: number,
    field: 'cost_price' | 'direct_sales_price' | 'retail_selling_price',
    value: number,
    color: string
  }) => {
    const editing = isFieldEditing(productId, field)
    const editValue = getEditValue(productId, field)

    if (editing) {
      return (
        <div className="flex items-center gap-1">
          <input
            type="number"
            step="0.01"
            min="0"
            value={editValue}
            onChange={(e) => updateEditingField(productId, field, e.target.value)}
            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={value.toString()}
          />
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
            onClick={() => removeEditingField(productId, field)}
            title="Remove from edit"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2">
        <span className={`font-semibold ${color}`}>
          {formatCurrency(value)}
        </span>
        {editMode && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600"
            onClick={() => startEditingField(productId, field, value)}
            title="Edit this price"
          >
            <Edit2 className="w-3 h-3" />
          </Button>
        )}
      </div>
    )
  }

  // Filter products
  const filteredProducts = products.filter((product: Product) => {
    if (!product) return false

    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  // Calculate statistics
  const totalProducts = filteredProducts.length
  const avgCostPrice = totalProducts > 0
    ? filteredProducts.reduce((sum, p) => sum + p.cost_price, 0) / totalProducts
    : 0
  const avgDirectPrice = totalProducts > 0
    ? filteredProducts.reduce((sum, p) => sum + p.direct_sales_price, 0) / totalProducts
    : 0
  const avgRetailPrice = totalProducts > 0
    ? filteredProducts.reduce((sum, p) => sum + (p.retail_selling_price || 0), 0) / totalProducts
    : 0
  const avgMargin = totalProducts > 0
    ? filteredProducts.reduce((sum, p) => sum + calculateMargin(p.retail_selling_price || p.direct_sales_price, p.cost_price), 0) / totalProducts
    : 0

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Product Pricing</h1>
            <p className="text-muted-foreground">View all product prices: Cost, Direct Sales, and Retail pricing</p>
          </div>
          <div className="flex gap-2">
            {editMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={saveAllEdits}
                  disabled={Object.keys(editingFields).length === 0 || updateProductsMutation.isPending}
                  className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Save All ({Object.keys(editingFields).length})
                </Button>
                <Button
                  variant="outline"
                  onClick={cancelAllEdits}
                  disabled={updateProductsMutation.isPending}
                  className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={toggleEditMode}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Prices
              </Button>
            )}
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="mofad-btn-primary" onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold text-primary">{totalProducts}</p>
                </div>
                <Package className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Cost Price</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(avgCostPrice)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-red-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Direct Price</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(avgDirectPrice)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Retail Price</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(avgRetailPrice)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600/60" />
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
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <select
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="fuel">Fuel</option>
                  <option value="lubricant">Lubricants</option>
                  <option value="additive">Additives</option>
                  <option value="service">Services</option>
                  <option value="equipment">Equipment</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Pricing Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 py-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4 mt-2"></div>
                      </div>
                      <div className="w-20 h-4 bg-gray-200 rounded"></div>
                      <div className="w-24 h-4 bg-gray-200 rounded"></div>
                      <div className="w-16 h-4 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || categoryFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'No products available'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Unit</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Cost Price</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Direct Sales Price</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Retail Price</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Direct Margin</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Retail Margin</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredProducts.map((product: Product) => {
                      const directMargin = calculateMargin(product.direct_sales_price, product.cost_price)
                      const retailMargin = calculateMargin(product.retail_selling_price || 0, product.cost_price)

                      return (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                {getCategoryIcon(product.category)}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{product.name}</div>
                                <div className="text-sm text-gray-500">{product.code}</div>
                                {product.brand && (
                                  <div className="text-xs text-gray-400">{product.brand}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-700">{getCategoryLabel(product.category)}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">{product.unit_of_measure}</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <PriceDisplay
                              productId={product.id}
                              field="cost_price"
                              value={product.cost_price}
                              color="text-red-600"
                            />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <PriceDisplay
                              productId={product.id}
                              field="direct_sales_price"
                              value={product.direct_sales_price}
                              color="text-blue-600"
                            />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <PriceDisplay
                              productId={product.id}
                              field="retail_selling_price"
                              value={product.retail_selling_price || 0}
                              color="text-green-600"
                            />
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`font-semibold ${directMargin >= 20 ? 'text-green-600' : directMargin >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {directMargin.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`font-semibold ${retailMargin >= 30 ? 'text-green-600' : retailMargin >= 15 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {retailMargin.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              product.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {product.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                title="View Product"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                title="Edit Product"
                                onClick={() => openEditModal(product)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                title="Delete Product"
                                onClick={() => openDeleteModal(product)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Modal */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {selectedProduct ? 'Edit Product' : 'Create New Product'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter product name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Product Code *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="Enter product code"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Category *</label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="fuel">Fuel</option>
                      <option value="lubricant">Lubricants</option>
                      <option value="additive">Additives</option>
                      <option value="service">Services</option>
                      <option value="equipment">Equipment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Unit of Measure *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.unit_of_measure}
                      onChange={(e) => setFormData({ ...formData, unit_of_measure: e.target.value })}
                      placeholder="e.g., Litre, Gallon, Piece"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Brand</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Enter brand name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Cost Price (₦) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.cost_price}
                      onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-gray-500 mt-1">Price from supplier</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Direct Sales Price (₦) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.direct_sales_price}
                      onChange={(e) => setFormData({ ...formData, direct_sales_price: parseFloat(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-gray-500 mt-1">Price to customers/lube bays</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Retail Price (₦)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.retail_selling_price}
                      onChange={(e) => setFormData({ ...formData, retail_selling_price: parseFloat(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-gray-500 mt-1">Open market price</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.is_active ? 'active' : 'inactive'}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false)
                      setShowEditModal(false)
                      resetForm()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="mofad-btn-primary"
                    disabled={createProductMutation.isPending || updateProductMutation.isPending}
                  >
                    {createProductMutation.isPending || updateProductMutation.isPending ? 'Saving...' :
                     selectedProduct ? 'Update Product' : 'Create Product'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4 text-red-600">Delete Product</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{selectedProduct.name}</strong> ({selectedProduct.code})?
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setSelectedProduct(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={deleteProductMutation.isPending}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {deleteProductMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}