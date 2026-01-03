'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  DollarSign,
  Building,
  X,
  ArrowDownLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { AppLayout } from '@/components/layout/AppLayout'
import { useToast } from '@/components/ui/Toast'
import apiClient from '@/lib/apiClient'
import { Payment } from '@/types/api'
import { formatCurrency, formatDate } from '@/lib/utils'

type LodgementFormData = {
  payment_type: 'incoming'
  amount: number
  payment_date: string
  payment_method: 'cash' | 'bank_transfer' | 'cheque' | 'card' | 'mobile_money' | 'other'
  reference_type: 'customer_payment' | 'other'
  reference_number?: string
  supplier_name?: string
  bank_account?: string
  cheque_number?: string
  transaction_reference?: string
  description: string
  notes?: string
}

function LodgementsPage() {
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all')

  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [selectedLodgement, setSelectedLodgement] = useState<Payment | null>(null)
  const [verificationNotes, setVerificationNotes] = useState('')

  const [formData, setFormData] = useState<LodgementFormData>({
    payment_type: 'incoming',
    amount: 0,
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'bank_transfer',
    reference_type: 'customer_payment',
    description: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Fetch incoming payments (lodgements)
  const { data: lodgementsData, isLoading, error } = useQuery({
    queryKey: ['lodgements', searchTerm, statusFilter, paymentMethodFilter],
    queryFn: async () => {
      const params: Record<string, string> = {
        payment_type: 'incoming',
      }
      if (statusFilter !== 'all') params.status = statusFilter
      if (paymentMethodFilter !== 'all') params.payment_method = paymentMethodFilter
      if (searchTerm) params.search = searchTerm
      return apiClient.get<Payment[]>('/payments/', params)
    },
  })

  const lodgements = Array.isArray(lodgementsData) ? lodgementsData : []

  // Create lodgement mutation
  const createMutation = useMutation({
    mutationFn: (data: LodgementFormData) => apiClient.post<Payment>('/payments/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lodgements'] })
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      setShowAddModal(false)
      resetForm()
      addToast({ type: 'success', title: 'Success', message: 'Lodgement recorded successfully' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to record lodgement' })
    },
  })

  // Update lodgement mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: LodgementFormData }) =>
      apiClient.put<Payment>(`/payments/${id}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lodgements'] })
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      setShowEditModal(false)
      setSelectedLodgement(null)
      resetForm()
      addToast({ type: 'success', title: 'Success', message: 'Lodgement updated successfully' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to update lodgement' })
    },
  })

  // Delete lodgement mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/payments/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lodgements'] })
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      setShowDeleteModal(false)
      setSelectedLodgement(null)
      addToast({ type: 'success', title: 'Success', message: 'Lodgement deleted successfully' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to delete lodgement' })
    },
  })

  // Verify (clear) lodgement mutation
  const verifyMutation = useMutation({
    mutationFn: (id: number) => apiClient.post<Payment>(`/payments/${id}/clear/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lodgements'] })
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      setShowVerifyModal(false)
      setSelectedLodgement(null)
      setVerificationNotes('')
      addToast({ type: 'success', title: 'Verified', message: 'Lodgement has been verified' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to verify lodgement' })
    },
  })

  // Reject (bounce) lodgement mutation
  const rejectMutation = useMutation({
    mutationFn: (id: number) => apiClient.post<Payment>(`/payments/${id}/bounce/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lodgements'] })
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      setShowVerifyModal(false)
      setSelectedLodgement(null)
      setVerificationNotes('')
      addToast({ type: 'warning', title: 'Rejected', message: 'Lodgement has been rejected' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to reject lodgement' })
    },
  })

  const resetForm = () => {
    setFormData({
      payment_type: 'incoming',
      amount: 0,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'bank_transfer',
      reference_type: 'customer_payment',
      description: '',
    })
    setFormErrors({})
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.amount || formData.amount <= 0) {
      errors.amount = 'Amount must be greater than 0'
    }
    if (!formData.payment_date) {
      errors.payment_date = 'Date is required'
    }
    if (!formData.description.trim()) {
      errors.description = 'Description is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    if (showEditModal && selectedLodgement) {
      updateMutation.mutate({ id: selectedLodgement.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (lodgement: Payment) => {
    setSelectedLodgement(lodgement)
    setFormData({
      payment_type: 'incoming',
      amount: lodgement.amount,
      payment_date: lodgement.payment_date,
      payment_method: lodgement.payment_method,
      reference_type: lodgement.reference_type as any,
      reference_number: lodgement.reference_number,
      supplier_name: lodgement.supplier_name,
      bank_account: lodgement.bank_account,
      cheque_number: lodgement.cheque_number,
      transaction_reference: lodgement.transaction_reference,
      description: lodgement.description,
      notes: lodgement.notes,
    })
    setShowEditModal(true)
  }

  const handleView = (lodgement: Payment) => {
    setSelectedLodgement(lodgement)
    setShowViewModal(true)
  }

  const handleDelete = (lodgement: Payment) => {
    setSelectedLodgement(lodgement)
    setShowDeleteModal(true)
  }

  const handleVerify = (lodgement: Payment) => {
    setSelectedLodgement(lodgement)
    setShowVerifyModal(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'cleared':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'bounced':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      cleared: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      bounced: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      cleared: 'Verified',
      pending: 'Pending',
      bounced: 'Rejected',
      cancelled: 'Cancelled',
    }
    return labels[status] || status
  }

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'Cash',
      bank_transfer: 'Bank Transfer',
      cheque: 'Cheque',
      card: 'Card',
      mobile_money: 'Mobile Money',
      other: 'Other',
    }
    return labels[method] || method
  }

  // Calculate summary stats
  const totalLodgements = lodgements.length
  const verifiedLodgements = lodgements.filter(l => l.status === 'cleared').length
  const pendingLodgements = lodgements.filter(l => l.status === 'pending').length
  const totalVerifiedAmount = lodgements
    .filter(l => l.status === 'cleared')
    .reduce((sum, l) => sum + Number(l.amount), 0)

  if (error) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="bg-red-50 text-red-800 p-4 rounded-lg">
            Error loading lodgements: {(error as any).message || 'Unknown error'}
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
            <h1 className="text-2xl font-bold text-gray-900">Account Lodgements</h1>
            <p className="text-gray-600">Monitor and verify all cash deposits and bank lodgements</p>
          </div>
          <Button className="mofad-btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Record Lodgement
          </Button>
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
                <Building className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-green-600">{verifiedLodgements}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Verification</p>
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
                <p className="text-sm text-gray-600">Total Verified</p>
                <p className="text-2xl font-bold text-primary-600">{formatCurrency(totalVerifiedAmount)}</p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="cleared">Verified</option>
            <option value="bounced">Rejected</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={paymentMethodFilter}
            onChange={(e) => setPaymentMethodFilter(e.target.value)}
          >
            <option value="all">All Methods</option>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cheque">Cheque</option>
            <option value="card">Card</option>
            <option value="mobile_money">Mobile Money</option>
          </select>

          <Button variant="outline">Generate Report</Button>
        </div>

        {/* Lodgements Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
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
            ) : lodgements.length === 0 ? (
              <div className="p-12 text-center">
                <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No lodgements found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== 'all' || paymentMethodFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first lodgement'}
                </p>
                <Button className="mofad-btn-primary" onClick={() => setShowAddModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Lodgement
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Payment</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Method</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Depositor</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Reference</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Date</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {lodgements.map((lodgement) => (
                      <tr key={lodgement.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <ArrowDownLeft className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{lodgement.payment_number}</div>
                              <div className="text-sm text-gray-500">ID: {lodgement.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-gray-900 max-w-[200px] truncate" title={lodgement.description}>
                            {lodgement.description}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-bold text-green-600 text-lg">
                            {formatCurrency(lodgement.amount)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-700">
                            {getPaymentMethodLabel(lodgement.payment_method)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            {lodgement.supplier_name && (
                              <div className="text-sm font-medium text-gray-900">{lodgement.supplier_name}</div>
                            )}
                            {lodgement.bank_account && (
                              <div className="text-sm text-gray-500">{lodgement.bank_account}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            {lodgement.reference_number && (
                              <div className="text-sm text-gray-900">{lodgement.reference_number}</div>
                            )}
                            {lodgement.transaction_reference && (
                              <div className="text-sm text-gray-500 truncate max-w-[120px]" title={lodgement.transaction_reference}>
                                {lodgement.transaction_reference}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {formatDate(lodgement.payment_date)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(lodgement.status)}`}>
                              {getStatusIcon(lodgement.status)}
                              <span className="ml-1">{getStatusLabel(lodgement.status)}</span>
                            </span>
                          </div>
                          {lodgement.status === 'cleared' && lodgement.cleared_at && (
                            <div className="text-xs text-green-600 mt-1">
                              Verified {formatDate(lodgement.cleared_at)}
                            </div>
                          )}
                          {lodgement.status === 'bounced' && (
                            <div className="text-xs text-red-600 mt-1">
                              Payment bounced
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="View Details"
                              onClick={() => handleView(lodgement)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {lodgement.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  title="Verify Payment"
                                  onClick={() => handleVerify(lodgement)}
                                >
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  title="Edit Lodgement"
                                  onClick={() => handleEdit(lodgement)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Delete Lodgement"
                              onClick={() => handleDelete(lodgement)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>


        {/* Add/Edit Lodgement Modal */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">
                  {showEditModal ? 'Edit Lodgement' : 'Record New Lodgement'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setShowEditModal(false)
                    resetForm()
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Depositor Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      value={formData.supplier_name || ''}
                      onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                      placeholder="e.g., Customer Name or Company"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                        formErrors.amount ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    />
                    {formErrors.amount && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.amount}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                        formErrors.payment_date ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.payment_date}
                      onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                    />
                    {formErrors.payment_date && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.payment_date}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Method *
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      value={formData.payment_method}
                      onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as any })}
                    >
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                      <option value="card">Card</option>
                      <option value="mobile_money">Mobile Money</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reference Number
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      value={formData.reference_number || ''}
                      onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                      placeholder="e.g., Invoice or Slip Number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Account
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      value={formData.bank_account || ''}
                      onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
                      placeholder="e.g., Operations Account"
                    />
                  </div>
                </div>

                {formData.payment_method === 'cheque' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cheque Number
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      value={formData.cheque_number || ''}
                      onChange={(e) => setFormData({ ...formData, cheque_number: e.target.value })}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction Reference
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    value={formData.transaction_reference || ''}
                    onChange={(e) => setFormData({ ...formData, transaction_reference: e.target.value })}
                    placeholder="e.g., Bank transfer reference"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                      formErrors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g., Payment for Invoice INV-001234"
                  />
                  {formErrors.description && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    rows={2}
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddModal(false)
                      setShowEditModal(false)
                      resetForm()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="mofad-btn-primary"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? 'Saving...'
                      : showEditModal
                      ? 'Update Lodgement'
                      : 'Record Lodgement'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Lodgement Modal */}
        {showViewModal && selectedLodgement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Lodgement Details</h3>
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setSelectedLodgement(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Header Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Lodgement ID</label>
                    <p className="text-sm font-mono text-gray-900">{selectedLodgement.payment_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Status</label>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedLodgement.status)}`}
                    >
                      {getStatusIcon(selectedLodgement.status)}
                      <span className="ml-1">{getStatusLabel(selectedLodgement.status)}</span>
                    </span>
                  </div>
                </div>

                {/* Amount */}
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center">
                    <ArrowDownLeft className="h-6 w-6 mr-2 text-green-600" />
                    <span className="text-2xl font-bold text-green-800">
                      {formatCurrency(selectedLodgement.amount)}
                    </span>
                  </div>
                  <p className="text-center text-sm text-green-700 mt-1">Lodgement Amount</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-500">Description</label>
                  <p className="text-sm text-gray-900">{selectedLodgement.description}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Payment Method</label>
                    <p className="text-sm text-gray-900">{getPaymentMethodLabel(selectedLodgement.payment_method)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Date</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedLodgement.payment_date)}</p>
                  </div>
                </div>

                {selectedLodgement.supplier_name && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Depositor</label>
                    <p className="text-sm text-gray-900">{selectedLodgement.supplier_name}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  {selectedLodgement.reference_number && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Reference Number</label>
                      <p className="text-sm text-gray-900">{selectedLodgement.reference_number}</p>
                    </div>
                  )}
                  {selectedLodgement.bank_account && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Bank Account</label>
                      <p className="text-sm text-gray-900">{selectedLodgement.bank_account}</p>
                    </div>
                  )}
                </div>

                {selectedLodgement.transaction_reference && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Transaction Reference</label>
                    <p className="text-sm text-gray-900">{selectedLodgement.transaction_reference}</p>
                  </div>
                )}

                {selectedLodgement.cheque_number && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Cheque Number</label>
                    <p className="text-sm text-gray-900">{selectedLodgement.cheque_number}</p>
                  </div>
                )}

                {selectedLodgement.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Notes</label>
                    <p className="text-sm text-gray-900">{selectedLodgement.notes}</p>
                  </div>
                )}

                {/* Timestamps */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Created At</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedLodgement.created_at)}</p>
                  </div>
                  {selectedLodgement.cleared_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Verified At</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedLodgement.cleared_at)}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => setShowViewModal(false)}>
                  Close
                </Button>
                {selectedLodgement.status === 'pending' && (
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      setShowViewModal(false)
                      handleVerify(selectedLodgement)
                    }}
                  >
                    Verify Lodgement
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Verify Lodgement Modal */}
        {showVerifyModal && selectedLodgement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Verify Lodgement</h3>
                <button
                  onClick={() => {
                    setShowVerifyModal(false)
                    setSelectedLodgement(null)
                    setVerificationNotes('')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Lodgement ID</div>
                  <div className="font-medium">{selectedLodgement.payment_number}</div>
                  <div className="text-sm text-gray-600 mt-2">Amount</div>
                  <div className="font-bold text-lg text-green-700">{formatCurrency(selectedLodgement.amount)}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Notes (Optional)
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Add any verification notes..."
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowVerifyModal(false)
                    setSelectedLodgement(null)
                    setVerificationNotes('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={() => rejectMutation.mutate(selectedLodgement.id)}
                  disabled={rejectMutation.isPending}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                </Button>
                <Button
                  onClick={() => verifyMutation.mutate(selectedLodgement.id)}
                  disabled={verifyMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {verifyMutation.isPending ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedLodgement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">Delete Lodgement</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete lodgement{' '}
                <span className="font-medium">{selectedLodgement.payment_number}</span>? This action
                cannot be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setSelectedLodgement(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => deleteMutation.mutate(selectedLodgement.id)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default LodgementsPage
