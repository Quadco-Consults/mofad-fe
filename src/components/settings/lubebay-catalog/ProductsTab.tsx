'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Package, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import {
  Select,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/Select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import apiClient from '@/lib/apiClient'

interface Product {
  id: number
  name: string
  sku: string
  category: string
  unit_of_measurement: string
  is_active: boolean
}

export default function ProductsTab() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Fetch products with pagination
  const { data, isLoading } = useQuery({
    queryKey: ['products', categoryFilter, statusFilter, searchTerm, currentPage],
    queryFn: async () => {
      const params: Record<string, string> = {
        page: currentPage.toString(),
        page_size: pageSize.toString(),
      }
      if (categoryFilter) params.category = categoryFilter
      if (statusFilter) params.is_active = statusFilter
      if (searchTerm) params.search = searchTerm

      const response = await apiClient.get('/products/', params)
      return response
    },
  })

  const products = data?.results || []
  const totalCount = data?.count || 0
  const totalPages = Math.ceil(totalCount / pageSize)

  // Reset to page 1 when filters change
  const handleFilterChange = (setter: (value: string) => void) => (value: string) => {
    setter(value)
    setCurrentPage(1)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm font-medium text-gray-600">Total Products</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{totalCount}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm font-medium text-gray-600">Active Products</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {products.filter((p: Product) => p.is_active).length}
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm font-medium text-gray-600">Categories</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {new Set(products.map((p: Product) => p.category)).size}
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Package className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900">Lubebay Products</h3>
          <p className="text-sm text-blue-700 mt-1">
            Products sold at lubebays are managed from the main Products section. This view shows all
            products available for sale at your lubebays.
          </p>
        </div>
        <Link href="/inventory/products">
          <Button variant="outline" size="sm" className="whitespace-nowrap flex-shrink-0">
            Manage Products
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>

      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Category:</span>
            <Select value={categoryFilter || ''} onValueChange={handleFilterChange(setCategoryFilter)}>
              <SelectTrigger className="w-40">
                <SelectItem value="">All</SelectItem>
                <SelectItem value="lubricant">Lubricant</SelectItem>
                <SelectItem value="filter">Filter</SelectItem>
                <SelectItem value="battery">Battery</SelectItem>
                <SelectItem value="tire">Tire</SelectItem>
                <SelectItem value="accessory">Accessory</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectTrigger>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Status:</span>
            <Select value={statusFilter || ''} onValueChange={handleFilterChange(setStatusFilter)}>
              <SelectTrigger className="w-32">
                <SelectItem value="">All</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectTrigger>
            </Select>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(categoryFilter || statusFilter || searchTerm) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Active filters:</span>
          {searchTerm && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchTerm('')}>
              Search: {searchTerm} ×
            </Badge>
          )}
          {categoryFilter && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => setCategoryFilter('')}>
              {categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)} ×
            </Badge>
          )}
          {statusFilter && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => setStatusFilter('')}>
              {statusFilter === 'true' ? 'Active' : 'Inactive'} ×
            </Badge>
          )}
          <button
            onClick={() => {
              setSearchTerm('')
              setCategoryFilter('')
              setStatusFilter('')
              setCurrentPage(1)
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Products Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading products...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <Package className="h-12 w-12 text-gray-300" />
                    <p className="text-gray-500 font-medium">No products found</p>
                    <p className="text-sm text-gray-400">
                      {searchTerm || categoryFilter || statusFilter
                        ? 'Try adjusting your filters to see more products'
                        : 'No products available in the catalog yet'}
                    </p>
                    <Link href="/inventory/products">
                      <Button className="mt-2">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Go to Products
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product: Product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-gray-600">{product.sku}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {product.category || 'Uncategorized'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {product.unit_of_measurement || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.is_active ? 'default' : 'secondary'}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalCount > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  )
}
