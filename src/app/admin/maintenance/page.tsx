'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatNumber } from '@/lib/utils'
import {
  Wrench,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  DollarSign,
  FileText,
  User,
  Building,
  Truck,
  Package,
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
  Phone,
  Mail,
  MapPin,
  Target,
  Activity,
  Tool,
  Gauge,
  Battery,
  Zap,
  Droplets
} from 'lucide-react'

interface MaintenanceRecord {
  id: string
  workOrderNumber: string
  assetType: 'equipment' | 'vehicle' | 'facility' | 'infrastructure'
  assetId: string
  assetName: string
  location: string
  maintenanceType: 'preventive' | 'corrective' | 'emergency' | 'breakdown'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'pending_parts'
  description: string
  scheduledDate: string
  startedAt?: string
  completedAt?: string
  estimatedCost: number
  actualCost?: number
  assignedTo: {
    name: string
    role: string
    contact: string
  }
  contractor?: {
    name: string
    contact: string
    specialization: string
  }
  partsRequired?: MaintenancePart[]
  laborHours?: number
  nextMaintenanceDue?: string
  notes?: string
  attachments?: string[]
}

interface MaintenancePart {
  id: string
  name: string
  partNumber: string
  quantity: number
  unitCost: number
  supplier: string
  status: 'ordered' | 'received' | 'installed'
}

interface MaintenanceSummary {
  totalWorkOrders: number
  completedThisMonth: number
  pendingWorkOrders: number
  emergencyRepairs: number
  totalCostThisMonth: number
  averageRepairTime: number // in hours
  equipmentUptime: number // percentage
  preventiveRatio: number // percentage
}

const AssetTypeBadge = ({ type }: { type: string }) => {
  const typeConfig = {
    equipment: { color: 'bg-blue-100 text-blue-800', icon: Settings },
    vehicle: { color: 'bg-green-100 text-green-800', icon: Truck },
    facility: { color: 'bg-purple-100 text-purple-800', icon: Building },
    infrastructure: { color: 'bg-orange-100 text-orange-800', icon: Package }
  }

  const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.equipment
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  )
}

const MaintenanceTypeBadge = ({ type }: { type: string }) => {
  const typeConfig = {
    preventive: { color: 'bg-green-100 text-green-800', icon: Calendar },
    corrective: { color: 'bg-yellow-100 text-yellow-800', icon: Wrench },
    emergency: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
    breakdown: { color: 'bg-orange-100 text-orange-800', icon: XCircle }
  }

  const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.corrective
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  )
}

const PriorityBadge = ({ priority }: { priority: string }) => {
  const priorityConfig = {
    low: { color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
    medium: { color: 'bg-blue-100 text-blue-800', icon: Clock },
    high: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
    critical: { color: 'bg-red-100 text-red-800', icon: XCircle }
  }

  const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  )
}

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    scheduled: { color: 'bg-blue-100 text-blue-800', icon: Calendar },
    in_progress: { color: 'bg-yellow-100 text-yellow-800', icon: Wrench },
    completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
    pending_parts: { color: 'bg-orange-100 text-orange-800', icon: Package }
  }

  const config = statusConfig[status as keyof typeof statusConfig]
  const Icon = config?.icon || Clock

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config?.color || 'bg-gray-100 text-gray-800'}`}>
      <Icon className="w-3 h-3 mr-1" />
      {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
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
               unit === 'hours' ? `${value}h` :
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
              <TrendingUp className={`h-4 w-4 mr-1 ${unit === 'percentage' ? 'text-green-600' : 'text-red-600'}`} />
            ) : (
              <TrendingDown className={`h-4 w-4 mr-1 ${unit === 'percentage' ? 'text-red-600' : 'text-green-600'}`} />
            )}
            <span className={trend > 0 ? (unit === 'percentage' ? 'text-green-600' : 'text-red-600') : (unit === 'percentage' ? 'text-red-600' : 'text-green-600')}>
              {Math.abs(trend)}% vs last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function MaintenancePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [assetFilter, setAssetFilter] = useState('all')

  const { data: maintenanceData, isLoading, refetch } = useQuery({
    queryKey: ['maintenance', statusFilter, typeFilter, priorityFilter, assetFilter],
    queryFn: () => apiClient.get(`/admin/maintenance?status=${statusFilter}&type=${typeFilter}&priority=${priorityFilter}&asset=${assetFilter}`),
  })

  // Mock data for development
  const mockSummary: MaintenanceSummary = {
    totalWorkOrders: 156,
    completedThisMonth: 45,
    pendingWorkOrders: 23,
    emergencyRepairs: 8,
    totalCostThisMonth: 2850000,
    averageRepairTime: 6.5,
    equipmentUptime: 94.2,
    preventiveRatio: 68
  }

  const mockMaintenanceRecords: MaintenanceRecord[] = [
    {
      id: 'MAINT001',
      workOrderNumber: 'WO-2024-001',
      assetType: 'equipment',
      assetId: 'PUMP-005',
      assetName: 'Fuel Transfer Pump #5',
      location: 'Storage Tank Area - Section B',
      maintenanceType: 'preventive',
      priority: 'medium',
      status: 'scheduled',
      description: 'Quarterly maintenance - seal inspection, oil change, and performance check',
      scheduledDate: '2024-01-25T09:00:00Z',
      estimatedCost: 125000,
      assignedTo: {
        name: 'Ahmed Musa',
        role: 'Senior Maintenance Technician',
        contact: '+234 803 456 7890'
      },
      partsRequired: [
        {
          id: 'PART001',
          name: 'Pump Seal Kit',
          partNumber: 'PSK-2024-A',
          quantity: 1,
          unitCost: 35000,
          supplier: 'Industrial Parts Ltd',
          status: 'received'
        }
      ],
      laborHours: 4,
      nextMaintenanceDue: '2024-04-25'
    },
    {
      id: 'MAINT002',
      workOrderNumber: 'WO-2024-002',
      assetType: 'vehicle',
      assetId: 'TRUCK-012',
      assetName: 'Fuel Tanker Truck ABC-456-XY',
      location: 'Main Depot - Vehicle Bay 3',
      maintenanceType: 'corrective',
      priority: 'high',
      status: 'in_progress',
      description: 'Brake system repair - replace brake pads and service brake fluid',
      scheduledDate: '2024-01-22T08:00:00Z',
      startedAt: '2024-01-22T08:15:00Z',
      estimatedCost: 180000,
      actualCost: 165000,
      assignedTo: {
        name: 'Ibrahim Hassan',
        role: 'Vehicle Technician',
        contact: '+234 805 789 0123'
      },
      contractor: {
        name: 'AutoFix Solutions',
        contact: '+234 807 123 4567',
        specialization: 'Heavy Vehicle Maintenance'
      },
      laborHours: 6
    },
    {
      id: 'MAINT003',
      workOrderNumber: 'WO-2024-003',
      assetType: 'facility',
      assetId: 'TANK-007',
      assetName: 'Storage Tank #7 - PMS',
      location: 'Storage Tank Farm',
      maintenanceType: 'emergency',
      priority: 'critical',
      status: 'pending_parts',
      description: 'Emergency valve replacement - safety valve malfunction detected',
      scheduledDate: '2024-01-20T06:00:00Z',
      startedAt: '2024-01-20T06:30:00Z',
      estimatedCost: 450000,
      assignedTo: {
        name: 'John Adebayo',
        role: 'Facility Engineer',
        contact: '+234 809 234 5678'
      },
      partsRequired: [
        {
          id: 'PART002',
          name: 'Safety Relief Valve',
          partNumber: 'SRV-500-B',
          quantity: 1,
          unitCost: 320000,
          supplier: 'Tank Equipment Specialists',
          status: 'ordered'
        }
      ],
      laborHours: 8
    },
    {
      id: 'MAINT004',
      workOrderNumber: 'WO-2024-004',
      assetType: 'equipment',
      assetId: 'GEN-003',
      assetName: 'Backup Generator #3',
      location: 'Power House - Building C',
      maintenanceType: 'preventive',
      priority: 'low',
      status: 'completed',
      description: 'Monthly generator service - oil change, filter replacement, load test',
      scheduledDate: '2024-01-18T10:00:00Z',
      startedAt: '2024-01-18T10:00:00Z',
      completedAt: '2024-01-18T14:30:00Z',
      estimatedCost: 95000,
      actualCost: 87000,
      assignedTo: {
        name: 'Fatima Ibrahim',
        role: 'Electrical Technician',
        contact: '+234 806 345 6789'
      },
      laborHours: 3.5,
      nextMaintenanceDue: '2024-02-18'
    }
  ]

  const filteredMaintenanceRecords = mockMaintenanceRecords.filter(record => {
    const matchesSearch = record.workOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.assignedTo.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter
    const matchesType = typeFilter === 'all' || record.maintenanceType === typeFilter
    const matchesPriority = priorityFilter === 'all' || record.priority === priorityFilter
    const matchesAsset = assetFilter === 'all' || record.assetType === assetFilter
    return matchesSearch && matchesStatus && matchesType && matchesPriority && matchesAsset
  })

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Maintenance Management</h1>
            <p className="text-gray-600">Plan, track and manage facility and equipment maintenance</p>
          </div>

          <div className="flex items-center space-x-4">
            <Button className="bg-red-600 hover:bg-red-700">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Emergency Work Order
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Work Order
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Work Orders"
            value={mockSummary.totalWorkOrders}
            subtitle="All time"
            icon={FileText}
            color="orange"
          />
          <MetricCard
            title="Completed"
            value={mockSummary.completedThisMonth}
            subtitle="This month"
            icon={CheckCircle}
            color="green"
            trend={12.5}
          />
          <MetricCard
            title="Maintenance Cost"
            value={mockSummary.totalCostThisMonth}
            subtitle="This month"
            icon={DollarSign}
            color="red"
            unit="currency"
            trend={-8.3}
          />
          <MetricCard
            title="Equipment Uptime"
            value={mockSummary.equipmentUptime}
            subtitle="Overall system"
            icon={Activity}
            color="blue"
            unit="percentage"
            trend={2.1}
          />
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold text-yellow-600">{mockSummary.pendingWorkOrders}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Emergency Repairs</p>
                  <p className="text-2xl font-bold text-red-600">{mockSummary.emergencyRepairs}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Repair Time</p>
                  <p className="text-2xl font-bold text-blue-600">{mockSummary.averageRepairTime}h</p>
                </div>
                <Gauge className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Preventive %</p>
                  <p className="text-2xl font-bold text-green-600">{mockSummary.preventiveRatio}%</p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
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
                    placeholder="Search work orders..."
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
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="pending_parts">Pending Parts</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Types</option>
                  <option value="preventive">Preventive</option>
                  <option value="corrective">Corrective</option>
                  <option value="emergency">Emergency</option>
                  <option value="breakdown">Breakdown</option>
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <select
                  value={assetFilter}
                  onChange={(e) => setAssetFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Assets</option>
                  <option value="equipment">Equipment</option>
                  <option value="vehicle">Vehicles</option>
                  <option value="facility">Facilities</option>
                  <option value="infrastructure">Infrastructure</option>
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

        {/* Maintenance Records Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wrench className="h-5 w-5 mr-2" />
              Maintenance Work Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Work Order</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Asset</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Priority</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Assigned To</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Est. Cost</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMaintenanceRecords.map((record) => (
                    <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{record.workOrderNumber}</p>
                          <p className="text-sm text-gray-500">{new Date(record.scheduledDate).toLocaleDateString()}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <AssetTypeBadge type={record.assetType} />
                          </div>
                          <p className="font-medium text-gray-900">{record.assetName}</p>
                          <p className="text-sm text-gray-500">{record.location}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <MaintenanceTypeBadge type={record.maintenanceType} />
                      </td>
                      <td className="py-4 px-4">
                        <PriorityBadge priority={record.priority} />
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-gray-900">{record.assignedTo.name}</p>
                          <p className="text-sm text-gray-500">{record.assignedTo.role}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div>
                          <p className="font-bold text-gray-900">{formatCurrency(record.estimatedCost)}</p>
                          {record.actualCost && (
                            <p className="text-sm text-gray-500">Actual: {formatCurrency(record.actualCost)}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <StatusBadge status={record.status} />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {record.status !== 'completed' && record.status !== 'cancelled' && (
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {record.partsRequired && (
                            <Button variant="ghost" size="sm">
                              <Package className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Tool className="h-5 w-5 mr-2" />
              Maintenance Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <Calendar className="h-6 w-6 mb-2" />
                Schedule Service
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Package className="h-6 w-6 mb-2" />
                Order Parts
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <BarChart3 className="h-6 w-6 mb-2" />
                Reports
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Settings className="h-6 w-6 mb-2" />
                Asset Registry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}