'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import {
  ArrowLeft,
  Save,
  Plus,
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
  Send,
  Trash2,
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

interface Supplier {
  id: number
  name: string
  contact_person?: string
  phone?: string
  email?: string
  address?: string
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
  supplier_id?: number
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

function CreatePROPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const isSubmittingRef = useRef(false)
  const [memoData, setMemoData] = useState<any>(null)
  const [productSearch, setProductSearch] = useState('')
  const [showProductDropdown, setShowProductDropdown] = useState(false)

  // Mock suppliers data - this should come from an API in the future
  const mockSuppliers: Supplier[] = [
    {
      id: 1,
      name: 'Ardova Plc',
      contact_person: 'Ahmed Hassan',
      phone: '+234 801 234 5678',
      email: 'ahmed.hassan@ardovaplc.com',
      address: '2, Ajose Adeogun Street, Victoria Island, Lagos'
    },
    {
      id: 2,
      name: 'Eterna Plc',
      contact_person: 'Fatima Ibrahim',
      phone: '+234 802 345 6789',
      email: 'fatima.ibrahim@eternaplc.com',
      address: 'Eterna House, Saka Tinubu Street, Victoria Island, Lagos'
    },
    {
      id: 3,
      name: 'Conoil Plc',
      contact_person: 'Kemi Adebayo',
      phone: '+234 803 456 7890',
      email: 'kemi.adebayo@conoilplc.com',
      address: 'Bull Plaza, 35 Marina, Lagos Island, Lagos'
    },
    {
      id: 4,
      name: 'MRS Oil Nigeria Plc',
      contact_person: 'Yusuf Mohammed',
      phone: '+234 804 567 8901',
      email: 'yusuf.mohammed@mrsoilnigeria.com',
      address: '16 Creek Road, Apapa, Lagos'
    },
    {
      id: 5,
      name: 'Forte Oil Plc',
      contact_person: 'Grace Okafor',
      phone: '+234 805 678 9012',
      email: 'grace.okafor@forteoil.com',
      address: '26 Wharf Road, Apapa, Lagos'
    }
  ]

  const [formData, setFormData] = useState<PROFormData>({
    title: '',
    supplier: '',
    expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [],
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

  // Create PRO mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.createPro(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['pros'] })
      addToast({
        title: 'PRO Created Successfully',
        description: `PRO ${response.pro_number} has been created`,
        type: 'success'
      })
      router.push('/orders/pro')
    },
    onError: (error: any) => {
      addToast({
        title: 'Failed to create PRO',
        description: error.message || 'An error occurred',
        type: 'error'
      })
    }
  })

  // Calculate total whenever items change
  const estimatedTotal = formData.items.reduce((sum, item) => sum + item.total_price, 0)

  // Handle memo data from query parameters
  useEffect(() => {
    const fromMemo = searchParams.get('fromMemo')
    const memoDataParam = searchParams.get('memoData')

    if (fromMemo === 'true' && memoDataParam) {
      try {
        const parsedMemoData = JSON.parse(memoDataParam)
        setMemoData(parsedMemoData)

        // Pre-populate form with memo data
        if (parsedMemoData.items && parsedMemoData.items.length > 0) {
          const proItems: PROItem[] = parsedMemoData.items.map((item: any, index: number) => ({
            id: Date.now() + index,
            product: item.product_id || 0,
            product_name: item.description,
            product_code: `MEMO-${item.id}`,
            unit_price: item.unitCost,
            quantity: item.quantity || 1,
            total_price: item.totalCost || item.unitCost,
            unit: item.unit || 'Unit',
            notes: item.specifications || `From memo: ${parsedMemoData.memoNumber}`
          }))

          setFormData(prev => ({
            ...prev,
            items: proItems,
            title: `PRO from Memo: ${parsedMemoData.memoNumber}`,
            notes: `Created from Memo: ${parsedMemoData.memoNumber} - ${parsedMemoData.purpose}`,
          }))
        }

        addToast({
          title: 'Memo Loaded',
          description: `PRO form pre-populated with data from ${parsedMemoData.memoNumber}`,
          type: 'success'
        })
      } catch (error) {
        console.error('Error parsing memo data:', error)
        addToast({
          title: 'Error',
          description: 'Failed to load memo data',
          type: 'error'
        })
      }
    }
  }, [searchParams, addToast])

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

  const handleSupplierChange = (supplierId: string) => {
    if (!supplierId) {
      setFormData(prev => ({
        ...prev,
        supplier: '',
        supplier_id: undefined,
        supplier_contact: '',
        supplier_email: '',
        supplier_phone: ''
      }))
      return
    }

    const selectedSupplier = mockSuppliers.find(s => s.id === parseInt(supplierId))
    if (selectedSupplier) {
      setFormData(prev => ({
        ...prev,
        supplier: selectedSupplier.name,
        supplier_id: selectedSupplier.id,
        supplier_contact: selectedSupplier.contact_person || '',
        supplier_email: selectedSupplier.email || '',
        supplier_phone: selectedSupplier.phone || ''
      }))
    }
  }

  const handleRemoveItem = (id: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }))
  }

  const handleSubmit = useCallback(async (asDraft: boolean = false) => {
    if (isSubmittingRef.current || createMutation.isPending) {
      return
    }

    if (!formData.supplier_id) {
      addToast({
        title: 'Please select a supplier',
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
      title: `PRO for ${formData.supplier} - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      description: `Purchase order for ${formData.supplier}`,
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

    createMutation.mutate(submitData, {
      onSettled: () => {
        isSubmittingRef.current = false
      }
    })
  }, [formData, createMutation, addToast])

  const isButtonDisabled = !formData.supplier_id || formData.items.length === 0 || createMutation.isPending

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={() => router.push('/orders/pro')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to PROs
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Purchase Receipt Order</h1>
              <p className="text-gray-600">Create a new PRO for supplier purchases</p>
            </div>
          </div>
        </div>

        {/* Memo Information Banner */}
        {memoData && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-blue-900">
                    Creating PRO from Approved Memo
                  </h3>
                  <p className="text-sm text-blue-700">
                    Form pre-populated with data from memo {memoData.memoNumber}: {memoData.title}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-900">
                    {formatCurrency(memoData.totalAmount)}
                  </p>
                  <p className="text-xs text-blue-600">Total Amount</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                    <select
                      value={formData.supplier_id || ''}
                      onChange={(e) => handleSupplierChange(e.target.value)}
                      className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                      required
                    >
                      <option value="">Select a supplier...</option>
                      {mockSuppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
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
                        readOnly
                        className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 text-gray-600 cursor-not-allowed"
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
                        readOnly
                        className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 text-gray-600 cursor-not-allowed"
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
                      readOnly
                      className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 text-gray-600 cursor-not-allowed"
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
                  <span className="text-gray-600">Items:</span>
                  <span className="font-medium">{formData.items.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Supplier:</span>
                  <span className="font-medium">{formData.supplier || 'Not specified'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Delivery:</span>
                  <span className="font-medium">{formData.expected_delivery_date}</span>
                </div>
                <hr />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-green-600">{formatCurrency(estimatedTotal)}</span>
                </div>

                <div className="space-y-2 pt-4">
                  <Button
                    type="button"
                    onClick={() => handleSubmit(true)}
                    disabled={isButtonDisabled}
                    variant="outline"
                    className="w-full"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save as Draft
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleSubmit(false)}
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
                        <Send className="w-4 h-4 mr-2" />
                        Create PRO
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
                    <h4 className="font-medium text-gray-900 text-sm">About PROs</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Purchase Receipt Orders (PROs) are used to receive goods from suppliers.
                      After creating a PRO, you can send it to the supplier, receive goods, and
                      automatically update your warehouse inventory.
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

export default function CreatePROPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <CreatePROPageContent />
    </Suspense>
  )
}
