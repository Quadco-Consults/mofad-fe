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
  Receipt,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  DollarSign,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { AppLayout } from '@/components/layout/AppLayout'
import { useToast } from '@/components/ui/Toast'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'

interface Lubebay {
  id: number
  name: string
  code: string
  address?: string
  phone?: string
}

interface LubebayExpenseType {
  id: number
  name: string
}

interface LubebayExpense {
  id: number
  expense_number: string
  lubebay: number
  lubebay_name?: string
  name: string
  expense_type?: number
  expense_type_name?: string
  amount: number
  expense_date: string
  approval_status: string
  current_approval?: string
  final_approval?: string
  approved_by_name?: string
  approved_at?: string
  rejection_reason?: string
  notes?: string
  created_at: string
  created_by_name?: string
}

interface ExpenseFormData {
  lubebay: number
  name: string
  expense_type?: number
  amount: number
  expense_date: string
  notes?: string
}

function LubebayExpensesPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  // State
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [lubebayFilter, setLubebayFilter] = useState<string>('all')

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<LubebayExpense | null>(null)

  // Form state
  const [formData, setFormData] = useState<ExpenseFormData>({
    lubebay: 0,
    name: '',
    amount: 0,
    expense_date: new Date().toISOString().split('T')[0],
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Fetch lubebays for dropdown
  const { data: lubebaysData } = useQuery({
    queryKey: ['lubebays-list'],
    queryFn: () => apiClient.get('/lubebays/', { page: 1, page_size: 100 }),
  })

  // Fetch expense types
  const { data: expenseTypesData } = useQuery({
    queryKey: ['lubebay-expense-types'],
    queryFn: () => apiClient.get('/lubebay-expense-types/', { page: 1, page_size: 100 }),
  })

  // Fetch expenses
  const { data: expensesData, isLoading, refetch } = useQuery({
    queryKey: ['lubebay-expenses', page, pageSize, searchTerm, statusFilter, lubebayFilter],
    queryFn: async () => {
      const params: Record<string, any> = {
        page,
        page_size: pageSize,
      }
      if (searchTerm) params.search = searchTerm
      if (statusFilter !== 'all') params.approval_status = statusFilter
      if (lubebayFilter !== 'all') params.lubebay = lubebayFilter

      return apiClient.get('/lubebay-expenses/', params)
    },
  })

  const extractResults = (data: any) => {
    if (!data) return []
    if (Array.isArray(data)) return data
    if (data.results && Array.isArray(data.results)) return data.results
    return []
  }

  const lubebays = extractResults(lubebaysData)
  const expenseTypes = extractResults(expenseTypesData)
  const expenses = extractResults(expensesData)
  const totalCount = expensesData?.count || expenses.length
  const totalPages = Math.ceil(totalCount / pageSize) || 1

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: ExpenseFormData) => apiClient.post('/lubebay-expenses/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lubebay-expenses'] })
      setShowCreateModal(false)
      resetForm()
      addToast({ type: 'success', title: 'Success', message: 'Expense created successfully' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to create expense' })
    },
  })

  const resetForm = () => {
    setFormData({
      lubebay: 0,
      name: '',
      amount: 0,
      expense_date: new Date().toISOString().split('T')[0],
    })
    setFormErrors({})
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.lubebay) {
      errors.lubebay = 'Lubebay is required'
    }
    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Description is required'
    }
    if (!formData.amount || formData.amount <= 0) {
      errors.amount = 'Amount must be greater than 0'
    }
    if (!formData.expense_date) {
      errors.expense_date = 'Date is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    createMutation.mutate(formData)
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      awaiting_review: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pending',
      awaiting_review: 'Awaiting Review',
      approved: 'Approved',
      rejected: 'Rejected',
      PENDING: 'Pending',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
    }
    return labels[status] || status
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lubebay Expenses</h1>
            <p className="text-gray-600">Track and manage expenses from all lubebays</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button className="mofad-btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Expense
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(1)
              }}
            />
          </div>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            value={lubebayFilter}
            onChange={(e) => {
              setLubebayFilter(e.target.value)
              setPage(1)
            }}
          >
            <option value="all">All Lubebays</option>
            {lubebays.map((lubebay: Lubebay) => (
              <option key={lubebay.id} value={lubebay.id}>
                {lubebay.name}
              </option>
            ))}
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="awaiting_review">Awaiting Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Expenses List */}
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
                    </div>
                  ))}
                </div>
              </div>
            ) : expenses.length === 0 ? (
              <div className="p-12 text-center">
                <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
                <p className="text-gray-500 mb-4">No lubebay expenses have been recorded yet.</p>
                <Button className="mofad-btn-primary" onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Expense
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Expense</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Lubebay</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900">Amount</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Date</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {expenses.map((expense: LubebayExpense) => (
                        <tr key={expense.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                <Receipt className="w-4 h-4 text-red-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{expense.expense_number}</div>
                                <div className="text-sm text-gray-500">{expense.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-900">{expense.lubebay_name || 'N/A'}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-700">{expense.expense_type_name || 'General'}</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-bold text-red-600">{formatCurrency(expense.amount)}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-sm text-gray-600">{formatDate(expense.expense_date)}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(expense.approval_status)}`}>
                              {expense.approval_status === 'approved' || expense.approval_status === 'APPROVED' ? <CheckCircle className="w-3 h-3" /> :
                               expense.approval_status === 'rejected' || expense.approval_status === 'REJECTED' ? <XCircle className="w-3 h-3" /> :
                               <AlertCircle className="w-3 h-3" />}
                              {getStatusLabel(expense.approval_status)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => { setSelectedExpense(expense); setShowViewModal(true) }}
                                className="p-1 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded"
                                title="View Details"
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
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <div className="text-sm text-gray-600">
                      Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} expenses
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm">
                        Page {page} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
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

        {/* Create Expense Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h2 className="text-lg font-semibold">Create Lubebay Expense</h2>
                  <p className="text-sm text-gray-600">Record a new expense for a lubebay</p>
                </div>
                <button onClick={() => { setShowCreateModal(false); resetForm() }}>
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lubebay *</label>
                  <select
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors.lubebay ? 'border-red-500' : 'border-gray-300'}`}
                    value={formData.lubebay}
                    onChange={(e) => setFormData({ ...formData, lubebay: parseInt(e.target.value) })}
                  >
                    <option value={0}>Select Lubebay</option>
                    {lubebays.map((lubebay: Lubebay) => (
                      <option key={lubebay.id} value={lubebay.id}>
                        {lubebay.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.lubebay && <p className="text-red-500 text-xs mt-1">{formErrors.lubebay}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Equipment repair, Utility bill"
                  />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expense Type</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    value={formData.expense_type || ''}
                    onChange={(e) => setFormData({ ...formData, expense_type: e.target.value ? parseInt(e.target.value) : undefined })}
                  >
                    <option value="">Select Type</option>
                    {expenseTypes.map((type: LubebayExpenseType) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors.amount ? 'border-red-500' : 'border-gray-300'}`}
                      value={formData.amount || ''}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    />
                    {formErrors.amount && <p className="text-red-500 text-xs mt-1">{formErrors.amount}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${formErrors.expense_date ? 'border-red-500' : 'border-gray-300'}`}
                      value={formData.expense_date}
                      onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                    />
                    {formErrors.expense_date && <p className="text-red-500 text-xs mt-1">{formErrors.expense_date}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes or details..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => { setShowCreateModal(false); resetForm() }}>
                    Cancel
                  </Button>
                  <Button type="submit" className="mofad-btn-primary" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Creating...' : 'Create Expense'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Expense Modal */}
        {showViewModal && selectedExpense && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h2 className="text-lg font-semibold">{selectedExpense.expense_number}</h2>
                  <p className="text-sm text-gray-600">{selectedExpense.name}</p>
                </div>
                <button onClick={() => { setShowViewModal(false); setSelectedExpense(null) }}>
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Lubebay</p>
                    <p className="font-medium">{selectedExpense.lubebay_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="font-bold text-red-600 text-lg">{formatCurrency(selectedExpense.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Expense Type</p>
                    <p className="font-medium">{selectedExpense.expense_type_name || 'General'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium">{formatDate(selectedExpense.expense_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedExpense.approval_status)}`}>
                      {getStatusLabel(selectedExpense.approval_status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created By</p>
                    <p className="font-medium">{selectedExpense.created_by_name || 'Unknown'}</p>
                  </div>
                </div>

                {selectedExpense.notes && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Notes</p>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedExpense.notes}</p>
                  </div>
                )}

                {selectedExpense.rejection_reason && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Rejection Reason</p>
                    <p className="text-sm bg-red-50 text-red-700 p-3 rounded-lg">{selectedExpense.rejection_reason}</p>
                  </div>
                )}

                {selectedExpense.approved_by_name && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-600">Approved By</p>
                      <p className="font-medium">{selectedExpense.approved_by_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Approved At</p>
                      <p className="font-medium">{selectedExpense.approved_at ? formatDateTime(selectedExpense.approved_at) : 'N/A'}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 p-4 border-t">
                <Button variant="outline" onClick={() => { setShowViewModal(false); setSelectedExpense(null) }}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default LubebayExpensesPage
