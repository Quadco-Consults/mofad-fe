'use client'

import { useState, useMemo } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Filter,
  Download,
  Upload,
  Eye,
  Box,
  Monitor,
  Laptop,
  Car,
  Building,
  Settings,
  ChevronDown,
  Calendar,
  DollarSign,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react'

// Asset interfaces
interface Asset {
  id: number
  assetTag: string
  name: string
  category: string
  description: string
  purchaseDate: string
  purchaseValue: number
  currentValue: number
  serialNumber?: string
  model?: string
  manufacturer?: string
  location: string
  assignedTo?: string
  status: 'Active' | 'In Use' | 'Under Maintenance' | 'Retired' | 'Lost'
  depreciationRate: number
  warrantyExpiry?: string
  lastMaintenanceDate?: string
  nextMaintenanceDate?: string
}

// Mock data for assets
const generateMockAssets = (): Asset[] => {
  const assetCategories = [
    'Computer Equipment',
    'Office Furniture',
    'Vehicles',
    'Machinery',
    'IT Equipment',
    'Buildings',
    'Software',
    'Tools & Equipment'
  ]

  const locations = [
    'Head Office - Lagos',
    'Branch Office - Abuja',
    'Warehouse - Port Harcourt',
    'Substore - Kano',
    'Remote Office - Kaduna'
  ]

  const employees = [
    'Adebayo Johnson',
    'Fatima Usman',
    'Emeka Okafor',
    'Kemi Adebola',
    'Ibrahim Musa',
    'Grace Okoro',
    'Chinedu Okonkwo',
    'Aisha Bello'
  ]

  const assetNames = [
    'Dell OptiPlex Desktop',
    'HP Laptop ProBook',
    'Executive Office Chair',
    'Toyota Camry 2020',
    'Samsung Monitor 27"',
    'Conference Table',
    'Industrial Printer',
    'Air Conditioning Unit',
    'Filing Cabinet',
    'Microsoft Office License',
    'Security Camera System',
    'Generator Set',
    'Office Safe',
    'Projector Equipment'
  ]

  const manufacturers = ['Dell', 'HP', 'Toyota', 'Samsung', 'Canon', 'LG', 'Microsoft', 'Cisco']

  const assets: Asset[] = []

  for (let i = 0; i < 75; i++) {
    const purchaseDate = new Date()
    purchaseDate.setDate(purchaseDate.getDate() - Math.random() * 1095) // Random date in last 3 years

    const purchaseValue = Math.floor(Math.random() * 5000000) + 50000 // 50K to 5M Naira
    const depreciationRate = Math.random() * 0.4 + 0.1 // 10% to 50%
    const yearsOld = (new Date().getTime() - purchaseDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    const currentValue = Math.max(purchaseValue * Math.pow(1 - depreciationRate, yearsOld), purchaseValue * 0.1)

    const asset: Asset = {
      id: i + 1,
      assetTag: `AST-${String(i + 1).padStart(4, '0')}`,
      name: assetNames[Math.floor(Math.random() * assetNames.length)],
      category: assetCategories[Math.floor(Math.random() * assetCategories.length)],
      description: `${assetNames[Math.floor(Math.random() * assetNames.length)]} for office use`,
      purchaseDate: purchaseDate.toISOString().split('T')[0],
      purchaseValue,
      currentValue: Math.floor(currentValue),
      serialNumber: `SN${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      model: `Model-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      manufacturer: manufacturers[Math.floor(Math.random() * manufacturers.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      assignedTo: Math.random() > 0.3 ? employees[Math.floor(Math.random() * employees.length)] : undefined,
      status: ['Active', 'In Use', 'Under Maintenance', 'Retired'][Math.floor(Math.random() * 4)] as Asset['status'],
      depreciationRate,
      warrantyExpiry: new Date(purchaseDate.getTime() + Math.random() * 365 * 24 * 60 * 60 * 1000 * 3).toISOString().split('T')[0], // Random warranty 1-3 years
    }

    assets.push(asset)
  }

  return assets.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
}

// Helper functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const getStatusColor = (status: Asset['status']) => {
  const colors = {
    'Active': 'bg-green-100 text-green-800',
    'In Use': 'bg-blue-100 text-blue-800',
    'Under Maintenance': 'bg-yellow-100 text-yellow-800',
    'Retired': 'bg-gray-100 text-gray-800',
    'Lost': 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const getStatusIcon = (status: Asset['status']) => {
  const icons = {
    'Active': CheckCircle,
    'In Use': CheckCircle,
    'Under Maintenance': Clock,
    'Retired': XCircle,
    'Lost': XCircle
  }
  return icons[status] || CheckCircle
}

const getCategoryIcon = (category: string) => {
  const icons = {
    'Computer Equipment': Monitor,
    'Office Furniture': Building,
    'Vehicles': Car,
    'Machinery': Settings,
    'IT Equipment': Laptop,
    'Buildings': Building,
    'Software': Monitor,
    'Tools & Equipment': Box
  }
  return icons[category as keyof typeof icons] || Box
}

export default function AssetsPage() {
  // State
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedAssets, setSelectedAssets] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(15)

  // Generate mock data
  const allAssets = useMemo(() => generateMockAssets(), [])

  // Filter assets
  const filteredAssets = useMemo(() => {
    let filtered = [...allAssets]

    if (searchTerm) {
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (categoryFilter) {
      filtered = filtered.filter(asset => asset.category === categoryFilter)
    }

    if (statusFilter) {
      filtered = filtered.filter(asset => asset.status === statusFilter)
    }

    if (locationFilter) {
      filtered = filtered.filter(asset => asset.location === locationFilter)
    }

    return filtered
  }, [allAssets, searchTerm, categoryFilter, statusFilter, locationFilter])

  // Pagination
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentAssets = filteredAssets.slice(startIndex, startIndex + itemsPerPage)

  // Get unique values for filters
  const categories = Array.from(new Set(allAssets.map(asset => asset.category)))
  const statuses = Array.from(new Set(allAssets.map(asset => asset.status)))
  const locations = Array.from(new Set(allAssets.map(asset => asset.location)))

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalValue = allAssets.reduce((sum, asset) => sum + asset.currentValue, 0)
    const activeAssets = allAssets.filter(asset => asset.status === 'Active' || asset.status === 'In Use').length
    const maintenanceAssets = allAssets.filter(asset => asset.status === 'Under Maintenance').length
    const retiredAssets = allAssets.filter(asset => asset.status === 'Retired' || asset.status === 'Lost').length

    return {
      totalAssets: allAssets.length,
      totalValue,
      activeAssets,
      maintenanceAssets,
      retiredAssets
    }
  }, [allAssets])

  return (
    <AppLayout>
      <div className="space-y-8 pb-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white rounded-2xl shadow-lg ring-1 ring-red-100">
                <Box className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">Asset Management</h1>
                <p className="text-gray-600 flex items-center">
                  <Building className="h-4 w-4 mr-2 text-red-500" />
                  Manage company assets, equipment, and fixed assets
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center hover:bg-gray-50"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
              <Button
                variant="outline"
                className="flex items-center hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Add Asset
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Assets</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.totalAssets}</p>
                </div>
                <div className="p-3 bg-blue-200 rounded-full">
                  <Box className="w-6 h-6 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Total Value</p>
                  <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.totalValue)}</p>
                </div>
                <div className="p-3 bg-green-200 rounded-full">
                  <DollarSign className="w-6 h-6 text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700">Active Assets</p>
                  <p className="text-3xl font-bold text-emerald-900">{stats.activeAssets}</p>
                </div>
                <div className="p-3 bg-emerald-200 rounded-full">
                  <CheckCircle className="w-6 h-6 text-emerald-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700">Under Maintenance</p>
                  <p className="text-3xl font-bold text-yellow-900">{stats.maintenanceAssets}</p>
                </div>
                <div className="p-3 bg-yellow-200 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search assets..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>

                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                >
                  <option value="">All Locations</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assets Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Asset</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Assigned To</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Value</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentAssets.map((asset) => {
                  const CategoryIcon = getCategoryIcon(asset.category)
                  const StatusIcon = getStatusIcon(asset.status)

                  return (
                    <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <CategoryIcon className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                            <div className="text-sm text-gray-500">{asset.assetTag}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{asset.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                          {asset.location}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {asset.assignedTo ? (
                          <div className="flex items-center text-sm text-gray-900">
                            <User className="w-4 h-4 mr-1 text-gray-400" />
                            {asset.assignedTo}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{formatCurrency(asset.currentValue)}</div>
                        <div className="text-xs text-gray-500">Purchase: {formatCurrency(asset.purchaseValue)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <StatusIcon className="w-4 h-4 text-gray-400" />
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                            {asset.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" className="hover:bg-blue-50">
                            <Eye className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="sm" className="hover:bg-green-50">
                            <Edit className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button variant="ghost" size="sm" className="hover:bg-red-50">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <p className="text-sm text-gray-500">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAssets.length)} of {filteredAssets.length} assets
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  )
}