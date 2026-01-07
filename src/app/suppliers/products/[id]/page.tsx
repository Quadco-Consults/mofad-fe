'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Search, Package, Building, DollarSign, Calendar, Clock, CheckCircle, AlertTriangle, Star } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import mockApi from '@/lib/mockApi'
import { formatCurrency, formatDateTime } from '@/lib/utils'

const getAvailabilityBadge = (status: string) => {
  const colors: Record<string, string> = {
    available: 'bg-green-100 text-green-800 border-green-200',
    low_stock: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    out_of_stock: 'bg-red-100 text-red-800 border-red-200',
    discontinued: 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
      {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
    </span>
  )
}

const getCategoryBadge = (category: string) => {
  const colors: Record<string, string> = {
    Fuel: 'bg-blue-100 text-blue-800',
    Lubricants: 'bg-purple-100 text-purple-800',
    Additives: 'bg-orange-100 text-orange-800',
    Services: 'bg-green-100 text-green-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[category] || 'bg-gray-100 text-gray-800'}`}>
      {category}
    </span>
  )
}

export default function SupplierProductsViewPage() {
  const params = useParams()
  const router = useRouter()
  const supplierId = params?.id as string
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch suppliers to get supplier info
  const { data: suppliersData } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => mockApi.get('/suppliers')
  })

  // Fetch supplier products
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['supplier-products', 'v3'], // Added version to force refresh
    queryFn: () => mockApi.get('/suppliers/products/'),
    staleTime: 0, // Disable cache
    gcTime: 0 // Force fresh data (renamed from cacheTime in v5)
  })

  // Handle both array and paginated responses for suppliers
  const extractResults = (data: any) => {
    if (Array.isArray(data)) return data
    if (data?.results && Array.isArray(data.results)) return data.results
    return []
  }

  const suppliers = extractResults(suppliersData)
  const supplier = suppliers.find((s: any) => s.id === parseInt(supplierId))

  // Filter products for this specific supplier
  const supplierProducts = Array.isArray(productsData)
    ? productsData.filter((product: any) => product.supplier_id === parseInt(supplierId))
    : []

  // Debug logging
  console.log('Supplier Products Debug:', {
    supplierId,
    supplierProductsFound: supplierProducts.length,
    totalProductsAvailable: Array.isArray(productsData) ? productsData.length : 0
  })

  // Filter products based on search
  const filteredProducts = supplierProducts.filter((product: any) => {
    if (!product) return false
    const matchesSearch = (product.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.product_code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (error) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-red-500">Error loading supplier products. Please try again.</p>
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
            <p className="mt-2 text-gray-500">Loading supplier products...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!supplier) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Supplier not found.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/suppliers/products')}
            >
              Back to Suppliers
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
              onClick={() => router.push('/suppliers/products')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Suppliers
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Products from {supplier.name}
              </h1>
              <p className="text-gray-600">
                All products we purchase from this supplier
              </p>
            </div>
          </div>
        </div>

        {/* Supplier Info Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Building className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
                <p className="text-sm text-gray-600">{supplier.contact_person}</p>
                <p className="text-sm text-gray-500">{supplier.email} • {supplier.phone}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Total Products</div>
                <div className="text-2xl font-bold text-primary">{filteredProducts.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
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
        </div>

        {/* Products Table */}
        <Card>
          <CardContent className="p-0">
            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500">
                  {searchTerm
                    ? 'Try adjusting your search term'
                    : `No products available from ${supplier.name}`
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
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Specifications</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Supplier Price</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Market Price</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">MOQ</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Lead Time</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Availability</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredProducts.map((product: any) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Package className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{product.product_name}</div>
                              <div className="text-sm text-gray-500">{product.product_code}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getCategoryBadge(product.category)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-900">
                            {product.quality_grade && (
                              <div className="flex items-center gap-1 mb-1">
                                <Star className="w-3 h-3 text-yellow-500" />
                                <span className="font-medium">{product.quality_grade}</span>
                              </div>
                            )}
                            <div className="text-xs text-gray-500">{product.specifications}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(product.supplier_price)}
                          </div>
                          <div className="text-xs text-gray-500">per {product.unit_type}</div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="font-semibold text-green-600">
                            {formatCurrency(product.current_market_price)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {((product.current_market_price - product.supplier_price) / product.supplier_price * 100).toFixed(1)}% margin
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="font-medium text-gray-900">
                            {product.minimum_order_quantity?.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">{product.unit_type}</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-900">{product.lead_time_days} days</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getAvailabilityBadge(product.availability_status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Stats */}
        {filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Products</p>
                    <p className="text-xl font-bold text-gray-900">{filteredProducts.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Available</p>
                    <p className="text-xl font-bold text-green-600">
                      {filteredProducts.filter(p => p.availability_status === 'available').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-600">Avg. Supplier Price</p>
                    <p className="text-xl font-bold text-primary-600">
                      {formatCurrency(filteredProducts.reduce((sum, p) => sum + p.supplier_price, 0) / filteredProducts.length)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Avg. Lead Time</p>
                    <p className="text-xl font-bold text-orange-600">
                      {Math.round(filteredProducts.reduce((sum, p) => sum + p.lead_time_days, 0) / filteredProducts.length)} days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  )
}