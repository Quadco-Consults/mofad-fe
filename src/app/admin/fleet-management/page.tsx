'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatNumber } from '@/lib/utils'
import {
  Truck,
  Car,
  Bus,
  Navigation,
  Fuel,
  Wrench,
  Calendar,
  MapPin,
  User,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Plus,
  Download,
  Filter,
  Search,
  RefreshCw,
  Settings,
  Phone,
  Mail,
  Shield,
  Target,
  Activity,
  Route
} from 'lucide-react'

interface Vehicle {
  id: string
  registrationNumber: string
  vehicleType: 'tanker' | 'truck' | 'van' | 'car' | 'bus' | 'motorcycle'
  make: string
  model: string
  year: number
  capacity?: number // liters for tankers
  status: 'active' | 'maintenance' | 'repair' | 'retired' | 'accident'
  location: string
  driver?: {
    name: string
    phone: string
    licenseNumber: string
    licenseExpiry: string
  }
  lastService: string
  nextService: string
  mileage: number
  fuelEfficiency: number // km/L
  insurance: {
    provider: string
    policyNumber: string
    expiryDate: string
    premium: number
  }
  gpsTracking: {
    deviceId: string
    lastUpdate: string
    coordinates: {
      lat: number
      lng: number
    }
    speed: number
  }
  maintenanceHistory: MaintenanceRecord[]
  documents: VehicleDocument[]
}

interface MaintenanceRecord {
  id: string
  date: string
  type: 'service' | 'repair' | 'inspection' | 'accident'
  description: string
  cost: number
  workshop: string
  nextDue?: string
}

interface VehicleDocument {
  id: string
  type: 'registration' | 'insurance' | 'license' | 'inspection' | 'other'
  name: string
  expiryDate?: string
  status: 'valid' | 'expired' | 'expiring'
}

interface FleetSummary {
  totalVehicles: number
  activeVehicles: number
  inMaintenance: number
  fuelCostThisMonth: number
  maintenanceCostThisMonth: number
  averageFuelEfficiency: number
  documentsExpiring: number
  accidentCount: number
}

const VehicleTypeBadge = ({ type }: { type: string }) => {
  const typeConfig = {
    tanker: { color: 'bg-blue-100 text-blue-800', icon: Truck },
    truck: { color: 'bg-green-100 text-green-800', icon: Truck },
    van: { color: 'bg-purple-100 text-purple-800', icon: Car },
    car: { color: 'bg-orange-100 text-orange-800', icon: Car },
    bus: { color: 'bg-red-100 text-red-800', icon: Bus },
    motorcycle: { color: 'bg-yellow-100 text-yellow-800', icon: Car }
  }

  const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.car
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  )
}

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    maintenance: { color: 'bg-yellow-100 text-yellow-800', icon: Wrench },
    repair: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
    retired: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
    accident: { color: 'bg-red-100 text-red-800', icon: AlertTriangle }
  }

  const config = statusConfig[status as keyof typeof statusConfig]
  const Icon = config?.icon || Clock

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config?.color || 'bg-gray-100 text-gray-800'}`}>
      <Icon className="w-3 h-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

const MetricCard = ({ title, value, subtitle, icon: Icon, trend, color = 'orange', unit = '' }: any) => {
  const colors = {
    orange: 'from-orange-500 to-orange-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
    yellow: 'from-yellow-500 to-yellow-600'
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">
              {unit === 'currency' ? formatCurrency(value) :
               unit === 'kmpl' ? `${value} km/L` :
               unit === 'percentage' ? `${value}%` : value}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]} text-white group-hover:scale-110 transition-transform`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        {trend !== undefined && (
          <div className="mt-4 flex items-center text-sm">
            {trend > 0 ? (
              <TrendingUp className={`h-4 w-4 mr-1 ${color === 'red' ? 'text-red-600' : 'text-green-600'}`} />
            ) : (
              <TrendingDown className={`h-4 w-4 mr-1 ${color === 'red' ? 'text-green-600' : 'text-red-600'}`} />
            )}
            <span className={trend > 0 ? (color === 'red' ? 'text-red-600' : 'text-green-600') : (color === 'red' ? 'text-green-600' : 'text-red-600')}>
              {Math.abs(trend)}% vs last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function FleetManagementPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')

  const { data: fleetData, isLoading, refetch } = useQuery({
    queryKey: ['fleet', statusFilter, typeFilter, locationFilter],
    queryFn: () => apiClient.get(`/admin/fleet?status=${statusFilter}&type=${typeFilter}&location=${locationFilter}`),
  })

  // Mock data for development
  const mockSummary: FleetSummary = {
    totalVehicles: 45,
    activeVehicles: 38,
    inMaintenance: 5,
    fuelCostThisMonth: 3750000,
    maintenanceCostThisMonth: 1850000,
    averageFuelEfficiency: 7.8,
    documentsExpiring: 8,
    accidentCount: 2
  }

  const mockVehicles: Vehicle[] = [
    {
      id: 'VEH001',
      registrationNumber: 'ABC-123-XY',
      vehicleType: 'tanker',
      make: 'Mercedes-Benz',
      model: 'Actros 2542',
      year: 2019,
      capacity: 33000,
      status: 'active',
      location: 'MOFAD Main Depot',
      driver: {
        name: 'Ahmed Musa',
        phone: '+234 803 456 7890',
        licenseNumber: 'DL-2019-ABC123',
        licenseExpiry: '2025-06-15'
      },
      lastService: '2024-01-15',
      nextService: '2024-04-15',
      mileage: 125000,
      fuelEfficiency: 6.5,
      insurance: {
        provider: 'AIICO Insurance',
        policyNumber: 'POL-2024-001',
        expiryDate: '2024-12-31',
        premium: 450000
      },
      gpsTracking: {
        deviceId: 'GPS-001',
        lastUpdate: '2024-01-22T14:30:00Z',
        coordinates: { lat: 9.0578, lng: 7.4951 },
        speed: 65
      },
      maintenanceHistory: [],
      documents: []
    },
    {
      id: 'VEH002',
      registrationNumber: 'DEF-456-YZ',
      vehicleType: 'truck',
      make: 'MAN',
      model: 'TGS 26.440',
      year: 2020,
      capacity: 25000,
      status: 'maintenance',
      location: 'Service Workshop',
      driver: {
        name: 'Ibrahim Hassan',
        phone: '+234 805 789 0123',
        licenseNumber: 'DL-2018-DEF456',
        licenseExpiry: '2025-03-20'
      },
      lastService: '2024-01-10',
      nextService: '2024-04-10',
      mileage: 98000,
      fuelEfficiency: 7.2,
      insurance: {
        provider: 'Leadway Assurance',
        policyNumber: 'POL-2024-002',
        expiryDate: '2024-11-30',
        premium: 380000
      },
      gpsTracking: {
        deviceId: 'GPS-002',
        lastUpdate: '2024-01-22T08:00:00Z',
        coordinates: { lat: 9.0765, lng: 7.3986 },
        speed: 0
      },
      maintenanceHistory: [],
      documents: []
    },
    {
      id: 'VEH003',
      registrationNumber: 'GHI-789-ZA',
      vehicleType: 'car',
      make: 'Toyota',
      model: 'Hilux',
      year: 2021,
      status: 'active',
      location: 'MOFAD Terminal 2',
      driver: {
        name: 'Fatima Ibrahim',
        phone: '+234 807 123 4567',
        licenseNumber: 'DL-2020-GHI789',
        licenseExpiry: '2026-08-10'
      },
      lastService: '2024-01-08',
      nextService: '2024-05-08',
      mileage: 45000,
      fuelEfficiency: 12.5,
      insurance: {
        provider: 'NEM Insurance',
        policyNumber: 'POL-2024-003',
        expiryDate: '2025-01-15',
        premium: 150000
      },
      gpsTracking: {
        deviceId: 'GPS-003',
        lastUpdate: '2024-01-22T12:15:00Z',
        coordinates: { lat: 9.1234, lng: 7.4567 },
        speed: 45
      },
      maintenanceHistory: [],
      documents: []
    }
  ]

  const filteredVehicles = mockVehicles.filter(vehicle => {
    const matchesSearch = vehicle.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.driver?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter
    const matchesType = typeFilter === 'all' || vehicle.vehicleType === typeFilter
    const matchesLocation = locationFilter === 'all' || vehicle.location.toLowerCase().includes(locationFilter.toLowerCase())
    return matchesSearch && matchesStatus && matchesType && matchesLocation
  })

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Fleet Management</h1>
            <p className="text-gray-600">Monitor and manage company vehicle fleet operations</p>
          </div>

          <div className="flex items-center space-x-4">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
            <Button variant="outline">
              <MapPin className="h-4 w-4 mr-2" />
              Live Tracking
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Fleet Report
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Vehicles"
            value={mockSummary.totalVehicles}
            subtitle="Fleet size"
            icon={Truck}
            color="orange"
          />
          <MetricCard
            title="Active Vehicles"
            value={mockSummary.activeVehicles}
            subtitle="Currently operational"
            icon={CheckCircle}
            color="green"
            trend={2.3}
          />
          <MetricCard
            title="Fuel Cost"
            value={mockSummary.fuelCostThisMonth}
            subtitle="This month"
            icon={Fuel}
            color="red"
            unit="currency"
            trend={8.5}
          />
          <MetricCard
            title="Fuel Efficiency"
            value={mockSummary.averageFuelEfficiency}
            subtitle="Average fleet"
            icon={BarChart3}
            color="blue"
            unit="kmpl"
            trend={-3.2}
          />
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Maintenance</p>
                  <p className="text-2xl font-bold text-yellow-600">{mockSummary.inMaintenance}</p>
                </div>
                <Wrench className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Documents Expiring</p>
                  <p className="text-2xl font-bold text-orange-600">{mockSummary.documentsExpiring}</p>
                </div>
                <FileText className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Accidents</p>
                  <p className="text-2xl font-bold text-red-600">{mockSummary.accidentCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Maintenance Cost</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(mockSummary.maintenanceCostThisMonth)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative">
                  <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search vehicles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-64"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="repair">Repair</option>
                  <option value="retired">Retired</option>
                  <option value="accident">Accident</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Types</option>
                  <option value="tanker">Tankers</option>
                  <option value="truck">Trucks</option>
                  <option value="van">Vans</option>
                  <option value="car">Cars</option>
                  <option value="bus">Buses</option>
                </select>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Locations</option>
                  <option value="depot">Main Depot</option>
                  <option value="terminal">Terminal 2</option>
                  <option value="workshop">Workshop</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fleet Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Truck className="h-5 w-5 mr-2" />
              Fleet Vehicles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Vehicle</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Driver</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Location</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Mileage</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Efficiency</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{vehicle.registrationNumber}</p>
                          <p className="text-sm text-gray-500">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
                          {vehicle.capacity && (
                            <p className="text-xs text-orange-600">{vehicle.capacity.toLocaleString()}L capacity</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <VehicleTypeBadge type={vehicle.vehicleType} />
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-gray-900">{vehicle.driver?.name || 'Unassigned'}</p>
                          {vehicle.driver && (
                            <p className="text-sm text-gray-500">{vehicle.driver.phone}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                          <span className="text-gray-900">{vehicle.location}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-medium">
                        {vehicle.mileage.toLocaleString()} km
                      </td>
                      <td className="py-4 px-4 text-right font-medium">
                        {vehicle.fuelEfficiency} km/L
                      </td>
                      <td className="py-4 px-4 text-center">
                        <StatusBadge status={vehicle.status} />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Navigation className="h-4 w-4" />
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

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Fleet Management Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <Wrench className="h-6 w-6 mb-2" />
                Schedule Service
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Route className="h-6 w-6 mb-2" />
                Route Planning
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Activity className="h-6 w-6 mb-2" />
                Performance
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <FileText className="h-6 w-6 mb-2" />
                Documents
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}