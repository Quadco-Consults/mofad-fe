'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import { Warehouse, WarehouseInventory, Product } from '@/types/api'
import {
  Plus,
  Search,
  Download,
  Eye,
  Edit,
  AlertTriangle,
  CheckCircle,
  Package,
  Building2,
  TrendingUp,
  MapPin,
  User,
  Fuel,
  Droplets,
  Calendar,
  X,
  Save,
  Loader2,
  RefreshCw,
  XCircle,
  ArrowRightLeft,
} from 'lucide-react'

const getCategoryIcon = (category?: string) => {
  switch (category?.toLowerCase()) {
    case 'fuel':
      return <Fuel className="w-5 h-5 text-red-500" />
    case 'lubricant':
      return <Droplets className="w-5 h-5 text-blue-500" />
    default:
      return <Package className="w-5 h-5 text-gray-500" />
  }
}

const getStockStatusBadge = (inventory: WarehouseInventory) => {
  const percentage = inventory.minimum_level
    ? (inventory.quantity_available / inventory.minimum_level) * 100
    : 100

  if (inventory.quantity_available <= 0) {
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Out of Stock
      </span>
    )
  } else if (percentage <= 50) {
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Critical
      </span>
    )
  } else if (percentage <= 100) {
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Low
      </span>
    )
  }
  return (
    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
      Healthy
    </span>
  )
}

const getStockStatusIcon = (inventory: WarehouseInventory) => {
  const percentage = inventory.minimum_level
    ? (inventory.quantity_available / inventory.minimum_level) * 100
    : 100

  if (inventory.quantity_available <= 0 || percentage <= 50) {
    return <AlertTriangle className="w-4 h-4 text-red-500" />
  } else if (percentage <= 100) {
    return <AlertTriangle className="w-4 h-4 text-yellow-500" />
  }
  return <CheckCircle className="w-4 h-4 text-green-500" />
}

const getWarehouseTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'main': 'Main Warehouse',
    'distribution': 'Distribution Center',
    'retail': 'Retail Storage',
    'lubebay': 'Lubebay Storage',
    'substore': 'Sub-store',
  }
  return labels[type] || type
}

interface SubstoreInventoryItem extends WarehouseInventory {
  warehouse_name?: string
  warehouse_code?: string
  product_name?: string
  product_code?: string
  product_category?: string
}

export default function SubstoreInventoryPage() {
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [warehouseFilter, setWarehouseFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [selectedInventory, setSelectedInventory] = useState<SubstoreInventoryItem | null>(null)
  const [transferQuantity, setTransferQuantity] = useState(0)
  const [targetWarehouse, setTargetWarehouse] = useState<number>(0)

  // Fetch warehouses (substores)
  const { data: warehousesData, isLoading: warehousesLoading } = useQuery({
    queryKey: ['warehouses-substores'],
    queryFn: () => apiClient.get<Warehouse[]>('/warehouses/', { warehouse_type: 'substore' }),
  })

  // Fetch all warehouses for transfer options
  const { data: allWarehousesData } = useQuery({
    queryKey: ['warehouses-all'],
    queryFn: () => apiClient.get<Warehouse[]>('/warehouses/'),
  })

  // Fetch warehouse inventory
  const { data: inventoryData, isLoading: inventoryLoading, error, refetch } = useQuery({
    queryKey: ['warehouse-inventory', warehouseFilter],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (warehouseFilter !== 'all') params.warehouse = warehouseFilter
      return apiClient.get<SubstoreInventoryItem[]>('/warehouse-inventory/', params)
    },
  })

  // Fetch low stock items for stats
  const { data: lowStockItems } = useQuery({
    queryKey: ['warehouse-inventory-low-stock'],
    queryFn: () => apiClient.get<SubstoreInventoryItem[]>('/warehouse-inventory/low-stock/'),
  })

  // Fetch out of stock items for stats
  const { data: outOfStockItems } = useQuery({
    queryKey: ['warehouse-inventory-out-of-stock'],
    queryFn: () => apiClient.get<SubstoreInventoryItem[]>('/warehouse-inventory/out-of-stock/'),
  })

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, warehouseFilter])

  const warehouses = Array.isArray(warehousesData) ? warehousesData : []
  const allWarehouses = Array.isArray(allWarehousesData) ? allWarehousesData : []
  const inventory = Array.isArray(inventoryData) ? inventoryData : []

  // Filter inventory by search and status
  const allFilteredInventory = inventory.filter((item: SubstoreInventoryItem) => {
    const matchesSearch =
      (item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (item.product_code?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (item.warehouse_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (item.bin_location?.toLowerCase().includes(searchTerm.toLowerCase()) || false)

    if (statusFilter === 'all') return matchesSearch

    const percentage = item.minimum_level
      ? (item.quantity_available / item.minimum_level) * 100
      : 100

    if (statusFilter === 'critical') return matchesSearch && (item.quantity_available <= 0 || percentage <= 50)
    if (statusFilter === 'low') return matchesSearch && percentage > 50 && percentage <= 100
    if (statusFilter === 'healthy') return matchesSearch && percentage > 100

    return matchesSearch
  })

  // Pagination calculations
  const totalCount = allFilteredInventory.length
  const totalPages = Math.ceil(totalCount / pageSize) || 1
  const startIndex = (currentPage - 1) * pageSize
  const filteredInventory = allFilteredInventory.slice(startIndex, startIndex + pageSize)

  // Stats calculation
  const totalWarehouses = warehouses.length
  const healthyCount = inventory.filter((item: SubstoreInventoryItem) => {
    const percentage = item.minimum_level ? (item.quantity_available / item.minimum_level) * 100 : 100
    return percentage > 100
  }).length
  const lowStockCount = lowStockItems?.length || 0
  const outOfStockCount = outOfStockItems?.length || 0

  const handleView = (item: SubstoreInventoryItem) => {
    setSelectedInventory(item)
    setShowViewModal(true)
  }

  const handleTransfer = (item: SubstoreInventoryItem) => {
    setSelectedInventory(item)
    setTransferQuantity(0)
    setTargetWarehouse(0)
    setShowTransferModal(true)
  }

  const isLoading = warehousesLoading || inventoryLoading

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Substore Inventory</h1>
            <p className="text-muted-foreground">Monitor inventory across all substore locations</p>
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
            <Button className="mofad-btn-primary">
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Request Transfer
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Substores</p>
                  <p className="text-2xl font-bold text-primary">{totalWarehouses}</p>
                </div>
                <Building2 className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Healthy Stock</p>
                  <p className="text-2xl font-bold text-green-600">{healthyCount}</p>
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
                  <p className="text-2xl font-bold text-yellow-600">{lowStockCount}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600/60" />
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
                    placeholder="Search products, warehouses, locations..."
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <select
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={warehouseFilter}
                  onChange={(e) => setWarehouseFilter(e.target.value)}
                >
                  <option value="all">All Warehouses</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </option>
                  ))}
                </select>

                <select
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="healthy">Healthy</option>
                  <option value="low">Low Stock</option>
                  <option value="critical">Critical / Out of Stock</option>
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
                  <p className="font-medium text-red-800">Error loading inventory</p>
                  <p className="text-sm text-red-600">{(error as any).message || 'An unexpected error occurred'}</p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredInventory.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory items found</h3>
                  <p className="text-gray-500">
                    {searchTerm || statusFilter !== 'all' || warehouseFilter !== 'all'
                      ? 'Try adjusting your search or filters'
                      : 'No inventory data available'}
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredInventory.map((item: SubstoreInventoryItem) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(item.product_category)}
                      <div>
                        <h3 className="font-semibold text-base">{item.warehouse_name || `Warehouse #${item.warehouse}`}</h3>
                        {item.bin_location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">{item.bin_location}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {getStockStatusBadge(item)}
                  </div>

                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-sm mb-1">
                      {item.product_name || `Product #${item.product}`}
                    </h4>
                    {item.product_code && (
                      <p className="text-xs text-muted-foreground font-mono">{item.product_code}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Stock Level Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Stock Level</span>
                        <div className="flex items-center gap-1">
                          {getStockStatusIcon(item)}
                          <span className="text-sm font-bold">{item.quantity_on_hand.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            item.quantity_available <= 0 ? 'bg-red-500' :
                            item.minimum_level && (item.quantity_available / item.minimum_level) <= 1 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{
                            width: `${Math.min(
                              item.maximum_level
                                ? (item.quantity_on_hand / item.maximum_level) * 100
                                : 100,
                              100
                            )}%`
                          }}
                        ></div>
                      </div>

                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Min: {item.minimum_level?.toLocaleString() || 0}</span>
                        <span>Max: {item.maximum_level?.toLocaleString() || '-'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Available</p>
                        <p className="font-semibold">{item.quantity_available.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Reserved</p>
                        <p className="font-semibold">{item.quantity_reserved.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Cost</p>
                        <p className="font-semibold text-xs">{formatCurrency(item.average_cost)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Value</p>
                        <p className="font-semibold text-green-600 text-xs">{formatCurrency(item.total_cost_value)}</p>
                      </div>
                    </div>

                    <div className="border-t pt-3 space-y-2">
                      {item.last_received && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Last Received</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs font-medium">
                              {formatDateTime(item.last_received).split(',')[0]}
                            </span>
                          </div>
                        </div>
                      )}

                      {item.last_issued && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Last Issued</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs font-medium">
                              {formatDateTime(item.last_issued).split(',')[0]}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleView(item)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => router.push(`/inventory/substore/${item.warehouse}`)}
                      >
                        <Building2 className="w-4 h-4 mr-2" />
                        View Store
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleTransfer(item)}>
                        <ArrowRightLeft className="w-4 h-4 mr-2" />
                        Transfer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {!isLoading && totalCount > 0 && (
          <Card>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </Card>
        )}

        {/* View Modal */}
        {showViewModal && selectedInventory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Inventory Details</h2>
                <Button variant="ghost" onClick={() => setShowViewModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    {getCategoryIcon(selectedInventory.product_category)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedInventory.product_name || `Product #${selectedInventory.product}`}
                    </h3>
                    <p className="text-muted-foreground">
                      {selectedInventory.warehouse_name || `Warehouse #${selectedInventory.warehouse}`}
                    </p>
                    {getStockStatusBadge(selectedInventory)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Quantity on Hand</label>
                      <p className="text-gray-900 font-semibold text-lg">
                        {selectedInventory.quantity_on_hand.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Available Quantity</label>
                      <p className="text-green-600 font-semibold">
                        {selectedInventory.quantity_available.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Reserved Quantity</label>
                      <p className="text-orange-600 font-semibold">
                        {selectedInventory.quantity_reserved.toLocaleString()}
                      </p>
                    </div>
                    {selectedInventory.bin_location && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Bin Location</label>
                        <p className="text-gray-900">{selectedInventory.bin_location}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Average Cost</label>
                      <p className="text-gray-900 font-semibold">{formatCurrency(selectedInventory.average_cost)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Total Value</label>
                      <p className="text-primary font-bold text-lg">{formatCurrency(selectedInventory.total_cost_value)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Minimum Level</label>
                      <p className="text-gray-900">{selectedInventory.minimum_level?.toLocaleString() || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Maximum Level</label>
                      <p className="text-gray-900">{selectedInventory.maximum_level?.toLocaleString() || 'Not set'}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <label className="text-gray-500">Last Received</label>
                      <p className="text-gray-900">
                        {selectedInventory.last_received
                          ? formatDateTime(selectedInventory.last_received)
                          : 'Never'}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-500">Last Issued</label>
                      <p className="text-gray-900">
                        {selectedInventory.last_issued
                          ? formatDateTime(selectedInventory.last_issued)
                          : 'Never'}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-500">Last Counted</label>
                      <p className="text-gray-900">
                        {selectedInventory.last_counted
                          ? formatDateTime(selectedInventory.last_counted)
                          : 'Never'}
                      </p>
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
                  handleTransfer(selectedInventory)
                }}>
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Request Transfer
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Transfer Request Modal */}
        {showTransferModal && selectedInventory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full m-4">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Request Stock Transfer</h2>
                <Button variant="ghost" onClick={() => setShowTransferModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-6 space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">From:</p>
                  <p className="font-medium">
                    {selectedInventory.warehouse_name || `Warehouse #${selectedInventory.warehouse}`}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">Product:</p>
                  <p className="font-medium">
                    {selectedInventory.product_name || `Product #${selectedInventory.product}`}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">Available Quantity:</p>
                  <p className="font-medium text-green-600">{selectedInventory.quantity_available.toLocaleString()}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transfer To <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={targetWarehouse}
                    onChange={(e) => setTargetWarehouse(parseInt(e.target.value))}
                  >
                    <option value={0}>Select destination warehouse</option>
                    {allWarehouses
                      .filter((w) => w.id !== selectedInventory.warehouse)
                      .map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name} ({getWarehouseTypeLabel(warehouse.warehouse_type)})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity to Transfer <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={transferQuantity}
                    onChange={(e) => setTransferQuantity(parseFloat(e.target.value) || 0)}
                    min={0}
                    max={selectedInventory.quantity_available}
                    placeholder="Enter quantity"
                  />
                  {transferQuantity > selectedInventory.quantity_available && (
                    <p className="text-red-500 text-xs mt-1">Cannot exceed available quantity</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 p-6 border-t">
                <Button variant="outline" onClick={() => setShowTransferModal(false)}>
                  Cancel
                </Button>
                <Button
                  className="mofad-btn-primary"
                  disabled={!targetWarehouse || transferQuantity <= 0 || transferQuantity > selectedInventory.quantity_available}
                  onClick={() => {
                    addToast({
                      type: 'info',
                      title: 'Transfer Requested',
                      message: 'Stock transfer request has been submitted for approval'
                    })
                    setShowTransferModal(false)
                  }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Submit Request
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
