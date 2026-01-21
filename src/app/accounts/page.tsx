'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Pagination } from '@/components/ui/Pagination'
import { BulkActionBar } from '@/components/ui/BulkActionBar'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useSelection } from '@/hooks/useSelection'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import { Expense, ExpenseType, Account } from '@/types/api'
import {
  Plus,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
  Save,
  Calendar,
  Receipt,
  CreditCard,
  Wallet,
  Loader2,
  RefreshCw,
  Check,
  Ban,
  Banknote,
} from 'lucide-react'

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="w-4 h-4 text-yellow-500" />
    case 'approved':
      return <CheckCircle className="w-4 h-4 text-blue-500" />
    case 'paid':
      return <CheckCircle className="w-4 h-4 text-green-500" />
    case 'rejected':
      return <XCircle className="w-4 h-4 text-red-500" />
    default:
      return <Clock className="w-4 h-4 text-gray-500" />
  }
}

const getStatusBadge = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  }

  const labels: Record<string, string> = {
    pending: 'Pending',
    approved: 'Approved',
    paid: 'Paid',
    rejected: 'Rejected',
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.pending}`}>
      {labels[status] || status}
    </span>
  )
}

const getPaymentMethodIcon = (method: string) => {
  switch (method) {
    case 'cash':
      return <Banknote className="w-4 h-4 text-green-500" />
    case 'bank_transfer':
      return <CreditCard className="w-4 h-4 text-blue-500" />
    case 'cheque':
      return <Receipt className="w-4 h-4 text-purple-500" />
    case 'card':
      return <CreditCard className="w-4 h-4 text-orange-500" />
    case 'petty_cash':
      return <Wallet className="w-4 h-4 text-yellow-500" />
    default:
      return <DollarSign className="w-4 h-4 text-gray-500" />
  }
}

const getPaymentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    cash: 'Cash',
    bank_transfer: 'Bank Transfer',
    cheque: 'Cheque',
    card: 'Card Payment',
    petty_cash: 'Petty Cash',
  }
  return labels[method] || method
}

interface ExpenseFormData {
  expense_type: number
  description: string
  amount: number
  expense_date: string
  payment_method: 'cash' | 'bank_transfer' | 'cheque' | 'card' | 'petty_cash'
  vendor_name: string
  vendor_contact: string
  invoice_number: string
  account: number
  notes: string
}

const initialFormData: ExpenseFormData = {
  expense_type: 0,
  description: '',
  amount: 0,
  expense_date: new Date().toISOString().split('T')[0],
  payment_method: 'cash',
  vendor_name: '',
  vendor_contact: '',
  invoice_number: '',
  account: 0,
  notes: '',
}

export default function ExpensesPage() {
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | 'mark_paid'>('approve')
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [formData, setFormData] = useState<ExpenseFormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)

  // Selection hook
  const selection = useSelection<Expense>()

  // Bulk delete modal state
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)

  // Fetch expenses
  const { data: expensesData, isLoading, error, refetch } = useQuery({
    queryKey: ['expenses', currentPage, pageSize, searchTerm, statusFilter, paymentMethodFilter],
    queryFn: () => apiClient.getExpenses({
      page: currentPage,
      page_size: pageSize,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      payment_method: paymentMethodFilter !== 'all' ? paymentMethodFilter : undefined,
      search: searchTerm || undefined,
    }),
  })

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: (number | string)[]) => apiClient.bulkDeleteExpenses(ids),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      setShowBulkDeleteModal(false)
      selection.clearSelection()
      addToast({
        type: 'success',
        title: 'Bulk Delete Complete',
        message: `Successfully deleted ${response.deleted_count || selection.selectedIds.length} expense(s)`,
      })
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: error.message || 'Failed to delete expenses',
      })
    },
  })

  // Fetch expense types
  const { data: expenseTypesData } = useQuery({
    queryKey: ['expense-types'],
    queryFn: () => apiClient.get<ExpenseType[]>('/expense-types/'),
  })

  // Fetch accounts for dropdown
  const { data: accountsData } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => apiClient.get<Account[]>('/accounts/', { account_type: 'expense' }),
  })

  // Helper to extract array from API response (handles paginated and direct array responses)
  const extractResults = (data: any) => {
    if (!data) return []
    if (Array.isArray(data)) return data
    if (data.results && Array.isArray(data.results)) return data.results
    return []
  }

  // Get pagination info
  const totalCount = expensesData?.paginator?.count ?? (expensesData as any)?.count ?? 0
  const totalPages = expensesData?.paginator?.total_pages ?? Math.ceil(totalCount / pageSize)

  const expenses = extractResults(expensesData)
  const expenseTypes = extractResults(expenseTypesData)
  const accounts = extractResults(accountsData)

  // Create expense mutation
  const createMutation = useMutation({
    mutationFn: (data: ExpenseFormData) => apiClient.createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      setShowAddModal(false)
      resetForm()
      addToast({ type: 'success', title: 'Success', message: 'Expense created successfully' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to create expense' })
      if (error.errors) setFormErrors(error.errors)
    },
  })

  // Update expense mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ExpenseFormData> }) =>
      apiClient.updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      setShowEditModal(false)
      resetForm()
      addToast({ type: 'success', title: 'Success', message: 'Expense updated successfully' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to update expense' })
      if (error.errors) setFormErrors(error.errors)
    },
  })

  // Delete expense mutation
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

  // Approve expense mutation
  const approveMutation = useMutation({
    mutationFn: (id: number) => apiClient.approveExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      setShowApprovalModal(false)
      setSelectedExpense(null)
      addToast({ type: 'success', title: 'Approved', message: 'Expense has been approved' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to approve expense' })
    },
  })

  // Reject expense mutation
  const rejectMutation = useMutation({
    mutationFn: (id: number) => apiClient.rejectExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      setShowApprovalModal(false)
      setSelectedExpense(null)
      addToast({ type: 'info', title: 'Rejected', message: 'Expense has been rejected' })
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
      setShowApprovalModal(false)
      setSelectedExpense(null)
      addToast({ type: 'success', title: 'Paid', message: 'Expense marked as paid' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to mark expense as paid' })
    },
  })

  // Helper functions
  const resetForm = () => {
    setFormData(initialFormData)
    setFormErrors({})
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!formData.expense_type) errors.expense_type = 'Expense type is required'
    if (!formData.description.trim()) errors.description = 'Description is required'
    if (formData.amount <= 0) errors.amount = 'Amount must be greater than 0'
    if (!formData.expense_date) errors.expense_date = 'Date is required'
    if (!formData.account) errors.account = 'Account is required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAdd = () => {
    resetForm()
    setShowAddModal(true)
  }

  const handleView = (expense: Expense) => {
    setSelectedExpense(expense)
    setShowViewModal(true)
  }

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense)
    setFormData({
      expense_type: expense.expense_type,
      description: expense.description,
      amount: expense.amount,
      expense_date: expense.expense_date,
      payment_method: expense.payment_method,
      vendor_name: expense.vendor_name || '',
      vendor_contact: expense.vendor_contact || '',
      invoice_number: expense.invoice_number || '',
      account: expense.account,
      notes: expense.notes || '',
    })
    setFormErrors({})
    setShowEditModal(true)
  }

  const handleDelete = (expense: Expense) => {
    setSelectedExpense(expense)
    setShowDeleteModal(true)
  }

  const handleApproval = (expense: Expense, action: 'approve' | 'reject' | 'mark_paid') => {
    setSelectedExpense(expense)
    setApprovalAction(action)
    setShowApprovalModal(true)
  }

  const handleSaveNew = () => {
    if (!validateForm()) return
    createMutation.mutate(formData)
  }

  const handleSaveEdit = () => {
    if (!validateForm() || !selectedExpense) return
    updateMutation.mutate({ id: selectedExpense.id, data: formData })
  }

  const confirmDelete = () => {
    if (selectedExpense) {
      deleteMutation.mutate(selectedExpense.id)
    }
  }

  const confirmApproval = () => {
    if (!selectedExpense) return
    if (approvalAction === 'approve') {
      approveMutation.mutate(selectedExpense.id)
    } else if (approvalAction === 'reject') {
      rejectMutation.mutate(selectedExpense.id)
    } else if (approvalAction === 'mark_paid') {
      markPaidMutation.mutate(selectedExpense.id)
    }
  }

  // Stats calculation
  const totalExpenses = expenses.length
  const pendingExpenses = expenses.filter((e: Expense) => e.status === 'pending').length
  const approvedExpenses = expenses.filter((e: Expense) => e.status === 'approved').length
  const totalAmount = expenses.filter((e: Expense) => e.status !== 'rejected').reduce((sum: number, e: Expense) => sum + e.amount, 0)

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
            <p className="text-muted-foreground">Manage company expenses and approvals</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="mofad-btn-primary" onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              New Expense
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <p className="text-2xl font-bold text-primary">{totalExpenses}</p>
                </div>
                <Receipt className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Approval</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingExpenses}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-blue-600">{approvedExpenses}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold text-secondary">{formatCurrency(totalAmount)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-secondary/60" />
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
                    placeholder="Search expenses..."
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <select
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="paid">Paid</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                >
                  <option value="all">All Payment Methods</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                  <option value="card">Card</option>
                  <option value="petty_cash">Petty Cash</option>
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
                  <p className="font-medium text-red-800">Error loading expenses</p>
                  <p className="text-sm text-red-600">{(error as any).message || 'An unexpected error occurred'}</p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Expenses List */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Records</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-muted rounded-md"></div>
                  </div>
                ))}
              </div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== 'all' || paymentMethodFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by recording your first expense'}
                </p>
                <Button className="mofad-btn-primary" onClick={handleAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Expense
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="w-12 py-3 px-4">
                        <Checkbox
                          checked={selection.isAllSelected(expenses)}
                          indeterminate={selection.isPartiallySelected(expenses)}
                          onChange={() => selection.toggleAll(expenses)}
                        />
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Expense #</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Description</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Vendor</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Payment</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense: Expense) => (
                      <tr key={expense.id} className={`border-b border-border hover:bg-muted/50 ${selection.isSelected(expense.id) ? 'bg-blue-50' : ''}`}>
                        <td className="py-3 px-4">
                          <Checkbox
                            checked={selection.isSelected(expense.id)}
                            onChange={() => selection.toggle(expense.id)}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {getStatusIcon(expense.status)}
                            <span className="ml-2 font-medium font-mono">{expense.expense_number}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{expense.description}</p>
                            <p className="text-sm text-muted-foreground">{expense.expense_type_name}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm">{expense.vendor_name || '-'}</p>
                          {expense.invoice_number && (
                            <p className="text-xs text-muted-foreground">Inv: {expense.invoice_number}</p>
                          )}
                        </td>
                        <td className="py-3 px-4 font-bold text-primary">{formatCurrency(expense.amount)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getPaymentMethodIcon(expense.payment_method)}
                            <span className="text-sm">{getPaymentMethodLabel(expense.payment_method)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(expense.status)}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {formatDateTime(expense.expense_date)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleView(expense)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            {expense.status === 'pending' && (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(expense)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApproval(expense, 'approve')}
                                  title="Approve"
                                >
                                  <Check className="w-4 h-4 text-green-500" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApproval(expense, 'reject')}
                                  title="Reject"
                                >
                                  <Ban className="w-4 h-4 text-red-500" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(expense)}>
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </>
                            )}
                            {expense.status === 'approved' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApproval(expense, 'mark_paid')}
                                title="Mark as Paid"
                              >
                                <Banknote className="w-4 h-4 text-green-500" />
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
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={(page) => {
              setCurrentPage(page)
              selection.clearSelection()
            }}
          />
        )}

        {/* Bulk Action Bar */}
        <BulkActionBar
          selectedCount={selection.selectedCount}
          onClearSelection={selection.clearSelection}
          onBulkDelete={() => setShowBulkDeleteModal(true)}
          isDeleting={bulkDeleteMutation.isPending}
          entityName="expenses"
        />

        {/* Bulk Delete Confirmation Dialog */}
        <ConfirmDialog
          open={showBulkDeleteModal}
          onClose={() => setShowBulkDeleteModal(false)}
          onConfirm={() => bulkDeleteMutation.mutate(selection.selectedIds)}
          title="Delete Selected Expenses"
          message={`Are you sure you want to delete ${selection.selectedCount} expense(s)? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          isLoading={bulkDeleteMutation.isPending}
        />

        {/* Add Expense Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
                <h2 className="text-xl font-semibold">Record New Expense</h2>
                <Button variant="ghost" onClick={() => setShowAddModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expense Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                        formErrors.expense_type ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.expense_type}
                      onChange={(e) => setFormData({ ...formData, expense_type: parseInt(e.target.value) || 0 })}
                    >
                      <option value={0}>Select Type</option>
                      {expenseTypes.map((type: ExpenseType) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.expense_type && <p className="text-red-500 text-xs mt-1">{formErrors.expense_type}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account <span className="text-red-500">*</span>
                    </label>
                    <select
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                        formErrors.account ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.account}
                      onChange={(e) => setFormData({ ...formData, account: parseInt(e.target.value) || 0 })}
                    >
                      <option value={0}>Select Account</option>
                      {accounts.map((account: Account) => (
                        <option key={account.id} value={account.id}>
                          {account.account_code} - {account.account_name}
                        </option>
                      ))}
                    </select>
                    {formErrors.account && <p className="text-red-500 text-xs mt-1">{formErrors.account}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      formErrors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Expense description"
                  />
                  {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount (₦) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                        formErrors.amount ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                    />
                    {formErrors.amount && <p className="text-red-500 text-xs mt-1">{formErrors.amount}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                        formErrors.expense_date ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.expense_date}
                      onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                    />
                    {formErrors.expense_date && <p className="text-red-500 text-xs mt-1">{formErrors.expense_date}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.payment_method}
                      onChange={(e) =>
                        setFormData({ ...formData, payment_method: e.target.value as ExpenseFormData['payment_method'] })
                      }
                    >
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                      <option value="card">Card</option>
                      <option value="petty_cash">Petty Cash</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.vendor_name}
                      onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                      placeholder="Vendor/supplier name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Contact</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.vendor_contact}
                      onChange={(e) => setFormData({ ...formData, vendor_contact: e.target.value })}
                      placeholder="Phone or email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                    placeholder="External invoice number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 p-6 border-t sticky bottom-0 bg-white">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button className="mofad-btn-primary" onClick={handleSaveNew} disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Expense
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal - Similar to Add Modal */}
        {showEditModal && selectedExpense && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
                <h2 className="text-xl font-semibold">Edit Expense - {selectedExpense.expense_number}</h2>
                <Button variant="ghost" onClick={() => setShowEditModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-6 space-y-4">
                {/* Same form fields as Add Modal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expense Type *</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.expense_type}
                      onChange={(e) => setFormData({ ...formData, expense_type: parseInt(e.target.value) || 0 })}
                    >
                      <option value={0}>Select Type</option>
                      {expenseTypes.map((type: ExpenseType) => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account *</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.account}
                      onChange={(e) => setFormData({ ...formData, account: parseInt(e.target.value) || 0 })}
                    >
                      <option value={0}>Select Account</option>
                      {accounts.map((account: Account) => (
                        <option key={account.id} value={account.id}>
                          {account.account_code} - {account.account_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦) *</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.expense_date}
                      onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.payment_method}
                      onChange={(e) =>
                        setFormData({ ...formData, payment_method: e.target.value as ExpenseFormData['payment_method'] })
                      }
                    >
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                      <option value="card">Card</option>
                      <option value="petty_cash">Petty Cash</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.vendor_name}
                      onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.invoice_number}
                      onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 p-6 border-t sticky bottom-0 bg-white">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
                <Button className="mofad-btn-primary" onClick={handleSaveEdit} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Update Expense
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && selectedExpense && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Expense Details - {selectedExpense.expense_number}</h2>
                <Button variant="ghost" onClick={() => setShowViewModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Expense Number</label>
                    <p className="font-mono font-semibold">{selectedExpense.expense_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div>{getStatusBadge(selectedExpense.status)}</div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="font-semibold">{selectedExpense.description}</p>
                  <p className="text-sm text-muted-foreground">{selectedExpense.expense_type_name}</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Amount</label>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(selectedExpense.amount)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payment Method</label>
                    <div className="flex items-center gap-2">
                      {getPaymentMethodIcon(selectedExpense.payment_method)}
                      <span>{getPaymentMethodLabel(selectedExpense.payment_method)}</span>
                    </div>
                  </div>
                </div>
                {selectedExpense.vendor_name && (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Vendor</label>
                      <p>{selectedExpense.vendor_name}</p>
                    </div>
                    {selectedExpense.invoice_number && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Invoice Number</label>
                        <p>{selectedExpense.invoice_number}</p>
                      </div>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Expense Date</label>
                    <p>{formatDateTime(selectedExpense.expense_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created</label>
                    <p>{formatDateTime(selectedExpense.created_at)}</p>
                  </div>
                </div>
                {selectedExpense.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Notes</label>
                    <p className="text-sm">{selectedExpense.notes}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 p-6 border-t">
                <Button variant="outline" onClick={() => setShowViewModal(false)}>Close</Button>
                {selectedExpense.status === 'pending' && (
                  <Button className="mofad-btn-primary" onClick={() => {
                    setShowViewModal(false)
                    handleEdit(selectedExpense)
                  }}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Approval Modal */}
        {showApprovalModal && selectedExpense && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full m-4">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className={`text-xl font-semibold ${
                  approvalAction === 'approve' || approvalAction === 'mark_paid' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {approvalAction === 'approve' && 'Approve Expense'}
                  {approvalAction === 'reject' && 'Reject Expense'}
                  {approvalAction === 'mark_paid' && 'Mark as Paid'}
                </h2>
                <Button variant="ghost" onClick={() => setShowApprovalModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    approvalAction === 'reject' ? 'bg-red-100' : 'bg-green-100'
                  }`}>
                    {approvalAction === 'reject' ? (
                      <Ban className="w-6 h-6 text-red-600" />
                    ) : (
                      <Check className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedExpense.expense_number}</h3>
                    <p className="text-sm text-muted-foreground">{selectedExpense.description}</p>
                    <p className="font-bold text-primary">{formatCurrency(selectedExpense.amount)}</p>
                  </div>
                </div>
                <p className="text-gray-700">
                  {approvalAction === 'approve' && 'Are you sure you want to approve this expense?'}
                  {approvalAction === 'reject' && 'Are you sure you want to reject this expense?'}
                  {approvalAction === 'mark_paid' && 'Are you sure you want to mark this expense as paid?'}
                </p>
              </div>
              <div className="flex justify-end gap-2 p-6 border-t">
                <Button variant="outline" onClick={() => setShowApprovalModal(false)}>Cancel</Button>
                <Button
                  className={approvalAction === 'reject' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}
                  onClick={confirmApproval}
                  disabled={approveMutation.isPending || rejectMutation.isPending || markPaidMutation.isPending}
                >
                  {(approveMutation.isPending || rejectMutation.isPending || markPaidMutation.isPending) ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : approvalAction === 'reject' ? (
                    <Ban className="w-4 h-4 mr-2" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  {approvalAction === 'approve' && 'Approve'}
                  {approvalAction === 'reject' && 'Reject'}
                  {approvalAction === 'mark_paid' && 'Mark Paid'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedExpense && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full m-4">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-red-600">Delete Expense</h2>
                <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Delete Expense</h3>
                    <p className="text-sm text-gray-600">This action cannot be undone</p>
                  </div>
                </div>
                <p className="text-gray-700">
                  Are you sure you want to delete expense <strong>{selectedExpense.expense_number}</strong>?
                </p>
              </div>
              <div className="flex justify-end gap-2 p-6 border-t">
                <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={confirmDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
