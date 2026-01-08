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
  MessageSquare,
  List,
} from 'lucide-react'

// Memo interfaces
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
  memoType: 'Purchase Request' | 'Funding Request' | 'Budget Approval' | 'Travel Request' | 'Equipment Purchase' | 'Service Request' | 'Policy Memo' | 'Announcement' | 'General Request' | 'Approval Request'
  department: string
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  dateRequired: string
  purpose: string
  justification: string
  requestedAmount?: number
  items: MemoItem[]
  hasItems: boolean // New field to determine if memo requires itemization
  memoContent?: string // For text-only memos
}

const memoTypes = [
  // Itemized memos (require items/amounts)
  { value: 'Purchase Request', icon: ShoppingCart, description: 'Request for purchasing goods or services', requiresItems: true },
  { value: 'Equipment Purchase', icon: Building, description: 'Specific equipment or asset purchase request', requiresItems: true },
  { value: 'Funding Request', icon: CreditCard, description: 'Request for funding or budget allocation', requiresItems: false },
  { value: 'Budget Approval', icon: DollarSign, description: 'Request for budget approval or revision', requiresItems: false },
  { value: 'Travel Request', icon: Plane, description: 'Business travel authorization request', requiresItems: false },
  { value: 'Service Request', icon: Briefcase, description: 'External service or contractor request', requiresItems: false },

  // Text-only memos
  { value: 'Policy Memo', icon: FileText, description: 'Policy updates, announcements, or directives', requiresItems: false },
  { value: 'Announcement', icon: MessageSquare, description: 'General announcements or notifications', requiresItems: false },
  { value: 'General Request', icon: User, description: 'General requests or inquiries', requiresItems: false },
  { value: 'Approval Request', icon: AlertTriangle, description: 'Seeking approval for plans or actions', requiresItems: false },
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

export default function CreateMemoPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState<MemoFormData>({
    title: '',
    memoType: 'General Request',
    department: '',
    priority: 'Medium',
    dateRequired: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 1 week from now
    purpose: '',
    justification: '',
    items: [],
    hasItems: false,
    memoContent: ''
  })

  // Get selected memo type info
  const selectedMemoType = memoTypes.find(type => type.value === formData.memoType)

  const handleInputChange = (field: keyof MemoFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleMemoTypeChange = (memoType: string) => {
    const selectedType = memoTypes.find(type => type.value === memoType)
    setFormData(prev => ({
      ...prev,
      memoType: memoType as MemoFormData['memoType'],
      hasItems: false, // Reset to false, let user choose
      items: [], // Clear items when changing type
      requestedAmount: undefined
    }))
  }

  const addItem = () => {
    const newItem: MemoItem = {
      id: Date.now(),
      description: '',
      quantity: 1,
      unit: 'Unit',
      unitCost: 0,
      totalCost: 0,
      specifications: ''
    }
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
  }

  const updateItem = (id: number, field: keyof MemoItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          // Recalculate total cost when quantity or unit cost changes
          if (field === 'quantity' || field === 'unitCost') {
            updatedItem.totalCost = (updatedItem.quantity || 0) * updatedItem.unitCost
          }
          return updatedItem
        }
        return item
      })
    }))
  }

  const removeItem = (id: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }))
  }

  const calculateTotal = () => {
    if (formData.hasItems) {
      return formData.items.reduce((sum, item) => sum + item.totalCost, 0)
    }
    return formData.requestedAmount || 0
  }

  const handleSave = async (isDraft: boolean = true) => {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const memoData = {
        ...formData,
        totalAmount: calculateTotal(),
        status: isDraft ? 'Draft' : 'Submitted',
        dateCreated: new Date().toISOString().split('T')[0],
        id: Date.now() // Mock ID
      }

      console.log('Memo saved:', memoData)

      if (isDraft) {
        alert('Memo saved as draft successfully!')
      } else {
        alert('Memo submitted successfully!')
      }

      router.push('/admin/memo')
    } catch (error) {
      alert('Error saving memo. Please try again.')
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = () => {
    const basicFields = formData.title && formData.department && formData.purpose

    if (formData.hasItems) {
      return basicFields && formData.items.length > 0 && formData.items.every(item =>
        item.description && item.quantity && item.unitCost
      )
    } else {
      // For text-only memos, check if content is provided
      const hasContent = formData.memoContent || formData.justification
      return basicFields && hasContent
    }
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 via-white to-blue-50 rounded-2xl shadow-sm border border-blue-100 p-6 md:p-8">
          <div className="flex items-center gap-4 mb-6">
            <Button onClick={() => router.push('/admin/memo')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Memos
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-2xl shadow-lg ring-1 ring-blue-100">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">Create New Memo</h1>
              <p className="text-gray-600 flex items-center">
                <Building className="h-4 w-4 mr-2 text-blue-500" />
                MOFAD Energy Solutions Limited - Internal Memorandum
              </p>
            </div>
          </div>
        </div>

        {/* Memo Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Memo Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Memo Title / Subject *
                </label>
                <input
                  type="text"
                  placeholder="Enter memo title or subject"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Memo Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Memo Type *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {memoTypes.map((type) => {
                  const Icon = type.icon
                  const isSelected = formData.memoType === type.value

                  return (
                    <div
                      key={type.value}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                      onClick={() => handleMemoTypeChange(type.value)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                        <span className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                          {type.value}
                        </span>
                      </div>
                      <p className={`text-sm ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                        {type.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Priority and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority *
                </label>
                <div className="space-y-2">
                  {priorities.map(priority => (
                    <label key={priority.value} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="priority"
                        value={priority.value}
                        checked={formData.priority === priority.value}
                        onChange={(e) => handleInputChange('priority', e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${priority.color}`}>
                        {priority.value}
                      </span>
                      <span className="text-sm text-gray-600">{priority.description}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Date *
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.dateRequired}
                  onChange={(e) => handleInputChange('dateRequired', e.target.value)}
                />
              </div>
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purpose *
              </label>
              <input
                type="text"
                placeholder="Brief purpose of this memo"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.purpose}
                onChange={(e) => handleInputChange('purpose', e.target.value)}
              />
            </div>

            {/* Content Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Memo Format
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    !formData.hasItems
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleInputChange('hasItems', false)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <MessageSquare className={`w-5 h-5 ${!formData.hasItems ? 'text-blue-600' : 'text-gray-600'}`} />
                    <span className={`font-medium ${!formData.hasItems ? 'text-blue-900' : 'text-gray-900'}`}>
                      Text-Only Memo
                    </span>
                  </div>
                  <p className={`text-sm ${!formData.hasItems ? 'text-blue-700' : 'text-gray-600'}`}>
                    Simple memo with text content only (announcements, policy updates, general requests)
                  </p>
                </div>

                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.hasItems
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleInputChange('hasItems', true)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <List className={`w-5 h-5 ${formData.hasItems ? 'text-blue-600' : 'text-gray-600'}`} />
                    <span className={`font-medium ${formData.hasItems ? 'text-blue-900' : 'text-gray-900'}`}>
                      Itemized Memo
                    </span>
                  </div>
                  <p className={`text-sm ${formData.hasItems ? 'text-blue-700' : 'text-gray-600'}`}>
                    Memo with detailed item list and costs (purchase requests, equipment requests)
                  </p>
                </div>
              </div>
            </div>

            {/* Content Section */}
            {!formData.hasItems ? (
              // Text-only memo content
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Memo Content *
                </label>
                <textarea
                  placeholder="Enter the full content of your memo here. Describe your request, announcement, or information in detail..."
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  value={formData.memoContent}
                  onChange={(e) => handleInputChange('memoContent', e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Provide detailed information about your request or announcement. This will be the main body of your memo.
                </p>
              </div>
            ) : (
              // Itemized memo content
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Justification
                  </label>
                  <textarea
                    placeholder="Provide justification for this request"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    value={formData.justification}
                    onChange={(e) => handleInputChange('justification', e.target.value)}
                  />
                </div>

                {/* Items Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Items / Services *
                    </label>
                    <Button onClick={addItem} variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </div>

                  {formData.items.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">No items added yet</p>
                      <p className="text-gray-500 text-sm">Click "Add Item" to start adding items to your request</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.items.map((item, index) => (
                        <Card key={item.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-4">
                              <h4 className="font-medium text-gray-900">Item {index + 1}</h4>
                              <Button
                                onClick={() => removeItem(item.id)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                                <input
                                  type="text"
                                  placeholder="Item description"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  value={item.description}
                                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                                <input
                                  type="number"
                                  min="1"
                                  placeholder="Qty"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  value={item.quantity || ''}
                                  onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                <select
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                  value={item.unit}
                                  onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                                >
                                  <option value="Unit">Unit</option>
                                  <option value="Box">Box</option>
                                  <option value="Pack">Pack</option>
                                  <option value="Carton">Carton</option>
                                  <option value="Set">Set</option>
                                  <option value="Piece">Piece</option>
                                  <option value="Ream">Ream</option>
                                  <option value="Roll">Roll</option>
                                  <option value="Service">Service</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost (₦) *</label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="0.00"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  value={item.unitCost || ''}
                                  onChange={(e) => updateItem(item.id, 'unitCost', parseFloat(e.target.value) || 0)}
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost</label>
                                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-medium">
                                  {formatCurrency(item.totalCost)}
                                </div>
                              </div>

                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Specifications</label>
                                <textarea
                                  placeholder="Technical specifications or additional details"
                                  rows={2}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                  value={item.specifications}
                                  onChange={(e) => updateItem(item.id, 'specifications', e.target.value)}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {/* Total Summary */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-blue-900">Total Amount:</span>
                          <span className="text-2xl font-bold text-blue-900">{formatCurrency(calculateTotal())}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Amount for non-itemized memos */}
            {!formData.hasItems && ['Funding Request', 'Budget Approval', 'Travel Request'].includes(formData.memoType) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requested Amount (₦)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter amount if applicable"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.requestedAmount || ''}
                  onChange={(e) => handleInputChange('requestedAmount', parseFloat(e.target.value) || undefined)}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <Button
                onClick={() => handleSave(true)}
                variant="outline"
                disabled={isLoading || !formData.title || !formData.department}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save as Draft'}
              </Button>

              <Button
                onClick={() => handleSave(false)}
                disabled={isLoading || !isFormValid()}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {isLoading ? 'Submitting...' : 'Submit for Review'}
              </Button>
            </div>

            {/* Form Validation Info */}
            {!isFormValid() && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-yellow-800 font-medium">Please complete all required fields:</p>
                    <ul className="text-yellow-700 text-sm mt-2 space-y-1">
                      {!formData.title && <li>• Memo title is required</li>}
                      {!formData.department && <li>• Department selection is required</li>}
                      {!formData.purpose && <li>• Purpose is required</li>}
                      {formData.hasItems && formData.items.length === 0 && <li>• At least one item is required for itemized memos</li>}
                      {!formData.hasItems && !formData.memoContent && <li>• Memo content is required for text-only memos</li>}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}