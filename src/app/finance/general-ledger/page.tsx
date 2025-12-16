'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import {
  BookOpen,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Plus,
  RefreshCw,
  Calendar,
  Building,
  DollarSign,
  FileText,
  TrendingUp,
  PieChart,
  BarChart3,
  Calculator,
  CheckCircle,
  AlertTriangle,
  Database
} from 'lucide-react'

interface GLAccount {
  id: string
  accountCode: string
  accountName: string
  accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  parentAccount?: string
  balance: number
  balanceType: 'debit' | 'credit'
  isActive: boolean
  description: string
  sageAccountCode: string
  lastModified: string
}

interface GLTransaction {
  id: string
  transactionDate: string
  reference: string
  description: string
  journalType: 'sales' | 'purchase' | 'payment' | 'receipt' | 'journal' | 'opening'
  totalAmount: number
  status: 'posted' | 'draft' | 'pending'
  createdBy: string
  sageReference: string
  entries: Array<{
    accountCode: string
    accountName: string
    debitAmount: number
    creditAmount: number
  }>
}

const getAccountTypeColor = (type: string) => {
  switch (type) {
    case 'asset':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'liability':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'equity':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'revenue':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'expense':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'posted':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'draft':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'pending':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export default function GeneralLedgerPage() {
  const [activeTab, setActiveTab] = useState<'accounts' | 'transactions' | 'reports'>('accounts')
  const [searchTerm, setSearchTerm] = useState('')
  const [accountTypeFilter, setAccountTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRange, setDateRange] = useState('month')

  const { data: glData, isLoading } = useQuery({
    queryKey: ['general-ledger', activeTab, dateRange],
    queryFn: () => apiClient.get(`/finance/general-ledger?tab=${activeTab}&range=${dateRange}`),
  })

  // Mock GL Accounts data
  const glAccounts: GLAccount[] = [
    {
      id: '1',
      accountCode: '1000',
      accountName: 'Cash in Hand',
      accountType: 'asset',
      balance: 2500000,
      balanceType: 'debit',
      isActive: true,
      description: 'Physical cash on premises',
      sageAccountCode: '1000',
      lastModified: '2024-01-30'
    },
    {
      id: '2',
      accountCode: '1010',
      accountName: 'Bank Account - First Bank',
      accountType: 'asset',
      balance: 42780000,
      balanceType: 'debit',
      isActive: true,
      description: 'Primary operating account',
      sageAccountCode: '1010',
      lastModified: '2024-01-30'
    },
    {
      id: '3',
      accountCode: '1200',
      accountName: 'Accounts Receivable',
      accountType: 'asset',
      balance: 128500000,
      balanceType: 'debit',
      isActive: true,
      description: 'Customer outstanding balances',
      sageAccountCode: '1200',
      lastModified: '2024-01-30'
    },
    {
      id: '4',
      accountCode: '1500',
      accountName: 'Petroleum Inventory',
      accountType: 'asset',
      balance: 456000000,
      balanceType: 'debit',
      isActive: true,
      description: 'PMS, AGO, LPFO inventory valuation',
      sageAccountCode: '1500',
      lastModified: '2024-01-30'
    },
    {
      id: '5',
      accountCode: '2000',
      accountName: 'Accounts Payable',
      accountType: 'liability',
      balance: 67300000,
      balanceType: 'credit',
      isActive: true,
      description: 'Supplier outstanding balances',
      sageAccountCode: '2000',
      lastModified: '2024-01-30'
    },
    {
      id: '6',
      accountCode: '3000',
      accountName: 'Share Capital',
      accountType: 'equity',
      balance: 100000000,
      balanceType: 'credit',
      isActive: true,
      description: 'Authorized and issued share capital',
      sageAccountCode: '3000',
      lastModified: '2024-01-30'
    },
    {
      id: '7',
      accountCode: '4000',
      accountName: 'Product Sales Revenue',
      accountType: 'revenue',
      balance: 892400000,
      balanceType: 'credit',
      isActive: true,
      description: 'Revenue from petroleum product sales',
      sageAccountCode: '4000',
      lastModified: '2024-01-30'
    },
    {
      id: '8',
      accountCode: '5000',
      accountName: 'Cost of Goods Sold',
      accountType: 'expense',
      balance: 623800000,
      balanceType: 'debit',
      isActive: true,
      description: 'Direct cost of petroleum products sold',
      sageAccountCode: '5000',
      lastModified: '2024-01-30'
    }
  ]

  // Mock GL Transactions data
  const glTransactions: GLTransaction[] = [
    {
      id: '1',
      transactionDate: '2024-01-30',
      reference: 'JRN-2024-001234',
      description: 'Product Sales - Total Nigeria Plc',
      journalType: 'sales',
      totalAmount: 45600000,
      status: 'posted',
      createdBy: 'Sales Team',
      sageReference: 'SAGE-JRN-001234',
      entries: [
        { accountCode: '1200', accountName: 'Accounts Receivable', debitAmount: 45600000, creditAmount: 0 },
        { accountCode: '4000', accountName: 'Product Sales Revenue', debitAmount: 0, creditAmount: 45600000 }
      ]
    },
    {
      id: '2',
      transactionDate: '2024-01-29',
      reference: 'JRN-2024-001235',
      description: 'Payment Received - Mobil Oil Nigeria',
      journalType: 'receipt',
      totalAmount: 28900000,
      status: 'posted',
      createdBy: 'Finance Team',
      sageReference: 'SAGE-JRN-001235',
      entries: [
        { accountCode: '1010', accountName: 'Bank Account - First Bank', debitAmount: 28900000, creditAmount: 0 },
        { accountCode: '1200', accountName: 'Accounts Receivable', debitAmount: 0, creditAmount: 28900000 }
      ]
    },
    {
      id: '3',
      transactionDate: '2024-01-28',
      reference: 'JRN-2024-001236',
      description: 'Inventory Purchase - NNPC',
      journalType: 'purchase',
      totalAmount: 450000000,
      status: 'posted',
      createdBy: 'Procurement Team',
      sageReference: 'SAGE-JRN-001236',
      entries: [
        { accountCode: '1500', accountName: 'Petroleum Inventory', debitAmount: 450000000, creditAmount: 0 },
        { accountCode: '2000', accountName: 'Accounts Payable', debitAmount: 0, creditAmount: 450000000 }
      ]
    },
    {
      id: '4',
      transactionDate: '2024-01-27',
      reference: 'JRN-2024-001237',
      description: 'Operating Expenses - January',
      journalType: 'journal',
      totalAmount: 15600000,
      status: 'pending',
      createdBy: 'Finance Manager',
      sageReference: 'SAGE-JRN-001237',
      entries: [
        { accountCode: '5100', accountName: 'Operating Expenses', debitAmount: 15600000, creditAmount: 0 },
        { accountCode: '1010', accountName: 'Bank Account - First Bank', debitAmount: 0, creditAmount: 15600000 }
      ]
    }
  ]

  const filteredAccounts = glAccounts.filter(account => {
    const matchesSearch = account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.accountCode.includes(searchTerm)
    const matchesType = accountTypeFilter === 'all' || account.accountType === accountTypeFilter
    return matchesSearch && matchesType
  })

  const filteredTransactions = glTransactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference.includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Calculate account type totals
  const accountTypeTotals = {
    asset: glAccounts.filter(acc => acc.accountType === 'asset').reduce((sum, acc) => sum + acc.balance, 0),
    liability: glAccounts.filter(acc => acc.accountType === 'liability').reduce((sum, acc) => sum + acc.balance, 0),
    equity: glAccounts.filter(acc => acc.accountType === 'equity').reduce((sum, acc) => sum + acc.balance, 0),
    revenue: glAccounts.filter(acc => acc.accountType === 'revenue').reduce((sum, acc) => sum + acc.balance, 0),
    expense: glAccounts.filter(acc => acc.accountType === 'expense').reduce((sum, acc) => sum + acc.balance, 0)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center">
              <BookOpen className="h-6 w-6 mr-2" />
              General Ledger
            </h1>
            <p className="text-muted-foreground">SAGE-integrated chart of accounts and transactions</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync with SAGE
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Button>
          </div>
        </div>

        {/* SAGE Integration Status */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">SAGE General Ledger</h3>
                  <p className="text-sm text-green-600">Connected • Real-time sync enabled</p>
                </div>
              </div>
              <div className="text-right text-sm text-gray-600">
                <p>Last sync: {new Date().toLocaleTimeString()}</p>
                <p>Chart of accounts: {glAccounts.length} accounts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Type Summary */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(accountTypeTotals).map(([type, total]) => (
            <Card key={type}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground capitalize">{type}s</p>
                    <p className="text-xl font-bold">{formatCurrency(total)}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getAccountTypeColor(type)}`}>
                    {type}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2">
          {[
            { id: 'accounts', label: 'Chart of Accounts', icon: Building },
            { id: 'transactions', label: 'Journal Entries', icon: FileText },
            { id: 'reports', label: 'GL Reports', icon: BarChart3 }
          ].map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {activeTab === 'accounts' && (
                <select
                  className="px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring"
                  value={accountTypeFilter}
                  onChange={(e) => setAccountTypeFilter(e.target.value)}
                >
                  <option value="all">All Account Types</option>
                  <option value="asset">Assets</option>
                  <option value="liability">Liabilities</option>
                  <option value="equity">Equity</option>
                  <option value="revenue">Revenue</option>
                  <option value="expense">Expenses</option>
                </select>
              )}

              {activeTab === 'transactions' && (
                <>
                  <select
                    className="px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="posted">Posted</option>
                    <option value="pending">Pending</option>
                    <option value="draft">Draft</option>
                  </select>
                  <select
                    className="px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                  >
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                  </select>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content based on active tab */}
        {activeTab === 'accounts' && (
          <Card>
            <CardHeader>
              <CardTitle>Chart of Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Account Code</th>
                      <th className="text-left py-3 px-4">Account Name</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Balance</th>
                      <th className="text-left py-3 px-4">SAGE Code</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.map((account) => (
                      <tr key={account.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-mono">{account.accountCode}</td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{account.accountName}</p>
                            <p className="text-sm text-muted-foreground">{account.description}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getAccountTypeColor(account.accountType)}`}>
                            {account.accountType}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(account.balance)}</p>
                            <p className="text-sm text-muted-foreground capitalize">{account.balanceType}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-sm text-muted-foreground">
                          {account.sageAccountCode}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'transactions' && (
          <Card>
            <CardHeader>
              <CardTitle>Journal Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold">{transaction.reference}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {transaction.journalType.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{transaction.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                          <span>Date: {formatDateTime(transaction.transactionDate).split(',')[0]}</span>
                          <span>By: {transaction.createdBy}</span>
                          <span>SAGE: {transaction.sageReference}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(transaction.totalAmount)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          {transaction.status === 'draft' && (
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Journal Entries */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">Journal Entries</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-sm text-muted-foreground mb-2">DEBITS</h5>
                          {transaction.entries.filter(entry => entry.debitAmount > 0).map((entry, index) => (
                            <div key={index} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                              <div>
                                <p className="text-sm font-medium">{entry.accountName}</p>
                                <p className="text-xs text-muted-foreground">{entry.accountCode}</p>
                              </div>
                              <p className="text-sm font-mono">{formatCurrency(entry.debitAmount)}</p>
                            </div>
                          ))}
                        </div>
                        <div>
                          <h5 className="font-medium text-sm text-muted-foreground mb-2">CREDITS</h5>
                          {transaction.entries.filter(entry => entry.creditAmount > 0).map((entry, index) => (
                            <div key={index} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                              <div>
                                <p className="text-sm font-medium">{entry.accountName}</p>
                                <p className="text-xs text-muted-foreground">{entry.accountCode}</p>
                              </div>
                              <p className="text-sm font-mono">{formatCurrency(entry.creditAmount)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <h3 className="font-semibold mb-2">Trial Balance</h3>
                <p className="text-sm text-muted-foreground mb-4">Account balances verification</p>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <PieChart className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="font-semibold mb-2">Balance Sheet</h3>
                <p className="text-sm text-muted-foreground mb-4">Assets, liabilities & equity</p>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                <h3 className="font-semibold mb-2">Income Statement</h3>
                <p className="text-sm text-muted-foreground mb-4">Revenue & expense summary</p>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Calculator className="h-12 w-12 mx-auto mb-4 text-orange-600" />
                <h3 className="font-semibold mb-2">Cash Flow Statement</h3>
                <p className="text-sm text-muted-foreground mb-4">Operating, investing, financing</p>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-red-600" />
                <h3 className="font-semibold mb-2">General Ledger Report</h3>
                <p className="text-sm text-muted-foreground mb-4">Detailed account transactions</p>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Building className="h-12 w-12 mx-auto mb-4 text-indigo-600" />
                <h3 className="font-semibold mb-2">Account Activity</h3>
                <p className="text-sm text-muted-foreground mb-4">Individual account movements</p>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  )
}