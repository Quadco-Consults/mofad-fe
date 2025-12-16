'use client'

import { useState } from 'react'
import { Search, Plus, Edit, Trash2, Eye, Warehouse, MapPin, Users, Package } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AppLayout } from '@/components/layout/AppLayout'

interface WarehouseData {
  id: string
  code: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  manager: string
  phone: string
  email: string
  capacity: number
  currentStock: number
  status: 'active' | 'inactive' | 'maintenance'
  type: 'main' | 'distribution' | 'storage'
  operatingHours: string
  facilities: string[]
  coordinates?: { lat: number; lng: number }
}

const mockWarehouses: WarehouseData[] = [
  {
    id: '1',
    code: 'WHG-LG-001',
    name: 'Lagos Main Warehouse',
    address: 'Plot 15, Industrial Estate Road',
    city: 'Lagos',
    state: 'Lagos',
    zipCode: '100001',
    manager: 'Emeka Okafor',
    phone: '+234 807 456 7890',
    email: 'lagos.warehouse@mofadenergy.com',
    capacity: 50000,
    currentStock: 38500,
    status: 'active',
    type: 'main',
    operatingHours: '7:00 AM - 7:00 PM',
    facilities: ['Loading Dock', 'Cold Storage', 'Security', 'Fire Safety'],
    coordinates: { lat: 6.4474, lng: 3.3903 }
  },
  {
    id: '2',
    code: 'WHG-AB-001',
    name: 'Abuja Distribution Center',
    address: 'Area 10, Industrial Layout',
    city: 'Abuja',
    state: 'FCT',
    zipCode: '900001',
    manager: 'Fatima Abdullahi',
    phone: '+234 805 123 4567',
    email: 'abuja.warehouse@mofadenergy.com',
    capacity: 35000,
    currentStock: 28000,
    status: 'active',
    type: 'distribution',
    operatingHours: '6:00 AM - 6:00 PM',
    facilities: ['Loading Dock', 'Security', 'Office Space'],
    coordinates: { lat: 9.0579, lng: 7.4951 }
  },
  {
    id: '3',
    code: 'WHG-PH-001',
    name: 'Port Harcourt Warehouse',
    address: 'Trans-Amadi Industrial Layout',
    city: 'Port Harcourt',
    state: 'Rivers',
    zipCode: '500001',
    manager: 'Grace Okoro',
    phone: '+234 806 987 6543',
    email: 'portharcourt.warehouse@mofadenergy.com',
    capacity: 25000,
    currentStock: 19200,
    status: 'active',
    type: 'storage',
    operatingHours: '7:00 AM - 6:00 PM',
    facilities: ['Loading Dock', 'Security', 'Generator'],
    coordinates: { lat: 4.8156, lng: 7.0498 }
  },
  {
    id: '4',
    code: 'WHG-KN-001',
    name: 'Kano Storage Facility',
    address: 'Sharada Industrial Area',
    city: 'Kano',
    state: 'Kano',
    zipCode: '700001',
    manager: 'Ibrahim Musa',
    phone: '+234 808 234 5678',
    email: 'kano.warehouse@mofadenergy.com',
    capacity: 15000,
    currentStock: 12800,
    status: 'maintenance',
    type: 'storage',
    operatingHours: 'Temporarily Closed',
    facilities: ['Loading Dock', 'Security'],
    coordinates: { lat: 12.0022, lng: 8.5919 }
  },
  {
    id: '5',
    code: 'WHG-IB-001',
    name: 'Ibadan Regional Warehouse',
    address: 'Oluyole Industrial Estate',
    city: 'Ibadan',
    state: 'Oyo',
    zipCode: '200001',
    manager: 'Adebayo Olumide',
    phone: '+234 809 876 5432',
    email: 'ibadan.warehouse@mofadenergy.com',
    capacity: 20000,
    currentStock: 8500,
    status: 'inactive',
    type: 'storage',
    operatingHours: 'Closed',
    facilities: ['Loading Dock'],
    coordinates: { lat: 7.3775, lng: 3.9470 }
  }
]

function WarehousesPage() {
  const [warehouses] = useState<WarehouseData[]>(mockWarehouses)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [stateFilter, setStateFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseData | null>(null)

  const types = Array.from(new Set(warehouses.map(w => w.type)))
  const states = Array.from(new Set(warehouses.map(w => w.state)))

  const filteredWarehouses = warehouses.filter(warehouse => {
    const matchesSearch = warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warehouse.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warehouse.city.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || warehouse.status === statusFilter
    const matchesType = typeFilter === 'all' || warehouse.type === typeFilter
    const matchesState = stateFilter === 'all' || warehouse.state === stateFilter

    return matchesSearch && matchesStatus && matchesType && matchesState
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      maintenance: 'bg-yellow-100 text-yellow-800'
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const getTypeBadge = (type: string) => {
    const styles = {
      main: 'bg-blue-100 text-blue-800',
      distribution: 'bg-purple-100 text-purple-800',
      storage: 'bg-orange-100 text-orange-800'
    }
    return styles[type as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 75) return 'text-yellow-600'
    return 'text-green-600'
  }

  // Calculate summary stats
  const totalWarehouses = warehouses.length
  const activeWarehouses = warehouses.filter(w => w.status === 'active').length
  const totalCapacity = warehouses.reduce((sum, w) => sum + w.capacity, 0)
  const totalStock = warehouses.reduce((sum, w) => sum + w.currentStock, 0)

  const handleView = (warehouse: WarehouseData) => {
    setSelectedWarehouse(warehouse)
    setShowViewModal(true)
  }

  const handleEdit = (warehouse: WarehouseData) => {
    setSelectedWarehouse(warehouse)
    setShowEditModal(true)
  }

  const handleDelete = (warehouseId: string) => {
    if (confirm('Are you sure you want to delete this warehouse?')) {
      console.log('Deleting warehouse:', warehouseId)
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-NG').format(num)
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Warehouse Management</h1>
            <p className="text-gray-600">Manage warehouse locations and storage facilities</p>
          </div>
          <Button className="mofad-btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Warehouse
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Warehouses</p>
                <p className="text-2xl font-bold text-gray-900">{totalWarehouses}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Warehouse className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Warehouses</p>
                <p className="text-2xl font-bold text-green-600">{activeWarehouses}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Warehouse className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Capacity</p>
                <p className="text-2xl font-bold text-primary-600">{formatNumber(totalCapacity)}</p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Stock</p>
                <p className="text-2xl font-bold text-purple-600">{formatNumber(totalStock)}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-purple-600" />
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
              placeholder="Search warehouses..."
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
            <option value="maintenance">Maintenance</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            {types.map(type => (
              <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
            ))}
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
          >
            <option value="all">All States</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>

          <Button variant="outline">
            Export List
          </Button>
        </div>

        {/* Warehouses Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredWarehouses.map((warehouse) => {
            const utilization = (warehouse.currentStock / warehouse.capacity) * 100

            return (
              <div key={warehouse.id} className="mofad-card">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{warehouse.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(warehouse.status)}`}>
                        {warehouse.status.charAt(0).toUpperCase() + warehouse.status.slice(1)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(warehouse.type)}`}>
                        {warehouse.type.charAt(0).toUpperCase() + warehouse.type.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{warehouse.code}</p>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {warehouse.city}, {warehouse.state}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleView(warehouse)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(warehouse)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(warehouse.id)} className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Manager Info */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">{warehouse.manager}</span>
                  </div>
                  <p className="text-xs text-gray-600">{warehouse.phone}</p>
                  <p className="text-xs text-gray-600">{warehouse.email}</p>
                </div>

                {/* Capacity & Utilization */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Capacity Utilization</span>
                    <span className={`font-bold ${getUtilizationColor(utilization)}`}>
                      {utilization.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        utilization >= 90 ? 'bg-red-500' :
                        utilization >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(utilization, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{formatNumber(warehouse.currentStock)} units</span>
                    <span>{formatNumber(warehouse.capacity)} capacity</span>
                  </div>
                </div>

                {/* Facilities */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Facilities</p>
                  <div className="flex flex-wrap gap-1">
                    {warehouse.facilities.map((facility, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-200">
                  <span>Operating Hours:</span>
                  <span className="font-medium">{warehouse.operatingHours}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" className="flex-1">
                    View Inventory
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Edit Details
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {filteredWarehouses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No warehouses found matching your criteria.</p>
          </div>
        )}

        {/* Add Warehouse Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">Add New Warehouse</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse Name</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse Code</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" rows={2}></textarea>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                      <option>Select State</option>
                      <option>Lagos</option>
                      <option>Abuja</option>
                      <option>Rivers</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Manager Name</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input type="tel" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                      <option>Main</option>
                      <option>Distribution</option>
                      <option>Storage</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button className="mofad-btn-primary">Add Warehouse</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default WarehousesPage