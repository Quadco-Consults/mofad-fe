'use client'

import { useState } from 'react'
import { Search, Filter, Download, TrendingUp, ShoppingCart, Package } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface SubstoreTransaction {
  id: string
  transactionId: string
  substoreId: string
  substoreName: string
  customerId: string
  customerName: string
  date: string
  products: Array<{
    id: string
    name: string
    quantity: number
    unitPrice: number
    total: number
  }>
  total: number
  paymentMethod: string
  status: 'completed' | 'pending' | 'cancelled'
  salesRepresentative: string
}

const mockTransactions: SubstoreTransaction[] = [
  {
    id: '1',
    transactionId: 'TXN-SS-001234',
    substoreId: 'SS001',
    substoreName: 'Lagos Island Substore',
    customerId: 'CUST-001',
    customerName: 'Conoil Petroleum Ltd',
    date: '2024-12-16T10:30:00Z',
    products: [
      {
        id: 'PRD001',
        name: 'Mobil Super 3000 5W-40',
        quantity: 50,
        unitPrice: 8500,
        total: 425000
      },
      {
        id: 'PRD002',
        name: 'Shell Helix Ultra 0W-20',
        quantity: 25,
        unitPrice: 9200,
        total: 230000
      }
    ],
    total: 655000,
    paymentMethod: 'Bank Transfer',
    status: 'completed',
    salesRepresentative: 'Adebayo Johnson'
  },
  {
    id: '2',
    transactionId: 'TXN-SS-001235',
    substoreId: 'SS002',
    substoreName: 'Abuja Central Substore',
    customerId: 'CUST-015',
    customerName: 'MRS Oil Nigeria Plc',
    date: '2024-12-15T14:15:00Z',
    products: [
      {
        id: 'PRD003',
        name: 'Total Quartz 9000 5W-30',
        quantity: 100,
        unitPrice: 7800,
        total: 780000
      }
    ],
    total: 780000,
    paymentMethod: 'Credit',
    status: 'completed',
    salesRepresentative: 'Fatima Usman'
  },
  {
    id: '3',
    transactionId: 'TXN-SS-001236',
    substoreId: 'SS003',
    substoreName: 'Port Harcourt Substore',
    customerId: 'CUST-023',
    customerName: 'Oando Marketing Plc',
    date: '2024-12-15T09:45:00Z',
    products: [
      {
        id: 'PRD004',
        name: 'Castrol GTX 20W-50',
        quantity: 75,
        unitPrice: 6500,
        total: 487500
      },
      {
        id: 'PRD005',
        name: 'Mobil Delvac 15W-40',
        quantity: 30,
        unitPrice: 12000,
        total: 360000
      }
    ],
    total: 847500,
    paymentMethod: 'Cash',
    status: 'completed',
    salesRepresentative: 'Emeka Okafor'
  },
  {
    id: '4',
    transactionId: 'TXN-SS-001237',
    substoreId: 'SS001',
    substoreName: 'Lagos Island Substore',
    customerId: 'CUST-008',
    customerName: 'Forte Oil Marketing Ltd',
    date: '2024-12-14T16:20:00Z',
    products: [
      {
        id: 'PRD006',
        name: 'Shell Rotella T6 5W-40',
        quantity: 40,
        unitPrice: 11500,
        total: 460000
      }
    ],
    total: 460000,
    paymentMethod: 'Bank Transfer',
    status: 'pending',
    salesRepresentative: 'Adebayo Johnson'
  },
  {
    id: '5',
    transactionId: 'TXN-SS-001238',
    substoreId: 'SS004',
    substoreName: 'Kano Substore',
    customerId: 'CUST-012',
    customerName: 'AA Rano Stations Ltd',
    date: '2024-12-14T11:10:00Z',
    products: [
      {
        id: 'PRD001',
        name: 'Mobil Super 3000 5W-40',
        quantity: 20,
        unitPrice: 8500,
        total: 170000
      },
      {
        id: 'PRD007',
        name: 'Valvoline MaxLife 10W-40',
        quantity: 35,
        unitPrice: 7200,
        total: 252000
      }
    ],
    total: 422000,
    paymentMethod: 'Credit',
    status: 'completed',
    salesRepresentative: 'Ibrahim Musa'
  }
]

export default function SubstoreTransactionsPage() {
  const [transactions] = useState<SubstoreTransaction[]>(mockTransactions)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'cancelled'>('all')
  const [substoreFilter, setSubstoreFilter] = useState<string>('all')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')

  const substores = Array.from(new Set(transactions.map(t => t.substoreName)))
  const paymentMethods = Array.from(new Set(transactions.map(t => t.paymentMethod)))

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.substoreName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter
    const matchesSubstore = substoreFilter === 'all' || transaction.substoreName === substoreFilter
    const matchesPayment = paymentFilter === 'all' || transaction.paymentMethod === paymentFilter

    return matchesSearch && matchesStatus && matchesSubstore && matchesPayment
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const getPaymentBadge = (method: string) => {
    const styles = {
      'Cash': 'bg-blue-100 text-blue-800',
      'Bank Transfer': 'bg-purple-100 text-purple-800',
      'Credit': 'bg-orange-100 text-orange-800'
    }
    return styles[method as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  // Calculate summary stats
  const totalTransactions = transactions.length
  const completedTransactions = transactions.filter(t => t.status === 'completed').length
  const totalRevenue = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.total, 0)
  const avgTransactionValue = totalRevenue / completedTransactions || 0

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Substore Transactions</h1>
          <p className="text-gray-600">Track sales and transactions across all substores</p>
        </div>
        <Button className="mofad-btn-primary">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="mofad-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{totalTransactions}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="mofad-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedTransactions}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="mofad-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-primary-600">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="mofad-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Transaction</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(avgTransactionValue)}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          value={substoreFilter}
          onChange={(e) => setSubstoreFilter(e.target.value)}
        >
          <option value="all">All Substores</option>
          {substores.map(substore => (
            <option key={substore} value={substore}>{substore}</option>
          ))}
        </select>

        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
        >
          <option value="all">All Payments</option>
          {paymentMethods.map(method => (
            <option key={method} value={method}>{method}</option>
          ))}
        </select>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Substore
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales Rep
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-primary-600">{transaction.transactionId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{transaction.customerName}</div>
                    <div className="text-sm text-gray-500">{transaction.customerId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{transaction.substoreName}</div>
                    <div className="text-sm text-gray-500">{transaction.substoreId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(transaction.date)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {transaction.products.slice(0, 2).map((product, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium text-gray-900">{product.name}</span>
                          <span className="text-gray-500 ml-2">({product.quantity} units)</span>
                        </div>
                      ))}
                      {transaction.products.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{transaction.products.length - 2} more items
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{formatCurrency(transaction.total)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentBadge(transaction.paymentMethod)}`}>
                      {transaction.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(transaction.status)}`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{transaction.salesRepresentative}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredTransactions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No transactions found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}