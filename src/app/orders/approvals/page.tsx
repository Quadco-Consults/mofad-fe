'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import mockApi from '@/lib/mockApi'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  User,
  Calendar,
  Eye,
  MessageSquare,
} from 'lucide-react'

interface Approval {
  id: number
  type: 'PRF' | 'PRO' | 'Stock Transfer' | 'Customer Credit' | 'Expense'
  title: string
  description: string
  amount: number
  requested_by: string
  customer_name?: string // For PRF (customer orders)
  supplier_name?: string // For PRO (supplier orders)
  department?: string // For internal processes
  priority: 'low' | 'medium' | 'high' | 'urgent'
  created_at: string
  current_level: number
  required_level: number
  approvers: Array<{
    level: number
    name: string
    status: 'pending' | 'approved' | 'rejected'
    approved_at?: string
    comments?: string
  }>
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'PRF':
      return <FileText className="w-5 h-5 text-blue-500" />
    case 'PRO':
      return <FileText className="w-5 h-5 text-green-500" />
    case 'Stock Transfer':
      return <FileText className="w-5 h-5 text-purple-500" />
    case 'Customer Credit':
      return <User className="w-5 h-5 text-orange-500" />
    case 'Expense':
      return <Calendar className="w-5 h-5 text-red-500" />
    default:
      return <FileText className="w-5 h-5 text-gray-500" />
  }
}

const getPriorityBadge = (priority: string) => {
  const colors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority as keyof typeof colors]}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  )
}

const getApprovalProgress = (current: number, required: number) => {
  const percentage = Math.min((current / required) * 100, 100)
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <span className="text-xs text-muted-foreground">{current}/{required}</span>
    </div>
  )
}

export default function ApprovalsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const { data: approvalsList, isLoading } = useQuery({
    queryKey: ['approvals-list'],
    queryFn: () => mockApi.get('/approvals/pending'),
  })

  const approvals = approvalsList || []

  // Filter approvals
  const filteredApprovals = approvals.filter((approval: Approval) => {
    const matchesSearch = approval.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         approval.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         approval.requested_by.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === 'all' || approval.type === typeFilter
    const matchesPriority = priorityFilter === 'all' || approval.priority === priorityFilter

    return matchesSearch && matchesType && matchesPriority
  })

  const handleApprove = async (approvalId: number) => {
    // Mock approval action
    console.log('Approving:', approvalId)
  }

  const handleReject = async (approvalId: number) => {
    // Mock rejection action
    console.log('Rejecting:', approvalId)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pending Approvals</h1>
            <p className="text-muted-foreground">Review and approve pending requests</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">12</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Urgent</p>
                  <p className="text-2xl font-bold text-red-600">3</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold text-blue-600">18</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold text-secondary">₦28.4M</p>
                </div>
                <FileText className="w-8 h-8 text-secondary/60" />
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
                    placeholder="Search approvals..."
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <select
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="PRF">PRF</option>
                  <option value="PRO">PRO</option>
                  <option value="Stock Transfer">Stock Transfer</option>
                  <option value="Customer Credit">Customer Credit</option>
                  <option value="Expense">Expense</option>
                </select>

                <select
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="all">All Priority</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Approvals List */}
        <div className="space-y-4">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse">
                    <div className="h-20 bg-muted rounded-md"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            filteredApprovals.map((approval: Approval) => (
              <Card key={approval.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Main Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        {getTypeIcon(approval.type)}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{approval.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2">{approval.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">{formatCurrency(approval.amount)}</p>
                              {getPriorityBadge(approval.priority)}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Type</p>
                              <p className="font-medium">{approval.type}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">
                                {approval.type === 'PRF' ? 'Customer' :
                                 approval.type === 'PRO' ? 'Supplier' : 'Requested By'}
                              </p>
                              <p className="font-medium">
                                {approval.type === 'PRF' ? approval.customer_name :
                                 approval.type === 'PRO' ? approval.supplier_name :
                                 approval.requested_by}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">
                                {approval.type === 'PRF' ? 'Sales Rep' :
                                 approval.type === 'PRO' ? 'Procurement' : 'Department'}
                              </p>
                              <p className="font-medium">
                                {approval.type === 'PRF' ? approval.requested_by :
                                 approval.type === 'PRO' ? approval.requested_by :
                                 approval.department}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Submitted</p>
                              <p className="font-medium">{formatDateTime(approval.created_at)}</p>
                            </div>
                          </div>

                          {/* Approval Progress */}
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium">Approval Progress</p>
                              {getApprovalProgress(approval.current_level, approval.required_level)}
                            </div>

                            <div className="flex gap-2 flex-wrap">
                              {approval.approvers.map((approver, index) => (
                                <div key={index} className="flex items-center gap-2 text-xs">
                                  {approver.status === 'approved' ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  ) : approver.status === 'rejected' ? (
                                    <XCircle className="w-4 h-4 text-red-500" />
                                  ) : (
                                    <Clock className="w-4 h-4 text-yellow-500" />
                                  )}
                                  <span className="text-muted-foreground">L{approver.level}: {approver.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Comment
                      </Button>
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                        onClick={() => handleApprove(approval.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleReject(approval.id)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
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