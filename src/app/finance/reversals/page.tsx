'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Eye, CheckCircle, XCircle, Plus, FileText, Download, RotateCcw, DollarSign, Calendar, User } from 'lucide-react'

interface ReversalRecord {
  id: string
  reversalNumber: string
  originalTransactionId: string
  transactionType: string
  customerName: string
  amount: number
  reason: string
  status: 'pending' | 'approved' | 'declined'
  requestedBy: string
  requestedDate: string
  prfNumber?: string
  description: string
}

export default function ReversalsPage() {
  const [selectedItem, setSelectedItem] = useState<ReversalRecord | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPRFModal, setShowPRFModal] = useState(false)

  // Mock data matching MOFAD design
  const mockReversals: ReversalRecord[] = [
    {
      id: 'R001',
      reversalNumber: 'REV-2024-001',
      originalTransactionId: 'TXN-20240115-001',
      transactionType: 'Fuel Sale',
      customerName: 'Kano Express Transport',
      amount: 450000,
      reason: 'Product quality issue',
      status: 'pending',
      requestedBy: 'Sarah Okafor',
      requestedDate: '2024-01-22',
      description: 'Customer reported contaminated fuel, requesting full refund'
    },
    {
      id: 'R002',
      reversalNumber: 'REV-2024-002',
      originalTransactionId: 'TXN-20240120-003',
      transactionType: 'Lubricant Sale',
      customerName: 'Kaduna Machinery Ltd',
      amount: 125000,
      reason: 'Wrong product delivered',
      status: 'pending',
      requestedBy: 'Ahmed Musa',
      requestedDate: '2024-01-21',
      description: 'Customer received SAE 20W-50 instead of SAE 15W-40 as ordered'
    },
    {
      id: 'R003',
      reversalNumber: 'REV-2024-003',
      originalTransactionId: 'TXN-20240118-007',
      transactionType: 'Fuel Sale',
      customerName: 'Northern Logistics',
      amount: 850000,
      reason: 'Overcharge error',
      status: 'approved',
      requestedBy: 'Fatima Ibrahim',
      requestedDate: '2024-01-19',
      prfNumber: 'PRF-2024-003',
      description: 'Billing error resulted in customer being charged for premium instead of regular fuel'
    },
    {
      id: 'R004',
      reversalNumber: 'REV-2024-004',
      originalTransactionId: 'TXN-20240112-012',
      transactionType: 'Service Charge',
      customerName: 'Abuja Transport Co.',
      amount: 75000,
      reason: 'Duplicate charge',
      status: 'declined',
      requestedBy: 'Ibrahim Hassan',
      requestedDate: '2024-01-15',
      description: 'Customer claims duplicate service charge, investigation showed legitimate charges'
    }
  ]

  const handleSuccess = () => {
    if (selectedItem) {
      selectedItem.status = 'approved'
      // Generate PRF number upon approval
      selectedItem.prfNumber = `PRF-2024-${selectedItem.id.slice(-3)}`
      setShowSuccessModal(false)
      setSelectedItem(null)
    }
  }

  const handleDecline = () => {
    if (selectedItem) {
      selectedItem.status = 'declined'
      setShowDeclineModal(false)
      setSelectedItem(null)
    }
  }

  const generatePRF = (reversal: ReversalRecord) => {
    // Simulate PRF generation
    setSelectedItem(reversal)
    setShowPRFModal(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>
      case 'approved':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Approved</span>
      case 'declined':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Declined</span>
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>
    }
  }

  const getTransactionTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'fuel sale':
        return 'bg-blue-100 text-blue-800'
      case 'lubricant sale':
        return 'bg-green-100 text-green-800'
      case 'service charge':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header with MOFAD branding */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reversal Management</h1>
            <p className="text-gray-600">Manage transaction reversals and generate payment request forms</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Reversal Request
          </button>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-orange-500 to-amber-500">
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Reversal Number</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Original Transaction</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Type</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Reason</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Requested By</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockReversals.map((reversal, index) => (
                <tr key={reversal.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{reversal.reversalNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{reversal.originalTransactionId}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{reversal.customerName}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(reversal.transactionType)}`}>
                      <RotateCcw className="w-3 h-3 mr-1" />
                      {reversal.transactionType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                    ₦{reversal.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{reversal.reason}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{reversal.requestedBy}</div>
                      <div className="text-gray-500">{reversal.requestedDate}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(reversal.status)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 p-1">
                        <Eye className="h-4 w-4" />
                      </button>
                      {reversal.status === 'pending' && (
                        <>
                          <button
                            onClick={() => { setSelectedItem(reversal); setShowSuccessModal(true) }}
                            className="text-green-600 hover:text-green-800 p-1"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => { setSelectedItem(reversal); setShowDeclineModal(true) }}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {reversal.status === 'approved' && reversal.prfNumber && (
                        <button
                          onClick={() => generatePRF(reversal)}
                          className="text-purple-600 hover:text-purple-800 p-1"
                          title="Generate PRF"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="text-center">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Approval</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to approve this reversal request? A PRF will be generated automatically.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSuccess}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Approve & Generate PRF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Decline Modal */}
        {showDeclineModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="text-center">
                <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Decline</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to decline this reversal request?
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowDeclineModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDecline}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRF Generation Modal */}
        {showPRFModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Payment Request Form (PRF)</h3>
                <button
                  onClick={() => setShowPRFModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <div className="text-center border-b pb-4">
                  <h2 className="text-xl font-bold text-gray-900">MOFAD ENERGY SOLUTIONS LIMITED</h2>
                  <p className="text-gray-600">Payment Request Form</p>
                  <p className="text-sm text-gray-500">PRF Number: {selectedItem.prfNumber}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Request Details</h4>
                    <div className="space-y-2">
                      <p><span className="font-medium">Reversal Number:</span> {selectedItem.reversalNumber}</p>
                      <p><span className="font-medium">Original Transaction:</span> {selectedItem.originalTransactionId}</p>
                      <p><span className="font-medium">Transaction Type:</span> {selectedItem.transactionType}</p>
                      <p><span className="font-medium">Request Date:</span> {selectedItem.requestedDate}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
                    <div className="space-y-2">
                      <p><span className="font-medium">Customer Name:</span> {selectedItem.customerName}</p>
                      <p><span className="font-medium">Amount:</span> ₦{selectedItem.amount.toLocaleString()}</p>
                      <p><span className="font-medium">Requested By:</span> {selectedItem.requestedBy}</p>
                      <p><span className="font-medium">Reason:</span> {selectedItem.reason}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
                  <p className="text-gray-700 bg-white p-3 rounded border">{selectedItem.description}</p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Approval Section</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Prepared By</p>
                      <div className="mt-2 border-b border-gray-400 pb-1">
                        <p className="font-medium">{selectedItem.requestedBy}</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Approved By</p>
                      <div className="mt-2 border-b border-gray-400 pb-1">
                        <p className="font-medium">_________________</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Date</p>
                      <div className="mt-2 border-b border-gray-400 pb-1">
                        <p className="font-medium">{new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => setShowPRFModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Print PRF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add New Reversal Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">New Reversal Request</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Original Transaction ID</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <option value="">Select Type</option>
                      <option value="Fuel Sale">Fuel Sale</option>
                      <option value="Lubricant Sale">Lubricant Sale</option>
                      <option value="Service Charge">Service Charge</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reversal Reason</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <option value="">Select Reason</option>
                      <option value="Product quality issue">Product quality issue</option>
                      <option value="Wrong product delivered">Wrong product delivered</option>
                      <option value="Overcharge error">Overcharge error</option>
                      <option value="Duplicate charge">Duplicate charge</option>
                      <option value="Customer complaint">Customer complaint</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Requested Date</label>
                    <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Provide detailed description of the reversal request..."
                  ></textarea>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600"
                  >
                    Submit Reversal Request
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