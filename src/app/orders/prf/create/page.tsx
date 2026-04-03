'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import apiClient from '@/lib/apiClient'
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
  CreditCard,
  Search,
  Star,
  Building,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Shield,
  Info,
} from 'lucide-react'

interface CustomerOrderFormData {
  customer_id: string
  customer_name: string
  customer_contact: string
  customer_email: string
  delivery_address: string
  payment_terms: string
  delivery_date: string
  order_notes: string
  sales_rep: string
  reviewer?: number
  approver?: number
  items: Array<{
    id: string
    product_id: string
    product_name: string
    product_code: string
    quantity: number
    unit_price: number
    total: number
    package_size?: number
    warehouse_name?: string
  }>
}

interface OrderItem {
  id: string
  product_id: string
  product_name: string
  product_code: string
  quantity: number
  unit_price: number
  total: number
  package_size?: number
  warehouse_id?: string
  warehouse_name?: string
}

interface Warehouse {
  id: number
  name: string
  location?: string
  is_active?: boolean
}

interface Customer {
  id: number
  name: string
  email: string
  phone: string
  customer_type: string
  address: string
  city: string
  state: string
  credit_limit: number
  outstanding_balance: number
  total_purchases: number
  last_transaction: string
  status: string
  rating: number
  // Optional properties for different API response formats
  business_name?: string
  customer_name?: string
  customer_type_name?: string
  contact_phone?: string
  created_at: string
}

interface MofadProduct {
  id: number
  name: string
  product_code: string
  category: string
  unit_type: string
  current_price: number
  cost_price: number
  stock_level: number
  reorder_level: number
  supplier: string
  status: string
  profit_margin: number
  created_at: string
  package_sizes?: number[]
  is_active?: boolean
  bulk_size?: number
  retail_size?: number
  unit_of_measure?: string
}

export default function CreateCustomerOrderPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<CustomerOrderFormData>({
    customer_id: '',
    customer_name: '',
    customer_contact: '',
    customer_email: '',
    delivery_address: '',
    payment_terms: 'Net 30',
    delivery_date: '',
    order_notes: '',
    sales_rep: '',
    items: [],
  })

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<MofadProduct | null>(null)
  const [showProductCatalog, setShowProductCatalog] = useState(false)
  const [quantity, setQuantity] = useState(0)
  const [productSearchTerm, setProductSearchTerm] = useState('')
  const [customerSearchTerm, setCustomerSearchTerm] = useState('')
  const [selectedWarehouse, setSelectedWarehouse] = useState('')
  const [warehouseForOrder, setWarehouseForOrder] = useState('')

  // Fetch customers with search
  const { data: customersData, isLoading: customersLoading } = useQuery({
    queryKey: ['customers', customerSearchTerm],
    queryFn: () => apiClient.getCustomers({
      search: customerSearchTerm || undefined,
      page_size: 100 // Load more customers
    }),
  })

  // Extract customers array from response
  const customers = customersData?.results || (Array.isArray(customersData) ? customersData : [])

  // Debug logging
  console.log('Customer data:', { customersData, customers, count: customers?.length, searchTerm: customerSearchTerm })

  // Fetch warehouse inventory instead of global products
  const { data: inventoryData, isLoading: productsLoading } = useQuery({
    queryKey: ['warehouse-inventory', warehouseForOrder],
    queryFn: () => apiClient.getWarehouseInventory(warehouseForOrder),
    enabled: !!selectedCustomer && !!warehouseForOrder,
  })

  // Extract inventory items and map to product format
  // The API returns { inventory: [...] } structure
  const inventoryItems = inventoryData?.inventory || []
  const mofadProducts = inventoryItems.map((item: any) => ({
    id: item.product,
    name: item.product_name,
    product_code: item.product_code,
    code: item.product_code,
    category: item.product_category,
    unit_type: item.product_unit_of_measure,
    current_price: item.product_retail_selling_price || item.product_bulk_selling_price || 0,
    retail_selling_price: item.product_retail_selling_price,
    bulk_selling_price: item.product_bulk_selling_price,
    cost_price: item.product_cost_price,
    stock_level: item.quantity_on_hand,
    quantity_available: item.quantity_available,
    quantity_on_hand: item.quantity_on_hand,
    reorder_level: 0,
    supplier: '',
    status: 'active',
    profit_margin: 0,
    created_at: '',
    is_active: true,
    is_sellable: item.quantity_available > 0,
    retail_size: item.product_retail_size,
    bulk_size: item.product_bulk_size,
    unit_of_measure: item.product_unit_of_measure,
    brand: item.product_brand,
    price_schemes: item.product_price_schemes || [],
  }))

  // Fetch users for reviewer and approver selection
  const { data: usersData } = useQuery({
    queryKey: ['users-for-prf'],
    queryFn: () => apiClient.getUsers({ is_active: true, page_size: 1000 }),
  })

  const users = usersData?.results || (Array.isArray(usersData) ? usersData : [])

  // Fetch warehouses
  const { data: warehousesData } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => apiClient.get('/warehouses/', { page_size: 100 }),
  })

  const warehouses = warehousesData?.results || (Array.isArray(warehousesData) ? warehousesData : [])

  // Debug logging
  console.log('Warehouses data:', { warehousesData, warehouses, count: warehouses?.length })
  console.log('Users data:', { usersData, users, count: users?.length })

  // No client-side filtering needed - API handles search
  const filteredCustomers = customers || []

  // Debug logging for search
  console.log('Search results:', { searchTerm: customerSearchTerm, resultCount: filteredCustomers.length })

  // Filter products by search term, exclude filters, and only show items with available stock
  const filteredProducts = mofadProducts?.filter(
    (product: any) => {
      const matchesSearch = (product.name || '').toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                           ((product.code || product.product_code) || '').toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                           (product.category || '').toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                           (product.brand || '').toLowerCase().includes(productSearchTerm.toLowerCase())
      const isLubricant = product.category !== 'filter' && product.category !== 'Filters' // Exclude filters
      const isActive = product.is_active !== false && product.is_sellable !== false
      const hasStock = product.quantity_available > 0 // Only show products with available stock
      return matchesSearch && isLubricant && isActive && hasStock
    }
  ) || []

  // Debug logging for products and inventory
  console.log('Inventory data debug:', {
    inventoryData,
    inventoryItems: inventoryItems?.length || 0,
    sampleInventoryItem: inventoryItems?.[0]
  })
  console.log('Products debug:', {
    totalProducts: mofadProducts?.length || 0,
    filteredCount: filteredProducts.length,
    searchTerm: productSearchTerm,
    sampleProduct: mofadProducts?.[0] ? {
      name: mofadProducts[0].name,
      code: (mofadProducts[0] as any).code,
      category: mofadProducts[0].category,
      retail_selling_price: (mofadProducts[0] as any).retail_selling_price,
      bulk_selling_price: (mofadProducts[0] as any).bulk_selling_price,
      cost_price: (mofadProducts[0] as any).cost_price,
      current_price: mofadProducts[0].current_price,
      minimum_selling_price: (mofadProducts[0] as any).minimum_selling_price,
      price_schemes: (mofadProducts[0] as any).price_schemes
    } : null
  })

  const createCustomerOrder = useMutation({
    mutationFn: (data: CustomerOrderFormData) => {
      // Transform form data to match backend API format
      const apiData = {
        title: `Customer Order - ${data.customer_name}`,
        description: data.order_notes || 'Customer purchase order',
        department: 'Sales',
        purpose: `Customer order for ${data.customer_name}`,
        priority: 'medium' as const,
        expected_delivery_date: data.delivery_date || undefined,
        estimated_total: data.items.reduce((sum, item) => sum + item.total, 0),
        client_type: 'customer',
        client_id: parseInt(data.customer_id) || undefined,
        reviewer: data.reviewer || undefined,
        approver: data.approver || undefined,
        items: data.items.map(item => ({
          product: parseInt(item.product_id),
          quantity_requested: item.quantity,
          unit_price_estimate: item.unit_price,
          specifications: '',
        }))
      }
      return apiClient.createPrf(apiData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-orders'] })
      queryClient.invalidateQueries({ queryKey: ['prfs'] })
      router.push('/orders/prf')
    },
    onError: (error) => {
      console.error('Error creating customer order:', error)
    },
  })

  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer)
    setFormData(prev => ({
      ...prev,
      customer_id: customer.id.toString(),
      customer_name: customer.name || customer.business_name || customer.customer_name || '',
      customer_contact: customer.phone || customer.contact_phone || '',
      customer_email: customer.email || customer.contact_email || '',
      delivery_address: customer.address || 'NA', // Default to NA if no address
      payment_terms: determinePaymentTerms(customer),
    }))
  }

  const handleContinueToProducts = () => {
    if (selectedCustomer) {
      setShowProductCatalog(true)
    }
  }

  const determinePaymentTerms = (customer: Customer) => {
    // Logic to determine payment terms based on customer rating and history
    if (customer.rating >= 4.5) return 'Net 30'
    if (customer.rating >= 4.0) return 'Net 15'
    if (customer.rating >= 3.0) return 'Net 7'
    return 'Cash on delivery'
  }

  const handleProductSelect = (product: MofadProduct) => {
    setSelectedProduct(product)
    setQuantity(1)
  }

  // Helper function to get Direct sales price from price schemes
  const getDirectPrice = (product: any) => {
    const priceSchemes = product.price_schemes || []
    const directScheme = priceSchemes.find((scheme: any) =>
      scheme.name?.toLowerCase().includes('direct')
    )

    // Try Direct scheme first, but only if price > 0
    if (directScheme && directScheme.price > 0) {
      return parseFloat(directScheme.price)
    }

    // Try each price field, only use if > 0
    const retailPrice = parseFloat(product.retail_selling_price || '0')
    if (retailPrice > 0) return retailPrice

    const bulkPrice = parseFloat(product.bulk_selling_price || '0')
    if (bulkPrice > 0) return bulkPrice

    const costPrice = parseFloat(product.cost_price || '0')
    if (costPrice > 0) return costPrice

    return 0
  }

  const addProductToOrder = () => {
    if (!selectedProduct || !quantity || quantity <= 0) {
      alert('Please select a valid quantity')
      return
    }

    // Check if quantity exceeds available stock
    const product = selectedProduct as any
    if (quantity > product.quantity_available) {
      alert(`Only ${product.quantity_available} ${product.unit_of_measure || 'units'} available in stock`)
      return
    }

    // Use Direct price from price schemes
    const unitPrice = getDirectPrice(product)
    const total = quantity * unitPrice

    // Find warehouse name from warehouseForOrder
    const selectedWarehouseObj = warehouses.find((w: Warehouse) => w.id.toString() === warehouseForOrder)

    // Extract package size from product (each product now represents a single size)
    const packageSize = product.retail_size || (product.package_sizes && product.package_sizes.length > 0 ? product.package_sizes[0] : undefined)

    const item: OrderItem = {
      id: Date.now().toString(),
      product_id: (selectedProduct.id || 0).toString(),
      product_name: selectedProduct.name || 'Unknown Product',
      product_code: product.code || selectedProduct.product_code || 'No Code',
      quantity,
      unit_price: unitPrice,
      total,
      package_size: packageSize,
      warehouse_id: warehouseForOrder || undefined,
      warehouse_name: selectedWarehouseObj?.name || undefined,
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

  const getStockStatusIcon = (product: MofadProduct) => {
    const stockLevel = product.stock_level || 0
    const reorderLevel = product.reorder_level || 0

    if (stockLevel <= 0) {
      return <AlertTriangle className="w-4 h-4 text-red-500" />
    } else if (stockLevel <= reorderLevel) {
      return <Clock className="w-4 h-4 text-yellow-500" />
    } else {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    }
  }

  const getCustomerRiskLevel = (customer: Customer) => {
    const balanceRatio = (customer.outstanding_balance || 0) / (customer.credit_limit || 1)
    if (balanceRatio > 0.9) return { level: 'High Risk', color: 'text-red-600' }
    if (balanceRatio > 0.7) return { level: 'Medium Risk', color: 'text-yellow-600' }
    return { level: 'Low Risk', color: 'text-green-600' }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.customer_name || formData.items.length === 0) {
      alert('Please select customer and add at least one product.')
      return
    }

    createCustomerOrder.mutate(formData)
  }

  const handleCancel = () => {
    router.push('/orders/prf')
  }

  // Determine current step
  const getCurrentStep = () => {
    if (!selectedCustomer || !showProductCatalog) return 1
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
                  <h1 className="text-2xl font-bold text-gray-900">New Purchase Request Form</h1>
                  <p className="text-sm text-gray-500 mt-0.5">Create a new customer order PRF</p>
                </div>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center gap-3">
              {[
                { num: 1, label: 'Customer', icon: User },
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
              {/* STEP 1: Customer Selection */}
              {currentStep === 1 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Select Customer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Customer Search Input */}
                      <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search by name, phone, email, or city..."
                          value={customerSearchTerm}
                          onChange={(e) => setCustomerSearchTerm(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                        />
                      </div>

                      {customersLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {[...Array(6)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                              <div className="h-28 bg-gray-100 rounded-lg"></div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-2">
                          {filteredCustomers.length > 0 ? filteredCustomers.map((customer: Customer) => {
                            const riskLevel = getCustomerRiskLevel(customer)
                            const isSelected = selectedCustomer?.id === customer.id
                            return (
                              <div
                                key={customer.id}
                                className={`border-2 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer group ${
                                  isSelected
                                    ? 'border-green-600 bg-green-50 shadow-md'
                                    : 'border-gray-200 hover:border-green-500'
                                }`}
                                onClick={() => handleCustomerSelect(customer)}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-base group-hover:text-green-600 transition-colors">
                                      {customer.name || customer.business_name || customer.customer_name || 'Unknown'}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">{customer.customer_type || customer.customer_type_name || 'Customer'}</p>
                                  </div>
                                  <div className="flex items-center gap-0.5">
                                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                    <span className="text-xs font-medium">{customer.rating || 0}</span>
                                  </div>
                                </div>

                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Phone className="w-3 h-3" />
                                    {customer.phone || customer.contact_phone || 'N/A'}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <MapPin className="w-3 h-3" />
                                    {customer.city || 'N/A'}
                                  </div>
                                </div>

                                <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between text-xs">
                                  <span className="text-muted-foreground">Credit Available</span>
                                  <span className="font-medium text-green-600">
                                    ₦{((customer.credit_limit || 0) - (customer.outstanding_balance || 0)).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            )
                          }) : (
                            <div className="col-span-3 text-center py-12 text-muted-foreground">
                              <User className="w-12 h-12 mx-auto mb-2 opacity-30" />
                              <p className="text-sm">No customers found</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Continue Button - Only show when customer is selected */}
                      {selectedCustomer && (
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

              {/* STEP 2: Add Products - shown when customer is selected */}
              {selectedCustomer && currentStep >= 2 && (
                <>
                  {/* Selected Customer Summary Bar */}
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Selected Customer</p>
                            <h3 className="font-semibold text-base">
                              {selectedCustomer.name || selectedCustomer.business_name || selectedCustomer.customer_name || 'Unknown'}
                            </h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-xs text-gray-600">Credit Available</p>
                            <p className="font-semibold text-green-600">
                              ₦{((selectedCustomer.credit_limit || 0) - (selectedCustomer.outstanding_balance || 0)).toLocaleString()}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCustomer(null)
                              setFormData(prev => ({ ...prev, customer_id: '', customer_name: '', customer_contact: '', customer_email: '', delivery_address: '', items: [] }))
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
                        {/* Warehouse Selection - First and Required */}
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Building className="w-4 h-4 inline mr-1" />
                            Select Warehouse *
                          </label>
                          <select
                            value={warehouseForOrder}
                            onChange={(e) => {
                              if (formData.items.length > 0) {
                                const confirmChange = window.confirm(
                                  'Changing the warehouse will clear your current order items. Continue?'
                                )
                                if (confirmChange) {
                                  setWarehouseForOrder(e.target.value)
                                  setFormData(prev => ({ ...prev, items: [] }))
                                  setSelectedProduct(null)
                                }
                              } else {
                                setWarehouseForOrder(e.target.value)
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                          >
                            <option value="">Choose a warehouse to see available products</option>
                            {warehouses.length === 0 && (
                              <option value="" disabled>No warehouses available</option>
                            )}
                            {warehouses.map((warehouse: Warehouse) => (
                              <option key={warehouse.id} value={warehouse.id}>
                                {warehouse.name} {warehouse.location ? `- ${warehouse.location}` : ''}
                              </option>
                            ))}
                          </select>
                          {warehouses.length === 0 && (
                            <p className="text-xs text-red-600 mt-2">
                              <AlertTriangle className="w-3 h-3 inline mr-1" />
                              No warehouses found. Please contact administrator.
                            </p>
                          )}
                          {!warehouseForOrder && (
                            <p className="text-xs text-blue-700 mt-2">
                              <Info className="w-3 h-3 inline mr-1" />
                              Select a warehouse first to view products available in its inventory
                            </p>
                          )}
                          {warehouseForOrder && formData.items.length > 0 && (
                            <p className="text-xs text-yellow-700 mt-2">
                              <AlertTriangle className="w-3 h-3 inline mr-1" />
                              Changing warehouse will clear current items
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Delivery Address *
                            </label>
                            <textarea
                              value={formData.delivery_address}
                              onChange={(e) => setFormData(prev => ({ ...prev, delivery_address: e.target.value }))}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              placeholder="Enter complete delivery address"
                              required
                            />
                          </div>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Payment Terms
                              </label>
                              <select
                                value={formData.payment_terms}
                                onChange={(e) => setFormData(prev => ({ ...prev, payment_terms: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              >
                                <option value="Net 30">Net 30 Days</option>
                                <option value="Net 15">Net 15 Days</option>
                                <option value="Net 7">Net 7 Days</option>
                                <option value="Cash on delivery">Cash on Delivery</option>
                                <option value="Prepaid">Prepaid</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Expected Delivery Date
                              </label>
                              <input
                                type="date"
                                value={formData.delivery_date}
                                onChange={(e) => setFormData(prev => ({ ...prev, delivery_date: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sales Representative
                          </label>
                          <input
                            type="text"
                            value={formData.sales_rep}
                            onChange={(e) => setFormData(prev => ({ ...prev, sales_rep: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Enter sales rep name"
                          />
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
                            value={formData.order_notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, order_notes: e.target.value }))}
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
                      <CardTitle className="text-lg font-semibold">Add Products from Inventory</CardTitle>
                      {warehouseForOrder && (
                        <p className="text-sm text-gray-500 mt-1">
                          Showing products available in {warehouses.find((w: Warehouse) => w.id.toString() === warehouseForOrder)?.name}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {!warehouseForOrder ? (
                        <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                          <Building className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                          <p className="text-sm text-gray-600 font-medium mb-1">No Warehouse Selected</p>
                          <p className="text-xs text-gray-500">Please select a warehouse above to view available products</p>
                        </div>
                      ) : (
                        <>
                          <div className="relative">
                            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search inventory by name or code..."
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
                      ) : filteredProducts.length === 0 ? (
                        <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                          <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                          <p className="text-sm text-gray-600 font-medium mb-1">No Products Available</p>
                          <p className="text-xs text-gray-500">
                            {productSearchTerm ? 'No products match your search. Try different keywords.' : 'No products with available stock in this warehouse.'}
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                          {filteredProducts.map((product: MofadProduct) => (
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
                                  <h4 className="font-medium text-sm">{product.name || 'Unknown Product'}</h4>
                                  <p className="text-xs text-muted-foreground">{(product as any).code || product.product_code || 'No Code'}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  {product.is_active && <CheckCircle className="w-3 h-3 text-green-500" />}
                                </div>
                              </div>

                              {/* Package Size */}
                              {((product as any).retail_size || (product.package_sizes && product.package_sizes.length > 0)) && (
                                <div className="mb-2">
                                  <p className="text-xs text-muted-foreground mb-1">Package Size:</p>
                                  <div className="flex flex-wrap gap-1">
                                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                                      {(product as any).retail_size || product.package_sizes?.[0]}{product.unit_of_measure === 'liters' ? 'L' : product.unit_of_measure === 'gallons' ? 'gal' : 'kg'}
                                    </span>
                                  </div>
                                </div>
                              )}

                              <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Direct Price:</span>
                                  <span className="font-medium text-green-600">₦{getDirectPrice(product as any).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Category:</span>
                                  <span className="font-medium capitalize">{product.category?.replace('_', ' ') || 'General'}</span>
                                </div>
                                {(product as any).brand && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Brand:</span>
                                    <span className="font-medium">{(product as any).brand}</span>
                                  </div>
                                )}
                                {/* Stock Level */}
                                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                  <span className="text-muted-foreground">Stock:</span>
                                  <span className={`font-semibold ${
                                    (product as any).quantity_available > 10 ? 'text-green-600' :
                                    (product as any).quantity_available > 0 ? 'text-yellow-600' : 'text-red-600'
                                  }`}>
                                    {(product as any).quantity_available || 0} {product.unit_of_measure || 'units'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Product Section */}
                      {selectedProduct && (
                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-3">Add to Order: {selectedProduct.name || 'Unknown Product'}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Quantity
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={quantity || ''}
                                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Enter quantity"
                              />
                            </div>

                            {/* Package Size Display */}
                            {((selectedProduct as any).retail_size || (selectedProduct.package_sizes && selectedProduct.package_sizes.length > 0)) && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Package Size
                                </label>
                                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                                  <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded text-sm font-medium">
                                    {(selectedProduct as any).retail_size || selectedProduct.package_sizes?.[0]}
                                    {selectedProduct.unit_of_measure === 'liters' ? 'L' : selectedProduct.unit_of_measure === 'gallons' ? 'gal' : 'kg'}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Stock Available Display */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Available Stock
                              </label>
                              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                                <span className={`font-semibold ${
                                  (selectedProduct as any).quantity_available > 10 ? 'text-green-600' :
                                  (selectedProduct as any).quantity_available > 0 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {(selectedProduct as any).quantity_available || 0} {selectedProduct.unit_of_measure || 'units'}
                                </span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Unit Price (Direct)
                              </label>
                              <input
                                type="text"
                                value={`₦${getDirectPrice(selectedProduct as any).toLocaleString()}`}
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
                                value={`₦${(quantity * getDirectPrice(selectedProduct as any)).toLocaleString()}`}
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
                        </>
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
                      {/* Customer Info */}
                      {selectedCustomer ? (
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                              <User className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-600 mb-1">Customer</p>
                              <h4 className="font-semibold text-base text-gray-900 truncate">
                                {selectedCustomer.name || selectedCustomer.business_name || selectedCustomer.customer_name || 'Unknown'}
                              </h4>
                              <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {selectedCustomer.phone || selectedCustomer.contact_phone || 'N/A'}
                              </p>
                              <div className="mt-2 pt-2 border-t border-green-200">
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-600">Credit Available</span>
                                  <span className="font-semibold text-green-700">
                                    ₦{((selectedCustomer.credit_limit || 0) - (selectedCustomer.outstanding_balance || 0)).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                          <User className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-500">No customer selected</p>
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
                          disabled={createCustomerOrder.isPending || !selectedCustomer || formData.items.length === 0}
                        >
                          <Save className="w-5 h-5 mr-2" />
                          {createCustomerOrder.isPending ? 'Creating PRF...' : 'Create Purchase Request'}
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
                                Your purchase request will be sent for approval once you click the submit button.
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
                        {formData.delivery_date && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Delivery Date</span>
                            <span className="font-medium text-gray-900">
                              {new Date(formData.delivery_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {formData.delivery_address && formData.delivery_address !== 'NA' && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Delivery</span>
                            <span className="font-medium text-gray-900 text-right max-w-[150px] truncate">
                              {formData.delivery_address}
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
