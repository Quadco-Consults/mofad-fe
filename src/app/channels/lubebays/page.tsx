'use client'

import { useState } from 'react'
import { Plus, Search, MapPin, Wrench, Phone, TrendingUp, AlertTriangle, Eye, Edit, Trash2, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

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

      {/* Lubebays Table */}
      <Card>
        <CardContent className="p-0">
          {filteredLubebays.length === 0 ? (
            <div className="p-12 text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No lubebays found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first lubebay'}
              </p>
              <Button className="mofad-btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Lubebay
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Lubebay</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Manager</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Bays</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Monthly Revenue</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Rating</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Services</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Last Inspection</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLubebays.map((lubebay) => (
                    <tr key={lubebay.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Wrench className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{lubebay.name}</div>
                            <div className="text-sm text-gray-500">{lubebay.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-900 max-w-[200px] truncate">{lubebay.location}</div>
                            <div className="text-sm text-gray-500">{lubebay.state}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-gray-900">{lubebay.manager}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-600">{lubebay.phone}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-primary">{lubebay.bays}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-bold text-green-600">{formatCurrency(lubebay.monthlyRevenue)}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="font-medium text-gray-900">{lubebay.rating}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {lubebay.services.slice(0, 2).map((service, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {service}
                            </span>
                          ))}
                          {lubebay.services.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{lubebay.services.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-sm text-gray-600">
                          {new Date(lubebay.lastInspection).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center">
                          {lubebay.status === 'maintenance' && (
                            <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(lubebay.status)}`}>
                            {lubebay.status.charAt(0).toUpperCase() + lubebay.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Manage Lubebay"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Delete Lubebay"
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
    </div>
  )
}