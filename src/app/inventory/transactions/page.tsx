'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import mockApi from '@/lib/mockApi'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  ArrowDown,
  ArrowUp,
  ArrowLeftRight,
  RefreshCw,
  FileText,
  Building,
  User,
  Calendar,
  CheckCircle,
  Clock,
  Package,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'

interface StockTransaction {
  id: number
  transaction_type: 'Inbound' | 'Outbound' | 'Transfer' | 'Adjustment'
  product_name: string
  product_code: string
  quantity: number
  unit_type: string
  unit_cost: number
  total_cost: number
  reference: string
  source: string
  destination: string
  transaction_date: string
  status: 'completed' | 'pending' | 'cancelled'
  created_by: string
}

const getTransactionTypeIcon = (type: string) => {
  switch (type) {
    case 'Inbound':
      return <ArrowDown className="w-5 h-5 text-green-500" />
    case 'Outbound':
      return <ArrowUp className="w-5 h-5 text-red-500" />
    case 'Transfer':
      return <ArrowLeftRight className="w-5 h-5 text-blue-500" />
    case 'Adjustment':
      return <RefreshCw className="w-5 h-5 text-purple-500" />
    default:
      return <Package className="w-5 h-5 text-gray-500" />
  }
}

const getTransactionTypeBadge = (type: string) => {
  const colors = {
    Inbound: 'bg-green-100 text-green-800',
    Outbound: 'bg-red-100 text-red-800',
    Transfer: 'bg-blue-100 text-blue-800',
    Adjustment: 'bg-purple-100 text-purple-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type as keyof typeof colors]}`}>
      {type}
    </span>
  )
}

const getStatusBadge = (status: string) => {
  const colors = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-500" />
    case 'pending':
      return <Clock className="w-4 h-4 text-yellow-500" />
    case 'cancelled':
      return <RefreshCw className="w-4 h-4 text-red-500" />
    default:
      return <Package className="w-4 h-4 text-gray-500" />
  }
}

export default function StockTransactionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const { data: transactionsList, isLoading } = useQuery({
    queryKey: ['stock-transactions-list'],
    queryFn: () => mockApi.get('/inventory/transactions'),
  })

  const transactions = transactionsList || []

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction: StockTransaction) => {
    const matchesSearch = transaction.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.destination.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === 'all' || transaction.transaction_type === typeFilter
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Stock Transactions</h1>
            <p className="text-muted-foreground">Track all inventory movements and adjustments</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="mofad-btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              New Transaction
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                  <p className="text-2xl font-bold text-primary">6</p>
                </div>
                <FileText className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">4</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">2</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Inbound Value</p>
                  <p className="text-2xl font-bold text-green-600">₦14.7M</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Outbound Value</p>
                  <p className="text-2xl font-bold text-red-600">₦1.4M</p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-600/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
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
                  <option value="Inbound">Inbound</option>
                  <option value="Outbound">Outbound</option>
                  <option value="Transfer">Transfer</option>
                  <option value="Adjustment">Adjustment</option>
                </select>

                <select
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <div className="space-y-4">
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse">
                    <div className="h-20 bg-muted rounded-md"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            filteredTransactions.map((transaction: StockTransaction) => (
              <Card key={transaction.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Transaction Icon and Basic Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-3">
                        {getTransactionTypeIcon(transaction.transaction_type)}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {getTransactionTypeBadge(transaction.transaction_type)}
                            {getStatusBadge(transaction.status)}
                          </div>
                          <h3 className="font-semibold text-base">{transaction.product_name}</h3>
                          <p className="text-sm text-muted-foreground">{transaction.product_code}</p>
                        </div>
                      </div>
                    </div>

                    {/* Transaction Details */}
                    <div className="flex-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Quantity</p>
                        <div className="flex items-center gap-1">
                          <span className={`font-semibold ${transaction.quantity < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {transaction.quantity > 0 ? '+' : ''}{transaction.quantity.toLocaleString()}
                          </span>
                          <span className="text-xs text-muted-foreground">{transaction.unit_type}</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-muted-foreground">Total Value</p>
                        <div className="flex items-center gap-1">
                          <span className={`font-bold ${transaction.total_cost < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(Math.abs(transaction.total_cost))}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-muted-foreground">Reference</p>
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3 text-muted-foreground" />
                          <span className="font-medium text-xs">{transaction.reference}</span>
                        </div>
                      </div>
                    </div>

                    {/* Location Info */}
                    <div className="flex-1 space-y-2 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">From → To</p>
                        <div className="flex items-center gap-2">
                          <Building className="w-3 h-3 text-muted-foreground" />
                          <span className="font-medium text-xs">{transaction.source}</span>
                          <ArrowLeftRight className="w-3 h-3 text-muted-foreground" />
                          <span className="font-medium text-xs">{transaction.destination}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs font-medium">
                            {formatDateTime(transaction.transaction_date).split(',')[0]}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs font-medium">{transaction.created_by}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      {transaction.status === 'pending' && (
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  )
}