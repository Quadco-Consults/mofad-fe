'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import apiClient from '@/lib/apiClient'
import {
  Package,
  CheckCircle,
  Clock,
  Calendar,
  User,
  MapPin,
  ArrowRight,
  Search,
  Loader2,
  AlertCircle as AlertCircleIcon,
  TrendingUp,
  FileText,
  DollarSign,
  Eye
} from 'lucide-react'

interface PRFItem {
  id: number
  prf_number: string
  title: string
  description?: string
  department: string
  purpose?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  delivery_location?: number
  delivery_location_name?: string
  expected_delivery_date?: string
  estimated_total: number
  status: string
  requested_by_name?: string
  customer_name?: string
  created_at: string
  submitted_at?: string
  approved_at?: string
  total_items: number
  payment_confirmed: boolean
  payment_confirmed_at?: string
  goods_issued: boolean
  goods_issued_at?: string
  total_lodged: number
  outstanding_balance: number
}

interface PRFListResponse {
  count: number
  next: string | null
  previous: string | null
  results: PRFItem[]
}

export default function GoodsIssueDashboard() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  // Fetch PRFs ready for issue
  const { data: readyForIssueResponse, isLoading: isLoadingReady } = useQuery({
    queryKey: ['prfs-ready-for-issue', searchTerm, priorityFilter],
    queryFn: () => apiClient.get<PRFListResponse>('/prfs/ready-for-issue/'),
    refetchOnWindowFocus: false,
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  // Fetch recently issued PRFs
  const { data: recentlyIssuedResponse, isLoading: isLoadingIssued } = useQuery({
    queryKey: ['prfs-recently-issued'],
    queryFn: () => apiClient.get<PRFListResponse>('/prfs/?status=goods_issued&ordering=-goods_issued_at&limit=10'),
    refetchOnWindowFocus: false,
  })

  // Fetch payment pending PRFs
  const { data: paymentPendingResponse } = useQuery({
    queryKey: ['prfs-payment-pending'],
    queryFn: () => apiClient.get<PRFListResponse>('/prfs/payment-pending/'),
    refetchOnWindowFocus: false,
  })

  const readyForIssuePRFs = readyForIssueResponse?.results || []
  const recentlyIssuedPRFs = recentlyIssuedResponse?.results || []
  const paymentPendingCount = paymentPendingResponse?.count || 0

  // Filter PRFs
  const filteredPRFs = readyForIssuePRFs.filter(prf => {
    const matchesSearch = !searchTerm ||
      prf.prf_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prf.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prf.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPriority = priorityFilter === 'all' || prf.priority === priorityFilter

    return matchesSearch && matchesPriority
  })

  const handleViewPRF = (prfId: number) => {
    router.push(`/orders/prf/${prfId}`)
  }

  const getPriorityBadge = (priority: string) => {
    const badges = {
      low: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Low' },
      medium: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Medium' },
      high: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'High' },
      urgent: { bg: 'bg-red-100', text: 'text-red-800', label: 'Urgent' }
    }
    const badge = badges[priority as keyof typeof badges] || badges.medium
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${badge.bg} ${badge.text} font-medium`}>
        {badge.label}
      </span>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Goods Issue Dashboard</h1>
            <p className="text-gray-600">Manage and process PRF goods issuance</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-lg shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Ready for Issue</p>
                <p className="text-3xl font-bold">{readyForIssuePRFs.length}</p>
                <p className="text-xs opacity-75 mt-1">Payment confirmed</p>
              </div>
              <CheckCircle className="h-12 w-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-6 rounded-lg shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Payment Pending</p>
                <p className="text-3xl font-bold">{paymentPendingCount}</p>
                <p className="text-xs opacity-75 mt-1">Awaiting confirmation</p>
              </div>
              <Clock className="h-12 w-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-lg shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Issued Today</p>
                <p className="text-3xl font-bold">
                  {recentlyIssuedPRFs.filter(prf =>
                    prf.goods_issued_at &&
                    new Date(prf.goods_issued_at).toDateString() === new Date().toDateString()
                  ).length}
                </p>
                <p className="text-xs opacity-75 mt-1">Last 24 hours</p>
              </div>
              <Package className="h-12 w-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 rounded-lg shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Total Value Ready</p>
                <p className="text-xl font-bold">
                  {formatCurrency(readyForIssuePRFs.reduce((sum, prf) => sum + prf.estimated_total, 0))}
                </p>
                <p className="text-xs opacity-75 mt-1">Pending issuance</p>
              </div>
              <DollarSign className="h-12 w-12 opacity-80" />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by PRF number, title, or customer..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingReady && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-500 mb-4" />
            <p className="text-gray-600">Loading PRFs ready for issue...</p>
          </div>
        )}

        {/* Ready for Issue PRFs */}
        {!isLoadingReady && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Ready for Issue ({filteredPRFs.length})
              </h2>
            </div>

            {filteredPRFs.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No PRFs Ready for Issue</h3>
                <p className="text-gray-600">
                  {searchTerm
                    ? 'No PRFs match your search criteria.'
                    : 'All PRFs have been processed or are awaiting payment confirmation.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredPRFs.map((prf) => (
                  <div
                    key={prf.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 border-l-4 border-green-500"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{prf.prf_number}</h3>
                            {getPriorityBadge(prf.priority)}
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">
                              Ready for Issue
                            </span>
                          </div>
                          <p className="text-gray-700 font-medium mb-1">{prf.title}</p>
                          {prf.customer_name && (
                            <div className="flex items-center text-sm text-gray-600 mb-2">
                              <User className="w-4 h-4 mr-1" />
                              <span>Customer: {prf.customer_name}</span>
                            </div>
                          )}
                          {prf.delivery_location_name && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>Delivery: {prf.delivery_location_name}</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleViewPRF(prf.id)}
                          className="ml-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          Issue Goods
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Total Items</p>
                          <p className="text-sm font-semibold text-gray-900 flex items-center">
                            <Package className="w-4 h-4 mr-1 text-gray-400" />
                            {prf.total_items}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Total Value</p>
                          <p className="text-sm font-semibold text-gray-900 flex items-center">
                            <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
                            {formatCurrency(prf.estimated_total)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Payment Confirmed</p>
                          <p className="text-sm font-semibold text-green-600 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {prf.payment_confirmed_at ? formatDate(prf.payment_confirmed_at) : 'Yes'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Expected Delivery</p>
                          <p className="text-sm font-semibold text-gray-900 flex items-center">
                            <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                            {prf.expected_delivery_date ? formatDate(prf.expected_delivery_date) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recently Issued Section */}
        {recentlyIssuedPRFs.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Recently Issued ({recentlyIssuedPRFs.length})
              </h2>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PRF Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Issued At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentlyIssuedPRFs.map((prf) => (
                    <tr key={prf.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{prf.prf_number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{prf.customer_name || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{prf.total_items}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(prf.estimated_total)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {prf.goods_issued_at ? formatDateTime(prf.goods_issued_at) : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleViewPRF(prf.id)}
                          className="text-sm text-green-600 hover:text-green-800 font-medium flex items-center"
                        >
                          View
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
