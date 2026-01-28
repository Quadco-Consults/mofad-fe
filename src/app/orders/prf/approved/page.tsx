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
  TrendingUp,
  PackageCheck,
  FileCheck,
} from 'lucide-react'

interface PRF {
  id: number
  prf_number: string
  title: string
  description: string | null
  department: string | null
  purpose: string | null
  priority: string | null
  delivery_location: number | null
  delivery_location_name: string | null
  expected_delivery_date: string | null
  estimated_total: number | string
  budget_code: string | null
  status: 'draft' | 'pending_review' | 'reviewed' | 'pending_approval' | 'approved' | 'rejected' | 'partially_fulfilled' | 'fulfilled' | 'cancelled'
  requested_by: number | null
  requested_by_name: string | null
  reviewer: number | null
  reviewer_name: string | null
  reviewed_by: number | null
  reviewed_by_name: string | null
  reviewed_at: string | null
  approver: number | null
  approver_name: string | null
  approved_by: number | null
  approved_by_name: string | null
  created_at: string
  submitted_at: string | null
  approved_at: string | null
  rejected_at: string | null
  approval_notes: string | null
  rejection_reason: string | null
  total_items: number
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved':
      return <CheckCircle className="w-4 h-4 text-green-500" />
    case 'partially_fulfilled':
      return <TrendingUp className="w-4 h-4 text-orange-500" />
    case 'fulfilled':
      return <PackageCheck className="w-4 h-4 text-blue-500" />
    default:
      return <FileCheck className="w-4 h-4 text-green-500" />
  }
}

const getStatusBadge = (status: string) => {
  const colors: Record<string, string> = {
    approved: 'bg-green-100 text-green-800',
    partially_fulfilled: 'bg-orange-100 text-orange-800',
    fulfilled: 'bg-blue-100 text-blue-800',
  }

  const labels: Record<string, string> = {
    approved: 'Approved',
    partially_fulfilled: 'Partially Fulfilled',
    fulfilled: 'Fulfilled',
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.approved}`}>
      {labels[status] || status}
    </span>
  )
}

const getPriorityBadge = (priority: string | null) => {
  if (!priority) return null

  const colors: Record<string, string> = {
    urgent: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-gray-100 text-gray-800',
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority.toLowerCase()] || colors.medium}`}>
      {priority}
    </span>
  )
}

export default function ApprovedPRFPage() {
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('approved,partially_fulfilled,fulfilled') // Approved statuses
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  // Fetch approved PRFs
  const { data: prfData, isLoading } = useQuery({
    queryKey: ['prfs-approved', currentPage, searchTerm, statusFilter],
    queryFn: () => apiClient.getPrfs({
      page: currentPage,
      page_size: pageSize,
      search: searchTerm || undefined,
      status: statusFilter || undefined,
    }),
  })

  // Extract results and pagination info
  const prfs: PRF[] = prfData?.results || (Array.isArray(prfData) ? prfData : [])
  const totalCount = prfData?.paginator?.count ?? prfData?.count ?? prfs.length
  const totalPages = prfData?.paginator?.total_pages ?? (totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1)

  // Calculate stats from current data
  const approvedCount = prfs.filter(p => p.status === 'approved').length
  const partiallyFulfilledCount = prfs.filter(p => p.status === 'partially_fulfilled').length
  const fulfilledCount = prfs.filter(p => p.status === 'fulfilled').length
  const totalValue = prfs.reduce((sum, prf) => sum + Number(prf.estimated_total || 0), 0)

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleView = (id: number) => {
    router.push(`/orders/prf/${id}`)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Approved PRF</h1>
            <p className="text-muted-foreground">View all purchase requisitions that have been approved</p>
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
                  <FileCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Partially Fulfilled</p>
                  <p className="text-2xl font-bold text-foreground">{partiallyFulfilledCount}</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fulfilled</p>
                  <p className="text-2xl font-bold text-foreground">{fulfilledCount}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <PackageCheck className="h-6 w-6 text-blue-600" />
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
                    placeholder="Search by PRF number, title, department..."
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
                <option value="approved,partially_fulfilled,fulfilled">All Approved</option>
                <option value="approved">Approved Only</option>
                <option value="partially_fulfilled">Partially Fulfilled</option>
                <option value="fulfilled">Fulfilled</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* PRF Table */}
        <Card>
          <CardHeader>
            <CardTitle>Approved Purchase Requisitions ({totalCount})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : prfs.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-foreground">No approved PRFs found</h3>
                <p className="mt-1 text-sm text-muted-foreground">No purchase requisitions match your filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">PRF Number</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Title</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Department</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Priority</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Items</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Estimated Total</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Approved</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prfs.map((prf) => (
                      <tr key={prf.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(prf.status)}
                            <span className="font-medium text-foreground">{prf.prf_number}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-foreground">{prf.title}</div>
                          {prf.purpose && (
                            <div className="text-sm text-muted-foreground truncate max-w-xs">{prf.purpose}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-foreground">{prf.department || 'N/A'}</td>
                        <td className="py-3 px-4">{getPriorityBadge(prf.priority)}</td>
                        <td className="py-3 px-4 text-foreground">{prf.total_items} item(s)</td>
                        <td className="py-3 px-4 text-right font-medium text-foreground">
                          {formatCurrency(Number(prf.estimated_total || 0))}
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(prf.status)}</td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-muted-foreground">
                            {prf.approved_at ? formatDateTime(prf.approved_at) : 'N/A'}
                          </div>
                          {prf.approved_by_name && (
                            <div className="text-xs text-muted-foreground">By: {prf.approved_by_name}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleView(prf.id)}
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
