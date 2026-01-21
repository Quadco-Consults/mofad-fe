'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import {
  Search,
  Plus,
  Receipt,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
  Trash2,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Building,
  CreditCard,
  Tag,
  ThumbsUp,
  ThumbsDown,
  Download
} from 'lucide-react'

interface Expense {
  id: number
  expense_number: string
  expense_type?: number
  expense_type_name?: string
  description?: string
  amount: number
  expense_date?: string
  payment_method?: string
  vendor_name?: string
  vendor_contact?: string
  invoice_number?: string
  account?: number
  account_name?: string
  status: 'pending' | 'approved' | 'paid' | 'rejected'
  created_by?: number
  created_by_name?: string
  approved_by?: number
  approved_by_name?: string
  approved_at?: string
  paid_at?: string
  notes?: string
  created_at: string
  updated_at?: string
}

interface ExpenseType {
  id: number
  name: string
  category?: string
  is_active: boolean
}

interface Account {
  id: number
  name: string
  account_number?: string
  account_type?: string
}

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'card', label: 'Card Payment' },
  { value: 'petty_cash', label: 'Petty Cash' },
]

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-800', icon: Clock },
  { value: 'approved', label: 'Approved', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  { value: 'paid', label: 'Paid', color: 'bg-emerald-100 text-emerald-800', icon: DollarSign },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
]

const getStatusConfig = (status: string) => {
  const config = STATUS_OPTIONS.find(s => s.value === status)
  return config || STATUS_OPTIONS[0]
}

export default function ExpensesPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  // State
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [expenseTypeFilter, setExpenseTypeFilter] = useState('')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('')
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'mark_paid' | null>(null)
  const pageSize = 20

  // Form state
  const [formData, setFormData] = useState({
    expense_type: '',
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    payment_method: '',
    vendor_name: '',
    vendor_contact: '',
    invoice_number: '',
    account: '',
    notes: '',
  })
  const [rejectReason, setRejectReason] = useState('')

  // Fetch expenses
  const { data: expensesData, isLoading, refetch } = useQuery({
    queryKey: ['expenses', { search, status: statusFilter, expense_type: expenseTypeFilter, payment_method: paymentMethodFilter, page }],
    queryFn: () => apiClient.getExpenses({
      search: search || undefined,
      status: statusFilter || undefined,
      expense_type: expenseTypeFilter || undefined,
      payment_method: paymentMethodFilter || undefined,
      page,
      page_size: pageSize,
    }),
  })

  // Fetch expense types for filter and form
  const { data: expenseTypesData } = useQuery({
    queryKey: ['expense-types'],
    queryFn: () => apiClient.getExpenseTypes(),
  })

  // Fetch accounts for form
  const { data: accountsData } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => apiClient.get('/accounts/'),
  })

  const expenses = expensesData?.results || expensesData || []
  const totalCount = expensesData?.count || expenses.length
  const totalPages = Math.ceil(totalCount / pageSize)
  const expenseTypes: ExpenseType[] = expenseTypesData?.results || expenseTypesData || []
  const accounts: Account[] = accountsData?.results || accountsData || []

  // Calculate stats
  const stats = useMemo(() => {
    const allExpenses = expenses as Expense[]
    return {
      total: totalCount,
      pending: allExpenses.filter(e => e.status === 'pending').length,
      approved: allExpenses.filter(e => e.status === 'approved').length,
      paid: allExpenses.filter(e => e.status === 'paid').length,
      rejected: allExpenses.filter(e => e.status === 'rejected').length,
      totalAmount: allExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0),
      paidAmount: allExpenses.filter(e => e.status === 'paid').reduce((sum, e) => sum + Number(e.amount || 0), 0),
    }
  }, [expenses, totalCount])

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      setShowCreateModal(false)
      resetForm()
      addToast({ type: 'success', title: 'Success', message: 'Expense created successfully' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to create expense' })
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiClient.updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      setShowEditModal(false)
      setSelectedExpense(null)
      resetForm()
      addToast({ type: 'success', title: 'Success', message: 'Expense updated successfully' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to update expense' })
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      setShowDeleteModal(false)
      setSelectedExpense(null)
      addToast({ type: 'success', title: 'Success', message: 'Expense deleted successfully' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to delete expense' })
    },
  })

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => apiClient.bulkDeleteExpenses(ids),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      setSelectedIds([])
      addToast({
        type: 'success',
        title: 'Success',
        message: `${data?.deleted_count || selectedIds.length} expense(s) deleted successfully`
      })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to delete expenses' })
    },
  })

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (id: number) => apiClient.approveExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      setShowActionModal(false)
      setSelectedExpense(null)
      addToast({ type: 'success', title: 'Approved', message: 'Expense approved successfully' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to approve expense' })
    },
  })

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => apiClient.rejectExpense(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      setShowActionModal(false)
      setSelectedExpense(null)
      setRejectReason('')
      addToast({ type: 'success', title: 'Rejected', message: 'Expense rejected' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to reject expense' })
    },
  })

  // Mark paid mutation
  const markPaidMutation = useMutation({
    mutationFn: (id: number) => apiClient.markExpensePaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      setShowActionModal(false)
      setSelectedExpense(null)
      addToast({ type: 'success', title: 'Paid', message: 'Expense marked as paid' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to mark expense as paid' })
    },
  })

  const resetForm = () => {
    setFormData({
      expense_type: '',
      description: '',
      amount: '',
      expense_date: new Date().toISOString().split('T')[0],
      payment_method: '',
      vendor_name: '',
      vendor_contact: '',
      invoice_number: '',
      account: '',
      notes: '',
    })
  }

  const handleCreate = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      addToast({ type: 'error', title: 'Validation Error', message: 'Amount is required and must be greater than 0' })
      return
    }

    createMutation.mutate({
      expense_type: formData.expense_type ? parseInt(formData.expense_type) : undefined,
      description: formData.description || undefined,
      amount: parseFloat(formData.amount),
      expense_date: formData.expense_date || undefined,
      payment_method: formData.payment_method || undefined,
      vendor_name: formData.vendor_name || undefined,
      vendor_contact: formData.vendor_contact || undefined,
      invoice_number: formData.invoice_number || undefined,
      account: formData.account ? parseInt(formData.account) : undefined,
      notes: formData.notes || undefined,
    })
  }

  const handleUpdate = () => {
    if (!selectedExpense) return

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      addToast({ type: 'error', title: 'Validation Error', message: 'Amount is required and must be greater than 0' })
      return
    }

    updateMutation.mutate({
      id: selectedExpense.id,
      data: {
        expense_type: formData.expense_type ? parseInt(formData.expense_type) : undefined,
        description: formData.description || undefined,
        amount: parseFloat(formData.amount),
        expense_date: formData.expense_date || undefined,
        payment_method: formData.payment_method || undefined,
        vendor_name: formData.vendor_name || undefined,
        vendor_contact: formData.vendor_contact || undefined,
        invoice_number: formData.invoice_number || undefined,
        account: formData.account ? parseInt(formData.account) : undefined,
        notes: formData.notes || undefined,
      },
    })
  }

  const handleAction = () => {
    if (!selectedExpense) return

    if (actionType === 'approve') {
      approveMutation.mutate(selectedExpense.id)
    } else if (actionType === 'reject') {
      rejectMutation.mutate({ id: selectedExpense.id, reason: rejectReason })
    } else if (actionType === 'mark_paid') {
      markPaidMutation.mutate(selectedExpense.id)
    }
  }

  const openEditModal = (expense: Expense) => {
    setSelectedExpense(expense)
    setFormData({
      expense_type: expense.expense_type?.toString() || '',
      description: expense.description || '',
      amount: expense.amount.toString(),
      expense_date: expense.expense_date || new Date().toISOString().split('T')[0],
      payment_method: expense.payment_method || '',
      vendor_name: expense.vendor_name || '',
      vendor_contact: expense.vendor_contact || '',
      invoice_number: expense.invoice_number || '',
      account: expense.account?.toString() || '',
      notes: expense.notes || '',
    })
    setShowEditModal(true)
  }

  const openActionModal = (expense: Expense, action: 'approve' | 'reject' | 'mark_paid') => {
    setSelectedExpense(expense)
    setActionType(action)
    setRejectReason('')
    setShowActionModal(true)
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === expenses.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(expenses.map((e: Expense) => e.id))
    }
  }

  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Expense Management</h1>
            <p className="text-muted-foreground mt-1">Track and manage company expenses</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button className="mofad-btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-700">Total</p>
                  <p className="text-xl font-bold text-blue-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-amber-700">Pending</p>
                  <p className="text-xl font-bold text-amber-900">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-700">Approved</p>
                  <p className="text-xl font-bold text-blue-900">{stats.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-emerald-700">Paid</p>
                  <p className="text-xl font-bold text-emerald-900">{stats.paid}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-red-700">Rejected</p>
                  <p className="text-xl font-bold text-red-900">{stats.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-purple-700">Total Amount</p>
                  <p className="text-lg font-bold text-purple-900">{formatCurrency(stats.totalAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by expense number, description, vendor..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPage(1)
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-primary/10 border-primary' : ''}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>

              {/* Bulk Delete */}
              {selectedIds.length > 0 && (
                <Button
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => bulkDeleteMutation.mutate(selectedIds)}
                  disabled={bulkDeleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete ({selectedIds.length})
                </Button>
              )}
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value)
                      setPage(1)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Statuses</option>
                    {STATUS_OPTIONS.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expense Type</label>
                  <select
                    value={expenseTypeFilter}
                    onChange={(e) => {
                      setExpenseTypeFilter(e.target.value)
                      setPage(1)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Types</option>
                    {expenseTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMethodFilter}
                    onChange={(e) => {
                      setPaymentMethodFilter(e.target.value)
                      setPage(1)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Methods</option>
                    {PAYMENT_METHODS.map(method => (
                      <option key={method.value} value={method.value}>{method.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expenses Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                Expenses ({totalCount})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-5 h-5 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                  </div>
                ))}
              </div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No expenses found</h3>
                <p className="text-gray-500 mb-4">Get started by adding your first expense</p>
                <Button className="mofad-btn-primary" onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Expense
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="py-3 px-4 text-left">
                          <input
                            type="checkbox"
                            checked={selectedIds.length === expenses.length && expenses.length > 0}
                            onChange={toggleSelectAll}
                            className="rounded border-gray-300"
                          />
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Expense #</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Description</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Type</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Vendor</th>
                        <th className="py-3 px-4 text-right text-sm font-medium text-gray-700">Amount</th>
                        <th className="py-3 px-4 text-center text-sm font-medium text-gray-700">Status</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Date</th>
                        <th className="py-3 px-4 text-center text-sm font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((expense: Expense) => {
                        const statusConfig = getStatusConfig(expense.status)
                        const StatusIcon = statusConfig.icon
                        return (
                          <tr key={expense.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(expense.id)}
                                onChange={() => toggleSelect(expense.id)}
                                className="rounded border-gray-300"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-mono text-sm font-medium text-primary">
                                {expense.expense_number}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-900">{expense.description || '-'}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-600">{expense.expense_type_name || '-'}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-600">{expense.vendor_name || '-'}</span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="font-semibold text-gray-900">{formatCurrency(expense.amount)}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {statusConfig.label}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-500">
                                {expense.expense_date ? formatDateTime(expense.expense_date).split(' ')[0] : '-'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => router.push(`/accounts/expenses/${expense.id}`)}
                                  title="View"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {expense.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => openEditModal(expense)}
                                      title="Edit"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-emerald-600"
                                      onClick={() => openActionModal(expense, 'approve')}
                                      title="Approve"
                                    >
                                      <ThumbsUp className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-600"
                                      onClick={() => openActionModal(expense, 'reject')}
                                      title="Reject"
                                    >
                                      <ThumbsDown className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-600"
                                      onClick={() => {
                                        setSelectedExpense(expense)
                                        setShowDeleteModal(true)
                                      }}
                                      title="Delete"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                                {expense.status === 'approved' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-emerald-600"
                                    onClick={() => openActionModal(expense, 'mark_paid')}
                                    title="Mark as Paid"
                                  >
                                    <DollarSign className="w-4 h-4" />
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
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-500">
                      Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} expenses
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <span className="text-sm text-gray-600">
                        Page {page} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Add New Expense</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expense Type</label>
                  <select
                    value={formData.expense_type}
                    onChange={(e) => setFormData({ ...formData, expense_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Type</option>
                    {expenseTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Expense description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expense Date</label>
                  <input
                    type="date"
                    value={formData.expense_date}
                    onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Method</option>
                    {PAYMENT_METHODS.map(method => (
                      <option key={method.value} value={method.value}>{method.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                  <input
                    type="text"
                    value={formData.vendor_name}
                    onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Vendor name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Contact</label>
                  <input
                    type="text"
                    value={formData.vendor_contact}
                    onChange={(e) => setFormData({ ...formData, vendor_contact: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Phone or email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                  <input
                    type="text"
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Invoice #"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                  <select
                    value={formData.account}
                    onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Account</option>
                    {accounts.map(account => (
                      <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <Button variant="outline" onClick={() => {
                setShowCreateModal(false)
                resetForm()
              }}>
                Cancel
              </Button>
              <Button
                className="mofad-btn-primary"
                onClick={handleCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Expense'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Edit Expense</h2>
              <p className="text-sm text-gray-500">{selectedExpense.expense_number}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expense Type</label>
                  <select
                    value={formData.expense_type}
                    onChange={(e) => setFormData({ ...formData, expense_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Type</option>
                    {expenseTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Expense description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expense Date</label>
                  <input
                    type="date"
                    value={formData.expense_date}
                    onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Method</option>
                    {PAYMENT_METHODS.map(method => (
                      <option key={method.value} value={method.value}>{method.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                  <input
                    type="text"
                    value={formData.vendor_name}
                    onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Vendor name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Contact</label>
                  <input
                    type="text"
                    value={formData.vendor_contact}
                    onChange={(e) => setFormData({ ...formData, vendor_contact: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Phone or email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                  <input
                    type="text"
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Invoice #"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                  <select
                    value={formData.account}
                    onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Account</option>
                    {accounts.map(account => (
                      <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <Button variant="outline" onClick={() => {
                setShowEditModal(false)
                setSelectedExpense(null)
                resetForm()
              }}>
                Cancel
              </Button>
              <Button
                className="mofad-btn-primary"
                onClick={handleUpdate}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Updating...' : 'Update Expense'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Delete Expense</h2>
                  <p className="text-sm text-gray-500">{selectedExpense.expense_number}</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this expense? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedExpense(null)
                }}>
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => deleteMutation.mutate(selectedExpense.id)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal (Approve/Reject/Mark Paid) */}
      {showActionModal && selectedExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  actionType === 'approve' ? 'bg-emerald-100' :
                  actionType === 'reject' ? 'bg-red-100' :
                  'bg-blue-100'
                }`}>
                  {actionType === 'approve' && <ThumbsUp className="w-6 h-6 text-emerald-600" />}
                  {actionType === 'reject' && <ThumbsDown className="w-6 h-6 text-red-600" />}
                  {actionType === 'mark_paid' && <DollarSign className="w-6 h-6 text-blue-600" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {actionType === 'approve' && 'Approve Expense'}
                    {actionType === 'reject' && 'Reject Expense'}
                    {actionType === 'mark_paid' && 'Mark as Paid'}
                  </h2>
                  <p className="text-sm text-gray-500">{selectedExpense.expense_number}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Description</p>
                    <p className="font-medium">{selectedExpense.description || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Amount</p>
                    <p className="font-bold text-lg">{formatCurrency(selectedExpense.amount)}</p>
                  </div>
                </div>
              </div>

              {actionType === 'reject' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    rows={3}
                    placeholder="Enter reason for rejection..."
                  />
                </div>
              )}

              <p className="text-gray-600 mb-6">
                {actionType === 'approve' && 'Are you sure you want to approve this expense?'}
                {actionType === 'reject' && 'Are you sure you want to reject this expense?'}
                {actionType === 'mark_paid' && 'Are you sure you want to mark this expense as paid?'}
              </p>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => {
                  setShowActionModal(false)
                  setSelectedExpense(null)
                  setActionType(null)
                  setRejectReason('')
                }}>
                  Cancel
                </Button>
                <Button
                  className={
                    actionType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' :
                    actionType === 'reject' ? 'bg-red-600 hover:bg-red-700 text-white' :
                    'mofad-btn-primary'
                  }
                  onClick={handleAction}
                  disabled={
                    approveMutation.isPending ||
                    rejectMutation.isPending ||
                    markPaidMutation.isPending
                  }
                >
                  {approveMutation.isPending || rejectMutation.isPending || markPaidMutation.isPending
                    ? 'Processing...'
                    : actionType === 'approve' ? 'Approve'
                    : actionType === 'reject' ? 'Reject'
                    : 'Mark as Paid'
                  }
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
