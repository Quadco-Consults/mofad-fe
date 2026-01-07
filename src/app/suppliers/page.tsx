'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import mockApi from '@/lib/mockApi'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Building,
  Phone,
  Mail,
  MapPin,
  Package,
  Star,
  DollarSign,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  X,
  Save,
  Loader2,
} from 'lucide-react'

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

export default function SuppliersPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  // Fetch suppliers
  const { data: suppliersData, isLoading, error, refetch } = useQuery({
    queryKey: ['suppliers', searchTerm, statusFilter, typeFilter],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (statusFilter !== 'all') params.status = statusFilter
      if (typeFilter !== 'all') params.supplier_type = typeFilter
      if (searchTerm) params.search = searchTerm
      return mockApi.get('/suppliers', params)
    },
  })

  // Handle both array and paginated responses
  const extractResults = (data: any) => {
    if (Array.isArray(data)) return data
    if (data?.results && Array.isArray(data.results)) return data.results
    return []
  }

  const suppliers = extractResults(suppliersData)

  // Filter suppliers based on search and filters
  const filteredSuppliers = suppliers.filter((supplier: any) => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contact_person.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter
    const matchesType = typeFilter === 'all' || supplier.supplier_type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const handleView = (supplier: any) => {
    router.push(`/suppliers/${supplier.id}`)
  }


  // Get unique supplier types for filter
  const supplierTypes = [...new Set(filteredSuppliers.map((s: any) => s.supplier_type))]

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Suppliers</h1>
            <p className="text-muted-foreground">Manage petroleum suppliers and vendor relationships</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="mofad-btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Supplier
            </Button>
          </div>
        </div>


        {/* Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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

          <div className="flex gap-2">
            <select
              className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>

            <select
              className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              {supplierTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Suppliers Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 py-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4 mt-2"></div>
                      </div>
                      <div className="w-20 h-4 bg-gray-200 rounded"></div>
                      <div className="w-24 h-4 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : filteredSuppliers.length === 0 ? (
              <div className="p-12 text-center">
                <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first supplier'}
                </p>
                <Button className="mofad-btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Supplier
                </Button>
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
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Payment Terms</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Credit Limit</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Balance</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">YTD Orders</th>
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
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">{supplier.payment_terms}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(supplier.credit_limit)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-semibold ${supplier.current_balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(supplier.current_balance)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(supplier.total_value_ytd)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {supplier.total_orders_ytd} orders
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getRatingStars(Math.round(supplier.rating))}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(supplier.status)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="View Supplier"
                              onClick={() => handleView(supplier)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Edit Supplier"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Delete Supplier"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
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