'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createPortal } from 'react-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import mockApi from '@/lib/mockApi'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import {
  Search,
  Filter,
  Download,
  TrendingUp,
  ShoppingCart,
  Package,
  Plus,
  DollarSign,
  Calendar,
  User,
  Building2,
  Fuel,
  Wrench,
  CreditCard,
  Banknote,
  Eye,
  X,
  MapPin,
  Percent,
  Clock,
  Phone,
  Mail,
  Receipt
} from 'lucide-react'

interface SubstoreDeposit {
  id: string
  depositId: string
  substoreId: string
  substoreName: string
  substoreType: 'lubebay' | 'filling_station'
  depositDate: string
  salesPeriod: string
  totalSales: number
  commission: number
  commissionRate: number
  depositAmount: number
  depositMethod: 'cash' | 'bank_transfer' | 'cheque'
  status: 'pending' | 'confirmed' | 'rejected'
  processedBy: string
  notes: string
  salesBreakdown: Array<{
    category: string
    amount: number
    commission: number
  }>
}

interface SubstoreTransaction {
  id: string
  transactionId: string
  substoreId: string
  substoreName: string
  substoreType: 'lubebay' | 'filling_station'
  date: string
  customerName: string
  customerPhone: string
  items: Array<{
    id: string
    name: string
    category: 'lubricant' | 'service' | 'fuel'
    quantity: number
    unitPrice: number
    total: number
  }>
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: 'cash' | 'bank_transfer' | 'card' | 'credit'
  paymentStatus: 'paid' | 'pending' | 'failed'
  salesRep: string
  notes: string
}

const mockDeposits: SubstoreDeposit[] = [
  {
    id: '1',
    depositId: 'DEP-LUB-001',
    substoreId: 'LUB-LIS',
    substoreName: 'Lagos Island Lubebay',
    substoreType: 'lubebay',
    depositDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    salesPeriod: 'November 2024',
    totalSales: 2450000,
    commission: 208250,
    commissionRate: 8.5,
    depositAmount: 208250,
    depositMethod: 'bank_transfer',
    status: 'confirmed',
    processedBy: 'Finance Team',
    notes: 'Monthly commission deposit for November sales',
    salesBreakdown: [
      { category: 'Lubricant Sales', amount: 1850000, commission: 157250 },
      { category: 'Service Revenue', amount: 600000, commission: 51000 }
    ]
  },
  {
    id: '2',
    depositId: 'DEP-FS-002',
    substoreId: 'FS-IKJ',
    substoreName: 'Ikeja Filling Station',
    substoreType: 'filling_station',
    depositDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    salesPeriod: 'November 2024',
    totalSales: 1200000,
    commission: 96000,
    commissionRate: 8.0,
    depositAmount: 96000,
    depositMethod: 'bank_transfer',
    status: 'pending',
    processedBy: 'Finance Team',
    notes: 'Pending verification of sales records',
    salesBreakdown: [
      { category: 'Fuel Sales', amount: 800000, commission: 64000 },
      { category: 'Lubricant Sales', amount: 400000, commission: 32000 }
    ]
  },
  {
    id: '3',
    depositId: 'DEP-LUB-003',
    substoreId: 'LUB-ABC',
    substoreName: 'Abuja Central Lubebay',
    substoreType: 'lubebay',
    depositDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    salesPeriod: 'November 2024',
    totalSales: 1890000,
    commission: 141750,
    commissionRate: 7.5,
    depositAmount: 141750,
    depositMethod: 'cheque',
    status: 'confirmed',
    processedBy: 'Finance Team',
    notes: 'Commission deposited via cheque as requested',
    salesBreakdown: [
      { category: 'Lubricant Sales', amount: 1400000, commission: 105000 },
      { category: 'Service Revenue', amount: 490000, commission: 36750 }
    ]
  },
  {
    id: '4',
    depositId: 'DEP-FS-004',
    substoreId: 'FS-KAN',
    substoreName: 'Kano Filling Station',
    substoreType: 'filling_station',
    depositDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    salesPeriod: 'October 2024',
    totalSales: 980000,
    commission: 68600,
    commissionRate: 7.0,
    depositAmount: 68600,
    depositMethod: 'bank_transfer',
    status: 'confirmed',
    processedBy: 'Finance Team',
    notes: 'October commission deposit completed',
    salesBreakdown: [
      { category: 'Fuel Sales', amount: 680000, commission: 47600 },
      { category: 'Lubricant Sales', amount: 300000, commission: 21000 }
    ]
  },
  {
    id: '5',
    depositId: 'DEP-LUB-005',
    substoreId: 'LUB-PHC',
    substoreName: 'Port Harcourt Lubebay',
    substoreType: 'lubebay',
    depositDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    salesPeriod: 'December 2024',
    totalSales: 1650000,
    commission: 132000,
    commissionRate: 8.0,
    depositAmount: 132000,
    depositMethod: 'bank_transfer',
    status: 'pending',
    processedBy: 'Finance Team',
    notes: 'December interim commission deposit pending approval',
    salesBreakdown: [
      { category: 'Lubricant Sales', amount: 1200000, commission: 96000 },
      { category: 'Service Revenue', amount: 450000, commission: 36000 }
    ]
  }
]

const mockTransactions: SubstoreTransaction[] = [
  {
    id: '1',
    transactionId: 'TXN-LUB-001',
    substoreId: 'LUB-LIS',
    substoreName: 'Lagos Island Lubebay',
    substoreType: 'lubebay',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    customerName: 'John Adebayo',
    customerPhone: '+234-801-234-5678',
    items: [
      { id: '1', name: 'Mobil 1 5W-30', category: 'lubricant', quantity: 2, unitPrice: 15000, total: 30000 },
      { id: '2', name: 'Oil Change Service', category: 'service', quantity: 1, unitPrice: 8000, total: 8000 }
    ],
    subtotal: 38000,
    tax: 2850,
    discount: 0,
    total: 40850,
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    salesRep: 'Ahmed Musa',
    notes: 'Regular customer, oil change service included'
  },
  {
    id: '2',
    transactionId: 'TXN-FS-002',
    substoreId: 'FS-IKJ',
    substoreName: 'Ikeja Filling Station',
    substoreType: 'filling_station',
    date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    customerName: 'Sarah Okafor',
    customerPhone: '+234-807-987-6543',
    items: [
      { id: '3', name: 'Premium Motor Spirit', category: 'fuel', quantity: 40, unitPrice: 850, total: 34000 },
      { id: '4', name: 'Shell Helix HX7', category: 'lubricant', quantity: 1, unitPrice: 12500, total: 12500 }
    ],
    subtotal: 46500,
    tax: 3487,
    discount: 1000,
    total: 48987,
    paymentMethod: 'card',
    paymentStatus: 'paid',
    salesRep: 'Fatima Hassan',
    notes: 'Fuel + oil purchase, loyalty discount applied'
  },
  {
    id: '3',
    transactionId: 'TXN-LUB-003',
    substoreId: 'LUB-ABC',
    substoreName: 'Abuja Central Lubebay',
    substoreType: 'lubebay',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    customerName: 'David Okwu',
    customerPhone: '+234-803-456-7890',
    items: [
      { id: '5', name: 'Total Quartz 9000', category: 'lubricant', quantity: 3, unitPrice: 18000, total: 54000 },
      { id: '6', name: 'Engine Diagnostics', category: 'service', quantity: 1, unitPrice: 15000, total: 15000 },
      { id: '7', name: 'Air Filter Replacement', category: 'service', quantity: 1, unitPrice: 5000, total: 5000 }
    ],
    subtotal: 74000,
    tax: 5550,
    discount: 2000,
    total: 77550,
    paymentMethod: 'bank_transfer',
    paymentStatus: 'paid',
    salesRep: 'Ibrahim Garba',
    notes: 'Premium service package, repeat customer'
  },
  {
    id: '4',
    transactionId: 'TXN-FS-004',
    substoreId: 'FS-KAN',
    substoreName: 'Kano Filling Station',
    substoreType: 'filling_station',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    customerName: 'Grace Emeka',
    customerPhone: '+234-805-123-4567',
    items: [
      { id: '8', name: 'Automotive Gas Oil', category: 'fuel', quantity: 60, unitPrice: 750, total: 45000 }
    ],
    subtotal: 45000,
    tax: 3375,
    discount: 0,
    total: 48375,
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    salesRep: 'Musa Abdullahi',
    notes: 'Diesel purchase for commercial vehicle'
  },
  {
    id: '5',
    transactionId: 'TXN-LUB-005',
    substoreId: 'LUB-PHC',
    substoreName: 'Port Harcourt Lubebay',
    substoreType: 'lubebay',
    date: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    customerName: 'Michael Ogbonna',
    customerPhone: '+234-806-555-7777',
    items: [
      { id: '9', name: 'Castrol GTX', category: 'lubricant', quantity: 1, unitPrice: 8500, total: 8500 },
      { id: '10', name: 'Quick Lube Service', category: 'service', quantity: 1, unitPrice: 6000, total: 6000 }
    ],
    subtotal: 14500,
    tax: 1087,
    discount: 500,
    total: 15087,
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    salesRep: 'Chioma Nwosu',
    notes: 'Quick service, customer in hurry'
  }
]

interface RecordDepositModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (depositData: any) => void
}

function RecordDepositModal({ isOpen, onClose, onSubmit }: RecordDepositModalProps) {
  const [formData, setFormData] = useState({
    substoreId: '',
    salesPeriod: '',
    totalSales: '',
    commissionRate: '',
    depositMethod: 'bank_transfer',
    notes: ''
  })

  const { data: substoresList } = useQuery({
    queryKey: ['substores-list'],
    queryFn: () => mockApi.get('/channels/substores'),
  })

  const substores = substoresList || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const selectedSubstore = substores.find((s: any) => s.id === parseInt(formData.substoreId))
    if (!selectedSubstore) return

    const totalSales = parseFloat(formData.totalSales) || 0
    const commissionRate = parseFloat(formData.commissionRate) || 0
    const commission = (totalSales * commissionRate) / 100

    const depositData = {
      substoreId: selectedSubstore.code,
      substoreName: selectedSubstore.name,
      substoreType: selectedSubstore.type,
      salesPeriod: formData.salesPeriod,
      totalSales,
      commission,
      commissionRate,
      depositAmount: commission,
      depositMethod: formData.depositMethod,
      notes: formData.notes,
      status: 'pending'
    }

    onSubmit(depositData)
    onClose()

    // Reset form
    setFormData({
      substoreId: '',
      salesPeriod: '',
      totalSales: '',
      commissionRate: '',
      depositMethod: 'bank_transfer',
      notes: ''
    })
  }

  if (!isOpen) return null

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Record Commission Deposit</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Substore</label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.substoreId}
              onChange={(e) => setFormData(prev => ({ ...prev, substoreId: e.target.value }))}
            >
              <option value="">Select Substore</option>
              {substores.map((substore: any) => (
                <option key={substore.id} value={substore.id}>
                  {substore.name} ({substore.code}) - {substore.type === 'lubebay' ? 'Lubebay' : 'Filling Station'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sales Period</label>
            <input
              type="text"
              required
              placeholder="e.g., December 2024"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.salesPeriod}
              onChange={(e) => setFormData(prev => ({ ...prev, salesPeriod: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Total Sales Amount</label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.totalSales}
              onChange={(e) => setFormData(prev => ({ ...prev, totalSales: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Commission Rate (%)</label>
            <input
              type="number"
              required
              step="0.1"
              min="0"
              max="100"
              placeholder="8.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.commissionRate}
              onChange={(e) => setFormData(prev => ({ ...prev, commissionRate: e.target.value }))}
            />
          </div>

          {formData.totalSales && formData.commissionRate && (
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex justify-between text-sm">
                <span>Commission Amount:</span>
                <span className="font-semibold">
                  {formatCurrency((parseFloat(formData.totalSales) * parseFloat(formData.commissionRate)) / 100)}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Deposit Method</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.depositMethod}
              onChange={(e) => setFormData(prev => ({ ...prev, depositMethod: e.target.value }))}
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              rows={3}
              placeholder="Additional notes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 mofad-btn-primary"
            >
              Record Deposit
            </Button>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

interface SubstoreTransactionsModalProps {
  isOpen: boolean
  onClose: () => void
  substore: SubstoreDeposit | null
}

function SubstoreTransactionsModal({ isOpen, onClose, substore }: SubstoreTransactionsModalProps) {
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [transactionSearch, setTransactionSearch] = useState('')

  if (!isOpen || !substore) return null

  // Filter transactions for this specific substore
  const substoreTransactions = mockTransactions.filter(t => t.substoreId === substore.substoreId)

  const filteredTransactions = substoreTransactions.filter(transaction =>
    transaction.transactionId.toLowerCase().includes(transactionSearch.toLowerCase()) ||
    transaction.customerName.toLowerCase().includes(transactionSearch.toLowerCase())
  )

  const getPaymentStatusBadge = (status: string) => {
    const styles = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const getPaymentMethodBadge = (method: string) => {
    const styles = {
      cash: 'bg-blue-100 text-blue-800',
      bank_transfer: 'bg-purple-100 text-purple-800',
      card: 'bg-green-100 text-green-800',
      credit: 'bg-orange-100 text-orange-800'
    }
    return styles[method as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const getCategoryBadge = (category: string) => {
    const styles = {
      lubricant: 'bg-blue-100 text-blue-800',
      service: 'bg-green-100 text-green-800',
      fuel: 'bg-orange-100 text-orange-800'
    }
    return styles[category as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const totalTransactionsValue = filteredTransactions.reduce((sum, t) => sum + t.total, 0)
  const totalTransactionsCount = filteredTransactions.length

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{substore.substoreName} Transactions</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-mono">{substore.substoreId}</span>
                <span>•</span>
                <span className="capitalize">{substore.substoreType.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowAddTransaction(true)}
              className="mofad-btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Transactions</p>
                    <p className="text-2xl font-bold text-primary">{totalTransactionsCount}</p>
                  </div>
                  <Receipt className="w-8 h-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(totalTransactionsValue)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600/60" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Transaction</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(totalTransactionsCount > 0 ? totalTransactionsValue / totalTransactionsCount : 0)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-600/60" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search transactions..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                value={transactionSearch}
                onChange={(e) => setTransactionSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Transactions List */}
          <div className="space-y-4">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-500">
                  {transactionSearch ? 'Try adjusting your search' : 'No transactions have been recorded for this substore yet'}
                </p>
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                      {/* Transaction Info */}
                      <div className="lg:col-span-1">
                        <div className="space-y-2">
                          <div className="font-semibold text-primary">{transaction.transactionId}</div>
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatDateTime(transaction.date)}</span>
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{transaction.customerName}</span>
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{transaction.customerPhone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="lg:col-span-2">
                        <h4 className="font-medium mb-2">Items</h4>
                        <div className="space-y-1">
                          {transaction.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadge(item.category)}`}>
                                  {item.category}
                                </span>
                                <span>{item.name}</span>
                                <span className="text-gray-500">x{item.quantity}</span>
                              </div>
                              <span className="font-medium">{formatCurrency(item.total)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Payment & Total */}
                      <div className="lg:col-span-1">
                        <div className="space-y-3">
                          <div>
                            <div className="text-sm text-gray-600">Subtotal: {formatCurrency(transaction.subtotal)}</div>
                            {transaction.discount > 0 && (
                              <div className="text-sm text-red-600">Discount: -{formatCurrency(transaction.discount)}</div>
                            )}
                            <div className="text-sm text-gray-600">Tax: {formatCurrency(transaction.tax)}</div>
                            <div className="font-bold text-lg text-primary">Total: {formatCurrency(transaction.total)}</div>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodBadge(transaction.paymentMethod)}`}>
                                {transaction.paymentMethod.replace('_', ' ')}
                              </span>
                            </div>
                            <div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusBadge(transaction.paymentStatus)}`}>
                                {transaction.paymentStatus}
                              </span>
                            </div>
                          </div>

                          <div className="text-xs text-gray-500">
                            Sales Rep: {transaction.salesRep}
                          </div>
                        </div>
                      </div>
                    </div>

                    {transaction.notes && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="text-sm text-gray-600">
                          <strong>Notes:</strong> {transaction.notes}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Add Transaction Modal */}
        {showAddTransaction && (
          <AddTransactionModal
            isOpen={showAddTransaction}
            onClose={() => setShowAddTransaction(false)}
            substore={substore}
            onSubmit={() => {
              setShowAddTransaction(false)
              // In a real app, we'd refresh the transactions
            }}
          />
        )}
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

interface AddTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  substore: SubstoreDeposit
  onSubmit: (transactionData: any) => void
}

function AddTransactionModal({ isOpen, onClose, substore, onSubmit }: AddTransactionModalProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    paymentMethod: 'cash',
    discount: '',
    tax: '',
    notes: '',
    items: [{ name: '', category: 'lubricant', quantity: '', unitPrice: '' }]
  })

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', category: 'lubricant', quantity: '', unitPrice: '' }]
    }))
  }

  const handleRemoveItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }))
    }
  }

  const handleItemChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0
      const unitPrice = parseFloat(item.unitPrice) || 0
      return sum + (quantity * unitPrice)
    }, 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const tax = parseFloat(formData.tax) || 0
    const discount = parseFloat(formData.discount) || 0
    return subtotal + tax - discount
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const subtotal = calculateSubtotal()
    const tax = parseFloat(formData.tax) || 0
    const discount = parseFloat(formData.discount) || 0
    const total = calculateTotal()

    const transactionData = {
      transactionId: `TXN-${substore.substoreType.toUpperCase().substring(0, 3)}-${String(Date.now()).slice(-3).padStart(3, '0')}`,
      substoreId: substore.substoreId,
      substoreName: substore.substoreName,
      substoreType: substore.substoreType,
      date: new Date().toISOString(),
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      items: formData.items.map((item, index) => ({
        id: (index + 1).toString(),
        name: item.name,
        category: item.category,
        quantity: parseFloat(item.quantity) || 0,
        unitPrice: parseFloat(item.unitPrice) || 0,
        total: (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)
      })),
      subtotal,
      tax,
      discount,
      total,
      paymentMethod: formData.paymentMethod,
      paymentStatus: 'paid',
      salesRep: 'Current User', // In a real app, this would be the logged-in user
      notes: formData.notes
    }

    onSubmit(transactionData)

    // Reset form
    setFormData({
      customerName: '',
      customerPhone: '',
      paymentMethod: 'cash',
      discount: '',
      tax: '',
      notes: '',
      items: [{ name: '', category: 'lubricant', quantity: '', unitPrice: '' }]
    })
  }

  if (!isOpen) return null

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9998] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Add New Transaction - {substore.substoreName}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Customer Name</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Customer Phone</label>
              <input
                type="tel"
                required
                placeholder="+234-XXX-XXX-XXXX"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.customerPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">Items</h3>
              <Button
                type="button"
                onClick={handleAddItem}
                variant="outline"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 border rounded-lg">
                  <div>
                    <label className="block text-sm font-medium mb-1">Item Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Product/Service name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={item.category}
                      onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                    >
                      <option value="lubricant">Lubricant</option>
                      <option value="service">Service</option>
                      {substore.substoreType === 'filling_station' && <option value="fuel">Fuel</option>}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Quantity</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Unit Price</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="w-full">
                      <label className="block text-sm font-medium mb-1">Total</label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-right font-medium">
                        {formatCurrency((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0))}
                      </div>
                    </div>
                    {formData.items.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                        className="ml-2 text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment & Totals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="credit">Credit</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  rows={3}
                  placeholder="Additional notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Tax</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={formData.tax}
                      onChange={(e) => setFormData(prev => ({ ...prev, tax: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Discount</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={formData.discount}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 mofad-btn-primary"
            >
              Add Transaction
            </Button>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default function SubstoreTransactionsPage() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected'>('all')
  const [substoreFilter, setSubstoreFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [showTransactionsModal, setShowTransactionsModal] = useState(false)
  const [selectedSubstore, setSelectedSubstore] = useState<SubstoreDeposit | null>(null)

  // Use React Query to fetch deposits
  const { data: depositsList, isLoading } = useQuery({
    queryKey: ['substore-deposits'],
    queryFn: () => Promise.resolve(mockDeposits), // For now, return mock data
  })

  const deposits = depositsList || []
  const substores = Array.from(new Set(deposits.map(d => d.substoreName)))
  const substoreTypes = Array.from(new Set(deposits.map(d => d.substoreType)))

  // Mutation for creating new deposits
  const createDepositMutation = useMutation({
    mutationFn: async (depositData: any) => {
      // Generate new deposit ID
      const newDeposit = {
        id: (Math.max(...deposits.map(d => parseInt(d.id))) + 1).toString(),
        depositId: `DEP-${depositData.substoreType.toUpperCase().substring(0, 3)}-${String(Date.now()).slice(-3).padStart(3, '0')}`,
        depositDate: new Date().toISOString(),
        processedBy: 'Finance Team',
        salesBreakdown: [
          {
            category: depositData.substoreType === 'lubebay' ? 'Lubricant Sales' : 'Fuel Sales',
            amount: depositData.totalSales * 0.7,
            commission: depositData.commission * 0.7
          },
          {
            category: depositData.substoreType === 'lubebay' ? 'Service Revenue' : 'Lubricant Sales',
            amount: depositData.totalSales * 0.3,
            commission: depositData.commission * 0.3
          }
        ],
        ...depositData
      }

      // In a real app, this would be an API call
      return Promise.resolve(newDeposit)
    },
    onSuccess: (newDeposit) => {
      // Update the query cache
      queryClient.setQueryData(['substore-deposits'], (old: any) => [newDeposit, ...old])
    },
  })

  const filteredDeposits = deposits.filter(deposit => {
    const matchesSearch = deposit.depositId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deposit.substoreName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deposit.salesPeriod.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || deposit.status === statusFilter
    const matchesSubstore = substoreFilter === 'all' || deposit.substoreName === substoreFilter
    const matchesType = typeFilter === 'all' || deposit.substoreType === typeFilter

    return matchesSearch && matchesStatus && matchesSubstore && matchesType
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const getDepositMethodBadge = (method: string) => {
    const styles = {
      'cash': 'bg-blue-100 text-blue-800',
      'bank_transfer': 'bg-purple-100 text-purple-800',
      'cheque': 'bg-orange-100 text-orange-800'
    }
    return styles[method as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const getTypeBadge = (type: string) => {
    const config = {
      lubebay: { label: 'Lubebay', color: 'bg-blue-100 text-blue-800', icon: <Wrench className="w-3 h-3" /> },
      filling_station: { label: 'Filling Station', color: 'bg-orange-100 text-orange-800', icon: <Fuel className="w-3 h-3" /> }
    }
    const typeConfig = config[type as keyof typeof config]
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${typeConfig.color}`}>
        {typeConfig.icon}
        <span>{typeConfig.label}</span>
      </div>
    )
  }

  // Handler for viewing substore transactions
  const handleViewTransactions = (deposit: SubstoreDeposit) => {
    setSelectedSubstore(deposit)
    setShowTransactionsModal(true)
  }

  // Calculate summary stats
  const totalDeposits = deposits.length
  const confirmedDeposits = deposits.filter(d => d.status === 'confirmed').length
  const totalCommissions = deposits
    .filter(d => d.status === 'confirmed')
    .reduce((sum, d) => sum + d.commission, 0)
  const pendingAmount = deposits
    .filter(d => d.status === 'pending')
    .reduce((sum, d) => sum + d.depositAmount, 0)

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Substore Deposits</h1>
            <p className="text-muted-foreground">Record and track commission deposits from substore and lubebay sales</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button
              className="mofad-btn-primary"
              onClick={() => setShowRecordModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Record Deposit
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Deposits</p>
                  <p className="text-2xl font-bold text-primary">{totalDeposits}</p>
                </div>
                <Banknote className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Confirmed</p>
                  <p className="text-2xl font-bold text-green-600">{confirmedDeposits}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Commissions</p>
                  <p className="text-2xl font-bold text-secondary">{formatCurrency(totalCommissions)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-secondary/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Amount</p>
                  <p className="text-2xl font-bold text-orange-600">{formatCurrency(pendingAmount)}</p>
                </div>
                <CreditCard className="w-8 h-8 text-orange-600/60" />
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
                    placeholder="Search deposits..."
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
                  <option value="lubebay">Lubebay</option>
                  <option value="filling_station">Filling Station</option>
                </select>

                <select
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={substoreFilter}
                  onChange={(e) => setSubstoreFilter(e.target.value)}
                >
                  <option value="all">All Substores</option>
                  {substores.map((substore) => (
                    <option key={substore} value={substore}>
                      {substore}
                    </option>
                  ))}
                </select>

                <select
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="rejected">Rejected</option>
                </select>

                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deposits Table */}
        <Card>
          <CardContent className="p-0">
            {filteredDeposits.length === 0 ? (
              <div className="p-12 text-center">
                <Banknote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No deposits found</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all' || substoreFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'No deposits have been recorded yet'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Deposit ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Substore</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Sales Period</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Total Sales</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Commission</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Deposit Amount</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Method</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredDeposits.map((deposit) => (
                      <tr key={deposit.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-primary">{deposit.depositId}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Building2 className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{deposit.substoreName}</div>
                              <div className="text-sm text-gray-500 font-mono">{deposit.substoreId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getTypeBadge(deposit.substoreType)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900">{deposit.salesPeriod}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="font-bold text-gray-900">{formatCurrency(deposit.totalSales)}</div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="font-bold text-secondary">{formatCurrency(deposit.commission)}</div>
                          <div className="text-sm text-gray-500">{deposit.commissionRate}%</div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="font-bold text-primary">{formatCurrency(deposit.depositAmount)}</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDepositMethodBadge(deposit.depositMethod)}`}>
                            {deposit.depositMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(deposit.status)}`}>
                            {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-900">
                            {formatDateTime(deposit.depositDate).split(',')[0]}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDateTime(deposit.depositDate).split(',')[1]?.trim()}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex gap-1 justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              title="View Transactions"
                              onClick={() => handleViewTransactions(deposit)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
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

        {/* Record Deposit Modal */}
        <RecordDepositModal
          isOpen={showRecordModal}
          onClose={() => setShowRecordModal(false)}
          onSubmit={(depositData) => createDepositMutation.mutate(depositData)}
        />

        {/* Substore Transactions Modal */}
        <SubstoreTransactionsModal
          isOpen={showTransactionsModal}
          onClose={() => {
            setShowTransactionsModal(false)
            setSelectedSubstore(null)
          }}
          substore={selectedSubstore}
        />
      </div>
    </AppLayout>
  )
}