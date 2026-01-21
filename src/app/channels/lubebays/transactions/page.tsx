'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createPortal } from 'react-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Pagination } from '@/components/ui/Pagination'
import { BulkActionBar } from '@/components/ui/BulkActionBar'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useSelection } from '@/hooks/useSelection'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import {
  Search,
  Download,
  Plus,
  DollarSign,
  Wrench,
  Eye,
  X,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Trash2,
  Check,
  Ban,
  AlertTriangle,
  CreditCard,
  Banknote,
} from 'lucide-react'

interface LubebayServiceTransaction {
  id: number
  transaction_number: string
  lubebay: number
  lubebay_name?: string
  lubebay_code?: string
  total_amount: number | string
  payment_method: string
  bank_reference?: string
  comment?: string
  approval_status: 'pending' | 'awaiting_confirmation' | 'confirmed' | 'rejected' | 'CONFIRMED' | 'PENDING'
  confirmed_by?: number
  confirmed_by_name?: string
  confirmed_at?: string
  rejection_reason?: string
  created_by?: number
  created_by_name?: string
  created_datetime?: string
  items?: Array<{
    id: number
    service: number
    service_name?: string
    quantity: number
    unit_price: number | string
    total_price: number | string
    notes?: string
  }>
}

interface TransactionDetailModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: LubebayServiceTransaction | null
  onConfirm: (id: number) => void
  onReject: (id: number, reason: string) => void
  isConfirming: boolean
  isRejecting: boolean
}

function TransactionDetailModal({
  isOpen,
  onClose,
  transaction,
  onConfirm,
  onReject,
  isConfirming,
  isRejecting,
}: TransactionDetailModalProps) {
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  if (!isOpen || !transaction) return null

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase()
    const styles: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      awaiting_confirmation: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
    }
    return styles[normalizedStatus] || 'bg-gray-100 text-gray-800'
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <Banknote className="w-5 h-5 text-green-600" />
      case 'bank_transfer':
        return <CreditCard className="w-5 h-5 text-blue-600" />
      case 'pos':
        return <CreditCard className="w-5 h-5 text-purple-600" />
      default:
        return <DollarSign className="w-5 h-5 text-gray-600" />
    }
  }

  const handleReject = () => {
    if (rejectReason.trim()) {
      onReject(transaction.id, rejectReason)
      setShowRejectForm(false)
      setRejectReason('')
    }
  }

  const normalizedStatus = transaction.approval_status.toLowerCase()
  const canConfirmReject = normalizedStatus === 'pending' || normalizedStatus === 'awaiting_confirmation'

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Wrench className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">{transaction.transaction_number}</h2>
              <p className="text-sm text-gray-500">Service Transaction</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status and Amount */}
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(transaction.approval_status)}`}>
              {normalizedStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(Number(transaction.total_amount))}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Lubebay</p>
              <p className="font-medium">{transaction.lubebay_name || `Lubebay #${transaction.lubebay}`}</p>
              {transaction.lubebay_code && (
                <p className="text-sm text-gray-500 font-mono">{transaction.lubebay_code}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Method</p>
              <div className="flex items-center gap-2">
                {getPaymentMethodIcon(transaction.payment_method)}
                <span className="font-medium capitalize">{transaction.payment_method.replace('_', ' ')}</span>
              </div>
            </div>
            {transaction.bank_reference && (
              <div>
                <p className="text-sm text-gray-500">Bank Reference</p>
                <p className="font-medium font-mono">{transaction.bank_reference}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="font-medium">{transaction.created_datetime ? formatDateTime(transaction.created_datetime) : '-'}</p>
            </div>
          </div>

          {/* Items */}
          {transaction.items && transaction.items.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Service Items</p>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Service</th>
                      <th className="text-center py-2 px-3 text-sm font-medium text-gray-700">Qty</th>
                      <th className="text-right py-2 px-3 text-sm font-medium text-gray-700">Unit Price</th>
                      <th className="text-right py-2 px-3 text-sm font-medium text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {transaction.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3">
                          <span className="font-medium">{item.service_name || `Service #${item.service}`}</span>
                          {item.notes && <p className="text-sm text-gray-500">{item.notes}</p>}
                        </td>
                        <td className="py-2 px-3 text-center">{item.quantity}</td>
                        <td className="py-2 px-3 text-right">{formatCurrency(Number(item.unit_price))}</td>
                        <td className="py-2 px-3 text-right font-medium">{formatCurrency(Number(item.total_price))}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="py-2 px-3 text-right font-medium">Total:</td>
                      <td className="py-2 px-3 text-right font-bold text-primary">
                        {formatCurrency(Number(transaction.total_amount))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Comment */}
          {transaction.comment && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Comment</p>
              <p className="p-3 bg-gray-50 rounded-md">{transaction.comment}</p>
            </div>
          )}

          {/* Rejection Reason */}
          {transaction.rejection_reason && (
            <div className="border-l-4 border-red-400 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">Rejection Reason</p>
              <p className="text-red-700 mt-1">{transaction.rejection_reason}</p>
            </div>
          )}

          {/* Confirmation Info */}
          {transaction.confirmed_by && (
            <div className="border-t pt-4">
              <p className="text-sm text-gray-500">
                {normalizedStatus === 'rejected' ? 'Rejected' : 'Confirmed'} by{' '}
                <span className="font-medium">{transaction.confirmed_by_name || `User #${transaction.confirmed_by}`}</span>
                {transaction.confirmed_at && ` on ${formatDateTime(transaction.confirmed_at)}`}
              </p>
            </div>
          )}

          {/* Reject Form */}
          {showRejectForm && (
            <div className="border-t pt-4 space-y-3">
              <label className="block text-sm font-medium text-gray-700">Rejection Reason</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Please provide a reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectForm(false)
                    setRejectReason('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || isRejecting}
                >
                  {isRejecting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Ban className="w-4 h-4 mr-2" />}
                  Confirm Rejection
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {canConfirmReject && !showRejectForm && (
            <>
              <Button
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
                onClick={() => setShowRejectForm(true)}
              >
                <Ban className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                className="mofad-btn-primary"
                onClick={() => onConfirm(transaction.id)}
                disabled={isConfirming}
              >
                {isConfirming ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                Confirm
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

interface CreateTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  isLoading: boolean
}

function CreateTransactionModal({ isOpen, onClose, onSubmit, isLoading }: CreateTransactionModalProps) {
  const [formData, setFormData] = useState({
    lubebay: '',
    payment_method: 'cash',
    bank_reference: '',
    comment: '',
    items: [{ service: '', quantity: 1, unit_price: '' }],
  })

  const { data: lubebaysList } = useQuery({
    queryKey: ['lubebays-list'],
    queryFn: () => apiClient.getLubebays(),
  })

  const { data: servicesList } = useQuery({
    queryKey: ['services-list'],
    queryFn: () => apiClient.getServices(),
  })

  const lubebays = Array.isArray(lubebaysList) ? lubebaysList : lubebaysList?.results || []
  const services = Array.isArray(servicesList) ? servicesList : servicesList?.results || []

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { service: '', quantity: 1, unit_price: '' }],
    }))
  }

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }))
    }
  }

  const updateItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }))
  }

  const handleServiceSelect = (index: number, serviceId: string) => {
    const selectedService = services.find((s: any) => s.id === parseInt(serviceId))
    updateItem(index, 'service', serviceId)
    if (selectedService) {
      updateItem(index, 'unit_price', selectedService.price || selectedService.unit_price || '')
    }
  }

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => {
      return sum + (parseFloat(item.unit_price) || 0) * (item.quantity || 0)
    }, 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      lubebay: parseInt(formData.lubebay),
      payment_method: formData.payment_method,
      bank_reference: formData.bank_reference || undefined,
      comment: formData.comment || undefined,
      items: formData.items
        .filter(item => item.service && item.quantity > 0)
        .map(item => ({
          service: parseInt(item.service),
          quantity: item.quantity,
          unit_price: parseFloat(item.unit_price),
        })),
    })
  }

  const resetForm = () => {
    setFormData({
      lubebay: '',
      payment_method: 'cash',
      bank_reference: '',
      comment: '',
      items: [{ service: '', quantity: 1, unit_price: '' }],
    })
  }

  if (!isOpen) return null

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Create Service Transaction</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Lubebay *</label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={formData.lubebay}
              onChange={(e) => setFormData(prev => ({ ...prev, lubebay: e.target.value }))}
            >
              <option value="">Select Lubebay</option>
              {lubebays.map((lubebay: any) => (
                <option key={lubebay.id} value={lubebay.id}>
                  {lubebay.name} ({lubebay.code})
                </option>
              ))}
            </select>
          </div>

          {/* Service Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Service Items *</label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </div>
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-2 items-start p-3 border rounded-md">
                  <div className="flex-1">
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      value={item.service}
                      onChange={(e) => handleServiceSelect(index, e.target.value)}
                    >
                      <option value="">Select Service</option>
                      {services.map((service: any) => (
                        <option key={service.id} value={service.id}>
                          {service.name} - {formatCurrency(service.price || service.unit_price || 0)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="Qty"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="w-28">
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="Price"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                    />
                  </div>
                  {formData.items.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 bg-gray-50 rounded-md flex justify-between">
              <span className="font-medium">Total:</span>
              <span className="font-bold text-primary">{formatCurrency(calculateTotal())}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Payment Method *</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={formData.payment_method}
              onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
            >
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="pos">POS</option>
              <option value="mobile">Mobile Payment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Bank Reference</label>
            <input
              type="text"
              placeholder="Optional reference number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={formData.bank_reference}
              onChange={(e) => setFormData(prev => ({ ...prev, bank_reference: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Comment</label>
            <textarea
              rows={2}
              placeholder="Add notes about this transaction..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm()
                onClose()
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 mofad-btn-primary" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Create Transaction
            </Button>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default function LubebayServiceTransactionsPage() {
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [lubebayFilter, setLubebayFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<LubebayServiceTransaction | null>(null)

  // Selection hook for bulk operations
  const selection = useSelection<LubebayServiceTransaction>()

  // Fetch transactions with pagination
  const { data: transactionsData, isLoading, error, refetch } = useQuery({
    queryKey: ['lst-transactions', searchTerm, statusFilter, lubebayFilter, currentPage, pageSize],
    queryFn: () => apiClient.getLsts({
      search: searchTerm || undefined,
      approval_status: statusFilter !== 'all' ? statusFilter : undefined,
      lubebay: lubebayFilter !== 'all' ? parseInt(lubebayFilter) : undefined,
      page: currentPage,
      page_size: pageSize,
    }),
  })

  // Fetch lubebays for filter dropdown
  const { data: lubebaysList } = useQuery({
    queryKey: ['lubebays-for-filter'],
    queryFn: () => apiClient.getLubebays(),
  })

  // Fetch stats
  const { data: statsData } = useQuery({
    queryKey: ['lst-stats'],
    queryFn: () => apiClient.getLstStats(),
  })

  // Create transaction mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.createLst(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lst-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['lst-stats'] })
      setShowCreateModal(false)
      addToast({ type: 'success', title: 'Success', message: 'Transaction created successfully' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to create transaction' })
    },
  })

  // Confirm transaction mutation
  const confirmMutation = useMutation({
    mutationFn: (id: number) => apiClient.confirmLst(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lst-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['lst-stats'] })
      setShowDetailModal(false)
      setSelectedTransaction(null)
      addToast({ type: 'success', title: 'Success', message: 'Transaction confirmed successfully' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to confirm transaction' })
    },
  })

  // Reject transaction mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => apiClient.rejectLst(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lst-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['lst-stats'] })
      setShowDetailModal(false)
      setSelectedTransaction(null)
      addToast({ type: 'success', title: 'Success', message: 'Transaction rejected' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to reject transaction' })
    },
  })

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: (number | string)[]) => apiClient.bulkDeleteLsts(ids),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['lst-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['lst-stats'] })
      setShowBulkDeleteModal(false)
      selection.clearSelection()
      addToast({
        type: 'success',
        title: 'Success',
        message: `Successfully deleted ${response.deleted_count || selection.selectedCount} transactions`,
      })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to delete transactions' })
    },
  })

  // Helper to extract results from API response
  const extractResults = (data: any): LubebayServiceTransaction[] => {
    if (!data) return []
    if (Array.isArray(data)) return data
    if (data.results && Array.isArray(data.results)) return data.results
    if (data.data?.results) return data.data.results
    return []
  }

  // Extract total count for pagination
  const getTotalCount = (data: any): number => {
    if (!data) return 0
    if (Array.isArray(data)) return data.length
    if (data.paginator?.count !== undefined) return data.paginator.count
    if (data.count !== undefined) return data.count
    if (data.results && Array.isArray(data.results)) return data.results.length
    return 0
  }

  // Extract total pages
  const getTotalPages = (data: any): number => {
    if (!data) return 0
    if (data.paginator?.total_pages !== undefined) return data.paginator.total_pages
    return Math.ceil(getTotalCount(data) / pageSize)
  }

  const transactions = extractResults(transactionsData)
  const totalCount = getTotalCount(transactionsData)
  const totalPages = getTotalPages(transactionsData)
  const lubebays = Array.isArray(lubebaysList) ? lubebaysList : lubebaysList?.results || []

  // Stats from API
  const stats = statsData || {
    total: 0,
    pending: 0,
    awaiting_confirmation: 0,
    confirmed: 0,
    rejected: 0,
    total_value: 0,
  }

  // Reset page when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handleLubebayChange = (value: string) => {
    setLubebayFilter(value)
    setCurrentPage(1)
  }

  const handleViewTransaction = (transaction: LubebayServiceTransaction) => {
    setSelectedTransaction(transaction)
    setShowDetailModal(true)
  }

  const handleConfirm = (id: number) => {
    confirmMutation.mutate(id)
  }

  const handleReject = (id: number, reason: string) => {
    rejectMutation.mutate({ id, reason })
  }

  const handleBulkDelete = () => {
    setShowBulkDeleteModal(true)
  }

  const confirmBulkDelete = () => {
    bulkDeleteMutation.mutate(selection.selectedIds)
  }

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase()
    const styles: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      awaiting_confirmation: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
    }
    return styles[normalizedStatus] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status.toLowerCase()
    switch (normalizedStatus) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'awaiting_confirmation':
        return <AlertTriangle className="w-4 h-4 text-blue-600" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  const normalizeStatus = (status: string) => {
    return status.toLowerCase().replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Lubebay Service Transactions</h1>
            <p className="text-muted-foreground">Manage service sales transactions at lubebays</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button className="mofad-btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Transaction
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                  <p className="text-2xl font-bold text-primary">{stats.total}</p>
                </div>
                <Wrench className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Awaiting Confirm</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.awaiting_confirmation}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-blue-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Confirmed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(stats.total_value)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <select
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={lubebayFilter}
                  onChange={(e) => handleLubebayChange(e.target.value)}
                >
                  <option value="all">All Lubebays</option>
                  {lubebays.map((lubebay: any) => (
                    <option key={lubebay.id} value={lubebay.id}>
                      {lubebay.name}
                    </option>
                  ))}
                </select>

                <select
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={statusFilter}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="awaiting_confirmation">Awaiting Confirmation</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-medium text-red-800">Error loading transactions</p>
                  <p className="text-sm text-red-600">{(error as any).message || 'An unexpected error occurred'}</p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transactions Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 py-3">
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4 mt-2"></div>
                      </div>
                      <div className="w-24 h-4 bg-gray-200 rounded"></div>
                      <div className="w-20 h-4 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-12 text-center">
                <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== 'all' || lubebayFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'No service transactions have been recorded yet'}
                </p>
                <Button className="mofad-btn-primary" onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Transaction
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="w-12 py-3 px-4">
                        <Checkbox
                          checked={selection.isAllSelected(transactions)}
                          indeterminate={selection.isPartiallySelected(transactions)}
                          onChange={() => selection.toggleAll(transactions)}
                        />
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Transaction #</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Lubebay</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Amount</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Payment</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className={`hover:bg-gray-50 ${selection.isSelected(transaction.id) ? 'bg-primary-50' : ''}`}
                      >
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selection.isSelected(transaction.id)}
                            onChange={() => selection.toggle(transaction.id)}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-primary">{transaction.transaction_number}</div>
                          {transaction.bank_reference && (
                            <div className="text-sm text-gray-500 font-mono">{transaction.bank_reference}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Wrench className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {transaction.lubebay_name || `Lubebay #${transaction.lubebay}`}
                              </div>
                              {transaction.lubebay_code && (
                                <div className="text-sm text-gray-500 font-mono">{transaction.lubebay_code}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-bold text-primary">
                            {formatCurrency(Number(transaction.total_amount))}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                            {transaction.payment_method.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                              transaction.approval_status
                            )}`}
                          >
                            {getStatusIcon(transaction.approval_status)}
                            {normalizeStatus(transaction.approval_status)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-900">
                            {transaction.created_datetime
                              ? formatDateTime(transaction.created_datetime).split(',')[0]
                              : '-'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {transaction.created_datetime
                              ? formatDateTime(transaction.created_datetime).split(',')[1]?.trim()
                              : ''}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex gap-1 justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              title="View Details"
                              onClick={() => handleViewTransaction(transaction)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {(transaction.approval_status.toLowerCase() === 'pending' ||
                              transaction.approval_status.toLowerCase() === 'rejected') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Delete"
                                onClick={() => {
                                  selection.toggle(transaction.id)
                                  setTimeout(() => setShowBulkDeleteModal(true), 100)
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalCount > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                className="border-t"
              />
            )}
          </CardContent>
        </Card>

        {/* Create Transaction Modal */}
        <CreateTransactionModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
        />

        {/* Transaction Detail Modal */}
        <TransactionDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedTransaction(null)
          }}
          transaction={selectedTransaction}
          onConfirm={handleConfirm}
          onReject={handleReject}
          isConfirming={confirmMutation.isPending}
          isRejecting={rejectMutation.isPending}
        />

        {/* Bulk Delete Confirmation Modal */}
        <ConfirmDialog
          open={showBulkDeleteModal}
          onClose={() => setShowBulkDeleteModal(false)}
          onConfirm={confirmBulkDelete}
          title="Delete Transactions"
          message={`Are you sure you want to delete ${selection.selectedCount} transaction${
            selection.selectedCount > 1 ? 's' : ''
          }? Only pending and rejected transactions can be deleted. This action cannot be undone.`}
          confirmText={`Delete ${selection.selectedCount} Transaction${selection.selectedCount > 1 ? 's' : ''}`}
          variant="danger"
          isLoading={bulkDeleteMutation.isPending}
        />

        {/* Bulk Action Bar */}
        <BulkActionBar
          selectedCount={selection.selectedCount}
          onClearSelection={selection.clearSelection}
          onBulkDelete={handleBulkDelete}
          isDeleting={bulkDeleteMutation.isPending}
          entityName="transaction"
        />
      </div>
    </AppLayout>
  )
}
