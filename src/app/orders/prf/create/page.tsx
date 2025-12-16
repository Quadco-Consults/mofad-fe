'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import mockApi from '@/lib/mockApi'
import {
  ArrowLeft,
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
  items: Array<{
    id: string
    product_id: string
    product_name: string
    product_code: string
    quantity: number
    unit_price: number
    total: number
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

  // Fetch customers
  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => mockApi.get('/customers'),
  })

  // Fetch MOFAD products
  const { data: mofadProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['mofad-products'],
    queryFn: () => mockApi.get('/products'),
    enabled: !!selectedCustomer,
  })

  // Filter products by search term
  const filteredProducts = mofadProducts?.filter(
    (product: MofadProduct) => {
      const matchesSearch = (product.name || '').toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                           (product.product_code || '').toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                           (product.category || '').toLowerCase().includes(productSearchTerm.toLowerCase())
      const hasStock = (product.stock_level || 0) > 0
      return matchesSearch && hasStock
    }
  ) || []

  const createCustomerOrder = useMutation({
    mutationFn: (data: CustomerOrderFormData) => mockApi.post('/orders/prf', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-orders'] })
      router.push('/orders/prf')
    },
    onError: (error) => {
      console.error('Error creating customer order:', error)
    },
  })

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    setFormData(prev => ({
      ...prev,
      customer_id: customer.id.toString(),
      customer_name: customer.name || '',
      customer_contact: customer.phone || '',
      customer_email: customer.email || '',
      delivery_address: customer.address || '',
      payment_terms: determinePaymentTerms(customer),
    }))
    setShowProductCatalog(true)
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

  const addProductToOrder = () => {
    if (!selectedProduct || !quantity || quantity <= 0) {
      alert('Please select a valid quantity')
      return
    }

    if (quantity > (selectedProduct.stock_level || 0)) {
      alert(`Only ${selectedProduct.stock_level} units available in stock`)
      return
    }

    const total = quantity * (selectedProduct.current_price || 0)
    const item: OrderItem = {
      id: Date.now().toString(),
      product_id: (selectedProduct.id || 0).toString(),
      product_name: selectedProduct.name || 'Unknown Product',
      product_code: selectedProduct.product_code || 'No Code',
      quantity,
      unit_price: selectedProduct.current_price || 0,
      total,
    }

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, item],
    }))

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

    if (!formData.customer_name || !formData.customer_contact || formData.items.length === 0) {
      alert('Please select customer and add at least one product.')
      return
    }

    createCustomerOrder.mutate(formData)
  }

  const handleCancel = () => {
    router.push('/orders/prf')
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Create Customer Order (PRF)</h1>
              <p className="text-muted-foreground">Process a new customer order for lubricants and petroleum products</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Customer Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Customer Selection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!selectedCustomer ? (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">Select a customer to process order:</p>
                      {customersLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                              <div className="h-32 bg-muted rounded-lg"></div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {customers?.map((customer: Customer) => {
                            const riskLevel = getCustomerRiskLevel(customer)
                            return (
                              <div
                                key={customer.id}
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => handleCustomerSelect(customer)}
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h3 className="font-semibold text-lg">{customer.name}</h3>
                                    <p className="text-sm text-muted-foreground">{customer.customer_type}</p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                    <span className="text-sm font-medium">{customer.rating}</span>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="w-4 h-4" />
                                    {customer.phone}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="w-4 h-4" />
                                    {customer.city}, {customer.state}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Shield className={`w-4 h-4`} />
                                    <span className={riskLevel.color}>{riskLevel.level}</span>
                                  </div>
                                </div>

                                <div className="mt-3 pt-3 border-t border-gray-100">
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                      <p className="text-muted-foreground">Credit Limit</p>
                                      <p className="font-medium">₦{customer.credit_limit.toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Total Purchases</p>
                                      <p className="font-medium">₦{customer.total_purchases.toLocaleString()}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <User className="w-8 h-8 text-primary" />
                          <div>
                            <h3 className="font-semibold text-lg">{selectedCustomer.name}</h3>
                            <p className="text-sm text-muted-foreground">{selectedCustomer.customer_type}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCustomer(null)
                            setFormData(prev => ({ ...prev, customer_id: '', customer_name: '', customer_contact: '', customer_email: '', delivery_address: '' }))
                            setShowProductCatalog(false)
                          }}
                        >
                          Change Customer
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Phone</p>
                          <p className="font-medium">{selectedCustomer.phone}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Email</p>
                          <p className="font-medium">{selectedCustomer.email}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Credit Limit</p>
                          <p className="font-medium">₦{selectedCustomer.credit_limit.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Outstanding</p>
                          <p className="font-medium">₦{selectedCustomer.outstanding_balance.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Order Details */}
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
                  )}
                </CardContent>
              </Card>

              {/* Product Catalog */}
              {showProductCatalog && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      MOFAD Product Catalog
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={productSearchTerm}
                        onChange={(e) => setProductSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                                <p className="text-xs text-muted-foreground">{product.product_code || 'No Code'}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                {getStockStatusIcon(product)}
                              </div>
                            </div>

                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Price:</span>
                                <span className="font-medium">₦{(product.current_price || 0).toLocaleString()}/{product.unit_type || 'Unit'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Stock:</span>
                                <span className="font-medium">{product.stock_level || 0} {product.unit_type || 'Unit'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Category:</span>
                                <span className="font-medium">{product.category || 'General'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Margin:</span>
                                <span className="font-medium text-green-600">{product.profit_margin || 0}%</span>
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
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Quantity ({selectedProduct.unit_type || 'units'})
                            </label>
                            <input
                              type="number"
                              min="1"
                              max={selectedProduct.stock_level || 0}
                              value={quantity || ''}
                              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              placeholder={`Max: ${selectedProduct.stock_level || 0}`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Unit Price
                            </label>
                            <input
                              type="text"
                              value={`₦${(selectedProduct.current_price || 0).toLocaleString()}`}
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
                              value={`₦${(quantity * (selectedProduct.current_price || 0)).toLocaleString()}`}
                              disabled
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                            />
                          </div>
                          <div>
                            <Button
                              type="button"
                              onClick={addProductToOrder}
                              className="w-full mofad-btn-primary"
                              disabled={!quantity || quantity <= 0 || quantity > (selectedProduct.stock_level || 0)}
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

            {/* Summary Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Items:</span>
                      <span>{formData.items.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Customer:</span>
                      <span className="text-right">{selectedCustomer?.name || 'Not selected'}</span>
                    </div>
                    {formData.payment_terms && (
                      <div className="flex justify-between text-sm">
                        <span>Payment Terms:</span>
                        <span>{formData.payment_terms}</span>
                      </div>
                    )}
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-medium">
                        <span>Total Amount:</span>
                        <span className="text-primary">₦{getTotalAmount().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Info Card */}
              {selectedCustomer && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Customer Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rating:</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span>{selectedCustomer.rating}/5</span>
                        </div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-muted-foreground">Credit Available:</span>
                        <span className="font-medium">₦{(selectedCustomer.credit_limit - selectedCustomer.outstanding_balance).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-muted-foreground">Risk Level:</span>
                        <span className={getCustomerRiskLevel(selectedCustomer).color}>
                          {getCustomerRiskLevel(selectedCustomer).level}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full mofad-btn-primary"
                    disabled={createCustomerOrder.isPending || !selectedCustomer || formData.items.length === 0}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {createCustomerOrder.isPending ? 'Creating...' : 'Create Order'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}