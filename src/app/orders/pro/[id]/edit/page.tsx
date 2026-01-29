'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
  X,
  Calendar,
  User,
  Building,
  Package,
  DollarSign,
  FileText,
  Phone,
  Mail,
  MapPin,
  Info,
  Search,
  Loader2,
  Trash2,
  AlertTriangle,
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

interface PROItem {
  id?: number
  product: number
  product_name: string
  product_code: string
  unit_price: number
  quantity: number
  total_price: number
  unit: string
  specifications?: string
  notes?: string
}

interface PROFormData {
  title: string
  description?: string
  supplier: string
  supplier_contact?: string
  supplier_email?: string
  supplier_phone?: string
  delivery_address?: string
  delivery_location?: number | null
  expected_delivery_date: string
  payment_terms?: string
  payment_method?: string
  notes?: string
  items: PROItem[]
}

export default function EditPROPage() {
  const router = useRouter()
  const params = useParams()
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const isSubmittingRef = useRef(false)
  const proId = parseInt(params.id as string)
  const [productSearch, setProductSearch] = useState('')
  const [showProductDropdown, setShowProductDropdown] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const [formData, setFormData] = useState<PROFormData>({
    title: '',
    supplier: '',
    expected_delivery_date: '',
    items: [],
  })

  // Fetch PRO data
  const { data: proData, isLoading: proLoading, error: proError } = useQuery({
    queryKey: ['pro-edit', proId],
    queryFn: () => apiClient.getProById(proId),
  })

  // Fetch products for selection
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products-for-pro', productSearch],
    queryFn: () => apiClient.getProducts({ search: productSearch, is_active: true }),
  })

  // Fetch warehouses for delivery location
  const { data: warehousesData } = useQuery({
    queryKey: ['warehouses-for-pro'],
    queryFn: () => apiClient.getWarehouses({ is_active: true }),
  })

  const products = productsData?.results || (Array.isArray(productsData) ? productsData : [])
  const warehouses = warehousesData?.results || (Array.isArray(warehousesData) ? warehousesData : [])

  // Initialize form with PRO data
  useEffect(() => {
    if (proData && !isInitialized) {
      // Normalize items from API response
      const normalizedItems: PROItem[] = (proData.items || []).map((item: any, index: number) => ({
        id: item.id || Date.now() + index,
        product: item.product_id || item.product || 0,
        product_name: item.product_name || item.name || 'Unknown Product',
        product_code: item.product_code || item.code || '',
        unit_price: Number(item.product_price) || Number(item.unit_price) || Number(item.price) || 0,
        quantity: Number(item.product_quantity) || Number(item.quantity) || 0,
        total_price: Number(item.total_price) || (
          (Number(item.product_quantity) || Number(item.quantity) || 0) *
          (Number(item.product_price) || Number(item.unit_price) || 0)
        ),
        unit: item.unit_of_measure || item.unit || 'Unit',
        notes: item.notes || item.specifications || '',
      }))

      setFormData({
        title: proData.title || '',
        description: proData.description || '',
        supplier: proData.supplier_name || proData.supplier || '',
        supplier_contact: proData.supplier_contact || '',
        supplier_email: proData.supplier_email || '',
        supplier_phone: proData.supplier_phone || '',
        delivery_address: proData.delivery_address || '',
        delivery_location: proData.delivery_location || proData.warehouse_id || null,
        expected_delivery_date: proData.expected_delivery_date || proData.expected_delivery?.split('T')[0] || '',
        payment_terms: proData.payment_terms || '',
        payment_method: proData.payment_method || '',
        notes: proData.notes || '',
        items: normalizedItems,
      })
      setIsInitialized(true)
    }
  }, [proData, isInitialized])

  // Update PRO mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => apiClient.updatePro(proId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pros'] })
      queryClient.invalidateQueries({ queryKey: ['pro-detail', proId] })
      queryClient.invalidateQueries({ queryKey: ['pro-edit', proId] })
      addToast({
        title: 'PRO Updated Successfully',
        description: `PRO has been updated`,
        type: 'success'
      })
      router.push(`/orders/pro/${proId}`)
    },
    onError: (error: any) => {
      addToast({
        title: 'Failed to update PRO',
        description: error.message || 'An error occurred',
        type: 'error'
      })
    }
  })

  // Calculate total whenever items change
  const estimatedTotal = formData.items.reduce((sum, item) => sum + item.total_price, 0)

  const handleAddProduct = (product: Product) => {
    // Check if product already exists
    if (formData.items.some(item => item.product === product.id)) {
      addToast({
        title: 'Product already added',
        type: 'warning'
      })
      return
    }

    const newItem: PROItem = {
      id: Date.now(),
      product: product.id,
      product_name: product.name,
      product_code: product.code,
      unit_price: product.cost_price || 0,
      quantity: 1,
      total_price: product.cost_price || 0,
      unit: product.unit_of_measure || 'Unit',
      notes: ''
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
          if (field === 'quantity' || field === 'unit_price') {
            updatedItem.total_price = updatedItem.quantity * updatedItem.unit_price
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
    if (isSubmittingRef.current || updateMutation.isPending) {
      return
    }

    if (!formData.supplier.trim()) {
      addToast({
        title: 'Please enter supplier name',
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
      title: formData.title || `PRO for ${formData.supplier}`,
      description: formData.description,
      supplier: formData.supplier,
      supplier_contact: formData.supplier_contact,
      supplier_email: formData.supplier_email,
      supplier_phone: formData.supplier_phone,
      delivery_address: formData.delivery_address,
      delivery_location: formData.delivery_location,
      expected_delivery_date: formData.expected_delivery_date,
      payment_terms: formData.payment_terms,
      payment_method: formData.payment_method,
      notes: formData.notes,
      items: formData.items.map(item => ({
        product: item.product,
        quantity: item.quantity,
        unit_price: item.unit_price,
        specifications: item.specifications,
        notes: item.notes,
      }))
    }

    updateMutation.mutate(submitData, {
      onSettled: () => {
        isSubmittingRef.current = false
      }
    })
  }, [formData, updateMutation, addToast])

  const isButtonDisabled = !formData.supplier.trim() || formData.items.length === 0 || updateMutation.isPending

  if (proLoading) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto space-y-6 p-6">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-24 bg-gray-200 rounded"></div>
              <div className="h-8 w-64 bg-gray-200 rounded"></div>
            </div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 h-96 bg-gray-200 rounded-lg"></div>
              <div className="h-48 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (proError || !proData) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center py-16 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-100">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Purchase Order Not Found</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              The purchase order you&apos;re trying to edit doesn&apos;t exist or may have been removed.
            </p>
            <Button onClick={() => router.back()} className="mofad-btn-primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={() => router.push(`/orders/pro/${proId}`)} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to PRO
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Purchase Receipt Order</h1>
              <p className="text-gray-600">PRO Number: <span className="font-mono font-semibold">{proData.pro_number}</span></p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                    placeholder="e.g., Lubricants Order - January 2026"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                    placeholder="Optional description..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expected Delivery Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        value={formData.expected_delivery_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, expected_delivery_date: e.target.value }))}
                        className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Location
                    </label>
                    <select
                      value={formData.delivery_location || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, delivery_location: e.target.value ? parseInt(e.target.value) : null }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                    >
                      <option value="">Select warehouse...</option>
                      {warehouses.map((warehouse: any) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name} ({warehouse.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Supplier Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Supplier Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.supplier}
                      onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                      className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                      placeholder="Enter supplier name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.supplier_contact || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, supplier_contact: e.target.value }))}
                        className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                        placeholder="Contact person name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.supplier_phone || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, supplier_phone: e.target.value }))}
                        className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                        placeholder="+234 800 123 4567"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={formData.supplier_email || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, supplier_email: e.target.value }))}
                      className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                      placeholder="supplier@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Terms
                    </label>
                    <input
                      type="text"
                      value={formData.payment_terms || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, payment_terms: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                      placeholder="e.g., Net 30 days"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Method
                    </label>
                    <select
                      value={formData.payment_method || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                    >
                      <option value="">Select payment method...</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cash">Cash</option>
                      <option value="check">Check</option>
                      <option value="credit">Credit</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <textarea
                      value={formData.delivery_address || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, delivery_address: e.target.value }))}
                      rows={2}
                      className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                      placeholder="Enter delivery address..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                    placeholder="Additional notes about this order..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Product Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Product Items
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
                      Use the search above to add products to your PRO
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
                              <label className="block text-xs text-gray-500 mb-1">Qty</label>
                              <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={item.quantity}
                                onChange={(e) => handleUpdateItem(item.id!, 'quantity', parseFloat(e.target.value) || 0)}
                                className="w-20 rounded border border-gray-300 px-2 py-1 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Unit Price</label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unit_price}
                                onChange={(e) => handleUpdateItem(item.id!, 'unit_price', parseFloat(e.target.value) || 0)}
                                className="w-28 rounded border border-gray-300 px-2 py-1 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Total</label>
                              <div className="w-28 px-2 py-1 text-sm font-medium bg-gray-50 rounded border">
                                {formatCurrency(item.total_price)}
                              </div>
                            </div>
                            <Button
                              type="button"
                              onClick={() => handleRemoveItem(item.id!)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 mt-5"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="mt-3">
                          <input
                            type="text"
                            placeholder="Add notes for this item..."
                            value={item.notes || ''}
                            onChange={(e) => handleUpdateItem(item.id!, 'notes', e.target.value)}
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
                  <DollarSign className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">PRO Number:</span>
                  <span className="font-mono font-medium">{proData.pro_number}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-medium">{formData.items.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Supplier:</span>
                  <span className="font-medium">{formData.supplier || 'Not specified'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Delivery:</span>
                  <span className="font-medium">{formData.expected_delivery_date || 'TBD'}</span>
                </div>
                <hr />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-green-600">{formatCurrency(estimatedTotal)}</span>
                </div>

                <div className="space-y-2 pt-4">
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isButtonDisabled}
                    className="w-full mofad-btn-primary"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Update PRO
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => router.push(`/orders/pro/${proId}`)}
                    variant="outline"
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
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
                    <h4 className="font-medium text-gray-900 text-sm">Editing PRO</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      You can modify the supplier information, delivery details, and product items.
                      Changes will be saved when you click &quot;Update PRO&quot;.
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
