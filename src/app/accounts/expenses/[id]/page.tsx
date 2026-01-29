'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter, useParams } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import {
  ArrowLeft,
  Receipt,
  DollarSign,
  Calendar,
  User,
  Building,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Edit,
  Trash2,
  RefreshCw,
  Download,
  Printer,
  CreditCard,
  Tag,
  MessageSquare,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'

interface Expense {
  id: number
  expense_number: string
  title: string
  description?: string
  expense_type_id?: number
  expense_type_name?: string
  account_id?: number
  account_name?: string
  amount: number
  tax_amount?: number
  total_amount?: number
  expense_date: string
  payment_method?: string
  reference_number?: string
  vendor_name?: string
  vendor_contact?: string
  receipt_url?: string
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'paid'
  approval_status?: string
  approved_by_id?: number
  approved_by_name?: string
  approved_at?: string
  rejection_reason?: string
  paid_at?: string
  paid_by_name?: string
  created_by_id?: number
  created_by_name?: string
  notes?: string
  created_at: string
  updated_at: string
}

const getStatusConfig = (status: string) => {
  const configs: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
    draft: {
      color: 'text-gray-700',
      bg: 'bg-gray-100 border-gray-300',
      icon: <Clock className="w-4 h-4" />,
      label: 'DRAFT'
    },
    pending: {
      color: 'text-amber-700',
      bg: 'bg-amber-100 border-amber-300',
      icon: <Clock className="w-4 h-4" />,
      label: 'PENDING APPROVAL'
    },
    approved: {
      color: 'text-blue-700',
      bg: 'bg-blue-100 border-blue-300',
      icon: <CheckCircle className="w-4 h-4" />,
      label: 'APPROVED'
    },
    rejected: {
      color: 'text-red-700',
      bg: 'bg-red-100 border-red-300',
      icon: <XCircle className="w-4 h-4" />,
      label: 'REJECTED'
    },
    paid: {
      color: 'text-emerald-700',
      bg: 'bg-emerald-100 border-emerald-300',
      icon: <DollarSign className="w-4 h-4" />,
      label: 'PAID'
    }
  }
  return configs[status] || configs.draft
}

export default function ExpenseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const expenseId = parseInt(params.id as string)

  // Fetch expense details
  const { data: expense, isLoading, error, refetch } = useQuery({
    queryKey: ['expense-detail', expenseId],
    queryFn: () => apiClient.getExpenseById(expenseId),
  })

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: () => apiClient.approveExpense(expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-detail', expenseId] })
      addToast({ type: 'success', title: 'Approved', message: 'Expense has been approved' })
    },
    onError: () => {
      addToast({ type: 'error', title: 'Error', message: 'Failed to approve expense' })
    }
  })

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: () => apiClient.rejectExpense(expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-detail', expenseId] })
      addToast({ type: 'success', title: 'Rejected', message: 'Expense has been rejected' })
    },
    onError: () => {
      addToast({ type: 'error', title: 'Error', message: 'Failed to reject expense' })
    }
  })

  // Mark as paid mutation
  const markPaidMutation = useMutation({
    mutationFn: () => apiClient.markExpensePaid(expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-detail', expenseId] })
      addToast({ type: 'success', title: 'Paid', message: 'Expense marked as paid' })
    },
    onError: () => {
      addToast({ type: 'error', title: 'Error', message: 'Failed to mark expense as paid' })
    }
  })

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 space-y-6">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-24 bg-gray-200 rounded"></div>
              <div className="h-8 w-64 bg-gray-200 rounded"></div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 h-64 bg-gray-200 rounded-lg"></div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error || !expense) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center py-16 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-100">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Expense Not Found</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              The expense record you&apos;re looking for doesn&apos;t exist or may have been removed.
            </p>
            <Button onClick={() => router.back()} className="mofad-btn-primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  const statusConfig = getStatusConfig(expense.status)
  const totalAmount = expense.total_amount || (expense.amount + (expense.tax_amount || 0))

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()} className="group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">Expense Details</h1>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border-2 ${statusConfig.bg} ${statusConfig.color}`}>
                  {statusConfig.icon}
                  {statusConfig.label}
                </span>
              </div>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Receipt className="w-4 h-4" />
                Expense #: <span className="font-mono font-semibold text-primary">{expense.expense_number}</span>
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            {expense.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                  onClick={() => approveMutation.mutate()}
                  disabled={approveMutation.isPending}
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => rejectMutation.mutate()}
                  disabled={rejectMutation.isPending}
                >
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
            {expense.status === 'approved' && (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => markPaidMutation.mutate()}
                disabled={markPaidMutation.isPending}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Mark as Paid
              </Button>
            )}
            <Button className="mofad-btn-primary">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Expense Details */}
          <Card className="lg:col-span-2 overflow-hidden">
            <div className="h-2 mofad-gradient-bg"></div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                Expense Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Title & Description */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{expense.title}</h3>
                  {expense.description && (
                    <p className="text-gray-600 mt-2">{expense.description}</p>
                  )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Tag className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Expense Type</p>
                        <p className="font-semibold text-gray-900">{expense.expense_type_name || 'Uncategorized'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Expense Date</p>
                        <p className="font-semibold text-gray-900">{formatDateTime(expense.expense_date).split(' ')[0]}</p>
                      </div>
                    </div>

                    {expense.vendor_name && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Building className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Vendor</p>
                          <p className="font-semibold text-gray-900">{expense.vendor_name}</p>
                          {expense.vendor_contact && (
                            <p className="text-sm text-gray-500">{expense.vendor_contact}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {expense.account_name && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Account</p>
                          <p className="font-semibold text-gray-900">{expense.account_name}</p>
                        </div>
                      </div>
                    )}

                    {expense.payment_method && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Payment Method</p>
                          <p className="font-semibold text-gray-900 capitalize">{expense.payment_method.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                    )}

                    {expense.reference_number && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Reference Number</p>
                          <p className="font-mono font-semibold text-gray-900">{expense.reference_number}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {expense.notes && (
                  <div className="pt-4 border-t">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Notes</p>
                        <p className="text-gray-600 mt-1">{expense.notes}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Amount Card */}
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  Amount Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Base Amount</div>
                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(expense.amount)}</div>
                  </div>

                  {expense.tax_amount && expense.tax_amount > 0 && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">{formatCurrency(expense.tax_amount)}</span>
                    </div>
                  )}

                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-100">
                    <div className="text-sm text-emerald-700 mb-1">Total Amount</div>
                    <div className="text-3xl font-bold text-emerald-800">{formatCurrency(totalAmount)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audit Trail */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-500" />
                  Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Created by {expense.created_by_name || 'System'}</p>
                      <p className="text-xs text-gray-500">{formatDateTime(expense.created_at)}</p>
                    </div>
                  </div>

                  {expense.approved_by_name && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Approved by {expense.approved_by_name}</p>
                        <p className="text-xs text-gray-500">{expense.approved_at ? formatDateTime(expense.approved_at) : ''}</p>
                      </div>
                    </div>
                  )}

                  {expense.rejection_reason && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <XCircle className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Rejected</p>
                        <p className="text-xs text-gray-500">{expense.rejection_reason}</p>
                      </div>
                    </div>
                  )}

                  {expense.paid_by_name && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Paid by {expense.paid_by_name}</p>
                        <p className="text-xs text-gray-500">{expense.paid_at ? formatDateTime(expense.paid_at) : ''}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
