'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
  ArrowUp,
  ArrowDown,
  RotateCcw,
  FileText,
  Calendar,
  User,
} from 'lucide-react'

// Real API bin card transaction interface (matches backend response)
interface BinCardTransaction {
  id: number
  transaction_date: string
  transaction_type: 'receipt' | 'issue' | 'transfer_out' | 'transfer_in' | 'adjustment' | 'return' | 'loss' | 'cycle_count'
  reference_number: string | null
  description: string
  quantity_in: number
  quantity_out: number
  balance_after: number
  unit_cost: number | null
  value: number | null
  created_by_name: string | null
}

// Real API bin card response interface
interface BinCardData {
  warehouse_id: number
  warehouse_name: string
  product_id: number
  product_name: string
  current_quantity: number
  transactions: BinCardTransaction[]
}

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

// Helper to get price from price schemes
const getPriceFromSchemes = (product: any, type: 'direct' | 'lubebay' | 'station'): number => {
  if (!product.price_schemes || !Array.isArray(product.price_schemes)) return 0

  const scheme = product.price_schemes.find((s: any) => {
    const name = (s.name || '').toLowerCase()
    if (type === 'direct') return name.includes('direct')
    if (type === 'lubebay') return name.includes('lubebay') || name.includes('lube')
    if (type === 'station') return name.includes('station')
    return false
  })

  return scheme?.price || 0
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
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [activeViewTab, setActiveViewTab] = useState<'details' | 'bincard'>('details')
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(null)

  // Selection hook for bulk operations
  const selection = useSelection<Product>()

  // Fetch products with proper API method and pagination
  const { data: productsData, isLoading, error, refetch } = useQuery({
    queryKey: ['products', searchTerm, categoryFilter, statusFilter, currentPage, pageSize],
    queryFn: () => apiClient.getProducts({
      search: searchTerm || undefined,
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      is_active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
      page: currentPage,
      size: pageSize, // Backend uses 'size' not 'page_size'
    }),
  })

  // Fetch warehouses for bin card functionality
  const { data: warehousesData } = useQuery({
    queryKey: ['warehouses-for-bincard'],
    queryFn: () => apiClient.getWarehouses({ is_active: true }),
  })

  // Fetch suppliers for dropdown
  const { data: suppliersData } = useQuery({
    queryKey: ['suppliers-for-products'],
    queryFn: () => apiClient.getSuppliers({ status: 'active' }),
  })

  // Fetch bin card data when warehouse is selected and view modal is shown for bin card tab
  const { data: binCardData, isLoading: binCardLoading, error: binCardError } = useQuery({
    queryKey: ['bincard', selectedWarehouseId, selectedProduct?.id],
    queryFn: () => {
      if (!selectedWarehouseId || !selectedProduct?.id) return null
      return apiClient.getWarehouseBinCard(selectedWarehouseId, selectedProduct.id)
    },
    enabled: !!(selectedWarehouseId && selectedProduct?.id && showViewModal && activeViewTab === 'bincard'),
  })

  // Reset to first page when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value)
    setCurrentPage(1)
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  // Helper to extract array from API response (handles paginated and direct array responses)
  // Backend returns: { paginator: { count, page, ... }, results: [...] }
  const extractResults = (data: any): Product[] => {
    if (!data) return []
    if (Array.isArray(data)) return data
    if (data.results && Array.isArray(data.results)) return data.results
    // Handle nested data structure from API wrapper
    if (data.data?.results) return data.data.results
    return []
  }

  // Extract total count for pagination
  // Backend pagination format: { paginator: { count, page, page_size, total_pages, ... }, results: [...] }
  const getTotalCount = (data: any): number => {
    if (!data) return 0
    if (Array.isArray(data)) return data.length
    // Check paginator structure first (backend format)
    if (data.paginator?.count !== undefined) return data.paginator.count
    // Standard DRF format
    if (data.count !== undefined) return data.count
    if (data.results && Array.isArray(data.results)) return data.results.length
    return 0
  }

  // Extract total pages from backend response
  const getTotalPages = (data: any): number => {
    if (!data) return 0
    if (data.paginator?.total_pages !== undefined) return data.paginator.total_pages
    return Math.ceil(getTotalCount(data) / pageSize)
  }

  const totalCount = getTotalCount(productsData)
  const totalPages = getTotalPages(productsData)

  // Extract and filter products data
  const allProducts = extractResults(productsData)

  // Extract warehouses data
  const warehouses = warehousesData?.results || (Array.isArray(warehousesData) ? warehousesData : [])

  // Extract suppliers data
  const suppliers = suppliersData?.results || (Array.isArray(suppliersData) ? suppliersData : [])

  // Calculate low stock from the same products data
  const lowStockProducts = allProducts.filter((product: any) => {
    // Consider products with current stock below reorder point as low stock
    // For mock data, we'll simulate some low stock items
    return product.minimum_stock_level > 0 && product.minimum_stock_level < 100
  })

  // Products are already filtered by API, just use allProducts
  const products = allProducts

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: (data: ProductFormData) => apiClient.post('/products/', data),
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
      apiClient.patch(`/products/${id}/`, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] })
      await refetch()
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
    mutationFn: (id: number) => apiClient.delete(`/products/${id}/`),
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
    mutationFn: (id: number) => apiClient.post(`/products/${id}/activate/`),
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
    mutationFn: (id: number) => apiClient.post(`/products/${id}/deactivate/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      addToast({ type: 'success', title: 'Success', message: 'Product deactivated successfully' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to deactivate product' })
    },
  })

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: (number | string)[]) => apiClient.bulkDeleteProducts(ids),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setShowBulkDeleteModal(false)
      selection.clearSelection()

      if (response.failed_count > 0) {
        addToast({
          type: 'warning',
          title: 'Partial Success',
          message: `Deleted ${response.deleted_count} products. ${response.failed_count} failed.`
        })
      } else {
        addToast({
          type: 'success',
          title: 'Success',
          message: `Successfully deleted ${response.deleted_count} products`
        })
      }
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to delete products'
      })
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

  // Helper to get transaction type icon based on real API transaction types
  const getTransactionTypeIcon = (type: BinCardTransaction['transaction_type']) => {
    switch (type) {
      case 'receipt':
        return <ArrowUp className="w-4 h-4 text-green-600" />
      case 'issue':
        return <ArrowDown className="w-4 h-4 text-red-600" />
      case 'transfer_out':
        return <ArrowDown className="w-4 h-4 text-blue-600" />
      case 'transfer_in':
        return <ArrowUp className="w-4 h-4 text-blue-600" />
      case 'return':
        return <ArrowUp className="w-4 h-4 text-orange-600" />
      case 'adjustment':
        return <Settings className="w-4 h-4 text-purple-600" />
      case 'loss':
        return <ArrowDown className="w-4 h-4 text-red-600" />
      case 'cycle_count':
        return <Settings className="w-4 h-4 text-gray-600" />
      default:
        return <Package className="w-4 h-4 text-gray-600" />
    }
  }

  const getTransactionTypeBadge = (type: BinCardEntry['type']) => {
    const colors = {
      receipt: 'bg-green-100 text-green-800',
      issue: 'bg-red-100 text-red-800',
      transfer: 'bg-blue-100 text-blue-800',
      return: 'bg-orange-100 text-orange-800',
      adjustment: 'bg-purple-100 text-purple-800'
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[type]}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    )
  }

  const handleView = (product: Product) => {
    setSelectedProduct(product)
    setActiveViewTab('details')
    setShowViewModal(true)
    // Set default warehouse for bin card if warehouses are available
    if (warehouses.length > 0 && !selectedWarehouseId) {
      setSelectedWarehouseId(warehouses[0].id)
    }
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
      direct_sales_price: (product as any).bulk_selling_price || 0, // Map backend bulk_selling_price to form direct_sales_price
      retail_sales_price: product.retail_selling_price || 0,
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
    // Map form data to backend field names
    const backendData = {
      ...formData,
      bulk_selling_price: formData.direct_sales_price, // Map direct_sales_price to bulk_selling_price
    }
    delete (backendData as any).direct_sales_price // Remove the frontend-only field
    createMutation.mutate(backendData)
  }

  const handleSaveEdit = () => {
    if (!validateForm() || !selectedProduct) return
    // Map form data to backend field names
    const backendData = {
      ...formData,
      bulk_selling_price: formData.direct_sales_price, // Map direct_sales_price to bulk_selling_price
    }
    delete (backendData as any).direct_sales_price // Remove the frontend-only field
    updateMutation.mutate({ id: selectedProduct.id, data: backendData })
  }

  const confirmDelete = () => {
    if (selectedProduct) {
      deleteMutation.mutate(selectedProduct.id)
    }
  }

  const handleBulkDelete = () => {
    setShowBulkDeleteModal(true)
  }

  const confirmBulkDelete = () => {
    bulkDeleteMutation.mutate(selection.selectedIds)
  }

  // Stats calculation
  const totalProducts = products.length
  const activeProducts = products.filter(p => p.is_active).length
  const lowStockCount = lowStockProducts.length
  const categories = Array.from(new Set(products.map(p => p.category))).length
  const avgMargin = products.length > 0
    ? products.reduce((sum, p) => sum + calculateProfitMargin(p.retail_selling_price || p.bulk_selling_price || 0, p.cost_price), 0) / products.length
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
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <select
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={categoryFilter}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="engine_oil">Engine Oils</option>
                  <option value="hydraulic_oil">Hydraulic Oils</option>
                  <option value="gear_oil">Gear Oils</option>
                  <option value="brake_fluid">Brake Fluids</option>
                  <option value="coolant">Coolants</option>
                  <option value="grease">Greases</option>
                  <option value="filter">Filters</option>
                  <option value="additive">Additives</option>
                  <option value="other">Other</option>
                </select>

                <select
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={statusFilter}
                  onChange={(e) => handleStatusChange(e.target.value)}
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
                      <th className="w-12 py-3 px-4">
                        <Checkbox
                          checked={selection.isAllSelected(products)}
                          indeterminate={selection.isPartiallySelected(products)}
                          onChange={() => selection.toggleAll(products)}
                        />
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Code</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Brand</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Cost Price</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Direct (Wholesale)</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">LubeBay</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Station (Retail)</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Stock</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className={`hover:bg-gray-50 ${selection.isSelected(product.id) ? 'bg-primary-50' : ''}`}
                      >
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selection.isSelected(product.id)}
                            onChange={() => selection.toggle(product.id)}
                          />
                        </td>
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
                          <span className="font-medium text-gray-700">
                            {formatCurrency(product.cost_price)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-semibold text-blue-600">
                            {formatCurrency(getPriceFromSchemes(product, 'direct'))}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-semibold text-orange-600">
                            {formatCurrency(getPriceFromSchemes(product, 'lubebay'))}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-bold text-primary">
                            {formatCurrency(getPriceFromSchemes(product, 'station'))}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.brand || ''}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    >
                      <option value="">Select brand...</option>
                      <option value="castrol">Castrol</option>
                      <option value="shell">Shell</option>
                      <option value="nnpc">NNPC</option>
                      <option value="total">Total</option>
                      <option value="mobil">Mobil</option>
                      <option value="eterna">Eterna</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.subcategory || ''}
                      onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                    >
                      <option value="">Select subcategory...</option>
                      <option value="automotive">Automotive</option>
                      <option value="industrial">Industrial</option>
                      <option value="marine">Marine</option>
                      <option value="agriculture">Agriculture</option>
                      <option value="mining">Mining</option>
                      <option value="construction">Construction</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cost Price (₦) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="cost_price"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="0.00"
                        value={formData.cost_price}
                        onChange={(e) => {
                          setFormData({...formData, cost_price: e.target.valueAsNumber || 0})
                        }}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Direct Sales Price (₦) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="direct_sales_price"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="0.00"
                        value={formData.direct_sales_price}
                        onChange={(e) => {
                          setFormData({...formData, direct_sales_price: e.target.valueAsNumber || 0})
                        }}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Retail Sales Price (₦)
                      </label>
                      <input
                        type="number"
                        name="retail_sales_price"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="0.00"
                        value={formData.retail_sales_price || 0}
                        onChange={(e) => {
                          setFormData({...formData, retail_sales_price: e.target.valueAsNumber || 0})
                        }}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tax Rate (%)
                      </label>
                      <input
                        type="number"
                        name="tax_rate"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="7.5"
                        value={formData.tax_rate}
                        onChange={(e) => setFormData({...formData, tax_rate: e.target.valueAsNumber || 0})}
                        min="0"
                        step="0.01"
                      />
                    </div>
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Stock Level
                      </label>
                      <input
                        type="number"
                        name="minimum_stock_level"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="0"
                        value={formData.minimum_stock_level}
                        onChange={(e) => setFormData({...formData, minimum_stock_level: e.target.valueAsNumber || 0})}
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maximum Stock Level
                      </label>
                      <input
                        type="number"
                        name="maximum_stock_level"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="0"
                        value={formData.maximum_stock_level || 0}
                        onChange={(e) => setFormData({...formData, maximum_stock_level: e.target.valueAsNumber || 0})}
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reorder Point
                      </label>
                      <input
                        type="number"
                        name="reorder_point"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="0"
                        value={formData.reorder_point || 0}
                        onChange={(e) => setFormData({...formData, reorder_point: e.target.valueAsNumber || 0})}
                        min="0"
                      />
                    </div>
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
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium text-gray-900 mb-3">Supplier</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Primary Supplier
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.primary_supplier || ''}
                      onChange={(e) => setFormData({...formData, primary_supplier: e.target.value})}
                    >
                      <option value="">Select supplier...</option>
                      {suppliers.map((supplier: any) => (
                        <option key={supplier.id} value={supplier.name}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                    {formData.brand && (
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.brand === 'castrol' && 'Recommended: Eterna'}
                        {formData.brand === 'shell' && 'Recommended: Ardova'}
                        {formData.brand === 'mobil' && 'Recommended: MRS Oil'}
                        {formData.brand === 'total' && 'Recommended: Total'}
                        {formData.brand === 'nnpc' && 'Recommended: NNPC'}
                      </p>
                    )}
                  </div>
                </div>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.brand || ''}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    >
                      <option value="">Select brand...</option>
                      <option value="castrol">Castrol</option>
                      <option value="shell">Shell</option>
                      <option value="nnpc">NNPC</option>
                      <option value="total">Total</option>
                      <option value="mobil">Mobil</option>
                      <option value="eterna">Eterna</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.subcategory || ''}
                      onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                    >
                      <option value="">Select subcategory...</option>
                      <option value="automotive">Automotive</option>
                      <option value="industrial">Industrial</option>
                      <option value="marine">Marine</option>
                      <option value="agriculture">Agriculture</option>
                      <option value="mining">Mining</option>
                      <option value="construction">Construction</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cost Price (₦)
                      </label>
                      <input
                        type="number"
                        name="cost_price"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        value={formData.cost_price}
                        onChange={(e) => {
                          setFormData({...formData, cost_price: e.target.valueAsNumber || 0})
                        }}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Direct Sales Price (₦)
                      </label>
                      <input
                        type="number"
                        name="direct_sales_price"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        value={formData.direct_sales_price}
                        onChange={(e) => {
                          setFormData({...formData, direct_sales_price: e.target.valueAsNumber || 0})
                        }}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Retail Sales Price (₦)
                      </label>
                      <input
                        type="number"
                        name="retail_sales_price"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        value={formData.retail_sales_price || 0}
                        onChange={(e) => {
                          setFormData({...formData, retail_sales_price: e.target.valueAsNumber || 0})
                        }}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tax Rate (%)
                      </label>
                      <input
                        type="number"
                        name="tax_rate"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        value={formData.tax_rate}
                        onChange={(e) => setFormData({...formData, tax_rate: e.target.valueAsNumber || 0})}
                        min="0"
                        step="0.01"
                      />
                    </div>
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Stock Level
                      </label>
                      <input
                        type="number"
                        name="minimum_stock_level"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        value={formData.minimum_stock_level}
                        onChange={(e) => setFormData({...formData, minimum_stock_level: e.target.valueAsNumber || 0})}
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maximum Stock Level
                      </label>
                      <input
                        type="number"
                        name="maximum_stock_level"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        value={formData.maximum_stock_level || 0}
                        onChange={(e) => setFormData({...formData, maximum_stock_level: e.target.valueAsNumber || 0})}
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reorder Point
                      </label>
                      <input
                        type="number"
                        name="reorder_point"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        value={formData.reorder_point || 0}
                        onChange={(e) => setFormData({...formData, reorder_point: e.target.valueAsNumber || 0})}
                        min="0"
                      />
                    </div>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Primary Supplier
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.primary_supplier || ''}
                      onChange={(e) => setFormData({...formData, primary_supplier: e.target.value})}
                    >
                      <option value="">Select supplier...</option>
                      {suppliers.map((supplier: any) => (
                        <option key={supplier.id} value={supplier.name}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                    {formData.brand && (
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.brand === 'castrol' && 'Recommended: Eterna'}
                        {formData.brand === 'shell' && 'Recommended: Ardova'}
                        {formData.brand === 'mobil' && 'Recommended: MRS Oil'}
                        {formData.brand === 'total' && 'Recommended: Total'}
                        {formData.brand === 'nnpc' && 'Recommended: NNPC'}
                      </p>
                    )}
                  </div>
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
            <div className="bg-white rounded-lg max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    {getCategoryIcon(selectedProduct.category)}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{selectedProduct.name}</h2>
                    <p className="text-muted-foreground font-mono">{selectedProduct.code}</p>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => setShowViewModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Tab Navigation */}
              <div className="bg-white border-b">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  <button
                    onClick={() => setActiveViewTab('details')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeViewTab === 'details'
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Product Details
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveViewTab('bincard')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeViewTab === 'bincard'
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Bin Card
                    </div>
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeViewTab === 'details' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(selectedProduct.is_active)}
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-600">Last updated: {formatDateTime(selectedProduct.updated_at)}</span>
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
                  </div>
                )}

                {activeViewTab === 'bincard' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Bin Card - Product Movement</h3>
                        <p className="text-sm text-gray-600">Track all inventory transactions for {selectedProduct.name}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Current Stock Balance</div>
                        <div className="text-2xl font-bold text-primary">
                          {binCardData?.current_quantity || 0} {selectedProduct.unit_of_measure}
                        </div>
                      </div>
                    </div>

                    {/* Warehouse Selection */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Warehouse
                      </label>
                      <select
                        value={selectedWarehouseId || ''}
                        onChange={(e) => setSelectedWarehouseId(Number(e.target.value) || null)}
                        className="w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                      >
                        <option value="">Select warehouse...</option>
                        {warehouses.map((warehouse: any) => (
                          <option key={warehouse.id} value={warehouse.id}>
                            {warehouse.name} ({warehouse.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead className="bg-gradient-to-r from-orange-500 to-amber-500">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Ref. No</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Description</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Type</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Received</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Issued</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Balance</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Performed By</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {generateMockBinCardData(selectedProduct.code).map((entry, index) => (
                              <tr key={entry.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                    <span className="text-sm text-gray-900">{entry.date}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className="text-sm font-mono text-gray-900">{entry.refNo}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="text-sm text-gray-900">{entry.description}</div>
                                  <div className="text-xs text-gray-500">{entry.location}</div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    {getTransactionTypeIcon(entry.type)}
                                    {getTransactionTypeBadge(entry.type)}
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                  {entry.received > 0 ? (
                                    <span className="text-green-600 font-medium">+{entry.received.toLocaleString()}</span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                  {entry.issued > 0 ? (
                                    <span className="text-red-600 font-medium">-{entry.issued.toLocaleString()}</span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                  <div className="text-sm">
                                    <div className="font-bold text-gray-900">{entry.balance.toLocaleString()}</div>
                                    <div className="text-xs text-gray-500">{formatCurrency(entry.totalValue)}</div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <User className="w-4 h-4 text-gray-400 mr-2" />
                                    <span className="text-sm text-gray-900">{entry.performedBy}</span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-sm text-green-800 font-medium">Total Received</div>
                        <div className="text-2xl font-bold text-green-600">
                          {generateMockBinCardData(selectedProduct.code)
                            .reduce((sum, entry) => sum + entry.received, 0)
                            .toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <div className="text-sm text-red-800 font-medium">Total Issued</div>
                        <div className="text-2xl font-bold text-red-600">
                          {generateMockBinCardData(selectedProduct.code)
                            .reduce((sum, entry) => sum + entry.issued, 0)
                            .toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-sm text-blue-800 font-medium">Current Balance</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {generateMockBinCardData(selectedProduct.code)[0]?.balance || 0} {selectedProduct.unit_of_measure}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 p-6 border-t sticky bottom-0 bg-white">
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
        <ConfirmDialog
          open={showDeleteModal && !!selectedProduct}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Delete Product"
          message={
            selectedProduct ? (
              <>
                Are you sure you want to delete <strong>{selectedProduct.name}</strong> ({selectedProduct.code})?
                This will permanently remove the product and all associated data.
              </>
            ) : ''
          }
          confirmText="Delete Product"
          variant="danger"
          isLoading={deleteMutation.isPending}
        />

        {/* Bulk Delete Confirmation Modal */}
        <ConfirmDialog
          open={showBulkDeleteModal}
          onClose={() => setShowBulkDeleteModal(false)}
          onConfirm={confirmBulkDelete}
          title="Delete Multiple Products"
          message={`Are you sure you want to delete ${selection.selectedCount} product${selection.selectedCount > 1 ? 's' : ''}? This action cannot be undone.`}
          confirmText={`Delete ${selection.selectedCount} Product${selection.selectedCount > 1 ? 's' : ''}`}
          variant="danger"
          isLoading={bulkDeleteMutation.isPending}
        />

        {/* Bulk Action Bar */}
        <BulkActionBar
          selectedCount={selection.selectedCount}
          onClearSelection={selection.clearSelection}
          onBulkDelete={handleBulkDelete}
          isDeleting={bulkDeleteMutation.isPending}
          entityName="product"
        />
      </div>
    </AppLayout>
  )
}
