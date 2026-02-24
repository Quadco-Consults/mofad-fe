'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import apiClient from '@/lib/apiClient'
import { PaymentVoucherListItem } from '@/types'
import {
  Search,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  FileText,
  CreditCard,
  TrendingUp,
  Calendar,
} from 'lucide-react'

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  finance_review: 'bg-blue-100 text-blue-800',
  cfo_approval: 'bg-purple-100 text-purple-800',
  md_approval: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  paid: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

const statusLabels = {
  draft: 'Draft',
  finance_review: 'Finance Review',
  cfo_approval: 'CFO Approval',
  md_approval: 'MD Approval',
  approved: 'Approved',
  paid: 'Paid',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
}

const statusIcons = {
  draft: FileText,
  finance_review: Clock,
  cfo_approval: Clock,
  md_approval: Clock,
  approved: CheckCircle,
  paid: CheckCircle,
  rejected: XCircle,
  cancelled: XCircle,
}

const paymentMethodLabels = {
  bank_transfer: 'Bank Transfer',
  cheque: 'Cheque',
  cash: 'Cash',
  mobile_money: 'Mobile Money',
}

const formatCurrency = (amount: string | number) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(numAmount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function PaymentVouchersPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('all')

  // Fetch payment vouchers from API
  const { data: vouchersData, isLoading } = useQuery({
    queryKey: ['payment-vouchers', filterStatus, filterPaymentMethod],
    queryFn: async () => {
      const params: any = {}
      if (filterStatus !== 'all') params.status = filterStatus
      if (filterPaymentMethod !== 'all') params.payment_method = filterPaymentMethod

      return apiClient.getPaymentVouchers(params)
    },
  })

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ['payment-vouchers-stats'],
    queryFn: () => apiClient.getPaymentVoucherStats(),
  })

  const vouchers: PaymentVoucherListItem[] = vouchersData?.results || vouchersData || []

  // Filter vouchers by search term
  const filteredVouchers = vouchers.filter((voucher) =>
    voucher.voucher_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voucher.payee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (voucher.memo_number && voucher.memo_number.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Calculate display stats
  const displayStats = stats || {
    total: vouchers.length,
    by_status: {
      draft: vouchers.filter(v => v.status === 'draft').length,
      pending: vouchers.filter(v => ['finance_review', 'cfo_approval', 'md_approval'].includes(v.status)).length,
      approved: vouchers.filter(v => v.status === 'approved').length,
      paid: vouchers.filter(v => v.status === 'paid').length,
      rejected: vouchers.filter(v => v.status === 'rejected').length,
      cancelled: vouchers.filter(v => v.status === 'cancelled').length,
    },
    total_amount: vouchers
      .filter(v => v.status === 'paid')
      .reduce((sum, v) => sum + parseFloat(v.amount), 0),
    pending_amount: vouchers
      .filter(v => v.status === 'approved')
      .reduce((sum, v) => sum + parseFloat(v.amount), 0),
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Payment Vouchers</h1>
            <p className="text-muted-foreground mt-1">
              Manage payment vouchers and approval workflow
            </p>
          </div>
          <Button onClick={() => router.push('/admin/payment-vouchers/create')}>
            <Plus className="w-4 h-4 mr-2" />
            Create Voucher
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{displayStats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{displayStats.by_status.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold">{displayStats.by_status.approved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Paid</p>
                  <p className="text-2xl font-bold">{displayStats.by_status.paid}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Amount</p>
                  <p className="text-lg font-bold">{formatCurrency(displayStats.pending_amount)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                  <p className="text-lg font-bold">{formatCurrency(displayStats.total_amount)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search vouchers..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <select
                className="px-4 py-2 border border-gray-300 rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="finance_review">Finance Review</option>
                <option value="cfo_approval">CFO Approval</option>
                <option value="md_approval">MD Approval</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Payment Method Filter */}
              <select
                className="px-4 py-2 border border-gray-300 rounded-md"
                value={filterPaymentMethod}
                onChange={(e) => setFilterPaymentMethod(e.target.value)}
              >
                <option value="all">All Payment Methods</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="cash">Cash</option>
                <option value="mobile_money">Mobile Money</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Vouchers List */}
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading payment vouchers...</p>
              </div>
            ) : filteredVouchers.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">No payment vouchers found</p>
                <p className="text-muted-foreground mt-2">
                  {searchTerm ? 'Try adjusting your search' : 'Create your first payment voucher to get started'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Voucher #</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Memo</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Payee</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Payment Method</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Progress</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Created</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredVouchers.map((voucher) => {
                      const StatusIcon = statusIcons[voucher.status]
                      const approvalProgress = voucher.approval_progress || 0

                      return (
                        <tr key={voucher.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{voucher.voucher_number}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-medium text-sm">{voucher.memo_number || 'N/A'}</p>
                              {voucher.memo_title && (
                                <p className="text-xs text-muted-foreground">{voucher.memo_title}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-medium">{voucher.payee_name}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-semibold text-green-700">
                              {formatCurrency(voucher.amount)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">
                                {paymentMethodLabels[voucher.payment_method as keyof typeof paymentMethodLabels]}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <StatusIcon className="w-4 h-4" />
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[voucher.status as keyof typeof statusColors]}`}>
                                {statusLabels[voucher.status as keyof typeof statusLabels]}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all"
                                  style={{ width: `${approvalProgress}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">{approvalProgress}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <p className="text-sm">{formatDate(voucher.created_at)}</p>
                              {voucher.created_by_name && (
                                <p className="text-xs text-muted-foreground">{voucher.created_by_name}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/admin/payment-vouchers/${voucher.id}`)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
