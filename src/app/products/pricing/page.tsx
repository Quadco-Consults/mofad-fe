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

        {/* Pricing Schemes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse">
                    <div className="h-32 bg-muted rounded-md"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            filteredSchemes.map((scheme: PricingScheme) => (
              <Card key={scheme.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        {getAppliesToIcon(scheme.applies_to)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{scheme.scheme_name}</h3>
                        <p className="text-sm text-muted-foreground">{scheme.applies_to}</p>
                      </div>
                    </div>
                    {getStatusBadge(scheme.status)}
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {scheme.description}
                  </p>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Markup</span>
                      <span className="text-lg font-bold text-primary">{scheme.markup_percentage}%</span>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-muted-foreground">Min Margin</p>
                          <p className="font-semibold text-green-600">{scheme.min_margin}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Max Margin</p>
                          <p className="font-semibold text-red-600">{scheme.max_margin}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Products</span>
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{scheme.products_count}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Created</span>
                      <span className="text-xs font-medium">
                        {formatDateTime(scheme.created_at).split(',')[0]}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  )
}