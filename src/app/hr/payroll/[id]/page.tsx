'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Loader2,
  Users,
  DollarSign,
  Send,
  CheckCircle,
  XCircle,
  FileText,
  Banknote,
  Search,
  Save,
  X,
  ShieldAlert,
  Lock,
} from 'lucide-react'

import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import apiClient, { MONTH_NAMES } from '@/lib/apiClient'
import type { Payroll, PayrollLine, PayrollLineAdjustment } from '@/lib/apiClient'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'

const STATUS_BADGES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  pending_approval: 'bg-amber-100 text-amber-800',
  approved: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const inputClass =
  'w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-mofad-green'

const ADJUSTABLE_FIELDS = [
  { key: 'bonus', label: 'Bonus', kind: 'money' },
  { key: 'overtime', label: 'Overtime', kind: 'money' },
  { key: 'loan_repayment', label: 'Loan Repayment', kind: 'money' },
  { key: 'other_deductions', label: 'Other Deductions', kind: 'money' },
  { key: 'days_worked', label: 'Days Worked', kind: 'int' },
  { key: 'days_absent', label: 'Days Absent', kind: 'int' },
  { key: 'late_days', label: 'Late Days', kind: 'int' },
] as const

export default function PayrollDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const payrollId = params?.id as string

  const [search, setSearch] = useState('')
  const [editingLine, setEditingLine] = useState<PayrollLine | null>(null)
  const [adjustForm, setAdjustForm] = useState<Record<string, string>>({})
  const [showReject, setShowReject] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const {
    data: payroll,
    isLoading,
    error,
  } = useQuery<Payroll>({
    queryKey: ['hr', 'payroll', payrollId],
    queryFn: () => apiClient.getPayrollById(payrollId),
    enabled: Boolean(payrollId),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['hr'] })

  const notify = (title: string, message: string) =>
    addToast({ type: 'success', title, message })

  const onError = (err: any) =>
    addToast({ type: 'error', title: 'Action failed', message: err.message || 'Request failed' })

  const submitMutation = useMutation({
    mutationFn: () => apiClient.submitPayroll(payrollId),
    onSuccess: () => {
      invalidate()
      notify('Submitted', 'The batch is now awaiting approval.')
    },
    onError,
  })

  const approveMutation = useMutation({
    mutationFn: () => apiClient.approvePayroll(payrollId),
    onSuccess: () => {
      invalidate()
      notify('Approved', 'The batch is approved. You can now generate payslips.')
    },
    onError,
  })

  const rejectMutation = useMutation({
    mutationFn: () => apiClient.rejectPayroll(payrollId, rejectReason),
    onSuccess: () => {
      invalidate()
      notify('Rejected', 'The batch was cancelled.')
      setShowReject(false)
      setRejectReason('')
    },
    onError,
  })

  const payslipMutation = useMutation({
    mutationFn: () => apiClient.generatePayslips(payrollId),
    onSuccess: (result) => {
      invalidate()
      notify(
        'Payslips generated',
        result.generated > 0
          ? `${result.generated} payslip(s) issued.`
          : 'Every line already had a payslip.'
      )
    },
    onError,
  })

  const paidMutation = useMutation({
    mutationFn: () => apiClient.markPayrollPaid(payrollId),
    onSuccess: () => {
      invalidate()
      notify('Marked as paid', 'The batch is closed.')
    },
    onError,
  })

  const adjustMutation = useMutation({
    mutationFn: (payload: PayrollLineAdjustment) =>
      apiClient.updatePayrollLine(editingLine!.id, payload),
    onSuccess: () => {
      invalidate()
      notify('Line updated', 'Batch totals were recalculated.')
      setEditingLine(null)
    },
    onError,
  })

  const openAdjust = (line: PayrollLine) => {
    setEditingLine(line)
    setAdjustForm({
      bonus: line.bonus,
      overtime: line.overtime,
      loan_repayment: line.loan_repayment,
      other_deductions: line.other_deductions,
      days_worked: String(line.days_worked),
      days_absent: String(line.days_absent),
      late_days: String(line.late_days),
      notes: line.notes ?? '',
    })
  }

  const saveAdjust = () => {
    const payload: PayrollLineAdjustment = { notes: adjustForm.notes }
    ADJUSTABLE_FIELDS.forEach((field) => {
      const raw = adjustForm[field.key]
      const value = raw === '' ? 0 : Number(raw)
      ;(payload as any)[field.key] = field.kind === 'int' ? Math.round(value) : value
    })
    adjustMutation.mutate(payload)
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-24 text-gray-500">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading payroll batch...
        </div>
      </AppLayout>
    )
  }

  if (error || !payroll) {
    return (
      <AppLayout>
        <div className="p-6 py-16 text-center">
          <ShieldAlert className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-900 font-medium">Payroll batch not found</p>
          <p className="text-sm text-gray-500 mb-4">
            {(error as any)?.message || 'This batch is unavailable.'}
          </p>
          <Button onClick={() => router.push('/hr/payroll')}>Back to payroll</Button>
        </div>
      </AppLayout>
    )
  }

  const lines = payroll.payroll_lines ?? []
  const filteredLines = search
    ? lines.filter((line) =>
        [line.employee_name, line.employee_number, line.employee_position, line.department]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search.toLowerCase()))
      )
    : lines

  const isEditable = payroll.is_editable ?? ['draft', 'pending_approval'].includes(payroll.status)
  const anyMissingPayslip = lines.some((line) => !line.has_payslip)

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/hr/payroll"
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  {MONTH_NAMES[payroll.month - 1]} {payroll.year}
                </h1>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    STATUS_BADGES[payroll.status] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {payroll.status_display}
                </span>
              </div>
              <p className="text-gray-600">
                {payroll.payroll_number} &middot; {formatDate(payroll.period_start)} -{' '}
                {formatDate(payroll.period_end)}
              </p>
            </div>
          </div>

          {/* Actions follow the batch lifecycle, so only the legal next steps
              are ever offered. */}
          <div className="flex flex-wrap items-center gap-2">
            {payroll.status === 'draft' && (
              <>
                <Button variant="outline" onClick={() => setShowReject(true)}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Batch
                </Button>
                <Button variant="outline" loading={submitMutation.isPending} onClick={() => submitMutation.mutate()}>
                  <Send className="h-4 w-4 mr-2" />
                  Submit for Approval
                </Button>
                <Button loading={approveMutation.isPending} onClick={() => approveMutation.mutate()}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </>
            )}

            {payroll.status === 'pending_approval' && (
              <>
                <Button variant="outline" onClick={() => setShowReject(true)}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button loading={approveMutation.isPending} onClick={() => approveMutation.mutate()}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </>
            )}

            {payroll.status === 'approved' && (
              <>
                {anyMissingPayslip && (
                  <Button
                    variant="outline"
                    loading={payslipMutation.isPending}
                    onClick={() => payslipMutation.mutate()}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Payslips
                  </Button>
                )}
                <Button loading={paidMutation.isPending} onClick={() => paidMutation.mutate()}>
                  <Banknote className="h-4 w-4 mr-2" />
                  Mark as Paid
                </Button>
              </>
            )}

            {payroll.status === 'paid' && anyMissingPayslip && (
              <Button
                variant="outline"
                loading={payslipMutation.isPending}
                onClick={() => payslipMutation.mutate()}
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Payslips
              </Button>
            )}
          </div>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Employees</p>
                <p className="text-2xl font-bold text-gray-900">{payroll.employee_count}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Total Gross</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(Number(payroll.total_gross))}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Total Deductions</p>
              <p className="text-2xl font-bold text-red-700">
                {formatCurrency(Number(payroll.total_deductions))}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm text-gray-600">Total Net</p>
                <p className="text-2xl font-bold text-green-700 truncate">
                  {formatCurrency(Number(payroll.total_net))}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600 flex-shrink-0" />
            </CardContent>
          </Card>
        </div>

        {/* Approval trail */}
        {(payroll.approved_at || payroll.paid_at || payroll.notes) && (
          <Card>
            <CardContent className="p-4 space-y-2 text-sm">
              {payroll.approved_at && (
                <p className="text-gray-700">
                  <span className="text-gray-500">Approved by</span>{' '}
                  <span className="font-medium">{payroll.approved_by_name || 'Unknown'}</span>{' '}
                  <span className="text-gray-500">on {formatDateTime(payroll.approved_at)}</span>
                </p>
              )}
              {payroll.paid_at && (
                <p className="text-gray-700">
                  <span className="text-gray-500">Marked paid by</span>{' '}
                  <span className="font-medium">{payroll.paid_by_name || 'Unknown'}</span>{' '}
                  <span className="text-gray-500">on {formatDateTime(payroll.paid_at)}</span>
                </p>
              )}
              {payroll.notes && (
                <p className="text-gray-700 whitespace-pre-line">
                  <span className="text-gray-500">Notes:</span> {payroll.notes}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {!isEditable && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-600">
            <Lock className="h-4 w-4 flex-shrink-0" />
            This batch is {payroll.status_display.toLowerCase()}, so its lines can no longer be
            adjusted.
          </div>
        )}

        {/* Lines */}
        <Card>
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">
                Employee Lines ({filteredLines.length})
              </h2>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter by employee..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green"
                />
              </div>
            </div>

            {filteredLines.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                {lines.length === 0
                  ? 'This batch has no employee lines.'
                  : 'No employees match your filter.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Basic</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Bonus</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gross</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">PAYE</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pension</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Deductions</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredLines.map((line) => (
                      <tr key={line.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <Link href={`/hr/employees/${line.employee}`} className="block">
                            <p className="font-medium text-gray-900 hover:text-mofad-green">
                              {line.employee_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {line.employee_number}
                              {line.department ? ` · ${line.department}` : ''}
                            </p>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-700">
                          {formatCurrency(Number(line.basic_salary))}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-700">
                          {Number(line.bonus) > 0 ? formatCurrency(Number(line.bonus)) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                          {formatCurrency(Number(line.gross_pay))}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-700">
                          {formatCurrency(Number(line.paye_tax))}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-700">
                          {formatCurrency(Number(line.pension))}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-red-700">
                          {formatCurrency(Number(line.total_deductions))}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-green-700">
                          {formatCurrency(Number(line.net_pay))}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {line.has_payslip && (
                              <span
                                className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800"
                                title="Payslip issued"
                              >
                                Slip
                              </span>
                            )}
                            {isEditable && (
                              <button
                                onClick={() => openAdjust(line)}
                                className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-mofad-green hover:bg-gray-100 rounded"
                              >
                                Adjust
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">Totals</td>
                      <td colSpan={2} />
                      <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                        {formatCurrency(
                          filteredLines.reduce((sum, l) => sum + Number(l.gross_pay), 0)
                        )}
                      </td>
                      <td colSpan={2} />
                      <td className="px-4 py-3 text-sm text-right font-semibold text-red-700">
                        {formatCurrency(
                          filteredLines.reduce((sum, l) => sum + Number(l.total_deductions), 0)
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-green-700">
                        {formatCurrency(
                          filteredLines.reduce((sum, l) => sum + Number(l.net_pay), 0)
                        )}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Adjust line */}
      {editingLine && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Adjust Payroll Line</h2>
                <p className="text-sm text-gray-500">
                  {editingLine.employee_name} ({editingLine.employee_number})
                </p>
              </div>
              <button
                onClick={() => setEditingLine(null)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <p className="text-sm text-gray-600">
                Earnings and statutory deductions come from the compensation template and are not
                editable here. Gross, deductions and net are recalculated when you save.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {ADJUSTABLE_FIELDS.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step={field.kind === 'int' ? '1' : '0.01'}
                      value={adjustForm[field.key] ?? ''}
                      onChange={(e) =>
                        setAdjustForm((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Line Notes</label>
                <textarea
                  value={adjustForm.notes ?? ''}
                  onChange={(e) => setAdjustForm((prev) => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <Button variant="outline" onClick={() => setEditingLine(null)}>
                Cancel
              </Button>
              <Button onClick={saveAdjust} loading={adjustMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                Save Adjustment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject */}
      {showReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {payroll.status === 'draft' ? 'Cancel Batch' : 'Reject Payroll'}
              </h2>
              <p className="text-sm text-gray-600">
                This cancels {payroll.payroll_number}. The reason is appended to the batch notes.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason<span className="text-red-500 ml-0.5">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green"
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowReject(false)
                  setRejectReason('')
                }}
              >
                Back
              </Button>
              <Button
                variant="destructive"
                disabled={!rejectReason.trim()}
                loading={rejectMutation.isPending}
                onClick={() => rejectMutation.mutate()}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
