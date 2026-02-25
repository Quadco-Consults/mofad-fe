'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import apiClient from '@/lib/apiClient'
import {
  Warehouse,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  MapPin,
  Calendar,
  Eye,
  ArrowRight,
  Search,
  Filter,
  Loader2,
  AlertCircle as AlertCircleIcon,
  Edit,
  Trash2,
  X,
  Save
} from 'lucide-react'

interface WarehouseItem {
  id: number
  name: string
  code: string | null
  location: string | null
  manager: string | null
  phone: string | null
  email: string | null
  is_active: boolean
  created_at: string
  // Additional calculated fields that might come from the API
  total_products?: number
  total_value?: number
  low_stock_items?: number
  out_of_stock_items?: number
}

export default function WarehouseListPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseItem | null>(null)
  const [deletingWarehouse, setDeletingWarehouse] = useState<WarehouseItem | null>(null)
  const [formData, setFormData] = useState<Partial<WarehouseItem>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch warehouses
  const { data: warehousesResponse, isLoading, error } = useQuery({
    queryKey: ['warehouses', searchTerm, statusFilter],
    queryFn: () => apiClient.getWarehouses({
      search: searchTerm || undefined,
      is_active: statusFilter === 'all' ? undefined : statusFilter === 'active'
    }),
    refetchOnWindowFocus: false,
  })

  const warehouses: WarehouseItem[] = (Array.isArray(warehousesResponse) ? warehousesResponse : (warehousesResponse as any)?.results) || []

  // Filter warehouses based on search and status
  const filteredWarehouses = warehouses.filter(warehouse => {
    const matchesSearch = !searchTerm ||
      warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse.location?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && warehouse.is_active) ||
      (statusFilter === 'inactive' && !warehouse.is_active)

    return matchesSearch && matchesStatus
  })

  const handleWarehouseClick = (warehouseId: number) => {
    router.push(`/inventory/warehouse/${warehouseId}`)
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">
        Active
      </span>
    ) : (
      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 font-medium">
        Inactive
      </span>
    )
  }

  const handleEditClick = (warehouse: WarehouseItem, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingWarehouse(warehouse)
    setFormData({
      name: warehouse.name,
      code: warehouse.code || '',
      location: warehouse.location || '',
      manager: warehouse.manager || '',
      phone: warehouse.phone || '',
      email: warehouse.email || '',
      is_active: warehouse.is_active
    })
  }

  const handleDeleteClick = (warehouse: WarehouseItem, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeletingWarehouse(warehouse)
  }

  const handleUpdateWarehouse = async () => {
    if (!editingWarehouse) return

    setIsSubmitting(true)
    try {
      await apiClient.updateWarehouse(editingWarehouse.id, formData)
      queryClient.invalidateQueries({ queryKey: ['warehouses'] })
      setEditingWarehouse(null)
      setFormData({})
    } catch (error: any) {
      alert(`Failed to update warehouse: ${error.message || 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteWarehouse = async () => {
    if (!deletingWarehouse) return

    setIsSubmitting(true)
    try {
      await apiClient.deleteWarehouse(deletingWarehouse.id)
      queryClient.invalidateQueries({ queryKey: ['warehouses'] })
      setDeletingWarehouse(null)
    } catch (error: any) {
      alert(`Failed to delete warehouse: ${error.message || 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Warehouse Management</h1>
            <p className="text-gray-600">Select a warehouse to manage inventory and operations</p>
          </div>
          <button
            onClick={() => router.push('/inventory/warehouse/goods-issue')}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center gap-2 font-medium shadow-md"
          >
            <Package className="w-5 h-5" />
            Goods Issue Dashboard
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search warehouses by name, code, or location..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500 mb-4" />
            <p className="text-gray-600">Loading warehouses...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <AlertCircleIcon className="h-8 w-8 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Warehouses</h3>
            <p className="text-gray-600 mb-4">Failed to load warehouse data. Please try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredWarehouses.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Warehouse className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Warehouses Found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'No warehouses match your search criteria.' : 'No warehouses available.'}
            </p>
          </div>
        )}

        {/* Warehouse Grid */}
        {!isLoading && !error && filteredWarehouses.length > 0 && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Warehouses</p>
                    <p className="text-2xl font-bold text-gray-900">{warehouses.length}</p>
                  </div>
                  <Warehouse className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Warehouses</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {warehouses.filter(w => w.is_active).length}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Inactive Warehouses</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {warehouses.filter(w => !w.is_active).length}
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Locations</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {new Set(warehouses.filter(w => w.location).map(w => w.location)).size}
                    </p>
                  </div>
                  <MapPin className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Warehouse Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Warehouse
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Manager
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Products
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Value
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredWarehouses.map((warehouse) => (
                      <tr
                        key={warehouse.id}
                        onClick={() => handleWarehouseClick(warehouse.id)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                              <Warehouse className="w-5 h-5" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{warehouse.name}</div>
                              {warehouse.code && (
                                <div className="text-sm text-gray-500">Code: {warehouse.code}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {warehouse.location ? (
                            <div className="flex items-center text-sm text-gray-900">
                              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                              {warehouse.location}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {warehouse.manager ? (
                            <div className="text-sm text-gray-900">{warehouse.manager}</div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {warehouse.phone || warehouse.email ? (
                            <div className="text-sm text-gray-900">
                              {warehouse.phone && <div>{warehouse.phone}</div>}
                              {warehouse.email && <div className="text-gray-500">{warehouse.email}</div>}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(warehouse.is_active)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {warehouse.total_products !== undefined ? (
                            <div className="text-sm font-medium text-gray-900">
                              {warehouse.total_products.toLocaleString()}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {warehouse.total_value !== undefined ? (
                            <div className="text-sm font-medium text-gray-900">
                              ₦{warehouse.total_value.toLocaleString()}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleWarehouseClick(warehouse.id)
                              }}
                              className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                              title="View warehouse details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleEditClick(warehouse, e)}
                              className="text-orange-600 hover:text-orange-900 inline-flex items-center"
                              title="Edit warehouse"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(warehouse, e)}
                              className="text-red-600 hover:text-red-900 inline-flex items-center"
                              title="Delete warehouse"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Results Count */}
        {!isLoading && !error && filteredWarehouses.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600 text-center">
              Showing {filteredWarehouses.length} of {warehouses.length} warehouses
            </p>
          </div>
        )}

        {/* Edit Warehouse Modal */}
        {editingWarehouse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Edit Warehouse</h2>
                  <button
                    onClick={() => {
                      setEditingWarehouse(null)
                      setFormData({})
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Warehouse Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter warehouse name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Warehouse Code
                      </label>
                      <input
                        type="text"
                        value={formData.code || ''}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter warehouse code"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={formData.location || ''}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter location"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Manager
                      </label>
                      <input
                        type="text"
                        value={formData.manager || ''}
                        onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter manager name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active || false}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                      Active
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setEditingWarehouse(null)
                      setFormData({})
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateWarehouse}
                    disabled={isSubmitting || !formData.name}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {deletingWarehouse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Delete Warehouse</h3>
                    <p className="text-sm text-gray-600">This action cannot be undone</p>
                  </div>
                </div>

                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete <strong>{deletingWarehouse.name}</strong>?
                  This will permanently remove the warehouse and all associated data.
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setDeletingWarehouse(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteWarehouse}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete Warehouse
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}