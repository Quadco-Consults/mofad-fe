'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import apiClient from '@/lib/apiClient'
import { formatCurrency } from '@/lib/utils'
import {
  RotateCcw,
  AlertTriangle,
  FileText,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Plus,
  Download,
  Filter,
  Search,
  RefreshCw,
  TrendingDown,
  Eye,
  Truck,
} from 'lucide-react'
import type { SupplierReturnNote, SRNStats, SRNStatus, ReturnType } from '@/types/supplier-returns'
import { getStatusLabel, getStatusColor, getReturnTypeLabel } from '@/types/supplier-returns'

interface MetricCardProps {
  title: string
  value: number | string
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  trend?: number
  color?: 'orange' | 'blue' | 'green' | 'red' | 'purple' | 'yellow'
}

const MetricCard = ({ title, value, subtitle, icon: Icon, trend, color = 'orange' }: MetricCardProps) => {
  const colors = {
    orange: 'from-orange-500 to-orange-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
    yellow: 'from-yellow-500 to-yellow-600'
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">
              {typeof value === 'number' && title.includes('Amount') ? formatCurrency(value) : value}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]} text-white group-hover:scale-110 transition-transform`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        {trend !== undefined && (
          <div className="mt-4 flex items-center text-sm">
            <TrendingDown className={`h-4 w-4 mr-1 ${trend > 0 ? 'text-red-600' : 'text-green-600'}`} />
            <span className={trend > 0 ? 'text-red-600' : 'text-green-600'}>
              {Math.abs(trend)}% vs last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const StatusBadge = ({ status }: { status: SRNStatus }) => {
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {getStatusLabel(status)}
    </span>
  )
}

const ReturnTypeBadge = ({ type }: { type: ReturnType }) => {
  const typeColors: Record<ReturnType, string> = {
    damaged: 'bg-red-100 text-red-800',
    leakage: 'bg-orange-100 text-orange-800',
    expired: 'bg-yellow-100 text-yellow-800',
    wrong_product: 'bg-purple-100 text-purple-800',
    quality_issue: 'bg-pink-100 text-pink-800',
    short_delivery: 'bg-blue-100 text-blue-800',
    other: 'bg-gray-100 text-gray-800',
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeColors[type]}`}>
      <AlertTriangle className="w-3 h-3 mr-1" />
      {getReturnTypeLabel(type)}
    </span>
  )
}

export default function SupplierReturnsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  // Fetch supplier returns
  const { data: returns, isLoading, refetch } = useQuery({
    queryKey: ['supplier-returns', statusFilter, typeFilter, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (typeFilter !== 'all') params.append('return_type', typeFilter)
      if (searchTerm) params.append('search', searchTerm)

      const response = await apiClient.get(`/supplier-returns/?${params.toString()}`)
      return response as SupplierReturnNote[]
    },
  })

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ['supplier-returns-stats'],
    queryFn: async () => {
      const response = await apiClient.get('/supplier-returns/stats/')
      return response as SRNStats
    },
  })

  const handleCreateReturn = () => {
    router.push('/supplier-returns/create')
  }

  const handleViewReturn = (id: number) => {
    router.push(`/supplier-returns/${id}`)
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Supplier Returns</h1>
            <p className="text-gray-600">Manage returns of defective or damaged goods to suppliers</p>
          </div>

          <div className="flex items-center space-x-4">
            <Button onClick={handleCreateReturn} className="bg-mofad-green hover:bg-mofad-green/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Return
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Returns"
            value={stats?.total_returns || 0}
            subtitle="This month"
            icon={RotateCcw}
            color="orange"
          />
          <MetricCard
            title="Total Value"
            value={stats?.total_value || 0}
            subtitle="Returned this month"
            icon={DollarSign}
            color="red"
          />
          <MetricCard
            title="Pending Approval"
            value={stats?.pending_approval || 0}
            subtitle="Awaiting management"
            icon={Clock}
            color="yellow"
          />
          <MetricCard
            title="Completed"
            value={stats?.completed || 0}
            subtitle="Resolved returns"
            icon={CheckCircle}
            color="green"
          />
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search returns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mofad-green w-64"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mofad-green"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="awaiting_pickup">Awaiting Pickup</option>
                  <option value="replacement_pending">Replacement Pending</option>
                  <option value="closed">Closed</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mofad-green"
                >
                  <option value="all">All Types</option>
                  <option value="damaged">Damaged</option>
                  <option value="leakage">Leakage</option>
                  <option value="expired">Expired</option>
                  <option value="quality_issue">Quality Issue</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Returns Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Supplier Return Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-mofad-green"></div>
                <p className="mt-2 text-gray-600">Loading returns...</p>
              </div>
            ) : returns && returns.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">SRN Number</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Supplier</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Return Type</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Total Value</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Items</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Created By</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returns.map((returnNote) => (
                      <tr key={returnNote.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{returnNote.srn_number}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(returnNote.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{returnNote.supplier}</p>
                            <p className="text-sm text-gray-500">{returnNote.pro_number}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <ReturnTypeBadge type={returnNote.return_type} />
                        </td>
                        <td className="py-4 px-4 text-right">
                          <p className="font-bold text-gray-900">
                            {formatCurrency(parseFloat(returnNote.total_return_value))}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1 text-gray-700">
                            <Package className="w-4 h-4" />
                            <span>{returnNote.items_count} items</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-gray-900">{returnNote.created_by_name}</p>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <StatusBadge status={returnNote.status} />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewReturn(returnNote.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No supplier returns found</p>
                <p className="text-sm text-gray-500 mb-4">
                  Create your first return to track defective or damaged goods
                </p>
                <Button onClick={handleCreateReturn} className="bg-mofad-green hover:bg-mofad-green/90 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Return
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Return Type Summary */}
        {stats && stats.by_return_type && stats.by_return_type.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Returns by Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.by_return_type.map((typeData) => (
                  <div key={typeData.return_type} className="p-4 bg-gray-50 rounded-lg">
                    <ReturnTypeBadge type={typeData.return_type} />
                    <p className="mt-2 text-2xl font-bold text-gray-900">{typeData.count}</p>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(typeData.total_value || 0)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
