'use client'

import { useState } from 'react'
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
  Package
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

export function AccountsPayable() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('dueDate')

  // Mock AP data - in real implementation, this would come from SAGE API
  const apInvoices: APInvoice[] = [
    {
      id: '1',
      invoiceNumber: 'NNPC-INV-2024-5678',
      supplierName: 'Nigerian National Petroleum Corporation',
      supplierContact: '+234 803 123 4567',
      supplierEmail: 'finance@nnpc.gov.ng',
      amount: 450000000,
      dueDate: '2024-02-15',
      issueDate: '2024-01-16',
      daysUntilDue: 14,
      status: 'approved',
      paymentTerms: 'Net 30',
      description: 'Premium Motor Spirit (PMS) Supply - 1,000,000L',
      category: 'petroleum_products',
      purchaseOrderRef: 'PO-2024-001234',
      sagaReference: 'SAGE-AP-005678',
      approvedBy: 'CFO - John Smith'
    },
    {
      id: '2',
      invoiceNumber: 'TLG-INV-2024-1122',
      supplierName: 'Total Logistics Services',
      supplierContact: '+234 803 234 5678',
      supplierEmail: 'billing@totallogistics.ng',
      amount: 25600000,
      dueDate: '2024-02-10',
      issueDate: '2024-01-11',
      daysUntilDue: 9,
      status: 'scheduled',
      paymentTerms: 'Net 30',
      description: 'Transportation Services - Multiple Locations',
      category: 'transportation',
      purchaseOrderRef: 'PO-2024-001235',
      sagaReference: 'SAGE-AP-001122'
    },
    {
      id: '3',
      invoiceNumber: 'PHCN-INV-2024-9876',
      supplierName: 'Port Harcourt Electricity Distribution Company',
      supplierContact: '+234 803 345 6789',
      supplierEmail: 'billing@phed.ng',
      amount: 8900000,
      dueDate: '2024-01-25',
      issueDate: '2023-12-26',
      daysUntilDue: -6,
      status: 'overdue',
      paymentTerms: 'Net 30',
      description: 'Electricity Bills - Multiple Facilities',
      category: 'utilities',
      purchaseOrderRef: 'PO-2024-001236',
      sagaReference: 'SAGE-AP-009876'
    },
    {
      id: '4',
      invoiceNumber: 'MTC-INV-2024-3344',
      supplierName: 'Marine Technical Consultants',
      supplierContact: '+234 803 456 7890',
      supplierEmail: 'invoices@mtc.ng',
      amount: 12500000,
      dueDate: '2024-02-20',
      issueDate: '2024-01-21',
      daysUntilDue: 19,
      status: 'pending',
      paymentTerms: 'Net 30',
      description: 'Tank Inspection and Maintenance Services',
      category: 'services',
      purchaseOrderRef: 'PO-2024-001237',
      sagaReference: 'SAGE-AP-003344'
    },
    {
      id: '5',
      invoiceNumber: 'EQP-INV-2024-7788',
      supplierName: 'Industrial Equipment Nigeria Ltd',
      supplierContact: '+234 803 567 8901',
      supplierEmail: 'sales@indequip.ng',
      amount: 34700000,
      dueDate: '2024-03-01',
      issueDate: '2024-01-30',
      daysUntilDue: 29,
      status: 'pending',
      paymentTerms: 'Net 30',
      description: 'Storage Tank Equipment and Parts',
      category: 'equipment',
      purchaseOrderRef: 'PO-2024-001238',
      sagaReference: 'SAGE-AP-007788'
    },
    {
      id: '6',
      invoiceNumber: 'CHV-INV-2024-2233',
      supplierName: 'Chevron Nigeria Limited',
      supplierContact: '+234 803 678 9012',
      supplierEmail: 'accounts@chevron.ng',
      amount: 125000000,
      dueDate: '2024-01-20',
      issueDate: '2023-12-21',
      daysUntilDue: -11,
      status: 'paid',
      paymentTerms: 'Net 30',
      description: 'Automotive Gas Oil (AGO) Supply - 500,000L',
      category: 'petroleum_products',
      purchaseOrderRef: 'PO-2024-001239',
      sagaReference: 'SAGE-AP-002233'
    }
  ]

  // Filter and sort invoices
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

  // Calculate totals by status
  const totals = {
    pending: apInvoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0),
    approved: apInvoices.filter(inv => inv.status === 'approved').reduce((sum, inv) => sum + inv.amount, 0),
    scheduled: apInvoices.filter(inv => inv.status === 'scheduled').reduce((sum, inv) => sum + inv.amount, 0),
    overdue: apInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0),
    paid: apInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0)
  }

  const totalAP = Object.values(totals).reduce((sum, val) => sum + val, 0)

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-orange-600" />
            Accounts Payable
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Process Payments
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* AP Summary */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
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

        {/* AP List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredInvoices.map((invoice) => (
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

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <span>PO: {invoice.purchaseOrderRef}</span>
                      <span>•</span>
                      <span>SAGE: {invoice.sagaReference}</span>
                      {invoice.approvedBy && (
                        <>
                          <span>•</span>
                          <span>Approved by: {invoice.approvedBy}</span>
                        </>
                      )}
                    </div>
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

        {/* Payment Actions */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">Payment Management</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start">
              <CheckCircle className="h-4 w-4 mr-2" />
              Bulk Approve Payments
            </Button>
            <Button variant="outline" className="justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Payment Batch
            </Button>
            <Button variant="outline" className="justify-start">
              <Download className="h-4 w-4 mr-2" />
              Export to Bank File
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}