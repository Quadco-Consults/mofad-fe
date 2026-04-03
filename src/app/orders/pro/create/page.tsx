'use client'

import { useState, useCallback, useRef, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import apiClient from '@/lib/apiClient'
import { useToast } from '@/components/ui/Toast'
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Plus,
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Package,
  DollarSign,
  ShoppingCart,
  Search,
  Building,
  CheckCircle,
  Info,
  Loader2,
  Trash2,
} from 'lucide-react'

interface Supplier {
  id: number
  name: string
  contact_person?: string
  phone?: string
  email?: string
  address?: string
}

interface Product {
  id: number
  name: string
  code: string
  unit_of_measure: string
  cost_price: string
  selling_price: number
  category_name?: string
  primary_supplier?: string
  brand?: string
  is_active?: boolean
  package_sizes?: number[]
  bulk_size?: string | null
  retail_size?: string | null
}

interface Warehouse {
  id: number
  name: string
  code: string
  location?: string
  is_active?: boolean
}

interface PROItem {
  id: string
  product_id: string
  product_name: string
  product_code: string
  quantity: number
  unit_price: number
  total: number
  unit: string
  package_size?: number
  warehouse_id?: string
  warehouse_name?: string
  notes?: string
}

interface PROFormData {
  supplier_id: string
  supplier_name: string
  supplier_contact: string
  supplier_email: string
  supplier_phone: string
  delivery_address: string
  delivery_location: string
  payment_terms: string
  payment_method: string
  expected_delivery_date: string
  notes: string
  reviewer?: number
  approver?: number
  items: PROItem[]
}

function CreatePROPageContent() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const isSubmittingRef = useRef(false)

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
    supplier_id: '',
    supplier_name: '',
    supplier_contact: '',
    supplier_email: '',
    supplier_phone: '',
    delivery_address: '',
    delivery_location: '',
    payment_terms: 'Net 30',
    payment_method: '',
    expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    items: [],
  })

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductCatalog, setShowProductCatalog] = useState(false)
  const [quantity, setQuantity] = useState(0)
  const [productSearchTerm, setProductSearchTerm] = useState('')
  const [supplierSearchTerm, setSupplierSearchTerm] = useState('')
  // Package size is part of the product itself, no selection needed

  // Fetch products for selection
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products-for-pro', productSearchTerm],
    queryFn: () => apiClient.getProducts({ search: productSearchTerm, is_active: true }),
    enabled: !!selectedSupplier,
  })

  const products = productsData?.results || (Array.isArray(productsData) ? productsData : [])

  // Fetch warehouses for delivery location
  const { data: warehousesData } = useQuery({
    queryKey: ['warehouses-for-pro'],
    queryFn: () => apiClient.getWarehouses({ is_active: true }),
  })

  const warehouses = (Array.isArray(warehousesData) ? warehousesData : (warehousesData as any)?.results) || []

  // Fetch users for reviewer and approver selection
  const { data: usersData } = useQuery({
    queryKey: ['users-for-pro'],
    queryFn: () => apiClient.getUsers({ is_active: true }),
  })

  const users = usersData?.results || (Array.isArray(usersData) ? usersData : [])

  // Filter suppliers by search term
  const filteredSuppliers = mockSuppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
      (supplier.contact_person || '').toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
      (supplier.email || '').toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
      (supplier.phone || '').toLowerCase().includes(supplierSearchTerm.toLowerCase())
  )

  // Filter products by search term
  const filteredProducts = products.filter(
    (product: Product) =>
      (product.name || '').toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      (product.code || '').toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      (product.category_name || '').toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      (product.brand || '').toLowerCase().includes(productSearchTerm.toLowerCase())
  )

  // Create PRO mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.createPro(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['pros'] })
      addToast({
        title: `PRO ${response.pro_number} has been created`,
        type: 'success'
      })
      router.push('/orders/pro')
    },
    onError: (error: any) => {
      addToast({
        title: `Failed to create PRO: ${error.message || 'An error occurred'}`,
        type: 'error'
      })
    }
  })

  const handleSupplierSelect = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setFormData(prev => ({
      ...prev,
      supplier_id: supplier.id.toString(),
      supplier_name: supplier.name,
      supplier_contact: supplier.contact_person || '',
      supplier_email: supplier.email || '',
      supplier_phone: supplier.phone || '',
      delivery_address: supplier.address || '',
    }))
  }

  const handleContinueToProducts = () => {
    if (selectedSupplier) {
      setShowProductCatalog(true)
    }
  }

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product)
    setQuantity(1)
  }

  const addProductToOrder = () => {
    if (!selectedProduct || !quantity || quantity <= 0) {
      addToast({
        title: 'Please enter a valid quantity',
        type: 'error'
      })
      return
    }

    // Check if product already exists
    if (formData.items.some(item => item.product_id === selectedProduct.id.toString())) {
      addToast({
        title: 'Product already added',
        type: 'warning'
      })
      return
    }

    const unitPrice = parseFloat(selectedProduct.cost_price || '0')
    const total = quantity * unitPrice

    // Use delivery_location (warehouse) from formData
    const selectedWarehouseObj = warehouses.find((w: Warehouse) => w.id.toString() === formData.delivery_location)

    // Get package size from product (size is already part of the product)
    let packageSize: number | null = null
    if (selectedProduct.package_sizes && selectedProduct.package_sizes.length > 0) {
      packageSize = selectedProduct.package_sizes[0]
    } else if (selectedProduct.retail_size && parseFloat(selectedProduct.retail_size) > 0) {
      packageSize = parseFloat(selectedProduct.retail_size)
    } else if (selectedProduct.bulk_size && parseFloat(selectedProduct.bulk_size) > 0) {
      packageSize = parseFloat(selectedProduct.bulk_size)
    }

    const item: PROItem = {
      id: Date.now().toString(),
      product_id: selectedProduct.id.toString(),
      product_name: selectedProduct.name,
      product_code: selectedProduct.code,
      quantity,
      unit_price: unitPrice,
      total,
      unit: selectedProduct.unit_of_measure || 'Unit',
      package_size: packageSize || undefined,
      warehouse_id: formData.delivery_location || undefined,
      warehouse_name: selectedWarehouseObj?.name || undefined,
      notes: ''
    }

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, item],
    }))

    // Reset form
    setSelectedProduct(null)
    setQuantity(0)
  }

  const removeItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id),
    }))
  }

  const getTotalAmount = () => {
    return formData.items.reduce((sum, item) => sum + item.total, 0)
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

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
      title: `PRO for ${formData.supplier_name} - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      description: `Purchase order for ${formData.supplier_name}`,
      supplier: formData.supplier_name,
      supplier_contact: formData.supplier_contact || undefined,
      supplier_email: formData.supplier_email,
      supplier_phone: formData.supplier_phone,
      delivery_address: formData.delivery_address,
      delivery_location: formData.delivery_location ? parseInt(formData.delivery_location) : undefined,
      expected_delivery_date: formData.expected_delivery_date,
      payment_terms: formData.payment_terms,
      payment_method: formData.payment_method,
      notes: formData.notes,
      reviewer: formData.reviewer || undefined,
      approver: formData.approver || undefined,
      items: formData.items.map(item => ({
        product: parseInt(item.product_id),
        quantity: item.quantity,
        unit_price: item.unit_price,
        specifications: item.notes || '',
        notes: item.notes || '',
      }))
    }

    createMutation.mutate(submitData, {
      onSettled: () => {
        isSubmittingRef.current = false
      }
    })
  }, [formData, createMutation, addToast])

  const handleCancel = () => {
    router.push('/orders/pro')
  }

  // Determine current step
  const getCurrentStep = () => {
    if (!selectedSupplier || !showProductCatalog) return 1
    if (formData.items.length === 0) return 2
    return 3
  }

  const currentStep = getCurrentStep()

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header with Progress Bar */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <div className="h-8 w-px bg-gray-300"></div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">New Purchase Receipt Order</h1>
                  <p className="text-sm text-gray-500 mt-0.5">Create a new PRO for supplier purchases</p>
                </div>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center gap-3">
              {[
                { num: 1, label: 'Supplier', icon: Building },
                { num: 2, label: 'Products', icon: Package },
                { num: 3, label: 'Review', icon: CheckCircle },
              ].map((step, idx) => {
                const StepIcon = step.icon
                const isActive = currentStep === step.num
                const isCompleted = currentStep > step.num

                return (
                  <div key={step.num} className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-green-600 text-white'
                            : isActive
                            ? 'bg-green-600 text-white ring-4 ring-green-100'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        <StepIcon className="w-4 h-4" />
                      </div>
                      <span className={`text-sm font-medium ${isActive || isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                        {step.label}
                      </span>
                    </div>
                    {idx < 2 && (
                      <div className={`h-0.5 w-16 ${currentStep > step.num ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <form onSubmit={handleSubmit} className="px-8 py-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - Main Form (8 columns) */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {/* STEP 1: Supplier Selection */}
              {currentStep === 1 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Select Supplier</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Supplier Search Input */}
                      <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search by name, contact person, email, or phone..."
                          value={supplierSearchTerm}
                          onChange={(e) => setSupplierSearchTerm(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-2">
                        {filteredSuppliers.length > 0 ? filteredSuppliers.map((supplier: Supplier) => {
                          const isSelected = selectedSupplier?.id === supplier.id
                          return (
                            <div
                              key={supplier.id}
                              className={`border-2 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer group ${
                                isSelected
                                  ? 'border-green-600 bg-green-50 shadow-md'
                                  : 'border-gray-200 hover:border-green-500'
                              }`}
                              onClick={() => handleSupplierSelect(supplier)}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-base group-hover:text-green-600 transition-colors">
                                    {supplier.name}
                                  </h3>
                                  <p className="text-xs text-muted-foreground">Supplier</p>
                                </div>
                                <Building className="w-5 h-5 text-gray-400" />
                              </div>

                              <div className="space-y-1.5">
                                {supplier.contact_person && (
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <User className="w-3 h-3" />
                                    {supplier.contact_person}
                                  </div>
                                )}
                                {supplier.phone && (
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Phone className="w-3 h-3" />
                                    {supplier.phone}
                                  </div>
                                )}
                                {supplier.email && (
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                                    <Mail className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{supplier.email}</span>
                                  </div>
                                )}
                              </div>

                              {supplier.address && (
                                <div className="mt-2 pt-2 border-t border-gray-100 flex gap-2 text-xs">
                                  <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
                                  <span className="text-muted-foreground line-clamp-2">{supplier.address}</span>
                                </div>
                              )}
                            </div>
                          )
                        }) : (
                          <div className="col-span-3 text-center py-12 text-muted-foreground">
                            <Building className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No suppliers found</p>
                          </div>
                        )}
                      </div>

                      {/* Continue Button - Only show when supplier is selected */}
                      {selectedSupplier && (
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <Button
                            type="button"
                            onClick={handleContinueToProducts}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                          >
                            Continue to Products
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* STEP 2: Add Products - shown when supplier is selected */}
              {selectedSupplier && currentStep >= 2 && (
                <>
                  {/* Selected Supplier Summary Bar */}
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                            <Building className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Selected Supplier</p>
                            <h3 className="font-semibold text-base">
                              {selectedSupplier.name}
                            </h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-xs text-gray-600">Contact</p>
                            <p className="font-semibold text-green-600 text-sm">
                              {selectedSupplier.contact_person || 'N/A'}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSupplier(null)
                              setFormData(prev => ({
                                ...prev,
                                supplier_id: '',
                                supplier_name: '',
                                supplier_contact: '',
                                supplier_email: '',
                                supplier_phone: '',
                                delivery_address: '',
                                items: []
                              }))
                              setShowProductCatalog(false)
                            }}
                            className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                          >
                            Change
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Order Details Form */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">Order Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Delivery Address
                            </label>
                            <textarea
                              value={formData.delivery_address}
                              onChange={(e) => setFormData(prev => ({ ...prev, delivery_address: e.target.value }))}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              placeholder="Enter complete delivery address"
                            />
                          </div>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Delivery Location (Warehouse)
                              </label>
                              <select
                                value={formData.delivery_location}
                                onChange={(e) => setFormData(prev => ({ ...prev, delivery_location: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              >
                                <option value="">Select warehouse...</option>
                                {warehouses.map((warehouse: Warehouse) => (
                                  <option key={warehouse.id} value={warehouse.id}>
                                    {warehouse.name} ({warehouse.code})
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Expected Delivery Date
                              </label>
                              <input
                                type="date"
                                value={formData.expected_delivery_date}
                                onChange={(e) => setFormData(prev => ({ ...prev, expected_delivery_date: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Payment Terms
                            </label>
                            <input
                              type="text"
                              value={formData.payment_terms}
                              onChange={(e) => setFormData(prev => ({ ...prev, payment_terms: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              placeholder="e.g., Net 30 days"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Payment Method
                            </label>
                            <select
                              value={formData.payment_method}
                              onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                              <option value="">Select payment method...</option>
                              <option value="bank_transfer">Bank Transfer</option>
                              <option value="cash">Cash</option>
                              <option value="check">Check</option>
                              <option value="credit">Credit</option>
                            </select>
                          </div>
                        </div>

                        {/* Reviewer and Approver Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Reviewer (1st Level)
                            </label>
                            <select
                              value={formData.reviewer || ''}
                              onChange={(e) => setFormData(prev => ({ ...prev, reviewer: e.target.value ? parseInt(e.target.value) : undefined }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                              <option value="">Select Reviewer</option>
                              {users.map((user: any) => (
                                <option key={user.id} value={user.id}>
                                  {user.full_name || user.email}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Approver (2nd Level)
                            </label>
                            <select
                              value={formData.approver || ''}
                              onChange={(e) => setFormData(prev => ({ ...prev, approver: e.target.value ? parseInt(e.target.value) : undefined }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                              <option value="">Select Approver</option>
                              {users.map((user: any) => (
                                <option key={user.id} value={user.id}>
                                  {user.full_name || user.email}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Order Notes
                          </label>
                          <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Any special instructions or notes for this order"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Product Catalog */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">Add Products</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search products by name or code..."
                          value={productSearchTerm}
                          onChange={(e) => setProductSearchTerm(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                        />
                      </div>

                      {productsLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[...Array(6)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                              <div className="h-24 bg-muted rounded-lg"></div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                          {filteredProducts.map((product: Product) => (
                            <div
                              key={product.id}
                              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                selectedProduct?.id === product.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => handleProductSelect(product)}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{product.name}</h4>
                                  <p className="text-xs text-muted-foreground">{product.code}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  {product.is_active && <CheckCircle className="w-3 h-3 text-green-500" />}
                                </div>
                              </div>

                              {/* Package Sizes */}
                              {product.package_sizes && product.package_sizes.length > 0 && (
                                <div className="mb-2">
                                  <p className="text-xs text-muted-foreground mb-1">Package Sizes:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {product.package_sizes.map((size, idx) => (
                                      <span
                                        key={idx}
                                        className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium"
                                      >
                                        {size}{product.unit_of_measure === 'liters' ? 'L' : product.unit_of_measure === 'gallons' ? 'gal' : 'kg'}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Cost Price:</span>
                                  <span className="font-medium text-green-600">₦{parseFloat(product.cost_price || '0').toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Category:</span>
                                  <span className="font-medium capitalize">{product.category_name?.replace('_', ' ') || 'General'}</span>
                                </div>
                                {product.brand && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Brand:</span>
                                    <span className="font-medium">{product.brand}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Product Section */}
                      {selectedProduct && (
                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-3">Add to Order: {selectedProduct.name}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Quantity
                              </label>
                              <input
                                type="number"
                                min="1"
                                step="0.01"
                                value={quantity || ''}
                                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Enter quantity"
                              />
                            </div>

                            {/* Package Size Display - read-only (size is part of product) */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Package Size
                              </label>
                              <input
                                type="text"
                                value={(() => {
                                  let size = null
                                  if (selectedProduct.package_sizes && selectedProduct.package_sizes.length > 0) {
                                    size = selectedProduct.package_sizes[0]
                                  } else if (selectedProduct.retail_size && parseFloat(selectedProduct.retail_size) > 0) {
                                    size = parseFloat(selectedProduct.retail_size)
                                  } else if (selectedProduct.bulk_size && parseFloat(selectedProduct.bulk_size) > 0) {
                                    size = parseFloat(selectedProduct.bulk_size)
                                  }
                                  const unit = selectedProduct.unit_of_measure === 'liters' ? 'L' :
                                               selectedProduct.unit_of_measure === 'gallons' ? 'gal' :
                                               selectedProduct.unit_of_measure === 'kilograms' ? 'kg' : ''
                                  return size ? `${size}${unit}` : '-'
                                })()}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Unit Price
                              </label>
                              <input
                                type="text"
                                value={`₦${parseFloat(selectedProduct.cost_price || '0').toLocaleString()}`}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Total
                              </label>
                              <input
                                type="text"
                                value={`₦${(quantity * parseFloat(selectedProduct.cost_price || '0')).toLocaleString()}`}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                              />
                            </div>
                            <div>
                              <Button
                                type="button"
                                onClick={addProductToOrder}
                                className="w-full mofad-btn-primary"
                                disabled={!quantity || quantity <= 0}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Order Items */}
              {formData.items.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Order Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {formData.items.map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 py-2 text-sm">
                                <div>
                                  <p className="font-medium">{item.product_name}</p>
                                  <p className="text-muted-foreground">{item.product_code}</p>
                                </div>
                              </td>
                              <td className="px-4 py-2 text-sm">{item.quantity}</td>
                              <td className="px-4 py-2 text-sm">
                                {item.package_size ? (
                                  <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                                    {item.package_size}L
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {item.warehouse_name || <span className="text-gray-400">-</span>}
                              </td>
                              <td className="px-4 py-2 text-sm">₦{item.unit_price.toLocaleString()}</td>
                              <td className="px-4 py-2 text-sm font-medium">₦{item.total.toLocaleString()}</td>
                              <td className="px-4 py-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeItem(item.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Sidebar (4 columns) */}
            <div className="col-span-12 lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                {/* Order Summary Card */}
                <Card className="shadow-lg">
                  <CardHeader className="bg-green-50 border-b border-green-200">
                    <CardTitle className="text-lg font-bold text-green-900">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Supplier Info */}
                      {selectedSupplier ? (
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                              <Building className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-600 mb-1">Supplier</p>
                              <h4 className="font-semibold text-base text-gray-900 truncate">
                                {selectedSupplier.name}
                              </h4>
                              {selectedSupplier.contact_person && (
                                <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {selectedSupplier.contact_person}
                                </p>
                              )}
                              {selectedSupplier.phone && (
                                <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {selectedSupplier.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                          <Building className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-500">No supplier selected</p>
                        </div>
                      )}

                      {/* Order Statistics */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-3 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Total Items</span>
                          </div>
                          <span className="font-semibold text-lg text-gray-900">{formData.items.length}</span>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Total Quantity</span>
                          </div>
                          <span className="font-semibold text-lg text-gray-900">
                            {formData.items.reduce((sum, item) => sum + item.quantity, 0)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-3 bg-green-50 rounded-lg px-3">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-gray-900">Grand Total</span>
                          </div>
                          <span className="font-bold text-2xl text-green-600">
                            ₦{getTotalAmount().toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3 pt-4 border-t border-gray-200">
                        <Button
                          type="submit"
                          className="w-full mofad-btn-primary py-6 text-base font-semibold"
                          disabled={createMutation.isPending || !selectedSupplier || formData.items.length === 0}
                        >
                          {createMutation.isPending ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Creating PRO...
                            </>
                          ) : (
                            <>
                              <Save className="w-5 h-5 mr-2" />
                              Create Purchase Order
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancel}
                          className="w-full py-6 text-base"
                        >
                          Cancel
                        </Button>
                      </div>

                      {/* Order Info */}
                      {formData.items.length > 0 && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-blue-900">
                              <p className="font-medium mb-1">Ready to submit</p>
                              <p className="text-blue-700">
                                Your purchase order will be sent for approval once you click the submit button.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats Card */}
                {formData.items.length > 0 && (
                  <Card className="shadow-md">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold">Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Payment Terms</span>
                          <span className="font-medium text-gray-900">{formData.payment_terms}</span>
                        </div>
                        {formData.payment_method && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Payment Method</span>
                            <span className="font-medium text-gray-900 capitalize">
                              {formData.payment_method.replace('_', ' ')}
                            </span>
                          </div>
                        )}
                        {formData.expected_delivery_date && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Delivery Date</span>
                            <span className="font-medium text-gray-900">
                              {new Date(formData.expected_delivery_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {formData.delivery_location && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Warehouse</span>
                            <span className="font-medium text-gray-900">
                              {warehouses.find((w: Warehouse) => w.id.toString() === formData.delivery_location)?.name || 'N/A'}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </form>
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
