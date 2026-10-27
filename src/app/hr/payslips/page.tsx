'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { FileText, Search, Loader2, X, Printer } from 'lucide-react'

import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Pagination } from '@/components/ui/Pagination'
import apiClient, { MONTH_NAMES } from '@/lib/apiClient'
import type { Payslip, PayslipBreakdown } from '@/lib/apiClient'
import { formatCurrency, formatDateTime } from '@/lib/utils'

export default function PayslipsPage() {
  const [search, setSearch] = useState('')
  const [yearFilter, setYearFilter] = useState('all')
  const [monthFilter, setMonthFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 15

  const [openSlip, setOpenSlip] = useState<Payslip | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['hr', 'payslips', currentPage, search, yearFilter, monthFilter],
    queryFn: () =>
      apiClient.getPayslips({
        page: currentPage,
        size: pageSize,
        ...(search ? { search } : {}),
        ...(yearFilter !== 'all' ? { payroll_line__payroll__year: Number(yearFilter) } : {}),
        ...(monthFilter !== 'all' ? { payroll_line__payroll__month: Number(monthFilter) } : {}),
      }),
  })

  const { data: breakdown, isLoading: loadingBreakdown } = useQuery<PayslipBreakdown>({
    queryKey: ['hr', 'payslip-breakdown', openSlip?.id],
    queryFn: () => apiClient.getPayslipBreakdown(openSlip!.id),
    enabled: Boolean(openSlip),
  })

  const payslips = data?.results ?? []
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payslips</h1>
          <p className="text-gray-600">Issued payslips across all payroll batches</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by payslip number or employee..."
                  value={search}
                  onChange={(e) => applyFilter(setSearch)(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green"
                />
              </div>
              <select
                value={monthFilter}
                onChange={(e) => applyFilter(setMonthFilter)(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green"
              >
                <option value="all">All months</option>
                {MONTH_NAMES.map((name, index) => (
                  <option key={name} value={index + 1}>
                    {name}
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
                Loading payslips...
              </div>
            ) : payslips.length === 0 ? (
              <div className="py-16 text-center">
                <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No payslips issued</p>
                <p className="text-sm text-gray-500">
                  Payslips are generated from an approved payroll batch.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payslip</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gross</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Deductions</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payslips.map((slip) => (
                      <tr key={slip.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{slip.payslip_number}</p>
                          <p className="text-xs text-gray-500">{formatDateTime(slip.generated_at)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/hr/employees/${slip.employee}`}
                            className="text-sm text-gray-900 hover:text-mofad-green font-medium"
                          >
                            {slip.employee_name}
                          </Link>
                          <p className="text-xs text-gray-500">{slip.employee_number}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {MONTH_NAMES[slip.month - 1]} {slip.year}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-700">
                          {formatCurrency(Number(slip.gross_pay))}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-red-700">
                          {formatCurrency(Number(slip.total_deductions))}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-green-700">
                          {formatCurrency(Number(slip.net_pay))}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setOpenSlip(slip)}
                            className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-mofad-green hover:bg-gray-100 rounded"
                          >
                            View
                          </button>
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

      {/* Payslip view */}
      {openSlip && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto print:bg-white print:p-0">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-8 print:shadow-none print:my-0 print:max-w-none">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 print:hidden">
              <h2 className="text-lg font-semibold text-gray-900">Payslip</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <button
                  onClick={() => setOpenSlip(null)}
                  className="p-1 text-gray-400 hover:text-gray-700 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {loadingBreakdown || !breakdown ? (
              <div className="flex items-center justify-center py-16 text-gray-500">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading payslip...
              </div>
            ) : (
              <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-gray-200">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{breakdown.employee.name}</p>
                    <p className="text-sm text-gray-600">
                      {breakdown.employee.employee_number} &middot; {breakdown.employee.position}
                    </p>
                    {breakdown.employee.department && (
                      <p className="text-sm text-gray-500">{breakdown.employee.department}</p>
                    )}
                  </div>
                  <div className="sm:text-right">
                    <p className="text-sm font-medium text-gray-900">{breakdown.payslip_number}</p>
                    <p className="text-sm text-gray-600">
                      {MONTH_NAMES[breakdown.period.month - 1]} {breakdown.period.year}
                    </p>
                    <p className="text-xs text-gray-500">
                      Issued {formatDateTime(breakdown.generated_at)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 pb-1 border-b border-gray-200">
                      Earnings
                    </h3>
                    <div className="space-y-1">
                      {breakdown.earnings.map((row) => (
                        <div key={row.label} className="flex justify-between text-sm">
                          <span className="text-gray-600">{row.label}</span>
                          <span className="text-gray-900">
                            {formatCurrency(Number(row.amount))}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm font-semibold pt-2 mt-2 border-t border-gray-200">
                        <span className="text-gray-900">Gross Pay</span>
                        <span className="text-gray-900">
                          {formatCurrency(Number(breakdown.gross_pay))}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 pb-1 border-b border-gray-200">
                      Deductions
                    </h3>
                    <div className="space-y-1">
                      {breakdown.deductions.length === 0 ? (
                        <p className="text-sm text-gray-500">No deductions</p>
                      ) : (
                        breakdown.deductions.map((row) => (
                          <div key={row.label} className="flex justify-between text-sm">
                            <span className="text-gray-600">{row.label}</span>
                            <span className="text-gray-900">
                              {formatCurrency(Number(row.amount))}
                            </span>
                          </div>
                        ))
                      )}
                      <div className="flex justify-between text-sm font-semibold pt-2 mt-2 border-t border-gray-200">
                        <span className="text-gray-900">Total Deductions</span>
                        <span className="text-red-700">
                          {formatCurrency(Number(breakdown.total_deductions))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 border border-green-200">
                  <span className="font-semibold text-green-900">Net Pay</span>
                  <span className="text-xl font-bold text-green-800">
                    {formatCurrency(Number(breakdown.net_pay))}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Days Worked</p>
                    <p className="text-gray-900">{breakdown.attendance.days_worked}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Days Absent</p>
                    <p className="text-gray-900">{breakdown.attendance.days_absent}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Bank</p>
                    <p className="text-gray-900">{breakdown.employee.bank_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Account</p>
                    <p className="text-gray-900">
                      {breakdown.employee.bank_account_number || '-'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  )
}
