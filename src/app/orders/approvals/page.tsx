'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
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
  Edit,
  Trash2,
  Package,
  ShoppingCart,
  Building,
} from 'lucide-react'

interface Approval {
  id: number | string
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

// Table-specific helper functions
const getTableStatusIcon = (current_level: number, required_level: number) => {
  if (current_level >= required_level) {
    return <CheckCircle className="w-4 h-4 text-green-500" />
  } else if (current_level > 0) {
    return <Clock className="w-4 h-4 text-yellow-500" />
  } else {
    return <AlertTriangle className="w-4 h-4 text-red-500" />
  }
}

const getTableStatusBadge = (current_level: number, required_level: number) => {
  if (current_level >= required_level) {
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Approved
      </span>
    )
  } else if (current_level > 0) {
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Partial ({current_level}/{required_level})
      </span>
    )
  } else {
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Pending
      </span>
    )
  }
}

const getTablePriorityBadge = (priority: string) => {
  const colors = {
    urgent: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority as keyof typeof colors]}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  )
}

export default function ApprovalsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const { data: approvalsList, isLoading, refetch } = useQuery({
    queryKey: ['approvals-list'],
    queryFn: () => mockApi.get('/approvals/pending'),
  })

  const approvals = approvalsList || []

  // Debug logging
  console.log('Approvals data:', approvals)
  console.log('Is loading:', isLoading)

  // Filter approvals
  const filteredApprovals = approvals.filter((approval: Approval) => {
    const matchesSearch = approval.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         approval.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         approval.requested_by.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === 'all' || approval.type === typeFilter
    const matchesPriority = priorityFilter === 'all' || approval.priority === priorityFilter

    return matchesSearch && matchesType && matchesPriority
  })

  // Debug logging after filteredApprovals is defined
  console.log('Filtered approvals count:', filteredApprovals.length)

  const handleApprove = async (approvalId: number | string) => {
    console.log('✅ Approve button clicked:', approvalId)

    try {
      // Check if it's a PRF or PRO from localStorage
      if (typeof approvalId === 'string') {
        if (approvalId.startsWith('prf-')) {
          const prfId = parseInt(approvalId.replace('prf-', ''))
          console.log('Approving PRF:', prfId)
          updatePRFStatus(prfId, 'approved')
          alert(`PRF #${prfId} has been approved!`)
        } else if (approvalId.startsWith('pro-')) {
          const proId = parseInt(approvalId.replace('pro-', ''))
          console.log('Approving PRO:', proId)
          updatePROStatus(proId, 'confirmed')
          alert(`PRO #${proId} has been approved!`)
        }
      } else {
        console.log('Approving static item:', approvalId)
        alert(`Approval #${approvalId} has been approved!`)
      }

      console.log('Approved:', approvalId)
      // Refetch approvals to update the list
      refetch()
    } catch (error) {
      console.error('Error approving:', error)
      alert(`Error approving: ${error}`)
    }
  }

  const handleReject = async (approvalId: number | string) => {
    console.log('Reject button clicked:', approvalId)
    try {
      // Check if it's a PRF or PRO from localStorage
      if (typeof approvalId === 'string') {
        if (approvalId.startsWith('prf-')) {
          const prfId = parseInt(approvalId.replace('prf-', ''))
          console.log('Rejecting PRF:', prfId)
          updatePRFStatus(prfId, 'rejected')
        } else if (approvalId.startsWith('pro-')) {
          const proId = parseInt(approvalId.replace('pro-', ''))
          console.log('Rejecting PRO:', proId)
          updatePROStatus(proId, 'cancelled')
        }
      } else {
        console.log('Rejecting static item:', approvalId)
        alert(`Rejected ${approvalId}`)
      }

      console.log('Rejected:', approvalId)
      // Refetch approvals to update the list
      refetch()
    } catch (error) {
      console.error('Error rejecting:', error)
    }
  }

  // Helper functions to update PRF/PRO status in localStorage
  const updatePRFStatus = (prfId: number, status: string) => {
    try {
      const stored = localStorage.getItem('mofad_mock_prfs')
      if (stored) {
        const prfs = JSON.parse(stored)
        const updatedPRFs = prfs.map((prf: any) =>
          prf.id === prfId ? { ...prf, status, approved_at: new Date().toISOString() } : prf
        )
        localStorage.setItem('mofad_mock_prfs', JSON.stringify(updatedPRFs))
      }
    } catch (error) {
      console.error('Error updating PRF status:', error)
    }
  }

  const updatePROStatus = (proId: number, status: string) => {
    try {
      const stored = localStorage.getItem('mofad_mock_pros')
      if (stored) {
        const pros = JSON.parse(stored)
        const updatedPROs = pros.map((pro: any) =>
          pro.id === proId ? { ...pro, status, approved_at: new Date().toISOString() } : pro
        )
        localStorage.setItem('mofad_mock_pros', JSON.stringify(updatedPROs))
      }
    } catch (error) {
      console.error('Error updating PRO status:', error)
    }
  }

  const handleView = (approvalId: number | string, type: string) => {
    console.log('🔍 View button clicked:', approvalId, type, typeof approvalId)

    if (typeof approvalId === 'string') {
      if (approvalId.startsWith('prf-')) {
        const prfId = parseInt(approvalId.replace('prf-', ''))
        console.log('Navigating to PRF:', prfId)
        router.push(`/orders/prf/${prfId}`)
      } else if (approvalId.startsWith('pro-')) {
        const proId = parseInt(approvalId.replace('pro-', ''))
        console.log('Navigating to PRO:', proId)
        router.push(`/orders/pro/${proId}`)
      }
    } else {
      // Handle static approval items - find the approval in our data and show details
      console.log('Viewing static approval:', approvalId, type)

      const approval = filteredApprovals.find((a: any) => a.id === approvalId)
      if (approval) {
        // Show detailed information for static approval items
        const detailsMessage = `
📋 ${approval.title}
💰 Amount: ${formatCurrency(approval.amount)}
📝 Description: ${approval.description}
🏢 ${approval.type === 'PRF' ? 'Customer' : approval.type === 'PRO' ? 'Supplier' : 'Requested by'}: ${
  approval.type === 'PRF' ? approval.customer_name :
  approval.type === 'PRO' ? approval.supplier_name :
  approval.requested_by
}
⚡ Priority: ${approval.priority.toUpperCase()}
📅 Submitted: ${formatDateTime(approval.created_at)}
📊 Status: ${approval.current_level}/${approval.required_level} approvals

ℹ️ This is a demo ${approval.type} item for approval workflow testing.
To approve or reject, use the buttons in the main table.
        `
        alert(detailsMessage.trim())
      } else {
        alert(`${type} #${approvalId} details not found`)
      }
    }
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

        {/* Approvals Table */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-muted rounded-md"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Request</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer/Supplier</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Priority</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Submitted</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApprovals.map((approval: Approval) => (
                      <tr key={approval.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {getTableStatusIcon(approval.current_level, approval.required_level)}
                            <div className="ml-3">
                              <p className="font-medium">
                                {approval.title}
                                {typeof approval.id === 'number' && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    DEMO
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground">{approval.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {getTypeIcon(approval.type)}
                            <span className="ml-2 font-medium">{approval.type}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">
                              {approval.type === 'PRF' ? approval.customer_name :
                               approval.type === 'PRO' ? approval.supplier_name :
                               approval.requested_by}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              by {approval.requested_by}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium">{formatCurrency(approval.amount)}</td>
                        <td className="py-3 px-4">{getTablePriorityBadge(approval.priority)}</td>
                        <td className="py-3 px-4">{getTableStatusBadge(approval.current_level, approval.required_level)}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {formatDateTime(approval.created_at)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(approval.id, approval.type)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleApprove(approval.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleReject(approval.id)}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Debug info - smaller and less prominent */}
            <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-muted-foreground">
              <p>Debug: {filteredApprovals.length} of {approvals.length} approvals shown</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}