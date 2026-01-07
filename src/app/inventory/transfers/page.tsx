'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import mockApi from '@/lib/mockApi'
import { formatDateTime } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
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
  MapPin,
  Hash,
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

interface Location {
  id: string
  name: string
  type: 'warehouse' | 'substore'
}

interface Product {
  id: number
  name: string
  code: string
  unit: string
  current_stock: number
}

interface TransferItem {
  product_id: number
  product_name: string
  product_code: string
  quantity: number
  unit_type: string
}

interface CreateTransferData {
  source_location: string
  destination_location: string
  items: TransferItem[]
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

// Create Transfer Modal Component
function CreateTransferModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const [formData, setFormData] = useState<CreateTransferData>({
    source_location: '',
    destination_location: '',
    items: [],
    notes: ''
  })
  // Fetch locations
  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: () => mockApi.get('/locations'),
    enabled: isOpen
  })

  // Fetch products for selected source location
  const { data: products } = useQuery({
    queryKey: ['products', formData.source_location],
    queryFn: () => mockApi.get(`/inventory/products?location=${formData.source_location}`),
    enabled: isOpen && !!formData.source_location
  })

  const createTransferMutation = useMutation({
    mutationFn: (data: CreateTransferData) => mockApi.post('/inventory/transfers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-transfers-list'] })
      addToast('Transfer created successfully', 'success')
      onClose()
      resetForm()
    },
    onError: () => {
      addToast('Failed to create transfer', 'error')
    }
  })

  const resetForm = () => {
    setFormData({
      source_location: '',
      destination_location: '',
      items: [],
      notes: ''
    })
  }

  const addItemLine = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product_id: 0,
          product_name: '',
          product_code: '',
          quantity: 1,
          unit_type: ''
        }
      ]
    }))
  }

  const removeItemLine = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const updateItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          if (field === 'product_id') {
            const selectedProduct = products?.find((p: Product) => p.id === parseInt(value))
            if (selectedProduct) {
              return {
                ...item,
                product_id: selectedProduct.id,
                product_name: selectedProduct.name,
                product_code: selectedProduct.code,
                unit_type: selectedProduct.unit
              }
            }
          }
          return { ...item, [field]: value }
        }
        return item
      })
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.items.length === 0) {
      addToast('Please add at least one product', 'error')
      return
    }
    createTransferMutation.mutate(formData)
  }

  if (!isOpen) return null

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Create Stock Transfer</h2>
            <Button variant="ghost" onClick={onClose} className="text-xl">×</Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Source Location</label>
                <select
                  className="w-full p-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={formData.source_location}
                  onChange={(e) => setFormData(prev => ({ ...prev, source_location: e.target.value, items: [] }))}
                  required
                >
                  <option value="">Select source location</option>
                  {locations?.map((location: Location) => (
                    <option key={location.id} value={location.name}>
                      {location.name} ({location.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Destination Location</label>
                <select
                  className="w-full p-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={formData.destination_location}
                  onChange={(e) => setFormData(prev => ({ ...prev, destination_location: e.target.value }))}
                  required
                >
                  <option value="">Select destination location</option>
                  {locations?.filter((loc: Location) => loc.name !== formData.source_location).map((location: Location) => (
                    <option key={location.id} value={location.name}>
                      {location.name} ({location.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product Selection - Dropdown Based */}
            {formData.source_location && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Select Products</label>
                  <Button
                    type="button"
                    size="sm"
                    onClick={addItemLine}
                    className="text-sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </Button>
                </div>

                {formData.items.length === 0 ? (
                  <div className="text-center p-6 border border-border rounded-md bg-gray-50">
                    <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No items selected. Click "Add Item" to start.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.items.map((item, index) => {
                      const selectedProduct = products?.find((p: Product) => p.id === item.product_id)
                      return (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                          <div className="flex-1 grid grid-cols-3 gap-3">
                            {/* Product Dropdown */}
                            <div>
                              <select
                                className="w-full p-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                value={item.product_id || ''}
                                onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                                required
                              >
                                <option value="">Select Product</option>
                                {products?.map((product: Product) => (
                                  <option key={product.id} value={product.id}>
                                    {product.name} ({product.code})
                                  </option>
                                ))}
                              </select>
                              {selectedProduct && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Stock: {selectedProduct.current_stock} {selectedProduct.unit}
                                </div>
                              )}
                            </div>

                            {/* Quantity Input */}
                            <div>
                              <input
                                type="number"
                                min="1"
                                max={selectedProduct?.current_stock || 999999}
                                value={item.quantity || ''}
                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                className="w-full p-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="Quantity"
                                required
                              />
                            </div>

                            {/* Unit Display */}
                            <div className="flex items-center">
                              <div className="w-full p-2 border border-border rounded-md text-sm bg-gray-100">
                                {item.unit_type || 'Unit'}
                              </div>
                            </div>
                          </div>

                          {/* Remove Button */}
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeItemLine(index)}
                            className="flex-shrink-0"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                className="w-full p-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional notes about this transfer..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button
                type="submit"
                className="mofad-btn-primary"
                disabled={createTransferMutation.isPending}
              >
                {createTransferMutation.isPending ? 'Creating...' : 'Create Transfer'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )

  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null
}

// View Transfer Details Modal Component
function ViewTransferModal({ isOpen, onClose, transferId }: { isOpen: boolean; onClose: () => void; transferId: number | null }) {
  const { data: transfer, isLoading, error } = useQuery({
    queryKey: ['transfer-details', transferId],
    queryFn: () => mockApi.get(`/inventory/transfers/${transferId}`),
    enabled: isOpen && !!transferId
  })

  if (!isOpen || !transferId) return null

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Transfer Details</h2>
            <Button variant="ghost" onClick={onClose} className="text-xl">×</Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-gray-500">Loading transfer details...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-500">Error loading transfer details. Please try again.</p>
            </div>
          )}

          {transfer && (
            <div className="space-y-6">
              {/* Transfer Header Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Hash className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">Transfer Number</span>
                    </div>
                    <p className="font-semibold text-gray-900">{transfer.transfer_number}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">Created Date</span>
                    </div>
                    <p className="text-gray-900">{formatDateTime(transfer.created_date).split(',')[0]}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">Requested By</span>
                    </div>
                    <p className="text-gray-900">{transfer.requested_by}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(transfer.status)}
                      <span className="text-sm font-medium text-gray-600">Status</span>
                    </div>
                    {getStatusBadge(transfer.status)}
                  </div>
                </div>
              </div>

              {/* Route Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Transfer Route
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">From</p>
                        <p className="text-blue-600 font-semibold">{transfer.source_location}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <ArrowLeftRight className="w-6 h-6 text-gray-400" />
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Building className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">To</p>
                        <p className="text-green-600 font-semibold">{transfer.destination_location}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Product Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* For single product transfer (current structure) */}
                    {transfer.product_name && (
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{transfer.product_name}</p>
                            <p className="text-sm text-gray-500 font-mono">{transfer.product_code}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            {transfer.quantity.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">{transfer.unit_type}</p>
                        </div>
                      </div>
                    )}

                    {/* For multi-item transfers (future structure) */}
                    {transfer.items && transfer.items.length > 0 && (
                      <div className="space-y-3">
                        {transfer.items.map((item: TransferItem, index: number) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Package className="w-6 h-6 text-orange-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{item.product_name}</p>
                                <p className="text-sm text-gray-500 font-mono">{item.product_code}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-gray-900">
                                {item.quantity.toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-500">{item.unit_type}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Transfer Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Transfer Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Transfer Requested</p>
                        <p className="text-sm text-gray-500">{formatDateTime(transfer.created_date)}</p>
                        <p className="text-sm text-gray-600">Requested by {transfer.requested_by}</p>
                      </div>
                    </div>

                    {transfer.status !== 'pending' && transfer.approved_by && (
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-1 ${transfer.status === 'rejected' ? 'bg-red-100' : 'bg-green-100'}`}>
                          {transfer.status === 'rejected' ?
                            <XCircle className="w-4 h-4 text-red-600" /> :
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          }
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Transfer {transfer.status === 'rejected' ? 'Rejected' : 'Approved'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {transfer.transfer_date ? formatDateTime(transfer.transfer_date) : 'Pending approval'}
                          </p>
                          <p className="text-sm text-gray-600">By {transfer.approved_by}</p>
                        </div>
                      </div>
                    )}

                    {transfer.status === 'in_transit' && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                          <Truck className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">In Transit</p>
                          <p className="text-sm text-gray-500">Transfer is on its way</p>
                        </div>
                      </div>
                    )}

                    {transfer.status === 'completed' && transfer.received_date && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Transfer Completed</p>
                          <p className="text-sm text-gray-500">{formatDateTime(transfer.received_date)}</p>
                          <p className="text-sm text-gray-600">Successfully received at destination</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {transfer.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{transfer.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <div className="flex justify-end mt-6 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  )

  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null
}

export default function StockTransfersPage() {
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedTransferId, setSelectedTransferId] = useState<number | null>(null)

  const { data: transfersList, isLoading } = useQuery({
    queryKey: ['stock-transfers-list'],
    queryFn: () => mockApi.get('/inventory/transfers'),
  })

  // Mutations for approving/rejecting transfers
  const approveMutation = useMutation({
    mutationFn: (transferId: number) => mockApi.post(`/inventory/transfers/${transferId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-transfers-list'] })
      addToast('Transfer approved successfully', 'success')
    }
  })

  const rejectMutation = useMutation({
    mutationFn: (transferId: number) => mockApi.post(`/inventory/transfers/${transferId}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-transfers-list'] })
      addToast('Transfer rejected', 'success')
    }
  })

  const handleViewTransfer = (transferId: number) => {
    setSelectedTransferId(transferId)
    setIsViewModalOpen(true)
  }

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false)
    setSelectedTransferId(null)
  }

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

  // Calculate stats
  const stats = {
    total: transfers.length,
    pending: transfers.filter((t: StockTransfer) => t.status === 'pending').length,
    approved: transfers.filter((t: StockTransfer) => t.status === 'approved').length,
    in_transit: transfers.filter((t: StockTransfer) => t.status === 'in_transit').length,
    completed: transfers.filter((t: StockTransfer) => t.status === 'completed').length,
    rejected: transfers.filter((t: StockTransfer) => t.status === 'rejected').length
  }

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
            <Button
              className="mofad-btn-primary"
              onClick={() => {
                console.log('New Transfer button clicked')
                setIsCreateModalOpen(true)
              }}
            >
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
                  <p className="text-2xl font-bold text-primary">{stats.total}</p>
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
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
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
                  <p className="text-2xl font-bold text-purple-600">{stats.in_transit}</p>
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
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
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
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
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

        {/* Transfers Table */}
        <Card>
          <CardContent className="p-0">
            {filteredTransfers.length === 0 ? (
              <div className="p-12 text-center">
                <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transfers found</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all' || locationFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'No stock transfers have been created yet'}
                </p>
                {!searchTerm && statusFilter === 'all' && locationFilter === 'all' && (
                  <Button
                    className="mt-4 mofad-btn-primary"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Transfer
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Transfer #</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Route</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Quantity</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Requested By</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Created</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {isLoading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                          <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                          <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
                          <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div></td>
                          <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div></td>
                          <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                          <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                          <td className="py-3 px-4"><div className="h-8 bg-gray-200 rounded w-20 mx-auto"></div></td>
                        </tr>
                      ))
                    ) : (
                      filteredTransfers.map((transfer: StockTransfer) => (
                        <tr key={transfer.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(transfer.status)}
                              <div className="font-medium text-gray-900">{transfer.transfer_number}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-gray-900">{transfer.product_name}</div>
                              <div className="text-sm text-gray-500 font-mono">{transfer.product_code}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="text-sm">
                                <div className="flex items-center gap-1 text-blue-600">
                                  <MapPin className="w-3 h-3" />
                                  <span className="font-medium">{transfer.source_location}</span>
                                </div>
                                <div className="flex items-center gap-1 mt-1 text-green-600">
                                  <ArrowLeftRight className="w-3 h-3" />
                                  <span>{transfer.destination_location}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="font-medium text-gray-900">
                              {transfer.quantity.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">{transfer.unit_type}</div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {getStatusBadge(transfer.status)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3 text-gray-400" />
                              <span className="text-sm text-gray-700">{transfer.requested_by}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-500">
                              {formatDateTime(transfer.created_date).split(',')[0]}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex gap-1 justify-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewTransfer(transfer.id)}
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>

                              {transfer.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => approveMutation.mutate(transfer.id)}
                                    disabled={approveMutation.isPending}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => rejectMutation.mutate(transfer.id)}
                                    disabled={rejectMutation.isPending}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Transfer Modal */}
        <CreateTransferModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />

        {/* View Transfer Modal */}
        <ViewTransferModal
          isOpen={isViewModalOpen}
          onClose={handleCloseViewModal}
          transferId={selectedTransferId}
        />
      </div>
    </AppLayout>
  )
}