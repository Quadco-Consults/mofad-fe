'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Search, Download, Eye, Building, DollarSign, Calendar, Package, CheckCircle, AlertTriangle, Clock, FileText, CreditCard } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatDateTime } from '@/lib/utils'

const getStatusBadge = (status: string) => {
  const colors: Record<string, string> = {
    completed: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    processing: 'bg-blue-100 text-blue-800 border-blue-200'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

const getPaymentStatusBadge = (status: string) => {
  const colors: Record<string, string> = {
    paid: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    overdue: 'bg-red-100 text-red-800 border-red-200',
    processing: 'bg-blue-100 text-blue-800 border-blue-200'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export default function SupplierTransactionsDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supplierId = params?.id as string
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch supplier details
  const { data: suppliersData } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => apiClient.get('/suppliers')
  })

  // Fetch supplier transactions
  const { data: transactionsData, isLoading, error } = useQuery({
    queryKey: ['supplier-transactions', supplierId],
    queryFn: () => apiClient.get(`/suppliers/transactions/${supplierId}`)
  })

  // Handle both array and paginated responses for suppliers
  const extractResults = (data: any) => {
    if (Array.isArray(data)) return data
    if (data?.results && Array.isArray(data.results)) return data.results
    return []
  }

  const suppliers = extractResults(suppliersData)
  const supplier = suppliers.find((s: any) => s.id === parseInt(supplierId))

  // Filter transactions based on search
  const transactions = Array.isArray(transactionsData) ? transactionsData : []
  const filteredTransactions = transactions.filter((transaction: any) => {
    if (!transaction) return false
    const matchesSearch = (transaction.transaction_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.reference_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (error) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-red-500">Error loading supplier transactions. Please try again.</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-500">Loading supplier transactions...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!supplier) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Supplier not found.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/suppliers/transactions')}
            >
              Back to Suppliers
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  // Calculate summary stats
  const totalAmount = filteredTransactions.reduce((sum: number, t: any) => sum + t.amount, 0)
  const pendingAmount = filteredTransactions.filter((t: any) => t.payment_status === 'pending').reduce((sum: number, t: any) => sum + t.amount, 0)
  const completedTransactions = filteredTransactions.filter((t: any) => t.status === 'completed').length

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/suppliers/transactions')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Suppliers
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Transactions with {supplier.name}
              </h1>
              <p className="text-gray-600">
                All purchase transactions and orders from this supplier
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Supplier Info Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Building className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
                <p className="text-sm text-gray-600">{supplier.contact_person}</p>
                <p className="text-sm text-gray-500">{supplier.email} • {supplier.phone}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Total Transactions</div>
                <div className="text-2xl font-bold text-primary">{filteredTransactions.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(totalAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-xl font-bold text-green-600">{completedTransactions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {filteredTransactions.filter((t: any) => t.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending Payment</p>
                  <p className="text-xl font-bold text-red-600">{formatCurrency(pendingAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search transactions..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <Card>
          <CardContent className="p-0">
            {filteredTransactions.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-500">
                  {searchTerm
                    ? 'Try adjusting your search term'
                    : `No transactions available with ${supplier.name}`
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Transaction</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Products</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Amount</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Payment</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTransactions.map((transaction: any) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <FileText className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{transaction.transaction_id}</div>
                              <div className="text-sm text-gray-500">{transaction.reference_number}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-700">{transaction.transaction_type}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-900">
                            {transaction.products && transaction.products.length > 0 ? (
                              <div>
                                <div className="font-medium">{transaction.products[0].name}</div>
                                <div className="text-xs text-gray-500">
                                  {transaction.products[0].quantity} {transaction.products[0].unit}
                                  {transaction.products.length > 1 && ` +${transaction.products.length - 1} more`}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-500">No products</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(transaction.amount)}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(transaction.status)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {getPaymentStatusBadge(transaction.payment_status)}
                            {transaction.payment_status === 'paid' && (
                              <CheckCircle className="w-3 h-3 text-green-600" />
                            )}
                            {transaction.payment_status === 'pending' && (
                              <Clock className="w-3 h-3 text-yellow-600" />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {formatDateTime(transaction.transaction_date)}
                            </div>
                            {transaction.payment_date && (
                              <div className="text-xs text-gray-500">
                                Paid: {formatDateTime(transaction.payment_date)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
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