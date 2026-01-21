'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  Building,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AppLayout } from '@/components/layout/AppLayout'
import { useToast } from '@/components/ui/Toast'
import apiClient from '@/lib/apiClient'
import { Payment } from '@/types/api'
import { formatCurrency, formatDate } from '@/lib/utils'

type PaymentFormData = {
  payment_type: 'incoming' | 'outgoing'
  amount: number
  payment_date: string
  payment_method: 'cash' | 'bank_transfer' | 'cheque' | 'card' | 'mobile_money' | 'other'
  reference_type: 'customer_payment' | 'supplier_payment' | 'expense_payment' | 'loan_payment' | 'other'
  reference_number?: string
  customer?: number
  supplier_name?: string
  bank_account?: string
  cheque_number?: string
  transaction_reference?: string
  description: string
  notes?: string
}

function AccountTransactionsPage() {
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all')

  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [formData, setFormData] = useState<PaymentFormData>({
    payment_type: 'incoming',
    amount: 0,
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'bank_transfer',
    reference_type: 'customer_payment',
    description: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Fetch payments
  const { data: paymentsData, isLoading, error } = useQuery({
    queryKey: ['payments', searchTerm, typeFilter, statusFilter, paymentMethodFilter],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (typeFilter !== 'all') params.payment_type = typeFilter
      if (statusFilter !== 'all') params.status = statusFilter
      if (paymentMethodFilter !== 'all') params.payment_method = paymentMethodFilter
      if (searchTerm) params.search = searchTerm
      return apiClient.get<Payment[]>('/payments/', params)
    },
  })

  const payments = Array.isArray(paymentsData) ? paymentsData : []

  // Create payment mutation
  const createMutation = useMutation({
    mutationFn: (data: PaymentFormData) => apiClient.post<Payment>('/payments/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      setShowAddModal(false)
      resetForm()
      addToast({ type: 'success', title: 'Success', message: 'Payment created successfully' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to create payment' })
    },
  })

  // Update payment mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PaymentFormData }) =>
      apiClient.put<Payment>(`/payments/${id}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      setShowEditModal(false)
      setSelectedPayment(null)
      resetForm()
      addToast({ type: 'success', title: 'Success', message: 'Payment updated successfully' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to update payment' })
    },
  })

  // Delete payment mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/payments/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      setShowDeleteModal(false)
      setSelectedPayment(null)
      addToast({ type: 'success', title: 'Success', message: 'Payment deleted successfully' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to delete payment' })
    },
  })

  // Clear payment mutation
  const clearMutation = useMutation({
    mutationFn: (id: number) => apiClient.post<Payment>(`/payments/${id}/clear/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      addToast({ type: 'success', title: 'Cleared', message: 'Payment has been cleared' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to clear payment' })
    },
  })

  // Bounce payment mutation
  const bounceMutation = useMutation({
    mutationFn: (id: number) => apiClient.post<Payment>(`/payments/${id}/bounce/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      addToast({ type: 'warning', title: 'Bounced', message: 'Payment marked as bounced' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to mark payment as bounced' })
    },
  })

  // Cancel payment mutation
  const cancelMutation = useMutation({
    mutationFn: (id: number) => apiClient.post<Payment>(`/payments/${id}/cancel/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      addToast({ type: 'info', title: 'Cancelled', message: 'Payment has been cancelled' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to cancel payment' })
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
      errors.payment_date = 'Payment date is required'
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

    if (showEditModal && selectedPayment) {
      updateMutation.mutate({ id: selectedPayment.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (payment: Payment) => {
    setSelectedPayment(payment)
    setFormData({
      payment_type: payment.payment_type,
      amount: payment.amount,
      payment_date: payment.payment_date,
      payment_method: payment.payment_method,
      reference_type: payment.reference_type,
      reference_number: payment.reference_number,
      customer: payment.customer,
      supplier_name: payment.supplier_name,
      bank_account: payment.bank_account,
      cheque_number: payment.cheque_number,
      transaction_reference: payment.transaction_reference,
      description: payment.description,
      notes: payment.notes,
    })
    setShowEditModal(true)
  }

  const handleView = (payment: Payment) => {
    setSelectedPayment(payment)
    setShowViewModal(true)
  }

  const handleDelete = (payment: Payment) => {
    setSelectedPayment(payment)
    setShowDeleteModal(true)
  }

  const getTypeBadge = (type: string) => {
    return type === 'incoming'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800'
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      cleared: 'bg-green-100 text-green-800',
      bounced: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const getAmountColor = (type: string) => {
    return type === 'incoming' ? 'text-green-600' : 'text-red-600'
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

  const getReferenceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      customer_payment: 'Customer Payment',
      supplier_payment: 'Supplier Payment',
      expense_payment: 'Expense Payment',
      loan_payment: 'Loan Payment',
      other: 'Other',
    }
    return labels[type] || type
  }

  // Calculate summary stats
  const totalPayments = payments.length
  const clearedPayments = payments.filter(p => p.status === 'cleared').length
  const totalIncoming = payments
    .filter(p => p.payment_type === 'incoming' && p.status === 'cleared')
    .reduce((sum, p) => sum + Number(p.amount), 0)
  const totalOutgoing = payments
    .filter(p => p.payment_type === 'outgoing' && p.status === 'cleared')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  if (error) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="bg-red-50 text-red-800 p-4 rounded-lg">
            Error loading payments: {(error as any).message || 'Unknown error'}
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
            <h1 className="text-2xl font-bold text-gray-900">Account Transactions</h1>
            <p className="text-gray-600">Monitor all payments and transactions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button className="mofad-btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Payment
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900">{totalPayments}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cleared</p>
                <p className="text-2xl font-bold text-green-600">{clearedPayments}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Incoming</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncoming)}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ArrowDownLeft className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Outgoing</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalOutgoing)}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <ArrowUpRight className="h-5 w-5 text-red-600" />
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
              placeholder="Search payments..."
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
            <option value="all">All Types</option>
            <option value="incoming">Incoming</option>
            <option value="outgoing">Outgoing</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="cleared">Cleared</option>
            <option value="bounced">Bounced</option>
            <option value="cancelled">Cancelled</option>
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

          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>

        {/* Payments Table */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-primary-600">{payment.payment_number}</div>
                        <div className="text-sm text-gray-900">{payment.description}</div>
                        <div className="text-xs text-gray-500">
                          {getPaymentMethodLabel(payment.payment_method)} | {getReferenceTypeLabel(payment.reference_type)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(payment.payment_type)}`}>
                            {payment.payment_type === 'incoming' ? (
                              <ArrowDownLeft className="h-3 w-3 mr-1" />
                            ) : (
                              <ArrowUpRight className="h-3 w-3 mr-1" />
                            )}
                            {payment.payment_type === 'incoming' ? 'Incoming' : 'Outgoing'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-bold ${getAmountColor(payment.payment_type)}`}>
                          {payment.payment_type === 'incoming' ? '+' : '-'}
                          {formatCurrency(payment.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(payment.payment_date)}</div>
                        <div className="text-xs text-gray-500">{formatDate(payment.created_at)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusBadge(payment.status || 'unknown')}`}>
                          {(payment.status || 'Unknown').charAt(0).toUpperCase() + (payment.status || 'unknown').slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleView(payment)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {payment.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => clearMutation.mutate(payment.id)}
                                title="Clear Payment"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => bounceMutation.mutate(payment.id)}
                                title="Mark as Bounced"
                              >
                                <AlertCircle className="h-4 w-4 text-orange-600" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(payment)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {payment.status !== 'cleared' && payment.status !== 'cancelled' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => cancelMutation.mutate(payment.id)}
                              title="Cancel Payment"
                            >
                              <XCircle className="h-4 w-4 text-gray-600" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(payment)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!isLoading && payments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No payments found matching your criteria.</p>
          </div>
        )}

        {/* Add/Edit Payment Modal */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">
                  {showEditModal ? 'Edit Payment' : 'New Payment'}
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
                      Payment Type *
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      value={formData.payment_type}
                      onChange={(e) => setFormData({ ...formData, payment_type: e.target.value as any })}
                    >
                      <option value="incoming">Incoming</option>
                      <option value="outgoing">Outgoing</option>
                    </select>
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
                      Payment Date *
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
                      Reference Type *
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      value={formData.reference_type}
                      onChange={(e) => setFormData({ ...formData, reference_type: e.target.value as any })}
                    >
                      <option value="customer_payment">Customer Payment</option>
                      <option value="supplier_payment">Supplier Payment</option>
                      <option value="expense_payment">Expense Payment</option>
                      <option value="loan_payment">Loan Payment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reference Number
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      value={formData.reference_number || ''}
                      onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                      placeholder="e.g., INV-001234"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.payment_type === 'incoming' ? 'Customer/Payer Name' : 'Supplier Name'}
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      value={formData.supplier_name || ''}
                      onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
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
                    placeholder="e.g., TRF123456789"
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
                      ? 'Update Payment'
                      : 'Create Payment'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Payment Modal */}
        {showViewModal && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Payment Details</h3>
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setSelectedPayment(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Payment Number</label>
                    <p className="text-sm font-mono text-gray-900">{selectedPayment.payment_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Reference</label>
                    <p className="text-sm font-mono text-gray-900">
                      {selectedPayment.reference_number || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Amount */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeBadge(selectedPayment.payment_type)}`}
                      >
                        {selectedPayment.payment_type === 'incoming' ? (
                          <ArrowDownLeft className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                        )}
                        {selectedPayment.payment_type === 'incoming' ? 'Incoming Payment' : 'Outgoing Payment'}
                      </span>
                    </div>
                    <div className={`text-2xl font-bold ${getAmountColor(selectedPayment.payment_type)}`}>
                      {selectedPayment.payment_type === 'incoming' ? '+' : '-'}
                      {formatCurrency(selectedPayment.amount)}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-500">Description</label>
                  <p className="text-sm text-gray-900">{selectedPayment.description}</p>
                </div>

                {/* Payment Details */}
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Payment Method</label>
                    <p className="text-sm text-gray-900">{getPaymentMethodLabel(selectedPayment.payment_method)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Reference Type</label>
                    <p className="text-sm text-gray-900">{getReferenceTypeLabel(selectedPayment.reference_type)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusBadge(selectedPayment.status || 'unknown')}`}>
                      {(selectedPayment.status || 'Unknown').charAt(0).toUpperCase() + (selectedPayment.status || 'unknown').slice(1)}
                    </span>
                  </div>
                </div>

                {/* Parties */}
                <div className="grid grid-cols-2 gap-6">
                  {selectedPayment.customer_name && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Customer</label>
                      <p className="text-sm text-gray-900">{selectedPayment.customer_name}</p>
                    </div>
                  )}
                  {selectedPayment.supplier_name && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Supplier/Payer</label>
                      <p className="text-sm text-gray-900">{selectedPayment.supplier_name}</p>
                    </div>
                  )}
                </div>

                {/* Bank Details */}
                {(selectedPayment.bank_account || selectedPayment.cheque_number || selectedPayment.transaction_reference) && (
                  <div className="grid grid-cols-3 gap-6">
                    {selectedPayment.bank_account && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Bank Account</label>
                        <p className="text-sm text-gray-900">{selectedPayment.bank_account}</p>
                      </div>
                    )}
                    {selectedPayment.cheque_number && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Cheque Number</label>
                        <p className="text-sm text-gray-900">{selectedPayment.cheque_number}</p>
                      </div>
                    )}
                    {selectedPayment.transaction_reference && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Transaction Reference</label>
                        <p className="text-sm text-gray-900">{selectedPayment.transaction_reference}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Payment Date</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedPayment.payment_date)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Created At</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedPayment.created_at)}</p>
                  </div>
                  {selectedPayment.cleared_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Cleared At</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedPayment.cleared_at)}</p>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {selectedPayment.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Notes</label>
                    <p className="text-sm text-gray-900">{selectedPayment.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => setShowViewModal(false)}>
                  Close
                </Button>
                {selectedPayment.status === 'pending' && (
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      clearMutation.mutate(selectedPayment.id)
                      setShowViewModal(false)
                    }}
                  >
                    Clear Payment
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">Delete Payment</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete payment{' '}
                <span className="font-medium">{selectedPayment.payment_number}</span>? This action
                cannot be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setSelectedPayment(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => deleteMutation.mutate(selectedPayment.id)}
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

export default AccountTransactionsPage
