'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Edit, Trash2, Building2, Users, Loader2, RefreshCw, Calendar, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { BulkActionBar } from '@/components/ui/BulkActionBar'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useSelection } from '@/hooks/useSelection'
import { AppLayout } from '@/components/layout/AppLayout'
import api from '@/lib/apiClient'

interface Department {
  id: number
  name: string
  description?: string
  manager_name?: string
  manager_email?: string
  employee_count: number
  is_active: boolean
  created_at: string
}

interface NewDepartmentForm {
  name: string
  description: string
  is_active: boolean
}

const initialNewDepartmentForm: NewDepartmentForm = {
  name: '',
  description: '',
  is_active: true,
}

function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Search and filtering
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)

  // Modals and forms
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [newDepartmentForm, setNewDepartmentForm] = useState<NewDepartmentForm>(initialNewDepartmentForm)
  const [editDepartmentForm, setEditDepartmentForm] = useState<Partial<Department>>({})
  const [submitting, setSubmitting] = useState(false)

  // Confirmation dialogs
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null)
  const [showActivateDialog, setShowActivateDialog] = useState(false)
  const [departmentToActivate, setDepartmentToActivate] = useState<Department | null>(null)
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [departmentToDeactivate, setDepartmentToDeactivate] = useState<Department | null>(null)

  // Selection for bulk actions
  const selection = useSelection<Department>()

  // Fetch departments
  const fetchDepartments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.getDepartments({
        search: searchTerm || undefined,
        is_active: statusFilter === 'all' ? undefined : statusFilter === 'active',
        page: currentPage,
        page_size: pageSize,
      })

      const departmentsData = Array.isArray(response) ? response : response.results || []

      setDepartments(departmentsData)
      setTotalCount(response.count || departmentsData.length)
      setHasNext(!!response.next)
      setHasPrevious(!!response.previous)

    } catch (err: any) {
      console.error('Failed to fetch departments:', err)
      setError(err.message || 'Failed to load departments. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, searchTerm, statusFilter])

  useEffect(() => {
    fetchDepartments()
  }, [fetchDepartments])

  // Handle create department
  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newDepartmentForm.name.trim()) {
      setError('Department name is required')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await api.createDepartment({
        name: newDepartmentForm.name,
        description: newDepartmentForm.description || undefined,
        is_active: newDepartmentForm.is_active,
      })

      setShowCreateModal(false)
      setNewDepartmentForm(initialNewDepartmentForm)
      fetchDepartments()
    } catch (err: any) {
      console.error('Failed to create department:', err)
      setError(err.message || 'Failed to create department. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle edit department
  const handleEditDepartment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDepartment) return

    setSubmitting(true)
    setError(null)
    try {
      await api.updateDepartment(selectedDepartment.id, {
        name: editDepartmentForm.name,
        description: editDepartmentForm.description || undefined,
      })

      setShowEditModal(false)
      setSelectedDepartment(null)
      setEditDepartmentForm({})
      fetchDepartments()
    } catch (err: any) {
      console.error('Failed to update department:', err)
      setError(err.message || 'Failed to update department. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle delete department
  const handleDeleteDepartment = async () => {
    if (!departmentToDelete) return

    setSubmitting(true)
    try {
      await api.deleteDepartment(departmentToDelete.id)

      setShowDeleteDialog(false)
      setDepartmentToDelete(null)
      fetchDepartments()
    } catch (err: any) {
      console.error('Failed to delete department:', err)
      setError(err.message || 'Failed to delete department. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle activate/deactivate department
  const handleToggleDepartmentStatus = async (department: Department, activate: boolean) => {
    setSubmitting(true)
    try {
      if (activate) {
        await api.activateDepartment(department.id)
      } else {
        await api.deactivateDepartment(department.id)
      }

      if (activate) {
        setShowActivateDialog(false)
        setDepartmentToActivate(null)
      } else {
        setShowDeactivateDialog(false)
        setDepartmentToDeactivate(null)
      }
      fetchDepartments()
    } catch (err: any) {
      console.error(`Failed to ${activate ? 'activate' : 'deactivate'} department:`, err)
      setError(err.message || `Failed to ${activate ? 'activate' : 'deactivate'} department. Please try again.`)
    } finally {
      setSubmitting(false)
    }
  }

  // Handle bulk actions
  const handleBulkActivate = async () => {
    setSubmitting(true)
    try {
      // TODO: Implement bulk activate when API is available
      console.log('Bulk activating departments:', selection.selectedIds)
      selection.clearSelection()
      fetchDepartments()
    } catch (err: any) {
      setError('Failed to activate selected departments')
    } finally {
      setSubmitting(false)
    }
  }

  const handleBulkDeactivate = async () => {
    setSubmitting(true)
    try {
      // TODO: Implement bulk deactivate when API is available
      console.log('Bulk deactivating departments:', selection.selectedIds)
      selection.clearSelection()
      fetchDepartments()
    } catch (err: any) {
      setError('Failed to deactivate selected departments')
    } finally {
      setSubmitting(false)
    }
  }

  const handleBulkDelete = async () => {
    setSubmitting(true)
    try {
      // TODO: Implement bulk delete when API is available
      console.log('Bulk deleting departments:', selection.selectedIds)
      selection.clearSelection()
      fetchDepartments()
    } catch (err: any) {
      setError('Failed to delete selected departments')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
            <p className="text-gray-600 mt-1">Manage organizational departments and structure</p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{totalCount}</h3>
                <p className="text-gray-600">Total Departments</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {departments.filter(d => d.is_active).length}
                </h3>
                <p className="text-gray-600">Active Departments</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {departments.reduce((sum, d) => sum + d.employee_count, 0)}
                </h3>
                <p className="text-gray-600">Total Employees</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
            <Button
              variant="outline"
              onClick={fetchDepartments}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Bulk Actions */}
        {selection.selectedCount > 0 && (
          <BulkActionBar
            selectedCount={selection.selectedCount}
            onClearSelection={selection.clearSelection}
            onBulkDelete={handleBulkDelete}
            isDeleting={submitting}
            entityName="departments"
            customActions={
              <>
                <Button
                  size="sm"
                  onClick={handleBulkActivate}
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Activate
                </Button>
                <Button
                  size="sm"
                  onClick={handleBulkDeactivate}
                  disabled={submitting}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Deactivate
                </Button>
              </>
            }
          />
        )}

        {/* Department Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <Checkbox
                      checked={selection.isAllSelected(departments)}
                      indeterminate={selection.isPartiallySelected(departments)}
                      onChange={() => selection.toggleAll(departments)}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Manager
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employees
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">Loading departments...</p>
                    </td>
                  </tr>
                ) : departments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      <Building2 className="h-12 w-12 mx-auto text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">No departments found</p>
                    </td>
                  </tr>
                ) : (
                  departments.map((department) => (
                    <tr key={department.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Checkbox
                          checked={selection.isSelected(department.id)}
                          onChange={() => selection.toggle(department.id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {department.name}
                          </div>
                          <div className="text-sm text-gray-500">{department.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div>{department.manager_name || 'Unassigned'}</div>
                          <div className="text-sm text-gray-500">{department.manager_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900">
                          <Users className="h-4 w-4 mr-2 text-gray-400" />
                          {department.employee_count}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          department.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {department.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(department.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedDepartment(department)
                              setShowViewModal(true)
                            }}
                          >
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedDepartment(department)
                              setEditDepartmentForm(department)
                              setShowEditModal(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {department.is_active ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setDepartmentToDeactivate(department)
                                setShowDeactivateDialog(true)
                              }}
                            >
                              Deactivate
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setDepartmentToActivate(department)
                                setShowActivateDialog(true)
                              }}
                            >
                              Activate
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDepartmentToDelete(department)
                              setShowDeleteDialog(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalCount > pageSize && (
            <div className="px-6 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} departments
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    disabled={!hasPrevious || loading}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={!hasNext || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Create Department Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Department</h2>
                <form onSubmit={handleCreateDepartment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department Name *
                    </label>
                    <input
                      type="text"
                      value={newDepartmentForm.name}
                      onChange={(e) => setNewDepartmentForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="e.g., Finance & Accounts"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newDepartmentForm.description}
                      onChange={(e) => setNewDepartmentForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Brief description of the department's responsibilities"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newDepartmentForm.is_active}
                      onChange={(e) => setNewDepartmentForm(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Active department
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateModal(false)
                        setNewDepartmentForm(initialNewDepartmentForm)
                        setError(null)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Department'
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Department Modal */}
        {showEditModal && selectedDepartment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Department</h2>
                <form onSubmit={handleEditDepartment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department Name *
                    </label>
                    <input
                      type="text"
                      value={editDepartmentForm.name || ''}
                      onChange={(e) => setEditDepartmentForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editDepartmentForm.description || ''}
                      onChange={(e) => setEditDepartmentForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowEditModal(false)
                        setSelectedDepartment(null)
                        setEditDepartmentForm({})
                        setError(null)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Department'
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Department Modal */}
        {showViewModal && selectedDepartment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Department Details</h2>
                  <Button
                    variant="outline"
                    onClick={() => setShowViewModal(false)}
                  >
                    Close
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="ml-6">
                      <h3 className="text-lg font-medium text-gray-900">{selectedDepartment.name}</h3>
                      <div className="flex items-center mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedDepartment.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedDepartment.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Department Information</h4>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">
                          <strong>Description:</strong> {selectedDepartment.description || 'No description'}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          Employee Count: {selectedDepartment.employee_count}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          Created: {new Date(selectedDepartment.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Manager Information</h4>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">
                          <strong>Manager:</strong> {selectedDepartment.manager_name || 'Unassigned'}
                        </div>
                        {selectedDepartment.manager_email && (
                          <div className="text-sm text-gray-600">
                            <strong>Email:</strong> {selectedDepartment.manager_email}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Dialogs */}
        <ConfirmDialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDeleteDepartment}
          title="Delete Department"
          message={`Are you sure you want to delete ${departmentToDelete?.name}? This action cannot be undone.`}
          confirmText="Delete"
          isLoading={submitting}
          variant="danger"
        />

        <ConfirmDialog
          open={showActivateDialog}
          onClose={() => setShowActivateDialog(false)}
          onConfirm={() => departmentToActivate && handleToggleDepartmentStatus(departmentToActivate, true)}
          title="Activate Department"
          message={`Are you sure you want to activate ${departmentToActivate?.name}?`}
          confirmText="Activate"
          isLoading={submitting}
        />

        <ConfirmDialog
          open={showDeactivateDialog}
          onClose={() => setShowDeactivateDialog(false)}
          onConfirm={() => departmentToDeactivate && handleToggleDepartmentStatus(departmentToDeactivate, false)}
          title="Deactivate Department"
          message={`Are you sure you want to deactivate ${departmentToDeactivate?.name}?`}
          confirmText="Deactivate"
          isLoading={submitting}
        />
      </div>
    </AppLayout>
  )
}

export default DepartmentsPage