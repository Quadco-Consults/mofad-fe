'use client'

import { useState } from 'react'
import { Search, Plus, Edit, Trash2, Eye, TrendingUp, DollarSign, CreditCard, Building } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AppLayout } from '@/components/layout/AppLayout'

interface Account {
  id: string
  accountNumber: string
  accountName: string
  accountType: string
  bankName: string
  bankCode: string
  balance: number
  currency: string
  status: 'active' | 'inactive' | 'frozen'
  openingDate: string
  description: string
  lastTransactionDate: string
  monthlyInflow: number
  monthlyOutflow: number
  accountOfficer: string
  branch: string
}

const mockAccounts: Account[] = [
  {
    id: '1',
    accountNumber: '1234567890',
    accountName: 'MOFAD Energy Solutions - Operations',
    accountType: 'Current Account',
    bankName: 'First Bank of Nigeria',
    bankCode: '011',
    balance: 125000000,
    currency: 'NGN',
    status: 'active',
    openingDate: '2023-01-15',
    description: 'Main operations account for daily business transactions',
    lastTransactionDate: '2024-12-16T15:30:00Z',
    monthlyInflow: 45000000,
    monthlyOutflow: 38000000,
    accountOfficer: 'Mrs. Amina Hassan',
    branch: 'Victoria Island'
  },
  {
    id: '2',
    accountNumber: '2345678901',
    accountName: 'MOFAD Energy Solutions - Payroll',
    accountType: 'Current Account',
    bankName: 'Zenith Bank',
    bankCode: '057',
    balance: 15000000,
    currency: 'NGN',
    status: 'active',
    openingDate: '2023-02-01',
    description: 'Dedicated payroll account for staff salaries and benefits',
    lastTransactionDate: '2024-12-15T09:00:00Z',
    monthlyInflow: 12000000,
    monthlyOutflow: 11500000,
    accountOfficer: 'Mr. Chinedu Okwu',
    branch: 'Ikeja'
  },
  {
    id: '3',
    accountNumber: '3456789012',
    accountName: 'MOFAD Energy Solutions - Savings',
    accountType: 'Savings Account',
    bankName: 'United Bank for Africa',
    bankCode: '033',
    balance: 85000000,
    currency: 'NGN',
    status: 'active',
    openingDate: '2023-01-15',
    description: 'Long-term savings and investment account',
    lastTransactionDate: '2024-12-12T14:20:00Z',
    monthlyInflow: 5000000,
    monthlyOutflow: 2000000,
    accountOfficer: 'Mrs. Fatima Abdullahi',
    branch: 'Abuja Main'
  },
  {
    id: '4',
    accountNumber: '4567890123',
    accountName: 'MOFAD Energy Solutions - USD Operations',
    accountType: 'Domiciliary Account',
    bankName: 'Guaranty Trust Bank',
    bankCode: '058',
    balance: 850000,
    currency: 'USD',
    status: 'active',
    openingDate: '2023-03-10',
    description: 'USD denominated account for international transactions',
    lastTransactionDate: '2024-12-10T11:45:00Z',
    monthlyInflow: 120000,
    monthlyOutflow: 95000,
    accountOfficer: 'Mr. Olumide Adeyemi',
    branch: 'Victoria Island'
  },
  {
    id: '5',
    accountNumber: '5678901234',
    accountName: 'MOFAD Energy Solutions - Fixed Deposit',
    accountType: 'Fixed Deposit',
    bankName: 'Access Bank',
    bankCode: '044',
    balance: 200000000,
    currency: 'NGN',
    status: 'active',
    openingDate: '2023-06-01',
    description: '12-month fixed deposit investment - Maturity: June 2024',
    lastTransactionDate: '2024-06-01T10:00:00Z',
    monthlyInflow: 0,
    monthlyOutflow: 0,
    accountOfficer: 'Mrs. Blessing Okonkwo',
    branch: 'Lagos Island'
  },
  {
    id: '6',
    accountNumber: '6789012345',
    accountName: 'MOFAD Energy Solutions - Petty Cash',
    accountType: 'Current Account',
    bankName: 'Sterling Bank',
    bankCode: '232',
    balance: 2500000,
    currency: 'NGN',
    status: 'active',
    openingDate: '2023-04-15',
    description: 'Petty cash and miscellaneous expenses account',
    lastTransactionDate: '2024-12-16T08:30:00Z',
    monthlyInflow: 1500000,
    monthlyOutflow: 1400000,
    accountOfficer: 'Mr. Emeka Nwosu',
    branch: 'Surulere'
  },
  {
    id: '7',
    accountNumber: '7890123456',
    accountName: 'MOFAD Energy Solutions - Legacy',
    accountType: 'Current Account',
    bankName: 'Fidelity Bank',
    bankCode: '070',
    balance: 500000,
    currency: 'NGN',
    status: 'inactive',
    openingDate: '2020-01-01',
    description: 'Legacy account - no longer in active use',
    lastTransactionDate: '2024-01-15T16:00:00Z',
    monthlyInflow: 0,
    monthlyOutflow: 0,
    accountOfficer: 'Mr. Ibrahim Garba',
    branch: 'Kaduna'
  }
]

function AccountsPage() {
  const [accounts] = useState<Account[]>(mockAccounts)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [bankFilter, setBankFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)

  const accountTypes = Array.from(new Set(accounts.map(a => a.accountType)))
  const banks = Array.from(new Set(accounts.map(a => a.bankName)))

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.accountNumber.includes(searchTerm) ||
                         account.bankName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === 'all' || account.accountType === typeFilter
    const matchesStatus = statusFilter === 'all' || account.status === statusFilter
    const matchesBank = bankFilter === 'all' || account.bankName === bankFilter

    return matchesSearch && matchesType && matchesStatus && matchesBank
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      frozen: 'bg-red-100 text-red-800'
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'Current Account': return <CreditCard className="h-4 w-4" />
      case 'Savings Account': return <DollarSign className="h-4 w-4" />
      case 'Fixed Deposit': return <TrendingUp className="h-4 w-4" />
      case 'Domiciliary Account': return <Building className="h-4 w-4" />
      default: return <CreditCard className="h-4 w-4" />
    }
  }

  // Calculate summary stats
  const totalAccounts = accounts.length
  const activeAccounts = accounts.filter(a => a.status === 'active').length
  const totalBalance = accounts.filter(a => a.currency === 'NGN' && a.status === 'active').reduce((sum, a) => sum + a.balance, 0)
  const usdBalance = accounts.filter(a => a.currency === 'USD' && a.status === 'active').reduce((sum, a) => sum + a.balance, 0)

  const handleView = (account: Account) => {
    setSelectedAccount(account)
    setShowViewModal(true)
  }

  const handleEdit = (account: Account) => {
    setSelectedAccount(account)
    setShowEditModal(true)
  }

  const handleDelete = (accountId: string) => {
    if (confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      console.log('Deleting account:', accountId)
    }
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bank Accounts</h1>
            <p className="text-gray-600">Manage all company bank accounts and financial holdings</p>
          </div>
          <Button className="mofad-btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Accounts</p>
                <p className="text-2xl font-bold text-gray-900">{totalAccounts}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Accounts</p>
                <p className="text-2xl font-bold text-green-600">{activeAccounts}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Balance (NGN)</p>
                <p className="text-2xl font-bold text-primary-600">{formatCurrency(totalBalance)}</p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">USD Holdings</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(usdBalance, 'USD')}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
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
              placeholder="Search accounts..."
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
            {accountTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="frozen">Frozen</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={bankFilter}
            onChange={(e) => setBankFilter(e.target.value)}
          >
            <option value="all">All Banks</option>
            {banks.map(bank => (
              <option key={bank} value={bank}>{bank}</option>
            ))}
          </select>

          <Button variant="outline">
            Generate Report
          </Button>
        </div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAccounts.map((account) => (
            <div key={account.id} className="mofad-card">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {getAccountTypeIcon(account.accountType)}
                      <h3 className="text-lg font-semibold text-gray-900">{account.accountName}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(account.status)}`}>
                      {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{account.description}</p>
                  <div className="text-xs text-gray-500">
                    Account No: {account.accountNumber} | Opened: {formatDate(account.openingDate)}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleView(account)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(account)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(account.id)} className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Bank Details */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{account.bankName}</span>
                  <span className="text-xs text-gray-500">Code: {account.bankCode}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {account.accountType} | {account.branch} Branch
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Officer: {account.accountOfficer}
                </div>
              </div>

              {/* Balance */}
              <div className="mb-4 text-center p-4 bg-primary-50 rounded-lg">
                <div className="text-3xl font-bold text-primary-900 mb-1">
                  {formatCurrency(account.balance, account.currency)}
                </div>
                <div className="text-sm text-primary-700">Available Balance</div>
              </div>

              {/* Monthly Flow */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(account.monthlyInflow, account.currency)}
                  </div>
                  <div className="text-xs text-gray-600">Monthly Inflow</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">
                    {formatCurrency(account.monthlyOutflow, account.currency)}
                  </div>
                  <div className="text-xs text-gray-600">Monthly Outflow</div>
                </div>
              </div>

              {/* Last Transaction */}
              <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-200">
                <span>Last Transaction</span>
                <span>{new Date(account.lastTransactionDate).toLocaleDateString()}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="flex-1">
                  View Transactions
                </Button>
                <Button variant="outline" className="flex-1">
                  Transfer
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredAccounts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No accounts found matching your criteria.</p>
          </div>
        )}

        {/* Add Account Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">Add New Bank Account</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                      <option>Select Bank</option>
                      <option>First Bank of Nigeria</option>
                      <option>Zenith Bank</option>
                      <option>United Bank for Africa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                      <option>Current Account</option>
                      <option>Savings Account</option>
                      <option>Fixed Deposit</option>
                      <option>Domiciliary Account</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" rows={3}></textarea>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Initial Balance</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                      <option>NGN</option>
                      <option>USD</option>
                      <option>EUR</option>
                      <option>GBP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button className="mofad-btn-primary">Create Account</Button>
              </div>
            </div>
          </div>
        )}

        {/* View Account Modal */}
        {showViewModal && selectedAccount && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <h3 className="text-lg font-bold mb-4">Account Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account Name</label>
                    <p className="text-sm text-gray-900">{selectedAccount.accountName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account Number</label>
                    <p className="text-sm text-gray-900">{selectedAccount.accountNumber}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bank</label>
                    <p className="text-sm text-gray-900">{selectedAccount.bankName} ({selectedAccount.bankCode})</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <p className="text-sm text-gray-900">{selectedAccount.accountType}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="text-sm text-gray-900">{selectedAccount.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Balance</label>
                    <p className="text-lg font-bold text-primary-600">{formatCurrency(selectedAccount.balance, selectedAccount.currency)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusBadge(selectedAccount.status)}`}>
                      {selectedAccount.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => setShowViewModal(false)}>Close</Button>
                <Button className="mofad-btn-primary">View Transactions</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default AccountsPage