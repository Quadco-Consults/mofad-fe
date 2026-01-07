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
  Search,
  Filter,
  Download,
  Printer,
  Building2,
  Package,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  MapPin,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Droplets,
  Settings as SettingsIcon,
  Power,
} from 'lucide-react'

interface BinCardTransaction {
  id: number
  product_id: number
  substore_id: number
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

interface SubstoreProduct {
  id: number
  substore_id: number
  substore_name: string
  location: string
  product_name: string
  product_code: string
  category: string
  current_stock: number
  unit_type: string
  cost_value: number
  retail_value: number
  reorder_level: number
  max_level: number
  last_restocked: string
  stock_status: string
  manager: string
  package_size: string
}

const getCategoryIcon = (category: string) => {
  switch (category?.toLowerCase()) {
    case 'lubricants':
      return <Droplets className="w-5 h-5 text-blue-500" />
    case 'hydraulics':
      return <SettingsIcon className="w-5 h-5 text-purple-500" />
    case 'transmission':
      return <Power className="w-5 h-5 text-green-500" />
    default:
      return <Package className="w-5 h-5 text-gray-500" />
  }
}

const getTransactionTypeIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'opening balance':
      return <CheckCircle className="w-4 h-4 text-gray-500" />
    case 'transfer in':
    case 'receipt':
      return <TrendingUp className="w-4 h-4 text-green-500" />
    case 'sale':
    case 'issue':
      return <TrendingDown className="w-4 h-4 text-red-500" />
    case 'adjustment':
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />
    default:
      return <FileText className="w-4 h-4 text-gray-400" />
  }
}

const getTransactionTypeBadge = (type: string) => {
  const colors: Record<string, string> = {
    'opening balance': 'bg-gray-100 text-gray-800',
    'transfer in': 'bg-green-100 text-green-800',
    'receipt': 'bg-green-100 text-green-800',
    'sale': 'bg-red-100 text-red-800',
    'issue': 'bg-red-100 text-red-800',
    'adjustment': 'bg-yellow-100 text-yellow-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
      {type}
    </span>
  )
}

export default function SubstoreBinCardPage() {
  const params = useParams()
  const router = useRouter()
  const substoreId = parseInt(params?.id as string)
  const productId = parseInt(params?.productId as string)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  // Fetch bin card data
  const { data: binCardData, isLoading: binCardLoading } = useQuery({
    queryKey: ['substore-bin-card', substoreId, productId],
    queryFn: () => mockApi.get(`/inventory/substore/substores/${substoreId}/products/${productId}/bin-card`)
  })

  // Fetch product info from substore
  const { data: substoreProducts } = useQuery({
    queryKey: ['substore-inventory', substoreId],
    queryFn: () => mockApi.get(`/inventory/substore/substores/${substoreId}`)
  })

  const transactions: BinCardTransaction[] = Array.isArray(binCardData) ? binCardData : []
  const products: SubstoreProduct[] = Array.isArray(substoreProducts) ? substoreProducts : []
  const product = products.find(p => p.id === productId)
  const substoreInfo = products.length > 0 ? products[0] : null

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction: BinCardTransaction) => {
    if (!transaction) return false

    const matchesSearch = (transaction?.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction?.reference || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction?.created_by || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === 'all' || (transaction?.transaction_type || '').toLowerCase() === typeFilter.toLowerCase()

    return matchesSearch && matchesType
  })

  if (binCardLoading) {
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

  if (!product || !substoreInfo) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Product or substore not found.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/inventory/substore')}
            >
              Back to Substores
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  // Calculate summary data
  const totalReceived = filteredTransactions.reduce((sum, t) => sum + (t?.received || 0), 0)
  const totalIssued = filteredTransactions.reduce((sum, t) => sum + (t?.issued || 0), 0)
  const currentBalance = filteredTransactions.length > 0 ? filteredTransactions[filteredTransactions.length - 1]?.balance || 0 : 0
  const averageCost = filteredTransactions.length > 0 ? filteredTransactions[0]?.unit_cost || 0 : 0

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push(`/inventory/substore/${substoreId}`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {substoreInfo?.substore_name}
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Product Bin Card</h1>
              <p className="text-gray-600">Transaction history for {product?.product_name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Product Info Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                {getCategoryIcon(product?.category || '')}
                <div>
                  <h3 className="font-semibold text-gray-900">{product?.product_name}</h3>
                  <p className="text-sm text-gray-500 font-mono">{product?.product_code}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Category</p>
                  <p className="font-medium capitalize">{product?.category}</p>
                </div>
                <div>
                  <p className="text-gray-500">Package Size</p>
                  <p className="font-medium">{product?.package_size}</p>
                </div>
                <div>
                  <p className="text-gray-500">Unit Type</p>
                  <p className="font-medium">{product?.unit_type}</p>
                </div>
                <div>
                  <p className="text-gray-500">Current Stock</p>
                  <p className="font-medium text-blue-600">{product?.current_stock?.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Substore Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="font-semibold text-gray-900">{substoreInfo?.substore_name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <p className="text-sm text-gray-500">{substoreInfo?.location}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Manager</p>
                  <p className="font-medium">{substoreInfo?.manager}</p>
                </div>
                <div>
                  <p className="text-gray-500">Last Restocked</p>
                  <p className="font-medium">{formatDateTime(product?.last_restocked || '').split(',')[0]}</p>
                </div>
                <div>
                  <p className="text-gray-500">Reorder Level</p>
                  <p className="font-medium text-yellow-600">{product?.reorder_level?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Max Level</p>
                  <p className="font-medium text-green-600">{product?.max_level?.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Received</p>
                  <p className="text-2xl font-bold text-green-600">{totalReceived.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Issued</p>
                  <p className="text-2xl font-bold text-red-600">{totalIssued.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold text-blue-600">{currentBalance.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg. Unit Cost</p>
                  <p className="text-xl font-bold text-purple-600">{formatCurrency(averageCost)}</p>
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
              <option value="all">All Types</option>
              <option value="opening balance">Opening Balance</option>
              <option value="transfer in">Transfer In</option>
              <option value="sale">Sale</option>
              <option value="adjustment">Adjustment</option>
            </select>

            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>

        {/* Transactions Table */}
        <Card>
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
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Received</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Issued</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Balance</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Unit Cost</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Created By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-900">
                            {formatDateTime(transaction.transaction_date).split(',')[0]}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDateTime(transaction.transaction_date).split(',')[1]}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getTransactionTypeIcon(transaction.transaction_type)}
                            {getTransactionTypeBadge(transaction.transaction_type)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-900">{transaction.description}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm font-mono text-gray-600">{transaction.reference}</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className={`font-medium ${transaction.received > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                            {transaction.received > 0 ? transaction.received.toLocaleString() : '-'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className={`font-medium ${transaction.issued > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                            {transaction.issued > 0 ? transaction.issued.toLocaleString() : '-'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="font-bold text-blue-600">
                            {transaction.balance.toLocaleString()}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(transaction.unit_cost)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-600">{transaction.created_by}</div>
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