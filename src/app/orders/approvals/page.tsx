'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
  Trash2,
  RefreshCw,
  Package,
  Store,
  Building,
  DollarSign,
  Truck,
} from 'lucide-react'

interface PendingApproval {
  id: number
  type: string
  number: string
  title: string
  description: string
  amount: number
  status: string
  created_at: string
  created_by: string
  entity_name?: string
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'prf':
      return <FileText className="w-5 h-5 text-blue-500" />
    case 'pro':
      return <Package className="w-5 h-5 text-green-500" />
    case 'sst':
      return <Store className="w-5 h-5 text-purple-500" />
    case 'lst':
      return <Building className="w-5 h-5 text-orange-500" />
    case 'stock_transfer':
      return <Truck className="w-5 h-5 text-cyan-500" />
    case 'expense':
      return <DollarSign className="w-5 h-5 text-red-500" />
    case 'lodgement':
      return <DollarSign className="w-5 h-5 text-emerald-500" />
    default:
      return <FileText className="w-5 h-5 text-gray-500" />
  }
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    prf: 'PRF',
    pro: 'PRO',
    sst: 'SST',
    lst: 'LST',
    stock_transfer: 'Stock Transfer',
    expense: 'Expense',
    lodgement: 'Lodgement',
  }
  return labels[type] || type.toUpperCase()
}

const getTypeBadgeColor = (type: string) => {
  const colors: Record<string, string> = {
    prf: 'bg-blue-100 text-blue-800',
    pro: 'bg-green-100 text-green-800',
    sst: 'bg-purple-100 text-purple-800',
    lst: 'bg-orange-100 text-orange-800',
    stock_transfer: 'bg-cyan-100 text-cyan-800',
    expense: 'bg-red-100 text-red-800',
    lodgement: 'bg-emerald-100 text-emerald-800',
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

export default function ApprovalsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [itemToReject, setItemToReject] = useState<PendingApproval | null>(null)
  const [bulkRejectMode, setBulkRejectMode] = useState(false)

  // Fetch pending approvals
  const { data: approvalsData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['pending-approvals', typeFilter, searchTerm, currentPage, pageSize],
    queryFn: () => apiClient.getAllPendingApprovals({
      type: typeFilter !== 'all' ? typeFilter : undefined,
      search: searchTerm || undefined,
      page: currentPage,
      page_size: pageSize,
    }),
  })

  const approvals = approvalsData?.items || []
  const counts = approvalsData?.counts || {
    prfs: 0, pros: 0, ssts: 0, lsts: 0,
    stock_transfers: 0, expenses: 0, lodgements: 0, total: 0
  }
  const totalPages = approvalsData?.total_pages || 1
  const total = approvalsData?.total || 0

  // Calculate total value
  const totalValue = useMemo(() => {
    return approvals.reduce((sum, item) => sum + (item.amount || 0), 0)
  }, [approvals])

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (item: PendingApproval) => {
      switch (item.type) {
        case 'prf':
          return apiClient.approvePrf(item.id)
        case 'pro':
          return apiClient.approvePro(item.id)
        case 'sst':
          return apiClient.approveSst(item.id)
        case 'lst':
          return apiClient.confirmLst(item.id)
        case 'stock_transfer':
          return apiClient.approveStockTransfer(item.id)
        case 'expense':
          return apiClient.approveExpense(item.id)
        case 'lodgement':
          return apiClient.approveLodgement(item.id)
        default:
          throw new Error(`Unknown type: ${item.type}`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] })
      refetch()
    },
  })

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ item, reason }: { item: PendingApproval; reason: string }) => {
      switch (item.type) {
        case 'prf':
          return apiClient.rejectPrf(item.id, reason)
        case 'pro':
          return apiClient.rejectPro(item.id, reason)
        case 'sst':
          return apiClient.rejectSst(item.id, reason)
        case 'lst':
          return apiClient.rejectLst(item.id, reason)
        case 'stock_transfer':
          return apiClient.rejectStockTransfer(item.id, reason)
        case 'expense':
          return apiClient.rejectExpense(item.id, reason)
        case 'lodgement':
          return apiClient.rejectLodgement(item.id, reason)
        default:
          throw new Error(`Unknown type: ${item.type}`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] })
      refetch()
      setIsRejectModalOpen(false)
      setRejectReason('')
      setItemToReject(null)
    },
  })

  // Bulk approve mutation
  const bulkApproveMutation = useMutation({
    mutationFn: async () => {
      const selectedApprovals = approvals.filter(a => selectedItems.has(`${a.type}-${a.id}`))
      const results = await Promise.allSettled(
        selectedApprovals.map(item => approveMutation.mutateAsync(item))
      )
      const approved = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length
      return { approved, failed }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] })
      setSelectedItems(new Set())
      alert(`Bulk approval complete: ${result.approved} approved, ${result.failed} failed`)
      refetch()
    },
  })

  // Bulk reject mutation
  const bulkRejectMutation = useMutation({
    mutationFn: async (reason: string) => {
      const selectedApprovals = approvals.filter(a => selectedItems.has(`${a.type}-${a.id}`))
      const results = await Promise.allSettled(
        selectedApprovals.map(item => rejectMutation.mutateAsync({ item, reason }))
      )
      const rejected = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length
      return { rejected, failed }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] })
      setSelectedItems(new Set())
      setIsRejectModalOpen(false)
      setRejectReason('')
      setBulkRejectMode(false)
      alert(`Bulk rejection complete: ${result.rejected} rejected, ${result.failed} failed`)
      refetch()
    },
  })

  const handleApprove = async (item: PendingApproval) => {
    if (confirm(`Are you sure you want to approve ${item.title}?`)) {
      try {
        await approveMutation.mutateAsync(item)
        alert(`${item.title} has been approved!`)
      } catch (error) {
        alert(`Error approving: ${(error as Error).message}`)
      }
    }
  }

  const handleReject = (item: PendingApproval) => {
    setItemToReject(item)
    setBulkRejectMode(false)
    setIsRejectModalOpen(true)
  }

  const handleBulkReject = () => {
    if (selectedItems.size === 0) return
    setBulkRejectMode(true)
    setIsRejectModalOpen(true)
  }

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }

    if (bulkRejectMode) {
      await bulkRejectMutation.mutateAsync(rejectReason)
    } else if (itemToReject) {
      try {
        await rejectMutation.mutateAsync({ item: itemToReject, reason: rejectReason })
        alert(`${itemToReject.title} has been rejected!`)
      } catch (error) {
        alert(`Error rejecting: ${(error as Error).message}`)
      }
    }
  }

  const handleView = (item: PendingApproval) => {
    switch (item.type) {
      case 'prf':
        router.push(`/orders/prf/${item.id}`)
        break
      case 'pro':
        router.push(`/orders/pro/${item.id}`)
        break
      case 'expense':
        router.push(`/accounts/expenses/${item.id}`)
        break
      case 'lodgement':
        router.push(`/accounts/lodgements`)
        break
      default:
        alert(`View not available for ${item.type}`)
    }
  }

  const toggleSelectItem = (item: PendingApproval) => {
    const key = `${item.type}-${item.id}`
    const newSelected = new Set(selectedItems)
    if (newSelected.has(key)) {
      newSelected.delete(key)
    } else {
      newSelected.add(key)
    }
    setSelectedItems(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedItems.size === approvals.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(approvals.map(a => `${a.type}-${a.id}`)))
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setSelectedItems(new Set())
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pending Approvals</h1>
            <p className="text-muted-foreground">Review and approve pending requests across all modules</p>
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className={typeFilter === 'all' ? 'ring-2 ring-primary' : 'cursor-pointer hover:shadow-md'}
                onClick={() => { setTypeFilter('all'); setCurrentPage(1) }}>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl font-bold text-primary">{counts.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card className={typeFilter === 'prf' ? 'ring-2 ring-blue-500' : 'cursor-pointer hover:shadow-md'}
                onClick={() => { setTypeFilter('prf'); setCurrentPage(1) }}>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">PRFs</p>
                <p className="text-xl font-bold text-blue-600">{counts.prfs}</p>
              </div>
            </CardContent>
          </Card>

          <Card className={typeFilter === 'pro' ? 'ring-2 ring-green-500' : 'cursor-pointer hover:shadow-md'}
                onClick={() => { setTypeFilter('pro'); setCurrentPage(1) }}>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">PROs</p>
                <p className="text-xl font-bold text-green-600">{counts.pros}</p>
              </div>
            </CardContent>
          </Card>

          <Card className={typeFilter === 'sst' ? 'ring-2 ring-purple-500' : 'cursor-pointer hover:shadow-md'}
                onClick={() => { setTypeFilter('sst'); setCurrentPage(1) }}>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">SSTs</p>
                <p className="text-xl font-bold text-purple-600">{counts.ssts}</p>
              </div>
            </CardContent>
          </Card>

          <Card className={typeFilter === 'lst' ? 'ring-2 ring-orange-500' : 'cursor-pointer hover:shadow-md'}
                onClick={() => { setTypeFilter('lst'); setCurrentPage(1) }}>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">LSTs</p>
                <p className="text-xl font-bold text-orange-600">{counts.lsts}</p>
              </div>
            </CardContent>
          </Card>

          <Card className={typeFilter === 'stock_transfer' ? 'ring-2 ring-cyan-500' : 'cursor-pointer hover:shadow-md'}
                onClick={() => { setTypeFilter('stock_transfer'); setCurrentPage(1) }}>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Transfers</p>
                <p className="text-xl font-bold text-cyan-600">{counts.stock_transfers}</p>
              </div>
            </CardContent>
          </Card>

          <Card className={typeFilter === 'expense' ? 'ring-2 ring-red-500' : 'cursor-pointer hover:shadow-md'}
                onClick={() => { setTypeFilter('expense'); setCurrentPage(1) }}>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Expenses</p>
                <p className="text-xl font-bold text-red-600">{counts.expenses}</p>
              </div>
            </CardContent>
          </Card>

          <Card className={typeFilter === 'lodgement' ? 'ring-2 ring-emerald-500' : 'cursor-pointer hover:shadow-md'}
                onClick={() => { setTypeFilter('lodgement'); setCurrentPage(1) }}>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Lodgements</p>
                <p className="text-xl font-bold text-emerald-600">{counts.lodgements}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Bulk Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by number, title, description..."
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setCurrentPage(1)
                    }}
                  />
                </div>
              </div>

              {selectedItems.size > 0 && (
                <div className="flex gap-2">
                  <span className="text-sm text-muted-foreground py-2">
                    {selectedItems.size} selected
                  </span>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Approve ${selectedItems.size} items?`)) {
                        bulkApproveMutation.mutate()
                      }
                    }}
                    disabled={bulkApproveMutation.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve All
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkReject}
                    disabled={bulkRejectMutation.isPending}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedItems(new Set())}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Approvals Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Approvals ({total})</CardTitle>
            <div className="text-sm text-muted-foreground">
              Total Value: {formatCurrency(totalValue)}
            </div>
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
            ) : approvals.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium">All caught up!</h3>
                <p className="text-muted-foreground">No pending approvals at the moment.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedItems.size === approvals.length && approvals.length > 0}
                            onChange={toggleSelectAll}
                            className="rounded"
                          />
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Request</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Entity</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Created By</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvals.map((approval) => (
                        <tr key={`${approval.type}-${approval.id}`} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              checked={selectedItems.has(`${approval.type}-${approval.id}`)}
                              onChange={() => toggleSelectItem(approval)}
                              className="rounded"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(approval.type)}
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeBadgeColor(approval.type)}`}>
                                {getTypeLabel(approval.type)}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{approval.number}</p>
                              <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {approval.title}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm">{approval.entity_name || '-'}</p>
                          </td>
                          <td className="py-3 px-4 font-medium">
                            {formatCurrency(approval.amount)}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {approval.created_by || '-'}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {formatDateTime(approval.created_at)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleView(approval)}
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleApprove(approval)}
                                disabled={approveMutation.isPending}
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleReject(approval)}
                                disabled={rejectMutation.isPending}
                                title="Reject"
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, total)} of {total} items
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {bulkRejectMode
                ? `Reject ${selectedItems.size} Items`
                : `Reject ${itemToReject?.title}`}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                rows={3}
                placeholder="Enter reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsRejectModalOpen(false)
                  setRejectReason('')
                  setItemToReject(null)
                  setBulkRejectMode(false)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmReject}
                disabled={rejectMutation.isPending || bulkRejectMutation.isPending}
              >
                {(rejectMutation.isPending || bulkRejectMutation.isPending) ? 'Rejecting...' : 'Reject'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
