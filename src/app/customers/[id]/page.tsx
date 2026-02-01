'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useParams } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import apiClient from '@/lib/apiClient'
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
  CheckCircle,
  Building,
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
  if (!type) return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">N/A</span>

  const typeLower = type.toLowerCase()
  const colors: Record<string, string> = {
    purchase: 'bg-red-100 text-red-800',
    payment: 'bg-green-100 text-green-800',
    credit: 'bg-blue-100 text-blue-800',
    debit: 'bg-red-100 text-red-800',
    refund: 'bg-purple-100 text-purple-800',
    adjustment: 'bg-yellow-100 text-yellow-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[typeLower] || 'bg-gray-100 text-gray-800'}`}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  )
}

const getPrfStatusBadge = (status: string) => {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    submitted: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    fulfilled: 'bg-purple-100 text-purple-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

const getApprovalStatusBadge = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export default function CustomerDetailPage() {
  const router = useRouter()
  const params = useParams()
  const customerId = parseInt(params.id as string)
  const [filterType, setFilterType] = useState('all')
  const [dateRange, setDateRange] = useState('all')
  const [activeTab, setActiveTab] = useState<'prfs' | 'transactions' | 'lodgements'>('prfs')

  // Fetch customer details
  const { data: customer, isLoading: customerLoading } = useQuery({
    queryKey: ['customer-detail', customerId],
    queryFn: async () => {
      return apiClient.get(`/customers/${customerId}/`)
    },
  })

  // Fetch customer transactions
  const { data: transactionsResponse, isLoading: transactionsLoading } = useQuery({
    queryKey: ['customer-transactions', customerId, filterType, dateRange],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/customer-transactions/`, {
          customer: customerId,
          page_size: 100
        })
        console.log('Transactions Response:', response)
        return response
      } catch (error) {
        console.error('Error fetching transactions:', error)
        return { data: { results: [], paginator: { count: 0 } } }
      }
    },
  })

  // Fetch customer PRFs
  const { data: prfsResponse, isLoading: prfsLoading } = useQuery({
    queryKey: ['customer-prfs', customerId],
    queryFn: async () => {
      try {
        const response = await apiClient.getPrfs({
          client_id: customerId,
          page_size: 100
        })
        return response
      } catch (error) {
        console.error('Error fetching PRFs:', error)
        return { data: { results: [], paginator: { count: 0 } } }
      }
    },
  })

  // Fetch customer lodgements
  const { data: lodgementsResponse, isLoading: lodgementsLoading } = useQuery({
    queryKey: ['customer-lodgements', customerId],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/lodgements/', {
          customer: customerId,
          page_size: 100
        })
        return response
      } catch (error) {
        console.error('Error fetching lodgements:', error)
        return { data: { results: [], paginator: { count: 0 } } }
      }
    },
  })

  // Extract transactions from response
  const transactionsData = transactionsResponse?.data || transactionsResponse
  const transactionsArray = transactionsData?.results || []
  const transactionCount = transactionsData?.paginator?.count || transactionsArray.length

  const filteredTransactions = transactionsArray.filter((transaction: any) => {
    if (filterType !== 'all' && transaction.transaction_type?.toLowerCase() !== filterType) return false
    return true
  })

  // Extract PRFs from response
  const prfsData = prfsResponse?.data || prfsResponse
  const prfs = prfsData?.results || []
  const prfCount = prfsData?.paginator?.count || prfs.length

  // Extract lodgements from response
  const lodgementsData = lodgementsResponse?.data || lodgementsResponse
  const lodgements = lodgementsData?.results || []
  const lodgementsCount = lodgementsData?.paginator?.count || lodgements.length

  // Calculate summary stats
  const totalPurchases = transactionsArray
    .filter((t: any) => t.transaction_type?.toLowerCase() === 'debit' || t.transaction_type?.toLowerCase() === 'purchase')
    .reduce((sum: number, t: any) => sum + (parseFloat(t.amount) || 0), 0)
  const totalPayments = transactionsArray
    .filter((t: any) => t.transaction_type?.toLowerCase() === 'credit' || t.transaction_type?.toLowerCase() === 'payment')
    .reduce((sum: number, t: any) => sum + (parseFloat(t.amount) || 0), 0)

  // Calculate PRF stats
  const totalPrfValue = prfs.reduce((sum: number, prf: any) => {
    const estimatedTotal = parseFloat(prf.estimated_total) || 0
    return sum + estimatedTotal
  }, 0)

  // Calculate lodgement stats
  const totalLodged = lodgements.reduce((sum: number, lodg: any) => {
    const amount = parseFloat(lodg.amount_lodged) || 0
    return sum + amount
  }, 0)

  const totalApprovedLodgements = lodgements
    .filter((lodg: any) => lodg.approval_status === 'approved')
    .reduce((sum: number, lodg: any) => {
      const amount = parseFloat(lodg.amount_lodged) || 0
      return sum + amount
    }, 0)

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
          <p className="text-gray-500 mt-2">The customer you&apos;re looking for doesn&apos;t exist.</p>
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

        {/* Tabbed Interface */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('prfs')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === 'prfs'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    PRFs ({prfCount})
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === 'transactions'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4" />
                    Transactions ({transactionCount})
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('lodgements')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === 'lodgements'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Lodgements ({lodgementsCount})
                  </div>
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* PRFs Tab */}
            {activeTab === 'prfs' && (
              prfsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded-md"></div>
                    </div>
                  ))}
                </div>
              ) : prfs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">PRF Number</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Title</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Priority</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900">Estimated Total</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Created</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {prfs.map((prf: any) => (
                        <tr key={prf.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <span className="font-mono text-sm text-blue-600">{prf.prf_number}</span>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-900">{prf.title || 'N/A'}</p>
                            <p className="text-xs text-gray-500">{prf.description || ''}</p>
                          </td>
                          <td className="py-3 px-4">
                            {getPrfStatusBadge(prf.status)}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              prf.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                              prf.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              prf.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {prf.priority?.charAt(0).toUpperCase() + prf.priority?.slice(1) || 'N/A'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-semibold text-primary">
                              {formatCurrency(prf.estimated_total || 0)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{formatDateTime(prf.created_at).split(' ')[0]}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/orders/prf/${prf.id}`)}
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total PRF Value:</span>
                      <span className="text-lg font-bold text-primary">{formatCurrency(totalPrfValue)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No PRFs found for this customer</p>
                </div>
              )
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              transactionsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded-md"></div>
                    </div>
                  ))}
                </div>
              ) : filteredTransactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <div className="flex gap-2 mb-4">
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
                      {filteredTransactions.map((transaction: any) => {
                        const amount = parseFloat(transaction.amount) || 0
                        const isDebit = transaction.transaction_type?.toLowerCase() === 'debit'
                        const isCredit = transaction.transaction_type?.toLowerCase() === 'credit'
                        const balance = parseFloat(transaction.balance_after || transaction.balance) || 0

                        return (
                          <tr key={transaction.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium">
                                  {formatDateTime(transaction.created_at).split(' ')[0]}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {getTransactionTypeBadge(transaction.transaction_type)}
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium text-gray-900">{transaction.description || 'N/A'}</p>
                                <p className="text-xs text-gray-500">{transaction.payment_method || ''}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-mono text-sm text-blue-600">{transaction.reference_number || 'N/A'}</span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              {isDebit ? (
                                <span className="font-semibold text-red-600">
                                  {formatCurrency(amount)}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {isCredit ? (
                                <span className="font-semibold text-green-600">
                                  {formatCurrency(amount)}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className={`font-semibold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {formatCurrency(balance)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No transactions found for this customer</p>
                </div>
              )
            )}

            {/* Lodgements Tab */}
            {activeTab === 'lodgements' && (
              lodgementsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded-md"></div>
                    </div>
                  ))}
                </div>
              ) : lodgements.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Lodgement #</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">PRF Number</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900">Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Payment Method</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {lodgements.map((lodgement: any) => (
                        <tr key={lodgement.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <span className="font-mono text-sm text-blue-600">{lodgement.lodgement_number}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-sm">{lodgement.prf?.prf_number || 'N/A'}</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-semibold text-primary">
                              {formatCurrency(lodgement.amount_lodged || 0)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm">{lodgement.payment_method || 'N/A'}</span>
                          </td>
                          <td className="py-3 px-4">
                            {getApprovalStatusBadge(lodgement.approval_status)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{formatDateTime(lodgement.lodgement_date).split(' ')[0]}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/accounts/lodgements/${lodgement.id}`)}
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Lodged:</span>
                        <span className="text-lg font-bold text-primary">{formatCurrency(totalLodged)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Approved Lodgements:</span>
                        <span className="text-lg font-bold text-green-600">{formatCurrency(totalApprovedLodgements)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No lodgements found for this customer</p>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
