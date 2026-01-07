'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useParams } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import mockApi from '@/lib/mockApi'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import {
  ArrowLeft,
  Users,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Calendar,
  FileText,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  Building,
  Star,
  Receipt,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  AlertCircle
} from 'lucide-react'

const getStatusBadge = (status: string) => {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    suspended: 'bg-yellow-100 text-yellow-800',
    blacklisted: 'bg-red-100 text-red-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

const getTransactionTypeBadge = (type: string) => {
  const colors: Record<string, string> = {
    purchase: 'bg-red-100 text-red-800',
    payment: 'bg-green-100 text-green-800',
    credit: 'bg-blue-100 text-blue-800',
    refund: 'bg-purple-100 text-purple-800',
    adjustment: 'bg-yellow-100 text-yellow-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  )
}

export default function CustomerDetailPage() {
  const router = useRouter()
  const params = useParams()
  const customerId = parseInt(params.id as string)
  const [filterType, setFilterType] = useState('all')
  const [dateRange, setDateRange] = useState('all')

  // Fetch customer details
  const { data: customer, isLoading: customerLoading } = useQuery({
    queryKey: ['customer-detail', customerId],
    queryFn: async () => {
      const customers = await mockApi.get('/customers')
      const customer = customers.find((c: any) => c.id === customerId)
      if (!customer) throw new Error('Customer not found')
      return customer
    },
  })

  // Fetch customer transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['customer-transactions', customerId, filterType, dateRange],
    queryFn: async () => {
      // Mock customer transactions data
      return [
        {
          id: 1,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'purchase',
          description: 'Premium Motor Spirit (PMS) - 5,000 Litres',
          reference: 'INV-2024-1001',
          debit: 3085000,
          credit: 0,
          balance: 3085000,
          payment_method: 'Credit Terms',
          status: 'completed'
        },
        {
          id: 2,
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'payment',
          description: 'Payment for Invoice INV-2024-0985',
          reference: 'PAY-2024-0321',
          debit: 0,
          credit: 2450000,
          balance: 635000,
          payment_method: 'Bank Transfer',
          status: 'completed'
        },
        {
          id: 3,
          date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'purchase',
          description: 'Automotive Gas Oil (AGO) - 3,000 Litres',
          reference: 'INV-2024-0985',
          debit: 2550000,
          credit: 0,
          balance: 3085000,
          payment_method: 'Credit Terms',
          status: 'completed'
        },
        {
          id: 4,
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'payment',
          description: 'Payment for Invoice INV-2024-0920',
          reference: 'PAY-2024-0298',
          debit: 0,
          credit: 1850000,
          balance: 535000,
          payment_method: 'Cash',
          status: 'completed'
        },
        {
          id: 5,
          date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'purchase',
          description: 'Engine Oil SAE 20W-50 - 100 Litres',
          reference: 'INV-2024-0920',
          debit: 450000,
          credit: 0,
          balance: 2385000,
          payment_method: 'Credit Terms',
          status: 'completed'
        },
        {
          id: 6,
          date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'payment',
          description: 'Payment for Invoice INV-2024-0875',
          reference: 'PAY-2024-0267',
          debit: 0,
          credit: 3200000,
          balance: 1935000,
          payment_method: 'Bank Transfer',
          status: 'completed'
        },
        {
          id: 7,
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'purchase',
          description: 'Premium Motor Spirit (PMS) - 8,000 Litres',
          reference: 'INV-2024-0875',
          debit: 4936000,
          credit: 0,
          balance: 5135000,
          payment_method: 'Credit Terms',
          status: 'completed'
        },
        {
          id: 8,
          date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'credit',
          description: 'Credit Limit Adjustment',
          reference: 'CRD-2024-0045',
          debit: 0,
          credit: 0,
          balance: 199000,
          payment_method: 'System Adjustment',
          status: 'completed'
        }
      ]
    },
  })

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction: any) => {
    if (filterType !== 'all' && transaction.type !== filterType) return false
    // Add date filtering logic here if needed
    return true
  })

  // Calculate summary stats
  const totalPurchases = transactions.filter((t: any) => t.type === 'purchase').reduce((sum: number, t: any) => sum + t.debit, 0)
  const totalPayments = transactions.filter((t: any) => t.type === 'payment').reduce((sum: number, t: any) => sum + t.credit, 0)
  const transactionCount = transactions.length

  if (customerLoading) {
    return (
      <AppLayout>
        <div className="p-6 space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!customer) {
    return (
      <AppLayout>
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Customer Not Found</h2>
          <p className="text-gray-500 mt-2">The customer you're looking for doesn't exist.</p>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Customer Details</h1>
              <p className="text-muted-foreground">Complete customer profile and transaction history</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Statement
            </Button>
            <Button className="mofad-btn-primary">
              <FileText className="w-4 h-4 mr-2" />
              New Transaction
            </Button>
          </div>
        </div>

        {/* Customer Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Profile */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Customer Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-10 h-10 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-xl font-semibold">{customer.name}</h2>
                    {getStatusBadge(customer.status)}
                    {customer.is_verified && (
                      <CheckCircle className="w-5 h-5 text-green-500" title="Verified Customer" />
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Customer Code:</span>
                        <span className="font-medium">{customer.customer_code}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{customer.email || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{customer.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">{[customer.city, customer.state_name].filter(Boolean).join(', ') || 'Not provided'}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Payment Type:</span>
                        <span className="font-medium">{customer.payment_type_name || 'Cash'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Customer Type:</span>
                        <span className="font-medium">{customer.customer_type_name || 'Individual'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Member Since:</span>
                        <span className="font-medium">{formatDateTime(customer.created_at).split(' ')[0]}</span>
                      </div>
                      {customer.business_name && (
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Business:</span>
                          <span className="font-medium">{customer.business_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Credit Limit</span>
                  <span className="font-semibold text-lg">{formatCurrency(customer.credit_limit)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current Balance</span>
                  <span className={`font-semibold text-lg ${customer.current_balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(customer.current_balance)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Spent</span>
                  <span className="font-semibold text-lg">{formatCurrency(customer.total_spent)}</span>
                </div>

                <hr className="my-4" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available Credit</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(customer.credit_limit - customer.current_balance)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Terms</span>
                    <span className="font-medium">{customer.payment_terms || 'Immediate'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Purchases</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(totalPurchases)}</p>
                </div>
                <ArrowUpRight className="w-8 h-8 text-red-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Payments</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPayments)}</p>
                </div>
                <ArrowDownLeft className="w-8 h-8 text-green-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Net Balance</p>
                  <p className={`text-2xl font-bold ${(totalPurchases - totalPayments) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(totalPurchases - totalPayments)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-2xl font-bold text-primary">{transactionCount}</p>
                </div>
                <Receipt className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Transaction History
              </CardTitle>
              <div className="flex gap-2">
                <select
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="purchase">Purchases</option>
                  <option value="payment">Payments</option>
                  <option value="credit">Credits</option>
                  <option value="refund">Refunds</option>
                </select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded-md"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Reference</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Debit</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Credit</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Balance</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTransactions.map((transaction: any) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium">
                              {formatDateTime(transaction.date).split(' ')[0]}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getTransactionTypeBadge(transaction.type)}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{transaction.description}</p>
                            <p className="text-xs text-gray-500">{transaction.payment_method}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm text-blue-600">{transaction.reference}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {transaction.debit > 0 ? (
                            <span className="font-semibold text-red-600">
                              {formatCurrency(transaction.debit)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {transaction.credit > 0 ? (
                            <span className="font-semibold text-green-600">
                              {formatCurrency(transaction.credit)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-semibold ${transaction.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(transaction.balance)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}