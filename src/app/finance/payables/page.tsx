'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  CreditCard,
  CheckCircle,
  Clock,
  AlertTriangle,
  Building,
  Phone,
  Mail,
  Eye,
  Send,
  Download,
  Search,
  Calendar,
  DollarSign,
  FileText,
  User,
  Truck,
  Package,
  TrendingUp,
  TrendingDown,
  BarChart3,
  RefreshCw
} from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils'

interface APInvoice {
  id: string
  invoiceNumber: string
  supplierName: string
  supplierContact: string
  supplierEmail: string
  amount: number
  dueDate: string
  issueDate: string
  daysUntilDue: number
  status: 'pending' | 'approved' | 'scheduled' | 'paid' | 'overdue'
  paymentTerms: string
  description: string
  category: 'petroleum_products' | 'transportation' | 'utilities' | 'services' | 'equipment'
  purchaseOrderRef: string
  sagaReference: string
  approvedBy?: string
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'scheduled':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'approved':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'overdue':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'paid':
      return 'Paid'
    case 'scheduled':
      return 'Scheduled'
    case 'approved':
      return 'Approved'
    case 'pending':
      return 'Pending Approval'
    case 'overdue':
      return 'Overdue'
    default:
      return 'Unknown'
  }
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'petroleum_products':
      return <Package className="h-4 w-4" />
    case 'transportation':
      return <Truck className="h-4 w-4" />
    case 'utilities':
      return <Building className="h-4 w-4" />
    case 'services':
      return <User className="h-4 w-4" />
    case 'equipment':
      return <FileText className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'petroleum_products':
      return 'text-blue-600 bg-blue-100'
    case 'transportation':
      return 'text-green-600 bg-green-100'
    case 'utilities':
      return 'text-purple-600 bg-purple-100'
    case 'services':
      return 'text-orange-600 bg-orange-100'
    case 'equipment':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

// Enhanced mock data generator
const generateMockAPInvoices = (): APInvoice[] => {
  const suppliers = [
    { name: 'Nigerian National Petroleum Corporation', contact: '+234 803 123 4567', email: 'finance@nnpc.gov.ng' },
    { name: 'Total Logistics Services', contact: '+234 803 234 5678', email: 'billing@totallogistics.ng' },
    { name: 'Port Harcourt Electricity Co.', contact: '+234 803 345 6789', email: 'billing@phed.ng' },
    { name: 'Marine Technical Consultants', contact: '+234 803 456 7890', email: 'invoices@mtc.ng' },
    { name: 'Industrial Equipment Nigeria Ltd', contact: '+234 803 567 8901', email: 'sales@indequip.ng' },
    { name: 'Chevron Nigeria Limited', contact: '+234 803 678 9012', email: 'accounts@chevron.ng' },
    { name: 'Shell Petroleum Dev. Company', contact: '+234 803 789 0123', email: 'payments@shell.ng' },
    { name: 'ExxonMobil Nigeria', contact: '+234 803 890 1234', email: 'finance@exxonmobil.ng' },
    { name: 'Oando Energy Services', contact: '+234 803 901 2345', email: 'billing@oando.com' },
    { name: 'Dangote Logistics', contact: '+234 803 012 3456', email: 'invoicing@dangote.com' },
  ]

  const categories: APInvoice['category'][] = [
    'petroleum_products', 'transportation', 'utilities', 'services', 'equipment'
  ]

  const statuses: APInvoice['status'][] = [
    'pending', 'approved', 'scheduled', 'paid', 'overdue'
  ]

  const invoices: APInvoice[] = []
  const now = new Date()

  for (let i = 0; i < 30; i++) {
    const supplier = suppliers[i % suppliers.length]
    const category = categories[i % categories.length]
    const amount = Math.floor(Math.random() * 400000000) + 5000000
    const issueDate = new Date(now)
    issueDate.setDate(now.getDate() - Math.floor(Math.random() * 90))
    const dueDate = new Date(issueDate)
    dueDate.setDate(issueDate.getDate() + 30)
    const daysUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    let status: APInvoice['status']
    if (daysUntilDue < -30) status = 'overdue'
    else if (daysUntilDue < 0 && Math.random() > 0.5) status = 'paid'
    else if (daysUntilDue < 5) status = 'scheduled'
    else if (daysUntilDue < 15) status = 'approved'
    else status = 'pending'

    invoices.push({
      id: String(i + 1),
      invoiceNumber: `${supplier.name.substring(0, 3).toUpperCase()}-INV-${String(i + 5678).padStart(6, '0')}`,
      supplierName: supplier.name,
      supplierContact: supplier.contact,
      supplierEmail: supplier.email,
      amount,
      dueDate: dueDate.toISOString().split('T')[0],
      issueDate: issueDate.toISOString().split('T')[0],
      daysUntilDue,
      status,
      paymentTerms: 'Net 30',
      description: `${category.replace('_', ' ').toUpperCase()} - Invoice ${i + 1}`,
      category,
      purchaseOrderRef: `PO-2024-${String(i + 1234).padStart(6, '0')}`,
      sagaReference: `SAGE-AP-${String(i + 5678).padStart(6, '0')}`,
      approvedBy: status === 'approved' || status === 'scheduled' || status === 'paid' ? 'CFO - John Smith' : undefined
    })
  }

  return invoices
}

export default function PayablesPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'aging' | 'suppliers' | 'schedule'>('dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('dueDate')

  const apInvoices = generateMockAPInvoices()

  // Filter and sort
  const filteredInvoices = apInvoices
    .filter(invoice => {
      const matchesSearch = invoice.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
      const matchesCategory = categoryFilter === 'all' || invoice.category === categoryFilter
      return matchesSearch && matchesStatus && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.amount - a.amount
        case 'supplier':
          return a.supplierName.localeCompare(b.supplierName)
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        default:
          return 0
      }
    })

  // Calculate totals
  const totals = {
    pending: apInvoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0),
    approved: apInvoices.filter(inv => inv.status === 'approved').reduce((sum, inv) => sum + inv.amount, 0),
    scheduled: apInvoices.filter(inv => inv.status === 'scheduled').reduce((sum, inv) => sum + inv.amount, 0),
    overdue: apInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0),
    paid: apInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0)
  }

  const totalAP = totals.pending + totals.approved + totals.scheduled + totals.overdue
  const paidThisMonth = totals.paid

  // Calculate DPO (Days Payable Outstanding)
  const averageDailyPurchases = totalAP / 90 // Simplified
  const dpo = averageDailyPurchases > 0 ? totalAP / averageDailyPurchases : 0

  // Group by supplier for aging
  const supplierAging = Object.values(
    apInvoices.filter(inv => inv.status !== 'paid').reduce((acc, inv) => {
      if (!acc[inv.supplierName]) {
        acc[inv.supplierName] = {
          supplierName: inv.supplierName,
          current: 0,
          due_7: 0,
          due_30: 0,
          overdue: 0,
          total: 0,
          invoiceCount: 0
        }
      }

      if (inv.daysUntilDue < 0) {
        acc[inv.supplierName].overdue += inv.amount
      } else if (inv.daysUntilDue <= 7) {
        acc[inv.supplierName].due_7 += inv.amount
      } else if (inv.daysUntilDue <= 30) {
        acc[inv.supplierName].due_30 += inv.amount
      } else {
        acc[inv.supplierName].current += inv.amount
      }

      acc[inv.supplierName].total += inv.amount
      acc[inv.supplierName].invoiceCount += 1
      return acc
    }, {} as Record<string, any>)
  ).sort((a, b) => b.total - a.total)

  // Payment schedule (next 30 days)
  const paymentSchedule = apInvoices
    .filter(inv => inv.status === 'scheduled' || inv.status === 'approved')
    .filter(inv => inv.daysUntilDue <= 30 && inv.daysUntilDue >= 0)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center">
              <CreditCard className="h-6 w-6 mr-2 text-orange-600" />
              Accounts Payable
            </h1>
            <p className="text-muted-foreground">Manage vendor invoices and payment processing</p>
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
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Process Payments
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Payables</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(totalAP)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{apInvoices.filter(i => i.status !== 'paid').length} unpaid</p>
                </div>
                <CreditCard className="h-10 w-10 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(totals.overdue)}</p>
                  <p className="text-xs text-red-600 mt-1">Needs immediate attention</p>
                </div>
                <AlertTriangle className="h-10 w-10 text-red-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Days Payable Outstanding</p>
                  <p className="text-2xl font-bold text-blue-600">{dpo.toFixed(0)} days</p>
                  <p className="text-xs text-muted-foreground mt-1">Target: 45 days</p>
                </div>
                <Clock className="h-10 w-10 text-blue-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Paid This Month</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(paidThisMonth)}</p>
                  <p className="text-xs text-green-600 mt-1">
                    <TrendingDown className="h-3 w-3 inline mr-1" />
                    On-time payment rate: 95%
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
            { id: 'dashboard', label: 'AP Dashboard', icon: BarChart3 },
            { id: 'aging', label: 'Aging Report', icon: FileText },
            { id: 'suppliers', label: 'By Supplier', icon: Building },
            { id: 'schedule', label: 'Payment Schedule', icon: Calendar }
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

        {/* AP Summary */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="col-span-2 md:col-span-1 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-sm text-orange-600 font-medium">Total AP</div>
            <div className="text-2xl font-bold text-orange-900">{formatCurrency(totalAP)}</div>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-xs text-yellow-600 font-medium">Pending</div>
            <div className="text-lg font-bold text-yellow-900">{formatCurrency(totals.pending)}</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-xs text-purple-600 font-medium">Approved</div>
            <div className="text-lg font-bold text-purple-900">{formatCurrency(totals.approved)}</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-xs text-blue-600 font-medium">Scheduled</div>
            <div className="text-lg font-bold text-blue-900">{formatCurrency(totals.scheduled)}</div>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-xs text-red-600 font-medium">Overdue</div>
            <div className="text-lg font-bold text-red-900">{formatCurrency(totals.overdue)}</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-xs text-green-600 font-medium">Paid</div>
            <div className="text-lg font-bold text-green-900">{formatCurrency(totals.paid)}</div>
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
                    placeholder="Search suppliers, invoices..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="overdue">Overdue</option>
                  <option value="paid">Paid</option>
                </select>
                <select
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="petroleum_products">Petroleum Products</option>
                  <option value="transportation">Transportation</option>
                  <option value="utilities">Utilities</option>
                  <option value="services">Services</option>
                  <option value="equipment">Equipment</option>
                </select>
                <select
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="dueDate">Sort by Due Date</option>
                  <option value="amount">Sort by Amount</option>
                  <option value="supplier">Sort by Supplier</option>
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
                            <div className={`flex items-center px-2 py-1 rounded-full text-xs ${getCategoryColor(invoice.category)}`}>
                              {getCategoryIcon(invoice.category)}
                              <span className="ml-1 capitalize">{invoice.category.replace('_', ' ')}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{formatCurrency(invoice.amount)}</div>
                            {invoice.daysUntilDue < 0 ? (
                              <div className="text-sm text-red-600 font-medium">
                                {Math.abs(invoice.daysUntilDue)} days overdue
                              </div>
                            ) : (
                              <div className="text-sm text-gray-600">
                                Due in {invoice.daysUntilDue} days
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-2 text-gray-400" />
                            {invoice.supplierName}
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
                        {invoice.status === 'pending' && (
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                        )}
                        {invoice.status === 'approved' && (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule
                          </Button>
                        )}
                        {(invoice.status === 'scheduled' || invoice.status === 'overdue') && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <DollarSign className="h-4 w-4 mr-2" />
                            Pay
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
              <CardTitle>Accounts Payable Aging Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Supplier</th>
                      <th className="text-right py-3 px-4 font-semibold">Invoices</th>
                      <th className="text-right py-3 px-4 font-semibold">Current</th>
                      <th className="text-right py-3 px-4 font-semibold">Due 7 Days</th>
                      <th className="text-right py-3 px-4 font-semibold">Due 30 Days</th>
                      <th className="text-right py-3 px-4 font-semibold">Overdue</th>
                      <th className="text-right py-3 px-4 font-semibold bg-gray-50">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplierAging.map((supplier, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{supplier.supplierName}</td>
                        <td className="py-3 px-4 text-right text-sm text-gray-600">{supplier.invoiceCount}</td>
                        <td className="py-3 px-4 text-right text-sm">
                          {supplier.current > 0 ? formatCurrency(supplier.current) : '-'}
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-blue-700">
                          {supplier.due_7 > 0 ? formatCurrency(supplier.due_7) : '-'}
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-orange-700">
                          {supplier.due_30 > 0 ? formatCurrency(supplier.due_30) : '-'}
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-red-700">
                          {supplier.overdue > 0 ? formatCurrency(supplier.overdue) : '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-bold bg-gray-50">
                          {formatCurrency(supplier.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'suppliers' && (
          <Card>
            <CardHeader>
              <CardTitle>Payables by Supplier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {supplierAging.map((supplier, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{supplier.supplierName}</h3>
                        <p className="text-sm text-muted-foreground">{supplier.invoiceCount} invoices</p>
                      </div>
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Outstanding</span>
                        <span className="font-bold">{formatCurrency(supplier.total)}</span>
                      </div>
                      {supplier.overdue > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-red-600">Overdue</span>
                          <span className="font-bold text-red-600">{formatCurrency(supplier.overdue)}</span>
                        </div>
                      )}
                      {supplier.due_7 > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-600">Due in 7 days</span>
                          <span className="font-bold text-blue-600">{formatCurrency(supplier.due_7)}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                      {supplier.overdue > 0 && (
                        <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'schedule' && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Schedule (Next 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentSchedule.map((invoice) => (
                  <div key={invoice.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          <span className="font-semibold text-gray-900">
                            {formatDateTime(invoice.dueDate).split(',')[0]}
                          </span>
                          <span className="text-sm text-gray-600">
                            ({invoice.daysUntilDue} days from now)
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(invoice.status)}`}>
                            {getStatusLabel(invoice.status)}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>{invoice.supplierName}</div>
                          <div>{invoice.invoiceNumber}</div>
                          <div className="font-bold text-gray-900">{formatCurrency(invoice.amount)}</div>
                        </div>
                      </div>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Pay
                      </Button>
                    </div>
                  </div>
                ))}

                {paymentSchedule.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No payments scheduled for the next 30 days</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
