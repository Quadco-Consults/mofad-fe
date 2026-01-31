'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import api from '@/lib/api-client'
import { ArrowLeft, Package, FileText, Loader2, AlertCircle as AlertCircleIcon } from 'lucide-react'

export default function WarehouseProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const warehouseId = Number(params?.id)
  const productId = Number(params?.productId)

  const [activeTab, setActiveTab] = useState<'details' | 'bincard'>('details')

  // Fetch warehouse details
  const { data: warehouseData, isLoading: warehouseLoading } = useQuery({
    queryKey: ['warehouse', warehouseId],
    queryFn: () => api.getWarehouseById(warehouseId),
    enabled: !!warehouseId
  })

  // Fetch product details
  const { data: productData, isLoading: productLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => api.getProductById(productId),
    enabled: !!productId
  })

  // Fetch warehouse inventory for this product
  const { data: inventoryResponse, isLoading: inventoryLoading } = useQuery({
    queryKey: ['warehouse-inventory', warehouseId, productId],
    queryFn: async () => {
      const response = await api.getWarehouseInventory(warehouseId)
      // Backend returns inventory in "inventory" field, and product is just an ID number
      const items = response?.inventory || response?.results || []
      const inventoryItem = items.find((item: any) => item.product === productId)

      if (inventoryItem) {
        // Transform to match expected structure
        return {
          id: inventoryItem.id,
          current_stock: parseFloat(inventoryItem.quantity_on_hand || 0),
          reorder_level: parseFloat(inventoryItem.reorder_point || inventoryItem.minimum_level || 0),
          unit_cost: parseFloat(inventoryItem.average_cost || 0),
          total_value: parseFloat(inventoryItem.total_cost_value || 0),
          last_updated: inventoryItem.updated_at,
          status: parseFloat(inventoryItem.quantity_on_hand || 0) === 0 ? 'out-of-stock' :
                  parseFloat(inventoryItem.quantity_on_hand || 0) <= parseFloat(inventoryItem.reorder_point || inventoryItem.minimum_level || 0) ? 'low-stock' :
                  'in-stock',
        }
      }
      return null
    },
    enabled: !!(warehouseId && productId)
  })

  // Fetch stock transactions (bin card data)
  const { data: transactionsResponse, isLoading: transactionsLoading } = useQuery({
    queryKey: ['stock-transactions', warehouseId, productId],
    queryFn: async () => {
      try {
        const response = await api.get('/v1/stock-transactions/', {
          warehouse: warehouseId,
          product: productId,
          ordering: '-created_at',
          page_size: 100
        })
        return response
      } catch (error) {
        console.error('Error fetching stock transactions:', error)
        return { data: { results: [], paginator: { count: 0 } } }
      }
    },
    enabled: !!(warehouseId && productId)
  })

  // Extract transactions from response
  const transactionsData = transactionsResponse?.data || transactionsResponse
  const transactions = transactionsData?.results || []
  const transactionCount = transactionsData?.paginator?.count || transactions.length

  // Calculate totals from transactions
  const totals = transactions.reduce((acc: any, txn: any) => {
    const qty = parseFloat(txn.quantity || 0)
    const type = txn.transaction_type?.toUpperCase()

    if (['RECEIVE', 'RETURN', 'ADJUSTMENT_IN', 'TRANSFER_IN', 'OPENING_BALANCE'].includes(type)) {
      acc.received += qty
    } else if (['ISSUE', 'TRANSFER_OUT', 'ADJUSTMENT_OUT', 'SALE'].includes(type)) {
      acc.issued += qty
    }

    return acc
  }, { received: 0, issued: 0 })

  const isLoading = warehouseLoading || productLoading || inventoryLoading
  const inventoryItem = inventoryResponse

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in-stock':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">In Stock</span>
      case 'low-stock':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Low Stock</span>
      case 'out-of-stock':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Out of Stock</span>
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => router.push(`/inventory/warehouse/${warehouseId}`)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Warehouse
          </button>

          {isLoading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              <div>
                <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-200 rounded mt-2 animate-pulse"></div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Package className="w-8 h-8 text-gray-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {productData?.name || 'Product Details'}
                </h1>
                <p className="text-gray-600 font-mono">{productData?.code || ''}</p>
                <p className="text-sm text-gray-500">
                  {warehouseData?.name} - {warehouseData?.location}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500 mb-4" />
              <p className="text-gray-600">Loading product details...</p>
            </div>
          </div>
        )}

        {/* Content */}
        {!isLoading && (
          <div className="bg-white rounded-lg shadow-sm">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'details'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Product Details
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('bincard')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'bincard'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Bin Card
                  </div>
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Product Information</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium text-gray-600">Product Code:</span> <span className="text-gray-900">{productData?.code || 'N/A'}</span></p>
                        <p><span className="font-medium text-gray-600">Product Name:</span> <span className="text-gray-900">{productData?.name || 'N/A'}</span></p>
                        <p><span className="font-medium text-gray-600">Category:</span> <span className="text-gray-900">{productData?.category || 'N/A'}</span></p>
                        <p><span className="font-medium text-gray-600">Brand:</span> <span className="text-gray-900">{productData?.brand || 'N/A'}</span></p>
                        <p><span className="font-medium text-gray-600">Unit of Measure:</span> <span className="text-gray-900 capitalize">{productData?.unit_of_measure || 'N/A'}</span></p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Stock Information</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium text-gray-600">Current Stock:</span> <span className="text-gray-900 font-semibold">{inventoryItem?.current_stock?.toLocaleString() || '0'} units</span></p>
                        <p><span className="font-medium text-gray-600">Reorder Level:</span> <span className="text-gray-900">{inventoryItem?.reorder_level || productData?.reorder_point || productData?.minimum_stock_level || '0'} units</span></p>
                        <p><span className="font-medium text-gray-600">Unit Cost:</span> <span className="text-gray-900 font-semibold">₦{(inventoryItem?.unit_cost || productData?.cost_price || 0).toLocaleString()}</span></p>
                        <p><span className="font-medium text-gray-600">Total Value:</span> <span className="text-gray-900 font-semibold">₦{(inventoryItem?.total_value || 0).toLocaleString()}</span></p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Pricing Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-600">Cost Price</p>
                        <p className="text-gray-900 font-semibold">₦{(productData?.cost_price || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-600">Direct Sales Price</p>
                        <p className="text-gray-900 font-semibold">₦{(productData?.direct_sales_price || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-600">Retail Sales Price</p>
                        <p className="text-gray-900 font-semibold">₦{(productData?.retail_sales_price || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Location & Status</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium text-gray-600">Warehouse:</span> <span className="text-gray-900">{warehouseData?.name || 'N/A'}</span></p>
                      <p><span className="font-medium text-gray-600">Warehouse Code:</span> <span className="text-gray-900">{warehouseData?.code || 'N/A'}</span></p>
                      <p><span className="font-medium text-gray-600">Warehouse Location:</span> <span className="text-gray-900">{warehouseData?.location || 'N/A'}</span></p>
                      <p><span className="font-medium text-gray-600">Last Updated:</span> <span className="text-gray-900">{inventoryItem?.last_updated || 'N/A'}</span></p>
                      <p><span className="font-medium text-gray-600">Status:</span> {inventoryItem?.status ? getStatusBadge(inventoryItem.status) : getStatusBadge('out-of-stock')}</p>
                    </div>
                  </div>

                  {productData?.description && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                      <p className="text-sm text-gray-700">{productData.description}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'bincard' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Bin Card - Product Movement</h3>
                      <p className="text-sm text-gray-600">Track all inventory transactions for this product in {warehouseData?.name}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Current Stock Balance</div>
                      <div className="text-2xl font-bold text-orange-600">
                        {inventoryItem?.current_stock?.toLocaleString() || 0} units
                      </div>
                    </div>
                  </div>

                  {transactionsLoading ? (
                    <div className="flex items-center justify-center p-12">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500 mb-4" />
                        <p className="text-gray-600">Loading bin card transactions...</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
                        <div className="overflow-x-auto">
                          <table className="min-w-full">
                            <thead className="bg-gradient-to-r from-orange-500 to-amber-500">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Ref. No</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Description</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Type</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Received</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Issued</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Balance</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Performed By</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {transactions.length > 0 ? (
                                transactions.map((txn: any, index: number) => {
                                  const qty = parseFloat(txn.quantity || 0)
                                  const type = txn.transaction_type?.toUpperCase()
                                  const isReceive = ['RECEIVE', 'RETURN', 'ADJUSTMENT_IN', 'TRANSFER_IN', 'OPENING_BALANCE'].includes(type)
                                  const isIssue = ['ISSUE', 'TRANSFER_OUT', 'ADJUSTMENT_OUT', 'SALE'].includes(type)

                                  const typeColors: Record<string, string> = {
                                    'RECEIVE': 'bg-green-100 text-green-800',
                                    'ISSUE': 'bg-red-100 text-red-800',
                                    'TRANSFER_IN': 'bg-blue-100 text-blue-800',
                                    'TRANSFER_OUT': 'bg-orange-100 text-orange-800',
                                    'ADJUSTMENT_IN': 'bg-purple-100 text-purple-800',
                                    'ADJUSTMENT_OUT': 'bg-pink-100 text-pink-800',
                                    'OPENING_BALANCE': 'bg-gray-100 text-gray-800',
                                    'RETURN': 'bg-teal-100 text-teal-800',
                                    'SALE': 'bg-yellow-100 text-yellow-800',
                                  }

                                  return (
                                    <tr key={txn.id || index} className="hover:bg-gray-50">
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(txn.created_at).toLocaleDateString('en-GB')}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-blue-600">
                                        {txn.reference_number || txn.transaction_number || 'N/A'}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-600">
                                        {txn.notes || txn.reason || type.replace(/_/g, ' ')}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeColors[type] || 'bg-gray-100 text-gray-800'}`}>
                                          {type.replace(/_/g, ' ')}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                                        {isReceive ? (
                                          <span className="font-semibold text-green-600">{qty.toLocaleString()}</span>
                                        ) : (
                                          <span className="text-gray-400">-</span>
                                        )}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                                        {isIssue ? (
                                          <span className="font-semibold text-red-600">{qty.toLocaleString()}</span>
                                        ) : (
                                          <span className="text-gray-400">-</span>
                                        )}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                                        {parseFloat(txn.quantity_after || txn.stock_balance || 0).toLocaleString()}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                        {txn.created_by?.username || txn.created_by?.first_name || 'System'}
                                      </td>
                                    </tr>
                                  )
                                })
                              ) : (
                                <tr>
                                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                    <p>No transaction history available for this product in this warehouse</p>
                                    <p className="text-sm text-gray-400 mt-1">Transactions will appear here once goods are received or issued</p>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="text-sm text-green-800 font-medium">Total Received</div>
                          <div className="text-2xl font-bold text-green-600">{totals.received.toLocaleString()}</div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg">
                          <div className="text-sm text-red-800 font-medium">Total Issued</div>
                          <div className="text-2xl font-bold text-red-600">{totals.issued.toLocaleString()}</div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-sm text-blue-800 font-medium">Current Balance</div>
                          <div className="text-2xl font-bold text-blue-600">{inventoryItem?.current_stock?.toLocaleString() || 0}</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
