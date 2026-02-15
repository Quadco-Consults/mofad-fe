'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import apiClient from '@/lib/apiClient'
import { formatCurrency } from '@/lib/utils'
import {
  Package,
  Warehouse,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Eye,
  RefreshCw,
  Download,
  CheckCircle,
  XCircle,
  BarChart3,
  MapPin,
  Calendar,
  Loader2
} from 'lucide-react'

interface WarehouseStock {
  warehouse: any
  inventory: any[]
  totalProducts: number
  totalValue: number
  lowStockItems: number
  outOfStockItems: number
}

interface StockSummary {
  totalWarehouses: number
  totalProducts: number
  totalValue: number
  totalLowStock: number
  totalOutOfStock: number
  warehouseStocks: WarehouseStock[]
}

export default function StockReportPage() {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null)

  // Fetch inventory analytics - SINGLE efficient API call!
  const { data: inventoryData, isLoading: loading, error: stockError, refetch } = useQuery({
    queryKey: ['inventory-analytics'],
    queryFn: async () => {
      const response = await apiClient.request('/reports/inventory-analytics/')
      return response
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  })

  // Transform the data to match our component's needs
  const stockSummary = inventoryData ? {
    totalWarehouses: inventoryData.warehouse_breakdown?.length || 0,
    totalProducts: inventoryData.overview?.total_products || 0,
    totalValue: inventoryData.overview?.total_value || 0,
    totalLowStock: inventoryData.overview?.low_stock_items || 0,
    totalOutOfStock: inventoryData.overview?.out_of_stock || 0,
    warehouseStocks: (inventoryData.warehouse_breakdown || []).map((wh: any, index: number) => ({
      warehouse: {
        id: `warehouse-${index}`, // Use index as unique identifier
        name: wh.warehouse__name,
        warehouse_type: wh.warehouse__warehouse_type,
        code: wh.warehouse__code || null,
        location: wh.warehouse__location || null
      },
      inventory: [], // We'll fetch individual warehouse inventory only when needed
      totalProducts: wh.total_products || 0,
      totalValue: wh.total_value || 0,
      lowStockItems: 0, // Not provided in breakdown, could be calculated if needed
      outOfStockItems: 0 // Not provided in breakdown, could be calculated if needed
    }))
  } : null

  const error = stockError ? 'Failed to fetch stock data' : null

  const getStockStatus = (stock: number, reorderLevel: number) => {
    if (stock === 0) return { status: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-100', icon: XCircle }
    if (stock <= reorderLevel && reorderLevel > 0) return { status: 'Low Stock', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: AlertTriangle }
    return { status: 'In Stock', color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle }
  }

  const refreshData = () => {
    refetch()
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-orange-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Stock Data</h3>
            <p className="text-gray-600">Fetching inventory analytics...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Stock Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={refreshData}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Retry
            </button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Current Stock Report</h1>
            <p className="text-gray-600">Real-time inventory levels across all warehouses</p>
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {new Date().toLocaleString()}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={refreshData}
              className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {stockSummary && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Warehouses</p>
                  <p className="text-3xl font-bold text-gray-900">{stockSummary.totalWarehouses}</p>
                </div>
                <Warehouse className="h-10 w-10 text-blue-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-3xl font-bold text-gray-900">{stockSummary.totalProducts.toLocaleString()}</p>
                </div>
                <Package className="h-10 w-10 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Inventory Value</p>
                  <p className="text-3xl font-bold text-gray-900">{formatCurrency(stockSummary.totalValue)}</p>
                </div>
                <BarChart3 className="h-10 w-10 text-purple-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                  <p className="text-3xl font-bold text-yellow-600">{stockSummary.totalLowStock}</p>
                </div>
                <AlertTriangle className="h-10 w-10 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                  <p className="text-3xl font-bold text-red-600">{stockSummary.totalOutOfStock}</p>
                </div>
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
            </div>
          </div>
        )}

        {/* Warehouse Stock Details */}
        {stockSummary && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">📦 Warehouse Stock Details</h2>

            {stockSummary.warehouseStocks.map((warehouseStock, index) => (
              <div key={warehouseStock.warehouse.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Warehouse Header */}
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold">{warehouseStock.warehouse.name}</h3>
                      <div className="flex items-center mt-2 space-x-4">
                        {warehouseStock.warehouse.location && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span className="text-sm">{warehouseStock.warehouse.location}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <Package className="w-4 h-4 mr-1" />
                          <span className="text-sm">Code: {warehouseStock.warehouse.code || warehouseStock.warehouse.id}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{warehouseStock.totalProducts}</div>
                      <div className="text-sm">Products</div>
                    </div>
                  </div>
                </div>

                {/* Warehouse Stats */}
                <div className="p-4 bg-gray-50 border-b">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">{formatCurrency(warehouseStock.totalValue)}</div>
                      <div className="text-sm text-gray-600">Total Value</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-600">{warehouseStock.totalProducts - warehouseStock.lowStockItems - warehouseStock.outOfStockItems}</div>
                      <div className="text-sm text-gray-600">In Stock</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-yellow-600">{warehouseStock.lowStockItems}</div>
                      <div className="text-sm text-gray-600">Low Stock</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-red-600">{warehouseStock.outOfStockItems}</div>
                      <div className="text-sm text-gray-600">Out of Stock</div>
                    </div>
                  </div>
                </div>

                {/* Inventory Items */}
                <div className="p-4">
                  {warehouseStock.inventory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No inventory items found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-sm font-medium text-gray-600 border-b">
                            <th className="pb-3">Product</th>
                            <th className="pb-3">Code</th>
                            <th className="pb-3 text-right">Stock</th>
                            <th className="pb-3 text-right">Reorder Level</th>
                            <th className="pb-3 text-right">Value</th>
                            <th className="pb-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {warehouseStock.inventory.slice(0, 10).map((item, itemIndex) => {
                            const stock = item.quantity_on_hand || item.current_stock || 0
                            const reorderLevel = item.minimum_level || item.reorder_level || 0
                            const value = item.total_cost_value || item.total_value || 0
                            const statusInfo = getStockStatus(stock, reorderLevel)
                            const StatusIcon = statusInfo.icon

                            return (
                              <tr key={itemIndex} className="text-sm">
                                <td className="py-3 font-medium text-gray-900">
                                  {item.product_name || item.name || 'Unknown Product'}
                                </td>
                                <td className="py-3 text-gray-600">
                                  {item.product_code || item.code || 'No Code'}
                                </td>
                                <td className="py-3 text-right font-medium">
                                  {stock.toLocaleString()}
                                </td>
                                <td className="py-3 text-right text-gray-600">
                                  {reorderLevel.toLocaleString()}
                                </td>
                                <td className="py-3 text-right font-medium">
                                  {formatCurrency(value)}
                                </td>
                                <td className="py-3 text-center">
                                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {statusInfo.status}
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>

                      {warehouseStock.inventory.length > 10 && (
                        <div className="text-center mt-4">
                          <button
                            onClick={() => setSelectedWarehouse(warehouseStock.warehouse.id)}
                            className="text-orange-600 hover:text-orange-800 font-medium"
                          >
                            View all {warehouseStock.inventory.length} items →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stock Health Summary */}
        {stockSummary && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📈 Stock Health Summary</h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Overall Stock Health:</span>
                <span className={`font-bold ${
                  stockSummary.totalOutOfStock === 0 ? 'text-green-600' :
                  stockSummary.totalOutOfStock < 5 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {stockSummary.totalOutOfStock === 0 ? '🟢 Excellent' :
                   stockSummary.totalOutOfStock < 5 ? '🟡 Good' : '🔴 Needs Attention'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Stock Coverage:</span>
                <span className="font-bold text-gray-900">
                  {((stockSummary.totalProducts - stockSummary.totalOutOfStock) / stockSummary.totalProducts * 100).toFixed(1)}%
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Items Requiring Attention:</span>
                <span className="font-bold text-orange-600">
                  {stockSummary.totalLowStock + stockSummary.totalOutOfStock} items
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}