'use client'

import { Suspense, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Search,
  Briefcase,
  DollarSign,
  Users,
  Loader2,
  X,
  Save,
  Power,
  Trash2,
  AlertTriangle,
} from 'lucide-react'

import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Pagination } from '@/components/ui/Pagination'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toast'
import apiClient from '@/lib/apiClient'
import type { CompensationPayload, CompensationTemplate } from '@/lib/apiClient'
import { formatCurrency, formatDate } from '@/lib/utils'

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green'

const EARNING_FIELDS = [
  { key: 'basic_salary', label: 'Basic Salary', required: true },
  { key: 'housing_allowance', label: 'Housing Allowance' },
  { key: 'transport_allowance', label: 'Transport Allowance' },
  { key: 'medical_allowance', label: 'Medical Allowance' },
  { key: 'lunch_allowance', label: 'Lunch Allowance' },
  { key: 'utility_allowance', label: 'Utility Allowance' },
  { key: 'other_allowances', label: 'Other Allowances' },
] as const

const INITIAL_FORM = {
  employee: '',
  effective_from: '',
  effective_to: '',
  basic_salary: '',
  housing_allowance: '',
  transport_allowance: '',
  medical_allowance: '',
  lunch_allowance: '',
  utility_allowance: '',
  other_allowances: '',
  pension_rate: '8',
  nhis_amount: '0',
  nhf_rate: '2.5',
  tax_relief: '200000',
  notes: '',
}

type FormState = typeof INITIAL_FORM

function CompensationPageContent() {
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  // Deep link from the employee detail page pre-filters to that employee.
  const employeeParam = searchParams?.get('employee') ?? ''

  const [searchTerm, setSearchTerm] = useState('')
  const [employeeFilter, setEmployeeFilter] = useState(employeeParam)
  const [activeFilter, setActiveFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<CompensationTemplate | null>(null)
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toDelete, setToDelete] = useState<CompensationTemplate | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['hr', 'compensation', currentPage, searchTerm, employeeFilter, activeFilter],
    queryFn: () =>
      apiClient.getCompensationTemplates({
        page: currentPage,
        size: pageSize,
        ...(searchTerm ? { search: searchTerm } : {}),
        ...(employeeFilter ? { employee: employeeFilter } : {}),
        ...(activeFilter !== 'all' ? { is_active: activeFilter === 'active' } : {}),
      }),
  })

  const { data: employeesData } = useQuery({
    queryKey: ['hr', 'employees', 'picker'],
    queryFn: () => apiClient.getEmployees({ size: 500 }),
  })
  const employees = employeesData?.results ?? []

  const templates = data?.results ?? []
  const totalCount = data?.paginator?.count ?? data?.count ?? 0
  const totalPages = data?.paginator?.total_pages ?? Math.ceil(totalCount / pageSize) ?? 1

  // Live preview of the gross the server will compute, so the figure is not a
  // surprise after saving.
  const previewGross = useMemo(
    () =>
      EARNING_FIELDS.reduce((sum, field) => sum + (parseFloat(form[field.key] as string) || 0), 0),
    [form]
  )

  const openCreate = () => {
    setEditing(null)
    setForm({ ...INITIAL_FORM, employee: employeeFilter })
    setErrors({})
    setShowForm(true)
  }

  const openEdit = (template: CompensationTemplate) => {
    setEditing(template)
    setForm({
      employee: String(template.employee),
      effective_from: template.effective_from,
      effective_to: template.effective_to ?? '',
      basic_salary: template.basic_salary,
      housing_allowance: template.housing_allowance,
      transport_allowance: template.transport_allowance,
      medical_allowance: template.medical_allowance,
      lunch_allowance: template.lunch_allowance,
      utility_allowance: template.utility_allowance,
      other_allowances: template.other_allowances,
      pension_rate: template.pension_rate,
      nhis_amount: template.nhis_amount,
      nhf_rate: template.nhf_rate,
      tax_relief: template.tax_relief,
      notes: template.notes ?? '',
    })
    setErrors({})
    setShowForm(true)
  }

  const setField = (key: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const saveMutation = useMutation({
    mutationFn: (payload: CompensationPayload) =>
      editing
        ? apiClient.updateCompensationTemplate(editing.id, payload)
        : apiClient.createCompensationTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr'] })
      addToast({
        type: 'success',
        title: editing ? 'Compensation updated' : 'Compensation created',
        message: editing
          ? 'The salary structure was updated.'
          : 'The new structure is now active and supersedes any previous one.',
      })
      setShowForm(false)
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Could not save',
        message: error.message || 'Failed to save compensation template',
      })
      if (error.errors && typeof error.errors === 'object') {
        const fieldErrors: Record<string, string> = {}
        Object.entries(error.errors).forEach(([key, value]) => {
          fieldErrors[key] = Array.isArray(value) ? String(value[0]) : String(value)
        })
        setErrors(fieldErrors)
      }
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => apiClient.deactivateCompensationTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr'] })
      addToast({ type: 'success', title: 'Deactivated', message: 'Compensation template deactivated.' })
    },
    onError: (err: any) =>
      addToast({ type: 'error', title: 'Error', message: err.message || 'Failed to deactivate' }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteCompensationTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr'] })
      addToast({ type: 'success', title: 'Deleted', message: 'Compensation template removed.' })
      setToDelete(null)
    },
    onError: (err: any) => {
      addToast({ type: 'error', title: 'Error', message: err.message || 'Failed to delete' })
      setToDelete(null)
    },
  })

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    const next: Record<string, string> = {}
    if (!form.employee) next.employee = 'Select an employee.'
    if (!form.effective_from) next.effective_from = 'Effective-from date is required.'
    if (!form.basic_salary || parseFloat(form.basic_salary) <= 0) {
      next.basic_salary = 'Basic salary must be greater than zero.'
    }
    if (form.effective_to && form.effective_from && form.effective_to < form.effective_from) {
      next.effective_to = 'End date cannot be earlier than the effective-from date.'
    }
    setErrors(next)
    if (Object.keys(next).length > 0) return

    // Blank money inputs mean zero, not "leave unset".
    const numeric = (value: string) => (value === '' ? 0 : Number(value))

    saveMutation.mutate({
      employee: Number(form.employee),
      effective_from: form.effective_from,
      effective_to: form.effective_to || null,
      basic_salary: numeric(form.basic_salary),
      housing_allowance: numeric(form.housing_allowance),
      transport_allowance: numeric(form.transport_allowance),
      medical_allowance: numeric(form.medical_allowance),
      lunch_allowance: numeric(form.lunch_allowance),
      utility_allowance: numeric(form.utility_allowance),
      other_allowances: numeric(form.other_allowances),
      pension_rate: numeric(form.pension_rate),
      nhis_amount: numeric(form.nhis_amount),
      nhf_rate: numeric(form.nhf_rate),
      tax_relief: numeric(form.tax_relief),
      is_active: true,
      notes: form.notes,
    })
  }

  const applyFilter = (setter: (value: string) => void) => (value: string) => {
    setter(value)
    setCurrentPage(1)
  }

  const activeCount = templates.filter((t) => t.is_active).length
  const totalActiveGross = templates
    .filter((t) => t.is_active)
    .reduce((sum, t) => sum + Number(t.gross_monthly_salary), 0)

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Compensation</h1>
            <p className="text-gray-600">
              Salary structures, allowances and statutory deduction rates
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Structure
          </Button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Templates</p>
                <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
              </div>
              <Briefcase className="h-8 w-8 text-purple-600" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active on this page</p>
                <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly gross (page)</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalActiveGross)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-amber-600" />
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by employee name or number..."
                  value={searchTerm}
                  onChange={(e) => applyFilter(setSearchTerm)(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green"
                />
              </div>
              <select
                value={employeeFilter}
                onChange={(e) => applyFilter(setEmployeeFilter)(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green"
              >
                <option value="">All employees</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.user_name} ({employee.employee_number})
                  </option>
                ))}
              </select>
              <select
                value={activeFilter}
                onChange={(e) => applyFilter(setActiveFilter)(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green"
              >
                <option value="all">All</option>
                <option value="active">Active only</option>
                <option value="inactive">Superseded only</option>
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
                Loading compensation...
              </div>
            ) : templates.length === 0 ? (
              <div className="py-16 text-center">
                <Briefcase className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No compensation templates</p>
                <p className="text-sm text-gray-500 mb-4">
                  Payroll skips employees without a salary structure on file.
                </p>
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Structure
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Effective</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Basic</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Allowances</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gross</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {templates.map((template) => (
                      <tr key={template.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <Link href={`/hr/employees/${template.employee}`} className="block">
                            <p className="font-medium text-gray-900 hover:text-mofad-green">
                              {template.employee_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {template.employee_number} &middot; {template.employee_position}
                            </p>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
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
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(template)}
                              className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-mofad-green hover:bg-gray-100 rounded"
                            >
                              Edit
                            </button>
                            {template.is_active && (
                              <button
                                onClick={() => deactivateMutation.mutate(template.id)}
                                className="p-2 text-gray-500 hover:text-amber-600 hover:bg-gray-100 rounded"
                                title="Deactivate"
                              >
                                <Power className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => setToDelete(template)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
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

      {/* Create / edit */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-xl w-full max-w-3xl my-8"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editing ? 'Edit Compensation Structure' : 'New Compensation Structure'}
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {!editing && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <AlertTriangle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    Saving this structure supersedes the employee&apos;s current one. Past payroll
                    runs are unaffected.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <select
                    value={form.employee}
                    onChange={(e) => setField('employee')(e.target.value)}
                    className={inputClass}
                    disabled={Boolean(editing)}
                  >
                    <option value="">Select an employee</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.user_name} ({employee.employee_number}) - {employee.position}
                      </option>
                    ))}
                  </select>
                  {errors.employee && (
                    <p className="mt-1 text-xs text-red-600">{errors.employee}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Effective From<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.effective_from}
                    onChange={(e) => setField('effective_from')(e.target.value)}
                    className={inputClass}
                  />
                  {errors.effective_from && (
                    <p className="mt-1 text-xs text-red-600">{errors.effective_from}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Effective To
                  </label>
                  <input
                    type="date"
                    value={form.effective_to}
                    onChange={(e) => setField('effective_to')(e.target.value)}
                    className={inputClass}
                  />
                  {errors.effective_to && (
                    <p className="mt-1 text-xs text-red-600">{errors.effective_to}</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Monthly Earnings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {EARNING_FIELDS.map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                        {'required' in field && field.required && (
                          <span className="text-red-500 ml-0.5">*</span>
                        )}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form[field.key] as string}
                        onChange={(e) => setField(field.key)(e.target.value)}
                        placeholder="0.00"
                        className={inputClass}
                      />
                      {errors[field.key] && (
                        <p className="mt-1 text-xs text-red-600">{errors[field.key]}</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-3 rounded-lg bg-gray-50 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Gross Monthly Salary</span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(previewGross)}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Statutory Deductions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pension Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.pension_rate}
                      onChange={(e) => setField('pension_rate')(e.target.value)}
                      className={inputClass}
                    />
                    <p className="mt-1 text-xs text-gray-500">Of basic salary</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NHF Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.nhf_rate}
                      onChange={(e) => setField('nhf_rate')(e.target.value)}
                      className={inputClass}
                    />
                    <p className="mt-1 text-xs text-gray-500">Of basic salary</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NHIS Amount
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.nhis_amount}
                      onChange={(e) => setField('nhis_amount')(e.target.value)}
                      className={inputClass}
                    />
                    <p className="mt-1 text-xs text-gray-500">Fixed monthly</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Annual Tax Relief
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.tax_relief}
                      onChange={(e) => setField('tax_relief')(e.target.value)}
                      className={inputClass}
                    />
                    <p className="mt-1 text-xs text-gray-500">Applied before PAYE</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setField('notes')(e.target.value)}
                  rows={2}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={saveMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {editing ? 'Save Changes' : 'Create Structure'}
              </Button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete compensation structure"
        message={`Delete the salary structure for ${toDelete?.employee_name} effective ${
          toDelete ? formatDate(toDelete.effective_from) : ''
        }? This cannot be undone. A structure already used by a payroll run cannot be deleted.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
        onClose={() => setToDelete(null)}
      />
    </AppLayout>
  )
}

export default function CompensationPage() {
  return (
    <Suspense
      fallback={
        <AppLayout>
          <div className="flex items-center justify-center py-24 text-gray-500">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading compensation...
          </div>
        </AppLayout>
      }
    >
      <CompensationPageContent />
    </Suspense>
  )
}
