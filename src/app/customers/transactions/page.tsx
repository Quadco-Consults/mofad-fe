'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Search, Filter, Download, Plus, Eye, Edit, Trash2, TrendingUp, CreditCard, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { AppLayout } from '@/components/layout/AppLayout'
import apiClient from '@/lib/apiClient'

interface CustomerLodgement {
  id: number
  lodgement_number: string
  lodgement_type: string
  entity_name: string
  customer: number
  customer_name: string
  prf: number | null
  prf_number: string | null
  prf_total: string | null
  amount_lodged: string
  expected_amount: string
  variance: string
  lodgement_date: string
  payment_method: string
  bank_name: string
  deposit_slip_number: string
  reference_number: string
  transaction_reference: string
  description: string
  approval_status: 'pending' | 'awaiting_approval' | 'approved' | 'rejected' | 'cancelled'
  lodged_by_name: string
  created_at: string
}

function CustomerTransactionsPage() {
  const router = useRouter()
  const { data: lodgementResponse, isLoading, error } = useQuery({
    queryKey: ['customer-lodgements'],
    queryFn: () => apiClient.get('/lodgements/', { params: { lodgement_type: 'customer' } })
  })

  const lodgements = (lodgementResponse?.results || []) as CustomerLodgement[]
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [customerTypeFilter, setCustomerTypeFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, typeFilter, statusFilter, customerTypeFilter])

  const paymentMethods = Array.from(new Set(lodgements.filter(l => l?.payment_method).map(l => l.payment_method)))
  const customerTypes = Array.from(new Set(lodgements.filter(l => l?.customer_name).map(l => l.customer_name)))

  const allFilteredLodgements = lodgements.filter(lodgement => {
    if (!lodgement) return false

    const matchesSearch = (lodgement.lodgement_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lodgement.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lodgement.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lodgement.reference_number || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === 'all' || lodgement.payment_method === typeFilter
    const matchesStatus = statusFilter === 'all' || lodgement.approval_status === statusFilter
    const matchesCustomerType = customerTypeFilter === 'all' || lodgement.customer_name?.toLowerCase().includes(customerTypeFilter.toLowerCase())

    return matchesSearch && matchesType && matchesStatus && matchesCustomerType
  })

  // Pagination calculations
  const totalCount = allFilteredLodgements.length
  const totalPages = Math.ceil(totalCount / pageSize) || 1
  const startIndex = (currentPage - 1) * pageSize
  const filteredLodgements = allFilteredLodgements.slice(startIndex, startIndex + pageSize)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      awaiting_approval: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const getStatusDisplay = (status: string) => {
    const displays = {
      pending: 'Pending',
      awaiting_approval: 'Awaiting Approval',
      approved: 'Approved',
      rejected: 'Rejected',
      cancelled: 'Cancelled'
    }
    return displays[status as keyof typeof displays] || status
  }

  // Calculate summary stats
  const totalLodgements = lodgements?.length || 0
  const approvedLodgements = lodgements.filter(l => l?.approval_status === 'approved').length
  const pendingLodgements = lodgements.filter(l => l?.approval_status === 'pending' || l?.approval_status === 'awaiting_approval').length
  const totalAmountLodged = lodgements.filter(l => l?.approval_status === 'approved').reduce((sum, l) => sum + (parseFloat(l?.amount_lodged || '0')), 0)

  const handleView = (lodgement: CustomerLodgement) => {
    router.push(`/customers/transactions/${lodgement.id}`)
  }

  const handleApprove = async (lodgement: CustomerLodgement) => {
    try {
      await apiClient.post(`/lodgements/${lodgement.id}/approve/`)
      // Refetch data to update UI
      window.location.reload()
    } catch (error) {
      console.error('Failed to approve lodgement:', error)
      alert('Failed to approve lodgement. Please try again.')
    }
  }

  const handleReject = async (lodgement: CustomerLodgement) => {
    const reason = prompt('Please provide a reason for rejection:')
    if (reason) {
      try {
        await apiClient.post(`/lodgements/${lodgement.id}/reject/`, { reason })
        // Refetch data to update UI
        window.location.reload()
      } catch (error) {
        console.error('Failed to reject lodgement:', error)
        alert('Failed to reject lodgement. Please try again.')
      }
    }
  }

  if (error) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-red-500">Error loading customer lodgements. Please try again.</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Lodgements</h1>
            <p className="text-gray-600">Track and approve customer deposits against PRF orders</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button className="mofad-btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Lodgement
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Lodgements</p>
                <p className="text-2xl font-bold text-gray-900">{totalLodgements}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{approvedLodgements}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingLodgements}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount Lodged</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalAmountLodged)}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search lodgements..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Payment Methods</option>
            {paymentMethods.map(method => (
              <option key={method} value={method}>
                {method.charAt(0).toUpperCase() + method.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="awaiting_approval">Awaiting Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={customerTypeFilter}
            onChange={(e) => setCustomerTypeFilter(e.target.value)}
          >
            <option value="all">All Customer Types</option>
            {customerTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-gray-500">Loading customer lodgements...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Lodged
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lodged By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teller No/Bank ref
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confirm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLodgements.map((lodgement) => (
                    <tr key={lodgement.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-primary-600">{lodgement.lodgement_number}</div>
                        <div className="text-xs text-gray-400">PRF: {lodgement.prf_number || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{lodgement.customer_name}</div>
                        <div className="text-xs text-gray-400">ID: {lodgement.customer}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-green-600">
                          {formatCurrency(parseFloat(lodgement.amount_lodged))}
                        </div>
                        <div className="text-xs text-gray-500">{lodgement.payment_method?.replace('_', ' ')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(lodgement.lodgement_date)}</div>
                        <div className="text-xs text-gray-500">{formatDateTime(lodgement.created_at)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{lodgement.lodged_by_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{lodgement.deposit_slip_number || lodgement.reference_number}</div>
                        <div className="text-xs text-gray-500">{lodgement.bank_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {lodgement.approval_status === 'pending' || lodgement.approval_status === 'awaiting_approval' ? (
                          <div className="flex space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApprove(lodgement)}
                              className="text-green-600 hover:text-green-700 text-xs px-2 py-1"
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(lodgement)}
                              className="text-red-600 hover:text-red-700 text-xs px-2 py-1"
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusBadge(lodgement.approval_status || 'unknown')}`}>
                          {getStatusDisplay(lodgement.approval_status || 'unknown')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(lodgement)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalCount > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  className="border-t border-gray-200"
                />
              )}
            </div>
          )}
        </div>

        {!isLoading && filteredLodgements.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No lodgements found matching your criteria.</p>
          </div>
        )}

        {/* Add Lodgement Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">Add New Customer Lodgement</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                      <option>Select Customer</option>
                      <option>Conoil Petroleum Ltd</option>
                      <option>MRS Oil Nigeria Plc</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PRF</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                      <option>Select PRF</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount Lodged</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                      <option>Bank Transfer</option>
                      <option>Cash</option>
                      <option>Cheque</option>
                      <option>POS</option>
                      <option>Mobile Money</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Slip Number</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" rows={3}></textarea>
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button className="mofad-btn-primary">Create Lodgement</Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  )
}

export default CustomerTransactionsPage