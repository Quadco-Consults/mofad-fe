'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Pagination } from '@/components/ui/Pagination'
import { BulkActionBar } from '@/components/ui/BulkActionBar'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useSelection } from '@/hooks/useSelection'
import { useToast } from '@/components/ui/Toast'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
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
  code: string
  location: number | null
  location_name?: string | null
  warehouse_type: string
  total_capacity: number | string
  available_capacity: number | string
  utilization_percentage?: number
  manager: number | null
  manager_name?: string | null
  phone: string | null
  email: string | null
  is_active: boolean
  is_receiving_enabled: boolean
  is_shipping_enabled: boolean
  has_fire_suppression: boolean
  has_spill_containment: boolean
  is_temperature_controlled: boolean
  created_at: string
  updated_at: string
  legacy_id: number | null
  legacy_location: string | null
}

const getWarehouseTypeBadge = (type: string) => {
  const colors: Record<string, string> = {
    MAIN: 'bg-blue-100 text-blue-800',
    SECONDARY: 'bg-green-100 text-green-800',
    MANAGED: 'bg-purple-100 text-purple-800',
    distribution: 'bg-orange-100 text-orange-800',
    retail: 'bg-cyan-100 text-cyan-800',
    lubebay: 'bg-yellow-100 text-yellow-800',
    substore: 'bg-pink-100 text-pink-800',
  }

  const labels: Record<string, string> = {
    MAIN: 'Main Warehouse',
    SECONDARY: 'Secondary',
    MANAGED: 'Managed',
    distribution: 'Distribution',
    retail: 'Retail Storage',
    lubebay: 'Lubebay',
    substore: 'Sub-store',
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
      {labels[type] || type}
    </span>
  )
}

const getWarehouseStatusBadge = (isActive: boolean) => {
  return isActive ? (
    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
      Active
    </span>
  ) : (
    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
      Inactive
    </span>
  )
}

const getUtilizationPercentage = (totalCapacity: number | string, availableCapacity: number | string) => {
  const total = typeof totalCapacity === 'string' ? parseFloat(totalCapacity) : totalCapacity
  const available = typeof availableCapacity === 'string' ? parseFloat(availableCapacity) : availableCapacity
  if (total <= 0) return 0
  const used = total - available
  return Math.round((used / total) * 100)
}

const getUtilizationColor = (totalCapacity: number | string, availableCapacity: number | string) => {
  const percentage = getUtilizationPercentage(totalCapacity, availableCapacity)
  if (percentage >= 90) return 'text-red-600'
  if (percentage >= 70) return 'text-yellow-600'
  return 'text-green-600'
}

export default function WarehousesPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseData | null>(null)

  // Selection hook
  const selection = useSelection<WarehouseData>()

  const { data: warehousesList, isLoading } = useQuery({
    queryKey: ['warehouses-list', currentPage, pageSize, searchTerm, typeFilter, statusFilter],
    queryFn: () => apiClient.get('/warehouses/', {
      page: currentPage,
      size: pageSize,
      search: searchTerm || undefined,
      warehouse_type: typeFilter !== 'all' ? typeFilter : undefined,
      is_active: statusFilter === 'active' ? 'true' : statusFilter === 'inactive' ? 'false' : undefined,
    }),
  })

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: (number | string)[]) => apiClient.bulkDeleteWarehouses(ids),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['warehouses-list'] })
      setShowBulkDeleteModal(false)
      selection.clearSelection()
      addToast({
        type: 'success',
        title: 'Bulk Delete Complete',
        message: `Successfully deleted ${response.deleted_count || selection.selectedIds.length} warehouse(s)`,
      })
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: error.message || 'Failed to delete warehouses',
      })
    },
  })

  // Single delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/warehouses/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses-list'] })
      setShowDeleteModal(false)
      setSelectedWarehouse(null)
      addToast({
        type: 'success',
        title: 'Deleted',
        message: 'Warehouse deleted successfully',
      })
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: error.message || 'Failed to delete warehouse',
      })
    },
  })

  // Helper to extract array from API response
  const extractResults = (data: any) => {
    if (!data) return []
    if (Array.isArray(data)) return data
    if (data.results && Array.isArray(data.results)) return data.results
    return []
  }

  // Get pagination info
  const totalCount = warehousesList?.paginator?.count ?? warehousesList?.count ?? 0
  const totalPages = warehousesList?.paginator?.total_pages ?? Math.ceil(totalCount / pageSize)

  const warehouses = extractResults(warehousesList)

  // Filter warehouses (server-side filtering is primary, this is just for immediate UI feedback)
  const filteredWarehouses = warehouses.filter((warehouse: WarehouseData) => {
    // Search filter already applied server-side, but keep for instant UI feedback
    const matchesSearch = !searchTerm ||
      (warehouse.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       warehouse.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       warehouse.legacy_location?.toLowerCase().includes(searchTerm.toLowerCase()))

    // Type filter already applied server-side
    const matchesType = typeFilter === 'all' || warehouse.warehouse_type === typeFilter

    return matchesSearch && matchesType
  })

  const handleViewWarehouse = (warehouse: WarehouseData) => {
    router.push(`/inventory/warehouse/${warehouse.id}`)
  }

  // Calculate summary stats
  const summaryTotalCapacity = filteredWarehouses.reduce((sum: number, w: WarehouseData) => {
    const capacity = typeof w.total_capacity === 'string' ? parseFloat(w.total_capacity) : w.total_capacity
    return sum + (capacity || 0)
  }, 0)
  const summaryAvailableCapacity = filteredWarehouses.reduce((sum: number, w: WarehouseData) => {
    const available = typeof w.available_capacity === 'string' ? parseFloat(w.available_capacity) : w.available_capacity
    return sum + (available || 0)
  }, 0)
  const summaryUsedCapacity = summaryTotalCapacity - summaryAvailableCapacity
  const activeWarehouses = filteredWarehouses.filter((w: WarehouseData) => w.is_active).length

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
                  <p className="text-sm text-gray-600">Total Capacity</p>
                  <p className="text-2xl font-bold text-orange-600">{summaryTotalCapacity.toLocaleString()} L</p>
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
                    {summaryTotalCapacity > 0 ? Math.round((summaryUsedCapacity / summaryTotalCapacity) * 100) : 0}%
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
              <option value="MAIN">Main Warehouse</option>
              <option value="SECONDARY">Secondary</option>
              <option value="MANAGED">Managed</option>
              <option value="distribution">Distribution</option>
              <option value="retail">Retail Storage</option>
              <option value="lubebay">Lubebay</option>
              <option value="substore">Sub-store</option>
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
                      <th className="w-12 py-3 px-4">
                        <Checkbox
                          checked={selection.isAllSelected(filteredWarehouses)}
                          indeterminate={selection.isPartiallySelected(filteredWarehouses)}
                          onChange={() => selection.toggleAll(filteredWarehouses)}
                        />
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Warehouse</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Code</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Capacity (L)</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Utilization</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Last Updated</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredWarehouses.map((warehouse: WarehouseData) => {
                      const totalCap = typeof warehouse.total_capacity === 'string' ? parseFloat(warehouse.total_capacity) : warehouse.total_capacity
                      const availCap = typeof warehouse.available_capacity === 'string' ? parseFloat(warehouse.available_capacity) : warehouse.available_capacity
                      const usedCap = totalCap - availCap
                      const utilPercent = totalCap > 0 ? (usedCap / totalCap) * 100 : 0

                      return (
                      <tr key={warehouse.id} className={`hover:bg-gray-50 ${selection.isSelected(warehouse.id) ? 'bg-blue-50' : ''}`}>
                        <td className="py-3 px-4">
                          <Checkbox
                            checked={selection.isSelected(warehouse.id)}
                            onChange={() => selection.toggle(warehouse.id)}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Warehouse className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{warehouse.name || `Warehouse ${warehouse.legacy_id}`}</div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {warehouse.location_name || warehouse.legacy_location || 'No location'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm">{warehouse.code || '-'}</span>
                        </td>
                        <td className="py-3 px-4">
                          {getWarehouseTypeBadge(warehouse.warehouse_type)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {totalCap.toLocaleString()} L
                            </div>
                            <div className="text-xs text-gray-500">
                              Available: {availCap.toLocaleString()} L
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  utilPercent >= 90 ? 'bg-red-500' :
                                  utilPercent >= 70 ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}
                                style={{
                                  width: `${Math.min(utilPercent, 100)}%`
                                }}
                              ></div>
                            </div>
                            <span className={`text-sm font-medium ${getUtilizationColor(warehouse.total_capacity, warehouse.available_capacity)}`}>
                              {Math.round(utilPercent)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getWarehouseStatusBadge(warehouse.is_active)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-500">
                            {formatDateTime(warehouse.updated_at)}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
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
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Delete Warehouse"
                              onClick={() => {
                                setSelectedWarehouse(warehouse)
                                setShowDeleteModal(true)
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={(page) => {
              setCurrentPage(page)
              selection.clearSelection()
            }}
          />
        )}

        {/* Bulk Action Bar */}
        <BulkActionBar
          selectedCount={selection.selectedCount}
          onClearSelection={selection.clearSelection}
          onBulkDelete={() => setShowBulkDeleteModal(true)}
          isDeleting={bulkDeleteMutation.isPending}
          entityName="warehouses"
        />

        {/* Bulk Delete Confirmation Dialog */}
        <ConfirmDialog
          open={showBulkDeleteModal}
          onClose={() => setShowBulkDeleteModal(false)}
          onConfirm={() => bulkDeleteMutation.mutate(selection.selectedIds)}
          title="Delete Selected Warehouses"
          message={`Are you sure you want to delete ${selection.selectedCount} warehouse(s)? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          isLoading={bulkDeleteMutation.isPending}
        />

        {/* Single Delete Confirmation Dialog */}
        <ConfirmDialog
          open={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedWarehouse(null)
          }}
          onConfirm={() => selectedWarehouse && deleteMutation.mutate(selectedWarehouse.id)}
          title="Delete Warehouse"
          message={`Are you sure you want to delete "${selectedWarehouse?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          isLoading={deleteMutation.isPending}
        />
      </div>
    </AppLayout>
  )
}