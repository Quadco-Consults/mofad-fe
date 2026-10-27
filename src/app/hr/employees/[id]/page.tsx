'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  Building2,
  Calendar,
  CreditCard,
  UserMinus,
  Save,
  X,
  Briefcase,
  Users,
  ShieldAlert,
} from 'lucide-react'

import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import apiClient, {
  EMPLOYMENT_STATUS_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  MONTH_NAMES,
} from '@/lib/apiClient'
import type { Employee } from '@/lib/apiClient'
import { formatCurrency, formatDate } from '@/lib/utils'

const STATUS_BADGES: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  on_leave: 'bg-amber-100 text-amber-800',
  suspended: 'bg-orange-100 text-orange-800',
  terminated: 'bg-red-100 text-red-800',
  resigned: 'bg-gray-100 text-gray-800',
}

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green'

const DetailRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ComponentType<{ className?: string }>
  label: string
  value: React.ReactNode
}) => (
  <div className="flex items-start gap-3 py-2">
    {Icon && <Icon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />}
    <div className="min-w-0">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-900 break-words">{value || '-'}</p>
    </div>
  </div>
)

type Tab = 'profile' | 'compensation' | 'payroll'

export default function EmployeeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const employeeId = params?.id as string

  const [tab, setTab] = useState<Tab>('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Record<string, any>>({})
  const [showTerminate, setShowTerminate] = useState(false)
  const [terminateForm, setTerminateForm] = useState({
    termination_date: '',
    employment_status: 'terminated' as 'terminated' | 'resigned',
    notes: '',
  })

  const {
    data: employee,
    isLoading,
    error,
  } = useQuery<Employee>({
    queryKey: ['hr', 'employee', employeeId],
    queryFn: () => apiClient.getEmployeeById(employeeId),
    enabled: Boolean(employeeId),
  })

  const { data: compensationHistory = [] } = useQuery({
    queryKey: ['hr', 'employee', employeeId, 'compensation'],
    queryFn: () => apiClient.getEmployeeCompensation(employeeId),
    enabled: Boolean(employeeId) && tab === 'compensation',
  })

  const { data: payrollHistory = [] } = useQuery({
    queryKey: ['hr', 'employee', employeeId, 'payroll-history'],
    queryFn: () => apiClient.getEmployeePayrollHistory(employeeId),
    enabled: Boolean(employeeId) && tab === 'payroll',
  })

  const updateMutation = useMutation({
    mutationFn: (payload: Record<string, any>) => apiClient.updateEmployee(employeeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr'] })
      addToast({ type: 'success', title: 'Saved', message: 'Employee updated.' })
      setIsEditing(false)
    },
    onError: (err: any) =>
      addToast({ type: 'error', title: 'Error', message: err.message || 'Failed to update employee' }),
  })

  const terminateMutation = useMutation({
    mutationFn: () => apiClient.terminateEmployee(employeeId, terminateForm),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['hr'] })
      addToast({
        type: 'success',
        title: 'Employment ended',
        message: `${updated.user_name || 'Employee'} is now ${updated.employment_status_display.toLowerCase()}.`,
      })
      setShowTerminate(false)
    },
    onError: (err: any) =>
      addToast({ type: 'error', title: 'Error', message: err.message || 'Failed to end employment' }),
  })

  const startEditing = () => {
    if (!employee) return
    setEditForm({
      position: employee.position,
      employment_type: employee.employment_type,
      employment_status: employee.employment_status,
      hire_date: employee.hire_date,
      confirmation_date: employee.confirmation_date ?? '',
      personal_email: employee.personal_email ?? '',
      emergency_contact_name: employee.emergency_contact_name ?? '',
      emergency_contact_phone: employee.emergency_contact_phone ?? '',
      emergency_contact_relationship: employee.emergency_contact_relationship ?? '',
      address: employee.address ?? '',
      city: employee.city ?? '',
      state: employee.state ?? '',
      bank_name: employee.bank_name ?? '',
      bank_account_number: employee.bank_account_number ?? '',
      bank_account_name: employee.bank_account_name ?? '',
      notes: employee.notes ?? '',
    })
    setIsEditing(true)
  }

  const saveEdits = () => {
    // An empty date input must go back as null, not "", or the API rejects it.
    const payload = { ...editForm }
    if (!payload.confirmation_date) payload.confirmation_date = null
    updateMutation.mutate(payload)
  }

  const setField = (key: string) => (value: string) =>
    setEditForm((prev) => ({ ...prev, [key]: value }))

  const hasExited =
    employee?.employment_status === 'terminated' || employee?.employment_status === 'resigned'

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-24 text-gray-500">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading employee...
        </div>
      </AppLayout>
    )
  }

  if (error || !employee) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="py-16 text-center">
            <ShieldAlert className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-900 font-medium">Employee not found</p>
            <p className="text-sm text-gray-500 mb-4">
              {(error as any)?.message || 'This employee record is unavailable.'}
            </p>
            <Button onClick={() => router.push('/hr/employees')}>Back to employees</Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/hr/employees"
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{employee.user_name}</h1>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    STATUS_BADGES[employee.employment_status] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {employee.employment_status_display}
                </span>
              </div>
              <p className="text-gray-600">
                {employee.employee_number} &middot; {employee.position}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <Button variant="outline" onClick={startEditing}>
                Edit
              </Button>
            )}
            {!hasExited && !isEditing && (
              <Button variant="outline" onClick={() => setShowTerminate(true)}>
                <UserMinus className="h-4 w-4 mr-2" />
                End Employment
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-6">
            {([
              { id: 'profile', label: 'Profile' },
              { id: 'compensation', label: 'Compensation' },
              { id: 'payroll', label: 'Payroll History' },
            ] as { id: Tab; label: string }[]).map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                  tab === item.id
                    ? 'border-mofad-green text-mofad-green'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Profile */}
        {tab === 'profile' &&
          (isEditing ? (
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="font-semibold text-gray-900">Edit Employee</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                    <input
                      type="text"
                      value={editForm.position}
                      onChange={(e) => setField('position')(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employment Type
                    </label>
                    <select
                      value={editForm.employment_type}
                      onChange={(e) => setField('employment_type')(e.target.value)}
                      className={inputClass}
                    >
                      {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employment Status
                    </label>
                    <select
                      value={editForm.employment_status}
                      onChange={(e) => setField('employment_status')(e.target.value)}
                      className={inputClass}
                    >
                      {EMPLOYMENT_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
                    <input
                      type="date"
                      value={editForm.hire_date}
                      onChange={(e) => setField('hire_date')(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmation Date
                    </label>
                    <input
                      type="date"
                      value={editForm.confirmation_date}
                      onChange={(e) => setField('confirmation_date')(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Personal Email
                    </label>
                    <input
                      type="email"
                      value={editForm.personal_email}
                      onChange={(e) => setField('personal_email')(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) => setField('address')(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setField('city')(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={editForm.state}
                      onChange={(e) => setField('state')(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact
                    </label>
                    <input
                      type="text"
                      value={editForm.emergency_contact_name}
                      onChange={(e) => setField('emergency_contact_name')(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Phone
                    </label>
                    <input
                      type="tel"
                      value={editForm.emergency_contact_phone}
                      onChange={(e) => setField('emergency_contact_phone')(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Relationship
                    </label>
                    <input
                      type="text"
                      value={editForm.emergency_contact_relationship}
                      onChange={(e) => setField('emergency_contact_relationship')(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={editForm.bank_name}
                      onChange={(e) => setField('bank_name')(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={editForm.bank_account_number}
                      onChange={(e) => setField('bank_account_number')(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Name
                    </label>
                    <input
                      type="text"
                      value={editForm.bank_account_name}
                      onChange={(e) => setField('bank_account_name')(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">HR Notes</label>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setField('notes')(e.target.value)}
                    rows={3}
                    className={inputClass}
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={saveEdits} loading={updateMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-semibold text-gray-900 mb-3">Contact</h2>
                  <div className="divide-y divide-gray-100">
                    <DetailRow icon={Mail} label="Work Email" value={employee.user_email} />
                    <DetailRow icon={Mail} label="Personal Email" value={employee.personal_email} />
                    <DetailRow icon={Phone} label="Phone" value={employee.user_phone} />
                    <DetailRow
                      icon={Building2}
                      label="Address"
                      value={[employee.address, employee.city, employee.state]
                        .filter(Boolean)
                        .join(', ')}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="font-semibold text-gray-900 mb-3">Employment</h2>
                  <div className="divide-y divide-gray-100">
                    <DetailRow icon={Building2} label="Department" value={employee.department} />
                    <DetailRow
                      icon={Briefcase}
                      label="Employment Type"
                      value={employee.employment_type_display}
                    />
                    <DetailRow
                      icon={Calendar}
                      label="Hire Date"
                      value={formatDate(employee.hire_date)}
                    />
                    <DetailRow
                      icon={Calendar}
                      label="Confirmed"
                      value={employee.confirmation_date ? formatDate(employee.confirmation_date) : 'Not confirmed'}
                    />
                    {employee.termination_date && (
                      <DetailRow
                        icon={Calendar}
                        label="Exit Date"
                        value={formatDate(employee.termination_date)}
                      />
                    )}
                    <DetailRow icon={Users} label="Reports To" value={employee.manager_name} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="font-semibold text-gray-900 mb-3">Pay &amp; Emergency</h2>
                  <div className="divide-y divide-gray-100">
                    <DetailRow
                      icon={CreditCard}
                      label="Current Gross (Monthly)"
                      value={
                        employee.current_compensation
                          ? formatCurrency(Number(employee.current_compensation.gross_monthly_salary))
                          : 'No compensation on file'
                      }
                    />
                    <DetailRow icon={CreditCard} label="Bank" value={employee.bank_name} />
                    <DetailRow
                      icon={CreditCard}
                      label="Account"
                      value={
                        employee.bank_account_number
                          ? `${employee.bank_account_number}${
                              employee.bank_account_name ? ` (${employee.bank_account_name})` : ''
                            }`
                          : null
                      }
                    />
                    <DetailRow
                      icon={Phone}
                      label="Emergency Contact"
                      value={
                        employee.emergency_contact_name
                          ? `${employee.emergency_contact_name}${
                              employee.emergency_contact_relationship
                                ? ` (${employee.emergency_contact_relationship})` : ''
                            } - ${employee.emergency_contact_phone || 'no phone'}`
                          : null
                      }
                    />
                  </div>
                  {employee.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">HR Notes</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{employee.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}

        {/* Compensation history */}
        {tab === 'compensation' && (
          <Card>
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Compensation History</h2>
                <Link
                  href={`/hr/compensation?employee=${employee.id}`}
                  className="text-sm font-medium text-mofad-green hover:underline"
                >
                  Manage compensation
                </Link>
              </div>
              {compensationHistory.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <p className="font-medium text-gray-700">No compensation on file</p>
                  <p className="text-sm">This employee will be skipped when payroll is run.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Effective</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Basic</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Allowances</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gross</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {compensationHistory.map((template) => (
                        <tr key={template.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {formatDate(template.effective_from)}
                            {template.effective_to && ` - ${formatDate(template.effective_to)}`}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-700">
                            {formatCurrency(Number(template.basic_salary))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-700">
                            {formatCurrency(Number(template.total_allowances))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                            {formatCurrency(Number(template.gross_monthly_salary))}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                template.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {template.is_active ? 'Active' : 'Superseded'}
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
        )}

        {/* Payroll history */}
        {tab === 'payroll' && (
          <Card>
            <CardContent className="p-0">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Payroll History</h2>
              </div>
              {payrollHistory.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <p className="font-medium text-gray-700">No payroll records yet</p>
                  <p className="text-sm">This employee has not appeared on a payroll run.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gross</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">PAYE</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Deductions</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Payslip</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {payrollHistory.map((line) => (
                        <tr key={line.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">
                            <Link
                              href={`/hr/payroll/${line.payroll}`}
                              className="text-gray-900 hover:text-mofad-green font-medium"
                            >
                              View batch
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-700">
                            {formatCurrency(Number(line.gross_pay))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-700">
                            {formatCurrency(Number(line.paye_tax))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-700">
                            {formatCurrency(Number(line.total_deductions))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-green-700">
                            {formatCurrency(Number(line.net_pay))}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                line.has_payslip
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {line.has_payslip ? 'Issued' : 'Not issued'}
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
        )}
      </div>

      {/* End employment */}
      {showTerminate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">End Employment</h2>
                <p className="text-sm text-gray-600">
                  This sets the exit date and deactivates the employee&apos;s compensation, so they
                  are excluded from future payroll runs.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exit Type<span className="text-red-500 ml-0.5">*</span>
                </label>
                <select
                  value={terminateForm.employment_status}
                  onChange={(e) =>
                    setTerminateForm((prev) => ({
                      ...prev,
                      employment_status: e.target.value as 'terminated' | 'resigned',
                    }))
                  }
                  className={inputClass}
                >
                  <option value="terminated">Terminated</option>
                  <option value="resigned">Resigned</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exit Date<span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  type="date"
                  value={terminateForm.termination_date}
                  onChange={(e) =>
                    setTerminateForm((prev) => ({ ...prev, termination_date: e.target.value }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={terminateForm.notes}
                  onChange={(e) => setTerminateForm((prev) => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className={inputClass}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setShowTerminate(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  disabled={!terminateForm.termination_date}
                  loading={terminateMutation.isPending}
                  onClick={() => terminateMutation.mutate()}
                >
                  <UserMinus className="h-4 w-4 mr-2" />
                  End Employment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
