'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  Receipt,
  Clock,
  AlertTriangle,
  CheckCircle,
  Phone,
  Mail,
  Eye,
  Send,
  Download,
  Filter,
  Search,
  Calendar,
  DollarSign,
  User,
  Building,
  TrendingUp,
  TrendingDown,
  FileText,
  BarChart3,
  PieChart,
  RefreshCw
} from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils'

interface ARInvoice {
  id: string
  invoiceNumber: string
  customerName: string
  customerContact: string
  customerEmail: string
  amount: number
  dueDate: string
  issueDate: string
  daysOverdue: number
  status: 'current' | 'overdue_30' | 'overdue_60' | 'overdue_90'
  paymentTerms: string
  description: string
  sagaReference: string
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'current':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'overdue_30':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'overdue_60':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'overdue_90':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'current':
      return 'Current'
    case 'overdue_30':
      return '1-30 Days'
    case 'overdue_60':
      return '31-60 Days'
    case 'overdue_90':
      return '90+ Days'
    default:
      return 'Unknown'
  }
}

// Enhanced mock data with more invoices
const generateMockARInvoices = (): ARInvoice[] => {
  const customers = [
    { name: 'Total Nigeria Plc', contact: '+234 803 123 4567', email: 'finance@total.ng' },
    { name: 'Mobil Oil Nigeria', contact: '+234 803 234 5678', email: 'accounts@mobil.ng' },
    { name: 'Conoil Nigeria Limited', contact: '+234 803 345 6789', email: 'payment@conoil.com' },
    { name: 'Oando Plc', contact: '+234 803 456 7890', email: 'finance@oando.com' },
    { name: 'Forte Oil Plc', contact: '+234 803 567 8901', email: 'accounts@forteoil.com' },
    { name: 'MRS Oil Nigeria', contact: '+234 803 678 9012', email: 'payment@mrsoil.com' },
    { name: '11 Plc', contact: '+234 803 789 0123', email: 'finance@11plc.com' },
    { name: 'Rainoil Limited', contact: '+234 803 890 1234', email: 'accounts@rainoil.ng' },
    { name: 'NNPC Retail', contact: '+234 803 901 2345', email: 'billing@nnpc.com' },
    { name: 'Ardova Plc', contact: '+234 803 012 3456', email: 'finance@ardova.com' },
  ]

  const products = [
    'Premium Motor Spirit (PMS)',
    'Automotive Gas Oil (AGO)',
    'Low Pour Fuel Oil (LPFO)',
    'Dual Purpose Kerosene (DPK)',
    'Mixed Product Supply'
  ]

  const invoices: ARInvoice[] = []
  const now = new Date()

  for (let i = 0; i < 25; i++) {
    const customer = customers[i % customers.length]
    const product = products[i % products.length]
    const amount = Math.floor(Math.random() * 150000000) + 10000000
    const issueDate = new Date(now)
    issueDate.setDate(now.getDate() - Math.floor(Math.random() * 120))
    const dueDate = new Date(issueDate)
    dueDate.setDate(issueDate.getDate() + 30)
    const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))

    let status: ARInvoice['status'] = 'current'
    if (daysOverdue > 90) status = 'overdue_90'
    else if (daysOverdue > 60) status = 'overdue_60'
    else if (daysOverdue > 30) status = 'overdue_30'
    else if (daysOverdue > 0) status = 'overdue_30'

    invoices.push({
      id: String(i + 1),
      invoiceNumber: `INV-2024-${String(i + 1234).padStart(6, '0')}`,
      customerName: customer.name,
      customerContact: customer.contact,
      customerEmail: customer.email,
      amount,
      dueDate: dueDate.toISOString().split('T')[0],
      issueDate: issueDate.toISOString().split('T')[0],
      daysOverdue: Math.max(0, daysOverdue),
      status,
      paymentTerms: 'Net 30',
      description: `${product} - ${Math.floor(Math.random() * 200000) + 50000}L`,
      sagaReference: `SAGE-AR-${String(i + 1234).padStart(6, '0')}`
    })
  }

  return invoices
}

export default function ReceivablesPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'aging' | 'customers'>('dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('dueDate')

  const arInvoices = generateMockARInvoices()

  // Filter and sort invoices
  const filteredInvoices = arInvoices
    .filter(invoice => {
      const matchesSearch = invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.amount - a.amount
        case 'customer':
          return a.customerName.localeCompare(b.customerName)
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        default:
          return 0
      }
    })

  // Calculate totals
  const totals = {
    current: arInvoices.filter(inv => inv.status === 'current').reduce((sum, inv) => sum + inv.amount, 0),
    overdue_30: arInvoices.filter(inv => inv.status === 'overdue_30').reduce((sum, inv) => sum + inv.amount, 0),
    overdue_60: arInvoices.filter(inv => inv.status === 'overdue_60').reduce((sum, inv) => sum + inv.amount, 0),
    overdue_90: arInvoices.filter(inv => inv.status === 'overdue_90').reduce((sum, inv) => sum + inv.amount, 0),
  }

  const totalAR = Object.values(totals).reduce((sum, val) => sum + val, 0)
  const overdueAR = totals.overdue_30 + totals.overdue_60 + totals.overdue_90
  const overduePercentage = totalAR > 0 ? (overdueAR / totalAR) * 100 : 0

  // Calculate DSO (Days Sales Outstanding)
  const totalSales = totalAR // Simplified - in real app would be actual sales for period
  const averageDailyCredit = totalSales / 90 // Assume 90-day period
  const dso = averageDailyCredit > 0 ? totalAR / averageDailyCredit : 0

  // Group by customer for aging report
  const customerAging = Object.values(
    arInvoices.reduce((acc, inv) => {
      if (!acc[inv.customerName]) {
        acc[inv.customerName] = {
          customerName: inv.customerName,
          current: 0,
          overdue_30: 0,
          overdue_60: 0,
          overdue_90: 0,
          total: 0,
          invoiceCount: 0
        }
      }
      acc[inv.customerName][inv.status] += inv.amount
      acc[inv.customerName].total += inv.amount
      acc[inv.customerName].invoiceCount += 1
      return acc
    }, {} as Record<string, any>)
  ).sort((a, b) => b.total - a.total)

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center">
              <Receipt className="h-6 w-6 mr-2 text-blue-600" />
              Accounts Receivable
            </h1>
            <p className="text-muted-foreground">Manage customer invoices and payment collection</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Send className="h-4 w-4 mr-2" />
              Send Reminders
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Receivables</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(totalAR)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{arInvoices.length} invoices</p>
                </div>
                <Receipt className="h-10 w-10 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue Amount</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(overdueAR)}</p>
                  <p className="text-xs text-red-600 mt-1">{overduePercentage.toFixed(1)}% of total</p>
                </div>
                <AlertTriangle className="h-10 w-10 text-red-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Days Sales Outstanding</p>
                  <p className="text-2xl font-bold text-orange-600">{dso.toFixed(0)} days</p>
                  <p className="text-xs text-muted-foreground mt-1">Industry avg: 45 days</p>
                </div>
                <Clock className="h-10 w-10 text-orange-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Collection Rate</p>
                  <p className="text-2xl font-bold text-green-600">
                    {((totalAR - overdueAR) / totalAR * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    +5.2% vs last month
                  </p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-600/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2">
          {[
            { id: 'dashboard', label: 'AR Dashboard', icon: BarChart3 },
            { id: 'aging', label: 'Aging Report', icon: FileText },
            { id: 'customers', label: 'By Customer', icon: Building }
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

        {/* AR Summary (shown on all tabs) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="col-span-2 md:col-span-1 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-600 font-medium">Total AR</div>
            <div className="text-2xl font-bold text-blue-900">{formatCurrency(totalAR)}</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-xs text-green-600 font-medium">Current</div>
            <div className="text-lg font-bold text-green-900">{formatCurrency(totals.current)}</div>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-xs text-yellow-600 font-medium">1-30 Days</div>
            <div className="text-lg font-bold text-yellow-900">{formatCurrency(totals.overdue_30)}</div>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-xs text-orange-600 font-medium">31-60 Days</div>
            <div className="text-lg font-bold text-orange-900">{formatCurrency(totals.overdue_60)}</div>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-xs text-red-600 font-medium">90+ Days</div>
            <div className="text-lg font-bold text-red-900">{formatCurrency(totals.overdue_90)}</div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <Card>
            <CardHeader>
              <CardTitle>Outstanding Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search customers, invoices..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="current">Current</option>
                  <option value="overdue_30">1-30 Days Overdue</option>
                  <option value="overdue_60">31-60 Days Overdue</option>
                  <option value="overdue_90">90+ Days Overdue</option>
                </select>
                <select
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="dueDate">Sort by Due Date</option>
                  <option value="amount">Sort by Amount</option>
                  <option value="customer">Sort by Customer</option>
                </select>
              </div>

              {/* Invoice List */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredInvoices.slice(0, 10).map((invoice) => (
                  <div key={invoice.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-semibold text-gray-900">{invoice.invoiceNumber}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(invoice.status)}`}>
                              {getStatusLabel(invoice.status)}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{formatCurrency(invoice.amount)}</div>
                            {invoice.daysOverdue > 0 && (
                              <div className="text-sm text-red-600 font-medium">
                                {invoice.daysOverdue} days overdue
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-2 text-gray-400" />
                            {invoice.customerName}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            Due: {formatDateTime(invoice.dueDate).split(',')[0]}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                            {invoice.paymentTerms}
                          </div>
                        </div>

                        <div className="mt-2 text-sm text-gray-500">
                          {invoice.description}
                        </div>
                      </div>

                      <div className="flex md:flex-col gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        {invoice.status !== 'current' && (
                          <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                            <Send className="h-4 w-4 mr-2" />
                            Remind
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-center text-sm text-muted-foreground">
                Showing {Math.min(10, filteredInvoices.length)} of {filteredInvoices.length} invoices
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'aging' && (
          <Card>
            <CardHeader>
              <CardTitle>Accounts Receivable Aging Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Customer</th>
                      <th className="text-right py-3 px-4 font-semibold">Invoices</th>
                      <th className="text-right py-3 px-4 font-semibold">Current</th>
                      <th className="text-right py-3 px-4 font-semibold">1-30 Days</th>
                      <th className="text-right py-3 px-4 font-semibold">31-60 Days</th>
                      <th className="text-right py-3 px-4 font-semibold">90+ Days</th>
                      <th className="text-right py-3 px-4 font-semibold bg-gray-50">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerAging.map((customer, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{customer.customerName}</td>
                        <td className="py-3 px-4 text-right text-sm text-gray-600">{customer.invoiceCount}</td>
                        <td className="py-3 px-4 text-right text-sm">
                          {customer.current > 0 ? formatCurrency(customer.current) : '-'}
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-yellow-700">
                          {customer.overdue_30 > 0 ? formatCurrency(customer.overdue_30) : '-'}
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-orange-700">
                          {customer.overdue_60 > 0 ? formatCurrency(customer.overdue_60) : '-'}
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-red-700">
                          {customer.overdue_90 > 0 ? formatCurrency(customer.overdue_90) : '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-bold bg-gray-50">
                          {formatCurrency(customer.total)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-primary-50 font-bold">
                      <td className="py-3 px-4">TOTAL</td>
                      <td className="py-3 px-4 text-right">{arInvoices.length}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(totals.current)}</td>
                      <td className="py-3 px-4 text-right text-yellow-700">{formatCurrency(totals.overdue_30)}</td>
                      <td className="py-3 px-4 text-right text-orange-700">{formatCurrency(totals.overdue_60)}</td>
                      <td className="py-3 px-4 text-right text-red-700">{formatCurrency(totals.overdue_90)}</td>
                      <td className="py-3 px-4 text-right bg-primary-100">{formatCurrency(totalAR)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'customers' && (
          <Card>
            <CardHeader>
              <CardTitle>Receivables by Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customerAging.map((customer, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{customer.customerName}</h3>
                        <p className="text-sm text-muted-foreground">{customer.invoiceCount} invoices</p>
                      </div>
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Outstanding</span>
                        <span className="font-bold">{formatCurrency(customer.total)}</span>
                      </div>
                      {customer.overdue_30 + customer.overdue_60 + customer.overdue_90 > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-red-600">Overdue</span>
                          <span className="font-bold text-red-600">
                            {formatCurrency(customer.overdue_30 + customer.overdue_60 + customer.overdue_90)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                      {customer.overdue_30 + customer.overdue_60 + customer.overdue_90 > 0 && (
                        <Button size="sm" className="flex-1 bg-orange-600 hover:bg-orange-700">
                          <Send className="h-4 w-4 mr-2" />
                          Follow Up
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
