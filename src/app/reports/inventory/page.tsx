'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, Filter, Calendar, Package, AlertTriangle, TrendingUp, Warehouse, RefreshCw, FileSpreadsheet, Loader2, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AppLayout } from '@/components/layout/AppLayout'
import apiClient from '@/lib/apiClient'
import { useToast } from '@/components/ui/Toast'

interface InventoryAnalyticsData {
  summary: {
    total_products: number
    total_quantity: number
    total_value: number
    low_stock_items: number
    out_of_stock_items: number
    overstocked_items: number
  }
  by_category: Array<{
    category: string
    product_count: number
    total_quantity: number
    total_value: number
  }>
  by_warehouse: Array<{
    warehouse_id: number
    warehouse_name: string
    product_count: number
    total_quantity: number
    total_value: number
  }>
  stock_alerts: Array<{
    product_id: number
    product_name: string
    warehouse_name: string
    current_stock: number
    reorder_level: number
    status: 'low' | 'out_of_stock' | 'overstocked'
  }>
  movement_trends: Array<{
    month: string
    inbound: number
    outbound: number
    net_change: number
  }>
  top_moving_products: Array<{
    product_id: number
    product_name: string
    quantity_moved: number
    turnover_rate: number
  }>
  slow_moving_products: Array<{
    product_id: number
    product_name: string
    quantity_on_hand: number
    days_since_last_movement: number
  }>
}

function InventoryReportsPage() {
  const [showFilters, setShowFilters] = useState(false)
  const [warehouseId, setWarehouseId] = useState<string>('')
  const [category, setCategory] = useState<string>('')
  const [exportingExcel, setExportingExcel] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const { addToast } = useToast()

  // Fetch inventory analytics data
  const { data: reportData, isLoading, refetch } = useQuery<InventoryAnalyticsData>({
    queryKey: ['inventoryAnalytics', warehouseId, category],
    queryFn: () => apiClient.getInventoryAnalytics({
      warehouse_id: warehouseId ? parseInt(warehouseId) : undefined,
      category: category || undefined,
    }),
  })

  // Fetch warehouses for filter
  const { data: warehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => apiClient.getWarehouses(),
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-NG').format(num)
  }

  const handleExportExcel = async () => {
    setExportingExcel(true)
    try {
      await apiClient.downloadReport('inventory', 'excel', {
        warehouse_id: warehouseId || undefined,
        category: category || undefined,
      })
      addToast({ type: 'success', title: 'Excel report downloaded successfully' })
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to export Excel report' })
    } finally {
      setExportingExcel(false)
    }
  }

  const handleExportPdf = async () => {
    setExportingPdf(true)
    try {
      await apiClient.downloadReport('inventory', 'pdf', {
        warehouse_id: warehouseId || undefined,
        category: category || undefined,
      })
      addToast({ type: 'success', title: 'PDF report downloaded successfully' })
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to export PDF report' })
    } finally {
      setExportingPdf(false)
    }
  }

  const summary = reportData?.summary || {
    total_products: 0,
    total_quantity: 0,
    total_value: 0,
    low_stock_items: 0,
    out_of_stock_items: 0,
    overstocked_items: 0
  }

  const warehouseBreakdown = reportData?.by_warehouse || []
  const categoryBreakdown = reportData?.by_category || []
  const stockAlerts = reportData?.stock_alerts || []
  const topMovingProducts = reportData?.top_moving_products || []
  const slowMovingProducts = reportData?.slow_moving_products || []
  const movementTrends = reportData?.movement_trends || []

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'low':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Low Stock</span>
      case 'out_of_stock':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Out of Stock</span>
      case 'overstocked':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Overstocked</span>
      default:
        return null
    }
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Reports</h1>
            <p className="text-gray-600">Comprehensive inventory analysis and stock management insights</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={handleExportExcel}
              disabled={exportingExcel}
            >
              {exportingExcel ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4 mr-2" />
              )}
              Excel
            </Button>
            <Button
              className="mofad-btn-primary"
              onClick={handleExportPdf}
              disabled={exportingPdf}
            >
              {exportingPdf ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              PDF
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow p-4 space-y-4">
            <h3 className="font-semibold text-gray-900">Report Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                >
                  <option value="">All Warehouses</option>
                  {(Array.isArray(warehouses) ? warehouses : warehouses?.results || []).map((wh: any) => (
                    <option key={wh.id} value={wh.id}>{wh.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categoryBreakdown.map((cat) => (
                    <option key={cat.category} value={cat.category}>{cat.category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Current Status */}
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
          <Calendar className="h-5 w-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Current Inventory Status</span>
          {isLoading && (
            <div className="flex items-center text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading data...
            </div>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-primary-600">{formatCurrency(summary.total_value)}</p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-blue-600">{formatNumber(summary.total_products)}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Quantity</p>
                <p className="text-2xl font-bold text-purple-600">{formatNumber(summary.total_quantity)}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Warehouse className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{summary.low_stock_items}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{summary.out_of_stock_items}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overstocked</p>
                <p className="text-2xl font-bold text-blue-600">{summary.overstocked_items}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Stock Movement Trends */}
        {movementTrends.length > 0 && (
          <div className="mofad-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Movement Trends</h3>
            <div className="h-64 flex items-end space-x-2">
              {movementTrends.slice(-12).map((item, index) => {
                const maxValue = Math.max(...movementTrends.map(t => Math.max(t.inbound, t.outbound)), 1)
                const inboundHeight = (item.inbound / maxValue) * 100
                const outboundHeight = (item.outbound / maxValue) * 100
                return (
                  <div key={index} className="flex-1 flex flex-col items-center group">
                    <div className="w-full flex space-x-1">
                      <div className="flex-1 relative">
                        <div
                          className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t"
                          style={{ height: `${Math.max(inboundHeight, 5)}%`, minHeight: '4px' }}
                        ></div>
                      </div>
                      <div className="flex-1 relative">
                        <div
                          className="w-full bg-gradient-to-t from-red-500 to-red-400 rounded-t"
                          style={{ height: `${Math.max(outboundHeight, 5)}%`, minHeight: '4px' }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 mt-2">{item.month}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Inbound</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Outbound</span>
              </div>
            </div>
          </div>
        )}

        {/* Stock Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fast Moving Products */}
          <div className="mofad-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fast Moving Products</h3>
            {topMovingProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No movement data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topMovingProducts.slice(0, 5).map((product, index) => (
                  <div key={product.product_id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-medium text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.product_name}</p>
                          <p className="text-sm text-gray-500">{formatNumber(product.quantity_moved)} units moved</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 flex items-center">
                        <ArrowUp className="h-4 w-4 mr-1" />
                        {product.turnover_rate.toFixed(1)}x
                      </p>
                      <p className="text-xs text-gray-500">turnover</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Slow Moving Products */}
          <div className="mofad-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Slow Moving Products</h3>
            {slowMovingProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ArrowDown className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No slow moving products</p>
              </div>
            ) : (
              <div className="space-y-4">
                {slowMovingProducts.slice(0, 5).map((product, index) => (
                  <div key={product.product_id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-red-600 font-medium text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.product_name}</p>
                          <p className="text-sm text-gray-500">{formatNumber(product.quantity_on_hand)} units on hand</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">{product.days_since_last_movement} days</p>
                      <p className="text-xs text-gray-500">since movement</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stock Alerts */}
        {stockAlerts.length > 0 && (
          <div className="mofad-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Alerts</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Warehouse</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Current Stock</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Reorder Level</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stockAlerts.map((alert) => (
                    <tr key={`${alert.product_id}-${alert.warehouse_name}`} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{alert.product_name}</td>
                      <td className="py-3 px-4">{alert.warehouse_name}</td>
                      <td className="py-3 px-4">{formatNumber(alert.current_stock)}</td>
                      <td className="py-3 px-4">{formatNumber(alert.reorder_level)}</td>
                      <td className="py-3 px-4">{getStatusBadge(alert.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Warehouse Breakdown */}
        <div className="mofad-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Inventory by Warehouse</h3>
          {warehouseBreakdown.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Warehouse className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No warehouse data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Warehouse</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Products</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Quantity</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Total Value</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouseBreakdown.map((warehouse) => {
                    const totalValue = warehouseBreakdown.reduce((sum, w) => sum + w.total_value, 0)
                    const percentage = totalValue > 0 ? (warehouse.total_value / totalValue) * 100 : 0
                    return (
                      <tr key={warehouse.warehouse_id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{warehouse.warehouse_name}</td>
                        <td className="py-3 px-4">{formatNumber(warehouse.product_count)}</td>
                        <td className="py-3 px-4">{formatNumber(warehouse.total_quantity)}</td>
                        <td className="py-3 px-4">{formatCurrency(warehouse.total_value)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">{percentage.toFixed(1)}%</span>
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

        {/* Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <div className="mofad-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Inventory by Category</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Products</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Quantity</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryBreakdown.map((cat) => (
                    <tr key={cat.category} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{cat.category || 'Uncategorized'}</td>
                      <td className="py-3 px-4">{formatNumber(cat.product_count)}</td>
                      <td className="py-3 px-4">{formatNumber(cat.total_quantity)}</td>
                      <td className="py-3 px-4">{formatCurrency(cat.total_value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default InventoryReportsPage
