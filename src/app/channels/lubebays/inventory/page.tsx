'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Eye, CheckCircle, XCircle, Plus, Package, Droplets, AlertTriangle, TrendingUp, TrendingDown, Fuel } from 'lucide-react'

interface LubebayInventoryItem {
  id: string
  productCode: string
  productName: string
  category: string
  brand: string
  viscosity: string
  packSize: string
  currentStock: number
  reorderLevel: number
  unitPrice: number
  totalValue: number
  lastUpdated: string
  status: 'in-stock' | 'low-stock' | 'out-of-stock'
  supplier: string
  shelfLocation: string
}

export default function LubebayInventoryPage() {
  const [selectedItem, setSelectedItem] = useState<LubebayInventoryItem | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Mock data specific to lubebay inventory
  const mockLubebayInventory: LubebayInventoryItem[] = [
    {
      id: 'LB001',
      productCode: 'MOB-20W50-5L',
      productName: 'Mobil Super 2000 X1',
      category: 'Engine Oil',
      brand: 'Mobil',
      viscosity: '20W-50',
      packSize: '5L',
      currentStock: 45,
      reorderLevel: 20,
      unitPrice: 8500,
      totalValue: 382500,
      lastUpdated: '2024-01-22',
      status: 'in-stock',
      supplier: 'Mobil Oil Nigeria',
      shelfLocation: 'A1-Top'
    },
    {
      id: 'LB002',
      productCode: 'SHL-15W40-4L',
      productName: 'Shell Helix HX5',
      category: 'Engine Oil',
      brand: 'Shell',
      viscosity: '15W-40',
      packSize: '4L',
      currentStock: 15,
      reorderLevel: 25,
      unitPrice: 7200,
      totalValue: 108000,
      lastUpdated: '2024-01-21',
      status: 'low-stock',
      supplier: 'Shell Nigeria',
      shelfLocation: 'A2-Middle'
    },
    {
      id: 'LB003',
      productCode: 'TOT-ATF-1L',
      productName: 'Total Fluide ATF',
      category: 'Transmission Fluid',
      brand: 'Total',
      viscosity: 'ATF',
      packSize: '1L',
      currentStock: 0,
      reorderLevel: 30,
      unitPrice: 3500,
      totalValue: 0,
      lastUpdated: '2024-01-20',
      status: 'out-of-stock',
      supplier: 'Total Lubricants',
      shelfLocation: 'B1-Bottom'
    },
    {
      id: 'LB004',
      productCode: 'CAS-85W140-1L',
      productName: 'Castrol Axle Z',
      category: 'Gear Oil',
      brand: 'Castrol',
      viscosity: '85W-140',
      packSize: '1L',
      currentStock: 28,
      reorderLevel: 15,
      unitPrice: 4200,
      totalValue: 117600,
      lastUpdated: '2024-01-22',
      status: 'in-stock',
      supplier: 'Castrol Nigeria',
      shelfLocation: 'C1-Top'
    },
    {
      id: 'LB005',
      productCode: 'MOB-HYD-ISO32',
      productName: 'Mobil DTE 24',
      category: 'Hydraulic Oil',
      brand: 'Mobil',
      viscosity: 'ISO 32',
      packSize: '20L',
      currentStock: 8,
      reorderLevel: 10,
      unitPrice: 25000,
      totalValue: 200000,
      lastUpdated: '2024-01-21',
      status: 'low-stock',
      supplier: 'Mobil Oil Nigeria',
      shelfLocation: 'D1-Floor'
    },
    {
      id: 'LB006',
      productCode: 'SHL-GREASE-400G',
      productName: 'Shell Gadus S2',
      category: 'Grease',
      brand: 'Shell',
      viscosity: 'Grade 2',
      packSize: '400g',
      currentStock: 35,
      reorderLevel: 20,
      unitPrice: 1800,
      totalValue: 63000,
      lastUpdated: '2024-01-22',
      status: 'in-stock',
      supplier: 'Shell Nigeria',
      shelfLocation: 'E1-Middle'
    }
  ]

  const handleSuccess = () => {
    if (selectedItem) {
      // Logic for approving stock adjustment
      setShowSuccessModal(false)
      setSelectedItem(null)
    }
  }

  const handleDecline = () => {
    if (selectedItem) {
      // Logic for declining stock adjustment
      setShowDeclineModal(false)
      setSelectedItem(null)
    }
  }

  const viewDetails = (item: LubebayInventoryItem) => {
    setSelectedItem(item)
    setShowDetailsModal(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in-stock':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">In Stock</span>
      case 'low-stock':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Low Stock</span>
      case 'out-of-stock':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Out of Stock</span>
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'engine oil':
        return 'bg-blue-100 text-blue-800'
      case 'gear oil':
        return 'bg-green-100 text-green-800'
      case 'transmission fluid':
        return 'bg-purple-100 text-purple-800'
      case 'hydraulic oil':
        return 'bg-orange-100 text-orange-800'
      case 'grease':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getBrandColor = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'mobil':
        return 'bg-red-100 text-red-800'
      case 'shell':
        return 'bg-yellow-100 text-yellow-800'
      case 'total':
        return 'bg-blue-100 text-blue-800'
      case 'castrol':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStockLevelIndicator = (currentStock: number, reorderLevel: number) => {
    const percentage = (currentStock / reorderLevel) * 100
    if (percentage > 150) {
      return <TrendingUp className="w-4 h-4 text-green-600" />
    } else if (percentage > 100) {
      return <TrendingUp className="w-4 h-4 text-yellow-600" />
    } else {
      return <TrendingDown className="w-4 h-4 text-red-600" />
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header with MOFAD branding */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lubebay Store Inventory</h1>
            <p className="text-gray-600">Manage lubricants, oils, and automotive fluids inventory</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{mockLubebayInventory.length}</p>
              </div>
              <Droplets className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">₦{mockLubebayInventory.reduce((sum, item) => sum + item.totalValue, 0).toLocaleString()}</p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-900">{mockLubebayInventory.filter(item => item.status === 'low-stock').length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-gray-900">{mockLubebayInventory.filter(item => item.status === 'out-of-stock').length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-orange-500 to-amber-500">
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Product Code</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Product Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Brand</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Viscosity/Grade</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Pack Size</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white">Stock</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white">Unit Price</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockLubebayInventory.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{item.productCode}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{item.productName}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBrandColor(item.brand)}`}>
                      <Fuel className="w-3 h-3 mr-1" />
                      {item.brand}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                      <Droplets className="w-3 h-3 mr-1" />
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.viscosity}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.packSize}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <span>{item.currentStock}</span>
                      {getStockLevelIndicator(item.currentStock, item.reorderLevel)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                    ₦{item.unitPrice.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => viewDetails(item)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {item.status === 'low-stock' && (
                        <>
                          <button
                            onClick={() => { setSelectedItem(item); setShowSuccessModal(true) }}
                            className="text-green-600 hover:text-green-800 p-1"
                            title="Approve Restock"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => { setSelectedItem(item); setShowDeclineModal(true) }}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Mark as Reviewed"
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

        {/* Product Details Modal */}
        {showDetailsModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Product Information</h4>
                    <div className="space-y-2">
                      <p><span className="font-medium">Product Code:</span> {selectedItem.productCode}</p>
                      <p><span className="font-medium">Product Name:</span> {selectedItem.productName}</p>
                      <p><span className="font-medium">Brand:</span> {selectedItem.brand}</p>
                      <p><span className="font-medium">Category:</span> {selectedItem.category}</p>
                      <p><span className="font-medium">Viscosity/Grade:</span> {selectedItem.viscosity}</p>
                      <p><span className="font-medium">Pack Size:</span> {selectedItem.packSize}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Stock Information</h4>
                    <div className="space-y-2">
                      <p><span className="font-medium">Current Stock:</span> {selectedItem.currentStock} units</p>
                      <p><span className="font-medium">Reorder Level:</span> {selectedItem.reorderLevel} units</p>
                      <p><span className="font-medium">Unit Price:</span> ₦{selectedItem.unitPrice.toLocaleString()}</p>
                      <p><span className="font-medium">Total Value:</span> ₦{selectedItem.totalValue.toLocaleString()}</p>
                      <p><span className="font-medium">Supplier:</span> {selectedItem.supplier}</p>
                      <p><span className="font-medium">Shelf Location:</span> {selectedItem.shelfLocation}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Status & Updates</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Last Updated:</span> {selectedItem.lastUpdated}</p>
                    <p><span className="font-medium">Status:</span> {getStatusBadge(selectedItem.status)}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="text-center">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Approve Restock</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to approve restocking for this lubricant?
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
                    Approve Restock
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Mark as Reviewed</h3>
                <p className="text-gray-600 mb-6">
                  Mark this low stock item as reviewed?
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
                    Mark Reviewed
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Add New Lubricant Product</h3>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Code</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <option value="">Select Brand</option>
                      <option value="Mobil">Mobil</option>
                      <option value="Shell">Shell</option>
                      <option value="Total">Total</option>
                      <option value="Castrol">Castrol</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <option value="">Select Category</option>
                      <option value="Engine Oil">Engine Oil</option>
                      <option value="Gear Oil">Gear Oil</option>
                      <option value="Transmission Fluid">Transmission Fluid</option>
                      <option value="Hydraulic Oil">Hydraulic Oil</option>
                      <option value="Grease">Grease</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Viscosity/Grade</label>
                    <input type="text" placeholder="e.g. 20W-50, ISO 32, Grade 2" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pack Size</label>
                    <input type="text" placeholder="e.g. 5L, 1L, 400g" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (₦)</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shelf Location</label>
                    <input type="text" placeholder="e.g. A1-Top, B2-Middle" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
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
                    Add Product
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