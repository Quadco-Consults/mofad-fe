'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import mockApi from '@/lib/mockApi'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import { Product, ProductFormData } from '@/types/api'
import {
  Plus,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  Package,
  Droplets,
  Fuel,
  Settings,
  TrendingUp,
  AlertTriangle,
  X,
  Save,
  Loader2,
  RefreshCw,
  XCircle,
  CheckCircle,
  Power,
  PowerOff,
} from 'lucide-react'

const getCategoryIcon = (category: string) => {
  switch (category?.toLowerCase()) {
    case 'lubricants':
    case 'engine_oils':
      return <Droplets className="w-5 h-5 text-blue-500" />
    case 'hydraulics':
    case 'hydraulic_oils':
      return <Settings className="w-5 h-5 text-purple-500" />
    case 'transmission':
    case 'transmission_fluids':
      return <Power className="w-5 h-5 text-green-500" />
    case 'specialty_products':
    case 'marine':
      return <Package className="w-5 h-5 text-orange-500" />
    case 'service':
      return <TrendingUp className="w-5 h-5 text-pink-500" />
    case 'equipment':
      return <Package className="w-5 h-5 text-gray-500" />
    default:
      return <Droplets className="w-5 h-5 text-blue-500" />
  }
}

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    'lubricants': 'Lubricants',
    'engine_oils': 'Engine Oils',
    'hydraulics': 'Hydraulic Oils',
    'hydraulic_oils': 'Hydraulic Oils',
    'transmission': 'Transmission Fluids',
    'transmission_fluids': 'Transmission Fluids',
    'specialty_products': 'Specialty Products',
    'marine': 'Marine Products',
    'service': 'Services',
    'equipment': 'Equipment',
    'other': 'Other',
  }
  return labels[category] || category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
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

const initialFormData: ProductFormData = {
  name: '',
  description: '',
  category: 'lubricants',
  subcategory: '',
  brand: '',
  unit_of_measure: 'liters',
  cost_price: 0,
  direct_sales_price: 0,
  minimum_selling_price: 0,
  tax_rate: 7.5,
  tax_inclusive: false,
  track_inventory: true,
  minimum_stock_level: 0,
  maximum_stock_level: 0,
  reorder_point: 0,
  is_active: true,
  is_sellable: true,
  is_purchasable: true,
  primary_supplier: '',
}

export default function ProductsPage() {
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Fetch products
  const { data: productsData, isLoading, error, refetch } = useQuery({
    queryKey: ['products', searchTerm, categoryFilter, statusFilter],
    queryFn: () => mockApi.get('/products/'),
  })

  // Extract and filter products data
  const allProducts = Array.isArray(productsData) ? productsData : []

  // Calculate low stock from the same products data
  const lowStockProducts = allProducts.filter((product: any) => {
    // Consider products with current stock below reorder point as low stock
    // For mock data, we'll simulate some low stock items
    return product.minimum_stock_level > 0 && product.minimum_stock_level < 100
  })

  // Apply filters
  const products = allProducts.filter((product: any) => {
    // Search filter
    if (searchTerm) {
      const searchMatch =
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.primary_supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      if (!searchMatch) return false
    }

    // Category filter
    if (categoryFilter !== 'all' && product.category !== categoryFilter) return false

    // Status filter
    if (statusFilter !== 'all') {
      const isActive = product.is_active
      if (statusFilter === 'active' && !isActive) return false
      if (statusFilter === 'inactive' && isActive) return false
    }

    return true
  })

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: (data: ProductFormData) => mockApi.post('/products/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setShowAddModal(false)
      resetForm()
      addToast({ type: 'success', title: 'Success', message: 'Product created successfully' })
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to create product'
      addToast({ type: 'error', title: 'Error', message })
      if (error.errors) {
        setFormErrors(error.errors)
      }
    },
  })

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProductFormData> }) =>
      mockApi.patch(`/products/${id}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setShowEditModal(false)
      resetForm()
      addToast({ type: 'success', title: 'Success', message: 'Product updated successfully' })
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to update product'
      addToast({ type: 'error', title: 'Error', message })
      if (error.errors) {
        setFormErrors(error.errors)
      }
    },
  })

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => mockApi.delete(`/products/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setShowDeleteModal(false)
      setSelectedProduct(null)
      addToast({ type: 'success', title: 'Success', message: 'Product deleted successfully' })
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to delete product'
      addToast({ type: 'error', title: 'Error', message })
    },
  })

  // Activate product mutation
  const activateMutation = useMutation({
    mutationFn: (id: number) => mockApi.post(`/products/${id}/activate/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      addToast({ type: 'success', title: 'Success', message: 'Product activated successfully' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to activate product' })
    },
  })

  // Deactivate product mutation
  const deactivateMutation = useMutation({
    mutationFn: (id: number) => mockApi.post(`/products/${id}/deactivate/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      addToast({ type: 'success', title: 'Success', message: 'Product deactivated successfully' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to deactivate product' })
    },
  })

  // Helper functions
  const resetForm = () => {
    setFormData(initialFormData)
    setFormErrors({})
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) errors.name = 'Product name is required'
    if (!formData.category) errors.category = 'Category is required'
    if (!formData.unit_of_measure) errors.unit_of_measure = 'Unit of measure is required'
    if (formData.cost_price < 0) errors.cost_price = 'Cost price cannot be negative'
    if (formData.direct_sales_price < 0) errors.direct_sales_price = 'Direct Sales Price cannot be negative'
    if (formData.direct_sales_price < formData.cost_price) {
      errors.direct_sales_price = 'Direct Sales Price should be greater than cost price'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const calculateProfitMargin = (sellingPrice: number, costPrice: number) => {
    if (costPrice === 0) return 0
    return ((sellingPrice - costPrice) / costPrice) * 100
  }

  const handleAdd = () => {
    resetForm()
    setShowAddModal(true)
  }

  const handleView = (product: Product) => {
    setSelectedProduct(product)
    setShowViewModal(true)
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category,
      subcategory: product.subcategory || '',
      brand: product.brand || '',
      unit_of_measure: product.unit_of_measure,
      cost_price: product.cost_price,
      direct_sales_price: product.direct_sales_price,
      retail_sales_price: product.retail_sales_price || 0,
      tax_rate: product.tax_rate,
      tax_inclusive: product.tax_inclusive,
      track_inventory: product.track_inventory,
      minimum_stock_level: product.minimum_stock_level,
      maximum_stock_level: product.maximum_stock_level || 0,
      reorder_point: product.reorder_point || 0,
      is_active: product.is_active,
      is_sellable: product.is_sellable,
      is_purchasable: product.is_purchasable,
      primary_supplier: product.primary_supplier || '',
    })
    setFormErrors({})
    setShowEditModal(true)
  }

  const handleDelete = (product: Product) => {
    setSelectedProduct(product)
    setShowDeleteModal(true)
  }

  const handleToggleStatus = (product: Product) => {
    if (product.is_active) {
      deactivateMutation.mutate(product.id)
    } else {
      activateMutation.mutate(product.id)
    }
  }

  const handleSaveNew = () => {
    if (!validateForm()) return
    createMutation.mutate(formData)
  }

  const handleSaveEdit = () => {
    if (!validateForm() || !selectedProduct) return
    updateMutation.mutate({ id: selectedProduct.id, data: formData })
  }

  const confirmDelete = () => {
    if (selectedProduct) {
      deleteMutation.mutate(selectedProduct.id)
    }
  }

  // Stats calculation
  const totalProducts = products.length
  const activeProducts = products.filter(p => p.is_active).length
  const lowStockCount = lowStockProducts.length
  const categories = Array.from(new Set(products.map(p => p.category))).length
  const avgMargin = products.length > 0
    ? products.reduce((sum, p) => sum + calculateProfitMargin(p.retail_selling_price || p.direct_sales_price || 0, p.cost_price), 0) / products.length
    : 0

  // Form Input component
  const FormInput = ({
    label,
    name,
    type = 'text',
    required = false,
    placeholder = '',
    value,
    onChange,
    min,
    step,
    className = ''
  }: {
    label: string
    name: string
    type?: string
    required?: boolean
    placeholder?: string
    value: string | number
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    min?: string
    step?: string
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
        min={min}
        step={step}
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
            <h1 className="text-2xl font-bold text-foreground">Products</h1>
            <p className="text-muted-foreground">Manage product catalog and inventory</p>
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
              Add Product
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-green-600">{activeProducts}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Low Stock</p>
                  <p className="text-2xl font-bold text-red-600">{lowStockCount}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Categories</p>
                  <p className="text-2xl font-bold text-secondary">{categories}</p>
                </div>
                <Package className="w-8 h-8 text-secondary/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Margin</p>
                  <p className="text-2xl font-bold text-accent">{avgMargin.toFixed(1)}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-accent/60" />
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
                    placeholder="Search products by name, code, supplier..."
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
                  <option value="lubricants">Lubricants</option>
                  <option value="engine_oils">Engine Oils</option>
                  <option value="hydraulics">Hydraulic Oils</option>
                  <option value="transmission">Transmission Fluids</option>
                  <option value="specialty_products">Specialty Products</option>
                  <option value="marine">Marine Products</option>
                  <option value="service">Services</option>
                  <option value="equipment">Equipment</option>
                  <option value="other">Other</option>
                </select>

                <select
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
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
                  <p className="font-medium text-red-800">Error loading products</p>
                  <p className="text-sm text-red-600">{(error as any).message || 'An unexpected error occurred'}</p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products Table */}
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
                      <div className="w-16 h-4 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first product'}
                </p>
                <Button className="mofad-btn-primary" onClick={handleAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Code</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Brand</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Cost Price</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Retail Price</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Margin</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Stock</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              {getCategoryIcon(product.category)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.viscosity_grade}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm text-gray-700">{product.code}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-700">{getCategoryLabel(product.category)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-700 capitalize">{product.brand || '-'}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-medium text-gray-900">
                            {formatCurrency(product.cost_price)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-bold text-primary">
                            {formatCurrency(product.retail_selling_price || product.direct_sales_price || 0)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-bold text-green-600">
                            {calculateProfitMargin(
                              product.retail_selling_price || product.direct_sales_price || 0,
                              product.cost_price
                            ).toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">0</div>
                            <div className="text-gray-500">Min: {product.minimum_stock_level}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(product.is_active)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleView(product)}
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEdit(product)}
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleToggleStatus(product)}
                              disabled={activateMutation.isPending || deactivateMutation.isPending}
                              title={product.is_active ? "Deactivate" : "Activate"}
                            >
                              {product.is_active ? (
                                <PowerOff className="w-4 h-4 text-yellow-600" />
                              ) : (
                                <Power className="w-4 h-4 text-green-600" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleDelete(product)}
                              title="Delete"
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
            )}
          </CardContent>
        </Card>

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full m-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
                <h2 className="text-xl font-semibold">Add New Product</h2>
                <Button variant="ghost" onClick={() => setShowAddModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Product Name"
                    name="name"
                    required
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                        formErrors.category ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value as ProductFormData['category']})}
                    >
                      <option value="lubricants">Lubricants</option>
                      <option value="engine_oils">Engine Oils</option>
                      <option value="hydraulics">Hydraulic Oils</option>
                      <option value="transmission">Transmission Fluids</option>
                      <option value="specialty_products">Specialty Products</option>
                      <option value="marine">Marine Products</option>
                      <option value="service">Services</option>
                      <option value="equipment">Equipment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={2}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Product description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormInput
                    label="Brand"
                    name="brand"
                    placeholder="Brand name"
                    value={formData.brand || ''}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  />
                  <FormInput
                    label="Subcategory"
                    name="subcategory"
                    placeholder="Subcategory"
                    value={formData.subcategory || ''}
                    onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit of Measure <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.unit_of_measure}
                      onChange={(e) => setFormData({...formData, unit_of_measure: e.target.value as ProductFormData['unit_of_measure']})}
                    >
                      <option value="liters">Liters</option>
                      <option value="gallons">Gallons</option>
                      <option value="kilograms">Kilograms</option>
                      <option value="pieces">Pieces</option>
                      <option value="meters">Meters</option>
                      <option value="hours">Hours</option>
                    </select>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium text-gray-900 mb-3">Pricing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput
                      label="Cost Price (₦)"
                      name="cost_price"
                      type="number"
                      required
                      placeholder="0.00"
                      value={formData.cost_price}
                      onChange={(e) => setFormData({...formData, cost_price: parseFloat(e.target.value) || 0})}
                      min="0"
                      step="0.01"
                    />
                    <FormInput
                      label="Direct Sales Price (₦)"
                      name="direct_sales_price"
                      type="number"
                      required
                      placeholder="0.00"
                      value={formData.direct_sales_price}
                      onChange={(e) => setFormData({...formData, direct_sales_price: parseFloat(e.target.value) || 0})}
                      min="0"
                      step="0.01"
                    />
                    <FormInput
                      label="Retail Sales Price (₦)"
                      name="retail_sales_price"
                      type="number"
                      placeholder="0.00"
                      value={formData.retail_sales_price || 0}
                      onChange={(e) => setFormData({...formData, retail_sales_price: parseFloat(e.target.value) || 0})}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormInput
                      label="Tax Rate (%)"
                      name="tax_rate"
                      type="number"
                      placeholder="7.5"
                      value={formData.tax_rate}
                      onChange={(e) => setFormData({...formData, tax_rate: parseFloat(e.target.value) || 0})}
                      min="0"
                      step="0.01"
                    />
                    <div className="flex items-center gap-2 mt-6">
                      <input
                        type="checkbox"
                        id="tax_inclusive"
                        checked={formData.tax_inclusive}
                        onChange={(e) => setFormData({...formData, tax_inclusive: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <label htmlFor="tax_inclusive" className="text-sm text-gray-700">
                        Price is tax inclusive
                      </label>
                    </div>
                  </div>
                  {formData.direct_sales_price > 0 && formData.cost_price > 0 && (
                    <div className="p-3 bg-gray-50 rounded-md mt-4">
                      <span className="text-sm text-gray-600">Profit Margin: </span>
                      <span className="font-semibold text-green-600">
                        {calculateProfitMargin(formData.direct_sales_price, formData.cost_price).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium text-gray-900 mb-3">Inventory Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput
                      label="Minimum Stock Level"
                      name="minimum_stock_level"
                      type="number"
                      placeholder="0"
                      value={formData.minimum_stock_level}
                      onChange={(e) => setFormData({...formData, minimum_stock_level: parseFloat(e.target.value) || 0})}
                      min="0"
                    />
                    <FormInput
                      label="Maximum Stock Level"
                      name="maximum_stock_level"
                      type="number"
                      placeholder="0"
                      value={formData.maximum_stock_level || 0}
                      onChange={(e) => setFormData({...formData, maximum_stock_level: parseFloat(e.target.value) || 0})}
                      min="0"
                    />
                    <FormInput
                      label="Reorder Point"
                      name="reorder_point"
                      type="number"
                      placeholder="0"
                      value={formData.reorder_point || 0}
                      onChange={(e) => setFormData({...formData, reorder_point: parseFloat(e.target.value) || 0})}
                      min="0"
                    />
                  </div>
                  <div className="flex flex-wrap gap-4 mt-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.track_inventory}
                        onChange={(e) => setFormData({...formData, track_inventory: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">Track Inventory</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_sellable}
                        onChange={(e) => setFormData({...formData, is_sellable: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">Sellable</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_purchasable}
                        onChange={(e) => setFormData({...formData, is_purchasable: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">Purchasable</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                  </div>
                </div>

                {/* Supplier Section */}
              </div>
              <div className="flex justify-end gap-2 p-6 border-t sticky bottom-0 bg-white">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button
                  className="mofad-btn-primary"
                  onClick={handleSaveNew}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Add Product
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {showEditModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full m-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
                <h2 className="text-xl font-semibold">Edit Product - {selectedProduct.name}</h2>
                <Button variant="ghost" onClick={() => setShowEditModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-6 space-y-4">
                {/* Same form fields as Add Modal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Product Name"
                    name="name"
                    required
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value as ProductFormData['category']})}
                    >
                      <option value="lubricants">Lubricants</option>
                      <option value="engine_oils">Engine Oils</option>
                      <option value="hydraulics">Hydraulic Oils</option>
                      <option value="transmission">Transmission Fluids</option>
                      <option value="specialty_products">Specialty Products</option>
                      <option value="marine">Marine Products</option>
                      <option value="service">Services</option>
                      <option value="equipment">Equipment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={2}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormInput
                    label="Brand"
                    name="brand"
                    placeholder="Brand name"
                    value={formData.brand || ''}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  />
                  <FormInput
                    label="Subcategory"
                    name="subcategory"
                    placeholder="Subcategory"
                    value={formData.subcategory || ''}
                    onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit of Measure</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.unit_of_measure}
                      onChange={(e) => setFormData({...formData, unit_of_measure: e.target.value as ProductFormData['unit_of_measure']})}
                    >
                      <option value="liters">Liters</option>
                      <option value="gallons">Gallons</option>
                      <option value="kilograms">Kilograms</option>
                      <option value="pieces">Pieces</option>
                      <option value="meters">Meters</option>
                      <option value="hours">Hours</option>
                    </select>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-3">Pricing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput
                      label="Cost Price (₦)"
                      name="cost_price"
                      type="number"
                      value={formData.cost_price}
                      onChange={(e) => setFormData({...formData, cost_price: parseFloat(e.target.value) || 0})}
                      min="0"
                      step="0.01"
                    />
                    <FormInput
                      label="Direct Sales Price (₦)"
                      name="direct_sale_price"
                      type="number"
                      value={formData.direct_sales_price}
                      onChange={(e) => setFormData({...formData, direct_sales_price: parseFloat(e.target.value) || 0})}
                      min="0"
                      step="0.01"
                    />
                    <FormInput
                      label="Retail Sales Price"
                      name="retail_sales_price"
                      type="number"
                      value={formData.retail_sales_price || 0}
                      onChange={(e) => setFormData({...formData, retail_sales_price: parseFloat(e.target.value) || 0})}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormInput
                      label="Tax Rate (%)"
                      name="tax_rate"
                      type="number"
                      value={formData.tax_rate}
                      onChange={(e) => setFormData({...formData, tax_rate: parseFloat(e.target.value) || 0})}
                      min="0"
                      step="0.01"
                    />
                    <div className="flex items-center gap-2 mt-6">
                      <input
                        type="checkbox"
                        id="edit_tax_inclusive"
                        checked={formData.tax_inclusive}
                        onChange={(e) => setFormData({...formData, tax_inclusive: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <label htmlFor="edit_tax_inclusive" className="text-sm text-gray-700">
                        Price is tax inclusive
                      </label>
                    </div>
                  </div>
                  {formData.direct_sales_price > 0 && formData.cost_price > 0 && (
                    <div className="p-3 bg-gray-50 rounded-md mt-4">
                      <span className="text-sm text-gray-600">Profit Margin: </span>
                      <span className="font-semibold text-green-600">
                        {calculateProfitMargin(formData.direct_sales_price, formData.cost_price).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-3">Inventory Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput
                      label="Minimum Stock Level"
                      name="minimum_stock_level"
                      type="number"
                      value={formData.minimum_stock_level}
                      onChange={(e) => setFormData({...formData, minimum_stock_level: parseFloat(e.target.value) || 0})}
                      min="0"
                    />
                    <FormInput
                      label="Maximum Stock Level"
                      name="maximum_stock_level"
                      type="number"
                      value={formData.maximum_stock_level || 0}
                      onChange={(e) => setFormData({...formData, maximum_stock_level: parseFloat(e.target.value) || 0})}
                      min="0"
                    />
                    <FormInput
                      label="Reorder Point"
                      name="reorder_point"
                      type="number"
                      value={formData.reorder_point || 0}
                      onChange={(e) => setFormData({...formData, reorder_point: parseFloat(e.target.value) || 0})}
                      min="0"
                    />
                  </div>
                  <div className="flex flex-wrap gap-4 mt-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.track_inventory}
                        onChange={(e) => setFormData({...formData, track_inventory: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">Track Inventory</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_sellable}
                        onChange={(e) => setFormData({...formData, is_sellable: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">Sellable</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_purchasable}
                        onChange={(e) => setFormData({...formData, is_purchasable: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">Purchasable</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-3">Supplier</h3>
                  <FormInput
                    label="Primary Supplier"
                    name="primary_supplier"
                    placeholder="Supplier name"
                    value={formData.primary_supplier || ''}
                    onChange={(e) => setFormData({...formData, primary_supplier: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 p-6 border-t sticky bottom-0 bg-white">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button
                  className="mofad-btn-primary"
                  onClick={handleSaveEdit}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Update Product
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* View Product Modal */}
        {showViewModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Product Details</h2>
                <Button variant="ghost" onClick={() => setShowViewModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    {getCategoryIcon(selectedProduct.category)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedProduct.name}</h3>
                    <p className="text-muted-foreground font-mono">{selectedProduct.code}</p>
                    {getStatusBadge(selectedProduct.is_active)}
                  </div>
                </div>

                {selectedProduct.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-gray-900 mt-1">{selectedProduct.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Category</label>
                      <p className="text-gray-900">{getCategoryLabel(selectedProduct.category)}</p>
                    </div>
                    {selectedProduct.subcategory && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Subcategory</label>
                        <p className="text-gray-900">{selectedProduct.subcategory}</p>
                      </div>
                    )}
                    {selectedProduct.brand && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Brand</label>
                        <p className="text-gray-900">{selectedProduct.brand}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-500">Unit of Measure</label>
                      <p className="text-gray-900 capitalize">{selectedProduct.unit_of_measure}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Cost Price</label>
                      <p className="text-gray-900 font-semibold">{formatCurrency(selectedProduct.cost_price)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Direct Sales Price</label>
                      <p className="text-primary font-bold text-lg">{formatCurrency(selectedProduct.direct_sales_price)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Profit Margin</label>
                      <p className="text-green-600 font-bold">
                        {calculateProfitMargin(selectedProduct.direct_sales_price, selectedProduct.cost_price).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tax Rate</label>
                      <p className="text-gray-900">
                        {selectedProduct.tax_rate}%
                        {selectedProduct.tax_inclusive && ' (Inclusive)'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Inventory Settings</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Minimum Stock</label>
                      <p className="font-semibold">{selectedProduct.minimum_stock_level}</p>
                    </div>
                    {selectedProduct.maximum_stock_level && (
                      <div>
                        <label className="text-sm text-gray-500">Maximum Stock</label>
                        <p className="font-semibold">{selectedProduct.maximum_stock_level}</p>
                      </div>
                    )}
                    {selectedProduct.reorder_point && (
                      <div>
                        <label className="text-sm text-gray-500">Reorder Point</label>
                        <p className="font-semibold">{selectedProduct.reorder_point}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm text-gray-500">Track Inventory</label>
                      <p className="font-semibold">{selectedProduct.track_inventory ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Status Flags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.is_sellable && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Sellable</span>
                    )}
                    {selectedProduct.is_purchasable && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Purchasable</span>
                    )}
                    {selectedProduct.is_service && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">Service</span>
                    )}
                    {selectedProduct.requires_batch_tracking && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Batch Tracking</span>
                    )}
                  </div>
                </div>

                {selectedProduct.primary_supplier && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Supplier</h4>
                    <p className="text-gray-900">{selectedProduct.primary_supplier}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="text-gray-500">Created</label>
                      <p className="text-gray-900">{formatDateTime(selectedProduct.created_at)}</p>
                    </div>
                    <div>
                      <label className="text-gray-500">Last Updated</label>
                      <p className="text-gray-900">{formatDateTime(selectedProduct.updated_at)}</p>
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
                  handleEdit(selectedProduct)
                }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Product
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedProduct && (
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
                    <h3 className="font-semibold text-gray-900">Delete Product</h3>
                    <p className="text-sm text-gray-600">This action cannot be undone</p>
                  </div>
                </div>
                <p className="text-gray-700">
                  Are you sure you want to delete <strong>{selectedProduct.name}</strong> ({selectedProduct.code})?
                  This will permanently remove the product and all associated data.
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
                  Delete Product
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
