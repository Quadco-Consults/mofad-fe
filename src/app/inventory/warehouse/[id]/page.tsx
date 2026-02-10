'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import api from '@/lib/api-client'
import { Eye, CheckCircle, XCircle, Plus, Package, Warehouse, AlertTriangle, TrendingUp, TrendingDown, Loader2, AlertCircle as AlertCircleIcon, ArrowLeft, MapPin, Search, Filter, FileText, Calendar, User, ArrowUp, ArrowDown, Settings } from 'lucide-react'

interface InventoryItem {
  id: number
  product: {
    id: number
    name: string
    code: string
    category: string | null
    cost_price: number | null
    selling_price: number | null
  } | null
  warehouse: {
    id: number
    name: string
    location: string | null
  } | null
  current_stock: number
  reorder_level: number
  unit_cost: number | null
  total_value: number
  last_updated: string
  status: 'in-stock' | 'low-stock' | 'out-of-stock'
  supplier_name?: string
}

interface BinCardEntry {
  id: string
  date: string
  refNo: string
  description: string
  type: 'receipt' | 'issue' | 'adjustment'
  received: number
  issued: number
  balance: number
  unit: string
}

interface PendingReceipt {
  id: string
  proNumber: string
  supplierName: string
  productCode: string
  productName: string
  orderedQty: number
  receivedQty: number
  pendingQty: number
  unitPrice: number
  totalValue: number
  orderDate: string
  expectedDate: string
  status: 'pending' | 'partial' | 'overdue'
}

interface PendingIssue {
  id: string
  prfNumber: string
  department: string
  requestedBy: string
  productCode: string
  productName: string
  requestedQty: number
  issuedQty: number
  pendingQty: number
  unitPrice: number
  requestDate: string
  urgency: 'low' | 'medium' | 'high'
  status: 'pending' | 'partial' | 'approved'
}

// Mock data for pending receipts (fallback)
const mockPendingReceipts: PendingReceipt[] = [
  {
    id: 'PR001',
    proNumber: 'PRO-2024-001',
    supplierName: 'ExxonMobil Nigeria',
    productCode: 'MOB-5W30',
    productName: 'Mobil 1 Advanced 5W-30',
    orderedQty: 500,
    receivedQty: 300,
    pendingQty: 200,
    unitPrice: 15000,
    totalValue: 7500000,
    orderDate: '2024-01-15',
    expectedDate: '2024-01-25',
    status: 'partial'
  },
  {
    id: 'PR002',
    proNumber: 'PRO-2024-002',
    supplierName: 'Shell Nigeria',
    productCode: 'SHL-HX8',
    productName: 'Shell Helix Ultra 5W-40',
    orderedQty: 300,
    receivedQty: 0,
    pendingQty: 300,
    unitPrice: 18000,
    totalValue: 5400000,
    orderDate: '2024-01-18',
    expectedDate: '2024-01-24',
    status: 'overdue'
  },
  {
    id: 'PR003',
    proNumber: 'PRO-2024-003',
    supplierName: 'TotalEnergies Nigeria',
    productCode: 'TOT-GEAR',
    productName: 'Total Transmission Gear 8 75W-80',
    orderedQty: 150,
    receivedQty: 0,
    pendingQty: 150,
    unitPrice: 14500,
    totalValue: 2175000,
    orderDate: '2024-01-20',
    expectedDate: '2024-01-28',
    status: 'pending'
  }
]

// Mock data for pending issues from PRF
const mockPendingIssues: PendingIssue[] = [
  {
    id: 'PI001',
    prfNumber: 'PRF-2024-045',
    department: 'Lube Bay Operations',
    requestedBy: 'Ahmed Musa',
    productCode: 'MOB-15W40',
    productName: 'Mobil Super 15W-40',
    requestedQty: 100,
    issuedQty: 60,
    pendingQty: 40,
    unitPrice: 8500,
    requestDate: '2024-01-22',
    urgency: 'high',
    status: 'partial'
  },
  {
    id: 'PI002',
    prfNumber: 'PRF-2024-046',
    department: 'Station Operations',
    requestedBy: 'Fatima Ibrahim',
    productCode: 'SHL-HX7',
    productName: 'Shell Helix HX7 10W-30',
    requestedQty: 50,
    issuedQty: 0,
    pendingQty: 50,
    unitPrice: 12500,
    requestDate: '2024-01-23',
    urgency: 'medium',
    status: 'approved'
  },
  {
    id: 'PI003',
    prfNumber: 'PRF-2024-047',
    department: 'Maintenance',
    requestedBy: 'Kemi Adebayo',
    productCode: 'TOT-5000',
    productName: 'Total Quartz 5000 20W-50',
    requestedQty: 25,
    issuedQty: 0,
    pendingQty: 25,
    unitPrice: 9800,
    requestDate: '2024-01-23',
    urgency: 'low',
    status: 'pending'
  }
]

export default function WarehouseInventoryPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const warehouseId = Number(params?.id)

  console.log('Warehouse Page - warehouseId:', warehouseId, 'params:', params)

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'inventory' | 'receipts' | 'issues'>('inventory')
  const [selectedReceipt, setSelectedReceipt] = useState<PendingReceipt | null>(null)
  const [selectedIssue, setSelectedIssue] = useState<PendingIssue | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'out-of-stock'>('all')
  const [showReceiveGoodsModal, setShowReceiveGoodsModal] = useState(false)
  const [receiveQuantity, setReceiveQuantity] = useState<number>(0)
  const [showIssueGoodsModal, setShowIssueGoodsModal] = useState(false)
  const [issueQuantity, setIssueQuantity] = useState<number>(0)

  // Fetch warehouse details
  const { data: warehouseData, isLoading: warehouseLoading, error: warehouseError } = useQuery({
    queryKey: ['warehouse', warehouseId],
    queryFn: () => api.getWarehouseById(warehouseId),
    enabled: !!warehouseId
  })

  // Fetch all products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products-all'],
    queryFn: () => api.getProducts({ page: 1, size: 1000 }), // Fetch all products
  })

  // Fetch warehouse inventory
  const { data: inventoryResponse, isLoading: inventoryLoading, error: inventoryError } = useQuery({
    queryKey: ['warehouse-inventory', warehouseId],
    queryFn: async () => {
      console.log('Fetching inventory for warehouse:', warehouseId)
      try {
        const response = await api.getWarehouseInventory(warehouseId)
        console.log('Inventory API Response:', response)
        return response
      } catch (error) {
        console.error('Inventory API Error:', error)
        throw error
      }
    },
    enabled: !!warehouseId,
    retry: 1
  })

  // Fetch pending receipts - PROs that are approved and need to be received at this warehouse
  const { data: pendingReceipts = [], isLoading: receiptsLoading } = useQuery({
    queryKey: ['pending-receipts', warehouseId],
    queryFn: async () => {
      // Fetch PROs that are approved and assigned to this warehouse for delivery
      try {
        const response = await api.getPros({
          delivery_location: warehouseId,
          status: 'approved,sent,confirmed,partially_delivered',
          delivery_status: 'pending,partial',
          page_size: 100
        })
        console.log('Pending PROs for warehouse:', response)
        return response.results || []
      } catch (error) {
        console.error('Error fetching pending PROs:', error)
        return []
      }
    },
    enabled: !!warehouseId,
    staleTime: 2 * 60 * 1000 // 2 minutes
  })

  // Fetch pending issues - PRFs that need to pick items from this warehouse
  const { data: pendingIssues = [], isLoading: issuesLoading } = useQuery({
    queryKey: ['pending-issues', warehouseId],
    queryFn: async () => {
      // Fetch PRFs assigned to this warehouse that have approved payment
      try {
        const response = await api.getPrfs({
          delivery_location: warehouseId,
          status: 'approved,partially_fulfilled',
          page_size: 100
        })
        console.log('PRFs for warehouse with approved lodgements:', response)
        // Filter to show only PRFs with approved lodgements (payment made)
        const results = response.results || []
        return results.filter((prf: any) => {
          const totalLodged = Number(prf.total_lodged || 0)
          // Show if payment has been made (total_lodged > 0)
          return totalLodged > 0
        })
      } catch (error) {
        console.error('Error fetching pending PRFs:', error)
        return []
      }
    },
    enabled: !!warehouseId,
    staleTime: 2 * 60 * 1000 // 2 minutes
  })

  // Get all products and warehouse inventory
  const allProducts = productsData?.results || (Array.isArray(productsData) ? productsData : [])
  // Backend returns inventory in "inventory" field, not "results"
  const warehouseInventory = inventoryResponse?.inventory || inventoryResponse?.results || []

  // Transform backend data to match frontend expectations
  // The serializer already provides product_name and product_code, so we use those directly
  const allInventoryItems: InventoryItem[] = warehouseInventory.map((item: any) => {
    // Try to get full product data for additional fields like category and pricing
    const fullProduct = allProducts.find((p: any) => p.id === item.product)

    return {
      id: item.id,
      product: {
        id: item.product,
        // Always use the serializer data for name and code (it's more reliable)
        name: item.product_name || 'Unknown Product',
        code: item.product_code || `ID-${item.id}`,
        description: item.product_description || fullProduct?.description || '',
        // Use fullProduct for additional fields if available
        category: fullProduct?.category || null,
        cost_price: fullProduct?.cost_price || parseFloat(item.average_cost || 0),
        selling_price: fullProduct?.selling_price || 0,
      },
      warehouse: warehouseData ? {
        id: warehouseData.id,
        name: warehouseData.name,
        location: warehouseData.location,
      } : null,
      current_stock: parseFloat(item.quantity_on_hand || 0),
      reorder_level: parseFloat(item.reorder_point || item.minimum_level || 0),
      unit_cost: parseFloat(item.average_cost || 0),
      total_value: parseFloat(item.total_cost_value || 0),
      last_updated: item.updated_at,
      status: parseFloat(item.quantity_on_hand || 0) === 0 ? 'out-of-stock' as const :
              parseFloat(item.quantity_on_hand || 0) <= parseFloat(item.reorder_point || item.minimum_level || 0) ? 'low-stock' as const :
              'in-stock' as const,
      supplier_name: fullProduct?.primary_supplier,
    }
  })

  // Apply filters
  const inventoryItems = allInventoryItems.filter((item) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        item.product?.name?.toLowerCase().includes(searchLower) ||
        item.product?.code?.toLowerCase().includes(searchLower) ||
        item.product?.category?.toLowerCase().includes(searchLower)

      if (!matchesSearch) return false
    }

    // Stock filter
    if (stockFilter === 'in-stock' && item.current_stock === 0) return false
    if (stockFilter === 'out-of-stock' && item.current_stock > 0) return false

    return true
  })

  const handleSuccess = () => {
    if (selectedItem) {
      // Logic for approving stock adjustment
      setShowSuccessModal(false)
      setSelectedItem(null)
    }
  }

  const handleDecline = () => {
    if (selectedItem) {
      // Logic for declining stock adjustment
      setShowDeclineModal(false)
      setSelectedItem(null)
    }
  }

  const viewDetails = (item: InventoryItem) => {
    if (item.product?.id) {
      router.push(`/inventory/warehouse/${warehouseId}/product/${item.product.id}`)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in-stock':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">In Stock</span>
      case 'low-stock':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Low Stock</span>
      case 'out-of-stock':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Out of Stock</span>
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'petroleum':
        return 'bg-blue-100 text-blue-800'
      case 'lubricants':
        return 'bg-green-100 text-green-800'
      case 'additives':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStockLevelIndicator = (currentStock: number, reorderLevel: number) => {
    const percentage = (currentStock / reorderLevel) * 100
    if (percentage > 150) {
      return <TrendingUp className="w-4 h-4 text-green-600" />
    } else if (percentage > 100) {
      return <TrendingUp className="w-4 h-4 text-yellow-600" />
    } else {
      return <TrendingDown className="w-4 h-4 text-red-600" />
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            {/* Back Button */}
            <button
              onClick={() => router.push('/inventory/warehouse')}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Warehouses
            </button>

            <h1 className="text-2xl font-bold text-gray-900">
              {warehouseData ? warehouseData.name : 'Warehouse Management'}
            </h1>
            <p className="text-gray-600">Manage inventory, process receipts from PRO and handle issues from PRF</p>

            {/* Warehouse Details */}
            {warehouseData && (
              <div className="mt-2 flex items-center space-x-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Warehouse className="w-4 h-4 mr-1" />
                  <span>Code: {warehouseData.code || warehouseId}</span>
                </div>
                {warehouseData.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{warehouseData.location}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          {activeTab === 'inventory' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        {!warehouseError && warehouseData && (
          <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('inventory')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'inventory'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Current Inventory
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === 'inventory' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {inventoryLoading ? '...' : inventoryItems.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('receipts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'receipts'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending Receipts (PRO)
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === 'receipts' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {receiptsLoading ? '...' : pendingReceipts.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('issues')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'issues'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending Issues (PRF)
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === 'issues' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {issuesLoading ? '...' : pendingIssues.length}
                </span>
              </button>
            </nav>
          </div>
        </div>
        )}

        {/* Warehouse Error State */}
        {warehouseError && !warehouseLoading && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <AlertCircleIcon className="h-8 w-8 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Warehouse Not Found</h3>
            <p className="text-gray-600 mb-4">The warehouse you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
            <button
              onClick={() => router.push('/inventory/warehouse')}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Back to Warehouses
            </button>
          </div>
        )}

        {/* Tab Content */}
        {!warehouseError && activeTab === 'inventory' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            {!warehouseLoading && !warehouseError && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by product name, code, or category..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={stockFilter}
                      onChange={(e) => setStockFilter(e.target.value as any)}
                    >
                      <option value="all">All Products</option>
                      <option value="in-stock">In Stock Only</option>
                      <option value="out-of-stock">Out of Stock</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Loading state */}
            {(inventoryLoading || warehouseLoading || productsLoading) && (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500 mb-4" />
                  <p className="text-gray-600">Loading warehouse inventory...</p>
                </div>
              </div>
            )}

            {/* Error state */}
            {inventoryError && !inventoryLoading && (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <AlertCircleIcon className="h-8 w-8 mx-auto text-red-500 mb-4" />
                  <p className="text-gray-600">Error loading inventory data. Please try again.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {inventoryError instanceof Error ? inventoryError.message : String(inventoryError)}
                  </p>
                </div>
              </div>
            )}

            {/* Summary Cards */}
            {!inventoryLoading && !warehouseLoading && !productsLoading && !inventoryError && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Products</p>
                        <p className="text-2xl font-bold text-gray-900">{allInventoryItems.length}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {allInventoryItems.filter(item => item.current_stock > 0).length} in stock
                        </p>
                      </div>
                      <Package className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Value</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ₦{allInventoryItems.reduce((sum, item) => sum + (item.total_value || 0), 0).toLocaleString()}
                        </p>
                      </div>
                      <Warehouse className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {allInventoryItems.filter(item => item.status === 'low-stock').length}
                        </p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-yellow-600" />
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {allInventoryItems.filter(item => item.status === 'out-of-stock').length}
                        </p>
                      </div>
                      <XCircle className="h-8 w-8 text-red-600" />
                    </div>
                  </div>
                </div>
              </>
            )}

        {/* Main Table */}
        {!inventoryLoading && !warehouseLoading && !productsLoading && !inventoryError && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-orange-500 to-amber-500">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Product Code</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Product Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Size</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Location</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-white">Current Stock</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-white">Unit Price</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-white">Total Value</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-white">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inventoryItems.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      No inventory items found for this warehouse.
                    </td>
                  </tr>
                ) : (
                  inventoryItems.map((item, index) => (
                    <tr
                      key={`${item.product?.id}-${item.id}`}
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${item.current_stock === 0 ? 'opacity-60' : ''}`}
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {item.product?.code || `ID-${item.id}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        <div className="flex items-center gap-2">
                          <div>
                            {item.product?.code && (
                              <div className="text-xs text-gray-500 font-normal">{item.product.code}</div>
                            )}
                            <div>{item.product?.name || 'Unknown Product'}</div>
                          </div>
                          {item.current_stock === 0 && (
                            <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">
                              Not in warehouse
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                        {item.product?.description || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.product?.category || '')}`}>
                          <Package className="w-3 h-3 mr-1" />
                          {item.product?.category || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.warehouse?.location || item.warehouse?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <span>{item.current_stock?.toLocaleString() || '0'}</span>
                          {getStockLevelIndicator(item.current_stock || 0, item.reorder_level || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                        ₦{(item.unit_cost || item.product?.cost_price || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                        ₦{(item.total_value || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => viewDetails(item)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {item.status === 'low-stock' && (
                            <>
                              <button
                                onClick={() => { setSelectedItem(item); setShowSuccessModal(true) }}
                                className="text-green-600 hover:text-green-800 p-1"
                                title="Approve Restock"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => { setSelectedItem(item); setShowDeclineModal(true) }}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Mark as Reviewed"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
          </div>
        )}

        {/* Pending Receipts Tab */}
        {activeTab === 'receipts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Pending Receipts from PRO</h3>
                <p className="text-sm text-gray-600 mt-1">Products waiting to be received into warehouse</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PRO Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty (Ordered/Received/Pending)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingReceipts.map((receipt, index) => (
                      <tr key={receipt.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{receipt.proNumber}</td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{receipt.productName}</div>
                            <div className="text-sm text-gray-500">{receipt.productCode}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{receipt.supplierName}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="text-gray-900">Ordered: {(receipt.orderedQty || 0).toLocaleString()}</div>
                            <div className="text-green-600">Received: {(receipt.receivedQty || 0).toLocaleString()}</div>
                            <div className="text-orange-600 font-medium">Pending: {(receipt.pendingQty || 0).toLocaleString()}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{receipt.expectedDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            receipt.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            receipt.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {receipt.status.charAt(0).toUpperCase() + receipt.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1 rounded text-xs hover:from-orange-600 hover:to-amber-600"
                            onClick={() => {
                              setSelectedReceipt(receipt)
                              setReceiveQuantity(receipt.pendingQty)
                              setShowReceiveGoodsModal(true)
                            }}
                          >
                            Receive Goods
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Pending Issues Tab */}
        {activeTab === 'issues' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Pending Issues from PRF</h3>
                <p className="text-sm text-gray-600 mt-1">Products requested for issue to departments</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PRF Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty (Requested/Issued/Pending)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingIssues.map((issue, index) => (
                      <tr key={issue.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{issue.prfNumber}</td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{issue.productName}</div>
                            <div className="text-sm text-gray-500">{issue.productCode}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{issue.department}</div>
                            <div className="text-sm text-gray-500">Requested by: {issue.requestedBy}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="text-gray-900">Requested: {(issue.requestedQty || 0).toLocaleString()}</div>
                            <div className="text-green-600">Issued: {(issue.issuedQty || 0).toLocaleString()}</div>
                            <div className="text-orange-600 font-medium">Pending: {(issue.pendingQty || 0).toLocaleString()}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            issue.urgency === 'high' ? 'bg-red-100 text-red-800' :
                            issue.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {issue.urgency.charAt(0).toUpperCase() + issue.urgency.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            issue.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            issue.status === 'partial' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1 rounded text-xs hover:from-orange-600 hover:to-amber-600"
                            onClick={() => {
                              setSelectedIssue(issue)
                              setIssueQuantity(issue.pendingQty)
                              setShowIssueGoodsModal(true)
                            }}
                          >
                            Issue Goods
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="text-center">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Approve Restock</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to approve restocking for this item?
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSuccess}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Approve Restock
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Decline Modal */}
        {showDeclineModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="text-center">
                <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Mark as Reviewed</h3>
                <p className="text-gray-600 mb-6">
                  Mark this low stock item as reviewed?
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowDeclineModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDecline}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Mark Reviewed
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Issue Goods Modal */}
        {showIssueGoodsModal && selectedIssue && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-semibold text-gray-900">Issue Goods - {selectedIssue.prfNumber}</h3>
                <button
                  onClick={() => {
                    setShowIssueGoodsModal(false)
                    setSelectedIssue(null)
                    setIssueQuantity(0)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Request Details Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Request Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">PRF Number</p>
                      <p className="font-medium text-gray-900">{selectedIssue.prfNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Department</p>
                      <p className="font-medium text-gray-900">{selectedIssue.department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Requested By</p>
                      <p className="font-medium text-gray-900">{selectedIssue.requestedBy}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Request Date</p>
                      <p className="font-medium text-gray-900">{selectedIssue.requestDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Product Code</p>
                      <p className="font-medium text-gray-900">{selectedIssue.productCode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Product Name</p>
                      <p className="font-medium text-gray-900">{selectedIssue.productName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Urgency</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        selectedIssue.urgency === 'high' ? 'bg-red-100 text-red-800' :
                        selectedIssue.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {selectedIssue.urgency.charAt(0).toUpperCase() + selectedIssue.urgency.slice(1)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        selectedIssue.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        selectedIssue.status === 'partial' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {selectedIssue.status.charAt(0).toUpperCase() + selectedIssue.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quantity Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium">Requested Quantity</p>
                    <p className="text-2xl font-bold text-blue-600">{(selectedIssue.requestedQty || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">Already Issued</p>
                    <p className="text-2xl font-bold text-green-600">{(selectedIssue.issuedQty || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-sm text-orange-800 font-medium">Pending</p>
                    <p className="text-2xl font-bold text-orange-600">{(selectedIssue.pendingQty || 0).toLocaleString()}</p>
                  </div>
                </div>

                {/* Issue Quantity Form */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Record Issued Quantity</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity Issuing Now <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
                        value={issueQuantity}
                        onChange={(e) => setIssueQuantity(Number(e.target.value))}
                        min="0"
                        max={selectedIssue.pendingQty}
                        placeholder="Enter quantity to issue"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Maximum: {(selectedIssue.pendingQty || 0).toLocaleString()} units
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                        value={`₦${(selectedIssue.unitPrice || 0).toLocaleString()}`}
                        disabled
                      />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Total Value of This Issue:</span>
                        <span className="text-2xl font-bold text-gray-900">
                          ₦{(issueQuantity * (selectedIssue.unitPrice || 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Issue Date</label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        defaultValue={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Issued To (Name)</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        defaultValue={selectedIssue.requestedBy}
                        placeholder="Name of person receiving the goods"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID / Signature (Optional)</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Employee ID or digital signature"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Purpose / Notes</label>
                      <textarea
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        rows={3}
                        placeholder="Purpose of issue or additional notes"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                <button
                  onClick={() => {
                    setShowIssueGoodsModal(false)
                    setSelectedIssue(null)
                    setIssueQuantity(0)
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement issue goods logic
                    console.log('Issuing goods:', {
                      issue: selectedIssue,
                      quantity: issueQuantity
                    })
                    setShowIssueGoodsModal(false)
                    setSelectedIssue(null)
                    setIssueQuantity(0)
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={issueQuantity <= 0 || issueQuantity > selectedIssue.pendingQty}
                >
                  Confirm Issue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Receive Goods Modal */}
        {showReceiveGoodsModal && selectedReceipt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-semibold text-gray-900">Receive Goods - {selectedReceipt.proNumber}</h3>
                <button
                  onClick={() => {
                    setShowReceiveGoodsModal(false)
                    setSelectedReceipt(null)
                    setReceiveQuantity(0)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Order Details Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Order Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">PRO Number</p>
                      <p className="font-medium text-gray-900">{selectedReceipt.proNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Supplier</p>
                      <p className="font-medium text-gray-900">{selectedReceipt.supplierName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Product Code</p>
                      <p className="font-medium text-gray-900">{selectedReceipt.productCode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Product Name</p>
                      <p className="font-medium text-gray-900">{selectedReceipt.productName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Order Date</p>
                      <p className="font-medium text-gray-900">{selectedReceipt.orderDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Expected Date</p>
                      <p className="font-medium text-gray-900">{selectedReceipt.expectedDate}</p>
                    </div>
                  </div>
                </div>

                {/* Quantity Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium">Ordered Quantity</p>
                    <p className="text-2xl font-bold text-blue-600">{(selectedReceipt.orderedQty || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">Already Received</p>
                    <p className="text-2xl font-bold text-green-600">{(selectedReceipt.receivedQty || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-sm text-orange-800 font-medium">Pending</p>
                    <p className="text-2xl font-bold text-orange-600">{(selectedReceipt.pendingQty || 0).toLocaleString()}</p>
                  </div>
                </div>

                {/* Receive Quantity Form */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Record Received Quantity</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity Receiving Now <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
                        value={receiveQuantity}
                        onChange={(e) => setReceiveQuantity(Number(e.target.value))}
                        min="0"
                        max={selectedReceipt.pendingQty}
                        placeholder="Enter quantity received"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Maximum: {(selectedReceipt.pendingQty || 0).toLocaleString()} units
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                        value={`₦${(selectedReceipt.unitPrice || 0).toLocaleString()}`}
                        disabled
                      />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Total Value of This Receipt:</span>
                        <span className="text-2xl font-bold text-gray-900">
                          ₦{(receiveQuantity * (selectedReceipt.unitPrice || 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Batch Number (Optional)</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter batch number if applicable"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Date</label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        defaultValue={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                      <textarea
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        rows={3}
                        placeholder="Add any notes about this receipt (condition, quality, etc.)"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                <button
                  onClick={() => {
                    setShowReceiveGoodsModal(false)
                    setSelectedReceipt(null)
                    setReceiveQuantity(0)
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement receive goods logic
                    console.log('Receiving goods:', {
                      receipt: selectedReceipt,
                      quantity: receiveQuantity
                    })
                    setShowReceiveGoodsModal(false)
                    setSelectedReceipt(null)
                    setReceiveQuantity(0)
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={receiveQuantity <= 0 || receiveQuantity > selectedReceipt.pendingQty}
                >
                  Confirm Receipt
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Add New Product</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Code</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <option value="">Select Category</option>
                      <option value="Petroleum">Petroleum</option>
                      <option value="Lubricants">Lubricants</option>
                      <option value="Additives">Additives</option>
                      <option value="Equipment">Equipment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse Location</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (₦)</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600"
                  >
                    Add Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}