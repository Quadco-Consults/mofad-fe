'use client'

import { useState, useEffect } from 'react'
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
} from 'lucide-react'

interface PROFormData {
  title: string
  supplier_id: string
  description: string
  payment_terms: string
  expected_delivery: string
  items: Array<{
    id: string
    supplier_product_id: string
    product_name: string
    product_code: string
    quantity: number
    unit_price: number
    total: number
  }>
}

interface PROItem {
  id: string
  supplier_product_id: string
  product_name: string
  product_code: string
  quantity: number
  unit_price: number
  total: number
}

interface Supplier {
  id: number
  name: string
  email: string
  phone: string
  address: string
  contact_person: string
  contact_phone: string
  payment_terms: string
  credit_limit: number
  current_balance: number
  supplier_type: string
  products_supplied: string[]
  rating: number
  status: string
}

interface SupplierProduct {
  id: number
  supplier_id: number
  supplier_name: string
  product_name: string
  product_code: string
  category: string
  unit_type: string
  supplier_price: number
  current_market_price: number
  minimum_order_quantity: number
  lead_time_days: number
  availability_status: string
  quality_grade: string
  specifications: string
}

export default function CreatePROPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<PROFormData>({
    title: '',
    supplier_id: '',
    description: '',
    payment_terms: '',
    expected_delivery: '',
    items: [],
  })

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<SupplierProduct | null>(null)
  const [showProductCatalog, setShowProductCatalog] = useState(false)
  const [quantity, setQuantity] = useState(0)
  const [productSearchTerm, setProductSearchTerm] = useState('')

  // Fetch suppliers
  const { data: suppliers, isLoading: suppliersLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => mockApi.get('/suppliers'),
  })

  // Fetch supplier products when supplier is selected
  const { data: supplierProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['supplier-products', selectedSupplier?.id],
    queryFn: () => mockApi.get('/suppliers/products'),
    enabled: !!selectedSupplier,
  })

  // Filter products by selected supplier and search term
  const filteredProducts = supplierProducts?.filter(
    (product: SupplierProduct) => {
      const matchesSupplier = product.supplier_id === selectedSupplier?.id
      const matchesSearch = (product.product_name || '').toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                           (product.product_code || '').toLowerCase().includes(productSearchTerm.toLowerCase())
      return matchesSupplier && matchesSearch
    }
  ) || []

  const createPRO = useMutation({
    mutationFn: (data: PROFormData) => mockApi.post('/orders/pro', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pros'] })
      router.push('/orders/pro')
    },
    onError: (error) => {
      console.error('Error creating PRO:', error)
    },
  })

  const handleSupplierSelect = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setFormData(prev => ({
      ...prev,
      supplier_id: supplier.id.toString(),
      payment_terms: supplier.payment_terms,
    }))
    setShowProductCatalog(true)
  }

  const handleProductSelect = (product: SupplierProduct) => {
    setSelectedProduct(product)
    setQuantity(product?.minimum_order_quantity || 1)
  }

  const addProductToOrder = () => {
    if (!selectedProduct || !quantity || quantity < (selectedProduct.minimum_order_quantity || 1)) {
      alert(`Minimum order quantity is ${selectedProduct?.minimum_order_quantity || 1} ${selectedProduct?.unit_type || 'units'}`)
      return
    }

    const total = quantity * (selectedProduct.supplier_price || 0)
    const item: PROItem = {
      id: Date.now().toString(),
      supplier_product_id: (selectedProduct.id || 0).toString(),
      product_name: selectedProduct.product_name || 'Unknown Product',
      product_code: selectedProduct.product_code || 'No Code',
      quantity,
      unit_price: selectedProduct.supplier_price || 0,
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

  const getAvailabilityIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'limited':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'unavailable':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.supplier_id || formData.items.length === 0) {
      alert('Please fill in all required fields and add at least one product.')
      return
    }

    createPRO.mutate(formData)
  }

  const handleCancel = () => {
    router.push('/orders/pro')
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
              Back to PROs
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Create New Purchase Order</h1>
              <p className="text-muted-foreground">Select supplier and products for bulk purchase</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PRO Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter PRO title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter PRO description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Delivery
                    </label>
                    <div className="relative">
                      <Calendar className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        value={formData.expected_delivery}
                        onChange={(e) => setFormData(prev => ({ ...prev, expected_delivery: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Supplier Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Supplier Selection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!selectedSupplier ? (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">Select a supplier to purchase from:</p>
                      {suppliersLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                              <div className="h-32 bg-muted rounded-lg"></div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {suppliers?.map((supplier: Supplier) => (
                            <div
                              key={supplier.id}
                              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => handleSupplierSelect(supplier)}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="font-semibold text-lg">{supplier.name}</h3>
                                  <p className="text-sm text-muted-foreground">{supplier.supplier_type}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                  <span className="text-sm font-medium">{supplier.rating}</span>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <User className="w-4 h-4" />
                                  {supplier.contact_person}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Phone className="w-4 h-4" />
                                  {supplier.phone}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <CreditCard className="w-4 h-4" />
                                  {supplier.payment_terms}
                                </div>
                              </div>

                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs text-muted-foreground">
                                  Products: {supplier.products_supplied.join(', ')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Building className="w-8 h-8 text-primary" />
                          <div>
                            <h3 className="font-semibold text-lg">{selectedSupplier.name}</h3>
                            <p className="text-sm text-muted-foreground">{selectedSupplier.supplier_type}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSupplier(null)
                            setFormData(prev => ({ ...prev, supplier_id: '', payment_terms: '' }))
                            setShowProductCatalog(false)
                          }}
                        >
                          Change Supplier
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Contact Person</p>
                          <p className="font-medium">{selectedSupplier.contact_person}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Phone</p>
                          <p className="font-medium">{selectedSupplier.phone}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Payment Terms</p>
                          <p className="font-medium">{selectedSupplier.payment_terms}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Credit Balance</p>
                          <p className="font-medium">₦{selectedSupplier.current_balance.toLocaleString()}</p>
                        </div>
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
                      Product Catalog - {selectedSupplier?.name}
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-24 bg-muted rounded-lg"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                        {filteredProducts.map((product: SupplierProduct) => (
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
                                <h4 className="font-medium text-sm">{product.product_name || 'Unknown Product'}</h4>
                                <p className="text-xs text-muted-foreground">{product.product_code || 'No Code'}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                {getAvailabilityIcon(product.availability_status || 'unavailable')}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <p className="text-muted-foreground">Price</p>
                                <p className="font-medium">₦{(product.supplier_price || 0).toLocaleString()}/{product.unit_type || 'Unit'}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Min Order</p>
                                <p className="font-medium">{product.minimum_order_quantity || 0} {product.unit_type || 'Unit'}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Lead Time</p>
                                <p className="font-medium">{product.lead_time_days || 0} days</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Quality</p>
                                <p className="font-medium">{product.quality_grade || 'Standard'}</p>
                              </div>
                            </div>

                            {product.specifications && (
                              <div className="mt-2 pt-2 border-t border-gray-100">
                                <p className="text-xs text-muted-foreground">{product.specifications}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Product Section */}
                    {selectedProduct && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-3">Add to Order: {selectedProduct.product_name || 'Unknown Product'}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Quantity ({selectedProduct.unit_type || 'units'})
                            </label>
                            <input
                              type="number"
                              min={selectedProduct.minimum_order_quantity || 1}
                              value={quantity || ''}
                              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              placeholder={`Min: ${selectedProduct.minimum_order_quantity || 1}`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Unit Price
                            </label>
                            <input
                              type="text"
                              value={`₦${(selectedProduct.supplier_price || 0).toLocaleString()}`}
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
                              value={`₦${(quantity * (selectedProduct.supplier_price || 0)).toLocaleString()}`}
                              disabled
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                            />
                          </div>
                          <div>
                            <Button
                              type="button"
                              onClick={addProductToOrder}
                              className="w-full mofad-btn-primary"
                              disabled={!quantity || quantity < (selectedProduct.minimum_order_quantity || 1)}
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
                    <DollarSign className="w-5 h-5" />
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
                      <span>Supplier:</span>
                      <span className="text-right">{selectedSupplier?.name || 'Not selected'}</span>
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

              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full mofad-btn-primary"
                    disabled={createPRO.isPending || !formData.title || !selectedSupplier || formData.items.length === 0}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {createPRO.isPending ? 'Creating...' : 'Create PRO'}
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