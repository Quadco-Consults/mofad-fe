'use client'

import { useState } from 'react'
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
} from 'lucide-react'

interface WarehouseInventory {
  id: number
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

export default function WarehouseInventoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stockStatusFilter, setStockStatusFilter] = useState('all')

  const { data: inventoryList, isLoading } = useQuery({
    queryKey: ['warehouse-inventory-list'],
    queryFn: () => mockApi.get('/inventory/warehouse'),
  })

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

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Warehouse Inventory</h1>
            <p className="text-muted-foreground">Monitor main warehouse stock levels and locations</p>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold text-primary">6</p>
                </div>
                <Warehouse className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Healthy Stock</p>
                  <p className="text-2xl font-bold text-green-600">4</p>
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
                  <p className="text-2xl font-bold text-yellow-600">1</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical</p>
                  <p className="text-2xl font-bold text-red-600">1</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold text-secondary">₦65.9M</p>
                </div>
                <TrendingUp className="w-8 h-8 text-secondary/60" />
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
                    </div>
                  ))}
                </div>
              </div>
            ) : filteredInventory.length === 0 ? (
              <div className="p-12 text-center">
                <Warehouse className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || categoryFilter !== 'all' || stockStatusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding items to your warehouse'}
                </p>
                <Button className="mofad-btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Stock Adjustment
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
                              title="View Details"
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