'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, UserCheck, UserX, MapPin, Mail, Phone, Building, Calendar, Shield, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AppLayout } from '@/components/layout/AppLayout'
import api from '@/lib/apiClient'

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

interface EntityAccess {
  has_all_warehouse_access: boolean
  has_all_substore_access: boolean
  has_all_lubebay_access: boolean
  accessible_warehouses: Array<{ id: number; name: string; code: string }>
  accessible_substores: Array<{ id: number; name: string; code: string }>
  accessible_lubebays: Array<{ id: number; name: string; code: string }>
}

function UserDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [entityAccess, setEntityAccess] = useState<EntityAccess | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [loadingEntityAccess, setLoadingEntityAccess] = useState(false)

  useEffect(() => {
    fetchUserDetails()
  }, [userId])

  const fetchUserDetails = async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const [userData, entityData] = await Promise.all([
        api.getUserById(parseInt(userId)),
        api.getUserEntityAccess(parseInt(userId)).catch(() => null),
      ])

      setUser(userData)
      setEntityAccess(entityData)
    } catch (error: any) {
      console.error('Error fetching user details:', error)
      setErrorMessage(error.message || 'Failed to load user details')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString || dateString === 'null' || dateString === '') return 'Not set'

    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Date not available'

    return date.toLocaleString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800 border border-green-200'
      : 'bg-red-100 text-red-800 border border-red-200'
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            <span className="ml-2 text-gray-600">Loading user details...</span>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (errorMessage || !user) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <div className="h-2 w-2 bg-red-500 rounded-full mr-3"></div>
            <p className="text-red-800 font-medium">{errorMessage || 'User not found'}</p>
          </div>
          <div className="mt-4">
            <Button variant="outline" onClick={() => router.push('/settings/users')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push('/settings/users')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
              <p className="text-gray-600">View detailed information about this user</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchUserDetails}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 font-bold text-3xl">
                {user.first_name?.[0]}{user.last_name?.[0]}
              </span>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{user.full_name}</h2>
                  <p className="text-gray-600 text-lg">{user.role}</p>
                </div>
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusBadge(user.is_active)}`}>
                  {user.is_active ? (
                    <>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Active
                    </>
                  ) : (
                    <>
                      <UserX className="h-4 w-4 mr-2" />
                      Inactive
                    </>
                  )}
                </span>
              </div>

              {user.employee_id && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 bg-blue-50 border border-blue-200 rounded-md text-sm font-medium text-blue-800">
                    Employee ID: {user.employee_id}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email Address</p>
                  <p className="text-base text-gray-900">{user.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone Number</p>
                  <p className="text-base text-gray-900">{user.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Employment Details */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Employment Details</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Role</p>
                  <p className="text-base text-gray-900">{user.role}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Department</p>
                  <p className="text-base text-gray-900">{user.department || 'Not assigned'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date Joined</p>
                  <p className="text-base text-gray-900">{formatDateTime(user.date_joined)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <UserCheck className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Staff Status</p>
                  <p className="text-base text-gray-900">{user.is_staff ? 'Staff Member' : 'Regular User'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Entity Access */}
        {entityAccess && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                Entity Access
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Warehouses */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">Warehouses</h4>
                    {entityAccess.has_all_warehouse_access && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">All Access</span>
                    )}
                  </div>
                  {entityAccess.has_all_warehouse_access ? (
                    <p className="text-sm text-gray-600">Access to all warehouses</p>
                  ) : entityAccess.accessible_warehouses.length > 0 ? (
                    <ul className="space-y-2">
                      {entityAccess.accessible_warehouses.map(warehouse => (
                        <li key={warehouse.id} className="text-sm text-gray-700 flex items-center">
                          <div className="h-1.5 w-1.5 bg-green-500 rounded-full mr-2"></div>
                          {warehouse.name} ({warehouse.code})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No warehouse access</p>
                  )}
                </div>

                {/* Substores */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">Substores</h4>
                    {entityAccess.has_all_substore_access && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">All Access</span>
                    )}
                  </div>
                  {entityAccess.has_all_substore_access ? (
                    <p className="text-sm text-gray-600">Access to all substores</p>
                  ) : entityAccess.accessible_substores.length > 0 ? (
                    <ul className="space-y-2">
                      {entityAccess.accessible_substores.map(substore => (
                        <li key={substore.id} className="text-sm text-gray-700 flex items-center">
                          <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mr-2"></div>
                          {substore.name} ({substore.code})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No substore access</p>
                  )}
                </div>

                {/* Lubebays */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">Lubebays</h4>
                    {entityAccess.has_all_lubebay_access && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">All Access</span>
                    )}
                  </div>
                  {entityAccess.has_all_lubebay_access ? (
                    <p className="text-sm text-gray-600">Access to all lubebays</p>
                  ) : entityAccess.accessible_lubebays.length > 0 ? (
                    <ul className="space-y-2">
                      {entityAccess.accessible_lubebays.map(lubebay => (
                        <li key={lubebay.id} className="text-sm text-gray-700 flex items-center">
                          <div className="h-1.5 w-1.5 bg-purple-500 rounded-full mr-2"></div>
                          {lubebay.name} ({lubebay.code})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No lubebay access</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default UserDetailsPage
