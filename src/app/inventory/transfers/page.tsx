'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import mockApi from '@/lib/mockApi'
import { formatDateTime } from '@/lib/utils'
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeftRight,
  Package,
  Building,
  User,
  Calendar,
  FileText,
  Truck,
  AlertCircle,
  MessageSquare,
} from 'lucide-react'

interface StockTransfer {
  id: number
  transfer_number: string
  source_location: string
  destination_location: string
  product_name: string
  product_code: string
  quantity: number
  unit_type: string
  status: 'pending' | 'approved' | 'in_transit' | 'completed' | 'rejected'
  requested_by: string
  approved_by: string | null
  created_date: string
  transfer_date: string | null
  received_date: string | null
  notes: string
}

const getStatusBadge = (status: string) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    in_transit: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
    </span>
  )
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="w-4 h-4 text-yellow-500" />
    case 'approved':
      return <CheckCircle className="w-4 h-4 text-blue-500" />
    case 'in_transit':
      return <Truck className="w-4 h-4 text-purple-500" />
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-500" />
    case 'rejected':
      return <XCircle className="w-4 h-4 text-red-500" />
    default:
      return <Package className="w-4 h-4 text-gray-500" />
  }
}

const getTransferProgress = (status: string) => {
  const steps = ['pending', 'approved', 'in_transit', 'completed']
  const currentIndex = steps.indexOf(status)

  if (status === 'rejected') {
    return { currentStep: 0, totalSteps: 4, rejected: true }
  }

  return { currentStep: currentIndex + 1, totalSteps: 4, rejected: false }
}

export default function StockTransfersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')

  const { data: transfersList, isLoading } = useQuery({
    queryKey: ['stock-transfers-list'],
    queryFn: () => mockApi.get('/inventory/transfers'),
  })

  const transfers = transfersList || []

  // Get unique locations for filter
  const locations = Array.from(new Set([
    ...transfers.map((t: StockTransfer) => t.source_location),
    ...transfers.map((t: StockTransfer) => t.destination_location)
  ]))

  // Filter transfers
  const filteredTransfers = transfers.filter((transfer: StockTransfer) => {
    const matchesSearch = transfer.transfer_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.source_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.destination_location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter
    const matchesLocation = locationFilter === 'all' ||
                           transfer.source_location === locationFilter ||
                           transfer.destination_location === locationFilter

    return matchesSearch && matchesStatus && matchesLocation
  })

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Stock Transfers</h1>
            <p className="text-muted-foreground">Manage inventory transfers between locations</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="mofad-btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              New Transfer
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Transfers</p>
                  <p className="text-2xl font-bold text-primary">5</p>
                </div>
                <ArrowLeftRight className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">1</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Transit</p>
                  <p className="text-2xl font-bold text-purple-600">1</p>
                </div>
                <Truck className="w-8 h-8 text-purple-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">1</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">1</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search transfers..."
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
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="in_transit">In Transit</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                >
                  <option value="all">All Locations</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>

                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transfers List */}
        <div className="space-y-4">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse">
                    <div className="h-32 bg-muted rounded-md"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            filteredTransfers.map((transfer: StockTransfer) => {
              const progress = getTransferProgress(transfer.status)

              return (
                <Card key={transfer.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(transfer.status)}
                          <div>
                            <h3 className="font-semibold text-lg">{transfer.transfer_number}</h3>
                            <p className="text-sm text-muted-foreground">{transfer.product_name} ({transfer.product_code})</p>
                          </div>
                        </div>
                        {getStatusBadge(transfer.status)}
                      </div>

                      {/* Transfer Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Source and Destination */}
                        <div className="md:col-span-2">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex-1 text-center">
                              <Building className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                              <p className="font-medium text-sm">{transfer.source_location}</p>
                              <p className="text-xs text-muted-foreground">Source</p>
                            </div>

                            <ArrowLeftRight className="w-6 h-6 text-muted-foreground" />

                            <div className="flex-1 text-center">
                              <Building className="w-6 h-6 mx-auto text-green-500 mb-2" />
                              <p className="font-medium text-sm">{transfer.destination_location}</p>
                              <p className="text-xs text-muted-foreground">Destination</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Quantity</p>
                              <p className="font-semibold">{transfer.quantity.toLocaleString()} {transfer.unit_type}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Requested by</p>
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3 text-muted-foreground" />
                                <p className="font-medium text-xs">{transfer.requested_by}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Progress and Dates */}
                        <div>
                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Progress</span>
                              {transfer.status !== 'rejected' && (
                                <span className="text-xs text-muted-foreground">
                                  {progress.currentStep}/{progress.totalSteps}
                                </span>
                              )}
                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  progress.rejected ? 'bg-red-500' : 'bg-primary'
                                }`}
                                style={{
                                  width: progress.rejected ? '100%' : `${(progress.currentStep / progress.totalSteps) * 100}%`
                                }}
                              ></div>
                            </div>
                          </div>

                          {/* Key Dates */}
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Created</span>
                              <span className="font-medium">
                                {formatDateTime(transfer.created_date).split(',')[0]}
                              </span>
                            </div>

                            {transfer.transfer_date && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Transfer Date</span>
                                <span className="font-medium">
                                  {formatDateTime(transfer.transfer_date).split(',')[0]}
                                </span>
                              </div>
                            )}

                            {transfer.received_date && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Received</span>
                                <span className="font-medium text-green-600">
                                  {formatDateTime(transfer.received_date).split(',')[0]}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {transfer.notes && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Notes</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{transfer.notes}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex justify-between items-center pt-2 border-t">
                        <div className="flex items-center gap-2">
                          {transfer.approved_by && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <CheckCircle className="w-3 h-3" />
                              <span>Approved by {transfer.approved_by}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>

                          {transfer.status === 'pending' && (
                            <>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                              <Button variant="destructive" size="sm">
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                            </>
                          )}

                          {transfer.status === 'in_transit' && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Confirm Receipt
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </AppLayout>
  )
}