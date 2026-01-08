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
  Coffee,
  Package,
  ShoppingCart,
  AlertTriangle,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Printer,
  FileText,
  Beaker,
} from 'lucide-react'

// Consumable interfaces
interface Consumable {
  id: number
  itemCode: string
  name: string
  category: string
  description: string
  brand?: string
  unit: string
  currentStock: number
  reorderLevel: number
  maxStock: number
  unitCost: number
  lastPurchaseDate: string
  lastPurchaseQuantity: number
  supplier: string
  location: string
  expiryDate?: string
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Expired' | 'Discontinued'
  monthlyConsumption: number
  yearToDateConsumption: number
  lastIssueDate?: string
  issuedTo?: string
}

// Mock data for consumables
const generateMockConsumables = (): Consumable[] => {
  const consumableCategories = [
    'Office Supplies',
    'Printing Materials',
    'Cleaning Supplies',
    'IT Consumables',
    'Stationery',
    'Kitchen Supplies',
    'Safety Equipment',
    'Maintenance Items'
  ]

  const locations = [
    'Main Store Room',
    'Office Supply Cabinet',
    'IT Storage',
    'Kitchen Pantry',
    'Cleaning Storage',
    'Reception Desk',
    'Conference Room',
    'Manager Office'
  ]

  const suppliers = [
    'Grand Concept Ltd',
    'Office Plus Nigeria',
    'Cityscape Supplies',
    'Premium Office Solutions',
    'Naija Office Mart',
    'Business Essentials Ltd',
    'Corporate Supplies Co',
    'Modern Office Equipment'
  ]

  const consumableItems = [
    { name: 'A4 Copy Paper (Ream)', category: 'Office Supplies', unit: 'Ream', icon: FileText },
    { name: 'Black Ink Cartridge (HP)', category: 'Printing Materials', unit: 'Piece', icon: Printer },
    { name: 'Color Ink Cartridge (Canon)', category: 'Printing Materials', unit: 'Piece', icon: Printer },
    { name: 'Toilet Paper (Roll)', category: 'Cleaning Supplies', unit: 'Roll', icon: Package },
    { name: 'Hand Sanitizer (500ml)', category: 'Cleaning Supplies', unit: 'Bottle', icon: Beaker },
    { name: 'Blue Ballpoint Pens', category: 'Stationery', unit: 'Box', icon: FileText },
    { name: 'Black Ballpoint Pens', category: 'Stationery', unit: 'Box', icon: FileText },
    { name: 'Stapler Pins', category: 'Stationery', unit: 'Box', icon: Package },
    { name: 'Sticky Notes (Pack)', category: 'Stationery', unit: 'Pack', icon: FileText },
    { name: 'Coffee (Instant)', category: 'Kitchen Supplies', unit: 'Tin', icon: Coffee },
    { name: 'Tea Bags', category: 'Kitchen Supplies', unit: 'Box', icon: Coffee },
    { name: 'Sugar (1kg)', category: 'Kitchen Supplies', unit: 'Bag', icon: Package },
    { name: 'Disposable Cups', category: 'Kitchen Supplies', unit: 'Pack', icon: Coffee },
    { name: 'Ethernet Cables (Cat6)', category: 'IT Consumables', unit: 'Piece', icon: Zap },
    { name: 'USB Flash Drive (16GB)', category: 'IT Consumables', unit: 'Piece', icon: Package },
    { name: 'Toner Cartridge (Laser)', category: 'Printing Materials', unit: 'Piece', icon: Printer },
    { name: 'Liquid Soap (Hand Wash)', category: 'Cleaning Supplies', unit: 'Bottle', icon: Beaker },
    { name: 'Air Freshener', category: 'Cleaning Supplies', unit: 'Can', icon: Package },
    { name: 'Manila Folders', category: 'Office Supplies', unit: 'Pack', icon: FileText },
    { name: 'Rubber Bands', category: 'Stationery', unit: 'Pack', icon: Package },
    { name: 'Paper Clips', category: 'Stationery', unit: 'Box', icon: Package },
    { name: 'Whiteboard Markers', category: 'Stationery', unit: 'Set', icon: FileText },
    { name: 'Correction Fluid', category: 'Stationery', unit: 'Bottle', icon: FileText },
    { name: 'Envelope (A4)', category: 'Office Supplies', unit: 'Pack', icon: FileText },
    { name: 'Calculator (Scientific)', category: 'Office Supplies', unit: 'Piece', icon: Package },
  ]

  const consumables: Consumable[] = []

  for (let i = 0; i < 60; i++) {
    const item = consumableItems[Math.floor(Math.random() * consumableItems.length)]
    const lastPurchaseDate = new Date()
    lastPurchaseDate.setDate(lastPurchaseDate.getDate() - Math.random() * 90) // Random date in last 3 months

    const unitCost = Math.floor(Math.random() * 50000) + 500 // 500 to 50,000 Naira per unit
    const reorderLevel = Math.floor(Math.random() * 20) + 5 // 5-25 units
    const maxStock = reorderLevel + Math.floor(Math.random() * 50) + 20 // Max stock above reorder level
    const currentStock = Math.floor(Math.random() * (maxStock + 10)) // Can be above max sometimes
    const monthlyConsumption = Math.floor(Math.random() * 30) + 5
    const yearToDateConsumption = monthlyConsumption * (Math.floor(Math.random() * 12) + 1)

    // Determine status based on stock levels
    let status: Consumable['status'] = 'In Stock'
    if (currentStock === 0) {
      status = 'Out of Stock'
    } else if (currentStock <= reorderLevel) {
      status = 'Low Stock'
    }

    // Some items might have expiry dates (especially food/chemical items)
    let expiryDate: string | undefined
    if (item.category === 'Kitchen Supplies' || item.category === 'Cleaning Supplies') {
      const expiry = new Date()
      expiry.setDate(expiry.getDate() + Math.random() * 730 + 30) // 30 days to 2 years from now
      expiryDate = expiry.toISOString().split('T')[0]

      // Check if expired
      if (expiry < new Date()) {
        status = 'Expired'
      }
    }

    const consumable: Consumable = {
      id: i + 1,
      itemCode: `CON-${String(i + 1).padStart(4, '0')}`,
      name: `${item.name} ${i > 20 ? '(Generic)' : ''}`.trim(),
      category: item.category,
      description: `${item.name} for office use`,
      brand: Math.random() > 0.3 ? ['HP', 'Canon', 'Dettol', 'Nescafe', 'Lipton', 'Generic'][Math.floor(Math.random() * 6)] : undefined,
      unit: item.unit,
      currentStock,
      reorderLevel,
      maxStock,
      unitCost,
      lastPurchaseDate: lastPurchaseDate.toISOString().split('T')[0],
      lastPurchaseQuantity: Math.floor(Math.random() * 100) + 10,
      supplier: suppliers[Math.floor(Math.random() * suppliers.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      expiryDate,
      status,
      monthlyConsumption,
      yearToDateConsumption,
      lastIssueDate: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
      issuedTo: Math.random() > 0.6 ? ['Adebayo Johnson', 'Fatima Usman', 'Emeka Okafor', 'Kemi Adebola'][Math.floor(Math.random() * 4)] : undefined,
    }

    consumables.push(consumable)
  }

  return consumables.sort((a, b) => a.name.localeCompare(b.name))
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

const getStatusColor = (status: Consumable['status']) => {
  const colors = {
    'In Stock': 'bg-green-100 text-green-800',
    'Low Stock': 'bg-yellow-100 text-yellow-800',
    'Out of Stock': 'bg-red-100 text-red-800',
    'Expired': 'bg-purple-100 text-purple-800',
    'Discontinued': 'bg-gray-100 text-gray-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const getStatusIcon = (status: Consumable['status']) => {
  const icons = {
    'In Stock': CheckCircle,
    'Low Stock': AlertCircle,
    'Out of Stock': XCircle,
    'Expired': AlertTriangle,
    'Discontinued': XCircle
  }
  return icons[status] || CheckCircle
}

const getCategoryIcon = (category: string) => {
  const icons = {
    'Office Supplies': FileText,
    'Printing Materials': Printer,
    'Cleaning Supplies': Beaker,
    'IT Consumables': Zap,
    'Stationery': FileText,
    'Kitchen Supplies': Coffee,
    'Safety Equipment': AlertTriangle,
    'Maintenance Items': Package
  }
  return icons[category as keyof typeof icons] || Package
}

export default function ConsumablesPage() {
  // State
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedConsumables, setSelectedConsumables] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(15)

  // Generate mock data
  const allConsumables = useMemo(() => generateMockConsumables(), [])

  // Filter consumables
  const filteredConsumables = useMemo(() => {
    let filtered = [...allConsumables]

    if (searchTerm) {
      filtered = filtered.filter(consumable =>
        consumable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consumable.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consumable.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consumable.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (categoryFilter) {
      filtered = filtered.filter(consumable => consumable.category === categoryFilter)
    }

    if (statusFilter) {
      filtered = filtered.filter(consumable => consumable.status === statusFilter)
    }

    if (locationFilter) {
      filtered = filtered.filter(consumable => consumable.location === locationFilter)
    }

    return filtered
  }, [allConsumables, searchTerm, categoryFilter, statusFilter, locationFilter])

  // Pagination
  const totalPages = Math.ceil(filteredConsumables.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentConsumables = filteredConsumables.slice(startIndex, startIndex + itemsPerPage)

  // Get unique values for filters
  const categories = Array.from(new Set(allConsumables.map(consumable => consumable.category)))
  const statuses = Array.from(new Set(allConsumables.map(consumable => consumable.status)))
  const locations = Array.from(new Set(allConsumables.map(consumable => consumable.location)))

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalValue = allConsumables.reduce((sum, consumable) => sum + (consumable.currentStock * consumable.unitCost), 0)
    const inStockItems = allConsumables.filter(consumable => consumable.status === 'In Stock').length
    const lowStockItems = allConsumables.filter(consumable => consumable.status === 'Low Stock').length
    const outOfStockItems = allConsumables.filter(consumable => consumable.status === 'Out of Stock' || consumable.status === 'Expired').length
    const totalYTDConsumption = allConsumables.reduce((sum, consumable) => sum + (consumable.yearToDateConsumption * consumable.unitCost), 0)

    return {
      totalItems: allConsumables.length,
      totalValue,
      inStockItems,
      lowStockItems,
      outOfStockItems,
      totalYTDConsumption
    }
  }, [allConsumables])

  return (
    <AppLayout>
      <div className="space-y-8 pb-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white rounded-2xl shadow-lg ring-1 ring-red-100">
                <Coffee className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">Consumables Management</h1>
                <p className="text-gray-600 flex items-center">
                  <Package className="h-4 w-4 mr-2 text-red-500" />
                  Track office supplies, consumables, and inventory levels
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
                Add Item
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
                  <p className="text-sm font-medium text-blue-700">Total Items</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.totalItems}</p>
                </div>
                <div className="p-3 bg-blue-200 rounded-full">
                  <Package className="w-6 h-6 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Stock Value</p>
                  <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.totalValue)}</p>
                </div>
                <div className="p-3 bg-green-200 rounded-full">
                  <DollarSign className="w-6 h-6 text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700">Low Stock Items</p>
                  <p className="text-3xl font-bold text-yellow-900">{stats.lowStockItems}</p>
                </div>
                <div className="p-3 bg-yellow-200 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-yellow-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">YTD Consumption</p>
                  <p className="text-2xl font-bold text-purple-900">{formatCurrency(stats.totalYTDConsumption)}</p>
                </div>
                <div className="p-3 bg-purple-200 rounded-full">
                  <TrendingUp className="w-6 h-6 text-purple-700" />
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
                    placeholder="Search items..."
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

        {/* Consumables Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Item</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Current Stock</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Reorder Level</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Unit Cost</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentConsumables.map((consumable) => {
                  const CategoryIcon = getCategoryIcon(consumable.category)
                  const StatusIcon = getStatusIcon(consumable.status)

                  return (
                    <tr key={consumable.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <CategoryIcon className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{consumable.name}</div>
                            <div className="text-sm text-gray-500">{consumable.itemCode}</div>
                            {consumable.brand && (
                              <div className="text-xs text-blue-600 font-medium">{consumable.brand}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{consumable.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {consumable.currentStock} {consumable.unit}
                        </div>
                        <div className="text-xs text-gray-500">
                          Location: {consumable.location}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {consumable.reorderLevel} {consumable.unit}
                        </div>
                        <div className="text-xs text-gray-500">
                          Max: {consumable.maxStock} {consumable.unit}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{formatCurrency(consumable.unitCost)}</div>
                        <div className="text-xs text-gray-500">per {consumable.unit}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <StatusIcon className="w-4 h-4 text-gray-400" />
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(consumable.status)}`}>
                            {consumable.status}
                          </span>
                        </div>
                        {consumable.expiryDate && (
                          <div className="text-xs text-gray-500 mt-1">
                            Exp: {new Date(consumable.expiryDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" className="hover:bg-blue-50">
                            <Eye className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="sm" className="hover:bg-green-50">
                            <Edit className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button variant="ghost" size="sm" className="hover:bg-purple-50">
                            <ShoppingCart className="w-4 h-4 text-purple-600" />
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
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredConsumables.length)} of {filteredConsumables.length} items
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