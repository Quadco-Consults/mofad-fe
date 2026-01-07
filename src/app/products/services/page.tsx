'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import mockApi from '@/lib/mockApi'
import { formatCurrency, formatDateTime } from '@/lib/utils'
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
} from 'lucide-react'

interface Service {
  id: number
  service_name: string
  description: string
  duration_minutes: number
  base_price: number
  materials_cost: number
  labor_cost: number
  category: string
  status: 'active' | 'inactive'
  popularity_score: number
  bookings_this_month: number
  created_at: string
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
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

const getStatusBadge = (status: string) => {
  const colors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
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
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [formData, setFormData] = useState<Partial<Service>>({
    service_name: '',
    description: '',
    duration_minutes: 30,
    base_price: 0,
    materials_cost: 0,
    labor_cost: 0,
    category: 'Maintenance',
    status: 'active'
  })

  const queryClient = useQueryClient()

  const { data: servicesList, isLoading } = useQuery({
    queryKey: ['services-list'],
    queryFn: () => mockApi.get('/services'),
  })

  const services = servicesList || []

  // Mutations
  const createServiceMutation = useMutation({
    mutationFn: (data: Partial<Service>) => mockApi.post('/services', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services-list'] })
      setShowCreateModal(false)
      resetForm()
    }
  })

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<Service> }) =>
      mockApi.patch(`/services/${id}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services-list'] })
      setShowEditModal(false)
      resetForm()
    }
  })

  const deleteServiceMutation = useMutation({
    mutationFn: (id: number) => mockApi.delete(`/services/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services-list'] })
      setShowDeleteModal(false)
      setSelectedService(null)
    }
  })

  // Helper functions
  const resetForm = () => {
    setFormData({
      service_name: '',
      description: '',
      duration_minutes: 30,
      base_price: 0,
      materials_cost: 0,
      labor_cost: 0,
      category: 'Maintenance',
      status: 'active'
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
      service_name: service.service_name,
      description: service.description,
      duration_minutes: service.duration_minutes,
      base_price: service.base_price,
      materials_cost: service.materials_cost,
      labor_cost: service.labor_cost,
      category: service.category,
      status: service.status
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

  // Filter services
  const filteredServices = services.filter((service: Service) => {
    const matchesSearch = service.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

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
            ) : filteredServices.length === 0 ? (
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
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Service</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Duration</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Base Price</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Materials</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Labor</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Margin</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Popularity</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Bookings</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredServices.map((service: Service) => (
                      <tr key={service.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {getCategoryIcon(service.category)}
                            <div>
                              <div className="font-medium text-gray-900">{service.service_name}</div>
                              <div className="text-sm text-gray-500">ID: {service.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-700">{service.category}</span>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <p className="text-sm text-gray-600 truncate" title={service.description}>
                            {service.description}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium">{service.duration_minutes} mins</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-bold text-primary">
                            {formatCurrency(service.base_price)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm text-gray-700">
                            {formatCurrency(service.materials_cost)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm text-gray-700">
                            {formatCurrency(service.labor_cost)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-bold text-green-600">
                            {(((service.base_price - service.materials_cost - service.labor_cost) / service.base_price) * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center">
                            {getPopularityStars(service.popularity_score)}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{service.bookings_this_month}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(service.status)}
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
                      value={formData.service_name}
                      onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                      placeholder="Enter service name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Category *</label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="Maintenance">Maintenance</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Safety">Safety</option>
                      <option value="Diagnostics">Diagnostics</option>
                      <option value="HVAC">HVAC</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description *</label>
                  <textarea
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter service description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Duration (minutes) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                    />
                  </div>

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
                    <label className="block text-sm font-medium mb-1">Materials Cost (₦)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.materials_cost}
                      onChange={(e) => setFormData({ ...formData, materials_cost: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Labor Cost (₦)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.labor_cost}
                      onChange={(e) => setFormData({ ...formData, labor_cost: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
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
        {showDeleteModal && selectedService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4 text-red-600">Delete Service</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{selectedService.service_name}</strong>?
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setSelectedService(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={deleteServiceMutation.isPending}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {deleteServiceMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}