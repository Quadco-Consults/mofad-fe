'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AuditLog, AuditLogDetail } from '@/types/api'
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
  Shield,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  Plus,
  Settings,
  FileSpreadsheet,
  ChevronDown,
} from 'lucide-react'

// Mock data for audit logs - comprehensive user activity tracking
const generateMockAuditLogs = (): AuditLog[] => {
  const users = [
    { id: 1, name: 'Adebayo Johnson', email: 'adebayo.johnson@mofadenergysolutions.com' },
    { id: 2, name: 'Fatima Usman', email: 'fatima.usman@mofadenergysolutions.com' },
    { id: 3, name: 'Emeka Okafor', email: 'emeka.okafor@mofadenergysolutions.com' },
    { id: 4, name: 'Kemi Adebola', email: 'kemi.adebola@mofadenergysolutions.com' },
    { id: 5, name: 'Ibrahim Musa', email: 'ibrahim.musa@mofadenergysolutions.com' },
    { id: 6, name: 'Grace Okoro', email: 'grace.okoro@mofadenergysolutions.com' },
    { id: null, name: 'System', email: 'system@mofadenergysolutions.com' }
  ]

  const actions = [
    { action: 'LOGIN_SUCCESS', display: 'Login Success', model: 'User', success: true },
    { action: 'LOGIN_FAILED', display: 'Login Failed', model: 'User', success: false },
    { action: 'LOGOUT', display: 'Logout', model: 'User', success: true },
    { action: 'USER_CREATED', display: 'User Created', model: 'User', success: true },
    { action: 'USER_UPDATED', display: 'User Updated', model: 'User', success: true },
    { action: 'USER_DELETED', display: 'User Deleted', model: 'User', success: true },
    { action: 'ORDER_CREATED', display: 'Order Created', model: 'Order', success: true },
    { action: 'ORDER_UPDATED', display: 'Order Updated', model: 'Order', success: true },
    { action: 'ORDER_APPROVED', display: 'Order Approved', model: 'Order', success: true },
    { action: 'ORDER_REJECTED', display: 'Order Rejected', model: 'Order', success: true },
    { action: 'PAYMENT_PROCESSED', display: 'Payment Processed', model: 'Payment', success: true },
    { action: 'PAYMENT_FAILED', display: 'Payment Failed', model: 'Payment', success: false },
    { action: 'INVENTORY_UPDATED', display: 'Inventory Updated', model: 'Product', success: true },
    { action: 'CUSTOMER_CREATED', display: 'Customer Created', model: 'Customer', success: true },
    { action: 'CUSTOMER_UPDATED', display: 'Customer Updated', model: 'Customer', success: true },
    { action: 'REPORT_GENERATED', display: 'Report Generated', model: 'Report', success: true },
    { action: 'SETTINGS_CHANGED', display: 'Settings Changed', model: 'Settings', success: true },
    { action: 'PASSWORD_CHANGED', display: 'Password Changed', model: 'User', success: true },
    { action: 'ROLE_ASSIGNED', display: 'Role Assigned', model: 'User', success: true },
    { action: 'PERMISSION_GRANTED', display: 'Permission Granted', model: 'Permission', success: true },
  ]

  const logs: AuditLog[] = []
  const now = new Date()

  for (let i = 0; i < 150; i++) {
    const user = users[Math.floor(Math.random() * users.length)]
    const actionData = actions[Math.floor(Math.random() * actions.length)]
    const timestamp = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random time in last 30 days

    const details: any = {}

    // Generate realistic details based on action type
    if (actionData.action.includes('LOGIN')) {
      details.browser = ['Chrome 120.0', 'Safari 17.2', 'Firefox 121.0', 'Edge 120.0'][Math.floor(Math.random() * 4)]
      details.location = ['Lagos, Nigeria', 'Abuja, Nigeria', 'Port Harcourt, Nigeria'][Math.floor(Math.random() * 3)]
    } else if (actionData.action.includes('ORDER')) {
      details.order_value = Math.floor(Math.random() * 1000000) + 50000
      details.customer_id = Math.floor(Math.random() * 100) + 1
      details.products_count = Math.floor(Math.random() * 10) + 1
    } else if (actionData.action.includes('PAYMENT')) {
      details.amount = Math.floor(Math.random() * 500000) + 10000
      details.payment_method = ['bank_transfer', 'cash', 'cheque', 'mobile_money'][Math.floor(Math.random() * 4)]
      details.reference = `PAY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    } else if (actionData.action.includes('USER')) {
      details.role = ['Sales Manager', 'Finance Officer', 'Warehouse Staff', 'Admin'][Math.floor(Math.random() * 4)]
      details.permissions_count = Math.floor(Math.random() * 15) + 1
    }

    logs.push({
      id: i + 1,
      user: user.id,
      user_email: user.email,
      user_name: user.name,
      action: actionData.action,
      action_display: actionData.display,
      timestamp: timestamp.toISOString(),
      target_model: actionData.model,
      target_id: String(Math.floor(Math.random() * 1000) + 1),
      ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      user_agent: [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
      ][Math.floor(Math.random() * 3)],
      details,
      success: actionData.success && Math.random() > 0.05, // 5% chance of failure
      error_message: !actionData.success || Math.random() < 0.05 ?
        ['Network timeout', 'Invalid credentials', 'Permission denied', 'Database error'][Math.floor(Math.random() * 4)] : '',
    })
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// Helper function for action badges
const getActionBadge = (action: string, success: boolean) => {
  const actionColors: Record<string, string> = {
    LOGIN_SUCCESS: 'bg-emerald-100 text-emerald-800',
    LOGIN_FAILED: 'bg-red-100 text-red-800',
    LOGOUT: 'bg-gray-100 text-gray-800',
    USER_CREATED: 'bg-green-100 text-green-800',
    USER_UPDATED: 'bg-blue-100 text-blue-800',
    USER_DELETED: 'bg-red-100 text-red-800',
    ORDER_CREATED: 'bg-green-100 text-green-800',
    ORDER_UPDATED: 'bg-blue-100 text-blue-800',
    ORDER_APPROVED: 'bg-green-100 text-green-800',
    ORDER_REJECTED: 'bg-red-100 text-red-800',
    PAYMENT_PROCESSED: 'bg-green-100 text-green-800',
    PAYMENT_FAILED: 'bg-red-100 text-red-800',
    INVENTORY_UPDATED: 'bg-purple-100 text-purple-800',
    CUSTOMER_CREATED: 'bg-green-100 text-green-800',
    CUSTOMER_UPDATED: 'bg-blue-100 text-blue-800',
    REPORT_GENERATED: 'bg-yellow-100 text-yellow-800',
    SETTINGS_CHANGED: 'bg-orange-100 text-orange-800',
    PASSWORD_CHANGED: 'bg-blue-100 text-blue-800',
    ROLE_ASSIGNED: 'bg-purple-100 text-purple-800',
    PERMISSION_GRANTED: 'bg-indigo-100 text-indigo-800',
  }

  let color = actionColors[action] || 'bg-gray-100 text-gray-800'
  if (!success) {
    color = 'bg-red-100 text-red-800'
  }

  return color
}

// Helper function for action icons
const getActionIcon = (action: string) => {
  const iconMap: Record<string, any> = {
    LOGIN_SUCCESS: LogIn,
    LOGIN_FAILED: LogIn,
    LOGOUT: LogOut,
    USER_CREATED: Plus,
    USER_UPDATED: Edit,
    USER_DELETED: Trash2,
    ORDER_CREATED: Plus,
    ORDER_UPDATED: Edit,
    ORDER_APPROVED: CheckCircle,
    ORDER_REJECTED: XCircle,
    PAYMENT_PROCESSED: CheckCircle,
    PAYMENT_FAILED: XCircle,
    INVENTORY_UPDATED: Edit,
    CUSTOMER_CREATED: Plus,
    CUSTOMER_UPDATED: Edit,
    REPORT_GENERATED: FileText,
    SETTINGS_CHANGED: Settings,
    PASSWORD_CHANGED: Shield,
    ROLE_ASSIGNED: User,
    PERMISSION_GRANTED: Shield,
  }

  return iconMap[action] || Activity
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export default function AuditLogsPage() {
  // State
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [modelFilter, setModelFilter] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [successFilter, setSuccessFilter] = useState<string>('')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedLog, setSelectedLog] = useState<AuditLogDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showExportDropdown, setShowExportDropdown] = useState(false)
  const exportDropdownRef = useRef<HTMLDivElement>(null)

  const pageSize = 25

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Generate mock data
  const allLogs = useMemo(() => generateMockAuditLogs(), [])

  // Filter logs based on search and filters
  const filteredLogs = useMemo(() => {
    let filtered = [...allLogs]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action_display?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.target_model?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // User filter
    if (userFilter) {
      filtered = filtered.filter(log => log.user_name === userFilter)
    }

    // Action filter
    if (actionFilter) {
      filtered = filtered.filter(log => log.action === actionFilter)
    }

    // Model filter
    if (modelFilter) {
      filtered = filtered.filter(log => log.target_model === modelFilter)
    }

    // Date filters
    if (dateFrom) {
      const fromDate = new Date(dateFrom)
      filtered = filtered.filter(log => new Date(log.timestamp) >= fromDate)
    }

    if (dateTo) {
      const toDate = new Date(dateTo)
      toDate.setHours(23, 59, 59, 999) // End of day
      filtered = filtered.filter(log => new Date(log.timestamp) <= toDate)
    }

    // Success filter
    if (successFilter !== '') {
      const isSuccess = successFilter === 'true'
      filtered = filtered.filter(log => log.success === isSuccess)
    }

    return filtered
  }, [allLogs, searchTerm, userFilter, actionFilter, modelFilter, dateFrom, dateTo, successFilter])

  // Paginate results
  const totalCount = filteredLogs.length
  const totalPages = Math.ceil(totalCount / pageSize)
  const startIndex = (page - 1) * pageSize
  const logs = filteredLogs.slice(startIndex, startIndex + pageSize)

  // Generate available actions and models
  const availableActions = useMemo(() => {
    const actions = Array.from(new Set(allLogs.map(log => log.action)))
    return actions.map(action => ({
      value: action,
      label: allLogs.find(log => log.action === action)?.action_display || action
    }))
  }, [allLogs])

  const availableModels = useMemo(() => {
    return Array.from(new Set(allLogs.map(log => log.target_model)))
  }, [allLogs])

  const availableUsers = useMemo(() => {
    return Array.from(new Set(allLogs.map(log => log.user_name).filter(Boolean))).sort()
  }, [allLogs])

  // Generate stats
  const stats = useMemo(() => {
    const last30Days = new Date()
    last30Days.setDate(last30Days.getDate() - 30)

    const recentLogs = allLogs.filter(log => new Date(log.timestamp) >= last30Days)

    const actionCounts = recentLogs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const modelCounts = recentLogs.reduce((acc, log) => {
      acc[log.target_model] = (acc[log.target_model] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total_logs_30_days: recentLogs.length,
      failed_actions_count: recentLogs.filter(log => !log.success).length,
      actions_by_type: Object.entries(actionCounts)
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count),
      actions_by_model: Object.entries(modelCounts)
        .map(([target_model, count]) => ({ target_model, count }))
        .sort((a, b) => b.count - a.count),
      daily_activity: [] // Not implemented for mock data
    }
  }, [allLogs])

  // View details handler
  const handleViewDetails = (log: AuditLog) => {
    // Convert AuditLog to AuditLogDetail for the modal
    const detailLog: AuditLogDetail = {
      ...log,
      formatted_changes: Object.entries(log.details?.changes || {}).map(([field, change]: [string, any]) => ({
        field,
        old_value: change.old,
        new_value: change.new
      }))
    }
    setSelectedLog(detailLog)
    setShowDetailsModal(true)
  }

  // Export handlers
  const handleExportCSV = () => {
    // Create CSV content
    const csvHeaders = ['Timestamp', 'User', 'Email', 'Action', 'Model', 'Target ID', 'Success', 'IP Address', 'Error Message']
    const csvData = filteredLogs.map(log => [
      formatDateTime(log.timestamp),
      log.user_name || '',
      log.user_email || '',
      log.action_display || '',
      log.target_model || '',
      log.target_id || '',
      log.success ? 'Success' : 'Failed',
      log.ip_address || '',
      log.error_message || ''
    ])

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExportExcel = () => {
    // Create Excel-compatible CSV with BOM for proper encoding
    const csvHeaders = ['Timestamp', 'User', 'Email', 'Action', 'Model', 'Target ID', 'Success', 'IP Address', 'Error Message', 'Details']
    const csvData = filteredLogs.map(log => [
      formatDateTime(log.timestamp),
      log.user_name || '',
      log.user_email || '',
      log.action_display || '',
      log.target_model || '',
      log.target_id || '',
      log.success ? 'Success' : 'Failed',
      log.ip_address || '',
      log.error_message || '',
      log.details ? JSON.stringify(log.details) : ''
    ])

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    // Add BOM for Excel compatibility
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExportPDF = async () => {
    try {
      // Dynamic import to avoid SSR issues
      const html2pdf = (await import('html2pdf.js')).default

      // Create a temporary element with the audit logs data
      const element = document.createElement('div')
      element.style.padding = '20px'
      element.style.fontFamily = 'Arial, sans-serif'

      // Add header
      element.innerHTML = `
        <div style="margin-bottom: 20px; text-align: center;">
          <h1 style="color: #1f2937; margin-bottom: 5px;">MOFAD Energy Solutions</h1>
          <h2 style="color: #6b7280; margin: 0;">Audit Logs Report</h2>
          <p style="color: #9ca3af; margin: 5px 0;">Generated on ${new Date().toLocaleDateString()}</p>
          <p style="color: #9ca3af; margin: 0;">Total Records: ${filteredLogs.length}</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Timestamp</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">User</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Action</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Model</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Status</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">IP Address</th>
            </tr>
          </thead>
          <tbody>
            ${filteredLogs.map(log => `
              <tr>
                <td style="border: 1px solid #d1d5db; padding: 6px; font-size: 9px;">${formatDateTime(log.timestamp)}</td>
                <td style="border: 1px solid #d1d5db; padding: 6px;">${log.user_name || '-'}</td>
                <td style="border: 1px solid #d1d5db; padding: 6px;">${log.action_display || '-'}</td>
                <td style="border: 1px solid #d1d5db; padding: 6px;">${log.target_model || '-'}</td>
                <td style="border: 1px solid #d1d5db; padding: 6px; color: ${log.success ? '#10b981' : '#ef4444'};">${log.success ? 'Success' : 'Failed'}</td>
                <td style="border: 1px solid #d1d5db; padding: 6px; font-size: 9px;">${log.ip_address || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `

      const options = {
        margin: [10, 10, 10, 10],
        filename: `audit-logs-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      }

      html2pdf().from(element).set(options).save()
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    }
  }

  // Refresh handler
  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      // In a real app, this would refetch data
    }, 1000)
  }

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('')
    setUserFilter('')
    setActionFilter('')
    setModelFilter('')
    setDateFrom('')
    setDateTo('')
    setSuccessFilter('')
    setPage(1)
  }

  return (
    <AppLayout>
      <div className="space-y-8 pb-8">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/30 to-transparent rounded-full transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-100/20 to-transparent rounded-full transform -translate-x-24 translate-y-24"></div>

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white rounded-2xl shadow-lg ring-1 ring-blue-100">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">Audit Logs</h1>
                <p className="text-gray-600 flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-blue-500" />
                  Track and review all system activity and user actions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="flex items-center hover:bg-gray-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              {/* Export Dropdown */}
              <div className="relative" ref={exportDropdownRef}>
                <Button
                  variant="outline"
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  className="flex items-center hover:bg-gray-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>

                {showExportDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          handleExportCSV()
                          setShowExportDropdown(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Export as CSV
                      </button>
                      <button
                        onClick={() => {
                          handleExportExcel()
                          setShowExportDropdown(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Export as Excel
                      </button>
                      <button
                        onClick={() => {
                          handleExportPDF()
                          setShowExportDropdown(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Export as PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Logs (30d)</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.total_logs_30_days?.toLocaleString() || 0}</p>
                </div>
                <div className="p-3 bg-blue-200 rounded-full">
                  <Activity className="w-6 h-6 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">Failed Actions</p>
                  <p className="text-3xl font-bold text-red-900">{stats.failed_actions_count || 0}</p>
                </div>
                <div className="p-3 bg-red-200 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Top Action</p>
                  <p className="text-lg font-bold text-green-900 truncate">
                    {stats.actions_by_type?.[0]?.action || 'N/A'}
                  </p>
                  <p className="text-sm text-green-600">{stats.actions_by_type?.[0]?.count || 0} times</p>
                </div>
                <div className="p-3 bg-green-200 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Top Model</p>
                  <p className="text-lg font-bold text-purple-900 truncate">
                    {stats.actions_by_model?.[0]?.target_model || 'N/A'}
                  </p>
                  <p className="text-sm text-purple-600">{stats.actions_by_model?.[0]?.count || 0} operations</p>
                </div>
                <div className="p-3 bg-purple-200 rounded-full">
                  <FileText className="w-6 h-6 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-7 gap-4">
              {/* Search */}
              <div className="relative lg:col-span-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setPage(1)
                  }}
                />
              </div>

              {/* User Filter */}
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                value={userFilter}
                onChange={(e) => {
                  setUserFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value="">All Users</option>
                {availableUsers.map((user) => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>

              {/* Action Filter */}
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value="">All Actions</option>
                {availableActions.map((action) => (
                  <option key={action.value} value={action.value}>
                    {action.label}
                  </option>
                ))}
              </select>

              {/* Model Filter */}
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                value={modelFilter}
                onChange={(e) => {
                  setModelFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value="">All Models</option>
                {availableModels.map((model) => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>

              {/* Date From */}
              <input
                type="date"
                placeholder="Start Date"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value)
                  setPage(1)
                }}
              />

              {/* Date To */}
              <input
                type="date"
                placeholder="End Date"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value)
                  setPage(1)
                }}
              />

              {/* Success Filter */}
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
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

            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                {totalCount} log{totalCount !== 1 ? 's' : ''} found
                {(searchTerm || userFilter || actionFilter || modelFilter || dateFrom || dateTo || successFilter) && (
                  <span className="text-green-600 font-medium ml-1">
                    (filtered from {allLogs.length})
                  </span>
                )}
              </div>
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
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Timestamp</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>User</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4" />
                      <span>Action</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>Target</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Status</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span>Details</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                      <p className="text-gray-600 font-medium">Loading activity logs...</p>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="p-4 bg-gray-100 rounded-full mb-4">
                          <Activity className="w-12 h-12 text-gray-400" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900 mb-2">No audit logs found</p>
                        <p className="text-gray-500 max-w-md">
                          {searchTerm || actionFilter || modelFilter || dateFrom || dateTo || successFilter
                            ? 'No activities match your current filters. Try adjusting the search criteria.'
                            : 'Activity logs will appear here as users perform actions in the system.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const ActionIcon = getActionIcon(log.action)
                    return (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatDateTime(log.timestamp)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {log.ip_address || 'Unknown IP'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-gray-600 font-medium text-xs">
                                {log.user_name?.split(' ').map(n => n[0]).join('') || 'SY'}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {log.user_name || 'System'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {log.user_email || 'system@mofadenergysolutions.com'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <ActionIcon className="h-4 w-4 text-gray-500" />
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionBadge(log.action, log.success)}`}>
                              {log.action_display || log.action}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 font-medium">{log.target_model || '-'}</div>
                          <div className="text-xs text-gray-500">ID: {log.target_id || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {log.success ? (
                              <>
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span className="text-sm text-green-600 font-medium">Success</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-5 h-5 text-red-500" />
                                <span className="text-sm text-red-600 font-medium">Failed</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(log)}
                              className="hover:bg-blue-50"
                            >
                              <Eye className="w-4 h-4 text-blue-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <p className="text-sm text-gray-500">
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
            <div className="bg-white rounded-lg max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
                <h2 className="text-xl font-semibold">Audit Log Details</h2>
                <Button variant="ghost" onClick={() => setShowDetailsModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                {/* Additional Details */}
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-2">Additional Details</label>
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