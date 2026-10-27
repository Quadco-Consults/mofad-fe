'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Search,
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  Eye,
  Trash2,
  Loader2,
  Briefcase,
} from 'lucide-react'

import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Pagination } from '@/components/ui/Pagination'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toast'
import apiClient, {
  EMPLOYMENT_STATUS_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
} from '@/lib/apiClient'
import type { Employee, EmployeeStats } from '@/lib/apiClient'
import { formatDate } from '@/lib/utils'

const STATUS_BADGES: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  on_leave: 'bg-amber-100 text-amber-800',
  suspended: 'bg-orange-100 text-orange-800',
  terminated: 'bg-red-100 text-red-800',
  resigned: 'bg-gray-100 text-gray-800',
}

export default function EmployeesPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['hr', 'employees', currentPage, searchTerm, statusFilter, typeFilter],
    queryFn: () =>
      apiClient.getEmployees({
        page: currentPage,
        size: pageSize,
        ...(searchTerm ? { search: searchTerm } : {}),
        ...(statusFilter !== 'all' ? { employment_status: statusFilter } : {}),
        ...(typeFilter !== 'all' ? { employment_type: typeFilter } : {}),
      }),
  })

  const { data: stats } = useQuery<EmployeeStats>({
    queryKey: ['hr', 'employee-stats'],
    queryFn: () => apiClient.getEmployeeStats(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr'] })
      addToast({ type: 'success', title: 'Deleted', message: 'Employee record removed.' })
      setEmployeeToDelete(null)
    },
    onError: (err: any) => {
      addToast({ type: 'error', title: 'Error', message: err.message || 'Failed to delete employee' })
    },
  })

  const employees = data?.results ?? []
  const totalCount = data?.paginator?.count ?? data?.count ?? 0
  const totalPages = data?.paginator?.total_pages ?? Math.ceil(totalCount / pageSize) ?? 1

  // Filter changes invalidate the current page number, so reset alongside them
  // rather than in an effect that would fire a second, redundant fetch.
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
            <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
            <p className="text-gray-600">Employee records, positions and employment status</p>
          </div>
          <Button onClick={() => router.push('/hr/employees/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats?.total_employees ?? 0, icon: Users, color: 'text-blue-600' },
            { label: 'Active', value: stats?.active ?? 0, icon: UserCheck, color: 'text-green-600' },
            { label: 'On Leave', value: stats?.on_leave ?? 0, icon: Briefcase, color: 'text-amber-600' },
            { label: 'Exited', value: (stats?.terminated ?? 0) + (stats?.resigned ?? 0), icon: UserX, color: 'text-red-600' },
          ].map((card) => {
            const Icon = card.icon
            return (
              <Card key={card.label}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{card.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${card.color}`} />
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Employees missing a salary structure would be silently skipped by a
            payroll run, so surface them here where they can be fixed. */}
        {(stats?.without_compensation ?? 0) > 0 && (
          <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-amber-900">
                {stats?.without_compensation} active{' '}
                {stats?.without_compensation === 1 ? 'employee has' : 'employees have'} no compensation template
              </p>
              <p className="text-sm text-amber-700">
                Payroll skips employees without a salary structure on file.
              </p>
            </div>
            <Link
              href="/hr/compensation"
              className="text-sm font-medium text-amber-900 underline whitespace-nowrap"
            >
              Set up compensation
            </Link>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, employee number, email or position..."
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
                {EMPLOYMENT_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(e) => applyFilter(setTypeFilter)(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green"
              >
                <option value="all">All types</option>
                {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
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
                Loading employees...
              </div>
            ) : error ? (
              <div className="py-16 text-center text-red-600">
                {(error as any).message || 'Failed to load employees'}
              </div>
            ) : employees.length === 0 ? (
              <div className="py-16 text-center">
                <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No employees found</p>
                <p className="text-sm text-gray-500 mb-4">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your filters.'
                    : 'Add your first employee to get started.'}
                </p>
                <Button onClick={() => router.push('/hr/employees/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hire Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {employees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <Link href={`/hr/employees/${employee.id}`} className="block">
                            <p className="font-medium text-gray-900 hover:text-mofad-green">
                              {employee.user_name || '-'}
                            </p>
                            <p className="text-xs text-gray-500">{employee.employee_number}</p>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{employee.position}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{employee.department || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {employee.employment_type_display}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {formatDate(employee.hire_date)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              STATUS_BADGES[employee.employment_status] || 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {employee.employment_status_display}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/hr/employees/${employee.id}`}
                              className="p-2 text-gray-500 hover:text-mofad-green hover:bg-gray-100 rounded"
                              title="View employee"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => setEmployeeToDelete(employee)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded"
                              title="Delete employee"
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

      <ConfirmDialog
        open={employeeToDelete !== null}
        title="Delete employee"
        message={`Delete the employee record for ${employeeToDelete?.user_name || employeeToDelete?.employee_number}? Their payroll history is kept.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => employeeToDelete && deleteMutation.mutate(employeeToDelete.id)}
        onClose={() => setEmployeeToDelete(null)}
      />
    </AppLayout>
  )
}
