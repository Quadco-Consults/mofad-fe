'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import {
  Package,
  RotateCcw,
  AlertTriangle,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  FileText,
  Plus,
  MapPin,
  DollarSign,
  Tag
} from 'lucide-react'

interface ReturnedItem {
  id: string
  returnNumber: string
  originalInvoice: string
  productName: string
  returnedBy: string
  returnedTo: string
  quantity: number
  unitPrice: number
  totalValue: number
  returnReason: string
  returnDate: string
  requestDate: string
  status: 'pending' | 'approved' | 'declined' | 'processed' | 'completed'
  condition: 'excellent' | 'good' | 'fair' | 'damaged'
  approvedBy?: string
  processedBy?: string
  notes: string
  refundAmount?: number
  restockable: boolean
}

const ReturnsPage = () => {
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [showProcessModal, setShowProcessModal] = useState(false)
  const [showAddReturnModal, setShowAddReturnModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ReturnedItem | null>(null)

  // Sample data for returned goods
  const returnedGoods: ReturnedItem[] = [
    {
      id: '1',
      returnNumber: 'RET-2024-001',
      originalInvoice: 'INV-2024-001',
      productName: 'Premium Motor Oil SAE 20W-50',
      returnedBy: 'Kano Filling Station',
      returnedTo: 'Main Warehouse',
      quantity: 5,
      unitPrice: 2500,
      totalValue: 12500,
      returnReason: 'Wrong specification ordered',
      returnDate: '2024-01-22',
      requestDate: '2024-01-21',
      status: 'completed',
      condition: 'excellent',
      approvedBy: 'Aminu Hassan',
      processedBy: 'Fatima Umar',
      notes: 'Products in original packaging, quality verified',
      refundAmount: 12500,
      restockable: true
    },
    {
      id: '2',
      returnNumber: 'RET-2024-002',
      originalInvoice: 'INV-2024-015',
      productName: 'Hydraulic Fluid AW46',
      returnedBy: 'Lubex Services Ltd',
      returnedTo: 'Zone A Warehouse',
      quantity: 3,
      unitPrice: 3200,
      totalValue: 9600,
      returnReason: 'Product defective - leaked containers',
      returnDate: '2024-01-23',
      requestDate: '2024-01-22',
      status: 'approved',
      condition: 'damaged',
      approvedBy: 'Musa Ibrahim',
      notes: 'Approved for return, supplier to be contacted',
      refundAmount: 9600,
      restockable: false
    },
    {
      id: '3',
      returnNumber: 'RET-2024-003',
      originalInvoice: 'INV-2024-020',
      productName: 'Gear Oil EP 90',
      returnedBy: 'Transit Motors',
      returnedTo: 'Lube Bay Storage',
      quantity: 10,
      unitPrice: 1800,
      totalValue: 18000,
      returnReason: 'Excess quantity delivered',
      returnDate: '',
      requestDate: '2024-01-24',
      status: 'pending',
      condition: 'good',
      notes: 'Customer has requested return of excess stock',
      restockable: true
    },
    {
      id: '4',
      returnNumber: 'RET-2024-004',
      originalInvoice: 'INV-2024-025',
      productName: 'Brake Fluid DOT 4',
      returnedBy: 'Auto Care Services',
      returnedTo: 'Main Warehouse',
      quantity: 2,
      unitPrice: 2200,
      totalValue: 4400,
      returnReason: 'Customer changed mind',
      returnDate: '',
      requestDate: '2024-01-25',
      status: 'declined',
      condition: 'fair',
      notes: 'Return declined - product opened and used partially',
      restockable: false
    }
  ]

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-blue-100 text-blue-700',
      declined: 'bg-red-100 text-red-700',
      processed: 'bg-green-100 text-green-700',
      completed: 'bg-green-100 text-green-700'
    }

    const statusIcons = {
      pending: <Clock className="w-3 h-3 mr-1" />,
      approved: <CheckCircle className="w-3 h-3 mr-1" />,
      declined: <XCircle className="w-3 h-3 mr-1" />,
      processed: <Package className="w-3 h-3 mr-1" />,
      completed: <CheckCircle className="w-3 h-3 mr-1" />
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${statusColors[status as keyof typeof statusColors]}`}>
        {statusIcons[status as keyof typeof statusIcons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getConditionBadge = (condition: string) => {
    const conditionColors = {
      excellent: 'bg-green-100 text-green-700',
      good: 'bg-blue-100 text-blue-700',
      fair: 'bg-yellow-100 text-yellow-700',
      damaged: 'bg-red-100 text-red-700'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${conditionColors[condition as keyof typeof conditionColors]}`}>
        {condition.charAt(0).toUpperCase() + condition.slice(1)}
      </span>
    )
  }

  const handleViewDetails = (item: ReturnedItem) => {
    setSelectedItem(item)
  }

  const handleApprove = (item: ReturnedItem) => {
    setSelectedItem(item)
    setShowApproveModal(true)
  }

  const handleDecline = (item: ReturnedItem) => {
    setSelectedItem(item)
    setShowDeclineModal(true)
  }

  const handleProcess = (item: ReturnedItem) => {
    setSelectedItem(item)
    setShowProcessModal(true)
  }

  const handleConfirmApprove = () => {
    if (selectedItem) {
      selectedItem.status = 'approved'
      selectedItem.approvedBy = 'Current User'
      setShowApproveModal(false)
      setSelectedItem(null)
    }
  }

  const handleConfirmDecline = () => {
    if (selectedItem) {
      selectedItem.status = 'declined'
      setShowDeclineModal(false)
      setSelectedItem(null)
    }
  }

  const handleConfirmProcess = () => {
    if (selectedItem) {
      selectedItem.status = 'completed'
      selectedItem.processedBy = 'Current User'
      selectedItem.returnDate = new Date().toISOString().split('T')[0]
      setShowProcessModal(false)
      setSelectedItem(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`
  }

  return (
    <AppLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Returned Goods Management</h1>
              <p className="text-gray-600">Track and manage product returns with approval workflows</p>
            </div>
            <button
              onClick={() => setShowAddReturnModal(true)}
              className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Return
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Returns</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {returnedGoods.filter(item => item.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved Returns</p>
                <p className="text-2xl font-bold text-blue-600">
                  {returnedGoods.filter(item => item.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Returns</p>
                <p className="text-2xl font-bold text-green-600">
                  {returnedGoods.filter(item => item.status === 'completed').length}
                </p>
              </div>
              <Package className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Refund Value</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(returnedGoods.reduce((sum, item) => sum + (item.refundAmount || 0), 0))}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Returns Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-orange-500 to-amber-500">
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Return Details</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Product & Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Return Reason</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white">Quantity & Value</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white">Condition</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {returnedGoods.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{item.returnNumber}</div>
                    <div className="text-sm text-gray-500">
                      <FileText className="w-3 h-3 inline mr-1" />
                      {item.originalInvoice}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      Requested: {item.requestDate}
                    </div>
                    {item.returnDate && (
                      <div className="text-xs text-gray-400">
                        <RotateCcw className="w-3 h-3 inline mr-1" />
                        Returned: {item.returnDate}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{item.productName}</div>
                    <div className="text-sm text-gray-500">
                      <User className="w-3 h-3 inline mr-1" />
                      {item.returnedBy}
                    </div>
                    <div className="text-xs text-gray-400">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      To: {item.returnedTo}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{item.returnReason}</div>
                    <div className="flex items-center mt-1">
                      <Tag className="w-3 h-3 text-gray-400 mr-1" />
                      <span className={`text-xs px-2 py-1 rounded ${
                        item.restockable
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {item.restockable ? 'Restockable' : 'Non-restockable'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-medium text-gray-900">{item.quantity} units</div>
                    <div className="text-sm text-gray-500">{formatCurrency(item.unitPrice)}/unit</div>
                    <div className="text-sm font-medium text-orange-600">
                      Total: {formatCurrency(item.totalValue)}
                    </div>
                    {item.refundAmount && (
                      <div className="text-xs text-green-600">
                        Refund: {formatCurrency(item.refundAmount)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getConditionBadge(item.condition)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(item)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {item.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(item)}
                            className="text-green-600 hover:text-green-800"
                            title="Approve Return"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDecline(item)}
                            className="text-red-600 hover:text-red-800"
                            title="Decline Return"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {item.status === 'approved' && (
                        <button
                          onClick={() => handleProcess(item)}
                          className="text-orange-600 hover:text-orange-800"
                          title="Process Return"
                        >
                          <Package className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Approve Modal */}
        {showApproveModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Approve Return Request</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to approve the return request for <strong>{selectedItem.productName}</strong>?
                This will allow the customer to return the items and process the refund.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Return Quantity:</span>
                    <div className="font-medium">{selectedItem.quantity} units</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Return Value:</span>
                    <div className="font-medium">{formatCurrency(selectedItem.totalValue)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Condition:</span>
                    <div className="font-medium">{selectedItem.condition}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Restockable:</span>
                    <div className="font-medium">{selectedItem.restockable ? 'Yes' : 'No'}</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowApproveModal(false)
                    setSelectedItem(null)
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmApprove}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Approve Return
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Decline Modal */}
        {showDeclineModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Decline Return Request</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to decline the return request for <strong>{selectedItem.productName}</strong>?
                Please provide a reason for declining this return.
              </p>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg mb-6"
                rows={3}
                placeholder="Enter reason for declining this return..."
              />
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowDeclineModal(false)
                    setSelectedItem(null)
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDecline}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Decline Return
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Process Modal */}
        {showProcessModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Process Return</h3>
              <p className="text-gray-600 mb-6">
                Mark this return as completed? This will process the refund and update inventory if the items are restockable.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Refund Amount:</span>
                    <span className="font-medium">{formatCurrency(selectedItem.totalValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Inventory Impact:</span>
                    <span className="font-medium">
                      {selectedItem.restockable ? `+${selectedItem.quantity} units` : 'No change'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowProcessModal(false)
                    setSelectedItem(null)
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmProcess}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Complete Return
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Return Modal */}
        {showAddReturnModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Add New Return</h3>
                <button
                  onClick={() => setShowAddReturnModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Original Invoice Number
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="INV-2024-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer/Supplier
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="Enter customer or supplier name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Return Quantity
                    </label>
                    <input
                      type="number"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit Price
                    </label>
                    <input
                      type="number"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Condition
                    </label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg">
                      <option value="">Select condition</option>
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="damaged">Damaged</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Return Reason
                  </label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg">
                    <option value="">Select reason</option>
                    <option value="defective">Product defective</option>
                    <option value="wrong-item">Wrong item delivered</option>
                    <option value="excess-quantity">Excess quantity</option>
                    <option value="changed-mind">Customer changed mind</option>
                    <option value="damaged-delivery">Damaged during delivery</option>
                    <option value="expired">Product expired</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Return Location
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="Enter return location"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="restockable"
                      className="h-4 w-4 text-orange-600 border-gray-300 rounded"
                    />
                    <label htmlFor="restockable" className="ml-2 text-sm text-gray-700">
                      Items can be restocked
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="Enter any additional notes about this return..."
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowAddReturnModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    Create Return Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default ReturnsPage