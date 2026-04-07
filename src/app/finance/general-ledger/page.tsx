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

interface JournalEntryLine {
  id: string
  accountCode: string
  accountName: string
  description: string
  debitAmount: number
  creditAmount: number
}

export default function GeneralLedgerPage() {
  const [activeTab, setActiveTab] = useState<'accounts' | 'transactions' | 'reports'>('accounts')
  const [searchTerm, setSearchTerm] = useState('')
  const [accountTypeFilter, setAccountTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRange, setDateRange] = useState('month')
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [showJournalEntryModal, setShowJournalEntryModal] = useState(false)
  const [journalEntry, setJournalEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    reference: '',
    description: '',
    journalType: 'journal' as GLTransaction['journalType'],
    lines: [] as JournalEntryLine[]
  })

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

  // Journal Entry Modal Functions
  const addJournalLine = () => {
    const newLine: JournalEntryLine = {
      id: Date.now().toString(),
      accountCode: '',
      accountName: '',
      description: '',
      debitAmount: 0,
      creditAmount: 0
    }
    setJournalEntry(prev => ({
      ...prev,
      lines: [...prev.lines, newLine]
    }))
  }

  const removeJournalLine = (lineId: string) => {
    setJournalEntry(prev => ({
      ...prev,
      lines: prev.lines.filter(line => line.id !== lineId)
    }))
  }

  const updateJournalLine = (lineId: string, field: keyof JournalEntryLine, value: any) => {
    setJournalEntry(prev => ({
      ...prev,
      lines: prev.lines.map(line =>
        line.id === lineId ? { ...line, [field]: value } : line
      )
    }))
  }

  const handleAccountSelect = (lineId: string, accountCode: string) => {
    const account = glAccounts.find(acc => acc.accountCode === accountCode)
    if (account) {
      setJournalEntry(prev => ({
        ...prev,
        lines: prev.lines.map(line =>
          line.id === lineId
            ? { ...line, accountCode: account.accountCode, accountName: account.accountName }
            : line
        )
      }))
    }
  }

  const calculateTotals = () => {
    const totalDebits = journalEntry.lines.reduce((sum, line) => sum + (line.debitAmount || 0), 0)
    const totalCredits = journalEntry.lines.reduce((sum, line) => sum + (line.creditAmount || 0), 0)
    return { totalDebits, totalCredits, difference: totalDebits - totalCredits }
  }

  const isBalanced = () => {
    const { difference } = calculateTotals()
    return Math.abs(difference) < 0.01 && journalEntry.lines.length >= 2
  }

  const resetJournalEntry = () => {
    setJournalEntry({
      date: new Date().toISOString().split('T')[0],
      reference: '',
      description: '',
      journalType: 'journal',
      lines: []
    })
    setShowJournalEntryModal(false)
  }

  const handleSaveJournalEntry = (saveAs: 'draft' | 'posted') => {
    if (!isBalanced()) {
      alert('Journal entry must be balanced (debits must equal credits)')
      return
    }

    // In a real implementation, this would POST to the API
    console.log('Saving journal entry:', { ...journalEntry, status: saveAs })
    alert(`Journal entry ${saveAs === 'draft' ? 'saved as draft' : 'posted'} successfully!`)
    resetJournalEntry()
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
            <Button size="sm" onClick={() => setShowJournalEntryModal(true)}>
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

        {activeTab === 'reports' && !selectedReport && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedReport('trial-balance')}>
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <h3 className="font-semibold mb-2">Trial Balance</h3>
                <p className="text-sm text-muted-foreground mb-4">Account balances verification</p>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Report
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedReport('balance-sheet')}>
              <CardContent className="p-6 text-center">
                <PieChart className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="font-semibold mb-2">Balance Sheet</h3>
                <p className="text-sm text-muted-foreground mb-4">Assets, liabilities & equity</p>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Report
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedReport('income-statement')}>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                <h3 className="font-semibold mb-2">Income Statement</h3>
                <p className="text-sm text-muted-foreground mb-4">Revenue & expense summary</p>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Report
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedReport('cash-flow')}>
              <CardContent className="p-6 text-center">
                <Calculator className="h-12 w-12 mx-auto mb-4 text-orange-600" />
                <h3 className="font-semibold mb-2">Cash Flow Statement</h3>
                <p className="text-sm text-muted-foreground mb-4">Operating, investing, financing</p>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Report
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedReport('gl-detail')}>
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-red-600" />
                <h3 className="font-semibold mb-2">General Ledger Report</h3>
                <p className="text-sm text-muted-foreground mb-4">Detailed account transactions</p>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Report
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedReport('account-activity')}>
              <CardContent className="p-6 text-center">
                <Building className="h-12 w-12 mx-auto mb-4 text-indigo-600" />
                <h3 className="font-semibold mb-2">Account Activity</h3>
                <p className="text-sm text-muted-foreground mb-4">Individual account movements</p>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Report
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Trial Balance Report */}
        {activeTab === 'reports' && selectedReport === 'trial-balance' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Trial Balance - {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedReport(null)}>
                    Back to Reports
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Account Code</th>
                      <th className="text-left py-3 px-4 font-semibold">Account Name</th>
                      <th className="text-right py-3 px-4 font-semibold">Debit</th>
                      <th className="text-right py-3 px-4 font-semibold">Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {glAccounts.map((account) => (
                      <tr key={account.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-sm">{account.accountCode}</td>
                        <td className="py-3 px-4">{account.accountName}</td>
                        <td className="py-3 px-4 text-right font-mono">
                          {account.balanceType === 'debit' ? formatCurrency(account.balance) : '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          {account.balanceType === 'credit' ? formatCurrency(account.balance) : '-'}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-primary-50 font-bold border-t-2">
                      <td className="py-3 px-4" colSpan={2}>TOTAL</td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(glAccounts.filter(a => a.balanceType === 'debit').reduce((sum, a) => sum + a.balance, 0))}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(glAccounts.filter(a => a.balanceType === 'credit').reduce((sum, a) => sum + a.balance, 0))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-900">Trial Balance is balanced - Debits equal Credits</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Balance Sheet Report */}
        {activeTab === 'reports' && selectedReport === 'balance-sheet' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Balance Sheet - As of {new Date().toLocaleDateString()}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedReport(null)}>
                    Back to Reports
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Assets */}
                <div>
                  <h3 className="font-bold text-lg mb-4 text-green-700">ASSETS</h3>
                  <div className="space-y-3">
                    <div className="bg-green-50 p-3 rounded">
                      <h4 className="font-semibold mb-2">Current Assets</h4>
                      {glAccounts.filter(a => a.accountType === 'asset' && parseInt(a.accountCode) < 1500).map(account => (
                        <div key={account.id} className="flex justify-between text-sm py-1">
                          <span>{account.accountName}</span>
                          <span className="font-mono">{formatCurrency(account.balance)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
                        <span>Total Current Assets</span>
                        <span>{formatCurrency(glAccounts.filter(a => a.accountType === 'asset' && parseInt(a.accountCode) < 1500).reduce((sum, a) => sum + a.balance, 0))}</span>
                      </div>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <h4 className="font-semibold mb-2">Non-Current Assets</h4>
                      {glAccounts.filter(a => a.accountType === 'asset' && parseInt(a.accountCode) >= 1500).map(account => (
                        <div key={account.id} className="flex justify-between text-sm py-1">
                          <span>{account.accountName}</span>
                          <span className="font-mono">{formatCurrency(account.balance)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
                        <span>Total Non-Current Assets</span>
                        <span>{formatCurrency(glAccounts.filter(a => a.accountType === 'asset' && parseInt(a.accountCode) >= 1500).reduce((sum, a) => sum + a.balance, 0))}</span>
                      </div>
                    </div>
                    <div className="bg-green-100 p-3 rounded font-bold text-green-900">
                      <div className="flex justify-between">
                        <span>TOTAL ASSETS</span>
                        <span>{formatCurrency(accountTypeTotals.asset)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Liabilities & Equity */}
                <div>
                  <h3 className="font-bold text-lg mb-4 text-red-700">LIABILITIES & EQUITY</h3>
                  <div className="space-y-3">
                    <div className="bg-red-50 p-3 rounded">
                      <h4 className="font-semibold mb-2">Liabilities</h4>
                      {glAccounts.filter(a => a.accountType === 'liability').map(account => (
                        <div key={account.id} className="flex justify-between text-sm py-1">
                          <span>{account.accountName}</span>
                          <span className="font-mono">{formatCurrency(account.balance)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
                        <span>Total Liabilities</span>
                        <span>{formatCurrency(accountTypeTotals.liability)}</span>
                      </div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded">
                      <h4 className="font-semibold mb-2">Equity</h4>
                      {glAccounts.filter(a => a.accountType === 'equity').map(account => (
                        <div key={account.id} className="flex justify-between text-sm py-1">
                          <span>{account.accountName}</span>
                          <span className="font-mono">{formatCurrency(account.balance)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm py-1">
                        <span>Retained Earnings</span>
                        <span className="font-mono">{formatCurrency(accountTypeTotals.revenue - accountTypeTotals.expense)}</span>
                      </div>
                      <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
                        <span>Total Equity</span>
                        <span>{formatCurrency(accountTypeTotals.equity + (accountTypeTotals.revenue - accountTypeTotals.expense))}</span>
                      </div>
                    </div>
                    <div className="bg-red-100 p-3 rounded font-bold text-red-900">
                      <div className="flex justify-between">
                        <span>TOTAL LIABILITIES & EQUITY</span>
                        <span>{formatCurrency(accountTypeTotals.liability + accountTypeTotals.equity + (accountTypeTotals.revenue - accountTypeTotals.expense))}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Income Statement Report */}
        {activeTab === 'reports' && selectedReport === 'income-statement' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Income Statement - {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedReport(null)}>
                    Back to Reports
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Revenue */}
                <div>
                  <h3 className="font-bold text-lg mb-3 text-blue-700">REVENUE</h3>
                  <div className="bg-blue-50 p-4 rounded">
                    {glAccounts.filter(a => a.accountType === 'revenue').map(account => (
                      <div key={account.id} className="flex justify-between text-sm py-2">
                        <span>{account.accountName}</span>
                        <span className="font-mono">{formatCurrency(account.balance)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold mt-3 pt-3 border-t border-blue-200 text-blue-900">
                      <span>Total Revenue</span>
                      <span>{formatCurrency(accountTypeTotals.revenue)}</span>
                    </div>
                  </div>
                </div>

                {/* Expenses */}
                <div>
                  <h3 className="font-bold text-lg mb-3 text-orange-700">EXPENSES</h3>
                  <div className="bg-orange-50 p-4 rounded">
                    {glAccounts.filter(a => a.accountType === 'expense').map(account => (
                      <div key={account.id} className="flex justify-between text-sm py-2">
                        <span>{account.accountName}</span>
                        <span className="font-mono">{formatCurrency(account.balance)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold mt-3 pt-3 border-t border-orange-200 text-orange-900">
                      <span>Total Expenses</span>
                      <span>{formatCurrency(accountTypeTotals.expense)}</span>
                    </div>
                  </div>
                </div>

                {/* Net Income */}
                <div className={`p-4 rounded ${accountTypeTotals.revenue - accountTypeTotals.expense > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  <div className={`flex justify-between font-bold text-lg ${accountTypeTotals.revenue - accountTypeTotals.expense > 0 ? 'text-green-900' : 'text-red-900'}`}>
                    <span>NET INCOME (LOSS)</span>
                    <span>{formatCurrency(accountTypeTotals.revenue - accountTypeTotals.expense)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span>Net Profit Margin</span>
                    <span>{((accountTypeTotals.revenue - accountTypeTotals.expense) / accountTypeTotals.revenue * 100).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Other reports placeholder */}
        {activeTab === 'reports' && selectedReport && !['trial-balance', 'balance-sheet', 'income-statement'].includes(selectedReport) && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedReport.replace('-', ' ').toUpperCase()}</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setSelectedReport(null)}>
                  Back to Reports
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold mb-2">Report Coming Soon</p>
                <p>This report will be available in the next update</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Journal Entry Modal */}
      {showJournalEntryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">New Journal Entry</h2>
                <p className="text-sm text-gray-500">Create a manual journal entry</p>
              </div>
              <button
                onClick={resetJournalEntry}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-6">
              {/* Header Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={journalEntry.date}
                    onChange={(e) => setJournalEntry(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reference
                  </label>
                  <input
                    type="text"
                    value={journalEntry.reference}
                    onChange={(e) => setJournalEntry(prev => ({ ...prev, reference: e.target.value }))}
                    placeholder="Auto-generated if empty"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Journal Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={journalEntry.journalType}
                    onChange={(e) => setJournalEntry(prev => ({ ...prev, journalType: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="journal">General Journal</option>
                    <option value="sales">Sales Journal</option>
                    <option value="purchase">Purchase Journal</option>
                    <option value="payment">Payment Journal</option>
                    <option value="receipt">Receipt Journal</option>
                    <option value="opening">Opening Balance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={journalEntry.description}
                  onChange={(e) => setJournalEntry(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this journal entry"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Journal Lines */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Journal Lines</h3>
                  <Button size="sm" onClick={addJournalLine}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Line
                  </Button>
                </div>

                {journalEntry.lines.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-600 mb-2">No journal lines yet</p>
                    <p className="text-sm text-gray-500">Click "Add Line" to create your first entry</p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700">Account</th>
                            <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700">Description</th>
                            <th className="text-right py-3 px-3 text-xs font-semibold text-gray-700">Debit</th>
                            <th className="text-right py-3 px-3 text-xs font-semibold text-gray-700">Credit</th>
                            <th className="text-center py-3 px-3 text-xs font-semibold text-gray-700">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {journalEntry.lines.map((line) => (
                            <tr key={line.id} className="border-t hover:bg-gray-50">
                              <td className="py-2 px-3">
                                <select
                                  value={line.accountCode}
                                  onChange={(e) => handleAccountSelect(line.id, e.target.value)}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                                >
                                  <option value="">Select account...</option>
                                  {glAccounts.map(acc => (
                                    <option key={acc.id} value={acc.accountCode}>
                                      {acc.accountCode} - {acc.accountName}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  value={line.description}
                                  onChange={(e) => updateJournalLine(line.id, 'description', e.target.value)}
                                  placeholder="Line description"
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  value={line.debitAmount || ''}
                                  onChange={(e) => {
                                    const value = parseFloat(e.target.value) || 0
                                    updateJournalLine(line.id, 'debitAmount', value)
                                    if (value > 0) {
                                      updateJournalLine(line.id, 'creditAmount', 0)
                                    }
                                  }}
                                  placeholder="0.00"
                                  className="w-full px-2 py-1.5 text-sm text-right border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                                  step="0.01"
                                  min="0"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  value={line.creditAmount || ''}
                                  onChange={(e) => {
                                    const value = parseFloat(e.target.value) || 0
                                    updateJournalLine(line.id, 'creditAmount', value)
                                    if (value > 0) {
                                      updateJournalLine(line.id, 'debitAmount', 0)
                                    }
                                  }}
                                  placeholder="0.00"
                                  className="w-full px-2 py-1.5 text-sm text-right border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                                  step="0.01"
                                  min="0"
                                />
                              </td>
                              <td className="py-2 px-3 text-center">
                                <button
                                  onClick={() => removeJournalLine(line.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50 border-t-2">
                          <tr>
                            <td colSpan={2} className="py-3 px-3 font-semibold">TOTALS</td>
                            <td className="py-3 px-3 text-right font-bold font-mono">
                              {formatCurrency(calculateTotals().totalDebits)}
                            </td>
                            <td className="py-3 px-3 text-right font-bold font-mono">
                              {formatCurrency(calculateTotals().totalCredits)}
                            </td>
                            <td></td>
                          </tr>
                          <tr>
                            <td colSpan={2} className="py-2 px-3 font-semibold">DIFFERENCE</td>
                            <td colSpan={3} className={`py-2 px-3 text-right font-bold ${Math.abs(calculateTotals().difference) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                              {Math.abs(calculateTotals().difference) < 0.01 ? (
                                <span className="flex items-center justify-end">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Balanced
                                </span>
                              ) : (
                                <span className="flex items-center justify-end">
                                  <AlertTriangle className="h-4 w-4 mr-1" />
                                  Out of balance by {formatCurrency(Math.abs(calculateTotals().difference))}
                                </span>
                              )}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Validation Messages */}
              {journalEntry.lines.length > 0 && !isBalanced() && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-semibold text-yellow-900">Entry Not Balanced</h4>
                      <ul className="text-sm text-yellow-800 mt-1 space-y-1">
                        {Math.abs(calculateTotals().difference) >= 0.01 && (
                          <li>• Debits must equal Credits (currently off by {formatCurrency(Math.abs(calculateTotals().difference))})</li>
                        )}
                        {journalEntry.lines.length < 2 && (
                          <li>• At least 2 lines required for a journal entry</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex items-center justify-end space-x-3">
              <Button variant="outline" onClick={resetJournalEntry}>
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSaveJournalEntry('draft')}
                disabled={journalEntry.lines.length === 0 || !journalEntry.description}
              >
                Save as Draft
              </Button>
              <Button
                onClick={() => handleSaveJournalEntry('posted')}
                disabled={!isBalanced() || !journalEntry.description}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Post Entry
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}