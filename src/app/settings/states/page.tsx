'use client'

import { useState } from 'react'
import { Search, Plus, Edit, Trash2, Eye, MapPin, Users, Building2, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AppLayout } from '@/components/layout/AppLayout'

interface StateData {
  id: string
  name: string
  code: string
  capital: string
  zone: string
  population: number
  area: number
  customers: number
  warehouses: number
  revenue: number
  status: 'active' | 'inactive'
  taxRate: number
  coordinates: { lat: number; lng: number }
}

const mockStates: StateData[] = [
  {
    id: '1',
    name: 'Lagos',
    code: 'LG',
    capital: 'Ikeja',
    zone: 'South West',
    population: 15000000,
    area: 3345,
    customers: 89,
    warehouses: 2,
    revenue: 145000000,
    status: 'active',
    taxRate: 5.0,
    coordinates: { lat: 6.5244, lng: 3.3792 }
  },
  {
    id: '2',
    name: 'Abuja (FCT)',
    code: 'FC',
    capital: 'Abuja',
    zone: 'North Central',
    population: 3000000,
    area: 8000,
    customers: 45,
    warehouses: 1,
    revenue: 85000000,
    status: 'active',
    taxRate: 5.0,
    coordinates: { lat: 9.0765, lng: 7.3986 }
  },
  {
    id: '3',
    name: 'Rivers',
    code: 'RV',
    capital: 'Port Harcourt',
    zone: 'South South',
    population: 7000000,
    area: 11077,
    customers: 67,
    warehouses: 1,
    revenue: 92000000,
    status: 'active',
    taxRate: 5.5,
    coordinates: { lat: 4.8156, lng: 7.0498 }
  },
  {
    id: '4',
    name: 'Kano',
    code: 'KN',
    capital: 'Kano',
    zone: 'North West',
    population: 13000000,
    area: 20131,
    customers: 34,
    warehouses: 1,
    revenue: 45000000,
    status: 'active',
    taxRate: 4.5,
    coordinates: { lat: 12.0022, lng: 8.5919 }
  },
  {
    id: '5',
    name: 'Oyo',
    code: 'OY',
    capital: 'Ibadan',
    zone: 'South West',
    population: 8000000,
    area: 28454,
    customers: 23,
    warehouses: 1,
    revenue: 28000000,
    status: 'active',
    taxRate: 5.0,
    coordinates: { lat: 7.3775, lng: 3.9470 }
  },
  {
    id: '6',
    name: 'Kaduna',
    code: 'KD',
    capital: 'Kaduna',
    zone: 'North West',
    population: 8000000,
    area: 46053,
    customers: 18,
    warehouses: 0,
    revenue: 15000000,
    status: 'active',
    taxRate: 4.5,
    coordinates: { lat: 10.5105, lng: 7.4165 }
  },
  {
    id: '7',
    name: 'Delta',
    code: 'DT',
    capital: 'Asaba',
    zone: 'South South',
    population: 5000000,
    area: 17698,
    customers: 29,
    warehouses: 0,
    revenue: 35000000,
    status: 'active',
    taxRate: 5.0,
    coordinates: { lat: 6.2084, lng: 6.7333 }
  },
  {
    id: '8',
    name: 'Anambra',
    code: 'AN',
    capital: 'Awka',
    zone: 'South East',
    population: 5500000,
    area: 4844,
    customers: 31,
    warehouses: 0,
    revenue: 42000000,
    status: 'active',
    taxRate: 5.5,
    coordinates: { lat: 6.2107, lng: 6.9834 }
  },
  {
    id: '9',
    name: 'Cross River',
    code: 'CR',
    capital: 'Calabar',
    zone: 'South South',
    population: 3000000,
    area: 20156,
    customers: 12,
    warehouses: 0,
    revenue: 8000000,
    status: 'inactive',
    taxRate: 5.0,
    coordinates: { lat: 4.9517, lng: 8.3417 }
  }
]

function StatesPage() {
  const [states] = useState<StateData[]>(mockStates)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [zoneFilter, setZoneFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedState, setSelectedState] = useState<StateData | null>(null)

  const zones = Array.from(new Set(states.map(s => s.zone)))

  const filteredStates = states.filter(state => {
    const matchesSearch = state.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         state.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         state.capital.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || state.status === statusFilter
    const matchesZone = zoneFilter === 'all' || state.zone === zoneFilter

    return matchesSearch && matchesStatus && matchesZone
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-NG').format(num)
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800'
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const getZoneColor = (zone: string) => {
    const colors = {
      'South West': 'bg-blue-100 text-blue-800',
      'South East': 'bg-green-100 text-green-800',
      'South South': 'bg-purple-100 text-purple-800',
      'North West': 'bg-orange-100 text-orange-800',
      'North East': 'bg-red-100 text-red-800',
      'North Central': 'bg-indigo-100 text-indigo-800'
    }
    return colors[zone as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  // Calculate summary stats
  const totalStates = states.length
  const activeStates = states.filter(s => s.status === 'active').length
  const totalCustomers = states.reduce((sum, s) => sum + s.customers, 0)
  const totalRevenue = states.reduce((sum, s) => sum + s.revenue, 0)

  const handleView = (state: StateData) => {
    setSelectedState(state)
    setShowViewModal(true)
  }

  const handleEdit = (state: StateData) => {
    setSelectedState(state)
    setShowEditModal(true)
  }

  const handleDelete = (stateId: string) => {
    if (confirm('Are you sure you want to remove this state from the system?')) {
      console.log('Removing state:', stateId)
    }
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">States & Territories</h1>
            <p className="text-gray-600">Manage geographical regions and state-specific settings</p>
          </div>
          <Button className="mofad-btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add State
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total States</p>
                <p className="text-2xl font-bold text-gray-900">{totalStates}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active States</p>
                <p className="text-2xl font-bold text-green-600">{activeStates}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-primary-600">{formatNumber(totalCustomers)}</p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search states..."
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

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
          >
            <option value="all">All Zones</option>
            {zones.map(zone => (
              <option key={zone} value={zone}>{zone}</option>
            ))}
          </select>

          <Button variant="outline">
            Export Data
          </Button>
        </div>

        {/* States Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStates.map((state) => (
            <div key={state.id} className="mofad-card">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{state.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(state.status)}`}>
                      {state.status.charAt(0).toUpperCase() + state.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getZoneColor(state.zone)}`}>
                      {state.zone}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded font-mono">
                      {state.code}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    Capital: {state.capital}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleView(state)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(state)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(state.id)} className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="h-4 w-4 text-primary-600" />
                    <span className="text-lg font-bold text-primary-600">{state.customers}</span>
                  </div>
                  <p className="text-xs text-gray-600">Customers</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Building2 className="h-4 w-4 text-green-600" />
                    <span className="text-lg font-bold text-green-600">{state.warehouses}</span>
                  </div>
                  <p className="text-xs text-gray-600">Warehouses</p>
                </div>
              </div>

              {/* Revenue */}
              <div className="mb-4 text-center p-3 bg-primary-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-900 mb-1">
                  {formatCurrency(state.revenue)}
                </div>
                <div className="text-sm text-primary-700">Total Revenue</div>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Population</span>
                  <span className="font-medium text-gray-900">{formatNumber(state.population)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Area (km²)</span>
                  <span className="font-medium text-gray-900">{formatNumber(state.area)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax Rate</span>
                  <span className="font-medium text-gray-900">{state.taxRate}%</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-200">
                <Button variant="outline" className="flex-1">
                  View Customers
                </Button>
                <Button variant="outline" className="flex-1">
                  Edit Settings
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredStates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No states found matching your criteria.</p>
          </div>
        )}

        {/* Add State Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">Add New State</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State Name</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State Code</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" maxLength={2} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Capital</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                      <option>Select Zone</option>
                      <option>South West</option>
                      <option>South East</option>
                      <option>South South</option>
                      <option>North West</option>
                      <option>North East</option>
                      <option>North Central</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Population</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Area (km²)</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                    <input type="number" step="0.1" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                    <input type="number" step="0.000001" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                    <input type="number" step="0.000001" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button className="mofad-btn-primary">Add State</Button>
              </div>
            </div>
          </div>
        )}

        {/* View State Modal */}
        {showViewModal && selectedState && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <h3 className="text-lg font-bold mb-4">State Details - {selectedState.name}</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">State Code</label>
                    <p className="text-sm text-gray-900 font-mono">{selectedState.code}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Capital</label>
                    <p className="text-sm text-gray-900">{selectedState.capital}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Zone</label>
                    <p className="text-sm text-gray-900">{selectedState.zone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Population</label>
                    <p className="text-sm text-gray-900">{formatNumber(selectedState.population)}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Area</label>
                    <p className="text-sm text-gray-900">{formatNumber(selectedState.area)} km²</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tax Rate</label>
                    <p className="text-sm text-gray-900">{selectedState.taxRate}%</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Revenue</label>
                    <p className="text-lg font-bold text-primary-600">{formatCurrency(selectedState.revenue)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customers</label>
                    <p className="text-sm text-gray-900">{selectedState.customers}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => setShowViewModal(false)}>Close</Button>
                <Button className="mofad-btn-primary">Edit State</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default StatesPage