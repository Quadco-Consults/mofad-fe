'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Search, Eye, Building, Package, Star, DollarSign, MapPin, Phone, Mail } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import apiClient from '@/lib/apiClient'
import { formatCurrency } from '@/lib/utils'

const getStatusBadge = (status: string) => {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    suspended: 'bg-yellow-100 text-yellow-800',
    blacklisted: 'bg-red-100 text-red-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

const getSupplierTypeBadge = (type: string) => {
  const colors: Record<string, string> = {
    Primary: 'bg-blue-100 text-blue-800',
    Premium: 'bg-purple-100 text-purple-800',
    Standard: 'bg-green-100 text-green-800',
    Specialized: 'bg-orange-100 text-orange-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
      {type}
    </span>
  )
}

const getRatingStars = (rating: number) => {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Star
        key={i}
        className={`w-4 h-4 ${i <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
      />
    )
  }
  return <div className="flex">{stars}</div>
}

export default function SupplierProductsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const { data: suppliersData, isLoading, error } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => apiClient.get('/suppliers')
  })

  // Handle both array and paginated responses
  const extractResults = (data: any) => {
    if (Array.isArray(data)) return data
    if (data?.results && Array.isArray(data.results)) return data.results
    return []
  }

  const suppliers = extractResults(suppliersData)

  // Filter suppliers based on search
  const allFilteredSuppliers = suppliers.filter((supplier: any) => {
    if (!supplier) return false
    const matchesSearch = (supplier.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (supplier.contact_person || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (supplier.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // Pagination calculations
  const totalCount = allFilteredSuppliers.length
  const totalPages = Math.ceil(totalCount / pageSize) || 1
  const startIndex = (currentPage - 1) * pageSize
  const filteredSuppliers = allFilteredSuppliers.slice(startIndex, startIndex + pageSize)

  const handleViewProducts = (supplier: any) => {
    router.push(`/suppliers/products/${supplier.id}`)
  }

  if (error) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-red-500">Error loading suppliers. Please try again.</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Supplier Products</h1>
          <p className="text-muted-foreground">View products offered by each supplier</p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search suppliers..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Suppliers Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-2 text-gray-500">Loading suppliers...</p>
              </div>
            ) : filteredSuppliers.length === 0 ? (
              <div className="p-12 text-center">
                <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Try adjusting your search term' : 'No suppliers available'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Supplier</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Products</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Rating</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredSuppliers.map((supplier: any) => (
                      <tr key={supplier.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <Building className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{supplier.name}</div>
                              <div className="text-sm text-gray-500">{supplier.contact_person}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getSupplierTypeBadge(supplier.supplier_type)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-600 truncate max-w-[150px]">{supplier.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-600">{supplier.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Package className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600">
                              {supplier.products_supplied?.slice(0, 2).join(', ')}
                              {supplier.products_supplied?.length > 2 && ` +${supplier.products_supplied.length - 2} more`}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getRatingStars(Math.round(supplier.rating))}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(supplier.status)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3"
                            title="View Products"
                            onClick={() => handleViewProducts(supplier)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Products
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

        {/* Pagination */}
        {!isLoading && totalCount > 0 && (
          <Card>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </Card>
        )}
      </div>
    </AppLayout>
  )
}