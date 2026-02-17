'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  Plus, Search, MapPin, Car, Phone, TrendingUp, AlertTriangle,
  Eye, Edit, Trash2, X, Save, Loader2, Droplets
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Pagination } from '@/components/ui/Pagination'
import apiClient from '@/lib/apiClient'
import { useToast } from '@/components/ui/Toast'
import { formatCurrency } from '@/lib/utils'

interface CarWash {
  id: string | number
  name: string
  code: string
  address: string | null
  state_name: string | null
  location_name: string | null
  manager_name: string | null
  phone: string | null
  email: string | null
  is_active: boolean
  current_balance: string
  opening_time: string | null
  closing_time: string | null
}

export default function CarWashPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCarWash, setSelectedCarWash] = useState<any>(null)

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    location: null as number | null,
    state: null as number | null,
    manager: null as number | null,
    phone: '',
    email: '',
    notes: ''
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch supporting data
  const { data: statesData } = useQuery({
    queryKey: ['states'],
    queryFn: () => apiClient.get('/states/')
  })
  const states = statesData?.results || (Array.isArray(statesData) ? statesData : [])

  const { data: locationsData } = useQuery({
    queryKey: ['locations'],
    queryFn: () => apiClient.get('/locations/')
  })
  const locations = locationsData?.results || (Array.isArray(locationsData) ? locationsData : [])

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.get('/users/')
  })
  const users = usersData?.results || (Array.isArray(usersData) ? usersData : [])

  // Fetch car washes
  const { data: carWashData, isLoading, error, refetch } = useQuery({
    queryKey: ['carwashes', currentPage, pageSize, searchTerm, statusFilter],
    queryFn: async () => {
      const params: Record<string, string> = {
        page: String(currentPage),
        size: String(pageSize),
      }
      if (statusFilter !== 'all') params.is_active = statusFilter === 'active' ? 'true' : 'false'
      if (searchTerm) params.search = searchTerm
      return apiClient.get('/carwashes/', params)
    },
  })

  const extractResults = (data: any) => {
    if (Array.isArray(data)) return data
    if (data?.results && Array.isArray(data.results)) return data.results
    return []
  }

  const totalCount = carWashData?.paginator?.count ?? carWashData?.count ?? 0
  const totalPages = carWashData?.paginator?.total_pages ?? Math.ceil(totalCount / pageSize)
  const carWashes = extractResults(carWashData)

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/carwashes/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carwashes'] })
      addToast({ type: 'success', title: 'Success', message: 'Car wash created successfully' })
      setShowCreateModal(false)
      resetForm()
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to create car wash' })
      if (error.errors) setFormErrors(error.errors)
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiClient.put(`/carwashes/${selectedCarWash.id}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carwashes'] })
      addToast({ type: 'success', title: 'Success', message: 'Car wash updated successfully' })
      setShowEditModal(false)
      resetForm()
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to update car wash' })
      if (error.errors) setFormErrors(error.errors)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/carwashes/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carwashes'] })
      addToast({ type: 'success', title: 'Success', message: 'Car wash deleted successfully' })
      setShowDeleteModal(false)
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to delete car wash' })
    }
  })

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!formData.name.trim()) errors.name = 'Car wash name is required'
    if (!formData.state) errors.state = 'State is required'
    if (!formData.phone.trim()) errors.phone = 'Phone number is required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const resetForm = () => {
    setFormData({ name: '', address: '', location: null, state: null, manager: null, phone: '', email: '', notes: '' })
    setFormErrors({})
    setIsSubmitting(false)
  }

  const handleCreateClick = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const handleEditClick = (cw: any) => {
    setFormData({
      name: cw.name || '',
      address: cw.address || '',
      location: cw.location || null,
      state: cw.state || null,
      manager: cw.manager || null,
      phone: cw.phone || '',
      email: cw.email || '',
      notes: cw.notes || ''
    })
    setSelectedCarWash(cw)
    setFormErrors({})
    setShowEditModal(true)
  }

  const handleDeleteClick = (cw: any) => {
    setSelectedCarWash(cw)
    setShowDeleteModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsSubmitting(true)
    try {
      if (showCreateModal) await createMutation.mutateAsync(formData)
      else if (showEditModal) await updateMutation.mutateAsync(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredCarWashes = carWashes.filter((cw: CarWash) => {
    const name = cw.name || ''
    const address = cw.address || ''
    const state = cw.state_name || ''
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      state.toLowerCase().includes(searchTerm.toLowerCase())
    const isActiveStatus = cw.is_active ? 'active' : 'inactive'
    const matchesStatus = statusFilter === 'all' || isActiveStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalCarWashes = carWashes.length
  const activeCarWashes = carWashes.filter((cw: CarWash) => cw.is_active).length

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Car Wash Network</h1>
            <p className="text-muted-foreground">Manage MOFAD car wash locations</p>
          </div>
          <Button className="mofad-btn-primary" onClick={handleCreateClick}>
            <Plus className="h-4 w-4 mr-2" />
            Add Car Wash
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Locations</p>
                <p className="text-2xl font-bold text-gray-900">{totalCarWashes}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Droplets className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Locations</p>
                <p className="text-2xl font-bold text-green-600">{activeCarWashes}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Car className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Combined Balance</p>
                <p className="text-2xl font-bold text-primary-600">
                  {formatCurrency(
                    carWashes.reduce((sum: number, cw: CarWash) => sum + parseFloat(cw.current_balance || '0'), 0)
                  )}
                </p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search car washes..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Car Washes Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 py-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                        <div className="h-3 bg-gray-200 rounded w-1/4 mt-2" />
                      </div>
                      <div className="w-20 h-4 bg-gray-200 rounded" />
                      <div className="w-24 h-4 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Car Washes</h3>
                <p className="text-gray-500 mb-4">{error instanceof Error ? error.message : 'Failed to load car washes'}</p>
                <Button className="mofad-btn-primary" onClick={() => refetch()}>Try Again</Button>
              </div>
            ) : filteredCarWashes.length === 0 ? (
              <div className="p-12 text-center">
                <Droplets className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No car washes found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first car wash location'}
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <Button className="mofad-btn-primary" onClick={handleCreateClick}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Car Wash
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Car Wash</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Location</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Manager</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Balance</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredCarWashes.map((cw: CarWash) => (
                      <tr key={cw.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                              <Droplets className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{cw.name}</div>
                              <div className="text-sm text-gray-500">{cw.code}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <div>
                              <div className="text-sm text-gray-900 max-w-[200px] truncate">{cw.address || 'N/A'}</div>
                              <div className="text-sm text-gray-500">{cw.state_name || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-gray-900">{cw.manager_name || 'N/A'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600">{cw.phone || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-bold text-green-600">
                            {formatCurrency(parseFloat(cw.current_balance || '0'))}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            cw.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {cw.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="View Dashboard"
                              onClick={() => router.push(`/channels/carwash/${cw.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Edit"
                              onClick={() => handleEditClick(cw)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Delete"
                              onClick={() => handleDeleteClick(cw)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}

        {/* Create / Edit Modal */}
        {(showCreateModal || showEditModal) && createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {showCreateModal ? 'Add New Car Wash' : 'Edit Car Wash'}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => { setShowCreateModal(false); setShowEditModal(false); resetForm() }} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Car Wash Name *</label>
                    <input
                      type="text"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${formErrors.name ? 'border-red-300' : 'border-gray-300'}`}
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter car wash name"
                    />
                    {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <select
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${formErrors.state ? 'border-red-300' : 'border-gray-300'}`}
                      value={formData.state || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value ? Number(e.target.value) : null }))}
                    >
                      <option value="">Select State</option>
                      {states.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    {formErrors.state && <p className="text-red-500 text-xs mt-1">{formErrors.state}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.location || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value ? Number(e.target.value) : null }))}
                    >
                      <option value="">Select Location (Optional)</option>
                      {locations.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter full address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.manager || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, manager: e.target.value ? Number(e.target.value) : null }))}
                    >
                      <option value="">Select Manager (Optional)</option>
                      {users.map((u: any) => (
                        <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.email})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input
                      type="tel"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${formErrors.phone ? 'border-red-300' : 'border-gray-300'}`}
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+234 xxx xxx xxxx"
                    />
                    {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@example.com"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => { setShowCreateModal(false); setShowEditModal(false); resetForm() }} className="flex-1" disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 mofad-btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{showCreateModal ? 'Creating...' : 'Updating...'}</>
                    ) : (
                      <><Save className="w-4 h-4 mr-2" />{showCreateModal ? 'Create Car Wash' : 'Update Car Wash'}</>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedCarWash && createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Car Wash</h3>
                  <p className="text-gray-500">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <span className="font-semibold">{selectedCarWash.name}</span>?
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="flex-1" disabled={deleteMutation.isPending}>
                  Cancel
                </Button>
                <Button
                  onClick={() => deleteMutation.mutate(selectedCarWash.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Deleting...</> : <><Trash2 className="w-4 h-4 mr-2" />Delete</>}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </AppLayout>
  )
}
