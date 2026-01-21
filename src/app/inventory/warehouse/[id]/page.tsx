'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  AlertTriangle,
  CheckCircle,
  Package,
  Warehouse,
  TrendingUp,
  Fuel,
  Droplets,
  Settings as SettingsIcon,
  MapPin,
  Calendar,
  ArrowLeft,
  Users,
  Mail,
  Phone,
  X,
  Minus,
  RefreshCw,
} from 'lucide-react'

interface WarehouseInventoryItem {
  id: number
  warehouse: number
  product: number
  product_name: string
  product_code: string
  quantity_on_hand: number
  quantity_reserved: number
  quantity_available: number
  average_cost: number
  total_cost_value: number
  reorder_point: number
  max_stock_level: number
  is_active: boolean
  bin_location: string
  last_count_date: string | null
  last_movement_date: string | null
}

interface WarehouseData {
  id: number
  name: string
  code: string
  warehouse_type: string
  location: number | null
  location_name: string | null
  address: string | null
  phone: string | null
  email: string | null
  manager: number | null
  manager_name: string | null
  total_capacity: number | null
  available_capacity: number | null
  is_active: boolean
  is_receiving_enabled: boolean
  is_shipping_enabled: boolean
  is_temperature_controlled: boolean
  created_at: string
}

const getCategoryIcon = (productCode: string) => {
  const code = productCode?.toLowerCase() || ''
  if (code.includes('fuel') || code.includes('pms') || code.includes('ago') || code.includes('dpk')) {
    return <Fuel className="w-5 h-5 text-red-500" />
  }
  if (code.includes('lub') || code.includes('oil')) {
    return <Droplets className="w-5 h-5 text-blue-500" />
  }
  return <Package className="w-5 h-5 text-gray-500" />
}

const getStockStatus = (item: WarehouseInventoryItem): 'healthy' | 'low' | 'critical' | 'overstock' => {
  if (item.max_stock_level && item.quantity_on_hand > item.max_stock_level) {
    return 'overstock'
  }
  if (item.reorder_point && item.quantity_on_hand <= item.reorder_point * 0.5) {
    return 'critical'
  }
  if (item.reorder_point && item.quantity_on_hand <= item.reorder_point) {
    return 'low'
  }
  return 'healthy'
}

const getStockStatusBadge = (status: string) => {
  const colors = {
    healthy: 'bg-green-100 text-green-800',
    low: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800',
    overstock: 'bg-blue-100 text-blue-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || colors.healthy}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

const getStockStatusIcon = (status: string) => {
  switch (status) {
    case 'healthy':
      return <CheckCircle className="w-4 h-4 text-green-500" />
    case 'low':
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />
    case 'critical':
      return <AlertTriangle className="w-4 h-4 text-red-500" />
    case 'overstock':
      return <TrendingUp className="w-4 h-4 text-blue-500" />
    default:
      return <Package className="w-4 h-4 text-gray-500" />
  }
}

export default function WarehouseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const warehouseId = params?.id as string

  const [searchTerm, setSearchTerm] = useState('')
  const [stockStatusFilter, setStockStatusFilter] = useState('all')
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<WarehouseInventoryItem | null>(null)
  const [adjustmentData, setAdjustmentData] = useState({
    adjustment_type: 'add' as 'set' | 'add' | 'subtract',
    quantity: '',
    reason: ''
  })

  // Fetch warehouse details
  const { data: warehouse, isLoading: warehouseLoading } = useQuery({
    queryKey: ['warehouse', warehouseId],
    queryFn: () => apiClient.getWarehouseById(warehouseId),
    enabled: !!warehouseId,
  })

  // Fetch warehouse inventory
  const { data: inventoryData, isLoading: inventoryLoading, error } = useQuery({
    queryKey: ['warehouse-inventory', warehouseId],
    queryFn: () => apiClient.getWarehouseInventory(warehouseId),
    enabled: !!warehouseId,
  })

  // Inventory adjustment mutation
  const adjustMutation = useMutation({
    mutationFn: (data: {
      product_id: number
      quantity: number
      adjustment_type: 'set' | 'add' | 'subtract'
      reason: string
    }) => apiClient.adjustWarehouseInventory(warehouseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouse-inventory', warehouseId] })
      setShowAdjustModal(false)
      setSelectedItem(null)
      setAdjustmentData({ adjustment_type: 'add', quantity: '', reason: '' })
    }
  })

  const isLoading = warehouseLoading || inventoryLoading
  const inventory = inventoryData?.inventory || []

  // Filter inventory
  const filteredInventory = inventory.filter((item: WarehouseInventoryItem) => {
    const matchesSearch = !searchTerm ||
      item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.bin_location?.toLowerCase().includes(searchTerm.toLowerCase())

    const itemStatus = getStockStatus(item)
    const matchesStatus = stockStatusFilter === 'all' || itemStatus === stockStatusFilter

    return matchesSearch && matchesStatus
  })

  const handleAdjustClick = (item: WarehouseInventoryItem) => {
    setSelectedItem(item)
    setAdjustmentData({ adjustment_type: 'add', quantity: '', reason: '' })
    setShowAdjustModal(true)
  }

  const handleAdjustSubmit = () => {
    if (!selectedItem || !adjustmentData.quantity || !adjustmentData.reason) return

    adjustMutation.mutate({
      product_id: selectedItem.product,
      quantity: parseFloat(adjustmentData.quantity),
      adjustment_type: adjustmentData.adjustment_type,
      reason: adjustmentData.reason
    })
  }

  if (error) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-red-500">Error loading warehouse inventory. Please try again.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/inventory/warehouse')}
            >
              Back to Warehouses
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-500">Loading warehouse inventory...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!warehouse) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <Warehouse className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Warehouse not found.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/inventory/warehouse')}
            >
              Back to Warehouses
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  // Calculate summary stats
  const totalProducts = inventoryData?.total_products || filteredInventory.length
  const totalValue = inventoryData?.total_value || 0
  const lowStockItems = inventoryData?.low_stock_count || filteredInventory.filter((item: WarehouseInventoryItem) => {
    const status = getStockStatus(item)
    return status === 'low'
  }).length
  const criticalStockItems = filteredInventory.filter((item: WarehouseInventoryItem) => {
    const status = getStockStatus(item)
    return status === 'critical'
  }).length

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/inventory/warehouse')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Warehouses
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{warehouse.name}</h1>
              <p className="text-gray-600">
                Inventory management for {warehouse.location_name || warehouse.code}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Warehouse Info Card */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Warehouse className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{warehouse.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {warehouse.address || warehouse.location_name || 'No address'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Type: {warehouse.warehouse_type} • Code: {warehouse.code}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{warehouse.manager_name || 'No Manager'}</h4>
                  <p className="text-sm text-gray-600">Warehouse Manager</p>
                  <div className="flex items-center gap-3 mt-1">
                    {warehouse.phone && (
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {warehouse.phone}
                      </span>
                    )}
                    {warehouse.email && (
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {warehouse.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Capacity</h4>
                  {warehouse.total_capacity ? (
                    <>
                      <p className="text-sm text-gray-600">
                        {(warehouse.available_capacity || 0).toLocaleString()} / {warehouse.total_capacity.toLocaleString()} units
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              ((warehouse.total_capacity - (warehouse.available_capacity || 0)) / warehouse.total_capacity) >= 0.9 ? 'bg-red-500' :
                              ((warehouse.total_capacity - (warehouse.available_capacity || 0)) / warehouse.total_capacity) >= 0.7 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{
                              width: `${Math.min(((warehouse.total_capacity - (warehouse.available_capacity || 0)) / warehouse.total_capacity) * 100, 100)}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {Math.round(((warehouse.total_capacity - (warehouse.available_capacity || 0)) / warehouse.total_capacity) * 100)}% used
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">No capacity limit set</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-blue-600">{totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totalValue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-yellow-600">{lowStockItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Critical Stock</p>
                  <p className="text-2xl font-bold text-red-600">{criticalStockItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search products or locations..."
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <select
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={stockStatusFilter}
                  onChange={(e) => setStockStatusFilter(e.target.value)}
                >
                  <option value="all">All Stock Status</option>
                  <option value="healthy">Healthy</option>
                  <option value="low">Low</option>
                  <option value="critical">Critical</option>
                  <option value="overstock">Overstock</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardContent className="p-0">
            {filteredInventory.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || stockStatusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : `No products available in ${warehouse.name}`
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Current Stock</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Reserved</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Available</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Reorder Point</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Avg Cost</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Total Value</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Location</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredInventory.map((item: WarehouseInventoryItem) => {
                      const stockStatus = getStockStatus(item)
                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {getCategoryIcon(item.product_code)}
                              <div>
                                <div className="font-medium text-gray-900">{item.product_name}</div>
                                <div className="text-sm text-gray-500">{item.product_code}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {getStockStatusIcon(stockStatus)}
                              <span className="font-bold text-gray-900">{item.quantity_on_hand?.toLocaleString() || 0}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-gray-700">{item.quantity_reserved?.toLocaleString() || 0}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-medium text-gray-900">{item.quantity_available?.toLocaleString() || 0}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">{item.reorder_point?.toLocaleString() || 0}</div>
                              {item.max_stock_level && (
                                <div className="text-xs text-gray-500">Max: {item.max_stock_level.toLocaleString()}</div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="text-gray-900">
                              {formatCurrency(item.average_cost || 0)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-semibold text-green-600">
                              {formatCurrency(item.total_cost_value || (item.quantity_on_hand * item.average_cost) || 0)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span className="text-sm text-gray-700">{item.bin_location || '-'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {getStockStatusBadge(stockStatus)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                title="View Bin Card"
                                onClick={() => router.push(`/inventory/warehouse/${warehouseId}/bincard/${item.product}`)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                title="Adjust Stock"
                                onClick={() => handleAdjustClick(item)}
                              >
                                <Edit className="w-4 h-4" />
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

        {/* Inventory Adjustment Modal */}
        {showAdjustModal && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setShowAdjustModal(false)}
            />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Adjust Inventory</h3>
                <button
                  onClick={() => setShowAdjustModal(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Product Info */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(selectedItem.product_code)}
                    <div>
                      <div className="font-medium text-gray-900">{selectedItem.product_name}</div>
                      <div className="text-sm text-gray-500">{selectedItem.product_code}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Current Stock: <span className="font-bold">{selectedItem.quantity_on_hand?.toLocaleString() || 0}</span>
                  </div>
                </div>

                {/* Adjustment Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adjustment Type
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAdjustmentData(prev => ({ ...prev, adjustment_type: 'add' }))}
                      className={`flex-1 py-2 px-3 rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                        adjustmentData.adjustment_type === 'add'
                          ? 'bg-green-50 border-green-300 text-green-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustmentData(prev => ({ ...prev, adjustment_type: 'subtract' }))}
                      className={`flex-1 py-2 px-3 rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                        adjustmentData.adjustment_type === 'subtract'
                          ? 'bg-red-50 border-red-300 text-red-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Minus className="w-4 h-4" />
                      Subtract
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustmentData(prev => ({ ...prev, adjustment_type: 'set' }))}
                      className={`flex-1 py-2 px-3 rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                        adjustmentData.adjustment_type === 'set'
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <RefreshCw className="w-4 h-4" />
                      Set
                    </button>
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {adjustmentData.adjustment_type === 'set' ? 'New Quantity' : 'Adjustment Quantity'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={adjustmentData.quantity}
                    onChange={(e) => setAdjustmentData(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter quantity"
                  />
                  {adjustmentData.quantity && (
                    <p className="mt-1 text-sm text-gray-600">
                      New stock will be:{' '}
                      <span className="font-bold">
                        {adjustmentData.adjustment_type === 'set'
                          ? parseFloat(adjustmentData.quantity).toLocaleString()
                          : adjustmentData.adjustment_type === 'add'
                          ? ((selectedItem.quantity_on_hand || 0) + parseFloat(adjustmentData.quantity)).toLocaleString()
                          : ((selectedItem.quantity_on_hand || 0) - parseFloat(adjustmentData.quantity)).toLocaleString()
                        }
                      </span>
                    </p>
                  )}
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Adjustment <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={adjustmentData.reason}
                    onChange={(e) => setAdjustmentData(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    placeholder="e.g., Physical count discrepancy, Damage write-off, etc."
                  />
                </div>
              </div>

              <div className="flex gap-3 p-4 border-t bg-gray-50">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAdjustModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 mofad-btn-primary"
                  onClick={handleAdjustSubmit}
                  disabled={!adjustmentData.quantity || !adjustmentData.reason || adjustMutation.isPending}
                >
                  {adjustMutation.isPending ? 'Adjusting...' : 'Apply Adjustment'}
                </Button>
              </div>

              {adjustMutation.isError && (
                <div className="px-4 pb-4">
                  <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                    {(adjustMutation.error as any)?.message || 'Failed to adjust inventory'}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
