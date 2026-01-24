'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import api from '@/lib/api-client'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import {
  Search,
  Plus,
  Building,
  Phone,
  Mail,
  MapPin,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Calculator,
  CreditCard,
  Package,
  Loader2,
  X,
  Save,
  Filter,
  Download
} from 'lucide-react'

interface Supplier {
  id: number
  name: string
  contact_person?: string
  email?: string
  phone?: string
  address?: string
  tax_number?: string
  payment_terms?: number
  credit_limit?: number
  is_active: boolean
  created_at: string
  updated_at: string

  // Financial data
  total_orders: number
  total_ordered_value: number
  total_paid: number
  outstanding_balance: number
  deposits: number
  last_order_date?: string
  last_payment_date?: string
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

interface SupplierFormData {
  name: string
  contact_person: string
  email: string
  phone: string
  address: string
  tax_number: string
  payment_terms: number | null
  credit_limit: number | null
}

export default function SuppliersPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'payments'>('overview')

  // Form state
  const [formData, setFormData] = useState<SupplierFormData>({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    tax_number: '',
    payment_terms: 30,
    credit_limit: null
  })

  // Mock suppliers data (in real app, this would come from API)
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
    }
  ]

  // Filtered suppliers based on search
  const filteredSuppliers = mockSuppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate summary statistics
  const totalSuppliers = mockSuppliers.length
  const activeSuppliers = mockSuppliers.filter(s => s.is_active).length
  const totalOutstanding = mockSuppliers.reduce((sum, s) => sum + Math.abs(s.outstanding_balance), 0)
  const totalDeposits = mockSuppliers.reduce((sum, s) => sum + s.deposits, 0)

  const handleAddSupplier = () => {
    setFormData({
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      tax_number: '',
      payment_terms: 30,
      credit_limit: null
    })
    setShowAddModal(true)
  }

  const handleEditSupplier = (supplier: Supplier) => {
    setFormData({
      name: supplier.name,
      contact_person: supplier.contact_person || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      tax_number: supplier.tax_number || '',
      payment_terms: supplier.payment_terms || 30,
      credit_limit: supplier.credit_limit
    })
    setSelectedSupplier(supplier)
    setShowAddModal(true)
  }

  const handleViewSupplier = (supplier: Supplier) => {
    router.push(`/suppliers/${supplier.id}`)
  }

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Supplier Management</h1>
            <p className="text-gray-600">Manage suppliers, track orders, payments, and balances</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleAddSupplier}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Supplier
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
                <p className="text-2xl font-bold text-gray-900">{totalSuppliers}</p>
                <p className="text-xs text-gray-500">{activeSuppliers} active</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Deposits</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalDeposits)}</p>
                <p className="text-xs text-green-600">Available funds</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding Balances</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalOutstanding)}</p>
                <p className="text-xs text-yellow-600">Pending amounts</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockSuppliers.reduce((sum, s) => sum + s.total_orders, 0)}
                </p>
                <p className="text-xs text-blue-600">Total orders placed</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                <option>All Suppliers</option>
                <option>Active Only</option>
                <option>Inactive Only</option>
              </select>
              <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Filter className="w-4 h-4" />
                More Filters
              </button>
            </div>
          </div>
        </div>

        {/* Suppliers Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-orange-500 to-amber-500">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Supplier</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Contact</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-white">Orders</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-white">Total Value</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-white">Balance</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-white">Deposits</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-white">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm ? 'No suppliers found matching your search.' : 'No suppliers available.'}
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map((supplier, index) => (
                    <tr key={supplier.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Building className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{supplier.name}</div>
                            <div className="text-sm text-gray-500">{supplier.contact_person}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        <div className="text-sm">
                          {supplier.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-gray-400" />
                              {supplier.email}
                            </div>
                          )}
                          {supplier.phone && (
                            <div className="flex items-center gap-1 mt-1">
                              <Phone className="w-3 h-3 text-gray-400" />
                              {supplier.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-medium text-gray-900">{supplier.total_orders}</div>
                        <div className="text-xs text-gray-500">
                          {supplier.last_order_date ? `Last: ${new Date(supplier.last_order_date).toLocaleDateString()}` : 'No orders'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        {formatCurrency(supplier.total_ordered_value)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {getBalanceDisplay(supplier.outstanding_balance)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-green-600">
                        {formatCurrency(supplier.deposits)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          supplier.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {supplier.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleViewSupplier(supplier)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditSupplier(supplier)}
                            className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Supplier Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setSelectedSupplier(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Company name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                    <input
                      type="text"
                      value={formData.contact_person}
                      onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Contact person name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="supplier@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="+234 xxx xxx xxxx"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Company address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax Number</label>
                    <input
                      type="text"
                      value={formData.tax_number}
                      onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Tax identification number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms (Days)</label>
                    <input
                      type="number"
                      value={formData.payment_terms || ''}
                      onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="30"
                      min="0"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit (₦)</label>
                    <input
                      type="number"
                      value={formData.credit_limit || ''}
                      onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value ? parseFloat(e.target.value) : null })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setSelectedSupplier(null)
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {selectedSupplier ? 'Update' : 'Create'} Supplier
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Supplier Details Modal */}
        {showDetailsModal && selectedSupplier && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedSupplier.name}</h2>
                  <p className="text-gray-600">{selectedSupplier.contact_person}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-700">Total Orders</p>
                            <p className="text-2xl font-bold text-blue-900">{selectedSupplier.total_orders}</p>
                          </div>
                          <Package className="h-8 w-8 text-blue-600" />
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-700">Total Paid</p>
                            <p className="text-2xl font-bold text-green-900">{formatCurrency(selectedSupplier.total_paid)}</p>
                          </div>
                          <DollarSign className="h-8 w-8 text-green-600" />
                        </div>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-yellow-700">Deposits</p>
                            <p className="text-2xl font-bold text-yellow-900">{formatCurrency(selectedSupplier.deposits)}</p>
                          </div>
                          <CreditCard className="h-8 w-8 text-yellow-600" />
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
                            {selectedSupplier.email || 'Not provided'}
                          </p>
                          <p className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {selectedSupplier.phone || 'Not provided'}
                          </p>
                          <p className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {selectedSupplier.address || 'Not provided'}
                          </p>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-3">Business Information</h3>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="font-medium">Tax Number:</span> {selectedSupplier.tax_number || 'Not provided'}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Payment Terms:</span> {selectedSupplier.payment_terms || 'N/A'} days
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Credit Limit:</span> {formatCurrency(selectedSupplier.credit_limit || 0)}
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
                            {getBalanceDisplay(selectedSupplier.outstanding_balance)}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Last Payment</p>
                          <p className="font-medium">
                            {selectedSupplier.last_payment_date
                              ? new Date(selectedSupplier.last_payment_date).toLocaleDateString()
                              : 'No payments yet'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Order History</h3>
                      <span className="text-sm text-gray-600">{mockOrders.length} orders</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">PRO Number</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Title</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Order Date</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Amount</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Outstanding</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {mockOrders.map((order) => (
                            <tr key={order.id}>
                              <td className="px-4 py-3 text-sm font-medium text-blue-600">{order.pro_number}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{order.title}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {new Date(order.order_date).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                                {formatCurrency(order.total_amount)}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-red-600 text-right">
                                {formatCurrency(order.outstanding_amount)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {getStatusBadge(order.status)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
                            <tr key={payment.id}>
                              <td className="px-4 py-3 text-sm font-medium text-blue-600">{payment.reference_number}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {new Date(payment.payment_date).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-green-600 text-right">
                                {formatCurrency(payment.amount)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">{payment.payment_method}</td>
                              <td className="px-4 py-3 text-sm text-blue-600">{payment.pro_number}</td>
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
        )}
      </div>
    </AppLayout>
  )
}