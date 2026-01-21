'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Pagination } from '@/components/ui/Pagination'
import { BulkActionBar } from '@/components/ui/BulkActionBar'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useSelection } from '@/hooks/useSelection'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Clock,
  Wrench,
  Star,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  Award,
  Car,
  Zap,
  Shield,
  Search as SearchIcon,
  Thermometer,
  RefreshCw,
} from 'lucide-react'

interface Service {
  id: number
  name: string
  code: string | null
  description: string | null
  category: string | null
  base_price: number
  minimum_price: number | null
  maximum_price: number | null
  estimated_duration: string | null
  maximum_daily_capacity: number
  requires_appointment: boolean
  requires_special_equipment: boolean
  equipment_notes: string | null
  requires_certification: boolean
  certification_notes: string | null
  tax_rate: number
  is_active: boolean
  is_seasonal: boolean
  seasonal_start: string | null
  seasonal_end: string | null
  created_at: string
  updated_at: string
}

const getCategoryIcon = (category: string | null | undefined) => {
  const safeCategory = (category || '').toLowerCase()
  switch (safeCategory) {
    case 'oil change':
      return <Wrench className="w-5 h-5 text-blue-500" />
    case 'wheel services':
      return <Car className="w-5 h-5 text-green-500" />
    case 'brake services':
      return <Shield className="w-5 h-5 text-red-500" />
    case 'transmission':
      return <Zap className="w-5 h-5 text-purple-500" />
    case 'engine services':
      return <SearchIcon className="w-5 h-5 text-orange-500" />
    case 'electrical':
      return <Zap className="w-5 h-5 text-yellow-500" />
    case 'cooling system':
      return <Thermometer className="w-5 h-5 text-cyan-500" />
    case 'ac services':
      return <Thermometer className="w-5 h-5 text-blue-400" />
    case 'filter services':
      return <Wrench className="w-5 h-5 text-gray-600" />
    // Legacy categories
    case 'maintenance':
      return <Wrench className="w-5 h-5 text-blue-500" />
    case 'cleaning':
      return <Car className="w-5 h-5 text-green-500" />
    case 'safety':
      return <Shield className="w-5 h-5 text-red-500" />
    case 'diagnostics':
      return <SearchIcon className="w-5 h-5 text-purple-500" />
    case 'hvac':
      return <Thermometer className="w-5 h-5 text-cyan-500" />
    default:
      return <Wrench className="w-5 h-5 text-gray-500" />
  }
}

const getStatusBadge = (isActive: boolean) => {
  return isActive ? (
    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
      Active
    </span>
  ) : (
    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
      Inactive
    </span>
  )
}

const getPopularityStars = (score: number) => {
  const stars = Math.floor(score / 20) // Convert 0-100 to 0-5 stars
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">({score}%)</span>
    </div>
  )
}

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [formData, setFormData] = useState<Partial<Service>>({
    name: '',
    code: '',
    description: '',
    category: 'oil_change',
    base_price: 0,
    minimum_price: 0,
    maximum_price: 0,
    is_active: true
  })

  const queryClient = useQueryClient()
  const { addToast } = useToast()

  // Selection hook for bulk operations
  const selection = useSelection<Service>()

  const { data: servicesData, isLoading, refetch } = useQuery({
    queryKey: ['services-list', searchTerm, categoryFilter, statusFilter, currentPage, pageSize],
    queryFn: async () => {
      const params: any = { page: currentPage, size: pageSize }
      if (searchTerm) params.search = searchTerm
      if (categoryFilter !== 'all') params.category = categoryFilter
      if (statusFilter !== 'all') params.is_active = statusFilter === 'active'
      return apiClient.getServices(params)
    },
  })

  // Extract data from response - handle both paginated and non-paginated responses
  const services: Service[] = Array.isArray(servicesData)
    ? servicesData
    : servicesData?.results || servicesData?.data?.results || []

  // Extract pagination info
  const totalCount = servicesData?.paginator?.count || servicesData?.count || services.length
  const totalPages = servicesData?.paginator?.total_pages || Math.ceil(totalCount / pageSize) || 1

  // Mutations
  const createServiceMutation = useMutation({
    mutationFn: (data: Partial<Service>) => apiClient.createService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services-list'] })
      setShowCreateModal(false)
      resetForm()
    }
  })

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<Service> }) =>
      apiClient.updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services-list'] })
      setShowEditModal(false)
      resetForm()
    }
  })

  const deleteServiceMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services-list'] })
      setShowDeleteModal(false)
      setSelectedService(null)
      addToast({ type: 'success', title: 'Success', message: 'Service deleted successfully' })
    },
    onError: (error: any) => {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to delete service' })
    }
  })

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: (number | string)[]) => apiClient.bulkDeleteServices(ids),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['services-list'] })
      setShowBulkDeleteModal(false)
      selection.clearSelection()

      if (response.failed_count > 0) {
        addToast({
          type: 'warning',
          title: 'Partial Success',
          message: `Deleted ${response.deleted_count} services. ${response.failed_count} failed.`
        })
      } else {
        addToast({
          type: 'success',
          title: 'Success',
          message: `Successfully deleted ${response.deleted_count} services`
        })
      }
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to delete services'
      })
    }
  })

  // Helper functions
  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      category: 'oil_change',
      base_price: 0,
      minimum_price: 0,
      maximum_price: 0,
      is_active: true
    })
    setSelectedService(null)
  }

  const openCreateModal = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const openEditModal = (service: Service) => {
    setSelectedService(service)
    setFormData({
      name: service.name,
      code: service.code || '',
      description: service.description || '',
      category: service.category || 'oil_change',
      base_price: service.base_price,
      minimum_price: service.minimum_price || 0,
      maximum_price: service.maximum_price || 0,
      is_active: service.is_active
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (service: Service) => {
    setSelectedService(service)
    setShowDeleteModal(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedService) {
      updateServiceMutation.mutate({ id: selectedService.id, data: formData })
    } else {
      createServiceMutation.mutate(formData)
    }
  }

  const handleDelete = () => {
    if (selectedService) {
      deleteServiceMutation.mutate(selectedService.id)
    }
  }

  // Services are now filtered server-side via API params
  // Using services directly from the API response

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Services</h1>
            <p className="text-muted-foreground">Manage service offerings and pricing</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="mofad-btn-primary" onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Services</p>
                  <p className="text-2xl font-bold text-primary">8</p>
                </div>
                <Wrench className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-green-600">7</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold text-secondary">890</p>
                </div>
                <Calendar className="w-8 h-8 text-secondary/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                  <p className="text-2xl font-bold text-accent">4.2</p>
                </div>
                <Award className="w-8 h-8 text-accent/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold text-primary">₦2.8M</p>
                </div>
                <DollarSign className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search services..."
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <select
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="Oil Change">Oil Change</option>
                  <option value="Wheel Services">Wheel Services</option>
                  <option value="Brake Services">Brake Services</option>
                  <option value="Transmission">Transmission</option>
                  <option value="Engine Services">Engine Services</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Cooling System">Cooling System</option>
                  <option value="AC Services">AC Services</option>
                  <option value="Filter Services">Filter Services</option>
                </select>

                <select
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 py-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4 mt-2"></div>
                      </div>
                      <div className="w-20 h-4 bg-gray-200 rounded"></div>
                      <div className="w-24 h-4 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : services.length === 0 ? (
              <div className="p-12 text-center">
                <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first service'}
                </p>
                <Button className="mofad-btn-primary" onClick={openCreateModal}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="w-12 py-3 px-4">
                        <Checkbox
                          checked={selection.isAllSelected(services)}
                          indeterminate={selection.isPartiallySelected(services)}
                          onChange={() => selection.toggleAll(services)}
                        />
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Service</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Code</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Base Price</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Min Price</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Max Price</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {services.map((service: Service) => (
                      <tr
                        key={service.id}
                        className={`hover:bg-gray-50 ${selection.isSelected(service.id) ? 'bg-primary-50' : ''}`}
                      >
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selection.isSelected(service.id)}
                            onChange={() => selection.toggle(service.id)}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {getCategoryIcon(service.category)}
                            <div>
                              <div className="font-medium text-gray-900">{service.name || 'Unnamed Service'}</div>
                              <div className="text-sm text-gray-500">ID: {service.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm text-gray-700">{service.code || '-'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-700">{service.category || '-'}</span>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <p className="text-sm text-gray-600 truncate" title={service.description || ''}>
                            {service.description || '-'}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-bold text-primary">
                            {formatCurrency(service.base_price || 0)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm text-gray-700">
                            {service.minimum_price ? formatCurrency(service.minimum_price) : '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm text-gray-700">
                            {service.maximum_price ? formatCurrency(service.maximum_price) : '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(service.is_active)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="View Service"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Edit Service"
                              onClick={() => openEditModal(service)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Delete Service"
                              onClick={() => openDeleteModal(service)}
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

            {/* Pagination */}
            {totalCount > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                className="border-t"
              />
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Modal */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {selectedService ? 'Edit Service' : 'Create New Service'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Service Name *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter service name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Service Code</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.code || ''}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="Auto-generated if empty"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Category *</label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="oil_change">Oil Change</option>
                      <option value="car_wash">Car Wash</option>
                      <option value="tire_service">Tire Service</option>
                      <option value="battery_service">Battery Service</option>
                      <option value="brake_service">Brake Service</option>
                      <option value="engine_service">Engine Service</option>
                      <option value="ac_service">AC Service</option>
                      <option value="diagnostic">Diagnostic</option>
                      <option value="filter">Filter</option>
                      <option value="commission">Commission</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.is_active ? 'active' : 'inactive'}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter service description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Base Price (₦) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.base_price}
                      onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Minimum Price (₦)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.minimum_price || ''}
                      onChange={(e) => setFormData({ ...formData, minimum_price: parseFloat(e.target.value) || null })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Maximum Price (₦)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.maximum_price || ''}
                      onChange={(e) => setFormData({ ...formData, maximum_price: parseFloat(e.target.value) || null })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false)
                      setShowEditModal(false)
                      resetForm()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="mofad-btn-primary"
                    disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
                  >
                    {createServiceMutation.isPending || updateServiceMutation.isPending ? 'Saving...' :
                     selectedService ? 'Update Service' : 'Create Service'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmDialog
          open={showDeleteModal && !!selectedService}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedService(null)
          }}
          onConfirm={handleDelete}
          title="Delete Service"
          message={
            selectedService ? (
              <>
                Are you sure you want to delete <strong>{selectedService.name}</strong>?
                This action cannot be undone.
              </>
            ) : ''
          }
          confirmText="Delete Service"
          variant="danger"
          isLoading={deleteServiceMutation.isPending}
        />

        {/* Bulk Delete Confirmation Modal */}
        <ConfirmDialog
          open={showBulkDeleteModal}
          onClose={() => setShowBulkDeleteModal(false)}
          onConfirm={() => bulkDeleteMutation.mutate(selection.selectedIds)}
          title="Delete Multiple Services"
          message={`Are you sure you want to delete ${selection.selectedCount} service${selection.selectedCount > 1 ? 's' : ''}? This action cannot be undone.`}
          confirmText={`Delete ${selection.selectedCount} Service${selection.selectedCount > 1 ? 's' : ''}`}
          variant="danger"
          isLoading={bulkDeleteMutation.isPending}
        />

        {/* Bulk Action Bar */}
        <BulkActionBar
          selectedCount={selection.selectedCount}
          onClearSelection={selection.clearSelection}
          onBulkDelete={() => setShowBulkDeleteModal(true)}
          isDeleting={bulkDeleteMutation.isPending}
          entityName="service"
        />
      </div>
    </AppLayout>
  )
}