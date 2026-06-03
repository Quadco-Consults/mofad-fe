'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { BulkActionBar } from '@/components/ui/BulkActionBar'
import { useSelection } from '@/hooks/useSelection'
import apiClient from '@/lib/apiClient'
import { useToast } from '@/components/ui/Toast'
import { Product, ProductFormData } from '@/types/api'
import { Plus, RefreshCw, Download, Upload } from 'lucide-react'

// Import all product components
import {
  ProductFilters,
  ProductStatsCards,
  ProductTypeTabs,
  ProductTable,
  ProductForm,
  ProductViewModal,
  ProductModals,
  initialFormData,
  type BinCardData,
} from './components'

export default function ProductsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  // State management
  const [productTypeTab, setProductTypeTab] = useState<'all' | 'lubricants' | 'filters'>('all')
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

  // Filter categories (used to exclude from lubricants tab)
  const filterCategories = ['filter']

  // Resolve effective category param based on tab + dropdown selection
  const getEffectiveCategory = () => {
    if (categoryFilter !== 'all') return categoryFilter
    if (productTypeTab === 'filters') return 'filter'
    return undefined
  }

  // Fetch products with proper API method and pagination
  const { data: productsData, isLoading, error, refetch } = useQuery({
    queryKey: ['products', searchTerm, categoryFilter, statusFilter, currentPage, pageSize, productTypeTab],
    queryFn: () => apiClient.getProducts({
      search: searchTerm || undefined,
      category: getEffectiveCategory(),
      is_active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
      page: currentPage,
      size: pageSize,
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

  // Fetch bin card data when warehouse is selected
  const { data: binCardData, isLoading: binCardLoading, error: binCardError } = useQuery({
    queryKey: ['bincard', selectedWarehouseId, selectedProduct?.id],
    queryFn: () => {
      if (!selectedWarehouseId || !selectedProduct?.id) return null
      return apiClient.getWarehouseBinCard(selectedWarehouseId, selectedProduct.id)
    },
    enabled: !!(selectedWarehouseId && selectedProduct?.id && showViewModal && activeViewTab === 'bincard'),
  })

  // Filter change handlers
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

  const handleProductTypeTabChange = (tab: 'all' | 'lubricants' | 'filters') => {
    setProductTypeTab(tab)
    setCategoryFilter('all')
    setCurrentPage(1)
  }

  // Helper functions to extract data from API response
  const extractResults = (data: any): Product[] => {
    if (!data) return []
    if (Array.isArray(data)) return data
    if (data.results && Array.isArray(data.results)) return data.results
    if (data.data?.results) return data.data.results
    return []
  }

  const getTotalCount = (data: any): number => {
    if (!data) return 0
    if (Array.isArray(data)) return data.length
    if (data.paginator?.count !== undefined) return data.paginator.count
    if (data.count !== undefined) return data.count
    if (data.results && Array.isArray(data.results)) return data.results.length
    return 0
  }

  const getTotalPages = (data: any): number => {
    if (!data) return 0
    if (data.paginator?.total_pages !== undefined) return data.paginator.total_pages
    return Math.ceil(getTotalCount(data) / pageSize)
  }

  const totalCount = getTotalCount(productsData)
  const totalPages = getTotalPages(productsData)

  // Extract and filter products data
  const allProducts = extractResults(productsData)

  // Client-side tab filtering for lubricants tab
  const filteredProducts = productTypeTab === 'lubricants' && categoryFilter === 'all'
    ? allProducts.filter((p: any) => !filterCategories.includes(p.category))
    : allProducts

  // Expand products with multiple package sizes into separate rows
  const products = filteredProducts.flatMap((product: any) => {
    if (product.package_sizes && Array.isArray(product.package_sizes) && product.package_sizes.length > 0) {
      return product.package_sizes.map((size: number, index: number) => ({
        ...product,
        id: `${product.id}-${index}`,
        original_id: product.id,
        package_size: size,
        package_sizes: [size],
      }))
    }
    return [{
      ...product,
      original_id: product.id,
      package_size: product.retail_size || product.bulk_size || null
    }]
  })

  // Extract warehouses and suppliers
  const warehouses = Array.isArray(warehousesData) ? warehousesData : (warehousesData as any)?.results || []
  const suppliers = Array.isArray(suppliersData) ? suppliersData : (suppliersData as any)?.results || []

  // Calculate low stock products
  const lowStockProducts = products.filter((product: any) => {
    return product.minimum_stock_level > 0 && product.minimum_stock_level < 100
  })

  // Mutations
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

  // Form helpers
  const resetForm = () => {
    setFormData(initialFormData)
    setFormErrors({})
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) errors.name = 'Product name is required'
    if (!formData.code?.trim()) errors.code = 'Product code is required'
    if (!formData.category) errors.category = 'Category is required'
    if (!formData.unit_of_measure) errors.unit_of_measure = 'Unit of measure is required'
    if (formData.cost_price < 0) errors.cost_price = 'Cost price cannot be negative'
    if (formData.direct_sales_price < 0) errors.direct_sales_price = 'Direct Sales Price cannot be negative'
    if (formData.direct_sales_price < formData.cost_price) {
      errors.direct_sales_price = 'Direct Sales Price should be greater than cost price'
    }
    if (formData.package_size !== undefined && formData.package_size <= 0) {
      errors.package_size = 'Package size must be greater than 0'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Event handlers
  const handleAdd = () => {
    resetForm()
    if (productTypeTab === 'filters') {
      setFormData(prev => ({ ...prev, category: 'filter', unit_of_measure: 'pieces' }))
    }
    setShowAddModal(true)
  }

  const handleView = (product: Product) => {
    setSelectedProduct(product)
    setActiveViewTab('details')
    setShowViewModal(true)
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
      code: product.code || '',
      package_size: product.package_size,
      unit_of_measure: product.unit_of_measure,
      cost_price: product.cost_price,
      direct_sales_price: (product as any).bulk_selling_price || 0,
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

  const handleEditFromView = () => {
    if (selectedProduct) {
      setShowViewModal(false)
      handleEdit(selectedProduct)
    }
  }

  const handleDelete = (product: Product) => {
    setSelectedProduct(product)
    setShowDeleteModal(true)
  }

  const handleToggleStatus = (product: Product) => {
    const productId = (product as any).original_id || product.id
    if (product.is_active) {
      deactivateMutation.mutate(productId)
    } else {
      activateMutation.mutate(productId)
    }
  }

  const handleSaveNew = () => {
    if (!validateForm()) return

    let productCode = formData.code || ''
    if (formData.package_size && productCode) {
      productCode = `${productCode}-${Math.round(formData.package_size)}L`
    }

    const backendData: any = {
      ...formData,
      code: productCode,
      bulk_selling_price: formData.direct_sales_price,
      retail_selling_price: formData.retail_sales_price,
    }

    if (formData.package_size) {
      backendData.retail_size = formData.package_size
      backendData.package_sizes = [formData.package_size]
    }

    delete backendData.direct_sales_price
    delete backendData.package_size

    createMutation.mutate(backendData)
  }

  const handleSaveEdit = () => {
    if (!validateForm() || !selectedProduct) return

    const backendData = {
      ...formData,
      bulk_selling_price: formData.direct_sales_price,
      retail_selling_price: formData.retail_sales_price,
    }
    delete (backendData as any).direct_sales_price
    delete (backendData as any).retail_sales_price

    const productId = (selectedProduct as any).original_id || selectedProduct.id
    updateMutation.mutate({ id: productId, data: backendData })
  }

  const confirmDelete = () => {
    if (selectedProduct) {
      const productId = (selectedProduct as any).original_id || selectedProduct.id
      deleteMutation.mutate(productId)
    }
  }

  const handleBulkDelete = () => {
    setShowBulkDeleteModal(true)
  }

  const confirmBulkDelete = () => {
    bulkDeleteMutation.mutate(selection.selectedIds)
  }

  const handleFormChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleWarehouseChange = (warehouseId: number | null) => {
    setSelectedWarehouseId(warehouseId)
  }

  // Stats calculation
  const totalProducts = products.length
  const activeProducts = products.filter(p => p.is_active).length
  const lowStockCount = lowStockProducts.length
  const categories = Array.from(new Set(products.map(p => p.category))).length

  const calculateProfitMargin = (sellingPrice: number, costPrice: number) => {
    if (costPrice === 0) return 0
    return ((sellingPrice - costPrice) / costPrice) * 100
  }

  const avgMargin = products.length > 0
    ? products.reduce((sum, p) => sum + calculateProfitMargin(p.retail_selling_price || (p as any).bulk_selling_price || 0, p.cost_price), 0) / products.length
    : 0

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
            <Button variant="outline" onClick={() => router.push('/products/bulk-upload')}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Prices
            </Button>
            <Button className="mofad-btn-primary" onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <ProductStatsCards
          totalProducts={totalProducts}
          activeProducts={activeProducts}
          lowStockCount={lowStockCount}
          categories={categories}
          avgMargin={avgMargin}
          productTypeTab={productTypeTab}
        />

        {/* Product Type Tabs */}
        <ProductTypeTabs
          activeTab={productTypeTab}
          onTabChange={handleProductTypeTabChange}
          counts={{
            all: totalCount,
            lubricants: products.filter(p => !filterCategories.includes(p.category)).length,
            filters: products.filter(p => p.category === 'filter').length,
          }}
        />

        {/* Filters */}
        <ProductFilters
          searchTerm={searchTerm}
          categoryFilter={categoryFilter}
          statusFilter={statusFilter}
          productTypeTab={productTypeTab}
          onSearchChange={handleSearchChange}
          onCategoryChange={handleCategoryChange}
          onStatusChange={handleStatusChange}
        />

        {/* Product Table */}
        <ProductTable
          products={products}
          isLoading={isLoading}
          productTypeTab={productTypeTab}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          searchTerm={searchTerm}
          categoryFilter={categoryFilter}
          statusFilter={statusFilter}
          selection={selection}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onPageChange={setCurrentPage}
          onAdd={handleAdd}
          isTogglingStatus={activateMutation.isPending || deactivateMutation.isPending}
        />

        {/* Add Product Modal */}
        {showAddModal && (
          <ProductForm
            mode="add"
            formData={formData}
            formErrors={formErrors}
            isSaving={createMutation.isPending}
            suppliers={suppliers}
            onChange={handleFormChange}
            onSubmit={handleSaveNew}
            onCancel={() => {
              setShowAddModal(false)
              resetForm()
            }}
          />
        )}

        {/* Edit Product Modal */}
        {showEditModal && (
          <ProductForm
            mode="edit"
            formData={formData}
            formErrors={formErrors}
            isSaving={updateMutation.isPending}
            suppliers={suppliers}
            onChange={handleFormChange}
            onSubmit={handleSaveEdit}
            onCancel={() => {
              setShowEditModal(false)
              resetForm()
            }}
          />
        )}

        {/* View Product Modal */}
        {showViewModal && selectedProduct && (
          <ProductViewModal
            product={selectedProduct}
            warehouses={warehouses}
            binCardData={binCardData as BinCardData | null}
            binCardLoading={binCardLoading}
            binCardError={binCardError}
            selectedWarehouseId={selectedWarehouseId}
            onClose={() => {
              setShowViewModal(false)
              setSelectedProduct(null)
              setActiveViewTab('details')
              setSelectedWarehouseId(null)
            }}
            onEdit={handleEditFromView}
            onWarehouseChange={handleWarehouseChange}
          />
        )}

        {/* Delete Modals */}
        <ProductModals
          showDeleteModal={showDeleteModal}
          showBulkDeleteModal={showBulkDeleteModal}
          selectedProductName={selectedProduct?.name}
          selectedCount={selection.selectedCount}
          isDeleting={deleteMutation.isPending}
          isBulkDeleting={bulkDeleteMutation.isPending}
          onDeleteConfirm={confirmDelete}
          onBulkDeleteConfirm={confirmBulkDelete}
          onDeleteCancel={() => {
            setShowDeleteModal(false)
            setSelectedProduct(null)
          }}
          onBulkDeleteCancel={() => setShowBulkDeleteModal(false)}
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
