'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  Users,
  UserCheck,
  Briefcase,
  Calculator,
  DollarSign,
  FileText,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Clock,
  CheckCircle,
} from 'lucide-react'

import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/Card'
import apiClient, { MONTH_NAMES } from '@/lib/apiClient'
import type { EmployeeStats, PayrollStats } from '@/lib/apiClient'
import { formatCurrency } from '@/lib/utils'

const MODULES = [
  {
    title: 'Employees',
    description: 'Employee records, positions, reporting lines and bank details',
    href: '/hr/employees',
    icon: Users,
    accent: 'from-blue-500 to-blue-600',
  },
  {
    title: 'Compensation',
    description: 'Salary structures, allowances and statutory deduction rates',
    href: '/hr/compensation',
    icon: Briefcase,
    accent: 'from-purple-500 to-purple-600',
  },
  {
    title: 'Payroll',
    description: 'Run monthly payroll, approve batches and issue payslips',
    href: '/hr/payroll',
    icon: Calculator,
    accent: 'from-green-500 to-green-600',
  },
]

interface MetricProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  accent: string
}

const Metric = ({ title, value, subtitle, icon: Icon, accent }: MetricProps) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1 min-w-0">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 truncate">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${accent} text-white flex-shrink-0`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </CardContent>
  </Card>
)

export default function HRDashboardPage() {
  const { data: employeeStats, isLoading: loadingEmployees } = useQuery<EmployeeStats>({
    queryKey: ['hr', 'employee-stats'],
    queryFn: () => apiClient.getEmployeeStats(),
  })

  const { data: payrollStats, isLoading: loadingPayroll } = useQuery<PayrollStats>({
    queryKey: ['hr', 'payroll-stats'],
    queryFn: () => apiClient.getPayrollStats(),
  })

  const isLoading = loadingEmployees || loadingPayroll
  const latest = payrollStats?.latest_payroll
  const awaitingAction = (payrollStats?.draft ?? 0) + (payrollStats?.pending_approval ?? 0)

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Human Resources</h1>
          <p className="text-gray-600">
            Manage employee records, salary structures and monthly payroll.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-500">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading HR summary...
          </div>
        ) : (
          <>
            {/* Headcount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Metric
                title="Total Employees"
                value={employeeStats?.total_employees ?? 0}
                icon={Users}
                accent="from-blue-500 to-blue-600"
              />
              <Metric
                title="Active"
                value={employeeStats?.active ?? 0}
                subtitle={`${employeeStats?.on_leave ?? 0} on leave`}
                icon={UserCheck}
                accent="from-green-500 to-green-600"
              />
              <Metric
                title="Payroll Batches"
                value={payrollStats?.total_payrolls ?? 0}
                subtitle={`${payrollStats?.paid ?? 0} paid`}
                icon={Calculator}
                accent="from-emerald-500 to-emerald-600"
              />
              <Metric
                title="Total Net Paid"
                value={formatCurrency(Number(payrollStats?.total_net ?? 0))}
                subtitle="Across all batches"
                icon={DollarSign}
                accent="from-amber-500 to-amber-600"
              />
            </div>

            {/* Things needing attention. Rendered only when there is something
                to act on, so a healthy month shows a clean dashboard. */}
            {(awaitingAction > 0 || (employeeStats?.without_compensation ?? 0) > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {awaitingAction > 0 && (
                  <Link href="/hr/payroll" className="block">
                    <Card className="border-amber-200 bg-amber-50 hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex items-start gap-3">
                        <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-900">
                            {awaitingAction} payroll {awaitingAction === 1 ? 'batch' : 'batches'} awaiting action
                          </p>
                          <p className="text-sm text-amber-700">
                            {payrollStats?.draft ?? 0} draft, {payrollStats?.pending_approval ?? 0} pending approval
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )}

                {(employeeStats?.without_compensation ?? 0) > 0 && (
                  <Link href="/hr/compensation" className="block">
                    <Card className="border-red-200 bg-red-50 hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-900">
                            {employeeStats?.without_compensation} active{' '}
                            {employeeStats?.without_compensation === 1 ? 'employee has' : 'employees have'} no
                            compensation
                          </p>
                          <p className="text-sm text-red-700">
                            They will be skipped when payroll is run. Add a salary structure for them.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )}
              </div>
            )}

            {/* Latest batch */}
            {latest && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Latest Payroll</h2>
                      <p className="text-sm text-gray-500">
                        {MONTH_NAMES[latest.month - 1]} {latest.year} &middot; {latest.payroll_number}
                      </p>
                    </div>
                    <Link
                      href={`/hr/payroll/${latest.id}`}
                      className="inline-flex items-center text-sm font-medium text-mofad-green hover:underline"
                    >
                      View batch <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Employees</p>
                      <p className="text-lg font-semibold text-gray-900">{latest.employee_count}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Gross</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(Number(latest.total_gross))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Deductions</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(Number(latest.total_deductions))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Net</p>
                      <p className="text-lg font-semibold text-green-700">
                        {formatCurrency(Number(latest.total_net))}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Module launcher */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MODULES.map((module) => {
              const Icon = module.icon
              return (
                <Link key={module.href} href={module.href} className="block group">
                  <Card className="h-full hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-6">
                      <div
                        className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${module.accent} text-white mb-4 group-hover:scale-105 transition-transform`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{module.title}</h3>
                      <p className="text-sm text-gray-600">{module.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Payroll pipeline */}
        {!isLoading && payrollStats && payrollStats.total_payrolls > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payroll Pipeline</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: 'Draft', value: payrollStats.draft, icon: FileText, color: 'text-gray-600' },
                  { label: 'Pending', value: payrollStats.pending_approval, icon: Clock, color: 'text-amber-600' },
                  { label: 'Approved', value: payrollStats.approved, icon: CheckCircle, color: 'text-blue-600' },
                  { label: 'Paid', value: payrollStats.paid, icon: DollarSign, color: 'text-green-600' },
                  { label: 'Cancelled', value: payrollStats.cancelled, icon: AlertTriangle, color: 'text-red-600' },
                ].map((stage) => {
                  const Icon = stage.icon
                  return (
                    <div key={stage.label} className="text-center p-3 rounded-lg bg-gray-50">
                      <Icon className={`h-5 w-5 mx-auto mb-1 ${stage.color}`} />
                      <p className="text-xl font-bold text-gray-900">{stage.value}</p>
                      <p className="text-xs text-gray-500">{stage.label}</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
