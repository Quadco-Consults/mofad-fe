'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import apiClient from '@/lib/apiClient'
import { formatDateTime } from '@/lib/utils'
import { AuditLog, AuditLogDetail, AuditAction, AuditLogStats, PaginatedResponse } from '@/types/api'
import {
  Search,
  Download,
  Eye,
  RefreshCw,
  Activity,
  CheckCircle,
  XCircle,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertTriangle,
  TrendingUp,
  User,
  Clock,
  Monitor,
  Globe,
} from 'lucide-react'

// Helper function for action badges
const getActionBadge = (action: string, success: boolean) => {
  const actionColors: Record<string, string> = {
    CREATE: 'bg-green-100 text-green-800',
    UPDATE: 'bg-blue-100 text-blue-800',
    DELETE: 'bg-red-100 text-red-800',
    SOFT_DELETE: 'bg-orange-100 text-orange-800',
    VIEW: 'bg-gray-100 text-gray-800',
    LOGIN_SUCCESS: 'bg-emerald-100 text-emerald-800',
    LOGIN_FAILED: 'bg-red-100 text-red-800',
    LOGOUT: 'bg-gray-100 text-gray-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    STATUS_CHANGED: 'bg-purple-100 text-purple-800',
    SUBMITTED: 'bg-yellow-100 text-yellow-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
    PASSWORD_CHANGE: 'bg-blue-100 text-blue-800',
    MFA_ENABLED: 'bg-green-100 text-green-800',
    MFA_DISABLED: 'bg-orange-100 text-orange-800',
    USER_CREATED: 'bg-green-100 text-green-800',
    USER_UPDATED: 'bg-blue-100 text-blue-800',
    USER_DELETED: 'bg-red-100 text-red-800',
  }

  let color = actionColors[action] || 'bg-gray-100 text-gray-800'
  if (!success) {
    color = 'bg-red-100 text-red-800'
  }

  return color
}

export default function AuditLogsPage() {
  // State
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [modelFilter, setModelFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [successFilter, setSuccessFilter] = useState<string>('')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedLog, setSelectedLog] = useState<AuditLogDetail | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)

  const pageSize = 25

  // Build query params
  const queryParams: Record<string, string> = { page: String(page), page_size: String(pageSize) }
  if (actionFilter) queryParams.action = actionFilter
  if (modelFilter) queryParams.target_model = modelFilter
  if (dateFrom) queryParams.date_from = dateFrom
  if (dateTo) queryParams.date_to = dateTo
  if (successFilter !== '') queryParams.success = successFilter
  if (searchTerm) queryParams.search = searchTerm

  // Fetch audit logs
  const { data: logsResponse, isLoading, refetch } = useQuery({
    queryKey: ['audit-logs', page, actionFilter, modelFilter, dateFrom, dateTo, successFilter, searchTerm],
    queryFn: async () => {
      const result = await apiClient.get<PaginatedResponse<AuditLog>>('/audit-logs/', queryParams)
      return result
    },
  })

  // Fetch action types
  const { data: actionsData } = useQuery({
    queryKey: ['audit-log-actions'],
    queryFn: () => apiClient.get<AuditAction[]>('/audit-logs/actions/'),
  })

  // Fetch model types
  const { data: modelsData } = useQuery({
    queryKey: ['audit-log-models'],
    queryFn: () => apiClient.get<string[]>('/audit-logs/models/'),
  })

  // Fetch stats
  const { data: statsData } = useQuery({
    queryKey: ['audit-log-stats'],
    queryFn: () => apiClient.get<AuditLogStats>('/audit-logs/stats/'),
  })

  // Handle data extraction
  const logs = Array.isArray(logsResponse)
    ? logsResponse
    : (logsResponse as PaginatedResponse<AuditLog>)?.results || []
  const totalCount = (logsResponse as PaginatedResponse<AuditLog>)?.count || logs.length
  const totalPages = Math.ceil(totalCount / pageSize)
  const actions = Array.isArray(actionsData) ? actionsData : []
  const models = Array.isArray(modelsData) ? modelsData : []
  const stats = statsData as AuditLogStats | undefined

  // View details handler
  const handleViewDetails = async (log: AuditLog) => {
    try {
      setDetailsLoading(true)
      const detail = await apiClient.get<AuditLogDetail>(`/audit-logs/${log.id}/`)
      setSelectedLog(detail)
      setShowDetailsModal(true)
    } catch (error) {
      console.error('Failed to fetch log details:', error)
    } finally {
      setDetailsLoading(false)
    }
  }

  // Export handler
  const handleExport = () => {
    const params = new URLSearchParams()
    if (actionFilter) params.append('action', actionFilter)
    if (modelFilter) params.append('target_model', modelFilter)
    if (dateFrom) params.append('date_from', dateFrom)
    if (dateTo) params.append('date_to', dateTo)
    if (successFilter !== '') params.append('success', successFilter)

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'
    window.open(`${baseUrl}/audit-logs/export/?${params.toString()}`, '_blank')
  }

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('')
    setActionFilter('')
    setModelFilter('')
    setDateFrom('')
    setDateTo('')
    setSuccessFilter('')
    setPage(1)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
            <p className="text-muted-foreground">Track and review all system activity</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Logs (30d)</p>
                    <p className="text-2xl font-bold text-primary">{stats.total_logs_30_days?.toLocaleString() || 0}</p>
                  </div>
                  <Activity className="w-8 h-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Failed Actions</p>
                    <p className="text-2xl font-bold text-red-600">{stats.failed_actions_count || 0}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-600/60" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Top Action</p>
                    <p className="text-lg font-bold text-secondary truncate">
                      {stats.actions_by_type?.[0]?.action || 'N/A'}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-secondary/60" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Top Model</p>
                    <p className="text-lg font-bold text-secondary truncate">
                      {stats.actions_by_model?.[0]?.target_model || 'N/A'}
                    </p>
                  </div>
                  <FileText className="w-8 h-8 text-secondary/60" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setPage(1)
                  }}
                />
              </div>

              {/* Action Filter */}
              <select
                className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value="">All Actions</option>
                {actions.map((action) => (
                  <option key={action.value} value={action.value}>
                    {action.label}
                  </option>
                ))}
              </select>

              {/* Model Filter */}
              <select
                className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={modelFilter}
                onChange={(e) => {
                  setModelFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value="">All Models</option>
                {models.map((model) => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>

              {/* Date From */}
              <input
                type="date"
                className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value)
                  setPage(1)
                }}
              />

              {/* Date To */}
              <input
                type="date"
                className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value)
                  setPage(1)
                }}
              />

              {/* Success Filter */}
              <select
                className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={successFilter}
                onChange={(e) => {
                  setSuccessFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value="">All Status</option>
                <option value="true">Success</option>
                <option value="false">Failed</option>
              </select>
            </div>

            <div className="flex justify-end mt-4">
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Target ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                      <p className="text-muted-foreground">Loading logs...</p>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">No audit logs found</p>
                      <p className="text-muted-foreground">
                        {searchTerm || actionFilter || modelFilter || dateFrom || dateTo || successFilter
                          ? 'Try adjusting your filters'
                          : 'Activity logs will appear here when actions are performed'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{log.user_name || 'System'}</div>
                        <div className="text-xs text-gray-500">{log.user_email || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionBadge(log.action, log.success)}`}>
                          {log.action_display || log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {log.target_model || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {log.target_id || '-'}
                      </td>
                      <td className="px-6 py-4">
                        {log.success ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(log)}
                          disabled={detailsLoading}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} results
              </p>
              <div className="flex gap-2 items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="px-3 py-2 text-sm">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Details Modal */}
        {showDetailsModal && selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full m-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
                <h2 className="text-xl font-semibold">Audit Log Details</h2>
                <Button variant="ghost" onClick={() => setShowDetailsModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Timestamp</label>
                      <p className="text-gray-900">{formatDateTime(selectedLog.timestamp)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">User</label>
                      <p className="text-gray-900">{selectedLog.user_name || 'System'}</p>
                      <p className="text-sm text-gray-500">{selectedLog.user_email || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Activity className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Action</label>
                      <p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionBadge(selectedLog.action, selectedLog.success)}`}>
                          {selectedLog.action_display || selectedLog.action}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <p className="flex items-center gap-2 mt-1">
                      {selectedLog.success ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-green-600">Success</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span className="text-red-600">Failed</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Model</label>
                      <p className="text-gray-900">{selectedLog.target_model || '-'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Target ID</label>
                    <p className="text-gray-900">{selectedLog.target_id || 'N/A'}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">IP Address</label>
                      <p className="text-gray-900">{selectedLog.ip_address || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Monitor className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">User Agent</label>
                      <p className="text-gray-900 text-sm truncate max-w-xs" title={selectedLog.user_agent}>
                        {selectedLog.user_agent || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {selectedLog.error_message && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <label className="text-sm font-medium text-red-800">Error Message</label>
                    <p className="text-red-700 mt-1">{selectedLog.error_message}</p>
                  </div>
                )}

                {/* Field Changes */}
                {selectedLog.formatted_changes && selectedLog.formatted_changes.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-2">Field Changes</label>
                    <div className="bg-gray-50 rounded-md overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Field</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Old Value</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">New Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedLog.formatted_changes.map((change, index) => (
                            <tr key={index} className="border-t border-gray-200">
                              <td className="px-4 py-2 text-sm font-medium text-gray-900">{change.field}</td>
                              <td className="px-4 py-2 text-sm text-red-600 font-mono">
                                {change.old_value !== null && change.old_value !== undefined
                                  ? JSON.stringify(change.old_value)
                                  : <span className="text-gray-400 italic">null</span>}
                              </td>
                              <td className="px-4 py-2 text-sm text-green-600 font-mono">
                                {change.new_value !== null && change.new_value !== undefined
                                  ? JSON.stringify(change.new_value)
                                  : <span className="text-gray-400 italic">null</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Raw Details */}
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-2">Raw Details (JSON)</label>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-md text-sm overflow-x-auto font-mono">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="flex justify-end gap-2 p-6 border-t sticky bottom-0 bg-white">
                <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
