'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Eye, CheckCircle, XCircle, Plus, AlertTriangle, Wrench, Package, Truck, Building } from 'lucide-react'

interface DamageRecord {
  id: string
  reportNumber: string
  category: string
  damageType: string
  location: string
  facility: string
  severity: string
  status: 'pending' | 'approved' | 'declined'
  estimatedCost: number
  reportedBy: string
  reportedDate: string
  description: string
}

export default function DamagesPage() {
  const [selectedItem, setSelectedItem] = useState<DamageRecord | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  // Mock data matching MOFAD design
  const mockDamages: DamageRecord[] = [
    {
      id: 'D001',
      reportNumber: 'DMG-2024-001',
      category: 'Equipment',
      damageType: 'Pump Motor Failure',
      location: 'Fuel Pump Station 3',
      facility: 'MOFAD Main Depot',
      severity: 'Major',
      status: 'pending',
      estimatedCost: 1250000,
      reportedBy: 'Ahmed Musa',
      reportedDate: '2024-01-20',
      description: 'Primary fuel pump motor seized during operation'
    },
    {
      id: 'D002',
      reportNumber: 'DMG-2024-002',
      category: 'Vehicle',
      damageType: 'Vehicle Accident',
      location: 'Lagos-Ibadan Expressway KM 45',
      facility: 'Transport Operations',
      severity: 'Critical',
      status: 'pending',
      estimatedCost: 2800000,
      reportedBy: 'Ibrahim Hassan',
      reportedDate: '2024-01-22',
      description: 'Fuel tanker truck involved in collision'
    },
    {
      id: 'D003',
      reportNumber: 'DMG-2024-003',
      category: 'Facility',
      damageType: 'Structural Damage',
      location: 'Storage Tank Foundation',
      facility: 'MOFAD Terminal 2',
      severity: 'Moderate',
      status: 'approved',
      estimatedCost: 850000,
      reportedBy: 'Sarah Okafor',
      reportedDate: '2024-01-10',
      description: 'Cracks discovered in storage tank foundation'
    },
    {
      id: 'D004',
      reportNumber: 'DMG-2024-004',
      category: 'Product',
      damageType: 'Product Contamination',
      location: 'Storage Tank 7',
      facility: 'MOFAD Distribution Center',
      severity: 'Major',
      status: 'declined',
      estimatedCost: 1650000,
      reportedBy: 'Emeka Okafor',
      reportedDate: '2024-01-05',
      description: 'Water contamination detected in premium motor spirit'
    }
  ]

  const handleSuccess = () => {
    if (selectedItem) {
      selectedItem.status = 'approved'
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

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'text-red-600 font-semibold'
      case 'major':
        return 'text-orange-600 font-semibold'
      case 'moderate':
        return 'text-yellow-600 font-semibold'
      case 'minor':
        return 'text-green-600 font-semibold'
      default:
        return 'text-gray-600'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'equipment':
        return <Wrench className="w-3 h-3 mr-1" />
      case 'vehicle':
        return <Truck className="w-3 h-3 mr-1" />
      case 'facility':
        return <Building className="w-3 h-3 mr-1" />
      case 'product':
        return <Package className="w-3 h-3 mr-1" />
      default:
        return <AlertTriangle className="w-3 h-3 mr-1" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'equipment':
        return 'bg-blue-100 text-blue-800'
      case 'vehicle':
        return 'bg-green-100 text-green-800'
      case 'facility':
        return 'bg-purple-100 text-purple-800'
      case 'product':
        return 'bg-orange-100 text-orange-800'
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
            <h1 className="text-2xl font-bold text-gray-900">Damages Management</h1>
            <p className="text-gray-600">Monitor and manage equipment, vehicle and facility damages</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Damage
          </button>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-orange-500 to-amber-500">
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Report Number</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Damage Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Location</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Severity</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white">Estimated Cost</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Reported By</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockDamages.map((damage, index) => (
                <tr key={damage.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 text-sm text-gray-900">{damage.reportNumber}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(damage.category)}`}>
                      {getCategoryIcon(damage.category)}
                      {damage.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{damage.damageType}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{damage.location}</div>
                      <div className="text-gray-500">{damage.facility}</div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-sm ${getSeverityColor(damage.severity)}`}>
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      {damage.severity}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                    ₦{damage.estimatedCost.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{damage.reportedBy}</div>
                      <div className="text-gray-500">{damage.reportedDate}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(damage.status)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 p-1">
                        <Eye className="h-4 w-4" />
                      </button>
                      {damage.status === 'pending' && (
                        <>
                          <button
                            onClick={() => { setSelectedItem(damage); setShowSuccessModal(true) }}
                            className="text-green-600 hover:text-green-800 p-1"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => { setSelectedItem(damage); setShowDeclineModal(true) }}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
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
                  Are you sure you want to approve this damage report?
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
                    Approve
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
                  Are you sure you want to decline this damage report?
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

        {/* Add New Damage Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Add New Damage Report</h3>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <option value="">Select Category</option>
                      <option value="equipment">Equipment</option>
                      <option value="vehicle">Vehicle</option>
                      <option value="facility">Facility</option>
                      <option value="product">Product</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Damage Type</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facility</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <option value="">Select Severity</option>
                      <option value="Minor">Minor</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Major">Major</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost (₦)</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reported By</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reported Date</label>
                    <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Describe the damage incident..."
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
                    Add Damage Report
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