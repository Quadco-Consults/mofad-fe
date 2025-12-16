'use client'

import { useState } from 'react'
import { Plus, Search, MapPin, Wrench, Phone, TrendingUp, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Lubebay {
  id: string
  name: string
  location: string
  state: string
  manager: string
  phone: string
  status: 'active' | 'maintenance' | 'inactive'
  bays: number
  monthlyRevenue: number
  lastInspection: string
  services: string[]
  rating: number
}

const mockLubebays: Lubebay[] = [
  {
    id: 'LB001',
    name: 'Victoria Island Lubebay',
    location: 'Plot 123, Ahmadu Bello Way, Victoria Island',
    state: 'Lagos',
    manager: 'Emeka Okafor',
    phone: '+234 803 123 4567',
    status: 'active',
    bays: 6,
    monthlyRevenue: 850000,
    lastInspection: '2024-12-10',
    services: ['Oil Change', 'Filter Replacement', 'Quick Service'],
    rating: 4.8
  },
  {
    id: 'LB002',
    name: 'Ikeja Lubebay Center',
    location: '45, Obafemi Awolowo Way, Ikeja',
    state: 'Lagos',
    manager: 'Funmi Adebayo',
    phone: '+234 805 987 6543',
    status: 'active',
    bays: 4,
    monthlyRevenue: 620000,
    lastInspection: '2024-12-08',
    services: ['Oil Change', 'Brake Service', 'Tire Service'],
    rating: 4.6
  },
  {
    id: 'LB003',
    name: 'Abuja Central Lubebay',
    location: 'Area 11, Garki, Abuja',
    state: 'FCT',
    manager: 'Ahmed Usman',
    phone: '+234 807 456 7890',
    status: 'maintenance',
    bays: 5,
    monthlyRevenue: 420000,
    lastInspection: '2024-11-25',
    services: ['Oil Change', 'AC Service', 'Engine Diagnostics'],
    rating: 4.4
  },
  {
    id: 'LB004',
    name: 'Port Harcourt Lubebay',
    location: 'Mile 3, Diobu, Port Harcourt',
    state: 'Rivers',
    manager: 'Grace Okoro',
    phone: '+234 806 234 5678',
    status: 'active',
    bays: 3,
    monthlyRevenue: 380000,
    lastInspection: '2024-12-05',
    services: ['Oil Change', 'Quick Service'],
    rating: 4.5
  },
  {
    id: 'LB005',
    name: 'Kano Lubebay Station',
    location: 'Sabon Gari, Kano',
    state: 'Kano',
    manager: 'Ibrahim Musa',
    phone: '+234 808 345 6789',
    status: 'inactive',
    bays: 4,
    monthlyRevenue: 0,
    lastInspection: '2024-10-15',
    services: ['Oil Change', 'Filter Replacement'],
    rating: 4.2
  }
]

export default function LubebaysPage() {
  const [lubebays] = useState<Lubebay[]>(mockLubebays)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'maintenance' | 'inactive'>('all')

  const filteredLubebays = lubebays.filter(lubebay => {
    const matchesSearch = lubebay.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lubebay.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lubebay.state.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || lubebay.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-red-100 text-red-800'
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const totalLubebays = lubebays.length
  const activeLubebays = lubebays.filter(l => l.status === 'active').length
  const totalRevenue = lubebays.reduce((sum, l) => sum + l.monthlyRevenue, 0)
  const averageRating = lubebays.reduce((sum, l) => sum + l.rating, 0) / lubebays.length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lubebay Network</h1>
          <p className="text-gray-600">Manage MOFAD lubebay service centers</p>
        </div>
        <Button className="mofad-btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Lubebay
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="mofad-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Lubebays</p>
              <p className="text-2xl font-bold text-gray-900">{totalLubebays}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="mofad-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Centers</p>
              <p className="text-2xl font-bold text-green-600">{activeLubebays}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Wrench className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="mofad-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-primary-600">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="mofad-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-yellow-600">{averageRating.toFixed(1)}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <div className="text-yellow-600">⭐</div>
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
            placeholder="Search lubebays..."
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
          <option value="maintenance">Maintenance</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Lubebays Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredLubebays.map((lubebay) => (
          <div key={lubebay.id} className="mofad-card">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{lubebay.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(lubebay.status)}`}>
                    {lubebay.status.charAt(0).toUpperCase() + lubebay.status.slice(1)}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {lubebay.location}, {lubebay.state}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-1" />
                  {lubebay.phone}
                </div>
              </div>

              {lubebay.status === 'maintenance' && (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              )}
            </div>

            {/* Manager Info */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Manager</p>
              <p className="font-medium text-gray-900">{lubebay.manager}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-lg font-bold text-primary-600">{lubebay.bays}</p>
                <p className="text-xs text-gray-600">Service Bays</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">{formatCurrency(lubebay.monthlyRevenue)}</p>
                <p className="text-xs text-gray-600">Monthly Revenue</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-lg font-bold text-yellow-600">{lubebay.rating}</span>
                  <span className="text-yellow-500">⭐</span>
                </div>
                <p className="text-xs text-gray-600">Rating</p>
              </div>
            </div>

            {/* Services */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Services Offered</p>
              <div className="flex flex-wrap gap-1">
                {lubebay.services.map((service, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {service}
                  </span>
                ))}
              </div>
            </div>

            {/* Last Inspection */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Last Inspection:</span>
              <span className="font-medium">{new Date(lubebay.lastInspection).toLocaleDateString()}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
              <Button variant="outline" className="flex-1">
                View Details
              </Button>
              <Button variant="outline" className="flex-1">
                Manage
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredLubebays.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No lubebays found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}