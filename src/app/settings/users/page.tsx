'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Edit, Trash2, Eye, Users, Shield, UserCheck, UserX, Loader2, RefreshCw, MapPin, Building, Store } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { BulkActionBar } from '@/components/ui/BulkActionBar'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useSelection } from '@/hooks/useSelection'
import { AppLayout } from '@/components/layout/AppLayout'
import api from '@/lib/api-client'

interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  full_name: string
  phone: string | null
  role: string
  department: string | null
  employee_id: string | null
  is_active: boolean
  is_staff: boolean
  date_joined: string
  entity_access?: {
    has_all_warehouse_access: boolean
    has_all_substore_access: boolean
    has_all_lubebay_access: boolean
    warehouse_count: number | string
    substore_count: number | string
    lubebay_count: number | string
  }
}

interface Entity {
  id: number
  name: string
  code: string
}

interface EntityAccessForm {
  has_all_warehouse_access: boolean
  has_all_substore_access: boolean
  has_all_lubebay_access: boolean
  warehouse_ids: number[]
  substore_ids: number[]
  lubebay_ids: number[]
}

interface NewUserForm {
  email: string
  password: string
  confirm_password: string
  first_name: string
  last_name: string
  phone: string
  role: string
  department: string
  employee_id: string
  send_welcome_email: boolean
}

const initialNewUserForm: NewUserForm = {
  email: '',
  password: '',
  confirm_password: '',
  first_name: '',
  last_name: '',
  phone: '',
  role: 'user',
  department: '',
  employee_id: '',
  send_welcome_email: true,
}

const systemRoles = [
  { value: 'admin', label: 'Administrator' },
  { value: 'manager', label: 'Manager' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'storekeeper', label: 'Store Keeper' },
  { value: 'user', label: 'Regular User' },
]

const departments = [
  'Sales & Marketing',
  'Finance & Accounts',
  'Operations',
  'Human Resources',
  'Information Technology',
  'Administration',
  'Management',
  'Warehouse',
]

function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalActiveCount, setTotalActiveCount] = useState(0)
  const [totalInactiveCount, setTotalInactiveCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Selection hook for bulk operations
  const selection = useSelection<User>()
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [editForm, setEditForm] = useState<Partial<User> | null>(null)
  const [newUserForm, setNewUserForm] = useState<NewUserForm>(initialNewUserForm)

  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Entity Access State
  const [showEntityAccessModal, setShowEntityAccessModal] = useState(false)
  const [entityAccessUser, setEntityAccessUser] = useState<User | null>(null)
  const [entityAccessForm, setEntityAccessForm] = useState<EntityAccessForm>({
    has_all_warehouse_access: false,
    has_all_substore_access: false,
    has_all_lubebay_access: false,
    warehouse_ids: [],
    substore_ids: [],
    lubebay_ids: [],
  })
  const [allWarehouses, setAllWarehouses] = useState<Entity[]>([])
  const [allSubstores, setAllSubstores] = useState<Entity[]>([])
  const [allLubebays, setAllLubebays] = useState<Entity[]>([])
  const [loadingEntities, setLoadingEntities] = useState(false)

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const params: any = {
        page: currentPage,
        page_size: pageSize,
      }
      if (searchTerm) params.search = searchTerm
      if (roleFilter !== 'all') params.role = roleFilter
      if (statusFilter !== 'all') params.is_active = statusFilter === 'active'
      if (departmentFilter !== 'all') params.department = departmentFilter

      const response = await api.getUsers(params)

      // Handle both paginated and non-paginated responses
      // Backend returns: { paginator: { count, page, total_pages, ... }, results: [...] }
      if (Array.isArray(response)) {
        setUsers(response)
        setTotalCount(response.length)
      } else if (response.results) {
        setUsers(response.results)
        // Check for count in paginator object (custom pagination) or at top level (standard DRF)
        const count = response.paginator?.count ?? response.count ?? response.results.length
        setTotalCount(count)
      } else {
        setUsers([])
        setTotalCount(0)
      }

      // Fetch total active/inactive counts separately (without pagination)
      try {
        const [activeResponse, inactiveResponse] = await Promise.all([
          api.getUsers({ is_active: true, page_size: 1 }),
          api.getUsers({ is_active: false, page_size: 1 }),
        ])
        // Handle both custom pagination (paginator.count) and standard DRF (count)
        const getCount = (resp: any) => {
          if (Array.isArray(resp)) return resp.length
          return resp.paginator?.count ?? resp.count ?? 0
        }
        setTotalActiveCount(getCount(activeResponse))
        setTotalInactiveCount(getCount(inactiveResponse))
      } catch (statsError) {
        // If stats fail, calculate from current page (fallback)
        console.warn('Failed to fetch user stats:', statsError)
      }
    } catch (error: any) {
      console.error('Error fetching users:', error)
      setErrorMessage(error.message || 'Failed to load users')
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, roleFilter, statusFilter, departmentFilter, currentPage, pageSize])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Debounce search and reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, roleFilter, statusFilter, departmentFilter])

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

  const getRoleLabel = (role: string) => {
    const roleObj = systemRoles.find(r => r.value === role)
    return roleObj ? roleObj.label : role
  }

  // Calculate summary stats and pagination
  const totalPages = Math.ceil(totalCount / pageSize)
  const startRecord = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0
  const endRecord = Math.min(currentPage * pageSize, totalCount)

  const handleView = (user: User) => {
    setSelectedUser(user)
    setShowViewModal(true)
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setEditForm({
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone || '',
      role: user.role,
      department: user.department || '',
      employee_id: user.employee_id || '',
      is_active: user.is_active,
    })
    setShowEditModal(true)
  }

  const handleDelete = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      setIsSaving(true)
      await api.deleteUser(userId)
      showSuccess('User deleted successfully')
      fetchUsers()
    } catch (error: any) {
      showError(error.message || 'Failed to delete user')
    } finally {
      setIsSaving(false)
    }
  }

  const handleBulkDelete = async () => {
    try {
      setIsBulkDeleting(true)
      const ids = selection.selectedIds as number[]

      // Delete users one by one (or use bulk delete API if available)
      let successCount = 0
      let failCount = 0

      for (const id of ids) {
        try {
          await api.deleteUser(id)
          successCount++
        } catch {
          failCount++
        }
      }

      setShowBulkDeleteModal(false)
      selection.clearSelection()

      if (failCount > 0) {
        showError(`Deleted ${successCount} users. ${failCount} failed.`)
      } else {
        showSuccess(`Successfully deleted ${successCount} users`)
      }

      fetchUsers()
    } catch (error: any) {
      showError(error.message || 'Failed to delete users')
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const handleToggleStatus = async (user: User) => {
    const action = user.is_active ? 'deactivate' : 'activate'
    if (!confirm(`Are you sure you want to ${action} this user?`)) {
      return
    }

    try {
      setIsSaving(true)
      if (user.is_active) {
        await api.deactivateUser(user.id)
      } else {
        await api.activateUser(user.id)
      }
      showSuccess(`User ${action}d successfully`)
      fetchUsers()
    } catch (error: any) {
      showError(error.message || `Failed to ${action} user`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateUser = async () => {
    // Validate form
    if (!newUserForm.email || !newUserForm.password || !newUserForm.first_name || !newUserForm.last_name) {
      showError('Please fill in all required fields')
      return
    }

    if (newUserForm.password !== newUserForm.confirm_password) {
      showError('Passwords do not match')
      return
    }

    if (newUserForm.password.length < 8) {
      showError('Password must be at least 8 characters')
      return
    }

    try {
      setIsSaving(true)
      await api.createUser(newUserForm)
      showSuccess('User created successfully. Welcome email has been sent.')
      setShowAddModal(false)
      setNewUserForm(initialNewUserForm)
      fetchUsers()
    } catch (error: any) {
      showError(error.message || 'Failed to create user')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateUser = async () => {
    if (!selectedUser || !editForm) return

    try {
      setIsSaving(true)
      await api.updateUser(selectedUser.id, editForm)
      showSuccess('User updated successfully')
      setShowEditModal(false)
      setEditForm(null)
      setSelectedUser(null)
      fetchUsers()
    } catch (error: any) {
      showError(error.message || 'Failed to update user')
    } finally {
      setIsSaving(false)
    }
  }

  // Generate a random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewUserForm({
      ...newUserForm,
      password,
      confirm_password: password
    })
  }

  // Entity Access Management
  const fetchAllEntities = async () => {
    setLoadingEntities(true)
    try {
      const [warehousesRes, substoresRes, lubebaysRes] = await Promise.all([
        api.getWarehouses({ is_active: true }).catch(() => []),
        api.getSubstores({ is_active: true }).catch(() => []),
        api.getLubebays({ is_active: true }).catch(() => []),
      ])

      // Handle paginated responses
      const warehouses = Array.isArray(warehousesRes) ? warehousesRes : (warehousesRes as any)?.results || []
      const substores = Array.isArray(substoresRes) ? substoresRes : (substoresRes as any)?.results || []
      const lubebays = Array.isArray(lubebaysRes) ? lubebaysRes : (lubebaysRes as any)?.results || []

      setAllWarehouses(warehouses)
      setAllSubstores(substores)
      setAllLubebays(lubebays)
    } catch (error) {
      console.error('Error fetching entities:', error)
    } finally {
      setLoadingEntities(false)
    }
  }

  const handleOpenEntityAccess = async (user: User) => {
    setEntityAccessUser(user)
    setLoadingEntities(true)
    setShowEntityAccessModal(true)

    try {
      // Fetch all available entities
      await fetchAllEntities()

      // Fetch user's current entity access
      const userAccess = await api.getUserEntityAccess(user.id)

      setEntityAccessForm({
        has_all_warehouse_access: userAccess.has_all_warehouse_access || false,
        has_all_substore_access: userAccess.has_all_substore_access || false,
        has_all_lubebay_access: userAccess.has_all_lubebay_access || false,
        warehouse_ids: (userAccess.accessible_warehouses || []).map((w: Entity) => w.id),
        substore_ids: (userAccess.accessible_substores || []).map((s: Entity) => s.id),
        lubebay_ids: (userAccess.accessible_lubebays || []).map((l: Entity) => l.id),
      })
    } catch (error: any) {
      showError(error.message || 'Failed to load entity access')
      setShowEntityAccessModal(false)
    } finally {
      setLoadingEntities(false)
    }
  }

  const handleSaveEntityAccess = async () => {
    if (!entityAccessUser) return

    try {
      setIsSaving(true)
      await api.updateUserEntityAccess(entityAccessUser.id, entityAccessForm)
      showSuccess('Entity access updated successfully')
      setShowEntityAccessModal(false)
      setEntityAccessUser(null)
      fetchUsers()
    } catch (error: any) {
      showError(error.message || 'Failed to update entity access')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleEntityId = (type: 'warehouse_ids' | 'substore_ids' | 'lubebay_ids', id: number) => {
    setEntityAccessForm(prev => ({
      ...prev,
      [type]: prev[type].includes(id)
        ? prev[type].filter(i => i !== id)
        : [...prev[type], id]
    }))
  }

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
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage system users, roles, and permissions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchUsers} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="mofad-btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-green-600">{totalActiveCount}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive Users</p>
                <p className="text-2xl font-bold text-red-600">{totalInactiveCount}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <UserX className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-purple-600">
                  {new Set(users.map(u => u.department).filter(Boolean)).size}
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            {systemRoles.map(role => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <Button variant="outline" disabled>
            Export Users
          </Button>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-500" />
              <span className="ml-2 text-gray-600">Loading users...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No users found matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-12 px-4 py-3">
                      <Checkbox
                        checked={selection.isAllSelected(users)}
                        indeterminate={selection.isPartiallySelected(users)}
                        onChange={() => selection.toggleAll(users)}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role & Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${selection.isSelected(user.id) ? 'bg-primary/5' : ''}`}>
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selection.isSelected(user.id)}
                          onChange={() => selection.toggle(user.id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-green-600 font-medium text-sm">
                              {user.first_name?.[0]}{user.last_name?.[0]}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.employee_id && (
                              <div className="text-xs text-gray-400">{user.employee_id}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{getRoleLabel(user.role)}</div>
                        <div className="text-sm text-gray-500">{user.department || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(user.is_active)}`}>
                          {user.is_active ? (
                            <>
                              <UserCheck className="h-3 w-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <UserX className="h-3 w-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDateTime(user.date_joined)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(user)}
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(user)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(user)}
                            className={user.is_active ? "text-yellow-600 hover:text-yellow-700" : "text-green-600 hover:text-green-700"}
                            title={user.is_active ? "Deactivate" : "Activate"}
                          >
                            {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEntityAccess(user)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Entity Access"
                          >
                            <MapPin className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalCount > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing {startRecord} to {endRecord} of {totalCount} users
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1 || isLoading}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        disabled={isLoading}
                        className={currentPage === pageNum ? "bg-green-500 hover:bg-green-600" : ""}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || isLoading}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages || isLoading}
                >
                  Last
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">Add New User</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={newUserForm.first_name}
                      onChange={(e) => setNewUserForm({ ...newUserForm, first_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={newUserForm.last_name}
                      onChange={(e) => setNewUserForm({ ...newUserForm, last_name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={newUserForm.email}
                      onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={newUserForm.phone}
                      onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        value={newUserForm.password}
                        onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                        placeholder="Min 8 characters"
                      />
                      <Button variant="outline" onClick={generatePassword} type="button">
                        Generate
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={newUserForm.confirm_password}
                      onChange={(e) => setNewUserForm({ ...newUserForm, confirm_password: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={newUserForm.role}
                      onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    >
                      {systemRoles.map(role => (
                        <option key={role.value} value={role.value}>{role.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={newUserForm.department}
                      onChange={(e) => setNewUserForm({ ...newUserForm, department: e.target.value })}
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={newUserForm.employee_id}
                      onChange={(e) => setNewUserForm({ ...newUserForm, employee_id: e.target.value })}
                      placeholder="e.g. MOFAD-001"
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="send_welcome_email"
                    checked={newUserForm.send_welcome_email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, send_welcome_email: e.target.checked })}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="send_welcome_email" className="ml-2 text-sm text-gray-700">
                    Send welcome email with login credentials
                  </label>
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => {
                  setShowAddModal(false)
                  setNewUserForm(initialNewUserForm)
                }}>
                  Cancel
                </Button>
                <Button className="mofad-btn-primary" onClick={handleCreateUser} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Create User'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* View User Modal */}
        {showViewModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <h3 className="text-lg font-bold mb-4">User Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="text-sm text-gray-900">{selectedUser.full_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                    <p className="text-sm text-gray-900">{selectedUser.employee_id || '-'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-sm text-gray-900">{selectedUser.phone || '-'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <p className="text-sm text-gray-900">{getRoleLabel(selectedUser.role)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <p className="text-sm text-gray-900">{selectedUser.department || '-'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedUser.is_active)}`}>
                      {selectedUser.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date Joined</label>
                    <p className="text-sm text-gray-900">{formatDateTime(selectedUser.date_joined)}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => setShowViewModal(false)}>Close</Button>
                <Button
                  className="mofad-btn-primary"
                  onClick={() => {
                    setShowViewModal(false)
                    handleEdit(selectedUser)
                  }}
                >
                  Edit User
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && editForm && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">Edit User - {selectedUser.full_name}</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={editForm.first_name || ''}
                      onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={editForm.last_name || ''}
                      onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={editForm.employee_id || ''}
                      onChange={(e) => setEditForm({ ...editForm, employee_id: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={editForm.role || ''}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    >
                      {systemRoles.map(role => (
                        <option key={role.value} value={role.value}>{role.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      value={editForm.department || ''}
                      onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    value={editForm.is_active ? 'active' : 'inactive'}
                    onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === 'active' })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => {
                  setShowEditModal(false)
                  setEditForm(null)
                  setSelectedUser(null)
                }}>
                  Cancel
                </Button>
                <Button className="mofad-btn-primary" onClick={handleUpdateUser} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    'Update User'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Entity Access Modal */}
        {showEntityAccessModal && entityAccessUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                Entity Access - {entityAccessUser.full_name}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Configure which warehouses, substores, and lubebays this user can access.
              </p>

              {loadingEntities ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                  <span className="ml-2 text-gray-600">Loading entities...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Warehouses Section */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Building className="h-5 w-5 mr-2 text-gray-600" />
                        <h4 className="font-semibold">Warehouses</h4>
                        <span className="ml-2 text-sm text-gray-500">
                          ({entityAccessForm.has_all_warehouse_access ? 'All' : entityAccessForm.warehouse_ids.length} selected)
                        </span>
                      </div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={entityAccessForm.has_all_warehouse_access}
                          onChange={(e) => setEntityAccessForm(prev => ({
                            ...prev,
                            has_all_warehouse_access: e.target.checked,
                            warehouse_ids: e.target.checked ? [] : prev.warehouse_ids
                          }))}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-2"
                        />
                        <span className="text-sm font-medium">Access to all warehouses</span>
                      </label>
                    </div>
                    {!entityAccessForm.has_all_warehouse_access && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                        {allWarehouses.length === 0 ? (
                          <p className="text-sm text-gray-500 col-span-3">No warehouses available</p>
                        ) : (
                          allWarehouses.map(warehouse => (
                            <label key={warehouse.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                              <input
                                type="checkbox"
                                checked={entityAccessForm.warehouse_ids.includes(warehouse.id)}
                                onChange={() => toggleEntityId('warehouse_ids', warehouse.id)}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-2"
                              />
                              <span className="text-sm">{warehouse.name}</span>
                              {warehouse.code && (
                                <span className="ml-1 text-xs text-gray-400">({warehouse.code})</span>
                              )}
                            </label>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Substores Section */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Store className="h-5 w-5 mr-2 text-gray-600" />
                        <h4 className="font-semibold">Substores</h4>
                        <span className="ml-2 text-sm text-gray-500">
                          ({entityAccessForm.has_all_substore_access ? 'All' : entityAccessForm.substore_ids.length} selected)
                        </span>
                      </div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={entityAccessForm.has_all_substore_access}
                          onChange={(e) => setEntityAccessForm(prev => ({
                            ...prev,
                            has_all_substore_access: e.target.checked,
                            substore_ids: e.target.checked ? [] : prev.substore_ids
                          }))}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-2"
                        />
                        <span className="text-sm font-medium">Access to all substores</span>
                      </label>
                    </div>
                    {!entityAccessForm.has_all_substore_access && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                        {allSubstores.length === 0 ? (
                          <p className="text-sm text-gray-500 col-span-3">No substores available</p>
                        ) : (
                          allSubstores.map(substore => (
                            <label key={substore.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                              <input
                                type="checkbox"
                                checked={entityAccessForm.substore_ids.includes(substore.id)}
                                onChange={() => toggleEntityId('substore_ids', substore.id)}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-2"
                              />
                              <span className="text-sm">{substore.name}</span>
                              {substore.code && (
                                <span className="ml-1 text-xs text-gray-400">({substore.code})</span>
                              )}
                            </label>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Lubebays Section */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-gray-600" />
                        <h4 className="font-semibold">Lubebays</h4>
                        <span className="ml-2 text-sm text-gray-500">
                          ({entityAccessForm.has_all_lubebay_access ? 'All' : entityAccessForm.lubebay_ids.length} selected)
                        </span>
                      </div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={entityAccessForm.has_all_lubebay_access}
                          onChange={(e) => setEntityAccessForm(prev => ({
                            ...prev,
                            has_all_lubebay_access: e.target.checked,
                            lubebay_ids: e.target.checked ? [] : prev.lubebay_ids
                          }))}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-2"
                        />
                        <span className="text-sm font-medium">Access to all lubebays</span>
                      </label>
                    </div>
                    {!entityAccessForm.has_all_lubebay_access && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                        {allLubebays.length === 0 ? (
                          <p className="text-sm text-gray-500 col-span-3">No lubebays available</p>
                        ) : (
                          allLubebays.map(lubebay => (
                            <label key={lubebay.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                              <input
                                type="checkbox"
                                checked={entityAccessForm.lubebay_ids.includes(lubebay.id)}
                                onChange={() => toggleEntityId('lubebay_ids', lubebay.id)}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-2"
                              />
                              <span className="text-sm">{lubebay.name}</span>
                              {lubebay.code && (
                                <span className="ml-1 text-xs text-gray-400">({lubebay.code})</span>
                              )}
                            </label>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => {
                  setShowEntityAccessModal(false)
                  setEntityAccessUser(null)
                }}>
                  Cancel
                </Button>
                <Button
                  className="mofad-btn-primary"
                  onClick={handleSaveEntityAccess}
                  disabled={isSaving || loadingEntities}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Entity Access'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Delete Confirmation Modal */}
        <ConfirmDialog
          open={showBulkDeleteModal}
          onClose={() => setShowBulkDeleteModal(false)}
          onConfirm={handleBulkDelete}
          title="Delete Multiple Users"
          message={`Are you sure you want to delete ${selection.selectedCount} user${selection.selectedCount > 1 ? 's' : ''}? This action cannot be undone.`}
          confirmText={`Delete ${selection.selectedCount} User${selection.selectedCount > 1 ? 's' : ''}`}
          variant="danger"
          isLoading={isBulkDeleting}
        />

        {/* Bulk Action Bar */}
        <BulkActionBar
          selectedCount={selection.selectedCount}
          onClearSelection={selection.clearSelection}
          onBulkDelete={() => setShowBulkDeleteModal(true)}
          isDeleting={isBulkDeleting}
          entityName="user"
        />
      </div>
    </AppLayout>
  )
}

export default UsersPage
