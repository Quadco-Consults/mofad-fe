'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import apiClient from '@/lib/apiClient'
import { formatCurrency } from '@/lib/utils'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Package,
  AlertTriangle,
  Upload,
  CheckCircle,
  X,
} from 'lucide-react'
import type {
  SRNCreateData,
  SRNItemCreateData,
  ReturnType,
  ResolutionType,
  PackagingCondition,
} from '@/types/supplier-returns'
import { getReturnTypeLabel, getResolutionTypeLabel } from '@/types/supplier-returns'

interface PRO {
  id: number
  pro_number: string
  supplier: string
  total_amount: string
  status: string
}

interface GRN {
  id: number
  grn_number: string
  pro: number
  warehouse: number
  warehouse_name: string
  status: string
}

interface Warehouse {
  id: number
  name: string
  code: string
}

interface Product {
  id: number
  name: string
  sku: string
  unit_of_measure: string
}

interface FormItem extends SRNItemCreateData {
  tempId: string
  productName?: string
}

export default function CreateSupplierReturnPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  // Form state
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<Partial<SRNCreateData>>({
    return_source: 'grn',
    resolution_type: 'replacement',
    items: [],
  })
  const [currentItem, setCurrentItem] = useState<Partial<FormItem>>({
    tempId: Date.now().toString(),
  })
  const [items, setItems] = useState<FormItem[]>([])

  // Fetch PROs
  const { data: pros } = useQuery({
    queryKey: ['pros'],
    queryFn: async () => {
      const response = await apiClient.get('/pros/?status=delivered')
      return response as PRO[]
    },
  })

  // Fetch GRNs for selected PRO
  const { data: grns } = useQuery({
    queryKey: ['grns', formData.pro_id],
    queryFn: async () => {
      if (!formData.pro_id) return []
      const response = await apiClient.get(`/grns/?pro=${formData.pro_id}`)
      return response as GRN[]
    },
    enabled: !!formData.pro_id,
  })

  // Fetch warehouses
  const { data: warehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const response = await apiClient.get('/warehouses/')
      return response as Warehouse[]
    },
  })

  // Fetch products
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await apiClient.get('/products/')
      return response as Product[]
    },
  })

  // Create SRN mutation
  const createMutation = useMutation({
    mutationFn: async (data: SRNCreateData) => {
      const response = await apiClient.post('/supplier-returns/', data)
      return response
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['supplier-returns'] })
      router.push(`/supplier-returns/${data.id}`)
    },
    onError: (error: any) => {
      console.error('Failed to create supplier return:', error)
      alert('Failed to create supplier return. Please try again.')
    },
  })

  const handleAddItem = () => {
    if (!currentItem.product_id || !currentItem.quantity_returned || !currentItem.unit_cost || !currentItem.defect_description) {
      alert('Please fill in all required item fields')
      return
    }

    const product = products?.find(p => p.id === currentItem.product_id)
    const newItem: FormItem = {
      ...currentItem as FormItem,
      tempId: currentItem.tempId || Date.now().toString(),
      productName: product?.name,
    }

    setItems([...items, newItem])
    setCurrentItem({ tempId: Date.now().toString() })
  }

  const handleRemoveItem = (tempId: string) => {
    setItems(items.filter(item => item.tempId !== tempId))
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.pro_id || !formData.warehouse_id || !formData.return_type || !formData.description) {
      alert('Please fill in all required fields')
      return
    }

    if (items.length === 0) {
      alert('Please add at least one item to return')
      return
    }

    const submitData: SRNCreateData = {
      title: formData.title,
      pro_id: formData.pro_id,
      grn_id: formData.grn_id,
      warehouse_id: formData.warehouse_id,
      return_type: formData.return_type as ReturnType,
      description: formData.description,
      return_source: formData.return_source as 'grn' | 'stock',
      resolution_type: formData.resolution_type as ResolutionType,
      pickup_scheduled_date: formData.pickup_scheduled_date,
      replacement_expected_date: formData.replacement_expected_date,
      notes: formData.notes,
      items: items.map(({ tempId, productName, ...item }) => item),
    }

    createMutation.mutate(submitData)
  }

  const selectedPRO = pros?.find(p => p.id === formData.pro_id)
  const totalValue = items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity_returned?.toString() || '0')
    const cost = parseFloat(item.unit_cost?.toString() || '0')
    return sum + (qty * cost)
  }, 0)

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Supplier Return</h1>
              <p className="text-gray-600">Return defective or damaged goods to supplier</p>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    s === step
                      ? 'bg-mofad-green text-white'
                      : s < step
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {s < step ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
                {s < 3 && <div className="w-12 h-0.5 bg-gray-200 mx-1" />}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Return Details */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Return Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Return Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green"
                    placeholder="e.g., Damaged goods from delivery 12/01/2026"
                  />
                </div>

                {/* PRO */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purchase Order (PRO) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.pro_id || ''}
                    onChange={(e) => setFormData({ ...formData, pro_id: parseInt(e.target.value), grn_id: undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green"
                  >
                    <option value="">Select PRO</option>
                    {pros?.map((pro) => (
                      <option key={pro.id} value={pro.id}>
                        {pro.pro_number} - {pro.supplier}
                      </option>
                    ))}
                  </select>
                </div>

                {/* GRN (optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Goods Receipt Note (GRN)
                  </label>
                  <select
                    value={formData.grn_id || ''}
                    onChange={(e) => setFormData({ ...formData, grn_id: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green"
                    disabled={!formData.pro_id}
                  >
                    <option value="">Select GRN (optional)</option>
                    {grns?.map((grn) => (
                      <option key={grn.id} value={grn.id}>
                        {grn.grn_number}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Warehouse */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warehouse <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.warehouse_id || ''}
                    onChange={(e) => setFormData({ ...formData, warehouse_id: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green"
                  >
                    <option value="">Select Warehouse</option>
                    {warehouses?.map((wh) => (
                      <option key={wh.id} value={wh.id}>
                        {wh.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Return Source */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Return Source <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.return_source || 'grn'}
                    onChange={(e) => setFormData({ ...formData, return_source: e.target.value as 'grn' | 'stock' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green"
                  >
                    <option value="grn">During Receiving (GRN)</option>
                    <option value="stock">From Existing Stock</option>
                  </select>
                </div>

                {/* Return Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Return Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.return_type || ''}
                    onChange={(e) => setFormData({ ...formData, return_type: e.target.value as ReturnType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green"
                  >
                    <option value="">Select Return Type</option>
                    <option value="damaged">Damaged Goods</option>
                    <option value="leakage">Leakage</option>
                    <option value="expired">Expired Products</option>
                    <option value="wrong_product">Wrong Product</option>
                    <option value="quality_issue">Quality Issue</option>
                    <option value="short_delivery">Short Delivery</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Resolution Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resolution Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.resolution_type || 'replacement'}
                    onChange={(e) => setFormData({ ...formData, resolution_type: e.target.value as ResolutionType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green"
                  >
                    <option value="replacement">Replacement</option>
                    <option value="refund">Refund</option>
                    <option value="credit_note">Credit Note</option>
                  </select>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green"
                    placeholder="Describe the issue with the goods..."
                  />
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Internal Notes
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green"
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!formData.title || !formData.pro_id || !formData.warehouse_id || !formData.return_type || !formData.description}
                  className="bg-mofad-green hover:bg-mofad-green/90 text-white"
                >
                  Next: Add Items
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Add Items */}
        {step === 2 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Add Items to Return</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Product */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={currentItem.product_id || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, product_id: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green"
                    >
                      <option value="">Select Product</option>
                      {products?.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity Returned <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentItem.quantity_returned || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, quantity_returned: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Unit Cost */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Cost <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentItem.unit_cost || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, unit_cost: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Packaging Condition */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Packaging Condition
                    </label>
                    <select
                      value={currentItem.packaging_condition || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, packaging_condition: e.target.value as PackagingCondition })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green"
                    >
                      <option value="">Select Condition</option>
                      <option value="damaged">Damaged</option>
                      <option value="leaking">Leaking</option>
                      <option value="destroyed">Destroyed</option>
                      <option value="poor">Poor</option>
                      <option value="fair">Fair</option>
                    </select>
                  </div>

                  {/* Batch Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Batch Number
                    </label>
                    <input
                      type="text"
                      value={currentItem.batch_number || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, batch_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green"
                      placeholder="Optional"
                    />
                  </div>

                  {/* Expiry Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={currentItem.expiry_date || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, expiry_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green"
                    />
                  </div>

                  {/* Defect Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Defect Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={currentItem.defect_description || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, defect_description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mofad-green"
                      placeholder="Describe the defect or damage..."
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAddItem}
                  className="bg-mofad-green hover:bg-mofad-green/90 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardContent>
            </Card>

            {/* Items List */}
            {items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Items to Return ({items.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.tempId}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity_returned} × {formatCurrency(parseFloat(item.unit_cost?.toString() || '0'))} = {' '}
                            {formatCurrency(parseFloat(item.quantity_returned?.toString() || '0') * parseFloat(item.unit_cost?.toString() || '0'))}
                          </p>
                          <p className="text-sm text-gray-600">{item.defect_description}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.tempId)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Return Value:</span>
                      <span>{formatCurrency(totalValue)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={items.length === 0}
                className="bg-mofad-green hover:bg-mofad-green/90 text-white"
              >
                Next: Review
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Step 3: Review & Submit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Return Details */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Return Details</h3>
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-gray-600">Title:</dt>
                      <dd className="font-medium">{formData.title}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">PRO Number:</dt>
                      <dd className="font-medium">{selectedPRO?.pro_number}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Return Type:</dt>
                      <dd className="font-medium">{getReturnTypeLabel(formData.return_type as ReturnType)}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Resolution:</dt>
                      <dd className="font-medium">{getResolutionTypeLabel(formData.resolution_type as ResolutionType)}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-gray-600">Description:</dt>
                      <dd className="font-medium">{formData.description}</dd>
                    </div>
                  </dl>
                </div>

                {/* Items Summary */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Items ({items.length})</h3>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.tempId} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between">
                          <span className="font-medium">{item.productName}</span>
                          <span className="font-medium">
                            {formatCurrency(parseFloat(item.quantity_returned?.toString() || '0') * parseFloat(item.unit_cost?.toString() || '0'))}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Qty: {item.quantity_returned} × {formatCurrency(parseFloat(item.unit_cost?.toString() || '0'))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Return Value:</span>
                      <span>{formatCurrency(totalValue)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending}
                className="bg-mofad-green hover:bg-mofad-green/90 text-white"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Supplier Return'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
