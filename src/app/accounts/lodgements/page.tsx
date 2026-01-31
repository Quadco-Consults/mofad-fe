'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search,
  Plus,
  Eye,
  CheckCircle,
  AlertCircle,
  XCircle,
  DollarSign,
  X,
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FileText,
  CreditCard,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { AppLayout } from '@/components/layout/AppLayout'
import { useToast } from '@/components/ui/Toast'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'

interface PRF {
  id: number
  prf_number: string
  title: string
  description: string | null
  estimated_total: number
  status: string
  client_type: string | null
  client_id: number | null
  customer_name: string | null
  requested_by_name: string | null
  created_at: string
  approved_at: string | null
  // Payment tracking fields
  total_lodged?: number
  outstanding_balance?: number
  payment_status?: 'unpaid' | 'partially_paid' | 'paid' | 'overpaid'
  lodgements?: LodgementSummary[]
}

interface LodgementSummary {
  id: number
  lodgement_number: string
  amount_lodged: number
  lodgement_date: string
  approval_status: string
  payment_method: string
}

interface Lodgement {
  id: number
  lodgement_number: string
  lodgement_type: string
  prf: number | null
  prf_number?: string
  customer_name?: string
  entity_name?: string
  amount_lodged: number
  expected_amount: number
  variance: number
  lodgement_date: string
  payment_method: string
  bank_name?: string
  deposit_slip_number?: string
  reference_number?: string
  description?: string
  notes?: string
  approval_status: string
  rejection_reason?: string
  lodged_by_name?: string
  approved_by_name?: string
  created_at: string
}

interface LodgementFormData {
  prf: number
  amount_lodged: number
  lodgement_date: string
  payment_method: string
  bank_name?: string
  account_number?: string
  deposit_slip_number?: string
  reference_number?: string
  transaction_reference?: string
  description?: string
  notes?: string
}

function LodgementsPage() {
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  // Tab state
  const [activeTab, setActiveTab] = useState<'prfs' | 'lodgements'>('prfs')

  // Pagination state
  const [prfPage, setprfPage] = useState(1)
  const [lodgementPage, setLodgementPage] = useState(1)
  const [pageSize] = useState(20)

  // Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all')

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedPRF, setSelectedPRF] = useState<PRF | null>(null)
  const [selectedLodgement, setSelectedLodgement] = useState<Lodgement | null>(null)

  // Form state
  const [formData, setFormData] = useState<LodgementFormData>({
    prf: 0,
    amount_lodged: 0,
    lodgement_date: new Date().toISOString().split('T')[0],
    payment_method: 'bank_transfer',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Fetch PRFs with payment status
  const { data: prfData, isLoading: prfsLoading, refetch: refetchPRFs } = useQuery({
    queryKey: ['prfs-for-lodgement', prfPage, pageSize, searchTerm, statusFilter, paymentStatusFilter],
    queryFn: async () => {
      const params: Record<string, any> = {
        page: prfPage,
        page_size: pageSize,
        status: 'approved,fulfilled,partially_fulfilled', // Only show approved PRFs
      }
      if (searchTerm) params.search = searchTerm
      return apiClient.getPrfs(params)
    },
  })

  // Fetch lodgements
  const { data: lodgementsData, isLoading: lodgementsLoading, refetch: refetchLodgements } = useQuery({
    queryKey: ['customer-lodgements', lodgementPage, pageSize, searchTerm],
    queryFn: async () => {
      const params: Record<string, any> = {
        page: lodgementPage,
        page_size: pageSize,
        // Remove lodgement_type filter to show all lodgements
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

  const prfs = extractResults(prfData)
  const lodgements = extractResults(lodgementsData)
  const prfTotalCount = prfData?.count || prfs.length
  const prfTotalPages = Math.ceil(prfTotalCount / pageSize) || 1
  const lodgementTotalCount = lodgementsData?.count || lodgements.length
  const lodgementTotalPages = Math.ceil(lodgementTotalCount / pageSize) || 1

  // Calculate payment status for each PRF
  const getPRFWithPaymentStatus = (prf: PRF) => {
    const total = Number(prf.estimated_total || 0)
    const lodged = Number(prf.total_lodged || 0)
    const outstanding = total - lodged

    let paymentStatus: 'unpaid' | 'partially_paid' | 'paid' | 'overpaid' = 'unpaid'
    if (lodged === 0) paymentStatus = 'unpaid'
    else if (lodged < total) paymentStatus = 'partially_paid'
    else if (lodged === total) paymentStatus = 'paid'
    else paymentStatus = 'overpaid'

    return {
      ...prf,
      total_lodged: lodged,
      outstanding_balance: outstanding,
      payment_status: paymentStatus,
    }
  }

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: LodgementFormData) => {
      const payload = {
        ...data,
        lodgement_type: 'customer',
        customer: selectedPRF?.client_id,
        expected_amount: selectedPRF?.estimated_total || 0,
      }
      return apiClient.createLodgement(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prfs-for-lodgement'] })
      queryClient.invalidateQueries({ queryKey: ['customer-lodgements'] })
      setShowAddModal(false)
      resetForm()
      addToast({ type: 'success', title: 'Success', message: 'Lodgement created successfully' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to create lodgement' })
    },
  })

  const resetForm = () => {
    setFormData({
      prf: 0,
      amount_lodged: 0,
      lodgement_date: new Date().toISOString().split('T')[0],
      payment_method: 'bank_transfer',
    })
    setFormErrors({})
    setSelectedPRF(null)
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

  const handleCreateLodgement = (prf: PRF) => {
    const prfWithStatus = getPRFWithPaymentStatus(prf)
    setSelectedPRF(prfWithStatus)
    setFormData({
      ...formData,
      prf: prf.id,
      amount_lodged: prfWithStatus.outstanding_balance || 0,
    })
    setShowAddModal(true)
  }

  const getPaymentStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      unpaid: 'bg-red-100 text-red-800',
      partially_paid: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overpaid: 'bg-blue-100 text-blue-800',
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const getPaymentStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      unpaid: 'Unpaid',
      partially_paid: 'Partially Paid',
      paid: 'Paid',
      overpaid: 'Overpaid',
    }
    return labels[status] || status
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
            <h1 className="text-2xl font-bold text-gray-900">PRF Lodgements & Payments</h1>
            <p className="text-gray-600">Match customer payments to their PRF invoices</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => activeTab === 'prfs' ? refetchPRFs() : refetchLodgements()}>
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
                activeTab === 'prfs'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('prfs')}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              PRF Invoices
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
              placeholder={activeTab === 'prfs' ? 'Search PRFs...' : 'Search lodgements...'}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setprfPage(1)
                setLodgementPage(1)
              }}
            />
          </div>
        </div>

        {/* PRF Invoices Tab */}
        {activeTab === 'prfs' && (
          <Card>
            <CardContent className="p-0">
              {prfsLoading ? (
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
              ) : prfs.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No PRFs found</h3>
                  <p className="text-gray-500">No approved PRF invoices available for payment matching.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">PRF Invoice</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Customer</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-900">Invoice Total</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-900">Amount Paid</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-900">Outstanding</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-900">Payment Status</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-900">Created</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {prfs.map((prf: PRF) => {
                          const prfWithStatus = getPRFWithPaymentStatus(prf)
                          const canCreateLodgement = prfWithStatus.payment_status !== 'paid'

                          return (
                            <tr key={prf.id} className="hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">{prf.prf_number}</div>
                                    <div className="text-sm text-gray-500">{prf.title}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-gray-900">{prf.customer_name || 'N/A'}</span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className="font-bold text-gray-900">{formatCurrency(Number(prf.estimated_total || 0))}</span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className="font-medium text-green-600">{formatCurrency(prfWithStatus.total_lodged || 0)}</span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className={`font-medium ${prfWithStatus.outstanding_balance! > 0 ? 'text-red-600' : prfWithStatus.outstanding_balance! < 0 ? 'text-blue-600' : 'text-gray-600'}`}>
                                  {formatCurrency(prfWithStatus.outstanding_balance || 0)}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusBadge(prfWithStatus.payment_status!)}`}>
                                  {prfWithStatus.payment_status === 'paid' ? <CheckCircle className="w-3 h-3" /> :
                                   prfWithStatus.payment_status === 'unpaid' ? <XCircle className="w-3 h-3" /> :
                                   <AlertCircle className="w-3 h-3" />}
                                  {getPaymentStatusLabel(prfWithStatus.payment_status!)}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="text-sm text-gray-600">{formatDate(prf.created_at)}</span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => { setSelectedPRF(prfWithStatus); setShowViewModal(true) }}
                                    className="p-1 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded"
                                    title="View Details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  {canCreateLodgement && (
                                    <Button
                                      size="sm"
                                      className="mofad-btn-primary"
                                      onClick={() => handleCreateLodgement(prf)}
                                      title="Create Lodgement"
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      Pay
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
                  {prfTotalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                      <div className="text-sm text-gray-600">
                        Showing {((prfPage - 1) * pageSize) + 1} to {Math.min(prfPage * pageSize, prfTotalCount)} of {prfTotalCount} PRFs
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setprfPage(p => Math.max(1, p - 1))}
                          disabled={prfPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">
                          Page {prfPage} of {prfTotalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setprfPage(p => Math.min(prfTotalPages, p + 1))}
                          disabled={prfPage === prfTotalPages}
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
                  <p className="text-gray-500">No customer lodgements have been recorded yet.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Lodgement</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">PRF Number</th>
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
                                  <div className="text-sm text-gray-500">
                                    {lodgement.entity_name || lodgement.customer_name || lodgement.lodged_by_name || 'Unknown'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-900">{lodgement.prf_number || 'N/A'}</span>
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
                  {lodgementTotalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                      <div className="text-sm text-gray-600">
                        Showing {((lodgementPage - 1) * pageSize) + 1} to {Math.min(lodgementPage * pageSize, lodgementTotalCount)} of {lodgementTotalCount} lodgements
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLodgementPage(p => Math.max(1, p - 1))}
                          disabled={lodgementPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">
                          Page {lodgementPage} of {lodgementTotalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLodgementPage(p => Math.min(lodgementTotalPages, p + 1))}
                          disabled={lodgementPage === lodgementTotalPages}
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
        {showAddModal && selectedPRF && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h2 className="text-lg font-semibold">Create Payment Lodgement</h2>
                  <p className="text-sm text-gray-600">PRF: {selectedPRF.prf_number}</p>
                </div>
                <button onClick={() => { setShowAddModal(false); resetForm() }}>
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* PRF Summary */}
              <div className="p-4 bg-gray-50 border-b">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Invoice Total</p>
                    <p className="font-bold text-lg">{formatCurrency(Number(selectedPRF.estimated_total || 0))}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Already Paid</p>
                    <p className="font-medium text-green-600">{formatCurrency(selectedPRF.total_lodged || 0)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-600">Outstanding Balance</p>
                    <p className={`font-bold text-xl ${(selectedPRF.outstanding_balance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(selectedPRF.outstanding_balance || 0)}
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
                  <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); resetForm() }}>
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

        {/* View PRF Details Modal */}
        {showViewModal && selectedPRF && activeTab === 'prfs' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">PRF Payment Details</h2>
                <button onClick={() => { setShowViewModal(false); setSelectedPRF(null) }}>
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{selectedPRF.prf_number}</h3>
                    <p className="text-gray-600">{selectedPRF.title}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusBadge(selectedPRF.payment_status!)}`}>
                    {getPaymentStatusLabel(selectedPRF.payment_status!)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600">Invoice Total</p>
                    <p className="font-bold text-xl text-gray-900">{formatCurrency(Number(selectedPRF.estimated_total || 0))}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Paid</p>
                    <p className="font-bold text-xl text-green-600">{formatCurrency(selectedPRF.total_lodged || 0)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Outstanding Balance</p>
                    <p className={`font-bold text-2xl ${(selectedPRF.outstanding_balance || 0) > 0 ? 'text-red-600' : (selectedPRF.outstanding_balance || 0) < 0 ? 'text-blue-600' : 'text-green-600'}`}>
                      {formatCurrency(selectedPRF.outstanding_balance || 0)}
                      {(selectedPRF.outstanding_balance || 0) < 0 && <span className="text-sm font-normal"> (Overpaid)</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-medium">{selectedPRF.customer_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-medium">{formatDateTime(selectedPRF.created_at)}</p>
                  </div>
                </div>

                {selectedPRF.description && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-1">Description</p>
                    <p className="text-gray-900">{selectedPRF.description}</p>
                  </div>
                )}

                {/* Payment History */}
                {selectedPRF.lodgements && selectedPRF.lodgements.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-3">Payment History</h4>
                    <div className="space-y-2">
                      {selectedPRF.lodgements.map((lodgement: LodgementSummary) => (
                        <div key={lodgement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{lodgement.lodgement_number}</p>
                            <p className="text-xs text-gray-600">{formatDate(lodgement.lodgement_date)} • {getPaymentMethodLabel(lodgement.payment_method)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">{formatCurrency(lodgement.amount_lodged)}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${lodgement.approval_status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {lodgement.approval_status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  {selectedPRF.payment_status !== 'paid' && (
                    <Button
                      className="mofad-btn-primary"
                      onClick={() => {
                        setShowViewModal(false)
                        handleCreateLodgement(selectedPRF)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Payment
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => { setShowViewModal(false); setSelectedPRF(null) }}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Lodgement Details Modal */}
        {showViewModal && selectedLodgement && activeTab === 'lodgements' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Lodgement Details</h2>
                <button onClick={() => { setShowViewModal(false); setSelectedLodgement(null) }}>
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <ArrowDownLeft className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{selectedLodgement.lodgement_number}</h3>
                    <p className="text-gray-600">PRF: {selectedLodgement.prf_number || 'N/A'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedLodgement.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                    selectedLodgement.approval_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedLodgement.approval_status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div>
                    <p className="text-sm text-gray-600">Amount Lodged</p>
                    <p className="font-bold text-green-600 text-lg">{formatCurrency(selectedLodgement.amount_lodged)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Expected Amount</p>
                    <p className="font-medium">{formatCurrency(selectedLodgement.expected_amount)}</p>
                  </div>
                  {selectedLodgement.variance !== 0 && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Variance</p>
                      <p className={`font-medium ${selectedLodgement.variance < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                        {formatCurrency(selectedLodgement.variance)}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-medium">{getPaymentMethodLabel(selectedLodgement.payment_method)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium">{formatDate(selectedLodgement.lodgement_date)}</p>
                  </div>
                  {selectedLodgement.bank_name && (
                    <div>
                      <p className="text-sm text-gray-600">Bank</p>
                      <p className="font-medium">{selectedLodgement.bank_name}</p>
                    </div>
                  )}
                  {selectedLodgement.deposit_slip_number && (
                    <div>
                      <p className="text-sm text-gray-600">Deposit Slip #</p>
                      <p className="font-medium">{selectedLodgement.deposit_slip_number}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Lodged By</p>
                    <p className="font-medium">{selectedLodgement.lodged_by_name || 'Unknown'}</p>
                  </div>
                  {selectedLodgement.approved_by_name && (
                    <div>
                      <p className="text-sm text-gray-600">Approved By</p>
                      <p className="font-medium">{selectedLodgement.approved_by_name}</p>
                    </div>
                  )}
                </div>

                {selectedLodgement.description && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="font-medium">{selectedLodgement.description}</p>
                  </div>
                )}

                {selectedLodgement.rejection_reason && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">Rejection Reason</p>
                    <p className="font-medium text-red-600">{selectedLodgement.rejection_reason}</p>
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <Button variant="outline" onClick={() => { setShowViewModal(false); setSelectedLodgement(null) }}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default LodgementsPage
