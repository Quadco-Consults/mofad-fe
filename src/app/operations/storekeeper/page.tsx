'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import {
  Package,
  TrendingDown,
  TrendingUp,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  Truck,
  Calendar,
  User,
  MapPin,
  DollarSign,
  Hash,
  Search,
  Filter,
  Plus,
  Download,
  Printer,
  Edit,
  RotateCcw,
  AlertTriangle
} from 'lucide-react'

interface StoreKeeperItem {
  id: string
  invoiceId: string
  refCode: string
  customerName: string
  totalValue: number
  salesRep: string
  issuedStatus: 'Received' | 'Not Received' | 'Initiated'
  checkout: 'INITIATED' | 'Receive Goods' | 'Issue Goods'
  approvedBy: string
  orderDate: string
  actions: string[]
}

interface Product {
  id: string
  code: string
  name: string
  quantity: number
  description?: string
}

interface ProductSelection {
  productId: string
  productCode: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

const StorekeeperPage = () => {
  const [activeTab, setActiveTab] = useState<'issue' | 'receive'>('issue')
  const [searchTerm, setSearchTerm] = useState('')
  const [timeFilter, setTimeFilter] = useState('Last 30 days')
  const [filterBy, setFilterBy] = useState('Filter by')

  // Modal states
  const [showIssueGoodsModal, setShowIssueGoodsModal] = useState(false)
  const [showReceiveGoodsModal, setShowReceiveGoodsModal] = useState(false)
  const [showProductSelectionModal, setShowProductSelectionModal] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [showWaybillModal, setShowWaybillModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<StoreKeeperItem | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<ProductSelection[]>([])

  // Sample data for issued goods
  const issuedGoods: StoreKeeperItem[] = [
    {
      id: '7000',
      invoiceId: '7000',
      refCode: '9885',
      customerName: 'EBERE MPADE',
      totalValue: 1014156.00,
      salesRep: 'ELISHA DANIEL',
      issuedStatus: 'Received',
      checkout: 'INITIATED',
      approvedBy: 'ABUBAKAR ABDULLAHI',
      orderDate: '14-05-2024 07:46:47',
      actions: ['view', 'edit']
    },
    {
      id: '7001',
      invoiceId: '7001',
      refCode: '9886',
      customerName: 'AUTO PLAZA',
      totalValue: 368000.00,
      salesRep: 'ELISHA DANIEL',
      issuedStatus: 'Not Received',
      checkout: 'Receive Goods',
      approvedBy: 'ABUBAKAR ABDULLAHI',
      orderDate: '14-05-2024 07:46:47',
      actions: ['view', 'receive']
    },
    {
      id: '7002',
      invoiceId: '7002',
      refCode: '9887',
      customerName: 'S.A MULTI TECH VENTURE',
      totalValue: 479000.00,
      salesRep: 'ELISHA DANIEL',
      issuedStatus: 'Received',
      checkout: 'INITIATED',
      approvedBy: 'ABUBAKAR ABDULLAHI',
      orderDate: '14-05-2024 07:46:47',
      actions: ['view', 'edit']
    },
    {
      id: '7003',
      invoiceId: '7003',
      refCode: '9888',
      customerName: 'ABSALCO LUBE OIL',
      totalValue: 30000.00,
      salesRep: 'ELISHA DANIEL',
      issuedStatus: 'Received',
      checkout: 'INITIATED',
      approvedBy: 'ABUBAKAR ABDULLAHI',
      orderDate: '14-05-2024 07:46:47',
      actions: ['view', 'edit']
    },
    {
      id: '7004',
      invoiceId: '7004',
      refCode: '9889',
      customerName: 'EBERE MPADE',
      totalValue: 1014156.00,
      salesRep: 'ELISHA DANIEL',
      issuedStatus: 'Not Received',
      checkout: 'Receive Goods',
      approvedBy: 'ABUBAKAR ABDULLAHI',
      orderDate: '14-05-2024 07:46:47',
      actions: ['view', 'receive']
    }
  ]

  // Sample data for received goods
  const receivedGoods: StoreKeeperItem[] = [
    {
      id: '7005',
      invoiceId: '7005',
      refCode: '9890',
      customerName: 'ABSALCO LUBE OIL',
      totalValue: 30000.00,
      salesRep: 'ELISHA DANIEL',
      issuedStatus: 'Not Received',
      checkout: 'Receive Goods',
      approvedBy: 'ABUBAKAR ABDULLAHI',
      orderDate: '14-05-2024 07:46:47',
      actions: ['view', 'receive']
    },
    {
      id: '7006',
      invoiceId: '7006',
      refCode: '9891',
      customerName: 'S.A MULTI TECH VENTURE',
      totalValue: 479000.00,
      salesRep: 'ELISHA DANIEL',
      issuedStatus: 'Received',
      checkout: 'INITIATED',
      approvedBy: 'ABUBAKAR ABDULLAHI',
      orderDate: '14-05-2024 07:46:47',
      actions: ['view', 'edit']
    }
  ]

  // Sample products data
  const availableProducts: Product[] = [
    { id: 'MAG40', code: 'MAG40', name: 'MAGNETEC 10W40-1L', quantity: 100 },
    { id: 'PET50', code: 'PET50', name: 'PETRONAS 2W 50-4L', quantity: 54 },
    { id: 'EDG40', code: 'EDG40', name: 'EDGE 5W40-4L', quantity: 60 },
    { id: 'MAG39', code: 'MAG39', name: 'MAGNETEC 10W30-4L', quantity: 15 }
  ]

  // Helper functions
  const getStatusBadge = (status: string) => {
    if (status === 'Received') {
      return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">● Received</span>
    } else if (status === 'Not Received') {
      return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">● Not Received</span>
    }
    return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{status}</span>
  }

  const getActionButton = (checkout: string, item: StoreKeeperItem) => {
    if (checkout === 'Receive Goods') {
      return (
        <button
          onClick={() => handleReceiveGoods(item)}
          className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
        >
          Receive Goods
        </button>
      )
    }
    return <span className="text-gray-500 text-sm">{checkout}</span>
  }

  // Event handlers
  const handleReceiveGoods = (item: StoreKeeperItem) => {
    setSelectedItem(item)
    setShowReceiveGoodsModal(true)
  }

  const handleIssueGoods = (item: StoreKeeperItem) => {
    setSelectedItem(item)
    setShowIssueGoodsModal(true)
  }

  const handleViewDetails = (item: StoreKeeperItem) => {
    setSelectedItem(item)
    // Open details modal
  }

  const handleGenerateInvoice = (item: StoreKeeperItem) => {
    setSelectedItem(item)
    setShowInvoiceModal(true)
  }

  const handleGenerateWaybill = (item: StoreKeeperItem) => {
    setSelectedItem(item)
    setShowWaybillModal(true)
  }

  const handleConfirmReceiveGoods = () => {
    setShowReceiveGoodsModal(false)
    setShowSuccessModal(true)
  }

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`
  }

  const currentData = activeTab === 'issue' ? issuedGoods : receivedGoods

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header with Export Button */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Store Keeper</h1>
          </div>
          <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border">
            <Package className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'issue'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('issue')}
              >
                Issue Goods/History
              </button>
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'receive'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('receive')}
              >
                Receive Goods/History
              </button>
            </nav>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Store Keeper"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>Last 90 days</option>
          </select>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
          >
            <option>Filter by</option>
            <option>Received</option>
            <option>Not Received</option>
            <option>Initiated</option>
          </select>
        </div>

        {/* Main Data Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-white border-b border-gray-200">
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Invoice ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Ref Code</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Customer Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Total Value</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Sales Rep</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Issued Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Checkout</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Approved By</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Order Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-4 py-3">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-orange-600">{item.invoiceId}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.refCode}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.customerName}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(item.totalValue)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.salesRep}</td>
                  <td className="px-4 py-3">
                    {getStatusBadge(item.issuedStatus)}
                  </td>
                  <td className="px-4 py-3">
                    {getActionButton(item.checkout, item)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.approvedBy}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.orderDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(item)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleGenerateInvoice(item)}
                        className="text-orange-600 hover:text-orange-800"
                        title="Generate Invoice"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleGenerateWaybill(item)}
                        className="text-green-600 hover:text-green-800"
                        title="Generate Waybill"
                      >
                        <Truck className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            1-10 of 30 items
          </div>
          <div className="flex space-x-1">
            <button className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">1</button>
            <button className="px-3 py-2 text-sm bg-orange-500 text-white rounded">2</button>
            <button className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">3</button>
            <span className="px-3 py-2 text-sm text-gray-500">...</span>
            <button className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">19</button>
          </div>
        </div>

        {/* Receive Goods Modal */}
        {showReceiveGoodsModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Received Goods - ABM TECH LIMITED</h3>
                <button
                  onClick={() => setShowReceiveGoodsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <p className="text-gray-600 mb-4">List of Received good from this PRO</p>

              {/* Product List */}
              <div className="mb-6">
                <table className="w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Products</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Ordered Quantity</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Received Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-4 py-3 text-sm">MAGNETEC 10W40-1L</td>
                      <td className="px-4 py-3 text-sm">100</td>
                      <td className="px-4 py-3 text-sm">0</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-3 text-sm">PETRONAS 2W 50-4L</td>
                      <td className="px-4 py-3 text-sm">54</td>
                      <td className="px-4 py-3 text-sm">1</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-3 text-sm">EDGE 5W40-4L</td>
                      <td className="px-4 py-3 text-sm">60</td>
                      <td className="px-4 py-3 text-sm">0</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-3 text-sm">MAGNETEC 10W30-4L</td>
                      <td className="px-4 py-3 text-sm">15</td>
                      <td className="px-4 py-3 text-sm">0</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Form Section */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Receiving Purchase Items</h4>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Requesting Staff *</label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        placeholder="ELISHA DANIEL"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                      <input
                        type="date"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        defaultValue="2024-05-31"
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Select Received Products and Quantity</h4>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Select Product *</label>
                          <select className="w-full p-3 border border-gray-300 rounded-lg">
                            <option>ABSALCO OIL</option>
                            <option>MAGNETEC 10W40-1L</option>
                            <option>PETRONAS 2W 50-4L</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                          <input
                            type="number"
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            placeholder="1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Select Product *</label>
                          <select className="w-full p-3 border border-gray-300 rounded-lg">
                            <option>Select Product</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                          <input
                            type="number"
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <button className="text-orange-500 text-sm hover:text-orange-600">
                        + Add Product
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowReceiveGoodsModal(false)}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmReceiveGoods}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Confirm Receive
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Success</h3>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="px-4 py-2 bg-orange-500 text-white rounded text-sm"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Modal */}
        {showInvoiceModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Invoice ID: #{selectedItem.invoiceId}</h3>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Invoice Content */}
              <div className="bg-white border rounded-lg p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="text-2xl font-bold text-orange-600 mb-1">MOFAD</div>
                    <div className="text-sm text-gray-600">Energy Solutions Limited</div>
                    <div className="text-sm text-gray-600">45 T.O.S Benson Crescent, Abuja</div>
                    <div className="text-sm text-gray-600">info@mofadenergysolutions.com</div>
                    <div className="text-sm text-gray-600">+234 803 3831 3791</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600 mb-1">MOFAD</div>
                    <div className="text-lg font-semibold">Invoice</div>
                    <div className="text-sm text-gray-600">Save Invoice</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Bill From:</h4>
                    <p className="text-gray-700">MOFAD Energy Services</p>
                    <p className="text-gray-700">45 T.O.S Benson Crescent, Abuja</p>
                    <p className="text-gray-700">info@mofadenergysolutions.com</p>
                    <p className="text-gray-700">+234 803 3831 3791</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Bill To:</h4>
                    <p className="text-gray-700">ABM TECH LIMITED</p>
                    <p className="text-gray-700">Magaji Hills Abuja</p>
                  </div>
                </div>

                {/* Invoice Details */}
                <div className="grid grid-cols-4 gap-4 mb-6 text-sm">
                  <div>
                    <span className="text-gray-500">Invoice ID:</span>
                    <div className="font-medium">{selectedItem.invoiceId}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Date Issue:</span>
                    <div className="font-medium">2024-05-31 07:06:44</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Product Code:</span>
                    <div className="font-medium">MAG40</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Description:</span>
                    <div className="font-medium">MAGNETEC 10W40-1L</div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="mb-6">
                  <table className="w-full border">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border p-3 text-left text-sm font-semibold">Product Code</th>
                        <th className="border p-3 text-left text-sm font-semibold">Description</th>
                        <th className="border p-3 text-left text-sm font-semibold">Price/Unit</th>
                        <th className="border p-3 text-right text-sm font-semibold">Quantity</th>
                        <th className="border p-3 text-right text-sm font-semibold">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border p-3">MAG40</td>
                        <td className="border p-3">MAGNETEC 10W40-1L</td>
                        <td className="border p-3">₦2,813.56</td>
                        <td className="border p-3 text-right">100</td>
                        <td className="border p-3 text-right">₦281,356.00</td>
                      </tr>
                      <tr>
                        <td className="border p-3">PET50</td>
                        <td className="border p-3">PETRONAS 2W 50-4L</td>
                        <td className="border p-3">₦5,000.00</td>
                        <td className="border p-3 text-right">48</td>
                        <td className="border p-3 text-right">₦240,000.00</td>
                      </tr>
                      <tr>
                        <td className="border p-3">EDG40</td>
                        <td className="border p-3">EDGE 5W40-4L</td>
                        <td className="border p-3">₦2,000.00</td>
                        <td className="border p-3 text-right">20</td>
                        <td className="border p-3 text-right">₦40,000.00</td>
                      </tr>
                      <tr>
                        <td className="border p-3">MAG39</td>
                        <td className="border p-3">MAGNETEC 10W30-4L</td>
                        <td className="border p-3">₦1,000.00</td>
                        <td className="border p-3 text-right">70</td>
                        <td className="border p-3 text-right">₦70,000.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-6">
                  <div className="w-64">
                    <div className="flex justify-between py-2">
                      <span>Subtotal:</span>
                      <span>₦1,014,156.00</span>
                    </div>
                    <div className="flex justify-between py-2 border-t font-semibold">
                      <span>Invoice Total:</span>
                      <span>₦1,014,156.00</span>
                    </div>
                  </div>
                </div>

                {/* Supervisor */}
                <div className="text-center text-sm text-gray-600 mb-6">
                  <p><strong>SUPERVISOR APPROVAL: Abubakar Abdullahi</strong></p>
                  <p>Thanks for doing business with us</p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4">
                  <button className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
                    <Download className="w-4 h-4 inline mr-2" />
                    Download Invoice
                  </button>
                  <button className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                    <Printer className="w-4 h-4 inline mr-2" />
                    Download Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Waybill Modal */}
        {showWaybillModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Waybill ID: #{selectedItem.invoiceId}</h3>
                <button
                  onClick={() => setShowWaybillModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Waybill Content */}
              <div className="bg-white border rounded-lg p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="text-2xl font-bold text-orange-600 mb-1">MOFAD</div>
                    <div className="text-sm text-gray-600">Energy Solutions Limited</div>
                    <div className="text-sm text-gray-600">45 T.O.S Benson Crescent, Abuja</div>
                    <div className="text-sm text-gray-600">info@mofadenergysolutions.com</div>
                    <div className="text-sm text-gray-600">+234 803 3831 3791</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600 mb-1">MOFAD</div>
                    <div className="text-lg font-semibold">Waybill</div>
                    <div className="text-sm text-gray-600">Delivery Waybill</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Goods From:</h4>
                    <p className="text-gray-700">MOFAD Energy Services</p>
                    <p className="text-gray-700">45 T.O.S Benson Crescent, Abuja</p>
                    <p className="text-gray-700">info@mofadenergysolutions.com</p>
                    <p className="text-gray-700">+234 803 3831 3791</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Delivery To:</h4>
                    <p className="text-gray-700">ABM TECH LIMITED</p>
                    <p className="text-gray-700">Magaji Hills Abuja</p>
                    <p className="text-gray-700">entrepatrenergral.com</p>
                    <p className="text-gray-700">+234 818 879 5679</p>
                  </div>
                </div>

                {/* Waybill Details */}
                <div className="grid grid-cols-4 gap-4 mb-6 text-sm">
                  <div>
                    <span className="text-gray-500">Product Code:</span>
                    <div className="font-medium">MAG40</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Description:</span>
                    <div className="font-medium">MAGNETEC 10W40-1L</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Price/Unit:</span>
                    <div className="font-medium">₦2,813.56</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Quantity:</span>
                    <div className="font-medium">100</div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="mb-6">
                  <table className="w-full border">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border p-3 text-left text-sm font-semibold">Product Code</th>
                        <th className="border p-3 text-left text-sm font-semibold">Description</th>
                        <th className="border p-3 text-left text-sm font-semibold">Price/Unit</th>
                        <th className="border p-3 text-right text-sm font-semibold">Quantity</th>
                        <th className="border p-3 text-right text-sm font-semibold">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border p-3">MAG40</td>
                        <td className="border p-3">MAGNETEC 10W40-1L</td>
                        <td className="border p-3">₦2,813.56</td>
                        <td className="border p-3 text-right">100</td>
                        <td className="border p-3 text-right">₦281,356.00</td>
                      </tr>
                      <tr>
                        <td className="border p-3">PET50</td>
                        <td className="border p-3">PETRONAS 2W 50-4L</td>
                        <td className="border p-3">₦5,000.00</td>
                        <td className="border p-3 text-right">48</td>
                        <td className="border p-3 text-right">₦240,000.00</td>
                      </tr>
                      <tr>
                        <td className="border p-3">EDG40</td>
                        <td className="border p-3">EDGE 5W40-4L</td>
                        <td className="border p-3">₦2,000.00</td>
                        <td className="border p-3 text-right">20</td>
                        <td className="border p-3 text-right">₦40,000.00</td>
                      </tr>
                      <tr>
                        <td className="border p-3">MAG39</td>
                        <td className="border p-3">MAGNETEC 10W30-4L</td>
                        <td className="border p-3">₦1,000.00</td>
                        <td className="border p-3 text-right">70</td>
                        <td className="border p-3 text-right">₦70,000.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Delivery Information */}
                <div className="grid grid-cols-2 gap-8 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Delivered By:</h4>
                    <div className="border border-gray-300 p-3 rounded">
                      <p>Sign:</p>
                      <div className="h-12"></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Received By:</h4>
                    <div className="border border-gray-300 p-3 rounded">
                      <p>Sign:</p>
                      <div className="h-12"></div>
                    </div>
                  </div>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-6">
                  <div className="w-64">
                    <div className="flex justify-between py-2">
                      <span>Subtotal:</span>
                      <span>₦1,014,156.00</span>
                    </div>
                    <div className="flex justify-between py-2 border-t font-semibold">
                      <span>Service Total:</span>
                      <span>₦1,014,156.00</span>
                    </div>
                  </div>
                </div>

                {/* Share Options */}
                <div className="text-right mb-6">
                  <div className="text-sm text-gray-600">Share to:</div>
                  <div className="flex justify-end space-x-2 mt-2">
                    <button className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xs">📧</span>
                    </button>
                    <button className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xs">📱</span>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4">
                  <button className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
                    <Download className="w-4 h-4 inline mr-2" />
                    Download Waybill
                  </button>
                  <button className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                    <Printer className="w-4 h-4 inline mr-2" />
                    Print Waybill
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default StorekeeperPage