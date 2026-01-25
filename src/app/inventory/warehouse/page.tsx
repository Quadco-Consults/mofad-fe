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

  const warehouses: WarehouseItem[] = warehousesResponse?.results || []

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

            {/* Warehouse Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWarehouses.map((warehouse) => (
                <div
                  key={warehouse.id}
                  onClick={() => handleWarehouseClick(warehouse.id)}
                  className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer border border-gray-200 hover:border-orange-500 group"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center text-white">
                          <Warehouse className="w-6 h-6" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                            {warehouse.name}
                          </h3>
                          {warehouse.code && (
                            <p className="text-sm text-gray-500">Code: {warehouse.code}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(warehouse.is_active)}
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                      </div>
                    </div>

                    {/* Location */}
                    {warehouse.location && (
                      <div className="flex items-center text-gray-600 mb-3">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm">{warehouse.location}</span>
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4">
                      {warehouse.manager && (
                        <div className="flex items-center text-gray-600">
                          <div className="w-4 h-4 mr-2 flex items-center justify-center">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          </div>
                          <span className="text-sm">Manager: {warehouse.manager}</span>
                        </div>
                      )}
                      {warehouse.phone && (
                        <div className="flex items-center text-gray-600">
                          <div className="w-4 h-4 mr-2 flex items-center justify-center">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          </div>
                          <span className="text-sm">Phone: {warehouse.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats (if available) */}
                    {(warehouse.total_products !== undefined || warehouse.total_value !== undefined) && (
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {warehouse.total_products !== undefined && (
                            <div>
                              <span className="text-gray-500">Products</span>
                              <div className="font-semibold text-gray-900">{warehouse.total_products.toLocaleString()}</div>
                            </div>
                          )}
                          {warehouse.total_value !== undefined && (
                            <div>
                              <span className="text-gray-500">Total Value</span>
                              <div className="font-semibold text-gray-900">₦{warehouse.total_value.toLocaleString()}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Created Date */}
                    <div className="flex items-center justify-between text-xs text-gray-400 mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>Created: {new Date(warehouse.created_at).toLocaleDateString()}</span>
                      </div>
                      <span className="font-medium">Click to manage →</span>
                    </div>
                  </div>
                </div>
              ))}
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