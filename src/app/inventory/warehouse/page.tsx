'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
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
  AlertCircle as AlertCircleIcon
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
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

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
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleWarehouseClick(warehouse.id)
                            }}
                            className="text-orange-600 hover:text-orange-900 inline-flex items-center"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </button>
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
      </div>
    </AppLayout>
  )
}