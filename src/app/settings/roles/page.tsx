'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Edit, Trash2, Eye, Shield, Key, Loader2, RefreshCw, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { BulkActionBar } from '@/components/ui/BulkActionBar'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { AppLayout } from '@/components/layout/AppLayout'
import { Pagination } from '@/components/ui/Pagination'
import { useSelection } from '@/hooks/useSelection'
import api from '@/lib/api-client'

interface Permission {
  id: number
  name: string
  codename: string
}

interface ModulePermission {
  module: string
  permissions: Permission[]
}

interface Role {
  id: number
  name: string
  description: string | null
  is_active: boolean
  is_system_role: boolean
  permissions_count: number
  permissions?: ModulePermission[]
  created_by: string | null
  created_datetime: string
  updated_datetime: string
}

interface NewRoleForm {
  name: string
  description: string
  permissions: number[]
}

const initialNewRoleForm: NewRoleForm = {
  name: '',
  description: '',
  permissions: [],
}

function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [allPermissions, setAllPermissions] = useState<ModulePermission[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [editForm, setEditForm] = useState<NewRoleForm | null>(null)
  const [newRoleForm, setNewRoleForm] = useState<NewRoleForm>(initialNewRoleForm)

  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  // Fetch roles from API
  const fetchRoles = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const params: any = {}
      if (searchTerm) params.search = searchTerm
      if (statusFilter !== 'all') params.is_active = statusFilter === 'active'

      const response = await api.getRoles(params)

      if (Array.isArray(response)) {
        setRoles(response)
        setTotalCount(response.length)
      } else if (response.results) {
        setRoles(response.results)
        setTotalCount(response.count)
      } else {
        setRoles([])
        setTotalCount(0)
      }
    } catch (error: any) {
      console.error('Error fetching roles:', error)
      setErrorMessage(error.message || 'Failed to load roles')
      setRoles([])
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, statusFilter])

  // Fetch all permissions
  const fetchPermissions = useCallback(async () => {
    try {
      const response = await api.getPermissions()
      if (Array.isArray(response)) {
        setAllPermissions(response)
      }
    } catch (error: any) {
      console.error('Error fetching permissions:', error)
    }
  }, [])

  useEffect(() => {
    fetchRoles()
    fetchPermissions()
  }, [fetchRoles, fetchPermissions])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  // Pagination calculations
  const totalPages = Math.ceil(totalCount / pageSize) || 1
  const startIndex = (currentPage - 1) * pageSize
  const paginatedRoles = roles.slice(startIndex, startIndex + pageSize)

  // Filter only non-system roles for selection (system roles cannot be deleted)
  const deletableRoles = paginatedRoles.filter(r => !r.is_system_role)

  // Selection for bulk actions
  const selection = useSelection({
    items: deletableRoles,
    getId: (item) => item.id,
  })

  // Bulk delete handler
  const handleBulkDelete = async () => {
    const selectedIds = selection.getSelectedIds()
    if (selectedIds.length === 0) return

    setIsBulkDeleting(true)
    try {
      for (const id of selectedIds) {
        await api.deleteRole(id)
      }
      showSuccess(`Successfully deleted ${selectedIds.length} role(s)`)
      selection.clearSelection()
      setShowBulkDeleteModal(false)
      fetchRoles()
    } catch (error: any) {
      showError(error.message || 'Failed to delete some roles')
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const showError = (message: string) => {
    setErrorMessage(message)
    setTimeout(() => setErrorMessage(''), 5000)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800'
  }

  // Calculate summary stats
  const activeRoles = roles.filter(r => r.is_active).length
  const systemRoles = roles.filter(r => r.is_system_role).length

  const handleView = async (role: Role) => {
    try {
      setIsLoading(true)
      const detailedRole = await api.getRoleById(role.id)
      setSelectedRole(detailedRole)
      setShowViewModal(true)
    } catch (error: any) {
      showError(error.message || 'Failed to load role details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = async (role: Role) => {
    try {
      setIsLoading(true)
      const detailedRole = await api.getRoleById(role.id)
      setSelectedRole(detailedRole)

      // Extract permission IDs from the detailed role
      const permissionIds: number[] = []
      if (detailedRole.permissions) {
        detailedRole.permissions.forEach((module: ModulePermission) => {
          module.permissions.forEach((perm: Permission) => {
            permissionIds.push(perm.id)
          })
        })
      }

      setEditForm({
        name: detailedRole.name,
        description: detailedRole.description || '',
        permissions: permissionIds,
      })
      setShowEditModal(true)
    } catch (error: any) {
      showError(error.message || 'Failed to load role details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (roleId: number) => {
    if (!confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      return
    }

    try {
      setIsSaving(true)
      await api.deleteRole(roleId)
      showSuccess('Role deleted successfully')
      fetchRoles()
    } catch (error: any) {
      showError(error.message || 'Failed to delete role')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleStatus = async (role: Role) => {
    const action = role.is_active ? 'deactivate' : 'activate'
    if (!confirm(`Are you sure you want to ${action} this role?`)) {
      return
    }

    try {
      setIsSaving(true)
      if (role.is_active) {
        await api.deactivateRole(role.id)
      } else {
        await api.activateRole(role.id)
      }
      showSuccess(`Role ${action}d successfully`)
      fetchRoles()
    } catch (error: any) {
      showError(error.message || `Failed to ${action} role`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateRole = async () => {
    if (!newRoleForm.name.trim()) {
      showError('Please enter a role name')
      return
    }

    try {
      setIsSaving(true)
      await api.createRole(newRoleForm)
      showSuccess('Role created successfully')
      setShowAddModal(false)
      setNewRoleForm(initialNewRoleForm)
      fetchRoles()
    } catch (error: any) {
      showError(error.message || 'Failed to create role')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateRole = async () => {
    if (!selectedRole || !editForm) return

    try {
      setIsSaving(true)
      await api.updateRole(selectedRole.id, editForm)
      showSuccess('Role updated successfully')
      setShowEditModal(false)
      setEditForm(null)
      setSelectedRole(null)
      fetchRoles()
    } catch (error: any) {
      showError(error.message || 'Failed to update role')
    } finally {
      setIsSaving(false)
    }
  }

  const togglePermission = (permissionId: number, form: NewRoleForm, setForm: (form: NewRoleForm) => void) => {
    const newPermissions = form.permissions.includes(permissionId)
      ? form.permissions.filter(id => id !== permissionId)
      : [...form.permissions, permissionId]
    setForm({ ...form, permissions: newPermissions })
  }

  const toggleModulePermissions = (module: ModulePermission, form: NewRoleForm, setForm: (form: NewRoleForm) => void) => {
    const modulePermIds = module.permissions.map(p => p.id)
    const allSelected = modulePermIds.every(id => form.permissions.includes(id))

    let newPermissions: number[]
    if (allSelected) {
      // Deselect all module permissions
      newPermissions = form.permissions.filter(id => !modulePermIds.includes(id))
    } else {
      // Select all module permissions
      newPermissions = [...new Set([...form.permissions, ...modulePermIds])]
    }
    setForm({ ...form, permissions: newPermissions })
  }

  const PermissionsSelector = ({
    form,
    setForm,
  }: {
    form: NewRoleForm
    setForm: (form: NewRoleForm) => void
  }) => (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {allPermissions.map((module) => {
        const modulePermIds = module.permissions.map(p => p.id)
        const allSelected = modulePermIds.every(id => form.permissions.includes(id))
        const someSelected = modulePermIds.some(id => form.permissions.includes(id)) && !allSelected

        return (
          <div key={module.module} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected }}
                  onChange={() => toggleModulePermissions(module, form, setForm)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-3"
                />
                <span className="font-medium text-gray-900 capitalize">{module.module.replace('_', ' ')}</span>
              </div>
              <span className="text-xs text-gray-500">
                {modulePermIds.filter(id => form.permissions.includes(id)).length}/{module.permissions.length} selected
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 ml-6">
              {module.permissions.map((permission) => (
                <label key={permission.id} className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={form.permissions.includes(permission.id)}
                    onChange={() => togglePermission(permission.id, form, setForm)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-2"
                  />
                  <span className="text-gray-700">{permission.name}</span>
                </label>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <div className="h-2 w-2 bg-red-500 rounded-full mr-3"></div>
            <p className="text-red-800 font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
            <p className="text-gray-600">Define roles and assign permissions to control access</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchRoles} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="mofad-btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Role
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Roles</p>
                <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Roles</p>
                <p className="text-2xl font-bold text-green-600">{activeRoles}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">System Roles</p>
                <p className="text-2xl font-bold text-purple-600">{systemRoles}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Key className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search roles..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <Button variant="outline" disabled>
            Export Roles
          </Button>
        </div>

        {/* Roles Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-500" />
              <span className="ml-2 text-gray-600">Loading roles...</span>
            </div>
          ) : paginatedRoles.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No roles found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <Checkbox
                        checked={selection.isAllSelected}
                        indeterminate={selection.isPartiallySelected}
                        onChange={selection.toggleSelectAll}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Permissions
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
                  {paginatedRoles.map((role) => (
                    <tr key={role.id} className={`hover:bg-gray-50 transition-colors ${selection.isSelected(role.id) ? 'bg-primary-50' : ''}`}>
                      <td className="px-4 py-4">
                        {!role.is_system_role ? (
                          <Checkbox
                            checked={selection.isSelected(role.id)}
                            onChange={() => selection.toggleSelect(role.id)}
                          />
                        ) : (
                          <div className="w-4 h-4" />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                            <Shield className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{role.name}</div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {role.description || 'No description'}
                            </div>
                            {role.is_system_role && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                System Role
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Key className="h-3 w-3 mr-1" />
                          {role.permissions_count} permissions
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(role.is_active)}`}>
                          {role.is_active ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <X className="h-3 w-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDateTime(role.created_datetime)}</div>
                        {role.created_by && (
                          <div className="text-xs text-gray-500">by {role.created_by}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(role)}
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!role.is_system_role && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(role)}
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleStatus(role)}
                                className={role.is_active ? "text-yellow-600 hover:text-yellow-700" : "text-green-600 hover:text-green-700"}
                                title={role.is_active ? "Deactivate" : "Activate"}
                              >
                                {role.is_active ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(role.id)}
                                className="text-red-600 hover:text-red-700"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && totalCount > 0 && (
          <div className="mofad-card">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Add Role Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">Create New Role</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role Name *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    value={newRoleForm.name}
                    onChange={(e) => setNewRoleForm({ ...newRoleForm, name: e.target.value })}
                    placeholder="e.g., Sales Manager"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    rows={2}
                    value={newRoleForm.description}
                    onChange={(e) => setNewRoleForm({ ...newRoleForm, description: e.target.value })}
                    placeholder="Describe the role's responsibilities"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                  {allPermissions.length > 0 ? (
                    <PermissionsSelector form={newRoleForm} setForm={setNewRoleForm} />
                  ) : (
                    <p className="text-gray-500 text-sm">Loading permissions...</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => {
                  setShowAddModal(false)
                  setNewRoleForm(initialNewRoleForm)
                }}>
                  Cancel
                </Button>
                <Button className="mofad-btn-primary" onClick={handleCreateRole} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Create Role'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* View Role Modal */}
        {showViewModal && selectedRole && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">Role Details - {selectedRole.name}</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role Name</label>
                    <p className="text-sm text-gray-900">{selectedRole.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedRole.is_active)}`}>
                      {selectedRole.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="text-sm text-gray-900">{selectedRole.description || 'No description'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Permissions</label>
                  {selectedRole.permissions && selectedRole.permissions.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {selectedRole.permissions.map((module) => (
                        <div key={module.module} className="bg-gray-50 rounded-lg p-3">
                          <h4 className="font-medium text-gray-900 capitalize mb-2">
                            {module.module.replace('_', ' ')}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {module.permissions.map((perm) => (
                              <span key={perm.id} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {perm.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No permissions assigned</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => {
                  setShowViewModal(false)
                  setSelectedRole(null)
                }}>
                  Close
                </Button>
                {!selectedRole.is_system_role && (
                  <Button
                    className="mofad-btn-primary"
                    onClick={() => {
                      setShowViewModal(false)
                      handleEdit(selectedRole)
                    }}
                  >
                    Edit Role
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Role Modal */}
        {showEditModal && editForm && selectedRole && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">Edit Role - {selectedRole.name}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    rows={2}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                  {allPermissions.length > 0 ? (
                    <PermissionsSelector form={editForm} setForm={setEditForm} />
                  ) : (
                    <p className="text-gray-500 text-sm">Loading permissions...</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => {
                  setShowEditModal(false)
                  setEditForm(null)
                  setSelectedRole(null)
                }}>
                  Cancel
                </Button>
                <Button className="mofad-btn-primary" onClick={handleUpdateRole} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    'Update Role'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Action Bar */}
        <BulkActionBar
          selectedCount={selection.selectedCount}
          onDelete={() => setShowBulkDeleteModal(true)}
          onClearSelection={selection.clearSelection}
        />

        {/* Bulk Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showBulkDeleteModal}
          onClose={() => setShowBulkDeleteModal(false)}
          onConfirm={handleBulkDelete}
          title="Delete Roles"
          message={`Are you sure you want to delete ${selection.selectedCount} role(s)? This action cannot be undone. Note: System roles cannot be deleted.`}
          confirmText="Delete"
          isLoading={isBulkDeleting}
          variant="danger"
        />
      </div>
    </AppLayout>
  )
}

export default RolesPage
