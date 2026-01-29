'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search,
  Plus,
  Eye,
  CheckCircle,
  AlertCircle,
  XCircle,
  X,
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Wrench,
  ShoppingCart,
  CreditCard,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { AppLayout } from '@/components/layout/AppLayout'
import { useToast } from '@/components/ui/Toast'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'

interface DailySalesSummary {
  id: string
  lubebay_id: number
  lubebay_name: string
  transaction_date: string
  transaction_type: 'lubricant_sales' | 'services'
  total_transactions: number
  total_amount: number
  lodged_amount: number
  outstanding_amount: number
  lodgement_status: 'unlodged' | 'partially_lodged' | 'fully_lodged'
  transactions: any[]
}

interface Lodgement {
  id: number
  lodgement_number: string
  lubebay: number | null
  lubebay_name?: string
  amount_lodged: number
  expected_amount: number
  variance: number
  lodgement_date: string
  payment_method: string
  bank_name?: string
  deposit_slip_number?: string
  reference_number?: string
  description?: string
  approval_status: string
  lodged_by_name?: string
  created_at: string
}

interface LodgementFormData {
  lubebay: number
  transaction_date: string
  transaction_type: 'lubricant_sales' | 'services'
  amount_lodged: number
  lodgement_date: string
  payment_method: string
  bank_name?: string
  account_number?: string
  deposit_slip_number?: string
  reference_number?: string
  description?: string
  notes?: string
}

function LubebayLodgementsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  // Tab state
  const [activeTab, setActiveTab] = useState<'summaries' | 'lodgements'>('summaries')

  // Pagination state
  const [summariesPage, setSummariesPage] = useState(1)
  const [lodgementsPage, setLodgementsPage] = useState(1)
  const [pageSize] = useState(20)

  // Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [lodgementStatusFilter, setLodgementStatusFilter] = useState<string>('all')
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<string>('all')

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedSummary, setSelectedSummary] = useState<DailySalesSummary | null>(null)
  const [selectedLodgement, setSelectedLodgement] = useState<Lodgement | null>(null)

  // Form state
  const [formData, setFormData] = useState<LodgementFormData>({
    lubebay: 0,
    transaction_date: '',
    transaction_type: 'lubricant_sales',
    amount_lodged: 0,
    lodgement_date: new Date().toISOString().split('T')[0],
    payment_method: 'bank_transfer',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Fetch daily sales summaries
  const { data: summariesData, isLoading: summariesLoading, refetch: refetchSummaries } = useQuery({
    queryKey: ['lubebay-daily-summaries', summariesPage, pageSize, searchTerm, lodgementStatusFilter, transactionTypeFilter],
    queryFn: async () => {
      // In real implementation, this would call the API
      // For now, return mock data structure
      const params: Record<string, any> = {
        page: summariesPage,
        page_size: pageSize,
      }
      if (searchTerm) params.search = searchTerm
      if (lodgementStatusFilter !== 'all') params.lodgement_status = lodgementStatusFilter
      if (transactionTypeFilter !== 'all') params.transaction_type = transactionTypeFilter

      // Mock API call - replace with actual endpoint
      try {
        return await apiClient.get('/lubebay-daily-summaries/', params)
      } catch {
        // Return empty for now
        return { results: [], count: 0 }
      }
    },
  })

  // Fetch lodgements
  const { data: lodgementsData, isLoading: lodgementsLoading, refetch: refetchLodgements } = useQuery({
    queryKey: ['lubebay-lodgements', lodgementsPage, pageSize, searchTerm],
    queryFn: async () => {
      const params: Record<string, any> = {
        page: lodgementsPage,
        page_size: pageSize,
        lodgement_type: 'lubebay',
      }
      if (searchTerm) params.search = searchTerm
      return apiClient.getLodgements(params)
    },
    enabled: activeTab === 'lodgements',
  })

  // Helper to extract array from API response
  const extractResults = (data: any) => {
    if (!data) return []
    if (Array.isArray(data)) return data
    if (data.results && Array.isArray(data.results)) return data.results
    return []
  }

  const summaries = extractResults(summariesData)
  const lodgements = extractResults(lodgementsData)
  const summariesTotalCount = summariesData?.count || summaries.length
  const summariesTotalPages = Math.ceil(summariesTotalCount / pageSize) || 1
  const lodgementsTotalCount = lodgementsData?.count || lodgements.length
  const lodgementsTotalPages = Math.ceil(lodgementsTotalCount / pageSize) || 1

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: LodgementFormData) => {
      const payload = {
        ...data,
        lodgement_type: 'lubebay',
        expected_amount: selectedSummary?.total_amount || 0,
      }
      return apiClient.createLodgement(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lubebay-daily-summaries'] })
      queryClient.invalidateQueries({ queryKey: ['lubebay-lodgements'] })
      setShowCreateModal(false)
      resetForm()
      addToast({ type: 'success', title: 'Success', message: 'Lodgement created successfully' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to create lodgement' })
    },
  })

  const resetForm = () => {
    setFormData({
      lubebay: 0,
      transaction_date: '',
      transaction_type: 'lubricant_sales',
      amount_lodged: 0,
      lodgement_date: new Date().toISOString().split('T')[0],
      payment_method: 'bank_transfer',
    })
    setFormErrors({})
    setSelectedSummary(null)
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.amount_lodged || formData.amount_lodged <= 0) {
      errors.amount_lodged = 'Amount must be greater than 0'
    }
    if (!formData.lodgement_date) {
      errors.lodgement_date = 'Date is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    createMutation.mutate(formData)
  }

  const handleCreateLodgement = (summary: DailySalesSummary) => {
    setSelectedSummary(summary)
    setFormData({
      ...formData,
      lubebay: summary.lubebay_id,
      transaction_date: summary.transaction_date,
      transaction_type: summary.transaction_type,
      amount_lodged: summary.outstanding_amount,
    })
    setShowCreateModal(true)
  }

  const getLodgementStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      unlodged: 'bg-red-100 text-red-800',
      partially_lodged: 'bg-yellow-100 text-yellow-800',
      fully_lodged: 'bg-green-100 text-green-800',
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const getLodgementStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      unlodged: 'Unlodged',
      partially_lodged: 'Partially Lodged',
      fully_lodged: 'Fully Lodged',
    }
    return labels[status] || status
  }

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      lubricant_sales: 'Lubricant Sales',
      services: 'Service Revenue',
    }
    return labels[type] || type
  }

  const getTransactionTypeIcon = (type: string) => {
    return type === 'lubricant_sales' ? (
      <ShoppingCart className="w-4 h-4 text-blue-600" />
    ) : (
      <Wrench className="w-4 h-4 text-green-600" />
    )
  }

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'Cash',
      bank_transfer: 'Bank Transfer',
      cheque: 'Cheque',
      pos: 'POS',
      mobile_money: 'Mobile Money',
    }
    return labels[method] || method
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lubebay Lodgements</h1>
            <p className="text-gray-600">Track daily sales summaries and bank lodgements from all lubebays</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => activeTab === 'summaries' ? refetchSummaries() : refetchLodgements()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'summaries'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('summaries')}
            >
              <ShoppingCart className="w-4 h-4 inline mr-2" />
              Daily Sales Summaries
            </button>
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'lodgements'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('lodgements')}
            >
              <CreditCard className="w-4 h-4 inline mr-2" />
              Lodgement History
            </button>
          </nav>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={activeTab === 'summaries' ? 'Search lubebays...' : 'Search lodgements...'}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setSummariesPage(1)
                setLodgementsPage(1)
              }}
            />
          </div>

          {activeTab === 'summaries' && (
            <>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                value={lodgementStatusFilter}
                onChange={(e) => {
                  setLodgementStatusFilter(e.target.value)
                  setSummariesPage(1)
                }}
              >
                <option value="all">All Status</option>
                <option value="unlodged">Unlodged</option>
                <option value="partially_lodged">Partially Lodged</option>
                <option value="fully_lodged">Fully Lodged</option>
              </select>

              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                value={transactionTypeFilter}
                onChange={(e) => {
                  setTransactionTypeFilter(e.target.value)
                  setSummariesPage(1)
                }}
              >
                <option value="all">All Types</option>
                <option value="lubricant_sales">Lubricant Sales</option>
                <option value="services">Service Revenue</option>
              </select>
            </>
          )}
        </div>

        {/* Daily Sales Summaries Tab */}
        {activeTab === 'summaries' && (
          <Card>
            <CardContent className="p-0">
              {summariesLoading ? (
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
                      </div>
                    ))}
                  </div>
                </div>
              ) : summaries.length === 0 ? (
                <div className="p-12 text-center">
                  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No sales summaries found</h3>
                  <p className="text-gray-500">No daily sales summaries available for lodgement.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Lubebay</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Transaction Date</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-900">Transactions</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-900">Total Amount</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-900">Lodged</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-900">Outstanding</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {summaries.map((summary: DailySalesSummary) => {
                          const canCreateLodgement = summary.lodgement_status !== 'fully_lodged'

                          return (
                            <tr key={summary.id} className="hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <Wrench className="w-4 h-4 text-orange-600" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">{summary.lubebay_name}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-gray-900">{formatDate(summary.transaction_date)}</span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  {getTransactionTypeIcon(summary.transaction_type)}
                                  <span className="text-sm">{getTransactionTypeLabel(summary.transaction_type)}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="text-sm text-gray-900">{summary.total_transactions}</span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className="font-bold text-gray-900">{formatCurrency(summary.total_amount)}</span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className="font-medium text-green-600">{formatCurrency(summary.lodged_amount)}</span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className={`font-medium ${summary.outstanding_amount > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                  {formatCurrency(summary.outstanding_amount)}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getLodgementStatusBadge(summary.lodgement_status)}`}>
                                  {summary.lodgement_status === 'fully_lodged' ? <CheckCircle className="w-3 h-3" /> :
                                   summary.lodgement_status === 'unlodged' ? <XCircle className="w-3 h-3" /> :
                                   <AlertCircle className="w-3 h-3" />}
                                  {getLodgementStatusLabel(summary.lodgement_status)}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => { setSelectedSummary(summary); setShowViewModal(true) }}
                                    className="p-1 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded"
                                    title="View Details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  {canCreateLodgement && (
                                    <Button
                                      size="sm"
                                      className="mofad-btn-primary"
                                      onClick={() => handleCreateLodgement(summary)}
                                      title="Create Lodgement"
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      Lodge
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {summariesTotalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                      <div className="text-sm text-gray-600">
                        Showing {((summariesPage - 1) * pageSize) + 1} to {Math.min(summariesPage * pageSize, summariesTotalCount)} of {summariesTotalCount} summaries
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSummariesPage(p => Math.max(1, p - 1))}
                          disabled={summariesPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">
                          Page {summariesPage} of {summariesTotalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSummariesPage(p => Math.min(summariesTotalPages, p + 1))}
                          disabled={summariesPage === summariesTotalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Lodgements History Tab */}
        {activeTab === 'lodgements' && (
          <Card>
            <CardContent className="p-0">
              {lodgementsLoading ? (
                <div className="p-6">
                  <div className="animate-pulse space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 py-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/4 mt-2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : lodgements.length === 0 ? (
                <div className="p-12 text-center">
                  <ArrowDownLeft className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No lodgements found</h3>
                  <p className="text-gray-500">No lubebay lodgements have been recorded yet.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Lodgement</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Lubebay</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-900">Amount</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Method</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-900">Date</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {lodgements.map((lodgement: Lodgement) => (
                          <tr key={lodgement.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                  <ArrowDownLeft className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{lodgement.lodgement_number}</div>
                                  <div className="text-sm text-gray-500">by {lodgement.lodged_by_name || 'Unknown'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-900">{lodgement.lubebay_name || 'N/A'}</span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="font-bold text-green-600">{formatCurrency(lodgement.amount_lodged)}</span>
                              {lodgement.variance !== 0 && (
                                <div className={`text-xs ${lodgement.variance < 0 ? 'text-red-500' : 'text-blue-500'}`}>
                                  Var: {formatCurrency(lodgement.variance)}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-700">{getPaymentMethodLabel(lodgement.payment_method)}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="text-sm text-gray-600">{formatDate(lodgement.lodgement_date)}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                lodgement.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                                lodgement.approval_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {lodgement.approval_status}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => { setSelectedLodgement(lodgement); setShowViewModal(true) }}
                                  className="p-1 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded"
                                  title="View"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {lodgementsTotalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                      <div className="text-sm text-gray-600">
                        Showing {((lodgementsPage - 1) * pageSize) + 1} to {Math.min(lodgementsPage * pageSize, lodgementsTotalCount)} of {lodgementsTotalCount} lodgements
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLodgementsPage(p => Math.max(1, p - 1))}
                          disabled={lodgementsPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">
                          Page {lodgementsPage} of {lodgementsTotalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLodgementsPage(p => Math.min(lodgementsTotalPages, p + 1))}
                          disabled={lodgementsPage === lodgementsTotalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Create Lodgement Modal */}
        {showCreateModal && selectedSummary && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h2 className="text-lg font-semibold">Create Lodgement</h2>
                  <p className="text-sm text-gray-600">{selectedSummary.lubebay_name} - {formatDate(selectedSummary.transaction_date)}</p>
                </div>
                <button onClick={() => { setShowCreateModal(false); resetForm() }}>
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Summary */}
              <div className="p-4 bg-gray-50 border-b">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Transaction Type</p>
                    <p className="font-medium">{getTransactionTypeLabel(selectedSummary.transaction_type)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Transactions</p>
                    <p className="font-medium">{selectedSummary.total_transactions}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Amount</p>
                    <p className="font-bold text-lg">{formatCurrency(selectedSummary.total_amount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Already Lodged</p>
                    <p className="font-medium text-green-600">{formatCurrency(selectedSummary.lodged_amount)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-600">Outstanding Balance</p>
                    <p className={`font-bold text-xl ${selectedSummary.outstanding_amount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(selectedSummary.outstanding_amount)}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount Lodged *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors.amount_lodged ? 'border-red-500' : 'border-gray-300'}`}
                      value={formData.amount_lodged || ''}
                      onChange={(e) => setFormData({ ...formData, amount_lodged: parseFloat(e.target.value) || 0 })}
                    />
                    {formErrors.amount_lodged && <p className="text-red-500 text-xs mt-1">{formErrors.amount_lodged}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors.lodgement_date ? 'border-red-500' : 'border-gray-300'}`}
                      value={formData.lodgement_date}
                      onChange={(e) => setFormData({ ...formData, lodgement_date: e.target.value })}
                    />
                    {formErrors.lodgement_date && <p className="text-red-500 text-xs mt-1">{formErrors.lodgement_date}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="pos">POS</option>
                    <option value="mobile_money">Mobile Money</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      value={formData.bank_name || ''}
                      onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      value={formData.account_number || ''}
                      onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Slip #</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      value={formData.deposit_slip_number || ''}
                      onChange={(e) => setFormData({ ...formData, deposit_slip_number: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reference #</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      value={formData.reference_number || ''}
                      onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={`Lodgement for ${getTransactionTypeLabel(selectedSummary.transaction_type)} - ${formatDate(selectedSummary.transaction_date)}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => { setShowCreateModal(false); resetForm() }}>
                    Cancel
                  </Button>
                  <Button type="submit" className="mofad-btn-primary" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Creating...' : 'Create Lodgement'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default LubebayLodgementsPage
