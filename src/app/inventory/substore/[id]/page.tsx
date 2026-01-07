'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import mockApi from '@/lib/mockApi'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  Eye,
  Package,
  Building2,
  TrendingUp,
  TrendingDown,
  Droplets,
  Settings as SettingsIcon,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  User,
  Fuel,
  Power,
} from 'lucide-react'

interface SubstoreProduct {
  id: number
  substore_id: number
  substore_name: string
  location: string
  product_name: string
  product_code: string
  category: string
  current_stock: number
  unit_type: string
  cost_value: number
  retail_value: number
  reorder_level: number
  max_level: number
  last_restocked: string
  stock_status: string
  manager: string
  package_size: string
}

const getCategoryIcon = (category: string) => {
  switch (category?.toLowerCase()) {
    case 'lubricants':
      return <Droplets className="w-5 h-5 text-blue-500" />
    case 'hydraulics':
      return <Settings className="w-5 h-5 text-purple-500" />
    case 'transmission':
      return <Power className="w-5 h-5 text-green-500" />
    default:
      return <Package className="w-5 h-5 text-gray-500" />
  }
}

const getStockStatusBadge = (status: string, current_stock: number, reorder_level: number) => {
  let statusColor = status
  let statusText = status

  // Determine status based on stock levels
  if (current_stock === 0) {
    statusColor = 'critical'
    statusText = 'out_of_stock'
  } else if (current_stock <= reorder_level * 0.5) {
    statusColor = 'critical'
    statusText = 'critical'
  } else if (current_stock <= reorder_level) {
    statusColor = 'low'
    statusText = 'low'
  } else {
    statusColor = 'healthy'
    statusText = 'healthy'
  }

  const colors = {
    healthy: 'bg-green-100 text-green-800',
    low: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800',
    out_of_stock: 'bg-red-100 text-red-800'
  }

  const labels = {
    healthy: 'Healthy',
    low: 'Low Stock',
    critical: 'Critical',
    out_of_stock: 'Out of Stock'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[statusColor as keyof typeof colors]}`}>
      {labels[statusText as keyof typeof labels]}
    </span>
  )
}

export default function SubstoreDetailPage() {
  const params = useParams()
  const router = useRouter()
  const substoreId = parseInt(params?.id as string)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Fetch substore products
  const { data: substoreProducts, isLoading, error } = useQuery({
    queryKey: ['substore-inventory', substoreId],
    queryFn: () => mockApi.get(`/inventory/substore/substores/${substoreId}`)
  })

  const products = Array.isArray(substoreProducts) ? substoreProducts : []
  const substoreInfo = products.length > 0 ? products[0] : null

  // Filter products
  const filteredProducts = products.filter((product: SubstoreProduct) => {
    const matchesSearch = product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.product_code.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === 'all' || product.category.toLowerCase() === categoryFilter.toLowerCase()

    return matchesSearch && matchesCategory
  })

  const handleViewBinCard = (product: SubstoreProduct) => {
    router.push(`/inventory/substore/${substoreId}/products/${product.id}/bin-card`)
  }

  // Calculate summary stats
  const totalProducts = filteredProducts.length
  const totalValue = filteredProducts.reduce((sum: number, p: SubstoreProduct) => sum + p.cost_value, 0)
  const lowStockCount = filteredProducts.filter((p: SubstoreProduct) => p.current_stock <= p.reorder_level).length
  const criticalStockCount = filteredProducts.filter((p: SubstoreProduct) => p.current_stock <= p.reorder_level * 0.5).length

  if (error) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-500">Error loading substore data. Please try again.</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-500">Loading substore data...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!substoreInfo) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Substore not found.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/inventory/substore')}
            >
              Back to Substores
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/inventory/substore')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Substores
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {substoreInfo.substore_name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                <p className="text-gray-600">{substoreInfo.location}</p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <User className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-500">Manager: {substoreInfo.manager}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-blue-600">{totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(totalValue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-yellow-600">{lowStockCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Critical Stock</p>
                  <p className="text-2xl font-bold text-red-600">{criticalStockCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="lubricants">Lubricants</option>
              <option value="hydraulics">Hydraulic Oils</option>
              <option value="transmission">Transmission Fluids</option>
            </select>

            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>

        {/* Products Table */}
        <Card>
          <CardContent className="p-0">
            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500">
                  {searchTerm || categoryFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'No products available in this substore'
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Current Stock</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Value</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Last Restocked</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredProducts.map((product: SubstoreProduct) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {getCategoryIcon(product.category)}
                            <div>
                              <div className="font-medium text-gray-900">{product.product_name}</div>
                              <div className="text-sm text-gray-500 font-mono">{product.product_code}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-700 capitalize">{product.category}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="font-medium text-gray-900">
                            {product.current_stock.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">{product.unit_type}</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStockStatusBadge(product.stock_status, product.current_stock, product.reorder_level)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(product.cost_value)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-500">
                            {formatDateTime(product.last_restocked).split(',')[0]}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3"
                            title="View Bin Card"
                            onClick={() => handleViewBinCard(product)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Bin Card
                          </Button>
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
    </AppLayout>
  )
}