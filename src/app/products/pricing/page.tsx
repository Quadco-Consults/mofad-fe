'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import mockApi from '@/lib/mockApi'
import { formatDateTime } from '@/lib/utils'
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Tag,
  TrendingUp,
  TrendingDown,
  Target,
  Percent,
  Package,
  Users,
} from 'lucide-react'

interface PricingScheme {
  id: number
  scheme_name: string
  description: string
  markup_percentage: number
  min_margin: number
  max_margin: number
  applies_to: string
  status: 'active' | 'inactive'
  created_at: string
  products_count: number
}

const getStatusBadge = (status: string) => {
  const colors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

const getAppliesToIcon = (appliesTo: string) => {
  if (appliesTo.includes('All')) {
    return <Package className="w-4 h-4 text-primary" />
  } else if (appliesTo.includes('Fuel')) {
    return <Target className="w-4 h-4 text-red-500" />
  } else if (appliesTo.includes('Lubricants')) {
    return <TrendingUp className="w-4 h-4 text-blue-500" />
  }
  return <Tag className="w-4 h-4 text-gray-500" />
}

export default function PricingPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const { data: pricingSchemesList, isLoading } = useQuery({
    queryKey: ['pricing-schemes-list'],
    queryFn: () => mockApi.get('/pricing-schemes'),
  })

  const schemes = pricingSchemesList || []

  // Filter pricing schemes
  const filteredSchemes = schemes.filter((scheme: PricingScheme) => {
    const matchesSearch = scheme.scheme_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scheme.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scheme.applies_to.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || scheme.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pricing Schemes</h1>
            <p className="text-muted-foreground">Manage product pricing strategies and markup rules</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="mofad-btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              New Scheme
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Schemes</p>
                  <p className="text-2xl font-bold text-primary">5</p>
                </div>
                <Tag className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Schemes</p>
                  <p className="text-2xl font-bold text-green-600">4</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Markup</p>
                  <p className="text-2xl font-bold text-secondary">10.2%</p>
                </div>
                <Percent className="w-8 h-8 text-secondary/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Products Covered</p>
                  <p className="text-2xl font-bold text-accent">330</p>
                </div>
                <Package className="w-8 h-8 text-accent/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search pricing schemes..."
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <select
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Schemes Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 py-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4 mt-2"></div>
                      </div>
                      <div className="w-20 h-4 bg-gray-200 rounded"></div>
                      <div className="w-24 h-4 bg-gray-200 rounded"></div>
                      <div className="w-16 h-4 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : filteredSchemes.length === 0 ? (
              <div className="p-12 text-center">
                <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pricing schemes found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by creating your first pricing scheme'}
                </p>
                <Button className="mofad-btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  New Scheme
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Scheme</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Applies To</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Markup</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Min Margin</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Max Margin</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Products</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Created</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredSchemes.map((scheme: PricingScheme) => (
                      <tr key={scheme.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              {getAppliesToIcon(scheme.applies_to)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{scheme.scheme_name}</div>
                              <div className="text-sm text-gray-500">ID: {scheme.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-700">{scheme.applies_to}</span>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <p className="text-sm text-gray-600 truncate" title={scheme.description}>
                            {scheme.description}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-bold text-primary text-lg">
                            {scheme.markup_percentage}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-semibold text-green-600">
                            {scheme.min_margin}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-semibold text-red-600">
                            {scheme.max_margin}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Package className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{scheme.products_count}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(scheme.status)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-sm text-gray-500">
                            {formatDateTime(scheme.created_at).split(',')[0]}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Edit Scheme"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Delete Scheme"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}