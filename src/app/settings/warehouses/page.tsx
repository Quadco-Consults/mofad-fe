'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Plus, Edit, Trash2, Eye, Warehouse, MapPin, Users, Package, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AppLayout } from '@/components/layout/AppLayout'
import { Checkbox } from '@/components/ui/Checkbox'
import { Pagination } from '@/components/ui/Pagination'
import { BulkActionBar } from '@/components/ui/BulkActionBar'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useSelection } from '@/hooks/useSelection'
import { useToast } from '@/components/ui/Toast'
import apiClient from '@/lib/apiClient'
import { formatDateTime } from '@/lib/utils'

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

const getStatusBadge = (isActive: boolean) => {
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

const getTypeBadge = (type: string) => {
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
    MAIN: 'Main',
    SECONDARY: 'Secondary',
    MANAGED: 'Managed',
    distribution: 'Distribution',
    retail: 'Retail',
    lubebay: 'Lubebay',
    substore: 'Sub-store',
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
      {labels[type] || type}
    </span>
  )
}

const getUtilizationColor = (percentage: number) => {
  if (percentage >= 90) return 'text-red-600'
  if (percentage >= 75) return 'text-yellow-600'
  return 'text-green-600'
}

function WarehousesPage() {
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseData | null>(null)

  // Selection hook
  const selection = useSelection<WarehouseData>()

  // Fetch warehouses from API
  const { data: warehousesList, isLoading, refetch } = useQuery({
    queryKey: ['warehouses-settings', currentPage, pageSize, searchTerm, typeFilter, statusFilter],
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
      queryClient.invalidateQueries({ queryKey: ['warehouses-settings'] })
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
      queryClient.invalidateQueries({ queryKey: ['warehouses-settings'] })
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

  // Calculate summary stats
  const totalCapacity = warehouses.reduce((sum: number, w: WarehouseData) => {
    const capacity = typeof w.total_capacity === 'string' ? parseFloat(w.total_capacity) : w.total_capacity
    return sum + (capacity || 0)
  }, 0)
  const totalAvailable = warehouses.reduce((sum: number, w: WarehouseData) => {
    const available = typeof w.available_capacity === 'string' ? parseFloat(w.available_capacity) : w.available_capacity
    return sum + (available || 0)
  }, 0)
  const activeWarehouses = warehouses.filter((w: WarehouseData) => w.is_active).length

  const handleView = (warehouse: WarehouseData) => {
    setSelectedWarehouse(warehouse)
    setShowViewModal(true)
  }

  const handleEdit = (warehouse: WarehouseData) => {
    setSelectedWarehouse(warehouse)
    setShowEditModal(true)
  }

  const handleDelete = (warehouse: WarehouseData) => {
    setSelectedWarehouse(warehouse)
    setShowDeleteModal(true)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-NG').format(num)
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Warehouse Management</h1>
            <p className="text-gray-600">Manage warehouse locations and storage facilities</p>
          </div>
          <Button className="mofad-btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Warehouse
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Warehouses</p>
                <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Warehouse className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Warehouses</p>
                <p className="text-2xl font-bold text-green-600">{activeWarehouses}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Warehouse className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Capacity</p>
                <p className="text-2xl font-bold text-primary-600">{formatNumber(totalCapacity)} L</p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available Capacity</p>
                <p className="text-2xl font-bold text-purple-600">{formatNumber(totalAvailable)} L</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search warehouses..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value)
              setCurrentPage(1)
            }}
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

          <Button variant="outline" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>

        {/* Table */}
        <div className="mofad-card overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="mt-2 text-gray-500">Loading warehouses...</p>
            </div>
          ) : warehouses.length === 0 ? (
            <div className="p-12 text-center">
              <Warehouse className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No warehouses found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding a new warehouse'}
              </p>
              <Button className="mofad-btn-primary" onClick={() => setShowAddModal(true)}>
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
                        checked={selection.isAllSelected(warehouses)}
                        indeterminate={selection.isPartiallySelected(warehouses)}
                        onChange={() => selection.toggleAll(warehouses)}
                      />
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Warehouse</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Code</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Capacity</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Utilization</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Updated</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {warehouses.map((warehouse: WarehouseData) => {
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
                              <div className="font-medium text-gray-900">{warehouse.name || `Warehouse ${warehouse.legacy_id || warehouse.id}`}</div>
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
                          {getTypeBadge(warehouse.warehouse_type)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {formatNumber(totalCap)} L
                            </div>
                            <div className="text-xs text-gray-500">
                              Avail: {formatNumber(availCap)} L
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  utilPercent >= 90 ? 'bg-red-500' :
                                  utilPercent >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(utilPercent, 100)}%` }}
                              ></div>
                            </div>
                            <span className={`text-sm font-medium ${getUtilizationColor(utilPercent)}`}>
                              {Math.round(utilPercent)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(warehouse.is_active)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-500">
                            {formatDateTime(warehouse.updated_at)}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleView(warehouse)} title="View">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(warehouse)} title="Edit">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(warehouse)} className="text-red-600" title="Delete">
                              <Trash2 className="h-4 w-4" />
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
        </div>

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

        {/* Bulk Delete Confirmation */}
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

        {/* Single Delete Confirmation */}
        <ConfirmDialog
          open={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedWarehouse(null)
          }}
          onConfirm={() => selectedWarehouse && deleteMutation.mutate(selectedWarehouse.id)}
          title="Delete Warehouse"
          message={`Are you sure you want to delete "${selectedWarehouse?.name || 'this warehouse'}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          isLoading={deleteMutation.isPending}
        />

        {/* View Modal */}
        {showViewModal && selectedWarehouse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Warehouse Details</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowViewModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Name</label>
                    <p className="text-gray-900">{selectedWarehouse.name || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Code</label>
                    <p className="text-gray-900 font-mono">{selectedWarehouse.code || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Type</label>
                    <p>{getTypeBadge(selectedWarehouse.warehouse_type)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Status</label>
                    <p>{getStatusBadge(selectedWarehouse.is_active)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Total Capacity</label>
                    <p className="text-gray-900">{formatNumber(parseFloat(String(selectedWarehouse.total_capacity)))} L</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Available Capacity</label>
                    <p className="text-gray-900">{formatNumber(parseFloat(String(selectedWarehouse.available_capacity)))} L</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Location</label>
                    <p className="text-gray-900">{selectedWarehouse.location_name || selectedWarehouse.legacy_location || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900">{selectedWarehouse.phone || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{selectedWarehouse.email || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Created</label>
                    <p className="text-gray-900">{formatDateTime(selectedWarehouse.created_at)}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${selectedWarehouse.is_receiving_enabled ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    <span className="text-sm text-gray-600">Receiving {selectedWarehouse.is_receiving_enabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className={`w-3 h-3 rounded-full ${selectedWarehouse.is_shipping_enabled ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    <span className="text-sm text-gray-600">Shipping {selectedWarehouse.is_shipping_enabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button variant="outline" onClick={() => setShowViewModal(false)}>Close</Button>
              </div>
            </div>
          </div>
        )}

        {/* Add Warehouse Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Add New Warehouse</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <p className="text-gray-500 text-center py-8">
                  Warehouse creation form will be implemented here.
                </p>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button className="mofad-btn-primary" disabled>Add Warehouse</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default WarehousesPage
