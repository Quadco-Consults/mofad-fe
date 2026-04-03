'use client'

import { useState, Fragment } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import api from '@/lib/apiClient'
import { Eye, CheckCircle, XCircle, Plus, Package, Warehouse, AlertTriangle, TrendingUp, TrendingDown, Loader2, AlertCircle as AlertCircleIcon, ArrowLeft, MapPin, Search, Filter, FileText, Calendar, User, ArrowUp, ArrowDown, Settings, Upload, ChevronDown, ChevronRight } from 'lucide-react'

interface InventoryItem {
  id: number
  product: {
    id: number
    name: string
    code: string
    category: string | null
    description?: string | null
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
  proId: number
  productId: number
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


// Mock data for pending receipts (fallback)
const mockPendingReceipts: PendingReceipt[] = [
  {
    id: 'PR001',
    proId: 1,
    productId: 1,
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
    proId: 2,
    productId: 2,
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
    proId: 3,
    productId: 3,
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
  const [activeTab, setActiveTab] = useState<'inventory' | 'receipts' | 'pending_issues' | 'grn_history' | 'inbound_transfers'>('inventory')
  const [selectedReceipt, setSelectedReceipt] = useState<PendingReceipt | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'out-of-stock'>('all')
  const [showReceiveGoodsModal, setShowReceiveGoodsModal] = useState(false)
  const [receiveQuantity, setReceiveQuantity] = useState<number>(0)
  const [batchNumber, setBatchNumber] = useState('')
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0])
  const [receiveNotes, setReceiveNotes] = useState('')
  const [isReceiving, setIsReceiving] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResults, setUploadResults] = useState<any>(null)
  const [expandedGRNs, setExpandedGRNs] = useState<Set<number>>(new Set())
  const [showReceiveTransferModal, setShowReceiveTransferModal] = useState(false)
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null)
  const [transferReceiveItems, setTransferReceiveItems] = useState<any[]>([])
  const [isReceivingTransfer, setIsReceivingTransfer] = useState(false)

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
  const { data: pendingReceipts = [], isLoading: receiptsLoading, refetch } = useQuery({
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

        // Transform PRO items to PendingReceipt format
        const pendingReceipts: PendingReceipt[] = []

        const pros = response.results || []
        pros.forEach((pro: any) => {
          // Each PRO can have multiple items - create a receipt entry for each item
          const items = pro.items || []
          items.forEach((item: any) => {
            const orderedQty = Number(item.quantity || 0)
            const receivedQty = Number(item.quantity_delivered || 0)
            const pendingQty = Number(item.quantity_remaining || orderedQty - receivedQty)

            if (pendingQty > 0) { // Only show items with pending quantity
              pendingReceipts.push({
                id: `${pro.id}-${item.id}`,
                proId: pro.id,
                productId: item.product,
                proNumber: pro.pro_number,
                supplierName: pro.supplier || 'Unknown Supplier',
                productCode: item.product_code,
                productName: item.product_name,
                orderedQty,
                receivedQty,
                pendingQty,
                unitPrice: Number(item.unit_price || 0),
                totalValue: pendingQty * Number(item.unit_price || 0),
                orderDate: pro.created_at ? new Date(pro.created_at).toLocaleDateString() : 'N/A',
                expectedDate: pro.expected_delivery_date || 'N/A',
                status: pendingQty === orderedQty ? 'pending' : 'partial'
              })
            }
          })
        })

        console.log('Transformed pending receipts:', pendingReceipts)
        return pendingReceipts
      } catch (error) {
        console.error('Error fetching pending PROs:', error)
        return []
      }
    },
    enabled: !!warehouseId,
    staleTime: 2 * 60 * 1000 // 2 minutes
  })

  // Fetch GRN history for this warehouse
  const { data: grnHistory = [], isLoading: grnsLoading } = useQuery({
    queryKey: ['grns-by-warehouse', warehouseId],
    queryFn: async () => {
      try {
        const response = await api.getGRNsByWarehouse(warehouseId, '-created_at')
        console.log('GRNs for warehouse:', response)
        return response.results || response || []
      } catch (error) {
        console.error('Error fetching GRNs:', error)
        return []
      }
    },
    enabled: !!warehouseId && activeTab === 'grn_history',
    staleTime: 2 * 60 * 1000 // 2 minutes
  })

  // Fetch inbound stock transfers (transfers coming TO this warehouse)
  const { data: inboundTransfers = [], isLoading: transfersLoading } = useQuery({
    queryKey: ['inbound-transfers', warehouseId],
    queryFn: async () => {
      try {
        const response = await api.getStockTransfers({
          to_warehouse: warehouseId,
          status: 'in_transit',
          page_size: 100
        })
        console.log('Inbound transfers query params:', { to_warehouse: warehouseId, status: 'in_transit' })
        console.log('Inbound transfers response:', response)
        return response.results || response || []
      } catch (error) {
        console.error('Error fetching inbound transfers:', error)
        return []
      }
    },
    enabled: !!warehouseId && activeTab === 'inbound_transfers',
    staleTime: 30 * 1000,
    refetchInterval: 30000
  })

  // Fetch PRFs ready for issue at this warehouse
  const { data: pendingIssues = [], isLoading: issuesLoading } = useQuery({
    queryKey: ['prfs-ready-for-issue', warehouseId],
    queryFn: async () => {
      try {
        const response = await api.getPrfs({
          status: 'ready_for_issue',
          delivery_location: warehouseId,
          page_size: 100
        })
        console.log('PRFs ready for issue at warehouse:', response)
        return response.results || response || []
      } catch (error) {
        console.error('Error fetching PRFs ready for issue:', error)
        return []
      }
    },
    enabled: !!warehouseId && activeTab === 'pending_issues',
    staleTime: 30 * 1000, // 30 seconds - refresh more frequently for active operations
    refetchInterval: 30000 // Auto-refresh every 30 seconds
  })

  // Get all products and warehouse inventory
  const allProducts = productsData?.results || (Array.isArray(productsData) ? productsData : [])
  // Backend returns inventory in "inventory" field, not "results"
  const warehouseInventory = inventoryResponse?.inventory || []

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
            <div className="flex gap-2">
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Stock
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </button>
            </div>
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
                onClick={() => setActiveTab('pending_issues')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pending_issues'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending Issues (PRF)
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === 'pending_issues' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {issuesLoading ? '...' : pendingIssues.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('grn_history')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'grn_history'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                GRN History
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === 'grn_history' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {grnsLoading ? '...' : grnHistory.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('inbound_transfers')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'inbound_transfers'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Inbound Transfers
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === 'inbound_transfers' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {transfersLoading ? '...' : inboundTransfers.length}
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

        {/* GRN History Tab */}
        {activeTab === 'grn_history' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Goods Receipt Notes (GRN) History</h3>
                <p className="text-sm text-gray-600 mt-1">All batch deliveries received at this warehouse</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GRN Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PRO Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty (Received/Accepted/Rejected)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QC Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {grnsLoading ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-8 text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-orange-500 mb-2" />
                          <p className="text-gray-600">Loading GRN history...</p>
                        </td>
                      </tr>
                    ) : grnHistory.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                          No GRN history found for this warehouse.
                        </td>
                      </tr>
                    ) : (
                      grnHistory.map((grn: any, index: number) => {
                        const isExpanded = expandedGRNs.has(grn.id)
                        return (
                          <Fragment key={grn.id}>
                            <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                <button
                                  onClick={() => {
                                    const newExpanded = new Set(expandedGRNs)
                                    if (isExpanded) {
                                      newExpanded.delete(grn.id)
                                    } else {
                                      newExpanded.add(grn.id)
                                    }
                                    setExpandedGRNs(newExpanded)
                                  }}
                                  className="flex items-center gap-2 hover:text-orange-600"
                                >
                                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                  {grn.grn_number}
                                </button>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{grn.pro_number}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{grn.supplier_name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(grn.received_date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm">
                                  <div className="text-gray-900">Received: {grn.total_quantity_received?.toLocaleString() || 0}</div>
                                  <div className="text-green-600">Accepted: {grn.total_quantity_accepted?.toLocaleString() || 0}</div>
                                  <div className="text-red-600">Rejected: {grn.total_quantity_rejected?.toLocaleString() || 0}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ₦{grn.total_value?.toLocaleString() || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  grn.qc_status === 'passed' ? 'bg-green-100 text-green-800' :
                                  grn.qc_status === 'failed' ? 'bg-red-100 text-red-800' :
                                  grn.qc_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                  grn.qc_status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {grn.qc_status === 'in_progress' ? 'In Progress' :
                                   grn.qc_status?.charAt(0).toUpperCase() + grn.qc_status?.slice(1) || 'Pending'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  grn.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  grn.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                  grn.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  grn.status === 'under_inspection' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {grn.status === 'under_inspection' ? 'Under Inspection' :
                                   grn.status?.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Draft'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <button
                                  className="text-orange-600 hover:text-orange-800 font-medium"
                                  onClick={() => router.push(`/inventory/grn/${grn.id}`)}
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                            {isExpanded && grn.items && grn.items.length > 0 && (
                              <tr className="bg-blue-50">
                                <td colSpan={9} className="px-6 py-4">
                                  <div className="ml-8">
                                    <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                      <Package className="w-4 h-4" />
                                      Items Received ({grn.items.length})
                                    </h5>
                                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                      <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                          <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty Received</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty Accepted</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty Rejected</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total Value</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Batch No</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Expiry Date</th>
                                          </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                          {grn.items.map((item: any, itemIndex: number) => (
                                            <tr key={item.id || itemIndex} className="hover:bg-gray-50">
                                              <td className="px-4 py-3 text-sm">
                                                <div className="font-medium text-gray-900">{item.product_name || 'Unknown Product'}</div>
                                                <div className="text-xs text-gray-500">{item.product_code || 'N/A'}</div>
                                              </td>
                                              <td className="px-4 py-3 text-sm text-right text-gray-900">
                                                {item.quantity_received?.toLocaleString() || 0}
                                              </td>
                                              <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">
                                                {item.quantity_accepted?.toLocaleString() || 0}
                                              </td>
                                              <td className="px-4 py-3 text-sm text-right text-red-600 font-medium">
                                                {item.quantity_rejected?.toLocaleString() || 0}
                                              </td>
                                              <td className="px-4 py-3 text-sm text-right text-gray-900">
                                                ₦{item.unit_price?.toLocaleString() || 0}
                                              </td>
                                              <td className="px-4 py-3 text-sm text-right text-gray-900 font-medium">
                                                ₦{((item.quantity_accepted || 0) * (item.unit_price || 0)).toLocaleString()}
                                              </td>
                                              <td className="px-4 py-3 text-sm text-gray-700">
                                                {item.batch_number || '-'}
                                              </td>
                                              <td className="px-4 py-3 text-sm text-gray-700">
                                                {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : '-'}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Pending Issues (PRF) Tab */}
        {activeTab === 'pending_issues' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Pending Goods Issues (PRF)</h3>
                  <p className="text-sm text-gray-600 mt-1">Orders ready to be issued from this warehouse</p>
                </div>
                <button
                  onClick={() => router.push('/inventory/warehouse/goods-issue')}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Package className="w-4 h-4" />
                  View All Warehouses
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PRF Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estimated Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {issuesLoading ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-orange-500 mb-2" />
                          <p className="text-gray-600">Loading pending issues...</p>
                        </td>
                      </tr>
                    ) : pendingIssues.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                          No pending goods issues for this warehouse.
                        </td>
                      </tr>
                    ) : (
                      pendingIssues.map((prf: any, index: number) => (
                        <tr key={prf.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{prf.prf_number}</div>
                            <div className="text-sm text-gray-500">{prf.title || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {prf.customer_name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {prf.total_items || 0} items
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              prf.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                              prf.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              prf.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {prf.priority?.charAt(0).toUpperCase() + prf.priority?.slice(1) || 'Normal'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₦{prf.estimated_total?.toLocaleString() || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-xs text-green-600 font-medium">Confirmed</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(prf.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 font-medium"
                              onClick={() => router.push(`/orders/prf/${prf.id}`)}
                            >
                              Issue Goods
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
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
                    setBatchNumber('')
                    setReceiveNotes('')
                    setReceiptDate(new Date().toISOString().split('T')[0])
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
                        value={batchNumber}
                        onChange={(e) => setBatchNumber(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Date</label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={receiptDate}
                        onChange={(e) => setReceiptDate(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                      <textarea
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        rows={3}
                        placeholder="Add any notes about this receipt (condition, quality, etc.)"
                        value={receiveNotes}
                        onChange={(e) => setReceiveNotes(e.target.value)}
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
                    setBatchNumber('')
                    setReceiveNotes('')
                    setReceiptDate(new Date().toISOString().split('T')[0])
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={isReceiving}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!selectedReceipt) return

                    setIsReceiving(true)
                    try {
                      // Call the API to receive goods
                      await api.receivePro(selectedReceipt.proId, {
                        items: [{
                          product_id: selectedReceipt.productId,
                          quantity_received: receiveQuantity
                        }],
                        notes: receiveNotes || `Received ${receiveQuantity} units${batchNumber ? `, Batch: ${batchNumber}` : ''}`
                      })

                      // Show success message
                      alert(`Successfully received ${receiveQuantity} units of ${selectedReceipt.productName}!`)

                      // Refresh the pending receipts list
                      refetch()

                      // Close modal and reset state
                      setShowReceiveGoodsModal(false)
                      setSelectedReceipt(null)
                      setReceiveQuantity(0)
                      setBatchNumber('')
                      setReceiveNotes('')
                    } catch (error: any) {
                      console.error('Error receiving goods:', error)
                      alert(`Failed to receive goods: ${error.message || 'Unknown error'}`)
                    } finally {
                      setIsReceiving(false)
                    }
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isReceiving || receiveQuantity <= 0 || receiveQuantity > selectedReceipt.pendingQty}
                >
                  {isReceiving ? 'Processing...' : 'Confirm Receipt'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Stock Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Upload Opening Stock</h3>
                  <p className="text-sm text-gray-500 mt-1">Upload CSV file to initialize warehouse inventory</p>
                </div>
                <button
                  onClick={() => {
                    setShowUploadModal(false)
                    setUploadFile(null)
                    setUploadResults(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {!uploadResults ? (
                <div className="space-y-4">
                  {/* Download Template Button */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-green-900 mb-1 flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Need a Template?
                        </h4>
                        <p className="text-sm text-green-800">
                          Download a pre-populated template with all products for this warehouse
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            // Get auth token from localStorage (where it's stored after login)
                            const token = localStorage.getItem('auth_token')

                            if (!token) {
                              alert('Please log in to download the template')
                              return
                            }

                            const response = await fetch(`http://localhost:8000/api/v1/warehouse-inventory/generate-template/?warehouse_id=${warehouseId}`, {
                              method: 'GET',
                              headers: {
                                'Authorization': `Bearer ${token}`,
                              }
                            })

                            if (!response.ok) {
                              try {
                                const errorData = await response.json()
                                console.error('Template generation error:', errorData)
                                throw new Error(errorData.message || 'Failed to generate template')
                              } catch (jsonError) {
                                throw new Error(`Server error: ${response.status}`)
                              }
                            }

                            const blob = await response.blob()
                            const url = window.URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = `warehouse_${warehouseId}_template.csv`
                            document.body.appendChild(a)
                            a.click()
                            window.URL.revokeObjectURL(url)
                            document.body.removeChild(a)
                          } catch (error: any) {
                            console.error('Error downloading template:', error)
                            alert(`Failed to download template: ${error.message}`)
                          }
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 flex items-center gap-2 font-medium shadow-md"
                      >
                        <Upload className="h-4 w-4" />
                        Download Template
                      </button>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      CSV Format Required
                    </h4>
                    <p className="text-sm text-blue-800 mb-2">Your CSV file must have these columns:</p>
                    <code className="text-xs bg-white px-2 py-1 rounded block overflow-x-auto">
                      warehouse_id,product_code,product_name,category,package_sizes,unit_of_measure,quantity_on_hand,average_cost,bin_location,zone,notes
                    </code>
                    <div className="mt-3 text-sm text-blue-800">
                      <p className="font-medium mb-1">Note: Download the template to get pre-populated product information!</p>
                      <p className="text-xs mt-1">Package sizes help you know which unit to count (e.g., &quot;1, 4, 5, 25, 208&quot; liters)</p>
                    </div>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select CSV File
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setUploadFile(file)
                          }
                        }}
                        className="hidden"
                        id="csv-upload"
                      />
                      <label
                        htmlFor="csv-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <Upload className="h-12 w-12 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          {uploadFile ? uploadFile.name : 'Click to select CSV file'}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          or drag and drop
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUploadModal(false)
                        setUploadFile(null)
                        setUploadResults(null)
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      disabled={isUploading}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!uploadFile) {
                          alert('Please select a CSV file')
                          return
                        }

                        setIsUploading(true)
                        try {
                          // Get auth token from localStorage
                          const token = localStorage.getItem('auth_token')

                          if (!token) {
                            alert('Please log in to upload stock')
                            setIsUploading(false)
                            return
                          }

                          const formData = new FormData()
                          formData.append('file', uploadFile)
                          formData.append('warehouse_id', warehouseId.toString())

                          const response = await fetch('http://localhost:8000/api/v1/warehouse-inventory/upload-stock/', {
                            method: 'POST',
                            body: formData,
                            headers: {
                              'Authorization': `Bearer ${token}`,
                            },
                          })

                          const result = await response.json()

                          if (response.ok) {
                            setUploadResults(result)
                            // Refresh inventory
                            queryClient.invalidateQueries({ queryKey: ['warehouse-inventory', warehouseId] })
                          } else {
                            alert(`Upload failed: ${result.error || 'Unknown error'}`)
                          }
                        } catch (error: any) {
                          console.error('Upload error:', error)
                          alert(`Upload failed: ${error.message || 'Unknown error'}`)
                        } finally {
                          setIsUploading(false)
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      disabled={!uploadFile || isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Upload Stock
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Results Summary */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-800 font-medium">Created</p>
                      <p className="text-2xl font-bold text-green-600">{uploadResults.created || 0}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium">Updated</p>
                      <p className="text-2xl font-bold text-blue-600">{uploadResults.updated || 0}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm text-red-800 font-medium">Errors</p>
                      <p className="text-2xl font-bold text-red-600">{uploadResults.errors?.length || 0}</p>
                    </div>
                  </div>

                  {/* Error List */}
                  {uploadResults.errors && uploadResults.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                      <h4 className="font-semibold text-red-900 mb-2">Errors:</h4>
                      <ul className="text-sm text-red-800 space-y-1">
                        {uploadResults.errors.map((error: string, index: number) => (
                          <li key={index} className="list-disc list-inside">
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Success Message */}
                  {uploadResults.created > 0 || uploadResults.updated > 0 ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-900">
                        <CheckCircle className="h-5 w-5" />
                        <p className="font-semibold">
                          Successfully processed {(uploadResults.created || 0) + (uploadResults.updated || 0)} items!
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {/* Close Button */}
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => {
                        setShowUploadModal(false)
                        setUploadFile(null)
                        setUploadResults(null)
                      }}
                      className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Inbound Transfers Tab */}
        {activeTab === 'inbound_transfers' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Inbound Stock Transfers</h3>
                <p className="text-sm text-gray-600 mt-1">Products being transferred to this warehouse from other MOFAD locations</p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transfer #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From Warehouse</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipped Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transfersLoading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-orange-500 mb-2" />
                          <p className="text-gray-600">Loading inbound transfers...</p>
                        </td>
                      </tr>
                    ) : inboundTransfers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                          No inbound transfers found. All shipments have been received.
                        </td>
                      </tr>
                    ) : (
                      inboundTransfers.map((transfer: any, index: number) => (
                        <tr key={transfer.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{transfer.transfer_number}</div>
                            {transfer.tracking_number && (
                              <div className="text-xs text-gray-500">Ref: {transfer.tracking_number}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transfer.from_warehouse_name || `Warehouse #${transfer.from_warehouse}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transfer.total_items || 0} items ({transfer.total_quantity || 0} units)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transfer.shipped_at ? new Date(transfer.shipped_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transfer.expected_date ? new Date(transfer.expected_date).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              transfer.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                              transfer.status === 'partially_received' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {transfer.status === 'in_transit' ? 'In Transit' :
                               transfer.status === 'partially_received' ? 'Partially Received' :
                               transfer.status?.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                            <button
                              onClick={() => {
                                setSelectedTransfer(transfer)
                                setTransferReceiveItems(transfer.items.map((item: any) => ({
                                  product_id: item.product,
                                  product_name: item.product_name,
                                  quantity_shipped: item.quantity_shipped,
                                  quantity_received: item.quantity_shipped, // Default to full quantity
                                  quantity_damaged: 0,
                                  damage_notes: ''
                                })))
                                setShowReceiveTransferModal(true)
                              }}
                              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 font-medium"
                            >
                              Receive Goods
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Receive Transfer Modal */}
        {showReceiveTransferModal && selectedTransfer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
                <h3 className="text-lg font-semibold text-gray-900">
                  Receive Transfer: {selectedTransfer.transfer_number}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  From {selectedTransfer.from_warehouse_name} → {selectedTransfer.to_warehouse_name}
                </p>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Items to Receive</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Update quantities received and mark any damaged items
                  </p>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Shipped</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Received</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Damaged</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Damage Notes</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {transferReceiveItems.map((item, index) => (
                          <tr key={item.product_id}>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.product_name}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900">{item.quantity_shipped}</td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min="0"
                                max={item.quantity_shipped}
                                value={item.quantity_received}
                                onChange={(e) => {
                                  const newItems = [...transferReceiveItems]
                                  newItems[index].quantity_received = Number(e.target.value)
                                  setTransferReceiveItems(newItems)
                                }}
                                className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min="0"
                                max={item.quantity_shipped}
                                value={item.quantity_damaged}
                                onChange={(e) => {
                                  const newItems = [...transferReceiveItems]
                                  newItems[index].quantity_damaged = Number(e.target.value)
                                  setTransferReceiveItems(newItems)
                                }}
                                className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={item.damage_notes}
                                onChange={(e) => {
                                  const newItems = [...transferReceiveItems]
                                  newItems[index].damage_notes = e.target.value
                                  setTransferReceiveItems(newItems)
                                }}
                                placeholder="Optional damage notes"
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                disabled={item.quantity_damaged === 0}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Receive Notes (Optional)
                  </label>
                  <textarea
                    value={receiveNotes}
                    onChange={(e) => setReceiveNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Add any notes about this receipt..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowReceiveTransferModal(false)
                      setSelectedTransfer(null)
                      setTransferReceiveItems([])
                      setReceiveNotes('')
                    }}
                    disabled={isReceivingTransfer}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      // Validate before sending
                      const invalidItems = transferReceiveItems.filter(item => {
                        const received = Number(item.quantity_received) || 0
                        const damaged = Number(item.quantity_damaged) || 0
                        return received < 0 || damaged < 0 || damaged > received
                      })

                      if (invalidItems.length > 0) {
                        alert('Invalid quantities: Damaged quantity cannot exceed received quantity')
                        return
                      }

                      setIsReceivingTransfer(true)
                      try {
                        const receivePayload = {
                          items: transferReceiveItems.map(item => ({
                            product_id: item.product_id,
                            quantity_received: Number(item.quantity_received) || 0,
                            quantity_damaged: Number(item.quantity_damaged) || 0,
                            damage_notes: item.damage_notes || ''
                          })),
                          notes: receiveNotes
                        }

                        console.log('Receiving transfer with payload:', receivePayload)

                        await api.receiveStockTransfer(selectedTransfer.id, receivePayload)

                        // Refresh data
                        queryClient.invalidateQueries({ queryKey: ['inbound-transfers', warehouseId] })
                        queryClient.invalidateQueries({ queryKey: ['warehouse-inventory', warehouseId] })

                        // Close modal
                        setShowReceiveTransferModal(false)
                        setSelectedTransfer(null)
                        setTransferReceiveItems([])
                        setReceiveNotes('')

                        alert('Transfer received successfully!')
                      } catch (error: any) {
                        console.error('Error receiving transfer:', error)
                        alert(`Error: ${error.response?.data?.message || error.message || 'Failed to receive transfer'}`)
                      } finally {
                        setIsReceivingTransfer(false)
                      }
                    }}
                    disabled={isReceivingTransfer}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 font-medium disabled:opacity-50"
                  >
                    {isReceivingTransfer ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Receiving...
                      </span>
                    ) : (
                      'Confirm Receipt'
                    )}
                  </button>
                </div>
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