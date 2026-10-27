'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Calculator, AlertTriangle, Users, Loader2, Info } from 'lucide-react'

import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import apiClient, { MONTH_NAMES } from '@/lib/apiClient'
import type { EmployeeStats } from '@/lib/apiClient'
import { formatCurrency } from '@/lib/utils'

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green'

/** Last calendar day of the given month, as YYYY-MM-DD. */
const monthEnd = (year: number, month: number) => {
  const last = new Date(year, month, 0).getDate()
  return `${year}-${String(month).padStart(2, '0')}-${String(last).padStart(2, '0')}`
}

const monthStart = (year: number, month: number) =>
  `${year}-${String(month).padStart(2, '0')}-01`

export default function CreatePayrollPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  // Default to the month just gone, which is what is normally being paid.
  const now = new Date()
  const defaultDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const [month, setMonth] = useState(defaultDate.getMonth() + 1)
  const [year, setYear] = useState(defaultDate.getFullYear())
  const [useCustomPeriod, setUseCustomPeriod] = useState(false)
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const { data: employeeStats } = useQuery<EmployeeStats>({
    queryKey: ['hr', 'employee-stats'],
    queryFn: () => apiClient.getEmployeeStats(),
  })

  // Existing batches, so a duplicate month is caught before submitting.
  const { data: existing } = useQuery({
    queryKey: ['hr', 'payrolls', 'existing', year],
    queryFn: () => apiClient.getPayrolls({ year, size: 100 }),
  })
  const takenMonths = useMemo(
    () => new Set((existing?.results ?? []).map((p) => p.month)),
    [existing]
  )
  const alreadyExists = takenMonths.has(month)

  const eligible = (employeeStats?.active ?? 0) - (employeeStats?.without_compensation ?? 0)

  const createMutation = useMutation({
    mutationFn: () =>
      apiClient.createPayroll({
        month,
        year,
        ...(useCustomPeriod && periodStart ? { period_start: periodStart } : {}),
        ...(useCustomPeriod && periodEnd ? { period_end: periodEnd } : {}),
        ...(notes ? { notes } : {}),
      }),
    onSuccess: (payroll) => {
      queryClient.invalidateQueries({ queryKey: ['hr'] })
      const skipped = payroll.skipped_employees ?? []
      addToast({
        type: skipped.length > 0 ? 'warning' : 'success',
        title: `${payroll.payroll_number} created`,
        message:
          skipped.length > 0
            ? `${payroll.employee_count} employees included. ${skipped.length} skipped for want of a compensation template: ${skipped.join(', ')}`
            : `${payroll.employee_count} employees included, net ${formatCurrency(Number(payroll.total_net))}.`,
        duration: skipped.length > 0 ? 12000 : 5000,
      })
      router.push(`/hr/payroll/${payroll.id}`)
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to create payroll batch')
      addToast({
        type: 'error',
        title: 'Could not run payroll',
        message: err.message || 'Failed to create payroll batch',
      })
    },
  })

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (alreadyExists) {
      setError(`A payroll for ${MONTH_NAMES[month - 1]} ${year} already exists.`)
      return
    }
    if (useCustomPeriod) {
      if (!periodStart || !periodEnd) {
        setError('Both period dates are required when using a custom period.')
        return
      }
      if (periodEnd < periodStart) {
        setError('Period end cannot be earlier than period start.')
        return
      }
    }
    createMutation.mutate()
  }

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 7 }, (_, i) => currentYear - 4 + i)

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/hr/payroll"
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Run Payroll</h1>
            <p className="text-gray-600">
              Generate a draft batch for every active employee with compensation on file
            </p>
          </div>
        </div>

        {/* What will happen */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-medium text-gray-900">What this does</p>
                <p>
                  A line is created for each active employee, with earnings taken from their active
                  compensation template and PAYE, pension and NHF computed automatically. The batch
                  starts as a <strong>draft</strong>, so you can adjust bonuses, overtime and
                  attendance before approving it.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Eligibility */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Employees</p>
                <p className="text-2xl font-bold text-gray-900">{employeeStats?.active ?? 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Will Be Paid</p>
                <p className="text-2xl font-bold text-green-700">{Math.max(eligible, 0)}</p>
              </div>
              <Calculator className="h-8 w-8 text-green-600" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Will Be Skipped</p>
                <p className="text-2xl font-bold text-amber-700">
                  {employeeStats?.without_compensation ?? 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </CardContent>
          </Card>
        </div>

        {(employeeStats?.without_compensation ?? 0) > 0 && (
          <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-amber-900">
                {employeeStats?.without_compensation} active{' '}
                {employeeStats?.without_compensation === 1 ? 'employee has' : 'employees have'} no
                compensation template
              </p>
              <p className="text-sm text-amber-700">
                They will be left out of this run. Their employee numbers are listed once the batch
                is created.
              </p>
            </div>
            <Link
              href="/hr/compensation"
              className="text-sm font-medium text-amber-900 underline whitespace-nowrap"
            >
              Fix now
            </Link>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="p-6 space-y-5">
              <h2 className="font-semibold text-gray-900">Payroll Period</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Month<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <select
                    value={month}
                    onChange={(e) => {
                      setMonth(Number(e.target.value))
                      setError('')
                    }}
                    className={inputClass}
                  >
                    {MONTH_NAMES.map((name, index) => (
                      <option key={name} value={index + 1}>
                        {name}
                        {takenMonths.has(index + 1) ? ' (already run)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <select
                    value={year}
                    onChange={(e) => {
                      setYear(Number(e.target.value))
                      setError('')
                    }}
                    className={inputClass}
                  >
                    {yearOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={useCustomPeriod}
                    onChange={(e) => {
                      const checked = e.target.checked
                      setUseCustomPeriod(checked)
                      // Seed the custom dates with the calendar month so the
                      // inputs are never blank when first revealed.
                      if (checked) {
                        setPeriodStart(monthStart(year, month))
                        setPeriodEnd(monthEnd(year, month))
                      }
                    }}
                    className="rounded border-gray-300 text-mofad-green focus:ring-mofad-green"
                  />
                  Use a custom period instead of the full calendar month
                </label>

                {useCustomPeriod ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Period Start
                      </label>
                      <input
                        type="date"
                        value={periodStart}
                        onChange={(e) => setPeriodStart(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Period End
                      </label>
                      <input
                        type="date"
                        value={periodEnd}
                        onChange={(e) => setPeriodEnd(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Period will be {monthStart(year, month)} to {monthEnd(year, month)}.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Optional context for this batch"
                  className={inputClass}
                />
              </div>

              {(error || alreadyExists) && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  {error || `A payroll for ${MONTH_NAMES[month - 1]} ${year} already exists.`}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => router.push('/hr/payroll')}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={alreadyExists || eligible <= 0}
                  loading={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Calculator className="h-4 w-4 mr-2" />
                  )}
                  Generate Payroll
                </Button>
              </div>

              {eligible <= 0 && (
                <p className="text-sm text-right text-gray-500">
                  No employees are eligible - add compensation templates first.
                </p>
              )}
            </CardContent>
          </Card>
        </form>
      </div>
    </AppLayout>
  )
}
