'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import mockApi from '@/lib/mockApi'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import {
  ArrowLeft,
  Download,
  Printer,
  Package,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  FileText,
  Calendar,
  User,
  Hash,
  Warehouse,
  MapPin,
  AlertCircle,
  Search,
  Filter,
} from 'lucide-react'

interface BinCardTransaction {
  id: number
  product_id: number
  warehouse_id: number
  transaction_date: string
  transaction_type: string
  description: string
  reference: string
  received: number
  issued: number
  balance: number
  unit_cost: number
  created_by: string
}

interface WarehouseInventory {
  id: number
  warehouse_id: number
  product_name: string
  product_code: string
  category: string
  current_stock: number
  unit_type: string
  cost_value: number
  retail_value: number
  reorder_level: number
  max_level: number
  location: string
  last_updated: string
  stock_status: 'healthy' | 'low' | 'critical' | 'overstock'
  days_of_supply: number
}

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

const getTransactionIcon = (type: string) => {
  if (!type) return <FileText className="w-4 h-4 text-gray-600" />

  switch (type.toLowerCase()) {
    case 'receipt':
      return <TrendingUp className="w-4 h-4 text-green-600" />
    case 'issue':
      return <TrendingDown className="w-4 h-4 text-red-600" />
    case 'opening balance':
      return <FileText className="w-4 h-4 text-blue-600" />
    case 'current balance':
      return <Package className="w-4 h-4 text-gray-600" />
    default:
      return <FileText className="w-4 h-4 text-gray-600" />
  }
}

const getTransactionTypeBadge = (type: string) => {
  if (!type) type = 'Unknown'

  const colors: Record<string, string> = {
    'Receipt': 'bg-green-100 text-green-800 border-green-200',
    'Issue': 'bg-red-100 text-red-800 border-red-200',
    'Opening Balance': 'bg-blue-100 text-blue-800 border-blue-200',
    'Current Balance': 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[type] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
      {type}
    </span>
  )
}

export default function ProductBinCardPage() {
  const params = useParams()
  const router = useRouter()
  const warehouseId = params?.id as string
  const productId = params?.productId as string
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  // Fetch warehouse data
  const { data: warehousesList } = useQuery({
    queryKey: ['warehouses-list'],
    queryFn: () => mockApi.get('/warehouses'),
  })

  // Fetch warehouse inventory to get product details
  const { data: inventoryList } = useQuery({
    queryKey: ['warehouse-inventory', warehouseId],
    queryFn: () => mockApi.get(`/warehouses/${warehouseId}`),
  })

  // Fetch bin card data
  const { data: binCardData, isLoading, error } = useQuery({
    queryKey: ['product-bin-card', warehouseId, productId],
    queryFn: () => mockApi.get(`/warehouses/${warehouseId}/products/${productId}/bin-card`),
  })

  const warehouses = warehousesList || []
  const warehouse = warehouses.find((w: WarehouseData) => w.id === parseInt(warehouseId))
  const inventory = inventoryList || []
  const product = inventory.find((p: WarehouseInventory) => p.id === parseInt(productId))
  const transactions = binCardData || []

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction: BinCardTransaction) => {
    if (!transaction) return false

    const matchesSearch = (transaction.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.reference || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.created_by || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === 'all' || transaction.transaction_type === typeFilter

    return matchesSearch && matchesType
  })

  if (error) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-500">Error loading bin card data. Please try again.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push(`/inventory/warehouse/${warehouseId}`)}
            >
              Back to Warehouse
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-500">Loading bin card data...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!product || !warehouse) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Product or warehouse not found.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/inventory/warehouse')}
            >
              Back to Warehouses
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  // Calculate summary stats
  const totalReceived = filteredTransactions.reduce((sum: number, t: BinCardTransaction) => sum + (t?.received || 0), 0)
  const totalIssued = filteredTransactions.reduce((sum: number, t: BinCardTransaction) => sum + (t?.issued || 0), 0)
  const currentBalance = product?.current_stock || 0
  const totalValue = currentBalance * (filteredTransactions[filteredTransactions.length - 1]?.unit_cost || 0)

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push(`/inventory/warehouse/${warehouseId}`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Warehouse
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Product Bin Card
              </h1>
              <p className="text-gray-600">
                Stock movement history for {product.product_name}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Product & Warehouse Info */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Product Information</h3>
                    <p className="text-sm text-gray-600">Item details and specifications</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Product Name:</span>
                    <span className="text-sm font-medium text-gray-900">{product.product_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Product Code:</span>
                    <span className="text-sm font-medium text-gray-900">{product.product_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Category:</span>
                    <span className="text-sm font-medium text-gray-900">{product.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Unit Type:</span>
                    <span className="text-sm font-medium text-gray-900">{product.unit_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Storage Location:</span>
                    <span className="text-sm font-medium text-gray-900 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {product.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Warehouse Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Warehouse className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Warehouse Information</h3>
                    <p className="text-sm text-gray-600">Facility details and management</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Warehouse:</span>
                    <span className="text-sm font-medium text-gray-900">{warehouse.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Location:</span>
                    <span className="text-sm font-medium text-gray-900">{warehouse.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Manager:</span>
                    <span className="text-sm font-medium text-gray-900">{warehouse.manager}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Type:</span>
                    <span className="text-sm font-medium text-gray-900">{warehouse.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Generated:</span>
                    <span className="text-sm font-medium text-gray-900 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDateTime(new Date().toISOString()).split(',')[0]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Plus className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Received</p>
                  <p className="text-2xl font-bold text-green-600">
                    {totalReceived.toLocaleString()} {product?.unit_type || 'units'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Minus className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Issued</p>
                  <p className="text-2xl font-bold text-red-600">
                    {totalIssued.toLocaleString()} {product?.unit_type || 'units'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Balance</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {currentBalance.toLocaleString()} {product?.unit_type || 'units'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Value</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(totalValue)}
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
                placeholder="Search transactions..."
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
              <option value="all">All Transactions</option>
              <option value="Receipt">Receipts</option>
              <option value="Issue">Issues</option>
              <option value="Opening Balance">Opening Balance</option>
              <option value="Current Balance">Current Balance</option>
            </select>

            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>

        {/* Bin Card Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Stock Movement History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredTransactions.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-500">
                  {searchTerm || typeFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'No transaction history available for this product'
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Reference</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Received</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Issued</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Balance</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Unit Cost</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Created By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTransactions.map((transaction: BinCardTransaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {transaction?.transaction_date ? formatDateTime(transaction.transaction_date) : 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getTransactionIcon(transaction?.transaction_type || '')}
                            {getTransactionTypeBadge(transaction?.transaction_type || '')}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-900">{transaction?.description || 'N/A'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <Hash className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-900 font-mono">{transaction?.reference || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`text-sm font-medium ${
                            (transaction?.received || 0) > 0 ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            {(transaction?.received || 0) > 0 ? `+${(transaction.received || 0).toLocaleString()}` : '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`text-sm font-medium ${
                            (transaction?.issued || 0) > 0 ? 'text-red-600' : 'text-gray-400'
                          }`}>
                            {(transaction?.issued || 0) > 0 ? `-${(transaction.issued || 0).toLocaleString()}` : '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm font-bold text-gray-900">
                            {(transaction?.balance || 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm text-gray-900">
                            {formatCurrency(transaction?.unit_cost || 0)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-900">{transaction?.created_by || 'N/A'}</span>
                          </div>
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