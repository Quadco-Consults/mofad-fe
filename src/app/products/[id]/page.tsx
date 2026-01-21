'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useParams } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import {
  ArrowLeft,
  Package,
  Tag,
  DollarSign,
  Warehouse,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  BarChart3,
  Layers,
  Calendar,
  User,
  FileText,
  Box,
  Activity,
  ShoppingCart,
  Download,
  RefreshCw
} from 'lucide-react'

interface Product {
  id: number
  name: string
  code: string
  description?: string
  category?: string
  subcategory?: string
  brand?: string
  unit_of_measure?: string
  cost_price: number
  selling_price: number
  minimum_selling_price?: number
  reorder_level?: number
  reorder_quantity?: number
  is_active: boolean
  is_sellable: boolean
  is_purchasable: boolean
  is_service: boolean
  track_inventory: boolean
  requires_batch_tracking: boolean
  created_at: string
  updated_at: string
  primary_supplier?: string
}

interface WarehouseStock {
  id: number
  warehouse_id: number
  warehouse_name: string
  quantity_on_hand: number
  quantity_reserved: number
  quantity_available: number
  last_updated: string
}

const getStatusBadge = (isActive: boolean) => {
  return isActive ? (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
      <CheckCircle className="w-3 h-3" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
      <XCircle className="w-3 h-3" />
      Inactive
    </span>
  )
}

const getStockLevelIndicator = (quantity: number, reorderLevel: number = 10) => {
  if (quantity <= 0) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
        <span className="text-red-600 font-semibold">Out of Stock</span>
      </div>
    )
  }
  if (quantity <= reorderLevel) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
        <span className="text-amber-600 font-semibold">Low Stock</span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
      <span className="text-emerald-600 font-semibold">In Stock</span>
    </div>
  )
}

export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams()
  const productId = parseInt(params.id as string)

  // Fetch product details
  const { data: product, isLoading: productLoading, error, refetch } = useQuery({
    queryKey: ['product-detail', productId],
    queryFn: async () => {
      return apiClient.get<Product>(`/products/${productId}/`)
    },
  })

  // Fetch warehouse inventory for this product
  const { data: warehouseStock = [], isLoading: stockLoading } = useQuery({
    queryKey: ['product-warehouse-stock', productId],
    queryFn: async () => {
      try {
        return await apiClient.get<WarehouseStock[]>(`/warehouse-inventory/`, { product: productId })
      } catch (error) {
        return []
      }
    },
  })

  // Fetch recent stock transactions
  const { data: stockTransactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['product-stock-transactions', productId],
    queryFn: async () => {
      try {
        return await apiClient.get(`/stock-transactions/`, { product: productId })
      } catch (error) {
        return []
      }
    },
  })

  // Calculate totals
  const totalStock = warehouseStock.reduce((sum: number, ws: WarehouseStock) => sum + (ws.quantity_on_hand || 0), 0)
  const totalReserved = warehouseStock.reduce((sum: number, ws: WarehouseStock) => sum + (ws.quantity_reserved || 0), 0)
  const totalAvailable = warehouseStock.reduce((sum: number, ws: WarehouseStock) => sum + (ws.quantity_available || 0), 0)
  const stockValue = totalStock * (product?.cost_price || 0)
  const potentialRevenue = totalStock * (product?.selling_price || 0)
  const profitMargin = product?.selling_price && product?.cost_price
    ? (((product.selling_price - product.cost_price) / product.cost_price) * 100).toFixed(1)
    : '0'

  if (productLoading) {
    return (
      <AppLayout>
        <div className="p-6 space-y-6">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-24 bg-gray-200 rounded"></div>
              <div className="h-8 w-64 bg-gray-200 rounded"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-72 bg-gray-200 rounded-lg"></div>
              <div className="h-72 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error || !product) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center py-16 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-100">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              The product you're looking for doesn't exist or may have been removed.
            </p>
            <Button onClick={() => router.back()} className="mofad-btn-primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()} className="group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
                {getStatusBadge(product.is_active)}
              </div>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Tag className="w-4 h-4" />
                Product Code: <span className="font-mono font-semibold text-primary">{product.code}</span>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="mofad-btn-primary">
              <Edit className="w-4 h-4 mr-2" />
              Edit Product
            </Button>
          </div>
        </div>

        {/* Product Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Details */}
          <Card className="lg:col-span-2 overflow-hidden">
            <div className="h-2 mofad-gradient-bg"></div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <div className="w-28 h-28 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center shadow-inner">
                  <Package className="w-14 h-14 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 text-sm">Category:</span>
                        <span className="font-medium">{product.category || 'Uncategorized'}</span>
                      </div>
                      {product.subcategory && (
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 text-sm">Subcategory:</span>
                          <span className="font-medium">{product.subcategory}</span>
                        </div>
                      )}
                      {product.brand && (
                        <div className="flex items-center gap-2">
                          <Box className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 text-sm">Brand:</span>
                          <span className="font-medium">{product.brand}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Box className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 text-sm">Unit:</span>
                        <span className="font-medium">{product.unit_of_measure || 'Each'}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {product.primary_supplier && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 text-sm">Supplier:</span>
                          <span className="font-medium">{product.primary_supplier}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 text-sm">Created:</span>
                        <span className="font-medium">{formatDateTime(product.created_at).split(' ')[0]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 text-sm">Updated:</span>
                        <span className="font-medium">{formatDateTime(product.updated_at).split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>

                  {product.description && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
                    </div>
                  )}

                  {/* Product Flags */}
                  <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                    {product.is_sellable && (
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md">Sellable</span>
                    )}
                    {product.is_purchasable && (
                      <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-md">Purchasable</span>
                    )}
                    {product.track_inventory && (
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-md">Track Inventory</span>
                    )}
                    {product.requires_batch_tracking && (
                      <span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-md">Batch Tracking</span>
                    )}
                    {product.is_service && (
                      <span className="px-2 py-1 bg-pink-50 text-pink-700 text-xs font-medium rounded-md">Service</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Card */}
          <Card className="overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Pricing Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Cost Price</div>
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(product.cost_price)}</div>
                </div>

                <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-100">
                  <div className="text-sm text-emerald-700 mb-1">Selling Price</div>
                  <div className="text-2xl font-bold text-emerald-800">{formatCurrency(product.selling_price)}</div>
                </div>

                {product.minimum_selling_price && (
                  <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-100">
                    <div className="text-sm text-amber-700 mb-1">Minimum Price</div>
                    <div className="text-xl font-bold text-amber-800">{formatCurrency(product.minimum_selling_price)}</div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Profit Margin</span>
                    <span className="text-xl font-bold text-primary">{profitMargin}%</span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                      style={{ width: `${Math.min(parseFloat(profitMargin), 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stock Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-8 -mt-8"></div>
            <CardContent className="p-5">
              <div className="flex items-center justify-between relative">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Stock</p>
                  <p className="text-3xl font-bold text-blue-600">{totalStock.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{product.unit_of_measure || 'Units'}</p>
                </div>
                <Package className="w-10 h-10 text-blue-500/40" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -mr-8 -mt-8"></div>
            <CardContent className="p-5">
              <div className="flex items-center justify-between relative">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Available</p>
                  <p className="text-3xl font-bold text-emerald-600">{totalAvailable.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Ready for sale</p>
                </div>
                <CheckCircle className="w-10 h-10 text-emerald-500/40" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full -mr-8 -mt-8"></div>
            <CardContent className="p-5">
              <div className="flex items-center justify-between relative">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Reserved</p>
                  <p className="text-3xl font-bold text-amber-600">{totalReserved.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">On hold</p>
                </div>
                <AlertTriangle className="w-10 h-10 text-amber-500/40" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-8 -mt-8"></div>
            <CardContent className="p-5">
              <div className="flex items-center justify-between relative">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Stock Value</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(stockValue)}</p>
                  <p className="text-xs text-gray-500 mt-1">At cost price</p>
                </div>
                <DollarSign className="w-10 h-10 text-primary/40" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Warehouse Stock Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Warehouse className="w-5 h-5 text-primary" />
              Warehouse Stock Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stockLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse h-16 bg-gray-100 rounded-lg"></div>
                ))}
              </div>
            ) : warehouseStock.length === 0 ? (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                <Warehouse className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No warehouse stock data available</p>
                <p className="text-sm text-gray-400 mt-1">This product has not been stocked in any warehouse</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Warehouse</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">On Hand</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Reserved</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Available</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {warehouseStock.map((stock: WarehouseStock) => (
                      <tr key={stock.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Warehouse className="w-5 h-5 text-primary" />
                            </div>
                            <span className="font-medium text-gray-900">{stock.warehouse_name || `Warehouse #${stock.warehouse_id}`}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="font-semibold text-gray-900">{stock.quantity_on_hand?.toLocaleString() || 0}</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="font-medium text-amber-600">{stock.quantity_reserved?.toLocaleString() || 0}</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="font-semibold text-emerald-600">{stock.quantity_available?.toLocaleString() || 0}</span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {getStockLevelIndicator(stock.quantity_available || 0, product.reorder_level)}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500">
                          {stock.last_updated ? formatDateTime(stock.last_updated) : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Stock Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Recent Stock Movements
              </CardTitle>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse h-14 bg-gray-100 rounded-lg"></div>
                ))}
              </div>
            ) : stockTransactions.length === 0 ? (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No recent transactions</p>
                <p className="text-sm text-gray-400 mt-1">Stock movements will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Reference</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Quantity</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Warehouse</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stockTransactions.slice(0, 10).map((transaction: any) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-sm">
                          {formatDateTime(transaction.created_at || transaction.transaction_date)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                            transaction.transaction_type === 'IN' || transaction.transaction_type === 'CREDIT'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {transaction.transaction_type === 'IN' || transaction.transaction_type === 'CREDIT' ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {transaction.transaction_type}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm text-blue-600">{transaction.reference_number || transaction.transaction_number || '-'}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-semibold ${
                            transaction.transaction_type === 'IN' || transaction.transaction_type === 'CREDIT'
                              ? 'text-emerald-600'
                              : 'text-red-600'
                          }`}>
                            {transaction.transaction_type === 'IN' || transaction.transaction_type === 'CREDIT' ? '+' : '-'}
                            {transaction.quantity?.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {transaction.warehouse_name || `Warehouse #${transaction.warehouse}`}
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
