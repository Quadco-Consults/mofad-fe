'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'
import {
  ArrowLeft, Plus, TrendingUp, DollarSign, Car, MapPin, Phone,
  Droplets, Receipt, AlertTriangle, CheckCircle, XCircle, Clock,
  X, Loader2, Save, Trash2, Eye
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'

type Tab = 'dashboard' | 'transactions' | 'expenses' | 'services'

export default function CarWashDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const [activeTab, setActiveTab] = useState<Tab>('dashboard')

  // Transaction modal state
  const [showTxnModal, setShowTxnModal] = useState(false)
  const [txnForm, setTxnForm] = useState({
    payment_method: 'cash',
    bank_reference: '',
    comment: '',
    items: [{ service: '', quantity: 1, unit_price: '' }] as Array<{ service: string; quantity: number; unit_price: string }>
  })

  // Expense modal state
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [expenseForm, setExpenseForm] = useState({
    name: '',
    expense_type: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  // Reject modal
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectTarget, setRejectTarget] = useState<{ type: 'transaction' | 'expense'; id: string } | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  // Fetch car wash details
  const { data: carWash, isLoading: cwLoading } = useQuery({
    queryKey: ['carwash', id],
    queryFn: () => apiClient.get(`/carwashes/${id}/`),
    enabled: !!id,
  })

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['carwash-stats', id],
    queryFn: () => apiClient.get(`/carwashes/${id}/stats/`),
    enabled: !!id,
  })

  // Fetch transactions
  const { data: txnsData, isLoading: txnsLoading } = useQuery({
    queryKey: ['carwash-transactions', id],
    queryFn: () => apiClient.get('/carwash-transactions/', { car_wash: String(id), ordering: '-created_datetime' }),
    enabled: !!id && activeTab === 'transactions',
  })

  // Fetch expenses
  const { data: expensesData, isLoading: expensesLoading } = useQuery({
    queryKey: ['carwash-expenses', id],
    queryFn: () => apiClient.get('/carwash-expenses/', { car_wash: String(id), ordering: '-expense_date' }),
    enabled: !!id && activeTab === 'expenses',
  })

  // Fetch services for this car wash
  const { data: servicesData } = useQuery({
    queryKey: ['carwash-services', id],
    queryFn: () => apiClient.get('/carwash-services/', { car_wash: String(id) }),
    enabled: !!id,
  })

  const transactions = servicesData?.results || (Array.isArray(txnsData) ? txnsData : txnsData?.results || [])
  const expenses = Array.isArray(expensesData) ? expensesData : expensesData?.results || []
  const services = Array.isArray(servicesData) ? servicesData : servicesData?.results || []

  const txns = Array.isArray(txnsData) ? txnsData : txnsData?.results || []

  // Create transaction
  const createTxnMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/carwash-transactions/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carwash-transactions', id] })
      queryClient.invalidateQueries({ queryKey: ['carwash-stats', id] })
      addToast({ type: 'success', title: 'Success', message: 'Transaction recorded successfully' })
      setShowTxnModal(false)
      resetTxnForm()
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to record transaction' })
    }
  })

  // Confirm transaction
  const confirmTxnMutation = useMutation({
    mutationFn: (txnId: string) => apiClient.post(`/carwash-transactions/${txnId}/confirm/`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carwash-transactions', id] })
      queryClient.invalidateQueries({ queryKey: ['carwash-stats', id] })
      queryClient.invalidateQueries({ queryKey: ['carwash', id] })
      addToast({ type: 'success', title: 'Confirmed', message: 'Transaction confirmed successfully' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to confirm transaction' })
    }
  })

  // Reject transaction
  const rejectTxnMutation = useMutation({
    mutationFn: ({ txnId, reason }: { txnId: string; reason: string }) =>
      apiClient.post(`/carwash-transactions/${txnId}/reject/`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carwash-transactions', id] })
      addToast({ type: 'success', title: 'Rejected', message: 'Transaction rejected' })
      setShowRejectModal(false)
      setRejectReason('')
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to reject transaction' })
    }
  })

  // Create expense
  const createExpenseMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/carwash-expenses/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carwash-expenses', id] })
      queryClient.invalidateQueries({ queryKey: ['carwash-stats', id] })
      addToast({ type: 'success', title: 'Success', message: 'Expense recorded successfully' })
      setShowExpenseModal(false)
      resetExpenseForm()
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to record expense' })
    }
  })

  // Approve expense
  const approveExpenseMutation = useMutation({
    mutationFn: (expenseId: string) => apiClient.post(`/carwash-expenses/${expenseId}/approve/`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carwash-expenses', id] })
      queryClient.invalidateQueries({ queryKey: ['carwash-stats', id] })
      queryClient.invalidateQueries({ queryKey: ['carwash', id] })
      addToast({ type: 'success', title: 'Approved', message: 'Expense approved' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to approve expense' })
    }
  })

  // Reject expense
  const rejectExpenseMutation = useMutation({
    mutationFn: ({ expenseId, reason }: { expenseId: string; reason: string }) =>
      apiClient.post(`/carwash-expenses/${expenseId}/reject/`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carwash-expenses', id] })
      addToast({ type: 'success', title: 'Rejected', message: 'Expense rejected' })
      setShowRejectModal(false)
      setRejectReason('')
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to reject expense' })
    }
  })

  const resetTxnForm = () => {
    setTxnForm({
      payment_method: 'cash',
      bank_reference: '',
      comment: '',
      items: [{ service: '', quantity: 1, unit_price: '' }]
    })
  }

  const resetExpenseForm = () => {
    setExpenseForm({
      name: '',
      expense_type: '',
      amount: '',
      expense_date: new Date().toISOString().split('T')[0],
      notes: ''
    })
  }

  const addTxnItem = () => {
    setTxnForm(prev => ({ ...prev, items: [...prev.items, { service: '', quantity: 1, unit_price: '' }] }))
  }

  const removeTxnItem = (index: number) => {
    setTxnForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }))
  }

  const updateTxnItem = (index: number, field: string, value: string | number) => {
    setTxnForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? { ...item, [field]: value } : item)
    }))
  }

  const handleTxnSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      car_wash: Number(id),
      payment_method: txnForm.payment_method,
      bank_reference: txnForm.bank_reference || undefined,
      comment: txnForm.comment || undefined,
      items: txnForm.items.map(item => ({
        service: Number(item.service),
        quantity: item.quantity,
        unit_price: parseFloat(item.unit_price)
      }))
    }
    createTxnMutation.mutate(payload)
  }

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      car_wash: Number(id),
      name: expenseForm.name,
      expense_type: expenseForm.expense_type,
      amount: parseFloat(expenseForm.amount),
      expense_date: expenseForm.expense_date,
      notes: expenseForm.notes || undefined
    }
    createExpenseMutation.mutate(payload)
  }

  const handleRejectConfirm = () => {
    if (!rejectTarget || !rejectReason.trim()) return
    if (rejectTarget.type === 'transaction') {
      rejectTxnMutation.mutate({ txnId: rejectTarget.id, reason: rejectReason })
    } else {
      rejectExpenseMutation.mutate({ expenseId: rejectTarget.id, reason: rejectReason })
    }
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    }
    return map[status] || 'bg-gray-100 text-gray-800'
  }

  if (cwLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    )
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'transactions', label: 'Transactions' },
    { key: 'expenses', label: 'Expenses' },
    { key: 'services', label: 'Services' },
  ]

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-8 w-8 p-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Droplets className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{carWash?.name || 'Car Wash'}</h1>
                <p className="text-muted-foreground">{carWash?.code} — {carWash?.address || 'No address'}</p>
              </div>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${carWash?.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {carWash?.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Info Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {carWash?.manager_name && (
            <div className="flex items-center gap-2 text-gray-600">
              <Car className="w-4 h-4" /> Manager: <span className="font-medium text-gray-900">{carWash.manager_name}</span>
            </div>
          )}
          {carWash?.phone && (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4" /> <span>{carWash.phone}</span>
            </div>
          )}
          {carWash?.state_name && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" /> <span>{carWash.state_name}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600">
            <DollarSign className="w-4 h-4" /> Balance: <span className="font-bold text-green-600">{formatCurrency(parseFloat(carWash?.current_balance || '0'))}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-0" aria-label="Tabs">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="mofad-card">
                <p className="text-sm text-gray-600 mb-1">Current Balance</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(parseFloat(carWash?.current_balance || '0'))}
                </p>
              </div>
              <div className="mofad-card">
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-primary-600">
                  {formatCurrency(stats?.total_revenue || 0)}
                </p>
              </div>
              <div className="mofad-card">
                <p className="text-sm text-gray-600 mb-1">Monthly Revenue</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(stats?.monthly_revenue || 0)}
                </p>
              </div>
              <div className="mofad-card">
                <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats?.total_expenses || 0)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="mofad-card">
                <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_transactions || 0}</p>
              </div>
              <div className="mofad-card">
                <p className="text-sm text-gray-600 mb-1">Pending Transactions</p>
                <p className="text-2xl font-bold text-yellow-600">{stats?.pending_transactions || 0}</p>
              </div>
              <div className="mofad-card">
                <p className="text-sm text-gray-600 mb-1">Confirmed Transactions</p>
                <p className="text-2xl font-bold text-green-600">{stats?.confirmed_transactions || 0}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button className="mofad-btn-primary" onClick={() => { setActiveTab('transactions'); setShowTxnModal(true) }}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Transaction
                </Button>
                <Button variant="outline" onClick={() => { setActiveTab('expenses'); setShowExpenseModal(true) }}>
                  <Receipt className="w-4 h-4 mr-2" />
                  Record Expense
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('transactions')}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Transactions
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Transactions</h2>
              <Button className="mofad-btn-primary" onClick={() => setShowTxnModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Transaction
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                {txnsLoading ? (
                  <div className="p-6 text-center text-gray-500">Loading...</div>
                ) : txns.length === 0 ? (
                  <div className="p-12 text-center">
                    <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No transactions yet</p>
                    <Button className="mofad-btn-primary mt-4" onClick={() => setShowTxnModal(true)}>
                      <Plus className="w-4 h-4 mr-2" />New Transaction
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Number</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Payment</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-900">Amount</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {txns.map((txn: any) => (
                          <tr key={txn.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="font-medium text-gray-900">{txn.transaction_number}</div>
                              {txn.comment && <div className="text-xs text-gray-500 truncate max-w-[150px]">{txn.comment}</div>}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {txn.transaction_date || (txn.created_datetime ? new Date(txn.created_datetime).toLocaleDateString() : '-')}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600 capitalize">{txn.payment_method}</td>
                            <td className="py-3 px-4 text-right font-bold text-gray-900">
                              {formatCurrency(parseFloat(txn.total_amount || '0'))}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(txn.approval_status)}`}>
                                {txn.approval_status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {txn.approval_status === 'pending' && (
                                <div className="flex items-center justify-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-green-600 hover:text-green-700"
                                    onClick={() => confirmTxnMutation.mutate(txn.id)}
                                    disabled={confirmTxnMutation.isPending}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-red-600 hover:text-red-700"
                                    onClick={() => { setRejectTarget({ type: 'transaction', id: txn.id }); setShowRejectModal(true) }}
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
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Expenses</h2>
              <Button className="mofad-btn-primary" onClick={() => setShowExpenseModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Record Expense
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                {expensesLoading ? (
                  <div className="p-6 text-center text-gray-500">Loading...</div>
                ) : expenses.length === 0 ? (
                  <div className="p-12 text-center">
                    <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No expenses recorded</p>
                    <Button className="mofad-btn-primary mt-4" onClick={() => setShowExpenseModal(true)}>
                      <Plus className="w-4 h-4 mr-2" />Record Expense
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Number</th>
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
                                    className="h-7 px-2 text-green-600 hover:text-green-700"
                                    onClick={() => approveExpenseMutation.mutate(exp.id)}
                                    disabled={approveExpenseMutation.isPending}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-red-600 hover:text-red-700"
                                    onClick={() => { setRejectTarget({ type: 'expense', id: exp.id }); setShowRejectModal(true) }}
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
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Services</h2>
            </div>
            <Card>
              <CardContent className="p-0">
                {services.length === 0 ? (
                  <div className="p-12 text-center">
                    <Droplets className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No services configured for this car wash</p>
                    <p className="text-sm text-gray-400 mt-2">Services can be added from the admin panel</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Service Name</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-900">Default Price</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {services.map((svc: any) => (
                          <tr key={svc.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-gray-900">{svc.name}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">{svc.description || '-'}</td>
                            <td className="py-3 px-4 text-right font-bold text-gray-900">
                              {formatCurrency(parseFloat(svc.default_price || '0'))}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${svc.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                {svc.is_active ? 'Active' : 'Inactive'}
                              </span>
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
        )}
      </div>

      {/* New Transaction Modal */}
      {showTxnModal && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">New Transaction</h2>
              <Button variant="ghost" size="sm" onClick={() => { setShowTxnModal(false); resetTxnForm() }} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleTxnSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={txnForm.payment_method}
                    onChange={(e) => setTxnForm(prev => ({ ...prev, payment_method: e.target.value }))}
                  >
                    <option value="cash">Cash</option>
                    <option value="pos">POS</option>
                    <option value="transfer">Bank Transfer</option>
                  </select>
                </div>
                {txnForm.payment_method !== 'cash' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Reference</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={txnForm.bank_reference}
                      onChange={(e) => setTxnForm(prev => ({ ...prev, bank_reference: e.target.value }))}
                      placeholder="Reference number"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment (optional)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={txnForm.comment}
                  onChange={(e) => setTxnForm(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Any notes..."
                />
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Services</label>
                  <Button type="button" variant="outline" size="sm" onClick={addTxnItem}>
                    <Plus className="w-3 h-3 mr-1" />Add Service
                  </Button>
                </div>
                <div className="space-y-2">
                  {txnForm.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-[1fr_80px_120px_32px] gap-2 items-center">
                      <select
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        value={item.service}
                        onChange={(e) => {
                          updateTxnItem(index, 'service', e.target.value)
                          const svc = services.find((s: any) => String(s.id) === e.target.value)
                          if (svc) updateTxnItem(index, 'unit_price', svc.default_price)
                        }}
                        required
                      >
                        <option value="">Select service</option>
                        {services.map((svc: any) => (
                          <option key={svc.id} value={svc.id}>{svc.name}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        value={item.quantity}
                        onChange={(e) => updateTxnItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        placeholder="Qty"
                        required
                      />
                      <input
                        type="number"
                        step="0.01"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        value={item.unit_price}
                        onChange={(e) => updateTxnItem(index, 'unit_price', e.target.value)}
                        placeholder="Unit price"
                        required
                      />
                      {txnForm.items.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={() => removeTxnItem(index)}>
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total preview */}
              <div className="bg-gray-50 rounded-md p-3 text-right">
                <span className="text-sm text-gray-600">Total: </span>
                <span className="font-bold text-lg">
                  {formatCurrency(
                    txnForm.items.reduce((sum, item) => sum + (item.quantity * (parseFloat(item.unit_price) || 0)), 0)
                  )}
                </span>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => { setShowTxnModal(false); resetTxnForm() }} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1 mofad-btn-primary" disabled={createTxnMutation.isPending}>
                  {createTxnMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Record Transaction</>}
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Expense Modal */}
      {showExpenseModal && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Record Expense</h2>
              <Button variant="ghost" size="sm" onClick={() => { setShowExpenseModal(false); resetExpenseForm() }} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleExpenseSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expense Name *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={expenseForm.name}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Staff wages, Supplies"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expense Type *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={expenseForm.expense_type}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, expense_type: e.target.value }))}
                    placeholder="e.g. Salary, Supplies"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (NGN) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expense Date *</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={expenseForm.expense_date}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, expense_date: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => { setShowExpenseModal(false); resetExpenseForm() }} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1 mofad-btn-primary" disabled={createExpenseMutation.isPending}>
                  {createExpenseMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Expense</>}
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
            <h2 className="text-lg font-semibold mb-4">Provide Rejection Reason</h2>
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
                onClick={handleRejectConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                disabled={!rejectReason.trim() || rejectTxnMutation.isPending || rejectExpenseMutation.isPending}
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
