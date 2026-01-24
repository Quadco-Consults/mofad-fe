'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatNumber } from '@/lib/utils'
import {
  RotateCcw,
  AlertTriangle,
  FileText,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Building,
  TrendingDown,
  Eye,
  Edit,
  Plus,
  Download,
  Filter,
  Search,
  RefreshCw,
  ArrowLeft,
  Receipt,
  CreditCard,
  Truck,
  Package
} from 'lucide-react'

interface ReversalRecord {
  id: string
  transactionId: string
  originalTransactionType: 'sale' | 'purchase' | 'payment' | 'receipt'
  originalAmount: number
  reversalAmount: number
  reason: string
  status: 'pending' | 'approved' | 'completed' | 'rejected'
  requestedBy: {
    name: string
    email: string
    department: string
  }
  requestedAt: string
  approvedBy?: {
    name: string
    email: string
  }
  approvedAt?: string
  completedAt?: string
  customer?: {
    name: string
    customerCode: string
  }
  supplier?: {
    name: string
    supplierCode: string
  }
  notes?: string
}

interface ReversalSummary {
  totalReversals: number
  totalAmount: number
  pendingReversals: number
  pendingAmount: number
  approvedToday: number
  rejectedToday: number
}

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    approved: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    rejected: { color: 'bg-red-100 text-red-800', icon: XCircle }
  }

  const config = statusConfig[status as keyof typeof statusConfig]
  const Icon = config?.icon || Clock

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config?.color || 'bg-gray-100 text-gray-800'}`}>
      <Icon className="w-3 h-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

const TransactionTypeBadge = ({ type }: { type: string }) => {
  const typeConfig = {
    sale: { color: 'bg-green-100 text-green-800', icon: Receipt },
    purchase: { color: 'bg-blue-100 text-blue-800', icon: Package },
    payment: { color: 'bg-orange-100 text-orange-800', icon: CreditCard },
    receipt: { color: 'bg-purple-100 text-purple-800', icon: DollarSign }
  }

  const config = typeConfig[type as keyof typeof typeConfig]
  const Icon = config?.icon || FileText

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config?.color || 'bg-gray-100 text-gray-800'}`}>
      <Icon className="w-3 h-3 mr-1" />
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  )
}

const MetricCard = ({ title, value, subtitle, icon: Icon, trend, color = 'orange' }: any) => {
  const colors = {
    orange: 'from-orange-500 to-orange-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
    yellow: 'from-yellow-500 to-yellow-600'
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">
              {typeof value === 'number' && title.includes('Amount') ? formatCurrency(value) : value}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]} text-white group-hover:scale-110 transition-transform`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center text-sm">
            <TrendingDown className={`h-4 w-4 mr-1 ${trend > 0 ? 'text-red-600' : 'text-green-600'}`} />
            <span className={trend > 0 ? 'text-red-600' : 'text-green-600'}>
              {Math.abs(trend)}% vs last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function ReversalsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  const { data: reversalsData, isLoading, refetch } = useQuery({
    queryKey: ['reversals', statusFilter, typeFilter, dateFilter],
    queryFn: () => apiClient.get(`/accounts/reversals?status=${statusFilter}&type=${typeFilter}&date=${dateFilter}`),
  })

  // Mock data for development
  const mockSummary: ReversalSummary = {
    totalReversals: 45,
    totalAmount: 12450000,
    pendingReversals: 8,
    pendingAmount: 3200000,
    approvedToday: 3,
    rejectedToday: 1
  }

  const mockReversals: ReversalRecord[] = [
    {
      id: 'REV001',
      transactionId: 'TXN-2024-001234',
      originalTransactionType: 'sale',
      originalAmount: 850000,
      reversalAmount: 850000,
      reason: 'Customer cancellation - Product quality issues',
      status: 'pending',
      requestedBy: {
        name: 'Fatima Ibrahim',
        email: 'fatima.ibrahim@mofad.com',
        department: 'Sales'
      },
      requestedAt: '2024-01-22T10:30:00Z',
      customer: {
        name: 'Apex Oil & Gas Ltd',
        customerCode: 'CUST-001'
      },
      notes: 'Customer reported quality issues with fuel delivery. Full refund requested.'
    },
    {
      id: 'REV002',
      transactionId: 'TXN-2024-001180',
      originalTransactionType: 'purchase',
      originalAmount: 2500000,
      reversalAmount: 500000,
      reason: 'Partial return - Overpayment correction',
      status: 'approved',
      requestedBy: {
        name: 'Ahmed Musa',
        email: 'ahmed.musa@mofad.com',
        department: 'Procurement'
      },
      requestedAt: '2024-01-20T14:15:00Z',
      approvedBy: {
        name: 'John Adebayo',
        email: 'john.adebayo@mofad.com'
      },
      approvedAt: '2024-01-21T09:00:00Z',
      supplier: {
        name: 'Dangote Refinery',
        supplierCode: 'SUPP-005'
      }
    },
    {
      id: 'REV003',
      transactionId: 'TXN-2024-001067',
      originalTransactionType: 'payment',
      originalAmount: 1200000,
      reversalAmount: 1200000,
      reason: 'Duplicate payment error',
      status: 'completed',
      requestedBy: {
        name: 'Sarah Okafor',
        email: 'sarah.okafor@mofad.com',
        department: 'Finance'
      },
      requestedAt: '2024-01-18T11:20:00Z',
      approvedBy: {
        name: 'John Adebayo',
        email: 'john.adebayo@mofad.com'
      },
      approvedAt: '2024-01-18T15:30:00Z',
      completedAt: '2024-01-19T10:00:00Z',
      supplier: {
        name: 'Shell Nigeria Ltd',
        supplierCode: 'SUPP-002'
      }
    },
    {
      id: 'REV004',
      transactionId: 'TXN-2024-000980',
      originalTransactionType: 'receipt',
      originalAmount: 750000,
      reversalAmount: 750000,
      reason: 'Incorrect customer charge',
      status: 'rejected',
      requestedBy: {
        name: 'Ibrahim Hassan',
        email: 'ibrahim.hassan@mofad.com',
        department: 'Customer Service'
      },
      requestedAt: '2024-01-15T16:45:00Z',
      approvedBy: {
        name: 'John Adebayo',
        email: 'john.adebayo@mofad.com'
      },
      approvedAt: '2024-01-16T08:30:00Z',
      customer: {
        name: 'Metro Transport Services',
        customerCode: 'CUST-078'
      },
      notes: 'Rejection reason: Insufficient documentation provided.'
    }
  ]

  const filteredReversals = mockReversals.filter(reversal => {
    const matchesSearch = reversal.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reversal.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reversal.requestedBy.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || reversal.status === statusFilter
    const matchesType = typeFilter === 'all' || reversal.originalTransactionType === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reversals & Returns</h1>
            <p className="text-gray-600">Manage transaction reversals, returns, and refunds</p>
          </div>

          <div className="flex items-center space-x-4">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Reversal
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Reversals"
            value={mockSummary.totalReversals}
            subtitle="This month"
            icon={RotateCcw}
            color="orange"
          />
          <MetricCard
            title="Total Amount"
            value={mockSummary.totalAmount}
            subtitle="Reversed this month"
            icon={DollarSign}
            color="red"
            trend={-12.5}
          />
          <MetricCard
            title="Pending"
            value={mockSummary.pendingReversals}
            subtitle="Awaiting approval"
            icon={Clock}
            color="yellow"
          />
          <MetricCard
            title="Pending Amount"
            value={mockSummary.pendingAmount}
            subtitle="Pending approval"
            icon={AlertTriangle}
            color="purple"
          />
        </div>

        {/* Daily Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved Today</p>
                  <p className="text-2xl font-bold text-green-600">{mockSummary.approvedToday}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected Today</p>
                  <p className="text-2xl font-bold text-red-600">{mockSummary.rejectedToday}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search reversals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-64"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Types</option>
                  <option value="sale">Sales</option>
                  <option value="purchase">Purchases</option>
                  <option value="payment">Payments</option>
                  <option value="receipt">Receipts</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reversals Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Reversal Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Request ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Transaction</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Requested By</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Reason</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReversals.map((reversal) => (
                    <tr key={reversal.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{reversal.id}</p>
                          <p className="text-sm text-gray-500">{new Date(reversal.requestedAt).toLocaleDateString()}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{reversal.transactionId}</p>
                          <p className="text-sm text-gray-500">
                            {reversal.customer ? reversal.customer.name : reversal.supplier?.name}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <TransactionTypeBadge type={reversal.originalTransactionType} />
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div>
                          <p className="font-bold text-gray-900">{formatCurrency(reversal.reversalAmount)}</p>
                          {reversal.reversalAmount !== reversal.originalAmount && (
                            <p className="text-sm text-gray-500">of {formatCurrency(reversal.originalAmount)}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-gray-900">{reversal.requestedBy.name}</p>
                          <p className="text-sm text-gray-500">{reversal.requestedBy.department}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-900 max-w-xs truncate">{reversal.reason}</p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <StatusBadge status={reversal.status} />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {reversal.status === 'pending' && (
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <RotateCcw className="h-5 w-5 mr-2" />
              Quick Reversal Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <Receipt className="h-6 w-6 mb-2" />
                Sale Reversal
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Package className="h-6 w-6 mb-2" />
                Return Goods
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <CreditCard className="h-6 w-6 mb-2" />
                Payment Return
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <FileText className="h-6 w-6 mb-2" />
                Bulk Actions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}