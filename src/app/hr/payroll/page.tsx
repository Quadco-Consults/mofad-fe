'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Search,
  Calculator,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  Eye,
  Trash2,
  Loader2,
} from 'lucide-react'

import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Pagination } from '@/components/ui/Pagination'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toast'
import apiClient, { MONTH_NAMES } from '@/lib/apiClient'
import type { Payroll, PayrollStats } from '@/lib/apiClient'
import { formatCurrency, formatDate } from '@/lib/utils'

const STATUS_BADGES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  pending_approval: 'bg-amber-100 text-amber-800',
  approved: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'paid', label: 'Paid' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function PayrollPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [toDelete, setToDelete] = useState<Payroll | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['hr', 'payrolls', currentPage, searchTerm, statusFilter, yearFilter],
    queryFn: () =>
      apiClient.getPayrolls({
        page: currentPage,
        size: pageSize,
        ...(searchTerm ? { search: searchTerm } : {}),
        ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
        ...(yearFilter !== 'all' ? { year: Number(yearFilter) } : {}),
      }),
  })

  const { data: stats } = useQuery<PayrollStats>({
    queryKey: ['hr', 'payroll-stats'],
    queryFn: () => apiClient.getPayrollStats(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.deletePayroll(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr'] })
      addToast({ type: 'success', title: 'Deleted', message: 'Payroll batch removed.' })
      setToDelete(null)
    },
    onError: (err: any) => {
      addToast({ type: 'error', title: 'Error', message: err.message || 'Failed to delete payroll' })
      setToDelete(null)
    },
  })

  const payrolls = data?.results ?? []
  const totalCount = data?.paginator?.count ?? data?.count ?? 0
  const totalPages = data?.paginator?.total_pages ?? Math.ceil(totalCount / pageSize) ?? 1

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i)

  const applyFilter = (setter: (value: string) => void) => (value: string) => {
    setter(value)
    setCurrentPage(1)
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
            <p className="text-gray-600">
              Run monthly payroll, approve batches and issue payslips
            </p>
          </div>
          <Button onClick={() => router.push('/hr/payroll/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Run Payroll
          </Button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Batches',
              value: String(stats?.total_payrolls ?? 0),
              icon: Calculator,
              color: 'text-emerald-600',
            },
            {
              label: 'Awaiting Approval',
              value: String((stats?.draft ?? 0) + (stats?.pending_approval ?? 0)),
              icon: Clock,
              color: 'text-amber-600',
            },
            {
              label: 'Paid Batches',
              value: String(stats?.paid ?? 0),
              icon: CheckCircle,
              color: 'text-green-600',
            },
            {
              label: 'Total Net Paid',
              value: formatCurrency(Number(stats?.total_net ?? 0)),
              icon: DollarSign,
              color: 'text-blue-600',
            },
          ].map((card) => {
            const Icon = card.icon
            return (
              <Card key={card.label}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600">{card.label}</p>
                    <p className="text-2xl font-bold text-gray-900 truncate">{card.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 flex-shrink-0 ${card.color}`} />
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by payroll number..."
                  value={searchTerm}
                  onChange={(e) => applyFilter(setSearchTerm)(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => applyFilter(setStatusFilter)(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green"
              >
                <option value="all">All statuses</option>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={yearFilter}
                onChange={(e) => applyFilter(setYearFilter)(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green"
              >
                <option value="all">All years</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16 text-gray-500">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading payroll batches...
              </div>
            ) : error ? (
              <div className="py-16 text-center text-red-600">
                {(error as any).message || 'Failed to load payroll batches'}
              </div>
            ) : payrolls.length === 0 ? (
              <div className="py-16 text-center">
                <Calculator className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No payroll batches</p>
                <p className="text-sm text-gray-500 mb-4">
                  {searchTerm || statusFilter !== 'all' || yearFilter !== 'all'
                    ? 'Try adjusting your filters.'
                    : 'Run your first payroll to get started.'}
                </p>
                <Button onClick={() => router.push('/hr/payroll/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Run Payroll
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Employees</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gross</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Deductions</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payrolls.map((payroll) => (
                      <tr key={payroll.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <Link href={`/hr/payroll/${payroll.id}`} className="block">
                            <p className="font-medium text-gray-900 hover:text-mofad-green">
                              {MONTH_NAMES[payroll.month - 1]} {payroll.year}
                            </p>
                            <p className="text-xs text-gray-500">
                              {payroll.payroll_number} &middot; {formatDate(payroll.period_start)} -{' '}
                              {formatDate(payroll.period_end)}
                            </p>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1 text-sm text-gray-700">
                            <Users className="h-3.5 w-3.5 text-gray-400" />
                            {payroll.employee_count}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-700">
                          {formatCurrency(Number(payroll.total_gross))}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-700">
                          {formatCurrency(Number(payroll.total_deductions))}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-green-700">
                          {formatCurrency(Number(payroll.total_net))}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              STATUS_BADGES[payroll.status] || 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {payroll.status_display}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/hr/payroll/${payroll.id}`}
                              className="p-2 text-gray-500 hover:text-mofad-green hover:bg-gray-100 rounded"
                              title="View batch"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            {/* Only unapproved batches can be removed; the API
                                enforces this too. */}
                            {(payroll.status === 'draft' || payroll.status === 'cancelled') && (
                              <button
                                onClick={() => setToDelete(payroll)}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded"
                                title="Delete batch"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
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

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete payroll batch"
        message={`Delete ${toDelete?.payroll_number}? All ${toDelete?.employee_count ?? 0} employee lines in this batch are removed with it.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
        onClose={() => setToDelete(null)}
      />
    </AppLayout>
  )
}
