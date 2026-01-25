'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import api from '@/lib/api-client'
import { Eye, CheckCircle, XCircle, Plus, Package, Warehouse, AlertTriangle, TrendingUp, TrendingDown, Loader2, AlertCircle as AlertCircleIcon, ArrowLeft, MapPin } from 'lucide-react'

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

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'inventory' | 'receipts' | 'issues'>('inventory')
  const [selectedReceipt, setSelectedReceipt] = useState<PendingReceipt | null>(null)
  const [selectedIssue, setSelectedIssue] = useState<PendingIssue | null>(null)

  // Fetch warehouse details
  const { data: warehouseData, isLoading: warehouseLoading, error: warehouseError } = useQuery({
    queryKey: ['warehouse', warehouseId],
    queryFn: () => api.getWarehouseById(warehouseId),
    enabled: !!warehouseId
  })

  // Fetch warehouse inventory
  const { data: inventoryResponse, isLoading: inventoryLoading, error: inventoryError } = useQuery({
    queryKey: ['warehouse-inventory', warehouseId],
    queryFn: () => api.getWarehouseInventory(warehouseId),
    enabled: !!warehouseId
  })

  // Fetch pending receipts (mock for now as endpoint may not exist)
  const { data: pendingReceipts = mockPendingReceipts, isLoading: receiptsLoading } = useQuery({
    queryKey: ['pending-receipts'],
    queryFn: async () => {
      // Try to fetch real data, fallback to mock if endpoint doesn't exist
      try {
        const response = await api.get('/warehouse-receipts/pending/')
        return response.results || response
      } catch (error) {
        console.warn('Pending receipts endpoint not available, using mock data')
        return mockPendingReceipts
      }
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  // Fetch pending issues (mock for now as endpoint may not exist)
  const { data: pendingIssues = mockPendingIssues, isLoading: issuesLoading } = useQuery({
    queryKey: ['pending-issues'],
    queryFn: async () => {
      // Try to fetch real data, fallback to mock if endpoint doesn't exist
      try {
        const response = await api.get('/warehouse-issues/pending/')
        return response.results || response
      } catch (error) {
        console.warn('Pending issues endpoint not available, using mock data')
        return mockPendingIssues
      }
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  const inventoryItems = inventoryResponse?.results || []

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
    setSelectedItem(item)
    setShowDetailsModal(true)
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
            <p className="text-gray-600 mb-4">The warehouse you're looking for doesn't exist or you don't have access to it.</p>
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
            {/* Loading state */}
            {(inventoryLoading || warehouseLoading) && (
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
                </div>
              </div>
            )}

            {/* Summary Cards */}
            {!inventoryLoading && !warehouseLoading && !inventoryError && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Products</p>
                        <p className="text-2xl font-bold text-gray-900">{inventoryItems.length}</p>
                      </div>
                      <Package className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Value</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ₦{inventoryItems.reduce((sum, item) => sum + (item.total_value || 0), 0).toLocaleString()}
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
                          {inventoryItems.filter(item => item.status === 'low-stock').length}
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
                          {inventoryItems.filter(item => item.status === 'out-of-stock').length}
                        </p>
                      </div>
                      <XCircle className="h-8 w-8 text-red-600" />
                    </div>
                  </div>
                </div>
              </>
            )}

        {/* Main Table */}
        {!inventoryLoading && !warehouseLoading && !inventoryError && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-orange-500 to-amber-500">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Product Code</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Product Name</th>
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
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {item.product?.code || `ID-${item.id}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {item.product?.name || 'Unknown Product'}
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
                            <div className="text-gray-900">Ordered: {receipt.orderedQty.toLocaleString()}</div>
                            <div className="text-green-600">Received: {receipt.receivedQty.toLocaleString()}</div>
                            <div className="text-orange-600 font-medium">Pending: {receipt.pendingQty.toLocaleString()}</div>
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
                            onClick={() => setSelectedReceipt(receipt)}
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
                            <div className="text-gray-900">Requested: {issue.requestedQty.toLocaleString()}</div>
                            <div className="text-green-600">Issued: {issue.issuedQty.toLocaleString()}</div>
                            <div className="text-orange-600 font-medium">Pending: {issue.pendingQty.toLocaleString()}</div>
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
                            onClick={() => setSelectedIssue(issue)}
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

        {/* Product Details Modal */}
        {showDetailsModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Product Information</h4>
                    <div className="space-y-2">
                      <p><span className="font-medium">Product Code:</span> {selectedItem.product?.code || `ID-${selectedItem.id}`}</p>
                      <p><span className="font-medium">Product Name:</span> {selectedItem.product?.name || 'Unknown Product'}</p>
                      <p><span className="font-medium">Category:</span> {selectedItem.product?.category || 'N/A'}</p>
                      <p><span className="font-medium">Supplier:</span> {selectedItem.supplier_name || 'N/A'}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Stock Information</h4>
                    <div className="space-y-2">
                      <p><span className="font-medium">Current Stock:</span> {selectedItem.current_stock?.toLocaleString() || '0'} units</p>
                      <p><span className="font-medium">Reorder Level:</span> {selectedItem.reorder_level?.toLocaleString() || '0'} units</p>
                      <p><span className="font-medium">Unit Price:</span> ₦{(selectedItem.unit_cost || selectedItem.product?.cost_price || 0).toLocaleString()}</p>
                      <p><span className="font-medium">Total Value:</span> ₦{(selectedItem.total_value || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Location & Status</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Warehouse Location:</span> {selectedItem.warehouse?.location || selectedItem.warehouse?.name || 'N/A'}</p>
                    <p><span className="font-medium">Last Updated:</span> {selectedItem.last_updated || 'N/A'}</p>
                    <p><span className="font-medium">Status:</span> {getStatusBadge(selectedItem.status)}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600"
                >
                  Close
                </button>
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