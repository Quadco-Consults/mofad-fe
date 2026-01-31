'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import apiClient from '@/lib/apiClient'
import { formatCurrency } from '@/lib/utils'
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
  AlertTriangle,
  Warehouse
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
  const queryClient = useQueryClient()
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
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | null>(null)

  // Fetch warehouses
  const { data: warehousesResponse, isLoading: warehousesLoading, error: warehousesError } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => apiClient.getWarehouses(),
    refetchOnWindowFocus: false,
  })

  const warehouses = warehousesResponse?.results || []

  // Fetch PRF data for Issue Goods tab (approved PRFs ready to be issued)
  const { data: prfData, isLoading: prfLoading, error: prfError } = useQuery({
    queryKey: ['prfs-for-issue', selectedWarehouse, searchTerm, timeFilter],
    queryFn: () => apiClient.getPrfs({
      status: 'approved', // PRFs that are approved and ready to issue goods
      warehouse: selectedWarehouse || undefined,
      search: searchTerm || undefined,
      page_size: 100
    }),
    enabled: !!selectedWarehouse,
    refetchOnWindowFocus: false,
  })

  // Fetch PRO data for Receive Goods tab (confirmed PROs with goods to receive)
  const { data: proData, isLoading: proLoading, error: proError } = useQuery({
    queryKey: ['pros-for-receive', selectedWarehouse, searchTerm, timeFilter],
    queryFn: () => apiClient.getPros({
      status: 'confirmed', // PROs that are confirmed and waiting for goods receipt
      delivery_location: selectedWarehouse || undefined,
      search: searchTerm || undefined,
      page_size: 100
    }),
    enabled: !!selectedWarehouse,
    refetchOnWindowFocus: false,
  })

  // Transform PRF data to StoreKeeperItem format for Issue Goods
  const transformPrfToStoreKeeperItem = (prf: any): StoreKeeperItem => ({
    id: prf.id.toString(),
    invoiceId: prf.prf_number || prf.id.toString(),
    refCode: prf.reference_number || prf.prf_number || '',
    customerName: prf.department_name || prf.requested_by_name || 'Unknown Department',
    totalValue: prf.total_amount || 0,
    salesRep: prf.requested_by_name || prf.created_by_name || '',
    issuedStatus: prf.goods_issued ? 'Received' : 'Not Received',
    checkout: prf.goods_issued ? 'INITIATED' : 'Issue Goods',
    approvedBy: prf.approved_by_name || prf.current_approver_name || '',
    orderDate: prf.created_at || new Date().toISOString(),
    actions: prf.goods_issued ? ['view', 'edit'] : ['view', 'issue']
  })

  // Transform PRO data to StoreKeeperItem format for Receive Goods
  const transformProToStoreKeeperItem = (pro: any): StoreKeeperItem => ({
    id: pro.id.toString(),
    invoiceId: pro.pro_number || pro.id.toString(),
    refCode: pro.reference_number || pro.pro_number || '',
    customerName: pro.supplier_name || 'Unknown Supplier',
    totalValue: pro.total_amount || 0,
    salesRep: pro.created_by_name || '',
    issuedStatus: pro.delivery_status === 'completed' ? 'Received' : 'Not Received',
    checkout: pro.delivery_status === 'completed' ? 'INITIATED' : 'Receive Goods',
    approvedBy: pro.approved_by_name || '',
    orderDate: pro.created_at || new Date().toISOString(),
    actions: pro.delivery_status === 'completed' ? ['view', 'edit'] : ['view', 'receive']
  })

  // Generate issued goods from PRF data
  const issuedGoods: StoreKeeperItem[] = prfData?.results ?
    prfData.results.map(transformPrfToStoreKeeperItem) : []

  // Generate received goods from PRO data
  const receivedGoods: StoreKeeperItem[] = proData?.results ?
    proData.results.map(transformProToStoreKeeperItem) : []

  // Filter data based on search and filters
  const filteredIssuedGoods = issuedGoods.filter(item => {
    const matchesSearch = !searchTerm ||
      item.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.refCode.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterBy === 'Filter by' ||
      filterBy === 'All' ||
      item.issuedStatus === filterBy

    return matchesSearch && matchesFilter
  })

  const filteredReceivedGoods = receivedGoods.filter(item => {
    const matchesSearch = !searchTerm ||
      item.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.refCode.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterBy === 'Filter by' ||
      filterBy === 'All' ||
      item.issuedStatus === filterBy

    return matchesSearch && matchesFilter
  })

  const isLoading = activeTab === 'issue' ? prfLoading : proLoading
  const error = activeTab === 'issue' ? prfError : proError

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

  // Fetch selected PRO details for receiving
  const { data: selectedProData, isLoading: proDetailsLoading } = useQuery({
    queryKey: ['pro-details', selectedItem?.id],
    queryFn: () => apiClient.getProById(selectedItem!.id),
    enabled: !!selectedItem && showReceiveGoodsModal,
  })

  // Event handlers
  const handleReceiveGoods = (item: StoreKeeperItem) => {
    setSelectedItem(item)
    setSelectedProducts([]) // Reset selected products
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

  // Receive goods mutation
  const receiveGoodsMutation = useMutation({
    mutationFn: async ({ proId, items }: { proId: number, items: Array<{ product_id: number, quantity_received: number }> }) => {
      return apiClient.receivePro(proId, { items })
    },
    onSuccess: () => {
      setShowReceiveGoodsModal(false)
      setShowSuccessModal(true)
      queryClient.invalidateQueries({ queryKey: ['pros-for-receive'] })
    },
    onError: (error: any) => {
      alert(`Error receiving goods: ${error.message || 'Unknown error'}`)
    }
  })

  const handleConfirmReceiveGoods = () => {
    if (!selectedItem || selectedProducts.length === 0) {
      alert('Please add at least one product with quantity to receive')
      return
    }

    const items = selectedProducts.map(p => ({
      product_id: parseInt(p.productId),
      quantity_received: p.quantity
    }))

    receiveGoodsMutation.mutate({
      proId: parseInt(selectedItem.id),
      items
    })
  }

  const currentData = activeTab === 'issue' ? filteredIssuedGoods : filteredReceivedGoods

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header with Export Button */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Store Keeper</h1>
            <p className="text-gray-600">Manage inventory operations and transactions</p>
            {!warehousesLoading && warehouses.length > 0 && selectedWarehouse && (
              <div className="mt-2">
                <label htmlFor="warehouse-select" className="text-sm font-medium text-gray-700 mr-2">
                  Selected Warehouse:
                </label>
                <select
                  id="warehouse-select"
                  value={selectedWarehouse || ''}
                  onChange={(e) => setSelectedWarehouse(Number(e.target.value))}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select Warehouse</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name} - {warehouse.location || 'No location'}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {selectedWarehouse && (
            <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border">
              <Package className="w-4 h-4 mr-2" />
              Export
            </button>
          )}
        </div>

        {/* Warehouse Loading State */}
        {warehousesLoading && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading warehouses...</p>
          </div>
        )}

        {/* Warehouse Error State */}
        {warehousesError && !warehousesLoading && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Warehouses</h3>
            <p className="text-gray-600 mb-4">Failed to load warehouse list</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Retry
            </button>
          </div>
        )}

        {/* Warehouse Selection Screen */}
        {!warehousesLoading && !warehousesError && !selectedWarehouse && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center mb-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Warehouse</h3>
            <p className="text-gray-600 mb-6">Choose a warehouse to manage store keeper operations</p>

            {warehouses.length === 0 ? (
              <div className="text-gray-500">No warehouses available</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {warehouses.map((warehouse) => (
                  <div
                    key={warehouse.id}
                    onClick={() => setSelectedWarehouse(warehouse.id)}
                    className="border border-gray-200 rounded-lg p-4 hover:border-orange-500 hover:bg-orange-50 cursor-pointer transition-all"
                  >
                    <div className="flex items-center mb-2">
                      <Warehouse className="w-5 h-5 text-orange-500 mr-2" />
                      <h4 className="font-semibold text-gray-900">{warehouse.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{warehouse.location || 'No location specified'}</p>
                    <p className="text-xs text-gray-500 mt-1">Code: {warehouse.code || warehouse.id}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Navigation - Only show when warehouse is selected */}
        {selectedWarehouse && (
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
        )}

        {/* Search and Filter Controls - Only show when warehouse is selected */}
        {selectedWarehouse && (
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
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading {activeTab === 'issue' ? 'issue goods' : 'receive goods'} records...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-4">Failed to load {activeTab === 'issue' ? 'PRF' : 'PRO'} records</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && currentData.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Records Found</h3>
            <p className="text-gray-600">
              {activeTab === 'issue'
                ? 'No approved PRFs ready for goods issue found.'
                : 'No confirmed PROs waiting for goods receipt found.'
              }
            </p>
          </div>
        )}

        {/* Main Data Table */}
        {!isLoading && !error && currentData.length > 0 && (
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
        )}

        {/* Pagination */}
        {!isLoading && !error && currentData.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {currentData.length} of {activeTab === 'issue' ? (prfData?.total || 0) : (proData?.total || 0)} items
            </div>
            <div className="flex space-x-1">
              <button className="px-3 py-2 text-sm bg-orange-500 text-white rounded">1</button>
              {/* Add more pagination controls as needed */}
            </div>
          </div>
        )}

        {/* Receive Goods Modal */}
        {showReceiveGoodsModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Receive Goods - PRO #{selectedItem.invoiceId}
                </h3>
                <button
                  onClick={() => setShowReceiveGoodsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {proDetailsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading PRO details...</p>
                </div>
              ) : selectedProData ? (
                <>
                  {/* PRO Info */}
                  <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Supplier:</span>
                        <span className="ml-2 font-medium">{selectedProData.supplier || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="ml-2 font-medium">{formatCurrency(selectedProData.total_amount)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Destination Warehouse:</span>
                        <span className="ml-2 font-medium text-orange-600">
                          {selectedProData.delivery_location_name || 'Not specified'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">PRO Number:</span>
                        <span className="ml-2 font-medium">{selectedProData.pro_number}</span>
                      </div>
                    </div>
                  </div>

                  {/* Product List */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-4">Items to Receive</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Product</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Ordered Qty</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Already Received</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Remaining</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Receive Now</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedProData.items && selectedProData.items.length > 0 ? (
                            selectedProData.items.map((item: any, index: number) => {
                              const remaining = parseFloat(item.quantity_remaining || item.quantity || 0)
                              const currentQty = selectedProducts.find(p => p.productId === String(item.product))?.quantity || 0

                              return (
                                <tr key={index} className="border-b">
                                  <td className="px-4 py-3 text-sm">
                                    <div>{item.product_name}</div>
                                    <div className="text-xs text-gray-500">{item.product_code}</div>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-right">{item.quantity}</td>
                                  <td className="px-4 py-3 text-sm text-right">
                                    {item.quantity_delivered || 0}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-right font-medium">
                                    {remaining}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-right">
                                    <input
                                      type="number"
                                      min="0"
                                      max={remaining}
                                      value={currentQty}
                                      onChange={(e) => {
                                        const qty = parseFloat(e.target.value) || 0
                                        const productId = String(item.product)

                                        if (qty <= 0) {
                                          // Remove from list
                                          setSelectedProducts(prev => prev.filter(p => p.productId !== productId))
                                        } else if (qty <= remaining) {
                                          // Add or update
                                          setSelectedProducts(prev => {
                                            const existing = prev.find(p => p.productId === productId)
                                            if (existing) {
                                              return prev.map(p =>
                                                p.productId === productId
                                                  ? { ...p, quantity: qty }
                                                  : p
                                              )
                                            } else {
                                              return [...prev, {
                                                productId,
                                                productCode: item.product_code,
                                                productName: item.product_name,
                                                quantity: qty,
                                                unitPrice: item.unit_price || 0,
                                                totalPrice: qty * (item.unit_price || 0)
                                              }]
                                            }
                                          })
                                        }
                                      }}
                                      className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                                      placeholder="0"
                                    />
                                  </td>
                                </tr>
                              )
                            })
                          ) : (
                            <tr>
                              <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                No items found in this PRO
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Summary */}
                  {selectedProducts.length > 0 && (
                    <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">Receiving Summary</h5>
                      <div className="space-y-1 text-sm">
                        {selectedProducts.map((p, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{p.productName}</span>
                            <span className="font-medium">Qty: {p.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setShowReceiveGoodsModal(false)}
                      className="px-6 py-2 text-gray-600 hover:text-gray-800"
                      disabled={receiveGoodsMutation.isPending}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmReceiveGoods}
                      disabled={receiveGoodsMutation.isPending || selectedProducts.length === 0}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                    >
                      {receiveGoodsMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirm Receive ({selectedProducts.length} items)
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Failed to load PRO details
                </div>
              )}
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