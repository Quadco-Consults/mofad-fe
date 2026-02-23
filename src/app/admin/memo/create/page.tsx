'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import apiClient from '@/lib/apiClient'
import {
  ArrowLeft,
  Save,
  Send,
  Plus,
  Trash2,
  ShoppingCart,
  Building,
  Package,
  DollarSign,
} from 'lucide-react'

interface MemoItem {
  product: number
  quantity: number
  unit_price: number
  notes: string
}

interface MemoFormData {
  title: string
  subject: string
  content: string
  category: 'procurement' | 'general' | 'policy' | 'announcement'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  supplier: number | null
  delivery_warehouse: number | null
  items: MemoItem[]
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function CreateMemoPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<MemoFormData>({
    title: '',
    subject: '',
    content: '',
    category: 'procurement',
    priority: 'normal',
    supplier: null,
    delivery_warehouse: null,
    items: [],
  })

  // Fetch suppliers
  const { data: suppliersData } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const response = await apiClient.get('/suppliers/')
      return response
    },
  })

  // Fetch warehouses
  const { data: warehousesData } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const response = await apiClient.get('/warehouses/')
      return response
    },
  })

  // Fetch products - get all pages
  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      let allProducts: any[] = []
      let page = 1
      let hasMore = true

      while (hasMore) {
        const response = await apiClient.get(`/products/?is_active=true&page=${page}&size=100`)
        const data = response.data || response
        const results = data.results || []

        allProducts = [...allProducts, ...results]

        // Check if there are more pages
        hasMore = data.paginator?.next_page_number != null
        page++
      }

      return { results: allProducts }
    },
  })

  const suppliers = suppliersData?.results || suppliersData || []
  const warehouses = warehousesData?.results || warehousesData || []
  const products = productsData?.results || productsData || []

  // Create memo mutation
  const createMemoMutation = useMutation({
    mutationFn: async (data: MemoFormData) => {
      return await apiClient.post('/memos/', data)
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['memos'] })
      alert('Memo created successfully!')

      // Handle different response structures
      const memoId = response?.id || response?.data?.id
      if (memoId) {
        router.push(`/admin/memo/${memoId}`)
      } else {
        console.error('No memo ID in response:', response)
        router.push('/admin/memo')
      }
    },
    onError: (error: any) => {
      console.error('Error creating memo:', error)
      alert(`Error: ${error.response?.data?.message || error.message || 'Failed to create memo'}`)
    },
  })

  const handleInputChange = (field: keyof MemoFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product: 0,
          quantity: 1,
          unit_price: 0,
          notes: '',
        },
      ],
    }))
  }

  const updateItem = (index: number, field: keyof MemoItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value }

          // Auto-fill unit price when product is selected
          if (field === 'product' && value) {
            const selectedProduct = products.find((p: any) => p.id === parseInt(value))
            if (selectedProduct) {
              // Use cost_price for procurement, fallback to bulk_selling_price or retail_selling_price
              updatedItem.unit_price = selectedProduct.cost_price ||
                                       selectedProduct.bulk_selling_price ||
                                       selectedProduct.retail_selling_price ||
                                       0
            }
          }

          return updatedItem
        }
        return item
      }),
    }))
  }

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  const calculateTotal = () => {
    return formData.items.reduce(
      (sum, item) => sum + (item.quantity * item.unit_price),
      0
    )
  }

  const handleSubmit = async (shouldSubmitForReview: boolean = false) => {
    // Validation
    if (!formData.title.trim()) {
      alert('Please enter a title')
      return
    }

    if (!formData.subject.trim()) {
      alert('Please enter a subject')
      return
    }

    if (formData.category === 'procurement') {
      if (!formData.supplier) {
        alert('Please select a supplier for procurement memo')
        return
      }

      if (formData.items.length === 0) {
        alert('Please add at least one item')
        return
      }

      // Validate all items have product selected
      const invalidItems = formData.items.filter(item => !item.product || item.product === 0)
      if (invalidItems.length > 0) {
        alert('Please select a product for all items')
        return
      }
    }

    setIsSubmitting(true)

    try {
      // Create the memo
      await createMemoMutation.mutateAsync(formData)

      // TODO: If shouldSubmitForReview is true, call submit endpoint after creation
      // This would require getting the created memo ID and calling POST /memos/{id}/submit/

    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedSupplier = suppliers.find((s: any) => s.id === formData.supplier)
  const totalAmount = calculateTotal()

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Create Memo</h1>
              <p className="text-muted-foreground mt-1">
                Create a new procurement request or general memo
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
            >
              <Save className="w-4 h-4 mr-2" />
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit for Review'}
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Category *
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                    >
                      <option value="procurement">Procurement Request</option>
                      <option value="general">General</option>
                      <option value="policy">Policy</option>
                      <option value="announcement">Announcement</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Priority *
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="Brief title for the memo"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="Subject line"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Content/Description *
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    rows={4}
                    placeholder="Detailed description and justification"
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Procurement Details */}
            {formData.category === 'procurement' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      Procurement Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <SearchableSelect
                          label="Supplier"
                          required
                          placeholder="Select Supplier"
                          value={formData.supplier || 0}
                          onChange={(value) => handleInputChange('supplier', value as number)}
                          options={suppliers.map((supplier: any) => ({
                            value: supplier.id,
                            label: supplier.name || 'Unnamed Supplier',
                            subtitle: supplier.phone || supplier.email || supplier.contact_person || '',
                          }))}
                        />
                      </div>

                      <div>
                        <SearchableSelect
                          label="Delivery Warehouse"
                          placeholder="Select Warehouse"
                          value={formData.delivery_warehouse || 0}
                          onChange={(value) => handleInputChange('delivery_warehouse', value as number)}
                          options={warehouses.map((warehouse: any) => ({
                            value: warehouse.id,
                            label: warehouse.name || 'Unnamed Warehouse',
                            subtitle: warehouse.location || warehouse.address || warehouse.state_name || '',
                          }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Items */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Items
                      </CardTitle>
                      <Button onClick={addItem} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {formData.items.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No items added yet</p>
                        <p className="text-sm">Click &quot;Add Item&quot; to start</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {formData.items.map((item, index) => {
                          const selectedProduct = products.find((p: any) => p.id === item.product)
                          const itemTotal = item.quantity * item.unit_price

                          return (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-3">
                                <span className="text-sm font-medium text-muted-foreground">
                                  Item {index + 1}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeItem(index)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                  <SearchableSelect
                                    label="Product"
                                    required
                                    placeholder="Select Product"
                                    value={item.product}
                                    onChange={(value) => updateItem(index, 'product', value as number)}
                                    options={products.map((product: any) => ({
                                      value: product.id,
                                      label: product.name || 'Unnamed Product',
                                      subtitle: `Code: ${product.code || 'N/A'} | ${product.category || 'Uncategorized'}`,
                                    }))}
                                  />
                                </div>

                                {/* Package Size Info */}
                                {selectedProduct && (
                                  <div className="col-span-2 bg-blue-50 border border-blue-200 rounded-md p-3">
                                    <div className="flex items-start gap-2">
                                      <Package className="w-4 h-4 text-blue-600 mt-0.5" />
                                      <div className="flex-1">
                                        <p className="text-xs font-medium text-blue-900 mb-1">Package Sizes</p>
                                        <div className="flex flex-wrap gap-3 text-xs text-blue-800">
                                          {selectedProduct.bulk_size && (
                                            <span className="bg-blue-100 px-2 py-1 rounded">
                                              Bulk: {selectedProduct.bulk_size} {selectedProduct.unit_of_measure || 'liters'}
                                            </span>
                                          )}
                                          {selectedProduct.retail_size && (
                                            <span className="bg-blue-100 px-2 py-1 rounded">
                                              Retail: {selectedProduct.retail_size} {selectedProduct.unit_of_measure || 'liters'}
                                            </span>
                                          )}
                                          {!selectedProduct.bulk_size && !selectedProduct.retail_size && (
                                            <span className="text-blue-600">
                                              Unit: {selectedProduct.unit_of_measure || 'liters'}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <label className="block text-sm font-medium mb-1">
                                    Quantity *
                                  </label>
                                  <input
                                    type="number"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    min="1"
                                    step="1"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 1)}
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium mb-1">
                                    Unit Price *
                                  </label>
                                  <input
                                    type="number"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    min="0"
                                    step="0.01"
                                    value={item.unit_price}
                                    onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                  />
                                </div>

                                <div className="col-span-2">
                                  <label className="block text-sm font-medium mb-1">
                                    Notes
                                  </label>
                                  <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="Additional notes"
                                    value={item.notes}
                                    onChange={(e) => updateItem(index, 'notes', e.target.value)}
                                  />
                                </div>
                              </div>

                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium">Item Total:</span>
                                  <span className="text-lg font-bold">{formatCurrency(itemTotal)}</span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium capitalize">{formData.category}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Priority</p>
                  <p className="font-medium capitalize">{formData.priority}</p>
                </div>

                {formData.category === 'procurement' && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Supplier</p>
                      <p className="font-medium">
                        {selectedSupplier ? selectedSupplier.name : 'Not selected'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Items</p>
                      <p className="font-medium">{formData.items.length} item(s)</p>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-primary" />
                          <span className="font-medium">Total Amount</span>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-primary mt-2">
                        {formatCurrency(totalAmount)}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {formData.category === 'procurement' && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <ShoppingCart className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">Procurement Request</p>
                      <p className="text-sm text-blue-700 mt-1">
                        This memo will go through COO → MD approval. Once approved, you can convert it to a PRO.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
