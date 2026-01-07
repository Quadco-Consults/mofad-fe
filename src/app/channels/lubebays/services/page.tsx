'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Search, Clock, Wrench, DollarSign, TrendingUp, Edit, Trash2, X, Eye } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

interface LubebayService {
  id: string
  name: string
  description: string
  category: string
  duration: number // in minutes
  price: number
  popularity: number // percentage
  availability: string[]
  tools: string[]
  status: 'active' | 'inactive'
}

const mockServices: LubebayService[] = [
  {
    id: 'SRV001',
    name: 'Oil Change Service',
    description: 'Complete engine oil change with premium MOFAD lubricants',
    category: 'Engine Care',
    duration: 30,
    price: 15000,
    popularity: 95,
    availability: ['Victoria Island', 'Ikeja', 'Abuja Central', 'Port Harcourt'],
    tools: ['Hydraulic Lift', 'Oil Drain Pan', 'Oil Filter Wrench'],
    status: 'active'
  },
  {
    id: 'SRV002',
    name: 'Filter Replacement',
    description: 'Air, oil, and fuel filter replacement service',
    category: 'Maintenance',
    duration: 20,
    price: 8000,
    popularity: 78,
    availability: ['Victoria Island', 'Ikeja', 'Kano'],
    tools: ['Filter Wrenches', 'Air Compressor'],
    status: 'active'
  },
  {
    id: 'SRV003',
    name: 'Brake Service',
    description: 'Complete brake system inspection and service',
    category: 'Safety',
    duration: 45,
    price: 25000,
    popularity: 65,
    availability: ['Victoria Island', 'Ikeja', 'Abuja Central'],
    tools: ['Brake Fluid Tester', 'Brake Pad Tool'],
    status: 'active'
  },
  {
    id: 'SRV004',
    name: 'Engine Diagnostics',
    description: 'Computer diagnostic scan for engine performance',
    category: 'Diagnostics',
    duration: 60,
    price: 12000,
    popularity: 55,
    availability: ['Victoria Island', 'Abuja Central'],
    tools: ['OBD Scanner', 'Diagnostic Computer'],
    status: 'active'
  },
  {
    id: 'SRV005',
    name: 'AC Service',
    description: 'Air conditioning system maintenance and recharge',
    category: 'Comfort',
    duration: 40,
    price: 18000,
    popularity: 70,
    availability: ['Victoria Island', 'Ikeja', 'Abuja Central'],
    tools: ['AC Manifold Gauge', 'Refrigerant Recovery Machine'],
    status: 'active'
  },
  {
    id: 'SRV006',
    name: 'Tire Service',
    description: 'Tire rotation, balancing, and pressure check',
    category: 'Maintenance',
    duration: 25,
    price: 5000,
    popularity: 85,
    availability: ['Victoria Island', 'Ikeja', 'Port Harcourt'],
    tools: ['Tire Balancer', 'Air Compressor', 'Tire Pressure Gauge'],
    status: 'active'
  },
  {
    id: 'SRV007',
    name: 'Quick Service',
    description: 'Express multi-point vehicle inspection',
    category: 'Inspection',
    duration: 15,
    price: 3000,
    popularity: 90,
    availability: ['All Locations'],
    tools: ['Inspection Checklist', 'Basic Tools'],
    status: 'active'
  },
  {
    id: 'SRV008',
    name: 'Transmission Service',
    description: 'Transmission fluid change and inspection',
    category: 'Engine Care',
    duration: 50,
    price: 22000,
    popularity: 40,
    availability: ['Victoria Island', 'Abuja Central'],
    tools: ['Transmission Jack', 'Fluid Pump'],
    status: 'inactive'
  }
]

export default function LubebayServicesPage() {
  const [services, setServices] = useState<LubebayService[]>(mockServices)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Create service form state
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    category: '',
    duration: 30,
    price: 0,
    tools: [''],
    availability: [''],
    status: 'active' as 'active' | 'inactive'
  })

  const categories = Array.from(new Set(services.map(s => s.category)))
  const locations = ['Victoria Island', 'Ikeja', 'Abuja Central', 'Port Harcourt', 'Kano']

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getPopularityColor = (popularity: number) => {
    if (popularity >= 80) return 'text-green-600'
    if (popularity >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusBadge = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800'
  }

  // Add tool to create form
  const addTool = () => {
    setCreateForm(prev => ({
      ...prev,
      tools: [...prev.tools, '']
    }))
  }

  // Remove tool from create form
  const removeTool = (index: number) => {
    if (createForm.tools.length > 1) {
      setCreateForm(prev => ({
        ...prev,
        tools: prev.tools.filter((_, i) => i !== index)
      }))
    }
  }

  // Add location to create form
  const addLocation = () => {
    setCreateForm(prev => ({
      ...prev,
      availability: [...prev.availability, '']
    }))
  }

  // Remove location from create form
  const removeLocation = (index: number) => {
    if (createForm.availability.length > 1) {
      setCreateForm(prev => ({
        ...prev,
        availability: prev.availability.filter((_, i) => i !== index)
      }))
    }
  }

  // Reset create form
  const resetCreateForm = () => {
    setCreateForm({
      name: '',
      description: '',
      category: '',
      duration: 30,
      price: 0,
      tools: [''],
      availability: [''],
      status: 'active'
    })
  }

  // Handle create service
  const handleCreateService = () => {
    const newService: LubebayService = {
      id: `SRV${String(services.length + 1).padStart(3, '0')}`,
      name: createForm.name,
      description: createForm.description,
      category: createForm.category,
      duration: createForm.duration,
      price: createForm.price,
      popularity: 0,
      availability: createForm.availability.filter(loc => loc.trim() !== ''),
      tools: createForm.tools.filter(tool => tool.trim() !== ''),
      status: createForm.status
    }

    setServices(prev => [...prev, newService])
    setShowCreateModal(false)
    resetCreateForm()
  }

  const totalServices = services.length
  const activeServices = services.filter(s => s.status === 'active').length
  const avgPrice = services.reduce((sum, s) => sum + s.price, 0) / services.length
  const avgDuration = services.reduce((sum, s) => sum + s.duration, 0) / services.length

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">MOFAD Services</h1>
            <p className="text-muted-foreground">Manage service offerings across all lubebay centers and substores</p>
          </div>
          <Button
            className="mofad-btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Service
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Services</p>
                <p className="text-2xl font-bold text-gray-900">{totalServices}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Wrench className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Services</p>
                <p className="text-2xl font-bold text-green-600">{activeServices}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Service Price</p>
                <p className="text-2xl font-bold text-primary-600">{formatCurrency(avgPrice)}</p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Duration</p>
                <p className="text-2xl font-bold text-purple-600">{Math.round(avgDuration)} min</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-600" />
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
              placeholder="Search services..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

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

        {/* Services Table */}
        <Card>
          <CardContent className="p-0">
            {filteredServices.length === 0 ? (
              <div className="p-12 text-center">
                <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by creating your first service'}
                </p>
                <Button
                  className="mofad-btn-primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Service
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Service</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Duration</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Price</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Popularity</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Availability</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredServices.map((service) => (
                      <tr key={service.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{service.name}</div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">{service.description}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {service.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{service.duration} min</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-bold text-primary">{formatCurrency(service.price)}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-medium ${getPopularityColor(service.popularity)}`}>
                            {service.popularity}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(service.status)}`}>
                            {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {service.availability.slice(0, 2).map((location, index) => (
                              <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                {location}
                              </span>
                            ))}
                            {service.availability.length > 2 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{service.availability.length - 2} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex gap-1 justify-center">
                            <Button variant="ghost" size="sm" title="View Service">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Edit Service">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Delete Service">
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

        {/* Create Service Modal */}
        {showCreateModal && typeof window !== 'undefined' && createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Create New Service</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCreateModal(false)
                    resetCreateForm()
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Service Details */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Service Details</h4>

                  <div>
                    <label className="block text-sm font-medium mb-2">Service Name</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={createForm.name}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter service name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      rows={3}
                      value={createForm.description}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the service"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={createForm.category}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="e.g. Engine Care, Maintenance, Safety"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                      <input
                        type="number"
                        min="5"
                        step="5"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={createForm.duration}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, duration: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Price (₦)</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={createForm.price}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={createForm.status}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Tools and Availability */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Tools & Availability</h4>

                  {/* Tools Required */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium">Tools Required</label>
                      <Button size="sm" variant="outline" onClick={addTool}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Tool
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {createForm.tools.map((tool, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                            value={tool}
                            onChange={(e) => setCreateForm(prev => ({
                              ...prev,
                              tools: prev.tools.map((t, i) => i === index ? e.target.value : t)
                            }))}
                            placeholder="Tool name"
                          />
                          {createForm.tools.length > 1 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeTool(index)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium">Available At</label>
                      <Button size="sm" variant="outline" onClick={addLocation}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Location
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {createForm.availability.map((location, index) => (
                        <div key={index} className="flex gap-2">
                          <select
                            className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                            value={location}
                            onChange={(e) => setCreateForm(prev => ({
                              ...prev,
                              availability: prev.availability.map((l, i) => i === index ? e.target.value : l)
                            }))}
                          >
                            <option value="">Select location</option>
                            {locations.map(loc => (
                              <option key={loc} value={loc}>{loc}</option>
                            ))}
                            <option value="All Locations">All Locations</option>
                          </select>
                          {createForm.availability.length > 1 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeLocation(index)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                <Button
                  className="flex-1 mofad-btn-primary"
                  onClick={handleCreateService}
                  disabled={!createForm.name || !createForm.category || !createForm.price}
                >
                  Create Service
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowCreateModal(false)
                    resetCreateForm()
                  }}
                >
                  Cancel
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