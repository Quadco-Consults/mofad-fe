'use client'

import { useState } from 'react'
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
  Building
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

export function AccountsReceivable() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('dueDate')

  // Mock AR data - in real implementation, this would come from SAGE API
  const arInvoices: ARInvoice[] = [
    {
      id: '1',
      invoiceNumber: 'INV-2024-001234',
      customerName: 'Total Nigeria Plc',
      customerContact: '+234 803 123 4567',
      customerEmail: 'finance@total.ng',
      amount: 45600000,
      dueDate: '2024-01-15',
      issueDate: '2023-12-16',
      daysOverdue: 15,
      status: 'overdue_30',
      paymentTerms: 'Net 30',
      description: 'Premium Motor Spirit (PMS) - 100,000L',
      sagaReference: 'SAGE-AR-001234'
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-001235',
      customerName: 'Mobil Oil Nigeria',
      customerContact: '+234 803 234 5678',
      customerEmail: 'accounts@mobil.ng',
      amount: 28900000,
      dueDate: '2024-02-01',
      issueDate: '2024-01-02',
      daysOverdue: 0,
      status: 'current',
      paymentTerms: 'Net 30',
      description: 'Automotive Gas Oil (AGO) - 50,000L',
      sagaReference: 'SAGE-AR-001235'
    },
    {
      id: '3',
      invoiceNumber: 'INV-2024-001236',
      customerName: 'Conoil Nigeria Limited',
      customerContact: '+234 803 345 6789',
      customerEmail: 'payment@conoil.com',
      amount: 67200000,
      dueDate: '2023-12-20',
      issueDate: '2023-11-20',
      daysOverdue: 42,
      status: 'overdue_60',
      paymentTerms: 'Net 30',
      description: 'Premium Motor Spirit (PMS) - 150,000L',
      sagaReference: 'SAGE-AR-001236'
    },
    {
      id: '4',
      invoiceNumber: 'INV-2024-001237',
      customerName: 'Oando Plc',
      customerContact: '+234 803 456 7890',
      customerEmail: 'finance@oando.com',
      amount: 156000000,
      dueDate: '2023-10-15',
      issueDate: '2023-09-15',
      daysOverdue: 108,
      status: 'overdue_90',
      paymentTerms: 'Net 30',
      description: 'Mixed Product Supply - Multiple Grades',
      sagaReference: 'SAGE-AR-001237'
    },
    {
      id: '5',
      invoiceNumber: 'INV-2024-001238',
      customerName: 'Forte Oil Plc',
      customerContact: '+234 803 567 8901',
      customerEmail: 'accounts@forteoil.com',
      amount: 34500000,
      dueDate: '2024-01-25',
      issueDate: '2023-12-26',
      daysOverdue: 5,
      status: 'current',
      paymentTerms: 'Net 30',
      description: 'Low Pour Fuel Oil (LPFO) - 75,000L',
      sagaReference: 'SAGE-AR-001238'
    }
  ]

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

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Receipt className="h-5 w-5 text-blue-600" />
            Accounts Receivable
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Send className="h-4 w-4 mr-2" />
              Send Reminders
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* AR Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
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

        {/* AR List */}
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

                  <div className="mt-3 flex items-center space-x-2 text-xs text-gray-400">
                    <span>SAGE: {invoice.sagaReference}</span>
                    <span>•</span>
                    <span>Issued: {formatDateTime(invoice.issueDate).split(',')[0]}</span>
                  </div>
                </div>

                <div className="flex md:flex-col gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
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

        {/* Collection Actions */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">Collection Actions</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start">
              <Send className="h-4 w-4 mr-2" />
              Send Payment Reminders
            </Button>
            <Button variant="outline" className="justify-start">
              <Phone className="h-4 w-4 mr-2" />
              Schedule Collection Calls
            </Button>
            <Button variant="outline" className="justify-start">
              <Download className="h-4 w-4 mr-2" />
              Generate AR Reports
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}