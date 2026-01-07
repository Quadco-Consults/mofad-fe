'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import mockApi from '@/lib/mockApi'
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
  Clock,
  Package,
  Warehouse,
  TrendingUp,
  TrendingDown,
  Fuel,
  Droplets,
  Settings as SettingsIcon,
  MapPin,
  Calendar,
  ArrowLeft,
  Users,
  Mail,
  Phone,
} from 'lucide-react'

interface WarehouseInventory {
  id: number
  warehouse_id: number
  product_name: string
  product_code: string
  category: string
  current_stock: number
  unit_type: string
  cost_value: number
  retail_value: number
  reorder_level: number
  max_level: number
  location: string
  last_updated: string
  stock_status: 'healthy' | 'low' | 'critical' | 'overstock'
  days_of_supply: number
}

interface WarehouseData {
  id: number
  name: string
  location: string
  type: string
  capacity: number
  current_utilization: number
  manager: string
  phone: string
  email: string
  status: string
  total_products: number
  last_updated: string
  address: string
  established: string
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'fuel':
      return <Fuel className="w-5 h-5 text-red-500" />
    case 'lubricants':
      return <Droplets className="w-5 h-5 text-blue-500" />
    case 'additives':
      return <SettingsIcon className="w-5 h-5 text-green-500" />
    default:
      return <Package className="w-5 h-5 text-gray-500" />
  }
}

const getStockStatusBadge = (status: string) => {
  const colors = {
    healthy: 'bg-green-100 text-green-800',
    low: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800',
    overstock: 'bg-blue-100 text-blue-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
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
  const warehouseId = params?.id as string
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stockStatusFilter, setStockStatusFilter] = useState('all')

  // Fetch warehouse details
  const { data: warehousesList } = useQuery({
    queryKey: ['warehouses-list'],
    queryFn: () => mockApi.get('/warehouses'),
  })

  // Fetch warehouse inventory
  const { data: inventoryList, isLoading, error } = useQuery({
    queryKey: ['warehouse-inventory', warehouseId],
    queryFn: () => mockApi.get(`/warehouses/${warehouseId}`),
  })

  const warehouses = warehousesList || []
  const warehouse = warehouses.find((w: WarehouseData) => w.id === parseInt(warehouseId))
  const inventory = inventoryList || []

  // Filter inventory
  const filteredInventory = inventory.filter((item: WarehouseInventory) => {
    const matchesSearch = item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    const matchesStatus = stockStatusFilter === 'all' || item.stock_status === stockStatusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  if (error) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-red-500">Error loading warehouse inventory. Please try again.</p>
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
  const totalProducts = filteredInventory.length
  const totalValue = filteredInventory.reduce((sum: number, item: WarehouseInventory) => sum + item.retail_value, 0)
  const lowStockItems = filteredInventory.filter((item: WarehouseInventory) => item.stock_status === 'low').length
  const criticalStockItems = filteredInventory.filter((item: WarehouseInventory) => item.stock_status === 'critical').length

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
                Inventory management for {warehouse.location}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="mofad-btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Stock Adjustment
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
                    {warehouse.address}
                  </p>
                  <p className="text-sm text-gray-500">
                    Type: {warehouse.type} • Est. {warehouse.established}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{warehouse.manager}</h4>
                  <p className="text-sm text-gray-600">Warehouse Manager</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {warehouse.phone}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {warehouse.email}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Capacity</h4>
                  <p className="text-sm text-gray-600">
                    {warehouse.current_utilization.toLocaleString()} / {warehouse.capacity.toLocaleString()} units
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          warehouse.current_utilization / warehouse.capacity >= 0.9 ? 'bg-red-500' :
                          warehouse.current_utilization / warehouse.capacity >= 0.7 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min((warehouse.current_utilization / warehouse.capacity) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {Math.round((warehouse.current_utilization / warehouse.capacity) * 100)}%
                    </span>
                  </div>
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
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="Fuel">Fuel</option>
                  <option value="Lubricants">Lubricants</option>
                  <option value="Additives">Additives</option>
                </select>

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

                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
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
                  {searchTerm || categoryFilter !== 'all' || stockStatusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : `No products available in ${warehouse.name}`
                  }
                </p>
                <Button className="mofad-btn-primary">
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
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Current Stock</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Stock Level</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Reorder Point</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Cost Value</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Retail Value</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Location</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Days Supply</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Last Updated</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredInventory.map((item: WarehouseInventory) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {getCategoryIcon(item.category)}
                            <div>
                              <div className="font-medium text-gray-900">{item.product_name}</div>
                              <div className="text-sm text-gray-500">{item.product_code}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-700">{item.category}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {getStockStatusIcon(item.stock_status)}
                            <span className="font-bold text-gray-900">{item.current_stock.toLocaleString()}</span>
                            <span className="text-sm text-gray-500">{item.unit_type}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="w-full max-w-24 mx-auto">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  item.stock_status === 'critical' ? 'bg-red-500' :
                                  item.stock_status === 'low' ? 'bg-yellow-500' :
                                  item.stock_status === 'overstock' ? 'bg-blue-500' :
                                  'bg-green-500'
                                }`}
                                style={{
                                  width: `${Math.min((item.current_stock / item.max_level) * 100, 100)}%`
                                }}
                              ></div>
                            </div>
                            <div className="text-xs text-center text-gray-500 mt-1">
                              {Math.round((item.current_stock / item.max_level) * 100)}%
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{item.reorder_level.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">Max: {item.max_level.toLocaleString()}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(item.cost_value)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-semibold text-green-600">
                            {formatCurrency(item.retail_value)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-700">{item.location}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span className={`text-sm font-medium ${
                              item.days_of_supply <= 7 ? 'text-red-600' :
                              item.days_of_supply <= 14 ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {item.days_of_supply}d
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStockStatusBadge(item.stock_status)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-sm text-gray-500">
                            {formatDateTime(item.last_updated).split(',')[0]}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="View Bin Card"
                              onClick={() => router.push(`/inventory/warehouse/${warehouseId}/products/${item.id}/bin-card`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Adjust Stock"
                            >
                              <Edit className="w-4 h-4" />
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
      </div>
    </AppLayout>
  )
}