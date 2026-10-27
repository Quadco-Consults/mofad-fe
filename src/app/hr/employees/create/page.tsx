'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, Loader2, UserPlus, AlertCircle } from 'lucide-react'

import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import apiClient, {
  EMPLOYMENT_STATUS_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
} from '@/lib/apiClient'
import type { EmployeePayload, EmploymentStatus, EmploymentType } from '@/lib/apiClient'

interface FormState {
  user: string
  position: string
  hire_date: string
  employment_type: EmploymentType
  employment_status: EmploymentStatus
  confirmation_date: string
  manager: string
  personal_email: string
  emergency_contact_name: string
  emergency_contact_phone: string
  emergency_contact_relationship: string
  address: string
  city: string
  state: string
  bank_name: string
  bank_account_number: string
  bank_account_name: string
  notes: string
}

const INITIAL_FORM: FormState = {
  user: '',
  position: '',
  hire_date: '',
  employment_type: 'full_time',
  employment_status: 'active',
  confirmation_date: '',
  manager: '',
  personal_email: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  emergency_contact_relationship: '',
  address: '',
  city: '',
  state: '',
  bank_name: '',
  bank_account_number: '',
  bank_account_name: '',
  notes: '',
}

const Field = ({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
)

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green'

export default function CreateEmployeePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Users who do not already have an employee profile. The link is a OneToOne,
  // so offering an already-linked user would only produce a server error.
  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: () => apiClient.get('/users/', { size: 500 }),
  })
  const { data: employeesData } = useQuery({
    queryKey: ['hr', 'employees', 'all-for-picker'],
    queryFn: () => apiClient.getEmployees({ size: 500 }),
  })

  const allUsers: any[] = usersData?.results ?? (Array.isArray(usersData) ? usersData : [])
  const employees = employeesData?.results ?? []
  const linkedUserIds = new Set(employees.map((e) => e.user))
  const availableUsers = allUsers.filter((u) => !linkedUserIds.has(u.id))

  const set = (key: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (!form.user) next.user = 'Select the user account for this employee.'
    if (!form.position.trim()) next.position = 'Position is required.'
    if (!form.hire_date) next.hire_date = 'Hire date is required.'
    if (form.confirmation_date && form.hire_date && form.confirmation_date < form.hire_date) {
      next.confirmation_date = 'Confirmation date cannot be earlier than the hire date.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const createMutation = useMutation({
    mutationFn: (payload: EmployeePayload) => apiClient.createEmployee(payload),
    onSuccess: (employee) => {
      queryClient.invalidateQueries({ queryKey: ['hr'] })
      addToast({
        type: 'success',
        title: 'Employee created',
        message: `${employee.user_name || 'Employee'} was added as ${employee.employee_number}.`,
      })
      router.push(`/hr/employees/${employee.id}`)
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Could not create employee',
        message: error.message || 'Failed to create employee',
      })
      // Surface per-field errors from the API next to the offending inputs.
      if (error.errors && typeof error.errors === 'object') {
        const fieldErrors: Record<string, string> = {}
        Object.entries(error.errors).forEach(([key, value]) => {
          fieldErrors[key] = Array.isArray(value) ? String(value[0]) : String(value)
        })
        setErrors(fieldErrors)
      }
    },
  })

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate()) return

    // Blank optional strings are dropped rather than sent as "", and the two
    // optional foreign keys are sent as null so the API clears them properly.
    const payload: EmployeePayload = {
      user: Number(form.user),
      position: form.position.trim(),
      hire_date: form.hire_date,
      employment_type: form.employment_type,
      employment_status: form.employment_status,
      confirmation_date: form.confirmation_date || null,
      manager: form.manager ? Number(form.manager) : null,
    }
    const optional: (keyof FormState)[] = [
      'personal_email',
      'emergency_contact_name',
      'emergency_contact_phone',
      'emergency_contact_relationship',
      'address',
      'city',
      'state',
      'bank_name',
      'bank_account_number',
      'bank_account_name',
      'notes',
    ]
    optional.forEach((key) => {
      const value = form[key].trim()
      if (value) (payload as any)[key] = value
    })

    createMutation.mutate(payload)
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/hr/employees"
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add Employee</h1>
            <p className="text-gray-600">
              Create an HR profile for an existing user account
            </p>
          </div>
        </div>

        {!loadingUsers && availableUsers.length === 0 && (
          <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">No unlinked user accounts</p>
              <p className="text-sm text-amber-700">
                Every user already has an employee profile. Create the user account first under{' '}
                <Link href="/settings/users" className="underline">
                  Settings &rarr; Users
                </Link>
                .
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employment */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-mofad-green" />
                Employment Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="User Account" required error={errors.user}>
                  <select
                    value={form.user}
                    onChange={(e) => set('user')(e.target.value)}
                    className={inputClass}
                    disabled={loadingUsers}
                  >
                    <option value="">
                      {loadingUsers ? 'Loading users...' : 'Select a user account'}
                    </option>
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {[user.first_name, user.last_name].filter(Boolean).join(' ') || user.email}
                        {user.email ? ` (${user.email})` : ''}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Position" required error={errors.position}>
                  <input
                    type="text"
                    value={form.position}
                    onChange={(e) => set('position')(e.target.value)}
                    placeholder="e.g. Senior Technician"
                    className={inputClass}
                  />
                </Field>

                <Field label="Employment Type" error={errors.employment_type}>
                  <select
                    value={form.employment_type}
                    onChange={(e) => set('employment_type')(e.target.value)}
                    className={inputClass}
                  >
                    {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Employment Status" error={errors.employment_status}>
                  <select
                    value={form.employment_status}
                    onChange={(e) => set('employment_status')(e.target.value)}
                    className={inputClass}
                  >
                    {EMPLOYMENT_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Hire Date" required error={errors.hire_date}>
                  <input
                    type="date"
                    value={form.hire_date}
                    onChange={(e) => set('hire_date')(e.target.value)}
                    className={inputClass}
                  />
                </Field>

                <Field label="Confirmation Date" error={errors.confirmation_date}>
                  <input
                    type="date"
                    value={form.confirmation_date}
                    onChange={(e) => set('confirmation_date')(e.target.value)}
                    className={inputClass}
                  />
                </Field>

                <Field label="Reporting Manager" error={errors.manager}>
                  <select
                    value={form.manager}
                    onChange={(e) => set('manager')(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">No manager</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.user_name} ({employee.employee_number})
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Personal Email" error={errors.personal_email}>
                  <input
                    type="email"
                    value={form.personal_email}
                    onChange={(e) => set('personal_email')(e.target.value)}
                    placeholder="personal@example.com"
                    className={inputClass}
                  />
                </Field>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Contact &amp; Emergency</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Address" error={errors.address}>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => set('address')(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="City" error={errors.city}>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => set('city')(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="State" error={errors.state}>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => set('state')(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Emergency Contact Name" error={errors.emergency_contact_name}>
                  <input
                    type="text"
                    value={form.emergency_contact_name}
                    onChange={(e) => set('emergency_contact_name')(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Emergency Contact Phone" error={errors.emergency_contact_phone}>
                  <input
                    type="tel"
                    value={form.emergency_contact_phone}
                    onChange={(e) => set('emergency_contact_phone')(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Relationship" error={errors.emergency_contact_relationship}>
                  <input
                    type="text"
                    value={form.emergency_contact_relationship}
                    onChange={(e) => set('emergency_contact_relationship')(e.target.value)}
                    placeholder="e.g. Spouse"
                    className={inputClass}
                  />
                </Field>
              </div>
            </CardContent>
          </Card>

          {/* Banking */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Salary Payment Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Bank Name" error={errors.bank_name}>
                  <input
                    type="text"
                    value={form.bank_name}
                    onChange={(e) => set('bank_name')(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Account Number" error={errors.bank_account_number}>
                  <input
                    type="text"
                    value={form.bank_account_number}
                    onChange={(e) => set('bank_account_number')(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Account Name" error={errors.bank_account_name}>
                  <input
                    type="text"
                    value={form.bank_account_name}
                    onChange={(e) => set('bank_account_name')(e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>
              <Field label="Internal HR Notes" error={errors.notes}>
                <textarea
                  value={form.notes}
                  onChange={(e) => set('notes')(e.target.value)}
                  rows={3}
                  className={inputClass}
                />
              </Field>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.push('/hr/employees')}>
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Create Employee
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
