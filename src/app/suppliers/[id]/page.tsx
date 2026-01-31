'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import api from '@/lib/api-client'
import {
  ArrowLeft,
  Building,
  Phone,
  Mail,
  MapPin,
  Edit,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calculator,
  CreditCard,
  Package,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  Download,
  Printer,
  Loader2,
  Eye
} from 'lucide-react'

interface Supplier {
  id: number
  name: string
  contact_person?: string
  email?: string
  phone?: string
  address?: string
  tax_id?: string
  supplier_type?: string
  payment_terms?: string
  credit_limit?: number
  status: string
  current_balance: number
  total_value_ytd: number
  total_orders_ytd: number
  rating: number
  products_supplied?: string[]
  bank_account?: string
  notes?: string
  created_at: string
  updated_at: string
  created_by?: number
  updated_by?: number
}

interface SupplierOrder {
  id: number
  pro_number: string
  title: string
  order_date: string
  delivery_date?: string
  total_amount: number
  paid_amount: number
  outstanding_amount: number
  status: 'pending' | 'partial' | 'completed' | 'cancelled'
  items_count: number
}

interface SupplierPayment {
  id: number
  reference_number: string
  payment_date: string
  amount: number
  payment_method: string
  description?: string
  pro_number?: string
}

export default function SupplierDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supplierId = params.id as string
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'payments'>('overview')

  // Fetch supplier from API
  const { data: supplier, isLoading: supplierLoading } = useQuery({
    queryKey: ['supplier', supplierId],
    queryFn: () => api.getSupplierById(supplierId),
    enabled: !!supplierId
  })

  // Fetch PROs for this supplier
  const { data: prosData, isLoading: prosLoading } = useQuery({
    queryKey: ['supplier-pros', supplierId, supplier?.name],
    queryFn: () => api.getPros({ search: supplier?.name, page_size: 100 }),
    enabled: !!supplier?.name
  })

  const pros = prosData?.results || []

  // Mock suppliers data (backup - same as in the main page)
  const mockSuppliers: Supplier[] = [
    {
      id: 1,
      name: 'Ardova Plc',
      contact_person: 'Ahmed Hassan',
      email: 'ahmed.hassan@ardovaplc.com',
      phone: '+234 801 234 5678',
      address: '2, Ajose Adeogun Street, Victoria Island, Lagos',
      tax_number: 'ARD-001-234',
      payment_terms: 30,
      credit_limit: 50000000,
      is_active: true,
      created_at: '2023-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
      total_orders: 15,
      total_ordered_value: 250000000,
      total_paid: 230000000,
      outstanding_balance: -20000000, // Negative means we owe them
      deposits: 15000000,
      last_order_date: '2024-01-20T00:00:00Z',
      last_payment_date: '2024-01-18T00:00:00Z'
    },
    {
      id: 2,
      name: 'Eterna Plc',
      contact_person: 'Fatima Ibrahim',
      email: 'fatima.ibrahim@eternaplc.com',
      phone: '+234 802 345 6789',
      address: 'Eterna House, Saka Tinubu Street, Victoria Island, Lagos',
      tax_number: 'ETN-002-567',
      payment_terms: 45,
      credit_limit: 75000000,
      is_active: true,
      created_at: '2023-02-10T00:00:00Z',
      updated_at: '2024-01-10T00:00:00Z',
      total_orders: 22,
      total_ordered_value: 180000000,
      total_paid: 185000000,
      outstanding_balance: 5000000, // Positive means they owe us
      deposits: 12000000,
      last_order_date: '2024-01-15T00:00:00Z',
      last_payment_date: '2024-01-12T00:00:00Z'
    },
    {
      id: 3,
      name: 'Conoil Plc',
      contact_person: 'Kemi Adebayo',
      email: 'kemi.adebayo@conoilplc.com',
      phone: '+234 803 456 7890',
      address: 'Bull Plaza, 35 Marina, Lagos Island, Lagos',
      tax_number: 'CON-003-890',
      payment_terms: 60,
      credit_limit: 40000000,
      is_active: true,
      created_at: '2023-03-05T00:00:00Z',
      updated_at: '2024-01-05T00:00:00Z',
      total_orders: 8,
      total_ordered_value: 95000000,
      total_paid: 90000000,
      outstanding_balance: -5000000,
      deposits: 8000000,
      last_order_date: '2024-01-08T00:00:00Z',
      last_payment_date: '2024-01-10T00:00:00Z'
    },
    {
      id: 4,
      name: 'MRS Oil Nigeria Plc',
      contact_person: 'Yusuf Mohammed',
      email: 'yusuf.mohammed@mrsoilnigeria.com',
      phone: '+234 804 567 8901',
      address: '16 Creek Road, Apapa, Lagos',
      tax_number: 'MRS-004-123',
      payment_terms: 30,
      credit_limit: 60000000,
      is_active: true,
      created_at: '2023-04-20T00:00:00Z',
      updated_at: '2024-01-20T00:00:00Z',
      total_orders: 12,
      total_ordered_value: 135000000,
      total_paid: 125000000,
      outstanding_balance: -10000000,
      deposits: 20000000,
      last_order_date: '2024-01-25T00:00:00Z',
      last_payment_date: '2024-01-22T00:00:00Z'
    },
    {
      id: 5,
      name: 'Forte Oil Plc',
      contact_person: 'Grace Okafor',
      email: 'grace.okafor@forteoil.com',
      phone: '+234 805 678 9012',
      address: '26 Wharf Road, Apapa, Lagos',
      tax_number: 'FTE-005-456',
      payment_terms: 30,
      credit_limit: 30000000,
      is_active: false,
      created_at: '2023-05-15T00:00:00Z',
      updated_at: '2023-12-15T00:00:00Z',
      total_orders: 5,
      total_ordered_value: 45000000,
      total_paid: 45000000,
      outstanding_balance: 0,
      deposits: 5000000,
      last_order_date: '2023-12-10T00:00:00Z',
      last_payment_date: '2023-12-12T00:00:00Z'
    }
  ]

  // Mock orders data for selected supplier
  const mockOrders: SupplierOrder[] = [
    {
      id: 1,
      pro_number: 'PRO-2024-001',
      title: 'Lubricants Purchase - January 2024',
      order_date: '2024-01-20T00:00:00Z',
      delivery_date: '2024-02-05T00:00:00Z',
      total_amount: 15000000,
      paid_amount: 15000000,
      outstanding_amount: 0,
      status: 'completed',
      items_count: 12
    },
    {
      id: 2,
      pro_number: 'PRO-2024-002',
      title: 'Fuel Products - December 2023',
      order_date: '2023-12-15T00:00:00Z',
      delivery_date: '2024-01-10T00:00:00Z',
      total_amount: 25000000,
      paid_amount: 20000000,
      outstanding_amount: 5000000,
      status: 'partial',
      items_count: 8
    },
    {
      id: 3,
      pro_number: 'PRO-2024-003',
      title: 'Engine Oil Supplies - February 2024',
      order_date: '2024-02-01T00:00:00Z',
      delivery_date: '2024-02-15T00:00:00Z',
      total_amount: 18000000,
      paid_amount: 18000000,
      outstanding_amount: 0,
      status: 'completed',
      items_count: 15
    },
    {
      id: 4,
      pro_number: 'PRO-2024-004',
      title: 'Additives and Filters - March 2024',
      order_date: '2024-03-05T00:00:00Z',
      total_amount: 8500000,
      paid_amount: 0,
      outstanding_amount: 8500000,
      status: 'pending',
      items_count: 6
    }
  ]

  // Mock payments data for selected supplier
  const mockPayments: SupplierPayment[] = [
    {
      id: 1,
      reference_number: 'PAY-2024-001',
      payment_date: '2024-01-18T00:00:00Z',
      amount: 15000000,
      payment_method: 'Bank Transfer',
      description: 'Payment for PRO-2024-001',
      pro_number: 'PRO-2024-001'
    },
    {
      id: 2,
      reference_number: 'PAY-2024-002',
      payment_date: '2024-01-12T00:00:00Z',
      amount: 20000000,
      payment_method: 'Check',
      description: 'Partial payment for PRO-2024-002',
      pro_number: 'PRO-2024-002'
    },
    {
      id: 3,
      reference_number: 'PAY-2024-003',
      payment_date: '2024-02-20T00:00:00Z',
      amount: 18000000,
      payment_method: 'Bank Transfer',
      description: 'Payment for PRO-2024-003',
      pro_number: 'PRO-2024-003'
    },
    {
      id: 4,
      reference_number: 'DEP-2024-001',
      payment_date: '2024-01-05T00:00:00Z',
      amount: 5000000,
      payment_method: 'Bank Transfer',
      description: 'Security deposit',
      pro_number: null
    }
  ]

  if (supplierLoading) {
    return (
      <AppLayout>
        <div className="p-6 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-600" />
            <p className="mt-4 text-gray-600">Loading supplier details...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!supplier) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Supplier Not Found</h2>
            <p className="text-gray-600 mt-2">The supplier you&apos;re looking for doesn&apos;t exist.</p>
            <button
              onClick={() => router.push('/suppliers')}
              className="mt-4 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Back to Suppliers
            </button>
          </div>
        </div>
      </AppLayout>
    )
  }

  // Calculate stats from real PRO data
  const totalOrders = pros.length
  const totalOrderValue = pros.reduce((sum: number, pro: any) => sum + (parseFloat(pro.total_amount) || 0), 0)
  const totalPaidValue = pros.reduce((sum: number, pro: any) => sum + (parseFloat(pro.received_value) || 0), 0)
  const totalOutstanding = totalOrderValue - totalPaidValue

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Completed</span>
      case 'partial':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Partial</span>
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Pending</span>
      case 'cancelled':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Cancelled</span>
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>
    }
  }

  const getBalanceDisplay = (balance: number) => {
    if (balance === 0) {
      return <span className="text-gray-600">Balanced</span>
    } else if (balance > 0) {
      return (
        <span className="text-red-600 flex items-center gap-1">
          <TrendingUp className="w-4 h-4" />
          They owe us {formatCurrency(balance)}
        </span>
      )
    } else {
      return (
        <span className="text-green-600 flex items-center gap-1">
          <TrendingDown className="w-4 h-4" />
          We owe them {formatCurrency(Math.abs(balance))}
        </span>
      )
    }
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/suppliers')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Suppliers
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{supplier.name}</h1>
              <p className="text-gray-600">{supplier.contact_person}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Printer className="h-4 w-4" />
              Print
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
              <Edit className="h-4 w-4" />
              Edit Supplier
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {['overview', 'orders', 'payments'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Financial Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-700">Total Orders</p>
                        <p className="text-2xl font-bold text-blue-900">{totalOrders}</p>
                      </div>
                      <Package className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-700">Total Value</p>
                        <p className="text-2xl font-bold text-purple-900">{formatCurrency(totalOrderValue)}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-700">Received Value</p>
                        <p className="text-2xl font-bold text-green-900">{formatCurrency(totalPaidValue)}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-700">Pending Value</p>
                        <p className="text-2xl font-bold text-red-900">{formatCurrency(totalOutstanding)}</p>
                      </div>
                      <Clock className="h-8 w-8 text-red-600" />
                    </div>
                  </div>
                </div>

                {/* Supplier Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {supplier.email || 'Not provided'}
                      </p>
                      <p className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {supplier.phone || 'Not provided'}
                      </p>
                      <p className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {supplier.address || 'Not provided'}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Business Information</h3>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Tax ID:</span> {supplier.tax_id || 'Not provided'}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Payment Terms:</span> {supplier.payment_terms || 'N/A'}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Credit Limit:</span> {formatCurrency(supplier.credit_limit || 0)}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Status:</span>{' '}
                        <span className={`${
                          supplier.status === 'active' ? 'text-green-600' :
                          supplier.status === 'suspended' ? 'text-yellow-600' :
                          supplier.status === 'blacklisted' ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {supplier.status ? supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1) : 'Unknown'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Balance Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Financial Balance</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Calculator className="h-8 w-8 text-gray-400" />
                      <div>
                        <p className="font-medium">Current Balance Status</p>
                        {getBalanceDisplay(supplier.current_balance || 0)}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Rating</p>
                      <p className="font-medium text-yellow-600">
                        {supplier.rating ? `${supplier.rating.toFixed(1)} / 5.0` : 'Not rated'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Order History (PROs)</h3>
                  <span className="text-sm text-gray-600">{pros.length} orders</span>
                </div>
                {prosLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
                    <span className="ml-2 text-gray-600">Loading orders...</span>
                  </div>
                ) : pros.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Package className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="mt-4 text-gray-600">No PROs found for this supplier</p>
                    <p className="text-sm text-gray-500 mt-2">
                      PROs with supplier "{supplier.name}" will appear here
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">PRO Number</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Title</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Items</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Created</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Total Amount</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Received Value</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Pending Value</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Status</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {pros.map((pro: any) => {
                          const totalAmount = parseFloat(pro.total_amount) || 0
                          const receivedValue = parseFloat(pro.received_value) || 0
                          const pendingValue = parseFloat(pro.pending_value) || 0

                          return (
                            <tr key={pro.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-blue-600">
                                {pro.pro_number}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {pro.title || 'Untitled PRO'}
                              </td>
                              <td className="px-4 py-3 text-center text-sm text-gray-600">
                                {pro.items_count || 0} items
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {new Date(pro.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                                {formatCurrency(totalAmount)}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-green-600 text-right">
                                {formatCurrency(receivedValue)}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-red-600 text-right">
                                {formatCurrency(pendingValue)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  pro.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  pro.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                                  pro.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {pro.status?.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  onClick={() => router.push(`/orders/pro/${pro.id}`)}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Payment History</h3>
                  <span className="text-sm text-gray-600">{mockPayments.length} payments</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Reference</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Payment Date</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Amount</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Method</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">PRO Reference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {mockPayments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-blue-600">{payment.reference_number}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(payment.payment_date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-green-600 text-right">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{payment.payment_method}</td>
                          <td className="px-4 py-3 text-sm text-blue-600">{payment.pro_number || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}