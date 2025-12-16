'use client'

import { useState } from 'react'
import { Plus, Search, Clock, Wrench, DollarSign, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'

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
  const [services] = useState<LubebayService[]>(mockServices)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const categories = Array.from(new Set(services.map(s => s.category)))

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

  const totalServices = services.length
  const activeServices = services.filter(s => s.status === 'active').length
  const avgPrice = services.reduce((sum, s) => sum + s.price, 0) / services.length
  const avgDuration = services.reduce((sum, s) => sum + s.duration, 0) / services.length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lubebay Services</h1>
          <p className="text-gray-600">Manage service offerings across all lubebay centers</p>
        </div>
        <Button className="mofad-btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Service
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

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div key={service.id} className="mofad-card">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(service.status)}`}>
                    {service.status}
                  </span>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {service.category}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4">{service.description}</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-lg font-bold text-primary-600">{formatCurrency(service.price)}</p>
                <p className="text-xs text-gray-600">Price</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-purple-600">{service.duration} min</p>
                <p className="text-xs text-gray-600">Duration</p>
              </div>
              <div className="text-center">
                <p className={`text-lg font-bold ${getPopularityColor(service.popularity)}`}>
                  {service.popularity}%
                </p>
                <p className="text-xs text-gray-600">Popularity</p>
              </div>
            </div>

            {/* Tools Required */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Tools Required</p>
              <div className="flex flex-wrap gap-1">
                {service.tools.map((tool, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Available At</p>
              <div className="flex flex-wrap gap-1">
                {service.availability.map((location, index) => (
                  <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    {location}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <Button variant="outline" className="flex-1">
                Edit Service
              </Button>
              <Button variant="outline" className="flex-1">
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No services found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}