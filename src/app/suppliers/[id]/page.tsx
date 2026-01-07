'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Download, Edit, Trash2, Building, Phone, Mail, MapPin, Package, Star, DollarSign, TrendingUp, Calendar, CheckCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { AppLayout } from '@/components/layout/AppLayout'
import mockApi from '@/lib/mockApi'
import { formatCurrency, formatDateTime } from '@/lib/utils'

const getStatusBadge = (status: string) => {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800 border-green-200',
    inactive: 'bg-gray-100 text-gray-800 border-gray-200',
    suspended: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    blacklisted: 'bg-red-100 text-red-800 border-red-200'
  }

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

const getSupplierTypeBadge = (type: string) => {
  const colors: Record<string, string> = {
    Primary: 'bg-blue-100 text-blue-800 border-blue-200',
    Premium: 'bg-purple-100 text-purple-800 border-purple-200',
    Standard: 'bg-green-100 text-green-800 border-green-200',
    Specialized: 'bg-orange-100 text-orange-800 border-orange-200'
  }

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${colors[type] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
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
        className={`w-5 h-5 ${i <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
      />
    )
  }
  return <div className="flex">{stars}</div>
}

export default function SupplierViewPage() {
  const params = useParams()
  const router = useRouter()
  const supplierId = params?.id as string

  const { data: suppliersData, isLoading, error } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => mockApi.get('/suppliers')
  })

  // Handle both array and paginated responses
  const extractResults = (data: any) => {
    if (Array.isArray(data)) return data
    if (data?.results && Array.isArray(data.results)) return data.results
    return []
  }

  const suppliers = extractResults(suppliersData)
  const supplier = suppliers.find((s: any) => s.id === parseInt(supplierId))

  if (error) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-red-500">Error loading supplier details. Please try again.</p>
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
            <p className="mt-2 text-gray-500">Loading supplier details...</p>
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
              onClick={() => router.push('/suppliers')}
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
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/suppliers')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Suppliers
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Supplier Details</h1>
              <p className="text-gray-600">Complete supplier information and performance metrics</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Supplier Overview Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Building className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{supplier.name}</h2>
                  <p className="text-gray-600 text-lg">{supplier.contact_person}</p>
                  <div className="flex items-center gap-3 mt-2">
                    {getSupplierTypeBadge(supplier.supplier_type)}
                    {getStatusBadge(supplier.status)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  {getRatingStars(Math.round(supplier.rating))}
                  <span className="text-lg font-semibold text-gray-700">({supplier.rating})</span>
                </div>
                <p className="text-sm text-gray-500">Supplier Rating</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Contact Information */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Contact Information
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{supplier.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{supplier.phone}</span>
                  </div>
                  {supplier.contact_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{supplier.contact_phone} <span className="text-gray-500">(Contact)</span></span>
                    </div>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </h4>
                <p className="text-gray-700">{supplier.address}</p>
              </div>

              {/* Products */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Products Supplied
                </h4>
                <div className="space-y-1">
                  {supplier.products_supplied?.map((product: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-gray-700">{product}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Credit Limit</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(supplier.credit_limit)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${supplier.current_balance > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                  <DollarSign className={`h-6 w-6 ${supplier.current_balance > 0 ? 'text-red-600' : 'text-green-600'}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Balance</p>
                  <p className={`text-xl font-bold ${supplier.current_balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(supplier.current_balance)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {supplier.current_balance > 0 ? 'Outstanding' : 'Credit'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">YTD Value</p>
                  <p className="text-xl font-bold text-primary-600">{formatCurrency(supplier.total_value_ytd)}</p>
                  <p className="text-xs text-gray-500">{supplier.total_orders_ytd} orders</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Terms</p>
                  <p className="text-xl font-bold text-gray-900">{supplier.payment_terms}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Metrics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Supplier Rating</span>
                  <div className="flex items-center gap-2">
                    {getRatingStars(Math.round(supplier.rating))}
                    <span className="font-semibold">({supplier.rating})</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Orders (YTD)</span>
                  <span className="font-semibold">{supplier.total_orders_ytd}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Value (YTD)</span>
                  <span className="font-semibold">{formatCurrency(supplier.total_value_ytd)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Order Date</span>
                  <span className="font-semibold">{formatDateTime(supplier.last_order_date)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Account Information
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Supplier ID</span>
                  <span className="font-semibold">#{supplier.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Status</span>
                  {getStatusBadge(supplier.status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Supplier Type</span>
                  {getSupplierTypeBadge(supplier.supplier_type)}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created Date</span>
                  <span className="font-semibold">{formatDateTime(supplier.created_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">Last Order Completed</p>
                  <p className="text-sm text-gray-600">{formatDateTime(supplier.last_order_date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">Account Created</p>
                  <p className="text-sm text-gray-600">{formatDateTime(supplier.created_at)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}