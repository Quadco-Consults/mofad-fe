'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, DollarSign, AlertTriangle, CheckCircle, XCircle, Loader2, X, Save, Receipt } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import apiClient from '@/lib/apiClient'
import { useToast } from '@/components/ui/Toast'
import { formatCurrency } from '@/lib/utils'

export default function CarWashExpensesPage() {
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const [form, setForm] = useState({
    car_wash: '' as string,
    name: '',
    expense_type: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  // Fetch all car washes for the selector
  const { data: carWashesData } = useQuery({
    queryKey: ['carwashes-all'],
    queryFn: () => apiClient.get('/carwashes/', { is_active: 'true' })
  })
  const carWashes = Array.isArray(carWashesData) ? carWashesData : carWashesData?.results || []

  // Fetch all expenses across car washes
  const { data: expensesData, isLoading } = useQuery({
    queryKey: ['carwash-expenses-all', statusFilter, searchTerm],
    queryFn: () => {
      const params: Record<string, string> = { ordering: '-expense_date' }
      if (statusFilter !== 'all') params.approval_status = statusFilter
      if (searchTerm) params.search = searchTerm
      return apiClient.get('/carwash-expenses/', params)
    }
  })
  const expenses = Array.isArray(expensesData) ? expensesData : expensesData?.results || []

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/carwash-expenses/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carwash-expenses-all'] })
      addToast({ type: 'success', title: 'Success', message: 'Expense recorded successfully' })
      setShowModal(false)
      resetForm()
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to record expense' })
    }
  })

  const approveMutation = useMutation({
    mutationFn: (expenseId: string) => apiClient.post(`/carwash-expenses/${expenseId}/approve/`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carwash-expenses-all'] })
      addToast({ type: 'success', title: 'Approved', message: 'Expense approved' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to approve expense' })
    }
  })

  const rejectMutation = useMutation({
    mutationFn: ({ expenseId, reason }: { expenseId: string; reason: string }) =>
      apiClient.post(`/carwash-expenses/${expenseId}/reject/`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carwash-expenses-all'] })
      addToast({ type: 'success', title: 'Rejected', message: 'Expense rejected' })
      setShowRejectModal(false)
      setRejectReason('')
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to reject expense' })
    }
  })

  const resetForm = () => {
    setForm({ car_wash: '', name: '', expense_type: '', amount: '', expense_date: new Date().toISOString().split('T')[0], notes: '' })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      car_wash: Number(form.car_wash),
      name: form.name,
      expense_type: form.expense_type,
      amount: parseFloat(form.amount),
      expense_date: form.expense_date,
      notes: form.notes || undefined
    })
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    }
    return map[status] || 'bg-gray-100 text-gray-800'
  }

  const totalPending = expenses.filter((e: any) => e.approval_status === 'pending').reduce((sum: number, e: any) => sum + parseFloat(e.amount || '0'), 0)
  const totalApproved = expenses.filter((e: any) => e.approval_status === 'approved').reduce((sum: number, e: any) => sum + parseFloat(e.amount || '0'), 0)

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Car Wash Expenses</h1>
            <p className="text-muted-foreground">Track and approve expenses across all car wash locations</p>
          </div>
          <Button className="mofad-btn-primary" onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Record Expense
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="mofad-card">
            <p className="text-sm text-gray-600">Total Expenses</p>
            <p className="text-2xl font-bold text-gray-900">{expenses.length}</p>
          </div>
          <div className="mofad-card">
            <p className="text-sm text-gray-600">Pending Approval</p>
            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totalPending)}</p>
          </div>
          <div className="mofad-card">
            <p className="text-sm text-gray-600">Total Approved</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalApproved)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Expenses Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 text-center text-gray-500">Loading...</div>
            ) : expenses.length === 0 ? (
              <div className="p-12 text-center">
                <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No expenses found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Number</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Car Wash</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Amount</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {expenses.map((exp: any) => (
                      <tr key={exp.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-600">{exp.expense_number}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{exp.car_wash_name}</td>
                        <td className="py-3 px-4 font-medium text-gray-900">{exp.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{exp.expense_type}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{exp.expense_date}</td>
                        <td className="py-3 px-4 text-right font-bold text-gray-900">
                          {formatCurrency(parseFloat(exp.amount || '0'))}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(exp.approval_status)}`}>
                            {exp.approval_status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {exp.approval_status === 'pending' && (
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-green-600"
                                onClick={() => approveMutation.mutate(exp.id)}
                                disabled={approveMutation.isPending}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-red-600"
                                onClick={() => { setSelectedExpenseId(exp.id); setShowRejectModal(true) }}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Expense Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Record Expense</h2>
              <Button variant="ghost" size="sm" onClick={() => { setShowModal(false); resetForm() }} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Car Wash *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.car_wash}
                  onChange={(e) => setForm(prev => ({ ...prev, car_wash: e.target.value }))}
                  required
                >
                  <option value="">Select Car Wash</option>
                  {carWashes.map((cw: any) => <option key={cw.id} value={cw.id}>{cw.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expense Name *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Staff wages"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expense Type *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={form.expense_type}
                    onChange={(e) => setForm(prev => ({ ...prev, expense_type: e.target.value }))}
                    placeholder="e.g. Salary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (NGN) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={form.amount}
                    onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.expense_date}
                  onChange={(e) => setForm(prev => ({ ...prev, expense_date: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => { setShowModal(false); resetForm() }} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1 mofad-btn-primary" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Expense</>}
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Reject Modal */}
      {showRejectModal && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-semibold mb-4">Rejection Reason</h2>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection..."
            />
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={() => { setShowRejectModal(false); setRejectReason('') }} className="flex-1">Cancel</Button>
              <Button
                onClick={() => selectedExpenseId && rejectMutation.mutate({ expenseId: selectedExpenseId, reason: rejectReason })}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                disabled={!rejectReason.trim() || rejectMutation.isPending}
              >
                Reject
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </AppLayout>
  )
}
