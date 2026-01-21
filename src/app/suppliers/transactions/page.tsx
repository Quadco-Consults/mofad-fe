'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Search, Eye, Building, DollarSign, TrendingUp, Calendar, Package, Download, RefreshCw } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatDateTime } from '@/lib/utils'

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

const getSupplierTypeBadge = (type: string) => {
  const colors: Record<string, string> = {
    Primary: 'bg-blue-100 text-blue-800',
    Premium: 'bg-purple-100 text-purple-800',
    Standard: 'bg-green-100 text-green-800',
    Specialized: 'bg-orange-100 text-orange-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
      {type}
    </span>
  )
}

export default function SuppliersTransactionsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Fetch suppliers
  const { data: suppliersData, isLoading: suppliersLoading, error: suppliersError, refetch } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => apiClient.get('/suppliers')
  })

  // Fetch supplier transactions summary
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['suppliers-transactions-summary'],
    queryFn: () => apiClient.get('/suppliers/transactions/summary')
  })

  // Handle both array and paginated responses
  const extractResults = (data: any) => {
    if (Array.isArray(data)) return data
    if (data?.results && Array.isArray(data.results)) return data.results
    return []
  }

  const suppliers = extractResults(suppliersData)
  const transactionsSummary = extractResults(transactionsData)

  // Merge supplier data with transaction summaries
  const suppliersWithTransactions = suppliers.map((supplier: any) => {
    const transactions = transactionsSummary.find((t: any) => t.supplier_id === supplier.id)
    return {
      ...supplier,
      total_transactions: transactions?.total_transactions || 0,
      total_amount: transactions?.total_amount || 0,
      last_transaction_date: transactions?.last_transaction_date || null,
      ytd_transactions: transactions?.ytd_transactions || 0,
      ytd_amount: transactions?.ytd_amount || 0,
      pending_amount: transactions?.pending_amount || 0
    }
  })

  // Filter suppliers based on search
  const allFilteredSuppliers = suppliersWithTransactions.filter((supplier: any) => {
    if (!supplier) return false
    const matchesSearch = (supplier.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (supplier.contact_person || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (supplier.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // Pagination calculations
  const totalCount = allFilteredSuppliers.length
  const totalPages = Math.ceil(totalCount / pageSize) || 1
  const startIndex = (currentPage - 1) * pageSize
  const filteredSuppliers = allFilteredSuppliers.slice(startIndex, startIndex + pageSize)

  const handleViewTransactions = (supplier: any) => {
    router.push(`/suppliers/transactions/${supplier.id}`)
  }

  if (suppliersError) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-red-500">Error loading suppliers. Please try again.</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Supplier Transactions</h1>
            <p className="text-muted-foreground">Track all purchases and transactions with suppliers</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className={`w-4 h-4 mr-2 ${suppliersLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Suppliers</p>
                  <p className="text-2xl font-bold text-blue-600">{filteredSuppliers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">YTD Purchases</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(filteredSuppliers.reduce((sum, s) => sum + (s.ytd_amount || 0), 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {filteredSuppliers.reduce((sum, s) => sum + (s.total_transactions || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending Amount</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(filteredSuppliers.reduce((sum, s) => sum + (s.pending_amount || 0), 0))}
                  </p>
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
                placeholder="Search suppliers..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Suppliers Table */}
        <Card>
          <CardContent className="p-0">
            {suppliersLoading || transactionsLoading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 py-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4 mt-2"></div>
                      </div>
                      <div className="w-20 h-4 bg-gray-200 rounded"></div>
                      <div className="w-24 h-4 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : filteredSuppliers.length === 0 ? (
              <div className="p-12 text-center">
                <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Try adjusting your search term' : 'No suppliers available'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Supplier</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Total Transactions</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">YTD Amount</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Pending Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Last Transaction</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredSuppliers.map((supplier: any) => (
                      <tr key={supplier.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <Building className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{supplier.name}</div>
                              <div className="text-sm text-gray-500">{supplier.contact_person}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getSupplierTypeBadge(supplier.supplier_type)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="font-semibold text-gray-900">{supplier.total_transactions}</div>
                          <div className="text-xs text-gray-500">transactions</div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(supplier.ytd_amount)}
                          </div>
                          <div className="text-xs text-gray-500">this year</div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className={`font-semibold ${supplier.pending_amount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(supplier.pending_amount)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {supplier.pending_amount > 0 ? 'outstanding' : 'paid up'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-900">
                            {supplier.last_transaction_date
                              ? formatDateTime(supplier.last_transaction_date)
                              : 'No transactions'
                            }
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(supplier.status)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3"
                            title="View Transactions"
                            onClick={() => handleViewTransactions(supplier)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
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

        {/* Pagination */}
        {!suppliersLoading && totalCount > 0 && (
          <Card>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </Card>
        )}
      </div>
    </AppLayout>
  )
}