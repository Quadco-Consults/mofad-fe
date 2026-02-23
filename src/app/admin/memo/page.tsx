'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import apiClient from '@/lib/apiClient'
import {
  Search,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  ShoppingCart,
  Calendar,
  User,
  DollarSign,
  Package,
} from 'lucide-react'

// Memo interface matching backend
interface Memo {
  id: number
  memo_number: string
  title: string
  subject: string
  category: 'general' | 'policy' | 'announcement' | 'directive' | 'circular' | 'minutes' | 'report' | 'procurement'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'draft' | 'coo_review' | 'md_review' | 'approved' | 'rejected'
  supplier: number | null
  supplier_name?: string
  total_estimated_cost: number
  payment_confirmed: boolean
  has_generated_pro: boolean
  items_count: number
  created_by_name?: string
  created_at: string
}

const categoryIcons = {
  general: FileText,
  policy: FileText,
  announcement: FileText,
  directive: FileText,
  circular: FileText,
  minutes: FileText,
  report: FileText,
  procurement: ShoppingCart,
}

const categoryLabels = {
  general: 'General',
  policy: 'Policy',
  announcement: 'Announcement',
  directive: 'Directive',
  circular: 'Circular',
  minutes: 'Meeting Minutes',
  report: 'Report',
  procurement: 'Procurement Request',
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  coo_review: 'bg-blue-100 text-blue-800',
  md_review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

const statusLabels = {
  draft: 'Draft',
  coo_review: 'COO Review',
  md_review: 'MD Review',
  approved: 'Approved',
  rejected: 'Rejected',
}

const statusIcons = {
  draft: FileText,
  coo_review: Clock,
  md_review: Clock,
  approved: CheckCircle,
  rejected: XCircle,
}

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  normal: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function MemoListPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Fetch memos from API
  const { data: memosData, isLoading } = useQuery({
    queryKey: ['memos', filterCategory, filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filterCategory !== 'all') params.append('category', filterCategory)
      if (filterStatus !== 'all') params.append('status', filterStatus)

      const response = await apiClient.get(`/memos/?${params.toString()}`)
      return response
    },
  })

  const memos: Memo[] = memosData?.results || memosData || []

  // Filter memos by search term
  const filteredMemos = memos.filter((memo) =>
    memo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    memo.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    memo.memo_number.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate stats
  const stats = {
    total: memos.length,
    procurement: memos.filter(m => m.category === 'procurement').length,
    pending: memos.filter(m => ['coo_review', 'md_review'].includes(m.status)).length,
    approved: memos.filter(m => m.status === 'approved').length,
    totalValue: memos
      .filter(m => m.category === 'procurement')
      .reduce((sum, m) => sum + m.total_estimated_cost, 0),
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Memos</h1>
            <p className="text-muted-foreground mt-1">
              Manage official memos and procurement requests
            </p>
          </div>
          <Button onClick={() => router.push('/admin/memo/create')}>
            <Plus className="w-4 h-4 mr-2" />
            Create Memo
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Memos</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Procurement</p>
                  <p className="text-2xl font-bold">{stats.procurement}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold">{stats.approved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-lg font-bold">{formatCurrency(stats.totalValue)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search memos..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Category Filter */}
              <select
                className="px-4 py-2 border border-gray-300 rounded-md"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="procurement">Procurement</option>
                <option value="general">General</option>
                <option value="policy">Policy</option>
                <option value="announcement">Announcement</option>
              </select>

              {/* Status Filter */}
              <select
                className="px-4 py-2 border border-gray-300 rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="coo_review">COO Review</option>
                <option value="md_review">MD Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Memos List */}
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading memos...</p>
              </div>
            ) : filteredMemos.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">No memos found</p>
                <p className="text-muted-foreground mt-2">
                  {searchTerm ? 'Try adjusting your search' : 'Create your first memo to get started'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Memo #</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Title</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Priority</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Created</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredMemos.map((memo) => {
                      const CategoryIcon = categoryIcons[memo.category]
                      const StatusIcon = statusIcons[memo.status]

                      return (
                        <tr key={memo.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <CategoryIcon className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{memo.memo_number}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-medium">{memo.title}</p>
                              {memo.category === 'procurement' && memo.supplier_name && (
                                <p className="text-sm text-muted-foreground">
                                  Supplier: {memo.supplier_name}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {categoryLabels[memo.category]}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <StatusIcon className="w-4 h-4" />
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[memo.status]}`}>
                                {statusLabels[memo.status]}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[memo.priority]}`}>
                              {memo.priority.charAt(0).toUpperCase() + memo.priority.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {memo.category === 'procurement' ? (
                              <div>
                                <p className="font-medium">{formatCurrency(memo.total_estimated_cost)}</p>
                                <p className="text-xs text-muted-foreground">{memo.items_count} items</p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <p className="text-sm">{formatDate(memo.created_at)}</p>
                              {memo.created_by_name && (
                                <p className="text-xs text-muted-foreground">{memo.created_by_name}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/admin/memo/${memo.id}`)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
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
