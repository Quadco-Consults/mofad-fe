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

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse">
                    <div className="h-40 bg-muted rounded-md"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            filteredInventory.map((item: WarehouseInventory) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(item.category)}
                      <div>
                        <h3 className="font-semibold text-lg">{item.product_name}</h3>
                        <p className="text-sm text-muted-foreground">{item.product_code}</p>
                      </div>
                    </div>
                    {getStockStatusBadge(item.stock_status)}
                  </div>

                  <div className="space-y-4">
                    {/* Stock Level Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Stock Level</span>
                        <div className="flex items-center gap-1">
                          {getStockStatusIcon(item.stock_status)}
                          <span className="text-sm font-bold">{item.current_stock.toLocaleString()} {item.unit_type}</span>
                        </div>
                      </div>

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

                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Reorder: {item.reorder_level.toLocaleString()}</span>
                        <span>Max: {item.max_level.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Cost Value</p>
                        <p className="font-semibold">{formatCurrency(item.cost_value)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Retail Value</p>
                        <p className="font-semibold text-green-600">{formatCurrency(item.retail_value)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Location</p>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <p className="font-medium text-xs">{item.location}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Days of Supply</p>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <p className={`font-semibold text-xs ${
                            item.days_of_supply <= 7 ? 'text-red-600' :
                            item.days_of_supply <= 14 ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {item.days_of_supply} days
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Last Updated</span>
                        <span className="text-xs font-medium">
                          {formatDateTime(item.last_updated).split(',')[0]}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-2" />
                        Adjust
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  )
}