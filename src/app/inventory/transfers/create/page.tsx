'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import apiClient from '@/lib/apiClient'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import {
  ArrowLeft,
  Save,
  Plus,
  Calendar,
  Building,
  Package,
  FileText,
  Search,
  Loader2,
  Trash2,
  ArrowLeftRight,
  Truck,
  Info,
} from 'lucide-react'

interface Product {
  id: number
  name: string
  code: string
  unit_of_measure: string
  cost_price: number
  selling_price: number
  category_name?: string
}

interface TransferItem {
  id: number
  product: number
  product_name: string
  product_code: string
  quantity_to_transfer: number
  unit_cost: number
  total_cost: number
  unit: string
  batch_number?: string
  expiry_date?: string
}

interface TransferFormData {
  from_warehouse: number | null
  to_warehouse: number | null
  transfer_date: string
  expected_date: string
  reason: string
  carrier: string
  tracking_number: string
  transport_cost: number
  notes: string
  items: TransferItem[]
}

export default function CreateStockTransferPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const isSubmittingRef = useRef(false)
  const [productSearch, setProductSearch] = useState('')
  const [showProductDropdown, setShowProductDropdown] = useState(false)

  const [formData, setFormData] = useState<TransferFormData>({
    from_warehouse: null,
    to_warehouse: null,
    transfer_date: new Date().toISOString().split('T')[0],
    expected_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reason: '',
    carrier: '',
    tracking_number: '',
    transport_cost: 0,
    notes: '',
    items: [],
  })

  // Fetch warehouses
  const { data: warehousesData } = useQuery({
    queryKey: ['warehouses-for-transfer'],
    queryFn: () => apiClient.get('/warehouses/', { is_active: 'true' }),
  })

  // Fetch products for selection
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products-for-transfer', productSearch],
    queryFn: () => apiClient.getProducts({ search: productSearch, is_active: true }),
  })

  const warehouses = warehousesData?.results || (Array.isArray(warehousesData) ? warehousesData : [])
  const products = productsData?.results || (Array.isArray(productsData) ? productsData : [])

  // Create transfer mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.createStockTransfer(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['stock-transfers'] })
      queryClient.invalidateQueries({ queryKey: ['stock-transfer-stats'] })
      addToast({
        title: 'Transfer Created Successfully',
        description: `Transfer ${response.transfer_number} has been created`,
        type: 'success'
      })
      router.push('/inventory/transfers')
    },
    onError: (error: any) => {
      addToast({
        title: 'Failed to create transfer',
        description: error.message || 'An error occurred',
        type: 'error'
      })
    }
  })

  // Calculate totals
  const totalQuantity = formData.items.reduce((sum, item) => sum + item.quantity_to_transfer, 0)
  const totalCost = formData.items.reduce((sum, item) => sum + item.total_cost, 0)

  const handleAddProduct = (product: Product) => {
    // Check if product already exists
    if (formData.items.some(item => item.product === product.id)) {
      addToast({
        title: 'Product already added',
        type: 'warning'
      })
      return
    }

    const newItem: TransferItem = {
      id: Date.now(),
      product: product.id,
      product_name: product.name,
      product_code: product.code,
      quantity_to_transfer: 1,
      unit_cost: product.cost_price || 0,
      total_cost: product.cost_price || 0,
      unit: product.unit_of_measure || 'Unit',
    }

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
    setShowProductDropdown(false)
    setProductSearch('')
  }

  const handleUpdateItem = (id: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          if (field === 'quantity_to_transfer' || field === 'unit_cost') {
            updatedItem.total_cost = updatedItem.quantity_to_transfer * updatedItem.unit_cost
          }
          return updatedItem
        }
        return item
      })
    }))
  }

  const handleRemoveItem = (id: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }))
  }

  const handleSubmit = useCallback(async () => {
    if (isSubmittingRef.current || createMutation.isPending) {
      return
    }

    if (!formData.from_warehouse) {
      addToast({
        title: 'Please select source warehouse',
        type: 'error'
      })
      return
    }

    if (!formData.to_warehouse) {
      addToast({
        title: 'Please select destination warehouse',
        type: 'error'
      })
      return
    }

    if (formData.from_warehouse === formData.to_warehouse) {
      addToast({
        title: 'Source and destination warehouses must be different',
        type: 'error'
      })
      return
    }

    if (formData.items.length === 0) {
      addToast({
        title: 'Please add at least one item',
        type: 'error'
      })
      return
    }

    isSubmittingRef.current = true

    const submitData = {
      from_warehouse: formData.from_warehouse,
      to_warehouse: formData.to_warehouse,
      transfer_date: formData.transfer_date || undefined,
      expected_date: formData.expected_date || undefined,
      reason: formData.reason || undefined,
      carrier: formData.carrier || undefined,
      tracking_number: formData.tracking_number || undefined,
      transport_cost: formData.transport_cost || undefined,
      notes: formData.notes || undefined,
      items: formData.items.map(item => ({
        product: item.product,
        quantity_to_transfer: item.quantity_to_transfer,
        unit_cost: item.unit_cost,
        batch_number: item.batch_number,
        expiry_date: item.expiry_date,
      }))
    }

    createMutation.mutate(submitData, {
      onSettled: () => {
        isSubmittingRef.current = false
      }
    })
  }, [formData, createMutation, addToast])

  const isButtonDisabled = !formData.from_warehouse || !formData.to_warehouse || formData.items.length === 0 || createMutation.isPending

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={() => router.push('/inventory/transfers')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Transfers
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Stock Transfer</h1>
              <p className="text-gray-600">Transfer inventory between warehouses</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Warehouse Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowLeftRight className="w-5 h-5" />
                  Transfer Route
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Warehouse <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <select
                        value={formData.from_warehouse || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, from_warehouse: e.target.value ? parseInt(e.target.value) : null }))}
                        className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                        required
                      >
                        <option value="">Select source warehouse...</option>
                        {warehouses.map((warehouse: any) => (
                          <option key={warehouse.id} value={warehouse.id} disabled={warehouse.id === formData.to_warehouse}>
                            {warehouse.name} ({warehouse.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To Warehouse <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <select
                        value={formData.to_warehouse || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, to_warehouse: e.target.value ? parseInt(e.target.value) : null }))}
                        className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                        required
                      >
                        <option value="">Select destination warehouse...</option>
                        {warehouses.map((warehouse: any) => (
                          <option key={warehouse.id} value={warehouse.id} disabled={warehouse.id === formData.from_warehouse}>
                            {warehouse.name} ({warehouse.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transfer Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Transfer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transfer Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        value={formData.transfer_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, transfer_date: e.target.value }))}
                        className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expected Arrival Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        value={formData.expected_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, expected_date: e.target.value }))}
                        className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Transfer
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    rows={2}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                    placeholder="Enter reason for this transfer..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Carrier / Transport
                    </label>
                    <div className="relative">
                      <Truck className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.carrier}
                        onChange={(e) => setFormData(prev => ({ ...prev, carrier: e.target.value }))}
                        className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                        placeholder="Transport company"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tracking Number
                    </label>
                    <input
                      type="text"
                      value={formData.tracking_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, tracking_number: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                      placeholder="Tracking / Waybill number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transport Cost
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.transport_cost || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, transport_cost: parseFloat(e.target.value) || 0 }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                    placeholder="Additional notes about this transfer..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Product Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Transfer Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Product Search */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Add Product</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value)
                        setShowProductDropdown(true)
                      }}
                      onFocus={() => setShowProductDropdown(true)}
                      className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                      placeholder="Search products by name or code..."
                    />
                  </div>

                  {/* Product Dropdown */}
                  {showProductDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {productsLoading ? (
                        <div className="p-4 text-center text-gray-500">
                          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                          <span className="text-sm">Loading products...</span>
                        </div>
                      ) : products.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          No products found
                        </div>
                      ) : (
                        products.slice(0, 10).map((product: Product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => handleAddProduct(product)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500 flex justify-between">
                              <span>{product.code}</span>
                              <span>{formatCurrency(product.cost_price || 0)} / {product.unit_of_measure}</span>
                            </div>
                          </button>
                        ))
                      )}
                      <button
                        type="button"
                        onClick={() => setShowProductDropdown(false)}
                        className="w-full px-4 py-2 text-center text-gray-500 hover:bg-gray-50 text-sm"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>

                {/* Items List */}
                {formData.items.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products added yet</h3>
                    <p className="text-gray-600">
                      Use the search above to add products to transfer
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.items.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                            <p className="text-sm text-gray-600">Code: {item.product_code} | Unit: {item.unit}</p>
                          </div>

                          <div className="flex items-center gap-3">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Qty to Transfer</label>
                              <input
                                type="number"
                                min="1"
                                step="1"
                                value={item.quantity_to_transfer}
                                onChange={(e) => handleUpdateItem(item.id, 'quantity_to_transfer', parseInt(e.target.value) || 0)}
                                className="w-24 rounded border border-gray-300 px-2 py-1 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Unit Cost</label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unit_cost}
                                onChange={(e) => handleUpdateItem(item.id, 'unit_cost', parseFloat(e.target.value) || 0)}
                                className="w-28 rounded border border-gray-300 px-2 py-1 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Total</label>
                              <div className="w-28 px-2 py-1 text-sm font-medium bg-gray-50 rounded border">
                                {formatCurrency(item.total_cost)}
                              </div>
                            </div>
                            <Button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 mt-5"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Batch number (optional)"
                            value={item.batch_number || ''}
                            onChange={(e) => handleUpdateItem(item.id, 'batch_number', e.target.value)}
                            className="w-full text-sm rounded border border-gray-300 px-2 py-1"
                          />
                          <input
                            type="date"
                            placeholder="Expiry date"
                            value={item.expiry_date || ''}
                            onChange={(e) => handleUpdateItem(item.id, 'expiry_date', e.target.value)}
                            className="w-full text-sm rounded border border-gray-300 px-2 py-1"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowLeftRight className="w-5 h-5" />
                  Transfer Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">From:</span>
                  <span className="font-medium">
                    {formData.from_warehouse
                      ? warehouses.find((w: any) => w.id === formData.from_warehouse)?.name || 'Selected'
                      : 'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">To:</span>
                  <span className="font-medium">
                    {formData.to_warehouse
                      ? warehouses.find((w: any) => w.id === formData.to_warehouse)?.name || 'Selected'
                      : 'Not selected'}
                  </span>
                </div>
                <hr />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-medium">{formData.items.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Quantity:</span>
                  <span className="font-medium">{totalQuantity.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Transfer Date:</span>
                  <span className="font-medium">{formData.transfer_date || 'Not set'}</span>
                </div>
                {formData.transport_cost > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Transport Cost:</span>
                    <span className="font-medium">{formatCurrency(formData.transport_cost)}</span>
                  </div>
                )}
                <hr />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Value:</span>
                  <span className="text-primary">{formatCurrency(totalCost)}</span>
                </div>

                <div className="space-y-2 pt-4">
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isButtonDisabled}
                    className="w-full mofad-btn-primary"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Create Transfer
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">About Stock Transfers</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Stock transfers move inventory between warehouses. After creating a transfer,
                      it will be in 'Draft' status. Submit it for approval, then it can be shipped
                      and received at the destination warehouse.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
