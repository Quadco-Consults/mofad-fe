'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  ArrowLeft,
  Save,
  Send,
  Plus,
  Trash2,
  ClipboardPenLine,
  Package,
  User,
  Building,
  Calendar,
  AlertTriangle,
  Box,
  Coffee,
  Search,
} from 'lucide-react'

// Requisition interfaces
interface RequisitionItem {
  id: number
  itemName: string
  itemType: 'Asset' | 'Consumable'
  category: string
  quantity: number
  unit: string
  estimatedCost: number
  urgency: 'Low' | 'Medium' | 'High' | 'Critical'
  justification: string
}

interface RequisitionFormData {
  title: string
  department: string
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  requiredDate: string
  purpose: string
  businessJustification: string
  items: RequisitionItem[]
}

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
  { value: 'Low', color: 'bg-green-100 text-green-800', description: 'Standard processing timeline' },
  { value: 'Medium', color: 'bg-yellow-100 text-yellow-800', description: 'Moderate priority' },
  { value: 'High', color: 'bg-orange-100 text-orange-800', description: 'High priority - expedite processing' },
  { value: 'Critical', color: 'bg-red-100 text-red-800', description: 'Urgent - immediate attention required' },
]

// Sample items that can be requested
const availableItems = {
  Asset: [
    { name: 'Dell OptiPlex Desktop Computer', category: 'Computer Equipment', unit: 'Unit', estimatedCost: 450000 },
    { name: 'HP Laptop ProBook', category: 'Computer Equipment', unit: 'Unit', estimatedCost: 380000 },
    { name: 'Samsung Monitor 27"', category: 'Computer Equipment', unit: 'Unit', estimatedCost: 95000 },
    { name: 'Executive Office Chair', category: 'Office Furniture', unit: 'Unit', estimatedCost: 85000 },
    { name: 'Conference Table', category: 'Office Furniture', unit: 'Unit', estimatedCost: 320000 },
    { name: 'Filing Cabinet', category: 'Office Furniture', unit: 'Unit', estimatedCost: 65000 },
    { name: 'Toyota Camry 2020', category: 'Vehicles', unit: 'Unit', estimatedCost: 8500000 },
    { name: 'Generator Set 15KVA', category: 'Machinery', unit: 'Unit', estimatedCost: 750000 },
    { name: 'Air Conditioning Unit', category: 'HVAC Equipment', unit: 'Unit', estimatedCost: 280000 },
    { name: 'Security Camera System', category: 'Security Equipment', unit: 'Set', estimatedCost: 150000 },
  ],
  Consumable: [
    { name: 'A4 Copy Paper', category: 'Office Supplies', unit: 'Ream', estimatedCost: 3500 },
    { name: 'Black Ink Cartridge (HP)', category: 'Printing Materials', unit: 'Piece', estimatedCost: 8500 },
    { name: 'Blue Ballpoint Pens', category: 'Stationery', unit: 'Box', estimatedCost: 2800 },
    { name: 'Toilet Paper', category: 'Cleaning Supplies', unit: 'Pack', estimatedCost: 1800 },
    { name: 'Hand Sanitizer (500ml)', category: 'Cleaning Supplies', unit: 'Bottle', estimatedCost: 2500 },
    { name: 'Coffee (Instant)', category: 'Kitchen Supplies', unit: 'Tin', estimatedCost: 4500 },
    { name: 'Tea Bags', category: 'Kitchen Supplies', unit: 'Box', estimatedCost: 3200 },
    { name: 'Disposable Cups', category: 'Kitchen Supplies', unit: 'Pack', estimatedCost: 1500 },
    { name: 'Whiteboard Markers', category: 'Stationery', unit: 'Set', estimatedCost: 4500 },
    { name: 'Stapler Pins', category: 'Stationery', unit: 'Box', estimatedCost: 1200 },
    { name: 'USB Flash Drive (16GB)', category: 'IT Consumables', unit: 'Piece', estimatedCost: 5500 },
    { name: 'Ethernet Cables (Cat6)', category: 'IT Consumables', unit: 'Piece', estimatedCost: 2800 },
  ]
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function CreateRequisitionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState<RequisitionFormData>({
    title: '',
    department: '',
    priority: 'Medium',
    requiredDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 2 weeks from now
    purpose: '',
    businessJustification: '',
    items: []
  })

  const [currentItem, setCurrentItem] = useState<Partial<RequisitionItem>>({
    itemName: '',
    itemType: 'Consumable',
    category: '',
    quantity: 1,
    unit: 'Unit',
    estimatedCost: 0,
    urgency: 'Medium',
    justification: ''
  })

  const [showItemSearch, setShowItemSearch] = useState(false)
  const [itemSearchTerm, setItemSearchTerm] = useState('')

  // Calculate totals
  const totalEstimatedCost = formData.items.reduce((sum, item) => sum + (item.quantity * item.estimatedCost), 0)

  // Filter available items based on search
  const filteredItems = itemSearchTerm
    ? availableItems[currentItem.itemType as 'Asset' | 'Consumable'].filter(item =>
        item.name.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(itemSearchTerm.toLowerCase())
      )
    : availableItems[currentItem.itemType as 'Asset' | 'Consumable']

  const selectItem = (item: any) => {
    setCurrentItem(prev => ({
      ...prev,
      itemName: item.name,
      category: item.category,
      unit: item.unit,
      estimatedCost: item.estimatedCost
    }))
    setShowItemSearch(false)
    setItemSearchTerm('')
  }

  const addItem = () => {
    if (!currentItem.itemName || !currentItem.quantity || !currentItem.justification) {
      alert('Please fill in item name, quantity, and justification')
      return
    }

    const newItem: RequisitionItem = {
      id: Date.now(),
      itemName: currentItem.itemName!,
      itemType: currentItem.itemType as 'Asset' | 'Consumable',
      category: currentItem.category!,
      quantity: currentItem.quantity!,
      unit: currentItem.unit!,
      estimatedCost: currentItem.estimatedCost!,
      urgency: currentItem.urgency as 'Low' | 'Medium' | 'High' | 'Critical',
      justification: currentItem.justification!
    }

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))

    // Reset current item
    setCurrentItem({
      itemName: '',
      itemType: 'Consumable',
      category: '',
      quantity: 1,
      unit: 'Unit',
      estimatedCost: 0,
      urgency: 'Medium',
      justification: ''
    })
  }

  const removeItem = (id: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }))
  }

  const handleSubmit = async (status: 'draft' | 'submitted') => {
    if (!formData.title || !formData.department || !formData.purpose || !formData.businessJustification) {
      alert('Please fill in all required fields')
      return
    }

    if (formData.items.length === 0) {
      alert('Please add at least one item to the requisition')
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // In a real app, this would be an API call to save the requisition
      const requisitionData = {
        ...formData,
        id: Date.now(),
        requisitionNumber: `REQ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`,
        requestedBy: 'Current User', // In real app, get from auth context
        requestDate: new Date().toISOString().split('T')[0],
        status,
        totalEstimatedCost,
        comments: []
      }

      console.log('Requisition created:', requisitionData)

      // Show success message
      alert(`Requisition ${status === 'draft' ? 'saved as draft' : 'submitted'} successfully!`)

      // Navigate back to requisitions list
      router.push('/admin/inventory-management/requisitions')

    } catch (error) {
      console.error('Error creating requisition:', error)
      alert('Failed to create requisition')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={() => router.push('/admin/inventory-management/requisitions')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Requisitions
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Item Requisition</h1>
              <p className="text-gray-600">Request assets and consumables for your department</p>
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
                  <ClipboardPenLine className="w-5 h-5" />
                  Requisition Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requisition Title *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Brief title for this requisition"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
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
                    Required Date *
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={formData.requiredDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, requiredDate: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purpose *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Brief purpose of this requisition"
                    value={formData.purpose}
                    onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Justification *
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={4}
                    placeholder="Explain why these items are needed and how they will benefit the organization"
                    value={formData.businessJustification}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessJustification: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Items Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Requested Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Item Form */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <h4 className="font-medium text-gray-900">Add Item</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Item Type</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        value={currentItem.itemType}
                        onChange={(e) => setCurrentItem(prev => ({ ...prev, itemType: e.target.value as 'Asset' | 'Consumable', itemName: '', category: '', estimatedCost: 0 }))}
                      >
                        <option value="Consumable">Consumable</option>
                        <option value="Asset">Asset</option>
                      </select>
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search or enter item name"
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          value={currentItem.itemName || ''}
                          onChange={(e) => {
                            setCurrentItem(prev => ({ ...prev, itemName: e.target.value }))
                            setItemSearchTerm(e.target.value)
                            setShowItemSearch(e.target.value.length > 0)
                          }}
                          onFocus={() => setShowItemSearch(true)}
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>

                      {/* Item Search Dropdown */}
                      {showItemSearch && filteredItems.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredItems.slice(0, 10).map((item, index) => (
                            <div
                              key={index}
                              className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              onClick={() => selectItem(item)}
                            >
                              <div className="font-medium text-sm">{item.name}</div>
                              <div className="text-xs text-gray-500">{item.category} • {formatCurrency(item.estimatedCost)} per {item.unit}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="Quantity"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        value={currentItem.quantity || ''}
                        onChange={(e) => setCurrentItem(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                      <input
                        type="text"
                        placeholder="Unit"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        value={currentItem.unit || ''}
                        onChange={(e) => setCurrentItem(prev => ({ ...prev, unit: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost (per unit)</label>
                      <input
                        type="number"
                        placeholder="Cost in NGN"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        value={currentItem.estimatedCost || ''}
                        onChange={(e) => setCurrentItem(prev => ({ ...prev, estimatedCost: Number(e.target.value) }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Item Urgency</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        value={currentItem.urgency}
                        onChange={(e) => setCurrentItem(prev => ({ ...prev, urgency: e.target.value as any }))}
                      >
                        {priorities.map(priority => (
                          <option key={priority.value} value={priority.value}>{priority.value}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Justification</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      rows={2}
                      placeholder="Why do you need this specific item?"
                      value={currentItem.justification || ''}
                      onChange={(e) => setCurrentItem(prev => ({ ...prev, justification: e.target.value }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">
                      Total: {formatCurrency((currentItem.quantity || 0) * (currentItem.estimatedCost || 0))}
                    </div>
                    <Button onClick={addItem} size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Item
                    </Button>
                  </div>
                </div>

                {/* Items List */}
                {formData.items.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Items ({formData.items.length})</h4>
                    <div className="space-y-2">
                      {formData.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {item.itemType === 'Asset' ? <Box className="w-4 h-4 text-gray-500" /> : <Coffee className="w-4 h-4 text-gray-500" />}
                              <div className="font-medium">{item.itemName}</div>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${priorities.find(p => p.value === item.urgency)?.color || ''}`}>
                                {item.urgency}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {item.quantity} {item.unit} × {formatCurrency(item.estimatedCost)} = {formatCurrency(item.quantity * item.estimatedCost)}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              <strong>Category:</strong> {item.category} | <strong>Justification:</strong> {item.justification}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Requisition Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
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
                    <span className="text-gray-600">Required Date:</span>
                    <span className="font-medium">
                      {formData.requiredDate ? new Date(formData.requiredDate).toLocaleDateString() : 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-medium">{formData.items.length}</span>
                  </div>
                </div>

                <hr />

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">Total Estimated Cost</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalEstimatedCost)}
                  </div>
                  {formData.items.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      Average: {formatCurrency(totalEstimatedCost / formData.items.length)} per item
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
                    Save as Draft
                  </Button>
                  <Button
                    onClick={() => handleSubmit('submitted')}
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={isLoading}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Requisition
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