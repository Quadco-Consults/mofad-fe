'use client'

import { useState } from 'react'
import { Search, Filter, Download, Plus, Eye, Edit, Trash2, TrendingUp, CreditCard, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AppLayout } from '@/components/layout/AppLayout'

interface CustomerTransaction {
  id: string
  transactionId: string
  customerId: string
  customerName: string
  customerType: string
  date: string
  type: 'sale' | 'payment' | 'credit' | 'refund'
  description: string
  amount: number
  balance: number
  paymentMethod: string
  status: 'completed' | 'pending' | 'cancelled'
  reference: string
  salesRep: string
  location: string
}

const mockTransactions: CustomerTransaction[] = [
  {
    id: '1',
    transactionId: 'TXN-CUST-001234',
    customerId: 'CUST-001',
    customerName: 'Conoil Petroleum Ltd',
    customerType: 'Major Oil Marketing Companies',
    date: '2024-12-16T10:30:00Z',
    type: 'sale',
    description: 'Bulk purchase of premium lubricants',
    amount: 2500000,
    balance: -1500000,
    paymentMethod: 'Bank Transfer',
    status: 'completed',
    reference: 'REF-CON-001234',
    salesRep: 'Adebayo Johnson',
    location: 'Lagos Island'
  },
  {
    id: '2',
    transactionId: 'TXN-CUST-001235',
    customerId: 'CUST-001',
    customerName: 'Conoil Petroleum Ltd',
    customerType: 'Major Oil Marketing Companies',
    date: '2024-12-15T14:20:00Z',
    type: 'payment',
    description: 'Payment for previous invoice INV-001230',
    amount: 1000000,
    balance: -500000,
    paymentMethod: 'Bank Transfer',
    status: 'completed',
    reference: 'PAY-CON-001235',
    salesRep: 'Adebayo Johnson',
    location: 'Lagos Island'
  },
  {
    id: '3',
    transactionId: 'TXN-CUST-001236',
    customerId: 'CUST-015',
    customerName: 'MRS Oil Nigeria Plc',
    customerType: 'Major Oil Marketing Companies',
    date: '2024-12-14T09:45:00Z',
    type: 'sale',
    description: 'Engine oil and additives purchase',
    amount: 1800000,
    balance: -1800000,
    paymentMethod: 'Credit',
    status: 'pending',
    reference: 'REF-MRS-001236',
    salesRep: 'Fatima Usman',
    location: 'Abuja Central'
  },
  {
    id: '4',
    transactionId: 'TXN-CUST-001237',
    customerId: 'CUST-023',
    customerName: 'Oando Marketing Plc',
    customerType: 'Major Oil Marketing Companies',
    date: '2024-12-13T16:15:00Z',
    type: 'credit',
    description: 'Credit note for returned products',
    amount: 250000,
    balance: 250000,
    paymentMethod: 'Credit Note',
    status: 'completed',
    reference: 'CN-OAN-001237',
    salesRep: 'Emeka Okafor',
    location: 'Port Harcourt'
  },
  {
    id: '5',
    transactionId: 'TXN-CUST-001238',
    customerId: 'CUST-045',
    customerName: 'Lagos State Transport Corp',
    customerType: 'Government Agencies',
    date: '2024-12-12T11:30:00Z',
    type: 'sale',
    description: 'Fleet maintenance lubricants',
    amount: 890000,
    balance: -890000,
    paymentMethod: 'Government Voucher',
    status: 'completed',
    reference: 'REF-LSTC-001238',
    salesRep: 'Kemi Adebola',
    location: 'Lagos Island'
  },
  {
    id: '6',
    transactionId: 'TXN-CUST-001239',
    customerId: 'CUST-067',
    customerName: 'ABC Transport Ltd',
    customerType: 'Fleet Operators',
    date: '2024-12-11T13:45:00Z',
    type: 'payment',
    description: 'Partial payment for outstanding balance',
    amount: 500000,
    balance: -300000,
    paymentMethod: 'Cash',
    status: 'completed',
    reference: 'PAY-ABC-001239',
    salesRep: 'Ibrahim Musa',
    location: 'Kano'
  }
]

function CustomerTransactionsPage() {
  const [transactions] = useState<CustomerTransaction[]>(mockTransactions)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [customerTypeFilter, setCustomerTypeFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<CustomerTransaction | null>(null)

  const transactionTypes = Array.from(new Set(transactions.map(t => t.type)))
  const customerTypes = Array.from(new Set(transactions.map(t => t.customerType)))

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === 'all' || transaction.type === typeFilter
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter
    const matchesCustomerType = customerTypeFilter === 'all' || transaction.customerType === customerTypeFilter

    return matchesSearch && matchesType && matchesStatus && matchesCustomerType
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sale': return <TrendingUp className="h-4 w-4" />
      case 'payment': return <CreditCard className="h-4 w-4" />
      case 'credit': return <Clock className="h-4 w-4" />
      case 'refund': return <TrendingUp className="h-4 w-4 rotate-180" />
      default: return <TrendingUp className="h-4 w-4" />
    }
  }

  const getTypeBadge = (type: string) => {
    const styles = {
      sale: 'bg-green-100 text-green-800',
      payment: 'bg-blue-100 text-blue-800',
      credit: 'bg-yellow-100 text-yellow-800',
      refund: 'bg-red-100 text-red-800'
    }
    return styles[type as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const getAmountColor = (type: string, amount: number) => {
    if (type === 'payment' || type === 'credit') return 'text-green-600'
    if (type === 'refund') return 'text-red-600'
    return 'text-gray-900'
  }

  // Calculate summary stats
  const totalTransactions = transactions.length
  const completedTransactions = transactions.filter(t => t.status === 'completed').length
  const totalSales = transactions.filter(t => t.type === 'sale' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0)
  const totalPayments = transactions.filter(t => t.type === 'payment' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0)

  const handleView = (transaction: CustomerTransaction) => {
    setSelectedTransaction(transaction)
    setShowViewModal(true)
  }

  const handleEdit = (transaction: CustomerTransaction) => {
    setSelectedTransaction(transaction)
    setShowEditModal(true)
  }

  const handleDelete = (transactionId: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      // Handle delete logic here
      console.log('Deleting transaction:', transactionId)
    }
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Transactions</h1>
            <p className="text-gray-600">Track all customer financial activities and payments</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button className="mofad-btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </div>
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
                <TrendingUp className="h-5 w-5 text-blue-600" />
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
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-primary-600">{formatCurrency(totalSales)}</p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPayments)}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
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
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            {transactionTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={customerTypeFilter}
            onChange={(e) => setCustomerTypeFilter(e.target.value)}
          >
            <option value="all">All Customer Types</option>
            {customerTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-primary-600">{transaction.transactionId}</div>
                      <div className="text-sm text-gray-500">{transaction.description}</div>
                      <div className="text-xs text-gray-400">{transaction.reference}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{transaction.customerName}</div>
                      <div className="text-sm text-gray-500">{transaction.customerType}</div>
                      <div className="text-xs text-gray-400">{transaction.customerId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(transaction.type)}`}>
                          {getTypeIcon(transaction.type)}
                          <span className="ml-1">{transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDateTime(transaction.date)}</div>
                      <div className="text-xs text-gray-500">by {transaction.salesRep}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-bold ${getAmountColor(transaction.type, transaction.amount)}`}>
                        {transaction.type === 'payment' || transaction.type === 'credit' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </div>
                      <div className="text-xs text-gray-500">{transaction.paymentMethod}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${transaction.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(Math.abs(transaction.balance))}
                      </div>
                      <div className="text-xs text-gray-500">
                        {transaction.balance >= 0 ? 'Credit' : 'Outstanding'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusBadge(transaction.status)}`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(transaction)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(transaction)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(transaction.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

        {/* Add Transaction Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">Add New Transaction</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                      <option>Select Customer</option>
                      <option>Conoil Petroleum Ltd</option>
                      <option>MRS Oil Nigeria Plc</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                      <option>Sale</option>
                      <option>Payment</option>
                      <option>Credit</option>
                      <option>Refund</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" rows={3}></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                      <option>Bank Transfer</option>
                      <option>Cash</option>
                      <option>Credit</option>
                      <option>Cheque</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button className="mofad-btn-primary">Create Transaction</Button>
              </div>
            </div>
          </div>
        )}

        {/* View Transaction Modal */}
        {showViewModal && selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <h3 className="text-lg font-bold mb-4">Transaction Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                    <p className="text-sm text-gray-900">{selectedTransaction.transactionId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Reference</label>
                    <p className="text-sm text-gray-900">{selectedTransaction.reference}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer</label>
                  <p className="text-sm text-gray-900">{selectedTransaction.customerName}</p>
                  <p className="text-xs text-gray-500">{selectedTransaction.customerType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="text-sm text-gray-900">{selectedTransaction.description}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(selectedTransaction.amount)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Balance</label>
                    <p className={`text-sm font-bold ${selectedTransaction.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(selectedTransaction.balance))}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusBadge(selectedTransaction.status)}`}>
                      {selectedTransaction.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => setShowViewModal(false)}>Close</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default CustomerTransactionsPage