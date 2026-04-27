'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import {
  Truck,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react'

interface Vehicle {
  id: number
  registration_number: string
  make: string
  model: string
  year: number
  vehicle_type: 'truck' | 'van' | 'car' | 'motorcycle'
  status: 'active' | 'maintenance' | 'inactive'
  assigned_to?: string
  last_service_date: string
  next_service_date: string
  mileage: number
}

const mockVehicles: Vehicle[] = [
  {
    id: 1,
    registration_number: 'ABC-123-XY',
    make: 'Toyota',
    model: 'Hilux',
    year: 2022,
    vehicle_type: 'truck',
    status: 'active',
    assigned_to: 'John Doe',
    last_service_date: '2024-03-15',
    next_service_date: '2024-06-15',
    mileage: 45000,
  },
  {
    id: 2,
    registration_number: 'DEF-456-ZY',
    make: 'Mercedes',
    model: 'Sprinter',
    year: 2021,
    vehicle_type: 'van',
    status: 'maintenance',
    last_service_date: '2024-04-10',
    next_service_date: '2024-05-10',
    mileage: 78000,
  },
]

const getStatusBadge = (status: string) => {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    inactive: 'bg-gray-100 text-gray-800',
  }

  const icons: Record<string, any> = {
    active: <CheckCircle className="w-3 h-3" />,
    maintenance: <AlertTriangle className="w-3 h-3" />,
    inactive: <XCircle className="w-3 h-3" />,
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.inactive}`}>
      {icons[status]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export default function VehicleRegistryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [vehicles] = useState<Vehicle[]>(mockVehicles)
  const [selectedVehicles, setSelectedVehicles] = useState<number[]>([])

  const toggleVehicle = (id: number) => {
    setSelectedVehicles(prev =>
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    if (selectedVehicles.length === vehicles.length) {
      setSelectedVehicles([])
    } else {
      setSelectedVehicles(vehicles.map(v => v.id))
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vehicle Registry</h1>
            <p className="text-gray-600">Manage company vehicles and their details</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="bg-mofad-green hover:bg-mofad-green/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Vehicle
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Vehicles</p>
                  <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
                </div>
                <Truck className="w-8 h-8 text-mofad-green" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {vehicles.filter(v => v.status === 'active').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Maintenance</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {vehicles.filter(v => v.status === 'maintenance').length}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inactive</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {vehicles.filter(v => v.status === 'inactive').length}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vehicles by registration, make, model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green focus:border-mofad-green"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle List */}
        <Card>
          <CardHeader>
            <CardTitle>All Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-12 px-4 py-3">
                      <Checkbox
                        checked={selectedVehicles.length === vehicles.length && vehicles.length > 0}
                        onCheckedChange={toggleAll}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mileage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Next Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vehicles.map((vehicle) => (
                    <tr
                      key={vehicle.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        selectedVehicles.includes(vehicle.id) ? 'bg-green-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedVehicles.includes(vehicle.id)}
                          onCheckedChange={() => toggleVehicle(vehicle.id)}
                        />
                      </td>
                      <td className="px-6 py-3">
                        <div className="text-sm font-semibold text-gray-900">{vehicle.registration_number}</div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="text-sm text-gray-900">{vehicle.make} {vehicle.model}</div>
                        <div className="text-xs text-gray-500">Year: {vehicle.year}</div>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-sm text-gray-700 capitalize">{vehicle.vehicle_type}</span>
                      </td>
                      <td className="px-6 py-3">
                        {getStatusBadge(vehicle.status)}
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-sm text-gray-700">{vehicle.assigned_to || '-'}</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-sm text-gray-700">{vehicle.mileage.toLocaleString()} km</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-sm text-gray-700">{vehicle.next_service_date}</span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
