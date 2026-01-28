'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import {
  Search,
  Download,
  Eye,
  CheckCircle,
  Truck,
  PackageCheck,
  FileCheck,
} from 'lucide-react'

interface PRO {
  id: number
  pro_number: string
  title: string | null
  description: string | null
  supplier: string | null
  supplier_contact: string | null
  supplier_email: string | null
  supplier_phone: string | null
  total_amount: number | string
  status: 'draft' | 'sent' | 'confirmed' | 'partially_delivered' | 'delivered' | 'cancelled'
  delivery_status: 'pending' | 'partial' | 'completed'
  delivery_location: number | null
  delivery_location_name: string | null
  created_by: number | null
  created_by_name: string | null
  created_at: string
  expected_delivery_date: string | null
  items_count: number
  items: any[]
  payment_terms: string | null
  payment_method: string | null
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved':
      return <CheckCircle className="w-4 h-4 text-green-500" />
    case 'sent':
      return <FileCheck className="w-4 h-4 text-blue-500" />
    case 'confirmed':
      return <FileCheck className="w-4 h-4 text-blue-500" />
    case 'partially_delivered':
      return <Truck className="w-4 h-4 text-orange-500" />
    case 'delivered':
      return <PackageCheck className="w-4 h-4 text-green-500" />
    default:
      return <CheckCircle className="w-4 h-4 text-green-500" />
  }
}

const getStatusBadge = (status: string) => {
  const colors: Record<string, string> = {
    approved: 'bg-green-100 text-green-800',
    sent: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-blue-100 text-blue-800',
    partially_delivered: 'bg-orange-100 text-orange-800',
    delivered: 'bg-green-100 text-green-800',
  }

  const labels: Record<string, string> = {
    approved: 'Approved',
    sent: 'Sent to Supplier',
    confirmed: 'Confirmed',
    partially_delivered: 'Partial Delivery',
    delivered: 'Delivered',
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.approved}`}>
      {labels[status] || status}
    </span>
  )
}

const getDeliveryBadge = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    partial: 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.pending}`}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending'}
    </span>
  )
}

export default function ApprovedPROPage() {
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('approved,sent,confirmed,partially_delivered,delivered') // Approved and post-approval statuses
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  // Fetch approved PROs (approved and beyond)
  const { data: proData, isLoading } = useQuery({
    queryKey: ['pros-approved', currentPage, searchTerm, statusFilter],
    queryFn: () => apiClient.getPros({
      page: currentPage,
      page_size: pageSize,
      search: searchTerm || undefined,
      status: statusFilter || undefined,
    }),
  })

  // Extract results and pagination info
  const pros: PRO[] = proData?.results || (Array.isArray(proData) ? proData : [])
  const totalCount = proData?.paginator?.count ?? proData?.count ?? pros.length
  const totalPages = proData?.paginator?.total_pages ?? (totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1)

  // Calculate stats from current data
  const approvedCount = pros.filter(p => p.status === 'approved').length
  const sentCount = pros.filter(p => p.status === 'sent').length
  const confirmedCount = pros.filter(p => p.status === 'confirmed').length
  const deliveredCount = pros.filter(p => p.status === 'delivered').length
  const partiallyDeliveredCount = pros.filter(p => p.status === 'partially_delivered').length

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleView = (id: number) => {
    router.push(`/orders/pro/${id}`)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Approved PRO</h1>
            <p className="text-muted-foreground">View all purchase orders that have been approved</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Approved</p>
                  <p className="text-2xl font-bold text-foreground">{totalCount}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-foreground">{approvedCount}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sent/Confirmed</p>
                  <p className="text-2xl font-bold text-foreground">{sentCount + confirmedCount}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileCheck className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                  <p className="text-2xl font-bold text-foreground">{deliveredCount + partiallyDeliveredCount}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <PackageCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by PRO number, supplier..."
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
              <select
                className="px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
              >
                <option value="approved,sent,confirmed,partially_delivered,delivered">All Approved</option>
                <option value="approved">Approved Only</option>
                <option value="sent">Sent to Supplier</option>
                <option value="confirmed">Confirmed</option>
                <option value="partially_delivered">Partially Delivered</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* PRO Table */}
        <Card>
          <CardHeader>
            <CardTitle>Approved Purchase Orders ({totalCount})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : pros.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-foreground">No approved PROs found</h3>
                <p className="mt-1 text-sm text-muted-foreground">No purchase orders match your filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">PRO Number</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Supplier</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Items</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total Amount</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Received Value</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Pending Value</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Delivery</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Created</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pros.map((pro) => {
                      // Calculate received and pending values
                      const items = pro.items || []
                      const receivedValue = items.reduce((sum: number, item: any) => {
                        const received = Number(item.received_quantity || item.quantity_delivered || 0)
                        const unitPrice = Number(item.unit_price || 0)
                        return sum + (received * unitPrice)
                      }, 0)

                      const totalOrderValue = Number(pro.total_amount) || 0
                      const pendingValue = totalOrderValue - receivedValue

                      return (
                        <tr key={pro.id} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(pro.status)}
                              <span className="font-medium text-foreground">{pro.pro_number}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-foreground">{pro.supplier || 'N/A'}</div>
                              {pro.supplier_contact && (
                                <div className="text-sm text-muted-foreground">{pro.supplier_contact}</div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-foreground">{pro.items_count} item(s)</td>
                          <td className="py-3 px-4 text-right font-medium text-foreground">
                            {formatCurrency(totalOrderValue)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-medium text-green-600">
                              {formatCurrency(receivedValue)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className={`font-medium ${pendingValue > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                              {formatCurrency(pendingValue)}
                            </span>
                          </td>
                          <td className="py-3 px-4">{getStatusBadge(pro.status)}</td>
                          <td className="py-3 px-4">{getDeliveryBadge(pro.delivery_status)}</td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-muted-foreground">
                              {formatDateTime(pro.created_at)}
                            </div>
                            {pro.created_by_name && (
                              <div className="text-xs text-muted-foreground">By: {pro.created_by_name}</div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleView(pro.id)}
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
