'use client'

import { useState, useEffect, useCallback, useRef, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
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
  CheckCircle,
  Clock,
  AlertTriangle,
  Star,
  CreditCard,
  Truck,
  Loader2,
  Send,
} from 'lucide-react'

// Mock suppliers data - similar to PRF customers
const mockSuppliers = [
  {
    id: 1,
    name: 'Eterna Plc',
    code: 'ETERNA',
    contact_person: 'John Adebayo',
    email: 'procurement@eterna.com',
    phone: '+234 800 123 4567',
    address: 'Plot 15, Industrial Estate, Lagos',
    payment_terms: '30 days net',
    rating: 5,
    category: 'Premium Supplier'
  },
  {
    id: 2,
    name: 'Ardova Plc',
    code: 'ARDOVA',
    contact_person: 'Sarah Ibrahim',
    email: 'orders@ardova.com',
    phone: '+234 800 234 5678',
    address: 'Block 7, Energy Avenue, Abuja',
    payment_terms: '45 days net',
    rating: 4,
    category: 'Major Supplier'
  },
  {
    id: 3,
    name: 'Xteer Nigeria Ltd',
    code: 'XTEER',
    contact_person: 'Ahmed Kano',
    email: 'supply@xteer.ng',
    phone: '+234 800 345 6789',
    address: '22, Petroleum Road, Port Harcourt',
    payment_terms: '21 days net',
    rating: 4,
    category: 'Authorized Dealer'
  },
  {
    id: 4,
    name: 'Total Energies Nigeria',
    code: 'TOTAL',
    contact_person: 'Michelle Dubois',
    email: 'b2b@totalenergies.ng',
    phone: '+234 800 456 7890',
    address: '12, Victoria Island, Lagos',
    payment_terms: '30 days net',
    rating: 5,
    category: 'International Supplier'
  },
  {
    id: 5,
    name: 'Mobil Oil Nigeria',
    code: 'MOBIL',
    contact_person: 'Robert Johnson',
    email: 'sales@mobil.com.ng',
    phone: '+234 800 567 8901',
    address: '1, Lekki Express Way, Lagos',
    payment_terms: '45 days net',
    rating: 5,
    category: 'Premium Supplier'
  }
]

// Mock products for suppliers - energy/petroleum related
const mockSupplierProducts = [
  {
    id: 1,
    supplier_id: 1,
    name: 'Premium Motor Oil (SAE 20W-50)',
    code: 'PMO-20W50',
    unit_price: 8500,
    min_order_qty: 24,
    unit: 'Liter',
    description: 'High-quality motor oil for heavy-duty engines'
  },
  {
    id: 2,
    supplier_id: 1,
    name: 'Hydraulic Fluid ISO 32',
    code: 'HF-ISO32',
    unit_price: 12000,
    min_order_qty: 20,
    unit: 'Liter',
    description: 'Premium hydraulic fluid for industrial equipment'
  },
  {
    id: 3,
    supplier_id: 2,
    name: 'Diesel Engine Oil (15W-40)',
    code: 'DEO-15W40',
    unit_price: 9200,
    min_order_qty: 12,
    unit: 'Liter',
    description: 'Heavy-duty diesel engine oil'
  },
  {
    id: 4,
    supplier_id: 3,
    name: 'Transmission Fluid ATF',
    code: 'TF-ATF',
    unit_price: 7800,
    min_order_qty: 6,
    unit: 'Liter',
    description: 'Automatic transmission fluid'
  },
  {
    id: 5,
    supplier_id: 4,
    name: 'Industrial Gear Oil 90',
    code: 'IGO-90',
    unit_price: 11500,
    min_order_qty: 15,
    unit: 'Liter',
    description: 'Heavy-duty industrial gear oil'
  }
]

interface PROItem {
  id?: number
  product_id?: number
  product_name: string
  product_code: string
  unit_price: number
  quantity: number
  total_amount: number
  unit: string
  notes?: string
}

interface PROFormData {
  pro_number?: string
  supplier: number
  supplier_name?: string
  order_date: string
  order_reference?: string
  payment_terms?: string
  notes?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  items: PROItem[]
  estimated_total: number
}

// Helper functions for localStorage management
const getMockPROs = (): any[] => {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem('mofad_mock_pros')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error reading PROs from localStorage:', error)
  }

  return []
}

const saveMockPROs = (pros: any[]) => {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem('mofad_mock_pros', JSON.stringify(pros))
  } catch (error) {
    console.error('Error saving PROs to localStorage:', error)
  }
}

function CreatePROPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null)
  const [supplierProducts, setSupplierProducts] = useState<any[]>([])
  const isSubmittingRef = useRef(false)
  const [memoData, setMemoData] = useState<any>(null)

  const [formData, setFormData] = useState<PROFormData>({
    supplier: 0,
    order_date: new Date().toISOString().split('T')[0],
    priority: 'medium',
    items: [],
    estimated_total: 0,
  })

  useEffect(() => {
    if (selectedSupplier) {
      // Filter products for selected supplier
      const products = mockSupplierProducts.filter(p => p.supplier_id === selectedSupplier.id)
      setSupplierProducts(products)

      setFormData(prev => ({
        ...prev,
        supplier: selectedSupplier.id,
        supplier_name: selectedSupplier.name,
        payment_terms: selectedSupplier.payment_terms,
        order_reference: `PO-${selectedSupplier.code}-${Date.now().toString().slice(-6)}`
      }))
    }
  }, [selectedSupplier])

  // Calculate total whenever items change
  useEffect(() => {
    const total = formData.items.reduce((sum, item) => sum + item.total_amount, 0)
    setFormData(prev => ({
      ...prev,
      estimated_total: total
    }))
  }, [formData.items])

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
          // Convert memo items to PRO items format
          const proItems: PROItem[] = parsedMemoData.items.map((item: any, index: number) => ({
            id: Date.now() + index,
            product_name: item.description,
            product_code: `MEMO-${item.id}`,
            unit_price: item.unitCost,
            quantity: item.quantity || 1,
            total_amount: item.totalCost || item.unitCost,
            unit: item.unit || 'Unit',
            notes: item.specifications || `From memo: ${parsedMemoData.memoNumber}`
          }))

          setFormData(prev => ({
            ...prev,
            items: proItems,
            notes: `Created from Memo: ${parsedMemoData.memoNumber} - ${parsedMemoData.purpose}`,
            order_reference: `MEM-${parsedMemoData.memoNumber.replace('MEM-', '')}-${Date.now().toString().slice(-4)}`
          }))
        }

        // Show success message
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


  const handleAddProduct = (product: any) => {
    const newItem: PROItem = {
      id: Date.now(),
      product_id: product.id,
      product_name: product.name,
      product_code: product.code,
      unit_price: product.unit_price,
      quantity: product.min_order_qty,
      total_amount: product.unit_price * product.min_order_qty,
      unit: product.unit,
      notes: ''
    }

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))

    addToast({
      title: 'Product added to PRO',
      type: 'success'
    })
  }

  const handleUpdateItem = (id: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          if (field === 'quantity' || field === 'unit_price') {
            updatedItem.total_amount = updatedItem.quantity * updatedItem.unit_price
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

  const handleSubmit = useCallback(async (status: 'draft' | 'submitted') => {
    console.log('handleSubmit called with status:', status)
    console.log('isSubmittingRef.current:', isSubmittingRef.current)
    console.log('isLoading:', isLoading)

    // Prevent multiple submissions using ref for immediate check
    if (isSubmittingRef.current || isLoading) {
      console.log('Already processing, ignoring duplicate submission')
      return
    }

    if (!selectedSupplier) {
      console.log('No supplier selected, showing error toast')
      addToast({
        title: 'Please select a supplier',
        type: 'error'
      })
      return
    }

    if (formData.items.length === 0) {
      console.log('No items in form, showing error toast')
      addToast({
        title: 'Please add at least one item',
        type: 'error'
      })
      return
    }

    console.log('Starting PRO creation...')
    isSubmittingRef.current = true
    setIsLoading(true)

    try {
      // Add a small delay to simulate processing time and ensure loading state is visible
      await new Promise(resolve => setTimeout(resolve, 1000))

      const existingPROs = getMockPROs()
      const proNumber = `PRO-${new Date().getFullYear()}-${String(existingPROs.length + 1).padStart(4, '0')}`

      const newPRO = {
        id: Date.now(),
        pro_number: proNumber,
        supplier_id: formData.supplier,
        supplier_name: formData.supplier_name,
        order_date: formData.order_date,
        order_reference: formData.order_reference,
        payment_terms: formData.payment_terms,
        notes: formData.notes,
        priority: formData.priority,
        items: formData.items,
        estimated_total: formData.estimated_total,
        status,
        created_at: new Date().toISOString(),
        created_by: 'Admin User',
        supplier_details: selectedSupplier,
        // Add memo linking information
        linkedMemoId: memoData?.memoId,
        linkedMemoNumber: memoData?.memoNumber
      }

      const updatedPROs = [...existingPROs, newPRO]
      saveMockPROs(updatedPROs)

      // Update memo linkage if this PRO was created from a memo
      if (memoData) {
        try {
          // In a real app, this would be an API call to update the memo
          // For now, we'll update localStorage where memo data might be stored
          // This is a simplified implementation - in reality, you'd have proper memo management
          console.log('Linking PRO to memo:', { memoId: memoData.memoId, proNumber })
        } catch (error) {
          console.error('Error updating memo linkage:', error)
        }
      }

      console.log('PRO created successfully:', newPRO)

      addToast({
        title: status === 'draft' ? 'PRO saved as draft successfully!' : 'PRO submitted successfully!',
        description: memoData
          ? `PRO ${proNumber} created and linked to memo ${memoData.memoNumber}`
          : undefined,
        type: 'success'
      })

      // Invalidate query cache to refresh PRO list
      queryClient.invalidateQueries({ queryKey: ['pro-list'] })

      // Navigate back to PRO list
      router.push('/orders/pro')

    } catch (error) {
      console.error('Error creating PRO:', error)
      addToast({
        title: 'Failed to create PRO',
        type: 'error'
      })
    } finally {
      isSubmittingRef.current = false
      setIsLoading(false)
    }
  }, [selectedSupplier, formData, isLoading, addToast, router])

  // Calculate button disabled state - using regular calculation to include ref
  const isButtonDisabled = !selectedSupplier || formData.items.length === 0 || isLoading || isSubmittingRef.current

  // Cache refresh timestamp: 2026-01-05-17:00:00 - Fixed toast API usage
  // Debug form state - only log when needed
  // console.log('Form State Debug:', {
  //   selectedSupplier,
  //   formDataItems: formData.items,
  //   itemsLength: formData.items.length,
  //   isLoading,
  //   buttonDisabled: isButtonDisabled
  // })

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
              <h1 className="text-2xl font-bold text-gray-900">Create Purchase Request Order</h1>
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
                  <p className="text-xs text-blue-600 mt-1">
                    Requested by: {memoData.requestedBy} | Department: {memoData.department} | Purpose: {memoData.purpose}
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
            {/* Supplier Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Supplier Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Supplier *</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <select
                      value={formData.supplier || ''}
                      onChange={(e) => {
                        const supplierId = parseInt(e.target.value)
                        const supplier = mockSuppliers.find(s => s.id === supplierId)
                        setSelectedSupplier(supplier || null)

                        // Update form data
                        setFormData(prev => ({
                          ...prev,
                          supplier: supplierId || 0,
                          supplier_name: supplier?.name || ''
                        }))
                      }}
                      className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                      required
                    >
                      <option value="">Choose a supplier...</option>
                      {mockSuppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name} - {supplier.category} ({supplier.rating}★)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedSupplier && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Building className="w-6 h-6 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{selectedSupplier.name}</h3>
                        <p className="text-sm text-gray-600">{selectedSupplier.category}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{selectedSupplier.contact_person}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{selectedSupplier.phone}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            <span>{selectedSupplier.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            <span>{selectedSupplier.rating}/5 Rating</span>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          <strong>Payment Terms:</strong> {selectedSupplier.payment_terms}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        value={formData.order_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, order_date: e.target.value }))}
                        className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {selectedSupplier && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Order Reference</label>
                      <input
                        type="text"
                        value={formData.order_reference || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, order_reference: e.target.value }))}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                        placeholder="Auto-generated order reference"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                      <input
                        type="text"
                        value={formData.payment_terms || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, payment_terms: e.target.value }))}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                        placeholder="e.g., 30 days net"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
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
                {selectedSupplier && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Add Product</label>
                    <div className="relative">
                      <Package className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <select
                        onChange={(e) => {
                          const productId = parseInt(e.target.value)
                          const product = supplierProducts.find(p => p.id === productId)
                          if (product) {
                            handleAddProduct(product)
                            // Reset select after adding
                            e.target.value = ''
                          }
                        }}
                        className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary"
                        defaultValue=""
                      >
                        <option value="">Choose a product to add...</option>
                        {supplierProducts.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} ({product.code}) - {formatCurrency(product.unit_price)}/{product.unit}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {supplierProducts.length} products available from {selectedSupplier.name}
                    </p>
                  </div>
                )}

                {!selectedSupplier ? (
                  <div className="text-center py-8">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No supplier selected</h3>
                    <p className="text-gray-600">
                      Select a supplier first to view available products
                    </p>
                  </div>
                ) : formData.items.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products added yet</h3>
                    <p className="text-gray-600">
                      Use the dropdown above to add products to your PRO
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.items.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-start gap-4">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                                <p className="text-sm text-gray-600">Code: {item.product_code}</p>
                                <p className="text-xs text-gray-500">Unit: {item.unit}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div>
                                  <label className="block text-xs text-gray-500">Qty</label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => handleUpdateItem(item.id!, 'quantity', parseInt(e.target.value) || 0)}
                                    className="w-20 rounded border border-gray-300 px-2 py-1 text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500">Unit Price</label>
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
                                  <label className="block text-xs text-gray-500">Total</label>
                                  <div className="w-28 px-2 py-1 text-sm font-medium bg-gray-50 rounded border">
                                    {formatCurrency(item.total_amount)}
                                  </div>
                                </div>
                                <Button
                                  onClick={() => handleRemoveItem(item.id!)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="mt-2">
                              <input
                                type="text"
                                placeholder="Add notes for this item..."
                                value={item.notes || ''}
                                onChange={(e) => handleUpdateItem(item.id!, 'notes', e.target.value)}
                                className="w-full text-sm rounded border border-gray-300 px-2 py-1"
                              />
                            </div>
                          </div>
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
                  <span className="font-medium">{selectedSupplier?.name || 'Not selected'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Terms:</span>
                  <span className="font-medium">{formData.payment_terms || 'N/A'}</span>
                </div>
                <hr />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-green-600">{formatCurrency(formData.estimated_total)}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Direct supplier pricing applied
                </div>

                <div className="space-y-2 pt-4">
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (!isLoading && !isSubmittingRef.current) {
                        handleSubmit('draft')
                      }
                    }}
                    disabled={isButtonDisabled}
                    variant="outline"
                    className="w-full"
                    type="button"
                  >
                    {isLoading ? (
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
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log('Submit button clicked!')
                      console.log('Button disabled?', isButtonDisabled)
                      console.log('isLoading state:', isLoading)
                      console.log('isSubmittingRef.current:', isSubmittingRef.current)
                      if (!isLoading && !isSubmittingRef.current) {
                        handleSubmit('submitted')
                      }
                    }}
                    disabled={isButtonDisabled}
                    className="w-full mofad-btn-primary"
                    type="button"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit PRO
                      </>
                    )}
                  </Button>
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