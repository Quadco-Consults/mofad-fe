'use client'

import { useState } from 'react'
import { Plus, Search, Edit, Trash2, Users, Percent, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AppLayout } from '@/components/layout/AppLayout'

interface CustomerType {
  id: string
  name: string
  description: string
  discountPercentage: number
  creditLimit: number
  paymentTerms: number // days
  customers: number
  totalRevenue: number
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

const mockCustomerTypes: CustomerType[] = [
  {
    id: 'CT001',
    name: 'Major Oil Marketing Companies',
    description: 'Large-scale petroleum distributors and marketing companies',
    discountPercentage: 15,
    creditLimit: 50000000,
    paymentTerms: 60,
    customers: 12,
    totalRevenue: 285000000,
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-12-10T14:20:00Z'
  },
  {
    id: 'CT002',
    name: 'Independent Fuel Retailers',
    description: 'Independent filling station owners and small retailers',
    discountPercentage: 8,
    creditLimit: 5000000,
    paymentTerms: 30,
    customers: 145,
    totalRevenue: 125000000,
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-12-08T16:45:00Z'
  },
  {
    id: 'CT003',
    name: 'Industrial Customers',
    description: 'Manufacturing companies and industrial facilities',
    discountPercentage: 12,
    creditLimit: 20000000,
    paymentTerms: 45,
    customers: 35,
    totalRevenue: 95000000,
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-12-05T09:15:00Z'
  },
  {
    id: 'CT004',
    name: 'Fleet Operators',
    description: 'Transportation and logistics companies with vehicle fleets',
    discountPercentage: 10,
    creditLimit: 15000000,
    paymentTerms: 30,
    customers: 68,
    totalRevenue: 78000000,
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-12-01T11:30:00Z'
  },
  {
    id: 'CT005',
    name: 'Government Agencies',
    description: 'Federal, state, and local government departments',
    discountPercentage: 5,
    creditLimit: 30000000,
    paymentTerms: 90,
    customers: 23,
    totalRevenue: 42000000,
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-11-28T13:45:00Z'
  },
  {
    id: 'CT006',
    name: 'Marine & Aviation',
    description: 'Shipping companies, ports, and aviation fuel customers',
    discountPercentage: 18,
    creditLimit: 35000000,
    paymentTerms: 45,
    customers: 8,
    totalRevenue: 65000000,
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-12-12T08:20:00Z'
  },
  {
    id: 'CT007',
    name: 'Cash Customers',
    description: 'Walk-in customers paying cash on delivery',
    discountPercentage: 0,
    creditLimit: 0,
    paymentTerms: 0,
    customers: 892,
    totalRevenue: 18000000,
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-12-15T17:10:00Z'
  },
  {
    id: 'CT008',
    name: 'Wholesale Distributors',
    description: 'Regional distributors and wholesale traders',
    discountPercentage: 20,
    creditLimit: 40000000,
    paymentTerms: 60,
    customers: 25,
    totalRevenue: 156000000,
    status: 'inactive',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-10-20T12:00:00Z'
  }
]

function CustomerTypesPage() {
  const [customerTypes] = useState<CustomerType[]>(mockCustomerTypes)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [showAddModal, setShowAddModal] = useState(false)

  const filteredTypes = customerTypes.filter(type => {
    const matchesSearch = type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         type.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || type.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800'
  }

  // Calculate summary stats
  const totalTypes = customerTypes.length
  const activeTypes = customerTypes.filter(t => t.status === 'active').length
  const totalCustomers = customerTypes.reduce((sum, t) => sum + t.customers, 0)
  const totalRevenue = customerTypes.filter(t => t.status === 'active').reduce((sum, t) => sum + t.totalRevenue, 0)

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Types</h1>
          <p className="text-gray-600">Manage customer categories and their pricing structures</p>
        </div>
        <Button
          className="mofad-btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Customer Type
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="mofad-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Types</p>
              <p className="text-2xl font-bold text-gray-900">{totalTypes}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="mofad-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Types</p>
              <p className="text-2xl font-bold text-green-600">{activeTypes}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="mofad-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-purple-600">{totalCustomers.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="mofad-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-primary-600">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search customer types..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Customer Types Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTypes.map((type) => (
          <div key={type.id} className="mofad-card">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{type.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(type.status)}`}>
                    {type.status.charAt(0).toUpperCase() + type.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                <div className="text-xs text-gray-500">
                  ID: {type.id} | Created: {formatDate(type.createdAt)}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Percent className="h-4 w-4 text-green-600" />
                  <span className="text-lg font-bold text-green-600">{type.discountPercentage}%</span>
                </div>
                <p className="text-xs text-gray-600">Discount Rate</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-blue-600">{type.customers}</p>
                <p className="text-xs text-gray-600">Active Customers</p>
              </div>
            </div>

            {/* Financial Details */}
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Credit Limit</span>
                <span className="font-medium text-gray-900">{formatCurrency(type.creditLimit)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Payment Terms</span>
                <span className="font-medium text-gray-900">{type.paymentTerms} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Revenue</span>
                <span className="font-medium text-primary-600">{formatCurrency(type.totalRevenue)}</span>
              </div>
            </div>

            {/* Revenue per Customer */}
            <div className="mb-4 p-3 bg-primary-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-700">Avg. Revenue per Customer</span>
                <span className="font-bold text-primary-900">
                  {formatCurrency(type.customers > 0 ? type.totalRevenue / type.customers : 0)}
                </span>
              </div>
            </div>

            {/* Last Updated */}
            <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-200">
              <span>Last Updated</span>
              <span>{formatDate(type.updatedAt)}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1">
                View Customers
              </Button>
              <Button variant="outline" className="flex-1">
                Edit Terms
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredTypes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No customer types found matching your criteria.</p>
        </div>
      )}

      {/* Add Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Add Customer Type</h3>
            <p className="text-gray-600 mb-4">Customer type creation form would go here.</p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button className="mofad-btn-primary">
                Create Type
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </AppLayout>
  )
}

export default CustomerTypesPage