'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
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
  Users,
  BarChart3,
} from 'lucide-react'

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

const getWarehouseTypeBadge = (type: string) => {
  const colors: Record<string, string> = {
    Primary: 'bg-blue-100 text-blue-800',
    Secondary: 'bg-green-100 text-green-800',
    Hub: 'bg-purple-100 text-purple-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
      {type}
    </span>
  )
}

const getWarehouseStatusBadge = (status: string) => {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    maintenance: 'bg-yellow-100 text-yellow-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

const getUtilizationColor = (utilization: number, capacity: number) => {
  const percentage = (utilization / capacity) * 100
  if (percentage >= 90) return 'text-red-600'
  if (percentage >= 70) return 'text-yellow-600'
  return 'text-green-600'
}

export default function WarehousesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const { data: warehousesList, isLoading } = useQuery({
    queryKey: ['warehouses-list'],
    queryFn: () => mockApi.get('/warehouses'),
  })

  const warehouses = warehousesList || []

  // Filter warehouses
  const filteredWarehouses = warehouses.filter((warehouse: WarehouseData) => {
    const matchesSearch = warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warehouse.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warehouse.manager.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === 'all' || warehouse.type === typeFilter

    return matchesSearch && matchesType
  })

  const handleViewWarehouse = (warehouse: WarehouseData) => {
    router.push(`/inventory/warehouse/${warehouse.id}`)
  }

  // Calculate summary stats
  const totalCapacity = filteredWarehouses.reduce((sum: number, w: WarehouseData) => sum + w.capacity, 0)
  const totalUtilization = filteredWarehouses.reduce((sum: number, w: WarehouseData) => sum + w.current_utilization, 0)
  const totalProducts = filteredWarehouses.reduce((sum: number, w: WarehouseData) => sum + w.total_products, 0)
  const activeWarehouses = filteredWarehouses.filter((w: WarehouseData) => w.status === 'active').length

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Warehouses</h1>
            <p className="text-muted-foreground">Monitor all warehouse facilities and their inventory</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="mofad-btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Warehouse
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Warehouse className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Warehouses</p>
                  <p className="text-2xl font-bold text-blue-600">{filteredWarehouses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Facilities</p>
                  <p className="text-2xl font-bold text-green-600">{activeWarehouses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-orange-600">{totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Utilization</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {totalCapacity > 0 ? Math.round((totalUtilization / totalCapacity) * 100) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search warehouses, location, or manager..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="Primary">Primary</option>
              <option value="Secondary">Secondary</option>
              <option value="Hub">Hub</option>
            </select>

            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>

        {/* Warehouses Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 py-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
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
            ) : filteredWarehouses.length === 0 ? (
              <div className="p-12 text-center">
                <Warehouse className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No warehouses found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || typeFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding a new warehouse'}
                </p>
                <Button className="mofad-btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Warehouse
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Warehouse</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Manager</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Capacity</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Utilization</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Products</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Last Updated</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredWarehouses.map((warehouse: WarehouseData) => (
                      <tr key={warehouse.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Warehouse className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{warehouse.name}</div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {warehouse.location}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getWarehouseTypeBadge(warehouse.type)}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{warehouse.manager}</div>
                            <div className="text-sm text-gray-500">{warehouse.phone}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {warehouse.capacity.toLocaleString()} units
                            </div>
                            <div className="text-xs text-gray-500">
                              Used: {warehouse.current_utilization.toLocaleString()}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
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
                            <span className={`text-sm font-medium ${getUtilizationColor(warehouse.current_utilization, warehouse.capacity)}`}>
                              {Math.round((warehouse.current_utilization / warehouse.capacity) * 100)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Package className="w-3 h-3 text-gray-400" />
                            <span className="font-medium text-gray-900">{warehouse.total_products}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getWarehouseStatusBadge(warehouse.status)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-500">
                            {formatDateTime(warehouse.last_updated)}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3"
                            title="View Warehouse Inventory"
                            onClick={() => handleViewWarehouse(warehouse)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
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