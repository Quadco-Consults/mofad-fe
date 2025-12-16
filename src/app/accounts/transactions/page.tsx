'use client'

import { useState } from 'react'
import { Search, Filter, Download, Plus, Eye, Edit, ArrowUpRight, ArrowDownLeft, Building, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AppLayout } from '@/components/layout/AppLayout'

interface AccountTransaction {
  id: string
  transactionId: string
  accountId: string
  accountName: string
  date: string
  type: 'debit' | 'credit'
  category: string
  description: string
  amount: number
  balance: number
  reference: string
  beneficiary?: string
  channel: string
  status: 'completed' | 'pending' | 'failed'
  initiatedBy: string
  approvedBy?: string
  bankCharges: number
  currency: string
}

const mockAccountTransactions: AccountTransaction[] = [
  {
    id: '1',
    transactionId: 'TXN-ACC-001234',
    accountId: 'ACC-001',
    accountName: 'MOFAD Energy Solutions - Operations',
    date: '2024-12-16T10:30:00Z',
    type: 'credit',
    category: 'Customer Payment',
    description: 'Payment received from Conoil Petroleum Ltd for Invoice INV-001234',
    amount: 25000000,
    balance: 125000000,
    reference: 'REF-CONOIL-001234',
    beneficiary: 'MOFAD Energy Solutions Ltd',
    channel: 'Bank Transfer',
    status: 'completed',
    initiatedBy: 'System Auto',
    approvedBy: 'Adebayo Johnson',
    bankCharges: 5250,
    currency: 'NGN'
  },
  {
    id: '2',
    transactionId: 'TXN-ACC-001235',
    accountId: 'ACC-001',
    accountName: 'MOFAD Energy Solutions - Operations',
    date: '2024-12-15T14:20:00Z',
    type: 'debit',
    category: 'Supplier Payment',
    description: 'Payment to Shell Nigeria Ltd for product procurement',
    amount: 18500000,
    balance: 100000000,
    reference: 'REF-SHELL-001235',
    beneficiary: 'Shell Nigeria Limited',
    channel: 'RTGS Transfer',
    status: 'completed',
    initiatedBy: 'Fatima Usman',
    approvedBy: 'CEO Office',
    bankCharges: 12500,
    currency: 'NGN'
  },
  {
    id: '3',
    transactionId: 'TXN-ACC-001236',
    accountId: 'ACC-002',
    accountName: 'MOFAD Energy Solutions - Payroll',
    date: '2024-12-15T09:00:00Z',
    type: 'debit',
    category: 'Salary Payment',
    description: 'December 2024 staff salary payments',
    amount: 8500000,
    balance: 15000000,
    reference: 'SAL-DEC-2024',
    beneficiary: 'Multiple Staff Accounts',
    channel: 'Bulk Transfer',
    status: 'completed',
    initiatedBy: 'HR Department',
    approvedBy: 'Finance Manager',
    bankCharges: 25000,
    currency: 'NGN'
  },
  {
    id: '4',
    transactionId: 'TXN-ACC-001237',
    accountId: 'ACC-003',
    accountName: 'MOFAD Energy Solutions - Savings',
    date: '2024-12-14T16:15:00Z',
    type: 'credit',
    category: 'Interest Earned',
    description: 'Monthly interest credited on savings account',
    amount: 425000,
    balance: 85000000,
    reference: 'INT-NOV-2024',
    beneficiary: 'MOFAD Energy Solutions Ltd',
    channel: 'Auto Credit',
    status: 'completed',
    initiatedBy: 'Bank System',
    bankCharges: 0,
    currency: 'NGN'
  },
  {
    id: '5',
    transactionId: 'TXN-ACC-001238',
    accountId: 'ACC-004',
    accountName: 'MOFAD Energy Solutions - USD Operations',
    date: '2024-12-13T11:45:00Z',
    type: 'credit',
    category: 'Foreign Exchange',
    description: 'USD receipt from international supplier prepayment',
    amount: 75000,
    balance: 850000,
    reference: 'FX-PREP-001238',
    beneficiary: 'MOFAD Energy Solutions Ltd',
    channel: 'SWIFT Transfer',
    status: 'completed',
    initiatedBy: 'Treasury Dept',
    approvedBy: 'CFO',
    bankCharges: 250,
    currency: 'USD'
  },
  {
    id: '6',
    transactionId: 'TXN-ACC-001239',
    accountId: 'ACC-001',
    accountName: 'MOFAD Energy Solutions - Operations',
    date: '2024-12-12T13:30:00Z',
    type: 'debit',
    category: 'Operating Expenses',
    description: 'Monthly rent payment for Lagos warehouse facility',
    amount: 2800000,
    balance: 118500000,
    reference: 'RENT-DEC-2024-LG',
    beneficiary: 'Landmark Properties Ltd',
    channel: 'Online Transfer',
    status: 'completed',
    initiatedBy: 'Facilities Manager',
    approvedBy: 'Operations Manager',
    bankCharges: 1050,
    currency: 'NGN'
  },
  {
    id: '7',
    transactionId: 'TXN-ACC-001240',
    accountId: 'ACC-006',
    accountName: 'MOFAD Energy Solutions - Petty Cash',
    date: '2024-12-11T08:20:00Z',
    type: 'debit',
    category: 'Miscellaneous',
    description: 'Office supplies and maintenance expenses',
    amount: 185000,
    balance: 2500000,
    reference: 'MISC-001240',
    beneficiary: 'Various Suppliers',
    channel: 'Multiple Payments',
    status: 'completed',
    initiatedBy: 'Admin Officer',
    approvedBy: 'Office Manager',
    bankCharges: 750,
    currency: 'NGN'
  },
  {
    id: '8',
    transactionId: 'TXN-ACC-001241',
    accountId: 'ACC-001',
    accountName: 'MOFAD Energy Solutions - Operations',
    date: '2024-12-10T15:45:00Z',
    type: 'credit',
    category: 'Customer Payment',
    description: 'Payment from MRS Oil Nigeria for bulk lubricant purchase',
    amount: 15750000,
    balance: 121300000,
    reference: 'REF-MRS-001241',
    beneficiary: 'MOFAD Energy Solutions Ltd',
    channel: 'Bank Transfer',
    status: 'pending',
    initiatedBy: 'Customer',
    bankCharges: 0,
    currency: 'NGN'
  }
]

function AccountTransactionsPage() {
  const [transactions] = useState<AccountTransaction[]>(mockAccountTransactions)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [accountFilter, setAccountFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<AccountTransaction | null>(null)

  const categories = Array.from(new Set(transactions.map(t => t.category)))
  const accounts = Array.from(new Set(transactions.map(t => t.accountName)))

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === 'all' || transaction.type === typeFilter
    const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter
    const matchesAccount = accountFilter === 'all' || transaction.accountName === accountFilter

    return matchesSearch && matchesType && matchesCategory && matchesStatus && matchesAccount
  })

  const formatCurrency = (amount: number, currency: string = 'NGN') => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
      }).format(amount)
    }
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

  const getTransactionIcon = (type: string) => {
    return type === 'credit'
      ? <ArrowDownLeft className="h-4 w-4 text-green-600" />
      : <ArrowUpRight className="h-4 w-4 text-red-600" />
  }

  const getTypeBadge = (type: string) => {
    return type === 'credit'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800'
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const getAmountColor = (type: string) => {
    return type === 'credit' ? 'text-green-600' : 'text-red-600'
  }

  // Calculate summary stats
  const totalTransactions = transactions.length
  const completedTransactions = transactions.filter(t => t.status === 'completed').length
  const totalDebits = transactions.filter(t => t.type === 'debit' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0)
  const totalCredits = transactions.filter(t => t.type === 'credit' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0)

  const handleView = (transaction: AccountTransaction) => {
    setSelectedTransaction(transaction)
    setShowViewModal(true)
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Account Transactions</h1>
            <p className="text-gray-600">Monitor all bank account transactions and movements</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button className="mofad-btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Transaction
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
                <Building className="h-5 w-5 text-blue-600" />
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
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Credits</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalCredits)}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ArrowDownLeft className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Debits</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDebits)}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <ArrowUpRight className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
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
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
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
            <option value="failed">Failed</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
          >
            <option value="all">All Accounts</option>
            {accounts.map(account => (
              <option key={account} value={account}>{account}</option>
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
                    Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
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
                      <div className="text-sm text-gray-900">{transaction.description}</div>
                      <div className="text-xs text-gray-500">
                        {transaction.reference} | {transaction.category}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{transaction.accountName}</div>
                      <div className="text-xs text-gray-500">
                        Balance: {formatCurrency(transaction.balance, transaction.currency)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(transaction.type)}`}>
                          {getTransactionIcon(transaction.type)}
                          <span className="ml-1">{transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</span>
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{transaction.channel}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-bold ${getAmountColor(transaction.type)}`}>
                        {transaction.type === 'credit' ? '+' : '-'}
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </div>
                      {transaction.bankCharges > 0 && (
                        <div className="text-xs text-gray-500">
                          Charges: {formatCurrency(transaction.bankCharges, transaction.currency)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDateTime(transaction.date)}</div>
                      <div className="text-xs text-gray-500">by {transaction.initiatedBy}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusBadge(transaction.status)}`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(transaction)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
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
              <h3 className="text-lg font-bold mb-4">New Account Transaction</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                      <option>Select Account</option>
                      <option>MOFAD Energy - Operations</option>
                      <option>MOFAD Energy - Payroll</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                      <option>Credit</option>
                      <option>Debit</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                      <option>Customer Payment</option>
                      <option>Supplier Payment</option>
                      <option>Operating Expenses</option>
                      <option>Salary Payment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" rows={3}></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Beneficiary</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
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
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">Transaction Details</h3>
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                    <p className="text-sm font-mono text-gray-900">{selectedTransaction.transactionId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Reference</label>
                    <p className="text-sm font-mono text-gray-900">{selectedTransaction.reference}</p>
                  </div>
                </div>

                {/* Account & Amount */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account</label>
                    <p className="text-sm text-gray-900">{selectedTransaction.accountName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <p className={`text-lg font-bold ${getAmountColor(selectedTransaction.type)}`}>
                      {selectedTransaction.type === 'credit' ? '+' : '-'}
                      {formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="text-sm text-gray-900">{selectedTransaction.description}</p>
                </div>

                {/* Transaction Details */}
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <p className="text-sm text-gray-900">{selectedTransaction.category}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Channel</label>
                    <p className="text-sm text-gray-900">{selectedTransaction.channel}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusBadge(selectedTransaction.status)}`}>
                      {selectedTransaction.status}
                    </span>
                  </div>
                </div>

                {/* Parties */}
                {selectedTransaction.beneficiary && (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Initiated By</label>
                      <p className="text-sm text-gray-900">{selectedTransaction.initiatedBy}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Beneficiary</label>
                      <p className="text-sm text-gray-900">{selectedTransaction.beneficiary}</p>
                    </div>
                  </div>
                )}

                {/* Financial Details */}
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bank Charges</label>
                    <p className="text-sm text-gray-900">{formatCurrency(selectedTransaction.bankCharges, selectedTransaction.currency)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Balance After</label>
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(selectedTransaction.balance, selectedTransaction.currency)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <p className="text-sm text-gray-900">{formatDateTime(selectedTransaction.date)}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => setShowViewModal(false)}>Close</Button>
                <Button className="mofad-btn-primary">Print Receipt</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default AccountTransactionsPage