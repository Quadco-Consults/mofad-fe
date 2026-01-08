'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  ArrowLeft,
  Save,
  Send,
  Plus,
  Trash2,
  FileText,
  DollarSign,
  User,
  Building,
  Calendar,
  AlertTriangle,
  ShoppingCart,
  CreditCard,
  Plane,
  Briefcase,
} from 'lucide-react'

// Same interfaces as create page
interface MemoItem {
  id: number
  description: string
  quantity?: number
  unit?: string
  unitCost: number
  totalCost: number
  vendor?: string
  specifications?: string
}

interface MemoFormData {
  title: string
  memoType: 'Purchase Request' | 'Funding Request' | 'Budget Approval' | 'Travel Request' | 'Equipment Purchase' | 'Service Request'
  department: string
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  dateRequired: string
  purpose: string
  justification: string
  requestedAmount?: number
  items: MemoItem[]
}

const memoTypes = [
  { value: 'Purchase Request', icon: ShoppingCart, description: 'Request for purchasing goods or services' },
  { value: 'Funding Request', icon: CreditCard, description: 'Request for funding or budget allocation' },
  { value: 'Budget Approval', icon: DollarSign, description: 'Request for budget approval or revision' },
  { value: 'Travel Request', icon: Plane, description: 'Business travel authorization request' },
  { value: 'Equipment Purchase', icon: Building, description: 'Specific equipment or asset purchase request' },
  { value: 'Service Request', icon: Briefcase, description: 'External service or contractor request' },
]

const departments = [
  'Human Resources',
  'Finance & Accounting',
  'Information Technology',
  'Operations',
  'Sales & Marketing',
  'Administration',
  'Security',
  'Procurement',
  'Legal',
  'Maintenance',
]

const priorities = [
  { value: 'Low', color: 'bg-green-100 text-green-800', description: 'Non-urgent, can be processed in regular workflow' },
  { value: 'Medium', color: 'bg-yellow-100 text-yellow-800', description: 'Standard processing required' },
  { value: 'High', color: 'bg-orange-100 text-orange-800', description: 'Expedited processing needed' },
  { value: 'Critical', color: 'bg-red-100 text-red-800', description: 'Urgent processing required immediately' },
]

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Mock function to get memo data for editing
const getMemoForEdit = (id: string): MemoFormData | null => {
  // In reality, this would fetch from your data source
  const mockMemo: MemoFormData = {
    title: 'Office Equipment Purchase Request',
    memoType: 'Purchase Request',
    department: 'Information Technology',
    priority: 'High',
    dateRequired: '2024-02-15',
    purpose: 'Procurement of office equipment for new employees',
    justification: 'We need to purchase office equipment for the 5 new employees joining the IT department. This equipment is essential for their productivity and aligns with our Q1 expansion plans.',
    items: [
      {
        id: 1,
        description: 'Dell OptiPlex Desktop Computer',
        quantity: 5,
        unit: 'Unit',
        unitCost: 450000,
        totalCost: 2250000,
        vendor: 'Grand Concept Ltd',
        specifications: '8GB RAM, 256GB SSD, Intel i5 processor'
      },
      {
        id: 2,
        description: 'HP LaserJet Printer',
        quantity: 2,
        unit: 'Unit',
        unitCost: 125000,
        totalCost: 250000,
        vendor: 'Office Plus Nigeria',
        specifications: 'Duplex printing, network capable'
      },
      {
        id: 3,
        description: 'Executive Office Chairs',
        quantity: 5,
        unit: 'Unit',
        unitCost: 85000,
        totalCost: 425000,
        vendor: 'Corporate Supplies Co',
        specifications: 'Ergonomic, leather finish, height adjustable'
      }
    ]
  }

  return mockMemo
}

export default function EditMemoPage() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const [formData, setFormData] = useState<MemoFormData>({
    title: '',
    memoType: 'Purchase Request',
    department: '',
    priority: 'Medium',
    dateRequired: '',
    purpose: '',
    justification: '',
    items: []
  })

  const [currentItem, setCurrentItem] = useState<Partial<MemoItem>>({
    description: '',
    quantity: 1,
    unit: 'Unit',
    unitCost: 0,
    vendor: '',
    specifications: ''
  })

  // Load existing memo data
  useEffect(() => {
    if (params.id) {
      setTimeout(() => {
        const memoData = getMemoForEdit(params.id as string)
        if (memoData) {
          setFormData(memoData)
        }
        setInitialLoading(false)
      }, 500)
    }
  }, [params.id])

  // Calculate totals
  const totalAmount = formData.items.reduce((sum, item) => sum + item.totalCost, 0)
  const displayAmount = formData.requestedAmount || totalAmount

  const addItem = () => {
    if (!currentItem.description || !currentItem.unitCost) {
      alert('Please fill in item description and unit cost')
      return
    }

    const totalCost = (currentItem.quantity || 1) * (currentItem.unitCost || 0)
    const newItem: MemoItem = {
      id: Date.now(),
      description: currentItem.description,
      quantity: currentItem.quantity,
      unit: currentItem.unit || 'Unit',
      unitCost: currentItem.unitCost || 0,
      totalCost,
      vendor: currentItem.vendor,
      specifications: currentItem.specifications
    }

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))

    // Reset current item
    setCurrentItem({
      description: '',
      quantity: 1,
      unit: 'Unit',
      unitCost: 0,
      vendor: '',
      specifications: ''
    })
  }

  const removeItem = (id: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }))
  }

  const updateCurrentItem = (field: string, value: any) => {
    setCurrentItem(prev => {
      const updated = { ...prev, [field]: value }
      if (field === 'quantity' || field === 'unitCost') {
        const quantity = field === 'quantity' ? value : (prev.quantity || 1)
        const unitCost = field === 'unitCost' ? value : (prev.unitCost || 0)
        updated.totalCost = quantity * unitCost
      }
      return updated
    })
  }

  const editItem = (item: MemoItem) => {
    setCurrentItem({
      ...item,
      totalCost: item.quantity! * item.unitCost
    })
    removeItem(item.id)
  }

  const handleSubmit = async (status: 'draft' | 'submitted') => {
    if (!formData.title || !formData.department || !formData.purpose || !formData.justification) {
      alert('Please fill in all required fields')
      return
    }

    if (formData.memoType === 'Purchase Request' && formData.items.length === 0 && !formData.requestedAmount) {
      alert('Please add items or specify requested amount')
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      console.log('Memo updated:', { ...formData, id: params.id, status })

      alert(`Memo ${status === 'draft' ? 'saved as draft' : 'submitted'} successfully!`)

      // Navigate back to memo detail
      router.push(`/admin/memo/${params.id}`)

    } catch (error) {
      console.error('Error updating memo:', error)
      alert('Failed to update memo')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedMemoType = memoTypes.find(type => type.value === formData.memoType)

  if (initialLoading) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={() => router.push(`/admin/memo/${params.id}`)} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Memo
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Memo</h1>
              <p className="text-gray-600">Modify memo details and resubmit</p>
            </div>
          </div>
        </div>

        {/* Edit Notice */}
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-900">Editing Mode</h3>
                <p className="text-sm text-yellow-700">
                  You are editing an existing memo. Changes will update the original memo and may require re-approval.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form - Exact same as create page */}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Memo Title *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter memo title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Memo Type *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={formData.memoType}
                    onChange={(e) => setFormData(prev => ({ ...prev, memoType: e.target.value as any }))}
                  >
                    {memoTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.value}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">{selectedMemoType?.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department *
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority *
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                    >
                      {priorities.map(priority => (
                        <option key={priority.value} value={priority.value}>{priority.value}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Required *
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={formData.dateRequired}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateRequired: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Purpose and Justification */}
            <Card>
              <CardHeader>
                <CardTitle>Purpose & Justification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purpose *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Brief purpose of this memo"
                    value={formData.purpose}
                    onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Justification *
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={4}
                    placeholder="Detailed justification for this request"
                    value={formData.justification}
                    onChange={(e) => setFormData(prev => ({ ...prev, justification: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Items Section */}
            {(['Purchase Request', 'Equipment Purchase', 'Service Request'].includes(formData.memoType)) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Items & Costs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add/Edit Item Form */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <h4 className="font-medium text-gray-900">Add/Edit Item</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Item description"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        value={currentItem.description || ''}
                        onChange={(e) => updateCurrentItem('description', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Vendor (optional)"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        value={currentItem.vendor || ''}
                        onChange={(e) => updateCurrentItem('vendor', e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Quantity"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        value={currentItem.quantity || ''}
                        onChange={(e) => updateCurrentItem('quantity', Number(e.target.value))}
                      />
                      <input
                        type="text"
                        placeholder="Unit"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        value={currentItem.unit || ''}
                        onChange={(e) => updateCurrentItem('unit', e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Unit cost (NGN)"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        value={currentItem.unitCost || ''}
                        onChange={(e) => updateCurrentItem('unitCost', Number(e.target.value))}
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          Total: {formatCurrency((currentItem.quantity || 1) * (currentItem.unitCost || 0))}
                        </span>
                        <Button onClick={addItem} size="sm">
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                    {currentItem.specifications !== undefined && (
                      <input
                        type="text"
                        placeholder="Specifications (optional)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        value={currentItem.specifications || ''}
                        onChange={(e) => updateCurrentItem('specifications', e.target.value)}
                      />
                    )}
                  </div>

                  {/* Items List */}
                  {formData.items.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Items ({formData.items.length})</h4>
                      <div className="space-y-2">
                        {formData.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium">{item.description}</div>
                              <div className="text-sm text-gray-500">
                                {item.quantity} {item.unit} × {formatCurrency(item.unitCost)} = {formatCurrency(item.totalCost)}
                                {item.vendor && ` | Vendor: ${item.vendor}`}
                              </div>
                              {item.specifications && (
                                <div className="text-xs text-gray-500 mt-1">{item.specifications}</div>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => editItem(item)}
                                className="text-blue-600 hover:bg-blue-50"
                              >
                                <FileText className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Funding Amount */}
            {(['Funding Request', 'Budget Approval', 'Travel Request'].includes(formData.memoType)) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Requested Amount
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount Requested (NGN) *
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter amount"
                      value={formData.requestedAmount || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, requestedAmount: Number(e.target.value) }))}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Summary Sidebar - Same as create page */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Memo Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{formData.memoType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Department:</span>
                    <span className="font-medium">{formData.department || 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Priority:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${priorities.find(p => p.value === formData.priority)?.color || ''}`}>
                      {formData.priority}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Date Required:</span>
                    <span className="font-medium">
                      {formData.dateRequired ? new Date(formData.dateRequired).toLocaleDateString() : 'Not set'}
                    </span>
                  </div>
                </div>

                <hr />

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">Total Amount</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(displayAmount)}
                  </div>
                  {formData.items.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {formData.items.length} item{formData.items.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                <hr />

                <div className="space-y-2">
                  <Button
                    onClick={() => handleSubmit('draft')}
                    variant="outline"
                    className="w-full"
                    disabled={isLoading}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Update Draft
                  </Button>
                  <Button
                    onClick={() => handleSubmit('submitted')}
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={isLoading}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Save & Resubmit
                  </Button>
                </div>

                {isLoading && (
                  <div className="text-center text-sm text-gray-500">
                    Processing...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}